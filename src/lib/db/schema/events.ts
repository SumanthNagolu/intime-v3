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
import { organizations } from './organizations';

// ============================================================================
// TABLE: events
// ============================================================================

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Multi-tenancy
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Event identification
  eventType: text('event_type').notNull(), // 'user.created', 'course.graduated', etc.
  eventCategory: text('event_category').notNull(), // 'user', 'academy', 'recruiting', etc.

  // Severity (NEW - per spec)
  severity: text('severity').default('info'), // 'debug', 'info', 'warning', 'error', 'critical'

  // Entity identification (polymorphic - NEW)
  entityType: text('entity_type'), // 'job', 'candidate', 'submission', etc.
  entityId: uuid('entity_id'),
  aggregateId: uuid('aggregate_id'), // Legacy: use entityId

  // Actor information (enhanced)
  actorType: text('actor_type').default('user'), // 'user', 'system', 'api', 'webhook'
  actorId: uuid('actor_id'), // User ID or system identifier
  userId: uuid('user_id'), // Legacy: use actorId
  userEmail: text('user_email'),

  // Event payload (enhanced)
  eventData: jsonb('event_data').$type<Record<string, unknown>>().default({}),
  payload: jsonb('payload').$type<Record<string, unknown>>().default({}), // Legacy: use eventData
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),

  // Related entities (NEW - for linking multiple entities)
  relatedEntities: jsonb('related_entities').$type<Array<{
    entityType: string;
    entityId: string;
    relationship: string;
  }>>().default([]),

  // Correlation (NEW - for linking related events)
  correlationId: text('correlation_id'),
  causationId: text('causation_id'), // ID of event that caused this event
  parentEventId: uuid('parent_event_id'),

  // Event status and delivery
  status: text('status').default('pending'), // 'pending', 'processing', 'completed', 'failed'
  retryCount: integer('retry_count').default(0),
  maxRetries: integer('max_retries').default(3),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  errorMessage: text('error_message'),

  // Temporal data
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(), // When event actually happened
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), // When recorded in DB
  processedAt: timestamp('processed_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),

  // Versioning
  eventVersion: integer('event_version').default(1),

  // Idempotency key (for deduplication)
  idempotencyKey: text('idempotency_key'),
});

// ============================================================================
// TABLE: event_subscriptions
// ============================================================================

export const eventSubscriptions = pgTable('event_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Multi-tenancy (NEW)
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),

  // User subscription (NEW - per spec)
  userId: uuid('user_id').references(() => userProfiles.id, { onDelete: 'cascade' }),

  // Subscription details
  subscriberName: text('subscriber_name').notNull(),
  eventPattern: text('event_pattern').notNull(), // 'user.*', 'user.created', etc.

  // Channel (NEW - per spec)
  channel: text('channel').notNull().default('email'), // 'email', 'push', 'sms', 'webhook', 'in_app'

  // Subscriber configuration
  handlerFunction: text('handler_function'), // PostgreSQL function name
  webhookUrl: text('webhook_url'), // HTTP endpoint
  isActive: boolean('is_active').default(true),

  // Subscription preferences (NEW)
  frequency: text('frequency').default('immediate'), // 'immediate', 'hourly', 'daily', 'weekly'
  digest: boolean('digest').default(false),

  // Filter criteria (NEW - for fine-grained control)
  filterCriteria: jsonb('filter_criteria').$type<{
    entityTypes?: string[];
    severities?: string[];
    actorTypes?: string[];
  }>().default({}),

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

  // Multi-tenancy
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

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

export const eventSubscriptionsRelations = relations(eventSubscriptions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [eventSubscriptions.orgId],
    references: [organizations.id],
  }),
  user: one(userProfiles, {
    fields: [eventSubscriptions.userId],
    references: [userProfiles.id],
  }),
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
// NEW ENUMS (Per spec)
// ============================================================================

export const EventSeverity = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export type EventSeverityType = typeof EventSeverity[keyof typeof EventSeverity];

// NotificationChannel is defined in shared.ts - use that for consistency

export const NotificationFrequency = {
  IMMEDIATE: 'immediate',
  HOURLY: 'hourly',
  DAILY: 'daily',
  WEEKLY: 'weekly',
} as const;

export type NotificationFrequencyType = typeof NotificationFrequency[keyof typeof NotificationFrequency];

export const ActorType = {
  USER: 'user',
  SYSTEM: 'system',
  API: 'api',
  WEBHOOK: 'webhook',
} as const;

export type ActorTypeValue = typeof ActorType[keyof typeof ActorType];

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface PublishEventParams {
  eventType: string;
  aggregateId?: string;
  payload: Record<string, unknown>;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface EventPayload<T = unknown> {
  data: T;
  timestamp: string;
  correlationId?: string;
  causationId?: string;
}
