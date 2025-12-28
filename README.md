# Amtrak Holiday Price Watch MVP

A production-ready MVP for tracking Amtrak prices during holiday periods and sending email alerts when prices drop below user-defined thresholds.

## Features

- **Fixed Route Tracking**: Monitors prices for 5 popular routes (NYC→Boston, NYC→DC, NYC→Philadelphia, Boston→DC, DC→Richmond)
- **Holiday Windows**: Tracks Thanksgiving (Nov 25-30) and Christmas (Dec 22-27) periods
- **Email Alerts**: Sends email notifications when coach class prices drop below user thresholds
- **Daily Price Checks**: Automated daily price fetching via Vercel Cron
- **Simple UI**: No authentication, no user accounts - just create alerts and get notified

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite via Prisma
- **Email**: Resend
- **Jobs**: Vercel Cron
- **Hosting**: Vercel (free tier)
- **Scraping**: Playwright (discovery) + Direct HTTP (fetching)

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Resend account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd amtrak-price-watch
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your:
- `RESEND_API_KEY` - Get from [Resend](https://resend.com) - see `scripts/setup-email.md` for detailed setup
- `FROM_EMAIL` - Your verified Resend email address (e.g., `alerts@yourdomain.com`)
- `CRON_SECRET` - Random secret for securing cron endpoint
- `NEXT_PUBLIC_BASE_URL` - Your app URL (e.g., `https://your-app.vercel.app`)

**Quick Email Setup:**
1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Get your API key from the dashboard
3. Verify a domain (or use `resend.dev` for testing)
4. Add `RESEND_API_KEY` and `FROM_EMAIL` to `.env`
5. Test: `curl "http://localhost:3000/api/test-email?type=confirmation&email=your-email@example.com"`

See `scripts/setup-email.md` for detailed instructions.

4. **Discover Amtrak API endpoints** (first time setup):
```bash
npm run discover:amtrak
```

This will:
- Open a browser and navigate to Amtrak's booking page
- Intercept API calls to discover pricing endpoints
- Save configuration to `lib/amtrak-config.json`

**Note**: The discovery script only needs to run once (or when Amtrak changes their API). After discovery, the app uses direct HTTP calls - no browser needed.
- `NEXT_PUBLIC_BASE_URL` - Your app URL (for unsubscribe links)
- `CRON_SECRET` - A random secret for securing the cron endpoint

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (routes and holidays)
# Note: If the TypeScript seed script fails due to Prisma 7 client initialization,
# use the manual seed script instead:
npm run db:seed:manual
```

5. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
amtrak-price-watch/
├── app/
│   ├── api/
│   │   ├── alerts/
│   │   │   ├── route.ts              # Create/fetch alerts
│   │   │   └── [alertId]/
│   │   │       └── unsubscribe/     # Unsubscribe endpoint
│   │   └── cron/
│   │       └── fetch-prices/         # Daily price fetch job
│   ├── alerts/
│   │   ├── create/                   # Alert creation form
│   │   └── confirm/                  # Confirmation page
│   └── page.tsx                      # Landing page
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── email.ts                      # Email service (Resend)
│   ├── amtrak-fetcher.ts             # Amtrak fare fetcher (caching, rate limiting)
│   ├── station-codes.ts              # Station code mapping (NYP, BOS, etc.)
│   └── amtrak-config.json            # Discovered API config (gitignored)
├── scripts/
│   └── discover-amtrak-api.ts        # Playwright script to discover API endpoints
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Seed script
└── vercel.json                       # Vercel cron configuration
```

## Database Schema

- **Route**: Fixed routes (origin, destination, label)
- **Holiday**: Holiday periods (name, startDate, endDate)
- **PriceSnapshot**: Daily price records (routeId, travelDate, priceUsd, scrapedAt)
- **Alert**: User subscriptions (email, routeId, holidayId, priceThreshold, isActive)
- **AlertTrigger**: Tracks when alerts fired (alertId, triggeredAt, priceUsd)

## API Endpoints

### `GET /api/alerts`
Fetch all routes and holidays for form population.

### `POST /api/alerts`
Create a new price alert.

**Body:**
```json
{
  "email": "user@example.com",
  "routeId": "route-id",
  "holidayId": "holiday-id",
  "priceThreshold": 50.00
}
```

### `GET /api/alerts/[alertId]/unsubscribe`
Show unsubscribe confirmation page.

### `POST /api/alerts/[alertId]/unsubscribe`
Unsubscribe from an alert.

### `GET /api/cron/fetch-prices`
Daily cron job that:
1. Fetches prices for all route × holiday date combinations
2. Stores price snapshots
3. Compares prices to active alerts
4. Sends email notifications when thresholds are met

**Security**: Protected by `CRON_SECRET` in Authorization header.

### `GET /api/test-email`
Test email functionality without creating alerts.

**Query Parameters:**
- `type` - `confirmation` or `alert` (default: `confirmation`)
- `email` - Email address to send test to (default: `test@example.com`)

**Example:**
```bash
curl "http://localhost:3000/api/test-email?type=confirmation&email=your-email@example.com"
```

Or use the test script:
```bash
./scripts/test-email.sh your-email@example.com confirmation
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The cron job will automatically be set up via `vercel.json`.

### Environment Variables for Production

Make sure to set:
- `DATABASE_URL` - Vercel will provide this for SQLite (or use a different database)
- `RESEND_API_KEY` - Your Resend API key
- `FROM_EMAIL` - Verified Resend email (e.g., `alerts@trakalerts.com`)
- `NEXT_PUBLIC_BASE_URL` - Your production URL (e.g., `https://trakalerts.com`)
- `CRON_SECRET` - Random secret for cron security

### Setting Up Custom Domain (trakalerts.com)

If you have a custom domain, see `scripts/setup-domain.md` for:
- Resend domain verification (for email)
- Vercel domain configuration (for hosting)
- DNS records setup
- Production deployment steps

## Constraints & Trade-offs

### Hard Constraints (as specified)
- ✅ No SMS - Email only
- ✅ No per-user scraping - Fixed routes only
- ✅ No arbitrary routes/dates - Hardcoded list
- ✅ No real-time polling - Daily cron only
- ✅ Email alerts only
- ✅ Coach class only
- ✅ Scraping limited to once per day per route/date

### Trade-offs Made

1. **Price Fetching**: Uses Playwright for API discovery, then direct HTTP calls for fetching.
   - Run `npm run discover:amtrak` to discover Amtrak's API endpoints
   - The fetcher uses discovered endpoints with 6-hour caching
   - Includes rate limiting (max 5 concurrent, 2 per route)
   - See `README-SCRAPING.md` for detailed documentation

2. **Database**: Using SQLite for simplicity and free-tier compatibility. For production scale, consider PostgreSQL.

3. **Email Templates**: Simple HTML/text emails. No complex templating system to keep it minimal.

4. **Error Handling**: Basic error handling with logging. More sophisticated error tracking (e.g., Sentry) can be added later.

5. **Rate Limiting**: Cron job enforces once-per-day limit. No additional rate limiting on the API endpoints (can be added if needed).

## Development

### Running Migrations

```bash
npm run db:migrate
```

### Seeding Data

```bash
npm run db:seed
```

### Generating Prisma Client

```bash
npm run db:generate
```

## Notes

- The price fetching logic (`fetchAmtrakPrice`) is currently a mock. Replace with actual Amtrak API integration or scraping logic.
- Email sending is optional - the app will continue to work if Resend is not configured (logs warnings).
- The cron job is designed to not crash on partial failures - it logs errors and continues processing.

## License

MIT
