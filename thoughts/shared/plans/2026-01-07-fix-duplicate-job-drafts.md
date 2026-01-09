# Fix Duplicate Job Drafts - Implementation Plan

## Overview

The Job wizard creates duplicate drafts because it passes **unstable object references** to `useEntityDraft`, unlike the Account wizard which passes **stable tRPC mutation references** directly. This plan normalizes the Jobs API to match Account's pattern, then simplifies the Job wizard to eliminate the instability.

## Current State Analysis

### Root Cause

The Job wizard (`src/app/employee/recruiting/jobs/new/page.tsx` lines 316-336) creates **new object literals on every render**:

```typescript
// BROKEN: New objects created every render
createMutation: {
  mutateAsync: async (data) => { ... },  // New function each render
  isPending: createMutation.isPending,
},
updateMutation: {
  mutateAsync: async (data) => {
    const { id, ...rest } = data
    const result = await updateMutation.mutateAsync({ jobId: id, ...rest })  // Transform id → jobId
    ...
  },
  isPending: updateMutation.isPending,
},
getDraftQuery: {
  data: getDraftQuery.data,
  isLoading: getDraftQuery.isLoading,
  error: getDraftQuery.error,
},
```

These unstable references cause `useEntityDraft`'s effects to re-trigger, creating multiple drafts.

### Why Account Works

Account wizard (`src/app/employee/recruiting/accounts/new/page.tsx` lines 315-317) passes **stable tRPC references**:

```typescript
// WORKING: Direct stable references
createMutation,
updateMutation,
getDraftQuery,
```

### Why Jobs Needs Wrappers (Currently)

The Jobs API uses `jobId` as the parameter name:
- `src/server/routers/ats.ts` line 135: `jobId: z.string().uuid()`

The Account API uses `id`:
- `src/server/routers/crm.ts` line 1164: `id: z.string().uuid()`

The `useEntityDraft` hook passes `id`, so Jobs needs a wrapper to transform `id` → `jobId`.

### Key Discovery

| Entity | API Parameter | Wizard Pattern | Result |
|--------|---------------|----------------|--------|
| Account | `id` | Direct mutation refs | Works |
| Job | `jobId` | Wrapper objects | Broken |

## Desired End State

After this plan:

1. Jobs API uses `id` parameter (matching Account pattern)
2. Job wizard passes mutations directly (no wrappers)
3. Job wizard uses default `hasData` check (matching Account)
4. Only 1 draft created when user fills form and waits

### Verification

```bash
# Start dev server
pnpm dev

# Test: Create new job, fill Step 1, wait 2+ minutes
# Expected: Only 1 draft in Drafts tab
```

## What We're NOT Doing

- Changing `useEntityDraft` hook internals
- Adding memoization hacks to the wizard
- Changing database schema
- Modifying how Account wizard works

## Implementation Approach

**Strategy**: Normalize Jobs API to match Account pattern, then simplify wizard.

The safest approach is:
1. First change the API schema (additive - accept both `id` and `jobId`)
2. Update all callers to use `id`
3. Remove `jobId` from schema (breaking change, but all callers updated)
4. Simplify wizard to pass mutations directly

---

## Phase 1: Normalize Jobs API

### Overview

Change the `jobs.update` endpoint to accept `id` instead of `jobId`, matching the Account pattern.

### Changes Required:

#### 1.1 Update Jobs Input Schema

**File**: `src/server/routers/ats.ts`
**Lines**: 134-135

**Current**:
```typescript
const updateJobInput = z.object({
  jobId: z.string().uuid(),
  // ... rest
})
```

**Change to**:
```typescript
const updateJobInput = z.object({
  id: z.string().uuid(),
  // ... rest
})
```

#### 1.2 Update Jobs Update Procedure

**File**: `src/server/routers/ats.ts`
**Lines**: ~1549

**Current**:
```typescript
.eq('id', input.jobId)
```

**Change to**:
```typescript
.eq('id', input.id)
```

#### 1.3 Update JobOverviewSection

**File**: `src/components/recruiting/jobs/sections/JobOverviewSection.tsx`
**Lines**: 103-130

**Current**:
```typescript
await updateJobMutation.mutateAsync({
  jobId,
  title: data.title as string,
  // ...
})
```

**Change to**:
```typescript
await updateJobMutation.mutateAsync({
  id: jobId,
  title: data.title as string,
  // ...
})
```

Apply same pattern to all `mutateAsync` calls in this file (lines ~104, ~116, ~126).

#### 1.4 Update JobHiringTeamSection

**File**: `src/components/recruiting/jobs/sections/JobHiringTeamSection.tsx`

Find all `mutateAsync` calls with `jobId` and change to `id: jobId`.

#### 1.5 Update JobClientDetailsSection

**File**: `src/components/recruiting/jobs/sections/JobClientDetailsSection.tsx`

Find all `mutateAsync` calls with `jobId` and change to `id: jobId`.

#### 1.6 Update JobRequirementsSection

**File**: `src/components/recruiting/jobs/sections/JobRequirementsSection.tsx`

Find all `mutateAsync` calls with `jobId` and change to `id: jobId`.

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compiles: `pnpm tsc --noEmit`
- [x] ESLint passes: `pnpm eslint src/server/routers/ats.ts src/components/recruiting/jobs/sections/*.tsx`
- [ ] Dev server starts: `pnpm dev`

#### Manual Verification:
- [ ] Edit an existing job from detail page (Overview tab) - save works
- [ ] Edit job hiring team - save works
- [ ] Edit job requirements - save works

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding.

---

## Phase 2: Simplify Job Wizard

### Overview

Remove all wrapper objects and pass mutations directly, exactly like Account does.

### Changes Required:

#### 2.1 Remove Mutation Wrappers

**File**: `src/app/employee/recruiting/jobs/new/page.tsx`
**Lines**: 316-336

**Current** (lines 316-336):
```typescript
const draftState = useEntityDraft({
  entityType: 'Job',
  wizardRoute: '/employee/recruiting/jobs/new',
  totalSteps: 8,
  store: () => store as unknown as WizardStore<CreateJobFormData>,
  resumeId: isEditMode ? undefined : resumeId,
  createMutation: {
    mutateAsync: async (data: Record<string, unknown>) => {
      const result = await createMutation.mutateAsync(data as any)
      return result as any
    },
    isPending: createMutation.isPending,
  },
  updateMutation: {
    mutateAsync: async (data: Record<string, unknown>) => {
      const { id, ...rest } = data
      const result = await updateMutation.mutateAsync({ jobId: id as string, ...rest } as any)
      return result as any
    },
    isPending: updateMutation.isPending,
  },
  getDraftQuery: {
    data: getDraftQuery.data as any,
    isLoading: getDraftQuery.isLoading,
    error: getDraftQuery.error,
  },
  searchParamsString: searchParams.toString(),
  // ... rest
})
```

**Change to** (matching Account pattern):
```typescript
const draftState = useEntityDraft({
  entityType: 'Job',
  wizardRoute: '/employee/recruiting/jobs/new',
  totalSteps: 8,
  store: () => store as unknown as WizardStore<CreateJobFormData>,
  resumeId: isEditMode ? undefined : resumeId,
  createMutation,
  updateMutation,
  getDraftQuery,
  searchParamsString: searchParams.toString(),
  // ... rest
})
```

#### 2.2 Remove Custom hasData

**File**: `src/app/employee/recruiting/jobs/new/page.tsx`
**Line**: ~368

**Current**:
```typescript
hasData: (data) => !!data.title && data.title.trim() !== '' && !!data.accountId,
```

**Change**: Remove this line entirely. Use default `hasData` from `useEntityDraft` which checks for name-like fields (title, name, firstName, etc.).

#### 2.3 Update handleSubmit for Edit Mode

**File**: `src/app/employee/recruiting/jobs/new/page.tsx`
**Lines**: ~387-393

**Current**:
```typescript
await updateMutation.mutateAsync({
  jobId: editId,
  ...entityData,
  // ...
})
```

**Change to**:
```typescript
await updateMutation.mutateAsync({
  id: editId,
  ...entityData,
  // ...
})
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compiles: `pnpm tsc --noEmit`
- [x] ESLint passes: `pnpm eslint src/app/employee/recruiting/jobs/new/page.tsx`
- [ ] Dev server starts: `pnpm dev`

#### Manual Verification:
- [ ] Create new job, fill Step 1 (title + account), wait 2+ minutes → **ONLY 1 DRAFT**
- [ ] Resume a draft → form data loads correctly
- [ ] Complete wizard → job created with status 'open'
- [ ] Edit existing job → changes save correctly

**Implementation Note**: This is the critical phase. After manual verification confirms only 1 draft is created, the bug is fixed.

---

## Phase 3: Cleanup & Documentation

### Overview

Update the issue file and clean up any related code.

### Changes Required:

#### 3.1 Update Issue Status

**File**: `thoughts/shared/issues/ISSUE-001-duplicate-job-drafts.md`

Update status to `Resolved` and add resolution notes.

#### 3.2 Delete Research File (Optional)

**File**: `thoughts/shared/research/2026-01-07-duplicate-job-drafts.md`

Can be kept for historical reference or deleted.

### Success Criteria:

#### Automated Verification:
- [ ] No linting errors across codebase

#### Manual Verification:
- [ ] Issue file updated
- [ ] All draft creation scenarios tested

---

## Testing Strategy

### Unit Tests:
- Existing tests should pass (no new tests needed for this fix)

### Integration Tests:
- Job CRUD operations continue to work

### Manual Testing Steps:

1. **New Job Draft Creation**
   - Click "New Job"
   - Fill Step 1: Enter title "Test Job", select an account
   - Wait 2-3 minutes on the page
   - Navigate to Jobs list → Drafts tab
   - **Expected**: Only 1 draft with title "Test Job"

2. **Draft Resume**
   - From Drafts tab, click on the draft
   - **Expected**: Form loads with saved data

3. **Complete Wizard**
   - Fill remaining steps and submit
   - **Expected**: Job created with status 'open'

4. **Edit Existing Job**
   - Open an existing job detail page
   - Edit any field (title, location, etc.)
   - Save
   - **Expected**: Changes persist

5. **Account Wizard (Regression)**
   - Create new account, fill first page, wait
   - **Expected**: Still creates only 1 draft (no regression)

## Performance Considerations

None. This is a reference stability fix, not a performance optimization.

## Migration Notes

None. No database changes required.

## References

- Issue file: `thoughts/shared/issues/ISSUE-001-duplicate-job-drafts.md`
- Research: `thoughts/shared/research/2026-01-07-duplicate-job-drafts.md`
- Working baseline: `src/app/employee/recruiting/accounts/new/page.tsx`
