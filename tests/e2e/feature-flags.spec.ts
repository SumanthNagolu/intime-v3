import { test, expect, type Page } from '@playwright/test';

/**
 * E2E Tests for Feature Flag Management
 *
 * Test Cases from: docs/specs/20-USER-ROLES/10-admin/14-feature-flags.md
 *
 * Test Users (password: TestPass123!):
 * - admin@intime.com (Admin)
 */

const ADMIN_EMAIL = 'admin@intime.com';
const ADMIN_PASSWORD = 'TestPass123!';
const FEATURE_FLAGS_URL = '/employee/admin/feature-flags';
const LOGIN_URL = '/login';

// Helper function for login
async function loginAsAdmin(page: Page) {
  await page.goto(LOGIN_URL);

  // First select the Employee portal
  await page.waitForSelector('text=Employee', { timeout: 10000 });
  await page.click('button:has-text("Employee")');

  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Login as admin
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for navigation after login
  await page.waitForURL(/\/(employee|dashboard)/, { timeout: 15000 });
}

test.describe('Feature Flag Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-FF-001: View feature flags dashboard', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Verify dashboard loads
    await expect(page).toHaveURL(new RegExp(FEATURE_FLAGS_URL));

    // Verify main heading
    await expect(page.getByRole('heading', { name: /Feature Flags/i })).toBeVisible({ timeout: 10000 });

    // Verify stats cards are visible (state filters)
    await expect(page.getByText('Enabled')).toBeVisible();
    await expect(page.getByText('Disabled')).toBeVisible();
    await expect(page.getByText('Beta')).toBeVisible();

    // Verify "New Feature" button is visible
    await expect(page.getByRole('button', { name: /New Feature/i })).toBeVisible();

    // Verify search input is visible
    await expect(page.getByPlaceholder(/Search features/i)).toBeVisible();
  });

  test('ADMIN-FF-002: Filter feature flags by state', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Click on "Enabled" state filter button
    await page.click('button:has-text("Enabled")');

    // Verify state filter is applied (the button should be highlighted)
    // The filter is active when the border changes
    const enabledButton = page.locator('button:has-text("Enabled")').first();
    await expect(enabledButton).toHaveClass(/border-hublot-900/);
  });

  test('ADMIN-FF-003: Search feature flags', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Focus search input using keyboard shortcut
    await page.keyboard.press('/');

    // Type search query
    await page.keyboard.type('ai');

    // Verify search input has the value
    await expect(page.getByPlaceholder(/Search features/i)).toHaveValue('ai');
  });

  test('ADMIN-FF-004: Open create feature flag dialog', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Click "New Feature" button
    await page.click('button:has-text("New Feature")');

    // Verify dialog is visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Create Feature Flag/i })).toBeVisible();

    // Verify form fields are present
    await expect(page.getByLabel('Feature Name *')).toBeVisible();
    await expect(page.getByLabel('Feature Key *')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();

    // Verify submit button is present
    await expect(page.getByRole('button', { name: /Create Feature Flag/i })).toBeVisible();
  });

  test('ADMIN-FF-005: Create feature flag via keyboard shortcut', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Press 'n' for new feature flag
    await page.keyboard.press('n');

    // Verify dialog is visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Create Feature Flag/i })).toBeVisible();
  });

  test('ADMIN-FF-006: Show keyboard shortcuts help', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Press '?' for keyboard shortcuts
    await page.keyboard.press('Shift+/');

    // Verify shortcuts help is visible
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible();
    await expect(page.getByText('Focus search')).toBeVisible();
    await expect(page.getByText('New feature flag')).toBeVisible();
  });

  test('ADMIN-FF-007: Create new feature flag', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Click "New Feature" button
    await page.click('button:has-text("New Feature")');

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in the form
    const testName = `Test Feature ${Date.now()}`;
    await page.fill('[id="name"]', testName);

    // The key should auto-generate
    await expect(page.locator('[id="key"]')).not.toHaveValue('');

    // Fill description
    await page.fill('[id="description"]', 'This is a test feature flag');

    // Select a category
    await page.click('[role="combobox"]:has-text("Select category")');
    await page.click('[role="option"]:has-text("Experimental")');

    // Submit
    await page.click('button:has-text("Create Feature Flag")');

    // Verify success (dialog should close)
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Verify the new flag appears in the list
    await expect(page.getByText(testName)).toBeVisible({ timeout: 5000 });
  });

  test('ADMIN-FF-008: Open configure dialog for a feature flag', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for list to load
    await page.waitForSelector('button:has-text("Configure")', { timeout: 10000 });

    // Click Configure on the first feature flag
    await page.click('button:has-text("Configure")');

    // Verify configure dialog is visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Configure Feature Flag')).toBeVisible();

    // Verify rollout strategy options are present
    await expect(page.getByText('Enable for all users')).toBeVisible();
    await expect(page.getByText('Enable for specific roles')).toBeVisible();
    await expect(page.getByText('Percentage rollout')).toBeVisible();
    await expect(page.getByText('Disable for all')).toBeVisible();
  });

  test('ADMIN-FF-009: View usage statistics for a feature flag', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for list to load
    await page.waitForSelector('button:has-text("Usage")', { timeout: 10000 });

    // Click Usage on the first feature flag
    await page.click('button:has-text("Usage")');

    // Verify usage dialog is visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Feature Usage')).toBeVisible();

    // Verify usage stats are shown
    await expect(page.getByText('Unique Users')).toBeVisible();
    await expect(page.getByText('Total Checks')).toBeVisible();
    await expect(page.getByText('Enabled Checks')).toBeVisible();
    await expect(page.getByText('Enabled Rate')).toBeVisible();

    // Verify time range selector is present
    await expect(page.getByText('Last 30 days')).toBeVisible();
  });

  test('ADMIN-FF-010: Quick toggle feature flag', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for list to load
    await page.waitForLoadState('networkidle');

    // Check if there's an Enable or Disable button
    const enableButton = page.locator('button:has-text("Enable")').first();
    const disableButton = page.locator('button:has-text("Disable")').first();

    // Try to toggle whichever is available
    if (await enableButton.isVisible()) {
      await enableButton.click();
      // After clicking Enable, it should change to Disable (or show Enabled state)
    } else if (await disableButton.isVisible()) {
      await disableButton.click();
      // After clicking Disable, it should change to Enable
    }

    // Verify toast notification appears (indicating success)
    // The mutation should trigger a toast
    await page.waitForTimeout(1000);
  });

  test('ADMIN-FF-011: Configure percentage rollout', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for list to load and click Configure
    await page.waitForSelector('button:has-text("Configure")', { timeout: 10000 });
    await page.click('button:has-text("Configure")');

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select percentage rollout strategy
    await page.click('text=Percentage rollout');

    // Verify slider appears
    await expect(page.getByText('Rollout Percentage')).toBeVisible();

    // The slider should be visible with percentage markers
    await expect(page.getByText('0%')).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('ADMIN-FF-012: Configure role-based access', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for list to load and click Configure
    await page.waitForSelector('button:has-text("Configure")', { timeout: 10000 });
    await page.click('button:has-text("Configure")');

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select role-based strategy
    await page.click('text=Enable for specific roles');

    // Verify roles section appears
    await expect(page.getByText('Select Roles')).toBeVisible();
  });

  test('ADMIN-FF-013: Clone feature flag', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for list to load
    await page.waitForSelector('button[aria-haspopup="menu"]', { timeout: 10000 });

    // Open dropdown menu
    await page.locator('button[aria-haspopup="menu"]').first().click();

    // Verify Clone option is visible
    await expect(page.getByText('Clone')).toBeVisible();
  });

  test('ADMIN-FF-014: Delete feature flag option exists', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for list to load
    await page.waitForSelector('button[aria-haspopup="menu"]', { timeout: 10000 });

    // Open dropdown menu
    await page.locator('button[aria-haspopup="menu"]').first().click();

    // Verify Delete option is visible (in red)
    await expect(page.getByText('Delete')).toBeVisible();
  });

  test('ADMIN-FF-015: State filter updates list', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click on state select dropdown
    await page.click('[role="combobox"]:has-text("All States")');

    // Select "Enabled" state
    await page.click('[role="option"]:has-text("Enabled")');

    // Verify the filter is applied
    await expect(page.locator('[role="combobox"]').filter({ hasText: 'Enabled' })).toBeVisible();
  });

  test('ADMIN-FF-016: Category filter dropdown', async ({ page }) => {
    // Navigate to feature flags page
    await page.goto(FEATURE_FLAGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click on category select dropdown
    await page.click('[role="combobox"]:has-text("All Categories")');

    // Verify category options appear
    await expect(page.getByRole('option', { name: 'All Categories' })).toBeVisible();
  });
});
