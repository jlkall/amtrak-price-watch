# How to Find DKIM Value in Resend

## Step-by-Step

1. **Go to Resend Domains**
   - Visit: https://resend.com/domains
   - Make sure you've added `trakalerts.com` (click "Add Domain" if not)

2. **Click on Your Domain**
   - In the domains list, click on `trakalerts.com` (the domain name itself)
   - This opens the domain details page

3. **Find DKIM Section**
   - You should see a section labeled "DKIM" or "DNS Records"
   - The DKIM value is a very long string starting with `p=`
   - It looks like: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...` (200+ characters)

4. **Copy the Entire Value**
   - Click the copy button next to the DKIM value, OR
   - Select and copy the entire text (it's all one line, no spaces)

## If You Don't See DKIM Yet

**Option 1: Wait a Few Seconds**
- Sometimes Resend takes 10-30 seconds to generate the DKIM value
- Refresh the page
- Click on the domain again

**Option 2: Check Domain Status**
- Make sure the domain shows as "Pending" or "Unverified" (not an error)
- If there's an error, try removing and re-adding the domain

**Option 3: Look in Different Location**
- Some Resend interfaces show it under "DNS Records" tab
- Or in a "Verification" section
- Check all tabs/sections on the domain details page

## What the DKIM Value Looks Like

It's a very long string, typically:
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (continues for 200+ characters)
```

**Important**: Copy the ENTIRE value, including the `p=` part at the beginning.

## Alternative: Check Email from Resend

Sometimes Resend sends an email with the DNS records. Check your inbox for an email from Resend with subject like "Verify your domain" or "DNS Records for trakalerts.com"

## Still Can't Find It?

1. Make sure you're logged into the correct Resend account
2. Check that `trakalerts.com` is actually in your domains list
3. Try removing and re-adding the domain
4. Contact Resend support if still not showing

