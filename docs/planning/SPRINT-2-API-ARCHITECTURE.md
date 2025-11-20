# Sprint 2: tRPC API Architecture

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 2 (Week 3-4)
**Author:** Architect Agent
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

This document defines the tRPC API architecture for InTime v3, providing type-safe, end-to-end client-server communication with automatic type inference, runtime validation, and optimized performance.

### Key Features

1. **End-to-End Type Safety** - TypeScript types flow from server to client automatically
2. **Runtime Validation** - All inputs validated with Zod schemas
3. **Automatic Error Handling** - Consistent error responses across all procedures
4. **Request Batching** - Multiple queries batched into single HTTP request
5. **Multi-Tenancy** - Org isolation enforced in tRPC context
6. **Permission Checks** - RBAC integrated via middleware

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                    tRPC API ARCHITECTURE                           │
└────────────────────────────────────────────────────────────────────┘

CLIENT SIDE (React Components)                SERVER SIDE (Next.js API)
┌──────────────────────────┐                 ┌──────────────────────────┐
│  React Component         │                 │  tRPC App Router         │
│                          │                 │                          │
│  const { data } = trpc   │    HTTP POST    │  /api/trpc/[trpc]       │
│    .users.me.useQuery(); ├────────────────►│  route.ts                │
│                          │                 │                          │
│  Type: User              │◄────────────────┤  Returns: User           │
│  (auto-inferred!)        │    JSON         │  (type-safe!)            │
└──────────────────────────┘                 └────────┬─────────────────┘
                                                       │
                                                       │
                                            ┌──────────▼──────────┐
                                            │  tRPC Router        │
                                            │  Structure          │
                                            └──────────┬──────────┘
                                                       │
                    ┌──────────────┬─────────────────┼─────────────────┬─────────────┐
                    │              │                 │                 │             │
              ┌─────▼────┐  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐      │
              │  users   │  │ candidates  │  │    jobs     │  │  students   │      │
              │  router  │  │   router    │  │   router    │  │   router    │      │
              └─────┬────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
                    │              │                 │                 │             │
                    │              │                 │                 │             │
         ┌──────────┼──────────────┼─────────────────┼─────────────────┼─────────────┘
         │          │              │                 │                 │
         ▼          ▼              ▼                 ▼                 ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                      MIDDLEWARE STACK                               │
    │  1. isAuthenticated  - Check session exists                         │
    │  2. withPermission   - Check RBAC permissions                       │
    │  3. rateLimiter      - Prevent abuse (future)                       │
    └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │  tRPC Context          │
                        │  - session             │
                        │  - userId              │
                        │  - orgId               │
                        │  - supabase client     │
                        │  - permissions         │
                        └────────────────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │  Database (Supabase)   │
                        │  with RLS policies     │
                        └────────────────────────┘
```

---

## Design Decisions

### Decision 1: Use drizzle-zod for Schema Generation

**Problem:** Should we hand-write Zod schemas or generate from Drizzle ORM?

**Decision:** **Use drizzle-zod to generate Zod schemas from Drizzle schema**

**Rationale:**
- **DRY Principle:** Single source of truth (Drizzle schema)
- **Consistency:** Database schema and validation always in sync
- **Less Boilerplate:** Auto-generate vs. writing 100+ lines per entity
- **Type Safety:** Types automatically inferred from database schema

**Implementation:**
```typescript
// Install package
pnpm add drizzle-zod

// Generate schemas
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userProfiles } from '@/lib/db/schema/user-profiles';

export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const selectUserProfileSchema = createSelectSchema(userProfiles);
export const updateUserProfileSchema = insertUserProfileSchema.partial();
```

**Trade-off:** Less flexibility for custom validation rules
**Mitigation:** Use `.refine()` and `.extend()` for custom rules

---

### Decision 2: tRPC Context Creation Strategy

**Problem:** Creating Supabase client on every request may impact performance

**Decision:** **Create new Supabase client per request (Option A)**

**Rationale:**
- **Correctness:** Each request has proper user context (cookies)
- **Security:** No risk of session leakage between requests
- **Simplicity:** Easier to implement and debug
- **Performance:** Supabase client creation is fast (~1-2ms)

**Future Optimization:** If profiling shows bottleneck, implement connection pooling

**Implementation:**
```typescript
async function createContext({ req, res }: CreateNextContextOptions) {
  const supabase = createClient(); // New client per request
  const { data: { session } } = await supabase.auth.getSession();

  return {
    req,
    res,
    session,
    supabase,
    userId: session?.user?.id,
    // orgId fetched lazily if needed
  };
}
```

---

### Decision 3: Admin UI Framework

**Problem:** Should admin UI be server-rendered or client-rendered?

**Decision:** **Client-rendered with tRPC hooks (Option B)**

**Rationale:**
- **Better UX:** Real-time updates, optimistic UI
- **Type Safety:** tRPC hooks provide full type inference
- **React Query:** Built-in caching, refetching, optimistic updates
- **Consistency:** Same pattern as main app UI

**Trade-off:** Larger client bundle, requires JavaScript
**Acceptable Because:** Admin UI is internal tool, not public-facing

---

## File Structure

```
src/
├── server/
│   └── trpc/
│       ├── context.ts              # Context creation
│       ├── init.ts                 # tRPC initialization
│       ├── middleware.ts           # Auth, permissions middleware
│       ├── root.ts                 # App router (combines all routers)
│       └── routers/
│           ├── users.ts            # User management procedures
│           ├── candidates.ts       # Candidate procedures
│           ├── jobs.ts             # Job posting procedures
│           ├── students.ts         # Student procedures
│           └── admin/
│               ├── events.ts       # Event management (admin)
│               └── handlers.ts     # Handler management (admin)
├── lib/
│   ├── trpc/
│   │   ├── client.ts               # tRPC client setup
│   │   └── Provider.tsx            # React Query provider
│   ├── auth/
│   │   └── server.ts               # requireAuth() helper
│   └── rbac/
│       └── index.ts                # checkPermission() helper
├── app/
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts        # Next.js API route handler
└── types/
    └── trpc.ts                     # Shared tRPC types
```

---

## Implementation

### 1. Install Dependencies

```bash
pnpm add @trpc/server @trpc/client @trpc/react-query@next @tanstack/react-query superjson drizzle-zod react-hook-form @hookform/resolvers
```

---

### 2. Context Creation

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/context.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import type { Session } from '@supabase/supabase-js';

export interface Context {
  session: Session | null;
  userId: string | null;
  supabase: ReturnType<typeof createClient>;
  orgId: string | null; // Lazy-loaded
}

export async function createContext(): Promise<Context> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return {
    session,
    userId: session?.user?.id || null,
    supabase,
    orgId: null // Will be fetched by middleware if needed
  };
}
```

---

### 3. tRPC Initialization

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/init.ts`

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson';
import { ZodError } from 'zod';

const t = initTRPC.context<Context>().create({
  transformer: superjson, // Serialize Date, Map, Set
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
```

---

### 4. Middleware

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/middleware.ts`

```typescript
import { TRPCError } from '@trpc/server';
import { middleware } from './init';
import { checkPermission } from '@/lib/rbac';

/**
 * Middleware: Require authentication
 */
export const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action'
    });
  }

  // Fetch org_id if not already loaded
  if (!ctx.orgId) {
    const { data: profile } = await ctx.supabase
      .from('user_profiles')
      .select('org_id')
      .eq('id', ctx.userId)
      .single();

    ctx.orgId = profile?.org_id || null;
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session, // Type narrowing
      userId: ctx.userId,   // Type narrowing
      orgId: ctx.orgId
    }
  });
});

/**
 * Middleware: Require specific permission
 */
export const withPermission = (resource: string, action: string) => {
  return middleware(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const hasPermission = await checkPermission(
      ctx.userId,
      resource,
      action
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You don't have permission to ${action} ${resource}`
      });
    }

    return next();
  });
};

/**
 * Procedure: Protected (requires auth)
 */
export const protectedProcedure = publicProcedure.use(isAuthenticated);

/**
 * Procedure: Admin (requires admin role)
 */
export const adminProcedure = protectedProcedure.use(
  withPermission('system', 'admin')
);
```

---

### 5. Helper Functions

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/auth/server.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import type { Session } from '@supabase/supabase-js';

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Require authenticated session (throws if not authenticated)
 */
export async function requireAuth(): Promise<Session> {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    throw new AuthenticationError();
  }

  return session;
}

/**
 * Get current authenticated user ID (or null)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}
```

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/rbac/index.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export class AuthorizationError extends Error {
  constructor(message: string = 'Permission denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Check if user has permission for resource + action
 */
export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action
  });

  if (error) {
    console.error('Permission check failed:', error);
    return false;
  }

  return data === true;
}

/**
 * Require permission (throws if not authorized)
 */
export async function requirePermission(
  userId: string,
  resource: string,
  action: string
): Promise<void> {
  const hasPermission = await checkPermission(userId, resource, action);

  if (!hasPermission) {
    throw new AuthorizationError(
      `You don't have permission to ${action} ${resource}`
    );
  }
}
```

**Missing Database Function** (add to Migration 003 or 008):
```sql
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.resource = p_resource
      AND p.action = p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 6. Zod Schemas (Generated from Drizzle)

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/schema/validations.ts`

```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userProfiles } from './user-profiles';
import { z } from 'zod';

// Auto-generated base schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const selectUserProfileSchema = createSelectSchema(userProfiles);

// Custom refined schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['student', 'candidate', 'trainer', 'recruiter'])
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = insertUserProfileSchema
  .pick({
    full_name: true,
    phone: true,
    bio: true,
    linkedin_url: true,
    github_url: true
  })
  .partial();

// Candidate schemas
export const createCandidateSchema = z.object({
  userId: z.string().uuid(),
  skills: z.array(z.string()).min(1, 'At least one skill required'),
  experienceYears: z.number().min(0).max(50),
  resumeUrl: z.string().url().optional(),
  expectedSalary: z.number().positive().optional()
});

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  clientId: z.string().uuid(),
  requiredSkills: z.array(z.string()).min(1),
  experienceYearsMin: z.number().min(0),
  experienceYearsMax: z.number().min(0),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional()
}).refine(
  (data) => data.experienceYearsMax >= data.experienceYearsMin,
  { message: 'Max experience must be >= min experience' }
).refine(
  (data) => !data.salaryMax || !data.salaryMin || data.salaryMax >= data.salaryMin,
  { message: 'Max salary must be >= min salary' }
);
```

---

### 7. Router Examples

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/routers/users.ts`

```typescript
import { router, publicProcedure } from '../init';
import { protectedProcedure, adminProcedure } from '../middleware';
import { z } from 'zod';
import { signupSchema, loginSchema, updateProfileSchema } from '@/lib/db/schema/validations';

export const usersRouter = router({
  /**
   * Get current user profile
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile, error } = await ctx.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', ctx.userId)
      .single();

    if (error || !profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profile not found'
      });
    }

    return profile;
  }),

  /**
   * Update own profile
   */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .update(input)
        .eq('id', ctx.userId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data;
    }),

  /**
   * List all users (admin only)
   */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        role: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('user_profiles')
        .select('*, user_roles(role:roles(name))', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.role) {
        query = query.eq('user_roles.role.name', input.role);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return {
        users: data,
        total: count || 0,
        hasMore: (input.offset + input.limit) < (count || 0)
      };
    }),

  /**
   * Get user by ID (admin only)
   */
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      return data;
    })
});
```

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/routers/admin/events.ts`

```typescript
import { router } from '../../init';
import { adminProcedure } from '../../middleware';
import { z } from 'zod';

export const eventsRouter = router({
  /**
   * Get events with filters
   */
  list: adminProcedure
    .input(
      z.object({
        eventType: z.string().optional(),
        status: z.enum(['pending', 'processing', 'completed', 'failed', 'dead_letter']).optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        limit: z.number().min(1).max(1000).default(100),
        offset: z.number().min(0).default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('get_events_filtered', {
        p_event_type: input.eventType || null,
        p_status: input.status || null,
        p_from_date: input.fromDate || new Date(Date.now() - 24 * 60 * 60 * 1000),
        p_to_date: input.toDate || new Date(),
        p_limit: input.limit,
        p_offset: input.offset
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data;
    }),

  /**
   * Get dead letter queue
   */
  deadLetterQueue: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('v_dead_letter_queue')
      .select('*')
      .limit(100);

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      });
    }

    return data;
  }),

  /**
   * Replay failed events
   */
  replay: adminProcedure
    .input(
      z.object({
        eventIds: z.array(z.string().uuid())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('replay_failed_events_batch', {
        p_event_ids: input.eventIds
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return data;
    }),

  /**
   * Get event metrics (last 24 hours)
   */
  metrics: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('v_event_metrics_24h')
      .select('*');

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      });
    }

    return data;
  })
});
```

---

### 8. App Router

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/root.ts`

```typescript
import { router } from './init';
import { usersRouter } from './routers/users';
import { candidatesRouter } from './routers/candidates';
import { jobsRouter } from './routers/jobs';
import { studentsRouter } from './routers/students';
import { eventsRouter } from './routers/admin/events';
import { handlersRouter } from './routers/admin/handlers';

export const appRouter = router({
  users: usersRouter,
  candidates: candidatesRouter,
  jobs: jobsRouter,
  students: studentsRouter,
  admin: router({
    events: eventsRouter,
    handlers: handlersRouter
  })
});

export type AppRouter = typeof appRouter;
```

---

### 9. Next.js API Route

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/app/api/trpc/[trpc]/route.ts`

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

---

### 10. Client Setup

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/trpc/client.ts`

```typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/trpc/root';

export const trpc = createTRPCReact<AppRouter>();
```

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/trpc/Provider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from './client';
import superjson from 'superjson';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false
      }
    }
  }));

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

**Update:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/app/layout.tsx`

```typescript
import { TRPCProvider } from '@/lib/trpc/Provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

---

### 11. Usage Examples

**Client Component:**
```typescript
'use client';

import { trpc } from '@/lib/trpc/client';

export function UserProfile() {
  const { data: user, isLoading } = trpc.users.me.useQuery();
  const updateProfile = trpc.users.updateProfile.useMutation();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user?.full_name}</h1>
      <button
        onClick={() =>
          updateProfile.mutate({
            bio: 'Updated bio'
          })
        }
      >
        Update Bio
      </button>
    </div>
  );
}
```

**Server Component:**
```typescript
import { createCaller } from '@/server/trpc/root';
import { createContext } from '@/server/trpc/context';

export default async function Page() {
  const ctx = await createContext();
  const caller = createCaller(ctx);

  const users = await caller.users.list({ limit: 10 });

  return (
    <div>
      {users.users.map(user => (
        <div key={user.id}>{user.full_name}</div>
      ))}
    </div>
  );
}
```

---

## Testing

```typescript
// users.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from '@/server/trpc/root';
import { createContext } from '@/server/trpc/context';

describe('Users Router', () => {
  it('requires auth for me query', async () => {
    const ctx = await createContext(); // No session
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.me()).rejects.toThrow('UNAUTHORIZED');
  });

  it('returns user profile for authenticated user', async () => {
    const ctx = await createContext(); // Mock session
    ctx.session = { user: { id: '123' } } as any;
    ctx.userId = '123';

    const caller = appRouter.createCaller(ctx);
    const profile = await caller.users.me();

    expect(profile.id).toBe('123');
  });
});
```

---

## Performance Specifications

| Operation | Target | Notes |
|-----------|--------|-------|
| Single query | < 100ms | p95 latency |
| Batched queries | < 150ms | 10 queries batched |
| Mutation | < 200ms | Includes DB write |
| Type inference | Instant | Compile-time |

---

## Next Steps

1. **Developer Agent:** Implement all routers
2. **Developer Agent:** Write tests for critical paths
3. **QA Agent:** Test type safety, validation, errors
4. **Deployment Agent:** Deploy tRPC API

---

**Status:** ✅ READY FOR IMPLEMENTATION

---

**End of tRPC API Architecture Document**
