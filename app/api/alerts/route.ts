import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - these routes require runtime execution
export const dynamic = 'force-dynamic'

// GET: Fetch routes and holidays for the form (legacy - kept for compatibility)
export async function GET() {
  try {
    const [routes, holidays] = await Promise.all([
      prisma.route.findMany({
        orderBy: { label: 'asc' },
      }),
      prisma.holiday.findMany({
        orderBy: { startDate: 'asc' },
      }),
    ])

    return NextResponse.json({ routes, holidays })
  } catch (error) {
    console.error('Error fetching routes/holidays:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// POST: Create a new alert
export async function POST(request: NextRequest) {
  try {
    // Check database connection
    try {
      await prisma.$connect()
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'Please ensure DATABASE_URL is set correctly and the database is accessible.',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, routeId, holidayId: holidayIdParam, fromLocation, toLocation, travelDate, priceThreshold, preferredTimeStart, preferredTimeEnd } = body

    // Support both old format (routeId/holidayId) and new format (fromLocation/toLocation/travelDate)
    let route
    let travelDateObj: Date | null = null
    let holidayId: string | null = null

    if (fromLocation && toLocation && travelDate) {
      // New format: fromLocation, toLocation, travelDate
      if (!email || !fromLocation || !toLocation || !travelDate || priceThreshold === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      if (fromLocation === toLocation) {
        return NextResponse.json(
          { error: 'From and To locations must be different' },
          { status: 400 }
        )
      }

      // Find or create route
      route = await prisma.route.findUnique({
        where: {
          origin_destination: {
            origin: fromLocation,
            destination: toLocation,
          },
        },
      })

      if (!route) {
        // Create route if it doesn't exist
        route = await prisma.route.create({
          data: {
            origin: fromLocation,
            destination: toLocation,
            label: `${fromLocation} → ${toLocation}`,
          },
        })
      }

      // Parse travel date
      travelDateObj = new Date(travelDate)
      if (isNaN(travelDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid travel date' },
          { status: 400 }
        )
      }

      holidayId = null // No holiday for custom dates
    } else if (routeId && holidayIdParam) {
      // Old format: routeId, holidayId
      if (!email || !routeId || !holidayIdParam || priceThreshold === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      route = await prisma.route.findUnique({ where: { id: routeId } })
      if (!route) {
        return NextResponse.json(
          { error: 'Invalid route' },
          { status: 400 }
        )
      }
      holidayId = holidayIdParam
    } else {
      return NextResponse.json(
        { error: 'Please provide either (fromLocation, toLocation, travelDate) or (routeId, holidayId)' },
        { status: 400 }
      )
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Validate price threshold
    const threshold = parseFloat(priceThreshold)
    if (isNaN(threshold) || threshold <= 0) {
      return NextResponse.json(
        { error: 'Invalid price threshold' },
        { status: 400 }
      )
    }

    // Check for existing alert (prevent duplicates)
    const existingAlert = await prisma.alert.findFirst({
      where: {
        email: sanitizedEmail,
        routeId: route.id,
        holidayId: holidayId || null,
        travelDate: travelDateObj,
      },
    })

    if (existingAlert) {
      return NextResponse.json(
        { error: 'Alert already exists for this route and date' },
        { status: 400 }
      )
    }

    // Verify holiday exists if provided
    if (holidayId) {
      const holiday = await prisma.holiday.findUnique({ where: { id: holidayId } })
      if (!holiday) {
        return NextResponse.json(
          { error: 'Invalid holiday' },
          { status: 400 }
        )
      }
    }

    // Validate time preferences if provided
    if (preferredTimeStart || preferredTimeEnd) {
      if (!preferredTimeStart || !preferredTimeEnd) {
        return NextResponse.json(
          { error: 'Please provide both start and end times for preferred time window' },
          { status: 400 }
        )
      }
      // Validate time format (HH:MM)
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(preferredTimeStart) || !timeRegex.test(preferredTimeEnd)) {
        return NextResponse.json(
          { error: 'Invalid time format. Use HH:MM (24-hour format)' },
          { status: 400 }
        )
      }
      if (preferredTimeStart >= preferredTimeEnd) {
        return NextResponse.json(
          { error: 'Earliest time must be before latest time' },
          { status: 400 }
        )
      }
    }

    // Create alert
    const alert = await prisma.alert.create({
      data: {
        email: sanitizedEmail,
        routeId: route.id,
        holidayId: holidayId || null,
        travelDate: travelDateObj,
        priceThreshold: threshold,
        preferredTimeStart: preferredTimeStart || null,
        preferredTimeEnd: preferredTimeEnd || null,
        isActive: true,
      },
      include: {
        route: true,
        holiday: true,
      },
    })

    // Send confirmation email
    try {
      const { sendAlertConfirmationEmail } = await import('@/lib/email')
      const routeLabel = route.label
      const dateLabel = travelDateObj 
        ? travelDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : alert.holiday?.name || 'selected date'
      
      await sendAlertConfirmationEmail(
        alert.email,
        routeLabel,
        dateLabel,
        alert.priceThreshold,
        alert.preferredTimeStart,
        alert.preferredTimeEnd
      )
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        message: 'Alert created successfully',
        alert: {
          id: alert.id,
          email: alert.email,
          route: alert.route.label,
          date: travelDateObj?.toLocaleDateString() || alert.holiday?.name,
          priceThreshold: alert.priceThreshold,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating alert:', error)
    
    // Handle database connection errors
    if (error.code === 'P1001' || error.message?.includes('connect') || error.message?.includes('Can\'t reach database')) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'The database is not accessible. Please ensure DATABASE_URL is set correctly and the database is running.',
          hint: 'If using Vercel, make sure you have created a Postgres database and set DATABASE_URL in environment variables.'
        },
        { status: 500 }
      )
    }
    
    // Handle Prisma schema errors (tables don't exist)
    if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return NextResponse.json(
        { 
          error: 'Database tables not found',
          message: 'The database tables have not been created yet.',
          hint: 'Please run database migrations. Visit /api/seed to create the database schema.'
        },
        { status: 500 }
      )
    }
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Alert already exists for this route and date' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create alert', details: error.message },
      { status: 500 }
    )
  }
}
