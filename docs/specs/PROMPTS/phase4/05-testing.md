# PROMPT: COMPREHENSIVE-TESTING (Window 7-8)

Copy everything below the line and paste into Claude Code CLI:

---

Use the testing skill.

Create comprehensive tests for InTime v3 to ensure all screens, flows, and systems work correctly.

## Read First:
- src/screens/**/*.ts (All screen definitions)
- src/server/routers/*.ts (All routers)
- src/lib/activities/*.ts (Activity system)
- src/lib/events/*.ts (Event system)
- tests/ (Existing tests)

## Test Users (password: TestPass123!):
- admin@intime.com (Admin)
- hr@intime.com (HR Manager)
- rec_mgr1@intime.com (Recruiting Manager)
- rec1@intime.com (Recruiter)
- bs_mgr1@intime.com (Bench Sales Manager)
- bs1@intime.com (Bench Sales)

---

## WINDOW 7: Unit & Integration Tests

### Task 1: Screen Definition Tests

Create `tests/unit/screens/screen-validation.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { glob } from 'glob';
import * as path from 'path';

describe('Screen Definitions', () => {
  let screenFiles: string[];

  beforeAll(async () => {
    screenFiles = await glob('src/screens/**/*.screen.ts');
  });

  it('all screen files export valid definitions', async () => {
    for (const file of screenFiles) {
      const screenModule = await import(path.resolve(file));
      const exportedScreen = Object.values(screenModule)[0] as any;

      expect(exportedScreen).toBeDefined();
      expect(exportedScreen.id).toBeDefined();
      expect(exportedScreen.type).toBeDefined();
      expect(['list', 'detail', 'form', 'dashboard', 'wizard']).toContain(
        exportedScreen.type
      );
    }
  });

  it('screen IDs are unique', async () => {
    const ids: string[] = [];
    for (const file of screenFiles) {
      const screenModule = await import(path.resolve(file));
      const exportedScreen = Object.values(screenModule)[0] as any;
      if (exportedScreen?.id) {
        expect(ids).not.toContain(exportedScreen.id);
        ids.push(exportedScreen.id);
      }
    }
  });

  it('list screens have required table config', async () => {
    for (const file of screenFiles) {
      const screenModule = await import(path.resolve(file));
      const screen = Object.values(screenModule)[0] as any;

      if (screen?.type === 'list') {
        expect(screen.table || screen.layout?.sections).toBeDefined();
      }
    }
  });

  it('detail screens have required layout', async () => {
    for (const file of screenFiles) {
      const screenModule = await import(path.resolve(file));
      const screen = Object.values(screenModule)[0] as any;

      if (screen?.type === 'detail') {
        expect(screen.layout).toBeDefined();
      }
    }
  });

  it('form screens have required fields', async () => {
    for (const file of screenFiles) {
      const screenModule = await import(path.resolve(file));
      const screen = Object.values(screenModule)[0] as any;

      if (screen?.type === 'form') {
        expect(screen.fields || screen.sections).toBeDefined();
      }
    }
  });
});
```

### Task 2: Activity System Tests

Create `tests/unit/activities/PatternService.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatternService } from '@/lib/activities/PatternService';

describe('PatternService', () => {
  let service: PatternService;

  beforeEach(() => {
    service = new PatternService();
  });

  describe('getPattern', () => {
    it('returns static pattern by code', async () => {
      const pattern = await service.getPattern('REVIEW_SUBMISSION');
      expect(pattern).toBeDefined();
      expect(pattern?.code).toBe('REVIEW_SUBMISSION');
    });

    it('returns undefined for unknown pattern', async () => {
      const pattern = await service.getPattern('UNKNOWN_PATTERN');
      expect(pattern).toBeUndefined();
    });
  });

  describe('getByCategory', () => {
    it('returns patterns in category', async () => {
      const patterns = await service.getByCategory('recruiting');
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach((p) => {
        expect(p.category).toBe('recruiting');
      });
    });
  });

  describe('instantiate', () => {
    it('creates activity data from pattern', async () => {
      const data = await service.instantiate(
        'REVIEW_SUBMISSION',
        'submission',
        'sub-123',
        { assignedTo: 'user-123' }
      );

      expect(data.patternCode).toBe('REVIEW_SUBMISSION');
      expect(data.relatedEntityType).toBe('submission');
      expect(data.relatedEntityId).toBe('sub-123');
      expect(data.assignedTo).toBe('user-123');
      expect(data.dueAt).toBeDefined();
    });

    it('applies overrides', async () => {
      const customDue = new Date('2025-12-31');
      const data = await service.instantiate(
        'REVIEW_SUBMISSION',
        'submission',
        'sub-123',
        {
          subject: 'Custom Subject',
          priority: 'critical',
          dueAt: customDue,
        }
      );

      expect(data.subject).toBe('Custom Subject');
      expect(data.priority).toBe('critical');
      expect(data.dueAt).toEqual(customDue);
    });
  });

  describe('validateFields', () => {
    it('validates required fields', () => {
      const pattern = {
        fields: [
          { name: 'outcome', label: 'Outcome', type: 'text', required: true },
        ],
      };

      const result = service.validateFields(pattern as any, {});
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('outcome');
    });

    it('validates field types', () => {
      const pattern = {
        fields: [
          { name: 'amount', label: 'Amount', type: 'number', required: false },
        ],
      };

      const result = service.validateFields(pattern as any, { amount: 'not a number' });
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be a number');
    });

    it('passes valid data', () => {
      const pattern = {
        fields: [
          { name: 'outcome', label: 'Outcome', type: 'text', required: true },
          { name: 'amount', label: 'Amount', type: 'number', required: false },
        ],
      };

      const result = service.validateFields(pattern as any, {
        outcome: 'Approved',
        amount: 5000,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
```

Create `tests/unit/activities/QueueManager.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueueManager } from '@/lib/activities/QueueManager';

describe('QueueManager', () => {
  let manager: QueueManager;

  beforeEach(() => {
    manager = new QueueManager();
  });

  describe('calculatePriorityScore', () => {
    it('scores critical priority highest', () => {
      const critical = manager.calculatePriorityScore({
        priority: 'critical',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        slaStatus: 'ok',
      });

      const low = manager.calculatePriorityScore({
        priority: 'low',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        slaStatus: 'ok',
      });

      expect(critical).toBeGreaterThan(low);
    });

    it('scores breached SLA highest', () => {
      const breached = manager.calculatePriorityScore({
        priority: 'medium',
        dueAt: new Date(Date.now() - 1000),
        slaStatus: 'breached',
      });

      const ok = manager.calculatePriorityScore({
        priority: 'medium',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        slaStatus: 'ok',
      });

      expect(breached).toBeGreaterThan(ok);
    });

    it('scores overdue activities higher', () => {
      const overdue = manager.calculatePriorityScore({
        priority: 'medium',
        dueAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        slaStatus: 'breached',
      });

      const dueSoon = manager.calculatePriorityScore({
        priority: 'medium',
        dueAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        slaStatus: 'warning',
      });

      expect(overdue).toBeGreaterThan(dueSoon);
    });

    it('caps score at 100', () => {
      const maxScore = manager.calculatePriorityScore({
        priority: 'critical',
        dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        slaStatus: 'breached',
      });

      expect(maxScore).toBeLessThanOrEqual(100);
    });
  });

  describe('sortByPriority', () => {
    it('sorts activities by priority score descending', () => {
      const activities = [
        { id: '1', priorityScore: 50 },
        { id: '2', priorityScore: 80 },
        { id: '3', priorityScore: 30 },
      ];

      const sorted = manager.sortByPriority(activities);

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('3');
    });
  });
});
```

Create `tests/unit/activities/SLAEngine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateSLAStatus, getSLAThresholds } from '@/lib/activities/sla';

describe('SLA Engine', () => {
  describe('calculateSLAStatus', () => {
    it('returns ok when within target', () => {
      const activity = {
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: new Date(),
      };

      const status = calculateSLAStatus(activity as any);
      expect(status).toBe('ok');
    });

    it('returns warning at 75% of time', () => {
      const now = Date.now();
      const activity = {
        dueAt: new Date(now + 2 * 60 * 60 * 1000), // 2 hours from now
        createdAt: new Date(now - 6 * 60 * 60 * 1000), // Created 6 hours ago
      };

      const status = calculateSLAStatus(activity as any);
      expect(status).toBe('warning');
    });

    it('returns critical at 90% of time', () => {
      const now = Date.now();
      const activity = {
        dueAt: new Date(now + 30 * 60 * 1000), // 30 minutes from now
        createdAt: new Date(now - 8 * 60 * 60 * 1000), // Created 8 hours ago
      };

      const status = calculateSLAStatus(activity as any);
      expect(status).toBe('critical');
    });

    it('returns breached after target', () => {
      const activity = {
        dueAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };

      const status = calculateSLAStatus(activity as any);
      expect(status).toBe('breached');
    });
  });

  describe('getSLAThresholds', () => {
    it('returns correct threshold times', () => {
      const createdAt = new Date('2025-01-01T00:00:00Z');
      const dueAt = new Date('2025-01-01T08:00:00Z'); // 8 hours later

      const thresholds = getSLAThresholds(createdAt, dueAt);

      expect(thresholds.warningAt.getTime()).toBe(
        new Date('2025-01-01T06:00:00Z').getTime() // 75% = 6 hours
      );
      expect(thresholds.criticalAt.getTime()).toBe(
        new Date('2025-01-01T07:12:00Z').getTime() // 90% = 7.2 hours
      );
    });
  });
});
```

### Task 3: Event System Tests

Create `tests/unit/events/SubscriptionService.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubscriptionService } from '@/lib/events/SubscriptionService';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    service = new SubscriptionService();
  });

  describe('matchesPattern', () => {
    it('matches exact event type', () => {
      const matches = service['matchesPattern']('submission.created', 'submission.created');
      expect(matches).toBe(true);
    });

    it('matches wildcard pattern', () => {
      const matches = service['matchesPattern']('submission.created', 'submission.*');
      expect(matches).toBe(true);
    });

    it('matches all events with *', () => {
      const matches = service['matchesPattern']('anything.here', '*');
      expect(matches).toBe(true);
    });

    it('does not match different event', () => {
      const matches = service['matchesPattern']('interview.scheduled', 'submission.*');
      expect(matches).toBe(false);
    });

    it('does not match partial', () => {
      const matches = service['matchesPattern']('submission.created', 'submission.updated');
      expect(matches).toBe(false);
    });
  });
});
```

Create `tests/unit/events/handlers.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { activityCreationHandler } from '@/lib/events/handlers/ActivityCreationHandler';
import { notificationHandler } from '@/lib/events/handlers/NotificationHandler';

vi.mock('@/lib/activities/activity-engine', () => ({
  activityEngine: {
    processEvent: vi.fn().mockResolvedValue([{ id: 'act-1' }]),
  },
}));

vi.mock('@/lib/events/SubscriptionService', () => ({
  subscriptionService: {
    getMatchingSubscriptions: vi.fn().mockResolvedValue([
      { userId: 'user-1', channel: 'in_app' },
    ]),
  },
}));

vi.mock('@/lib/events/DeliveryService', () => ({
  deliveryService: {
    queueNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Event Handlers', () => {
  const mockEvent = {
    id: 'evt-1',
    type: 'submission.created',
    entityType: 'submission',
    entityId: 'sub-123',
    data: { jobTitle: 'Developer' },
    actorId: 'user-actor',
    orgId: 'org-1',
    category: 'entity_lifecycle',
    occurredAt: new Date(),
  };

  describe('activityCreationHandler', () => {
    it('creates activities from events', async () => {
      const result = await activityCreationHandler(mockEvent as any);

      expect(result.success).toBe(true);
      expect(result.activitiesCreated).toBe(1);
    });
  });

  describe('notificationHandler', () => {
    it('queues notifications for matching subscriptions', async () => {
      const result = await notificationHandler(mockEvent as any);

      expect(result.success).toBe(true);
      expect(result.notificationsQueued).toBeGreaterThanOrEqual(0);
    });
  });
});
```

### Task 4: Router Tests

Create `tests/unit/routers/activities.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInnerTRPCContext } from '@/server/trpc';
import { appRouter } from '@/server/routers';

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      activities: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'act-1',
            subject: 'Test Activity',
            status: 'pending',
            priority: 'medium',
            dueAt: new Date(),
          },
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: 'act-1',
          subject: 'Test Activity',
          status: 'pending',
        }),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'act-new' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'act-1', status: 'in_progress' }]),
        }),
      }),
    }),
  },
}));

describe('Activities Router', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    orgId: 'org-1',
  };

  const ctx = createInnerTRPCContext({
    user: mockUser,
  });

  const caller = appRouter.createCaller(ctx);

  describe('list', () => {
    it('returns paginated activities', async () => {
      const result = await caller.activities.list({});

      expect(result).toBeDefined();
      expect(Array.isArray(result.items || result)).toBe(true);
    });
  });

  describe('create', () => {
    it('creates activity with required fields', async () => {
      const result = await caller.activities.create({
        subject: 'New Activity',
        priority: 'medium',
        relatedEntityType: 'job',
        relatedEntityId: 'job-123',
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe('start', () => {
    it('transitions activity to in_progress', async () => {
      const result = await caller.activities.start({
        id: 'act-1',
      });

      expect(result.status).toBe('in_progress');
    });
  });
});
```

---

## WINDOW 8: E2E Tests (Playwright)

### Task 1: Setup Playwright Config

Update `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Task 2: Auth Fixtures

Create `tests/e2e/fixtures/auth.ts`:

```typescript
import { test as base, expect, Page } from '@playwright/test';

type TestUser = {
  email: string;
  password: string;
  role: string;
};

const testUsers: Record<string, TestUser> = {
  admin: { email: 'admin@intime.com', password: 'TestPass123!', role: 'admin' },
  hr: { email: 'hr@intime.com', password: 'TestPass123!', role: 'hr_manager' },
  recruiter: { email: 'rec1@intime.com', password: 'TestPass123!', role: 'recruiter' },
  recruitingManager: { email: 'rec_mgr1@intime.com', password: 'TestPass123!', role: 'recruiting_manager' },
  benchSales: { email: 'bs1@intime.com', password: 'TestPass123!', role: 'bench_sales' },
  benchManager: { email: 'bs_mgr1@intime.com', password: 'TestPass123!', role: 'bench_sales_manager' },
};

async function login(page: Page, user: TestUser) {
  await page.goto('/auth/employee');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/employee\//);
}

export const test = base.extend<{
  recruiterPage: Page;
  managerPage: Page;
  hrPage: Page;
  adminPage: Page;
  benchPage: Page;
}>({
  recruiterPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, testUsers.recruiter);
    await use(page);
    await context.close();
  },
  managerPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, testUsers.recruitingManager);
    await use(page);
    await context.close();
  },
  hrPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, testUsers.hr);
    await use(page);
    await context.close();
  },
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, testUsers.admin);
    await use(page);
    await context.close();
  },
  benchPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page, testUsers.benchSales);
    await use(page);
    await context.close();
  },
});

export { expect };
```

### Task 3: Recruiter E2E Tests

Create `tests/e2e/recruiter/dashboard.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Recruiter Dashboard', () => {
  test('displays dashboard with key metrics', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/dashboard');

    // Verify key sections
    await expect(recruiterPage.locator('text=Dashboard')).toBeVisible();

    // Check for activity queue
    await expect(recruiterPage.locator('[data-testid="activity-queue"]')).toBeVisible();

    // Check for metrics cards
    await expect(recruiterPage.locator('[data-testid="metrics-section"]')).toBeVisible();
  });

  test('can navigate to jobs', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/dashboard');
    await recruiterPage.click('text=Jobs');

    await expect(recruiterPage).toHaveURL(/\/employee\/recruiting\/jobs/);
  });

  test('can navigate to candidates', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/dashboard');
    await recruiterPage.click('text=Candidates');

    await expect(recruiterPage).toHaveURL(/\/employee\/recruiting\/candidates/);
  });
});
```

Create `tests/e2e/recruiter/jobs.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Recruiter Jobs', () => {
  test('displays job list', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/jobs');

    // Wait for table to load
    await recruiterPage.waitForSelector('[data-testid="data-table"]');

    // Verify table exists
    await expect(recruiterPage.locator('[data-testid="data-table"]')).toBeVisible();
  });

  test('can search jobs', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/jobs');

    // Search for job
    await recruiterPage.fill('input[placeholder*="Search"]', 'Developer');
    await recruiterPage.waitForTimeout(500); // Debounce

    // Results should filter
    // Verify search works
  });

  test('can view job details', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/jobs');

    // Wait for table
    await recruiterPage.waitForSelector('[data-testid="data-table"]');

    // Click first job row
    await recruiterPage.click('[data-testid="data-table"] tbody tr:first-child');

    // Should navigate to detail page
    await expect(recruiterPage).toHaveURL(/\/employee\/recruiting\/jobs\/[^/]+$/);
  });

  test('can create new job', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/jobs');

    // Click new job button
    await recruiterPage.click('text=New Job');

    // Should navigate to form
    await expect(recruiterPage).toHaveURL(/\/employee\/recruiting\/jobs\/new/);

    // Verify form loads
    await expect(recruiterPage.locator('form')).toBeVisible();
  });
});
```

Create `tests/e2e/recruiter/submissions.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Recruiter Submissions', () => {
  test('displays submission pipeline', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/submissions');

    // Wait for content
    await recruiterPage.waitForSelector('[data-testid="submissions-content"]');

    // Verify pipeline view or list view
    await expect(
      recruiterPage.locator('[data-testid="pipeline-view"], [data-testid="data-table"]')
    ).toBeVisible();
  });

  test('can filter by status', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/submissions');

    // Click status filter
    await recruiterPage.click('[data-testid="status-filter"]');

    // Select a status
    await recruiterPage.click('text=Interview');

    // Results should filter
    await recruiterPage.waitForTimeout(500);
  });

  test('can view submission details', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/submissions');

    // Wait for content
    await recruiterPage.waitForSelector('[data-testid="submissions-content"]');

    // Click first submission
    const firstRow = recruiterPage.locator('[data-testid="submission-row"]').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await expect(recruiterPage).toHaveURL(/\/employee\/recruiting\/submissions\/[^/]+$/);
    }
  });
});
```

### Task 4: Bench Sales E2E Tests

Create `tests/e2e/bench/consultants.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Bench Sales Consultants', () => {
  test('displays consultant list', async ({ benchPage }) => {
    await benchPage.goto('/employee/bench/consultants');

    // Wait for table
    await benchPage.waitForSelector('[data-testid="data-table"]');

    // Verify table exists
    await expect(benchPage.locator('[data-testid="data-table"]')).toBeVisible();
  });

  test('can view consultant details', async ({ benchPage }) => {
    await benchPage.goto('/employee/bench/consultants');

    // Wait for table
    await benchPage.waitForSelector('[data-testid="data-table"]');

    // Click first row
    await benchPage.click('[data-testid="data-table"] tbody tr:first-child');

    // Should navigate to detail page
    await expect(benchPage).toHaveURL(/\/employee\/bench\/consultants\/[^/]+$/);
  });

  test('can onboard new consultant', async ({ benchPage }) => {
    await benchPage.goto('/employee/bench/consultants');

    // Click onboard button
    await benchPage.click('text=Onboard');

    // Should navigate to onboard form
    await expect(benchPage).toHaveURL(/\/employee\/bench\/consultants\/onboard/);
  });
});
```

Create `tests/e2e/bench/hotlists.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Bench Sales Hotlists', () => {
  test('displays hotlist list', async ({ benchPage }) => {
    await benchPage.goto('/employee/bench/hotlists');

    // Wait for content
    await benchPage.waitForSelector('[data-testid="hotlists-content"]');
  });

  test('can create new hotlist', async ({ benchPage }) => {
    await benchPage.goto('/employee/bench/hotlists');

    // Click new hotlist button
    await benchPage.click('text=New Hotlist');

    // Fill form
    await benchPage.fill('input[name="name"]', 'E2E Test Hotlist');

    // Submit
    await benchPage.click('button[type="submit"]');

    // Should show success
    await expect(benchPage.locator('.toast-success, [role="alert"]')).toBeVisible();
  });
});
```

### Task 5: HR E2E Tests

Create `tests/e2e/hr/employees.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('HR Employees', () => {
  test('displays employee list', async ({ hrPage }) => {
    await hrPage.goto('/employee/hr/employees');

    // Wait for table
    await hrPage.waitForSelector('[data-testid="data-table"]');

    // Verify table exists
    await expect(hrPage.locator('[data-testid="data-table"]')).toBeVisible();
  });

  test('can view employee details', async ({ hrPage }) => {
    await hrPage.goto('/employee/hr/employees');

    // Wait for table
    await hrPage.waitForSelector('[data-testid="data-table"]');

    // Click first row
    await hrPage.click('[data-testid="data-table"] tbody tr:first-child');

    // Should navigate to detail page
    await expect(hrPage).toHaveURL(/\/employee\/hr\/employees\/[^/]+$/);
  });

  test('can access pods', async ({ hrPage }) => {
    await hrPage.goto('/employee/hr/pods');

    // Wait for content
    await hrPage.waitForSelector('[data-testid="pods-content"], [data-testid="data-table"]');
  });
});
```

### Task 6: Admin E2E Tests

Create `tests/e2e/admin/users.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Admin Users', () => {
  test('displays user list', async ({ adminPage }) => {
    await adminPage.goto('/employee/admin/users');

    // Wait for table
    await adminPage.waitForSelector('[data-testid="data-table"]');

    // Verify table exists
    await expect(adminPage.locator('[data-testid="data-table"]')).toBeVisible();
  });

  test('can view user details', async ({ adminPage }) => {
    await adminPage.goto('/employee/admin/users');

    // Wait for table
    await adminPage.waitForSelector('[data-testid="data-table"]');

    // Click first row
    await adminPage.click('[data-testid="data-table"] tbody tr:first-child');

    // Should navigate to detail page
    await expect(adminPage).toHaveURL(/\/employee\/admin\/users\/[^/]+$/);
  });

  test('can access audit logs', async ({ adminPage }) => {
    await adminPage.goto('/employee/admin/audit');

    // Wait for content
    await adminPage.waitForSelector('[data-testid="audit-logs"]');
  });
});
```

### Task 7: Activity Flow Tests

Create `tests/e2e/activities/activity-queue.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Activity Queue', () => {
  test('displays personal activity queue', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/activities');

    // Wait for activity list
    await recruiterPage.waitForSelector('[data-testid="activity-list"]');

    // Verify queue is visible
    await expect(recruiterPage.locator('[data-testid="activity-list"]')).toBeVisible();
  });

  test('can start an activity', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/activities');

    // Wait for activities
    await recruiterPage.waitForSelector('[data-testid="activity-item"]');

    // Click start on first activity
    const firstActivity = recruiterPage.locator('[data-testid="activity-item"]').first();
    if (await firstActivity.isVisible()) {
      await firstActivity.locator('button:has-text("Start")').click();

      // Should show started state
      await expect(firstActivity.locator('text=In Progress')).toBeVisible();
    }
  });

  test('can complete an activity', async ({ recruiterPage }) => {
    await recruiterPage.goto('/employee/recruiting/activities');

    // Wait for activities
    await recruiterPage.waitForSelector('[data-testid="activity-item"]');

    // Find in-progress activity and complete
    const inProgressActivity = recruiterPage
      .locator('[data-testid="activity-item"]:has-text("In Progress")')
      .first();

    if (await inProgressActivity.isVisible()) {
      await inProgressActivity.locator('button:has-text("Complete")').click();

      // Fill outcome
      await recruiterPage.fill('textarea[name="outcome"]', 'Completed successfully');
      await recruiterPage.click('button:has-text("Submit")');

      // Should show success
      await expect(recruiterPage.locator('.toast-success, [role="alert"]')).toBeVisible();
    }
  });
});
```

---

## Run Commands

```bash
# Unit tests
pnpm test

# Unit tests with coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# E2E tests with UI
pnpm test:e2e:ui

# Specific test file
pnpm test tests/unit/activities/

# Specific E2E test
pnpm test:e2e tests/e2e/recruiter/
```

## Validation Checklist

```bash
# 1. Run all unit tests
pnpm test

# 2. Check coverage
pnpm test:coverage

# 3. Run E2E tests
pnpm test:e2e

# 4. Verify no failing tests
echo "All tests should pass"
```

## Requirements:
- All screen definitions must be valid
- Activity system must have 90%+ coverage
- Event system must have 90%+ coverage
- All major user flows must have E2E tests
- E2E tests must use proper test users
- Tests must be deterministic and not flaky
