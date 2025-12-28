import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPriceAlertEmail } from '@/lib/email'
import { fetchAmtrakFare, clearExpiredCache } from '@/lib/amtrak-fetcher'
import { getStationCode } from '@/lib/station-codes'

// Force dynamic rendering - this route requires runtime execution
export const dynamic = 'force-dynamic'

// This endpoint is called by Vercel Cron daily
// Rate limiting: Once per day per route/date (enforced by cron schedule)
export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (basic security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Starting daily price fetch job...')
    
    // Clear expired cache entries
    clearExpiredCache()

    const errors: string[] = []
    let snapshotsCreated = 0
    let alertsTriggered = 0

    // Get today's date for checking if we've already scraped
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Process alerts with custom travel dates (not tied to holidays)
    const customDateAlerts = await prisma.alert.findMany({
      where: {
        isActive: true,
        travelDate: { not: null },
        holidayId: null,
      },
      include: {
        route: true,
      },
    })

    console.log(`Found ${customDateAlerts.length} alerts with custom travel dates`)

    // Group alerts by route and date to avoid duplicate fetches
    const routeDateMap = new Map<string, { route: any; date: Date; alerts: any[] }>()

    for (const alert of customDateAlerts) {
      if (!alert.travelDate) continue

      const dateKey = `${alert.routeId}-${alert.travelDate.toISOString().split('T')[0]}`
      
      if (!routeDateMap.has(dateKey)) {
        routeDateMap.set(dateKey, {
          route: alert.route,
          date: alert.travelDate,
          alerts: [],
        })
      }
      routeDateMap.get(dateKey)!.alerts.push(alert)
    }

    // Process each unique route/date combination
    for (const [dateKey, { route, date, alerts }] of routeDateMap) {
      try {
        // Check if we already scraped today for this route/date
        const dateStart = new Date(date)
        dateStart.setHours(0, 0, 0, 0)
        const dateEnd = new Date(date)
        dateEnd.setHours(23, 59, 59, 999)

        const existingSnapshot = await prisma.priceSnapshot.findFirst({
          where: {
            routeId: route.id,
            travelDate: {
              gte: dateStart,
              lt: dateEnd,
            },
            scrapedAt: {
              gte: today,
            },
          },
        })

        if (existingSnapshot) {
          console.log(`Already scraped today for ${route.label} on ${date.toISOString()}`)
          // Still check alerts against existing snapshot
          const triggered = await checkAlertsAgainstPrice(alerts, existingSnapshot.priceUsd, date, errors)
          alertsTriggered += triggered
          continue
        }

        // Fetch price from Amtrak using real API
        const originCode = getStationCode(route.origin)
        const destCode = getStationCode(route.destination)
        
        if (!originCode || !destCode) {
          console.warn(`Missing station codes for ${route.origin} → ${route.destination}`)
          errors.push(`Missing station codes for ${route.origin} → ${route.destination}`)
          continue
        }
        
        const fareResult = await fetchAmtrakFare(originCode, destCode, date)
        const price = fareResult.price

        if (price === null) {
          console.warn(`Failed to fetch price for ${route.label} on ${date.toISOString()}`)
          errors.push(`Failed to fetch price for ${route.label} on ${date.toISOString()}`)
          continue
        }

        // Store price snapshot
        await prisma.priceSnapshot.create({
          data: {
            routeId: route.id,
            travelDate: date,
            priceUsd: price,
            scrapedAt: new Date(),
          },
        })

        snapshotsCreated++

        // Check alerts against the fetched price
        const triggered = await checkAlertsAgainstPrice(alerts, price, date, errors)
        alertsTriggered += triggered
      } catch (error: any) {
        console.error(`Error processing ${route.label} for ${date}:`, error)
        errors.push(`Error processing ${route.label} for ${date}: ${error.message}`)
      }
    }

    // Also process holiday-based alerts (legacy support)
    const [routes, holidays] = await Promise.all([
      prisma.route.findMany(),
      prisma.holiday.findMany(),
    ])

    if (routes.length > 0 && holidays.length > 0) {
      // Iterate over all route × holiday combinations
      for (const route of routes) {
        for (const holiday of holidays) {
          try {
            // Generate all travel dates within the holiday window
            const travelDates = generateTravelDates(holiday.startDate, holiday.endDate)

            for (const travelDate of travelDates) {
              try {
                // Check if we already scraped today for this route/date
                const travelDateStart = new Date(travelDate)
                travelDateStart.setHours(0, 0, 0, 0)
                const travelDateEnd = new Date(travelDate)
                travelDateEnd.setHours(23, 59, 59, 999)

                const existingSnapshot = await prisma.priceSnapshot.findFirst({
                  where: {
                    routeId: route.id,
                    travelDate: {
                      gte: travelDateStart,
                      lt: travelDateEnd,
                    },
                    scrapedAt: {
                      gte: today,
                    },
                  },
                })

                if (existingSnapshot) {
                  console.log(`Already scraped today for ${route.label} on ${travelDate.toISOString()}`)
                  // Check alerts against existing price
                  const activeAlerts = await prisma.alert.findMany({
                    where: {
                      routeId: route.id,
                      holidayId: holiday.id,
                      isActive: true,
                    },
                    include: {
                      route: true,
                    },
                  })
                  const triggered = await checkAlertsAgainstPrice(activeAlerts, existingSnapshot.priceUsd, travelDate, errors)
                  alertsTriggered += triggered
                  continue
                }

                // Fetch price from Amtrak using real API
                const originCode = getStationCode(route.origin)
                const destCode = getStationCode(route.destination)
                
                if (!originCode || !destCode) {
                  console.warn(`Missing station codes for ${route.origin} → ${route.destination}`)
                  errors.push(`Missing station codes for ${route.origin} → ${route.destination}`)
                  continue
                }
                
                const fareResult = await fetchAmtrakFare(originCode, destCode, travelDate)
                const price = fareResult.price

                if (price === null) {
                  console.warn(`Failed to fetch price for ${route.label} on ${travelDate.toISOString()}`)
                  errors.push(`Failed to fetch price for ${route.label} on ${travelDate.toISOString()}`)
                  continue
                }

                // Store price snapshot
                await prisma.priceSnapshot.create({
                  data: {
                    routeId: route.id,
                    travelDate,
                    priceUsd: price,
                    scrapedAt: new Date(),
                  },
                })

                snapshotsCreated++

                // Check active alerts for this route and holiday
                const activeAlerts = await prisma.alert.findMany({
                  where: {
                    routeId: route.id,
                    holidayId: holiday.id,
                    isActive: true,
                  },
                  include: {
                    route: true,
                  },
                })

                const triggered = await checkAlertsAgainstPrice(activeAlerts, price, travelDate, errors)
                alertsTriggered += triggered
              } catch (error: any) {
                console.error(`Error processing ${route.label} for ${travelDate}:`, error)
                errors.push(`Error processing ${route.label} for ${travelDate}: ${error.message}`)
              }
            }
          } catch (error: any) {
            console.error(`Error processing route ${route.label} and holiday ${holiday.name}:`, error)
            errors.push(`Error processing ${route.label}/${holiday.name}: ${error.message}`)
          }
        }
      }
    }

    console.log(`Price fetch job completed: ${snapshotsCreated} snapshots, ${alertsTriggered} alerts triggered`)

    return NextResponse.json({
      success: true,
      snapshotsCreated,
      alertsTriggered,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Fatal error in price fetch job:', error)
    return NextResponse.json(
      { error: 'Job failed', message: error.message },
      { status: 500 }
    )
  }
}

// Helper function to check alerts against a price
async function checkAlertsAgainstPrice(
  alerts: any[],
  price: number,
  travelDate: Date,
  errors: string[]
): Promise<number> {
  let triggered = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const alert of alerts) {
    // Check if price is at or below threshold
    if (price <= alert.priceThreshold) {
      // Check if alert has preferred time window
      // Note: In a real implementation, you'd check the actual train departure time
      // For now, we'll trigger all alerts that meet the price threshold
      // TODO: When fetching actual train times, filter by preferredTimeStart/preferredTimeEnd
      const hasTimePreference = alert.preferredTimeStart && alert.preferredTimeEnd
      if (hasTimePreference) {
        // Log that we're checking time preference (actual implementation would check train time)
        console.log(`Alert ${alert.id} has time preference: ${alert.preferredTimeStart} - ${alert.preferredTimeEnd}`)
        // In production, you would:
        // 1. Fetch train departure times from Amtrak
        // 2. Only trigger if train time is within preferredTimeStart and preferredTimeEnd
      }

      // Check if alert has already been triggered for this price/date today
      const existingTrigger = await prisma.alertTrigger.findFirst({
        where: {
          alertId: alert.id,
          triggeredAt: {
            gte: today,
          },
        },
      })

      if (!existingTrigger) {
        // Trigger alert
        await prisma.alertTrigger.create({
          data: {
            alertId: alert.id,
            priceUsd: price,
          },
        })

        // Send email
        try {
          await sendPriceAlertEmail(
            alert.email,
            alert.id,
            alert.route.label,
            travelDate,
            price,
            alert.priceThreshold,
            alert.preferredTimeStart,
            alert.preferredTimeEnd
          )
          triggered++
          console.log(`Alert triggered for ${alert.email} - ${alert.route.label} at $${price}`)
        } catch (emailError) {
          console.error(`Failed to send alert email:`, emailError)
          errors.push(`Failed to send email to ${alert.email}`)
        }
      }
    }
  }

  return triggered
}

// Generate all dates within a holiday window
function generateTravelDates(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

// Note: fetchAmtrakPrice function removed - now using fetchAmtrakFare from lib/amtrak-fetcher.ts
