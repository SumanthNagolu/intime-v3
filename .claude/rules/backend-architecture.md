# Backend Architecture Rules

## tRPC Patterns

### Router Structure

Organize routers by domain, not by operation type:

```typescript
// src/server/routers/ats.ts - Good
export const atsRouter = router({
  // Jobs
  jobs: router({
    list: protectedProcedure.query(...),
    get: protectedProcedure.input(z.object({ id: z.string() })).query(...),
    create: protectedProcedure.input(jobSchema).mutation(...),
    update: protectedProcedure.input(...).mutation(...),
  }),
  // Submissions
  submissions: router({
    list: protectedProcedure.query(...),
    create: protectedProcedure.mutation(...),
  }),
})
```

### Procedure Types

Use the correct procedure type:

| Procedure | Use When |
|-----------|----------|
| `publicProcedure` | Public endpoints (rare) |
| `protectedProcedure` | User must be authenticated |
| `orgProtectedProcedure` | User must be in an organization |
| `ownershipProcedure` | Need RCAI (owner) context |

### Input Validation

Always use Zod for input validation:

```typescript
const createJobInput = z.object({
  title: z.string().min(1).max(200),
  accountId: z.string().uuid(),
  status: z.enum(['draft', 'open', 'closed']).default('draft'),
  requirements: z.array(z.string()).optional(),
})

export const jobsRouter = router({
  create: orgProtectedProcedure
    .input(createJobInput)
    .mutation(async ({ ctx, input }) => {
      // ctx.orgId is guaranteed
      return await createJob({ ...input, orgId: ctx.orgId })
    }),
})
```

### Error Handling

Use TRPCError for consistent error responses:

```typescript
import { TRPCError } from '@trpc/server'

// Not found
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Job not found',
})

// Forbidden
throw new TRPCError({
  code: 'FORBIDDEN',
  message: 'You do not have access to this resource',
})

// Bad request
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Invalid status transition',
})
```

---

## Database Patterns

### Multi-Tenancy

**Every query must filter by org_id**:

```typescript
// Good
const jobs = await db.query.jobs.findMany({
  where: and(
    eq(jobs.orgId, ctx.orgId),
    isNull(jobs.deletedAt)
  )
})

// Bad - never do this
const jobs = await db.query.jobs.findMany() // Missing org_id filter!
```

### Soft Deletes

Use `deleted_at` for all deletions:

```typescript
// Delete (soft)
await db.update(jobs)
  .set({ deletedAt: new Date(), updatedBy: ctx.userId })
  .where(eq(jobs.id, jobId))

// Query (exclude deleted)
const activeJobs = await db.query.jobs.findMany({
  where: isNull(jobs.deletedAt)
})
```

### Audit Trail

Always set audit fields:

```typescript
// Create
await db.insert(jobs).values({
  ...input,
  orgId: ctx.orgId,
  createdBy: ctx.userId,
  updatedBy: ctx.userId,
  createdAt: new Date(),
  updatedAt: new Date(),
})

// Update
await db.update(jobs)
  .set({
    ...input,
    updatedBy: ctx.userId,
    updatedAt: new Date(),
  })
  .where(eq(jobs.id, jobId))
```

### Transaction Usage

Use transactions for related operations:

```typescript
await db.transaction(async (tx) => {
  // Create job
  const [job] = await tx.insert(jobs).values(jobData).returning()

  // Create requirements
  await tx.insert(jobRequirements).values(
    requirements.map(req => ({
      jobId: job.id,
      ...req
    }))
  )

  // Create skills
  await tx.insert(jobSkills).values(
    skills.map(skill => ({
      jobId: job.id,
      ...skill
    }))
  )

  return job
})
```

---

## Event System

### Publishing Events

Emit events for important business actions:

```typescript
import { EventEmitter } from '@/lib/events/event-emitter'

// After creating a submission
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

### Event Types

Follow naming convention: `entity.action`

- `job.created`, `job.updated`, `job.closed`
- `submission.created`, `submission.status_changed`
- `interview.scheduled`, `interview.completed`
- `placement.started`, `placement.ended`

### Activity Creation

Events automatically create activities via handlers. Configure patterns:

```typescript
// Activity pattern
{
  name: 'Review Submission',
  trigger: 'submission.created',
  assignmentStrategy: 'owner', // Uses RCAI
  priority: 'high',
  dueDateOffset: { hours: 24 },
  checklist: [
    { label: 'Review resume', required: true },
    { label: 'Check work authorization', required: true },
    { label: 'Verify skills match', required: false },
  ],
}
```

---

## Service Layer

### Service Structure

Create services for complex business logic:

```typescript
// src/lib/services/submission-service.ts
export class SubmissionService {
  constructor(
    private db: Database,
    private events: EventEmitter,
  ) {}

  async create(input: CreateSubmissionInput, ctx: Context) {
    // Validate
    await this.validateCanSubmit(input, ctx)

    // Create in transaction
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

    // Emit event
    await this.events.emit({
      type: 'submission.created',
      entityId: submission.id,
      ...
    })

    return submission
  }
}
```

### Repository Pattern

For complex queries, use repositories:

```typescript
// src/lib/repositories/job-repository.ts
export class JobRepository {
  async findWithRelations(id: string, orgId: string) {
    return await db.query.jobs.findFirst({
      where: and(
        eq(jobs.id, id),
        eq(jobs.orgId, orgId),
        isNull(jobs.deletedAt)
      ),
      with: {
        account: true,
        requirements: true,
        skills: true,
        assignments: {
          with: { user: true }
        }
      }
    })
  }
}
```

---

## API Response Patterns

### List Responses

Include pagination metadata:

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

Include related data needed by UI:

```typescript
return {
  ...job,
  account: job.account,
  requirements: job.requirements,
  submissions: {
    total: submissionCount,
    byStatus: statusCounts,
  },
  permissions: {
    canEdit: ctx.userId === job.createdBy,
    canClose: hasPermission(ctx, 'jobs.close'),
  }
}
```

---

## Security

### Authorization Checks

Always verify permissions:

```typescript
// Check ownership
if (job.createdBy !== ctx.userId && !hasPermission(ctx, 'jobs.edit_any')) {
  throw new TRPCError({ code: 'FORBIDDEN' })
}

// Check org membership
if (job.orgId !== ctx.orgId) {
  throw new TRPCError({ code: 'NOT_FOUND' }) // Don't leak existence
}
```

### Data Sanitization

Sanitize user input:

```typescript
import { sanitizeHtml } from '@/lib/utils/sanitize'

const description = sanitizeHtml(input.description)
```

### Rate Limiting

Apply rate limits to mutations:

```typescript
export const rateLimitedProcedure = protectedProcedure.use(
  rateLimiter({ maxRequests: 100, windowMs: 60000 })
)
```

---

## DO's and DON'Ts

### DO

- Filter by `org_id` in every query
- Use soft deletes with `deleted_at`
- Set audit fields (`created_by`, `updated_by`)
- Emit events for business actions
- Use transactions for related operations
- Validate input with Zod
- Handle errors with TRPCError

### DON'T

- Expose internal IDs in URLs (use UUIDs)
- Return more data than needed
- Skip org_id filtering
- Delete data permanently
- Forget to emit events
- Mix business logic in routers (use services)
- Bypass authentication/authorization
