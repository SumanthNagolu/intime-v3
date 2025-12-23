# Database Patterns Rules

## Schema Design

### Table Structure

Every table follows standard patterns:

```sql
CREATE TABLE jobs (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenancy (required for domain tables)
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Business fields
  title TEXT NOT NULL,
  description TEXT,
  status job_status NOT NULL DEFAULT 'draft',

  -- Foreign keys
  account_id UUID REFERENCES accounts(id),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete

  -- Constraints
  CONSTRAINT jobs_org_id_fk FOREIGN KEY (org_id) REFERENCES organizations(id),
  CONSTRAINT jobs_account_id_fk FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Indexes
CREATE INDEX jobs_org_id_idx ON jobs(org_id) WHERE deleted_at IS NULL;
CREATE INDEX jobs_account_id_idx ON jobs(account_id) WHERE deleted_at IS NULL;
CREATE INDEX jobs_status_idx ON jobs(org_id, status) WHERE deleted_at IS NULL;
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `job_requirements` |
| Columns | snake_case | `account_id` |
| Primary keys | `id` | `id` |
| Foreign keys | `{table}_id` | `job_id` |
| Indexes | `{table}_{columns}_idx` | `jobs_org_id_idx` |
| Enums | `{entity}_{field}` | `job_status` |

---

## Relationships

### One-to-Many

```sql
-- Jobs have many requirements
CREATE TABLE job_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  requirement TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX job_requirements_job_id_idx ON job_requirements(job_id);
```

### Many-to-Many

Use junction tables:

```sql
-- Jobs can require many skills, skills can be on many jobs
CREATE TABLE job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id),
  required_level INTEGER DEFAULT 1, -- Additional data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

CREATE INDEX job_skills_job_id_idx ON job_skills(job_id);
CREATE INDEX job_skills_skill_id_idx ON job_skills(skill_id);
```

### Polymorphic Relationships

Use `entity_type` + `entity_id` pattern:

```sql
-- Comments can be on any entity
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  entity_type TEXT NOT NULL, -- 'job', 'submission', 'candidate'
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial indexes for common queries
CREATE INDEX comments_job_idx ON comments(entity_id)
  WHERE entity_type = 'job' AND deleted_at IS NULL;
CREATE INDEX comments_submission_idx ON comments(entity_id)
  WHERE entity_type = 'submission' AND deleted_at IS NULL;
```

---

## Query Patterns

### List Queries

Always include pagination and filtering:

```typescript
const jobs = await db.query.jobs.findMany({
  where: and(
    eq(jobs.orgId, orgId),
    isNull(jobs.deletedAt),
    input.status ? eq(jobs.status, input.status) : undefined,
    input.accountId ? eq(jobs.accountId, input.accountId) : undefined,
  ),
  orderBy: [desc(jobs.createdAt)],
  limit: input.pageSize,
  offset: (input.page - 1) * input.pageSize,
  with: {
    account: true, // Eager load relations
  }
})
```

### Count Queries

For pagination totals:

```typescript
const [{ count }] = await db
  .select({ count: sql<number>`count(*)` })
  .from(jobs)
  .where(and(
    eq(jobs.orgId, orgId),
    isNull(jobs.deletedAt),
  ))
```

### Detail Queries

Fetch with all needed relations:

```typescript
const job = await db.query.jobs.findFirst({
  where: and(
    eq(jobs.id, jobId),
    eq(jobs.orgId, orgId),
    isNull(jobs.deletedAt),
  ),
  with: {
    account: true,
    requirements: true,
    skills: {
      with: { skill: true }
    },
    assignments: {
      with: { user: true }
    }
  }
})
```

---

## Soft Deletes

### Deleting Records

```typescript
// Soft delete
await db.update(jobs)
  .set({
    deletedAt: new Date(),
    updatedBy: ctx.userId,
    updatedAt: new Date(),
  })
  .where(eq(jobs.id, jobId))

// Hard delete (only for cleanup, never in business logic)
await db.delete(jobs).where(eq(jobs.id, jobId))
```

### Querying Active Records

```typescript
// Always exclude deleted
const activeJobs = await db.query.jobs.findMany({
  where: and(
    eq(jobs.orgId, orgId),
    isNull(jobs.deletedAt), // Required!
  )
})
```

### Cascade Soft Deletes

When soft deleting parent, consider children:

```typescript
await db.transaction(async (tx) => {
  // Soft delete job
  await tx.update(jobs)
    .set({ deletedAt: new Date() })
    .where(eq(jobs.id, jobId))

  // Soft delete related submissions
  await tx.update(submissions)
    .set({ deletedAt: new Date() })
    .where(eq(submissions.jobId, jobId))
})
```

---

## Status & State Machines

### Enum Types

Define status as PostgreSQL enums:

```sql
CREATE TYPE job_status AS ENUM ('draft', 'open', 'on_hold', 'filled', 'closed');

ALTER TABLE jobs ADD COLUMN status job_status NOT NULL DEFAULT 'draft';
```

### Status Transitions

Track history for audit:

```sql
CREATE TABLE job_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  from_status job_status,
  to_status job_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);
```

### Transition Validation

Validate transitions in code:

```typescript
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft: ['open', 'closed'],
  open: ['on_hold', 'filled', 'closed'],
  on_hold: ['open', 'closed'],
  filled: ['closed'],
  closed: [], // Terminal state
}

function canTransition(from: JobStatus, to: JobStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}
```

---

## Indexing Strategy

### Required Indexes

Every table should have:

```sql
-- Org filter (most common)
CREATE INDEX {table}_org_id_idx ON {table}(org_id) WHERE deleted_at IS NULL;

-- Foreign key lookups
CREATE INDEX {table}_parent_id_idx ON {table}(parent_id) WHERE deleted_at IS NULL;

-- Status queries
CREATE INDEX {table}_status_idx ON {table}(org_id, status) WHERE deleted_at IS NULL;
```

### Composite Indexes

For common multi-column queries:

```sql
-- Jobs by account and status
CREATE INDEX jobs_account_status_idx ON jobs(account_id, status)
  WHERE deleted_at IS NULL;

-- Submissions by job and status
CREATE INDEX submissions_job_status_idx ON submissions(job_id, status)
  WHERE deleted_at IS NULL;
```

### Partial Indexes

For filtered queries:

```sql
-- Only active jobs
CREATE INDEX jobs_active_idx ON jobs(org_id, created_at DESC)
  WHERE status = 'open' AND deleted_at IS NULL;

-- Only pending activities
CREATE INDEX activities_pending_idx ON activities(assignee_id, due_date)
  WHERE status = 'pending' AND deleted_at IS NULL;
```

---

## Database-First Workflow (NO MIGRATIONS)

### Core Principle

**The database IS the source of truth. There are NO migration files.**

| What | Where |
|------|-------|
| Schema source of truth | Supabase database |
| Schema snapshot | `database/schema.sql` (for reference/fresh setup) |
| TypeScript types | Generated via `drizzle-kit introspect` |

### Making Schema Changes

```bash
# 1. Make changes directly in Supabase Studio (or via SQL)
#    - Add tables, columns, indexes
#    - Modify constraints
#    - Create functions/triggers

# 2. Sync TypeScript types from database
pnpm db:introspect

# 3. (Optional) Update schema snapshot for documentation
pnpm db:dump-schema
```

### Fresh Database Setup

For new developers or new environments:

```bash
# Apply the schema snapshot to a fresh database
psql $DATABASE_URL < database/schema.sql
```

### Commands

| Command | Purpose |
|---------|---------|
| `pnpm db:introspect` | Generate Drizzle schema from database |
| `pnpm db:dump-schema` | Dump current schema to `database/schema.sql` |

### Why No Migrations?

| Problem with Migrations | Database-First Solution |
|------------------------|------------------------|
| Agents create wrong files | No migration folder exists |
| Consolidation not followed | Nothing to consolidate |
| Merge conflicts | Single schema.sql, rarely changes |
| Drift between DB and code | DB is source of truth |
| Complex multi-step process | Simple: edit DB, run introspect |

### DO NOT

- Create files in `supabase/migrations/` - the folder doesn't exist
- Write SQL migration files anywhere
- Use `supabase migration new` or similar commands
- Manually edit Drizzle schema files (they're generated)

### DO

- Make schema changes in Supabase Studio
- Run `pnpm db:introspect` after changes
- Commit the generated Drizzle schema

---

## Performance

### N+1 Prevention

Use eager loading:

```typescript
// Good - single query with relations
const jobs = await db.query.jobs.findMany({
  with: {
    account: true,
    assignments: { with: { user: true } }
  }
})

// Bad - N+1 queries
const jobs = await db.query.jobs.findMany()
for (const job of jobs) {
  job.account = await db.query.accounts.findFirst({
    where: eq(accounts.id, job.accountId)
  })
}
```

### Limit Results

Always use limits:

```typescript
// Good
const recent = await db.query.activities.findMany({
  limit: 50,
  orderBy: [desc(activities.createdAt)]
})

// Bad - unbounded query
const all = await db.query.activities.findMany()
```

---

## DO's and DON'Ts

### DO

- Always filter by `org_id`
- Use soft deletes (`deleted_at`)
- Set audit fields (`created_by`, `updated_by`)
- Use transactions for related operations
- Create indexes for common queries
- Use partial indexes with `WHERE deleted_at IS NULL`
- Validate status transitions
- Eager load relations to prevent N+1

### DON'T

- Query without org_id filter
- Hard delete business data
- Skip audit timestamps
- Create unbounded queries
- Forget indexes on foreign keys
- Allow invalid status transitions
- Store derived data (use views)
- Mix DDL and DML in transactions
