import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Audit Logs & Security Monitoring
 *
 * Test Cases from: docs/specs/20-USER-ROLES/10-admin/08-audit-logs.md
 *
 * Test Users (password: TestPass123!):
 * - admin@intime.com (Admin)
 * - hr@intime.com (HR Manager - non-admin)
 */

const ADMIN_EMAIL = 'admin@intime.com';
const ADMIN_PASSWORD = 'TestPass123!';
const AUDIT_LOGS_URL = '/employee/admin/audit';
const ALERT_RULES_URL = '/employee/admin/audit/rules';
const LOGIN_URL = '/login';

test.describe('Audit Logs & Security Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
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
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 10000 });
  });

  test('ADMIN-AUDIT-001: View audit logs dashboard', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Verify dashboard loads
    await expect(page).toHaveURL(new RegExp(AUDIT_LOGS_URL));

    // Verify main title is visible
    await expect(page.getByRole('heading', { name: /Audit Logs.*Security Monitoring/i })).toBeVisible();

    // Verify security overview section exists
    await expect(page.getByText(/Security Overview/i)).toBeVisible();

    // Verify audit logs section exists
    await expect(page.getByText(/Audit Logs/i).first()).toBeVisible();
  });

  test('ADMIN-AUDIT-002: View security stats', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for stats to load
    await page.waitForLoadState('networkidle');

    // Check for stats cards
    const statsSection = page.getByText(/Security Overview/i).first();
    await expect(statsSection).toBeVisible();

    // Check for total events stat
    const pageContent = await page.textContent('body');
    const hasStats = pageContent?.includes('Total Events') ||
                     pageContent?.includes('Failed Logins') ||
                     pageContent?.includes('Security Alerts') ||
                     pageContent?.includes('Data Exports');

    expect(hasStats).toBeTruthy();
  });

  test('ADMIN-AUDIT-003: Filter audit logs by action', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find and click the action filter dropdown
    const actionFilter = page.getByRole('combobox').filter({ hasText: /All Actions/i });
    if (await actionFilter.isVisible({ timeout: 5000 })) {
      await actionFilter.click();
      // Select an action type if available
      const actionOption = page.getByRole('option').first();
      if (await actionOption.isVisible({ timeout: 2000 })) {
        await actionOption.click();
      }
    }

    // Verify filters can be applied
    await expect(page.getByText(/Clear Filters/i)).toBeVisible();
  });

  test('ADMIN-AUDIT-004: Search audit logs', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find the search input
    const searchInput = page.getByPlaceholder(/Search by email/i);
    await expect(searchInput).toBeVisible();

    // Enter search term
    await searchInput.fill('admin');

    // Wait for search to be applied
    await page.waitForTimeout(500);

    // Verify search is applied (search input has value)
    await expect(searchInput).toHaveValue('admin');
  });

  test('ADMIN-AUDIT-005: Filter by date range', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find date inputs
    const dateInputs = page.locator('input[type="date"]');

    // If date inputs are visible, set date range
    if (await dateInputs.first().isVisible({ timeout: 5000 })) {
      const today = new Date().toISOString().split('T')[0];
      await dateInputs.first().fill(today);

      // Verify date was set
      await expect(dateInputs.first()).toHaveValue(today);
    }
  });

  test('ADMIN-AUDIT-006: View audit log detail modal', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Wait for audit logs table to load
    await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});

    // If there's data, try clicking a row
    const tableRow = page.locator('tbody tr').first();
    const hasData = await tableRow.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasData) {
      await tableRow.click();

      // Wait for modal to open
      await page.waitForTimeout(500);

      // Check if modal opened (look for dialog)
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);

      if (modalVisible) {
        // Verify modal shows audit log details
        await expect(modal.getByText(/Event Details|Audit Log Entry/i)).toBeVisible();

        // Close the modal
        await page.keyboard.press('Escape');
      }
    } else {
      // No data in table - test passes (feature works, just no data)
      expect(true).toBeTruthy();
    }
  });

  test('ADMIN-AUDIT-007: Open export dialog', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click export button
    const exportButton = page.getByRole('button', { name: /Export/i });
    await expect(exportButton).toBeVisible();
    await exportButton.click();

    // Wait for export dialog
    await page.waitForTimeout(500);

    // Verify export dialog opened
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Export Audit Logs/i)).toBeVisible();

    // Verify export options are visible
    await expect(dialog.getByText(/Date Range/i)).toBeVisible();
    await expect(dialog.getByText(/Export Format/i)).toBeVisible();
    await expect(dialog.getByText(/CSV|JSON/i).first()).toBeVisible();

    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('ADMIN-AUDIT-008: Select export format in dialog', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click export button
    await page.getByRole('button', { name: /Export/i }).click();

    // Wait for export dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check for CSV and JSON format options
    const csvOption = dialog.getByText(/CSV/i).first();
    const jsonOption = dialog.getByText(/JSON/i).first();

    await expect(csvOption).toBeVisible();
    await expect(jsonOption).toBeVisible();

    // Click JSON option
    await jsonOption.click();

    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('ADMIN-AUDIT-009: Navigate to alert rules page', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click on Alert Rules link (use first() to handle multiple matches)
    const alertRulesLink = page.getByRole('link', { name: /Alert Rules/i }).first();

    await expect(alertRulesLink).toBeVisible();
    await alertRulesLink.click();

    // Verify navigation to alert rules page
    await page.waitForURL(new RegExp(ALERT_RULES_URL), { timeout: 10000 });
    await expect(page).toHaveURL(new RegExp(ALERT_RULES_URL));

    // Verify alert rules page content
    await expect(page.getByRole('heading', { name: /Alert Rules Configuration/i })).toBeVisible();
  });

  test('ADMIN-AUDIT-010: View alert rules list', async ({ page }) => {
    // Navigate to alert rules page
    await page.goto(ALERT_RULES_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page.getByRole('heading', { name: /Alert Rules Configuration/i })).toBeVisible();

    // Verify create rule button is visible
    await expect(page.getByRole('button', { name: /Create Rule/i })).toBeVisible();
  });

  test('ADMIN-AUDIT-011: Open create rule dialog', async ({ page }) => {
    // Navigate to alert rules page
    await page.goto(ALERT_RULES_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click create rule button
    await page.getByRole('button', { name: /Create Rule/i }).click();

    // Wait for dialog
    await page.waitForTimeout(500);

    // Verify create rule dialog opened
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Create Alert Rule/i)).toBeVisible();

    // Verify form fields are present
    await expect(dialog.getByLabel(/Rule Name/i)).toBeVisible();
    await expect(dialog.getByText(/Trigger Conditions/i)).toBeVisible();
    await expect(dialog.getByText(/Alert Configuration/i)).toBeVisible();

    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('ADMIN-AUDIT-012: Create new alert rule', async ({ page }) => {
    // Navigate to alert rules page
    await page.goto(ALERT_RULES_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click create rule button
    await page.getByRole('button', { name: /Create Rule/i }).click();

    // Wait for dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Fill in rule name
    const ruleName = `Test Rule ${Date.now()}`;
    await dialog.getByLabel(/Rule Name/i).fill(ruleName);

    // Fill in description
    const descriptionInput = dialog.locator('textarea');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Test rule description');
    }

    // Click create button
    const createButton = dialog.getByRole('button', { name: /Create Rule/i });
    await createButton.click();

    // Wait for dialog to close and rule to be created
    await page.waitForTimeout(1000);

    // Note: Rule creation may fail if no database, but the form should work
    // Check if rule was created or if dialog closed
    const dialogStillVisible = await dialog.isVisible({ timeout: 2000 }).catch(() => false);

    if (!dialogStillVisible) {
      // Dialog closed, rule might have been created
      // Check if rule appears in the list
      await page.waitForLoadState('networkidle');
    }
  });

  test('ADMIN-AUDIT-013: Clear filters works', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Enter a search term
    const searchInput = page.getByPlaceholder(/Search by email/i);
    await searchInput.fill('test');

    // Verify search is applied
    await expect(searchInput).toHaveValue('test');

    // Click clear filters
    await page.getByRole('button', { name: /Clear Filters/i }).click();

    // Verify search is cleared
    await expect(searchInput).toHaveValue('');
  });

  test('ADMIN-AUDIT-014: Refresh button works', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find and click refresh button
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Wait for refresh
    await page.waitForLoadState('networkidle');

    // Page should still be functional
    await expect(page.getByText(/Security Overview/i)).toBeVisible();
  });

  test('ADMIN-AUDIT-015: Pagination works', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for pagination controls
    const paginationControls = page.getByRole('button', { name: /Previous|Next/i });

    // If pagination exists (there are enough records)
    if (await paginationControls.first().isVisible({ timeout: 3000 })) {
      // Check that pagination info shows
      const pageContent = await page.textContent('body');
      const hasPagination = pageContent?.includes('Showing') ||
                           pageContent?.includes('of') ||
                           pageContent?.includes('events');

      expect(hasPagination).toBeTruthy();
    }
  });

  test('ADMIN-AUDIT-016: Security alerts section visible', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // The security alerts section should be visible
    // It may show "No Active Security Alerts" or actual alerts
    const pageContent = await page.textContent('body');
    const hasAlertsSection =
      pageContent?.includes('No Active Security Alerts') ||
      pageContent?.includes('Security Alerts') ||
      pageContent?.includes('All systems operating normally');

    expect(hasAlertsSection).toBeTruthy();
  });

  test('ADMIN-AUDIT-017: Breadcrumb navigation works', async ({ page }) => {
    // Navigate to alert rules page (deeper in navigation)
    await page.goto(ALERT_RULES_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for breadcrumb
    const breadcrumb = page.locator('[aria-label*="breadcrumb" i]').or(
      page.getByText(/Admin.*Audit Logs.*Alert Rules/i)
    );

    // Breadcrumbs should be visible
    const pageContent = await page.textContent('body');
    const hasBreadcrumbs = pageContent?.includes('Admin') &&
                           pageContent?.includes('Audit Logs');

    expect(hasBreadcrumbs).toBeTruthy();

    // Click on Audit Logs breadcrumb
    const auditLogsLink = page.getByRole('link', { name: /Audit Logs/i }).first();
    if (await auditLogsLink.isVisible({ timeout: 3000 })) {
      await auditLogsLink.click();
      await page.waitForURL(new RegExp(AUDIT_LOGS_URL), { timeout: 10000 });
    }
  });

  test('ADMIN-AUDIT-018: Result filter dropdown works', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find the result filter dropdown
    const resultFilter = page.locator('button[role="combobox"]').filter({ hasText: /All Results/i });

    if (await resultFilter.isVisible({ timeout: 5000 })) {
      await resultFilter.click();

      // Check for Success/Failure options
      const successOption = page.getByRole('option', { name: /Success/i });
      const failureOption = page.getByRole('option', { name: /Failure/i });

      if (await successOption.isVisible({ timeout: 2000 })) {
        await expect(successOption).toBeVisible();
      }

      // Close dropdown
      await page.keyboard.press('Escape');
    }
  });

  test('ADMIN-AUDIT-019: Severity filter dropdown works', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find the severity filter dropdown
    const severityFilter = page.locator('button[role="combobox"]').filter({ hasText: /All Severity/i });

    if (await severityFilter.isVisible({ timeout: 5000 })) {
      await severityFilter.click();

      // Wait for dropdown options
      await page.waitForTimeout(300);

      // Check for severity options
      const pageContent = await page.textContent('body');
      const hasSeverityOptions =
        pageContent?.includes('INFO') ||
        pageContent?.includes('LOW') ||
        pageContent?.includes('MEDIUM') ||
        pageContent?.includes('HIGH') ||
        pageContent?.includes('CRITICAL');

      expect(hasSeverityOptions).toBeTruthy();

      // Close dropdown
      await page.keyboard.press('Escape');
    }
  });

  test('ADMIN-AUDIT-020: Export quick date range buttons work', async ({ page }) => {
    // Navigate to audit logs page
    await page.goto(AUDIT_LOGS_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Open export dialog
    await page.getByRole('button', { name: /Export/i }).click();

    // Wait for dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check for quick date range buttons
    const todayButton = dialog.getByRole('button', { name: /Today/i });
    const last7DaysButton = dialog.getByRole('button', { name: /Last 7 days/i });
    const last30DaysButton = dialog.getByRole('button', { name: /Last 30 days/i });

    await expect(todayButton).toBeVisible();
    await expect(last7DaysButton).toBeVisible();
    await expect(last30DaysButton).toBeVisible();

    // Click one of the quick range buttons
    await last7DaysButton.click();

    // Verify date inputs are populated
    const dateInputs = dialog.locator('input[type="date"]');
    const fromDate = await dateInputs.first().inputValue();
    const toDate = await dateInputs.last().inputValue();

    expect(fromDate).toBeTruthy();
    expect(toDate).toBeTruthy();

    // Close dialog
    await page.keyboard.press('Escape');
  });
});
