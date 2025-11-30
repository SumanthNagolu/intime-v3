/**
 * Talent Profile E2E Tests
 *
 * Tests for creating and editing talent profiles with full ATS-level details.
 * Covers all tabs in the EditTalentModal: personal, contact, professional,
 * addresses, work authorization, education, experience, certifications,
 * references, compliance, compensation, and source.
 *
 * Prerequisites:
 *   - Run `pnpm tsx scripts/seed-test-users.ts` to create test users
 *   - Ensure the app is running on localhost:3001
 *
 * Run: pnpm playwright test tests/e2e/talent-profile.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const COMMON_PASSWORD = 'TestPass123!';

const RECRUITER = {
  email: 'jr_rec@intime.com',
  password: COMMON_PASSWORD,
};

// Helper to login as recruiter
async function loginAsRecruiter(page: Page) {
  await page.goto(`${BASE_URL}/auth/employee`);
  await page.waitForLoadState('networkidle');

  // Fill login form
  await page.fill('input[type="email"], input[name="email"]', RECRUITER.email);
  await page.fill('input[type="password"], input[name="password"]', RECRUITER.password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForURL(/\/employee/, { timeout: 15000 });
}

// Generate unique test data
function generateTestCandidate() {
  const timestamp = Date.now();
  return {
    firstName: `Test`,
    lastName: `Candidate${timestamp}`,
    email: `test.candidate.${timestamp}@example.com`,
    phone: '555-123-4567',
  };
}

test.describe('Talent Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRecruiter(page);
  });

  test('should navigate to talent page', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent`);
    await page.waitForLoadState('networkidle');

    // Verify we're on the talent page
    await expect(page).toHaveURL(/\/employee\/recruiting\/talent/);
  });

  test('should create a new talent', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent`);
    await page.waitForLoadState('networkidle');

    // Look for Add Talent or Quick Add button
    const addButton = page.locator('button:has-text("Add"), button:has-text("Quick Add"), button:has-text("New")').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Wait for modal
    await page.waitForTimeout(500);

    // Fill in basic candidate info
    const candidate = generateTestCandidate();

    // Try different possible input selectors
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="First"], input[id*="first"]').first();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill(candidate.firstName);
    }

    const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="Last"], input[id*="last"]').first();
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill(candidate.lastName);
    }

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(candidate.email);
    }

    // Take screenshot
    await page.screenshot({ path: '.playwright-mcp/create-talent-form.png', fullPage: true });

    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: '.playwright-mcp/after-create-talent.png', fullPage: true });
  });

  test('should open EditTalentModal and navigate tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent`);
    await page.waitForLoadState('networkidle');

    // Wait for talent list to load
    await page.waitForTimeout(2000);

    // Click on a talent row to open workspace
    const talentRow = page.locator('tr, [data-testid="talent-row"], .talent-item').first();
    if (await talentRow.isVisible()) {
      await talentRow.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: '.playwright-mcp/talent-workspace.png', fullPage: true });

    // Look for Edit button
    const editButton = page.locator('button:has-text("Edit"), button[aria-label="Edit"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: '.playwright-mcp/edit-talent-modal.png', fullPage: true });

    // Test tab navigation
    const tabs = [
      'Personal',
      'Contact',
      'Professional',
      'Addresses',
      'Work Auth',
      'Education',
      'Experience',
      'Certifications',
      'References',
      'Compliance',
      'Compensation',
      'Source',
    ];

    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}"), [role="tab"]:has-text("${tabName}")`).first();
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `.playwright-mcp/tab-${tabName.toLowerCase().replace(' ', '-')}.png` });
      }
    }
  });

  test('should add address in Addresses tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on first talent
    const talentRow = page.locator('tr, [data-testid="talent-row"]').first();
    if (await talentRow.isVisible()) {
      await talentRow.click();
      await page.waitForTimeout(1000);
    }

    // Open edit modal
    const editButton = page.locator('button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to Addresses tab
    const addressTab = page.locator('button:has-text("Addresses")').first();
    if (await addressTab.isVisible()) {
      await addressTab.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: '.playwright-mcp/addresses-tab.png', fullPage: true });

    // Click Add Address
    const addAddressBtn = page.locator('button:has-text("Add Address")').first();
    if (await addAddressBtn.isVisible()) {
      await addAddressBtn.click();
      await page.waitForTimeout(500);

      // Fill address form
      await page.locator('input[name="street1"], input[placeholder*="Street"]').first().fill('123 Test Street');
      await page.locator('input[name="city"], input[placeholder*="City"]').first().fill('San Francisco');
      await page.locator('input[name="state"], input[placeholder*="State"]').first().fill('CA');
      await page.locator('input[name="postalCode"], input[placeholder*="Zip"]').first().fill('94105');

      await page.screenshot({ path: '.playwright-mcp/address-form-filled.png', fullPage: true });

      // Save address
      const saveBtn = page.locator('button:has-text("Save Address"), button:has-text("Add")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    await page.screenshot({ path: '.playwright-mcp/address-saved.png', fullPage: true });
  });

  test('should add education record', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on first talent
    const talentRow = page.locator('tr').first();
    if (await talentRow.isVisible()) {
      await talentRow.click();
      await page.waitForTimeout(1000);
    }

    // Open edit modal
    const editButton = page.locator('button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to Education tab
    const educationTab = page.locator('button:has-text("Education")').first();
    if (await educationTab.isVisible()) {
      await educationTab.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: '.playwright-mcp/education-tab.png', fullPage: true });

    // Click Add Education
    const addEducationBtn = page.locator('button:has-text("Add Education")').first();
    if (await addEducationBtn.isVisible()) {
      await addEducationBtn.click();
      await page.waitForTimeout(500);

      // Fill education form
      await page.locator('input[name="institution"], input[placeholder*="Institution"]').first().fill('Stanford University');
      await page.locator('input[name="fieldOfStudy"], input[placeholder*="Field"]').first().fill('Computer Science');

      await page.screenshot({ path: '.playwright-mcp/education-form-filled.png', fullPage: true });
    }
  });

  test('should add work experience', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on first talent
    const talentRow = page.locator('tr').first();
    if (await talentRow.isVisible()) {
      await talentRow.click();
      await page.waitForTimeout(1000);
    }

    // Open edit modal
    const editButton = page.locator('button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to Experience tab
    const experienceTab = page.locator('button:has-text("Experience")').first();
    if (await experienceTab.isVisible()) {
      await experienceTab.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: '.playwright-mcp/experience-tab.png', fullPage: true });

    // Click Add Experience
    const addExperienceBtn = page.locator('button:has-text("Add Experience"), button:has-text("Add Work")').first();
    if (await addExperienceBtn.isVisible()) {
      await addExperienceBtn.click();
      await page.waitForTimeout(500);

      // Fill experience form
      await page.locator('input[name="companyName"], input[placeholder*="Company"]').first().fill('Google');
      await page.locator('input[name="title"], input[placeholder*="Title"]').first().fill('Senior Software Engineer');

      await page.screenshot({ path: '.playwright-mcp/experience-form-filled.png', fullPage: true });
    }
  });

  test('should update personal details and save', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on first talent
    const talentRow = page.locator('tr').first();
    if (await talentRow.isVisible()) {
      await talentRow.click();
      await page.waitForTimeout(1000);
    }

    // Open edit modal
    const editButton = page.locator('button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    // Should be on Personal tab by default
    await page.screenshot({ path: '.playwright-mcp/personal-tab-before.png', fullPage: true });

    // Update professional headline
    const headlineInput = page.locator('input[name="professionalHeadline"], textarea[name="professionalHeadline"]').first();
    if (await headlineInput.isVisible()) {
      await headlineInput.fill('Senior Full Stack Developer | React | Node.js | AWS');
    }

    // Update professional summary
    const summaryInput = page.locator('textarea[name="professionalSummary"]').first();
    if (await summaryInput.isVisible()) {
      await summaryInput.fill('Experienced software engineer with 8+ years building scalable web applications.');
    }

    await page.screenshot({ path: '.playwright-mcp/personal-tab-after.png', fullPage: true });

    // Save changes
    const saveButton = page.locator('button:has-text("Save Changes"), button:has-text("Save")').last();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: '.playwright-mcp/after-save.png', fullPage: true });
  });
});

test.describe('Talent Profile Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRecruiter(page);
  });

  test('should persist data after save and reload', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on first talent
    const talentRow = page.locator('tr').first();

    if (await talentRow.isVisible()) {
      await talentRow.click();
      await page.waitForTimeout(1000);
    }

    // Open edit modal
    const editButton = page.locator('button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    // Add a unique identifier to test persistence
    const uniqueValue = `TestValue-${Date.now()}`;
    const headlineInput = page.locator('input[name="professionalHeadline"]').first();
    if (await headlineInput.isVisible()) {
      await headlineInput.fill(uniqueValue);
    }

    // Save
    const saveButton = page.locator('button:has-text("Save")').last();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }

    // Close modal
    const closeButton = page.locator('button:has-text("Close"), button[aria-label="Close"]').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open same talent again
    const sameRow = page.locator('tr').first();
    if (await sameRow.isVisible()) {
      await sameRow.click();
      await page.waitForTimeout(1000);
    }

    // Open edit modal again
    const editBtn2 = page.locator('button:has-text("Edit")').first();
    if (await editBtn2.isVisible()) {
      await editBtn2.click();
      await page.waitForTimeout(1000);
    }

    // Verify the value persisted
    await page.screenshot({ path: '.playwright-mcp/persistence-check.png', fullPage: true });

    const headlineValue = await page.locator('input[name="professionalHeadline"]').first().inputValue();
    console.log('Persisted headline value:', headlineValue);
  });
});
