# ISSUE-001: Duplicate Job Drafts Being Created

**Status:** Open  
**Priority:** Critical  
**Created:** 2026-01-07  
**Affected Entity:** Jobs  
**Working Entity:** Accounts (baseline)

---

## Problem Summary

When creating a new Job through the wizard, multiple duplicate drafts are being created instead of a single draft that gets updated. The longer the user waits on the form, the more duplicates appear.

### Observed Behavior
- User clicks "New Job"
- User fills in Step 1 (title: "Java Developer", selects account)
- User waits on the page
- Multiple drafts (4-5+) with identical title "Java Developer" appear in the Drafts tab
- All drafts show "Step 1 of 8" and "less than a minute ago"

### Expected Behavior
- Only ONE draft should be created when the user first enters meaningful data
- Subsequent auto-saves should UPDATE that same draft, not create new ones
- This is exactly how Account drafts work (confirmed working)

---

## Test Results

### Account Wizard (WORKING ✓)
| Test | Result |
|------|--------|
| Create new account, fill first page, wait 2 min | 1 draft created |
| Resume draft, continue filling, wait 2 min | Still 1 draft (updated) |
| Go back to list | Only 1 draft visible |

### Job Wizard (BROKEN ✗)
| Test | Result |
|------|--------|
| Create new job, fill first page (title + account), wait 2 min | 4-5 drafts created |
| All drafts have same title | Yes - "Java Developer" |
| All drafts at same step | Yes - Step 1 of 8 |

---

## Technical Analysis

### Architecture
Both Job and Account wizards use the same `useEntityDraft` hook from `src/hooks/use-entity-draft.ts`.

### Key Differences Between Account and Job Implementation

#### 1. Mutation Passing

**Account** (`src/app/employee/recruiting/accounts/new/page.tsx` lines 315-317):
```typescript
// Passes tRPC mutations DIRECTLY - stable references
createMutation,
updateMutation,
getDraftQuery,
```

**Jobs** (`src/app/employee/recruiting/jobs/new/page.tsx`):
```typescript
// Uses MEMOIZED WRAPPERS because Jobs API expects 'jobId' not 'id'
createMutation: memoizedCreateMutation,
updateMutation: memoizedUpdateMutation,
getDraftQuery: {
  data: getDraftQuery.data as any,
  isLoading: getDraftQuery.isLoading,
  error: getDraftQuery.error,
},
```

The Job update mutation requires `jobId` instead of `id`, necessitating a wrapper that transforms the API call.

#### 2. getDraftQuery Object
- Account passes the query result directly
- Jobs creates a new object literal `{ data, isLoading, error }` on every render

#### 3. hasData Check
- Account: Uses default (checks `name` field only)
- Jobs: Custom check requiring BOTH `title` AND `accountId`

---

## Attempted Fixes (All Failed)

### Attempt 1: Memoize Mutation Wrappers
```typescript
const memoizedCreateMutation = useMemo(() => ({...}), [createMutation])
const memoizedUpdateMutation = useMemo(() => ({...}), [updateMutation])
```
**Result:** Still creates duplicates

### Attempt 2: SessionStorage-based Guards
- Added `isCreating` flag in sessionStorage (survives React Strict Mode remounts)
- Added `previousFormData` in sessionStorage
- Added debounce cancellation on cleanup
- Added mount tracking with `isMountedRef`

**Result:** Still creates duplicates

### Attempt 3: Double-check draftId from sessionStorage
- Debounced save now checks sessionStorage for draftId as backup
- Added centralized `clearSessionStorage()` helper

**Result:** Still creates duplicates

---

## Remaining Hypotheses

### 1. Mutation Wrapper Instability
Even with `useMemo`, the wrapper functions might not be truly stable because:
- `createMutation.mutateAsync` might return a new function reference
- The getter `get isPending()` creates new accessor each time

### 2. Store Function Recreation
```typescript
store: () => store as unknown as WizardStore<CreateJobFormData>
```
This arrow function is recreated every render. Account has the same pattern but works.

### 3. Jobs Router Behavior
The Jobs API might be handling requests differently:
- Different transaction isolation
- Different upsert logic
- Missing duplicate checks

### 4. Timing / Race Condition in Jobs-specific Code
Something in the Jobs wizard flow might be triggering multiple effect runs that don't occur in Account.

### 5. formToEntity Dependency on store.currentStep
```typescript
const formToEntity = useCallback((formData) => {
  // ...
}, [isEditMode, store.currentStep])  // <-- store.currentStep changes
```
This causes `formToEntity` to be recreated on step changes, but user is on Step 1 the whole time...

---

## Next Steps to Investigate

1. **Add Extensive Logging**
   - Log every call to `debouncedSave`
   - Log every call to `createMutation.mutateAsync`
   - Log sessionStorage state at each point

2. **Compare Network Requests**
   - Use browser DevTools to capture all network requests
   - Compare timing and payload of create requests between Account and Jobs

3. **Test with Jobs API Directly**
   - Modify Jobs router to accept `id` instead of `jobId` (like Account)
   - Remove wrapper and pass mutation directly
   - See if this eliminates duplicates

4. **React DevTools Profiler**
   - Profile component renders
   - Check for unexpected re-renders
   - Verify effect execution counts

5. **Isolate the Issue**
   - Create minimal reproduction
   - Test with React Strict Mode disabled
   - Test in production build (no Strict Mode)

---

## Files Involved

| File | Purpose |
|------|---------|
| `src/hooks/use-entity-draft.ts` | Core draft management hook |
| `src/app/employee/recruiting/jobs/new/page.tsx` | Job wizard page |
| `src/app/employee/recruiting/accounts/new/page.tsx` | Account wizard page (working) |
| `src/server/routers/ats.ts` | Jobs API router |
| `src/server/routers/crm.ts` | Accounts API router |
| `src/stores/create-job-store.ts` | Job wizard Zustand store |
| `src/stores/create-account-store.ts` | Account wizard Zustand store |

---

## Environment

- Next.js 15 (App Router)
- React 19 (with Strict Mode in development)
- tRPC for API
- Zustand for state management
- `use-debounce` library for debouncing

---

## Impact

- **User Experience:** Confusing draft list with duplicates
- **Data Quality:** Orphaned draft records in database
- **Cost:** ~$100 in debugging credits, 3+ days of developer time
