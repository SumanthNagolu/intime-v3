# InTime Backend Architecture

## TypeScript Standards

### Branded Types for Entity IDs

Prevent mixing IDs from different entities:

```typescript
type AccountId = string & { readonly __brand: 'AccountId' }
type ContactId = string & { readonly __brand: 'ContactId' }
type JobId = string & { readonly __brand: 'JobId' }

function createAccountId(id: string): AccountId {
  return id as AccountId
}

// Type error: Can't pass ContactId where AccountId expected
function getAccount(id: AccountId): Account { ... }
```

### Discriminated Unions for State

Make illegal states unrepresentable:

```typescript
// GOOD: Explicit states
type SubmissionState =
  | { stage: 'draft'; draftData: DraftSubmission }
  | { stage: 'submitted'; submittedAt: Date; submittedBy: UserId }
  | { stage: 'accepted'; acceptedAt: Date; offer: Offer }
  | { stage: 'rejected'; rejectedAt: Date; reason: string }

// BAD: Nullable fields create impossible states
interface HealthScore {
  score: number | null  // Is null "not rated" or "zero"?
  isRated: boolean      // Can be out of sync
}
```

### Exhaustive Pattern Matching

All switch statements on union types must use `never`:

```typescript
function getDisplayName(category: ContactCategory): string {
  switch (category) {
    case 'person': return 'Individual'
    case 'company': return 'Company'
    default:
      const _exhaustive: never = category
      throw new Error(`Unhandled: ${_exhaustive}`)
  }
}
```

### Zod-Inferred Types

Single source of truth:

```typescript
export const ContactSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string(),
  email: z.string().email().optional(),
  category: z.enum(['person', 'company']),
})

export type Contact = z.infer<typeof ContactSchema>
```

### Key TypeScript Rules

| Rule | Do | Don't |
|------|----|----- |
| IDs | Branded types | Raw strings |
| State | Discriminated unions | Boolean flags + nullable |
| Validation | Zod schemas | Manual checks |
| Any | `unknown` + narrow | `any` |
| Collections | `readonly` in signatures | Mutable arrays |
| Imports | `type` imports for types | Mixed imports |
| Exports | Named exports | Default exports |
| Paths | `@/` aliases | Relative paths |

---

## tRPC Patterns

### Router Structure

Organize by domain:

```typescript
export const atsRouter = router({
  jobs: router({
    list: orgProtectedProcedure.query(...),
    get: orgProtectedProcedure.input(z.object({ id: z.string() })).query(...),
    create: orgProtectedProcedure.input(jobSchema).mutation(...),
  }),
  submissions: router({
    list: orgProtectedProcedure.query(...),
    create: orgProtectedProcedure.mutation(...),
  }),
})
```

### Procedure Types

| Procedure | Use When |
|-----------|----------|
| `publicProcedure` | Public endpoints (rare) |
| `protectedProcedure` | User must be authenticated |
| `orgProtectedProcedure` | User must be in organization |
| `ownershipProcedure` | Need RCAI (owner) context |

### Input Validation

Always use Zod:

```typescript
const createJobInput = z.object({
  title: z.string().min(1).max(200),
  accountId: z.string().uuid(),
  status: z.enum(['draft', 'open', 'closed']).default('draft'),
})

create: orgProtectedProcedure
  .input(createJobInput)
  .mutation(async ({ ctx, input }) => {
    return await createJob({ ...input, orgId: ctx.orgId })
  })
```

### Error Handling

Use TRPCError:

```typescript
throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' })
throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid transition' })
```

---

## Database Patterns

### Table Structure

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Business fields
  title TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'draft',
  
  -- Foreign keys
  account_id UUID REFERENCES accounts(id),
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Required indexes
CREATE INDEX jobs_org_id_idx ON jobs(org_id) WHERE deleted_at IS NULL;
CREATE INDEX jobs_status_idx ON jobs(org_id, status) WHERE deleted_at IS NULL;
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `job_requirements` |
| Columns | snake_case | `account_id` |
| Foreign keys | `{table}_id` | `job_id` |
| Indexes | `{table}_{cols}_idx` | `jobs_org_id_idx` |

### Query Patterns

**List with pagination:**
```typescript
const jobs = await db.query.jobs.findMany({
  where: and(
    eq(jobs.orgId, ctx.orgId),
    isNull(jobs.deletedAt),
    input.status ? eq(jobs.status, input.status) : undefined,
  ),
  orderBy: [desc(jobs.createdAt)],
  limit: input.pageSize,
  offset: (input.page - 1) * input.pageSize,
  with: { account: true }
})
```

**Detail with relations (N+1 prevention):**
```typescript
const job = await db.query.jobs.findFirst({
  where: and(eq(jobs.id, id), eq(jobs.orgId, orgId), isNull(jobs.deletedAt)),
  with: {
    account: true,
    requirements: true,
    skills: { with: { skill: true } },
    assignments: { with: { user: true } }
  }
})
```

### Soft Deletes

```typescript
// Delete (soft)
await db.update(jobs)
  .set({ deletedAt: new Date(), updatedBy: ctx.userId })
  .where(eq(jobs.id, jobId))

// Query (always exclude deleted)
where: isNull(jobs.deletedAt)
```

### Database-First Workflow

**No migration files. The database is source of truth.**

```bash
# 1. Make changes in Supabase Studio
# 2. Sync TypeScript types
pnpm db:introspect
# 3. (Optional) Update schema snapshot
pnpm db:dump-schema
```

---

## Event System

### Publishing Events

Emit events for business actions:

```typescript
await EventEmitter.emit({
  type: 'submission.created',
  entityType: 'submission',
  entityId: submission.id,
  orgId: ctx.orgId,
  userId: ctx.userId,
  payload: {
    jobId: submission.jobId,
    candidateId: submission.candidateId,
    status: submission.status,
  },
})
```

### Event Naming

Pattern: `entity.action`

- `job.created`, `job.updated`, `job.closed`
- `submission.created`, `submission.status_changed`
- `interview.scheduled`, `interview.completed`
- `placement.started`, `placement.ended`

---

## Activity Patterns

Activities are auto-created from events via patterns:

```typescript
{
  name: 'Review Submission',
  trigger: 'submission.created',
  assignmentStrategy: 'owner',
  priority: 'high',
  dueDateOffset: { hours: 24 },
  checklist: [
    { label: 'Review resume', required: true },
    { label: 'Check work authorization', required: true },
  ],
}
```

### Assignment Strategies

| Strategy | Assigns To |
|----------|-----------|
| `owner` | Entity owner (RCAI) |
| `creator` | Event creator |
| `pool` | Team pool for claiming |
| `round_robin` | Rotate through team |

---

## Workflow Integration

### State Machine Pattern

Define valid transitions:

```typescript
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft: ['open', 'closed'],
  open: ['on_hold', 'filled', 'closed'],
  on_hold: ['open', 'closed'],
  filled: ['closed'],
  closed: [], // Terminal
}

function canTransition(from: JobStatus, to: JobStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}
```

### Status History

Track transitions for audit:

```sql
CREATE TABLE job_status_history (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),
  from_status job_status,
  to_status job_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);
```

### Workflow Rules

Rules define automated actions on state changes:

```typescript
interface WorkflowRule {
  trigger: { entity: string; event: string }
  conditions: Condition[]
  actions: Action[]
}

// Example: Auto-assign recruiter when job opens
{
  trigger: { entity: 'job', event: 'status_changed' },
  conditions: [{ field: 'status', equals: 'open' }],
  actions: [
    { type: 'create_activity', template: 'source_candidates' },
    { type: 'notify', recipients: ['job.owner'] },
  ],
}
```

---

## Service Layer

For complex business logic:

```typescript
export class SubmissionService {
  constructor(private db: Database, private events: EventEmitter) {}

  async create(input: CreateSubmissionInput, ctx: Context) {
    await this.validateCanSubmit(input, ctx)

    const submission = await this.db.transaction(async (tx) => {
      const [sub] = await tx.insert(submissions).values({
        ...input,
        orgId: ctx.orgId,
        createdBy: ctx.userId,
      }).returning()

      await tx.insert(submissionStatusHistory).values({
        submissionId: sub.id,
        status: sub.status,
        changedBy: ctx.userId,
      })

      return sub
    })

    await this.events.emit({
      type: 'submission.created',
      entityId: submission.id,
      ...
    })

    return submission
  }
}
```

---

## API Response Patterns

### List Responses

```typescript
return {
  items: jobs,
  pagination: {
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.ceil(total / input.pageSize),
  }
}
```

### Detail Responses

```typescript
return {
  ...job,
  account: job.account,
  submissions: { total: count, byStatus: statusCounts },
  permissions: {
    canEdit: ctx.userId === job.createdBy,
    canClose: hasPermission(ctx, 'jobs.close'),
  }
}
```

---

## DO's and DON'Ts

### DO

- Filter by `org_id` in every query
- Use soft deletes (`deleted_at`)
- Set audit fields (`created_by`, `updated_by`)
- Emit events for business actions
- Use transactions for related operations
- Validate input with Zod
- Use eager loading to prevent N+1
- Use `Promise.all` for parallel operations

### DON'T

- Query without `org_id` filter
- Hard delete business data
- Skip audit timestamps
- Forget to emit events
- Use `any` type
- Use `.then()` chains (use async/await)
- Create unbounded queries (always limit)
- Mix business logic in routers (use services)

