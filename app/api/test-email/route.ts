import { NextRequest, NextResponse } from 'next/server'
import { sendAlertConfirmationEmail, sendPriceAlertEmail } from '@/lib/email'

// Force dynamic rendering - this route requires runtime execution
export const dynamic = 'force-dynamic'

/**
 * Test endpoint for email functionality
 * 
 * GET /api/test-email?type=confirmation|alert
 * 
 * Tests email sending without creating actual alerts.
 * Useful for verifying Resend setup.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'confirmation'
  const email = searchParams.get('email') || 'test@example.com'

  // Verify Resend is configured
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      {
        error: 'RESEND_API_KEY not configured',
        message: 'Please set RESEND_API_KEY in your .env file',
        instructions: [
          '1. Sign up at https://resend.com',
          '2. Get your API key from the dashboard',
          '3. Add RESEND_API_KEY to your .env file',
          '4. Add FROM_EMAIL (must be a verified domain)',
        ],
      },
      { status: 500 }
    )
  }

  if (!process.env.FROM_EMAIL) {
    return NextResponse.json(
      {
        error: 'FROM_EMAIL not configured',
        message: 'Please set FROM_EMAIL in your .env file',
        instructions: [
          '1. Verify a domain in Resend dashboard',
          '2. Add FROM_EMAIL=alerts@yourdomain.com to .env',
        ],
      },
      { status: 500 }
    )
  }

  try {
    if (type === 'confirmation') {
      // Test confirmation email
      await sendAlertConfirmationEmail(
        email,
        'NYC → Boston',
        'December 31, 2025',
        50.00,
        '14:00',
        '20:00'
      )

      return NextResponse.json({
        success: true,
        message: 'Confirmation email sent successfully',
        email,
        type: 'confirmation',
        note: 'Check your inbox (and spam folder)',
      })
    } else if (type === 'alert') {
      // Test alert email
      await sendPriceAlertEmail(
        email,
        'test-alert-id',
        'NYC → Boston',
        new Date('2025-12-31'),
        45.00,
        50.00,
        '14:00',
        '20:00'
      )

      return NextResponse.json({
        success: true,
        message: 'Price alert email sent successfully',
        email,
        type: 'alert',
        note: 'Check your inbox (and spam folder)',
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "confirmation" or "alert"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error sending test email:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to send email',
        message: error.message,
        details: error.response?.data || error,
        troubleshooting: [
          '1. Verify RESEND_API_KEY is correct',
          '2. Verify FROM_EMAIL domain is verified in Resend',
          '3. Check Resend dashboard for error logs',
          '4. Ensure email address is valid',
        ],
      },
      { status: 500 }
    )
  }
}

