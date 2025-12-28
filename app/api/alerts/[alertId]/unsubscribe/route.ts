import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Unsubscribe from an alert
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  try {
    const { alertId } = await params

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }

    // Deactivate the alert
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'Successfully unsubscribed',
      alert: {
        id: alert.id,
        email: alert.email,
      },
    })
  } catch (error: any) {
    console.error('Error unsubscribing:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}

// GET: Show unsubscribe confirmation page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  const { alertId } = await params

  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        route: true,
        holiday: true,
      },
    })

    if (!alert) {
      return new NextResponse('Alert not found', { status: 404 })
    }

    if (!alert.isActive) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Unsubscribed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px;">
          <h1>Already Unsubscribed</h1>
          <p>This alert has already been unsubscribed.</p>
        </body>
        </html>
        `,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Return HTML page for unsubscribe confirmation
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px;">
        <h1>Unsubscribe from Price Alert</h1>
        <p>You are subscribed to:</p>
        <ul>
          <li><strong>Route:</strong> ${alert.route.label}</li>
          <li><strong>Holiday:</strong> ${alert.holiday.name}</li>
          <li><strong>Email:</strong> ${alert.email}</li>
        </ul>
        <form method="POST" style="margin-top: 20px;">
          <button type="submit" style="background-color: #dc2626; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
            Unsubscribe
          </button>
        </form>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (error) {
    console.error('Error loading unsubscribe page:', error)
    return new NextResponse('Error loading page', { status: 500 })
  }
}

