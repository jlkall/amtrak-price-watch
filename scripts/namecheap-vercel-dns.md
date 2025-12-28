# Namecheap DNS Setup for Vercel Hosting

## Current Status
Your domains `trakalerts.com` and `www.trakalerts.com` show "Invalid Configuration" in Vercel because the DNS records aren't set up yet.

## Required DNS Records for Vercel

### Record 1: Root Domain (trakalerts.com)
- **Type:** `A Record`
- **Host:** `@`
- **Value:** `216.198.79.1`
- **TTL:** `Automatic` (or `600`)

### Record 2: WWW Subdomain (www.trakalerts.com)
- **Type:** `CNAME Record`
- **Host:** `www`
- **Value:** `cname.vercel-dns.com`
- **TTL:** `Automatic` (or `600`)

**OR** use an A record:
- **Type:** `A Record`
- **Host:** `www`
- **Value:** `216.198.79.1`
- **TTL:** `Automatic`

## Step-by-Step Instructions for Namecheap

### 1. Log into Namecheap
- Go to https://www.namecheap.com
- Sign in to your account

### 2. Navigate to Domain List
- Click **"Domain List"** from the left sidebar
- Find **`trakalerts.com`** in your list
- Click **"Manage"** next to the domain

### 3. Go to Advanced DNS
- Scroll down to **"Nameservers"** section
- Make sure it's set to **"Namecheap BasicDNS"** (not Custom DNS)
- Scroll to **"Advanced DNS"** tab
- Click on it

### 4. Add A Record for Root Domain

1. **Find the "Host Records" section**
2. **Click "Add New Record"**
3. **Select:**
   - **Type:** `A Record`
   - **Host:** `@`
   - **Value:** `216.198.79.1`
   - **TTL:** `Automatic` (or leave default)
4. **Click the checkmark** to save

### 5. Add CNAME Record for WWW

1. **Click "Add New Record"** again
2. **Select:**
   - **Type:** `CNAME Record`
   - **Host:** `www`
   - **Value:** `cname.vercel-dns.com`
   - **TTL:** `Automatic` (or leave default)
3. **Click the checkmark** to save

**OR** if CNAME doesn't work, use A record:
- **Type:** `A Record`
- **Host:** `www`
- **Value:** `216.198.79.1`

### 6. Remove Conflicting Records

- If you see any existing A or CNAME records for `@` or `www` that conflict, delete them first
- Only keep the records you just added

### 7. Save Changes

- Click **"Save All Changes"** at the top right
- Wait for confirmation

## Verification

### Wait for DNS Propagation
- DNS changes can take **10-30 minutes** to propagate
- Sometimes up to 48 hours (rare)

### Check in Vercel
1. Go back to Vercel: **Settings → Domains**
2. Click **"Refresh"** next to `trakalerts.com`
3. Status should change from "Invalid Configuration" to "Valid Configuration" (green checkmark)

### Test the Domain
- Once valid, visit: `https://trakalerts.com`
- It should load your Amtrak Price Watch app

## Troubleshooting

### Still showing "Invalid Configuration" after 30 minutes?

1. **Check DNS propagation:**
   ```bash
   # In terminal, check if DNS is resolving:
   dig trakalerts.com
   # Should show 216.198.79.1
   ```

2. **Verify records in Namecheap:**
   - Go back to Advanced DNS
   - Make sure the A record shows exactly:
     - Host: `@`
     - Value: `216.198.79.1`

3. **Check for typos:**
   - Make sure the IP is exactly `216.198.79.1` (no spaces, no extra characters)

4. **Try refreshing in Vercel:**
   - Click "Refresh" button multiple times
   - Sometimes Vercel needs a few minutes to detect changes

5. **Clear browser cache:**
   - Try accessing the domain in incognito/private mode

## Important Notes

- **Keep existing Resend DNS records:** Don't delete the TXT records you added earlier for email (SPF, DKIM, DMARC)
- **Both domains:** `trakalerts.com` and `www.trakalerts.com` should work after setup
- **SSL Certificate:** Vercel will automatically provision SSL certificates once DNS is valid

## Summary

You need to add **2 DNS records** in Namecheap:
1. **A Record:** `@` → `216.198.79.1` (for trakalerts.com)
2. **CNAME Record:** `www` → `cname.vercel-dns.com` (for www.trakalerts.com)

After adding these and waiting 10-30 minutes, click "Refresh" in Vercel and the domains should show as "Valid Configuration".

