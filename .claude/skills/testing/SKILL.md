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

### Basic Test
```typescript
import { test, expect } from '@playwright/test';

test('should navigate and interact', async ({ page }) => {
  await page.goto('/auth/employee');
  await page.getByRole('textbox', { name: /email/i }).fill('jr_rec@intime.com');
  await page.getByRole('textbox', { name: /password/i }).fill('TestPass123!');
  await page.getByRole('button', { name: /sign in/i }).click();
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

### Error Handling
1. Mock API failure
2. Trigger action
3. Verify error message
4. Verify graceful degradation
