/**
 * Accounts Module E2E Tests
 *
 * Tests for complete account lifecycle: creation, editing, status changes, and deletion.
 *
 * Prerequisites:
 *   - Run `pnpm tsx scripts/seed-test-users.ts` to create test users
 *   - Ensure the app is running on localhost:3000
 *
 * Run: pnpm playwright test tests/e2e/accounts-module.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Test Configuration
// ============================================================================

const COMMON_PASSWORD = 'TestPass123!';

const TEST_USERS = {
  recruiter: {
    email: 'jr_rec@intime.com',
    password: COMMON_PASSWORD,
  },
  admin: {
    email: 'admin@intime.com',
    password: COMMON_PASSWORD,
  },
};

// Test data for accounts
const TEST_ACCOUNT = {
  name: `E2E Test Account ${Date.now()}`,
  industry: 'technology',
  companyType: 'direct_client',
  status: 'prospect',
  tier: 'mid_market',
  phone: '555-0101',
  website: 'https://test-company.com',
  headquartersLocation: 'San Francisco, CA',
  annualRevenueTarget: '500000',
  paymentTermsDays: '30',
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
  await page.waitForURL(/^(?!.*\/login).*$/);
}

async function navigateToAccounts(page: Page): Promise<void> {
  await page.goto('/employee/crm/accounts');
  await page.waitForLoadState('networkidle');
}

async function openNewAccountModal(page: Page): Promise<void> {
  const newAccountButton = page.locator('button:has-text("New Account")');
  await expect(newAccountButton).toBeVisible({ timeout: 10000 });
  await newAccountButton.click();

  // Wait for modal to appear
  await expect(page.locator('text=Create New Account')).toBeVisible({ timeout: 5000 });
}

// ============================================================================
// Test Suites
// ============================================================================

test.describe('Accounts Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToAccounts(page);
  });

  test.describe('Accounts List', () => {
    test('should display accounts list page', async ({ page }) => {
      // Check page loaded correctly
      await expect(page.locator('h1:has-text("Accounts")')).toBeVisible({ timeout: 10000 });
    });

    test('should display account metrics cards', async ({ page }) => {
      // Check metrics are visible
      await expect(page.locator('text=Total Accounts')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Active')).toBeVisible();
    });

    test('should have search functionality', async ({ page }) => {
      // Find search input
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });

      // Type search term
      await searchInput.fill('test');

      // Wait for search to filter
      await page.waitForTimeout(500);
    });

    test('should have filter options', async ({ page }) => {
      // Look for filter buttons or dropdowns
      const statusFilter = page.locator('[data-testid="filter-status"], button:has-text("Status")');
      const tierFilter = page.locator('[data-testid="filter-tier"], button:has-text("Tier")');
      const industryFilter = page.locator('[data-testid="filter-industry"], button:has-text("Industry")');

      // At least one filter should be visible
      const filtersVisible =
        (await statusFilter.isVisible().catch(() => false)) ||
        (await tierFilter.isVisible().catch(() => false)) ||
        (await industryFilter.isVisible().catch(() => false));

      expect(filtersVisible).toBe(true);
    });

    test('should have New Account button', async ({ page }) => {
      const newAccountButton = page.locator('button:has-text("New Account")');
      await expect(newAccountButton).toBeVisible({ timeout: 10000 });
    });

    test('should display accounts in table format', async ({ page }) => {
      // Check table headers exist
      await expect(page.locator('th:has-text("Account Name"), th:has-text("Name")')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Create Account', () => {
    test('should open create account modal', async ({ page }) => {
      await openNewAccountModal(page);

      // Modal should be visible
      await expect(page.locator('text=Create New Account')).toBeVisible();

      // Form fields should be present
      await expect(page.locator('[name="name"]')).toBeVisible();
    });

    test('should create a new account', async ({ page }) => {
      await openNewAccountModal(page);

      // Fill account information
      await page.fill('[name="name"]', TEST_ACCOUNT.name);

      // Select industry if available
      const industrySelect = page.locator('[name="industry"]');
      if (await industrySelect.isVisible().catch(() => false)) {
        await industrySelect.selectOption(TEST_ACCOUNT.industry);
      }

      // Select company type
      const companyTypeSelect = page.locator('[name="companyType"]');
      if (await companyTypeSelect.isVisible().catch(() => false)) {
        await companyTypeSelect.selectOption(TEST_ACCOUNT.companyType);
      }

      // Fill phone
      const phoneField = page.locator('[name="phone"]');
      if (await phoneField.isVisible().catch(() => false)) {
        await phoneField.fill(TEST_ACCOUNT.phone);
      }

      // Fill website
      const websiteField = page.locator('[name="website"]');
      if (await websiteField.isVisible().catch(() => false)) {
        await websiteField.fill(TEST_ACCOUNT.website);
      }

      // Submit the form
      await page.click('button:has-text("Create Account")');

      // Wait for modal to close
      await expect(page.locator('text=Create New Account')).not.toBeVisible({ timeout: 10000 });

      // Verify account appears in the list
      await page.waitForLoadState('networkidle');
      await expect(page.locator(`text=${TEST_ACCOUNT.name}`)).toBeVisible({ timeout: 10000 });
    });

    test('should show validation error for empty account name', async ({ page }) => {
      await openNewAccountModal(page);

      // Try to submit without name
      await page.click('button:has-text("Create Account")');

      // Should show error or stay on modal
      const isModalStillOpen = await page.locator('text=Create New Account').isVisible();
      expect(isModalStillOpen).toBe(true);
    });
  });

  test.describe('Account Detail', () => {
    test.beforeEach(async ({ page }) => {
      // Create an account first if none exist
      const accountRows = page.locator('tr[data-row], a[href*="/accounts/"]');
      const count = await accountRows.count();

      if (count === 0) {
        // Create an account first
        await openNewAccountModal(page);
        const uniqueName = `Test Account ${Date.now()}`;
        await page.fill('[name="name"]', uniqueName);
        await page.click('button:has-text("Create Account")');
        await expect(page.locator('text=Create New Account')).not.toBeVisible({ timeout: 10000 });
        await page.waitForLoadState('networkidle');
      }
    });

    test('should navigate to account detail page', async ({ page }) => {
      // Click on the first account row/link
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await expect(accountLink).toBeVisible({ timeout: 10000 });
      await accountLink.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/accounts\/[a-z0-9-]+/);
    });

    test('should display account information tabs', async ({ page }) => {
      // Navigate to account detail
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Check for tab structure
      await expect(page.locator('button:has-text("Overview")')).toBeVisible({ timeout: 10000 });
    });

    test('should display edit button on detail page', async ({ page }) => {
      // Navigate to account detail
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Edit button should be visible
      await expect(page.locator('button:has-text("Edit")')).toBeVisible({ timeout: 10000 });
    });

    test('should display delete button on detail page', async ({ page }) => {
      // Navigate to account detail
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Delete button should be visible
      await expect(page.locator('button:has-text("Delete")')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Edit Account', () => {
    test('should open edit mode', async ({ page }) => {
      // Navigate to account detail
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Click edit button
      await page.click('button:has-text("Edit")');

      // Form fields should become editable
      await expect(page.locator('[name="name"]')).toBeVisible({ timeout: 5000 });
    });

    test('should update account name', async ({ page }) => {
      // First create a test account
      await openNewAccountModal(page);
      const originalName = `Original Account ${Date.now()}`;
      await page.fill('[name="name"]', originalName);
      await page.click('button:has-text("Create Account")');
      await expect(page.locator('text=Create New Account')).not.toBeVisible({ timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Click on the account
      await page.click(`text=${originalName}`);
      await page.waitForLoadState('networkidle');

      // Click edit
      await page.click('button:has-text("Edit")');

      // Update the name
      const updatedName = `Updated Account ${Date.now()}`;
      await page.fill('[name="name"]', updatedName);

      // Save changes
      await page.click('button:has-text("Save")');

      // Wait for save
      await page.waitForLoadState('networkidle');

      // Name should be updated
      await expect(page.locator(`text=${updatedName}`)).toBeVisible({ timeout: 10000 });
    });

    test('should update account status', async ({ page }) => {
      // Navigate to first account
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Click edit
      await page.click('button:has-text("Edit")');

      // Change status to active
      const statusSelect = page.locator('[name="status"]');
      if (await statusSelect.isVisible().catch(() => false)) {
        await statusSelect.selectOption('active');
      }

      // Save changes
      await page.click('button:has-text("Save")');

      // Wait for save
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Delete Account', () => {
    test('should show confirmation dialog when deleting', async ({ page }) => {
      // First create a test account to delete
      await openNewAccountModal(page);
      const accountToDelete = `Delete Test Account ${Date.now()}`;
      await page.fill('[name="name"]', accountToDelete);
      await page.click('button:has-text("Create Account")');
      await expect(page.locator('text=Create New Account')).not.toBeVisible({ timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Navigate to the account
      await page.click(`text=${accountToDelete}`);
      await page.waitForLoadState('networkidle');

      // Click delete button
      await page.click('button:has-text("Delete")');

      // Confirmation dialog should appear
      await expect(page.locator('text=Delete Account')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Are you sure')).toBeVisible();
    });

    test('should delete account when confirmed', async ({ page }) => {
      // First create a test account to delete
      await openNewAccountModal(page);
      const accountToDelete = `Account To Delete ${Date.now()}`;
      await page.fill('[name="name"]', accountToDelete);
      await page.click('button:has-text("Create Account")');
      await expect(page.locator('text=Create New Account')).not.toBeVisible({ timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Navigate to the account
      await page.click(`text=${accountToDelete}`);
      await page.waitForLoadState('networkidle');

      // Click delete button
      await page.click('button:has-text("Delete")');

      // Wait for confirmation dialog
      await expect(page.locator('text=Delete Account')).toBeVisible({ timeout: 5000 });

      // Confirm deletion
      await page.click('button:has-text("Delete"):not([disabled])');

      // Should navigate back to list
      await expect(page).toHaveURL(/\/accounts$/);

      // Account should no longer be in list
      await expect(page.locator(`text=${accountToDelete}`)).not.toBeVisible({ timeout: 10000 });
    });

    test('should cancel deletion', async ({ page }) => {
      // Navigate to first account
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Get current account name
      const pageTitle = await page.locator('h1').textContent();

      // Click delete button
      await page.click('button:has-text("Delete")');

      // Wait for confirmation dialog
      await expect(page.locator('text=Delete Account')).toBeVisible({ timeout: 5000 });

      // Cancel deletion
      await page.click('button:has-text("Cancel")');

      // Dialog should close
      await expect(page.locator('text=Delete Account')).not.toBeVisible({ timeout: 5000 });

      // Should still be on same page
      await expect(page.locator(`text=${pageTitle}`)).toBeVisible();
    });
  });

  test.describe('Account Contacts Tab', () => {
    test('should display contacts tab', async ({ page }) => {
      // Navigate to first account
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Contacts tab should be visible
      await expect(page.locator('button:has-text("Contacts")')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to contacts tab', async ({ page }) => {
      // Navigate to first account
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Click contacts tab
      await page.click('button:has-text("Contacts")');

      // Should show contacts section
      await expect(page.locator('text=Points of Contact')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Account Deals Tab', () => {
    test('should display deals tab', async ({ page }) => {
      // Navigate to first account
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Deals tab should be visible
      await expect(page.locator('button:has-text("Deals")')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to deals tab', async ({ page }) => {
      // Navigate to first account
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Click deals tab
      await page.click('button:has-text("Deals")');

      // Should show deals section
      await expect(page.locator('text=Associated Deals')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Back Navigation', () => {
    test('should navigate back to accounts list', async ({ page }) => {
      // Navigate to first account
      const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
      await accountLink.click();
      await page.waitForLoadState('networkidle');

      // Click back button
      await page.click('text=Back to Accounts');

      // Should be back on accounts list
      await expect(page).toHaveURL(/\/accounts$/);
    });
  });
});

test.describe('Accounts API Persistence', () => {
  test('accounts data should persist across page reloads', async ({ page }) => {
    await login(page);

    // Create an account
    await navigateToAccounts(page);
    await openNewAccountModal(page);

    const uniqueName = `Persist Test Account ${Date.now()}`;
    await page.fill('[name="name"]', uniqueName);
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('text=Create New Account')).not.toBeVisible({ timeout: 10000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Account should still be visible
    await expect(page.locator(`text=${uniqueName}`)).toBeVisible({ timeout: 10000 });
  });

  test('account updates should persist', async ({ page }) => {
    await login(page);
    await navigateToAccounts(page);

    // Create a test account
    await openNewAccountModal(page);
    const uniqueName = `Persist Update Test ${Date.now()}`;
    await page.fill('[name="name"]', uniqueName);
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('text=Create New Account')).not.toBeVisible({ timeout: 10000 });

    // Navigate to the account
    await page.click(`text=${uniqueName}`);
    await page.waitForLoadState('networkidle');

    // Edit and update
    await page.click('button:has-text("Edit")');
    const updatedName = `${uniqueName} Updated`;
    await page.fill('[name="name"]', updatedName);
    await page.click('button:has-text("Save")');
    await page.waitForLoadState('networkidle');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Updated name should still be visible
    await expect(page.locator(`text=${updatedName}`)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Accounts Screenshots', () => {
  test('capture accounts list page', async ({ page }) => {
    await login(page);
    await navigateToAccounts(page);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/accounts-list.png', fullPage: true });
  });

  test('capture account detail page', async ({ page }) => {
    await login(page);
    await navigateToAccounts(page);

    // Navigate to first account
    const accountLink = page.locator('tr[data-row], a[href*="/accounts/"]').first();
    if (await accountLink.isVisible().catch(() => false)) {
      await accountLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/account-detail.png', fullPage: true });
    }
  });
});
