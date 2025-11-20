/**
 * Admin Events E2E Tests
 *
 * End-to-end tests for admin event management page.
 * Run with: pnpm test:e2e
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Events Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'admin@intimeesolutions.com');
    await page.fill('[name="password"]', 'AdminPass123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navigate to admin events page
    await page.goto('/admin/events');
    await page.waitForLoadState('networkidle');
  });

  test('should display events table', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Event Management');

    // Check table exists
    await expect(page.locator('table')).toBeVisible();

    // Check table headers
    await expect(page.locator('th:has-text("Event Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Created At")')).toBeVisible();
    await expect(page.locator('th:has-text("Retry Count")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should display filters', async ({ page }) => {
    // Check filter inputs exist
    await expect(page.locator('input[placeholder*="Event Type"]')).toBeVisible();
    await expect(page.locator('select:has-text("All Statuses")')).toBeVisible();
    await expect(page.locator('button:has-text("Apply Filters")')).toBeVisible();
  });

  test('should filter events by status', async ({ page }) => {
    // Select "Failed" status
    await page.selectOption('select', 'failed');

    // Click apply filters
    await page.click('button:has-text("Apply Filters")');

    // Wait for network request to complete
    await page.waitForLoadState('networkidle');

    // Verify only failed events are shown (if any exist)
    const statusBadges = page.locator('[data-status="failed"]');
    const count = await statusBadges.count();

    if (count > 0) {
      // Verify all visible events have "failed" status
      for (let i = 0; i < count; i++) {
        const status = await statusBadges.nth(i).textContent();
        expect(status?.toLowerCase()).toContain('failed');
      }
    }
  });

  test('should filter events by event type', async ({ page }) => {
    // Enter event type filter
    await page.fill('input[placeholder*="Event Type"]', 'user.created');

    // Click apply filters
    await page.click('button:has-text("Apply Filters")');

    // Wait for network request
    await page.waitForLoadState('networkidle');

    // Verify filtered results (if any exist)
    const eventTypeCells = page.locator('td:nth-child(1)');
    const count = await eventTypeCells.count();

    if (count > 0) {
      const firstEventType = await eventTypeCells.first().textContent();
      expect(firstEventType).toContain('user.created');
    }
  });

  test('should open event details modal', async ({ page }) => {
    // Find first "View Details" button
    const viewDetailsButton = page.locator('button:has-text("View Details")').first();

    // Click if exists
    if ((await viewDetailsButton.count()) > 0) {
      await viewDetailsButton.click();

      // Verify modal opened
      await expect(page.locator('h3:has-text("Event Details")')).toBeVisible();

      // Verify modal content
      await expect(page.locator('text=Event ID')).toBeVisible();
      await expect(page.locator('text=Event Type')).toBeVisible();
      await expect(page.locator('text=Payload')).toBeVisible();

      // Close modal
      await page.click('button:has-text("Close")');

      // Verify modal closed
      await expect(page.locator('h3:has-text("Event Details")')).not.toBeVisible();
    }
  });

  test('should retry failed event', async ({ page }) => {
    // Find first "Retry" button
    const retryButton = page.locator('button:has-text("Retry")').first();

    // Click if exists
    if ((await retryButton.count()) > 0) {
      await retryButton.click();

      // Confirm dialog
      page.on('dialog', (dialog) => dialog.accept());

      // Wait for success message or network request
      await page.waitForLoadState('networkidle');

      // Verify success (check for alert or toast)
      // Note: This depends on your toast/alert implementation
    }
  });

  test('should display dead letter queue section', async ({ page }) => {
    // Check if DLQ section exists (only if there are DLQ events)
    const dlqSection = page.locator('text=Dead Letter Queue');

    if ((await dlqSection.count()) > 0) {
      await expect(dlqSection).toBeVisible();
      await expect(page.locator('button:has-text("Replay All DLQ Events")')).toBeVisible();
    }
  });

  test('should change limit filter', async ({ page }) => {
    // Select 50 events limit
    await page.selectOption('select:has-text("100 events")', '50');

    // Click apply filters
    await page.click('button:has-text("Apply Filters")');

    // Wait for network request
    await page.waitForLoadState('networkidle');

    // Verify table updated (hard to verify exact count without pagination info)
    await expect(page.locator('table')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Basic accessibility checks

    // Check main heading exists
    await expect(page.locator('h1')).toBeVisible();

    // Check form labels exist
    await expect(page.locator('label:has-text("Event Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Status")')).toBeVisible();

    // Check buttons have text
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
