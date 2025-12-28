import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// One-time seed endpoint - call this to populate initial data
// DELETE this route after seeding in production!
export async function GET() {
  try {
    // Create routes
    const routes = [
      { origin: 'NYC', destination: 'Boston', label: 'NYC → Boston' },
      { origin: 'NYC', destination: 'DC', label: 'NYC → DC' },
      { origin: 'NYC', destination: 'Philadelphia', label: 'NYC → Philadelphia' },
      { origin: 'Boston', destination: 'DC', label: 'Boston → DC' },
      { origin: 'DC', destination: 'Richmond', label: 'DC → Richmond' },
    ]

    const createdRoutes = []
    for (const route of routes) {
      const r = await prisma.route.upsert({
        where: { origin_destination: { origin: route.origin, destination: route.destination } },
        update: { label: route.label },
        create: route,
      })
      createdRoutes.push(r)
    }

    // Create holidays
    const currentYear = new Date().getFullYear()
    const thanksgivingStart = new Date(currentYear, 10, 25) // Nov 25
    const thanksgivingEnd = new Date(currentYear, 10, 30) // Nov 30
    const christmasStart = new Date(currentYear, 11, 22) // Dec 22
    const christmasEnd = new Date(currentYear, 11, 27) // Dec 27

    const holidays = [
      {
        name: 'Thanksgiving',
        startDate: thanksgivingStart,
        endDate: thanksgivingEnd,
      },
      {
        name: 'Christmas',
        startDate: christmasStart,
        endDate: christmasEnd,
      },
    ]

    const createdHolidays = []
    for (const holiday of holidays) {
      const h = await prisma.holiday.upsert({
        where: {
          name_startDate: {
            name: holiday.name,
            startDate: holiday.startDate,
          },
        },
        update: {
          endDate: holiday.endDate,
        },
        create: holiday,
      })
      createdHolidays.push(h)
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      routes: createdRoutes.length,
      holidays: createdHolidays.length,
    })
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', message: error.message },
      { status: 500 }
    )
  }
}

