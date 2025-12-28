# Quick Database Setup (5 Minutes)

## The Problem
Your app is trying to connect to a database, but `DATABASE_URL` is set to `file:./dev.db` (SQLite), which doesn't work on Vercel serverless.

## Solution: Create Vercel Postgres (Free Tier Available)

### Step 1: Create Database (2 minutes)

1. **Go to Vercel Dashboard:**
   - Open: https://vercel.com/dashboard
   - Click on your project: **`amtrak-price-watch`**

2. **Navigate to Storage:**
   - Click **"Storage"** in the top navigation bar
   - Click **"Create Database"** button

3. **Select Postgres:**
   - Choose **"Postgres"** from the options
   - **Name:** `amtrak-db` (or any name you like)
   - **Region:** Choose closest to you (e.g., `us-east-1`)
   - Click **"Create"**

4. **Wait for Setup:**
   - Vercel will create the database (takes ~30 seconds)
   - You'll see a success message

### Step 2: Get Connection String (1 minute)

1. **After database is created:**
   - You'll see the database details page
   - Look for **"Connection String"** section
   - Click **"Copy"** next to the connection string
   - It looks like: `postgres://default:xxxxx@xxxxx.aws.neon.tech:5432/verceldb?sslmode=require`

### Step 3: Update Environment Variable (1 minute)

1. **Go to Environment Variables:**
   - In your project, click **"Settings"** tab
   - Click **"Environment Variables"** in the left sidebar

2. **Update DATABASE_URL:**
   - Find `DATABASE_URL` in the list
   - Click **"Edit"** (or delete and recreate)
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the Postgres connection string you copied
   - **Environments:** Select all (Production, Preview, Development)
   - **Sensitive:** ✅ Enable this toggle
   - Click **"Save"**

### Step 4: Run Migrations (1 minute)

1. **Wait for Redeploy:**
   - Vercel will automatically redeploy after you save the env var
   - Wait ~1-2 minutes for deployment to complete

2. **Visit Seed Endpoint:**
   - Open: `https://amtrak-price-watch.vercel.app/api/seed`
   - This creates all database tables
   - You should see: `{"message":"Database seeded successfully"}`

3. **Verify:**
   - Visit: `https://amtrak-price-watch.vercel.app/api/alerts`
   - Should return JSON with routes and holidays (not an error)

### Step 5: Test Alert Creation

1. **Go to Create Alert Page:**
   - Visit: `https://amtrak-price-watch.vercel.app/alerts/create`

2. **Fill Out Form:**
   - Email: Your email
   - From: New York City
   - To: Boston
   - Date: Any future date
   - Price: 50
   - Click **"Create Alert"**

3. **Should Work!**
   - Should redirect to confirmation page
   - No more "Database connection failed" error

## Troubleshooting

### "Database connection failed" still showing?

1. **Check DATABASE_URL:**
   - Go to Settings → Environment Variables
   - Make sure `DATABASE_URL` starts with `postgres://`
   - Not `file:./dev.db`

2. **Check Deployment:**
   - Go to Deployments tab
   - Make sure latest deployment succeeded
   - If failed, check build logs

3. **Try Seed Endpoint:**
   - Visit `/api/seed` again
   - If it fails, check Vercel logs for error details

### "Tables don't exist" error?

- Visit `/api/seed` to create tables
- Should work after database is set up

### Still having issues?

- Check Vercel logs: **Logs** tab in your project
- Look for Prisma errors
- Common issues:
  - Wrong connection string format
  - Database not fully created yet
  - Network/firewall blocking connection

## Alternative: Use Supabase (If Vercel Postgres Has Issues)

1. **Create Supabase Account:**
   - Go to https://supabase.com
   - Sign up (free tier)
   - Create new project

2. **Get Connection String:**
   - Settings → Database
   - Copy "Connection string" → "URI"
   - Replace `[YOUR-PASSWORD]` with your database password

3. **Update DATABASE_URL:**
   - Same as Step 3 above, but use Supabase connection string

4. **Run Migrations:**
   - Same as Step 4 above

## Summary

**What you need to do:**
1. ✅ Create Vercel Postgres database
2. ✅ Copy connection string
3. ✅ Update `DATABASE_URL` env var
4. ✅ Visit `/api/seed` to create tables
5. ✅ Test creating an alert

**Time needed:** ~5 minutes

**Cost:** Free tier available for both Vercel Postgres and Supabase

