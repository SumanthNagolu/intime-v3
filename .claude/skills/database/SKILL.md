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
