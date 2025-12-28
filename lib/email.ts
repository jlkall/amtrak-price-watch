import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not set - emails will not be sent')
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.FROM_EMAIL || 'alerts@example.com'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function sendAlertConfirmationEmail(
  email: string,
  routeLabel: string,
  dateLabel: string,
  priceThreshold: number,
  preferredTimeStart?: string | null,
  preferredTimeEnd?: string | null
) {
  if (!resend) {
    console.log('Resend not configured - skipping email')
    return
  }

  const timeWindow = preferredTimeStart && preferredTimeEnd
    ? `${preferredTimeStart} - ${preferredTimeEnd}`
    : 'Any time'

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Amtrak Price Alert Confirmation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
            .alert-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0066cc; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Price Alert Created ✓</h1>
            </div>
            <div class="content">
              <p>Great! Your price alert has been set up successfully. We'll monitor Amtrak prices daily and notify you when coach tickets drop below your threshold.</p>
              
              <div class="alert-details">
                <div class="detail-row">
                  <span class="label">Route:</span> ${routeLabel}
                </div>
                <div class="detail-row">
                  <span class="label">Travel Date:</span> ${dateLabel}
                </div>
                <div class="detail-row">
                  <span class="label">Price Threshold:</span> $${priceThreshold.toFixed(2)}
                </div>
                <div class="detail-row">
                  <span class="label">Preferred Time:</span> ${timeWindow}
                </div>
              </div>

              <p><strong>What happens next?</strong></p>
              <ul>
                <li>We check prices once per day</li>
                <li>You'll receive an email when coach tickets drop to or below $${priceThreshold.toFixed(2)}</li>
                <li>If you set a preferred time window, we'll prioritize trains within that range</li>
              </ul>
            </div>
            <div class="footer">
              <p>You can manage your alerts at any time. Look for unsubscribe links in alert emails.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Price Alert Created ✓

Great! Your price alert has been set up successfully.

Alert Details:
- Route: ${routeLabel}
- Travel Date: ${dateLabel}
- Price Threshold: $${priceThreshold.toFixed(2)}
- Preferred Time: ${timeWindow}

What happens next?
- We check prices once per day
- You'll receive an email when coach tickets drop to or below $${priceThreshold.toFixed(2)}
- If you set a preferred time window, we'll prioritize trains within that range

You can manage your alerts at any time. Look for unsubscribe links in alert emails.
      `,
    })
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    throw error
  }
}

export async function sendPriceAlertEmail(
  email: string,
  alertId: string,
  routeLabel: string,
  travelDate: Date,
  currentPrice: number,
  priceThreshold: number,
  preferredTimeStart?: string | null,
  preferredTimeEnd?: string | null
) {
  if (!resend) {
    console.log('Resend not configured - skipping email')
    return
  }

  const unsubscribeUrl = `${BASE_URL}/api/alerts/${alertId}/unsubscribe`
  // Generate Amtrak booking URL (approximate - would need actual route codes)
  const amtrakUrl = 'https://www.amtrak.com/home.html'
  const savings = priceThreshold - currentPrice
  const savingsPercent = ((savings / priceThreshold) * 100).toFixed(0)

  const timeWindow = preferredTimeStart && preferredTimeEnd
    ? `${preferredTimeStart} - ${preferredTimeEnd}`
    : null

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 Price Alert: ${routeLabel} - $${currentPrice.toFixed(2)} (Save $${savings.toFixed(2)})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0066cc 0%, #004499 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
            .price-box { background-color: #e8f5e9; border: 2px solid #4caf50; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px; }
            .current-price { font-size: 36px; font-weight: bold; color: #2e7d32; margin: 10px 0; }
            .savings { color: #1b5e20; font-size: 18px; }
            .alert-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0066cc; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .cta-button { display: inline-block; background-color: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            .unsubscribe { color: #999; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Price Alert Triggered!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Great news - prices have dropped!</p>
            </div>
            <div class="content">
              <div class="price-box">
                <div style="color: #555; font-size: 14px;">Current Price</div>
                <div class="current-price">$${currentPrice.toFixed(2)}</div>
                <div class="savings">You're saving $${savings.toFixed(2)} (${savingsPercent}% below your threshold!)</div>
              </div>

              <div class="alert-details">
                <div class="detail-row">
                  <span class="label">Route:</span> ${routeLabel}
                </div>
                <div class="detail-row">
                  <span class="label">Travel Date:</span> ${travelDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div class="detail-row">
                  <span class="label">Your Threshold:</span> $${priceThreshold.toFixed(2)}
                </div>
                ${timeWindow ? `<div class="detail-row"><span class="label">Preferred Time:</span> ${timeWindow}</div>` : ''}
              </div>

              <div style="text-align: center;">
                <a href="${amtrakUrl}" class="cta-button">Book Now on Amtrak →</a>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                <strong>Note:</strong> Prices can change quickly. Book soon to secure this price!
              </p>
            </div>
            <div class="footer">
              <p>
                <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe from this alert</a>
              </p>
              <p style="margin-top: 10px;">This alert will remain active. You'll receive another notification if prices drop further.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🎉 Price Alert Triggered!

Great news! The price for your selected route has dropped below your threshold.

Current Price: $${currentPrice.toFixed(2)}
Your Threshold: $${priceThreshold.toFixed(2)}
You're saving: $${savings.toFixed(2)} (${savingsPercent}% below your threshold!)

Route: ${routeLabel}
Travel Date: ${travelDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
${timeWindow ? `Preferred Time: ${timeWindow}\n` : ''}

Book now: ${amtrakUrl}

Note: Prices can change quickly. Book soon to secure this price!

Unsubscribe: ${unsubscribeUrl}

This alert will remain active. You'll receive another notification if prices drop further.
      `,
    })
  } catch (error) {
    console.error('Error sending price alert email:', error)
    throw error
  }
}

