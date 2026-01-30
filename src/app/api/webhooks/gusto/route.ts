/**
 * Gusto Webhook Handler
 * Receives webhooks from Gusto for employee and payroll events
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { providerRegistry } from '@/lib/integrations/provider-registry'
import type { IntegrationConfig, IntegrationCategory, IntegrationStatus, WebhookEvent } from '@/lib/integrations/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-gusto-signature') || ''

    // Parse the webhook payload
    let payload: {
      event_type: string
      entity_type: string
      entity_uuid: string
      company_uuid: string
      timestamp: string
      data?: Record<string, unknown>
    }

    try {
      payload = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Find the integration for this company
    const adminClient = getAdminClient()
    const { data: integration } = await adminClient
      .from('integrations')
      .select('*')
      .eq('provider', 'gusto')
      .eq('status', 'active')
      .is('deleted_at', null)
      // Would match on company_uuid from settings
      .single()

    if (!integration) {
      console.log('No active Gusto integration found for webhook')
      return NextResponse.json({ received: true })
    }

    // Verify signature
    const config: IntegrationConfig = {
      id: integration.id,
      orgId: integration.org_id,
      provider: integration.provider,
      category: integration.category as IntegrationCategory,
      status: integration.status as IntegrationStatus,
      credentials: integration.credentials,
      settings: integration.settings as Record<string, unknown>,
      createdAt: new Date(integration.created_at),
      updatedAt: new Date(integration.updated_at),
    }

    const provider = providerRegistry.createPayrollProvider(config)
    const isValid = provider.verifyWebhookSignature(body, signature)

    if (!isValid) {
      console.error('Invalid Gusto webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Create webhook event record
    const webhookEvent: WebhookEvent = {
      id: `gusto-${payload.entity_uuid}-${Date.now()}`,
      provider: 'gusto',
      eventType: payload.event_type,
      timestamp: new Date(payload.timestamp),
      payload: payload as unknown as Record<string, unknown>,
      signature,
    }

    // Log the webhook event
    await adminClient
      .from('webhook_logs')
      .insert({
        org_id: integration.org_id,
        integration_id: integration.id,
        provider: 'gusto',
        event_type: payload.event_type,
        payload: payload,
        status: 'received',
      })
      .select()
      .single()

    // Handle the webhook asynchronously
    // In production, this would be queued to a background job
    try {
      await provider.handleWebhook(webhookEvent)

      // Update log status
      await adminClient
        .from('webhook_logs')
        .update({ status: 'processed' })
        .eq('event_type', payload.event_type)
        .eq('integration_id', integration.id)
        .order('created_at', { ascending: false })
        .limit(1)
    } catch (error) {
      console.error('Error processing Gusto webhook:', error)

      await adminClient
        .from('webhook_logs')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('event_type', payload.event_type)
        .eq('integration_id', integration.id)
        .order('created_at', { ascending: false })
        .limit(1)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Gusto webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Gusto may send GET request for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
