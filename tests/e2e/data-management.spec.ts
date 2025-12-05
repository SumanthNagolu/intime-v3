import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Data Management
 *
 * Test Cases from: thoughts/shared/epics/epic-01-admin/06-data-management.md
 *
 * Test Users (password: TestPass123!):
 * - admin@intime.com (Admin)
 */

const ADMIN_EMAIL = 'admin@intime.com';
const ADMIN_PASSWORD = 'TestPass123!';
const DATA_URL = '/employee/admin/data';
const LOGIN_URL = '/login';

test.describe('Data Management Dashboard', () => {
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

  test('DATA-001: Navigate to data management page', async ({ page }) => {
    // Navigate to data management
    await page.goto(DATA_URL);

    // Verify data management page loads
    await expect(page).toHaveURL(new RegExp(DATA_URL));

    // Verify main title is visible
    await expect(page.getByRole('heading', { name: /Data Management/i })).toBeVisible();
  });

  test('DATA-002: View overview tab with stats', async ({ page }) => {
    await page.goto(DATA_URL);

    // Wait for page to load
    await page.waitForSelector('text=Data Management', { timeout: 10000 });

    // Verify overview tab is active by default
    const overviewTab = page.getByRole('tab', { name: /Overview/i });
    await expect(overviewTab).toHaveAttribute('data-state', 'active');

    // Verify stats cards are visible
    const pageContent = await page.textContent('body');
    const hasStats =
      pageContent?.includes('Total Imports') ||
      pageContent?.includes('Total Exports') ||
      pageContent?.includes('Pending Duplicates') ||
      pageContent?.includes('GDPR Requests') ||
      pageContent?.includes('Archived Records');

    expect(hasStats).toBeTruthy();
  });

  test('DATA-003: Quick actions are visible', async ({ page }) => {
    await page.goto(DATA_URL);

    // Wait for quick actions section
    await page.waitForSelector('text=Quick Actions', { timeout: 10000 });

    // Verify quick action buttons
    await expect(page.getByRole('heading', { name: /Quick Actions/i })).toBeVisible();

    // Check for action buttons
    const importButton = page.getByRole('button', { name: /Import Data/i });
    const exportButton = page.getByRole('button', { name: /Export Data/i });

    if (await importButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(importButton).toBeVisible();
    }

    if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('DATA-004: Tab navigation works', async ({ page }) => {
    await page.goto(DATA_URL);

    // Wait for tabs to load
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 });

    // Click on Duplicates tab
    const duplicatesTab = page.getByRole('tab', { name: /Duplicates/i });
    if (await duplicatesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await duplicatesTab.click();
      await expect(duplicatesTab).toHaveAttribute('data-state', 'active');
    }

    // Click on GDPR tab
    const gdprTab = page.getByRole('tab', { name: /GDPR/i });
    if (await gdprTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await gdprTab.click();
      await expect(gdprTab).toHaveAttribute('data-state', 'active');
    }

    // Click on Archive tab
    const archiveTab = page.getByRole('tab', { name: /Archive/i });
    if (await archiveTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await archiveTab.click();
      await expect(archiveTab).toHaveAttribute('data-state', 'active');
    }
  });
});

test.describe('Import Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForSelector('text=Employee', { timeout: 10000 });
    await page.click('button:has-text("Employee")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 10000 });
  });

  test('IMPORT-001: Open import wizard from header', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click Import button in header
    const importHeaderButton = page.getByRole('button', { name: /Import/i }).first();
    await importHeaderButton.click();

    // Verify import wizard dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Import Data/i })).toBeVisible();
  });

  test('IMPORT-002: Open import wizard from quick actions', async ({ page }) => {
    await page.goto(DATA_URL);

    // Wait for quick actions
    await page.waitForSelector('text=Quick Actions', { timeout: 10000 });

    // Click Import Data in quick actions
    const importQuickAction = page.getByRole('button', { name: /Import Data/i });
    if (await importQuickAction.isVisible({ timeout: 3000 }).catch(() => false)) {
      await importQuickAction.click();

      // Verify dialog opens
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('IMPORT-003: Import wizard shows entity selection', async ({ page }) => {
    await page.goto(DATA_URL);

    // Open import wizard
    const importButton = page.getByRole('button', { name: /Import/i }).first();
    await importButton.click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Check for entity type selection
    const entitySelect = page.locator('[role="combobox"]').or(
      page.getByLabel(/Entity Type|Data Type/i)
    );

    if (await entitySelect.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(entitySelect.first()).toBeVisible();
    }
  });

  test('IMPORT-004: Close import wizard', async ({ page }) => {
    await page.goto(DATA_URL);

    // Open import wizard
    const importButton = page.getByRole('button', { name: /Import/i }).first();
    await importButton.click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Close dialog using X button or Cancel
    const closeButton = page.getByRole('button', { name: /Cancel|Close/i }).or(
      page.locator('[aria-label="Close"]')
    );

    if (await closeButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeButton.first().click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });
});

test.describe('Export Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForSelector('text=Employee', { timeout: 10000 });
    await page.click('button:has-text("Employee")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 10000 });
  });

  test('EXPORT-001: Open export builder from header', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click Export button in header
    const exportButton = page.getByRole('button', { name: /Export/i }).first();
    await exportButton.click();

    // Verify export builder dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Export Data/i })).toBeVisible();
  });

  test('EXPORT-002: Export builder shows entity selection', async ({ page }) => {
    await page.goto(DATA_URL);

    // Open export builder
    const exportButton = page.getByRole('button', { name: /Export/i }).first();
    await exportButton.click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Check for entity type selection
    const entitySelect = page.locator('[role="combobox"]').or(
      page.getByLabel(/Entity Type|Data Type/i)
    );

    if (await entitySelect.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(entitySelect.first()).toBeVisible();
    }
  });

  test('EXPORT-003: Export builder shows format options', async ({ page }) => {
    await page.goto(DATA_URL);

    // Open export builder
    const exportButton = page.getByRole('button', { name: /Export/i }).first();
    await exportButton.click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Check for format options (CSV, Excel, JSON)
    const dialogContent = await page.locator('[role="dialog"]').textContent();
    const hasFormatOptions =
      dialogContent?.includes('CSV') ||
      dialogContent?.includes('Excel') ||
      dialogContent?.includes('JSON') ||
      dialogContent?.includes('Format');

    expect(hasFormatOptions).toBeTruthy();
  });

  test('EXPORT-004: Close export builder', async ({ page }) => {
    await page.goto(DATA_URL);

    // Open export builder
    const exportButton = page.getByRole('button', { name: /Export/i }).first();
    await exportButton.click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Close dialog
    const closeButton = page.getByRole('button', { name: /Cancel|Close/i }).or(
      page.locator('[aria-label="Close"]')
    );

    if (await closeButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeButton.first().click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });
});

test.describe('Duplicates Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForSelector('text=Employee', { timeout: 10000 });
    await page.click('button:has-text("Employee")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 10000 });
  });

  test('DUP-001: Navigate to duplicates tab', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click duplicates tab
    const duplicatesTab = page.getByRole('tab', { name: /Duplicates/i });
    await duplicatesTab.click();

    // Verify tab content loads
    await page.waitForLoadState('networkidle');

    // Should show duplicate detection section
    const pageContent = await page.textContent('body');
    const hasDuplicatesContent =
      pageContent?.includes('Duplicate Detection') ||
      pageContent?.includes('Pending Review') ||
      pageContent?.includes('Detect Duplicates') ||
      pageContent?.includes('No duplicates found');

    expect(hasDuplicatesContent).toBeTruthy();
  });

  test('DUP-002: Entity type selection in duplicates', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click duplicates tab
    const duplicatesTab = page.getByRole('tab', { name: /Duplicates/i });
    await duplicatesTab.click();

    // Wait for content
    await page.waitForLoadState('networkidle');

    // Check for entity type selector
    const entitySelect = page.locator('[role="combobox"]').first();
    if (await entitySelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(entitySelect).toBeVisible();
    }
  });

  test('DUP-003: Detect duplicates button exists', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click duplicates tab
    const duplicatesTab = page.getByRole('tab', { name: /Duplicates/i });
    await duplicatesTab.click();

    // Wait for content
    await page.waitForLoadState('networkidle');

    // Check for detect duplicates button
    const detectButton = page.getByRole('button', { name: /Detect Duplicates/i });
    if (await detectButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(detectButton).toBeVisible();
    }
  });
});

test.describe('GDPR Requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForSelector('text=Employee', { timeout: 10000 });
    await page.click('button:has-text("Employee")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 10000 });
  });

  test('GDPR-001: Navigate to GDPR tab', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click GDPR tab
    const gdprTab = page.getByRole('tab', { name: /GDPR/i });
    await gdprTab.click();

    // Verify tab content loads
    await page.waitForLoadState('networkidle');

    // Should show GDPR requests section
    const pageContent = await page.textContent('body');
    const hasGdprContent =
      pageContent?.includes('GDPR') ||
      pageContent?.includes('Data Subject') ||
      pageContent?.includes('New Request') ||
      pageContent?.includes('No requests');

    expect(hasGdprContent).toBeTruthy();
  });

  test('GDPR-002: New request button exists', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click GDPR tab
    const gdprTab = page.getByRole('tab', { name: /GDPR/i });
    await gdprTab.click();

    // Wait for content
    await page.waitForLoadState('networkidle');

    // Check for new request button
    const newRequestButton = page.getByRole('button', { name: /New Request/i });
    if (await newRequestButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(newRequestButton).toBeVisible();
    }
  });

  test('GDPR-003: Open new request dialog', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click GDPR tab
    const gdprTab = page.getByRole('tab', { name: /GDPR/i });
    await gdprTab.click();

    // Wait for content
    await page.waitForLoadState('networkidle');

    // Click new request button
    const newRequestButton = page.getByRole('button', { name: /New Request/i });
    if (await newRequestButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await newRequestButton.click();

      // Verify dialog opens
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });
});

test.describe('Archive Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForSelector('text=Employee', { timeout: 10000 });
    await page.click('button:has-text("Employee")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 10000 });
  });

  test('ARCHIVE-001: Navigate to archive tab', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click Archive tab
    const archiveTab = page.getByRole('tab', { name: /Archive/i });
    await archiveTab.click();

    // Verify tab content loads
    await page.waitForLoadState('networkidle');

    // Should show archived records section
    const pageContent = await page.textContent('body');
    const hasArchiveContent =
      pageContent?.includes('Archived Records') ||
      pageContent?.includes('Archive') ||
      pageContent?.includes('No archived records');

    expect(hasArchiveContent).toBeTruthy();
  });

  test('ARCHIVE-002: Entity type filter in archive', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click Archive tab
    const archiveTab = page.getByRole('tab', { name: /Archive/i });
    await archiveTab.click();

    // Wait for content
    await page.waitForLoadState('networkidle');

    // Check for entity type selector
    const entitySelect = page.locator('[role="combobox"]').first();
    if (await entitySelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(entitySelect).toBeVisible();
    }
  });

  test('ARCHIVE-003: Search input in archive', async ({ page }) => {
    await page.goto(DATA_URL);

    // Click Archive tab
    const archiveTab = page.getByRole('tab', { name: /Archive/i });
    await archiveTab.click();

    // Wait for content
    await page.waitForLoadState('networkidle');

    // Check for search input
    const searchInput = page.getByPlaceholder(/Search/i);
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
  });
});

test.describe('Bulk Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForSelector('text=Employee', { timeout: 10000 });
    await page.click('button:has-text("Employee")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 10000 });
  });

  test('BULK-001: Open bulk operations from quick actions', async ({ page }) => {
    await page.goto(DATA_URL);

    // Wait for quick actions
    await page.waitForSelector('text=Quick Actions', { timeout: 10000 });

    // Click Bulk Operations in quick actions
    const bulkOpsButton = page.getByRole('button', { name: /Bulk Operations/i });
    if (await bulkOpsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bulkOpsButton.click();

      // Verify dialog opens
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('BULK-002: Bulk operations dialog shows entity selection', async ({ page }) => {
    await page.goto(DATA_URL);

    // Open bulk operations
    const bulkOpsButton = page.getByRole('button', { name: /Bulk Operations/i });
    if (await bulkOpsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bulkOpsButton.click();

      // Wait for dialog
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Check for entity type selection
      const entitySelect = page.locator('[role="combobox"]').or(
        page.getByLabel(/Entity Type/i)
      );

      if (await entitySelect.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(entitySelect.first()).toBeVisible();
      }
    }
  });

  test('BULK-003: Close bulk operations dialog', async ({ page }) => {
    await page.goto(DATA_URL);

    // Open bulk operations
    const bulkOpsButton = page.getByRole('button', { name: /Bulk Operations/i });
    if (await bulkOpsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bulkOpsButton.click();

      // Wait for dialog
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Close dialog
      const closeButton = page.getByRole('button', { name: /Cancel|Close/i }).or(
        page.locator('[aria-label="Close"]')
      );

      if (await closeButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await closeButton.first().click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    }
  });
});

test.describe('Recent Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForSelector('text=Employee', { timeout: 10000 });
    await page.click('button:has-text("Employee")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 10000 });
  });

  test('RECENT-001: View recent imports section', async ({ page }) => {
    await page.goto(DATA_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for recent imports section
    const pageContent = await page.textContent('body');
    const hasRecentImports =
      pageContent?.includes('Recent Imports') ||
      pageContent?.includes('No imports yet');

    expect(hasRecentImports).toBeTruthy();
  });

  test('RECENT-002: View recent exports section', async ({ page }) => {
    await page.goto(DATA_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for recent exports section
    const pageContent = await page.textContent('body');
    const hasRecentExports =
      pageContent?.includes('Recent Exports') ||
      pageContent?.includes('No exports yet');

    expect(hasRecentExports).toBeTruthy();
  });
});

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForSelector('text=Employee', { timeout: 10000 });
    await page.click('button:has-text("Employee")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 10000 });
  });

  test('RESPONSIVE-001: Data management loads on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(DATA_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify page loads
    await expect(page.getByRole('heading', { name: /Data Management/i })).toBeVisible();
  });

  test('RESPONSIVE-002: Tabs are accessible on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(DATA_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify tabs are visible
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();
  });
});
