import { NextRequest, NextResponse } from 'next/server'
import {
  verifyResendWebhookSignature,
  processResendWebhookEvent,
  type ResendWebhookEvent,
} from '@/lib/email/resend-webhook'

// ============================================
// CONFIGURATION
// ============================================

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || ''

// Allowed event types for processing
const ALLOWED_EVENTS = new Set([
  'email.sent',
  'email.delivered',
  'email.delivery_delayed',
  'email.opened',
  'email.clicked',
  'email.bounced',
  'email.complained',
])

// ============================================
// WEBHOOK HANDLER
// ============================================

/**
 * POST /api/webhooks/resend
 * Handles incoming webhooks from Resend for email event tracking
 *
 * @see https://resend.com/docs/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text()

    // Verify signature in production
    if (process.env.NODE_ENV === 'production' || RESEND_WEBHOOK_SECRET) {
      const signature = request.headers.get('svix-signature') ||
                        request.headers.get('resend-signature')

      if (!verifyResendWebhookSignature(rawBody, signature, RESEND_WEBHOOK_SECRET)) {
        console.error('Resend webhook signature verification failed')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Parse the event
    let event: ResendWebhookEvent
    try {
      event = JSON.parse(rawBody) as ResendWebhookEvent
    } catch {
      console.error('Failed to parse Resend webhook payload')
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Validate event structure
    if (!event.type || !event.data || !event.data.email_id) {
      console.error('Invalid Resend webhook event structure:', event)
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      )
    }

    // Check if this is an event type we handle
    if (!ALLOWED_EVENTS.has(event.type)) {
      console.log(`Ignoring unhandled Resend event type: ${event.type}`)
      return NextResponse.json(
        { received: true, message: `Event type ${event.type} ignored` },
        { status: 200 }
      )
    }

    // Process the event
    const result = await processResendWebhookEvent(event)

    if (!result.success) {
      console.error('Failed to process Resend webhook:', result.error)
      // Still return 200 to prevent Resend from retrying indefinitely
      // The error is logged and can be investigated
      return NextResponse.json(
        {
          received: true,
          processed: false,
          error: result.error,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        received: true,
        processed: true,
        event_type: result.event_type,
        email_id: result.email_id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in Resend webhook handler:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * GET /api/webhooks/resend
 * Health check endpoint for monitoring
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    webhook: 'resend',
    configured: !!RESEND_WEBHOOK_SECRET,
    timestamp: new Date().toISOString(),
  })
}
