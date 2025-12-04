/**
 * Webhook Handler
 *
 * Handler that triggers external webhooks based on event subscriptions.
 * Supports webhook matching patterns and queues deliveries.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { db } from '@/lib/db';
import { eventSubscriptions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { deliveryService } from '../DeliveryService';
import type { Event } from '../event.types';

export interface WebhookResult {
  success: boolean;
  webhooksQueued?: number;
  error?: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

/**
 * Handler that triggers external webhooks
 *
 * Flow:
 * 1. Get all webhook subscriptions for the organization
 * 2. Filter by event type pattern match
 * 3. Queue webhook delivery for each matching subscription
 */
export async function webhookHandler(event: Event): Promise<WebhookResult> {
  try {
    // Get webhook subscriptions for this org
    const webhookSubs = await db.query.eventSubscriptions.findMany({
      where: and(
        eq(eventSubscriptions.isActive, true),
        eq(eventSubscriptions.channel, 'webhook'),
        eq(eventSubscriptions.orgId, event.orgId)
      ),
    });

    let queued = 0;

    for (const sub of webhookSubs) {
      // Check if webhook subscribes to this event
      if (!matchesWebhookPattern(event.eventType, sub.eventPattern)) {
        continue;
      }

      // Build webhook config from subscription
      const webhookConfig: WebhookConfig = {
        id: sub.id,
        url: sub.webhookUrl || '',
        secret: process.env.WEBHOOK_SECRET || 'intime-webhook-secret', // Should be per-subscription in production
        events: [sub.eventPattern],
        active: sub.isActive ?? true,
      };

      if (!webhookConfig.url) {
        console.warn(`[WebhookHandler] Subscription ${sub.id} has no webhook URL, skipping`);
        continue;
      }

      await deliveryService.queueWebhook(webhookConfig, {
        id: event.id,
        type: event.eventType,
        entityType: event.entityType,
        entityId: event.entityId,
        data: event.eventData,
        actorId: event.actorId,
        occurredAt: event.occurredAt,
      });

      queued++;
    }

    if (queued > 0) {
      console.log(`[WebhookHandler] Queued ${queued} webhooks for event ${event.eventType}`);
    }

    return {
      success: true,
      webhooksQueued: queued,
    };
  } catch (error) {
    console.error('[WebhookHandler] Failed:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Check if event matches webhook's event subscription pattern
 */
function matchesWebhookPattern(eventType: string, pattern: string): boolean {
  // Exact match
  if (pattern === eventType) return true;

  // All events
  if (pattern === '*') return true;

  // Wildcard suffix (e.g., 'submission.*')
  if (pattern.endsWith('.*')) {
    const prefix = pattern.slice(0, -2);
    if (eventType.startsWith(prefix + '.')) return true;
  }

  // Wildcard prefix (e.g., '*.created')
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(2);
    if (eventType.endsWith('.' + suffix)) return true;
  }

  return false;
}

export default webhookHandler;
