# ADR-002: Standard Database Schema Patterns

**Date:** 2025-11-17
**Status:** Accepted
**Deciders:** Database Architect, Security Auditor
**Consulted:** Developer Agent, QA Engineer
**Informed:** All development team

---

## Context

InTime v3 will have 50+ database tables across 5 business pillars. Without standardized patterns, we risk:
- **Inconsistent schemas** - Different audit fields, naming conventions
- **Security gaps** - Missing RLS policies, improper foreign keys
- **Maintenance burden** - Hard to understand, modify, or debug
- **Migration conflicts** - Overlapping changes, broken dependencies

We need **mandatory patterns** that every table follows, enforced by:
1. Code review (Code Reviewer Agent)
2. Schema validation (custom tool)
3. Database constraints

---

## Decision

**Every table in InTime v3 MUST follow these standard patterns.**

### 1. Standard Columns (Required on ALL Tables)

```typescript
{
  // Primary Key
  id: uuid('id').defaultRandom().primaryKey(),

  // Audit Trail (WHO + WHEN)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),

  // Soft Delete (NEVER hard delete critical data)
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Multi-Tenancy (Organization isolation)
  orgId: uuid('org_id').references(() => orgs.id).notNull(),
}
```

### 2. Naming Conventions

| Element | Pattern | Example |
|---------|---------|---------|
| **Table names** | Plural, snake_case | `candidates`, `job_submissions`, `training_modules` |
| **Column names** | camelCase in schema, snake_case in DB | `firstName` → `first_name` |
| **Foreign keys** | `{table_singular}Id` | `userId`, `candidateId`, `jobId` |
| **Junction tables** | `{table1}_{table2}` | `users_roles`, `candidates_skills` |
| **Enum types** | PascalCase | `UserRole`, `SubmissionStatus` |

### 3. Row Level Security (RLS) - MANDATORY

Every table MUST have:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only see their org's data (SELECT)
CREATE POLICY "Users can view own org data"
  ON table_name
  FOR SELECT
  USING (org_id = auth.jwt() ->> 'org_id');

-- Policy 2: Users can only insert for their org (INSERT)
CREATE POLICY "Users can insert own org data"
  ON table_name
  FOR INSERT
  WITH CHECK (org_id = auth.jwt() ->> 'org_id');

-- Policy 3: Users can only update their org's data (UPDATE)
CREATE POLICY "Users can update own org data"
  ON table_name
  FOR UPDATE
  USING (org_id = auth.jwt() ->> 'org_id')
  WITH CHECK (org_id = auth.jwt() ->> 'org_id');

-- Policy 4: No hard deletes (DELETE should update deleted_at)
-- No DELETE policy = no one can hard delete via RLS
```

### 4. Foreign Key Patterns

```typescript
// Always include onDelete behavior
userId: uuid('user_id')
  .references(() => users.id, {
    onDelete: 'cascade', // Delete child when parent deleted
  })
  .notNull(),

// For optional relations
managerId: uuid('manager_id')
  .references(() => users.id, {
    onDelete: 'set null', // Keep record, set manager null
  }),
```

**onDelete Rules:**
- `cascade` - Child data is meaningless without parent (submissions without candidates)
- `set null` - Child can exist independently (employees without managers)
- `restrict` - Prevent deletion if children exist (can't delete org with users)

### 5. Timestamp Patterns

```typescript
// Use timestamptz (with timezone) ALWAYS
createdAt: timestamp('created_at', { withTimezone: true })

// Default to NOW for creation
.defaultNow().notNull()

// Updated via trigger or application logic
updatedAt: timestamp('updated_at', { withTimezone: true })
  .defaultNow()
  .notNull()
```

**Database Trigger for Updated At:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to every table
CREATE TRIGGER update_{table_name}_updated_at
  BEFORE UPDATE ON {table_name}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 6. Enum Patterns

```typescript
// Define enum in schema file
import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'recruiter',
  'bench_manager',
  'trainer',
  'student',
])

// Use in table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: userRoleEnum('role').notNull().default('student'),
  // ...
})
```

### 7. JSON/JSONB Patterns

```typescript
// Use JSONB for flexible data
metadata: jsonb('metadata').$type<{
  onboardingCompleted: boolean
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
  }
}>()

// Always provide type for type safety
```

### 8. Text vs VARCHAR

```typescript
// Use TEXT (not VARCHAR)
// PostgreSQL TEXT is just as fast and more flexible
name: text('name').notNull()
email: text('email').notNull()

// Exception: Fixed-length codes
phoneCountryCode: varchar('phone_country_code', { length: 3 }) // +1, +91
```

---

## Consequences

### Positive ✅
- **Consistency:** Every table looks/works the same
- **Security:** RLS enforced, no accidental data leaks
- **Auditability:** Complete who/when/what trail
- **Recoverability:** Soft deletes = easy undo
- **Multi-tenancy:** Org isolation baked in
- **Maintainability:** Predictable patterns = easy to modify
- **Onboarding:** New devs learn once, apply everywhere

### Negative ❌
- **Boilerplate:** Every table has ~10 standard columns
- **Migration size:** More columns = larger migrations
- **Query complexity:** Must always filter by `deleted_at IS NULL`
- **Storage overhead:** Audit fields add ~100 bytes per row

### Neutral ⚖️
- **Performance:** Minimal impact (<5% query overhead)
- **Flexibility:** Can add custom columns freely

---

## Alternatives Considered

### Alternative 1: Minimal Schema (Just ID + Data)
**Rejected:** No audit trail, no soft deletes, no multi-tenancy. Security nightmare.

### Alternative 2: Optional Audit Fields
**Rejected:** Inconsistency. Some tables have audit, some don't. Where do we draw the line?

### Alternative 3: Database-Level Defaults Only (No Application-Level)
**Rejected:** Application needs to set `createdBy`, `updatedBy` explicitly. Can't be database default.

---

## Related Decisions

- **ADR-001:** Use Drizzle ORM (defines HOW we implement these patterns)
- **Future ADR:** Soft Delete Helper Functions

---

## Implementation Notes

### Schema Template (Copy-Paste Starting Point)

```typescript
// src/lib/db/schema/[entity].ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { orgs } from './orgs'

export const [entities] = pgTable('[entities]', {
  // ==========================================
  // PRIMARY KEY
  // ==========================================
  id: uuid('id').defaultRandom().primaryKey(),

  // ==========================================
  // BUSINESS FIELDS (customize per table)
  // ==========================================
  name: text('name').notNull(),
  // Add entity-specific fields here

  // ==========================================
  // AUDIT TRAIL (standard on all tables)
  // ==========================================
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),

  // ==========================================
  // SOFT DELETE (standard on all tables)
  // ==========================================
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // ==========================================
  // MULTI-TENANCY (standard on all tables)
  // ==========================================
  orgId: uuid('org_id')
    .references(() => orgs.id, { onDelete: 'cascade' })
    .notNull(),
})

// Relations
export const [entities]Relations = relations([entities], ({ one, many }) => ({
  org: one(orgs, {
    fields: [[entities].orgId],
    references: [orgs.id],
  }),
  createdByUser: one(users, {
    fields: [[entities].createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [[entities].updatedBy],
    references: [users.id],
  }),
}))

// Type exports
export type Entity = typeof [entities].$inferSelect
export type NewEntity = typeof [entities].$inferInsert
```

### Query Helper (Always Exclude Deleted)

```typescript
// src/lib/db/helpers.ts
import { isNull, and, eq } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'

export function notDeleted<T extends PgTable>(table: T) {
  return isNull(table.deletedAt)
}

export function inOrg<T extends PgTable>(table: T, orgId: string) {
  return eq(table.orgId, orgId)
}

// Usage:
const candidates = await db.query.candidates.findMany({
  where: and(
    notDeleted(candidatesTable),
    inOrg(candidatesTable, currentUser.orgId)
  ),
})
```

### Soft Delete Function

```typescript
// src/lib/db/mutations.ts
export async function softDelete<T extends PgTable>(
  table: T,
  id: string,
  deletedBy: string
) {
  return db
    .update(table)
    .set({
      deletedAt: new Date(),
      updatedBy: deletedBy,
      updatedAt: new Date(),
    })
    .where(eq(table.id, id))
    .returning()
}

// Usage:
await softDelete(candidatesTable, candidateId, currentUser.id)
```

---

## Validation

### Schema Validation Tool

Create custom tool for agents:

```typescript
// .claude/orchestration/core/tools/validate_drizzle_schema.ts
export function validateDrizzleSchema(schemaPath: string): ValidationResult {
  const schemaCode = readFileSync(schemaPath, 'utf-8')

  const errors: string[] = []

  // Check for required fields
  if (!schemaCode.includes("id: uuid('id')")) {
    errors.push('Missing id field (PRIMARY KEY)')
  }
  if (!schemaCode.includes("createdAt: timestamp('created_at'")) {
    errors.push('Missing createdAt field (AUDIT TRAIL)')
  }
  if (!schemaCode.includes("updatedAt: timestamp('updated_at'")) {
    errors.push('Missing updatedAt field (AUDIT TRAIL)')
  }
  if (!schemaCode.includes("deletedAt: timestamp('deleted_at'")) {
    errors.push('Missing deletedAt field (SOFT DELETE)')
  }
  if (!schemaCode.includes("orgId: uuid('org_id')")) {
    errors.push('Missing orgId field (MULTI-TENANCY)')
  }

  // Check for RLS migration
  const migrationPath = schemaPath.replace('/schema/', '/migrations/')
  // ... check migration file for RLS policies

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

### Code Review Checklist (For Code Reviewer Agent)

When reviewing a new schema:
- [ ] Has all standard columns (id, createdAt, updatedAt, deletedAt, createdBy, updatedBy, orgId)
- [ ] Uses correct naming conventions (camelCase in TS, snake_case in DB)
- [ ] Foreign keys have explicit onDelete behavior
- [ ] Timestamps use `{ withTimezone: true }`
- [ ] Has corresponding RLS policies in migration
- [ ] Has relations defined
- [ ] Has type exports (Select, Insert)
- [ ] Follows template structure

---

## Exceptions

**When can we deviate from this pattern?**

### Exception 1: System Tables (No Multi-Tenancy)
Tables like `orgs` (the root of multi-tenancy) don't need `orgId`.

```typescript
export const orgs = pgTable('orgs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  // NO orgId (this IS the org)
})
```

### Exception 2: Junction Tables (Many-to-Many)
Junction tables may not need all fields:

```typescript
export const candidateSkills = pgTable('candidate_skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id').references(() => candidates.id, { onDelete: 'cascade' }).notNull(),
  skillId: uuid('skill_id').references(() => skills.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  // No updatedAt (this is immutable)
  // No deletedAt (just delete the relation)
  // orgId inherited from candidate
})
```

### Exception 3: Immutable Logs/Events
Event sourcing tables don't need `updatedAt` or `deletedAt`:

```typescript
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  action: text('action').notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  // No updatedAt (immutable)
  // No deletedAt (never delete logs)
  orgId: uuid('org_id').references(() => orgs.id).notNull(),
})
```

---

## Migration Checklist

When creating a new table:

1. **Copy template** from this ADR
2. **Customize** business fields
3. **Generate migration:** `pnpm drizzle-kit generate:pg`
4. **Review SQL** - ensure RLS policies present
5. **Add RLS if missing** (manually edit migration)
6. **Test locally** - verify queries work
7. **Create test data** - populate table
8. **Verify RLS** - ensure org isolation works
9. **Commit** with descriptive message
10. **Deploy** to staging first

---

## Review Schedule

- **Monthly:** Review compliance (any tables missing standards?)
- **Quarterly:** Assess if patterns need updates
- **Annually:** Full retrospective on effectiveness

---

**Last Updated:** 2025-11-17
**Owner:** Database Architect Agent
**Approved By:** CEO, Security Team
