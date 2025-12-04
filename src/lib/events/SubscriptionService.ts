/**
 * Subscription Service
 *
 * Manages user subscriptions to event patterns and notification preferences.
 * Users can subscribe to specific events and choose how they want to be notified.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { db } from '@/lib/db';
import { eventSubscriptions, userProfiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export type NotificationChannel = 'email' | 'push' | 'in_app' | 'sms' | 'webhook';

export interface Subscription {
  id: string;
  userId: string;
  eventPattern: string; // e.g., 'submission.*', 'activity.completed', '*'
  channel: NotificationChannel;
  active: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface SubscriptionInput {
  eventPattern: string;
  channel: NotificationChannel;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string;   // HH:MM format
  timezone?: string;
}

// ============================================================================
// DEFAULT SUBSCRIPTIONS BY ROLE
// ============================================================================

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

// ============================================================================
// SUBSCRIPTION SERVICE
// ============================================================================

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
      if (!existing.isActive) {
        const [updated] = await db
          .update(eventSubscriptions)
          .set({ isActive: true, updatedAt: new Date() })
          .where(eq(eventSubscriptions.id, existing.id))
          .returning();
        return this.mapToSubscription(updated);
      }
      return this.mapToSubscription(existing);
    }

    const [subscription] = await db
      .insert(eventSubscriptions)
      .values({
        userId,
        subscriberName: `user_${userId}`,
        eventPattern: input.eventPattern,
        channel: input.channel,
        isActive: true,
      })
      .returning();

    return this.mapToSubscription(subscription);
  }

  /**
   * Remove a subscription
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    await db
      .update(eventSubscriptions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(eventSubscriptions.id, subscriptionId));
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const subscriptions = await db.query.eventSubscriptions.findMany({
      where: and(
        eq(eventSubscriptions.userId, userId),
        eq(eventSubscriptions.isActive, true)
      ),
    });

    return subscriptions.map(this.mapToSubscription);
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
      where: eq(eventSubscriptions.isActive, true),
    });

    return allSubscriptions
      .filter((sub) => this.matchesPattern(eventType, sub.eventPattern))
      .map(this.mapToSubscription);
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
   * Uses user_profiles.timezone for timezone, rest are derived from subscriptions
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    const user = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, userId),
    });

    if (!user) return null;

    // Get user's subscriptions to determine channel preferences
    const subscriptions = await this.getUserSubscriptions(userId);

    // Check which channels have active subscriptions
    const hasEmailSubs = subscriptions.some(s => s.channel === 'email');
    const hasPushSubs = subscriptions.some(s => s.channel === 'push');
    const hasSmsSubs = subscriptions.some(s => s.channel === 'sms');

    // Get preferences from a special subscription pattern (if exists)
    const prefsSubscription = await db.query.eventSubscriptions.findFirst({
      where: and(
        eq(eventSubscriptions.userId, userId),
        eq(eventSubscriptions.eventPattern, '__notification_preferences__')
      ),
    });

    const filterCriteria = (prefsSubscription?.filterCriteria as {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      smsEnabled?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
    }) ?? {};

    return {
      userId,
      emailEnabled: filterCriteria.emailEnabled ?? (hasEmailSubs || true),
      pushEnabled: filterCriteria.pushEnabled ?? (hasPushSubs || true),
      smsEnabled: filterCriteria.smsEnabled ?? (hasSmsSubs || false),
      quietHoursStart: filterCriteria.quietHoursStart,
      quietHoursEnd: filterCriteria.quietHoursEnd,
      timezone: user.timezone ?? 'America/New_York',
    };
  }

  /**
   * Update notification preferences for a user
   * Stores preferences in a special event_subscription record with pattern '__notification_preferences__'
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
  ): Promise<NotificationPreferences | null> {
    const user = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, userId),
    });

    if (!user) return null;

    // Update timezone in user profile if provided
    if (preferences.timezone) {
      await db
        .update(userProfiles)
        .set({ timezone: preferences.timezone, updatedAt: new Date() })
        .where(eq(userProfiles.id, userId));
    }

    // Store other preferences in a special subscription record
    const prefsRecord = await db.query.eventSubscriptions.findFirst({
      where: and(
        eq(eventSubscriptions.userId, userId),
        eq(eventSubscriptions.eventPattern, '__notification_preferences__')
      ),
    });

    // Store preferences in filterCriteria - cast to match schema type
    // Note: filterCriteria schema type is { entityTypes?, severities?, actorTypes? }
    // We're extending it to store notification preferences
    const notifPrefs = {
      emailEnabled: preferences.emailEnabled,
      pushEnabled: preferences.pushEnabled,
      smsEnabled: preferences.smsEnabled,
      quietHoursStart: preferences.quietHoursStart,
      quietHoursEnd: preferences.quietHoursEnd,
    };

    if (prefsRecord) {
      // Update existing preferences record
      const existingCriteria = (prefsRecord.filterCriteria as Record<string, unknown>) ?? {};
      await db
        .update(eventSubscriptions)
        .set({
          filterCriteria: { ...existingCriteria, ...notifPrefs } as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(eventSubscriptions.id, prefsRecord.id));
    } else {
      // Create new preferences record
      await db.insert(eventSubscriptions).values({
        userId,
        subscriberName: `preferences_${userId}`,
        eventPattern: '__notification_preferences__',
        channel: 'in_app', // Placeholder channel
        isActive: false, // Not an active subscription
        filterCriteria: notifPrefs as Record<string, unknown>,
      });
    }

    return this.getNotificationPreferences(userId);
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

  /**
   * Map database record to Subscription interface
   */
  private mapToSubscription(record: typeof eventSubscriptions.$inferSelect): Subscription {
    return {
      id: record.id,
      userId: record.userId ?? '',
      eventPattern: record.eventPattern,
      channel: record.channel as NotificationChannel,
      active: record.isActive ?? true,
      createdAt: record.createdAt,
    };
  }
}

export const subscriptionService = new SubscriptionService();
