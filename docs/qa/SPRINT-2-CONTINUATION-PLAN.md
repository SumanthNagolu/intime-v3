# Sprint 2 Continuation Plan

**QA Agent Handoff Document**
**Date:** 2025-11-19
**Sprint:** Sprint 2 - Event Bus & API Foundation
**Current Status:** 65% Complete (16.7 / 26 story points)
**Target:** 100% Complete (26 / 26 story points)

---

## Executive Summary

Sprint 2 is 65% complete with solid foundational work in place. The Event Bus core architecture is well-designed, the database migration is production-ready, and all packages are installed. However, **critical TypeScript errors prevent code execution** and **35% of functionality remains unbuilt**.

**Recommended Approach:** Fix critical bugs first (1 hour), then complete remaining implementation systematically (15-17 hours total).

**Estimated Time to Completion:** 2-3 working days

---

## Current State Assessment

### What's Working ✅

1. **Database Layer (100% Complete)**
   - Migration 008 is well-structured and production-ready
   - Health monitoring columns added
   - Admin functions created
   - RLS policies defined
   - Performance indexes optimized
   - Rollback script available

2. **Event Bus Core (90% Complete)**
   - Type-safe architecture
   - Singleton pattern
   - PostgreSQL LISTEN/NOTIFY integration
   - Handler registry
   - Retry logic (database-side)
   - Connection pooling

3. **Package Management (100% Complete)**
   - All dependencies installed (tRPC, Zod, Sentry, etc.)
   - No peer dependency conflicts

### What's Broken ❌

1. **TypeScript Compilation (CRITICAL)**
   - 6 compilation errors
   - Missing decorator configuration
   - Async/await bug in handlers
   - Code will not run

2. **Event Handlers (CRITICAL)**
   - Cannot execute due to TypeScript errors
   - Supabase client usage bug

### What's Missing ⏳

1. **tRPC Infrastructure (80% Missing)**
   - Only empty directories exist
   - Need: context, middleware, routers, API route, client setup

2. **Admin UI (100% Missing)**
   - No event management page
   - No handler health dashboard

3. **Error Handling (90% Missing)**
   - Sentry not configured
   - No error boundary
   - No custom error classes

4. **Tests (100% Missing)**
   - Zero unit tests
   - Zero integration tests
   - Zero E2E tests

---

## Critical Path to Completion

### Phase 1: Fix Critical Bugs (1 hour)
**Priority:** IMMEDIATE (Blocking)
**Goal:** Get code compiling

| Task | File | Change | Time |
|------|------|--------|------|
| Enable decorators | `tsconfig.json` | Add `experimentalDecorators: true` | 5 min |
| Fix async/await bug | `course-handlers.ts` | Add `await` before `createClient()` | 5 min |
| Add pool getter | `EventBus.ts` | Create `getPool()` method | 10 min |
| Add env validation | `init.ts` | Check `SUPABASE_DB_URL` exists | 15 min |
| Use env for org ID | `init.ts` | Use `process.env.DEFAULT_ORG_ID` | 10 min |
| Safer migration | `008_refine_event_bus.sql` | Query first org instead of hard-code | 10 min |
| Verify compilation | Terminal | Run `pnpm tsc --noEmit` | 5 min |

**Deliverable:** Code compiles with 0 errors

**Verification:**
```bash
pnpm tsc --noEmit
# Should output: "0 errors"
```

---

### Phase 2: Apply Migration 008 (15 minutes)
**Priority:** HIGH (Prerequisite for testing)
**Goal:** Database ready for Event Bus

**Steps:**
```bash
# 1. Backup current database (recommended)
pg_dump $SUPABASE_DB_URL > backup_before_migration_008.sql

# 2. Apply migration
psql $SUPABASE_DB_URL -f src/lib/db/migrations/008_refine_event_bus.sql

# 3. Verify migration
psql $SUPABASE_DB_URL -c "SELECT * FROM v_event_bus_validation;"
# Expected: All rows show status = 'PASS'

# 4. Test admin functions
psql $SUPABASE_DB_URL -c "SELECT * FROM get_event_handler_health();"
# Should return empty result set (no handlers registered yet)
```

**Deliverable:** Database schema updated, validation passing

---

### Phase 3: Complete tRPC Infrastructure (3 hours)
**Priority:** HIGH (Required for Admin UI)
**Goal:** Type-safe API layer working

#### Step 1: Create Context (30 minutes)
**File:** `src/server/trpc/context.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function createContext() {
  const cookieStore = await cookies();
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  let userId: string | null = null;
  let orgId: string | null = null;

  if (session?.user) {
    userId = session.user.id;

    // Get user's org_id
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('id', userId)
      .single();

    orgId = profile?.org_id || null;
  }

  return {
    session,
    userId,
    orgId,
    supabase
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

#### Step 2: Create tRPC Init (30 minutes)
**File:** `src/server/trpc/init.ts`

```typescript
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  }
});

export const router = t.router;
export const publicProcedure = t.procedure;
```

#### Step 3: Create Middleware (30 minutes)
**File:** `src/server/trpc/middleware.ts`

```typescript
import { TRPCError } from '@trpc/server';
import { publicProcedure } from './init';

export const isAuthenticated = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId // Narrow type to non-null
    }
  });
});

export const isAdmin = isAuthenticated.use(async ({ ctx, next }) => {
  const { data: isAdmin } = await ctx.supabase.rpc('user_is_admin');

  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required'
    });
  }

  return next({ ctx });
});

export const protectedProcedure = isAuthenticated;
export const adminProcedure = isAdmin;
```

#### Step 4: Create Helper Functions (30 minutes)

**File:** `src/lib/auth/server.ts`
```typescript
import { createClient } from '@/lib/supabase/server';

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Authentication required');
  }

  return session;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}
```

**File:** `src/lib/rbac/index.ts`
```typescript
import { createClient } from '@/lib/supabase/server';

export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action
  });

  if (error) {
    console.error('Permission check failed:', error);
    return false;
  }

  return data || false;
}

export async function requirePermission(
  userId: string,
  resource: string,
  action: string
) {
  const hasPermission = await checkPermission(userId, resource, action);

  if (!hasPermission) {
    throw new Error(`Permission denied: ${resource}.${action}`);
  }
}
```

#### Step 5: Add Missing Database Function (15 minutes)

**File:** Create `src/lib/db/migrations/009_add_permission_function.sql`
```sql
-- Add user_has_permission function (missing from Migration 008)

CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.resource = p_resource
      AND p.action = p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_permission IS 'Check if user has specific permission';
```

Apply migration:
```bash
psql $SUPABASE_DB_URL -f src/lib/db/migrations/009_add_permission_function.sql
```

#### Step 6: Create Routers (45 minutes)

**File:** `src/server/trpc/routers/users.ts`
```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../init';

export const usersRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', ctx.userId)
      .single();

    if (error) throw error;
    return data;
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      full_name: z.string().optional(),
      phone: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .update(input)
        .eq('id', ctx.userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    })
});
```

**File:** `src/server/trpc/routers/admin/events.ts`
```typescript
import { z } from 'zod';
import { router } from '../../init';
import { adminProcedure } from '../../middleware';

export const adminEventsRouter = router({
  list: adminProcedure
    .input(z.object({
      eventType: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().default(100),
      offset: z.number().default(0)
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('get_events_filtered', {
        p_event_type: input.eventType || null,
        p_status: input.status || null,
        p_limit: input.limit,
        p_offset: input.offset
      });

      if (error) throw error;
      return data;
    }),

  deadLetterQueue: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('v_dead_letter_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }),

  replay: adminProcedure
    .input(z.object({
      eventIds: z.array(z.string().uuid())
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('replay_failed_events_batch', {
        p_event_ids: input.eventIds
      });

      if (error) throw error;
      return data;
    })
});
```

**File:** `src/server/trpc/routers/admin/handlers.ts`
```typescript
import { z } from 'zod';
import { router } from '../../init';
import { adminProcedure } from '../../middleware';

export const adminHandlersRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.rpc('get_event_handler_health');

    if (error) throw error;
    return data;
  }),

  disable: adminProcedure
    .input(z.object({
      subscriptionId: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('disable_event_handler', {
        p_subscription_id: input.subscriptionId
      });

      if (error) throw error;
      return data;
    }),

  enable: adminProcedure
    .input(z.object({
      subscriptionId: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('enable_event_handler', {
        p_subscription_id: input.subscriptionId
      });

      if (error) throw error;
      return data;
    })
});
```

**File:** `src/server/trpc/root.ts`
```typescript
import { router } from './init';
import { usersRouter } from './routers/users';
import { adminEventsRouter } from './routers/admin/events';
import { adminHandlersRouter } from './routers/admin/handlers';

export const appRouter = router({
  users: usersRouter,
  admin: router({
    events: adminEventsRouter,
    handlers: adminHandlersRouter
  })
});

export type AppRouter = typeof appRouter;
```

#### Step 7: Create API Route (15 minutes)

**File:** `src/app/api/trpc/[trpc]/route.ts`
```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/root';
import { createContext } from '@/server/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext
  });

export { handler as GET, handler as POST };
```

#### Step 8: Create Client Setup (30 minutes)

**File:** `src/lib/trpc/client.ts`
```typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/trpc/root';

export const trpc = createTRPCReact<AppRouter>();
```

**File:** `src/lib/trpc/Provider.tsx`
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson
        })
      ]
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

#### Step 9: Update Root Layout (10 minutes)

**File:** `src/app/layout.tsx`
```typescript
import { TRPCProvider } from '@/lib/trpc/Provider';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
```

#### Step 10: Test tRPC Setup (20 minutes)

**Create test page:** `src/app/test-trpc/page.tsx`
```typescript
'use client';

import { trpc } from '@/lib/trpc/client';

export default function TestTRPCPage() {
  const { data, isLoading } = trpc.users.me.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>tRPC Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

**Test:**
```bash
pnpm dev
# Visit http://localhost:3000/test-trpc
# Should show current user profile or auth error
```

**Deliverable:** tRPC API working end-to-end with type safety

---

### Phase 4: Build Admin UI (4 hours)
**Priority:** HIGH (User story requirement)
**Goal:** Event and handler management UI

#### Step 1: Create Reusable Components (1 hour)

**File:** `src/components/admin/EventTable.tsx`
```typescript
'use client';

import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';

export function EventTable() {
  const [filters, setFilters] = useState({
    eventType: '',
    status: '',
    limit: 100,
    offset: 0
  });

  const { data: events, isLoading } = trpc.admin.events.list.useQuery(filters);

  if (isLoading) return <div>Loading events...</div>;

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Event Type"
          value={filters.eventType}
          onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="dead_letter">Dead Letter</option>
        </select>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Status</th>
            <th>Created</th>
            <th>Retries</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events?.map((event) => (
            <tr key={event.id}>
              <td>{event.event_type}</td>
              <td>{event.status}</td>
              <td>{new Date(event.created_at).toLocaleString()}</td>
              <td>{event.retry_count}</td>
              <td>
                <button>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**File:** `src/components/admin/HandlerHealthTable.tsx`
(Similar structure - see implementation guide)

**File:** `src/components/admin/EventDetailsModal.tsx`
(Modal with JSON payload viewer)

#### Step 2: Create Admin Pages (2 hours)

**File:** `src/app/admin/events/page.tsx`
**File:** `src/app/admin/handlers/page.tsx`

(Use shadcn/ui components for polish)

#### Step 3: Test UI End-to-End (1 hour)

**Deliverable:** Admin UI functional with real data

---

### Phase 5: Configure Error Handling (2 hours)
**Priority:** MEDIUM (Production requirement)
**Goal:** Sentry tracking errors

#### Steps:
1. Run `npx @sentry/wizard@latest -i nextjs` (30 min)
2. Create error classes in `src/lib/errors/index.ts` (30 min)
3. Create error boundary in `src/components/ErrorBoundary.tsx` (30 min)
4. Create 404/500 pages (20 min)
5. Test Sentry integration (10 min)

**Deliverable:** Errors tracked in Sentry

---

### Phase 6: Add Zod Validation (2 hours)
**Priority:** MEDIUM (Input validation)
**Goal:** Runtime validation on all inputs

#### Steps:
1. Create validation schemas (60 min)
2. Create form helper hooks (15 min)
3. Integrate with tRPC routers (30 min)
4. Create example form with validation (30 min)
5. Test validation end-to-end (15 min)

**Deliverable:** All inputs validated

---

### Phase 7: Write Tests (5 hours)
**Priority:** CRITICAL (Quality requirement)
**Goal:** 80%+ code coverage

#### Unit Tests (2 hours)
- EventBus methods
- HandlerRegistry methods
- Event handlers (user, course)

#### Integration Tests (2 hours)
- Event publish → handler execute
- Handler failure → retry → dead letter
- Multi-tenancy RLS enforcement

#### E2E Tests (1 hour)
- Admin event management
- Admin handler dashboard

**Deliverable:** All tests passing

---

### Phase 8: Documentation (1 hour)
**Priority:** LOW (Nice to have)
**Goal:** Complete handoff docs

#### Tasks:
1. Code review notes
2. Acceptance criteria checklist
3. API documentation

**Deliverable:** Documentation complete

---

## Estimated Timeline

### Option 1: Solo Developer (Recommended)

**Day 1 (8 hours):**
- Morning: Phase 1 + 2 (Fix bugs, apply migration) - 1.25 hours
- Rest of day: Phase 3 (Complete tRPC) - 3 hours
- Phase 4 start (Admin UI) - 3 hours
- **End of Day 1:** tRPC complete, Admin UI 75% done

**Day 2 (8 hours):**
- Morning: Phase 4 finish (Admin UI) - 1 hour
- Phase 5 (Error handling) - 2 hours
- Phase 6 (Zod validation) - 2 hours
- Phase 7 start (Tests) - 3 hours
- **End of Day 2:** Admin UI done, error handling done, tests 60% done

**Day 3 (4 hours):**
- Phase 7 finish (Tests) - 2 hours
- Phase 8 (Documentation) - 1 hour
- Final QA and bug fixes - 1 hour
- **End of Day 3:** Sprint 2 complete (100%)

**Total Time:** 20 hours (2.5 working days)

---

### Option 2: Parallel Work (If Team Available)

**Developer 1: Backend (Day 1-2)**
- Phase 1: Fix bugs
- Phase 2: Apply migration
- Phase 3: tRPC infrastructure
- Phase 5: Error handling
- Phase 6: Zod validation

**Developer 2: Frontend (Day 2-3)**
- Phase 4: Admin UI (requires tRPC from Dev 1)

**Developer 3 (or QA): Testing (Day 2-3)**
- Phase 7: Write tests (can start after Phase 1-2)

**Total Time:** 2 working days (with 2-3 people)

---

## Blockers and Dependencies

### Current Blockers
1. ❌ TypeScript compilation fails (blocks all testing)
2. ❌ Migration 008 not applied (blocks Event Bus testing)

### Dependencies
- Admin UI requires tRPC (Phase 3 before Phase 4)
- Tests require working code (Phase 1 before Phase 7)
- Zod validation integrated with tRPC (Phase 3 before Phase 6)

### No Blockers After Phase 1
Once Phase 1 complete, all remaining work can proceed in parallel.

---

## Success Criteria

### Definition of Done
- ✅ All 6 user stories 100% complete
- ✅ All acceptance criteria met
- ✅ TypeScript compiles with 0 errors
- ✅ All tests passing (80%+ coverage)
- ✅ Admin UI functional
- ✅ Sentry configured
- ✅ Documentation complete

### Quality Gates
- Static analysis: `pnpm tsc --noEmit` passes
- Unit tests: `pnpm test` passes
- E2E tests: `pnpm test:e2e` passes
- Code review: No critical issues
- Performance: Event publish < 50ms (95th percentile)

---

## Handoff Checklist

### For Next Developer

**Before Starting:**
- [ ] Read SPRINT-2-QA-REPORT.md (understand current state)
- [ ] Read SPRINT-2-BUGS-AND-GAPS.md (know what to fix)
- [ ] Read SPRINT-2-CONTINUATION-PLAN.md (this document)
- [ ] Verify environment setup (.env.local has SUPABASE_DB_URL)

**Phase 1 (Fix Bugs):**
- [ ] Enable decorators in tsconfig.json
- [ ] Fix async/await in course-handlers.ts
- [ ] Add getPool() method to EventBus
- [ ] Add environment variable validation
- [ ] Use env for default org ID
- [ ] Update migration to use first org
- [ ] Run `pnpm tsc --noEmit` (verify 0 errors)

**Phase 2 (Database):**
- [ ] Backup database
- [ ] Apply migration 008
- [ ] Verify with v_event_bus_validation
- [ ] Test admin functions

**Phase 3 (tRPC):**
- [ ] Create context.ts
- [ ] Create init.ts
- [ ] Create middleware.ts
- [ ] Create helper functions
- [ ] Apply migration 009 (user_has_permission)
- [ ] Create routers (users, admin/events, admin/handlers)
- [ ] Create API route
- [ ] Create client setup
- [ ] Update root layout
- [ ] Test with /test-trpc page

**Phase 4 (Admin UI):**
- [ ] Create EventTable component
- [ ] Create HandlerHealthTable component
- [ ] Create EventDetailsModal component
- [ ] Create admin/events page
- [ ] Create admin/handlers page
- [ ] Test UI end-to-end

**Phase 5 (Error Handling):**
- [ ] Run Sentry wizard
- [ ] Create error classes
- [ ] Create error boundary
- [ ] Create 404/500 pages
- [ ] Test Sentry integration

**Phase 6 (Validation):**
- [ ] Create Zod schemas
- [ ] Create form helpers
- [ ] Integrate with tRPC
- [ ] Create example form
- [ ] Test validation

**Phase 7 (Tests):**
- [ ] Write unit tests (EventBus, HandlerRegistry)
- [ ] Write integration tests (event flow, retry, RLS)
- [ ] Write E2E tests (admin UI)
- [ ] Run all tests, verify passing
- [ ] Measure code coverage (80%+)

**Phase 8 (Documentation):**
- [ ] Create code review notes
- [ ] Create acceptance criteria checklist
- [ ] Document API endpoints
- [ ] Final QA review

**Final Steps:**
- [ ] Run full test suite
- [ ] Verify all acceptance criteria met
- [ ] Create pull request
- [ ] Notify QA for final testing

---

## Contact and Support

**Questions?**
- Refer to architecture documents in `docs/planning/SPRINT-2-*.md`
- Check implementation guide: `SPRINT-2-IMPLEMENTATION-GUIDE.md`
- Review PM requirements: `SPRINT-2-PM-REQUIREMENTS.md`

**Stuck?**
- Review QA reports for detailed bug analysis
- Check code examples in continuation plan
- Follow step-by-step instructions in each phase

---

**Plan Created:** 2025-11-19
**QA Agent:** Claude (Sonnet 4.5)
**Status:** Ready for handoff to Developer
**Estimated Completion:** 2-3 working days
