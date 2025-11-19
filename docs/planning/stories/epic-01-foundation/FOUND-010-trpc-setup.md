# FOUND-010: Set Up tRPC Routers and Middleware

**Story Points:** 5
**Sprint:** Sprint 2 (Week 3-4)
**Priority:** CRITICAL

---

## User Story

As a **Frontend Developer**,
I want **type-safe API calls with auto-complete and type checking**,
So that **I catch errors at compile time and have better DX**.

---

## Acceptance Criteria

- [ ] tRPC installed and configured for Next.js 15 App Router
- [ ] Base tRPC router created with context (user session, database)
- [ ] Authentication middleware for protected procedures
- [ ] Permission middleware for role-based access
- [ ] Error handling middleware with proper error codes
- [ ] React Query hooks auto-generated for client
- [ ] Example routers for users, candidates, jobs
- [ ] TypeScript types shared between client and server

---

## Technical Implementation

### Installation

```bash
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod
```

### tRPC Base Configuration

Create file: `src/lib/trpc/trpc.ts`

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { type Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { checkPermission } from '@/lib/rbac';
import superjson from 'superjson';

/**
 * Context for all tRPC procedures
 */
export interface Context {
  session: Session | null;
  userId: string | null;
  supabase: ReturnType<typeof createClient>;
}

/**
 * Create context from Next.js request
 */
export async function createContext(): Promise<Context> {
  const supabase = createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return {
    session,
    userId: session?.user?.id || null,
    supabase
  };
}

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error ? error.cause.message : null
      }
    };
  }
});

/**
 * Base router and procedure
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware: Require authentication
 */
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action'
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.userId
    }
  });
});

/**
 * Protected procedure (requires authentication)
 */
export const protectedProcedure = t.procedure.use(isAuthenticated);

/**
 * Middleware: Require specific permission
 */
export function requirePermission(resource: string, action: string) {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in'
      });
    }

    const hasPermission = await checkPermission(ctx.userId, resource as any, action as any);

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You don't have permission to ${action} ${resource}`
      });
    }

    return next({ ctx });
  });
}

/**
 * Admin procedure (requires admin role)
 */
export const adminProcedure = protectedProcedure.use(
  requirePermission('system', 'admin')
);
```

### App Router

Create file: `src/lib/trpc/routers/_app.ts`

```typescript
import { router } from '../trpc';
import { usersRouter } from './users';
import { candidatesRouter } from './candidates';
import { jobsRouter } from './jobs';
import { studentsRouter } from './students';

/**
 * Main tRPC router
 */
export const appRouter = router({
  users: usersRouter,
  candidates: candidatesRouter,
  jobs: jobsRouter,
  students: studentsRouter
});

export type AppRouter = typeof appRouter;
```

### Example Router: Users

Create file: `src/lib/trpc/routers/users.ts`

```typescript
import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const usersRouter = router({
  /**
   * Get current user profile
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', ctx.userId)
      .single();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user profile'
      });
    }

    return data;
  }),

  /**
   * Update current user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        full_name: z.string().min(1).optional(),
        phone: z.string().optional(),
        avatar_url: z.string().url().optional()
      })
    )
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
          message: 'Failed to update profile'
        });
      }

      return data;
    }),

  /**
   * Get all users (admin only)
   */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.search) {
        query = query.or(
          `full_name.ilike.%${input.search}%,email.ilike.%${input.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users'
        });
      }

      return {
        users: data || [],
        total: count || 0
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

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      return data;
    })
});
```

### Next.js App Router API Handler

Create file: `src/app/api/trpc/[trpc]/route.ts`

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/lib/trpc/routers/_app';
import { createContext } from '@/lib/trpc/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext
  });

export { handler as GET, handler as POST };
```

### Client Configuration

Create file: `src/lib/trpc/client.ts`

```typescript
'use client';

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from './routers/_app';

export const trpc = createTRPCReact<AppRouter>();
```

### Provider Component

Create file: `src/lib/trpc/Provider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from './client';
import superjson from 'superjson';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: '/api/trpc',
          // Include credentials for authentication
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include'
            });
          }
        })
      ]
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Root Layout Update

Update file: `src/app/layout.tsx`

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
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
```

### Usage Example in Component

Create file: `src/app/profile/page.tsx`

```typescript
'use client';

import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function ProfilePage() {
  const [name, setName] = useState('');

  // Query: Get current user
  const { data: user, isLoading, refetch } = trpc.users.me.useQuery();

  // Mutation: Update profile
  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      refetch(); // Refetch user data
    }
  });

  const handleUpdate = () => {
    updateProfile.mutate({ full_name: name });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <div className="space-y-4">
        <div>
          <p>Email: {user?.email}</p>
          <p>Current Name: {user?.full_name}</p>
        </div>

        <div>
          <Input
            placeholder="New name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={handleUpdate} disabled={updateProfile.isLoading}>
            {updateProfile.isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>

        {updateProfile.isError && (
          <p className="text-red-600">{updateProfile.error.message}</p>
        )}
      </div>
    </div>
  );
}
```

---

## Dependencies

- **Requires:** FOUND-001 (database), FOUND-005 (auth)
- **Blocks:** All feature API development

---

## Testing Checklist

- [ ] tRPC API handler responds to requests
- [ ] Public procedure accessible without auth
- [ ] Protected procedure blocks unauthenticated requests
- [ ] Admin procedure blocks non-admin users
- [ ] Type inference works in client components
- [ ] React Query hooks auto-generated
- [ ] Error handling returns proper error codes
- [ ] Batch requests work (multiple queries in single HTTP request)

---

## Documentation Updates

- [ ] Create `/docs/implementation/TRPC-GUIDE.md`
- [ ] Document how to create new routers
- [ ] Add examples for mutations and queries
- [ ] Document permission middleware usage

---

## Related Stories

- **Depends on:** FOUND-001, FOUND-002, FOUND-005
- **Leads to:** All feature API development

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
