/**
 * Account Creation Full E2E Test
 *
 * Tests full account creation flow with all fields populated.
 * Uses the new /accounts/new page form.
 *
 * Run: pnpm playwright test tests/e2e/account-creation-full.spec.ts --project=chromium
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Test Configuration
// ============================================================================

const COMMON_PASSWORD = 'TestPass123!';

const TEST_USERS = {
  recruiter: {
    email: 'rec1@intime.com',
    password: COMMON_PASSWORD,
  },
  admin: {
    email: 'admin@intime.com',
    password: COMMON_PASSWORD,
  },
};

// ============================================================================
// Test Data
// ============================================================================

const generateTestAccount = () => {
  const timestamp = Date.now();
  return {
    name: `E2E Test Corp ${timestamp}`,
    legalName: `E2E Test Corporation Inc. ${timestamp}`,
    industry: 'technology',
    companyType: 'direct_client',
    status: 'prospect',
    tier: 'enterprise',
    website: 'https://e2etest.example.com',
    phone: '+1 (555) 123-4567',
    headquartersLocation: 'San Francisco, CA',
    foundedYear: '2015',
    employeeCount: '500',
    annualRevenue: '10000000',
    description: `Test company created by Playwright E2E test at ${new Date().toISOString()}`,
    responsiveness: 'high',
    preferredQuality: 'premium',
    contractStartDate: new Date().toISOString().split('T')[0], // Today
    contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    paymentTermsDays: '45',
    markupPercentage: '25',
    annualRevenueTarget: '500000',
  };
};

// ============================================================================
// Helper Functions
// ============================================================================

async function login(page: Page, user = TEST_USERS.recruiter): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[name="email"], input[type="email"]', user.email);
  await page.fill('input[name="password"], input[type="password"]', user.password);
  await page.click('button[type="submit"]');

  // Wait for navigation away from login page
  await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 15000 });
}

async function navigateToNewAccountPage(page: Page): Promise<void> {
  await page.goto('/employee/recruiting/accounts/new');
  await page.waitForLoadState('networkidle');

  // Wait for the form to load
  await expect(page.locator('h1:has-text("Create New Account")')).toBeVisible({ timeout: 10000 });
}

async function fillAccountForm(page: Page, account: ReturnType<typeof generateTestAccount>): Promise<void> {
  // Basic Information Section
  await page.fill('[data-testid="account-name"]', account.name);
  await page.fill('[data-testid="account-legal-name"]', account.legalName);
  await page.selectOption('[data-testid="account-industry"]', account.industry);
  await page.selectOption('[data-testid="account-company-type"]', account.companyType);
  await page.selectOption('[data-testid="account-status"]', account.status);
  await page.selectOption('[data-testid="account-tier"]', account.tier);

  // Contact Information Section
  await page.fill('[data-testid="account-website"]', account.website);
  await page.fill('[data-testid="account-phone"]', account.phone);
  await page.fill('[data-testid="account-headquarters"]', account.headquartersLocation);

  // Company Details Section
  await page.fill('[data-testid="account-founded-year"]', account.foundedYear);
  await page.fill('[data-testid="account-employee-count"]', account.employeeCount);
  await page.fill('[data-testid="account-annual-revenue"]', account.annualRevenue);
  await page.selectOption('[data-testid="account-responsiveness"]', account.responsiveness);
  await page.selectOption('[data-testid="account-preferred-quality"]', account.preferredQuality);
  await page.fill('[data-testid="account-description"]', account.description);

  // Business Terms Section
  await page.fill('[data-testid="account-contract-start"]', account.contractStartDate);
  await page.fill('[data-testid="account-contract-end"]', account.contractEndDate);
  await page.fill('[data-testid="account-payment-terms"]', account.paymentTermsDays);
  await page.fill('[data-testid="account-markup"]', account.markupPercentage);
  await page.fill('[data-testid="account-revenue-target"]', account.annualRevenueTarget);
}

// ============================================================================
// Test Suites
// ============================================================================

test.describe('Account Creation - Full Form', () => {
  let testAccount: ReturnType<typeof generateTestAccount>;

  test.beforeEach(async ({ page }) => {
    testAccount = generateTestAccount();
    await login(page);
  });

  test('should display the account creation form', async ({ page }) => {
    await navigateToNewAccountPage(page);

    // Verify form sections are visible
    await expect(page.locator('h2:has-text("Basic Information")')).toBeVisible();
    await expect(page.locator('h2:has-text("Contact Information")')).toBeVisible();
    await expect(page.locator('h2:has-text("Company Details")')).toBeVisible();
    await expect(page.locator('h2:has-text("Business Terms")')).toBeVisible();

    // Verify submit button
    await expect(page.locator('[data-testid="account-submit"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await navigateToNewAccountPage(page);

    // Try to submit without filling required fields
    await page.click('[data-testid="account-submit"]');

    // Should show validation error for account name
    await expect(page.locator('text=Account name is required')).toBeVisible({ timeout: 5000 });
  });

  test('should validate website URL format', async ({ page }) => {
    await navigateToNewAccountPage(page);

    // Fill name first
    await page.fill('[data-testid="account-name"]', 'Test Account');

    // Fill invalid website
    await page.fill('[data-testid="account-website"]', 'invalid-url');

    // Try to submit
    await page.click('[data-testid="account-submit"]');

    // Should show URL validation error
    await expect(page.locator('text=Website must be a valid URL')).toBeVisible({ timeout: 5000 });
  });

  test('should create account with all fields populated', async ({ page }) => {
    await navigateToNewAccountPage(page);

    // Fill the entire form
    await fillAccountForm(page, testAccount);

    // Take screenshot before submission
    await page.screenshot({ path: 'test-results/account-form-filled.png', fullPage: true });

    // Submit the form
    await page.click('[data-testid="account-submit"]');

    // Wait for navigation to accounts list (successful creation redirects)
    await page.waitForURL(/\/employee\/recruiting\/accounts(?!\/new)/, { timeout: 15000 });

    // Verify we're on the accounts list page
    await expect(page).toHaveURL(/\/employee\/recruiting\/accounts/);

    // Take screenshot after creation
    await page.screenshot({ path: 'test-results/account-created-list.png', fullPage: true });
  });

  test('should show created account in accounts list', async ({ page }) => {
    await navigateToNewAccountPage(page);

    // Fill and submit form
    await fillAccountForm(page, testAccount);
    await page.click('[data-testid="account-submit"]');

    // Wait for redirect to accounts list
    await page.waitForURL(/\/employee\/recruiting\/accounts(?!\/new)/, { timeout: 15000 });

    // Wait for list to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Search for the created account
    const searchInput = page.locator('input[placeholder*="Search accounts"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(testAccount.name);
      await page.waitForTimeout(1500);
    }

    // Verify account appears in the list (use .first() to avoid strict mode violations)
    await expect(page.locator(`text=${testAccount.name}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('should persist account data after page reload', async ({ page }) => {
    await navigateToNewAccountPage(page);

    // Create account
    await fillAccountForm(page, testAccount);
    await page.click('[data-testid="account-submit"]');

    // Wait for redirect
    await page.waitForURL(/\/employee\/recruiting\/accounts(?!\/new)/, { timeout: 15000 });

    // Wait for list to load
    await page.waitForLoadState('networkidle');

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Search for the account
    const searchInput = page.locator('input[placeholder*="Search accounts"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(testAccount.name);
      await page.waitForTimeout(1500);
    }

    // Account should still be visible after reload (persisted to DB, use .first() for strict mode)
    await expect(page.locator(`text=${testAccount.name}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate back to accounts list on cancel', async ({ page }) => {
    await navigateToNewAccountPage(page);

    // Click cancel link
    await page.click('a:has-text("Cancel")');

    // Should navigate back to accounts list
    await expect(page).toHaveURL(/\/employee\/recruiting\/accounts(?!\/new)/);
  });
});

test.describe('Account Creation - Screenshots', () => {
  test('capture empty account form', async ({ page }) => {
    await login(page);
    await navigateToNewAccountPage(page);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/account-form-empty.png', fullPage: true });
  });

  test('capture filled account form', async ({ page }) => {
    const testAccount = generateTestAccount();
    await login(page);
    await navigateToNewAccountPage(page);
    await fillAccountForm(page, testAccount);
    await page.screenshot({ path: 'test-results/account-form-complete.png', fullPage: true });
  });
});

test.describe('Account Creation - Admin User', () => {
  test('admin should be able to create accounts', async ({ page }) => {
    const testAccount = generateTestAccount();
    await login(page, TEST_USERS.admin);
    await navigateToNewAccountPage(page);

    // Fill basic required fields
    await page.fill('[data-testid="account-name"]', testAccount.name);
    await page.selectOption('[data-testid="account-industry"]', testAccount.industry);
    await page.selectOption('[data-testid="account-company-type"]', testAccount.companyType);

    // Submit
    await page.click('[data-testid="account-submit"]');

    // Should redirect to accounts list
    await page.waitForURL(/\/employee\/recruiting\/accounts(?!\/new)/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/employee\/recruiting\/accounts/);
  });
});
