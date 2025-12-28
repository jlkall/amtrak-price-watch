/**
 * Amtrak API Discovery Script
 * 
 * This script uses Playwright to:
 * 1. Load the Amtrak booking page
 * 2. Intercept XHR/fetch requests that return pricing data
 * 3. Extract endpoint URLs, headers, cookies, and request payloads
 * 4. Output a reusable fetch configuration
 * 
 * Run: npx tsx scripts/discover-amtrak-api.ts
 */

import { chromium, Browser, Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface InterceptedRequest {
  url: string
  method: string
  headers: Record<string, string>
  postData?: string
  response?: {
    status: number
    headers: Record<string, string>
    body?: string
  }
}

const interceptedRequests: InterceptedRequest[] = []

async function discoverAmtrakAPI() {
  console.log('🚀 Starting Amtrak API discovery...')
  
  const browser = await chromium.launch({
    headless: false, // Keep visible to see what's happening
  })

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const page = await context.newPage()

  // Intercept all network requests
  page.on('request', (request) => {
    const url = request.url()
    
    // Look for API calls that might contain pricing data
    if (
      url.includes('api') ||
      url.includes('fare') ||
      url.includes('price') ||
      url.includes('booking') ||
      url.includes('search') ||
      url.includes('availability') ||
      url.includes('schedule')
    ) {
      console.log(`📡 Intercepted request: ${request.method()} ${url}`)
      
      const headers = request.headers()
      const postData = request.postData()
      
      interceptedRequests.push({
        url,
        method: request.method(),
        headers,
        postData: postData || undefined,
      })
    }
  })

  // Intercept responses to capture response data
  page.on('response', async (response) => {
    const url = response.url()
    
    if (
      url.includes('api') ||
      url.includes('fare') ||
      url.includes('price') ||
      url.includes('booking') ||
      url.includes('search') ||
      url.includes('availability') ||
      url.includes('schedule')
    ) {
      try {
        const body = await response.text()
        const headers = response.headers()
        
        // Find the corresponding request
        const request = interceptedRequests.find(r => r.url === url)
        if (request) {
          request.response = {
            status: response.status(),
            headers,
            body: body.substring(0, 5000), // Limit body size for logging
          }
          
          console.log(`✅ Response: ${response.status()} ${url}`)
          console.log(`   Body preview: ${body.substring(0, 200)}...`)
        }
      } catch (error) {
        console.error(`Error reading response for ${url}:`, error)
      }
    }
  })

  try {
    // Navigate to Amtrak booking page
    console.log('🌐 Navigating to Amtrak booking page...')
    await page.goto('https://www.amtrak.com/home.html', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Wait a bit for any initial API calls
    await page.waitForTimeout(2000)

    // Try to interact with the booking form to trigger API calls
    console.log('🔍 Looking for booking form...')
    
    // Common selectors for Amtrak booking form
    const originSelectors = [
      'input[name="origin"]',
      'input[placeholder*="From"]',
      'input[placeholder*="Origin"]',
      '#origin',
      '[data-testid="origin"]',
    ]

    const destinationSelectors = [
      'input[name="destination"]',
      'input[placeholder*="To"]',
      'input[placeholder*="Destination"]',
      '#destination',
      '[data-testid="destination"]',
    ]

    // Try to find and fill origin
    for (const selector of originSelectors) {
      try {
        const element = await page.locator(selector).first()
        if (await element.isVisible({ timeout: 1000 })) {
          await element.fill('New York')
          await page.waitForTimeout(1000)
          // Try to select from dropdown if it appears
          const dropdown = await page.locator('text=New York').first()
          if (await dropdown.isVisible({ timeout: 1000 })) {
            await dropdown.click()
          }
          break
        }
      } catch (e) {
        // Try next selector
      }
    }

    // Try to find and fill destination
    for (const selector of destinationSelectors) {
      try {
        const element = await page.locator(selector).first()
        if (await element.isVisible({ timeout: 1000 })) {
          await element.fill('Boston')
          await page.waitForTimeout(1000)
          const dropdown = await page.locator('text=Boston').first()
          if (await dropdown.isVisible({ timeout: 1000 })) {
            await dropdown.click()
          }
          break
        }
      } catch (e) {
        // Try next selector
      }
    }

    // Try to set date (common selectors)
    const dateSelectors = [
      'input[name="date"]',
      'input[type="date"]',
      'input[placeholder*="Date"]',
      '#date',
      '[data-testid="date"]',
    ]

    for (const selector of dateSelectors) {
      try {
        const element = await page.locator(selector).first()
        if (await element.isVisible({ timeout: 1000 })) {
          // Set date to tomorrow
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          const dateStr = tomorrow.toISOString().split('T')[0]
          await element.fill(dateStr)
          break
        }
      } catch (e) {
        // Try next selector
      }
    }

    // Try to click search/submit button
    const searchSelectors = [
      'button[type="submit"]',
      'button:has-text("Search")',
      'button:has-text("Find Trains")',
      '[data-testid="search"]',
      '.search-button',
    ]

    for (const selector of searchSelectors) {
      try {
        const element = await page.locator(selector).first()
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click()
          console.log('🔍 Clicked search button, waiting for API calls...')
          // Wait for API responses
          await page.waitForTimeout(5000)
          break
        }
      } catch (e) {
        // Try next selector
      }
    }

    // Wait a bit more for any delayed API calls
    await page.waitForTimeout(3000)

    console.log(`\n📊 Discovery complete! Found ${interceptedRequests.length} potential API calls`)

    // Extract cookies for reuse
    const cookies = await context.cookies()
    
    // Generate fetch configuration
    const config = {
      discoveredAt: new Date().toISOString(),
      cookies: cookies.map(c => ({ name: c.name, value: c.value, domain: c.domain })),
      endpoints: interceptedRequests.map(req => ({
        url: req.url,
        method: req.method,
        headers: req.headers,
        postData: req.postData,
        responsePreview: req.response?.body?.substring(0, 500),
      })),
      notes: [
        'This configuration was auto-generated by the discovery script',
        'Update the fare fetcher to use the correct endpoint URL',
        'Headers and cookies may need to be refreshed periodically',
        'Some endpoints may require authentication tokens',
      ],
    }

    // Save configuration
    const configPath = path.join(__dirname, '../lib/amtrak-config.json')
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log(`\n💾 Configuration saved to: ${configPath}`)

    // Also save detailed request log
    const logPath = path.join(__dirname, '../lib/amtrak-discovery-log.json')
    fs.writeFileSync(logPath, JSON.stringify(interceptedRequests, null, 2))
    console.log(`📝 Detailed log saved to: ${logPath}`)

    // Print summary
    console.log('\n📋 Summary:')
    console.log(`   Total requests intercepted: ${interceptedRequests.length}`)
    console.log(`   Cookies captured: ${cookies.length}`)
    
    const apiEndpoints = interceptedRequests.filter(r => 
      r.url.includes('api') || r.response?.body?.includes('price') || r.response?.body?.includes('fare')
    )
    console.log(`   Potential pricing endpoints: ${apiEndpoints.length}`)
    
    if (apiEndpoints.length > 0) {
      console.log('\n🎯 Recommended endpoints to investigate:')
      apiEndpoints.forEach((endpoint, i) => {
        console.log(`   ${i + 1}. ${endpoint.method} ${endpoint.url}`)
      })
    }

  } catch (error) {
    console.error('❌ Error during discovery:', error)
  } finally {
    await browser.close()
    console.log('\n✅ Discovery script completed')
  }
}

// Run discovery
discoverAmtrakAPI().catch(console.error)

