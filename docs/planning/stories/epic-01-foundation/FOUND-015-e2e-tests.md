# FOUND-015: Create E2E Test for Signup Flow

**Story Points:** 2
**Sprint:** Sprint 3 (Week 5-6)
**Priority:** MEDIUM

---

## User Story

As a **QA Engineer**,
I want **end-to-end tests for critical user flows**,
So that **we catch UI/UX issues before users do**.

---

## Acceptance Criteria

- [ ] E2E test for complete signup flow
- [ ] Test covers: signup → email confirm → login → dashboard
- [ ] Screenshots captured on failure
- [ ] Test runs in CI/CD
- [ ] Tests work across browsers (Chrome, Firefox, Safari)

---

## Technical Implementation

Create file: `tests/e2e/signup-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Signup Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test1234!';

  test('should complete full signup and login flow', async ({ page }) => {
    // Step 1: Navigate to signup
    await page.goto('/signup');
    await expect(page.locator('h2')).toContainText('Create your account');

    // Step 2: Fill credentials
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Step 3: Select role
    await expect(page.locator('text=I am a...')).toBeVisible();
    await page.click('input[value="student"]');
    await page.click('button:has-text("Continue")');

    // Step 4: Fill details
    await page.fill('input[name="fullName"]', 'Test User');
    await page.click('button[type="submit"]');

    // Step 5: Should redirect to dashboard
    await expect(page).toHaveURL(/\/academy\/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
```

---

## Dependencies

- **Requires:** FOUND-013, FOUND-006

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
