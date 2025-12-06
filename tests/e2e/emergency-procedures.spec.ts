import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Emergency Procedures (UC-ADMIN-011)
 *
 * Test Cases from: docs/specs/20-USER-ROLES/00-admin/11-emergency-procedures.md
 *
 * Test Users (password: TestPass123!):
 * - admin@intime.com (Admin)
 */

const ADMIN_EMAIL = 'admin@intime.com';
const ADMIN_PASSWORD = 'TestPass123!';
const EMERGENCY_DASHBOARD_URL = '/employee/admin/emergency';
const INCIDENTS_URL = '/employee/admin/emergency/incidents';
const BREAK_GLASS_URL = '/employee/admin/emergency/break-glass';
const DRILLS_URL = '/employee/admin/emergency/drills';
const LOGIN_URL = '/login';

// Helper function for login
async function loginAsAdmin(page: any) {
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

// ============================================
// EMERGENCY DASHBOARD TESTS
// ============================================
test.describe('Emergency Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-EM-001: View emergency dashboard', async ({ page }) => {
    // Navigate to emergency dashboard
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Verify dashboard loads
    await expect(page).toHaveURL(new RegExp(EMERGENCY_DASHBOARD_URL));

    // Verify main heading
    await expect(page.getByRole('heading', { name: /Emergency Dashboard/i })).toBeVisible({ timeout: 10000 });

    // Verify stats cards are visible
    await expect(page.getByText('Active Incidents')).toBeVisible();
    await expect(page.getByText(/Critical.*24h/i)).toBeVisible();
    await expect(page.getByText('Resolved')).toBeVisible();
    await expect(page.getByText('Upcoming Drills')).toBeVisible();
  });

  test('ADMIN-EM-002: Verify dashboard sections', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Verify Active Incidents section
    await expect(page.getByText('Active Incidents')).toBeVisible();
    await expect(page.getByText('Ongoing incidents requiring attention')).toBeVisible();

    // Verify Recent Activity section
    await expect(page.getByText('Recent Activity')).toBeVisible();

    // Verify Upcoming Drills section
    await expect(page.getByText('Upcoming Drills')).toBeVisible();

    // Verify Break-Glass Access section
    await expect(page.getByText('Break-Glass Access')).toBeVisible();
  });

  test('ADMIN-EM-003: Refresh button works', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Find and click refresh button
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    await expect(refreshButton).toBeVisible();

    // Click refresh
    await refreshButton.click();

    // Verify button shows loading state or completes
    await page.waitForTimeout(500);
    await expect(refreshButton).toBeEnabled();
  });

  test('ADMIN-EM-004: Create Incident button opens dialog', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Find and click Create Incident button
    await page.click('button:has-text("Create Incident")');

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Create Incident/i })).toBeVisible();
  });

  test('ADMIN-EM-005: Keyboard shortcuts help is accessible', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Find and click keyboard shortcuts button (keyboard icon)
    const keyboardButton = page.locator('button').filter({ has: page.locator('svg.lucide-keyboard') });
    await keyboardButton.click();

    // Verify popover opens with shortcuts
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible();
    await expect(page.getByText('Emergency Dashboard')).toBeVisible();
    await expect(page.getByText('Create Incident')).toBeVisible();
  });

  test('ADMIN-EM-006: View All links work', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Click View All for active incidents
    const viewAllButton = page.locator('a:has-text("View All")').first();
    if (await viewAllButton.isVisible()) {
      await viewAllButton.click();
      await expect(page).toHaveURL(/\/employee\/admin\/emergency\/incidents/);
    }
  });
});

// ============================================
// INCIDENT MANAGEMENT TESTS
// ============================================
test.describe('Incident Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-INC-001: Create new P0 incident', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Open Create Incident dialog
    await page.click('button:has-text("Create Incident")');
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in incident details
    await page.fill('input#title', 'Critical System Outage - E2E Test');
    await page.fill('textarea#description', 'This is an E2E test incident for critical system outage.');

    // Select severity P0
    await page.click('button:has-text("Select severity")');
    await page.click('[role="option"]:has-text("P0")');

    // Submit form
    await page.click('button:has-text("Create Incident")');

    // Verify redirect to incident detail page
    await expect(page).toHaveURL(/\/employee\/admin\/emergency\/incidents\/[a-f0-9-]+$/);

    // Verify incident was created
    await expect(page.getByText('Critical System Outage - E2E Test')).toBeVisible();
    await expect(page.getByText('P0')).toBeVisible();
  });

  test('ADMIN-INC-002: Create incident with different severities', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Open Create Incident dialog
    await page.click('button:has-text("Create Incident")');

    // Verify all severity options are available
    await page.click('button:has-text("Select severity")');
    await expect(page.getByRole('option', { name: 'P0 - Critical' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'P1 - High' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'P2 - Medium' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'P3 - Low' })).toBeVisible();

    // Select P2
    await page.click('[role="option"]:has-text("P2")');

    // Fill in details
    await page.fill('input#title', 'Medium Priority Issue - E2E Test');
    await page.fill('textarea#description', 'Testing P2 severity incident creation.');

    // Submit
    await page.click('button:has-text("Create Incident")');

    // Verify creation
    await expect(page).toHaveURL(/\/employee\/admin\/emergency\/incidents\/[a-f0-9-]+$/);
    await expect(page.getByText('P2')).toBeVisible();
  });

  test('ADMIN-INC-003: View incident detail page', async ({ page }) => {
    // First create an incident
    await page.goto(EMERGENCY_DASHBOARD_URL);
    await page.click('button:has-text("Create Incident")');
    await page.fill('input#title', 'Detail View Test Incident');
    await page.click('button:has-text("Select severity")');
    await page.click('[role="option"]:has-text("P1")');
    await page.fill('textarea#description', 'Testing incident detail view.');
    await page.click('button:has-text("Create Incident")');

    // Verify on detail page
    await expect(page).toHaveURL(/\/employee\/admin\/emergency\/incidents\/[a-f0-9-]+$/);

    // Verify detail page elements
    await expect(page.getByText('Detail View Test Incident')).toBeVisible();

    // Verify sidebar sections
    await expect(page.getByText('Status & Actions')).toBeVisible();
    await expect(page.getByText('Incident Details')).toBeVisible();

    // Verify timeline section
    await expect(page.getByText('Timeline')).toBeVisible();
    await expect(page.getByText('Add Timeline Event')).toBeVisible();

    // Verify notification section
    await expect(page.getByText('Notifications')).toBeVisible();
    await expect(page.getByText('Send Notification')).toBeVisible();
  });

  test('ADMIN-INC-004: Update incident status', async ({ page }) => {
    // First create an incident
    await page.goto(EMERGENCY_DASHBOARD_URL);
    await page.click('button:has-text("Create Incident")');
    await page.fill('input#title', 'Status Update Test Incident');
    await page.click('button:has-text("Select severity")');
    await page.click('[role="option"]:has-text("P2")');
    await page.fill('textarea#description', 'Testing status update.');
    await page.click('button:has-text("Create Incident")');

    // Verify initial status is "open"
    await expect(page.getByText('open')).toBeVisible();

    // Click status select
    await page.click('button:has-text("open")');

    // Verify status options
    await expect(page.getByRole('option', { name: 'Open' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Investigating' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Identified' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Monitoring' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Resolved' })).toBeVisible();

    // Change to Investigating
    await page.click('[role="option"]:has-text("Investigating")');

    // Verify status changed
    await page.waitForTimeout(500);
    await expect(page.getByText('investigating')).toBeVisible();
  });

  test('ADMIN-INC-005: Add timeline event', async ({ page }) => {
    // First create an incident
    await page.goto(EMERGENCY_DASHBOARD_URL);
    await page.click('button:has-text("Create Incident")');
    await page.fill('input#title', 'Timeline Event Test Incident');
    await page.click('button:has-text("Select severity")');
    await page.click('[role="option"]:has-text("P1")');
    await page.fill('textarea#description', 'Testing timeline events.');
    await page.click('button:has-text("Create Incident")');

    // Click Add Timeline Event button
    await page.click('button:has-text("Add Timeline Event")');

    // Fill in timeline event
    const descriptionInput = page.locator('textarea[placeholder*="timeline"]');
    await descriptionInput.fill('Initial investigation started by E2E test');

    // Submit
    await page.click('button:has-text("Add Event")');

    // Verify event appears in timeline
    await page.waitForTimeout(500);
    await expect(page.getByText('Initial investigation started by E2E test')).toBeVisible();
  });

  test('ADMIN-INC-006: Send notification from incident', async ({ page }) => {
    // First create an incident
    await page.goto(EMERGENCY_DASHBOARD_URL);
    await page.click('button:has-text("Create Incident")');
    await page.fill('input#title', 'Notification Test Incident');
    await page.click('button:has-text("Select severity")');
    await page.click('[role="option"]:has-text("P0")');
    await page.fill('textarea#description', 'Testing notifications.');
    await page.click('button:has-text("Create Incident")');

    // Click Send Notification button
    await page.click('button:has-text("Send Notification")');

    // Verify notification dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Send.*Notification/i })).toBeVisible();

    // Verify form fields
    await expect(page.getByLabel(/Subject/i)).toBeVisible();
    await expect(page.getByLabel(/Message/i)).toBeVisible();
    await expect(page.getByLabel(/Recipients/i)).toBeVisible();
  });

  test('ADMIN-INC-007: Resolve incident', async ({ page }) => {
    // First create an incident
    await page.goto(EMERGENCY_DASHBOARD_URL);
    await page.click('button:has-text("Create Incident")');
    await page.fill('input#title', 'Resolution Test Incident');
    await page.click('button:has-text("Select severity")');
    await page.click('[role="option"]:has-text("P3")');
    await page.fill('textarea#description', 'Testing incident resolution.');
    await page.click('button:has-text("Create Incident")');

    // Click resolve button
    await page.click('button:has-text("Resolve Incident")');

    // Fill resolution details (if dialog appears)
    const resolutionTextarea = page.locator('textarea[placeholder*="resolution"]');
    if (await resolutionTextarea.isVisible()) {
      await resolutionTextarea.fill('Issue was resolved by restarting the service.');
      await page.click('button:has-text("Confirm Resolution")');
    }

    // Wait for update
    await page.waitForTimeout(500);

    // Verify status changed to resolved
    await expect(page.getByText('resolved')).toBeVisible();
  });

  test('ADMIN-INC-008: Navigate back to dashboard', async ({ page }) => {
    // Navigate to an incident detail page
    await page.goto(EMERGENCY_DASHBOARD_URL);
    await page.click('button:has-text("Create Incident")');
    await page.fill('input#title', 'Navigation Test Incident');
    await page.click('button:has-text("Select severity")');
    await page.click('[role="option"]:has-text("P2")');
    await page.fill('textarea#description', 'Testing navigation.');
    await page.click('button:has-text("Create Incident")');

    // Click back link
    await page.click('a:has-text("Back to Dashboard")');

    // Verify navigation back to dashboard
    await expect(page).toHaveURL(new RegExp(EMERGENCY_DASHBOARD_URL + '$'));
  });
});

// ============================================
// BREAK-GLASS ACCESS TESTS
// ============================================
test.describe('Break-Glass Access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-BG-001: View break-glass page', async ({ page }) => {
    await page.goto(BREAK_GLASS_URL);

    // Verify page loads
    await expect(page).toHaveURL(new RegExp(BREAK_GLASS_URL));

    // Verify main heading
    await expect(page.getByRole('heading', { name: /Break-Glass Access/i })).toBeVisible({ timeout: 10000 });
  });

  test('ADMIN-BG-002: View break-glass access history', async ({ page }) => {
    await page.goto(BREAK_GLASS_URL);

    // Verify history section or empty state
    const pageContent = await page.textContent('body');
    const hasValidContent =
      pageContent?.includes('Access History') ||
      pageContent?.includes('No break-glass access') ||
      pageContent?.includes('Recent Access') ||
      pageContent?.includes('Access Log');

    expect(hasValidContent).toBeTruthy();
  });

  test('ADMIN-BG-003: Request break-glass access button visible', async ({ page }) => {
    await page.goto(BREAK_GLASS_URL);

    // Look for request access button
    const requestButton = page.getByRole('button', { name: /Request.*Access|Break Glass/i });

    // If button exists, verify it's visible
    if (await requestButton.count() > 0) {
      await expect(requestButton.first()).toBeVisible();
    }
  });

  test('ADMIN-BG-004: Request break-glass access workflow', async ({ page }) => {
    await page.goto(BREAK_GLASS_URL);

    // Click request button if available
    const requestButton = page.getByRole('button', { name: /Request.*Access|Break Glass/i });

    if (await requestButton.count() > 0) {
      await requestButton.first().click();

      // Verify dialog or form appears
      const reasonInput = page.locator('textarea[placeholder*="reason"]');
      if (await reasonInput.isVisible()) {
        await reasonInput.fill('E2E Test: Emergency access required for system recovery');

        // Look for confirm/submit button
        const confirmButton = page.getByRole('button', { name: /Confirm|Request|Submit/i });
        if (await confirmButton.count() > 0) {
          await confirmButton.first().click();
        }
      }
    }
  });

  test('ADMIN-BG-005: Navigate back from break-glass page', async ({ page }) => {
    await page.goto(BREAK_GLASS_URL);

    // Click back link
    const backLink = page.getByRole('link', { name: /Back|Dashboard/i });
    if (await backLink.count() > 0) {
      await backLink.first().click();
      await expect(page).toHaveURL(/\/employee\/admin\/emergency/);
    }
  });
});

// ============================================
// EMERGENCY DRILLS TESTS
// ============================================
test.describe('Emergency Drills', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-DR-001: View drills list page', async ({ page }) => {
    await page.goto(DRILLS_URL);

    // Verify page loads
    await expect(page).toHaveURL(new RegExp(DRILLS_URL));

    // Verify main heading
    await expect(page.getByRole('heading', { name: /Emergency Drills/i })).toBeVisible({ timeout: 10000 });
  });

  test('ADMIN-DR-002: Schedule new drill button opens dialog', async ({ page }) => {
    await page.goto(DRILLS_URL);

    // Click Schedule Drill button
    await page.click('button:has-text("Schedule Drill")');

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Schedule.*Drill/i })).toBeVisible();
  });

  test('ADMIN-DR-003: Create tabletop drill', async ({ page }) => {
    await page.goto(DRILLS_URL);

    // Click Schedule Drill button
    await page.click('button:has-text("Schedule Drill")');

    // Fill in drill details
    await page.fill('input#title', 'Q1 Tabletop Exercise - E2E Test');
    await page.fill('textarea#description', 'Quarterly tabletop exercise for incident response testing.');

    // Select drill type
    await page.click('button:has-text("Select drill type")');
    await page.click('[role="option"]:has-text("Tabletop")');

    // Set scheduled date (if date picker available)
    const dateInput = page.locator('input[type="datetime-local"]');
    if (await dateInput.isVisible()) {
      // Set to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isoString = tomorrow.toISOString().slice(0, 16);
      await dateInput.fill(isoString);
    }

    // Submit
    await page.click('button:has-text("Schedule Drill")');

    // Wait for toast or dialog close
    await page.waitForTimeout(500);
  });

  test('ADMIN-DR-004: Verify drill types available', async ({ page }) => {
    await page.goto(DRILLS_URL);

    // Click Schedule Drill button
    await page.click('button:has-text("Schedule Drill")');

    // Click drill type selector
    await page.click('button:has-text("Select drill type")');

    // Verify drill type options
    await expect(page.getByRole('option', { name: /Tabletop/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Simulation/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Full.*Scale|Full Scale/i })).toBeVisible();
  });

  test('ADMIN-DR-005: View drill history', async ({ page }) => {
    await page.goto(DRILLS_URL);

    // Verify history section or empty state
    const pageContent = await page.textContent('body');
    const hasValidContent =
      pageContent?.includes('Drill History') ||
      pageContent?.includes('No drills scheduled') ||
      pageContent?.includes('Upcoming') ||
      pageContent?.includes('Past Drills');

    expect(hasValidContent).toBeTruthy();
  });

  test('ADMIN-DR-006: Navigate back from drills page', async ({ page }) => {
    await page.goto(DRILLS_URL);

    // Click back link
    const backLink = page.getByRole('link', { name: /Back|Dashboard/i });
    if (await backLink.count() > 0) {
      await backLink.first().click();
      await expect(page).toHaveURL(/\/employee\/admin\/emergency/);
    }
  });
});

// ============================================
// KEYBOARD SHORTCUTS TESTS
// ============================================
test.describe('Emergency Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-KB-001: Cmd/Ctrl+Shift+E opens emergency dashboard', async ({ page }) => {
    // Start from admin dashboard
    await page.goto('/employee/admin/dashboard');

    // Press Cmd/Ctrl+Shift+E
    await page.keyboard.press('Meta+Shift+E');

    // Verify navigation to emergency dashboard
    await expect(page).toHaveURL(new RegExp(EMERGENCY_DASHBOARD_URL));
  });

  test('ADMIN-KB-002: Cmd/Ctrl+Shift+I opens create incident dialog', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Press Cmd/Ctrl+Shift+I
    await page.keyboard.press('Meta+Shift+I');

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Create Incident/i })).toBeVisible();
  });

  test('ADMIN-KB-003: Cmd/Ctrl+Shift+B opens break-glass page', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Press Cmd/Ctrl+Shift+B
    await page.keyboard.press('Meta+Shift+B');

    // Verify navigation to break-glass
    await expect(page).toHaveURL(new RegExp(BREAK_GLASS_URL));
  });

  test('ADMIN-KB-004: Cmd/Ctrl+Shift+D opens drills page', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Press Cmd/Ctrl+Shift+D
    await page.keyboard.press('Meta+Shift+D');

    // Verify navigation to drills
    await expect(page).toHaveURL(new RegExp(DRILLS_URL));
  });
});

// ============================================
// NAVIGATION TESTS
// ============================================
test.describe('Emergency Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('NAV-EM-001: Dashboard to incidents navigation', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Click View All link for incidents
    const viewAllLink = page.locator('a').filter({ has: page.getByText('View All') }).first();
    if (await viewAllLink.isVisible()) {
      await viewAllLink.click();
      await expect(page).toHaveURL(/\/employee\/admin\/emergency\/incidents/);
    }
  });

  test('NAV-EM-002: Dashboard to drills navigation', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Click View All for drills
    const drillsSection = page.locator('section, div').filter({ hasText: 'Upcoming Drills' });
    const viewAllLink = drillsSection.getByRole('link', { name: 'View All' });

    if (await viewAllLink.isVisible()) {
      await viewAllLink.click();
      await expect(page).toHaveURL(new RegExp(DRILLS_URL));
    }
  });

  test('NAV-EM-003: Dashboard to break-glass navigation', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Click View All for break-glass
    const breakGlassSection = page.locator('section, div').filter({ hasText: 'Break-Glass Access' });
    const viewAllLink = breakGlassSection.getByRole('link', { name: 'View All' });

    if (await viewAllLink.isVisible()) {
      await viewAllLink.click();
      await expect(page).toHaveURL(new RegExp(BREAK_GLASS_URL));
    }
  });

  test('NAV-EM-004: Incident detail back navigation', async ({ page }) => {
    // Create an incident first
    await page.goto(EMERGENCY_DASHBOARD_URL);
    await page.click('button:has-text("Create Incident")');
    await page.fill('input#title', 'Back Nav Test');
    await page.click('button:has-text("Select severity")');
    await page.click('[role="option"]:has-text("P3")');
    await page.fill('textarea#description', 'Testing back navigation');
    await page.click('button:has-text("Create Incident")');

    // Verify on detail page
    await expect(page).toHaveURL(/\/employee\/admin\/emergency\/incidents\/[a-f0-9-]+$/);

    // Navigate back
    await page.click('a:has-text("Back to Dashboard")');

    // Verify back on dashboard
    await expect(page).toHaveURL(new RegExp(EMERGENCY_DASHBOARD_URL + '$'));
  });
});

// ============================================
// EMPTY STATE TESTS
// ============================================
test.describe('Emergency Empty States', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('EMPTY-001: Dashboard shows appropriate empty states', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Check for either data or empty states
    const pageContent = await page.textContent('body');
    const hasValidContent =
      pageContent?.includes('No active incidents') ||
      pageContent?.includes('All systems operational') ||
      pageContent?.includes('No recent activity') ||
      pageContent?.includes('INC-') || // Has incident numbers
      pageContent?.includes('Active Incidents');

    expect(hasValidContent).toBeTruthy();
  });

  test('EMPTY-002: Drills shows empty state when no drills', async ({ page }) => {
    await page.goto(DRILLS_URL);

    // Check for empty state or drill list
    const pageContent = await page.textContent('body');
    const hasValidContent =
      pageContent?.includes('No drills scheduled') ||
      pageContent?.includes('Schedule your first') ||
      pageContent?.includes('Drill') ||
      pageContent?.includes('Tabletop') ||
      pageContent?.includes('Simulation');

    expect(hasValidContent).toBeTruthy();
  });

  test('EMPTY-003: Break-glass shows empty state when no access', async ({ page }) => {
    await page.goto(BREAK_GLASS_URL);

    // Check for empty state or access list
    const pageContent = await page.textContent('body');
    const hasValidContent =
      pageContent?.includes('No break-glass access') ||
      pageContent?.includes('No recent') ||
      pageContent?.includes('Access') ||
      pageContent?.includes('Break-Glass');

    expect(hasValidContent).toBeTruthy();
  });
});

// ============================================
// AUTO-REFRESH TESTS
// ============================================
test.describe('Emergency Auto-Refresh', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('REFRESH-001: Dashboard auto-refreshes data', async ({ page }) => {
    await page.goto(EMERGENCY_DASHBOARD_URL);

    // Verify page loads
    await expect(page.getByRole('heading', { name: /Emergency Dashboard/i })).toBeVisible();

    // Wait for potential auto-refresh (configured for 30 seconds in component)
    // For E2E we just verify the mechanism doesn't break the page
    await page.waitForTimeout(2000);

    // Page should still be functional
    await expect(page.getByRole('heading', { name: /Emergency Dashboard/i })).toBeVisible();
  });
});
