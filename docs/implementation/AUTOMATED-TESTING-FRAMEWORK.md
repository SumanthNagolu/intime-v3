# Automated Testing Framework
## Comprehensive Testing Strategy for InTime v3

**Version:** 1.0
**Last Updated:** 2025-11-17
**Goal:** 80%+ code coverage, zero production bugs

---

## Table of Contents
1. [Testing Philosophy](#testing-philosophy)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Performance Testing](#performance-testing)
7. [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

### ⚠️ Critical Lesson from Legacy Project

**Legacy Project Failure:**
- ✅ Vitest configured perfectly
- ✅ Playwright set up correctly
- ❌ **Zero tests written** (0 out of 94,000 LOC tested)

**Result:**
- Bugs discovered in production
- Fear of refactoring ("might break something")
- Manual testing only (time-consuming)
- Technical debt accumulation

**Root Cause:** "We'll add tests later" never happened

**v3 Non-Negotiables:**

1. **Tests alongside features** - Not "later"
   ```typescript
   // Developer workflow (enforced by QA agent):
   // 1. Write test FIRST (TDD)
   // 2. Implement feature
   // 3. Test passes ✅
   // 4. THEN commit
   ```

2. **Minimum 80% coverage** for critical paths
   - Database mutations: 100%
   - Auth & permissions: 100%
   - Business logic: 90%
   - UI components: 70%

3. **Pre-commit hook BLOCKS** untested code
   ```bash
   $ git commit -m "Add feature"
   Running pre-commit checks...
   ✅ TypeScript compilation
   ✅ ESLint
   ❌ Tests failing (2 tests, 1 failed)
   ❌ Coverage below 80% (current: 75%)

   ⛔ Commit blocked. Fix tests first.
   ```

4. **QA Agent enforces** testing in workflow
   - Developer Agent cannot proceed to deployment without passing QA
   - QA Agent writes additional tests if coverage < 80%
   - Deployment Agent blocks if tests fail in staging

### Core Principles

1. **Test Early, Test Often** - Write tests as you build (ENFORCED)
2. **Fast Feedback** - Tests run in <30 seconds
3. **Reliable** - Tests never flaky
4. **Maintainable** - Easy to update when code changes

### What to Test (Priority Order)

| Priority | What | Coverage Target | Why |
|----------|------|-----------------|-----|
| **Critical** | Database mutations, Auth, Payments | 100% | Data loss/security risk |
| **High** | Business logic, Server actions | 90% | Core functionality |
| **Medium** | UI components with state | 70% | User-facing features |
| **Low** | Simple UI, Utils | 50% | Nice to have |
| **Skip** | Types, Config files | 0% | No runtime code |

---

## Testing Pyramid

```
        /\
       /E2E\      10% - Critical user flows only
      /------\
     /  INT   \   30% - Database, API integration
    /----------\
   /   UNIT     \ 60% - Business logic, utilities
  /--------------\
```

**Target Distribution:** 60% Unit, 30% Integration, 10% E2E

---

## Unit Testing

### Setup (Vitest)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Structure

```typescript
// src/lib/db/queries/users.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getUserById, getUsersByOrg } from './users'
import { createTestUser, createTestOrg, cleanupTestData } from '@/test/fixtures'

describe('User Queries', () => {
  let testOrgId: string
  let testUserId: string

  beforeEach(async () => {
    // Setup test data
    testOrgId = await createTestOrg()
    testUserId = await createTestUser({ orgId: testOrgId })
  })

  afterEach(async () => {
    // Cleanup
    await cleanupTestData()
  })

  describe('getUserById', () => {
    it('should return user when exists', async () => {
      const user = await getUserById(testUserId, testOrgId)

      expect(user).toBeDefined()
      expect(user?.id).toBe(testUserId)
      expect(user?.orgId).toBe(testOrgId)
    })

    it('should return undefined when user not found', async () => {
      const user = await getUserById('non-existent-id', testOrgId)

      expect(user).toBeUndefined()
    })

    it('should return undefined when wrong org (RLS test)', async () => {
      const otherOrgId = await createTestOrg()
      const user = await getUserById(testUserId, otherOrgId)

      expect(user).toBeUndefined() // RLS blocks access
    })
  })
})
```

---

## Integration Testing

### Database Integration Tests

```typescript
// src/lib/db/mutations/candidates.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createCandidate, updateCandidate, softDeleteCandidate } from './candidates'
import { getCandidateById } from '../queries/candidates'
import { createTestOrg, createTestUser } from '@/test/fixtures'

describe('Candidate Mutations', () => {
  let orgId: string
  let userId: string

  beforeEach(async () => {
    orgId = await createTestOrg()
    userId = await createTestUser({ orgId })
  })

  it('should create candidate with all audit fields', async () => {
    const result = await createCandidate(
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        orgId,
      },
      userId
    )

    expect(result.success).toBe(true)
    expect(result.data?.createdBy).toBe(userId)
    expect(result.data?.updatedBy).toBe(userId)
    expect(result.data?.createdAt).toBeDefined()
    expect(result.data?.deletedAt).toBeNull()
  })

  it('should enforce unique email per org', async () => {
    await createCandidate(
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com', orgId },
      userId
    )

    const duplicate = await createCandidate(
      { firstName: 'Jane', lastName: 'Doe', email: 'john@example.com', orgId },
      userId
    )

    expect(duplicate.success).toBe(false)
    expect(duplicate.code).toBe('DUPLICATE_ENTRY')
  })

  it('should soft delete candidate', async () => {
    const created = await createCandidate(
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com', orgId },
      userId
    )

    const deleted = await softDeleteCandidate(created.data!.id, userId, orgId)

    expect(deleted.success).toBe(true)
    expect(deleted.data?.deletedAt).toBeDefined()

    // Verify can't query deleted candidates
    const found = await getCandidateById(created.data!.id, orgId)
    expect(found).toBeUndefined()
  })
})
```

---

## E2E Testing

### Playwright Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

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
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Example

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'
import { signupUser, cleanupTestUser } from './helpers/auth'

test.describe('Authentication', () => {
  test('complete signup and login flow', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`
    const password = 'SecurePassword123!'

    // 1. Navigate to signup
    await page.goto('/signup')

    // 2. Fill signup form
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', password)
    await page.fill('[name="confirmPassword"]', password)
    await page.fill('[name="companyName"]', 'Test Company')

    // 3. Submit
    await page.click('button[type="submit"]')

    // 4. Verify redirect to verification page
    await expect(page).toHaveURL('/verify-email')
    await expect(page.locator('text=Check your email')).toBeVisible()

    // 5. Simulate email verification (use test endpoint)
    await page.goto(`/api/test/verify-email?email=${email}`)

    // 6. Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome')).toBeVisible()

    // Cleanup
    await cleanupTestUser(email)
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'invalid@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })
})
```

---

## Performance Testing

### Lighthouse CI

```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/solutions/staffing",
        "http://localhost:3000/dashboard"
      ]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### Load Testing (k6)

```javascript
// tests/load/api-load.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 20 },  // Ramp up
    { duration: '3m', target: 20 },  // Steady
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // <1% failures
  },
}

export default function () {
  const res = http.get('https://staging.intimeesolutions.com/api/candidates')

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Lint
        run: pnpm lint

      - name: Unit & Integration tests
        run: pnpm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Build
        run: pnpm build

      - name: E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Test Coverage Goals

| Module | Unit | Integration | E2E | Target |
|--------|------|-------------|-----|--------|
| **Database** | 90% | 100% | - | 95% |
| **Auth** | 80% | 100% | 100% | 95% |
| **Server Actions** | 85% | 90% | 50% | 85% |
| **Business Logic** | 95% | - | - | 95% |
| **UI Components** | 60% | - | 30% | 60% |
| **Utilities** | 90% | - | - | 90% |

---

**Last Updated:** 2025-11-17
**Owner:** QA Engineer Agent
