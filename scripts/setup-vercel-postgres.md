# Setting Up Vercel Postgres for Amtrak Price Watch

## Problem
SQLite files (`file:./dev.db`) don't work on Vercel serverless functions because:
- Each function invocation gets a fresh filesystem
- Files don't persist between invocations
- The database file gets wiped on every deployment

## Solution: Use Vercel Postgres

### Step 1: Create Vercel Postgres Database

1. **Go to Vercel Dashboard**
   - Navigate to your project: `amtrak-price-watch`
   - Click on **"Storage"** in the top navigation
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Choose a name (e.g., `amtrak-db`)
   - Select a region (choose closest to your users)
   - Click **"Create"**

2. **Get Connection String**
   - After creation, Vercel will show you the connection details
   - Copy the **"Connection String"** (looks like: `postgres://...`)

### Step 2: Update Environment Variables

1. **Go to:** Settings → Environment Variables
2. **Update `DATABASE_URL`:**
   - Key: `DATABASE_URL`
   - Value: Paste the Postgres connection string from Step 1
   - Environments: All Environments
   - Sensitive: ✅ **YES** (enable toggle)
   - Click **"Save"**

3. **Update `NEXT_PUBLIC_BASE_URL`:**
   - Key: `NEXT_PUBLIC_BASE_URL`
   - Value: Your Vercel deployment URL (e.g., `https://amtrak-price-watch-XXXX.vercel.app`)
   - Or use `https://trakalerts.com` after domain setup
   - Click **"Save"**

### Step 3: Update Prisma Schema

The schema needs to support both SQLite (local dev) and Postgres (Vercel).

**Option A: Use Postgres for both (Recommended)**
- Update `prisma/schema.prisma` to use `provider = "postgresql"`
- Run migrations locally with Postgres
- Deploy to Vercel

**Option B: Keep SQLite for local, Postgres for production**
- Use environment-based provider selection (more complex)

### Step 4: Run Migrations

After updating the database URL:

1. **Locally (if using Postgres):**
   ```bash
   npx prisma migrate deploy
   ```

2. **On Vercel:**
   - Vercel will automatically run migrations if you add a build script
   - Or run manually via API route: `/api/seed`

### Step 5: Seed the Database

1. **Via API (after deployment):**
   - Visit: `https://your-app.vercel.app/api/seed`
   - This will create routes and holidays

2. **Or manually via Vercel Dashboard:**
   - Go to Storage → Your Database → Data
   - Manually insert routes and holidays

## Quick Migration Script

I'll create a migration guide that updates your schema to support Postgres.

## Alternative: Use a Different Database Service

If you prefer not to use Vercel Postgres, you can use:
- **Supabase** (free tier available)
- **Neon** (serverless Postgres, free tier)
- **PlanetScale** (MySQL, free tier)
- **Railway** (Postgres, free tier)

Just update the `DATABASE_URL` with the connection string from your chosen service.

