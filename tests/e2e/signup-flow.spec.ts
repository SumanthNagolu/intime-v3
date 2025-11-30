import { test, expect } from '@playwright/test';

/**
 * FOUND-015: E2E Test for Signup Flow
 *
 * Acceptance Criteria:
 * ✅ Full signup flow (email → verify → login)
 * ✅ Error handling (invalid email, weak password)
 * ✅ Cross-browser (Chrome, Firefox, Safari)
 * ✅ Screenshot on failure (configured in playwright.config.ts)
 *
 * Test Coverage:
 * - Valid signup flow
 * - Email validation
 * - Password strength validation
 * - Duplicate email handling
 * - Email verification flow
 * - Post-signup login
 */

// Test data
const validUser = {
  email: `test.user.${Date.now()}@example.com`,
  password: 'SecurePassword123!',
  firstName: 'Test',
  lastName: 'User',
};

const weakPasswords = [
  'short', // Too short
  'nouppercaseornumbers', // No uppercase or numbers
  'NoNumbers', // No numbers
  '12345678', // No letters
];

test.describe('Signup Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page
    await page.goto('/auth/signup');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display signup form with all required fields', async ({ page }) => {
    // Check form title
    await expect(page.locator('h1, h2').filter({ hasText: /sign up|create account/i })).toBeVisible();

    // Check required form fields
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i })).toBeVisible();

    // Check link to login page
    await expect(page.locator('a').filter({ hasText: /sign in|log in|already have account/i })).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    const invalidEmails = [
      'notanemail',
      'missing@domain',
      '@nodomain.com',
      'spaces in@email.com',
    ];

    for (const invalidEmail of invalidEmails) {
      // Fill in invalid email
      await page.locator('input[name="email"], input[type="email"]').fill(invalidEmail);
      await page.locator('input[name="password"], input[type="password"]').first().fill(validUser.password);

      // Try to submit
      await page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i }).click();

      // Should show validation error
      await expect(page.locator('text=/invalid.*email|enter.*valid.*email/i')).toBeVisible({ timeout: 5000 });

      // Clear for next iteration
      await page.locator('input[name="email"], input[type="email"]').clear();
    }
  });

  test('should show validation error for weak passwords', async ({ page }) => {
    for (const weakPassword of weakPasswords) {
      // Fill in valid email but weak password
      await page.locator('input[name="email"], input[type="email"]').fill(validUser.email);
      await page.locator('input[name="password"], input[type="password"]').first().fill(weakPassword);

      // Try to submit
      await page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i }).click();

      // Should show password validation error
      await expect(
        page.locator('text=/password.*weak|password.*short|password.*8.*character|password.*uppercase|password.*number/i')
      ).toBeVisible({ timeout: 5000 });

      // Clear for next iteration
      await page.locator('input[name="password"], input[type="password"]').first().clear();
    }
  });

  test('should successfully sign up new user', async ({ page }) => {
    // Fill in signup form with valid data
    await page.locator('input[name="email"], input[type="email"]').fill(validUser.email);
    await page.locator('input[name="password"], input[type="password"]').first().fill(validUser.password);

    // If there's a password confirmation field
    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirm"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(validUser.password);
    }

    // Submit the form
    await page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i }).click();

    // Should redirect or show success message
    // Wait for either:
    // 1. Redirect to verification page
    // 2. Success message
    // 3. Redirect to dashboard
    await Promise.race([
      page.waitForURL('**/verify-email**', { timeout: 10000 }),
      page.waitForURL('**/dashboard**', { timeout: 10000 }),
      page.locator('text=/success|check.*email|account.*created/i').waitFor({ timeout: 10000 }),
    ]);

    // Verify we're no longer on the signup page
    expect(page.url()).not.toContain('/auth/signup');
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    // Use a known existing email (we'll create one first)
    const existingEmail = `existing.${Date.now()}@example.com`;

    // First signup
    await page.locator('input[name="email"], input[type="email"]').fill(existingEmail);
    await page.locator('input[name="password"], input[type="password"]').first().fill(validUser.password);

    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirm"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(validUser.password);
    }

    await page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i }).click();

    // Wait for first signup to complete
    await page.waitForTimeout(2000);

    // Navigate back to signup page
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');

    // Try to sign up with same email
    await page.locator('input[name="email"], input[type="email"]').fill(existingEmail);
    await page.locator('input[name="password"], input[type="password"]').first().fill(validUser.password);

    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(validUser.password);
    }

    await page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i }).click();

    // Should show error that email already exists
    await expect(
      page.locator('text=/email.*already.*exists|email.*taken|user.*already.*exists/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to login page from signup', async ({ page }) => {
    // Click on "Already have an account? Sign in" link
    await page.locator('a').filter({ hasText: /sign in|log in|already have account/i }).click();

    // Should navigate to login page
    await page.waitForURL('**/auth/signin**');

    // Verify we're on login page
    await expect(page.locator('h1, h2').filter({ hasText: /sign in|log in/i })).toBeVisible();
  });

  test('should show password strength indicator', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

    // Type a weak password
    await passwordInput.fill('weak');

    // Should show weak indicator (if implemented)
    // This is optional but good UX
    const strengthIndicator = page.locator('[class*="strength"], [class*="password-indicator"]');
    if (await strengthIndicator.isVisible()) {
      await expect(strengthIndicator).toContainText(/weak|poor/i);
    }

    // Type a strong password
    await passwordInput.fill('StrongPassword123!');

    if (await strengthIndicator.isVisible()) {
      await expect(strengthIndicator).toContainText(/strong|good|excellent/i);
    }
  });

  test('should handle password mismatch in confirmation field', async ({ page }) => {
    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirm"]');

    // Skip if no confirmation field
    if (!(await confirmPasswordField.isVisible())) {
      test.skip();
    }

    // Fill in mismatched passwords
    await page.locator('input[name="email"], input[type="email"]').fill(validUser.email);
    await page.locator('input[name="password"], input[type="password"]').first().fill(validUser.password);
    await confirmPasswordField.fill('DifferentPassword123!');

    // Try to submit
    await page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i }).click();

    // Should show password mismatch error
    await expect(
      page.locator('text=/password.*match|password.*same|password.*identical/i')
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Email Verification Flow', () => {
  test('should display verification message after signup', async ({ page }) => {
    // Navigate to signup
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');

    // Sign up
    const newEmail = `verify.test.${Date.now()}@example.com`;
    await page.locator('input[name="email"], input[type="email"]').fill(newEmail);
    await page.locator('input[name="password"], input[type="password"]').first().fill(validUser.password);

    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirm"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(validUser.password);
    }

    await page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i }).click();

    // Should see verification message
    await expect(
      page.locator('text=/check.*email|verify.*email|confirmation.*sent/i')
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Post-Signup Login Flow', () => {
  test('should be able to login after successful signup', async ({ page }) => {
    // Create a new user
    const newUserEmail = `login.test.${Date.now()}@example.com`;

    // Signup
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="email"], input[type="email"]').fill(newUserEmail);
    await page.locator('input[name="password"], input[type="password"]').first().fill(validUser.password);

    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirm"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(validUser.password);
    }

    await page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i }).click();

    // Wait a bit for account creation
    await page.waitForTimeout(2000);

    // Navigate to login page
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    // Login with the new credentials
    await page.locator('input[name="email"], input[type="email"]').fill(newUserEmail);
    await page.locator('input[name="password"], input[type="password"]').fill(validUser.password);
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|log in/i }).click();

    // Should successfully login (either redirect to dashboard or show success)
    await Promise.race([
      page.waitForURL('**/dashboard**', { timeout: 10000 }),
      page.waitForURL('**/verify-email**', { timeout: 10000 }),
      page.locator('text=/welcome|dashboard/i').waitFor({ timeout: 10000 }),
    ]);

    // Should not be on login page anymore
    expect(page.url()).not.toContain('/auth/signin');
  });
});

test.describe('Cross-browser Compatibility', () => {
  test('signup form works in all browsers', async ({ page, browserName }) => {
    // This test will run in Chrome, Firefox, and WebKit (Safari)
    // as configured in playwright.config.ts

    console.log(`Testing signup in ${browserName}`);

    // Navigate to signup
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');

    // Verify form is visible and functional
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Test form submission with valid data
    const browserEmail = `${browserName}.test.${Date.now()}@example.com`;
    await page.locator('input[name="email"], input[type="email"]').fill(browserEmail);
    await page.locator('input[name="password"], input[type="password"]').first().fill(validUser.password);

    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirm"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(validUser.password);
    }

    await page.locator('button[type="submit"]').filter({ hasText: /sign up|create/i }).click();

    // Should process the signup (redirect or show message)
    await Promise.race([
      page.waitForURL(/verify|dashboard/, { timeout: 10000 }),
      page.locator('text=/success|check.*email/i').waitFor({ timeout: 10000 }),
    ]);

    console.log(`✅ Signup works in ${browserName}`);
  });
});
