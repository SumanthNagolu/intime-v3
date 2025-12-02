---
name: trpc
description: tRPC router development patterns for InTime v3
---

# tRPC Skill - Router Development

## Router Locations
```
src/server/
├── routers/           # Business module routers
│   ├── ats.ts         # Jobs, submissions, interviews
│   ├── crm.ts         # Accounts, leads, deals
│   ├── bench.ts       # Bench sales
│   ├── ta-hr.ts       # HR/TA
│   ├── activities.ts  # Workplan activities
│   └── client.ts      # Client portal
│
└── trpc/
    ├── routers/       # Academy routers
    │   ├── courses.ts
    │   ├── enrollment.ts
    │   ├── progress.ts
    │   ├── quiz.ts
    │   └── certificates.ts
    ├── root.ts        # Root router combining all
    └── trpc.ts        # tRPC initialization
```

## Entity Categories

| Category | Entities | Workplan Integration |
|----------|----------|---------------------|
| **Root** | lead, job, submission, deal, placement | Full - create/update/status |
| **Supporting** | account, contact, candidate, interview, offer | None |
| **Platform** | user, organization, role | None |

## Procedure Types
```typescript
import { t } from '@/server/trpc/trpc';

// Public procedure (no auth)
const publicProcedure = t.procedure;

// Authenticated procedure
const authedProcedure = t.procedure
  .use(authMiddleware);

// Org-protected procedure (most common)
const orgProtectedProcedure = t.procedure
  .use(authMiddleware)
  .use(orgMiddleware);
```

## Standard Router Pattern
```typescript
import { router, orgProtectedProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { db } from '@/lib/db';
import { tableName } from '@/lib/db/schema/module';
import { eq, and, isNull } from 'drizzle-orm';

export const entityRouter = router({
  // List with pagination - MUST return paginated response format
  list: orgProtectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(50),
      search: z.string().optional(),
      filters: z.object({
        status: z.array(z.string()).optional(),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const { page, pageSize, search, filters } = input;

      // Build where conditions
      const conditions = [
        eq(tableName.orgId, orgId),
        isNull(tableName.deletedAt),
      ];
      if (filters?.status?.length) {
        conditions.push(inArray(tableName.status, filters.status));
      }
      if (search) {
        conditions.push(ilike(tableName.name, `%${search}%`));
      }

      // Get total count
      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(tableName)
        .where(and(...conditions));

      // Get paginated items
      const items = await db.select()
        .from(tableName)
        .where(and(...conditions))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(tableName.createdAt));

      // MUST return this format - frontend hooks depend on it
      return {
        items,
        total: Number(count),
        page,
        pageSize,
        totalPages: Math.ceil(Number(count) / pageSize),
      };
    }),

  // Get by ID - Use explicit queries, NOT relational queries
  // ⚠️ Drizzle's db.query.*.findFirst({ with: {...} }) generates failing lateral join SQL
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      // Fetch main entity with explicit select
      const results = await db.select()
        .from(tableName)
        .where(and(
          eq(tableName.id, input.id),
          eq(tableName.orgId, orgId),
          isNull(tableName.deletedAt)
        ))
        .limit(1);

      const item = results[0];
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' });

      // Fetch related data in parallel if needed
      const [childrenResults] = await Promise.all([
        db.select().from(childTable).where(eq(childTable.parentId, input.id)),
      ]);

      return { ...item, children: childrenResults };
    }),

  // Create
  create: orgProtectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [created] = await db.insert(tableName)
        .values({
          ...input,
          orgId,
          createdBy: userId,
        })
        .returning();

      return created;
    }),

  // Update
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const [updated] = await db.update(tableName)
        .set({ ...input.data, updatedAt: new Date() })
        .where(and(
          eq(tableName.id, input.id),
          eq(tableName.orgId, orgId)
        ))
        .returning();

      return updated;
    }),

  // Soft delete
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      await db.update(tableName)
        .set({ deletedAt: new Date() })
        .where(and(
          eq(tableName.id, input.id),
          eq(tableName.orgId, orgId)
        ));

      return { success: true };
    }),
});
```

## Workplan Integration (Root Entities Only)

Root entities (lead, job, submission, deal, placement) require workplan integration.

### Helper Functions
```typescript
import {
  createWorkplanInstance,
  logActivity,
  handleStatusChange
} from '@/lib/workplan';
```

### Create with Workplan
```typescript
create: orgProtectedProcedure
  .input(createSchema)
  .mutation(async ({ ctx, input }) => {
    const { userId, orgId } = ctx;

    return db.transaction(async (tx) => {
      // 1. Create entity
      const [entity] = await tx.insert(tableName)
        .values({
          ...input,
          orgId,
          createdBy: userId,
        })
        .returning();

      // 2. Create workplan (ROOT ENTITIES ONLY)
      await createWorkplanInstance(tx, {
        orgId,
        entityType: 'lead', // or 'job', 'submission', etc.
        entityId: entity.id,
        templateCode: 'lead_workflow',
        createdBy: userId,
      });

      // 3. Log activity
      await logActivity(tx, {
        orgId,
        entityType: 'lead',
        entityId: entity.id,
        subject: 'Lead created',
        category: 'lifecycle',
        performedBy: userId,
      });

      return entity;
    });
  }),
```

### Update with Activity Logging
```typescript
update: orgProtectedProcedure
  .input(updateSchema)
  .mutation(async ({ ctx, input }) => {
    const { userId, orgId } = ctx;

    return db.transaction(async (tx) => {
      // 1. Get old values for comparison
      const old = await tx.query.tableName.findFirst({
        where: eq(tableName.id, input.id),
      });

      if (!old) throw new TRPCError({ code: 'NOT_FOUND' });

      // 2. Update entity
      const [entity] = await tx.update(tableName)
        .set({ ...input.data, updatedAt: new Date() })
        .where(and(
          eq(tableName.id, input.id),
          eq(tableName.orgId, orgId)
        ))
        .returning();

      // 3. Log activity
      await logActivity(tx, {
        orgId,
        entityType: 'lead',
        entityId: entity.id,
        subject: 'Lead updated',
        category: 'update',
        performedBy: userId,
        details: { changes: diffObjects(old, entity) },
      });

      // 4. Handle status change (ROOT ENTITIES ONLY)
      if (old.status !== entity.status) {
        await handleStatusChange(tx, {
          orgId,
          entityType: 'lead',
          entityId: entity.id,
          oldStatus: old.status,
          newStatus: entity.status,
          changedBy: userId,
        });
      }

      return entity;
    });
  }),
```

### Workplan Helper Implementation
```typescript
// src/lib/workplan/index.ts

export async function createWorkplanInstance(tx, params) {
  const { orgId, entityType, entityId, templateCode, createdBy } = params;

  // Find template
  const template = await tx.query.workplanTemplates.findFirst({
    where: and(
      eq(workplanTemplates.code, templateCode),
      or(isNull(workplanTemplates.orgId), eq(workplanTemplates.orgId, orgId)),
    ),
    with: { activities: { with: { pattern: true } } },
  });

  if (!template) return null;

  // Create instance
  const [instance] = await tx.insert(workplanInstances)
    .values({
      orgId,
      templateId: template.id,
      entityType,
      entityId,
      status: 'active',
      startedAt: new Date(),
      createdBy,
    })
    .returning();

  // Create initial activities from template
  for (const templateActivity of template.activities) {
    await tx.insert(activities).values({
      orgId,
      workplanInstanceId: instance.id,
      patternId: templateActivity.patternId,
      entityType,
      entityId,
      subject: templateActivity.pattern.name,
      category: templateActivity.pattern.category,
      status: 'open',
      priority: templateActivity.pattern.priority,
      dueDate: addDays(new Date(), templateActivity.pattern.targetDays),
    });
  }

  return instance;
}

export async function logActivity(tx, params) {
  const [activity] = await tx.insert(activities)
    .values({
      orgId: params.orgId,
      entityType: params.entityType,
      entityId: params.entityId,
      subject: params.subject,
      category: params.category,
      status: 'completed',
      completedAt: new Date(),
      performedBy: params.performedBy,
      details: params.details,
    })
    .returning();

  return activity;
}

export async function handleStatusChange(tx, params) {
  // Log status change activity
  await logActivity(tx, {
    orgId: params.orgId,
    entityType: params.entityType,
    entityId: params.entityId,
    subject: `Status changed: ${params.oldStatus} → ${params.newStatus}`,
    category: 'status_change',
    performedBy: params.changedBy,
  });

  // Trigger successor activities if configured
  // ... (check activity_pattern_successors for 'status_change' triggers)
}
```

## Validation Schemas Location
```
src/lib/validations/
├── ats.ts       # Job, submission, interview schemas
├── crm.ts       # Account, lead, deal schemas
├── academy.ts   # Course, enrollment schemas
└── shared.ts    # Common schemas (pagination, etc.)
```

## Frontend Hook Patterns

### Query Hook - Paginated List
```typescript
// src/hooks/queries/useJobs.ts
import { trpc } from '@/lib/trpc/client';

// ⚠️ IMPORTANT: list procedures return { items, total, page, pageSize, totalPages }
// You MUST extract .items or use select() to transform

export function useJobs(options?: { status?: string; page?: number }) {
  const query = trpc.ats.jobs.list.useQuery({
    page: options?.page ?? 1,
    pageSize: 50,
    filters: options?.status ? { status: [options.status] } : undefined,
  }, {
    // Transform paginated response to just the items array
    select: (data) => data.items,
  });

  return {
    ...query,
    jobs: query.data ?? [],
    isEmpty: query.data?.length === 0,
  };
}

// Alternative: Return full paginated response for pagination UI
export function useJobsPaginated(options?: { page?: number; pageSize?: number }) {
  return trpc.ats.jobs.list.useQuery({
    page: options?.page ?? 1,
    pageSize: options?.pageSize ?? 50,
  });
  // Returns { items, total, page, pageSize, totalPages }
}

export function useJob(id: string) {
  return trpc.ats.jobs.getById.useQuery({ id }, {
    enabled: !!id,
  });
}
```

### ⚠️ Common Frontend Mistake
```typescript
// ❌ WRONG - list returns { items, total, ... }, not an array
const { data: accounts } = trpc.crm.accounts.list.useQuery({ page: 1, pageSize: 100 });
const list = accounts || [];  // ERROR: accounts is { items: [...] }, not an array

// ✅ CORRECT - extract items from response
const { data: accountsData } = trpc.crm.accounts.list.useQuery({ page: 1, pageSize: 100 });
const list = accountsData?.items || [];
```

### Mutation Hook
```typescript
// src/hooks/mutations/useCreateJob.ts
import { trpc } from '@/lib/trpc/client';

export function useCreateJob() {
  const utils = trpc.useUtils();

  return trpc.ats.jobs.create.useMutation({
    onSuccess: () => {
      utils.ats.jobs.list.invalidate();
    },
  });
}
```

## Root Router Structure
```typescript
// src/server/trpc/root.ts
export const appRouter = router({
  ats: atsRouter,
  crm: crmRouter,
  bench: benchRouter,
  taHr: taHrRouter,
  client: clientRouter,
  courses: coursesRouter,
  enrollment: enrollmentRouter,
  progress: progressRouter,
  activities: activitiesRouter,  // Activity-Centric
  events: eventsRouter,          // Event log queries
});

export type AppRouter = typeof appRouter;
```

## Activity-Centric Router Pattern

### Core Philosophy
```
"NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"
```

Every mutation on root entities must:
1. Execute business logic
2. Emit event (immutable record)
3. Create/update activity (human work tracking)
4. Check transition guards before status changes

### Activities Router

```typescript
// src/server/routers/activities.ts
export const activitiesRouter = router({
  // Get user's activity queue
  getMyQueue: orgProtectedProcedure
    .input(z.object({
      statuses: z.array(z.enum(['open', 'in_progress'])).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;
      const now = new Date();
      const todayEnd = endOfDay(now);

      const results = await db.select()
        .from(activities)
        .where(and(
          eq(activities.orgId, orgId),
          eq(activities.assignedTo, userId),
          inArray(activities.status, input.statuses ?? ['open', 'in_progress']),
        ))
        .orderBy(asc(activities.dueDate))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      // Categorize by due date
      return {
        overdue: results.filter(a => a.dueDate && a.dueDate < now),
        dueToday: results.filter(a => a.dueDate && a.dueDate >= now && a.dueDate <= todayEnd),
        upcoming: results.filter(a => !a.dueDate || a.dueDate > todayEnd),
        total: results.length,
      };
    }),

  // Get entity timeline (activities + events)
  getTimeline: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      includeEvents: z.boolean().default(true),
      page: z.number().default(1),
      pageSize: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const [activityResults, eventResults] = await Promise.all([
        db.select().from(activities)
          .where(and(
            eq(activities.relatedEntityType, input.entityType),
            eq(activities.relatedEntityId, input.entityId),
          ))
          .orderBy(desc(activities.createdAt)),

        input.includeEvents
          ? db.select().from(events)
              .where(and(
                eq(events.entityType, input.entityType),
                eq(events.entityId, input.entityId),
              ))
              .orderBy(desc(events.occurredAt))
          : Promise.resolve([]),
      ]);

      // Merge and sort by date
      const timeline = [
        ...activityResults.map(a => ({ type: 'activity' as const, data: a, date: a.createdAt })),
        ...eventResults.map(e => ({ type: 'event' as const, data: e, date: e.occurredAt })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { items: timeline };
    }),

  // Create activity
  create: orgProtectedProcedure
    .input(createActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      return db.transaction(async (tx) => {
        const activityNumber = await generateActivityNumber(tx, orgId);

        const [activity] = await tx.insert(activities)
          .values({
            ...input,
            orgId,
            activityNumber,
            createdBy: userId,
            assignedTo: input.assignedTo ?? userId,
          })
          .returning();

        // Update entity's lastActivityAt
        await updateEntityLastActivity(tx, input.relatedEntityType, input.relatedEntityId);

        return activity;
      });
    }),

  // Complete activity
  complete: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      outcome: z.enum(['successful', 'unsuccessful', 'no_answer', 'left_voicemail', 'rescheduled', 'no_show', 'partial', 'pending_response']),
      durationMinutes: z.number().optional(),
      outcomeNotes: z.string().optional(),
      followUp: z.object({
        type: z.string(),
        subject: z.string(),
        dueDate: z.date(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      return db.transaction(async (tx) => {
        // Update activity
        const [activity] = await tx.update(activities)
          .set({
            status: 'completed',
            outcome: input.outcome,
            outcomeNotes: input.outcomeNotes,
            durationMinutes: input.durationMinutes,
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(activities.id, input.id),
            eq(activities.orgId, orgId),
          ))
          .returning();

        // Create follow-up if requested
        if (input.followUp) {
          const followUpNumber = await generateActivityNumber(tx, orgId);
          const [followUpActivity] = await tx.insert(activities)
            .values({
              orgId,
              activityNumber: followUpNumber,
              activityType: input.followUp.type,
              subject: input.followUp.subject,
              relatedEntityType: activity.relatedEntityType,
              relatedEntityId: activity.relatedEntityId,
              assignedTo: activity.assignedTo,
              createdBy: userId,
              status: 'open',
              dueDate: input.followUp.dueDate,
            })
            .returning();

          // Link follow-up
          await tx.update(activities)
            .set({ followUpActivityId: followUpActivity.id })
            .where(eq(activities.id, input.id));
        }

        // Update entity's lastActivityAt
        await updateEntityLastActivity(tx, activity.relatedEntityType, activity.relatedEntityId);

        // Emit completion event
        await emitEvent(tx, {
          type: 'activity.completed',
          entityType: 'activity',
          entityId: activity.id,
          actorId: userId,
          eventData: { outcome: input.outcome, activityType: activity.activityType },
        });

        return activity;
      });
    }),

  // Check transition guard
  checkTransition: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      fromStatus: z.string(),
      toStatus: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const rule = transitionRules.find(
        r => r.entity_type === input.entityType &&
             r.from_status === input.fromStatus &&
             r.to_status === input.toStatus
      );

      if (!rule) return { allowed: true };

      for (const req of rule.required_activities) {
        const [{ count }] = await db.select({ count: sql<number>`count(*)` })
          .from(activities)
          .where(and(
            eq(activities.relatedEntityType, input.entityType),
            eq(activities.relatedEntityId, input.entityId),
            eq(activities.activityType, req.type),
            eq(activities.status, req.status),
          ));

        if (Number(count) < req.count) {
          return { allowed: false, errorMessage: rule.error_message };
        }
      }

      return { allowed: true };
    }),
});
```

### Mutation with Activity Pattern

```typescript
// Every root entity mutation should follow this pattern
update: orgProtectedProcedure
  .input(updateSchema)
  .mutation(async ({ ctx, input }) => {
    const { userId, orgId } = ctx;

    return db.transaction(async (tx) => {
      // 1. Get old values
      const [old] = await tx.select()
        .from(tableName)
        .where(eq(tableName.id, input.id))
        .limit(1);

      if (!old) throw new TRPCError({ code: 'NOT_FOUND' });

      // 2. Check transition guard if status is changing
      if (input.data.status && old.status !== input.data.status) {
        const guard = await checkTransitionAllowed(
          tx, entityType, input.id, old.status, input.data.status
        );
        if (!guard.allowed) {
          throw new TRPCError({ code: 'PRECONDITION_FAILED', message: guard.errorMessage });
        }
      }

      // 3. Update entity
      const [entity] = await tx.update(tableName)
        .set({ ...input.data, updatedAt: new Date() })
        .where(and(
          eq(tableName.id, input.id),
          eq(tableName.orgId, orgId)
        ))
        .returning();

      // 4. Emit event (ALWAYS)
      await emitEvent(tx, {
        type: `${entityType}.updated`,
        entityType,
        entityId: entity.id,
        actorId: userId,
        eventData: entity,
        changes: diffObjects(old, entity),
      });

      // 5. Handle status change
      if (old.status !== entity.status) {
        await emitEvent(tx, {
          type: `${entityType}.status_changed`,
          entityType,
          entityId: entity.id,
          actorId: userId,
          eventData: {
            oldStatus: old.status,
            newStatus: entity.status,
          },
        });

        await createActivity(tx, {
          orgId,
          activityType: 'status_change',
          subject: `Status: ${old.status} → ${entity.status}`,
          relatedEntityType: entityType,
          relatedEntityId: entity.id,
          assignedTo: userId,
          createdBy: userId,
          status: 'completed',
          completedAt: new Date(),
        });
      }

      return entity;
    });
  }),
```

## Common Context Values
```typescript
// Available in ctx for org-protected procedures
ctx.userId    // Current user ID
ctx.orgId     // Current organization ID
ctx.user      // Full user object (if loaded)
ctx.session   // Supabase session
```

## TypeScript Error Handling (CRITICAL)

### TRPCClientError Type Casting

When using tRPC hooks with `onError` callbacks, the error type is `TRPCClientError`, not `Error`. This causes type mismatches when passing to generic error handlers.

```typescript
// ❌ BAD - Type mismatch in hook callbacks
export function useCreateAccount(options?: MutationOptions) {
  return trpc.crm.accounts.create.useMutation({
    onError: (error) => {
      options?.onError?.(error); // Error: TRPCClientError not assignable to Error
    },
  });
}

// ✅ GOOD - Double assertion pattern
export function useCreateAccount(options?: MutationOptions) {
  return trpc.crm.accounts.create.useMutation({
    onError: (error) => {
      options?.onError?.(error as unknown as Error);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data as unknown);
    },
  });
}
```

### Context Properties May Be Null

After middleware checks, context properties are guaranteed non-null, but TypeScript doesn't know this:

```typescript
// ❌ BAD - ctx.userId might be null/undefined
const userId = ctx.userId;
await db.select().where(eq(table.userId, userId)); // Error!

// ✅ GOOD - Type assertion after orgProtectedProcedure middleware
const userId = ctx.userId as string;
const orgId = ctx.orgId as string;

// ✅ BETTER - Explicit check for clarity
if (!ctx.userId || !ctx.orgId) {
  throw new TRPCError({ code: 'UNAUTHORIZED' });
}
const userId = ctx.userId;
const orgId = ctx.orgId;
```

### Mutation Options Pattern

Define reusable mutation options types:

```typescript
// src/hooks/types.ts
export interface MutationOptions {
  onSuccess?: (data?: unknown) => void;
  onError?: (error: Error) => void;
}

// Usage in mutation hooks
export function useUpdateLead(options?: MutationOptions) {
  const utils = trpc.useUtils();

  return trpc.crm.leads.update.useMutation({
    onSuccess: (data) => {
      utils.crm.leads.list.invalidate();
      options?.onSuccess?.(data as unknown);
    },
    onError: (error) => {
      options?.onError?.(error as unknown as Error);
    },
  });
}
```

### Query Return Type Handling

```typescript
// ❌ BAD - Data might be undefined during loading
const { data } = trpc.items.list.useQuery({ page: 1, pageSize: 50 });
data.items.map(item => ...); // Error: data might be undefined!

// ✅ GOOD - Provide defaults
const { data } = trpc.items.list.useQuery({ page: 1, pageSize: 50 });
const items = data?.items ?? [];

// ✅ ALSO GOOD - Destructure with default
const { data = { items: [], total: 0 } } = trpc.items.list.useQuery({
  page: 1,
  pageSize: 50
});
```

### Error Casting Quick Reference

| Scenario | Pattern |
|----------|---------|
| `onError` callback | `error as unknown as Error` |
| `onSuccess` callback | `data as unknown` |
| `ctx.userId` after auth | `ctx.userId as string` |
| Query data | `data?.field ?? defaultValue` |
