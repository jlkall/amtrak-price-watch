# Email Service Setup Guide

This app uses [Resend](https://resend.com) for sending emails. Resend offers a free tier with 3,000 emails/month.

## Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "Amtrak Price Watch")
4. Copy the API key (you'll only see it once!)

## Step 3: Configure FROM_EMAIL

**IMPORTANT**: Resend does NOT allow sending from Gmail, Yahoo, or other public email providers. You have two options:

### Option A: Use Resend Test Domain (Quick Setup for Development)

For testing and development, you can use Resend's test domain:

```bash
FROM_EMAIL=onboarding@resend.dev
```

**Pros:**
- Works immediately, no setup needed
- Perfect for development and testing
- Emails will have "via resend.dev" notice

**Cons:**
- Not recommended for production
- Emails may go to spam more often

### Option B: Verify Your Own Domain (Recommended for Production)

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)
5. Wait for verification (usually a few minutes)
6. Use your verified domain:
   ```bash
   FROM_EMAIL=alerts@yourdomain.com
   ```

**Pros:**
- Professional email addresses
- Better deliverability
- No "via resend.dev" notice
- Production-ready

**Cons:**
- Requires domain ownership
- DNS setup required

## Step 4: Configure Environment Variables

Add to your `.env` file:

```bash
# Resend API Key (from Step 2)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# From email address
# For testing (quick setup):
FROM_EMAIL=onboarding@resend.dev

# For production (after domain verification):
# FROM_EMAIL=alerts@yourdomain.com
```

## Step 5: Test Email Setup

### Option 1: Use Test Endpoint

```bash
# Test confirmation email
curl "http://localhost:3000/api/test-email?type=confirmation&email=your-email@example.com"

# Test alert email
curl "http://localhost:3000/api/test-email?type=alert&email=your-email@example.com"
```

### Option 2: Use Test Script

```bash
./scripts/test-email.sh your-email@example.com
```

### Option 3: Create a Test Alert

1. Go to http://localhost:3000/alerts/create
2. Fill out the form with your email
3. Submit
4. Check your inbox for confirmation email

## Troubleshooting

### "The gmail.com domain is not verified"
**Problem**: You're trying to use a Gmail address as FROM_EMAIL.

**Solution**: 
- For development: Use `onboarding@resend.dev`
- For production: Verify your own domain and use `alerts@yourdomain.com`

### "RESEND_API_KEY not configured"
- Make sure `.env` file exists
- Verify the API key is correct (starts with `re_`)
- Restart your dev server after adding env vars

### "FROM_EMAIL not configured"
- Add `FROM_EMAIL` to `.env`
- Must use a verified domain from Resend OR `resend.dev` for testing

### "Domain not verified"
- Check Resend dashboard → Domains
- Verify DNS records are correct
- Wait a few minutes for DNS propagation

### "Email not received"
- Check spam/junk folder
- Verify email address is correct
- Check Resend dashboard → Logs for delivery status
- For `resend.dev` domain, emails may be delayed or go to spam

### "Rate limit exceeded"
- Free tier: 3,000 emails/month
- Check usage in Resend dashboard
- Upgrade plan if needed

## Production Setup

For production (Vercel):

1. **Verify your domain** in Resend:
   - Go to Resend dashboard → Domains
   - Add your production domain
   - Add DNS records
   - Wait for verification

2. **Add environment variables** in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `RESEND_API_KEY`
   - Add `FROM_EMAIL` (use your verified domain, e.g., `alerts@yourdomain.com`)
   - Add `NEXT_PUBLIC_BASE_URL` (your production URL)

3. **Test in production**:
   ```bash
   curl "https://your-app.vercel.app/api/test-email?type=confirmation&email=your-email@example.com"
   ```

## Email Types

### Confirmation Email
- Sent when user creates an alert
- Includes route, date, price threshold, time preferences
- HTML + plain text versions

### Price Alert Email
- Sent when price drops below threshold
- Includes current price, savings, booking link
- Includes unsubscribe link
- HTML + plain text versions

## Resend Limits (Free Tier)

- **Emails/month**: 3,000
- **API requests/day**: 100
- **Domains**: 1 verified domain
- **No credit card required**

For higher limits, upgrade to a paid plan.

## Security Notes

- Never commit `.env` file to git
- Rotate API keys periodically
- Use domain verification for production
- Monitor email logs for suspicious activity

## Current Configuration

Your current setup:
- **API Key**: ✅ Configured
- **FROM_EMAIL**: `onboarding@resend.dev` (test domain - works immediately)
- **Status**: Ready for development/testing

To use in production, verify your own domain and update `FROM_EMAIL` accordingly.
