# Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables in Vercel Settings → Environment Variables:

### 1. DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** `file:./data/dev.db` (or use Vercel Postgres if you prefer)
- **Environments:** All Environments
- **Sensitive:** No (but can mark as sensitive if you want)
- **Note:** SQLite file path. For production, consider using Vercel Postgres or another database service.

**Important for Vercel:** SQLite files are ephemeral on Vercel serverless functions. For production, you should:
- Use Vercel Postgres (recommended)
- Or use a file storage service like S3/R2
- Or use a hosted SQLite service

### 2. RESEND_API_KEY
- **Key:** `RESEND_API_KEY`
- **Value:** Your Resend API key (starts with `re_`)
- **Environments:** All Environments
- **Sensitive:** ✅ **YES** (enable the toggle)
- **Note:** API key from Resend dashboard (https://resend.com/api-keys)

### 3. FROM_EMAIL
- **Key:** `FROM_EMAIL`
- **Value:** `alerts@trakalerts.com` (after domain verification) or `onboarding@resend.dev` (for testing)
- **Environments:** All Environments
- **Sensitive:** No
- **Note:** Email address to send alerts from. Must be verified in Resend.

### 4. NEXT_PUBLIC_BASE_URL
- **Key:** `NEXT_PUBLIC_BASE_URL`
- **Value:** `https://trakalerts.com` (after domain setup) or `https://amtrak-price-watch-XXXX.vercel.app` (your Vercel URL)
- **Environments:** All Environments
- **Sensitive:** No
- **Note:** Base URL for unsubscribe links and email content. Update after custom domain is configured.

### 5. CRON_SECRET
- **Key:** `CRON_SECRET`
- **Value:** Generate a random secret string (e.g., use `openssl rand -hex 32`)
- **Environments:** All Environments
- **Sensitive:** ✅ **YES** (enable the toggle)
- **Note:** Secret token to secure the cron endpoint. Must match the secret in vercel.json cron configuration.

## Quick Setup Steps

1. **Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

2. **For each variable above:**
   - Click "Create new"
   - Enter the Key
   - Enter the Value
   - Select "All Environments" (or specific environments if needed)
   - Enable "Sensitive" toggle for API keys and secrets
   - Add a note (optional but helpful)
   - Click "Save"

3. **After adding all variables:**
   - Redeploy your project (Vercel will automatically redeploy on next push, or you can trigger a manual redeploy)

## Generate CRON_SECRET

Run this command to generate a secure random secret:

```bash
openssl rand -hex 32
```

Copy the output and use it as your `CRON_SECRET` value.

## Important Notes

- **SQLite on Vercel:** SQLite files are ephemeral in serverless functions. Each function invocation gets a fresh filesystem. For production, you should migrate to Vercel Postgres or another persistent database.

- **Environment-specific values:** You can set different values for Production, Preview, and Development if needed.

- **Sensitive variables:** After marking as sensitive, you won't be able to view the values again. Make sure to save them securely elsewhere.

- **Updating variables:** After updating environment variables, you need to redeploy for changes to take effect.

## Testing

After setting up environment variables:

1. **Test email:** Visit `https://your-app.vercel.app/api/test-email?email=your-email@example.com`
2. **Check logs:** Go to Vercel Dashboard → Logs to see any errors
3. **Verify cron:** The cron job will run daily at 5 AM UTC (configured in `vercel.json`)

