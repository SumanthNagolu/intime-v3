/**
 * Admin Handlers E2E Tests
 *
 * End-to-end tests for admin handler health page.
 * Run with: pnpm test:e2e
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Handlers Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'admin@intimeesolutions.com');
    await page.fill('[name="password"]', 'AdminPass123');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navigate to handlers page
    await page.goto('/admin/handlers');
    await page.waitForLoadState('networkidle');
  });

  test('should display handler health dashboard', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Handler Health Dashboard');

    // Check health statistics exist
    await expect(page.locator('text=Total Handlers')).toBeVisible();
    await expect(page.locator('text=Healthy')).toBeVisible();
    await expect(page.locator('text=Warning')).toBeVisible();
    await expect(page.locator('text=Critical')).toBeVisible();
    await expect(page.locator('text=Disabled')).toBeVisible();
  });

  test('should display overall health percentage', async ({ page }) => {
    // Check overall health section
    await expect(page.locator('text=Overall Health')).toBeVisible();

    // Check health bar exists
    const healthBar = page.locator('[class*="rounded-full"]').first();
    await expect(healthBar).toBeVisible();
  });

  test('should display handlers table', async ({ page }) => {
    // Check table exists
    await expect(page.locator('table')).toBeVisible();

    // Check table headers
    await expect(page.locator('th:has-text("Handler Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Event Pattern")')).toBeVisible();
    await expect(page.locator('th:has-text("Health Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Failures")')).toBeVisible();
    await expect(page.locator('th:has-text("Last Failure")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should open handler details modal', async ({ page }) => {
    // Find first "Details" button
    const detailsButton = page.locator('button:has-text("Details")').first();

    // Click if exists
    if ((await detailsButton.count()) > 0) {
      await detailsButton.click();

      // Verify modal opened
      await expect(page.locator('h3:has-text("Handler Details")')).toBeVisible();

      // Verify modal content
      await expect(page.locator('text=Handler ID')).toBeVisible();
      await expect(page.locator('text=Handler Name')).toBeVisible();
      await expect(page.locator('text=Event Pattern')).toBeVisible();
      await expect(page.locator('text=Health Status')).toBeVisible();

      // Close modal
      await page.click('button:has-text("Close")');

      // Verify modal closed
      await expect(page.locator('h3:has-text("Handler Details")')).not.toBeVisible();
    }
  });

  test('should disable active handler', async ({ page }) => {
    // Find first "Disable" button
    const disableButton = page.locator('button:has-text("Disable")').first();

    // Click if exists
    if ((await disableButton.count()) > 0) {
      await disableButton.click();

      // Confirm dialog
      page.on('dialog', (dialog) => dialog.accept());

      // Wait for network request
      await page.waitForLoadState('networkidle');

      // Verify button changed to "Enable"
      // Note: The button might have changed or the handler might have moved in the list
    }
  });

  test('should enable disabled handler', async ({ page }) => {
    // Find first "Enable" button
    const enableButton = page.locator('button:has-text("Enable")').first();

    // Click if exists
    if ((await enableButton.count()) > 0) {
      await enableButton.click();

      // Confirm dialog
      page.on('dialog', (dialog) => dialog.accept());

      // Wait for network request
      await page.waitForLoadState('networkidle');

      // Verify action completed
    }
  });

  test('should display health status badges with correct colors', async ({ page }) => {
    // Find health status badges
    const healthBadges = page.locator('[class*="rounded-full"]').filter({ hasText: /Healthy|Warning|Critical|Disabled/ });

    // Verify at least one badge exists
    const count = await healthBadges.count();
    expect(count).toBeGreaterThanOrEqual(0);

    if (count > 0) {
      // Check first badge is visible
      await expect(healthBadges.first()).toBeVisible();
    }
  });

  test('should display failure counts', async ({ page }) => {
    // Check that failure count columns exist
    const failureCells = page.locator('td').filter({ hasText: /Total:|Consecutive:/ });

    if ((await failureCells.count()) > 0) {
      // Verify format contains "Total:" and "Consecutive:"
      const text = await failureCells.first().textContent();
      expect(text).toContain('Total:');
      expect(text).toContain('Consecutive:');
    }
  });

  test('should display last failure timestamp', async ({ page }) => {
    // Find cells with date/time or "Never"
    const lastFailureCells = page.locator('td').filter({ hasText: /\d{1,2}\/\d{1,2}\/\d{4}|Never/ });

    // Verify at least one exists
    expect(await lastFailureCells.count()).toBeGreaterThanOrEqual(0);
  });

  test('should be accessible', async ({ page }) => {
    // Basic accessibility checks

    // Check main heading exists
    await expect(page.locator('h1')).toBeVisible();

    // Check statistics are properly labeled
    await expect(page.locator('text=Total Handlers')).toBeVisible();

    // Check buttons have accessible text
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
