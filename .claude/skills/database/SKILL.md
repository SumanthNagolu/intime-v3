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
├── audit.ts           # Audit logging
├── events.ts          # Event system
└── shared.ts          # Cross-module entities
```

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

### With Relations
```typescript
const result = await db.query.tableName.findFirst({
  where: eq(tableName.id, id),
  with: {
    organization: true,
    children: true,
  },
});
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
| CRM | accounts, leads, deals, pocs, activities |
| Academy | courses, course_modules, module_topics, topic_lessons, student_enrollments, xp_transactions |
| Auth | user_profiles, organizations, roles, permissions, user_roles |
