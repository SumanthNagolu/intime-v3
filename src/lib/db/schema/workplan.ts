/**
 * Drizzle ORM Schema: Workplan & Activity System
 *
 * Guidewire-inspired process tracking with activity patterns,
 * workplan templates, and runtime activity management.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { userProfiles } from './user-profiles';
import { pods } from './ta-hr';

// =====================================================
// ACTIVITY PATTERNS (Templates)
// =====================================================

export const activityPatterns = pgTable('activity_patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),

  // Identity
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),

  // Timing
  targetDays: integer('target_days').default(1),
  escalationDays: integer('escalation_days'),

  // Assignment defaults
  defaultAssignee: text('default_assignee').default('owner'), // 'owner', 'group', 'user', 'auto'
  assigneeGroupId: uuid('assignee_group_id').references(() => pods.id),
  assigneeUserId: uuid('assignee_user_id').references(() => userProfiles.id),

  // Priority
  priority: text('priority').default('normal'), // 'low', 'normal', 'high', 'urgent'

  // Automation
  autoComplete: boolean('auto_complete').default(false),
  autoCompleteCondition: jsonb('auto_complete_condition'),
  autoAction: text('auto_action'), // 'create_interview', 'create_offer', etc.
  autoActionConfig: jsonb('auto_action_config'),

  // Categorization
  category: text('category'),
  entityType: text('entity_type').notNull(), // 'job', 'lead', 'submission'

  // Instructions
  instructions: text('instructions'),
  checklist: jsonb('checklist'), // Array of checklist items

  // Metadata
  isSystem: boolean('is_system').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueOrgCode: unique().on(table.orgId, table.code),
}));

export const activityPatternsRelations = relations(activityPatterns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [activityPatterns.orgId],
    references: [organizations.id],
  }),
  assigneeGroup: one(pods, {
    fields: [activityPatterns.assigneeGroupId],
    references: [pods.id],
  }),
  assigneeUser: one(userProfiles, {
    fields: [activityPatterns.assigneeUserId],
    references: [userProfiles.id],
  }),
  successors: many(activityPatternSuccessors),
}));

export type ActivityPattern = typeof activityPatterns.$inferSelect;
export type NewActivityPattern = typeof activityPatterns.$inferInsert;

// =====================================================
// ACTIVITY PATTERN SUCCESSORS
// =====================================================

export const activityPatternSuccessors = pgTable('activity_pattern_successors', {
  id: uuid('id').primaryKey().defaultRandom(),
  patternId: uuid('pattern_id').notNull().references(() => activityPatterns.id, { onDelete: 'cascade' }),
  successorPatternId: uuid('successor_pattern_id').notNull().references(() => activityPatterns.id, { onDelete: 'cascade' }),

  // Conditional triggering
  conditionType: text('condition_type').default('always'), // 'always', 'field_equals', 'field_in', 'expression'
  conditionField: text('condition_field'),
  conditionValue: text('condition_value'),
  conditionExpression: jsonb('condition_expression'),

  // Timing
  delayDays: integer('delay_days').default(0),

  // Order
  orderIndex: integer('order_index').default(0),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueSuccessor: unique().on(table.patternId, table.successorPatternId),
}));

export const activityPatternSuccessorsRelations = relations(activityPatternSuccessors, ({ one }) => ({
  pattern: one(activityPatterns, {
    fields: [activityPatternSuccessors.patternId],
    references: [activityPatterns.id],
    relationName: 'patternSuccessors',
  }),
  successorPattern: one(activityPatterns, {
    fields: [activityPatternSuccessors.successorPatternId],
    references: [activityPatterns.id],
    relationName: 'successorPattern',
  }),
}));

export type ActivityPatternSuccessor = typeof activityPatternSuccessors.$inferSelect;
export type NewActivityPatternSuccessor = typeof activityPatternSuccessors.$inferInsert;

// =====================================================
// WORKPLAN TEMPLATES
// =====================================================

export const workplanTemplates = pgTable('workplan_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),

  // Identity
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),

  // Entity type
  entityType: text('entity_type').notNull(),

  // Trigger configuration
  triggerEvent: text('trigger_event').default('manual'), // 'create', 'status_change', 'field_change', 'manual'
  triggerStatus: text('trigger_status'),
  triggerField: text('trigger_field'),
  triggerCondition: jsonb('trigger_condition'),

  // Completion criteria
  completionCriteria: text('completion_criteria').default('all_required'), // 'all_required', 'all_activities', 'manual'

  // Metadata
  isSystem: boolean('is_system').default(false),
  isActive: boolean('is_active').default(true),
  version: integer('version').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueOrgCode: unique().on(table.orgId, table.code),
}));

export const workplanTemplatesRelations = relations(workplanTemplates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [workplanTemplates.orgId],
    references: [organizations.id],
  }),
  templateActivities: many(workplanTemplateActivities),
  instances: many(workplanInstances),
}));

export type WorkplanTemplate = typeof workplanTemplates.$inferSelect;
export type NewWorkplanTemplate = typeof workplanTemplates.$inferInsert;

// =====================================================
// WORKPLAN TEMPLATE ACTIVITIES
// =====================================================

export const workplanTemplateActivities = pgTable('workplan_template_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => workplanTemplates.id, { onDelete: 'cascade' }),
  patternId: uuid('pattern_id').notNull().references(() => activityPatterns.id, { onDelete: 'cascade' }),

  // Ordering
  orderIndex: integer('order_index').notNull().default(0),
  phase: text('phase'), // 'sourcing', 'screening', 'closing'

  // Requirements
  isRequired: boolean('is_required').default(true),
  skipCondition: jsonb('skip_condition'),

  // Parallel execution
  canRunParallel: boolean('can_run_parallel').default(false),
  dependsOnActivityIds: uuid('depends_on_activity_ids').array(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTemplatePattern: unique().on(table.templateId, table.patternId),
}));

export const workplanTemplateActivitiesRelations = relations(workplanTemplateActivities, ({ one }) => ({
  template: one(workplanTemplates, {
    fields: [workplanTemplateActivities.templateId],
    references: [workplanTemplates.id],
  }),
  pattern: one(activityPatterns, {
    fields: [workplanTemplateActivities.patternId],
    references: [activityPatterns.id],
  }),
}));

export type WorkplanTemplateActivity = typeof workplanTemplateActivities.$inferSelect;
export type NewWorkplanTemplateActivity = typeof workplanTemplateActivities.$inferInsert;

// =====================================================
// WORKPLAN INSTANCES (Runtime)
// =====================================================

export const workplanInstances = pgTable('workplan_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => workplanTemplates.id),

  // Link to entity (polymorphic)
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),

  // Template info (denormalized)
  templateCode: text('template_code'),
  templateName: text('template_name'),

  // Status
  status: text('status').default('active'), // 'active', 'paused', 'completed', 'canceled'

  // Progress tracking
  totalActivities: integer('total_activities').default(0),
  completedActivities: integer('completed_activities').default(0),
  skippedActivities: integer('skipped_activities').default(0),
  // progressPercentage is generated column in DB

  // Current phase
  currentPhase: text('current_phase'),

  // Dates
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  pausedAt: timestamp('paused_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),

  // Outcome
  outcome: text('outcome'),
  outcomeNotes: text('outcome_notes'),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const workplanInstancesRelations = relations(workplanInstances, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [workplanInstances.orgId],
    references: [organizations.id],
  }),
  template: one(workplanTemplates, {
    fields: [workplanInstances.templateId],
    references: [workplanTemplates.id],
  }),
  creator: one(userProfiles, {
    fields: [workplanInstances.createdBy],
    references: [userProfiles.id],
  }),
  activities: many(activities),
}));

export type WorkplanInstance = typeof workplanInstances.$inferSelect;
export type NewWorkplanInstance = typeof workplanInstances.$inferInsert;

// =====================================================
// ACTIVITIES (Runtime)
// =====================================================

export const activities: any = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Link to pattern/workplan
  patternCode: text('pattern_code'),
  patternId: uuid('pattern_id').references(() => activityPatterns.id),
  workplanInstanceId: uuid('workplan_instance_id').references(() => workplanInstances.id, { onDelete: 'set null' }),

  // Link to entity (polymorphic)
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),

  // Activity details
  subject: text('subject').notNull(),
  description: text('description'),
  priority: text('priority').default('normal'), // 'low', 'normal', 'high', 'urgent'
  category: text('category'),

  // Instructions/checklist
  instructions: text('instructions'),
  checklist: jsonb('checklist'),
  checklistProgress: jsonb('checklist_progress'),

  // Assignment
  assignedTo: uuid('assigned_to').references(() => userProfiles.id),
  assignedGroup: uuid('assigned_group').references(() => pods.id),
  assignedAt: timestamp('assigned_at', { withTimezone: true }),

  // Dates
  dueDate: timestamp('due_date', { withTimezone: true }),
  escalationDate: timestamp('escalation_date', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Status
  status: text('status').default('open'), // 'open', 'in_progress', 'completed', 'skipped', 'canceled', 'blocked'

  // Outcome
  outcome: text('outcome'),
  outcomeNotes: text('outcome_notes'),

  // Automation flags
  autoCreated: boolean('auto_created').default(false),
  autoCompleted: boolean('auto_completed').default(false),

  // Predecessor tracking
  predecessorActivityId: uuid('predecessor_activity_id').references(() => activities.id),

  // Escalation tracking
  escalationCount: integer('escalation_count').default(0),
  lastEscalatedAt: timestamp('last_escalated_at', { withTimezone: true }),

  // Reminder tracking
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  reminderCount: integer('reminder_count').default(0),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
});

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [activities.orgId],
    references: [organizations.id],
  }),
  pattern: one(activityPatterns, {
    fields: [activities.patternId],
    references: [activityPatterns.id],
  }),
  workplanInstance: one(workplanInstances, {
    fields: [activities.workplanInstanceId],
    references: [workplanInstances.id],
  }),
  assignee: one(userProfiles, {
    fields: [activities.assignedTo],
    references: [userProfiles.id],
    relationName: 'assignee',
  }),
  group: one(pods, {
    fields: [activities.assignedGroup],
    references: [pods.id],
  }),
  creator: one(userProfiles, {
    fields: [activities.createdBy],
    references: [userProfiles.id],
    relationName: 'creator',
  }),
  predecessorActivity: one(activities, {
    fields: [activities.predecessorActivityId],
    references: [activities.id],
    relationName: 'predecessor',
  }),
  successorActivities: many(activities, { relationName: 'predecessor' }),
  history: many(activityHistory),
}));

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

// =====================================================
// ACTIVITY HISTORY
// =====================================================

export const activityHistory = pgTable('activity_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),

  // What changed
  action: text('action').notNull(), // 'created', 'status_changed', 'assigned', 'escalated', 'updated'
  fieldChanged: text('field_changed'),
  oldValue: text('old_value'),
  newValue: text('new_value'),

  // Who/when
  changedBy: uuid('changed_by').references(() => userProfiles.id),
  changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),

  // Context
  notes: text('notes'),
});

export const activityHistoryRelations = relations(activityHistory, ({ one }) => ({
  activity: one(activities, {
    fields: [activityHistory.activityId],
    references: [activities.id],
  }),
  changedByUser: one(userProfiles, {
    fields: [activityHistory.changedBy],
    references: [userProfiles.id],
  }),
}));

export type ActivityHistory = typeof activityHistory.$inferSelect;
export type NewActivityHistory = typeof activityHistory.$inferInsert;
