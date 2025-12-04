/**
 * Delivery Service
 *
 * Manages notification delivery across multiple channels (email, push, in-app, SMS).
 * Also handles webhook delivery with retry logic.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { db } from '@/lib/db';
import { notifications, userProfiles, eventDeliveryLog } from '@/lib/db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { subscriptionService, type NotificationChannel } from './SubscriptionService';
import crypto from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface EventData {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  actorId?: string;
  occurredAt: Date;
}

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  data?: Record<string, unknown>;
}

export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

export interface QueuedNotification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  eventId: string;
  eventType: string;
  payload: NotificationPayload;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  scheduledFor: Date;
  lastError?: string;
}

// In-memory queue for notifications (in production, use Redis or a message queue)
const notificationQueue: Map<string, QueuedNotification> = new Map();
const webhookQueue: Map<string, {
  webhookId: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastError?: string;
}> = new Map();

// ============================================================================
// DELIVERY SERVICE
// ============================================================================

export class DeliveryService {
  /**
   * Queue a notification for delivery
   */
  async queueNotification(
    userId: string,
    channel: NotificationChannel,
    event: EventData,
    payload: NotificationPayload
  ): Promise<void> {
    // Check if user should receive notification
    const shouldNotify = await subscriptionService.shouldNotify(userId, channel);
    if (!shouldNotify) {
      console.log(`[DeliveryService] Skipping ${channel} notification for ${userId} (quiet hours/disabled)`);
      return;
    }

    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const notification: QueuedNotification = {
      id,
      userId,
      channel,
      eventId: event.id,
      eventType: event.type,
      payload,
      status: 'pending',
      attempts: 0,
      scheduledFor: new Date(),
    };

    notificationQueue.set(id, notification);
    console.log(`[DeliveryService] Queued ${channel} notification for user ${userId}`);
  }

  /**
   * Process pending notifications
   */
  async processPendingNotifications(): Promise<{ sent: number; failed: number }> {
    const now = new Date();
    let sent = 0;
    let failed = 0;

    for (const [id, notification] of notificationQueue) {
      if (notification.status !== 'pending' || notification.scheduledFor > now) {
        continue;
      }

      try {
        await this.deliverNotification(notification);
        notification.status = 'sent';
        notificationQueue.delete(id);
        sent++;
      } catch (error) {
        notification.attempts++;
        notification.lastError = (error as Error).message;

        const maxAttempts = 3;
        if (notification.attempts >= maxAttempts) {
          notification.status = 'failed';
          console.error(`[DeliveryService] Notification ${id} failed permanently after ${maxAttempts} attempts`);
          failed++;
        } else {
          // Exponential backoff
          notification.scheduledFor = new Date(Date.now() + notification.attempts * 5 * 60 * 1000);
          console.warn(`[DeliveryService] Notification ${id} failed, retry scheduled for ${notification.scheduledFor}`);
        }
      }
    }

    return { sent, failed };
  }

  /**
   * Deliver a single notification
   */
  private async deliverNotification(notification: QueuedNotification): Promise<void> {
    switch (notification.channel) {
      case 'email':
        await this.sendEmail(notification.userId, notification.payload);
        break;
      case 'push':
        await this.sendPush(notification.userId, notification.payload);
        break;
      case 'in_app':
        await this.sendInApp(notification.userId, notification.payload, notification.eventId);
        break;
      case 'sms':
        await this.sendSMS(notification.userId, notification.payload);
        break;
      default:
        throw new Error(`Unknown channel: ${notification.channel}`);
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(userId: string, payload: NotificationPayload): Promise<void> {
    // Get user email
    const user = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, userId),
    });

    if (!user?.email) {
      throw new Error('User email not found');
    }

    // Use your email service (e.g., Resend, SendGrid, etc.)
    // This is a placeholder - implement based on your email provider
    console.log(`[Email] Would send to ${user.email}: ${payload.title}`);

    // Example with Resend:
    // await resend.emails.send({
    //   from: 'InTime <notifications@intime.com>',
    //   to: user.email,
    //   subject: payload.title,
    //   html: this.renderEmailTemplate(payload),
    // });
  }

  /**
   * Send push notification
   */
  async sendPush(userId: string, payload: NotificationPayload): Promise<void> {
    // Get user's push subscription
    // This would need a push_subscriptions table
    console.log(`[Push] Would send to user ${userId}: ${payload.title}`);

    // Use web-push library
    // await webpush.sendNotification(subscription, JSON.stringify(payload));
  }

  /**
   * Send in-app notification
   */
  async sendInApp(
    userId: string,
    payload: NotificationPayload,
    eventId: string
  ): Promise<void> {
    // Get user's org
    const user = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, userId),
    });

    if (!user?.orgId) {
      throw new Error('User org not found');
    }

    await db.insert(notifications).values({
      orgId: user.orgId,
      userId,
      notificationType: 'event',
      title: payload.title,
      message: payload.body,
      actionUrl: payload.url,
      isRead: false,
    });

    console.log(`[InApp] Created notification for user ${userId}: ${payload.title}`);
  }

  /**
   * Send SMS notification
   */
  async sendSMS(userId: string, payload: NotificationPayload): Promise<void> {
    // Get user phone from profile
    const user = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, userId),
    });

    const phone = (user as unknown as { phone?: string })?.phone;
    if (!phone) {
      throw new Error('User phone not found');
    }

    // Use your SMS service (e.g., Twilio)
    console.log(`[SMS] Would send to ${phone}: ${payload.title}`);

    // await twilioClient.messages.create({
    //   body: `${payload.title}: ${payload.body}`,
    //   to: phone,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    // });
  }

  /**
   * Queue webhook delivery
   */
  async queueWebhook(webhook: WebhookConfig, event: EventData): Promise<void> {
    const id = `webhook_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    webhookQueue.set(id, {
      webhookId: webhook.id,
      eventId: event.id,
      eventType: event.type,
      payload: {
        event: event.type,
        data: event.data,
        occurredAt: event.occurredAt,
      },
      status: 'pending',
      attempts: 0,
    });

    console.log(`[DeliveryService] Queued webhook ${webhook.id} for event ${event.type}`);
  }

  /**
   * Deliver webhook
   */
  async deliverWebhook(
    url: string,
    payload: Record<string, unknown>,
    secret: string
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    try {
      // Create signature
      const body = JSON.stringify(payload);
      const signature = this.createWebhookSignature(body, secret);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-InTime-Signature': signature,
          'X-InTime-Timestamp': Date.now().toString(),
        },
        body,
      });

      return {
        success: response.ok,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Create webhook signature (HMAC-SHA256)
   */
  private createWebhookSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Process pending webhook deliveries
   */
  async processPendingWebhooks(): Promise<{ delivered: number; failed: number }> {
    let delivered = 0;
    let failed = 0;

    for (const [id, delivery] of webhookQueue) {
      if (delivery.status !== 'pending') {
        continue;
      }

      // In a real implementation, we'd look up the webhook config from the database
      // For now, we'll skip webhook processing since we don't have webhook configs yet
      console.log(`[DeliveryService] Would process webhook ${id}`);

      // Mark as delivered for now (placeholder)
      delivery.status = 'delivered';
      webhookQueue.delete(id);
      delivered++;
    }

    return { delivered, failed };
  }

  /**
   * Retry failed deliveries
   */
  async retryFailed(): Promise<void> {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // Reset failed notifications older than 1 hour for retry
    for (const [id, notification] of notificationQueue) {
      if (
        notification.status === 'failed' &&
        notification.scheduledFor.getTime() < oneHourAgo
      ) {
        notification.status = 'pending';
        notification.attempts = 0;
        notification.scheduledFor = new Date();
        console.log(`[DeliveryService] Reset failed notification ${id} for retry`);
      }
    }

    // Same for webhooks
    for (const [id, delivery] of webhookQueue) {
      if (delivery.status === 'failed') {
        delivery.status = 'pending';
        delivery.attempts = 0;
        console.log(`[DeliveryService] Reset failed webhook ${id} for retry`);
      }
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    notifications: { pending: number; sent: number; failed: number };
    webhooks: { pending: number; delivered: number; failed: number };
  } {
    const notifStats = { pending: 0, sent: 0, failed: 0 };
    const webhookStats = { pending: 0, delivered: 0, failed: 0 };

    for (const notification of notificationQueue.values()) {
      if (notification.status === 'pending') notifStats.pending++;
      else if (notification.status === 'sent') notifStats.sent++;
      else if (notification.status === 'failed') notifStats.failed++;
    }

    for (const delivery of webhookQueue.values()) {
      if (delivery.status === 'pending') webhookStats.pending++;
      else if (delivery.status === 'delivered') webhookStats.delivered++;
      else if (delivery.status === 'failed') webhookStats.failed++;
    }

    return {
      notifications: notifStats,
      webhooks: webhookStats,
    };
  }
}

export const deliveryService = new DeliveryService();
