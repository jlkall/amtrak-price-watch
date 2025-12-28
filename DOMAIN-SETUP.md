# Quick Start: Setting Up trakalerts.com

## 🎯 Goal
Set up trakalerts.com for:
- ✅ Email sending (alerts@trakalerts.com)
- ✅ Website hosting (https://trakalerts.com)

## 📋 Step-by-Step

### Part 1: Email Setup (Resend)

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/domains
   - Click "Add Domain"
   - Enter: `trakalerts.com`
   - Click "Add Domain"

2. **Copy DNS Records**
   - Resend will show you 2-3 TXT records
   - Copy each one (SPF, DKIM, and optionally DMARC)

3. **Add DNS Records at Your Registrar**
   - Go to where you bought trakalerts.com (Namecheap, GoDaddy, etc.)
   - Find DNS Management / DNS Settings
   - Add the TXT records Resend provided
   - Save changes

4. **Wait for Verification**
   - Usually 10-30 minutes
   - Check Resend dashboard - you'll see a green checkmark when verified

5. **Update FROM_EMAIL**
   - In Vercel: Settings → Environment Variables
   - Set `FROM_EMAIL=alerts@trakalerts.com`
   - Redeploy

### Part 2: Website Hosting (Vercel)

1. **Deploy to Vercel** (if not already)
   - Push code to GitHub
   - Go to https://vercel.com
   - Import your repository
   - Deploy

2. **Add Custom Domain**
   - In Vercel: Your project → Settings → Domains
   - Click "Add Domain"
   - Enter: `trakalerts.com`
   - Vercel will show DNS records

3. **Add Vercel DNS Records**
   - At your domain registrar, add:
     - Type: `CNAME`
     - Name: `@` (or `trakalerts.com`)
     - Value: (Vercel will provide, e.g., `cname.vercel-dns.com`)

4. **Wait for Verification**
   - Usually 5-30 minutes
   - Vercel will show "Valid Configuration" when ready

5. **Update Environment Variables**
   - `NEXT_PUBLIC_BASE_URL`: `https://trakalerts.com`
   - `FROM_EMAIL`: `alerts@trakalerts.com`
   - Redeploy

## 🔍 Where Did You Buy the Domain?

**Namecheap:**
1. Domain List → trakalerts.com → Manage
2. Advanced DNS tab
3. Add records there

**GoDaddy:**
1. My Products → trakalerts.com
2. DNS tab
3. Add records

**Cloudflare (Recommended):**
1. Add site at cloudflare.com
2. Update nameservers at registrar
3. Add DNS records in Cloudflare (faster!)

## ✅ Testing

Once both are set up:

```bash
# Test email
curl "https://trakalerts.com/api/test-email?type=confirmation&email=your-email@example.com"

# Visit website
open https://trakalerts.com
```

## 🆘 Need Help?

- **Resend Issues**: Check https://resend.com/domains for verification status
- **Vercel Issues**: Check Vercel dashboard → Domains for status
- **DNS Issues**: Use https://dnschecker.org to check propagation

## 📝 Current Status

- Domain: trakalerts.com ✅
- Email: Need Resend verification
- Hosting: Need Vercel deployment
- FROM_EMAIL: Currently `onboarding@resend.dev` (test)

After setup, you'll use `alerts@trakalerts.com` for all emails!

