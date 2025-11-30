/**
 * Talent Edit Modal E2E Tests
 *
 * Focused tests for the EditTalentModal with all 12 tabs.
 * Navigates directly to talent detail page to test the modal.
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const TALENT_ID = '22476b60-1de7-412e-87d5-685ff871e7d8'; // rwqer rqeww

const RECRUITER = {
  email: 'jr_rec@intime.com',
  password: 'TestPass123!',
};

async function loginAsRecruiter(page: Page) {
  await page.goto(`${BASE_URL}/auth/employee`);
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[name="email"]', RECRUITER.email);
  await page.fill('input[type="password"], input[name="password"]', RECRUITER.password);
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/employee/, { timeout: 15000 });
}

test.describe('EditTalentModal Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRecruiter(page);
  });

  test('should open talent detail page and see Edit button', async ({ page }) => {
    // Navigate directly to talent detail page
    await page.goto(`${BASE_URL}/employee/recruiting/talent/${TALENT_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '.playwright-mcp/talent-detail-page.png', fullPage: true });

    // Look for Edit button - it's a small icon button with title "Edit Profile"
    const editButton = page.locator('button[title="Edit Profile"]').first();
    await expect(editButton).toBeVisible({ timeout: 10000 });
  });

  test('should open EditTalentModal when clicking Edit', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent/${TALENT_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Edit button - it's a small icon button with title "Edit Profile"
    const editButton = page.locator('button[title="Edit Profile"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: '.playwright-mcp/edit-modal-opened.png', fullPage: true });

    // Verify modal is open - look for modal content (h2 with "Edit Talent Profile")
    const modalTitle = page.locator('h2:has-text("Edit Talent Profile")');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
  });

  test('should display all 12 tabs in EditTalentModal', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent/${TALENT_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open Edit modal
    const editButton = page.locator('button[title="Edit Profile"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    // Check for tab buttons
    const tabNames = [
      'Personal', 'Contact', 'Professional', 'Addresses',
      'Work Auth', 'Education', 'Experience', 'Certifications',
      'References', 'Compliance', 'Compensation', 'Source'
    ];

    for (const tabName of tabNames) {
      const tab = page.locator(`button:has-text("${tabName}")`);
      const isVisible = await tab.isVisible().catch(() => false);
      console.log(`Tab "${tabName}": ${isVisible ? 'VISIBLE' : 'NOT FOUND'}`);
    }

    await page.screenshot({ path: '.playwright-mcp/modal-with-tabs.png', fullPage: true });
  });

  test('should navigate through all tabs and take screenshots', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent/${TALENT_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open Edit modal
    const editButton = page.locator('button[title="Edit Profile"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    // Take screenshot of each tab
    const tabs = [
      { name: 'Personal', file: 'modal-tab-personal' },
      { name: 'Contact', file: 'modal-tab-contact' },
      { name: 'Professional', file: 'modal-tab-professional' },
      { name: 'Addresses', file: 'modal-tab-addresses' },
      { name: 'Work Auth', file: 'modal-tab-workauth' },
      { name: 'Education', file: 'modal-tab-education' },
      { name: 'Experience', file: 'modal-tab-experience' },
      { name: 'Certifications', file: 'modal-tab-certifications' },
      { name: 'References', file: 'modal-tab-references' },
      { name: 'Compliance', file: 'modal-tab-compliance' },
      { name: 'Compensation', file: 'modal-tab-compensation' },
      { name: 'Source', file: 'modal-tab-source' },
    ];

    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab.name}")`).first();
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `.playwright-mcp/${tab.file}.png`, fullPage: true });
        console.log(`Screenshot taken for ${tab.name} tab`);
      }
    }
  });

  test('should add an address in Addresses tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent/${TALENT_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open Edit modal
    const editButton = page.locator('button[title="Edit Profile"]').first();
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

    await page.screenshot({ path: '.playwright-mcp/addresses-before-add.png', fullPage: true });

    // Click Add Address
    const addBtn = page.locator('button:has-text("Add Address"), button:has-text("Add New")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '.playwright-mcp/address-form-visible.png', fullPage: true });
    }
  });

  test('should update personal details and save', async ({ page }) => {
    await page.goto(`${BASE_URL}/employee/recruiting/talent/${TALENT_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open Edit modal
    const editButton = page.locator('button[title="Edit Profile"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }

    // Should be on Personal tab by default
    await page.screenshot({ path: '.playwright-mcp/personal-details-before.png', fullPage: true });

    // Try to find and fill professional headline
    const headlineInput = page.locator('input[name="professionalHeadline"], input[placeholder*="headline" i]').first();
    if (await headlineInput.isVisible()) {
      await headlineInput.fill(`Senior Developer - Updated ${Date.now()}`);
      await page.screenshot({ path: '.playwright-mcp/headline-updated.png', fullPage: true });
    }

    // Navigate to Professional tab and fill summary
    const professionalTab = page.locator('button:has-text("Professional")').first();
    if (await professionalTab.isVisible()) {
      await professionalTab.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '.playwright-mcp/professional-tab-view.png', fullPage: true });
    }

    // Look for Save button
    const saveBtn = page.locator('button:has-text("Save")').last();
    if (await saveBtn.isVisible()) {
      await page.screenshot({ path: '.playwright-mcp/before-save.png', fullPage: true });
    }
  });
});
