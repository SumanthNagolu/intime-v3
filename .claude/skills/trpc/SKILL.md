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
  // List with pagination
  list: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const { limit, offset, status } = input;

      const items = await db.select()
        .from(tableName)
        .where(and(
          eq(tableName.orgId, orgId),
          isNull(tableName.deletedAt),
          status ? eq(tableName.status, status) : undefined
        ))
        .limit(limit)
        .offset(offset);

      return items;
    }),

  // Get by ID
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const item = await db.query.tableName.findFirst({
        where: and(
          eq(tableName.id, input.id),
          eq(tableName.orgId, orgId),
          isNull(tableName.deletedAt)
        ),
        with: { /* relations */ },
      });

      if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
      return item;
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

## Validation Schemas Location
```
src/lib/validations/
├── ats.ts       # Job, submission, interview schemas
├── crm.ts       # Account, lead, deal schemas
├── academy.ts   # Course, enrollment schemas
└── shared.ts    # Common schemas (pagination, etc.)
```

## Frontend Hook Patterns

### Query Hook
```typescript
// src/hooks/queries/useJobs.ts
import { trpc } from '@/lib/trpc/client';

export function useJobs(options?: { status?: string }) {
  return trpc.ats.jobs.list.useQuery({
    status: options?.status,
  });
}

export function useJob(id: string) {
  return trpc.ats.jobs.getById.useQuery({ id }, {
    enabled: !!id,
  });
}
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
