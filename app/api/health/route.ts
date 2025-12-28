import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Health check endpoint to diagnose database connection issues
 * GET /api/health
 */
export async function GET() {
  const health: any = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    checks: {},
  }

  // Check DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    health.status = 'error'
    health.checks.databaseUrl = {
      status: 'missing',
      message: 'DATABASE_URL environment variable is not set',
    }
    return NextResponse.json(health, { status: 500 })
  }

  health.checks.databaseUrl = {
    status: 'set',
    preview: `${process.env.DATABASE_URL.substring(0, 30)}...`,
    isSqlite: process.env.DATABASE_URL.startsWith('file:'),
    warning: process.env.DATABASE_URL.startsWith('file:') 
      ? 'SQLite files do not work on Vercel serverless. Use Postgres instead.'
      : null,
  }

  // Check if it's SQLite (won't work on Vercel)
  if (process.env.DATABASE_URL.startsWith('file:')) {
    health.status = 'error'
    health.checks.databaseConnection = {
      status: 'invalid',
      message: 'DATABASE_URL points to SQLite file, which does not work on Vercel',
      solution: 'Create Vercel Postgres database and update DATABASE_URL',
    }
    return NextResponse.json(health, { status: 500 })
  }

  // Try to connect to database
  try {
    await prisma.$connect()
    health.checks.databaseConnection = {
      status: 'connected',
      message: 'Successfully connected to database',
    }

    // Try a simple query
    try {
      await prisma.$queryRaw`SELECT 1`
      health.checks.databaseQuery = {
        status: 'working',
        message: 'Database queries are working',
      }
    } catch (queryError: any) {
      health.checks.databaseQuery = {
        status: 'error',
        message: queryError.message,
        code: queryError.code,
      }
    }

    // Check if tables exist
    try {
      const tableCount = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `
      health.checks.databaseTables = {
        status: tableCount[0]?.count > 0 ? 'exists' : 'missing',
        count: tableCount[0]?.count || 0,
        message: tableCount[0]?.count === 0
          ? 'No tables found. Visit /api/seed to create them.'
          : `${tableCount[0]?.count} tables found`,
      }
    } catch (tableError: any) {
      health.checks.databaseTables = {
        status: 'error',
        message: tableError.message,
      }
    }

    health.status = 'healthy'
    return NextResponse.json(health, { status: 200 })
  } catch (dbError: any) {
    health.status = 'error'
    health.checks.databaseConnection = {
      status: 'failed',
      message: dbError.message,
      code: dbError.code,
      hint: dbError.code === 'P1001' 
        ? 'Database server is not reachable. Check your connection string.'
        : dbError.code === 'P1000'
        ? 'Authentication failed. Check your credentials.'
        : 'Check your DATABASE_URL connection string format.',
    }
    return NextResponse.json(health, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

