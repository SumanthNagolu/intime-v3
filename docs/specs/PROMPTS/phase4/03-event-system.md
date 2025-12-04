Use the database skill and backend skill.

Complete the Event System for InTime v3 (complementary to Activity System). Core EventBus exists but needs handlers and services.

## Read First:
- src/lib/events/ (ALL existing files - understand current implementation)
- src/lib/db/schema/workplan.ts (Events schema)
- docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
- docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md

## Current State Analysis:

### Implemented (src/lib/events/):
- `EventBus.ts` - COMPLETE: PostgreSQL LISTEN/NOTIFY based, publish/subscribe
- `HandlerRegistry.ts` - EXISTS: Handler registration
- `event-emitter.ts` - EXISTS: Context-aware emission
- `event-bus.ts` - EXISTS: Alternative implementation
- `event-handlers.ts` - EXISTS: Basic framework
- `types.ts` - COMPLETE: Event types and interfaces
- `handlers/user-handlers.ts` - EXISTS
- `handlers/course-handlers.ts` - EXISTS

### Missing Components:
1. **SubscriptionService** - User subscriptions to event patterns
2. **DeliveryService** - Notification delivery (email, push, webhooks)
3. **Event Handlers** - ActivityCreationHandler, NotificationHandler, AuditHandler, WebhookHandler
4. **Middleware Stack** - Configured event processing pipeline

---

## Task 1: Create SubscriptionService

Create `src/lib/events/SubscriptionService.ts`:

```typescript
import { db } from '@/lib/db';
import { eventSubscriptions, userNotificationPreferences } from '@/lib/db/schema/workplan';
import { eq, and, like, or } from 'drizzle-orm';

export type NotificationChannel = 'email' | 'push' | 'in_app' | 'sms' | 'webhook';

interface Subscription {
  id: string;
  userId: string;
  eventPattern: string; // e.g., 'submission.*', 'activity.completed', '*'
  channel: NotificationChannel;
  active: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

interface SubscriptionInput {
  eventPattern: string;
  channel: NotificationChannel;
  metadata?: Record<string, unknown>;
}

export class SubscriptionService {
  /**
   * Create a subscription for a user
   */
  async subscribe(
    userId: string,
    input: SubscriptionInput
  ): Promise<Subscription> {
    // Check if subscription already exists
    const existing = await db.query.eventSubscriptions.findFirst({
      where: and(
        eq(eventSubscriptions.userId, userId),
        eq(eventSubscriptions.eventPattern, input.eventPattern),
        eq(eventSubscriptions.channel, input.channel)
      ),
    });

    if (existing) {
      // Reactivate if inactive
      if (!existing.active) {
        const [updated] = await db
          .update(eventSubscriptions)
          .set({ active: true, updatedAt: new Date() })
          .where(eq(eventSubscriptions.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }

    const [subscription] = await db
      .insert(eventSubscriptions)
      .values({
        userId,
        eventPattern: input.eventPattern,
        channel: input.channel,
        metadata: input.metadata ?? {},
        active: true,
      })
      .returning();

    return subscription;
  }

  /**
   * Remove a subscription
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    await db
      .update(eventSubscriptions)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(eventSubscriptions.id, subscriptionId));
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return db.query.eventSubscriptions.findMany({
      where: and(
        eq(eventSubscriptions.userId, userId),
        eq(eventSubscriptions.active, true)
      ),
    });
  }

  /**
   * Get subscriptions matching an event type
   */
  async getMatchingSubscriptions(eventType: string): Promise<Subscription[]> {
    // Event patterns can be:
    // - Exact match: 'submission.created'
    // - Wildcard suffix: 'submission.*'
    // - All events: '*'

    const allSubscriptions = await db.query.eventSubscriptions.findMany({
      where: eq(eventSubscriptions.active, true),
    });

    return allSubscriptions.filter((sub) => {
      return this.matchesPattern(eventType, sub.eventPattern);
    });
  }

  /**
   * Check if event type matches a pattern
   */
  private matchesPattern(eventType: string, pattern: string): boolean {
    if (pattern === '*') return true;

    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(prefix + '.');
    }

    return eventType === pattern;
  }

  /**
   * Apply default subscriptions for a role
   */
  async applyDefaultSubscriptions(userId: string, role: string): Promise<void> {
    const defaults = DEFAULT_SUBSCRIPTIONS_BY_ROLE[role] ?? [];

    for (const sub of defaults) {
      await this.subscribe(userId, sub);
    }
  }

  /**
   * Get notification preferences for a user
   */
  async getNotificationPreferences(userId: string) {
    return db.query.userNotificationPreferences.findFirst({
      where: eq(userNotificationPreferences.userId, userId),
    });
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      smsEnabled?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      timezone?: string;
    }
  ) {
    const existing = await this.getNotificationPreferences(userId);

    if (existing) {
      return db
        .update(userNotificationPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userNotificationPreferences.userId, userId))
        .returning();
    }

    return db
      .insert(userNotificationPreferences)
      .values({ userId, ...preferences })
      .returning();
  }

  /**
   * Check if user should receive notification (respects quiet hours)
   */
  async shouldNotify(userId: string, channel: NotificationChannel): Promise<boolean> {
    const prefs = await this.getNotificationPreferences(userId);
    if (!prefs) return true;

    // Check channel enabled
    if (channel === 'email' && !prefs.emailEnabled) return false;
    if (channel === 'push' && !prefs.pushEnabled) return false;
    if (channel === 'sms' && !prefs.smsEnabled) return false;

    // Check quiet hours
    if (prefs.quietHoursStart && prefs.quietHoursEnd) {
      const now = new Date();
      const userTimezone = prefs.timezone ?? 'UTC';

      // Convert to user timezone and check
      const userTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: userTimezone,
      }).format(now);

      const [hour, minute] = userTime.split(':').map(Number);
      const currentMinutes = hour * 60 + minute;

      const [startHour, startMinute] = prefs.quietHoursStart.split(':').map(Number);
      const [endHour, endMinute] = prefs.quietHoursEnd.split(':').map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      // Handle overnight quiet hours
      if (startMinutes > endMinutes) {
        // e.g., 22:00 to 07:00
        if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) {
          return false;
        }
      } else {
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * Default subscriptions by role
 */
const DEFAULT_SUBSCRIPTIONS_BY_ROLE: Record<string, SubscriptionInput[]> = {
  recruiter: [
    { eventPattern: 'submission.*', channel: 'in_app' },
    { eventPattern: 'interview.*', channel: 'in_app' },
    { eventPattern: 'offer.*', channel: 'in_app' },
    { eventPattern: 'activity.assigned', channel: 'in_app' },
    { eventPattern: 'activity.sla_warning', channel: 'email' },
    { eventPattern: 'activity.escalated', channel: 'email' },
  ],
  bench_sales: [
    { eventPattern: 'job_order.*', channel: 'in_app' },
    { eventPattern: 'consultant.*', channel: 'in_app' },
    { eventPattern: 'activity.assigned', channel: 'in_app' },
    { eventPattern: 'activity.sla_warning', channel: 'email' },
    { eventPattern: 'visa.expiring', channel: 'email' },
  ],
  manager: [
    { eventPattern: 'activity.escalated', channel: 'in_app' },
    { eventPattern: 'activity.escalated', channel: 'email' },
    { eventPattern: 'submission.created', channel: 'in_app' },
    { eventPattern: 'approval.pending', channel: 'in_app' },
    { eventPattern: 'sla.breached', channel: 'email' },
  ],
  hr: [
    { eventPattern: 'employee.*', channel: 'in_app' },
    { eventPattern: 'onboarding.*', channel: 'in_app' },
    { eventPattern: 'compliance.*', channel: 'email' },
    { eventPattern: 'activity.assigned', channel: 'in_app' },
  ],
  admin: [
    { eventPattern: 'security.*', channel: 'email' },
    { eventPattern: 'system.*', channel: 'in_app' },
    { eventPattern: 'user.created', channel: 'in_app' },
  ],
};

export const subscriptionService = new SubscriptionService();
```

---

## Task 2: Create DeliveryService

Create `src/lib/events/DeliveryService.ts`:

```typescript
import { db } from '@/lib/db';
import { notificationQueue, webhookDeliveries } from '@/lib/db/schema/workplan';
import { eq, and, lt, inArray } from 'drizzle-orm';
import { subscriptionService, NotificationChannel } from './SubscriptionService';

interface Event {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  actorId: string;
  occurredAt: Date;
}

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  data?: Record<string, unknown>;
}

interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

export class DeliveryService {
  /**
   * Queue a notification for delivery
   */
  async queueNotification(
    userId: string,
    channel: NotificationChannel,
    event: Event,
    payload: NotificationPayload
  ): Promise<void> {
    // Check if user should receive notification
    const shouldNotify = await subscriptionService.shouldNotify(userId, channel);
    if (!shouldNotify) {
      console.log(`[DeliveryService] Skipping ${channel} notification for ${userId} (quiet hours/disabled)`);
      return;
    }

    await db.insert(notificationQueue).values({
      userId,
      channel,
      eventId: event.id,
      eventType: event.type,
      payload,
      status: 'pending',
      attempts: 0,
      scheduledFor: new Date(),
    });
  }

  /**
   * Process pending notifications
   */
  async processPendingNotifications(): Promise<{ sent: number; failed: number }> {
    const pending = await db.query.notificationQueue.findMany({
      where: and(
        eq(notificationQueue.status, 'pending'),
        lt(notificationQueue.scheduledFor, new Date())
      ),
      limit: 100,
    });

    let sent = 0;
    let failed = 0;

    for (const notification of pending) {
      try {
        await this.deliverNotification(notification);
        await db
          .update(notificationQueue)
          .set({
            status: 'sent',
            sentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(notificationQueue.id, notification.id));
        sent++;
      } catch (error) {
        const attempts = notification.attempts + 1;
        const maxAttempts = 3;

        await db
          .update(notificationQueue)
          .set({
            status: attempts >= maxAttempts ? 'failed' : 'pending',
            attempts,
            lastError: (error as Error).message,
            scheduledFor: new Date(Date.now() + attempts * 5 * 60 * 1000), // Exponential backoff
            updatedAt: new Date(),
          })
          .where(eq(notificationQueue.id, notification.id));
        failed++;
      }
    }

    return { sent, failed };
  }

  /**
   * Deliver a single notification
   */
  private async deliverNotification(notification: any): Promise<void> {
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
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.email) {
      throw new Error('User email not found');
    }

    // Use your email service (e.g., Resend, SendGrid, etc.)
    // This is a placeholder - implement based on your email provider
    console.log(`[Email] Sending to ${user.email}: ${payload.title}`);

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
    const subscription = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.userId, userId),
    });

    if (!subscription) {
      throw new Error('No push subscription found');
    }

    // Use web-push library
    // This is a placeholder - implement based on your push service
    console.log(`[Push] Sending to ${userId}: ${payload.title}`);

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
    await db.insert(notifications).values({
      userId,
      title: payload.title,
      body: payload.body,
      url: payload.url,
      eventId,
      read: false,
    });
  }

  /**
   * Send SMS notification
   */
  async sendSMS(userId: string, payload: NotificationPayload): Promise<void> {
    // Get user phone
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    if (!profile?.phone) {
      throw new Error('User phone not found');
    }

    // Use your SMS service (e.g., Twilio)
    // This is a placeholder
    console.log(`[SMS] Sending to ${profile.phone}: ${payload.title}`);

    // await twilioClient.messages.create({
    //   body: `${payload.title}: ${payload.body}`,
    //   to: profile.phone,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    // });
  }

  /**
   * Queue webhook delivery
   */
  async queueWebhook(webhook: WebhookConfig, event: Event): Promise<void> {
    await db.insert(webhookDeliveries).values({
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
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Process pending webhook deliveries
   */
  async processPendingWebhooks(): Promise<{ delivered: number; failed: number }> {
    const pending = await db.query.webhookDeliveries.findMany({
      where: eq(webhookDeliveries.status, 'pending'),
      limit: 100,
      with: {
        webhook: true,
      },
    });

    let delivered = 0;
    let failed = 0;

    for (const delivery of pending) {
      const result = await this.deliverWebhook(
        delivery.webhook.url,
        delivery.payload,
        delivery.webhook.secret
      );

      if (result.success) {
        await db
          .update(webhookDeliveries)
          .set({
            status: 'delivered',
            deliveredAt: new Date(),
            responseCode: result.statusCode,
          })
          .where(eq(webhookDeliveries.id, delivery.id));
        delivered++;
      } else {
        const attempts = delivery.attempts + 1;
        const maxAttempts = 5;

        await db
          .update(webhookDeliveries)
          .set({
            status: attempts >= maxAttempts ? 'failed' : 'pending',
            attempts,
            lastError: result.error,
          })
          .where(eq(webhookDeliveries.id, delivery.id));
        failed++;
      }
    }

    return { delivered, failed };
  }

  /**
   * Retry failed deliveries
   */
  async retryFailed(): Promise<void> {
    // Reset failed notifications older than 1 hour for retry
    await db
      .update(notificationQueue)
      .set({
        status: 'pending',
        attempts: 0,
        scheduledFor: new Date(),
      })
      .where(
        and(
          eq(notificationQueue.status, 'failed'),
          lt(notificationQueue.updatedAt, new Date(Date.now() - 60 * 60 * 1000))
        )
      );
  }
}

export const deliveryService = new DeliveryService();
```

---

## Task 3: Create Event Handlers

Create `src/lib/events/handlers/ActivityCreationHandler.ts`:

```typescript
import { activityEngine } from '@/lib/activities/activity-engine';
import type { EventHandler } from '../types';

/**
 * Handler that creates activities from events
 */
export const activityCreationHandler: EventHandler = async (event) => {
  try {
    const activities = await activityEngine.processEvent({
      type: event.type,
      entityType: event.entityType,
      entityId: event.entityId,
      data: event.data,
      actorId: event.actorId,
      orgId: event.orgId,
    });

    return {
      success: true,
      activitiesCreated: activities.length,
      activityIds: activities.map((a) => a.id),
    };
  } catch (error) {
    console.error('[ActivityCreationHandler] Failed:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};
```

Create `src/lib/events/handlers/NotificationHandler.ts`:

```typescript
import { subscriptionService } from '../SubscriptionService';
import { deliveryService } from '../DeliveryService';
import type { EventHandler } from '../types';

/**
 * Handler that sends notifications based on subscriptions
 */
export const notificationHandler: EventHandler = async (event) => {
  try {
    // Get matching subscriptions
    const subscriptions = await subscriptionService.getMatchingSubscriptions(event.type);

    let queued = 0;

    for (const sub of subscriptions) {
      // Skip if subscription is for the actor (don't notify yourself)
      if (sub.userId === event.actorId) continue;

      // Create notification payload from event
      const payload = createNotificationPayload(event);

      await deliveryService.queueNotification(
        sub.userId,
        sub.channel,
        event,
        payload
      );

      queued++;
    }

    return {
      success: true,
      notificationsQueued: queued,
    };
  } catch (error) {
    console.error('[NotificationHandler] Failed:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Create notification payload from event
 */
function createNotificationPayload(event: any) {
  // Event-specific templates
  const templates: Record<string, { title: string; body: string; url?: string }> = {
    'submission.created': {
      title: 'New Submission',
      body: `A new candidate has been submitted for ${event.data.jobTitle || 'a job'}`,
      url: `/recruiting/submissions/${event.entityId}`,
    },
    'submission.status_changed': {
      title: 'Submission Status Updated',
      body: `Submission status changed to ${event.data.newStatus}`,
      url: `/recruiting/submissions/${event.entityId}`,
    },
    'interview.scheduled': {
      title: 'Interview Scheduled',
      body: `An interview has been scheduled for ${event.data.candidateName || 'a candidate'}`,
      url: `/recruiting/interviews/${event.entityId}`,
    },
    'activity.assigned': {
      title: 'New Activity Assigned',
      body: event.data.subject || 'You have a new activity',
      url: `/activities/${event.entityId}`,
    },
    'activity.sla_warning': {
      title: 'SLA Warning',
      body: `Activity "${event.data.subject}" is approaching deadline`,
      url: `/activities/${event.entityId}`,
    },
    'activity.escalated': {
      title: 'Activity Escalated',
      body: `Activity "${event.data.subject}" has been escalated to you`,
      url: `/activities/${event.entityId}`,
    },
    'offer.sent': {
      title: 'Offer Sent',
      body: `An offer has been sent to ${event.data.candidateName}`,
      url: `/recruiting/offers/${event.entityId}`,
    },
  };

  const template = templates[event.type] || {
    title: formatEventType(event.type),
    body: `${event.entityType} ${event.entityId} was updated`,
  };

  return template;
}

/**
 * Format event type for display
 */
function formatEventType(type: string): string {
  return type
    .split('.')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
```

Create `src/lib/events/handlers/AuditHandler.ts`:

```typescript
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema/system';
import type { EventHandler } from '../types';

/**
 * Handler that creates audit log entries
 */
export const auditHandler: EventHandler = async (event) => {
  // Only audit certain event categories
  const auditableCategories = ['entity_lifecycle', 'security', 'user_action'];

  if (!auditableCategories.includes(event.category)) {
    return { success: true, skipped: true };
  }

  try {
    await db.insert(auditLogs).values({
      eventType: event.type,
      entityType: event.entityType,
      entityId: event.entityId,
      actorId: event.actorId,
      actorType: event.actorType,
      action: extractAction(event.type),
      changes: event.data.changes || null,
      previousValues: event.data.previousValues || null,
      newValues: event.data.newValues || null,
      ipAddress: event.data.ipAddress || null,
      userAgent: event.data.userAgent || null,
      orgId: event.orgId,
      occurredAt: event.occurredAt,
    });

    return { success: true };
  } catch (error) {
    console.error('[AuditHandler] Failed:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Extract action from event type
 */
function extractAction(type: string): string {
  const parts = type.split('.');
  return parts[parts.length - 1]; // e.g., 'created', 'updated', 'deleted'
}
```

Create `src/lib/events/handlers/WebhookHandler.ts`:

```typescript
import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schema/system';
import { eq, and } from 'drizzle-orm';
import { deliveryService } from '../DeliveryService';
import type { EventHandler } from '../types';

/**
 * Handler that triggers external webhooks
 */
export const webhookHandler: EventHandler = async (event) => {
  try {
    // Get active webhooks that subscribe to this event type
    const activeWebhooks = await db.query.webhooks.findMany({
      where: and(
        eq(webhooks.active, true),
        eq(webhooks.orgId, event.orgId)
      ),
    });

    let queued = 0;

    for (const webhook of activeWebhooks) {
      // Check if webhook subscribes to this event
      if (!matchesWebhookEvents(event.type, webhook.events)) {
        continue;
      }

      await deliveryService.queueWebhook(webhook, event);
      queued++;
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
};

/**
 * Check if event matches webhook's event subscription
 */
function matchesWebhookEvents(eventType: string, subscribedEvents: string[]): boolean {
  for (const pattern of subscribedEvents) {
    if (pattern === '*') return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      if (eventType.startsWith(prefix + '.')) return true;
    }
    if (pattern === eventType) return true;
  }
  return false;
}
```

---

## Task 4: Create Handler Index

Update `src/lib/events/handlers/index.ts`:

```typescript
import { activityCreationHandler } from './ActivityCreationHandler';
import { notificationHandler } from './NotificationHandler';
import { auditHandler } from './AuditHandler';
import { webhookHandler } from './WebhookHandler';
import { userHandlers } from './user-handlers';
import { courseHandlers } from './course-handlers';

export {
  activityCreationHandler,
  notificationHandler,
  auditHandler,
  webhookHandler,
  userHandlers,
  courseHandlers,
};

/**
 * Core event handlers that run on all events
 */
export const coreHandlers = [
  auditHandler,           // 1. Audit (always first - record everything)
  activityCreationHandler, // 2. Create activities from events
  notificationHandler,     // 3. Send notifications
  webhookHandler,          // 4. Trigger webhooks
];

/**
 * Register all handlers with the event bus
 */
export function registerAllHandlers(eventBus: any) {
  // Register core handlers for all events
  for (const handler of coreHandlers) {
    eventBus.use(async (event: any, next: () => Promise<void>) => {
      await handler(event);
      await next();
    });
  }

  // Register domain-specific handlers
  for (const [eventType, handler] of Object.entries(userHandlers)) {
    eventBus.on(eventType, handler);
  }

  for (const [eventType, handler] of Object.entries(courseHandlers)) {
    eventBus.on(eventType, handler);
  }
}
```

---

## Task 5: Configure Event Bus Middleware

Update `src/lib/events/EventBus.ts` to use middleware pattern:

```typescript
// Add to existing EventBus class

type EventMiddleware = (
  event: Event,
  next: () => Promise<void>
) => Promise<void>;

class EventBus {
  private middlewares: EventMiddleware[] = [];

  /**
   * Add middleware to the processing pipeline
   */
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Emit event through middleware chain
   */
  async emit(type: string, data: Record<string, unknown>): Promise<Event> {
    const event = await this.createEvent(type, data);

    // Run through middleware chain
    let index = 0;
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(event, next);
      }
    };

    await next();

    return event;
  }
}
```

---

## Task 6: Create Event Jobs

Create `src/jobs/event-jobs.ts`:

```typescript
import { deliveryService } from '@/lib/events/DeliveryService';

/**
 * Process notification queue - Run every minute
 */
export async function processNotifications() {
  console.log('[Notification Processor] Starting...');
  const result = await deliveryService.processPendingNotifications();
  console.log(`[Notification Processor] Sent: ${result.sent}, Failed: ${result.failed}`);
  return result;
}

/**
 * Process webhook deliveries - Run every minute
 */
export async function processWebhooks() {
  console.log('[Webhook Processor] Starting...');
  const result = await deliveryService.processPendingWebhooks();
  console.log(`[Webhook Processor] Delivered: ${result.delivered}, Failed: ${result.failed}`);
  return result;
}

/**
 * Retry failed deliveries - Run every hour
 */
export async function retryFailedDeliveries() {
  console.log('[Retry Processor] Starting...');
  await deliveryService.retryFailed();
  console.log('[Retry Processor] Complete');
}

/**
 * Register jobs with scheduler
 */
export function registerEventJobs(scheduler: any) {
  scheduler.schedule('* * * * *', processNotifications); // Every minute
  scheduler.schedule('* * * * *', processWebhooks);       // Every minute
  scheduler.schedule('0 * * * *', retryFailedDeliveries); // Every hour
}
```

---

## Task 7: Update Events Router

Add to `src/server/routers/events.ts`:

```typescript
// Subscriptions

getMySubscriptions: protectedProcedure.query(async ({ ctx }) => {
  return subscriptionService.getUserSubscriptions(ctx.user.id);
}),

subscribe: protectedProcedure
  .input(
    z.object({
      eventPattern: z.string(),
      channel: z.enum(['email', 'push', 'in_app', 'sms']),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return subscriptionService.subscribe(ctx.user.id, input);
  }),

unsubscribe: protectedProcedure
  .input(z.object({ subscriptionId: z.string().uuid() }))
  .mutation(async ({ input }) => {
    await subscriptionService.unsubscribe(input.subscriptionId);
    return { success: true };
  }),

// Notification preferences

getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
  return subscriptionService.getNotificationPreferences(ctx.user.id);
}),

updateNotificationPreferences: protectedProcedure
  .input(
    z.object({
      emailEnabled: z.boolean().optional(),
      pushEnabled: z.boolean().optional(),
      smsEnabled: z.boolean().optional(),
      quietHoursStart: z.string().optional(),
      quietHoursEnd: z.string().optional(),
      timezone: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return subscriptionService.updateNotificationPreferences(ctx.user.id, input);
  }),

// In-app notifications

getNotifications: protectedProcedure
  .input(
    z.object({
      unreadOnly: z.boolean().optional(),
      limit: z.number().min(1).max(100).optional(),
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    return db.query.notifications.findMany({
      where: and(
        eq(notifications.userId, ctx.user.id),
        input?.unreadOnly ? eq(notifications.read, false) : undefined
      ),
      orderBy: desc(notifications.createdAt),
      limit: input?.limit ?? 50,
    });
  }),

markNotificationRead: protectedProcedure
  .input(z.object({ notificationId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    await db
      .update(notifications)
      .set({ read: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, ctx.user.id)
        )
      );
    return { success: true };
  }),

markAllNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
  await db
    .update(notifications)
    .set({ read: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.read, false)
      )
    );
  return { success: true };
}),
```

---

## Validation Checklist

After completion:

```bash
# 1. TypeScript compiles
pnpm tsc --noEmit

# 2. Verify handler registration
grep -r "registerAllHandlers" src/ --include="*.ts"

# 3. Test event emission
pnpm test src/lib/events/
```

## Requirements:
- All handlers must be async and handle errors gracefully
- SubscriptionService must respect user preferences
- DeliveryService must implement retry logic
- Webhook signatures must be secure (HMAC-SHA256)
- Notifications must respect quiet hours
- All database operations must use transactions where appropriate
