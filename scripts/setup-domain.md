# Setting Up trakalerts.com

This guide will help you configure trakalerts.com for:
1. Email sending via Resend
2. Website hosting on Vercel

## Step 1: Verify Domain in Resend (For Email)

### 1.1 Add Domain to Resend

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter: `trakalerts.com`
4. Click "Add Domain"

### 1.2 Add DNS Records

Resend will show you DNS records to add. You'll need to add these to your domain registrar (where you bought the domain):

**Required Records:**

1. **SPF Record** (Type: TXT)
   - Name: `@` or `trakalerts.com`
   - Value: `v=spf1 include:_spf.resend.com ~all`

2. **DKIM Record** (Type: TXT)
   - Name: `resend._domainkey` or `resend._domainkey.trakalerts.com`
   - Value: (Resend will provide a unique value, looks like: `p=...`)

3. **DMARC Record** (Type: TXT) - Optional but recommended
   - Name: `_dmarc` or `_dmarc.trakalerts.com`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@trakalerts.com`

### 1.3 Where to Add DNS Records

Where you add DNS records depends on where you bought the domain:

**Common Registrars:**
- **Namecheap**: Domain List → Manage → Advanced DNS
- **GoDaddy**: My Products → DNS
- **Google Domains**: DNS → Custom records
- **Cloudflare**: DNS → Records (if using Cloudflare)

**Or use a DNS provider:**
- **Cloudflare** (free, recommended)
- **AWS Route 53**
- **Google Cloud DNS**

### 1.4 Wait for Verification

- DNS propagation can take 5 minutes to 48 hours
- Usually takes 10-30 minutes
- Check Resend dashboard for verification status
- Once verified, you'll see a green checkmark

### 1.5 Update FROM_EMAIL

Once verified, update your `.env`:

```bash
FROM_EMAIL=alerts@trakalerts.com
```

Or for production in Vercel:
- Go to Vercel dashboard → Your project → Settings → Environment Variables
- Update `FROM_EMAIL` to `alerts@trakalerts.com`

## Step 2: Set Up Website Hosting on Vercel

### 2.1 Deploy to Vercel

1. Push your code to GitHub (if not already)
2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

### 2.2 Add Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter: `trakalerts.com`
5. Vercel will show you DNS records to add

### 2.3 Add Vercel DNS Records

Add these DNS records to your domain registrar:

**For Root Domain (trakalerts.com):**

1. **A Record**
   - Name: `@` or `trakalerts.com`
   - Value: `76.76.21.21` (Vercel will provide the actual IP)

**OR use CNAME (recommended):**

2. **CNAME Record**
   - Name: `@` or `trakalerts.com`
   - Value: `cname.vercel-dns.com` (Vercel will provide exact value)

**For www subdomain (optional):**

3. **CNAME Record**
   - Name: `www`
   - Value: `cname.vercel-dns.com`

### 2.4 Wait for DNS Propagation

- Usually takes 5-30 minutes
- Vercel will show "Valid Configuration" when ready
- You can check status in Vercel dashboard

### 2.5 Update Environment Variables in Vercel

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Add/Update:
   - `NEXT_PUBLIC_BASE_URL`: `https://trakalerts.com`
   - `FROM_EMAIL`: `alerts@trakalerts.com` (after Resend verification)
   - `RESEND_API_KEY`: (your Resend API key)
   - `CRON_SECRET`: (random secret)
   - `DATABASE_URL`: (Vercel will provide for SQLite, or use Postgres)

3. Redeploy after adding env vars

## Step 3: Complete DNS Setup Summary

Here's what your DNS records should look like (example):

```
Type    Name                    Value
----    ----                    -----
TXT     @                       v=spf1 include:_spf.resend.com ~all
TXT     resend._domainkey       p=... (from Resend)
TXT     _dmarc                  v=DMARC1; p=none; rua=mailto:dmarc@trakalerts.com
CNAME   @                       cname.vercel-dns.com (from Vercel)
CNAME   www                     cname.vercel-dns.com (optional)
```

**Note**: Exact values will be provided by Resend and Vercel.

## Step 4: Test Everything

### 4.1 Test Email

```bash
# After Resend verification
curl "https://trakalerts.com/api/test-email?type=confirmation&email=jkallungal22@gmail.com"
```

### 4.2 Test Website

1. Visit `https://trakalerts.com`
2. Should see your landing page
3. Try creating an alert
4. Check email inbox

### 4.3 Test Cron Job

The cron job will run automatically on Vercel. You can also test manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://trakalerts.com/api/cron/fetch-prices"
```

## Troubleshooting

### DNS Records Not Working

- Wait longer (up to 48 hours for full propagation)
- Check DNS propagation: https://dnschecker.org
- Verify records are correct (no typos)
- Some registrars require removing `@` and using just the domain name

### Resend Verification Failing

- Double-check SPF and DKIM records
- Make sure TXT records are exactly as Resend provided
- Wait for DNS propagation
- Check Resend dashboard for specific error messages

### Vercel Domain Not Working

- Verify CNAME/A records are correct
- Check Vercel dashboard for domain status
- Make sure SSL certificate is issued (automatic, may take a few minutes)

### Email Still Not Working

- Verify domain is verified in Resend dashboard (green checkmark)
- Check `FROM_EMAIL` is set to `alerts@trakalerts.com`
- Check Resend logs for delivery status
- Verify API key is correct

## Quick Setup Checklist

- [ ] Domain purchased: trakalerts.com ✅
- [ ] Add domain to Resend
- [ ] Add Resend DNS records (SPF, DKIM, DMARC)
- [ ] Wait for Resend verification
- [ ] Deploy to Vercel
- [ ] Add domain to Vercel
- [ ] Add Vercel DNS records (CNAME)
- [ ] Wait for Vercel domain verification
- [ ] Update environment variables in Vercel
- [ ] Update FROM_EMAIL to alerts@trakalerts.com
- [ ] Test email sending
- [ ] Test website
- [ ] Test cron job

## Recommended: Use Cloudflare (Free)

If your registrar's DNS is slow or limited, consider using Cloudflare:

1. Sign up at [cloudflare.com](https://cloudflare.com) (free)
2. Add your domain
3. Update nameservers at your registrar to Cloudflare's
4. Add DNS records in Cloudflare (faster, more reliable)

This gives you:
- Faster DNS propagation
- Free SSL
- Better performance
- Easy DNS management

## Current Status

Your setup:
- **Domain**: trakalerts.com ✅
- **Email**: Need to verify in Resend
- **Hosting**: Need to deploy to Vercel
- **FROM_EMAIL**: Currently using `onboarding@resend.dev` (test domain)

Once you complete the steps above, update `FROM_EMAIL` to `alerts@trakalerts.com` and you'll be production-ready!

