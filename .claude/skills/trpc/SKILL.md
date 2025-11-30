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
});

export type AppRouter = typeof appRouter;
```

## Common Context Values
```typescript
// Available in ctx for org-protected procedures
ctx.userId    // Current user ID
ctx.orgId     // Current organization ID
ctx.user      // Full user object (if loaded)
ctx.session   // Supabase session
```
