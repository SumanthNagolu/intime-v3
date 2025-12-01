/**
 * SLA (Service Level Agreement) Schema
 * 
 * Implements: src/types/core/sla.types.ts
 * Related: docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 * 
 * Provides SLA definition and tracking for time-sensitive business operations.
 * 
 * SLA Metrics Include:
 * - Candidate first contact (24 hours)
 * - Job first submission (5 days)
 * - Client response time (48 hours)
 * - Day 1 check-in (same day)
 * - And more...
 */

import { pgTable, uuid, text, timestamp, boolean, integer, numeric, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { userProfiles } from './user-profiles';

// =====================================================
// ENUMS
// =====================================================

export const slaStatusEnum = pgEnum('sla_status', [
  'on_track',   // Within normal time
  'warning',    // Approaching threshold
  'breach',     // Exceeded threshold
  'completed',  // Finished (may or may not have breached)
]);

export const slaMetricEnum = pgEnum('sla_metric', [
  // Candidate SLAs
  'first_contact',         // Time to first contact after sourcing
  'resume_review',         // Time to review resume
  'submission_followup',   // Time to follow up on submission
  // Job SLAs
  'first_submission',      // Time to first candidate submission
  'weekly_update',         // Frequency of client updates
  // Submission SLAs
  'client_response',       // Time to get client feedback
  'interview_schedule',    // Time to schedule interview after approval
  // Placement SLAs
  'day1_checkin',          // Time for day 1 check-in
  'week1_checkin',         // Time for week 1 check-in
  'timesheet_submission',  // Timesheet submission deadline
]);

export const slaRecipientEnum = pgEnum('sla_recipient', [
  'owner',           // Entity owner (R)
  'accountable',     // Entity accountable (A)
  'manager',         // Pod manager
  'regional',        // Regional director
  'coo',             // COO
]);

// =====================================================
// SLA DEFINITIONS TABLE
// =====================================================

/**
 * SLA Definitions - Configuration for SLA rules
 * 
 * Organization-level SLA configuration that defines thresholds
 * and notification settings for each metric type.
 */
export const slaDefinitions = pgTable('sla_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // ─────────────────────────────────────────────────────
  // What this SLA applies to
  // ─────────────────────────────────────────────────────
  entityType: text('entity_type').notNull(),
  // 'candidate', 'job', 'submission', 'placement', etc.

  metric: text('metric').notNull(),
  // 'first_contact', 'first_submission', 'client_response', etc.

  // ─────────────────────────────────────────────────────
  // Thresholds (in hours)
  // ─────────────────────────────────────────────────────
  warningThreshold: integer('warning_threshold').notNull(),
  // Hours before warning alert

  breachThreshold: integer('breach_threshold').notNull(),
  // Hours before breach

  // ─────────────────────────────────────────────────────
  // Notification Configuration
  // ─────────────────────────────────────────────────────
  notifyOnWarning: boolean('notify_on_warning').default(true),
  notifyOnBreach: boolean('notify_on_breach').default(true),

  warningRecipients: text('warning_recipients').array().default([]),
  // ['owner', 'manager']

  breachRecipients: text('breach_recipients').array().default([]),
  // ['owner', 'manager', 'coo']

  // ─────────────────────────────────────────────────────
  // Configuration
  // ─────────────────────────────────────────────────────
  isActive: boolean('is_active').default(true),

  businessHoursOnly: boolean('business_hours_only').default(true),
  // If true, only count business hours (9-6)

  excludeWeekends: boolean('exclude_weekends').default(true),
  // If true, don't count weekends

  // ─────────────────────────────────────────────────────
  // Display
  // ─────────────────────────────────────────────────────
  name: text('name'),
  description: text('description'),

  // ─────────────────────────────────────────────────────
  // Audit Trail
  // ─────────────────────────────────────────────────────
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
}, (table) => ({
  orgIdIdx: index('idx_sla_definitions_org_id').on(table.orgId),
  entityMetricIdx: index('idx_sla_definitions_entity_metric').on(table.entityType, table.metric),
  activeIdx: index('idx_sla_definitions_active').on(table.isActive),
}));

// =====================================================
// SLA TRACKING TABLE
// =====================================================

/**
 * SLA Tracking - Active SLA tracking records
 * 
 * Created when an SLA-triggering event occurs.
 * Updated as time progresses and when the SLA is completed.
 */
export const slaTracking = pgTable('sla_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // ─────────────────────────────────────────────────────
  // References
  // ─────────────────────────────────────────────────────
  definitionId: uuid('definition_id').notNull().references(() => slaDefinitions.id, { onDelete: 'cascade' }),

  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),

  metric: text('metric').notNull(),
  // Denormalized for easier querying

  // ─────────────────────────────────────────────────────
  // Timestamps
  // ─────────────────────────────────────────────────────
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  // When the SLA clock started

  warningAt: timestamp('warning_at', { withTimezone: true }).notNull(),
  // When warning threshold will be hit

  breachAt: timestamp('breach_at', { withTimezone: true }).notNull(),
  // When breach threshold will be hit

  completedAt: timestamp('completed_at', { withTimezone: true }),
  // When the SLA was completed

  // ─────────────────────────────────────────────────────
  // Status
  // ─────────────────────────────────────────────────────
  status: text('status').notNull().default('on_track'),
  // 'on_track' | 'warning' | 'breach' | 'completed'

  // ─────────────────────────────────────────────────────
  // Results (when completed)
  // ─────────────────────────────────────────────────────
  wasBreached: boolean('was_breached'),
  // TRUE if SLA was breached before completion

  actualDurationHours: numeric('actual_duration_hours', { precision: 10, scale: 2 }),
  // Actual time taken (in hours)

  // ─────────────────────────────────────────────────────
  // Audit Trail
  // ─────────────────────────────────────────────────────
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgIdIdx: index('idx_sla_tracking_org_id').on(table.orgId),
  entityIdx: index('idx_sla_tracking_entity').on(table.entityType, table.entityId),
  statusIdx: index('idx_sla_tracking_status').on(table.status),
  breachAtIdx: index('idx_sla_tracking_breach_at').on(table.breachAt),
  warningAtIdx: index('idx_sla_tracking_warning_at').on(table.warningAt),
}));

// =====================================================
// SLA VIOLATIONS TABLE
// =====================================================

/**
 * SLA Violations - Record of breaches
 * 
 * Created when a warning or breach threshold is crossed.
 * Provides history for reporting and analysis.
 */
export const slaViolations = pgTable('sla_violations', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // ─────────────────────────────────────────────────────
  // References
  // ─────────────────────────────────────────────────────
  trackingId: uuid('tracking_id').notNull().references(() => slaTracking.id, { onDelete: 'cascade' }),

  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  metric: text('metric').notNull(),

  // ─────────────────────────────────────────────────────
  // Violation Details
  // ─────────────────────────────────────────────────────
  violationType: text('violation_type').notNull(),
  // 'warning' | 'breach'

  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),

  thresholdHours: integer('threshold_hours').notNull(),
  // The threshold that was crossed

  actualHours: numeric('actual_hours', { precision: 10, scale: 2 }).notNull(),
  // Actual time at violation

  // ─────────────────────────────────────────────────────
  // Notifications
  // ─────────────────────────────────────────────────────
  notificationsSent: text('notifications_sent').array().default([]),
  // User IDs that were notified

  // ─────────────────────────────────────────────────────
  // Resolution
  // ─────────────────────────────────────────────────────
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolvedBy: uuid('resolved_by').references(() => userProfiles.id),
  resolutionNotes: text('resolution_notes'),

  // ─────────────────────────────────────────────────────
  // Audit Trail
  // ─────────────────────────────────────────────────────
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgIdIdx: index('idx_sla_violations_org_id').on(table.orgId),
  entityIdx: index('idx_sla_violations_entity').on(table.entityType, table.entityId),
  violationTypeIdx: index('idx_sla_violations_type').on(table.violationType),
  occurredAtIdx: index('idx_sla_violations_occurred_at').on(table.occurredAt),
}));

// =====================================================
// RELATIONS
// =====================================================

export const slaDefinitionsRelations = relations(slaDefinitions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [slaDefinitions.orgId],
    references: [organizations.id],
  }),
  createdByUser: one(userProfiles, {
    fields: [slaDefinitions.createdBy],
    references: [userProfiles.id],
  }),
  tracking: many(slaTracking),
}));

export const slaTrackingRelations = relations(slaTracking, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [slaTracking.orgId],
    references: [organizations.id],
  }),
  definition: one(slaDefinitions, {
    fields: [slaTracking.definitionId],
    references: [slaDefinitions.id],
  }),
  violations: many(slaViolations),
}));

export const slaViolationsRelations = relations(slaViolations, ({ one }) => ({
  organization: one(organizations, {
    fields: [slaViolations.orgId],
    references: [organizations.id],
  }),
  tracking: one(slaTracking, {
    fields: [slaViolations.trackingId],
    references: [slaTracking.id],
  }),
  resolvedByUser: one(userProfiles, {
    fields: [slaViolations.resolvedBy],
    references: [userProfiles.id],
  }),
}));

// =====================================================
// TYPES
// =====================================================

export type SLADefinition = typeof slaDefinitions.$inferSelect;
export type NewSLADefinition = typeof slaDefinitions.$inferInsert;

export type SLATracking = typeof slaTracking.$inferSelect;
export type NewSLATracking = typeof slaTracking.$inferInsert;

export type SLAViolation = typeof slaViolations.$inferSelect;
export type NewSLAViolation = typeof slaViolations.$inferInsert;

// Enum types
export type SLAStatus = 'on_track' | 'warning' | 'breach' | 'completed';

export type SLAMetric =
  | 'first_contact'
  | 'resume_review'
  | 'submission_followup'
  | 'first_submission'
  | 'weekly_update'
  | 'client_response'
  | 'interview_schedule'
  | 'day1_checkin'
  | 'week1_checkin'
  | 'timesheet_submission';

export type SLARecipient = 'owner' | 'accountable' | 'manager' | 'regional' | 'coo';

export type ViolationType = 'warning' | 'breach';

// =====================================================
// CONSTANTS
// =====================================================

/**
 * SLA Metric Labels
 */
export const SLA_METRIC_LABELS: Record<SLAMetric, string> = {
  first_contact: 'First Contact',
  resume_review: 'Resume Review',
  submission_followup: 'Submission Follow-up',
  first_submission: 'First Submission',
  weekly_update: 'Weekly Update',
  client_response: 'Client Response',
  interview_schedule: 'Interview Scheduling',
  day1_checkin: 'Day 1 Check-in',
  week1_checkin: 'Week 1 Check-in',
  timesheet_submission: 'Timesheet Submission',
};

/**
 * SLA Status Colors
 */
export const SLA_STATUS_COLORS: Record<SLAStatus, string> = {
  on_track: 'green',
  warning: 'yellow',
  breach: 'red',
  completed: 'gray',
};

/**
 * Default SLA configurations
 */
export const DEFAULT_SLA_CONFIGS: Array<{
  entityType: string;
  metric: SLAMetric;
  warningThreshold: number;
  breachThreshold: number;
  warningRecipients: SLARecipient[];
  breachRecipients: SLARecipient[];
}> = [
  // Candidate SLAs
  {
    entityType: 'candidate',
    metric: 'first_contact',
    warningThreshold: 4,   // 4 hours
    breachThreshold: 24,   // 24 hours
    warningRecipients: ['owner'],
    breachRecipients: ['owner', 'manager'],
  },
  // Job SLAs
  {
    entityType: 'job',
    metric: 'first_submission',
    warningThreshold: 72,  // 3 days
    breachThreshold: 120,  // 5 days
    warningRecipients: ['owner'],
    breachRecipients: ['owner', 'manager', 'coo'],
  },
  // Submission SLAs
  {
    entityType: 'submission',
    metric: 'client_response',
    warningThreshold: 24,  // 1 day
    breachThreshold: 48,   // 2 days
    warningRecipients: ['owner'],
    breachRecipients: ['owner', 'manager'],
  },
  // Placement SLAs
  {
    entityType: 'placement',
    metric: 'day1_checkin',
    warningThreshold: 8,   // End of first day
    breachThreshold: 24,   // Next day
    warningRecipients: ['owner'],
    breachRecipients: ['owner', 'manager'],
  },
];

// =====================================================
// SQL FOR MIGRATIONS
// =====================================================

/**
 * SQL to create RLS policies for SLA tables
 */
export const SLA_RLS_SQL = `
-- Enable RLS on all SLA tables
ALTER TABLE sla_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_violations ENABLE ROW LEVEL SECURITY;

-- Organization isolation policies
CREATE POLICY "sla_definitions_org_isolation" ON sla_definitions
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "sla_tracking_org_isolation" ON sla_tracking
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "sla_violations_org_isolation" ON sla_violations
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);
`;

/**
 * SQL to create triggers for SLA tables
 */
export const SLA_TRIGGERS_SQL = `
-- Trigger: Updated at for definitions
CREATE TRIGGER sla_definitions_updated_at
  BEFORE UPDATE ON sla_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Updated at for tracking
CREATE TRIGGER sla_tracking_updated_at
  BEFORE UPDATE ON sla_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update SLA status based on time
CREATE OR REPLACE FUNCTION update_sla_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL THEN
    NEW.status := 'completed';
    NEW.was_breached := NEW.completed_at > OLD.breach_at;
    NEW.actual_duration_hours := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) / 3600;
  ELSIF NOW() >= NEW.breach_at THEN
    NEW.status := 'breach';
  ELSIF NOW() >= NEW.warning_at THEN
    NEW.status := 'warning';
  ELSE
    NEW.status := 'on_track';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sla_tracking_update_status
  BEFORE UPDATE ON sla_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_sla_status();
`;

