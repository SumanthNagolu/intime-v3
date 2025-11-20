# Sprint 2 Bugs and Gaps

**QA Agent Analysis**
**Date:** 2025-11-19
**Sprint:** Sprint 2 - Event Bus & API Foundation
**Status:** 65% Complete

---

## Executive Summary

Sprint 2 implementation has **6 critical bugs** and **35% missing functionality**. The bugs prevent code from running and must be fixed before any deployment. The gaps represent incomplete user stories that need additional development effort.

**Critical Path to Completion:**
1. Fix 2 critical TypeScript bugs (30 minutes)
2. Complete tRPC infrastructure (3 hours)
3. Build Admin UI (4 hours)
4. Configure error handling (2 hours)
5. Write tests (5 hours)

**Total Effort:** ~15 hours (2 working days)

---

## Part 1: Bugs (Code Issues)

### BUG-001: Missing TypeScript Decorator Configuration
**Severity:** 🔴 CRITICAL (Blocking)
**Status:** Open
**Found:** 2025-11-19
**Component:** TypeScript Configuration

#### Description:
Event handlers use TypeScript decorators (`@EventHandler`) but `tsconfig.json` does not enable `experimentalDecorators`. This causes 4 compilation errors.

#### Impact:
- Code does not compile
- Application will not start
- Event Bus cannot be tested

#### Error Messages:
```
src/lib/events/handlers/course-handlers.ts(19,1): error TS1206: Decorators are not valid here.
src/lib/events/handlers/course-handlers.ts(55,1): error TS1206: Decorators are not valid here.
src/lib/events/handlers/user-handlers.ts(15,1): error TS1206: Decorators are not valid here.
src/lib/events/handlers/user-handlers.ts(48,1): error TS1206: Decorators are not valid here.
```

#### Affected Files:
- `tsconfig.json`
- `src/lib/events/handlers/user-handlers.ts`
- `src/lib/events/handlers/course-handlers.ts`

#### Steps to Reproduce:
```bash
pnpm tsc --noEmit
# Error: TS1206: Decorators are not valid here
```

#### Root Cause:
TypeScript decorators are an experimental feature that must be explicitly enabled in `tsconfig.json`.

#### Recommended Fix:
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "incremental": true,

    // ADD THESE TWO LINES:
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "templates",
    "supabase/functions/**/*"
  ]
}
```

#### Estimated Fix Time: 5 minutes

#### Verification:
```bash
# After fix, run:
pnpm tsc --noEmit
# Should complete with 0 errors (or only BUG-002 errors)
```

---

### BUG-002: Async/Await Bug in Supabase Client Creation
**Severity:** 🔴 CRITICAL (Blocking)
**Status:** Open
**Found:** 2025-11-19
**Component:** Event Handlers

#### Description:
`createClient()` returns a `Promise<SupabaseClient>` but the code does not await it. The code then attempts to call `.rpc()` and `.from()` on the Promise instead of the SupabaseClient, causing TypeScript errors.

#### Impact:
- Code does not compile
- Course graduation handler will crash if run
- Candidate creation workflow broken

#### Error Messages:
```
src/lib/events/handlers/course-handlers.ts(29,20): error TS2339: Property 'rpc' does not exist on type 'Promise<SupabaseClient>'.
src/lib/events/handlers/course-handlers.ts(36,8): error TS2339: Property 'from' does not exist on type 'Promise<SupabaseClient>'.
```

#### Affected Files:
- `src/lib/events/handlers/course-handlers.ts` (lines 25, 29, 36)

#### Steps to Reproduce:
```typescript
// Current broken code:
const supabase = createClient(); // Returns Promise<SupabaseClient>
await supabase.rpc(...); // ERROR: Promise has no 'rpc' property
```

#### Root Cause:
Developer forgot to `await` the `createClient()` function.

#### Recommended Fix:
```typescript
// src/lib/events/handlers/course-handlers.ts

@EventHandler('course.graduated', 'create_candidate_profile')
export async function handleCourseGraduated(event: Event<CourseGraduatedPayload>) {
  const { studentId, courseName, grade } = event.payload;

  console.log(`[Handler:create_candidate_profile] Processing graduation for student ${studentId}`);

  // FIX: Add 'await' here
  const supabase = await createClient();

  try {
    // Grant candidate role
    await supabase.rpc('grant_role_to_user', {
      p_user_id: studentId,
      p_role_name: 'candidate'
    });

    // Update user profile with candidate status
    await supabase
      .from('user_profiles')
      .update({
        candidate_status: 'bench',
        candidate_ready_for_placement: grade >= 80
      })
      .eq('id', studentId);

    console.log(`[Handler:create_candidate_profile] Student ${studentId} promoted to candidate after completing ${courseName} (grade: ${grade})`);
  } catch (error) {
    console.error(`[Handler:create_candidate_profile] Failed to create candidate profile:`, error);
    throw error;
  }
}
```

#### Estimated Fix Time: 5 minutes

#### Verification:
```bash
# After fix, run:
pnpm tsc --noEmit
# Should complete with 0 errors (after BUG-001 fixed)
```

---

### BUG-003: Handler Registry Accesses Private Property
**Severity:** 🟡 HIGH (Technical Debt)
**Status:** Open
**Found:** 2025-11-19
**Component:** Event Handler Registration

#### Description:
`src/lib/events/handlers/index.ts` accesses the private `pool` property of EventBus via type casting `(eventBus as any).pool`. This is fragile and could break if EventBus is refactored.

#### Impact:
- Code works but is fragile
- Violates encapsulation
- Could break in future refactor
- TypeScript type safety bypassed

#### Affected Files:
- `src/lib/events/handlers/index.ts` (line ~15)

#### Code:
```typescript
// Current broken code:
await eventBus.getRegistry().persistToDatabase(
  (eventBus as any).pool,  // ⚠️ Accessing private property
  orgId
);
```

#### Root Cause:
EventBus class has private `pool` property but no public getter.

#### Recommended Fix:
**Option 1: Add public getter to EventBus (preferred)**
```typescript
// src/lib/events/EventBus.ts
export class EventBus {
  private pool: Pool;
  private listenClient: Client | null = null;
  private registry: HandlerRegistry;
  private isListening = false;

  // ... existing methods ...

  /**
   * Get the connection pool (for handler registration)
   */
  getPool(): Pool {
    return this.pool;
  }
}

// src/lib/events/handlers/index.ts
await eventBus.getRegistry().persistToDatabase(
  eventBus.getPool(),  // ✅ Use public getter
  orgId
);
```

**Option 2: Pass pool in constructor**
```typescript
// HandlerRegistry.ts
constructor(private pool: Pool) {
  this.handlers = new Map();
}

// EventBus.ts
constructor(pool: Pool) {
  this.pool = pool;
  this.registry = new HandlerRegistry(pool);
}
```

#### Estimated Fix Time: 10 minutes

#### Verification:
```bash
pnpm tsc --noEmit
# Should complete with 0 errors
# No type casting warnings
```

---

### BUG-004: Missing Environment Variable Validation
**Severity:** 🟡 MEDIUM (User Experience)
**Status:** Open
**Found:** 2025-11-19
**Component:** Event Bus Initialization

#### Description:
EventBus creates PostgreSQL connection pool using `process.env.SUPABASE_DB_URL` without checking if the variable exists. If missing, the application crashes with an unclear error message.

#### Impact:
- Application crashes on startup if env var missing
- Error message is unclear: `"Invalid connection string"`
- Developers confused during setup

#### Affected Files:
- `src/lib/events/EventBus.ts` (line ~264)
- `src/lib/events/init.ts` (line ~34)

#### Current Code:
```typescript
// EventBus.ts
export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    const pool = new Pool({
      connectionString: process.env.SUPABASE_DB_URL, // ⚠️ No validation
      max: 20
    });
    eventBusInstance = new EventBus(pool);
  }
  return eventBusInstance;
}
```

#### Steps to Reproduce:
```bash
# Remove env var
unset SUPABASE_DB_URL

# Start app
pnpm dev

# Error: "Invalid connection string" (unclear)
```

#### Recommended Fix:
```typescript
// src/lib/events/init.ts
export async function initializeEventBus(): Promise<void> {
  if (initialized) {
    console.log('[EventBus:init] Already initialized, skipping');
    return;
  }

  // FIX: Add validation
  if (!process.env.SUPABASE_DB_URL) {
    throw new Error(
      'SUPABASE_DB_URL environment variable is required for Event Bus. ' +
      'Please add it to your .env.local file.'
    );
  }

  try {
    const eventBus = getEventBus();
    // ... rest of initialization
  } catch (error) {
    console.error('[EventBus:init] Failed to initialize Event Bus:', error);
    throw error;
  }
}
```

#### Estimated Fix Time: 15 minutes

#### Verification:
```bash
# Remove env var
unset SUPABASE_DB_URL

# Start app
pnpm dev

# Should show clear error:
# "Error: SUPABASE_DB_URL environment variable is required for Event Bus"
```

---

### BUG-005: Hard-Coded Default Org ID
**Severity:** 🟢 LOW (Configuration)
**Status:** Open
**Found:** 2025-11-19
**Component:** Event Bus Initialization

#### Description:
Default organization ID is hard-coded as `'00000000-0000-0000-0000-000000000001'` in `init.ts`. This prevents using different default orgs in different environments (staging, production, etc.).

#### Impact:
- Requires code change to use different default org
- Difficult to test multi-org scenarios
- Not following 12-factor app principles

#### Affected Files:
- `src/lib/events/init.ts` (line ~34)

#### Current Code:
```typescript
// Hard-coded UUID
const defaultOrgId = '00000000-0000-0000-0000-000000000001';
await registerAllHandlers(eventBus, defaultOrgId);
```

#### Recommended Fix:
```typescript
// src/lib/events/init.ts
export async function initializeEventBus(): Promise<void> {
  if (initialized) {
    console.log('[EventBus:init] Already initialized, skipping');
    return;
  }

  try {
    const eventBus = getEventBus();

    // FIX: Use environment variable with fallback
    const defaultOrgId = process.env.DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';
    await registerAllHandlers(eventBus, defaultOrgId);

    await eventBus.startListening();

    initialized = true;
    console.log('[EventBus:init] Event Bus initialized successfully');
  } catch (error) {
    console.error('[EventBus:init] Failed to initialize Event Bus:', error);
    throw error;
  }
}
```

**Also add to .env.local.example:**
```bash
# Event Bus Configuration
SUPABASE_DB_URL=postgresql://user:pass@host:5432/database
DEFAULT_ORG_ID=00000000-0000-0000-0000-000000000001
```

#### Estimated Fix Time: 10 minutes

#### Verification:
```bash
# Test with different org
export DEFAULT_ORG_ID=00000000-0000-0000-0000-000000000002

# Start app
pnpm dev

# Verify handlers registered with new org ID
psql $SUPABASE_DB_URL -c "SELECT org_id FROM event_subscriptions;"
```

---

### BUG-006: Hard-Coded Org ID in Migration
**Severity:** 🟢 LOW (Migration Safety)
**Status:** Open
**Found:** 2025-11-19
**Component:** Database Migration 008

#### Description:
Migration 008 backfills `event_subscriptions.org_id` with hard-coded UUID `'00000000-0000-0000-0000-000000000001'`. If this organization doesn't exist in the database, the migration will fail with foreign key constraint error.

#### Impact:
- Migration fails if default org doesn't exist
- Requires manual intervention during deployment
- Not safe for clean database

#### Affected Files:
- `src/lib/db/migrations/008_refine_event_bus.sql` (line ~18)

#### Current Code:
```sql
-- Backfill with default org for existing subscriptions
UPDATE event_subscriptions
SET org_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE org_id IS NULL;
```

#### Recommended Fix:
```sql
-- Backfill with first organization in database (safer)
UPDATE event_subscriptions
SET org_id = (SELECT id FROM organizations ORDER BY created_at LIMIT 1)
WHERE org_id IS NULL;

-- Verify org exists before backfill
DO $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT id INTO v_org_id FROM organizations ORDER BY created_at LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No organizations exist in database. Cannot backfill event_subscriptions.org_id';
  END IF;

  UPDATE event_subscriptions
  SET org_id = v_org_id
  WHERE org_id IS NULL;

  RAISE NOTICE 'Backfilled event_subscriptions.org_id with org: %', v_org_id;
END $$;
```

#### Estimated Fix Time: 10 minutes

#### Verification:
```bash
# Test on clean database
psql $SUPABASE_DB_URL -c "DELETE FROM event_subscriptions;"
psql $SUPABASE_DB_URL -c "DELETE FROM organizations;"

# Run migration (should fail with clear error if no orgs)
psql $SUPABASE_DB_URL -f src/lib/db/migrations/008_refine_event_bus.sql
```

---

## Part 2: Gaps (Missing Functionality)

### Summary of Gaps

| Story ID | Story Name | Points | % Complete | Gap |
|----------|-----------|--------|------------|-----|
| FOUND-007 | Event Bus | 8 | 90% | Missing: performance testing |
| FOUND-008 | Event Subscriptions | 5 | 70% | Missing: Admin API, Admin UI |
| FOUND-009 | Event History | 3 | 50% | Missing: API, UI |
| FOUND-010 | tRPC Routers | 5 | 20% | Missing: 80% of implementation |
| FOUND-011 | Error Handling | 3 | 10% | Missing: 90% of implementation |
| FOUND-012 | Zod Validation | 2 | 10% | Missing: 90% of implementation |

**Total Gap:** 35% of Sprint 2 (9.3 story points)

---

### GAP-001: tRPC Infrastructure (80% Missing)
**Story:** FOUND-010 (5 SP)
**Status:** 20% Complete
**Priority:** CRITICAL
**Estimated Effort:** 3 hours

#### What's Built:
- ✅ Packages installed (`@trpc/server`, `@trpc/client`, `@trpc/react-query`)
- ✅ Empty directory structure created

#### What's Missing:

**1. tRPC Context (src/server/trpc/context.ts)**
- Session extraction from cookies
- User ID extraction
- Org ID extraction
- Supabase client creation
- **Effort:** 30 minutes

**2. tRPC Initialization (src/server/trpc/init.ts)**
- tRPC instance with SuperJSON transformer
- Error formatter (expose Zod errors)
- Public, protected, admin procedures
- **Effort:** 30 minutes

**3. Middleware (src/server/trpc/middleware.ts)**
- `isAuthenticated` - Require valid session
- `withPermission` - RBAC permission check
- **Effort:** 30 minutes

**4. Helper Functions**
- `src/lib/auth/server.ts` - `requireAuth()`, `getCurrentUserId()`
- `src/lib/rbac/index.ts` - `checkPermission()`, `requirePermission()`
- **Effort:** 30 minutes

**5. Database Function (Missing)**
```sql
CREATE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
) RETURNS BOOLEAN AS $$
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
```
- **Effort:** 15 minutes

**6. Routers**
- `src/server/trpc/routers/users.ts` - me, updateProfile, list, getById
- `src/server/trpc/routers/admin/events.ts` - list, deadLetterQueue, replay, metrics
- `src/server/trpc/routers/admin/handlers.ts` - list, disable, enable
- **Effort:** 45 minutes

**7. API Route (src/app/api/trpc/[trpc]/route.ts)**
- Next.js 15 App Router integration
- **Effort:** 15 minutes

**8. Client Setup**
- `src/lib/trpc/client.ts` - tRPC client configuration
- `src/lib/trpc/Provider.tsx` - React Query provider
- **Effort:** 30 minutes

**9. Root Layout Integration**
- Wrap app with TRPCProvider
- **Effort:** 10 minutes

**Total Effort:** ~3 hours

---

### GAP-002: Admin UI (100% Missing)
**Story:** FOUND-008, FOUND-009 (8 SP)
**Status:** 0% Complete
**Priority:** HIGH
**Estimated Effort:** 4 hours

#### What's Missing:

**1. Event Management Page (src/app/admin/events/page.tsx)**
- Event history table with filters
- Event type, status, date range filters
- Pagination (100 events per page)
- Event details modal
- Replay functionality
- Export to JSON/CSV
- **Effort:** 2 hours

**2. Handler Health Dashboard (src/app/admin/handlers/page.tsx)**
- Handler health table
- Status indicators (healthy, warning, critical, disabled)
- Enable/disable buttons
- Failure count display
- Last failure message
- **Effort:** 1.5 hours

**3. Reusable Components**
- `src/components/admin/EventDetailsModal.tsx` - Event payload viewer
- `src/components/admin/EventTable.tsx` - Event list with sorting
- `src/components/admin/HandlerHealthTable.tsx` - Handler status table
- **Effort:** 30 minutes

**Total Effort:** ~4 hours

---

### GAP-003: Error Handling (90% Missing)
**Story:** FOUND-011 (3 SP)
**Status:** 10% Complete
**Priority:** HIGH
**Estimated Effort:** 2 hours

#### What's Built:
- ✅ Sentry package installed (`@sentry/nextjs`)

#### What's Missing:

**1. Sentry Configuration**
- Run `npx @sentry/wizard@latest -i nextjs`
- Configure PII scrubbing (passwords, tokens)
- Set environment (production, staging, development)
- **Effort:** 30 minutes

**2. Custom Error Classes (src/lib/errors/index.ts)**
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

// ... AuthorizationError, ValidationError, NotFoundError, etc.
```
- **Effort:** 30 minutes

**3. React Error Boundary (src/components/ErrorBoundary.tsx)**
- Catch component errors
- Log to Sentry
- Display user-friendly message
- "Reload Page" and "Go Home" buttons
- **Effort:** 30 minutes

**4. Error Response Formatter (in tRPC init.ts)**
- Convert errors to consistent format
- Map database errors to user messages
- Hide stack traces in production
- **Effort:** 20 minutes

**5. Custom Error Pages**
- `src/app/not-found.tsx` (404 page)
- `src/app/error.tsx` (500 page)
- **Effort:** 20 minutes

**Total Effort:** ~2 hours

---

### GAP-004: Zod Validation Schemas (90% Missing)
**Story:** FOUND-012 (2 SP)
**Status:** 10% Complete
**Priority:** MEDIUM
**Estimated Effort:** 2 hours

#### What's Built:
- ✅ `drizzle-zod` package installed
- ✅ `react-hook-form` package installed
- ✅ `@hookform/resolvers` package installed

#### What's Missing:

**1. Validation Schemas (src/lib/db/schema/validations.ts)**
```typescript
import { z } from 'zod';

// Core patterns
export const emailSchema = z.string().email();
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number');

export const uuidSchema = z.string().uuid();

// Entity schemas
export const userProfileSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(1),
  role: z.enum(['student', 'candidate', 'employee', 'client']),
  // ... other fields
});

// Auth schemas
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirm_password: z.string()
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords must match',
  path: ['confirm_password']
});

// ... more schemas
```
- **Effort:** 1 hour

**2. Form Helpers (src/hooks/useZodForm.ts)**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

export function useZodForm<T extends ZodSchema>(schema: T) {
  return useForm({
    resolver: zodResolver(schema),
    mode: 'onChange'
  });
}
```
- **Effort:** 15 minutes

**3. tRPC Integration**
- Use Zod schemas in all tRPC procedures
- **Effort:** 30 minutes (part of GAP-001)

**4. React Hook Form Integration**
- Example form with validation
- Field-level error messages
- **Effort:** 30 minutes

**Total Effort:** ~2 hours

---

### GAP-005: Comprehensive Testing (100% Missing)
**Story:** All stories
**Status:** 0% Complete
**Priority:** CRITICAL
**Estimated Effort:** 5 hours

#### What's Missing:

**1. Unit Tests**
- `src/lib/events/__tests__/EventBus.test.ts`
- `src/lib/events/__tests__/HandlerRegistry.test.ts`
- `src/lib/events/__tests__/handlers.test.ts`
- **Effort:** 2 hours

**2. Integration Tests**
- `tests/integration/event-bus-flow.test.ts` - Event publish → handler execute
- `tests/integration/handler-retry.test.ts` - Retry logic and dead letter
- `tests/integration/multi-tenancy.test.ts` - RLS policy enforcement
- **Effort:** 2 hours

**3. E2E Tests (Playwright)**
- `tests/e2e/admin-events.spec.ts` - Event management UI
- `tests/e2e/admin-handlers.spec.ts` - Handler health UI
- **Effort:** 1 hour

**4. Performance Benchmarks**
- `tests/performance/event-bus-benchmark.ts`
- Measure publish latency, handler execution time, throughput
- **Effort:** 30 minutes

**Total Effort:** ~5 hours

---

### GAP-006: Documentation (50% Missing)
**Story:** N/A (Definition of Done)
**Status:** 50% Complete
**Priority:** LOW
**Estimated Effort:** 1 hour

#### What's Built:
- ✅ Progress report (SPRINT-2-PROGRESS-REPORT.md)
- ✅ Implementation summary (SPRINT-2-IMPLEMENTATION-SUMMARY.md)

#### What's Missing:

**1. Code Review Notes (SPRINT-2-CODE-REVIEW-NOTES.md)**
- Self-review against architecture
- Deviations documented
- Technical decisions explained
- **Effort:** 30 minutes

**2. Acceptance Criteria Checklist**
- All 6 stories with checked boxes
- Evidence for each criterion
- **Effort:** 20 minutes

**3. API Documentation**
- tRPC endpoints documented
- Event types documented
- Handler registration guide
- **Effort:** 30 minutes

**Total Effort:** ~1 hour

---

## Part 3: Gap Analysis Summary

### By Priority

**CRITICAL (Must Fix Before Deployment):**
1. BUG-001: TypeScript decorators (5 min)
2. BUG-002: Async/await bug (5 min)
3. GAP-001: tRPC infrastructure (3 hours)
4. GAP-005: Testing (5 hours)

**HIGH (Required for MVP):**
5. BUG-003: Private property access (10 min)
6. GAP-002: Admin UI (4 hours)
7. GAP-003: Error handling (2 hours)

**MEDIUM (Nice to Have):**
8. BUG-004: Environment validation (15 min)
9. GAP-004: Zod validation (2 hours)

**LOW (Technical Debt):**
10. BUG-005: Hard-coded org ID (10 min)
11. BUG-006: Migration org ID (10 min)
12. GAP-006: Documentation (1 hour)

### By Effort

**Quick Wins (< 30 min):**
- BUG-001: TypeScript config (5 min)
- BUG-002: Async/await (5 min)
- BUG-003: Private property (10 min)
- BUG-004: Env validation (15 min)
- BUG-005: Hard-coded org (10 min)
- BUG-006: Migration org (10 min)

**Total Quick Wins:** ~55 minutes

**Medium Effort (1-3 hours):**
- GAP-001: tRPC (3 hours)
- GAP-002: Admin UI (4 hours)
- GAP-003: Error handling (2 hours)
- GAP-004: Zod validation (2 hours)
- GAP-006: Documentation (1 hour)

**Total Medium Effort:** ~12 hours

**Large Effort (> 3 hours):**
- GAP-005: Testing (5 hours)

**Total Large Effort:** ~5 hours

**GRAND TOTAL:** ~18 hours (2.25 working days)

---

## Part 4: Recommended Implementation Sequence

### Phase 1: Fix Critical Bugs (1 hour)
**Goal:** Get code compiling and testable

1. ✅ Fix BUG-001: Enable decorators in tsconfig.json (5 min)
2. ✅ Fix BUG-002: Await createClient() (5 min)
3. ✅ Fix BUG-003: Add getPool() method (10 min)
4. ✅ Fix BUG-004: Add env validation (15 min)
5. ✅ Fix BUG-005: Use env for default org (10 min)
6. ✅ Fix BUG-006: Safer migration backfill (10 min)
7. ✅ Run static analysis (5 min)
8. ✅ Verify code compiles (5 min)

**Deliverable:** Code compiles successfully

---

### Phase 2: Complete tRPC Infrastructure (3 hours)
**Goal:** Enable Admin API

1. Create context.ts (30 min)
2. Create init.ts (30 min)
3. Create middleware.ts (30 min)
4. Create helper functions (30 min)
5. Add user_has_permission() function (15 min)
6. Create routers (45 min)
7. Create API route (15 min)
8. Create client setup (30 min)
9. Update root layout (10 min)
10. Test tRPC setup (20 min)

**Deliverable:** tRPC API working with type safety

---

### Phase 3: Build Admin UI (4 hours)
**Goal:** Enable event and handler management

1. Create EventTable component (45 min)
2. Create EventDetailsModal component (30 min)
3. Create HandlerHealthTable component (30 min)
4. Create admin/events page (90 min)
5. Create admin/handlers page (60 min)
6. Test UI end-to-end (15 min)

**Deliverable:** Admin UI functional

---

### Phase 4: Configure Error Handling (2 hours)
**Goal:** Production-ready error tracking

1. Run Sentry wizard (30 min)
2. Create error classes (30 min)
3. Create error boundary (30 min)
4. Create error pages (20 min)
5. Test Sentry integration (10 min)

**Deliverable:** Errors tracked in Sentry

---

### Phase 5: Add Zod Validation (2 hours)
**Goal:** Runtime input validation

1. Create validation schemas (60 min)
2. Create form helpers (15 min)
3. Integrate with tRPC (30 min)
4. Create example form (30 min)
5. Test validation (15 min)

**Deliverable:** All inputs validated

---

### Phase 6: Write Tests (5 hours)
**Goal:** 80%+ code coverage

1. Unit tests for Event Bus (60 min)
2. Unit tests for HandlerRegistry (30 min)
3. Integration tests (120 min)
4. E2E tests (60 min)
5. Performance benchmarks (30 min)

**Deliverable:** All tests passing

---

### Phase 7: Documentation (1 hour)
**Goal:** Complete handoff

1. Code review notes (30 min)
2. Acceptance criteria checklist (20 min)
3. API documentation (30 min)

**Deliverable:** Documentation complete

---

## Part 5: Acceptance Criteria Completion Matrix

| Story | Criterion | Current Status | What's Missing | Effort |
|-------|-----------|----------------|----------------|--------|
| **FOUND-007** | Database tables created | ✅ DONE | None | 0 |
| | PostgreSQL functions | ✅ DONE | None | 0 |
| | TypeScript EventBus class | ❌ BROKEN | Fix TypeScript errors | 10 min |
| | Event types defined | ✅ DONE | None | 0 |
| | Performance < 50ms | ⏳ UNTESTED | Run benchmarks | 30 min |
| | 3 automatic retries | ⏳ UNTESTED | Write tests | 30 min |
| | Multi-tenancy enforced | ⏳ UNTESTED | Write tests | 30 min |
| **FOUND-008** | Handler registry | ✅ DONE | None | 0 |
| | Decorator pattern | ❌ BROKEN | Fix TypeScript config | 5 min |
| | Auto-discovery | ✅ DONE | None | 0 |
| | Health monitoring | ✅ DONE | None | 0 |
| | Auto-disable trigger | ⏳ UNTESTED | Write tests | 30 min |
| | Admin API endpoints | ❌ NOT BUILT | Build tRPC routers | 1 hour |
| | Admin UI | ❌ NOT BUILT | Build UI | 2 hours |
| **FOUND-009** | Event history API | ❌ NOT BUILT | Build tRPC router | 30 min |
| | Dead letter queue viewer | ❌ NOT BUILT | Build UI | 45 min |
| | Replay functionality | ❌ NOT BUILT | Build UI | 30 min |
| | Event details modal | ❌ NOT BUILT | Build component | 30 min |
| | Admin UI features | ❌ NOT BUILT | Build UI | 2 hours |
| **FOUND-010** | tRPC packages installed | ✅ DONE | None | 0 |
| | Base configuration | ❌ NOT BUILT | Create context, init | 1 hour |
| | Middleware | ❌ NOT BUILT | Create middleware | 30 min |
| | Procedure types | ❌ NOT BUILT | Define procedures | 30 min |
| | Example routers | ❌ NOT BUILT | Create routers | 45 min |
| | Next.js integration | ❌ NOT BUILT | Create API route | 30 min |
| | Type safety | ⏳ UNTESTED | Test end-to-end | 30 min |
| **FOUND-011** | Custom error classes | ❌ NOT BUILT | Create classes | 30 min |
| | Sentry integration | ❌ NOT BUILT | Run wizard | 30 min |
| | Error boundary | ❌ NOT BUILT | Create component | 30 min |
| | Error formatter | ❌ NOT BUILT | Add to tRPC | 20 min |
| | Toast notifications | ❌ NOT BUILT | Integrate sonner | 20 min |
| | Custom error pages | ❌ NOT BUILT | Create 404/500 | 20 min |
| **FOUND-012** | Core validation patterns | ❌ NOT BUILT | Create schemas | 30 min |
| | Entity schemas | ❌ NOT BUILT | Create schemas | 30 min |
| | Auth schemas | ❌ NOT BUILT | Create schemas | 30 min |
| | Custom rules | ❌ NOT BUILT | Add refinements | 15 min |
| | Form helpers | ❌ NOT BUILT | Create hook | 15 min |
| | tRPC integration | ❌ NOT BUILT | Add to routers | 30 min |

---

**Report Generated:** 2025-11-19
**QA Agent:** Claude (Sonnet 4.5)
**Total Bugs:** 6 (2 critical, 1 high, 1 medium, 2 low)
**Total Gaps:** ~18 hours of work remaining
**Next Steps:** Follow recommended implementation sequence
