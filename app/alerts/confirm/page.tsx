'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ConfirmContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Alert Created Successfully!
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            {email ? (
              <>
                We&apos;ve sent a confirmation email to{' '}
                <strong>{email}</strong>. Check your inbox to confirm your
                alert.
              </>
            ) : (
              <>We&apos;ve sent a confirmation email. Check your inbox.</>
            )}
          </p>

          <p className="text-sm text-gray-500 mb-8">
            We&apos;ll check prices daily and notify you when they drop below
            your threshold.
          </p>

          <a
            href="/"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmAlertPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}

