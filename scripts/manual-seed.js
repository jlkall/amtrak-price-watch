// Manual seed script as workaround for Prisma 7 client initialization
// Run this after the database is set up to populate initial data
// Usage: node scripts/manual-seed.js

const { PrismaClient } = require('../lib/generated/prisma/client')

const prisma = new PrismaClient({})

async function main() {
  console.log('Seeding database...')

  // Create routes
  const routes = [
    { origin: 'NYC', destination: 'Boston', label: 'NYC → Boston' },
    { origin: 'NYC', destination: 'DC', label: 'NYC → DC' },
    { origin: 'NYC', destination: 'Philadelphia', label: 'NYC → Philadelphia' },
    { origin: 'Boston', destination: 'DC', label: 'Boston → DC' },
    { origin: 'DC', destination: 'Richmond', label: 'DC → Richmond' },
  ]

  for (const route of routes) {
    try {
      await prisma.route.upsert({
        where: { origin_destination: { origin: route.origin, destination: route.destination } },
        update: { label: route.label },
        create: route,
      })
      console.log(`✓ Created/updated route: ${route.label}`)
    } catch (error) {
      console.error(`Error creating route ${route.label}:`, error)
    }
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

  for (const holiday of holidays) {
    try {
      await prisma.holiday.upsert({
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
      console.log(`✓ Created/updated holiday: ${holiday.name}`)
    } catch (error) {
      console.error(`Error creating holiday ${holiday.name}:`, error)
    }
  }

  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

