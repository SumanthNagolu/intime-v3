# PROMPT: TESTING (Window 4-6)

Copy everything below the line and paste into Claude Code CLI:

---

Use the testing skill.

Create comprehensive tests for InTime v3 - both unit tests (Vitest) and E2E tests (Playwright).

## Read First:
- src/lib/db/schema/*.ts (All schemas)
- src/server/routers/*.ts (All routers)
- src/lib/activities/*.ts (Activity system)
- src/lib/events/*.ts (Event system)
- src/app/(app)/**/page.tsx (Screen components)

## Test Structure:

```
tests/
├── unit/
│   ├── lib/
│   │   ├── activities/
│   │   ├── events/
│   │   └── utils/
│   ├── server/
│   │   └── routers/
│   └── hooks/
├── integration/
│   ├── api/
│   └── db/
└── e2e/
    ├── recruiter/
    ├── bench-sales/
    ├── manager/
    ├── hr/
    ├── executive/
    ├── portals/
    └── admin/
```

---

## Part 1: Unit Tests (Vitest)

### 1. Activity System Tests (tests/unit/lib/activities/)

#### ActivityService.test.ts
```typescript
describe('ActivityService', () => {
  describe('createFromPattern', () => {
    it('creates activity with pattern defaults');
    it('applies pattern fields');
    it('calculates SLA target');
    it('sets correct priority');
  });

  describe('start', () => {
    it('transitions from pending to in_progress');
    it('sets started_at timestamp');
    it('rejects if already started');
  });

  describe('complete', () => {
    it('requires in_progress status');
    it('records outcome and notes');
    it('creates follow-up if configured');
  });

  describe('defer', () => {
    it('updates due date');
    it('records reason');
  });
});
```

#### SLAEngine.test.ts
```typescript
describe('SLAEngine', () => {
  describe('calculateTarget', () => {
    it('adds offset hours to creation time');
    it('applies business hours when configured');
    it('respects timezone');
  });

  describe('getStatus', () => {
    it('returns ok when within target');
    it('returns warning at threshold');
    it('returns critical at threshold');
    it('returns breached after target');
  });
});
```

#### AutoActivityEngine.test.ts
```typescript
describe('AutoActivityEngine', () => {
  describe('processEvent', () => {
    it('matches event to rules');
    it('evaluates conditions');
    it('creates activity from matched pattern');
    it('maps event data to fields');
    it('resolves assignee');
  });
});
```

### 2. Event System Tests (tests/unit/lib/events/)

#### EventBus.test.ts
```typescript
describe('EventBus', () => {
  describe('emit', () => {
    it('persists event to database');
    it('triggers matching handlers');
    it('maintains event order');
    it('includes correlation id');
  });

  describe('on', () => {
    it('registers handler for exact type');
    it('supports regex patterns');
    it('allows multiple handlers');
  });
});
```

### 3. Router Tests (tests/unit/server/routers/)

#### jobRouter.test.ts
```typescript
describe('jobRouter', () => {
  describe('create', () => {
    it('validates required fields');
    it('creates job with correct org_id');
    it('emits job.created event');
    it('creates activity for review');
  });

  describe('list', () => {
    it('paginates results');
    it('filters by status');
    it('filters by account');
    it('respects permissions');
  });

  describe('updateStatus', () => {
    it('validates status transition');
    it('emits status_changed event');
  });
});
```

Create similar tests for:
- candidateRouter.test.ts
- submissionRouter.test.ts
- interviewRouter.test.ts
- offerRouter.test.ts
- placementRouter.test.ts
- leadRouter.test.ts
- dealRouter.test.ts
- consultantRouter.test.ts
- vendorRouter.test.ts
- activityRouter.test.ts

### 4. Hook Tests (tests/unit/hooks/)

#### useActivities.test.ts
```typescript
describe('useActivities', () => {
  it('fetches activities with filters');
  it('handles pagination');
  it('updates on real-time events');
});
```

---

## Part 2: Integration Tests

### 1. API Integration (tests/integration/api/)

#### submission-workflow.test.ts
```typescript
describe('Submission Workflow', () => {
  it('creates submission and triggers activities');
  it('updates status and records events');
  it('schedules interview and notifies participants');
  it('completes placement after offer acceptance');
});
```

#### activity-event-integration.test.ts
```typescript
describe('Activity-Event Integration', () => {
  it('event triggers auto-activity creation');
  it('activity completion triggers follow-up event');
  it('SLA breach triggers escalation event');
});
```

### 2. Database Integration (tests/integration/db/)

#### schema-relations.test.ts
```typescript
describe('Schema Relations', () => {
  it('job has correct relations');
  it('submission links candidate and job');
  it('activity references entity correctly');
});
```

---

## Part 3: E2E Tests (Playwright)

### 1. Recruiter Flows (tests/e2e/recruiter/)

#### create-job.spec.ts
```typescript
test.describe('Create Job', () => {
  test('can create job with all fields', async ({ page }) => {
    await page.goto('/recruiter/jobs/new');
    // Fill form steps
    await page.fill('[name="title"]', 'Senior Developer');
    // Continue through wizard
    await page.click('button:has-text("Publish")');
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    // Test validation
  });
});
```

#### submit-candidate.spec.ts
```typescript
test.describe('Submit Candidate', () => {
  test('can submit candidate to job', async ({ page }) => {
    await page.goto('/recruiter/candidates');
    // Select candidate
    // Open submit modal
    // Select job
    // Enter rates
    // Submit
    await expect(page.locator('.submission-success')).toBeVisible();
  });

  test('calculates margin correctly', async ({ page }) => {
    // Test margin calculation
  });
});
```

#### schedule-interview.spec.ts
```typescript
test.describe('Schedule Interview', () => {
  test('can schedule interview for submission', async ({ page }) => {
    // Navigate to submission
    // Click schedule interview
    // Fill date/time
    // Add participants
    // Confirm
  });
});
```

### 2. Bench Sales Flows (tests/e2e/bench-sales/)

#### manage-hotlist.spec.ts
```typescript
test.describe('Manage Hotlist', () => {
  test('can create and populate hotlist', async ({ page }) => {
    // Create hotlist
    // Add consultants
    // Reorder via drag-drop
  });

  test('can export hotlist', async ({ page }) => {
    // Export and verify download
  });
});
```

#### visa-tracking.spec.ts
```typescript
test.describe('Visa Tracking', () => {
  test('displays visa expiry alerts', async ({ page }) => {
    // Verify color-coded alerts
  });

  test('can update visa details', async ({ page }) => {
    // Update visa
    // Verify recalculated alert level
  });
});
```

### 3. Manager Flows (tests/e2e/manager/)

#### pipeline-review.spec.ts
```typescript
test.describe('Pipeline Review', () => {
  test('displays pipeline visualization', async ({ page }) => {
    await page.goto('/manager/pipeline');
    await expect(page.locator('.pipeline-funnel')).toBeVisible();
  });

  test('can drill down into stage', async ({ page }) => {
    // Click stage
    // Verify list of items
  });
});
```

### 4. Portal Flows (tests/e2e/portals/)

#### client-review-submissions.spec.ts
```typescript
test.describe('Client Portal - Review Submissions', () => {
  test('can view and shortlist candidate', async ({ page }) => {
    await page.goto('/client/submissions');
    // View submission
    // Click shortlist
    await expect(page.locator('.status-badge')).toHaveText('Shortlisted');
  });
});
```

#### candidate-apply-job.spec.ts
```typescript
test.describe('Candidate Portal - Apply to Job', () => {
  test('can search and apply to job', async ({ page }) => {
    await page.goto('/candidate/jobs');
    // Search
    // View job
    // Apply
    // Complete application flow
  });
});
```

### 5. Activity Flows (tests/e2e/activities/)

#### activity-queue.spec.ts
```typescript
test.describe('Activity Queue', () => {
  test('displays prioritized activities', async ({ page }) => {
    await page.goto('/recruiter/activities');
    // Verify SLA indicators
    // Verify priority sorting
  });

  test('can complete activity', async ({ page }) => {
    // Select activity
    // Complete with outcome
    // Verify follow-up created
  });
});
```

---

## Test Utilities (tests/utils/)

### setup.ts
```typescript
export async function setupTestUser(role: string);
export async function seedTestData();
export async function cleanupTestData();
```

### fixtures.ts
```typescript
export const testJob = { ... };
export const testCandidate = { ... };
export const testSubmission = { ... };
```

### helpers.ts
```typescript
export async function login(page: Page, email: string);
export async function waitForToast(page: Page);
export async function selectFromDropdown(page: Page, name: string, value: string);
```

---

## Test Configuration

### vitest.config.ts
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### playwright.config.ts
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
```

## Requirements:
- Minimum 80% code coverage for critical paths
- All routers must have tests
- Activity system 100% covered
- Event system 100% covered
- Happy path E2E for all major workflows

## Run Commands:
```bash
# Unit tests
pnpm test

# Unit tests with coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui
```

## Parallel Execution:
This prompt can be split across 3 windows:
- Window 4: Unit tests (activity, event, utils)
- Window 5: Router tests + integration tests
- Window 6: E2E tests
