/**
 * Okta Event Hooks Webhook Handler
 * Receives webhooks from Okta for user lifecycle events
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { providerRegistry } from '@/lib/integrations/provider-registry'
import type { IntegrationConfig, IntegrationCategory, IntegrationStatus, WebhookEvent } from '@/lib/integrations/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-okta-verification-challenge')
    const authHeader = request.headers.get('authorization')

    // Handle Okta verification challenge
    // When setting up event hooks, Okta sends a verification request
    if (signature) {
      return NextResponse.json({
        verification: signature,
      })
    }

    // Parse the webhook payload
    let payload: {
      eventType?: string
      eventTypeVersion?: string
      cloudEventsVersion?: string
      eventId?: string
      eventTime?: string
      data?: {
        events?: Array<{
          uuid: string
          eventType: string
          displayMessage?: string
          severity: string
          published: string
          actor?: {
            id: string
            type: string
            displayName: string
          }
          target?: Array<{
            id: string
            type: string
            displayName: string
            alternateId?: string
          }>
        }>
      }
    }

    try {
      payload = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Okta sends events in batches
    const events = payload.data?.events || []

    if (events.length === 0) {
      return NextResponse.json({ received: true })
    }

    // Find the integration
    const adminClient = getAdminClient()
    const { data: integration } = await adminClient
      .from('integrations')
      .select('*')
      .eq('provider', 'okta')
      .eq('status', 'active')
      .is('deleted_at', null)
      .single()

    if (!integration) {
      console.log('No active Okta integration found for webhook')
      return NextResponse.json({ received: true })
    }

    // Verify authorization header if webhook secret is configured
    const expectedToken = integration.credentials?.webhookSecret
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.error('Invalid Okta webhook authorization')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build config
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

    const provider = providerRegistry.createIdentityProvider(config)

    // Process each event in the batch
    for (const event of events) {
      const webhookEvent: WebhookEvent = {
        id: event.uuid,
        provider: 'okta',
        eventType: event.eventType,
        timestamp: new Date(event.published),
        payload: event as unknown as Record<string, unknown>,
      }

      // Log the webhook event
      await adminClient
        .from('webhook_logs')
        .insert({
          org_id: integration.org_id,
          integration_id: integration.id,
          provider: 'okta',
          event_type: event.eventType,
          payload: event,
          status: 'received',
        })

      try {
        await provider.handleWebhook(webhookEvent)

        // Handle specific event types
        const targetUser = event.target?.find(t => t.type === 'User')

        switch (event.eventType) {
          case 'user.lifecycle.create':
          case 'user.lifecycle.activate':
            // User created or activated in Okta
            // Could auto-provision in InTime
            if (targetUser) {
              console.log(`Okta user created/activated: ${targetUser.displayName}`)
            }
            break

          case 'user.lifecycle.deactivate':
          case 'user.lifecycle.suspend':
            // User deactivated or suspended
            // Could trigger offboarding in InTime
            if (targetUser) {
              console.log(`Okta user deactivated: ${targetUser.displayName}`)
            }
            break

          case 'user.account.update_profile':
            // Profile updated
            // Could sync changes to InTime
            if (targetUser) {
              console.log(`Okta user profile updated: ${targetUser.displayName}`)
            }
            break

          case 'group.user_membership.add':
          case 'group.user_membership.remove':
            // Group membership changed
            // Could update permissions in InTime
            console.log(`Okta group membership changed: ${event.displayMessage}`)
            break
        }

        // Update log status
        await adminClient
          .from('webhook_logs')
          .update({ status: 'processed' })
          .eq('provider', 'okta')
          .eq('event_type', event.eventType)
          .eq('integration_id', integration.id)
          .order('created_at', { ascending: false })
          .limit(1)
      } catch (error) {
        console.error(`Error processing Okta webhook event ${event.eventType}:`, error)

        await adminClient
          .from('webhook_logs')
          .update({
            status: 'error',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('provider', 'okta')
          .eq('event_type', event.eventType)
          .eq('integration_id', integration.id)
          .order('created_at', { ascending: false })
          .limit(1)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Okta webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Okta verification endpoint
export async function GET(request: NextRequest) {
  // Handle Okta Event Hook verification
  const challenge = request.nextUrl.searchParams.get('verification')
  if (challenge) {
    return NextResponse.json({ verification: challenge })
  }
  return NextResponse.json({ status: 'ok' })
}
