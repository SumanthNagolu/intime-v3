# Critical Fixes Needed - Quick Reference

**Priority:** URGENT - Blocking Production Deployment
**Time Required:** 1 day for critical path
**Status:** Must complete before ANY deployment

---

## Fix #1: Install Missing UI Components (5 minutes)

### Problem
```
Build Error: Module not found
- Cannot resolve '@/components/ui/label'
- Cannot resolve '@/components/ui/checkbox'
- Cannot resolve '@/components/ui/alert'
```

### Solution
```bash
npx shadcn-ui@latest add label
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add alert
```

### Verification
```bash
npm run build
# Should succeed without "Module not found" errors
```

---

## Fix #2: Regenerate Database Types (15 minutes)

### Problem
```
78 TypeScript errors:
- Property does not exist on type 'never'
- Argument type not assignable to parameter
- RPC function type mismatches
```

### Root Cause
Database migrations applied but TypeScript types not regenerated.

### Solution
```bash
# Get your Supabase project ID from dashboard
# Or from .env.local: NEXT_PUBLIC_SUPABASE_URL contains it

npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > src/types/supabase.ts

# Alternative if you have Supabase CLI linked:
npx supabase gen types typescript --local > src/types/supabase.ts
```

### Affected Files (25+ type errors fixed)
- `src/lib/academy/unlock-checker.ts`
- `src/lib/storage/upload.ts`
- `src/lib/ai/twins/EmployeeTwin.ts`
- All files using RPC functions

### Verification
```bash
npx tsc --noEmit
# Should reduce from 78 errors to ~50 errors
```

---

## Fix #3: Fix tRPC Router Exports (10 minutes)

### Problem
```
Error: Module '"../init"' has no exported member 'createTRPCRouter'
Error: Module '"../init"' has no exported member 'protectedProcedure'
```

### Affected Files
- `src/server/trpc/routers/content.ts` (15 errors)
- `src/server/trpc/routers/courses.ts` (10 errors)

### Solution

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/server/trpc/init.ts`

Add exports:
```typescript
// At the end of init.ts
export { router as createTRPCRouter } from '@trpc/server';
export { protectedProcedure } from './middleware';
```

OR update import statements in routers:
```typescript
// Before:
import { createTRPCRouter, protectedProcedure } from '../init';

// After:
import { router } from '@trpc/server';
import { protectedProcedure } from '../middleware';
```

### Verification
```bash
npx tsc --noEmit
# Should reduce from ~50 errors to ~30 errors
```

---

## Fix #4: Fix Remaining Type Issues (2 hours)

### Problem
After fixes #1-3, ~30 type errors remain.

### Categories

#### A. Academy unlock-checker.ts (9 errors)
**Issue:** RPC function calls have wrong types after regeneration
**Fix:** Update parameter types to match new Supabase types

#### B. Storage upload.ts (6 errors)
**Issue:** RPC function parameter types don't match
**Fix:** Update parameter types for content asset functions

#### C. Twin system EmployeeTwin.ts (8 errors)
**Issue:** `employee_twin_interactions` table not in types
**Fix:** Either:
- Check if migration was applied
- Or update Supabase types again
- Or use type casting as temporary fix

#### D. Implicit 'any' types (15 errors)
**Issue:** tRPC router handlers have implicit any
**Fix:** Add explicit types to function parameters

### Verification
```bash
npx tsc --noEmit
# Should show 0 errors
```

---

## Fix #5: Fix Test Supabase Mocks (2 hours)

### Problem
```
7 productivity tests failing:
TypeError: this.supabase.from(...).select(...).eq is not a function
```

### Root Cause
Test mocks don't properly implement Supabase query chain.

### Solution

**File:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/testing/setup.ts`

Update mock to properly chain methods:
```typescript
// Current mock (broken):
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(),
    // eq, update, etc. are not chainable
  }))
};

// Fixed mock:
const createChainableMock = () => {
  const chain: any = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    update: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };
  return chain;
};

const mockSupabase = {
  from: vi.fn(() => createChainableMock()),
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
};
```

### Affected Tests
- `ActivityClassifier.test.ts` (4 failures)
- `TimelineGenerator.test.ts` (3 failures)

### Verification
```bash
npm test tests/unit/ai/productivity/
# Should see 7 tests pass instead of fail
```

---

## Fix #6: Fix Academy Query Tests (3 hours)

### Problem
22 academy query tests failing due to database type issues.

### Dependencies
- Requires Fix #2 (database types) completed first
- Requires Fix #4 (remaining type issues) completed first

### Solution
After type fixes, these tests should mostly pass. Any remaining failures:
1. Check RPC functions exist in database
2. Verify test data matches schema
3. Update test assertions if schema changed

### Verification
```bash
npm test src/lib/academy/__tests__/queries.test.ts
# Should see 22 tests pass
```

---

## Quick Command Reference

### Check Current Status
```bash
# Build status
npm run build

# TypeScript errors
npx tsc --noEmit | wc -l

# Test results
npm test 2>&1 | grep "Test Files"
```

### Apply All Critical Fixes
```bash
# Fix #1: UI components (5 min)
npx shadcn-ui@latest add label checkbox alert

# Fix #2: Database types (15 min)
npx supabase gen types typescript --project-id YOUR_ID > src/types/supabase.ts

# Fix #3: tRPC exports (10 min)
# Manual edit: src/server/trpc/init.ts

# Verify fixes
npm run build
npx tsc --noEmit
npm test
```

### Expected Results After Fixes
```
Build: ✅ SUCCESS
TypeScript Errors: 0 (was 78)
Test Pass Rate: 80%+ (was 74.5%)
Tests Passing: 433+ (was 404)
```

---

## Timeline

### Phase 1: Critical Path (Same Day)
- Fix #1: 5 minutes
- Fix #2: 15 minutes
- Fix #3: 10 minutes
- **Checkpoint:** Build should succeed

### Phase 2: Type Cleanup (Same Day)
- Fix #4: 2 hours
- **Checkpoint:** Zero TypeScript errors

### Phase 3: Test Fixes (Next Day)
- Fix #5: 2 hours
- Fix #6: 3 hours
- **Checkpoint:** 80%+ test pass rate

### Total Time: 1-2 days

---

## Success Criteria

After completing all fixes:

✅ Production build succeeds
✅ Zero TypeScript compilation errors
✅ 80%+ test pass rate achieved
✅ Critical functionality verified
✅ Ready for manual QA testing

---

## Priority Order

**Must Fix (Blocking Deploy):**
1. Fix #1 - UI components
2. Fix #2 - Database types
3. Fix #3 - tRPC exports
4. Fix #4 - Remaining type issues

**Should Fix (Quality):**
5. Fix #5 - Test mocks
6. Fix #6 - Academy tests

**Complete Phase 1-4 before considering ANY deployment.**

---

**Last Updated:** 2025-11-21
**Full Report:** `/docs/qa/QA-REPORT-HONEST-ASSESSMENT.md`
**Status Summary:** `/PRODUCTION-READINESS-STATUS.md`
