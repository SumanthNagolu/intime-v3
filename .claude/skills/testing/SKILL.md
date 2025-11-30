---
name: testing
description: Testing patterns for InTime v3 - Vitest unit tests and Playwright E2E
---

# Testing Skill

## Test Structure
```
tests/
├── unit/           # Vitest unit tests
├── integration/    # Integration tests
└── e2e/            # Playwright E2E tests
    └── auth-workflows.spec.ts
```

## Test Users (password: TestPass123!)

| Role | Email | Dashboard |
|------|-------|-----------|
| CEO/Super Admin | ceo@intime.com | /employee/ceo/dashboard |
| Admin | admin@intime.com | /employee/admin/dashboard |
| HR Manager | hr_admin@intime.com | /employee/hr/dashboard |
| Recruiter | jr_rec@intime.com | /employee/recruiting/dashboard |
| Bench Sales | jr_bs@intime.com | /employee/bench/dashboard |
| TA/Sales | jr_ta@intime.com | /employee/ta/dashboard |
| Trainer | trainer@intime.com | /employee/portal |
| Student | student@intime.com | /academy/dashboard |

## Vitest Patterns

### Basic Test
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Feature', () => {
  it('should do something', () => {
    const result = functionUnderTest(input);
    expect(result).toEqual(expected);
  });
});
```

### With Mocks
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call dependency', async () => {
    const mockDep = vi.fn().mockResolvedValue({ data: 'test' });
    vi.mock('@/lib/dep', () => ({ dep: mockDep }));

    await serviceUnderTest();
    expect(mockDep).toHaveBeenCalledWith(expectedArg);
  });
});
```

### Testing tRPC Procedures
```typescript
import { describe, it, expect } from 'vitest';
import { createCallerFactory } from '@/server/trpc/trpc';
import { appRouter } from '@/server/trpc/root';

const createCaller = createCallerFactory(appRouter);

describe('ats.jobs', () => {
  it('should list jobs', async () => {
    const caller = createCaller({
      userId: 'test-user-id',
      orgId: 'test-org-id',
    });

    const jobs = await caller.ats.jobs.list({});
    expect(jobs).toBeInstanceOf(Array);
  });
});
```

## Playwright E2E Patterns

### Login Helper (Use in All Tests)
```typescript
// tests/e2e/helpers.ts
import { Page } from '@playwright/test';

export async function loginAs(
  page: Page,
  role: 'recruiter' | 'admin' | 'manager' | 'ceo'
) {
  const credentials = {
    recruiter: { email: 'jr_rec@intime.com', password: 'TestPass123!' },
    admin: { email: 'admin@intime.com', password: 'TestPass123!' },
    manager: { email: 'hr_admin@intime.com', password: 'TestPass123!' },
    ceo: { email: 'ceo@intime.com', password: 'TestPass123!' },
  };

  await page.goto('/auth/employee');
  await page.fill('[data-testid="email"]', credentials[role].email);
  await page.fill('[data-testid="password"]', credentials[role].password);
  await page.click('[data-testid="submit"]');
  await page.waitForURL(/\/employee\//);
}
```

### Basic Test
```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test('should navigate and interact', async ({ page }) => {
  await loginAs(page, 'recruiter');
  await expect(page.getByText('Dashboard')).toBeVisible();
});
```

### With Authentication Fixture
```typescript
import { test as base, expect } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: Page;
};

const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/auth/employee');
    await page.getByRole('textbox', { name: /email/i }).fill('jr_rec@intime.com');
    await page.getByRole('textbox', { name: /password/i }).fill('TestPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/dashboard');
    await use(page);
  },
});

test('should show recruiter dashboard', async ({ authenticatedPage }) => {
  await expect(authenticatedPage.getByText('Pipeline')).toBeVisible();
});
```

### Testing Forms
```typescript
test('should create a job', async ({ page }) => {
  // Navigate to job creation
  await page.goto('/employee/recruiting/jobs/new');

  // Fill form
  await page.getByLabel('Job Title').fill('Senior Developer');
  await page.getByLabel('Description').fill('We are looking for...');
  await page.getByRole('combobox', { name: /account/i }).click();
  await page.getByRole('option', { name: /acme corp/i }).click();

  // Submit
  await page.getByRole('button', { name: /create job/i }).click();

  // Verify
  await expect(page.getByText('Job created successfully')).toBeVisible();
});
```

### API Mocking
```typescript
test('should handle API errors gracefully', async ({ page }) => {
  await page.route('**/api/trpc/ats.jobs.list*', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    });
  });

  await page.goto('/employee/recruiting/jobs');
  await expect(page.getByText(/error loading/i)).toBeVisible();
});
```

## Test Commands

```bash
# Unit tests
pnpm vitest                    # Run all
pnpm vitest watch              # Watch mode
pnpm vitest run --coverage     # With coverage

# E2E tests
pnpm playwright test                      # Run all
pnpm playwright test tests/e2e/auth.spec.ts  # Single file
pnpm playwright test --headed             # With browser
pnpm playwright test --debug              # Debug mode
pnpm playwright test --ui                 # UI mode

# Specific test
pnpm playwright test -g "should create job"
```

## Playwright Config (playwright.config.ts)
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## MCP Tools for Testing (when in testing mode)

```bash
# Switch to testing mode first
npm run claude:testing
```

Then use Playwright MCP tools:
- `mcp__playwright__browser_navigate` - Navigate to URL
- `mcp__playwright__browser_click` - Click element
- `mcp__playwright__browser_fill_form` - Fill form fields
- `mcp__playwright__browser_snapshot` - Get accessibility tree
- `mcp__playwright__browser_take_screenshot` - Capture screenshot
- `mcp__playwright__browser_console_messages` - View console

## Complete Entity E2E Test Pattern

For each entity, create: `tests/e2e/[domain]/[entity]-complete-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers';

test.describe('[Entity] - Complete Flow', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'recruiter');
    await page.goto('/employee/[module]/[entity]');
  });

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================
  test.describe('CRUD Operations', () => {
    test('should display list with data', async ({ page }) => {
      await expect(page.locator('[data-testid="[entity]-list"]')).toBeVisible();
      await page.screenshot({ path: 'test-results/[entity]-list.png' });
    });

    test('should create [entity]', async ({ page }) => {
      await page.click('[data-testid="create-button"]');
      await page.fill('[data-testid="name"]', 'Test Entity');
      await page.click('[data-testid="submit"]');
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    });

    test('should update [entity]', async ({ page }) => {
      await page.click('[data-testid="[entity]-row"]:first-child');
      await page.click('[data-testid="edit-button"]');
      await page.fill('[data-testid="name"]', 'Updated Name');
      await page.click('[data-testid="save-button"]');
      await expect(page.locator('[data-testid="name"]')).toContainText('Updated');
    });

    test('should delete [entity]', async ({ page }) => {
      await page.click('[data-testid="[entity]-row"]:first-child');
      await page.click('[data-testid="delete-button"]');
      await page.click('[data-testid="confirm-delete"]');
      await expect(page).toHaveURL(/\/[entity]$/);
    });
  });

  // ==========================================
  // LIST OPERATIONS
  // ==========================================
  test.describe('List Operations', () => {
    test('should paginate', async ({ page }) => {
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    });

    test('should filter by status', async ({ page }) => {
      await page.click('[data-testid="filter-status"]');
      await page.click('[data-testid="status-active"]');
      await page.click('[data-testid="apply-filters"]');
    });

    test('should search', async ({ page }) => {
      await page.fill('[data-testid="search-input"]', 'test');
      await page.press('[data-testid="search-input"]', 'Enter');
    });
  });

  // ==========================================
  // ACTIVITY TRACKING (ROOT ENTITIES ONLY)
  // ==========================================
  test.describe('Activity Tracking', () => {
    test('should show workplan progress', async ({ page }) => {
      await page.click('[data-testid="[entity]-row"]:first-child');
      await expect(page.locator('[data-testid="workplan-progress"]')).toBeVisible();
    });

    test('should display activity timeline', async ({ page }) => {
      await page.click('[data-testid="[entity]-row"]:first-child');
      await page.click('[data-testid="tab-activity"]');
      await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible();
    });

    test('should log manual activity', async ({ page }) => {
      await page.click('[data-testid="[entity]-row"]:first-child');
      await page.click('[data-testid="log-activity"]');
      await page.fill('[data-testid="activity-subject"]', 'Test Activity');
      await page.click('[data-testid="save-activity"]');
      await expect(page.locator('[data-testid="activity-timeline"]'))
        .toContainText('Test Activity');
    });

    test('should complete workplan activity', async ({ page }) => {
      await page.click('[data-testid="[entity]-row"]:first-child');
      await page.click('[data-testid="tab-activity"]');
      const openActivity = page.locator('[data-testid="activity-item"][data-status="open"]').first();
      if (await openActivity.isVisible()) {
        await openActivity.click();
        await page.click('[data-testid="complete-activity"]');
        await page.fill('[data-testid="outcome-notes"]', 'Completed');
        await page.click('[data-testid="confirm-complete"]');
      }
    });
  });

  // ==========================================
  // VISUAL VERIFICATION
  // ==========================================
  test.describe('Screenshots', () => {
    test('capture all states', async ({ page }) => {
      // List
      await page.screenshot({ path: 'test-results/[entity]-list.png' });

      // Detail
      await page.click('[data-testid="[entity]-row"]:first-child');
      await page.screenshot({ path: 'test-results/[entity]-detail.png' });

      // Activity tab
      await page.click('[data-testid="tab-activity"]');
      await page.screenshot({ path: 'test-results/[entity]-activity.png' });
    });
  });
});
```

## Entity Test Categories

| Category | Entities | Test Activity/Workplan? |
|----------|----------|------------------------|
| **Root** | lead, job, submission, deal, placement | Yes - full workplan tests |
| **Supporting** | account, contact, candidate, interview, offer | No - skip activity section |

## Common Test Scenarios

### Auth Flow
1. Navigate to auth page
2. Fill credentials
3. Submit form
4. Verify redirect to dashboard

### CRUD Operations
1. Navigate to list view
2. Click create button
3. Fill form
4. Submit
5. Verify in list
6. Click item
7. Edit
8. Delete

### Activity/Workplan (Root Entities)
1. Create entity
2. Verify workplan created
3. Check activity timeline
4. Complete an activity
5. Log manual activity
6. Verify successor activities trigger

### Error Handling
1. Mock API failure
2. Trigger action
3. Verify error message
4. Verify graceful degradation
