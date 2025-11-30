# Convert Entity - Step 3: Frontend + E2E Tests

Generate frontend screens and comprehensive E2E tests from the entity configuration.

## Prerequisites
- Entity config must exist: `src/lib/entities/[domain]/[entity].entity.ts`
- Backend must be complete: `src/lib/validations/[entity].ts` and router procedures
- Run `/convert-entity-config` and `/convert-entity-backend` first

## Usage
```
/convert-entity-ui [entity-name]
```

## Examples
```
/convert-entity-ui lead
/convert-entity-ui job
/convert-entity-ui submission
```

---

## What This Command Does

1. Reads entity configuration file
2. Generates list screen definition (metadata)
3. Generates detail screen definition (metadata)
4. **Checks for existing pages** - Reuses existing UI if present
5. Creates page wrapper components (if needed)
6. Updates query/mutation hooks
7. Generates comprehensive E2E tests
8. Runs tests and captures screenshots
9. Creates commit checkpoint

### IMPORTANT: Existing Pages Check

Before creating new pages, ALWAYS check if UI already exists:

```bash
# Check for existing pages
ls src/app/employee/recruiting/[entity]/
ls src/app/employee/[module]/[entity]/

# Check for existing components
ls src/components/recruiting/[Entity]*.tsx
ls src/components/[domain]/[Entity]*.tsx
```

**If pages already exist:**
- Update E2E tests to point to the correct route
- Screen definitions become documentation/reference for metadata-driven rendering
- Do NOT duplicate functionality - reuse existing components

**Outputs:**
- `src/screens/[domain]/[entity]-list.screen.ts`
- `src/screens/[domain]/[entity]-detail.screen.ts`
- `src/app/employee/[module]/[entity]/page.tsx`
- `src/app/employee/[module]/[entity]/[id]/page.tsx`
- `src/hooks/queries/[entity].ts`
- `src/hooks/mutations/[entity].ts`
- `tests/e2e/[domain]/[entity]-complete-flow.spec.ts`

---

## Step 1: Read Entity Configuration

First, read the entity config:

```typescript
// src/lib/entities/[domain]/[entity].entity.ts
```

Extract:
- `ui.list.columns` - List page columns
- `ui.list.filters` - List page filters
- `ui.detail.tabs` - Detail page tabs
- `ui.fieldGroups` - Form field groupings
- `category` - Root or Supporting (affects Activity tab)
- `procedures` - tRPC procedure names

---

## Step 2: Generate List Screen

Create file: `src/screens/[domain]/[entity]-list.screen.ts`

```typescript
import type { ScreenDefinition } from '@/lib/screens/types';

export const [entity]ListScreen: ScreenDefinition = {
  id: '[entity]-list',
  title: '[Entities]',
  type: 'list',

  // Header
  header: {
    title: '[Entities]',
    subtitle: 'Manage your [entities]',
    actions: [
      {
        id: 'create',
        label: 'New [Entity]',
        icon: 'Plus',
        variant: 'default',
        action: { type: 'navigate', path: '/employee/[module]/[entity]/new' },
      },
    ],
  },

  // Data source from entity config procedures
  dataSource: {
    type: 'query',
    query: {
      router: '[domain]',
      procedure: 'list[Entities]',
    },
  },

  // Columns from entity config ui.list.columns
  columns: [
    {
      id: 'name',
      header: 'Name',
      accessor: 'companyName', // or display function
      sortable: true,
      cell: {
        type: 'link',
        href: '/employee/[module]/[entity]/{id}',
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: {
        type: 'badge',
        variants: {
          new: { label: 'New', variant: 'secondary' },
          active: { label: 'Active', variant: 'default' },
          closed: { label: 'Closed', variant: 'outline' },
        },
      },
    },
    {
      id: 'owner',
      header: 'Owner',
      accessor: 'owner.fullName',
      cell: {
        type: 'avatar',
        fallback: 'initials',
      },
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      sortable: true,
      cell: {
        type: 'date',
        format: 'relative',
      },
    },
  ],

  // Filters from entity config ui.list.filters
  filters: [
    {
      id: 'status',
      label: 'Status',
      type: 'multiSelect',
      options: [
        { value: 'new', label: 'New' },
        { value: 'active', label: 'Active' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    {
      id: 'owner',
      label: 'Owner',
      type: 'userSelect',
    },
    {
      id: 'dateRange',
      label: 'Date',
      type: 'dateRange',
    },
  ],

  // Search config from entity config searchFields
  search: {
    placeholder: 'Search [entities]...',
    fields: ['companyName', 'email', 'firstName', 'lastName'],
  },

  // Pagination
  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },

  // Empty state
  emptyState: {
    icon: 'Inbox',
    title: 'No [entities] found',
    description: 'Get started by creating your first [entity].',
    action: {
      label: 'New [Entity]',
      action: { type: 'navigate', path: '/employee/[module]/[entity]/new' },
    },
  },
};
```

---

## Step 3: Generate Detail Screen

Create file: `src/screens/[domain]/[entity]-detail.screen.ts`

```typescript
import type { ScreenDefinition } from '@/lib/screens/types';

export const [entity]DetailScreen: ScreenDefinition = {
  id: '[entity]-detail',
  title: '[Entity] Detail',
  type: 'detail',

  // Data source
  dataSource: {
    type: 'query',
    query: {
      router: '[domain]',
      procedure: 'get[Entity]ById',
      params: { id: '{id}' },
    },
  },

  // Header with entity info and actions
  header: {
    title: '{companyName}',
    subtitle: '{email}',
    badge: {
      field: 'status',
      variants: {
        new: { label: 'New', variant: 'secondary' },
        active: { label: 'Active', variant: 'default' },
        closed: { label: 'Closed', variant: 'outline' },
      },
    },
    actions: [
      {
        id: 'edit',
        label: 'Edit',
        icon: 'Pencil',
        variant: 'outline',
        action: { type: 'modal', modal: 'edit-[entity]' },
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'Trash',
        variant: 'destructive',
        action: {
          type: 'mutation',
          mutation: {
            router: '[domain]',
            procedure: 'delete[Entity]',
          },
          confirm: {
            title: 'Delete [Entity]?',
            description: 'This action cannot be undone.',
          },
          onSuccess: { type: 'navigate', path: '/employee/[module]/[entity]' },
        },
      },
    ],
  },

  // Layout
  layout: {
    type: 'sidebar-right',
    sidebar: {
      width: 320,
      sections: [
        // WORKPLAN PROGRESS (ROOT ENTITIES ONLY)
        // Include this section if entity.category === 'root'
        {
          id: 'workplan-progress',
          type: 'custom',
          component: 'WorkplanProgress',
          props: {
            entityType: '[entity]',
            entityId: '{id}',
          },
        },
        // Quick info
        {
          id: 'quick-info',
          type: 'keyValue',
          title: 'Quick Info',
          fields: [
            { label: 'Owner', field: 'owner.fullName' },
            { label: 'Created', field: 'createdAt', format: 'date' },
            { label: 'Updated', field: 'updatedAt', format: 'relative' },
          ],
        },
      ],
    },
  },

  // Tabs from entity config ui.detail.tabs
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'LayoutDashboard',
      sections: [
        {
          id: 'company-info',
          type: 'fieldGroup',
          title: 'Company Information',
          editable: true,
          fields: [
            { field: 'companyName', label: 'Company Name' },
            { field: 'industry', label: 'Industry' },
            { field: 'website', label: 'Website', type: 'url' },
          ],
        },
        {
          id: 'contact-info',
          type: 'fieldGroup',
          title: 'Contact Information',
          editable: true,
          fields: [
            { field: 'firstName', label: 'First Name' },
            { field: 'lastName', label: 'Last Name' },
            { field: 'email', label: 'Email', type: 'email' },
            { field: 'phone', label: 'Phone', type: 'phone' },
          ],
        },
      ],
    },

    // ACTIVITY TAB (ROOT ENTITIES ONLY)
    // Include this tab if entity.category === 'root'
    {
      id: 'activity',
      label: 'Activity',
      icon: 'Activity',
      sections: [
        {
          id: 'activity-timeline',
          type: 'timeline',
          dataSource: {
            type: 'query',
            query: {
              router: 'activities',
              procedure: 'listByEntity',
              params: {
                entityType: '[entity]',
                entityId: '{id}',
              },
            },
          },
          actions: [
            {
              id: 'log-activity',
              label: 'Log Activity',
              icon: 'Plus',
              action: { type: 'modal', modal: 'log-activity' },
            },
          ],
        },
      ],
    },

    // Additional tabs based on entity type
    // e.g., Qualification, Documents, Related Entities
  ],
};
```

---

## Step 4: Create Page Wrappers

### List Page

Create: `src/app/employee/[module]/[entity]/page.tsx`

```typescript
'use client';

import { ScreenRenderer } from '@/components/screens/ScreenRenderer';
import { [entity]ListScreen } from '@/screens/[domain]/[entity]-list.screen';

export default function [Entity]ListPage() {
  return <ScreenRenderer screen={[entity]ListScreen} />;
}
```

### Detail Page

Create: `src/app/employee/[module]/[entity]/[id]/page.tsx`

```typescript
'use client';

import { use } from 'react';
import { ScreenRenderer } from '@/components/screens/ScreenRenderer';
import { [entity]DetailScreen } from '@/screens/[domain]/[entity]-detail.screen';

export default function [Entity]DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ScreenRenderer screen={[entity]DetailScreen} params={{ id }} />;
}
```

---

## Step 5: Create React Query Hooks

### Query Hooks

Create: `src/hooks/queries/[entity].ts`

```typescript
import { trpc } from '@/lib/trpc';
import type { List[Entities]Input } from '@/lib/validations/[entity]';

export function use[Entity]List(input?: List[Entities]Input) {
  return trpc.[domain].list[Entities].useQuery(input ?? {});
}

export function use[Entity](id: string | undefined) {
  return trpc.[domain].get[Entity]ById.useQuery(
    { id: id! },
    { enabled: !!id }
  );
}

export function use[Entity]Activities(id: string | undefined) {
  return trpc.activities.listByEntity.useQuery(
    { entityType: '[entity]', entityId: id! },
    { enabled: !!id }
  );
}
```

### Mutation Hooks

Create: `src/hooks/mutations/[entity].ts`

```typescript
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function useCreate[Entity]() {
  const utils = trpc.useUtils();

  return trpc.[domain].create[Entity].useMutation({
    onSuccess: () => {
      utils.[domain].list[Entities].invalidate();
      toast.success('[Entity] created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdate[Entity]() {
  const utils = trpc.useUtils();

  return trpc.[domain].update[Entity].useMutation({
    onSuccess: (data) => {
      utils.[domain].get[Entity]ById.invalidate({ id: data.id });
      utils.[domain].list[Entities].invalidate();
      toast.success('[Entity] updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDelete[Entity]() {
  const utils = trpc.useUtils();

  return trpc.[domain].delete[Entity].useMutation({
    onSuccess: () => {
      utils.[domain].list[Entities].invalidate();
      toast.success('[Entity] deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
```

---

## Step 6: Generate E2E Tests

Create: `tests/e2e/[domain]/[entity]-complete-flow.spec.ts`

```typescript
import { test, expect, Page } from '@playwright/test';

// ==========================================
// TEST HELPERS
// ==========================================

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

// ==========================================
// [ENTITY] COMPLETE FLOW TESTS
// ==========================================

test.describe('[Entity] - Complete Flow', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'recruiter');
    await page.goto('/employee/[module]/[entity]');
  });

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================
  test.describe('CRUD Operations', () => {

    test('should display list page with data', async ({ page }) => {
      // Verify page loaded
      await expect(page.locator('[data-testid="page-title"]')).toContainText('[Entities]');

      // Verify table or list exists
      await expect(page.locator('[data-testid="[entity]-list"]')).toBeVisible();

      // Capture screenshot
      await page.screenshot({ path: 'test-results/[entity]-list.png', fullPage: true });
    });

    test('should create [entity] with required fields', async ({ page }) => {
      // Click create button
      await page.click('[data-testid="create-button"]');

      // Fill required fields (from entity config)
      await page.fill('[data-testid="companyName"]', 'Test Company');
      // Add more fields based on entity config required fields

      // Submit
      await page.click('[data-testid="submit"]');

      // Verify success
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();

      // Verify redirected to detail or list
      await expect(page).toHaveURL(/\/employee\/[module]\/[entity]/);
    });

    test('should display [entity] detail page', async ({ page }) => {
      // Click first item in list
      await page.click('[data-testid="[entity]-row"]:first-child');

      // Verify detail page loaded
      await expect(page.locator('[data-testid="[entity]-detail"]')).toBeVisible();

      // Verify key sections
      await expect(page.locator('[data-testid="header"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // Capture screenshot
      await page.screenshot({ path: 'test-results/[entity]-detail.png', fullPage: true });
    });

    test('should update [entity] inline', async ({ page }) => {
      // Navigate to detail
      await page.click('[data-testid="[entity]-row"]:first-child');

      // Click edit
      await page.click('[data-testid="edit-button"]');

      // Modify a field
      const newValue = `Updated ${Date.now()}`;
      await page.fill('[data-testid="companyName"]', newValue);

      // Save
      await page.click('[data-testid="save-button"]');

      // Verify change persisted
      await expect(page.locator('[data-testid="companyName"]')).toContainText(newValue);
    });

    test('should soft delete [entity] with confirmation', async ({ page }) => {
      // Navigate to detail
      await page.click('[data-testid="[entity]-row"]:first-child');

      // Click delete
      await page.click('[data-testid="delete-button"]');

      // Confirm dialog appears
      await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();

      // Confirm deletion
      await page.click('[data-testid="confirm-delete"]');

      // Verify redirect to list
      await expect(page).toHaveURL(/\/employee\/[module]\/[entity]$/);
    });
  });

  // ==========================================
  // LIST OPERATIONS
  // ==========================================
  test.describe('List Operations', () => {

    test('should paginate results', async ({ page }) => {
      // Check pagination exists
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

      // Navigate to page 2 if exists
      const page2Button = page.locator('[data-testid="page-2"]');
      if (await page2Button.isVisible()) {
        await page2Button.click();
        await expect(page.locator('[data-testid="current-page"]')).toHaveText('2');
      }
    });

    test('should filter by status', async ({ page }) => {
      // Open filter
      await page.click('[data-testid="filter-status"]');

      // Select a status
      await page.click('[data-testid="status-new"]');

      // Apply filter
      await page.click('[data-testid="apply-filters"]');

      // Verify results filtered
      const statusCells = page.locator('[data-testid="status-cell"]');
      const count = await statusCells.count();
      for (let i = 0; i < count; i++) {
        await expect(statusCells.nth(i)).toContainText('New');
      }
    });

    test('should sort by column', async ({ page }) => {
      // Click column header
      await page.click('[data-testid="sort-createdAt"]');

      // Verify sort indicator
      await expect(page.locator('[data-testid="sort-indicator"]')).toBeVisible();
    });

    test('should search across fields', async ({ page }) => {
      // Type search term
      await page.fill('[data-testid="search-input"]', 'test');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Verify results contain search term (or empty state)
      // Results should contain 'test' or show empty state
    });

    test('should show empty state when no results', async ({ page }) => {
      // Search for nonexistent term
      await page.fill('[data-testid="search-input"]', 'zzzznonexistent12345');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Verify empty state
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    });
  });

  // ==========================================
  // ACTIVITY TRACKING (ROOT ENTITIES ONLY)
  // Include this section if entity.category === 'root'
  // ==========================================
  test.describe('Activity Tracking', () => {

    test('should display workplan progress on detail page', async ({ page }) => {
      // Navigate to detail
      await page.click('[data-testid="[entity]-row"]:first-child');

      // Verify workplan progress visible in sidebar
      await expect(page.locator('[data-testid="workplan-progress"]')).toBeVisible();
    });

    test('should display activity timeline', async ({ page }) => {
      // Navigate to detail
      await page.click('[data-testid="[entity]-row"]:first-child');

      // Click activity tab
      await page.click('[data-testid="tab-activity"]');

      // Verify timeline visible
      await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible();

      // Capture screenshot
      await page.screenshot({ path: 'test-results/[entity]-activity-tab.png', fullPage: true });
    });

    test('should log manual activity', async ({ page }) => {
      // Navigate to detail
      await page.click('[data-testid="[entity]-row"]:first-child');

      // Click activity tab
      await page.click('[data-testid="tab-activity"]');

      // Click log activity
      await page.click('[data-testid="log-activity"]');

      // Fill activity form
      await page.fill('[data-testid="activity-subject"]', 'Test Activity');
      await page.selectOption('[data-testid="activity-type"]', 'note');
      await page.fill('[data-testid="activity-notes"]', 'Test notes');

      // Save
      await page.click('[data-testid="save-activity"]');

      // Verify activity appears in timeline
      await expect(page.locator('[data-testid="activity-timeline"]')).toContainText('Test Activity');
    });

    test('should complete workplan activity', async ({ page }) => {
      // Navigate to detail
      await page.click('[data-testid="[entity]-row"]:first-child');

      // Click activity tab
      await page.click('[data-testid="tab-activity"]');

      // Find open activity
      const openActivity = page.locator('[data-testid="activity-item"][data-status="open"]').first();

      if (await openActivity.isVisible()) {
        await openActivity.click();

        // Complete it
        await page.click('[data-testid="complete-activity"]');
        await page.fill('[data-testid="outcome-notes"]', 'Completed in test');
        await page.click('[data-testid="confirm-complete"]');

        // Verify status changed
        await expect(openActivity.locator('[data-testid="activity-status"]')).toContainText('Completed');
      }
    });
  });

  // ==========================================
  // ERROR HANDLING
  // ==========================================
  test.describe('Error Handling', () => {

    test('should display validation errors on create', async ({ page }) => {
      // Click create
      await page.click('[data-testid="create-button"]');

      // Submit empty form
      await page.click('[data-testid="submit"]');

      // Verify validation error
      await expect(page.locator('[data-testid="error-companyName"]')).toBeVisible();
    });

    test('should handle not found gracefully', async ({ page }) => {
      // Navigate to nonexistent ID
      await page.goto('/employee/[module]/[entity]/00000000-0000-0000-0000-000000000000');

      // Verify not found state
      await expect(page.locator('[data-testid="not-found"]')).toBeVisible();
    });
  });

  // ==========================================
  // VISUAL VERIFICATION
  // ==========================================
  test.describe('Visual Verification', () => {

    test('capture all states', async ({ page }) => {
      // List view
      await page.screenshot({ path: 'test-results/[entity]-list.png', fullPage: true });

      // Detail view
      await page.click('[data-testid="[entity]-row"]:first-child');
      await page.screenshot({ path: 'test-results/[entity]-detail.png', fullPage: true });

      // Each tab (based on entity config)
      const tabs = ['overview', 'activity'];
      for (const tab of tabs) {
        const tabButton = page.locator(`[data-testid="tab-${tab}"]`);
        if (await tabButton.isVisible()) {
          await tabButton.click();
          await page.screenshot({ path: `test-results/[entity]-tab-${tab}.png`, fullPage: true });
        }
      }

      // Edit mode
      await page.click('[data-testid="edit-button"]');
      await page.screenshot({ path: 'test-results/[entity]-edit-mode.png', fullPage: true });

      // Create form
      await page.goto('/employee/[module]/[entity]');
      await page.click('[data-testid="create-button"]');
      await page.screenshot({ path: 'test-results/[entity]-create-form.png', fullPage: true });
    });
  });
});
```

---

## Step 7: Run Tests

Execute tests and capture results:

```bash
# Run the specific E2E test file
pnpm exec playwright test tests/e2e/[domain]/[entity]-complete-flow.spec.ts --reporter=html

# View report
pnpm exec playwright show-report
```

### Expected Test Results

All tests should pass:
- [ ] List page displays data
- [ ] Create with required fields works
- [ ] Detail page displays correctly
- [ ] Update works
- [ ] Delete works with confirmation
- [ ] Pagination works
- [ ] Filters work
- [ ] Sort works
- [ ] Search works
- [ ] Empty state displays
- [ ] Workplan progress visible (root entities)
- [ ] Activity timeline displays (root entities)
- [ ] Manual activity logging works (root entities)
- [ ] Validation errors display
- [ ] Not found handled
- [ ] All screenshots captured

---

## Step 8: Verify & Clean Up

### Verification Checklist

**Screens:**
- [ ] List screen renders correctly
- [ ] Detail screen renders correctly
- [ ] All tabs accessible
- [ ] Sidebar displays correctly
- [ ] Actions work (edit, delete)

**Data Flow:**
- [ ] List loads data from tRPC
- [ ] Detail loads data from tRPC
- [ ] Create mutation works
- [ ] Update mutation works
- [ ] Delete mutation works
- [ ] Cache invalidation correct

**Activity (Root Entities):**
- [ ] Workplan progress shows in sidebar
- [ ] Activity timeline loads
- [ ] Can log manual activity
- [ ] Can complete activity

**E2E Tests:**
- [ ] All tests passing
- [ ] Screenshots captured
- [ ] No flaky tests

---

## Step 9: Commit Checkpoint

```bash
git add src/screens/[domain]/[entity]-*.screen.ts
git add src/app/employee/[module]/[entity]/
git add src/hooks/queries/[entity].ts
git add src/hooks/mutations/[entity].ts
git add tests/e2e/[domain]/[entity]-complete-flow.spec.ts
git add test-results/[entity]-*.png

git commit -m "feat([domain]): add [entity] frontend + E2E tests

- Add list screen with filters and pagination
- Add detail screen with tabs and sidebar
- Create page wrappers
- Add query and mutation hooks
- Add comprehensive E2E test suite
- All tests passing with screenshots

🤖 Generated with Claude Code"
```

---

## Full Conversion Complete!

After all three steps:

```bash
/convert-entity-config [entity]   # ✅ Entity config created
/convert-entity-backend [entity]  # ✅ Backend implemented
/convert-entity-ui [entity]       # ✅ Frontend + tests complete
```

The entity is now fully converted with:
- Entity configuration (single source of truth)
- Zod validation schemas
- tRPC CRUD procedures
- Workplan integration (root entities)
- List and detail screens
- Query and mutation hooks
- Comprehensive E2E tests
- Visual verification screenshots

---

## Troubleshooting

### Screen Not Rendering
- Check ScreenRenderer import
- Verify screen definition syntax
- Check page wrapper exports

### Tests Failing
- Run `pnpm dev` first
- Check test selectors match `data-testid`
- Verify test user credentials
- Check database has seed data

### Activity Tab Not Showing
- Verify entity.category === 'root'
- Check activities router exists
- Verify workplan template exists

### Hooks Not Working
- Check tRPC router registration
- Verify procedure names match
- Check import paths
