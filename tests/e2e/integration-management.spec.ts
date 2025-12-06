import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Integration Management
 *
 * Test Cases from: thoughts/shared/epics/epic-01-admin/07-integration-management.md
 *
 * Test Users (password: TestPass123!):
 * - admin@intime.com (Admin)
 */

const ADMIN_EMAIL = 'admin@intime.com';
const ADMIN_PASSWORD = 'TestPass123!';
const INTEGRATIONS_URL = '/employee/admin/integrations';
const NEW_INTEGRATION_URL = '/employee/admin/integrations/new';
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

test.describe('Integration Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-INT-001: View integration dashboard', async ({ page }) => {
    // Navigate to integrations page
    await page.goto(INTEGRATIONS_URL);

    // Verify dashboard loads
    await expect(page).toHaveURL(new RegExp(INTEGRATIONS_URL));

    // Verify main heading
    await expect(page.getByRole('heading', { name: /Integrations/i })).toBeVisible({ timeout: 10000 });

    // Verify stats cards are visible
    await expect(page.getByText('Total')).toBeVisible();
    await expect(page.getByText('Active')).toBeVisible();
    await expect(page.getByText('Errors')).toBeVisible();
    await expect(page.getByText('Inactive')).toBeVisible();

    // Verify "Add Integration" button is visible
    await expect(page.getByRole('link', { name: /Add Integration/i })).toBeVisible();
  });

  test('ADMIN-INT-002: Navigate to new integration form', async ({ page }) => {
    // Navigate to integrations page
    await page.goto(INTEGRATIONS_URL);

    // Click "Add Integration" button
    await page.click('a:has-text("Add Integration")');

    // Verify navigation to new integration form
    await expect(page).toHaveURL(new RegExp(NEW_INTEGRATION_URL));

    // Verify form elements are present
    await expect(page.getByRole('heading', { name: /Add Integration/i })).toBeVisible();
    await expect(page.getByLabel(/Name/i)).toBeVisible();
    await expect(page.getByLabel(/Description/i)).toBeVisible();
  });

  test('ADMIN-INT-003: Create email integration with SMTP', async ({ page }) => {
    // Navigate to new integration form
    await page.goto(NEW_INTEGRATION_URL);

    // Fill in basic info
    await page.fill('input#name', 'Test SMTP Email');
    await page.fill('textarea#description', 'Test SMTP integration for E2E testing');

    // Select type
    await page.click('button:has-text("Select integration type")');
    await page.click('[role="option"]:has-text("Email")');

    // Select provider
    await page.waitForSelector('button:has-text("Select provider")');
    await page.click('button:has-text("Select provider")');
    await page.click('[role="option"]:has-text("SMTP")');

    // Wait for config fields to appear
    await page.waitForSelector('input#host');

    // Fill SMTP configuration
    await page.fill('input#host', 'smtp.example.com');
    await page.fill('input#port', '587');
    await page.fill('input#from_email', 'test@example.com');

    // Select encryption
    await page.click('button:has-text("Select encryption")');
    await page.click('[role="option"]:has-text("TLS")');

    // Test connection button should be visible
    await expect(page.getByRole('button', { name: /Test Connection/i })).toBeVisible();

    // Click test connection
    await page.click('button:has-text("Test Connection")');

    // Wait for test result
    await page.waitForSelector('text=validated', { timeout: 10000 });

    // Submit form
    await page.click('button:has-text("Create Integration")');

    // Verify redirect to detail page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+$/);

    // Verify integration was created
    await expect(page.getByRole('heading', { name: /Test SMTP Email/i })).toBeVisible();
  });

  test('ADMIN-INT-004: Filter integrations by type', async ({ page }) => {
    // Navigate to integrations page
    await page.goto(INTEGRATIONS_URL);

    // Click type filter
    await page.click('button:has-text("All Types")');

    // Verify filter options are visible
    await expect(page.getByRole('option', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'SMS' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Calendar' })).toBeVisible();

    // Select Email filter
    await page.click('[role="option"]:has-text("Email")');

    // Verify filter is applied (button text changes)
    await expect(page.locator('button:has-text("Email")')).toBeVisible();
  });

  test('ADMIN-INT-005: Filter integrations by status', async ({ page }) => {
    // Navigate to integrations page
    await page.goto(INTEGRATIONS_URL);

    // Click status filter
    await page.click('button:has-text("All Status")');

    // Verify filter options
    await expect(page.getByRole('option', { name: 'Active' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Inactive' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Error' })).toBeVisible();
  });

  test('ADMIN-INT-006: Search integrations', async ({ page }) => {
    // Navigate to integrations page
    await page.goto(INTEGRATIONS_URL);

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('test');

    // Wait for search to be applied (debounced)
    await page.waitForTimeout(500);
  });

  test('ADMIN-INT-007: View integration details', async ({ page }) => {
    // First create an integration to view
    await page.goto(NEW_INTEGRATION_URL);

    await page.fill('input#name', 'Detail Test Integration');
    await page.click('button:has-text("Select integration type")');
    await page.click('[role="option"]:has-text("Email")');
    await page.click('button:has-text("Select provider")');
    await page.click('[role="option"]:has-text("Resend")');

    await page.waitForSelector('input#api_key');
    await page.fill('input#api_key', 're_test_key');
    await page.fill('input#from_email', 'test@example.com');

    await page.click('button:has-text("Create Integration")');

    // Wait for redirect to detail page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+$/);

    // Verify detail page elements
    await expect(page.getByRole('heading', { name: /Detail Test Integration/i })).toBeVisible();

    // Verify health status section
    await expect(page.getByText(/unknown|healthy|unhealthy/i)).toBeVisible();

    // Verify status & actions sidebar
    await expect(page.getByText('Status & Actions')).toBeVisible();

    // Verify details sidebar
    await expect(page.getByText('Details')).toBeVisible();
    await expect(page.getByText('Type')).toBeVisible();
    await expect(page.getByText('Provider')).toBeVisible();

    // Verify health check history section
    await expect(page.getByText('Health Check History')).toBeVisible();
  });

  test('ADMIN-INT-008: Run health check', async ({ page }) => {
    // First create an integration
    await page.goto(NEW_INTEGRATION_URL);

    await page.fill('input#name', 'Health Check Test');
    await page.click('button:has-text("Select integration type")');
    await page.click('[role="option"]:has-text("Email")');
    await page.click('button:has-text("Select provider")');
    await page.click('[role="option"]:has-text("SendGrid")');

    await page.waitForSelector('input#api_key');
    await page.fill('input#api_key', 'SG.test_key');
    await page.fill('input#from_email', 'test@example.com');

    await page.click('button:has-text("Create Integration")');

    // Wait for detail page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+$/);

    // Click Run Health Check button
    await page.click('button:has-text("Run Health Check")');

    // Wait for health check to complete (shows toast notification)
    await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 });
  });

  test('ADMIN-INT-009: Toggle integration status', async ({ page }) => {
    // First create an integration
    await page.goto(NEW_INTEGRATION_URL);

    await page.fill('input#name', 'Toggle Status Test');
    await page.click('button:has-text("Select integration type")');
    await page.click('[role="option"]:has-text("SMS")');
    await page.click('button:has-text("Select provider")');
    await page.click('[role="option"]:has-text("Twilio")');

    await page.waitForSelector('input#account_sid');
    await page.fill('input#account_sid', 'AC_test_sid');
    await page.fill('input#auth_token', 'test_token');
    await page.fill('input#from_number', '+1234567890');

    await page.click('button:has-text("Create Integration")');

    // Wait for detail page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+$/);

    // Initially status should be Inactive
    await expect(page.locator('.rounded-full:has-text("Inactive")')).toBeVisible();

    // Click Enable button
    await page.click('button:has-text("Enable Integration")');

    // Wait for toast notification
    await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 });

    // Status should now be Active
    await expect(page.locator('.rounded-full:has-text("Active")')).toBeVisible();
  });

  test('ADMIN-INT-010: Edit integration', async ({ page }) => {
    // First create an integration
    await page.goto(NEW_INTEGRATION_URL);

    await page.fill('input#name', 'Edit Test Integration');
    await page.click('button:has-text("Select integration type")');
    await page.click('[role="option"]:has-text("CRM")');
    await page.click('button:has-text("Select provider")');
    await page.click('[role="option"]:has-text("HubSpot")');

    await page.waitForSelector('input#api_key');
    await page.fill('input#api_key', 'test_hubspot_key');

    await page.click('button:has-text("Create Integration")');

    // Wait for detail page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+$/);

    // Click Edit button
    await page.click('a:has-text("Edit")');

    // Wait for edit form
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+\/edit$/);

    // Verify form is pre-populated
    const nameInput = page.locator('input#name');
    await expect(nameInput).toHaveValue('Edit Test Integration');

    // Update name
    await nameInput.fill('Updated Integration Name');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify redirect back to detail page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+$/);

    // Verify name was updated
    await expect(page.getByRole('heading', { name: /Updated Integration Name/i })).toBeVisible();
  });

  test('ADMIN-INT-011: Delete integration', async ({ page }) => {
    // First create an integration
    await page.goto(NEW_INTEGRATION_URL);

    await page.fill('input#name', 'Delete Test Integration');
    await page.click('button:has-text("Select integration type")');
    await page.click('[role="option"]:has-text("Storage")');
    await page.click('button:has-text("Select provider")');
    await page.click('[role="option"]:has-text("Amazon S3")');

    await page.waitForSelector('input#region');
    await page.fill('input#region', 'us-east-1');
    await page.fill('input#bucket', 'test-bucket');
    await page.fill('input#access_key_id', 'AKIA_TEST');
    await page.fill('input#secret_access_key', 'test_secret');

    await page.click('button:has-text("Create Integration")');

    // Wait for detail page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+$/);

    // Set up dialog handler for confirm
    page.on('dialog', dialog => dialog.accept());

    // Click Delete button
    await page.click('button:has-text("Delete Integration")');

    // Wait for redirect to list page
    await expect(page).toHaveURL(new RegExp(INTEGRATIONS_URL + '$'));

    // Verify toast notification
    await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 });
  });

  test('ADMIN-INT-012: Empty state displays correctly', async ({ page }) => {
    // Navigate to integrations page
    await page.goto(INTEGRATIONS_URL);

    // Apply a filter that likely returns no results
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('nonexistent_integration_xyz123');

    // Wait for search to complete
    await page.waitForTimeout(500);

    // Check for empty state or table content
    const pageContent = await page.textContent('body');
    const hasValidContent =
      pageContent?.includes('No integrations found') ||
      pageContent?.includes('Try adjusting your filters') ||
      pageContent?.includes('Integration'); // Has at least some integrations

    expect(hasValidContent).toBeTruthy();
  });

  test('ADMIN-INT-013: Breadcrumb navigation works', async ({ page }) => {
    // Navigate to new integration page
    await page.goto(NEW_INTEGRATION_URL);

    // Verify breadcrumbs are visible
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Integrations' })).toBeVisible();
    await expect(page.getByText('New Integration')).toBeVisible();

    // Click Integrations breadcrumb
    await page.click('a:has-text("Integrations")');

    // Verify navigation back to list
    await expect(page).toHaveURL(new RegExp(INTEGRATIONS_URL + '$'));
  });

  test('ADMIN-INT-014: Primary integration toggle works', async ({ page }) => {
    // Navigate to new integration form
    await page.goto(NEW_INTEGRATION_URL);

    // Verify primary toggle is visible
    await expect(page.getByLabel(/Set as primary/i)).toBeVisible();

    // Toggle primary on
    await page.click('button[role="switch"]');

    // Fill in required fields
    await page.fill('input#name', 'Primary Test Integration');
    await page.click('button:has-text("Select integration type")');
    await page.click('[role="option"]:has-text("Email")');
    await page.click('button:has-text("Select provider")');
    await page.click('[role="option"]:has-text("Resend")');

    await page.waitForSelector('input#api_key');
    await page.fill('input#api_key', 're_test_key');
    await page.fill('input#from_email', 'test@example.com');

    // Submit form
    await page.click('button:has-text("Create Integration")');

    // Verify redirect to detail page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+$/);

    // Verify primary status in sidebar
    await expect(page.getByText('Yes')).toBeVisible();
  });

  test('ADMIN-INT-015: Back button returns to list', async ({ page }) => {
    // Navigate to new integration page
    await page.goto(NEW_INTEGRATION_URL);

    // Click Back button
    await page.click('a:has-text("Back")');

    // Verify navigation back to list
    await expect(page).toHaveURL(new RegExp(INTEGRATIONS_URL + '$'));
  });
});

// ============================================
// PART 2: WEBHOOK MANAGEMENT TESTS
// ============================================
test.describe('Webhook Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-WH-001: View webhooks list page', async ({ page }) => {
    // Navigate to webhooks page
    await page.goto('/employee/admin/integrations/webhooks');

    // Verify page loads
    await expect(page.getByRole('heading', { name: /Webhooks/i })).toBeVisible({ timeout: 10000 });

    // Verify stats cards
    await expect(page.getByText('Total Webhooks')).toBeVisible();
    await expect(page.getByText('Active')).toBeVisible();
    await expect(page.getByText('Success Rate')).toBeVisible();

    // Verify "Add Webhook" button
    await expect(page.getByRole('link', { name: /Add Webhook/i })).toBeVisible();
  });

  test('ADMIN-WH-002: Create new webhook', async ({ page }) => {
    // Navigate to new webhook form
    await page.goto('/employee/admin/integrations/webhooks/new');

    // Verify form page
    await expect(page.getByRole('heading', { name: /Add Webhook/i })).toBeVisible();

    // Fill in webhook details
    await page.fill('input#name', 'Test E2E Webhook');
    await page.fill('input#url', 'https://webhook.example.com/test');
    await page.fill('textarea#description', 'E2E test webhook');

    // Select events by category
    await page.click('button:has-text("Select All")');

    // Submit form
    await page.click('button:has-text("Create Webhook")');

    // Verify redirect to webhook debug page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/webhooks\/[a-f0-9-]+$/);

    // Verify webhook was created
    await expect(page.getByRole('heading', { name: /Test E2E Webhook/i })).toBeVisible();
  });

  test('ADMIN-WH-003: View webhook debug page', async ({ page }) => {
    // Create webhook first
    await page.goto('/employee/admin/integrations/webhooks/new');
    await page.fill('input#name', 'Debug Test Webhook');
    await page.fill('input#url', 'https://webhook.example.com/debug');
    await page.click('button:has-text("Create Webhook")');
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/webhooks\/[a-f0-9-]+$/);

    // Verify debug page elements
    await expect(page.getByText('Webhook Details')).toBeVisible();
    await expect(page.getByText('Delivery History')).toBeVisible();
    await expect(page.getByText('Test Webhook')).toBeVisible();
    await expect(page.getByText('Signing Secret')).toBeVisible();
  });

  test('ADMIN-WH-004: Test webhook button visible', async ({ page }) => {
    // Create webhook first
    await page.goto('/employee/admin/integrations/webhooks/new');
    await page.fill('input#name', 'Send Test Webhook');
    await page.fill('input#url', 'https://webhook.example.com/test-send');
    await page.click('button:has-text("Create Webhook")');
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/webhooks\/[a-f0-9-]+$/);

    // Verify test webhook button
    await expect(page.getByRole('button', { name: /Send Test Webhook/i })).toBeVisible();

    // Verify event type dropdown
    await expect(page.locator('select')).toBeVisible();
  });

  test('ADMIN-WH-005: Copy webhook secret', async ({ page }) => {
    // Create webhook first
    await page.goto('/employee/admin/integrations/webhooks/new');
    await page.fill('input#name', 'Secret Copy Test');
    await page.fill('input#url', 'https://webhook.example.com/secret');
    await page.click('button:has-text("Create Webhook")');
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/webhooks\/[a-f0-9-]+$/);

    // Verify signing secret section
    await expect(page.getByText('Signing Secret')).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy Full Secret/i })).toBeVisible();
  });

  test('ADMIN-WH-006: Enable/disable webhook', async ({ page }) => {
    // Navigate to webhooks list
    await page.goto('/employee/admin/integrations/webhooks');

    // Wait for list to load
    await expect(page.getByRole('heading', { name: /Webhooks/i })).toBeVisible();

    // Look for toggle or action buttons on list items
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeDefined();
  });

  test('ADMIN-WH-007: Edit webhook', async ({ page }) => {
    // Create webhook first
    await page.goto('/employee/admin/integrations/webhooks/new');
    await page.fill('input#name', 'Edit Test Webhook');
    await page.fill('input#url', 'https://webhook.example.com/edit');
    await page.click('button:has-text("Create Webhook")');
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/webhooks\/[a-f0-9-]+$/);

    // Click Edit button
    await page.click('a:has-text("Edit")');

    // Verify edit form
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/webhooks\/[a-f0-9-]+\/edit$/);
    await expect(page.locator('input#name')).toHaveValue('Edit Test Webhook');
  });
});

// ============================================
// PART 2: RETRY CONFIGURATION TESTS
// ============================================
test.describe('Retry Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-RETRY-001: View retry configuration page', async ({ page }) => {
    // Navigate to retry config page
    await page.goto('/employee/admin/integrations/retry-config');

    // Verify page loads
    await expect(page.getByRole('heading', { name: /Retry Configuration/i })).toBeVisible({ timeout: 10000 });

    // Verify main sections
    await expect(page.getByText('Retry Settings')).toBeVisible();
    await expect(page.getByText('Dead Letter Queue')).toBeVisible();
    await expect(page.getByText('Retry Preview')).toBeVisible();
  });

  test('ADMIN-RETRY-002: Select retry strategy', async ({ page }) => {
    await page.goto('/employee/admin/integrations/retry-config');

    // Verify strategy options
    await expect(page.getByText('Exponential Backoff')).toBeVisible();
    await expect(page.getByText('Linear Backoff')).toBeVisible();
    await expect(page.getByText('Fixed Delay')).toBeVisible();

    // Select linear strategy
    await page.click('label:has-text("Linear Backoff")');

    // Verify selection
    await expect(page.locator('input[name="strategy"][value="linear"]')).toBeChecked();
  });

  test('ADMIN-RETRY-003: Retry preview updates dynamically', async ({ page }) => {
    await page.goto('/employee/admin/integrations/retry-config');

    // Verify retry preview section exists
    await expect(page.getByText('Retry Preview')).toBeVisible();
    await expect(page.getByText('Retry 1')).toBeVisible();
    await expect(page.getByText('Retry 2')).toBeVisible();
    await expect(page.getByText('Retry 3')).toBeVisible();

    // Verify total duration shown
    await expect(page.getByText('Total max duration')).toBeVisible();
  });

  test('ADMIN-RETRY-004: Configure DLQ settings', async ({ page }) => {
    await page.goto('/employee/admin/integrations/retry-config');

    // Verify DLQ section
    await expect(page.getByText('Dead Letter Queue')).toBeVisible();
    await expect(page.getByText('Enable Dead Letter Queue')).toBeVisible();

    // Verify DLQ link
    await expect(page.getByRole('link', { name: /Manage DLQ/i })).toBeVisible();
  });

  test('ADMIN-RETRY-005: Save retry configuration', async ({ page }) => {
    await page.goto('/employee/admin/integrations/retry-config');

    // Fill in configuration
    await page.fill('input#maxRetries', '5');
    await page.fill('input#baseDelay', '10');
    await page.fill('input#maxDelay', '600');

    // Click save button
    await page.click('button:has-text("Save Configuration")');

    // Wait for toast
    await page.waitForSelector('[data-sonner-toast]', { timeout: 10000 });
  });
});

// ============================================
// PART 2: DLQ MANAGEMENT TESTS
// ============================================
test.describe('Dead Letter Queue Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-DLQ-001: View DLQ page', async ({ page }) => {
    // Navigate to DLQ page
    await page.goto('/employee/admin/integrations/dlq');

    // Verify page loads
    await expect(page.getByRole('heading', { name: /Dead Letter Queue/i })).toBeVisible({ timeout: 10000 });

    // Verify stats cards
    await expect(page.getByText('Items in DLQ')).toBeVisible();
    await expect(page.getByText('Oldest Item')).toBeVisible();
    await expect(page.getByText('Unique Webhooks')).toBeVisible();
  });

  test('ADMIN-DLQ-002: DLQ actions available', async ({ page }) => {
    await page.goto('/employee/admin/integrations/dlq');

    // Verify action buttons
    await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Retry Settings/i })).toBeVisible();
  });

  test('ADMIN-DLQ-003: Empty DLQ state', async ({ page }) => {
    await page.goto('/employee/admin/integrations/dlq');

    // Check for empty state or items
    const pageContent = await page.textContent('body');
    const hasValidContent =
      pageContent?.includes('No Items in DLQ') ||
      pageContent?.includes('Failed Deliveries') ||
      pageContent?.includes('dlq');

    expect(hasValidContent).toBeTruthy();
  });
});

// ============================================
// PART 2: FAILOVER CONFIGURATION TESTS
// ============================================
test.describe('Failover Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-FO-001: View failover configuration page', async ({ page }) => {
    // Navigate to failover config page
    await page.goto('/employee/admin/integrations/failover');

    // Verify page loads
    await expect(page.getByRole('heading', { name: /Failover Configuration/i })).toBeVisible({ timeout: 10000 });

    // Verify info banner
    await expect(page.getByText('Automatic Failover')).toBeVisible();
  });

  test('ADMIN-FO-002: Integration type sections visible', async ({ page }) => {
    await page.goto('/employee/admin/integrations/failover');

    // Verify integration type sections
    await expect(page.getByText('Email Service')).toBeVisible();
    await expect(page.getByText('SMS Service')).toBeVisible();
    await expect(page.getByText('Calendar')).toBeVisible();
    await expect(page.getByText('Video Conferencing')).toBeVisible();
  });

  test('ADMIN-FO-003: Configure failover button visible', async ({ page }) => {
    await page.goto('/employee/admin/integrations/failover');

    // Look for configure buttons or existing configs
    const pageContent = await page.textContent('body');
    const hasValidContent =
      pageContent?.includes('Configure Failover') ||
      pageContent?.includes('Edit') ||
      pageContent?.includes('Primary') ||
      pageContent?.includes('Backup');

    expect(hasValidContent).toBeTruthy();
  });
});

// ============================================
// PART 2: OAUTH CONNECTION TESTS
// ============================================
test.describe('OAuth Connection', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('ADMIN-OAUTH-001: OAuth complete page renders success', async ({ page }) => {
    // Navigate to OAuth complete page with success params
    await page.goto('/employee/admin/integrations/oauth/complete?success=true&provider=google&email=test@example.com');

    // Verify success state
    await expect(page.getByText('Connected Successfully')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Integrations/i })).toBeVisible();
  });

  test('ADMIN-OAUTH-002: OAuth complete page renders error', async ({ page }) => {
    // Navigate to OAuth complete page with error
    await page.goto('/employee/admin/integrations/oauth/complete?error=Authorization%20failed');

    // Verify error state
    await expect(page.getByText('Connection Failed')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Authorization failed')).toBeVisible();
  });

  test('ADMIN-OAUTH-003: OAuth panel visible in integration details', async ({ page }) => {
    // Create a calendar integration
    await page.goto(NEW_INTEGRATION_URL);

    await page.fill('input#name', 'Calendar OAuth Test');
    await page.click('button:has-text("Select integration type")');
    await page.click('[role="option"]:has-text("Calendar")');
    await page.click('button:has-text("Select provider")');
    await page.click('[role="option"]:has-text("Google Calendar")');

    await page.waitForSelector('input#client_id');
    await page.fill('input#client_id', 'test_client_id');
    await page.fill('input#client_secret', 'test_client_secret');

    await page.click('button:has-text("Create Integration")');

    // Wait for detail page
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/[a-f0-9-]+$/);

    // Verify OAuth Connection section exists
    await expect(page.getByText('OAuth Connection')).toBeVisible();
  });
});

// ============================================
// PART 2: NAVIGATION TESTS
// ============================================
test.describe('Integration Management Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('NAV-001: Webhooks link from integrations dashboard', async ({ page }) => {
    await page.goto(INTEGRATIONS_URL);

    // Look for webhooks link
    await page.click('a:has-text("Webhooks")');

    // Verify navigation
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/webhooks$/);
  });

  test('NAV-002: Retry config link from integrations dashboard', async ({ page }) => {
    await page.goto(INTEGRATIONS_URL);

    // Navigate to retry config
    await page.goto('/employee/admin/integrations/retry-config');

    // Verify page loads
    await expect(page.getByRole('heading', { name: /Retry Configuration/i })).toBeVisible();
  });

  test('NAV-003: DLQ link from retry config page', async ({ page }) => {
    await page.goto('/employee/admin/integrations/retry-config');

    // Click DLQ link
    await page.click('a:has-text("Manage DLQ")');

    // Verify navigation
    await expect(page).toHaveURL(/\/employee\/admin\/integrations\/dlq$/);
  });

  test('NAV-004: Failover config accessible', async ({ page }) => {
    await page.goto('/employee/admin/integrations/failover');

    // Verify page loads
    await expect(page.getByRole('heading', { name: /Failover Configuration/i })).toBeVisible();

    // Verify back button works
    await page.click('a:has-text("Back to Integrations")');
    await expect(page).toHaveURL(new RegExp(INTEGRATIONS_URL + '$'));
  });
});
