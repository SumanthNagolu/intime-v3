     1|/**
     2| * Unified Activities Schema
     3| * 
     4| * A single table to track ALL work in the application:
     5| * - Past activities (emails, calls, meetings, notes)
     6| * - Future tasks (scheduled, open, follow-ups)
     7| * - With status lifecycle, escalations, and follow-up chains
     8| * 
     9| * This replaces both `activity_log` and `lead_tasks` tables.
    10| */
    11|
    12|import { pgTable, uuid, text, timestamp, integer, pgEnum, boolean, jsonb } from 'drizzle-orm/pg-core';
    13|import { relations } from 'drizzle-orm';
    14|import { organizations } from './organizations';
    15|import { userProfiles } from './user-profiles';
    16|import { pointOfContacts } from './crm';
    17|
    18|// =====================================================
    19|// ENUMS
    20|// =====================================================
    21|
    22|export const activityStatusEnum = pgEnum('activity_status', [
    23|  'scheduled',    // Future activity, not yet due
    24|  'open',         // Due/actionable now
    25|  'in_progress',  // Currently being worked on
    26|  'completed',    // Done successfully
    27|  'skipped',      // Intentionally skipped
    28|  'cancelled',    // No longer needed
    29|]);
    30|
    31|export const activityTypeEnum = pgEnum('activity_type', [
    32|  'email',
    33|  'call',
    34|  'meeting',
    35|  'note',
    36|  'linkedin_message',
    37|  'task',
    38|  'follow_up',
    39|  'reminder',
    40|]);
    41|
    42|export const activityPriorityEnum = pgEnum('activity_priority', [
    43|  'low',
    44|  'medium',
    45|  'high',
    46|  'urgent',
    47|]);
    48|
    49|export const activityOutcomeEnum = pgEnum('activity_outcome', [
    50|  'positive',
    51|  'neutral',
    52|  'negative',
    53|]);
    54|
    55|export const activityDirectionEnum = pgEnum('activity_direction', [
    56|  'inbound',
    57|  'outbound',
    58|]);
    59|
    60|// =====================================================
    61|// UNIFIED ACTIVITIES TABLE
    62|// =====================================================
    63|
    64|export const activities = pgTable('activities', {
    65|  id: uuid('id').primaryKey().defaultRandom(),
    66|  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    67|  
    68|  // ─────────────────────────────────────────────────────
    69|  // Polymorphic Association
    70|  // Allows activities to be linked to any entity type
    71|  // ─────────────────────────────────────────────────────
    72|  entityType: text('entity_type').notNull(), 
    73|  // 'lead' | 'deal' | 'account' | 'candidate' | 'submission' | 'job' | 'poc'
    74|  entityId: uuid('entity_id').notNull(),
    75|  
    76|  // ─────────────────────────────────────────────────────
    77|  // Activity Type & Status
    78|  // ─────────────────────────────────────────────────────
    79|  activityType: text('activity_type').notNull(),
    80|  // 'email' | 'call' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'follow_up' | 'reminder'
    81|  
    82|  status: text('status').notNull().default('open'),
    83|  // 'scheduled' | 'open' | 'in_progress' | 'completed' | 'skipped' | 'cancelled'
    84|  // REQUIRED: Every activity must have a status
    85|  
    86|  priority: text('priority').notNull().default('medium'),
    87|  // 'low' | 'medium' | 'high' | 'urgent'
    88|  
    89|  // ─────────────────────────────────────────────────────
    90|  // Content
    91|  // ─────────────────────────────────────────────────────
    92|  subject: text('subject'),
    93|  body: text('body'),
    94|  direction: text('direction'), // 'inbound' | 'outbound' (for emails, calls)
    95|  
    96|  // ─────────────────────────────────────────────────────
    97|  // Timing (The Heart of Unified Model)
    98|  // REQUIRED: Every activity must have a due date
    99|  // ─────────────────────────────────────────────────────
   100|  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
   101|  // When the activity should happen (for scheduled/future activities)
   102|  
   103|  dueDate: timestamp('due_date', { withTimezone: true }).notNull().defaultNow(),
   104|  // REQUIRED: Deadline for the activity - defaults to now for immediate activities
   105|  
   106|  escalationDate: timestamp('escalation_date', { withTimezone: true }),
   107|  // When to escalate if not completed (triggers alerts)
   108|  
   109|  completedAt: timestamp('completed_at', { withTimezone: true }),
   110|  // When the activity was actually completed
   111|  
   112|  skippedAt: timestamp('skipped_at', { withTimezone: true }),
   113|  // When the activity was skipped (with reason in body)
   114|  
   115|  durationMinutes: integer('duration_minutes'),
   116|  // For calls/meetings - how long it lasted
   117|  
   118|  // ─────────────────────────────────────────────────────
   119|  // Outcome (for completed activities)
   120|  // ─────────────────────────────────────────────────────
   121|  outcome: text('outcome'), // 'positive' | 'neutral' | 'negative'
   122|  
   123|  // ─────────────────────────────────────────────────────
   124|  // Assignment & Participants
   125|  // REQUIRED: Every activity must have an owner
   126|  // ─────────────────────────────────────────────────────
   127|  assignedTo: uuid('assigned_to').notNull().references(() => userProfiles.id),
   128|  // REQUIRED: Who owns/is responsible for this activity
   129|  
   130|  performedBy: uuid('performed_by').references(() => userProfiles.id),
   131|  // Who actually performed it (set on completion, may differ from assignedTo)
   132|  
   133|  pocId: uuid('poc_id').references(() => pointOfContacts.id),
   134|  // Point of contact involved (for external communications)
   135|  
   136|  // ─────────────────────────────────────────────────────
   137|  // Follow-up Chain (Self-Referential)
   138|  // Links activities together for tracking follow-ups
   139|  // ─────────────────────────────────────────────────────
   140|  parentActivityId: uuid('parent_activity_id'),
   141|  // References activities.id - links follow-up to original activity
   142|  // Note: Can't use .references() for self-ref in same table definition
   143|  
   144|  // ─────────────────────────────────────────────────────
   145|  // Auto-Activity Link
   146|  // ─────────────────────────────────────────────────────
   147|  activityPatternId: uuid('activity_pattern_id'), // Link to pattern if auto-created (FK added later)
   148|  isAutoCreated: boolean('is_auto_created').default(false),
   149|
   150|  // ─────────────────────────────────────────────────────
   151|  // Audit Trail
   152|  // ─────────────────────────────────────────────────────
   153|  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
   154|  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
   155|  createdBy: uuid('created_by').references(() => userProfiles.id),
   156|});
   157|
   158|// =====================================================
   159|// ACTIVITY PATTERNS TABLE (For Auto-Activities)
   160|// =====================================================
   161|
   162|export const activityPatterns = pgTable('activity_patterns', {
   163|  id: uuid('id').primaryKey().defaultRandom(),
   164|  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
   165|  
   166|  // Pattern Identity
   167|  patternCode: text('pattern_code').notNull().unique(), // e.g. 'CAND_SUBMITTED_FOLLOWUP'
   168|  name: text('name').notNull(),
   169|  description: text('description'),
   170|
   171|  // Trigger Configuration
   172|  triggerEvent: text('trigger_event').notNull(), // e.g. 'candidate.submitted'
   173|  triggerConditions: jsonb('trigger_conditions').$type<Array<{
   174|    field: string;
   175|    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
   176|    value: any;
   177|  }>>().default([]),
   178|
   179|  // Activity Template
   180|  activityType: text('activity_type').notNull(), // matches activityTypeEnum
   181|  subjectTemplate: text('subject_template').notNull(),
   182|  descriptionTemplate: text('description_template'),
   183|  priority: text('priority').notNull().default('medium'),
   184|
   185|  // Assignment Rule
   186|  assignTo: jsonb('assign_to').notNull(), // { type: 'owner' | 'role' | 'user', value?: string }
   187|
   188|  // Timing
   189|  dueOffsetHours: integer('due_offset_hours'),
   190|  dueOffsetBusinessDays: integer('due_offset_business_days'),
   191|  specificTime: text('specific_time'), // HH:MM
   192|
   193|  // Configuration
   194|  isActive: boolean('is_active').default(true),
   195|  isSystem: boolean('is_system').default(false),
   196|  canBeSkipped: boolean('can_be_skipped').default(false),
   197|  requiresOutcome: boolean('requires_outcome').default(true),
   198|
   199|  // SLA
   200|  slaWarningHours: integer('sla_warning_hours'),
   201|  slaBreachHours: integer('sla_breach_hours'),
   202|
   203|  // Metadata
   204|  tags: text('tags').array(),
   205|  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
   206|  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
   207|});
   208|
   209|// =====================================================
   210|// RELATIONS
   211|// =====================================================
   212|
   213|export const activitiesRelations = relations(activities, ({ one, many }) => ({
   214|  organization: one(organizations, {
   215|    fields: [activities.orgId],
   216|    references: [organizations.id],
   217|  }),
   218|  assignee: one(userProfiles, {
   219|    fields: [activities.assignedTo],
   220|    references: [userProfiles.id],
   221|    relationName: 'activityAssignee',
   222|  }),
   223|  performer: one(userProfiles, {
   224|    fields: [activities.performedBy],
   225|    references: [userProfiles.id],
   226|    relationName: 'activityPerformer',
   227|  }),
   228|  creator: one(userProfiles, {
   229|    fields: [activities.createdBy],
   230|    references: [userProfiles.id],
   231|    relationName: 'activityCreator',
   232|  }),
   233|  pointOfContact: one(pointOfContacts, {
   234|    fields: [activities.pocId],
   235|    references: [pointOfContacts.id],
   236|  }),
   237|  // Self-referential: parent activity
   238|  parentActivity: one(activities, {
   239|    fields: [activities.parentActivityId],
   240|    references: [activities.id],
   241|    relationName: 'activityFollowUps',
   242|  }),
   243|  // Self-referential: child follow-ups
   244|  followUps: many(activities, {
   245|    relationName: 'activityFollowUps',
   246|  }),
   247|  // Pattern link
   248|  pattern: one(activityPatterns, {
   249|    fields: [activities.activityPatternId],
   250|    references: [activityPatterns.id],
   251|  }),
   252|}));
   253|
   254|export const activityPatternsRelations = relations(activityPatterns, ({ one, many }) => ({
   255|  organization: one(organizations, {
   256|    fields: [activityPatterns.orgId],
   257|    references: [organizations.id],
   258|  }),
   259|  activities: many(activities),
   260|}));
   261|
   262|// =====================================================
   263|// TYPES
   264|// =====================================================
   265|
   266|export type Activity = typeof activities.$inferSelect;
   267|export type NewActivity = typeof activities.$inferInsert;
   268|
   269|export type ActivityPattern = typeof activityPatterns.$inferSelect;
   270|export type NewActivityPattern = typeof activityPatterns.$inferInsert;
   271|
   272|// Status type for type safety
   273|export type ActivityStatus = 'scheduled' | 'open' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
   274|
   275|// Activity type for type safety
   276|export type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'follow_up' | 'reminder';
   277|
   278|// Priority type
   279|export type ActivityPriority = 'low' | 'medium' | 'high' | 'urgent';
   280|
   281|// Outcome type
   282|export type ActivityOutcome = 'positive' | 'neutral' | 'negative';
   283|
   284|// Direction type
   285|export type ActivityDirection = 'inbound' | 'outbound';
   286|
   287|// =====================================================
   288|// HELPER CONSTANTS
   289|// =====================================================
   290|
   291|export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
   292|  scheduled: 'Scheduled',
   293|  open: 'Open',
   294|  in_progress: 'In Progress',
   295|  completed: 'Completed',
   296|  skipped: 'Skipped',
   297|  cancelled: 'Cancelled',
   298|};
   299|
   300|export const ACTIVITY_STATUS_COLORS: Record<ActivityStatus, string> = {
   301|  scheduled: 'bg-blue-100 text-blue-700',
   302|  open: 'bg-amber-100 text-amber-700',
   303|  in_progress: 'bg-purple-100 text-purple-700',
   304|  completed: 'bg-green-100 text-green-700',
   305|  skipped: 'bg-stone-100 text-stone-500',
   306|  cancelled: 'bg-red-100 text-red-700',
   307|};
   308|
   309|export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
   310|  email: 'Email',
   311|  call: 'Call',
   312|  meeting: 'Meeting',
   313|  note: 'Note',
   314|  linkedin_message: 'LinkedIn',
   315|  task: 'Task',
   316|  follow_up: 'Follow-up',
   317|  reminder: 'Reminder',
   318|};
   319|
   320|export const ACTIVITY_PRIORITY_LABELS: Record<ActivityPriority, string> = {
   321|  low: 'Low',
   322|  medium: 'Medium',
   323|  high: 'High',
   324|  urgent: 'Urgent',
   325|};
   326|
   327|export const ACTIVITY_PRIORITY_COLORS: Record<ActivityPriority, string> = {
   328|  low: 'bg-stone-100 text-stone-600',
   329|  medium: 'bg-blue-100 text-blue-600',
   330|  high: 'bg-amber-100 text-amber-700',
   331|  urgent: 'bg-red-100 text-red-700',
   332|};
   333|
   334|