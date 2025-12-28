import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// Hardcoded routes and holidays for display
const ROUTES = [
  { origin: 'NYC', destination: 'Boston', label: 'NYC → Boston' },
  { origin: 'NYC', destination: 'DC', label: 'NYC → DC' },
  { origin: 'NYC', destination: 'Philadelphia', label: 'NYC → Philadelphia' },
  { origin: 'Boston', destination: 'DC', label: 'Boston → DC' },
  { origin: 'DC', destination: 'Richmond', label: 'DC → Richmond' },
]

const HOLIDAYS = [
  { name: 'Thanksgiving', period: 'November 25-30' },
  { name: 'Christmas', period: 'December 22-27' },
]

export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Amtrak Holiday Price Watch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get notified when Amtrak prices drop for your favorite holiday routes.
            Set your price threshold and we&apos;ll email you when coach tickets
            fall below it.
          </p>
        </div>

        {/* Supported Routes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Supported Routes
          </h2>
          <div className="bg-white rounded-lg shadow p-6">
            <ul className="space-y-2">
              {ROUTES.map((route, idx) => (
                <li key={idx} className="text-gray-700">
                  {route.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Supported Holidays */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Supported Holidays
          </h2>
          <div className="bg-white rounded-lg shadow p-6">
            <ul className="space-y-2">
              {HOLIDAYS.map((holiday, idx) => (
                <li key={idx} className="text-gray-700">
                  <strong>{holiday.name}</strong>: {holiday.period}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/alerts/create"
            className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Price Alerts
          </Link>
        </div>

        {/* Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            We check prices once per day. You&apos;ll receive an email when
            coach class tickets drop below your threshold.
          </p>
        </div>
      </main>
    </div>
  )
}
