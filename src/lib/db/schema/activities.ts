/**
 * Unified Activities Schema
 * 
 * A single table to track ALL work in the application:
 * - Past activities (emails, calls, meetings, notes)
 * - Future tasks (scheduled, open, follow-ups)
 * - With status lifecycle, escalations, and follow-up chains
 * 
 * This replaces both `activity_log` and `lead_tasks` tables.
 */

import { pgTable, uuid, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { userProfiles } from './user-profiles';
import { pointOfContacts } from './crm';

// =====================================================
// ENUMS
// =====================================================

export const activityStatusEnum = pgEnum('activity_status', [
  'scheduled',    // Future activity, not yet due
  'open',         // Due/actionable now
  'in_progress',  // Currently being worked on
  'completed',    // Done successfully
  'skipped',      // Intentionally skipped
  'cancelled',    // No longer needed
]);

export const activityTypeEnum = pgEnum('activity_type', [
  'email',
  'call',
  'meeting',
  'note',
  'linkedin_message',
  'task',
  'follow_up',
  'reminder',
]);

export const activityPriorityEnum = pgEnum('activity_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const activityOutcomeEnum = pgEnum('activity_outcome', [
  'positive',
  'neutral',
  'negative',
]);

export const activityDirectionEnum = pgEnum('activity_direction', [
  'inbound',
  'outbound',
]);

// =====================================================
// UNIFIED ACTIVITIES TABLE
// =====================================================

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  
  // ─────────────────────────────────────────────────────
  // Polymorphic Association
  // Allows activities to be linked to any entity type
  // ─────────────────────────────────────────────────────
  entityType: text('entity_type').notNull(), 
  // 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc'
  entityId: uuid('entity_id').notNull(),
  
  // ─────────────────────────────────────────────────────
  // Activity Type & Status
  // ─────────────────────────────────────────────────────
  activityType: text('activity_type').notNull(),
  // 'email' | 'call' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'follow_up' | 'reminder'
  
  status: text('status').notNull().default('open'),
  // 'scheduled' | 'open' | 'in_progress' | 'completed' | 'skipped' | 'cancelled'
  // REQUIRED: Every activity must have a status
  
  priority: text('priority').notNull().default('medium'),
  // 'low' | 'medium' | 'high' | 'urgent'
  
  // ─────────────────────────────────────────────────────
  // Content
  // ─────────────────────────────────────────────────────
  subject: text('subject'),
  body: text('body'),
  direction: text('direction'), // 'inbound' | 'outbound' (for emails, calls)
  
  // ─────────────────────────────────────────────────────
  // Timing (The Heart of Unified Model)
  // REQUIRED: Every activity must have a due date
  // ─────────────────────────────────────────────────────
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  // When the activity should happen (for scheduled/future activities)
  
  dueDate: timestamp('due_date', { withTimezone: true }).notNull().defaultNow(),
  // REQUIRED: Deadline for the activity - defaults to now for immediate activities
  
  escalationDate: timestamp('escalation_date', { withTimezone: true }),
  // When to escalate if not completed (triggers alerts)
  
  completedAt: timestamp('completed_at', { withTimezone: true }),
  // When the activity was actually completed
  
  skippedAt: timestamp('skipped_at', { withTimezone: true }),
  // When the activity was skipped (with reason in body)
  
  durationMinutes: integer('duration_minutes'),
  // For calls/meetings - how long it lasted
  
  // ─────────────────────────────────────────────────────
  // Outcome (for completed activities)
  // ─────────────────────────────────────────────────────
  outcome: text('outcome'), // 'positive' | 'neutral' | 'negative'
  
  // ─────────────────────────────────────────────────────
  // Assignment & Participants
  // REQUIRED: Every activity must have an owner
  // ─────────────────────────────────────────────────────
  assignedTo: uuid('assigned_to').notNull().references(() => userProfiles.id),
  // REQUIRED: Who owns/is responsible for this activity
  
  performedBy: uuid('performed_by').references(() => userProfiles.id),
  // Who actually performed it (set on completion, may differ from assignedTo)
  
  pocId: uuid('poc_id').references(() => pointOfContacts.id),
  // Point of contact involved (for external communications)
  
  // ─────────────────────────────────────────────────────
  // Follow-up Chain (Self-Referential)
  // Links activities together for tracking follow-ups
  // ─────────────────────────────────────────────────────
  parentActivityId: uuid('parent_activity_id'),
  // References activities.id - links follow-up to original activity
  // Note: Can't use .references() for self-ref in same table definition
  
  // ─────────────────────────────────────────────────────
  // Audit Trail
  // ─────────────────────────────────────────────────────
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

// =====================================================
// RELATIONS
// =====================================================

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [activities.orgId],
    references: [organizations.id],
  }),
  assignee: one(userProfiles, {
    fields: [activities.assignedTo],
    references: [userProfiles.id],
    relationName: 'activityAssignee',
  }),
  performer: one(userProfiles, {
    fields: [activities.performedBy],
    references: [userProfiles.id],
    relationName: 'activityPerformer',
  }),
  creator: one(userProfiles, {
    fields: [activities.createdBy],
    references: [userProfiles.id],
    relationName: 'activityCreator',
  }),
  pointOfContact: one(pointOfContacts, {
    fields: [activities.pocId],
    references: [pointOfContacts.id],
  }),
  // Self-referential: parent activity
  parentActivity: one(activities, {
    fields: [activities.parentActivityId],
    references: [activities.id],
    relationName: 'activityFollowUps',
  }),
  // Self-referential: child follow-ups
  followUps: many(activities, {
    relationName: 'activityFollowUps',
  }),
}));

// =====================================================
// TYPES
// =====================================================

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

// Status type for type safety
export type ActivityStatus = 'scheduled' | 'open' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';

// Activity type for type safety
export type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'follow_up' | 'reminder';

// Priority type
export type ActivityPriority = 'low' | 'medium' | 'high' | 'urgent';

// Outcome type
export type ActivityOutcome = 'positive' | 'neutral' | 'negative';

// Direction type
export type ActivityDirection = 'inbound' | 'outbound';

// =====================================================
// HELPER CONSTANTS
// =====================================================

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  scheduled: 'Scheduled',
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
  cancelled: 'Cancelled',
};

export const ACTIVITY_STATUS_COLORS: Record<ActivityStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  skipped: 'bg-stone-100 text-stone-500',
  cancelled: 'bg-red-100 text-red-700',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  note: 'Note',
  linkedin_message: 'LinkedIn',
  task: 'Task',
  follow_up: 'Follow-up',
  reminder: 'Reminder',
};

export const ACTIVITY_PRIORITY_LABELS: Record<ActivityPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const ACTIVITY_PRIORITY_COLORS: Record<ActivityPriority, string> = {
  low: 'bg-stone-100 text-stone-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

