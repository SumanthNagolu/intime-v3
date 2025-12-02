---
name: database
description: Drizzle ORM and Supabase database patterns for InTime v3
---

# Database Skill - Drizzle ORM + Supabase

## Schema File Locations
```
src/lib/db/schema/
├── user-profiles.ts    # Users, candidates
├── organizations.ts    # Multi-tenancy
├── rbac.ts            # Roles, permissions
├── ats.ts             # Jobs, submissions, interviews, offers, placements
├── crm.ts             # Accounts, leads, deals, POCs
├── bench.ts           # Bench consultants
├── ta-hr.ts           # HR/TA tables
├── academy.ts         # Courses, enrollments, XP, certificates
├── workplan.ts        # Workplan templates, activities, patterns (Guidewire-inspired)
├── audit.ts           # Audit logging
├── events.ts          # Event system
└── shared.ts          # Cross-module entities
```

## Entity Categories

Entities are categorized by their relationship to the Workplan/Activity system:

| Category | Entities | Workplan | Activity Logging |
|----------|----------|----------|------------------|
| **Root** | lead, job, submission, deal, placement | Yes - auto-created | Yes - all operations |
| **Supporting** | account, contact, candidate, interview, offer | No | Optional |
| **Platform** | user, organization, role, permission | No | Audit only |

**Root entities** drive business workflows and get automatic workplan creation on insert.

## Table Definition Pattern
```typescript
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';

export const tableName = pgTable('table_name', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),

  // Fields...
  name: text('name').notNull(),
  status: text('status').default('active'),

  // Audit fields (always include)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // Soft delete
});

// Type exports
export type TableName = typeof tableName.$inferSelect;
export type NewTableName = typeof tableName.$inferInsert;
```

## Relations Pattern
```typescript
export const tableNameRelations = relations(tableName, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tableName.orgId],
    references: [organizations.id],
  }),
  children: many(childTable),
}));
```

## Query Patterns

### With Org Isolation (Required)
```typescript
import { db } from '@/lib/db';
import { eq, and, isNull } from 'drizzle-orm';

// Always filter by orgId and soft delete
const results = await db.select()
  .from(tableName)
  .where(and(
    eq(tableName.orgId, orgId),
    isNull(tableName.deletedAt)
  ));
```

### ⚠️ AVOID Drizzle Relational Queries
**WARNING**: Drizzle's relational query API (`db.query.*.findFirst({ with: {...} })`) generates lateral join SQL that can fail in PostgreSQL. Use explicit queries instead.

```typescript
// ❌ DON'T - This can generate failing lateral join SQL
const result = await db.query.tableName.findFirst({
  where: eq(tableName.id, id),
  with: {
    organization: true,
    children: true,
  },
});

// ✅ DO - Use explicit queries with Promise.all
const [itemResults, childrenResults] = await Promise.all([
  db.select()
    .from(tableName)
    .where(and(
      eq(tableName.id, id),
      eq(tableName.orgId, orgId),
      isNull(tableName.deletedAt)
    ))
    .limit(1),
  db.select()
    .from(childTable)
    .where(eq(childTable.parentId, id)),
]);

const item = itemResults[0];
if (!item) throw new Error('Not found');

return {
  ...item,
  children: childrenResults,
};
```

### Insert with Returning
```typescript
const [created] = await db.insert(tableName)
  .values({
    orgId,
    name: input.name,
    createdBy: userId,
  })
  .returning();
```

### Soft Delete
```typescript
await db.update(tableName)
  .set({ deletedAt: new Date() })
  .where(eq(tableName.id, id));
```

## Migration Commands
```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Push directly to database (dev only)
npx drizzle-kit push

# Regenerate Supabase types
npx supabase gen types typescript --project-id gkwhxmvugnjwwwiufmdy > src/types/supabase.ts
```

## TypeScript Type Handling (CRITICAL)

Drizzle ORM has specific type behaviors that differ from what you might expect:

### Numeric Columns Return Strings
```typescript
// Schema: numeric('rate_min', { precision: 10, scale: 2 })
// Runtime type: string (not number!)

// BAD - TypeScript error
const rate: number = job.rateMin;

// GOOD - Parse when needed for calculations
const rate = job.rateMin ? parseFloat(job.rateMin) : null;

// GOOD - Keep as string for display
const display = job.rateMin ?? 'N/A';
```

### Date/Timestamp Columns Return Strings
```typescript
// Schema: timestamp('created_at', { withTimezone: true })
// Runtime type: string (ISO format)

// BAD - No .toISOString() method
job.createdAt.toISOString();

// GOOD - Already a string
const dateStr = job.createdAt;

// GOOD - Convert when Date object needed
const date = new Date(job.createdAt);
```

### Relations Are NOT Loaded By Default
```typescript
// BAD - Relations don't exist on query results
const clientName = job.account.name; // Error!

// GOOD - Use the ID field instead
const accountId = job.accountId;

// GOOD - Explicitly include relations (with caution - see above warning)
const [job] = await db.select()
  .from(jobs)
  .leftJoin(accounts, eq(jobs.accountId, accounts.id))
  .where(eq(jobs.id, jobId));
```

### Self-Referential Foreign Keys Need Type Hint
```typescript
// BAD - Circular type inference error
parentTaskId: uuid('parent_task_id').references(() => tasks.id),

// GOOD - Add explicit return type
parentTaskId: uuid('parent_task_id').references((): any => tasks.id),
```

### Nullable Field Handling
```typescript
// BAD - Type mismatch
const status: string = record.status; // Error if nullable!

// GOOD - Provide defaults with nullish coalescing
const status = record.status ?? 'pending';
const isActive = record.isActive ?? false;
const count = record.count ?? 0;
```

## Common Enums (from academy.ts)
```typescript
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['pending', 'active', 'completed', 'dropped', 'expired']);
```

## Key Tables Reference

| Domain | Tables |
|--------|--------|
| ATS | skills, candidate_skills, jobs, submissions, interviews, offers, placements |
| CRM | accounts, leads, deals, pocs |
| Academy | courses, course_modules, module_topics, topic_lessons, student_enrollments, xp_transactions |
| Auth | user_profiles, organizations, roles, permissions, user_roles |
| Workplan | workplan_templates, activity_patterns, activity_pattern_successors, workplan_instances, activities |

## Workplan Schema (workplan.ts)

Guidewire-inspired activity management system for root entities.

### Core Tables

```typescript
// Template defining workflow for an entity type
workplan_templates: {
  id, org_id,
  code,           // 'lead_workflow', 'job_workflow'
  name,
  entity_type,    // 'lead', 'job', 'submission', 'deal', 'placement'
  trigger_event,  // 'create', 'status_change'
  is_active,
  created_at, updated_at
}

// Activity pattern (reusable activity definition)
activity_patterns: {
  id, org_id,
  code,           // 'initial_contact', 'qualification_call'
  name,
  description,
  entity_type,
  category,       // 'call', 'email', 'meeting', 'task', 'follow_up'
  target_days,    // Days from trigger to complete
  priority,       // 'urgent', 'high', 'normal', 'low'
  is_active,
  created_at, updated_at
}

// Pattern successors (activity chains)
activity_pattern_successors: {
  id,
  pattern_id,          // Parent pattern
  successor_pattern_id, // Next pattern to trigger
  trigger_on,          // 'complete', 'skip', 'timeout'
  delay_days,          // Days to wait before triggering
}

// Workplan instance (created per entity)
workplan_instances: {
  id, org_id,
  template_id,
  entity_type,
  entity_id,
  status,         // 'active', 'completed', 'cancelled'
  started_at,
  completed_at,
  created_by,
  created_at, updated_at
}

// Actual activities (instances of patterns)
activities: {
  id, org_id,
  workplan_instance_id,  // NULL for manual activities
  pattern_id,            // NULL for manual activities
  entity_type,
  entity_id,
  subject,
  category,
  status,          // 'open', 'in_progress', 'completed', 'skipped', 'escalated'
  priority,
  assigned_to,
  due_date,
  completed_at,
  completed_by,
  outcome,         // Result notes
  details,         // JSONB for extra data
  performed_by,
  created_at, updated_at
}
```

### Workplan Queries

```typescript
// Get workplan progress for an entity
const progress = await db.query.workplanInstances.findFirst({
  where: and(
    eq(workplanInstances.entityType, 'lead'),
    eq(workplanInstances.entityId, leadId),
  ),
  with: {
    activities: true,
    template: true,
  },
});

// Get open activities for user
const openActivities = await db.query.activities.findMany({
  where: and(
    eq(activities.assignedTo, userId),
    eq(activities.status, 'open'),
    isNull(activities.completedAt),
  ),
  orderBy: asc(activities.dueDate),
});
```

## Activity-Centric Tables

### Core Philosophy
```
"NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"
```

### Activities Table Schema

```typescript
// src/lib/db/schema/activities.ts
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  activityNumber: varchar('activity_number', { length: 20 }).notNull().unique(),

  // Type & Pattern
  activityType: varchar('activity_type', { length: 50 }).notNull(),
  activityPatternId: uuid('activity_pattern_id').references(() => activityPatterns.id),
  isAutoCreated: boolean('is_auto_created').default(false),

  // Subject & Description
  subject: varchar('subject', { length: 500 }).notNull(),
  description: text('description'),

  // Related Entity (Polymorphic)
  relatedEntityType: varchar('related_entity_type', { length: 50 }).notNull(),
  relatedEntityId: uuid('related_entity_id').notNull(),
  secondaryEntityType: varchar('secondary_entity_type', { length: 50 }),
  secondaryEntityId: uuid('secondary_entity_id'),

  // Assignment
  assignedTo: uuid('assigned_to').notNull().references(() => userProfiles.id),
  createdBy: uuid('created_by').notNull().references(() => userProfiles.id),

  // Status & Priority
  status: varchar('status', { length: 20 }).notNull().default('open'),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),

  // Timing
  dueDate: timestamp('due_date', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'),

  // Outcome
  outcome: varchar('outcome', { length: 50 }),
  outcomeNotes: text('outcome_notes'),

  // Follow-up
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: date('follow_up_date'),
  followUpActivityId: uuid('follow_up_activity_id').references((): any => activities.id),

  // SLA
  slaWarningHours: integer('sla_warning_hours'),
  slaBreachHours: integer('sla_breach_hours'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Indexes for common queries
// idx_activities_assigned_to - User's activity queue
// idx_activities_related_entity - Entity timeline
// idx_activities_status_due - Overdue/due today queries
// idx_activities_pattern - Pattern analytics
```

### Events Table Schema (Immutable)

```typescript
// src/lib/db/schema/events.ts
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  eventId: varchar('event_id', { length: 30 }).notNull().unique(),

  // Event Classification
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventCategory: varchar('event_category', { length: 50 }).notNull(),
  eventSeverity: varchar('event_severity', { length: 20 }).notNull().default('info'),

  // Actor
  actorType: varchar('actor_type', { length: 20 }).notNull(),
  actorId: uuid('actor_id'),
  actorName: varchar('actor_name', { length: 200 }),

  // Entity
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  entityName: varchar('entity_name', { length: 200 }),

  // Data (immutable)
  eventData: jsonb('event_data').notNull().default('{}'),
  changes: jsonb('changes'),
  relatedEntities: jsonb('related_entities'),

  // Correlation
  correlationId: uuid('correlation_id'),
  parentEventId: uuid('parent_event_id').references((): any => events.id),
  triggeredActivityIds: uuid('triggered_activity_ids').array(),

  // Timestamps (immutable - no updatedAt)
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### Activity Patterns Table Schema

```typescript
// src/lib/db/schema/activity-patterns.ts
export const activityPatterns = pgTable('activity_patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id), // NULL = system pattern
  patternCode: varchar('pattern_code', { length: 100 }).notNull().unique(),

  // Display
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),

  // Trigger
  triggerEvent: varchar('trigger_event', { length: 100 }).notNull(),
  triggerConditions: jsonb('trigger_conditions').default('[]'),

  // Activity Template
  activityType: varchar('activity_type', { length: 50 }).notNull(),
  subjectTemplate: varchar('subject_template', { length: 500 }).notNull(),
  descriptionTemplate: text('description_template'),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),

  // Assignment (JSONB for flexibility)
  assignTo: jsonb('assign_to').notNull(),

  // Timing
  dueOffsetHours: integer('due_offset_hours'),
  dueOffsetBusinessDays: integer('due_offset_business_days'),
  specificTime: time('specific_time'),

  // Configuration
  isActive: boolean('is_active').default(true),
  isSystem: boolean('is_system').default(false),
  canBeSkipped: boolean('can_be_skipped').default(false),
  requiresOutcome: boolean('requires_outcome').default(true),

  // SLA
  slaWarningHours: integer('sla_warning_hours'),
  slaBreachHours: integer('sla_breach_hours'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### Common Activity Queries

```typescript
// Get user's activity queue (overdue, today, upcoming)
const queue = await db.select()
  .from(activities)
  .where(and(
    eq(activities.orgId, orgId),
    eq(activities.assignedTo, userId),
    inArray(activities.status, ['open', 'in_progress']),
  ))
  .orderBy(asc(activities.dueDate));

// Get entity timeline (activities + events)
const [entityActivities, entityEvents] = await Promise.all([
  db.select().from(activities)
    .where(and(
      eq(activities.relatedEntityType, entityType),
      eq(activities.relatedEntityId, entityId),
    ))
    .orderBy(desc(activities.createdAt)),

  db.select().from(events)
    .where(and(
      eq(events.entityType, entityType),
      eq(events.entityId, entityId),
    ))
    .orderBy(desc(events.occurredAt)),
]);

// Check transition guard
const activityCount = await db.select({ count: sql<number>`count(*)` })
  .from(activities)
  .where(and(
    eq(activities.relatedEntityType, 'candidate'),
    eq(activities.relatedEntityId, candidateId),
    eq(activities.activityType, 'call'),
    eq(activities.status, 'completed'),
  ));

// Find overdue activities
const overdue = await db.select()
  .from(activities)
  .where(and(
    eq(activities.status, 'open'),
    lt(activities.dueDate, new Date()),
  ));
```

### Entity lastActivityAt Updates

All entity tables with activity tracking should include:

```typescript
// Add to entity tables that track activities
lastActivityAt: timestamp('last_activity_at', { withTimezone: true }),
daysSinceActivity: integer('days_since_activity').generatedAlwaysAs(
  sql`EXTRACT(DAY FROM NOW() - last_activity_at)::INTEGER`
),
```

Update `lastActivityAt` when activities are created/completed:

```typescript
// After creating/completing activity on entity
await tx.update(entityTable)
  .set({ lastActivityAt: new Date() })
  .where(eq(entityTable.id, entityId));
```
