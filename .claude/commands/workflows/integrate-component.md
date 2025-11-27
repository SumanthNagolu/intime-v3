# Integrate Component Workflow

This workflow guides the migration of a frontend prototype component to use the production tRPC backend.

## Arguments
- `$ARGUMENTS` - Component name (e.g., "RecruiterDashboard", "JobDetail", "PipelineView")

## Workflow Steps

### Step 1: Analyze Current Component

Read the frontend prototype component and identify:

1. **File location**: `frontend-prototype/components/[module]/[ComponentName].tsx`
2. **Data dependencies**: What data does it fetch from useAppStore?
3. **Mutations**: What actions modify data?
4. **UI patterns**: Loading states, error handling, empty states

```bash
# Find the component
find frontend-prototype/components -name "$ARGUMENTS.tsx" -o -name "$ARGUMENTS.tsx"
```

### Step 2: Check API Coverage

Verify the required tRPC procedures exist:

1. Check `src/server/routers/` for the relevant router
2. List all available procedures
3. Identify missing procedures

If procedures are missing, create them following the patterns in `docs/integration/API-DESIGN.md`.

### Step 3: Create/Update Type Adapter

Check if adapter exists in `src/lib/adapters/`:

```typescript
// If not exists, create adapter file
// Follow patterns in docs/integration/TYPE-MAPPING.md
```

### Step 4: Create Query Hooks

Create hooks in `src/hooks/queries/`:

```typescript
// src/hooks/queries/use[Entity].ts

import { trpc } from '@/lib/trpc';

export function use[Entity]List(input?: {
  // input parameters
}) {
  return trpc.[module].[entity].list.useQuery(input);
}

export function use[Entity](id: string) {
  return trpc.[module].[entity].getById.useQuery(
    { id },
    { enabled: !!id }
  );
}
```

### Step 5: Create Mutation Hooks

Create hooks in `src/hooks/mutations/`:

```typescript
// src/hooks/mutations/use[Entity]Actions.ts

import { trpc } from '@/lib/trpc';

export function useCreate[Entity]() {
  const utils = trpc.useUtils();
  return trpc.[module].[entity].create.useMutation({
    onSuccess: () => {
      utils.[module].[entity].list.invalidate();
    },
  });
}

export function useUpdate[Entity]() {
  const utils = trpc.useUtils();
  return trpc.[module].[entity].update.useMutation({
    onSuccess: (data) => {
      utils.[module].[entity].getById.invalidate({ id: data.id });
      utils.[module].[entity].list.invalidate();
    },
  });
}

export function useDelete[Entity]() {
  const utils = trpc.useUtils();
  return trpc.[module].[entity].delete.useMutation({
    onSuccess: () => {
      utils.[module].[entity].list.invalidate();
    },
  });
}
```

### Step 6: Migrate Component

Copy the component from `frontend-prototype/components/` to `src/components/` and update:

1. Replace useAppStore with tRPC hooks
2. Add adapter transformations
3. Add loading skeleton
4. Add error handling
5. Add empty state

```typescript
'use client';

import { use[Entity]List, use[Entity] } from '@/hooks/queries/use[Entity]';
import { useCreate[Entity], useUpdate[Entity], useDelete[Entity] } from '@/hooks/mutations/use[Entity]Actions';
import { db[Entity]ToFrontend } from '@/lib/adapters';
import { Skeleton } from '@/components/ui/skeleton';

export function [ComponentName]() {
  const { data, isLoading, error } = use[Entity]List();

  if (isLoading) return <[ComponentName]Skeleton />;
  if (error) return <ErrorState error={error} />;

  const items = (data?.items || []).map(db[Entity]ToFrontend);

  if (items.length === 0) return <EmptyState />;

  return (
    // Component JSX with real data
  );
}

function [ComponentName]Skeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error loading data</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">No data found</p>
    </div>
  );
}
```

### Step 7: Write Tests

Create test files:

1. **Unit tests** for hooks and adapters
2. **Integration tests** for component
3. **E2E tests** for user flows

```typescript
// tests/e2e/[component].spec.ts

import { test, expect } from '@playwright/test';

test.describe('[ComponentName]', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate
  });

  test('displays data correctly', async ({ page }) => {
    // Test data display
  });

  test('handles loading state', async ({ page }) => {
    // Test loading
  });

  test('handles error state', async ({ page }) => {
    // Test errors
  });

  test('handles empty state', async ({ page }) => {
    // Test empty
  });

  test('performs CRUD operations', async ({ page }) => {
    // Test create, update, delete
  });
});
```

### Step 8: Add Feature Flag

Add migration flag in `src/lib/featureFlags.ts`:

```typescript
export const MIGRATION_FLAGS = {
  // ...existing flags
  [COMPONENT_NAME]_REAL_DATA: false,
};
```

### Step 9: Test and Validate

1. Run unit tests
2. Run integration tests
3. Run E2E tests
4. Manual testing with real data
5. Performance check
6. Enable feature flag

### Step 10: Documentation

Update component documentation:
- Data sources
- API dependencies
- Known issues
- Migration notes

## Checklist

- [ ] Component analyzed
- [ ] API procedures verified/created
- [ ] Type adapter created
- [ ] Query hooks created
- [ ] Mutation hooks created
- [ ] Component migrated
- [ ] Loading state added
- [ ] Error state added
- [ ] Empty state added
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] E2E tests written
- [ ] Feature flag added
- [ ] Tests passing
- [ ] Manual testing done
- [ ] Feature flag enabled
- [ ] Documentation updated

## Common Issues

### Issue: Type mismatch between frontend and database
**Solution**: Check `docs/integration/TYPE-MAPPING.md` for the correct adapter transformation.

### Issue: Missing API procedure
**Solution**: Create the procedure following patterns in `docs/integration/API-DESIGN.md`.

### Issue: Optimistic update not working
**Solution**: Ensure cache invalidation is set up correctly in mutation hooks.

### Issue: Stale data after mutation
**Solution**: Add proper `invalidateQueries` calls in the mutation's `onSuccess` callback.

## Reference Documents

- [GAP-ANALYSIS.md](../docs/integration/GAP-ANALYSIS.md)
- [TYPE-MAPPING.md](../docs/integration/TYPE-MAPPING.md)
- [API-DESIGN.md](../docs/integration/API-DESIGN.md)
- [MIGRATION-PLAYBOOK.md](../docs/integration/MIGRATION-PLAYBOOK.md)
- [SPRINT-PLAN.md](../docs/integration/SPRINT-PLAN.md)
