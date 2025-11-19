/**
 * Drizzle ORM Schema: Event Bus
 *
 * Tables: events, event_subscriptions, event_delivery_log
 * Maps to SQL migration: 005_create_event_bus.sql
 *
 * @module schema/events
 */

import { pgTable, uuid, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userProfiles } from './user-profiles';

// ============================================================================
// TABLE: events
// ============================================================================

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Event identification
  eventType: text('event_type').notNull(), // 'user.created', 'course.graduated', etc.
  eventCategory: text('event_category').notNull(), // 'user', 'academy', 'recruiting', etc.
  aggregateId: uuid('aggregate_id'), // Entity ID this event relates to

  // Event payload
  payload: jsonb('payload').$type<Record<string, any>>().notNull().default({}),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),

  // Actor information
  userId: uuid('user_id'),
  userEmail: text('user_email'),

  // Event status and delivery
  status: text('status').default('pending'), // 'pending', 'processing', 'completed', 'failed'
  retryCount: integer('retry_count').default(0),
  maxRetries: integer('max_retries').default(3),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  errorMessage: text('error_message'),

  // Temporal data
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),

  // Versioning
  eventVersion: integer('event_version').default(1),
});

// ============================================================================
// TABLE: event_subscriptions
// ============================================================================

export const eventSubscriptions = pgTable('event_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Subscription details
  subscriberName: text('subscriber_name').notNull(),
  eventPattern: text('event_pattern').notNull(), // 'user.*', 'user.created', etc.

  // Subscriber configuration
  handlerFunction: text('handler_function'), // PostgreSQL function name
  webhookUrl: text('webhook_url'), // HTTP endpoint
  isActive: boolean('is_active').default(true),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
});

// ============================================================================
// TABLE: event_delivery_log
// ============================================================================

export const eventDeliveryLog = pgTable('event_delivery_log', {
  id: uuid('id').primaryKey().defaultRandom(),

  // References
  eventId: uuid('event_id').notNull(),
  subscriptionId: uuid('subscription_id').notNull(),

  // Delivery details
  attemptedAt: timestamp('attempted_at', { withTimezone: true }).defaultNow().notNull(),
  status: text('status').notNull(), // 'success', 'failure', 'timeout'
  responseCode: integer('response_code'),
  responseBody: text('response_body'),
  errorMessage: text('error_message'),
  durationMs: integer('duration_ms'),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(userProfiles, {
    fields: [events.userId],
    references: [userProfiles.id],
  }),
  deliveryLogs: many(eventDeliveryLog),
}));

export const eventSubscriptionsRelations = relations(eventSubscriptions, ({ many }) => ({
  deliveryLogs: many(eventDeliveryLog),
}));

export const eventDeliveryLogRelations = relations(eventDeliveryLog, ({ one }) => ({
  event: one(events, {
    fields: [eventDeliveryLog.eventId],
    references: [events.id],
  }),
  subscription: one(eventSubscriptions, {
    fields: [eventDeliveryLog.subscriptionId],
    references: [eventSubscriptions.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type EventSubscription = typeof eventSubscriptions.$inferSelect;
export type NewEventSubscription = typeof eventSubscriptions.$inferInsert;

export type EventDeliveryLog = typeof eventDeliveryLog.$inferSelect;
export type NewEventDeliveryLog = typeof eventDeliveryLog.$inferInsert;

// ============================================================================
// ENUMS
// ============================================================================

export const EventStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DEAD_LETTER: 'dead_letter',
} as const;

export const EventCategory = {
  USER: 'user',
  ACADEMY: 'academy',
  RECRUITING: 'recruiting',
  HR: 'hr',
  SYSTEM: 'system',
  BENCH_SALES: 'bench_sales',
  TALENT_ACQUISITION: 'talent_acquisition',
  CROSS_BORDER: 'cross_border',
} as const;

export const DeliveryStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  TIMEOUT: 'timeout',
  SKIPPED: 'skipped',
} as const;

export type EventStatusType = typeof EventStatus[keyof typeof EventStatus];
export type EventCategoryType = typeof EventCategory[keyof typeof EventCategory];
export type DeliveryStatusType = typeof DeliveryStatus[keyof typeof DeliveryStatus];

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface PublishEventParams {
  eventType: string;
  aggregateId?: string;
  payload: Record<string, any>;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface EventPayload<T = any> {
  data: T;
  timestamp: string;
  correlationId?: string;
  causationId?: string;
}
