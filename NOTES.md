# Development Notes

## Known Issues

### Prisma 7 Client Initialization

Prisma 7 requires explicit configuration options when using custom output paths. The seed script (`prisma/seed.ts`) may fail with a constructor validation error.

**Workaround**: Use the manual seed script:
```bash
npm run db:seed:manual
```

**Future Fix**: The Prisma client initialization in `lib/prisma.ts` uses a type assertion (`as any`) as a temporary workaround. This should be resolved when:
1. Prisma 7 documentation is updated with proper adapter configuration for SQLite
2. Or we migrate to using the default Prisma client output location

## Implementation Notes

### Price Fetching

The `fetchAmtrakPrice` function in `app/api/cron/fetch-prices/route.ts` is currently a mock implementation that returns random prices. 

**To implement real price fetching:**
1. Check if Amtrak has a public API for booking/pricing
2. If not, implement web scraping with:
   - Proper rate limiting
   - Error handling and retries
   - Respect for robots.txt and terms of service
3. Extract coach class prices specifically
4. Handle date formatting and route mapping correctly

### Email Configuration

Email sending via Resend is optional - the app will continue to work if `RESEND_API_KEY` is not set (logs warnings instead of crashing).

### Cron Job Security

The cron job endpoint is protected by a `CRON_SECRET` environment variable. Vercel automatically adds this to the Authorization header when calling cron jobs, but you should verify this in production.

### Database

SQLite is used for simplicity and free-tier compatibility. For production at scale, consider:
- PostgreSQL (Vercel Postgres free tier)
- Or keep SQLite but add proper backup strategy

## Testing

To test the cron job locally:
```bash
curl -X GET http://localhost:3000/api/cron/fetch-prices \
  -H "Authorization: Bearer your-cron-secret"
```

## Next Steps for Production

1. Implement real Amtrak price fetching
2. Add error monitoring (e.g., Sentry)
3. Add rate limiting to API endpoints
4. Set up database backups
5. Add analytics/tracking (optional)
6. Test email delivery thoroughly
7. Verify cron job runs correctly on Vercel

