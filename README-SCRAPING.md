# Amtrak Fare Scraping Guide

## Overview

This app uses a two-phase approach to fetch Amtrak fares:

1. **Discovery Phase**: Use Playwright to discover Amtrak's API endpoints
2. **Fetch Phase**: Use direct HTTP calls to fetch prices (no browser)

## Architecture

### Discovery Script (`scripts/discover-amtrak-api.ts`)

The discovery script:
- Opens Amtrak's booking page in a browser
- Intercepts all XHR/fetch requests
- Captures API endpoints, headers, cookies, and request payloads
- Saves configuration to `lib/amtrak-config.json`

**Run discovery:**
```bash
npm run discover:amtrak
```

This will:
1. Open a browser window
2. Navigate to Amtrak booking page
3. Fill in a sample search (NYC → Boston)
4. Capture all API calls
5. Save configuration for reuse

### Fare Fetcher (`lib/amtrak-fetcher.ts`)

The fare fetcher:
- Uses discovered endpoints to fetch prices directly
- Implements 6-hour caching
- Rate limits: max 5 concurrent, max 2 per route
- No browser required after discovery

**Key features:**
- **Caching**: Results cached for 6 hours per route/date
- **Rate Limiting**: Prevents overwhelming Amtrak's servers
- **Error Handling**: Graceful fallbacks and retries
- **Station Codes**: Maps city names to Amtrak codes (NYP, BOS, etc.)

## How It Works

### 1. Initial Discovery

```bash
npm run discover:amtrak
```

The script will:
- Intercept API calls when you search for trains
- Save endpoint URLs, headers, and cookies
- Output configuration to `lib/amtrak-config.json`

### 2. Updating the Fetcher

After discovery, update `lib/amtrak-fetcher.ts`:

1. **Identify the correct endpoint**: Look for the endpoint that returns pricing data
2. **Parse the response**: Extract the coach class price from the JSON response
3. **Update `fetchFareFromAPI`**: Adjust the payload and response parsing

Example response parsing:
```typescript
// Common patterns in Amtrak API responses:
if (data.fares && data.fares.length > 0) {
  const coachFare = data.fares.find(f => f.class === 'Coach')
  price = coachFare?.price
}
```

### 3. Running the Cron Job

The cron job (`app/api/cron/fetch-prices/route.ts`) automatically:
- Uses the fare fetcher for all price checks
- Respects cache (won't re-fetch if cached
- Rate limits requests
- Handles errors gracefully

## Station Codes

Amtrak uses 3-letter station codes. The app includes a mapping in `lib/station-codes.ts`:

- NYC / New York → NYP (New York Penn Station)
- Boston → BOS
- DC / Washington → WAS (Washington Union Station)
- Philadelphia → PHL (30th Street Station)
- Richmond → RVR (Staples Mill Road)

Add more codes as needed.

## Caching Strategy

- **Cache Duration**: 6 hours per route/date combination
- **Cache Key**: `{origin}-{destination}-{date}`
- **Cache Storage**: In-memory (Map)
- **Cache Invalidation**: Automatic expiration

To clear cache manually:
```typescript
import { clearExpiredCache } from '@/lib/amtrak-fetcher'
clearExpiredCache()
```

## Rate Limiting

- **Global Limit**: Max 5 concurrent requests
- **Per-Route Limit**: Max 2 concurrent requests per route
- **Behavior**: Waits and retries if limits exceeded

## If Amtrak Changes Their API

1. **Run discovery again**:
   ```bash
   npm run discover:amtrak
   ```

2. **Check the new endpoints** in `lib/amtrak-discovery-log.json`

3. **Update `fetchFareFromAPI`** in `lib/amtrak-fetcher.ts`:
   - Update endpoint URL if changed
   - Update request payload format
   - Update response parsing logic

4. **Test with a known route/date**

5. **Clear cache** if needed:
   ```typescript
   priceCache.clear()
   ```

## Troubleshooting

### No API calls intercepted

- Make sure you're on the booking/search page
- Try clicking "Search" or "Find Trains" button
- Wait a few seconds for API calls to complete
- Check browser console for errors

### Fetcher returns null

- Verify `lib/amtrak-config.json` exists and has endpoints
- Check that station codes are correct
- Verify request payload format matches Amtrak's API
- Check response structure - it may have changed

### Rate limit errors

- Reduce `MAX_CONCURRENT` in `lib/amtrak-fetcher.ts`
- Add delays between requests
- Check if Amtrak has added rate limiting

### Cache not working

- Verify cache key format matches
- Check expiration logic
- Clear cache and retry

## Production Considerations

1. **Persistent Cache**: Consider Redis or database for cache
2. **Monitoring**: Add logging/metrics for API calls
3. **Retry Logic**: Implement exponential backoff
4. **Error Alerts**: Notify if API changes detected
5. **Cookie Refresh**: May need to refresh cookies periodically

## Security Notes

- Don't commit `lib/amtrak-config.json` if it contains sensitive tokens
- Rotate cookies/tokens if they expire
- Respect Amtrak's rate limits and terms of service
- Consider using official API if available

