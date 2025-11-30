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

### Step 7: Write Comprehensive E2E Tests

Create test file: `tests/e2e/[module]/[component].spec.ts`

```typescript
import { test, expect } from '@playwright/test';

// Test helpers (create in tests/e2e/helpers.ts)
async function loginAs(page: Page, role: 'recruiter' | 'admin' | 'manager') {
  const credentials = {
    recruiter: { email: 'jr_rec@intime.com', password: 'TestPass123!' },
    admin: { email: 'admin@intime.com', password: 'TestPass123!' },
    manager: { email: 'manager@intime.com', password: 'TestPass123!' },
  };

  await page.goto('/auth/employee');
  await page.fill('[data-testid="email"]', credentials[role].email);
  await page.fill('[data-testid="password"]', credentials[role].password);
  await page.click('[data-testid="submit"]');
  await page.waitForURL(/\/employee\//);
}

test.describe('[ComponentName] - Complete Flow', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'recruiter');
    await page.goto('/employee/[path]');
  });

  // ============================================
  // CRUD Operations
  // ============================================
  test.describe('CRUD Operations', () => {
    test('should create [entity] with all fields', async ({ page }) => {
      await page.click('[data-testid="create-button"]');

      // Fill required fields
      await page.fill('[data-testid="name"]', 'Test Entity');
      await page.selectOption('[data-testid="status"]', 'active');
      // ... more fields

      await page.click('[data-testid="submit"]');

      // Verify success
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
      await expect(page).toHaveURL(/\/employee\/.*\/[\w-]+$/);
    });

    test('should display [entity] details correctly', async ({ page }) => {
      await page.goto('/employee/[path]/[test-id]');

      // Verify all sections
      await expect(page.locator('[data-testid="header"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });

    test('should update [entity] inline', async ({ page }) => {
      await page.goto('/employee/[path]/[test-id]');
      await page.click('[data-testid="edit-button"]');

      // Modify field
      await page.fill('[data-testid="name"]', 'Updated Name');
      await page.click('[data-testid="save-button"]');

      // Verify change persisted
      await expect(page.locator('[data-testid="name"]')).toContainText('Updated Name');
    });

    test('should delete [entity] with confirmation', async ({ page }) => {
      await page.goto('/employee/[path]/[test-id]');
      await page.click('[data-testid="delete-button"]');

      // Confirm dialog
      await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
      await page.click('[data-testid="confirm-delete"]');

      // Verify redirect to list
      await expect(page).toHaveURL(/\/employee\/[path]$/);
    });
  });

  // ============================================
  // List Operations
  // ============================================
  test.describe('List Operations', () => {
    test('should display paginated results', async ({ page }) => {
      await expect(page.locator('[data-testid="entity-row"]')).toHaveCount.greaterThan(0);
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

      // Navigate to page 2
      await page.click('[data-testid="page-2"]');
      await expect(page.locator('[data-testid="current-page"]')).toHaveText('2');
    });

    test('should filter by status', async ({ page }) => {
      await page.click('[data-testid="filter-status"]');
      await page.click('[data-testid="status-active"]');
      await page.click('[data-testid="apply-filters"]');

      // Verify all visible items have status 'active'
      const statusCells = page.locator('[data-testid="status-cell"]');
      const count = await statusCells.count();
      for (let i = 0; i < count; i++) {
        await expect(statusCells.nth(i)).toContainText('Active');
      }
    });

    test('should sort by column', async ({ page }) => {
      // Click column header to sort
      await page.click('[data-testid="sort-createdAt"]');

      // Verify sort indicator
      await expect(page.locator('[data-testid="sort-indicator-desc"]')).toBeVisible();

      // Click again for ascending
      await page.click('[data-testid="sort-createdAt"]');
      await expect(page.locator('[data-testid="sort-indicator-asc"]')).toBeVisible();
    });

    test('should search across fields', async ({ page }) => {
      await page.fill('[data-testid="search-input"]', 'test search term');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Verify results contain search term
      await expect(page.locator('[data-testid="entity-row"]')).toContainText('test');
    });
  });

  // ============================================
  // Activity Tracking (Root Entities Only)
  // ============================================
  test.describe('Activity Tracking', () => {
    test('should create workplan on entity creation', async ({ page }) => {
      // Create new entity
      await page.click('[data-testid="create-button"]');
      await page.fill('[data-testid="name"]', 'Workplan Test');
      await page.click('[data-testid="submit"]');

      // Verify workplan created
      await expect(page.locator('[data-testid="workplan-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="workplan-progress"]')).not.toHaveText('0%');
    });

    test('should display activities in timeline', async ({ page }) => {
      await page.goto('/employee/[path]/[test-id]');
      await page.click('[data-testid="tab-activity"]');

      await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-item"]')).toHaveCount.greaterThan(0);
    });

    test('should complete workplan activity', async ({ page }) => {
      await page.goto('/employee/[path]/[test-id]');
      await page.click('[data-testid="tab-activity"]');

      // Find open activity
      const openActivity = page.locator('[data-testid="activity-item"][data-status="open"]').first();
      await openActivity.click();

      // Complete it
      await page.click('[data-testid="complete-activity"]');
      await page.fill('[data-testid="outcome-notes"]', 'Completed successfully');
      await page.click('[data-testid="confirm-complete"]');

      // Verify status changed
      await expect(openActivity.locator('[data-testid="activity-status"]')).toContainText('Completed');
    });

    test('should log manual activity', async ({ page }) => {
      await page.goto('/employee/[path]/[test-id]');

      await page.click('[data-testid="log-activity"]');
      await page.fill('[data-testid="activity-subject"]', 'Manual test activity');
      await page.selectOption('[data-testid="activity-type"]', 'note');
      await page.fill('[data-testid="activity-notes"]', 'Test notes for activity');
      await page.click('[data-testid="save-activity"]');

      // Verify activity appears in timeline
      await page.click('[data-testid="tab-activity"]');
      await expect(page.locator('[data-testid="activity-timeline"]')).toContainText('Manual test activity');
    });
  });

  // ============================================
  // Error Handling
  // ============================================
  test.describe('Error Handling', () => {
    test('should display validation errors', async ({ page }) => {
      await page.click('[data-testid="create-button"]');
      await page.click('[data-testid="submit"]'); // Submit empty form

      await expect(page.locator('[data-testid="error-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-name"]')).toContainText('required');
    });

    test('should handle not found gracefully', async ({ page }) => {
      await page.goto('/employee/[path]/non-existent-id');

      await expect(page.locator('[data-testid="not-found"]')).toBeVisible();
    });

    test('should handle empty state', async ({ page }) => {
      // Apply filter that returns no results
      await page.fill('[data-testid="search-input"]', 'zzzznonexistent');
      await page.press('[data-testid="search-input"]', 'Enter');

      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    });
  });

  // ============================================
  // Screenshots
  // ============================================
  test.describe('Visual Verification', () => {
    test('capture all states', async ({ page }) => {
      // List view
      await page.screenshot({ path: 'test-results/[component]-list.png', fullPage: true });

      // Detail view
      await page.goto('/employee/[path]/[test-id]');
      await page.screenshot({ path: 'test-results/[component]-detail.png', fullPage: true });

      // Each tab
      const tabs = ['overview', 'activity', 'documents'];
      for (const tab of tabs) {
        await page.click(`[data-testid="tab-${tab}"]`);
        await page.screenshot({ path: `test-results/[component]-tab-${tab}.png`, fullPage: true });
      }

      // Edit mode
      await page.click('[data-testid="edit-button"]');
      await page.screenshot({ path: 'test-results/[component]-edit-mode.png', fullPage: true });

      // Create form
      await page.goto('/employee/[path]/new');
      await page.screenshot({ path: 'test-results/[component]-create-form.png', fullPage: true });
    });
  });
});
```

### Testing Checklist

**CRUD Operations:**
- [ ] Create with all fields
- [ ] Create with minimal fields
- [ ] Display details correctly
- [ ] Update inline
- [ ] Update via modal
- [ ] Delete with confirmation

**List Operations:**
- [ ] Pagination works
- [ ] Filtering works
- [ ] Sorting works
- [ ] Search works
- [ ] Empty state displayed

**Activity Tracking (Root Entities):**
- [ ] Workplan created on entity creation
- [ ] Activities display in timeline
- [ ] Can complete workplan activity
- [ ] Can log manual activity
- [ ] Successor activities triggered

**Error Handling:**
- [ ] Validation errors displayed
- [ ] Not found handled
- [ ] Empty state handled

**Visual Verification:**
- [ ] Screenshots captured
- [ ] All states documented

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
