/**
 * DocuSign Connect Webhook Handler
 * Receives webhooks from DocuSign for envelope status changes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { providerRegistry } from '@/lib/integrations/provider-registry'
import type { IntegrationConfig, IntegrationCategory, IntegrationStatus, WebhookEvent } from '@/lib/integrations/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-docusign-signature-1') || ''

    // Parse the DocuSign Connect XML/JSON payload
    // DocuSign can send either XML or JSON depending on configuration
    let payload: {
      envelopeId?: string
      status?: string
      event?: string
      accountId?: string
      recipientStatuses?: Array<{
        email: string
        status: string
        signedDateTime?: string
      }>
    }

    // Try JSON first
    try {
      payload = JSON.parse(body)
    } catch {
      // Might be XML - for simplicity, we'll require JSON configuration
      return NextResponse.json({ error: 'Only JSON payloads are supported' }, { status: 400 })
    }

    const accountId = payload.accountId
    const envelopeId = payload.envelopeId
    const eventType = payload.event || payload.status || 'unknown'

    // Find the integration for this account
    const adminClient = getAdminClient()
    const { data: integration } = await adminClient
      .from('integrations')
      .select('*')
      .eq('provider', 'docusign')
      .eq('status', 'active')
      .is('deleted_at', null)
      // Would match on account_id from credentials
      .single()

    if (!integration) {
      console.log('No active DocuSign integration found for webhook')
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

    const provider = providerRegistry.createESignatureProvider(config)
    const isValid = provider.verifyWebhookSignature(body, signature)

    if (!isValid && signature) {
      console.error('Invalid DocuSign webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Create webhook event record
    const webhookEvent: WebhookEvent = {
      id: `docusign-${envelopeId}-${Date.now()}`,
      provider: 'docusign',
      eventType: `envelope-${eventType.toLowerCase()}`,
      timestamp: new Date(),
      payload: payload as unknown as Record<string, unknown>,
      signature,
    }

    // Log the webhook event
    await adminClient
      .from('webhook_logs')
      .insert({
        org_id: integration.org_id,
        integration_id: integration.id,
        provider: 'docusign',
        event_type: webhookEvent.eventType,
        payload: payload,
        status: 'received',
      })
      .select()
      .single()

    // Handle the webhook
    try {
      await provider.handleWebhook(webhookEvent)

      // If envelope completed, update any related records
      if (eventType.toLowerCase() === 'completed' && envelopeId) {
        // Update document tracking records
        await adminClient
          .from('esignature_documents')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('envelope_id', envelopeId)
          .eq('org_id', integration.org_id)
      }

      // Update log status
      await adminClient
        .from('webhook_logs')
        .update({ status: 'processed' })
        .eq('event_type', webhookEvent.eventType)
        .eq('integration_id', integration.id)
        .order('created_at', { ascending: false })
        .limit(1)
    } catch (error) {
      console.error('Error processing DocuSign webhook:', error)

      await adminClient
        .from('webhook_logs')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('event_type', webhookEvent.eventType)
        .eq('integration_id', integration.id)
        .order('created_at', { ascending: false })
        .limit(1)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('DocuSign webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DocuSign Connect verification endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
