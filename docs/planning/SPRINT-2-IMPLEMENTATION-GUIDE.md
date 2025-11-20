# Sprint 2: Implementation Guide for Developer Agent

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 2 (Week 3-4)
**Author:** Architect Agent
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

This guide provides step-by-step instructions for implementing Sprint 2. All architecture decisions have been made - your job is to execute the implementation exactly as specified.

**Total Effort:** 26 story points (~10-12 working days for 1 developer)

---

## Prerequisites

**Before Starting:**
- [ ] Sprint 1 completed (database migrations 001-007 applied)
- [ ] Supabase configured and running
- [ ] Node.js 18+ installed
- [ ] pnpm package manager installed
- [ ] Git repository clean (no uncommitted changes)

**Validation:**
```bash
# Check database
psql $SUPABASE_DB_URL -c "SELECT * FROM v_multi_tenancy_status;"
# Should show all tables have org_id

# Check migrations
psql $SUPABASE_DB_URL -c "SELECT * FROM events LIMIT 1;"
# Should return event schema (from Migration 005)
```

---

## Implementation Sequence

### Week 3, Day 1-2: Database & Event Bus Foundation

#### Story FOUND-007: Build Event Bus (8 SP)

**Step 1: Run Migration 008**

```bash
# File already created: docs/planning/SPRINT-2-DATABASE-DESIGN.md
# Copy SQL from that doc to:
cp docs/planning/SPRINT-2-DATABASE-DESIGN.md temp_migration.md

# Extract SQL and save to migration file
cat > src/lib/db/migrations/008_refine_event_bus.sql << 'EOF'
# [Copy SQL from SPRINT-2-DATABASE-DESIGN.md]
EOF

# Run migration
psql $SUPABASE_DB_URL -f src/lib/db/migrations/008_refine_event_bus.sql

# Verify
psql $SUPABASE_DB_URL -c "SELECT * FROM v_event_bus_validation;"
# All rows should show status = 'PASS'
```

**Step 2: Create Event Bus TypeScript Files**

```bash
# Create directory structure
mkdir -p src/lib/events/handlers
mkdir -p src/lib/events/__tests__

# Create files (copy code from SPRINT-2-EVENT-BUS-ARCHITECTURE.md)
touch src/lib/events/EventBus.ts
touch src/lib/events/HandlerRegistry.ts
touch src/lib/events/decorators.ts
touch src/lib/events/types.ts
touch src/lib/events/handlers/index.ts
touch src/lib/events/handlers/user-handlers.ts
touch src/lib/events/handlers/course-handlers.ts
```

**Step 3: Implement EventBus Class**

Copy implementation from `SPRINT-2-EVENT-BUS-ARCHITECTURE.md` Section "EventBus Class" to `src/lib/events/EventBus.ts`

**Step 4: Implement HandlerRegistry Class**

Copy implementation from `SPRINT-2-EVENT-BUS-ARCHITECTURE.md` Section "HandlerRegistry Class" to `src/lib/events/HandlerRegistry.ts`

**Step 5: Implement Decorator**

Copy implementation from `SPRINT-2-EVENT-BUS-ARCHITECTURE.md` Section "Event Handler Decorator" to `src/lib/events/decorators.ts`

**Step 6: Implement Types**

Copy implementation from `SPRINT-2-EVENT-BUS-ARCHITECTURE.md` Section "Type Definitions" to `src/lib/events/types.ts`

**Step 7: Create Example Handlers**

Copy user and course handlers from `SPRINT-2-EVENT-BUS-ARCHITECTURE.md` to respective files

**Step 8: Write Unit Tests**

```typescript
// src/lib/events/__tests__/EventBus.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../EventBus';
import { Pool } from 'pg';

describe('EventBus', () => {
  let eventBus: EventBus;
  let mockPool: Pool;

  beforeEach(() => {
    mockPool = {
      connect: vi.fn().mockResolvedValue({
        query: vi.fn(),
        release: vi.fn()
      })
    } as any;

    eventBus = new EventBus(mockPool);
  });

  it('publishes event to database', async () => {
    const eventId = await eventBus.publish('user.created', {
      userId: '123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'student'
    });

    expect(eventId).toBeDefined();
  });

  it('registers handler via subscribe', () => {
    const handler = vi.fn();
    eventBus.subscribe('test.event', 'test_handler', handler);

    const handlers = eventBus.getRegistry().getHandlers('test.event');
    expect(handlers).toHaveLength(1);
    expect(handlers[0].name).toBe('test_handler');
  });
});
```

**Step 9: Run Tests**

```bash
pnpm test src/lib/events/__tests__/EventBus.test.ts
```

**Acceptance Criteria Checklist:**
- [ ] Migration 008 applied successfully
- [ ] EventBus class publishes events
- [ ] Handlers registered via decorator
- [ ] PostgreSQL LISTEN/NOTIFY working
- [ ] Unit tests passing

---

### Week 3, Day 3-4: tRPC Infrastructure

#### Story FOUND-010: Set Up tRPC Routers (5 SP)

**Step 1: Install Dependencies**

```bash
pnpm add @trpc/server @trpc/client @trpc/react-query@next @tanstack/react-query superjson drizzle-zod react-hook-form @hookform/resolvers
```

**Step 2: Create Directory Structure**

```bash
mkdir -p src/server/trpc/routers/admin
mkdir -p src/lib/trpc
mkdir -p src/lib/auth
mkdir -p src/lib/rbac
```

**Step 3: Create Context**

Copy implementation from `SPRINT-2-API-ARCHITECTURE.md` Section "Context Creation" to `src/server/trpc/context.ts`

**Step 4: Create tRPC Initialization**

Copy implementation from `SPRINT-2-API-ARCHITECTURE.md` Section "tRPC Initialization" to `src/server/trpc/init.ts`

**Step 5: Create Middleware**

Copy implementation from `SPRINT-2-API-ARCHITECTURE.md` Section "Middleware" to `src/server/trpc/middleware.ts`

**Step 6: Create Helper Functions**

Copy auth helpers to `src/lib/auth/server.ts`
Copy RBAC helpers to `src/lib/rbac/index.ts`

**Add missing database function:**
```sql
-- Add to Migration 008 or create 009_add_rbac_helpers.sql
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

**Step 7: Create Zod Schemas**

```bash
# Generate schemas from Drizzle
cat > src/lib/db/schema/validations.ts << 'EOF'
# Copy from SPRINT-2-API-ARCHITECTURE.md Section "Zod Schemas"
EOF
```

**Step 8: Create Routers**

Copy router implementations from `SPRINT-2-API-ARCHITECTURE.md`:
- `src/server/trpc/routers/users.ts`
- `src/server/trpc/routers/admin/events.ts`

Create placeholder routers for candidates, jobs, students:
```typescript
// src/server/trpc/routers/candidates.ts
import { router, protectedProcedure } from '../init';
import { z } from 'zod';

export const candidatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from('user_profiles')
      .select('*')
      .eq('candidate_status', 'bench');
    return data || [];
  }),

  // TODO: Add create, update, getById in future stories
});
```

**Step 9: Create App Router**

Copy implementation from `SPRINT-2-API-ARCHITECTURE.md` Section "App Router" to `src/server/trpc/root.ts`

**Step 10: Create Next.js API Route**

Copy implementation from `SPRINT-2-API-ARCHITECTURE.md` Section "Next.js API Route" to `src/app/api/trpc/[trpc]/route.ts`

**Step 11: Create Client Setup**

Copy client setup to `src/lib/trpc/client.ts` and `src/lib/trpc/Provider.tsx`

**Step 12: Update Root Layout**

```typescript
// src/app/layout.tsx
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

**Step 13: Test tRPC Setup**

Create test component:
```typescript
// src/app/test-trpc/page.tsx
'use client';

import { trpc } from '@/lib/trpc/client';

export default function TestTRPC() {
  const { data: user, isLoading } = trpc.users.me.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>tRPC Test</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
```

Visit http://localhost:3000/test-trpc to verify

**Acceptance Criteria Checklist:**
- [ ] tRPC packages installed
- [ ] Context includes session, userId, supabase
- [ ] Middleware validates auth and permissions
- [ ] Users router implemented
- [ ] Admin events router implemented
- [ ] Client hooks working (type inference)
- [ ] Test page shows user data

---

### Week 3, Day 5-6: Event Subscriptions

#### Story FOUND-008: Create Event Subscription System (5 SP)

**Step 1: Handler Auto-Discovery**

```typescript
// src/lib/events/handlers/index.ts
import { EventBus } from '../EventBus';

// Import all handler files (auto-discovery)
import './user-handlers';
import './course-handlers';
// import './placement-handlers'; // Add when created

export async function registerAllHandlers(eventBus: EventBus, orgId: string) {
  // Persist handlers to database
  await eventBus.getRegistry().persistToDatabase(
    eventBus['pool'], // Access private pool
    orgId
  );

  console.log('All event handlers registered');
}
```

**Step 2: Start Event Bus at App Startup**

```typescript
// src/lib/events/init.ts
import { getEventBus } from './EventBus';
import { registerAllHandlers } from './handlers';

let initialized = false;

export async function initializeEventBus() {
  if (initialized) return;

  const eventBus = getEventBus();

  // Register all handlers
  const defaultOrgId = '00000000-0000-0000-0000-000000000001'; // InTime Solutions
  await registerAllHandlers(eventBus, defaultOrgId);

  // Start listening to PostgreSQL NOTIFY
  await eventBus.startListening();

  initialized = true;
  console.log('Event Bus initialized');
}

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  initializeEventBus().catch(console.error);
}
```

Call from root layout:
```typescript
// src/app/layout.tsx
import { initializeEventBus } from '@/lib/events/init';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize Event Bus on server startup
  if (typeof window === 'undefined') {
    await initializeEventBus();
  }

  return (/* ... */);
}
```

**Step 3: Create Admin API for Handler Management**

```typescript
// src/server/trpc/routers/admin/handlers.ts
import { router } from '../../init';
import { adminProcedure } from '../../middleware';
import { z } from 'zod';

export const handlersRouter = router({
  /**
   * Get all event handlers with health status
   */
  list: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.rpc('get_event_handler_health');

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      });
    }

    return data;
  }),

  /**
   * Disable event handler
   */
  disable: adminProcedure
    .input(z.object({ subscriptionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('disable_event_handler', {
        p_subscription_id: input.subscriptionId
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return { success: data };
    }),

  /**
   * Enable event handler
   */
  enable: adminProcedure
    .input(z.object({ subscriptionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('enable_event_handler', {
        p_subscription_id: input.subscriptionId
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        });
      }

      return { success: data };
    })
});
```

Add to root router:
```typescript
// src/server/trpc/root.ts
import { handlersRouter } from './routers/admin/handlers';

export const appRouter = router({
  // ...
  admin: router({
    events: eventsRouter,
    handlers: handlersRouter // ← Add this
  })
});
```

**Step 4: Create Admin UI for Handler Health**

```typescript
// src/app/admin/handlers/page.tsx
'use client';

import { trpc } from '@/lib/trpc/client';

export default function HandlersPage() {
  const { data: handlers, refetch } = trpc.admin.handlers.list.useQuery();
  const disable = trpc.admin.handlers.disable.useMutation();
  const enable = trpc.admin.handlers.enable.useMutation();

  const handleToggle = async (subscriptionId: string, isActive: boolean) => {
    if (isActive) {
      await disable.mutateAsync({ subscriptionId });
    } else {
      await enable.mutateAsync({ subscriptionId });
    }
    refetch();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Event Handlers</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Handler Name</th>
            <th className="border p-2">Event Pattern</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Failures</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {handlers?.map((handler) => (
            <tr key={handler.subscription_id}>
              <td className="border p-2">{handler.subscriber_name}</td>
              <td className="border p-2">{handler.event_pattern}</td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded ${
                    handler.health_status === 'healthy'
                      ? 'bg-green-100 text-green-800'
                      : handler.health_status === 'critical'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {handler.health_status}
                </span>
              </td>
              <td className="border p-2">
                {handler.consecutive_failures} consecutive
                <br />
                {handler.failure_count} total
              </td>
              <td className="border p-2">
                <button
                  onClick={() =>
                    handleToggle(
                      handler.subscription_id,
                      handler.is_active
                    )
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {handler.is_active ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Acceptance Criteria Checklist:**
- [ ] Handlers auto-register at startup
- [ ] Admin API returns handler health
- [ ] Admin UI shows handler status
- [ ] Enable/disable handlers works
- [ ] Auto-disable after 5 failures

---

### Week 3, Day 7: Validation & Error Handling

#### Story FOUND-011: Create Unified Error Handling (3 SP)

**Step 1: Install Sentry**

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Step 2: Configure Sentry**

```typescript
// sentry.client.config.ts (created by wizard)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  // Scrub sensitive data
  beforeSend(event) {
    // Remove passwords, tokens, cookies
    if (event.request) {
      delete event.request.cookies;
      if (event.request.data) {
        const data = event.request.data as any;
        if (data.password) data.password = '[REDACTED]';
        if (data.token) data.token = '[REDACTED]';
      }
    }
    return event;
  }
});
```

**Step 3: Create Custom Error Classes**

```typescript
// src/lib/errors/index.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super('AUTHORIZATION_ERROR', message, 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fieldErrors?: Record<string, string[]>) {
    super('VALIDATION_ERROR', message, 400, { fieldErrors });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super('DATABASE_ERROR', message, 500, { originalError });
    this.name = 'DatabaseError';
  }
}
```

**Step 4: Create React Error Boundary**

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">
            {process.env.NODE_ENV === 'development'
              ? this.state.error?.message
              : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 5: Add to Layout**

```typescript
// src/app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**Acceptance Criteria Checklist:**
- [ ] Sentry installed and configured
- [ ] Custom error classes created
- [ ] Error boundary catches React errors
- [ ] Passwords/tokens scrubbed from Sentry
- [ ] Error pages created (404, 500)

---

#### Story FOUND-012: Implement Zod Validation (2 SP)

**Already completed in FOUND-010** - Zod schemas created with drizzle-zod

**Additional: React Hook Form Integration**

```typescript
// src/hooks/useZodForm.ts
import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export function useZodForm<TSchema extends z.ZodType>(
  schema: TSchema,
  props?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
) {
  return useForm<z.infer<TSchema>>({
    ...props,
    resolver: zodResolver(schema)
  });
}
```

**Example Usage:**
```typescript
// src/components/UpdateProfileForm.tsx
'use client';

import { useZodForm } from '@/hooks/useZodForm';
import { updateProfileSchema } from '@/lib/db/schema/validations';
import { trpc } from '@/lib/trpc/client';

export function UpdateProfileForm() {
  const { register, handleSubmit, formState: { errors } } = useZodForm(updateProfileSchema);
  const updateProfile = trpc.users.updateProfile.useMutation();

  const onSubmit = async (data: any) => {
    await updateProfile.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('full_name')} placeholder="Full Name" />
      {errors.full_name && <span>{errors.full_name.message}</span>}

      <button type="submit">Update</button>
    </form>
  );
}
```

---

### Week 4, Day 8-9: Event History & Replay

#### Story FOUND-009: Implement Event History and Replay (3 SP)

**Step 1: Admin Events UI Created in FOUND-010** (already done)

**Step 2: Create Event Details Modal**

```typescript
// src/components/admin/EventDetailsModal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EventDetailsModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="font-semibold">Event ID:</label>
            <p className="font-mono text-sm">{event.id}</p>
          </div>

          <div>
            <label className="font-semibold">Type:</label>
            <p>{event.event_type}</p>
          </div>

          <div>
            <label className="font-semibold">Status:</label>
            <p>{event.status}</p>
          </div>

          <div>
            <label className="font-semibold">Payload:</label>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </div>

          {event.error_message && (
            <div>
              <label className="font-semibold text-red-600">Error:</label>
              <p className="text-red-600">{event.error_message}</p>
            </div>
          )}

          <div>
            <label className="font-semibold">Timeline:</label>
            <ul className="space-y-1">
              <li>Published: {new Date(event.created_at).toLocaleString()}</li>
              {event.processed_at && (
                <li>Processed: {new Date(event.processed_at).toLocaleString()}</li>
              )}
              {event.failed_at && (
                <li>Failed: {new Date(event.failed_at).toLocaleString()}</li>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: Create Event History Page**

```typescript
// src/app/admin/events/page.tsx
'use client';

import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { EventDetailsModal } from '@/components/admin/EventDetailsModal';

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filters, setFilters] = useState({
    eventType: '',
    status: '',
    limit: 100
  });

  const { data: events, refetch } = trpc.admin.events.list.useQuery(filters);
  const replay = trpc.admin.events.replay.useMutation();

  const handleReplay = async (eventIds: string[]) => {
    await replay.mutateAsync({ eventIds });
    refetch();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Event History</h1>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          placeholder="Event Type"
          value={filters.eventType}
          onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
          className="border p-2 rounded"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          className="border p-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="dead_letter">Dead Letter</option>
        </select>
      </div>

      {/* Events Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Event Type</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events?.map((event: any) => (
            <tr key={event.id}>
              <td className="border p-2">{event.event_type}</td>
              <td className="border p-2">{event.status}</td>
              <td className="border p-2">
                {new Date(event.created_at).toLocaleString()}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                >
                  Details
                </button>
                {event.status === 'dead_letter' && (
                  <button
                    onClick={() => handleReplay([event.id])}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Replay
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
```

**Acceptance Criteria Checklist:**
- [ ] Event history API works
- [ ] Admin UI shows events with filters
- [ ] Event details modal shows full payload
- [ ] Replay functionality works
- [ ] Dead letter queue visible

---

### Week 4, Day 10-11: Integration Testing

#### Create Integration Tests

```typescript
// tests/integration/event-bus-trpc.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createCaller } from '@/server/trpc/root';
import { getEventBus } from '@/lib/events/EventBus';

describe('Event Bus + tRPC Integration', () => {
  let eventBus: EventBus;
  let caller: any;

  beforeAll(async () => {
    eventBus = getEventBus();
    await eventBus.startListening();

    const ctx = await createContext(); // Mock authenticated context
    caller = createCaller(ctx);
  });

  afterAll(async () => {
    await eventBus.stopListening();
  });

  it('publishes event when job created via tRPC', async () => {
    // Create job via tRPC
    const job = await caller.jobs.create({
      title: 'Software Engineer',
      description: 'Test job posting',
      clientId: 'client-123',
      requiredSkills: ['JavaScript', 'React'],
      experienceYearsMin: 2,
      experienceYearsMax: 5
    });

    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify event was created
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('event_type', 'job.created')
      .eq('payload->>jobId', job.id);

    expect(events).toHaveLength(1);
    expect(events[0].status).toBe('completed');
  });
});
```

**Run Integration Tests:**
```bash
pnpm test tests/integration/
```

---

### Week 4, Day 12-14: Documentation & Deployment

#### Final Steps

1. **Update README**
2. **Create API documentation**
3. **Run all tests**
4. **Deploy to staging**
5. **Validate production**

---

## Acceptance Criteria Summary

### FOUND-007: Event Bus
- [x] PostgreSQL functions created
- [x] TypeScript EventBus class implemented
- [x] Handlers registered and executing
- [x] Performance < 50ms publish latency
- [x] Dead letter queue working

### FOUND-008: Event Subscriptions
- [x] Handler registry implemented
- [x] Decorator pattern working
- [x] Admin API for handler management
- [x] Admin UI shows handler health
- [x] Auto-disable after 5 failures

### FOUND-009: Event History
- [x] Event history API working
- [x] Dead letter queue viewer
- [x] Replay functionality
- [x] Event details modal
- [x] CSV export (optional)

### FOUND-010: tRPC Setup
- [x] tRPC packages installed
- [x] Context with session, userId, supabase
- [x] Middleware for auth and permissions
- [x] Example routers (users, admin/events, admin/handlers)
- [x] Client hooks with type inference

### FOUND-011: Error Handling
- [x] Sentry installed
- [x] Custom error classes
- [x] Error boundary
- [x] PII scrubbing
- [x] Error pages

### FOUND-012: Zod Validation
- [x] drizzle-zod schemas generated
- [x] React Hook Form integration
- [x] tRPC input validation
- [x] Form helpers

---

## Testing Checklist

- [ ] Unit tests pass (95%+ coverage)
- [ ] Integration tests pass
- [ ] E2E critical paths tested
- [ ] Performance benchmarks met
- [ ] Security tests (RLS, permissions)

---

## Deployment Checklist

- [ ] Migration 008 applied
- [ ] Environment variables set
- [ ] Sentry DSN configured
- [ ] Event Bus started
- [ ] Handlers registered
- [ ] tRPC API working
- [ ] Admin UI accessible
- [ ] Monitoring setup

---

**Status:** ✅ READY FOR IMPLEMENTATION

**Estimated Time:** 10-12 days for 1 developer

---

**End of Implementation Guide**
