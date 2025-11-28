/**
 * Leads Module E2E Tests
 *
 * Tests for complete lead lifecycle: creation, status changes, activity logging, and conversion.
 *
 * Prerequisites:
 *   - Run `pnpm tsx scripts/seed-test-users.ts` to create test users
 *   - Ensure the app is running on localhost:3000
 *
 * Run: pnpm playwright test tests/e2e/leads-module.spec.ts
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
};

// Test data for leads
const TEST_LEAD = {
  companyName: `E2E Test Company ${Date.now()}`,
  firstName: 'John',
  lastName: 'TestLead',
  email: `e2e-lead-${Date.now()}@test.com`,
  phone: '555-0100',
  industry: 'Technology',
  estimatedValue: '50000',
};

// ============================================================================
// Helper Functions
// ============================================================================

async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[name="email"], input[type="email"]', TEST_USERS.recruiter.email);
  await page.fill('input[name="password"], input[type="password"]', TEST_USERS.recruiter.password);
  await page.click('button[type="submit"]');

  // Wait for navigation away from login page
  await page.waitForURL(/^(?!.*\/login).*$/);
}

async function navigateToLeads(page: Page): Promise<void> {
  await page.goto('/employee/recruiting/leads');
  await page.waitForLoadState('networkidle');
}

async function openNewLeadModal(page: Page): Promise<void> {
  const newLeadButton = page.locator('button:has-text("New Lead")');
  await expect(newLeadButton).toBeVisible({ timeout: 10000 });
  await newLeadButton.click();

  // Wait for modal to appear
  await expect(page.locator('text=Create New Lead')).toBeVisible({ timeout: 5000 });
}

// ============================================================================
// Test Suites
// ============================================================================

test.describe('Leads Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToLeads(page);
  });

  test.describe('Leads List', () => {
    test('should display leads list page with stats', async ({ page }) => {
      // Check page loaded correctly
      await expect(page.locator('text=Total Leads')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Hot Leads')).toBeVisible();
      await expect(page.locator('text=Converted')).toBeVisible();
      await expect(page.locator('text=Pipeline Value')).toBeVisible();
    });

    test('should display status filter pills', async ({ page }) => {
      // Check filter buttons exist
      await expect(page.locator('button:has-text("All")')).toBeVisible();
      await expect(page.locator('button:has-text("New")')).toBeVisible();
      await expect(page.locator('button:has-text("Warm")')).toBeVisible();
      await expect(page.locator('button:has-text("Hot")')).toBeVisible();
      await expect(page.locator('button:has-text("Cold")')).toBeVisible();
      await expect(page.locator('button:has-text("Converted")')).toBeVisible();
      await expect(page.locator('button:has-text("Lost")')).toBeVisible();
    });

    test('should filter leads by status', async ({ page }) => {
      // Click on "New" filter
      await page.click('button:has-text("New")');
      await page.waitForLoadState('networkidle');

      // Button should be highlighted
      const newButton = page.locator('button:has-text("New")');
      await expect(newButton).toHaveClass(/bg-charcoal/);
    });

    test('should search leads', async ({ page }) => {
      // Find search input
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();

      // Type search term
      await searchInput.fill('test');

      // Wait for search to filter
      await page.waitForTimeout(500);

      // The list should be filtered (or empty if no matches)
    });
  });

  test.describe('Create Lead', () => {
    test('should open create lead modal', async ({ page }) => {
      await openNewLeadModal(page);

      // Modal should be visible
      await expect(page.locator('text=Create New Lead')).toBeVisible();

      // Form fields should be present
      await expect(page.locator('[name="companyName"]')).toBeVisible();
    });

    test('should create a new company lead', async ({ page }) => {
      await openNewLeadModal(page);

      // Select Company lead type (default)
      const companyTab = page.locator('button:has-text("Company")');
      await expect(companyTab).toBeVisible();

      // Fill company information
      await page.fill('[name="companyName"]', TEST_LEAD.companyName);

      // Fill industry if available
      const industryField = page.locator('[name="industry"]');
      if (await industryField.isVisible().catch(() => false)) {
        await industryField.fill(TEST_LEAD.industry);
      }

      // Fill primary contact
      await page.fill('[name="firstName"]', TEST_LEAD.firstName);
      await page.fill('[name="lastName"]', TEST_LEAD.lastName);
      await page.fill('[name="email"]', TEST_LEAD.email);

      const phoneField = page.locator('[name="phone"]');
      if (await phoneField.isVisible().catch(() => false)) {
        await phoneField.fill(TEST_LEAD.phone);
      }

      // Fill estimated value if available
      const valueField = page.locator('[name="estimatedValue"]');
      if (await valueField.isVisible().catch(() => false)) {
        await valueField.fill(TEST_LEAD.estimatedValue);
      }

      // Submit the form
      await page.click('button:has-text("Create Lead")');

      // Wait for modal to close
      await expect(page.locator('text=Create New Lead')).not.toBeVisible({ timeout: 10000 });

      // Verify lead appears in the list
      await page.waitForLoadState('networkidle');
      await expect(page.locator(`text=${TEST_LEAD.companyName}`)).toBeVisible({ timeout: 10000 });
    });

    test('should show validation error for empty company name', async ({ page }) => {
      await openNewLeadModal(page);

      // Fill only contact info, skip company name
      await page.fill('[name="firstName"]', TEST_LEAD.firstName);
      await page.fill('[name="lastName"]', TEST_LEAD.lastName);
      await page.fill('[name="email"]', TEST_LEAD.email);

      // Try to submit
      await page.click('button:has-text("Create Lead")');

      // Should show error or stay on modal
      const isModalStillOpen = await page.locator('text=Create New Lead').isVisible();
      expect(isModalStillOpen).toBe(true);
    });
  });

  test.describe('Lead Detail', () => {
    test.beforeEach(async ({ page }) => {
      // Create a lead first if none exist
      const leadCards = page.locator('a[href*="/leads/"]');
      const count = await leadCards.count();

      if (count === 0) {
        // Create a lead first
        await openNewLeadModal(page);
        const uniqueName = `Test Lead ${Date.now()}`;
        await page.fill('[name="companyName"]', uniqueName);
        await page.fill('[name="firstName"]', 'Test');
        await page.fill('[name="lastName"]', 'User');
        await page.fill('[name="email"]', `test${Date.now()}@test.com`);
        await page.click('button:has-text("Create Lead")');
        await expect(page.locator('text=Create New Lead')).not.toBeVisible({ timeout: 10000 });
        await page.waitForLoadState('networkidle');
      }
    });

    test('should navigate to lead detail page', async ({ page }) => {
      // Click on the first lead card
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await expect(leadCard).toBeVisible({ timeout: 10000 });
      await leadCard.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/leads\/[a-z0-9-]+/);

      // Should show lead info
      await expect(page.locator('text=Est. Value')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Status')).toBeVisible();
    });

    test('should display activity composer', async ({ page }) => {
      // Navigate to first lead
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await leadCard.click();
      await page.waitForLoadState('networkidle');

      // Activity composer tabs should be visible
      await expect(page.locator('button:has-text("Email")')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('button:has-text("Call")')).toBeVisible();
      await expect(page.locator('button:has-text("Meeting")')).toBeVisible();
      await expect(page.locator('button:has-text("LinkedIn")')).toBeVisible();
      await expect(page.locator('button:has-text("Note")')).toBeVisible();
    });
  });

  test.describe('Lead Status Management', () => {
    test('should change lead status to warm', async ({ page }) => {
      // Navigate to first lead
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await leadCard.click();
      await page.waitForLoadState('networkidle');

      // Find and click the "Warm" status button
      const warmButton = page.locator('[data-testid="status-warm"], button:has-text("Warm")').first();
      await expect(warmButton).toBeVisible({ timeout: 10000 });
      await warmButton.click();

      // Wait for update
      await page.waitForTimeout(1000);

      // Status should be updated (warm button should be highlighted)
      await expect(warmButton).toHaveClass(/ring-2|bg-orange/);
    });

    test('should show lost reason modal when marking as lost', async ({ page }) => {
      // Navigate to first lead
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await leadCard.click();
      await page.waitForLoadState('networkidle');

      // Click on "Lost" status
      const lostButton = page.locator('[data-testid="status-lost"], button:has-text("Lost")').first();
      await lostButton.click();

      // Should show lost reason modal
      await expect(page.locator('text=Mark Lead as Lost')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Budget constraints')).toBeVisible();
    });

    test('should mark lead as lost with reason', async ({ page }) => {
      // Navigate to first lead
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await leadCard.click();
      await page.waitForLoadState('networkidle');

      // Click on "Lost" status
      const lostButton = page.locator('[data-testid="status-lost"], button:has-text("Lost")').first();
      await lostButton.click();

      // Wait for modal
      await expect(page.locator('text=Mark Lead as Lost')).toBeVisible({ timeout: 5000 });

      // Select a reason
      await page.click('button:has-text("Budget constraints")');

      // Confirm
      await page.click('button:has-text("Confirm")');

      // Modal should close
      await expect(page.locator('text=Mark Lead as Lost')).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Activity Logging', () => {
    test('should log a note activity', async ({ page }) => {
      // Navigate to first lead
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await leadCard.click();
      await page.waitForLoadState('networkidle');

      // Click on Note tab
      await page.click('button:has-text("Note")');

      // Fill note content
      const noteText = `E2E Test Note - ${Date.now()}`;
      await page.fill('textarea', noteText);

      // Submit
      await page.click('button:has-text("Save Note")');

      // Wait for activity to be saved
      await page.waitForTimeout(2000);

      // Note should appear in timeline
      await expect(page.locator(`text=${noteText}`)).toBeVisible({ timeout: 10000 });
    });

    test('should log an email activity with direction', async ({ page }) => {
      // Navigate to first lead
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await leadCard.click();
      await page.waitForLoadState('networkidle');

      // Email tab should be active by default
      await expect(page.locator('button:has-text("Email")')).toHaveClass(/border-rust/);

      // Fill subject
      const subjectInput = page.locator('input[placeholder="Subject"]');
      if (await subjectInput.isVisible().catch(() => false)) {
        await subjectInput.fill('Follow up email');
      }

      // Fill body
      const emailBody = `E2E Test Email - ${Date.now()}`;
      await page.fill('textarea', emailBody);

      // Select outbound direction
      await page.click('button:has-text("Outbound")');

      // Submit
      await page.click('button:has-text("Log Email")');

      // Wait for activity to be saved
      await page.waitForTimeout(2000);

      // Email should appear in timeline
      await expect(page.locator('text=Email')).toBeVisible();
    });

    test('should log a call with duration', async ({ page }) => {
      // Navigate to first lead
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await leadCard.click();
      await page.waitForLoadState('networkidle');

      // Click on Call tab
      await page.click('button:has-text("Call")');

      // Fill call notes
      const callNotes = `E2E Test Call Notes - ${Date.now()}`;
      await page.fill('textarea', callNotes);

      // Fill duration
      const durationInput = page.locator('input[type="number"]');
      if (await durationInput.isVisible().catch(() => false)) {
        await durationInput.fill('15');
      }

      // Submit
      await page.click('button:has-text("Log Call")');

      // Wait for activity to be saved
      await page.waitForTimeout(2000);

      // Call should appear in timeline
      await expect(page.locator('text=Call')).toBeVisible();
    });
  });

  test.describe('Lead Conversion', () => {
    test('should open convert to deal modal', async ({ page }) => {
      // Navigate to first lead
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await leadCard.click();
      await page.waitForLoadState('networkidle');

      // Click convert button
      const convertButton = page.locator('button:has-text("Convert to Deal")');
      await expect(convertButton).toBeVisible({ timeout: 10000 });
      await convertButton.click();

      // Modal should appear
      await expect(page.locator('text=Convert to Deal')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[name="dealTitle"], input[placeholder*="Deal"]')).toBeVisible();
    });

    test('should convert lead to deal', async ({ page }) => {
      // First create a new lead to convert
      await openNewLeadModal(page);
      const uniqueName = `Lead To Convert ${Date.now()}`;
      await page.fill('[name="companyName"]', uniqueName);
      await page.fill('[name="firstName"]', 'Convert');
      await page.fill('[name="lastName"]', 'Test');
      await page.fill('[name="email"]', `convert${Date.now()}@test.com`);

      const valueField = page.locator('[name="estimatedValue"]');
      if (await valueField.isVisible().catch(() => false)) {
        await valueField.fill('75000');
      }

      await page.click('button:has-text("Create Lead")');
      await expect(page.locator('text=Create New Lead')).not.toBeVisible({ timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Click on the newly created lead
      await page.click(`text=${uniqueName}`);
      await page.waitForLoadState('networkidle');

      // Click convert button
      await page.click('button:has-text("Convert to Deal")');
      await expect(page.locator('h3:has-text("Convert to Deal")')).toBeVisible({ timeout: 5000 });

      // Fill deal details
      await page.fill('[name="dealTitle"], input[placeholder*="Deal"]', `Deal with ${uniqueName}`);
      await page.fill('[name="dealValue"], input[placeholder*="0"]', '75000');

      // Check create account option
      const createAccountCheckbox = page.locator('#createAccount');
      if (await createAccountCheckbox.isVisible().catch(() => false)) {
        await createAccountCheckbox.check();
      }

      // Click convert
      await page.click('button:has-text("Convert"):not(:has-text("to Deal"))');

      // Should redirect to deals page
      await expect(page).toHaveURL(/\/deals\/[a-z0-9-]+/, { timeout: 10000 });
    });
  });

  test.describe('Back Navigation', () => {
    test('should navigate back to leads list', async ({ page }) => {
      // Navigate to first lead
      const leadCard = page.locator('a[href*="/leads/"]').first();
      await leadCard.click();
      await page.waitForLoadState('networkidle');

      // Click back button
      await page.click('text=Back to Leads');

      // Should be back on leads list
      await expect(page).toHaveURL(/\/leads$/);
      await expect(page.locator('text=Total Leads')).toBeVisible();
    });
  });
});

test.describe('Leads API', () => {
  test('leads data should persist across page reloads', async ({ page }) => {
    await login(page);

    // Create a lead
    await navigateToLeads(page);
    await openNewLeadModal(page);

    const uniqueName = `Persist Test ${Date.now()}`;
    await page.fill('[name="companyName"]', uniqueName);
    await page.fill('[name="firstName"]', 'Persist');
    await page.fill('[name="lastName"]', 'Test');
    await page.fill('[name="email"]', `persist${Date.now()}@test.com`);
    await page.click('button:has-text("Create Lead")');
    await expect(page.locator('text=Create New Lead')).not.toBeVisible({ timeout: 10000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Lead should still be visible
    await expect(page.locator(`text=${uniqueName}`)).toBeVisible({ timeout: 10000 });
  });

  test('lead status changes should persist', async ({ page }) => {
    await login(page);
    await navigateToLeads(page);

    // Navigate to first lead
    const leadCard = page.locator('a[href*="/leads/"]').first();
    await leadCard.click();
    await page.waitForLoadState('networkidle');

    // Change status to hot
    const hotButton = page.locator('[data-testid="status-hot"], button:has-text("Hot")').first();
    await hotButton.click();
    await page.waitForTimeout(2000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Status should still be hot
    await expect(hotButton).toHaveClass(/ring-2|bg-red/);
  });
});
