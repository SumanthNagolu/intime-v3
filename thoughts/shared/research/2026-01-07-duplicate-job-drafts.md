---
date: 2026-01-07T17:53:58-0500
researcher: Claude Code
git_commit: 9ad594de28dfad35c2699fb14d53fd67c2b9ecda
branch: main
repository: intime-v3
topic: "Duplicate Job Drafts Investigation - System Architecture Research"
tags: [research, codebase, drafts, useEntityDraft, wizard, jobs, accounts]
status: complete
last_updated: 2026-01-07
last_updated_by: Claude Code
---

# Research: Duplicate Job Drafts - System Architecture

**Date**: 2026-01-07T17:53:58-0500
**Researcher**: Claude Code
**Git Commit**: 9ad594de28dfad35c2699fb14d53fd67c2b9ecda
**Branch**: main
**Repository**: intime-v3

## Research Question

Investigate the codebase architecture related to ISSUE-001: Duplicate Job Drafts Being Created. Document how the draft system works for both Jobs and Accounts (working baseline) to understand the relevant files, line numbers, and code paths.

## Summary

The investigation reveals a complex multi-layered draft system with several key architectural differences between the working Account wizard and the broken Job wizard. Both use the same `useEntityDraft` hook, but differ in how mutations are passed and how the Jobs API expects parameters.

### Key System Components

1. **`useEntityDraft` hook** (`src/hooks/use-entity-draft.ts`) - Core draft management with debounced auto-save
2. **Wizard pages** - Job and Account pages that integrate with the draft system
3. **API routers** - Different endpoints and parameter expectations
4. **Zustand stores** - Form state management (no persistence middleware)

---

## Detailed Findings

### 1. Core Draft Hook: `useEntityDraft`

**File**: `src/hooks/use-entity-draft.ts`

#### State Management

| Variable | Line | Purpose |
|----------|------|---------|
| `draftId` state | 133-138 | Initialized from sessionStorage |
| `draftIdRef` | 144 | Ref for debounced callbacks to get current value |
| `isCreatingRef` | 145 | Lock to prevent concurrent creates |
| `hasInitialized` ref | 140 | Prevents re-initialization |
| `previousFormData` ref | 141 | Tracks changes for auto-save trigger |

#### Draft Creation Guards (Lines 204-208)

```typescript
if (isCreatingRef.current) {
  console.log('[useEntityDraft] Skipping save - creation already in progress')
  return
}
```

The hook uses `isCreatingRef` as a mutex to prevent concurrent creates. However, this is a **React ref**, not a true mutex - it doesn't handle race conditions across async boundaries.

#### Debounced Save Logic (Lines 172-240)

- Uses `useDebouncedCallback` with **2000ms delay** (line 239)
- **Critical pattern** (line 175): Uses `draftIdRef.current` instead of the passed `draftId` parameter
- The passed `_unusedDraftId` parameter is intentionally ignored
- Comment explains: "Use ref to get the CURRENT draft ID, not the stale one from when debounce was triggered"

#### Auto-Save Effect (Lines 337-359)

```typescript
useEffect(() => {
  if (!isReady) return
  const currentFormDataStr = JSON.stringify(formData)
  if (currentFormDataStr === previousFormData.current) return
  previousFormData.current = currentFormDataStr
  const hasMeaningfulData = hasData(formData)
  if (!hasMeaningfulData) return
  debouncedSave(draftId, formData, currentStep)
}, [isReady, draftId, formData, currentStep, hasData, debouncedSave])
```

This effect runs whenever `formData` or `currentStep` changes, triggering the debounced save.

#### SessionStorage Keys

| Key Pattern | Line | Purpose |
|-------------|------|---------|
| `entity-draft-id-${entityType}-${resumeId \|\| 'new'}` | 129 | Persists draft ID |
| `entity-draft-init-${entityType}-${resumeId \|\| 'new'}` | 245-246 | Tracks initialization |

---

### 2. Job Wizard Page

**File**: `src/app/employee/recruiting/jobs/new/page.tsx`

#### Mutation Definitions (Lines 306-307)

```typescript
const createMutation = trpc.ats.jobs.create.useMutation()
const updateMutation = trpc.ats.jobs.update.useMutation()
```

#### Mutation Wrappers (Lines 316-336)

**Create Mutation Wrapper** (lines 316-322):
```typescript
createMutation: {
  mutateAsync: async (data: Record<string, unknown>) => {
    const result = await createMutation.mutateAsync(data as any)
    return result as any
  },
  isPending: createMutation.isPending,
}
```

**Update Mutation Wrapper** (lines 323-331):
```typescript
updateMutation: {
  mutateAsync: async (data: Record<string, unknown>) => {
    // Map 'id' to 'jobId' for update mutation
    const { id, ...rest } = data
    const result = await updateMutation.mutateAsync({ jobId: id as string, ...rest } as any)
    return result as any
  },
  isPending: updateMutation.isPending,
}
```

**Key observation**: The update mutation wrapper transforms `id` to `jobId` (line 326) because the Jobs API expects `jobId` parameter.

**getDraftQuery Wrapper** (lines 332-336):
```typescript
getDraftQuery: {
  data: getDraftQuery.data as any,
  isLoading: getDraftQuery.isLoading,
  error: getDraftQuery.error,
}
```

This creates a **new object literal on every render**.

#### hasData Implementation (Line 368)

```typescript
hasData: (data) => !!data.title && data.title.trim() !== '' && !!data.accountId
```

Requires BOTH `title` AND `accountId` to be present.

#### formToEntity Callback (Lines 340-353)

```typescript
formToEntity: (formData) => {
  const wizardState = isEditMode
    ? undefined
    : {
        formData,
        currentStep: store.currentStep,
      }
  const entityData = formToEntityData(formData)
  return {
    ...entityData,
    wizard_state: wizardState,
  }
}
```

**Dependencies** used: `isEditMode`, `store.currentStep`

#### Store Reference (Line 314)

```typescript
store: () => store as unknown as WizardStore<CreateJobFormData>
```

This arrow function is **recreated on every render**.

---

### 3. Account Wizard Page (Working Baseline)

**File**: `src/app/employee/recruiting/accounts/new/page.tsx`

#### Mutation Definitions (Lines 303-306)

```typescript
const createMutation = trpc.crm.accounts.createEnhanced.useMutation()
const updateMutation = trpc.crm.accounts.updateEnhanced.useMutation()
```

#### useEntityDraft Call (Lines 309-416)

**Key difference**: Mutations are passed **directly** without wrappers:

```typescript
createMutation,
updateMutation,
getDraftQuery,
```

(Lines 315-317)

#### hasData Implementation

**Not provided** - Uses the default implementation from `useEntityDraft` (lines 102-109):

```typescript
function defaultHasData<T extends object>(formData: T): boolean {
  const data = formData as Record<string, unknown>
  const nameField = data.name || data.title || data.firstName || data.companyName
  if (nameField && typeof nameField === 'string' && nameField.trim() !== '') {
    return true
  }
  return false
}
```

Only checks for a name-like field, not multiple fields.

#### formToEntity Callback (Lines 321-367)

Similar pattern but stores in `custom_fields.wizard_state` for Accounts.

---

### 4. Jobs API Router

**File**: `src/server/routers/ats.ts`

#### jobs.create Endpoint (Lines 1337-1517)

- Input schema allows `status` (defaults to `'draft'`)
- Input schema allows `wizard_state` with `formData` field (lines 126-131)
- **Transaction wrapped** (lines 1395-1476)
- Creates status history record

#### jobs.update Endpoint (Lines 1527-1657)

**Input parameter**: `jobId` (NOT `id`)

```typescript
jobId: z.string().uuid()  // Line ~135 in updateJobInput schema
```

This is why the Job wizard wraps the mutation to transform `id` → `jobId`.

#### jobs.createDraft Endpoint (Lines 1293-1334)

- Creates a minimal draft with `title: 'Untitled Job'`
- Sets `status: 'draft'`
- Sets `wizard_state: { currentStep: 1, totalSteps: 8 }`
- **No duplicate prevention**

#### jobs.listMyDrafts Endpoint (Lines 654-690)

- Filters by `org_id`, `created_by`, `status = 'draft'`
- Orders by `updated_at DESC`
- Limits to 10 results

---

### 5. Accounts API Router

**File**: `src/server/routers/crm.ts`

#### accounts.createEnhanced Endpoint

- Uses `id` parameter (standard)
- Stores wizard state in entity record

#### accounts.updateEnhanced Endpoint

- Uses `id` parameter (standard)
- No transformation needed

#### accounts.listMyDrafts Endpoint (Lines 2377-2412)

- Similar pattern to Jobs
- Filters by `status = 'draft'`

---

### 6. Zustand Stores

**Both stores have identical patterns**:

| Store | File |
|-------|------|
| Job Store | `src/stores/create-job-store.ts` |
| Account Store | `src/stores/create-account-store.ts` |

#### State Shape (Both stores)

```typescript
{
  formData: FormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null
}
```

#### No Persistence Middleware

Both stores explicitly document (job store lines 243-244, account store lines 275-276):
```typescript
// NO localStorage persistence - DB is the only source of truth
// This prevents stale data from old drafts bleeding into new ones
```

#### setFormData Implementation (Same in both)

```typescript
setFormData: (data) =>
  set((state) => ({
    formData: { ...state.formData, ...data },
    isDirty: true,
    lastSaved: new Date(),
  }))
```

Sets `isDirty: true` and `lastSaved: new Date()` on every update.

---

### 7. useEntityWizard Hook

**File**: `src/hooks/use-entity-wizard.ts`

- **Does NOT trigger auto-saves** - delegated to `useEntityDraft`
- Provides manual `handleSaveDraft()` function (lines 190-211)
- Handles step navigation and validation
- No useEffect hooks - all logic in callbacks

---

## Code References

### Critical Files

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/hooks/use-entity-draft.ts` | Core draft management | 133-240, 337-359 |
| `src/app/employee/recruiting/jobs/new/page.tsx` | Job wizard | 306-370 |
| `src/app/employee/recruiting/accounts/new/page.tsx` | Account wizard | 303-416 |
| `src/server/routers/ats.ts` | Jobs API | 1293-1657 |
| `src/server/routers/crm.ts` | Accounts API | 2377-2469 |
| `src/stores/create-job-store.ts` | Job form state | 243-308 |
| `src/stores/create-account-store.ts` | Account form state | 275-298 |
| `src/hooks/use-entity-wizard.ts` | Wizard navigation | 17-308 |

### Key Differences Summary

| Aspect | Account (Working) | Job (Broken) |
|--------|-------------------|--------------|
| Mutation passing | Direct references | Wrapper objects |
| Update param | `id` | `jobId` (requires mapping) |
| getDraftQuery | Direct query result | New object literal each render |
| hasData | Default (name only) | Custom (title AND accountId) |
| store function | `() => store as ...` | `() => store as ...` (same) |

---

## Architecture Documentation

### Draft Creation Flow

```
User types in form
       ↓
Zustand store.setFormData() updates formData
       ↓
useEntityDraft's auto-save effect detects change
       ↓
Checks: isReady && formData changed && hasData(formData)
       ↓
Calls debouncedSave(draftId, formData, currentStep)
       ↓
2 seconds later...
       ↓
debouncedSave callback executes:
  - Reads draftIdRef.current (not the passed draftId!)
  - If no draftId exists:
      - Checks isCreatingRef to prevent concurrent creates
      - Calls createMutation.mutateAsync()
      - Sets draftId in state, ref, and sessionStorage
  - If draftId exists:
      - Calls updateMutation.mutateAsync({ id: draftId, ... })
```

### SessionStorage Keys Used

| Key | Entity | Value |
|-----|--------|-------|
| `entity-draft-id-Job-new` | Job | Draft ID (UUID) |
| `entity-draft-init-Job-new` | Job | `'true'` |
| `entity-draft-id-Account-new` | Account | Draft ID (UUID) |
| `entity-draft-init-Account-new` | Account | `'true'` |

---

## Related Research

- Issue file: `thoughts/shared/issues/ISSUE-001-duplicate-job-drafts.md`

## Open Questions

1. Why does the `isCreatingRef` guard not prevent duplicates in the Job wizard?
2. Are there any timing differences in how the debounced callback captures state?
3. Does the mutation wrapper instability cause the debounce callback to be recreated?
4. Is there a difference in how React Strict Mode affects the two implementations?
5. Could the `getDraftQuery` object literal creation trigger re-renders that cascade?
