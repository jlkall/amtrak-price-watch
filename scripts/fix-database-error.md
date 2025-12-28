# Fixing 500 Error on Alert Creation

## Problem
You're getting a `500 Internal Server Error` when trying to create an alert. This is almost certainly because the database isn't set up yet.

## Quick Fix Steps

### Option 1: Set Up Vercel Postgres (Recommended)

1. **Create Postgres Database in Vercel:**
   - Go to your Vercel project dashboard
   - Click **"Storage"** in the top navigation
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Name it (e.g., `amtrak-db`)
   - Choose a region
   - Click **"Create"**

2. **Copy Connection String:**
   - After creation, Vercel will show you the connection string
   - It looks like: `postgres://user:password@host:port/database?sslmode=require`

3. **Update Environment Variable:**
   - Go to **Settings → Environment Variables**
   - Find `DATABASE_URL`
   - Update the value to the Postgres connection string
   - Make sure it's marked as **Sensitive**
   - Click **"Save"**

4. **Run Migrations:**
   - Visit: `https://your-app.vercel.app/api/seed`
   - This will create all the database tables and seed initial data
   - You should see a success message

5. **Test Again:**
   - Go back to `/alerts/create`
   - Try creating an alert again
   - It should work now!

### Option 2: Use Supabase (Free Alternative)

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Sign up (free tier available)
   - Create a new project
   - Wait for it to finish setting up

2. **Get Connection String:**
   - Go to **Settings → Database**
   - Scroll to **"Connection string"**
   - Copy the **"URI"** connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

3. **Update Environment Variable:**
   - In Vercel: **Settings → Environment Variables**
   - Update `DATABASE_URL` with the Supabase connection string
   - Click **"Save"**

4. **Run Migrations:**
   - Visit: `https://your-app.vercel.app/api/seed`
   - This creates the tables

5. **Test Again:**
   - Try creating an alert - should work!

## Verify Database is Working

After setting up the database, you can verify it's working:

1. **Check API Seed Endpoint:**
   ```
   https://your-app.vercel.app/api/seed
   ```
   Should return: `{ "message": "Database seeded successfully" }`

2. **Check Routes Endpoint:**
   ```
   https://your-app.vercel.app/api/alerts
   ```
   Should return JSON with routes and holidays

3. **Try Creating Alert:**
   - Go to `/alerts/create`
   - Fill out the form
   - Submit
   - Should redirect to confirmation page

## Common Errors

### "Database connection failed"
- **Cause:** `DATABASE_URL` is incorrect or database isn't accessible
- **Fix:** Double-check the connection string, make sure database is running

### "Database tables not found"
- **Cause:** Migrations haven't been run
- **Fix:** Visit `/api/seed` to create tables

### "P1001: Can't reach database server"
- **Cause:** Database server is down or connection string is wrong
- **Fix:** Check your database provider status, verify connection string

## Current Status Check

To see what's wrong, check the Vercel logs:

1. Go to **Vercel Dashboard → Your Project → Logs**
2. Look for recent errors
3. The error message will tell you exactly what's wrong

## Summary

The 500 error is happening because:
1. ❌ Database isn't set up (no Postgres database created)
2. ❌ `DATABASE_URL` is still set to `file:./dev.db` (SQLite doesn't work on Vercel)
3. ❌ Database tables don't exist (migrations not run)

**Fix:** Set up Vercel Postgres (or Supabase), update `DATABASE_URL`, and run `/api/seed`.

