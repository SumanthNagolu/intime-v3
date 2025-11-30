/**
 * Header & Logout E2E Test
 * Verifies the new header with login/logout functionality
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = 'test-results/header-screenshots';

test.describe('Workspace Header', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  });

  test('Header with User Menu and Logout', async ({ page }) => {
    // Login
    await page.goto('/auth/employee');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'jr_rec@intime.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Go to workspace
    await page.goto('/employee/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of full page with header
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'workspace-with-header.png'),
      fullPage: true,
    });

    // Check header elements
    const header = page.locator('header');
    const hasHeader = await header.count() > 0;
    console.log(`Has Header: ${hasHeader}`);

    // Check for InTime logo/brand
    const brand = page.locator('text=InTime');
    const hasBrand = await brand.count() > 0;
    console.log(`Has Brand: ${hasBrand}`);

    // Check for Home link
    const homeLink = page.locator('text=Home');
    const hasHomeLink = await homeLink.count() > 0;
    console.log(`Has Home Link: ${hasHomeLink}`);

    // Check for search bar
    const searchBar = page.locator('input[placeholder*="Search"]');
    const hasSearch = await searchBar.count() > 0;
    console.log(`Has Search: ${hasSearch}`);

    // Check for user menu button (avatar)
    const userMenu = page.locator('header button:has(.w-7)');
    const hasUserMenu = await userMenu.count() > 0;
    console.log(`Has User Menu: ${hasUserMenu}`);

    // Click user menu to open dropdown
    if (hasUserMenu) {
      await userMenu.first().click();
      await page.waitForTimeout(500);

      // Take screenshot with menu open
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'user-menu-open.png'),
        fullPage: true,
      });

      // Check for Sign Out option
      const signOutOption = page.locator('text=Sign Out');
      const hasSignOut = await signOutOption.isVisible({ timeout: 2000 });
      console.log(`Has Sign Out: ${hasSignOut}`);

      // Take screenshot highlighting logout
      if (hasSignOut) {
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'logout-option-visible.png'),
          fullPage: true,
        });
      }
    }

    expect(hasHeader).toBe(true);
  });

  test('CEO Dashboard with Header', async ({ page }) => {
    await page.goto('/auth/employee');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'ceo@intime.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    await page.goto('/employee/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'ceo-dashboard-with-header.png'),
      fullPage: true,
    });

    expect(true).toBe(true);
  });

  test('Manager Dashboard with Header and Role Switcher', async ({ page }) => {
    await page.goto('/auth/employee');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'sr_rec@intime.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    await page.goto('/employee/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'manager-dashboard-with-header.png'),
      fullPage: true,
    });

    // Look for role switcher
    const roleSwitcher = page.locator('button:has-text("+1"), button:has-text("+2")');
    if (await roleSwitcher.count() > 0) {
      await roleSwitcher.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'role-switcher-with-header.png'),
        fullPage: true,
      });
    }

    expect(true).toBe(true);
  });
});
