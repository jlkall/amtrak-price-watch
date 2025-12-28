#!/bin/bash

# Quick email test script
# Usage: ./scripts/test-email.sh [email] [type]

EMAIL=${1:-"test@example.com"}
TYPE=${2:-"confirmation"}

echo "🧪 Testing email service..."
echo "   Email: $EMAIL"
echo "   Type: $TYPE"
echo ""

if [ -z "$EMAIL" ] || [ "$EMAIL" == "test@example.com" ]; then
  echo "⚠️  Please provide your email address:"
  echo "   ./scripts/test-email.sh your-email@example.com"
  exit 1
fi

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ Server not running. Start with: npm run dev"
  exit 1
fi

# Test email
echo "📧 Sending test email..."
RESPONSE=$(curl -s "http://localhost:3000/api/test-email?type=$TYPE&email=$EMAIL")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Email sent successfully!"
  echo ""
  echo "Check your inbox at: $EMAIL"
  echo "(Also check spam folder)"
else
  echo "❌ Failed to send email"
  echo ""
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check RESEND_API_KEY in .env"
  echo "  2. Check FROM_EMAIL in .env"
  echo "  3. Verify domain in Resend dashboard"
  echo "  4. See scripts/setup-email.md for details"
fi

