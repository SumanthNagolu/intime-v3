/**
 * Drizzle ORM Schema: Workplan & Activity System
 *
 * Guidewire-inspired process tracking with activity patterns,
 * workplan templates, and runtime activity management.
 *
 * Core principle: "No work is done unless an activity is created"
 * - Activities = trackable work (calls, meetings, tasks)
 * - Events = system actions (state changes, notifications)
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
  decimal,
  index,
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
  checklist: jsonb('checklist'), // Array of checklist items (legacy - use patternChecklistItems)

  // Metadata
  isSystem: boolean('is_system').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueOrgCode: unique().on(table.orgId, table.code),
  entityTypeIdx: index('activity_patterns_entity_type_idx').on(table.entityType),
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
  fields: many(patternFields),
  checklistItems: many(patternChecklistItems),
}));

export type ActivityPattern = typeof activityPatterns.$inferSelect;
export type NewActivityPattern = typeof activityPatterns.$inferInsert;

// =====================================================
// PATTERN FIELDS (Custom Fields for Patterns)
// =====================================================

export const patternFields = pgTable('pattern_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  patternId: uuid('pattern_id').notNull().references(() => activityPatterns.id, { onDelete: 'cascade' }),

  // Field definition
  fieldName: text('field_name').notNull(),
  fieldLabel: text('field_label').notNull(),
  fieldType: text('field_type').notNull(), // 'text', 'number', 'date', 'select', 'multiselect', 'boolean'

  // Validation
  isRequired: boolean('is_required').default(false),
  defaultValue: text('default_value'),
  validationRules: jsonb('validation_rules'), // { min, max, pattern, options }

  // Display
  orderIndex: integer('order_index').default(0),
  placeholder: text('placeholder'),
  helpText: text('help_text'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniquePatternField: unique().on(table.patternId, table.fieldName),
}));

export const patternFieldsRelations = relations(patternFields, ({ one }) => ({
  pattern: one(activityPatterns, {
    fields: [patternFields.patternId],
    references: [activityPatterns.id],
  }),
}));

export type PatternField = typeof patternFields.$inferSelect;
export type NewPatternField = typeof patternFields.$inferInsert;

// =====================================================
// PATTERN CHECKLIST ITEMS
// =====================================================

export const patternChecklistItems = pgTable('pattern_checklist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  patternId: uuid('pattern_id').notNull().references(() => activityPatterns.id, { onDelete: 'cascade' }),

  // Item details
  itemText: text('item_text').notNull(),
  orderIndex: integer('order_index').default(0),
  isRequired: boolean('is_required').default(false),

  // Auto-completion
  autoCompleteCondition: jsonb('auto_complete_condition'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const patternChecklistItemsRelations = relations(patternChecklistItems, ({ one }) => ({
  pattern: one(activityPatterns, {
    fields: [patternChecklistItems.patternId],
    references: [activityPatterns.id],
  }),
}));

export type PatternChecklistItem = typeof patternChecklistItems.$inferSelect;
export type NewPatternChecklistItem = typeof patternChecklistItems.$inferInsert;

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
  phases: many(workplanPhases),
  instances: many(workplanInstances),
}));

export type WorkplanTemplate = typeof workplanTemplates.$inferSelect;
export type NewWorkplanTemplate = typeof workplanTemplates.$inferInsert;

// =====================================================
// WORKPLAN PHASES
// =====================================================

export const workplanPhases = pgTable('workplan_phases', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => workplanTemplates.id, { onDelete: 'cascade' }),

  // Phase details
  phaseName: text('phase_name').notNull(),
  phaseCode: text('phase_code').notNull(),
  description: text('description'),

  // Ordering
  orderIndex: integer('order_index').default(0),

  // Completion criteria
  completionCriteria: text('completion_criteria').default('all_required'), // 'all_required', 'all_activities', 'any', 'manual'

  // Auto-progression
  autoAdvance: boolean('auto_advance').default(true),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTemplatePhase: unique().on(table.templateId, table.phaseCode),
}));

export const workplanPhasesRelations = relations(workplanPhases, ({ one }) => ({
  template: one(workplanTemplates, {
    fields: [workplanPhases.templateId],
    references: [workplanTemplates.id],
  }),
}));

export type WorkplanPhase = typeof workplanPhases.$inferSelect;
export type NewWorkplanPhase = typeof workplanPhases.$inferInsert;

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
}, (table) => ({
  entityIdx: index('workplan_instances_entity_idx').on(table.entityType, table.entityId),
  statusIdx: index('workplan_instances_status_idx').on(table.status),
}));

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for Drizzle self-referencing table (predecessorActivityId references activities.id)
export const activities: any = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Human-readable identifier (NEW - per spec 11-activities.md)
  activityNumber: text('activity_number'), // e.g., "ACT-2025-00001" - generated by trigger

  // Link to pattern/workplan
  patternCode: text('pattern_code'),
  patternId: uuid('pattern_id').references(() => activityPatterns.id),
  workplanInstanceId: uuid('workplan_instance_id').references(() => workplanInstances.id, { onDelete: 'set null' }),

  // Link to entity (polymorphic - PRIMARY entity)
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),

  // Secondary entity (NEW - for cross-entity activities)
  secondaryEntityType: text('secondary_entity_type'),
  secondaryEntityId: uuid('secondary_entity_id'),

  // Activity type (CRITICAL for unified table)
  activityType: text('activity_type').notNull(), // 'email', 'call', 'meeting', 'note', 'task', 'interview', 'submission', etc.

  // Status (lifecycle: scheduled → open → in_progress → completed/skipped/canceled)
  status: text('status').notNull().default('open'), // 'scheduled', 'open', 'in_progress', 'completed', 'skipped', 'canceled', 'blocked'

  // Priority
  priority: text('priority').notNull().default('medium'), // 'low', 'normal', 'medium', 'high', 'urgent'

  // Activity details
  subject: text('subject'), // Nullable in DB
  body: text('body'), // Existing DB field - main content
  description: text('description'), // Additional description
  category: text('category'),
  direction: text('direction'), // 'inbound', 'outbound' for emails/calls

  // Instructions/checklist
  instructions: text('instructions'),
  checklist: jsonb('checklist'), // Legacy - use activityChecklistItems
  checklistProgress: jsonb('checklist_progress'),

  // Assignment (REQUIRED per spec)
  assignedTo: uuid('assigned_to').notNull().references(() => userProfiles.id),
  performedBy: uuid('performed_by').references(() => userProfiles.id), // Who actually performed it
  assignedGroup: uuid('assigned_group').references(() => pods.id),
  assignedAt: timestamp('assigned_at', { withTimezone: true }),
  pocId: uuid('poc_id').references(() => userProfiles.id), // Point of contact

  // Dates
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }), // Existing DB field
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(), // REQUIRED per spec
  escalationDate: timestamp('escalation_date', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  skippedAt: timestamp('skipped_at', { withTimezone: true }), // Existing DB field
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }), // For scheduled activities

  // Duration tracking
  durationMinutes: integer('duration_minutes'), // Existing DB field

  // Outcome
  outcome: text('outcome'),
  outcomeNotes: text('outcome_notes'),

  // Follow-up tracking (NEW - per spec)
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: timestamp('follow_up_date', { withTimezone: true }),
  followUpActivityId: uuid('follow_up_activity_id'), // Links to the created follow-up activity

  // Tags for categorization (NEW - per spec)
  tags: text('tags').array(),

  // Custom fields for extensibility
  customFields: jsonb('custom_fields'),

  // Automation flags
  autoCreated: boolean('auto_created').default(false),
  autoCompleted: boolean('auto_completed').default(false),

  // Predecessor tracking
  predecessorActivityId: uuid('predecessor_activity_id').references(() => activities.id),
  parentActivityId: uuid('parent_activity_id').references(() => activities.id), // For follow-up chains

  // Escalation tracking
  escalationCount: integer('escalation_count').default(0),
  lastEscalatedAt: timestamp('last_escalated_at', { withTimezone: true }),

  // Reminder tracking
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  reminderCount: integer('reminder_count').default(0),

  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
}, (table) => ({
  entityIdx: index('activities_entity_idx').on(table.entityType, table.entityId),
  assignedToIdx: index('activities_assigned_to_idx').on(table.assignedTo),
  statusIdx: index('activities_status_idx').on(table.status),
  dueDateIdx: index('activities_due_date_idx').on(table.dueDate),
  activityTypeIdx: index('activities_activity_type_idx').on(table.activityType),
}));

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
  performer: one(userProfiles, {
    fields: [activities.performedBy],
    references: [userProfiles.id],
    relationName: 'performer',
  }),
  pointOfContact: one(userProfiles, {
    fields: [activities.pocId],
    references: [userProfiles.id],
    relationName: 'pointOfContact',
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
  updater: one(userProfiles, {
    fields: [activities.updatedBy],
    references: [userProfiles.id],
    relationName: 'updater',
  }),
  predecessorActivity: one(activities, {
    fields: [activities.predecessorActivityId],
    references: [activities.id],
    relationName: 'predecessor',
  }),
  parentActivity: one(activities, {
    fields: [activities.parentActivityId],
    references: [activities.id],
    relationName: 'parent',
  }),
  successorActivities: many(activities, { relationName: 'predecessor' }),
  childActivities: many(activities, { relationName: 'parent' }),
  history: many(activityHistory),
  participants: many(activityParticipants),
  fieldValues: many(activityFieldValues),
  checklistItems: many(activityChecklistItems),
  comments: many(activityComments),
  attachments: many(activityAttachments),
  reminders: many(activityReminders),
  timeEntries: many(activityTimeEntries),
  dependencies: many(activityDependencies),
  slaInstances: many(slaInstances),
}));

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

// =====================================================
// ACTIVITY PARTICIPANTS (RCAI Model)
// =====================================================

export const activityParticipants = pgTable('activity_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => userProfiles.id),

  // RCAI role
  role: text('role').notNull(), // 'responsible', 'accountable', 'consulted', 'informed'

  // Permissions
  permission: text('permission').default('view'), // 'edit', 'view'
  isPrimary: boolean('is_primary').default(false),

  // Notification preferences
  notifyOnUpdate: boolean('notify_on_update').default(true),

  // Metadata
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  addedBy: uuid('added_by').references(() => userProfiles.id),
}, (table) => ({
  uniqueActivityUser: unique().on(table.activityId, table.userId),
  activityIdx: index('activity_participants_activity_idx').on(table.activityId),
  userIdx: index('activity_participants_user_idx').on(table.userId),
}));

export const activityParticipantsRelations = relations(activityParticipants, ({ one }) => ({
  activity: one(activities, {
    fields: [activityParticipants.activityId],
    references: [activities.id],
  }),
  user: one(userProfiles, {
    fields: [activityParticipants.userId],
    references: [userProfiles.id],
  }),
  adder: one(userProfiles, {
    fields: [activityParticipants.addedBy],
    references: [userProfiles.id],
    relationName: 'adder',
  }),
}));

export type ActivityParticipant = typeof activityParticipants.$inferSelect;
export type NewActivityParticipant = typeof activityParticipants.$inferInsert;

// =====================================================
// ACTIVITY FIELD VALUES
// =====================================================

export const activityFieldValues = pgTable('activity_field_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  fieldId: uuid('field_id').notNull().references(() => patternFields.id, { onDelete: 'cascade' }),

  // Value (stored as text, typed by field definition)
  fieldValue: text('field_value'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueActivityField: unique().on(table.activityId, table.fieldId),
}));

export const activityFieldValuesRelations = relations(activityFieldValues, ({ one }) => ({
  activity: one(activities, {
    fields: [activityFieldValues.activityId],
    references: [activities.id],
  }),
  field: one(patternFields, {
    fields: [activityFieldValues.fieldId],
    references: [patternFields.id],
  }),
}));

export type ActivityFieldValue = typeof activityFieldValues.$inferSelect;
export type NewActivityFieldValue = typeof activityFieldValues.$inferInsert;

// =====================================================
// ACTIVITY CHECKLIST ITEMS
// =====================================================

export const activityChecklistItems = pgTable('activity_checklist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  patternChecklistItemId: uuid('pattern_checklist_item_id').references(() => patternChecklistItems.id),

  // Item details
  itemText: text('item_text').notNull(),
  orderIndex: integer('order_index').default(0),

  // Completion
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => userProfiles.id),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const activityChecklistItemsRelations = relations(activityChecklistItems, ({ one }) => ({
  activity: one(activities, {
    fields: [activityChecklistItems.activityId],
    references: [activities.id],
  }),
  patternItem: one(patternChecklistItems, {
    fields: [activityChecklistItems.patternChecklistItemId],
    references: [patternChecklistItems.id],
  }),
  completedByUser: one(userProfiles, {
    fields: [activityChecklistItems.completedBy],
    references: [userProfiles.id],
  }),
}));

export type ActivityChecklistItem = typeof activityChecklistItems.$inferSelect;
export type NewActivityChecklistItem = typeof activityChecklistItems.$inferInsert;

// =====================================================
// ACTIVITY COMMENTS
// =====================================================

export const activityComments = pgTable('activity_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),

  // Comment details
  commentText: text('comment_text').notNull(),
  commentType: text('comment_type').default('comment'), // 'comment', 'note', 'system'

  // Threading
  parentCommentId: uuid('parent_comment_id'),

  // Mentions
  mentionedUsers: uuid('mentioned_users').array(),

  // Visibility
  isInternal: boolean('is_internal').default(false),

  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => userProfiles.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
}, (table) => ({
  activityIdx: index('activity_comments_activity_idx').on(table.activityId),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for self-referencing
export const activityCommentsRelations = relations(activityComments, ({ one, many }: any) => ({
  activity: one(activities, {
    fields: [activityComments.activityId],
    references: [activities.id],
  }),
  parentComment: one(activityComments, {
    fields: [activityComments.parentCommentId],
    references: [activityComments.id],
    relationName: 'parentComment',
  }),
  replies: many(activityComments, { relationName: 'parentComment' }),
  author: one(userProfiles, {
    fields: [activityComments.createdBy],
    references: [userProfiles.id],
  }),
}));

export type ActivityComment = typeof activityComments.$inferSelect;
export type NewActivityComment = typeof activityComments.$inferInsert;

// =====================================================
// ACTIVITY ATTACHMENTS
// =====================================================

export const activityAttachments = pgTable('activity_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),

  // File details
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'), // bytes
  fileType: text('file_type'), // MIME type
  fileUrl: text('file_url').notNull(),
  storageKey: text('storage_key'), // S3/storage key

  // Metadata
  description: text('description'),

  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Audit
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  uploadedBy: uuid('uploaded_by').notNull().references(() => userProfiles.id),
}, (table) => ({
  activityIdx: index('activity_attachments_activity_idx').on(table.activityId),
}));

export const activityAttachmentsRelations = relations(activityAttachments, ({ one }) => ({
  activity: one(activities, {
    fields: [activityAttachments.activityId],
    references: [activities.id],
  }),
  uploader: one(userProfiles, {
    fields: [activityAttachments.uploadedBy],
    references: [userProfiles.id],
  }),
}));

export type ActivityAttachment = typeof activityAttachments.$inferSelect;
export type NewActivityAttachment = typeof activityAttachments.$inferInsert;

// =====================================================
// ACTIVITY REMINDERS
// =====================================================

export const activityReminders = pgTable('activity_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => userProfiles.id),

  // Reminder timing
  remindAt: timestamp('remind_at', { withTimezone: true }).notNull(),
  reminderType: text('reminder_type').default('relative'), // 'relative', 'absolute'
  relativeDays: integer('relative_days'), // Days before due date
  relativeHours: integer('relative_hours'), // Hours before due date

  // Notification channel
  channel: text('channel').default('email'), // 'email', 'push', 'sms', 'in_app'

  // Status
  isSent: boolean('is_sent').default(false),
  sentAt: timestamp('sent_at', { withTimezone: true }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  activityIdx: index('activity_reminders_activity_idx').on(table.activityId),
  remindAtIdx: index('activity_reminders_remind_at_idx').on(table.remindAt),
}));

export const activityRemindersRelations = relations(activityReminders, ({ one }) => ({
  activity: one(activities, {
    fields: [activityReminders.activityId],
    references: [activities.id],
  }),
  user: one(userProfiles, {
    fields: [activityReminders.userId],
    references: [userProfiles.id],
  }),
}));

export type ActivityReminder = typeof activityReminders.$inferSelect;
export type NewActivityReminder = typeof activityReminders.$inferInsert;

// =====================================================
// ACTIVITY TIME ENTRIES
// =====================================================

export const activityTimeEntries = pgTable('activity_time_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => userProfiles.id),

  // Time tracking
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'), // Calculated or manual

  // Entry details
  description: text('description'),
  isBillable: boolean('is_billable').default(false),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  activityIdx: index('activity_time_entries_activity_idx').on(table.activityId),
  userIdx: index('activity_time_entries_user_idx').on(table.userId),
}));

export const activityTimeEntriesRelations = relations(activityTimeEntries, ({ one }) => ({
  activity: one(activities, {
    fields: [activityTimeEntries.activityId],
    references: [activities.id],
  }),
  user: one(userProfiles, {
    fields: [activityTimeEntries.userId],
    references: [userProfiles.id],
  }),
}));

export type ActivityTimeEntry = typeof activityTimeEntries.$inferSelect;
export type NewActivityTimeEntry = typeof activityTimeEntries.$inferInsert;

// =====================================================
// ACTIVITY DEPENDENCIES
// =====================================================

export const activityDependencies = pgTable('activity_dependencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  dependsOnActivityId: uuid('depends_on_activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),

  // Dependency type
  dependencyType: text('dependency_type').default('finish_to_start'), // 'finish_to_start', 'start_to_start', 'finish_to_finish'

  // Lag time
  lagDays: integer('lag_days').default(0),

  // Enforcement
  isStrict: boolean('is_strict').default(true), // Block or just warn

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueDependency: unique().on(table.activityId, table.dependsOnActivityId),
  activityIdx: index('activity_dependencies_activity_idx').on(table.activityId),
}));

export const activityDependenciesRelations = relations(activityDependencies, ({ one }) => ({
  activity: one(activities, {
    fields: [activityDependencies.activityId],
    references: [activities.id],
    relationName: 'dependentActivity',
  }),
  dependsOnActivity: one(activities, {
    fields: [activityDependencies.dependsOnActivityId],
    references: [activities.id],
    relationName: 'blockingActivity',
  }),
}));

export type ActivityDependency = typeof activityDependencies.$inferSelect;
export type NewActivityDependency = typeof activityDependencies.$inferInsert;

// =====================================================
// ACTIVITY AUTO RULES (Event-Driven Auto-Creation)
// =====================================================

export const activityAutoRules = pgTable('activity_auto_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),

  // Rule identity
  ruleName: text('rule_name').notNull(),
  ruleCode: text('rule_code').notNull(),
  description: text('description'),

  // Trigger configuration
  eventType: text('event_type').notNull(), // 'job.created', 'submission.status_changed', etc.
  eventCategory: text('event_category').notNull(),
  entityType: text('entity_type').notNull(),

  // Condition
  condition: jsonb('condition'), // { field: 'status', operator: 'equals', value: 'submitted' }

  // Action: Create Activity
  activityPatternId: uuid('activity_pattern_id').notNull().references(() => activityPatterns.id),
  delayDays: integer('delay_days').default(0),
  delayHours: integer('delay_hours').default(0),

  // Assignment override
  assignToField: text('assign_to_field'), // 'event.actor_id', 'entity.owner_id'
  assignToUserId: uuid('assign_to_user_id').references(() => userProfiles.id),
  assignToGroupId: uuid('assign_to_group_id').references(() => pods.id),

  // Metadata
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0), // Execution order
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueOrgCode: unique().on(table.orgId, table.ruleCode),
  eventTypeIdx: index('activity_auto_rules_event_type_idx').on(table.eventType),
}));

export const activityAutoRulesRelations = relations(activityAutoRules, ({ one }) => ({
  organization: one(organizations, {
    fields: [activityAutoRules.orgId],
    references: [organizations.id],
  }),
  activityPattern: one(activityPatterns, {
    fields: [activityAutoRules.activityPatternId],
    references: [activityPatterns.id],
  }),
  assignToUser: one(userProfiles, {
    fields: [activityAutoRules.assignToUserId],
    references: [userProfiles.id],
  }),
  assignToGroup: one(pods, {
    fields: [activityAutoRules.assignToGroupId],
    references: [pods.id],
  }),
}));

export type ActivityAutoRule = typeof activityAutoRules.$inferSelect;
export type NewActivityAutoRule = typeof activityAutoRules.$inferInsert;

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
}, (table) => ({
  activityIdx: index('activity_history_activity_idx').on(table.activityId),
  changedAtIdx: index('activity_history_changed_at_idx').on(table.changedAt),
}));

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

// =====================================================
// SLA DEFINITIONS
// =====================================================

export const slaDefinitions = pgTable('sla_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),

  // SLA identity
  slaName: text('sla_name').notNull(),
  slaCode: text('sla_code').notNull(),
  description: text('description'),

  // Applicability
  entityType: text('entity_type').notNull(), // 'activity', 'submission', 'job'
  activityType: text('activity_type'), // If entity_type = 'activity'
  activityCategory: text('activity_category'),
  priority: text('priority'), // Apply to specific priority

  // SLA thresholds (in hours)
  targetHours: integer('target_hours').notNull(),
  warningHours: integer('warning_hours'), // Warning threshold
  criticalHours: integer('critical_hours'), // Critical threshold

  // Business hours
  useBusinessHours: boolean('use_business_hours').default(false),
  businessHoursStart: text('business_hours_start').default('09:00'),
  businessHoursEnd: text('business_hours_end').default('17:00'),

  // Escalation
  escalateOnBreach: boolean('escalate_on_breach').default(false),
  escalateToUserId: uuid('escalate_to_user_id').references(() => userProfiles.id),
  escalateToGroupId: uuid('escalate_to_group_id').references(() => pods.id),

  // Metadata
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueOrgCode: unique().on(table.orgId, table.slaCode),
}));

export const slaDefinitionsRelations = relations(slaDefinitions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [slaDefinitions.orgId],
    references: [organizations.id],
  }),
  escalateToUser: one(userProfiles, {
    fields: [slaDefinitions.escalateToUserId],
    references: [userProfiles.id],
  }),
  escalateToGroup: one(pods, {
    fields: [slaDefinitions.escalateToGroupId],
    references: [pods.id],
  }),
  instances: many(slaInstances),
}));

export type SlaDefinition = typeof slaDefinitions.$inferSelect;
export type NewSlaDefinition = typeof slaDefinitions.$inferInsert;

// =====================================================
// SLA INSTANCES (Tracking)
// =====================================================

export const slaInstances = pgTable('sla_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  slaDefinitionId: uuid('sla_definition_id').notNull().references(() => slaDefinitions.id),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),

  // SLA tracking
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  targetTime: timestamp('target_time', { withTimezone: true }).notNull(),
  warningTime: timestamp('warning_time', { withTimezone: true }),
  criticalTime: timestamp('critical_time', { withTimezone: true }),

  // Completion
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // SLA status
  status: text('status').default('active'), // 'active', 'met', 'warning', 'critical', 'breached', 'paused'
  pausedAt: timestamp('paused_at', { withTimezone: true }),
  resumedAt: timestamp('resumed_at', { withTimezone: true }),

  // Breach tracking
  breachDuration: integer('breach_duration'), // Minutes breached
  isBreached: boolean('is_breached').default(false),
  breachedAt: timestamp('breached_at', { withTimezone: true }),

  // Escalation tracking
  escalationSent: boolean('escalation_sent').default(false),
  escalationSentAt: timestamp('escalation_sent_at', { withTimezone: true }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  activityIdx: index('sla_instances_activity_idx').on(table.activityId),
  statusIdx: index('sla_instances_status_idx').on(table.status),
  targetTimeIdx: index('sla_instances_target_time_idx').on(table.targetTime),
}));

export const slaInstancesRelations = relations(slaInstances, ({ one }) => ({
  organization: one(organizations, {
    fields: [slaInstances.orgId],
    references: [organizations.id],
  }),
  slaDefinition: one(slaDefinitions, {
    fields: [slaInstances.slaDefinitionId],
    references: [slaDefinitions.id],
  }),
  activity: one(activities, {
    fields: [slaInstances.activityId],
    references: [activities.id],
  }),
}));

export type SlaInstance = typeof slaInstances.$inferSelect;
export type NewSlaInstance = typeof slaInstances.$inferInsert;

// =====================================================
// WORK QUEUES
// =====================================================

export const workQueues = pgTable('work_queues', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),

  // Queue identity
  queueName: text('queue_name').notNull(),
  queueCode: text('queue_code').notNull(),
  description: text('description'),

  // Queue configuration
  queueType: text('queue_type').default('activity'), // 'activity', 'submission', 'lead'
  entityType: text('entity_type'),

  // Assignment
  assignedToGroupId: uuid('assigned_to_group_id').references(() => pods.id),
  assignmentStrategy: text('assignment_strategy').default('round_robin'), // 'round_robin', 'load_balanced', 'manual'

  // Filtering
  filterCriteria: jsonb('filter_criteria'), // Auto-populate queue based on criteria

  // Display
  sortOrder: text('sort_order').default('priority_desc'), // 'priority_desc', 'due_date_asc', etc.

  // Metadata
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueOrgCode: unique().on(table.orgId, table.queueCode),
}));

export const workQueuesRelations = relations(workQueues, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [workQueues.orgId],
    references: [organizations.id],
  }),
  assignedToGroup: one(pods, {
    fields: [workQueues.assignedToGroupId],
    references: [pods.id],
  }),
  queueItems: many(queueItems),
}));

export type WorkQueue = typeof workQueues.$inferSelect;
export type NewWorkQueue = typeof workQueues.$inferInsert;

// =====================================================
// QUEUE ITEMS
// =====================================================

export const queueItems = pgTable('queue_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  queueId: uuid('queue_id').notNull().references(() => workQueues.id, { onDelete: 'cascade' }),

  // Link to entity (polymorphic)
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),

  // Queue position
  priority: integer('priority').default(0), // Higher = higher priority
  orderIndex: integer('order_index').default(0),

  // Assignment
  assignedTo: uuid('assigned_to').references(() => userProfiles.id),
  assignedAt: timestamp('assigned_at', { withTimezone: true }),

  // Status
  status: text('status').default('queued'), // 'queued', 'assigned', 'in_progress', 'completed', 'removed'

  // Timestamps
  enqueuedAt: timestamp('enqueued_at', { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  removedAt: timestamp('removed_at', { withTimezone: true }),

  // Metadata
  metadata: jsonb('metadata'), // Additional context
}, (table) => ({
  queueIdx: index('queue_items_queue_idx').on(table.queueId),
  entityIdx: index('queue_items_entity_idx').on(table.entityType, table.entityId),
  statusIdx: index('queue_items_status_idx').on(table.status),
  uniqueQueueEntity: unique().on(table.queueId, table.entityType, table.entityId),
}));

export const queueItemsRelations = relations(queueItems, ({ one }) => ({
  queue: one(workQueues, {
    fields: [queueItems.queueId],
    references: [workQueues.id],
  }),
  assignee: one(userProfiles, {
    fields: [queueItems.assignedTo],
    references: [userProfiles.id],
  }),
}));

export type QueueItem = typeof queueItems.$inferSelect;
export type NewQueueItem = typeof queueItems.$inferInsert;

// =====================================================
// BULK ACTIVITY JOBS
// =====================================================

export const bulkActivityJobs = pgTable('bulk_activity_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Job details
  jobName: text('job_name').notNull(),
  jobType: text('job_type').notNull(), // 'create_activities', 'update_activities', 'assign_activities', 'complete_activities'

  // Target configuration
  activityPatternId: uuid('activity_pattern_id').references(() => activityPatterns.id),
  targetEntityType: text('target_entity_type'), // 'job', 'lead', 'submission'
  targetEntityIds: uuid('target_entity_ids').array(), // List of entity IDs
  targetCriteria: jsonb('target_criteria'), // Or criteria to select entities

  // Operation details
  operation: jsonb('operation').notNull(), // { action: 'create', params: {...} }

  // Progress tracking
  status: text('status').default('pending'), // 'pending', 'running', 'completed', 'failed', 'canceled'
  totalItems: integer('total_items').default(0),
  processedItems: integer('processed_items').default(0),
  failedItems: integer('failed_items').default(0),

  // Results
  errorLog: jsonb('error_log'), // Array of errors
  resultSummary: jsonb('result_summary'),

  // Timestamps
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),

  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').notNull().references(() => userProfiles.id),
}, (table) => ({
  statusIdx: index('bulk_activity_jobs_status_idx').on(table.status),
  createdByIdx: index('bulk_activity_jobs_created_by_idx').on(table.createdBy),
}));

export const bulkActivityJobsRelations = relations(bulkActivityJobs, ({ one }) => ({
  organization: one(organizations, {
    fields: [bulkActivityJobs.orgId],
    references: [organizations.id],
  }),
  activityPattern: one(activityPatterns, {
    fields: [bulkActivityJobs.activityPatternId],
    references: [activityPatterns.id],
  }),
  creator: one(userProfiles, {
    fields: [bulkActivityJobs.createdBy],
    references: [userProfiles.id],
  }),
}));

export type BulkActivityJob = typeof bulkActivityJobs.$inferSelect;
export type NewBulkActivityJob = typeof bulkActivityJobs.$inferInsert;

// =====================================================
// ACTIVITY METRICS (Aggregated)
// =====================================================

export const activityMetrics = pgTable('activity_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Dimension (what this metric is for)
  metricDate: timestamp('metric_date', { withTimezone: true }).notNull(), // Daily rollup
  entityType: text('entity_type'), // Metrics by entity type
  activityType: text('activity_type'), // Metrics by activity type
  activityCategory: text('activity_category'),
  userId: uuid('user_id').references(() => userProfiles.id), // Metrics by user
  podId: uuid('pod_id').references(() => pods.id), // Metrics by team

  // Volume metrics
  totalActivities: integer('total_activities').default(0),
  createdActivities: integer('created_activities').default(0),
  completedActivities: integer('completed_activities').default(0),
  overdueActivities: integer('overdue_activities').default(0),

  // Completion metrics
  completionRate: decimal('completion_rate', { precision: 5, scale: 2 }), // Percentage
  avgCompletionTimeHours: decimal('avg_completion_time_hours', { precision: 10, scale: 2 }),

  // SLA metrics
  slaMetCount: integer('sla_met_count').default(0),
  slaBreachedCount: integer('sla_breached_count').default(0),
  slaComplianceRate: decimal('sla_compliance_rate', { precision: 5, scale: 2 }),

  // Time tracking
  totalTimeMinutes: integer('total_time_minutes').default(0),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  dateIdx: index('activity_metrics_date_idx').on(table.metricDate),
  userIdx: index('activity_metrics_user_idx').on(table.userId),
  podIdx: index('activity_metrics_pod_idx').on(table.podId),
}));

export const activityMetricsRelations = relations(activityMetrics, ({ one }) => ({
  organization: one(organizations, {
    fields: [activityMetrics.orgId],
    references: [organizations.id],
  }),
  user: one(userProfiles, {
    fields: [activityMetrics.userId],
    references: [userProfiles.id],
  }),
  pod: one(pods, {
    fields: [activityMetrics.podId],
    references: [pods.id],
  }),
}));

export type ActivityMetric = typeof activityMetrics.$inferSelect;
export type NewActivityMetric = typeof activityMetrics.$inferInsert;

// =====================================================
// TEAM METRICS (Aggregated by Pod/Team)
// =====================================================

export const teamMetrics = pgTable('team_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  podId: uuid('pod_id').notNull().references(() => pods.id),

  // Time dimension
  metricDate: timestamp('metric_date', { withTimezone: true }).notNull(),
  metricPeriod: text('metric_period').default('day'), // 'day', 'week', 'month', 'quarter'

  // Team performance
  totalActivities: integer('total_activities').default(0),
  completedActivities: integer('completed_activities').default(0),
  avgResponseTimeHours: decimal('avg_response_time_hours', { precision: 10, scale: 2 }),
  avgResolutionTimeHours: decimal('avg_resolution_time_hours', { precision: 10, scale: 2 }),

  // Workload distribution
  totalActiveMembers: integer('total_active_members').default(0),
  avgActivitiesPerMember: decimal('avg_activities_per_member', { precision: 10, scale: 2 }),

  // SLA performance
  slaComplianceRate: decimal('sla_compliance_rate', { precision: 5, scale: 2 }),

  // Productivity
  activitiesCreatedPerDay: decimal('activities_created_per_day', { precision: 10, scale: 2 }),
  activitiesCompletedPerDay: decimal('activities_completed_per_day', { precision: 10, scale: 2 }),

  // Quality indicators
  escalationCount: integer('escalation_count').default(0),
  reassignmentCount: integer('reassignment_count').default(0),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  dateIdx: index('team_metrics_date_idx').on(table.metricDate),
  podIdx: index('team_metrics_pod_idx').on(table.podId),
  uniquePodDate: unique().on(table.podId, table.metricDate, table.metricPeriod),
}));

export const teamMetricsRelations = relations(teamMetrics, ({ one }) => ({
  organization: one(organizations, {
    fields: [teamMetrics.orgId],
    references: [organizations.id],
  }),
  pod: one(pods, {
    fields: [teamMetrics.podId],
    references: [pods.id],
  }),
}));

export type TeamMetric = typeof teamMetrics.$inferSelect;
export type NewTeamMetric = typeof teamMetrics.$inferInsert;

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export const ActivityStatus = {
  SCHEDULED: 'scheduled',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  CANCELED: 'canceled',
  BLOCKED: 'blocked',
} as const;

export const ActivityType = {
  EMAIL: 'email',
  CALL: 'call',
  MEETING: 'meeting',
  NOTE: 'note',
  TASK: 'task',
  FOLLOW_UP: 'follow_up',
} as const;

export const ActivityPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const ParticipantRole = {
  RESPONSIBLE: 'responsible',
  ACCOUNTABLE: 'accountable',
  CONSULTED: 'consulted',
  INFORMED: 'informed',
} as const;

export const SlaStatus = {
  ACTIVE: 'active',
  MET: 'met',
  WARNING: 'warning',
  CRITICAL: 'critical',
  BREACHED: 'breached',
  PAUSED: 'paused',
} as const;

export const WorkplanStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
} as const;

export type ActivityStatusType = typeof ActivityStatus[keyof typeof ActivityStatus];
export type ActivityTypeValue = typeof ActivityType[keyof typeof ActivityType];
export type ActivityPriorityType = typeof ActivityPriority[keyof typeof ActivityPriority];
export type ParticipantRoleType = typeof ParticipantRole[keyof typeof ParticipantRole];
export type SlaStatusType = typeof SlaStatus[keyof typeof SlaStatus];
export type WorkplanStatusType = typeof WorkplanStatus[keyof typeof WorkplanStatus];
