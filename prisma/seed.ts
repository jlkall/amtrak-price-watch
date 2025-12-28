import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client'

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db'
}

// Prisma 7 requires explicit options - try with empty object first
const prisma = new PrismaClient({})

async function main() {
  console.log('Seeding database...')

  // Clear existing data (for re-seeding)
  await prisma.alertTrigger.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.priceSnapshot.deleteMany()
  await prisma.route.deleteMany()
  await prisma.holiday.deleteMany()

  // Create fixed routes
  const routes = [
    { origin: 'NYC', destination: 'Boston', label: 'NYC → Boston' },
    { origin: 'NYC', destination: 'DC', label: 'NYC → DC' },
    { origin: 'NYC', destination: 'Philadelphia', label: 'NYC → Philadelphia' },
    { origin: 'Boston', destination: 'DC', label: 'Boston → DC' },
    { origin: 'DC', destination: 'Richmond', label: 'DC → Richmond' },
  ]

  for (const route of routes) {
    await prisma.route.upsert({
      where: { origin_destination: { origin: route.origin, destination: route.destination } },
      update: { label: route.label },
      create: route,
    })
  }

  // Create fixed holidays
  // Thanksgiving: Nov 25-30 (using current year as base, adjust as needed)
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

