/**
 * WhatsApp Webhook
 *
 * Handles:
 * - Webhook verification (GET) from Meta
 * - Delivery status updates (POST) from Meta
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/webhooks/whatsapp
 * Meta webhook verification challenge
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

/**
 * POST /api/webhooks/whatsapp
 * Receive delivery status updates and incoming messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const adminClient = getAdminClient()

    // Process each entry
    const entries = body?.entry || []

    for (const entry of entries) {
      const changes = entry?.changes || []

      for (const change of changes) {
        if (change.field !== 'messages') continue

        const value = change.value
        const statuses = value?.statuses || []

        // Process delivery status updates
        for (const status of statuses) {
          const providerMessageId = status.id
          const statusValue = status.status // sent, delivered, read, failed

          if (!providerMessageId) continue

          // Update message status in our database
          const updateData: Record<string, string> = {
            status: statusValue,
          }

          if (statusValue === 'delivered') {
            updateData.delivered_at = new Date().toISOString()
          } else if (statusValue === 'read') {
            updateData.read_at = new Date().toISOString()
          } else if (statusValue === 'failed') {
            updateData.error_message = status.errors?.[0]?.message || 'Delivery failed'
          }

          await adminClient
            .from('whatsapp_messages')
            .update(updateData)
            .eq('provider_message_id', providerMessageId)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[WhatsApp Webhook] Error:', err)
    return NextResponse.json({ success: true }) // Always return 200 to Meta
  }
}
