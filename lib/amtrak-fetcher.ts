/**
 * Amtrak Fare Fetcher
 * 
 * Fetches fare prices from Amtrak's API using discovered endpoints.
 * Includes caching, rate limiting, and error handling.
 * 
 * Architecture:
 * - Uses direct HTTP calls (no browser after discovery)
 * - Caches results for 6 hours
 * - Rate limits: max 3-5 concurrent requests
 * - Per-route rate limiting
 */

import * as fs from 'fs'
import * as path from 'path'

interface AmtrakConfig {
  discoveredAt: string
  cookies: Array<{ name: string; value: string; domain: string }>
  endpoints: Array<{
    url: string
    method: string
    headers: Record<string, string>
    postData?: string
  }>
}

interface FareResult {
  price: number | null
  currency: string
  class: string
  cached: boolean
  timestamp: Date
  error?: string
}

interface CacheEntry {
  price: number
  timestamp: Date
  expiresAt: Date
}

// In-memory cache: route+date -> CacheEntry
const priceCache = new Map<string, CacheEntry>()

// Rate limiting: track active requests per route
const activeRequests = new Map<string, number>()
const MAX_CONCURRENT = 5
const MAX_CONCURRENT_PER_ROUTE = 2

// Cache duration: 6 hours
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000

/**
 * Load Amtrak API configuration from discovery script output
 */
function loadAmtrakConfig(): AmtrakConfig | null {
  try {
    const configPath = path.join(process.cwd(), 'lib/amtrak-config.json')
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(configData) as AmtrakConfig
    }
  } catch (error) {
    console.error('Error loading Amtrak config:', error)
  }
  return null
}

/**
 * Get cache key for route + date
 */
function getCacheKey(origin: string, destination: string, date: Date): string {
  const dateStr = date.toISOString().split('T')[0]
  return `${origin}-${destination}-${dateStr}`
}

/**
 * Check if we have a cached price that's still valid
 */
function getCachedPrice(origin: string, destination: string, date: Date): number | null {
  const key = getCacheKey(origin, destination, date)
  const entry = priceCache.get(key)
  
  if (entry && entry.expiresAt > new Date()) {
    return entry.price
  }
  
  // Remove expired entry
  if (entry) {
    priceCache.delete(key)
  }
  
  return null
}

/**
 * Cache a price result
 */
function cachePrice(origin: string, destination: string, date: Date, price: number): void {
  const key = getCacheKey(origin, destination, date)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS)
  
  priceCache.set(key, {
    price,
    timestamp: now,
    expiresAt,
  })
}

/**
 * Check rate limits before making a request
 */
async function checkRateLimit(origin: string, destination: string): Promise<void> {
  const routeKey = `${origin}-${destination}`
  
  // Check global concurrent limit
  const totalActive = Array.from(activeRequests.values()).reduce((sum, count) => sum + count, 0)
  if (totalActive >= MAX_CONCURRENT) {
    // Wait a bit and retry
    await new Promise(resolve => setTimeout(resolve, 1000))
    return checkRateLimit(origin, destination)
  }
  
  // Check per-route limit
  const routeActive = activeRequests.get(routeKey) || 0
  if (routeActive >= MAX_CONCURRENT_PER_ROUTE) {
    // Wait a bit and retry
    await new Promise(resolve => setTimeout(resolve, 500))
    return checkRateLimit(origin, destination)
  }
  
  // Increment counters
  activeRequests.set(routeKey, routeActive + 1)
}

/**
 * Release rate limit after request completes
 */
function releaseRateLimit(origin: string, destination: string): void {
  const routeKey = `${origin}-${destination}`
  const current = activeRequests.get(routeKey) || 0
  if (current > 0) {
    activeRequests.set(routeKey, current - 1)
  }
}

/**
 * Fetch fare from Amtrak API
 * 
 * This is a placeholder that will be updated once we discover the actual API endpoint.
 * For now, it attempts to use common Amtrak API patterns.
 */
async function fetchFareFromAPI(
  origin: string,
  destination: string,
  date: Date
): Promise<number | null> {
  const config = loadAmtrakConfig()
  
  if (!config || config.endpoints.length === 0) {
    console.warn('No Amtrak API config found. Run discovery script first: npm run discover:amtrak')
    console.warn('Falling back to mock price for development')
    
    // Fallback to mock price for development/testing
    // Remove this once real API is configured
    const routeBasePrices: Record<string, number> = {
      'NYP-BOS': 50,
      'NYP-WAS': 60,
      'NYP-PHL': 30,
      'BOS-WAS': 80,
      'WAS-RVR': 40,
    }
    
    const routeKey = `${origin}-${destination}`
    const basePrice = routeBasePrices[routeKey] || 50
    const variation = Math.floor(Math.random() * 40) - 20
    return Math.max(30, basePrice + variation)
  }

  // Find the most likely pricing endpoint
  // In a real implementation, you'd identify the correct endpoint from discovery
  const pricingEndpoint = config.endpoints.find(
    e => e.url.includes('fare') || e.url.includes('price') || e.url.includes('search')
  ) || config.endpoints[0]

  // Build request headers
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    ...pricingEndpoint.headers,
  }

  // Build cookie string
  const cookieString = config.cookies
    .map(c => `${c.name}=${c.value}`)
    .join('; ')

  if (cookieString) {
    headers['Cookie'] = cookieString
  }

  // Build request payload (adjust based on discovered API structure)
  const dateStr = date.toISOString().split('T')[0]
  const payload = {
    origin,
    destination,
    date: dateStr,
    // Add other required fields based on discovered API
  }

  try {
    const response = await fetch(pricingEndpoint.url, {
      method: pricingEndpoint.method || 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`Amtrak API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    
    // Extract price from response (adjust based on actual API structure)
    // Common patterns:
    // - data.fares[0].price
    // - data.results[0].lowestFare
    // - data.price
    let price: number | null = null
    
    if (data.fares && data.fares.length > 0) {
      // Find coach class fare
      const coachFare = data.fares.find((f: any) => 
        f.class?.toLowerCase().includes('coach') || 
        f.serviceClass === 'Coach'
      )
      price = coachFare?.price || coachFare?.amount || null
    } else if (data.results && data.results.length > 0) {
      price = data.results[0].lowestFare || data.results[0].price || null
    } else if (data.price) {
      price = data.price
    } else if (typeof data === 'number') {
      price = data
    }

    return price
  } catch (error) {
    console.error(`Error fetching fare from Amtrak API:`, error)
    return null
  }
}

/**
 * Main function to fetch Amtrak fare price
 * 
 * @param origin - Origin station code (e.g., "NYP" for New York Penn)
 * @param destination - Destination station code (e.g., "BOS" for Boston)
 * @param date - Travel date
 * @returns Fare result with price, cache status, and metadata
 */
export async function fetchAmtrakFare(
  origin: string,
  destination: string,
  date: Date
): Promise<FareResult> {
  // Check cache first
  const cachedPrice = getCachedPrice(origin, destination, date)
  if (cachedPrice !== null) {
    return {
      price: cachedPrice,
      currency: 'USD',
      class: 'Coach',
      cached: true,
      timestamp: new Date(),
    }
  }

  // Apply rate limiting
  await checkRateLimit(origin, destination)

  try {
    // Fetch from API
    const price = await fetchFareFromAPI(origin, destination, date)

    if (price !== null) {
      // Cache the result
      cachePrice(origin, destination, date, price)
      
      return {
        price,
        currency: 'USD',
        class: 'Coach',
        cached: false,
        timestamp: new Date(),
      }
    } else {
      return {
        price: null,
        currency: 'USD',
        class: 'Coach',
        cached: false,
        timestamp: new Date(),
        error: 'Failed to fetch price from Amtrak API',
      }
    }
  } catch (error: any) {
    return {
      price: null,
      currency: 'USD',
      class: 'Coach',
      cached: false,
      timestamp: new Date(),
      error: error.message || 'Unknown error',
    }
  } finally {
    // Release rate limit
    releaseRateLimit(origin, destination)
  }
}

/**
 * Clear expired cache entries (call periodically)
 */
export function clearExpiredCache(): void {
  const now = new Date()
  for (const [key, entry] of priceCache.entries()) {
    if (entry.expiresAt <= now) {
      priceCache.delete(key)
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: priceCache.size,
    entries: Array.from(priceCache.entries()).map(([key, entry]) => ({
      key,
      price: entry.price,
      age: Date.now() - entry.timestamp.getTime(),
      expiresIn: entry.expiresAt.getTime() - Date.now(),
    })),
  }
}

