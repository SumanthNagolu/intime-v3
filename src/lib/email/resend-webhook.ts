import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ============================================
// RESEND WEBHOOK TYPES
// ============================================

// Resend Webhook Event Types
export type ResendWebhookEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.opened'
  | 'email.clicked'
  | 'email.bounced'
  | 'email.complained'

// Base event data from Resend
export interface ResendWebhookEventData {
  created_at: string
  email_id: string
  from: string
  to: string[]
  subject: string
  headers?: { name: string; value: string }[]
}

// Bounce-specific data
export interface ResendBounceData extends ResendWebhookEventData {
  bounce?: {
    type: 'hard' | 'soft'
    message: string
  }
}

// Click-specific data
export interface ResendClickData extends ResendWebhookEventData {
  click?: {
    link: string
    timestamp: string
    user_agent: string
    ip_address: string
  }
}

// Open-specific data
export interface ResendOpenData extends ResendWebhookEventData {
  open?: {
    timestamp: string
    user_agent: string
    ip_address: string
  }
}

// Full webhook event structure
export interface ResendWebhookEvent {
  type: ResendWebhookEventType
  created_at: string
  data: ResendWebhookEventData | ResendBounceData | ResendClickData | ResendOpenData
}

// Processing result
export interface WebhookProcessResult {
  success: boolean
  event_type: ResendWebhookEventType
  email_id: string
  message?: string
  error?: string
}

// ============================================
// SERVICE CONFIGURATION
// ============================================

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================

/**
 * Verify the Resend webhook signature
 * @see https://resend.com/docs/webhooks#verify-requests
 */
export function verifyResendWebhookSignature(
  payload: string,
  signature: string | null,
  webhookSecret: string
): boolean {
  if (!signature || !webhookSecret) {
    console.warn('Missing signature or webhook secret for Resend webhook verification')
    return false
  }

  // Resend uses HMAC SHA-256 for signing
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')

  try {
    // Use timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    // If buffers are different lengths, comparison fails
    return false
  }
}

// ============================================
// STATUS MAPPING
// ============================================

/**
 * Map Resend event types to our email_sends status values
 */
function mapEventToStatus(eventType: ResendWebhookEventType): string {
  const statusMap: Record<ResendWebhookEventType, string> = {
    'email.sent': 'sent',
    'email.delivered': 'delivered',
    'email.delivery_delayed': 'sent', // Keep as sent, just delayed
    'email.opened': 'opened',
    'email.clicked': 'clicked',
    'email.bounced': 'bounced',
    'email.complained': 'spam',
  }
  return statusMap[eventType] || 'sent'
}

// ============================================
// MAIN: PROCESS WEBHOOK EVENT
// ============================================

/**
 * Process a verified Resend webhook event
 * Updates the email_sends table and optionally email_logs
 */
export async function processResendWebhookEvent(
  event: ResendWebhookEvent
): Promise<WebhookProcessResult> {
  const db = getAdminClient()
  const { type: eventType, data } = event
  const emailId = data.email_id

  console.log(`Processing Resend webhook: ${eventType} for email ${emailId}`)

  try {
    // Determine the new status
    const newStatus = mapEventToStatus(eventType)

    // Build the update data for email_sends
    const updateData: Record<string, unknown> = {
      status: newStatus,
    }

    // Add timestamp fields based on event type
    const now = new Date().toISOString()
    switch (eventType) {
      case 'email.sent':
        updateData.sent_at = updateData.sent_at || now
        break

      case 'email.delivered':
        updateData.delivered_at = now
        break

      case 'email.opened':
        updateData.opened_at = now
        break

      case 'email.clicked':
        updateData.clicked_at = now
        break

      case 'email.bounced':
        updateData.bounced_at = now
        const bounceData = data as ResendBounceData
        if (bounceData.bounce) {
          updateData.error_message = `${bounceData.bounce.type} bounce: ${bounceData.bounce.message}`
        }
        break

      case 'email.complained':
        updateData.error_message = 'Email marked as spam by recipient'
        break
    }

    // Update email_sends table (primary tracking)
    const { error: sendError } = await db
      .from('email_sends')
      .update(updateData)
      .eq('resend_id', emailId)

    if (sendError) {
      console.error('Failed to update email_sends:', sendError)
    }

    // Also update email_logs table for legacy compatibility
    const logUpdateData: Record<string, unknown> = {
      status: newStatus,
    }

    switch (eventType) {
      case 'email.sent':
        logUpdateData.sent_at = logUpdateData.sent_at || now
        break
      case 'email.opened':
        logUpdateData.opened_at = now
        break
      case 'email.clicked':
        logUpdateData.clicked_at = now
        break
      case 'email.bounced':
        logUpdateData.status = 'bounced'
        const bounceDataLog = data as ResendBounceData
        if (bounceDataLog.bounce) {
          logUpdateData.error_message = `${bounceDataLog.bounce.type} bounce: ${bounceDataLog.bounce.message}`
        }
        break
    }

    const { error: logError } = await db
      .from('email_logs')
      .update(logUpdateData)
      .eq('resend_id', emailId)

    if (logError) {
      // Non-critical - email_logs may not always have a matching record
      console.log('email_logs update skipped (no matching record or error):', logError.message)
    }

    return {
      success: true,
      event_type: eventType,
      email_id: emailId,
      message: `Processed ${eventType} event for email ${emailId}`,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error processing Resend webhook:', err)
    return {
      success: false,
      event_type: eventType,
      email_id: emailId,
      error: errorMessage,
    }
  }
}

// ============================================
// BATCH PROCESSING (for delayed events)
// ============================================

/**
 * Process multiple webhook events in sequence
 */
export async function processResendWebhookEvents(
  events: ResendWebhookEvent[]
): Promise<WebhookProcessResult[]> {
  const results: WebhookProcessResult[] = []

  for (const event of events) {
    const result = await processResendWebhookEvent(event)
    results.push(result)
  }

  return results
}

// ============================================
// STATS HELPERS
// ============================================

/**
 * Get email delivery statistics for an organization
 */
export async function getEmailStats(
  orgId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  failed: number
}> {
  const db = getAdminClient()

  let query = db
    .from('email_sends')
    .select('status', { count: 'exact' })
    .eq('org_id', orgId)

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString())
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching email stats:', error)
    return {
      total: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
    }
  }

  // Count by status
  const counts = {
    total: data?.length || 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    failed: 0,
  }

  data?.forEach((row: { status: string }) => {
    switch (row.status) {
      case 'sent':
      case 'queued':
        counts.sent++
        break
      case 'delivered':
        counts.delivered++
        break
      case 'opened':
        counts.opened++
        break
      case 'clicked':
        counts.clicked++
        break
      case 'bounced':
      case 'spam':
        counts.bounced++
        break
      case 'failed':
        counts.failed++
        break
    }
  })

  return counts
}
