'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface Location {
  id: string
  name: string
}

export default function CreateAlertPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    fromLocation: '',
    toLocation: '',
    travelDate: null as Date | null,
    priceThreshold: '',
    preferredTimeStart: '',
    preferredTimeEnd: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Available locations (hardcoded for now)
  const availableLocations = [
    { id: 'NYC', name: 'New York City (NYC)' },
    { id: 'Boston', name: 'Boston' },
    { id: 'DC', name: 'Washington, DC' },
    { id: 'Philadelphia', name: 'Philadelphia' },
    { id: 'Richmond', name: 'Richmond' },
  ]

  useEffect(() => {
    // Set locations immediately (no API call needed for now)
    setLocations(availableLocations)
    setLoadingData(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!formData.email || !formData.fromLocation || !formData.toLocation || !formData.travelDate || !formData.priceThreshold) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (formData.fromLocation === formData.toLocation) {
      setError('From and To locations must be different')
      setLoading(false)
      return
    }

    const price = parseFloat(formData.priceThreshold)
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price threshold')
      setLoading(false)
      return
    }

    // Validate time preferences if provided
    if (formData.preferredTimeStart || formData.preferredTimeEnd) {
      if (!formData.preferredTimeStart || !formData.preferredTimeEnd) {
        setError('Please provide both start and end times for preferred time window')
        setLoading(false)
        return
      }
      if (formData.preferredTimeStart >= formData.preferredTimeEnd) {
        setError('Earliest time must be before latest time')
        setLoading(false)
        return
      }
    }

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fromLocation: formData.fromLocation,
          toLocation: formData.toLocation,
          travelDate: formData.travelDate.toISOString().split('T')[0], // YYYY-MM-DD format
          priceThreshold: price,
          preferredTimeStart: formData.preferredTimeStart || null,
          preferredTimeEnd: formData.preferredTimeEnd || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create alert')
        setLoading(false)
        return
      }

      // Success - redirect to confirmation
      router.push(`/alerts/confirm?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create Price Alert
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fromLocation"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    From
                  </label>
                  <select
                    id="fromLocation"
                    required
                    value={formData.fromLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, fromLocation: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select origin</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="toLocation"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    To
                  </label>
                  <select
                    id="toLocation"
                    required
                    value={formData.toLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, toLocation: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select destination</option>
                    {locations
                      .filter((loc) => loc.id !== formData.fromLocation)
                      .map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="travelDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Travel Date
                </label>
                <DatePicker
                  selected={formData.travelDate}
                  onChange={(date: Date | null) =>
                    setFormData({ ...formData, travelDate: date })
                  }
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select travel date"
                  wrapperClassName="w-full"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Select the date you want to travel
                </p>
              </div>

              <div>
                <label
                  htmlFor="priceThreshold"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price Threshold (USD)
                </label>
                <input
                  type="number"
                  id="priceThreshold"
                  required
                  min="0"
                  step="0.01"
                  value={formData.priceThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, priceThreshold: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="50.00"
                />
                <p className="mt-1 text-sm text-gray-500">
                  We&apos;ll notify you when coach tickets drop to or below this
                  price.
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Preferred Time Window (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Prefer trains within this time range. We&apos;ll prioritize alerts for trains in your preferred window.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="preferredTimeStart"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Earliest Preferred Time
                    </label>
                    <input
                      type="time"
                      id="preferredTimeStart"
                      value={formData.preferredTimeStart}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredTimeStart: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="preferredTimeEnd"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Latest Preferred Time
                    </label>
                    <input
                      type="time"
                      id="preferredTimeEnd"
                      value={formData.preferredTimeEnd}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredTimeEnd: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Example: 14:00 (2:00 PM) to 20:00 (8:00 PM) to avoid early morning trains
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Alert...' : 'Create Alert'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to home
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
