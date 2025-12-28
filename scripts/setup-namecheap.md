# Setting Up trakalerts.com on Namecheap

Step-by-step guide for configuring trakalerts.com purchased from Namecheap.

## Part 1: Email Setup (Resend)

### Step 1: Add Domain to Resend

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter: `trakalerts.com`
4. Click "Add Domain"
5. Resend will show you DNS records to add

### Step 2: Add DNS Records in Namecheap

1. **Log into Namecheap**
   - Go to https://www.namecheap.com
   - Sign in to your account

2. **Navigate to Domain List**
   - Click "Domain List" in the left sidebar
   - Find `trakalerts.com`
   - Click "Manage" next to it

3. **Go to Advanced DNS**
   - Click the "Advanced DNS" tab
   - Scroll down to "Host Records" section

4. **Add Resend DNS Records**

   You'll need to add these records (Resend will provide exact values):

   **Record 1: SPF (TXT)**
   - Type: `TXT Record`
   - Host: `@`
   - Value: `v=spf1 include:_spf.resend.com ~all`
   - TTL: `Automatic` (or `600`)
   - Click "Add New Record"

   **Record 2: DKIM (TXT)**
   - Type: `TXT Record`
   - Host: `default._domainkey` (Note: Resend uses "default" not "resend")
   - Value: `v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvipI+wj2GB9nJ9uZ9Hy5ID0/ebqht0QGYM8M1Wfr/AAQE2CMBd33ClYsc70+jnnPlzRdDogjyuucTKeR+4Ax4+w8kKe8mtRddvAwUblOa10RaBcMiK8Z3cj6CsjyhvZcWoGKwamTj7EzYyF0aGzQb1seRQ7at6sqIqNPHyCheNYqzyWahc1zUjlMtcogIuIChK/kFMAiyrUcvz2FUC4KVnUkCHNmrnMYUIdJHDW2iaYm2Scgobtelxihq6P6WWIAZ938hESl8Hb+EfKSvKXiSJtPtFE2C+Lkja6CtXePuheiwr9J+toIKSMtUx6wiMb6QvaNgo8FRZ+Q09ZXR8rsvQIDAQAB`
     - **Important**: Copy the ENTIRE value starting with `v=DKIM1` (it's all one line, no spaces)
     - Ignore the "BEGIN PUBLIC KEY" / "END PUBLIC KEY" parts - those are not for DNS
   - TTL: `Automatic`
   - Click "Add New Record"

   **Record 3: DMARC (TXT) - Optional but recommended**
   - Type: `TXT Record`
   - Host: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@trakalerts.com`
   - TTL: `Automatic`
   - Click "Add New Record"

5. **Save Changes**
   - Click the green checkmark or "Save All Changes"
   - DNS changes usually take 5-30 minutes to propagate

6. **Verify in Resend**
   - Go back to Resend dashboard
   - Wait for verification (green checkmark)
   - Usually takes 10-30 minutes

### Step 3: Update FROM_EMAIL

Once verified in Resend:
- In Vercel: Settings → Environment Variables
- Update `FROM_EMAIL` to `alerts@trakalerts.com`
- Redeploy

## Part 2: Website Hosting (Vercel)

### Step 1: Deploy to Vercel (if not already)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Deploy (Vercel auto-detects Next.js)

### Step 2: Add Domain in Vercel

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Click "Add Domain"
4. Enter: `trakalerts.com`
5. Click "Add"

Vercel will show you DNS records to add.

### Step 3: Add Vercel DNS Records in Namecheap

1. **Go back to Namecheap**
   - Domain List → trakalerts.com → Manage
   - Advanced DNS tab

2. **Add CNAME Record for Root Domain**

   **Option A: Using CNAME (Recommended)**
   - Type: `CNAME Record`
   - Host: `@`
   - Value: (Vercel will provide, e.g., `cname.vercel-dns.com`)
   - TTL: `Automatic`
   - Click "Add New Record"

   **Note**: Some registrars don't allow CNAME on root (@). If Namecheap doesn't allow it:

   **Option B: Using A Record**
   - Type: `A Record`
   - Host: `@`
   - Value: `76.76.21.21` (Vercel will provide the actual IP)
   - TTL: `Automatic`
   - Click "Add New Record"

3. **Add www Subdomain (Optional)**
   - Type: `CNAME Record`
   - Host: `www`
   - Value: (Same as root domain - Vercel will provide)
   - TTL: `Automatic`
   - Click "Add New Record"

4. **Save Changes**
   - Click "Save All Changes"
   - Wait 5-30 minutes for DNS propagation

5. **Verify in Vercel**
   - Go back to Vercel dashboard
   - Check domain status - should show "Valid Configuration"
   - SSL certificate will be issued automatically

### Step 4: Update Environment Variables

1. In Vercel: Your project → Settings → Environment Variables
2. Add/Update:
   - `NEXT_PUBLIC_BASE_URL`: `https://trakalerts.com`
   - `FROM_EMAIL`: `alerts@trakalerts.com` (after Resend verification)
   - `RESEND_API_KEY`: `re_Xz7EoTgz_HggZx4vMGAGbiUaHa9CvQsMp`
   - `CRON_SECRET`: (generate a random secret)
   - `DATABASE_URL`: (Vercel will provide, or use Postgres)

3. **Redeploy** after adding env vars

## Complete DNS Setup Summary

Your Namecheap DNS records should look like this:

```
Type    Host                    Value
----    ----                    -----
TXT     @                       v=spf1 include:_spf.resend.com ~all
TXT     resend._domainkey       p=... (from Resend)
TXT     _dmarc                  v=DMARC1; p=none; rua=mailto:dmarc@trakalerts.com
CNAME   @                       cname.vercel-dns.com (from Vercel)
CNAME   www                     cname.vercel-dns.com (optional)
```

**Note**: Exact values will be provided by Resend and Vercel.

## Namecheap-Specific Tips

1. **TTL Settings**: Use "Automatic" (usually 600 seconds) for faster updates
2. **Record Limits**: Namecheap allows up to 50 host records
3. **Propagation**: Usually 5-30 minutes, can take up to 48 hours
4. **CNAME on Root**: If Namecheap doesn't allow CNAME on `@`, use A record instead
5. **Editing Records**: Click the pencil icon to edit, trash icon to delete

## Testing

### Test Email (after Resend verification):
```bash
curl "https://trakalerts.com/api/test-email?type=confirmation&email=jkallungal22@gmail.com"
```

### Test Website:
- Visit: https://trakalerts.com
- Should see your landing page
- Try creating an alert

### Check DNS Propagation:
- Visit: https://dnschecker.org
- Enter: `trakalerts.com`
- Check TXT and CNAME records are propagating

## Troubleshooting

### "CNAME not allowed on root domain"
- Use A record instead of CNAME for `@`
- Vercel will provide the IP address

### "DNS records not showing up"
- Wait longer (up to 48 hours)
- Check for typos in records
- Make sure you saved changes in Namecheap
- Use dnschecker.org to verify propagation

### "Resend verification failing"
- Double-check TXT records match exactly what Resend provided
- Make sure SPF and DKIM records are both added
- Wait for DNS propagation (can take up to 48 hours)

### "Vercel domain not working"
- Verify CNAME/A record is correct
- Check Vercel dashboard for domain status
- Wait for SSL certificate to be issued (automatic, may take a few minutes)

## Quick Checklist

- [ ] Added trakalerts.com to Resend
- [ ] Added SPF record (TXT) in Namecheap
- [ ] Added DKIM record (TXT) in Namecheap
- [ ] Added DMARC record (TXT) in Namecheap - optional
- [ ] Resend domain verified (green checkmark)
- [ ] Deployed to Vercel
- [ ] Added trakalerts.com to Vercel
- [ ] Added CNAME/A record for Vercel in Namecheap
- [ ] Vercel domain verified
- [ ] Updated environment variables in Vercel
- [ ] Updated FROM_EMAIL to alerts@trakalerts.com
- [ ] Tested email sending
- [ ] Tested website

## Current Status

- ✅ Domain: trakalerts.com (Namecheap)
- ⏳ Email: Need to add DNS records and verify in Resend
- ⏳ Hosting: Need to deploy to Vercel and add domain
- 📧 FROM_EMAIL: Currently `onboarding@resend.dev` (will change to `alerts@trakalerts.com`)

Once complete, your app will be live at https://trakalerts.com with professional email addresses!

