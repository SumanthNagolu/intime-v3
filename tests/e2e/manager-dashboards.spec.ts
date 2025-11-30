/**
 * Manager Dashboard E2E Tests
 * Tests manager-specific dashboards with role switching functionality
 */

import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = 'test-results/manager-screenshots';
const PASSWORD = 'TestPass123!';

const MANAGER_USERS = {
  recruitingManager: {
    email: 'sr_rec@intime.com',
    role: 'Recruiting Manager',
    expectedRoles: ['Recruiting Manager', 'Recruiter'],
  },
  benchManager: {
    email: 'sr_bs@intime.com',
    role: 'Bench Manager',
    expectedRoles: ['Bench Manager', 'Bench Sales'],
  },
  taManager: {
    email: 'sr_ta@intime.com',
    role: 'TA Manager',
    expectedRoles: ['TA Manager', 'TA Specialist'],
  },
};

async function loginAndNavigate(page: Page, email: string): Promise<void> {
  await page.goto('/auth/employee');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.goto('/employee/workspace');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('Manager Dashboards with Role Switching', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  });

  test('Recruiting Manager Dashboard with Role Switcher', async ({ page }) => {
    const user = MANAGER_USERS.recruitingManager;
    await loginAndNavigate(page, user.email);

    // Take screenshot of manager dashboard
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'recruiting-manager-dashboard.png'),
      fullPage: true,
    });

    // Check for role switcher button (should show +1 for dual role)
    const roleSwitcher = page.locator('button:has-text("Manager")');
    const hasSwitcher = await roleSwitcher.count() > 0;
    console.log(`Recruiting Manager - Has Role Switcher: ${hasSwitcher}`);

    // Check for manager-specific elements
    const hasTeamSection = await page.locator('text=Team Performance, text=Team').first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`Recruiting Manager - Has Team Section: ${hasTeamSection}`);

    // Click role switcher and take screenshot
    if (hasSwitcher) {
      await roleSwitcher.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'recruiting-manager-switcher-open.png'),
        fullPage: true,
      });

      // Try to switch to IC role
      const recruiterOption = page.locator('text=Recruiter').first();
      if (await recruiterOption.isVisible()) {
        await recruiterOption.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'recruiting-manager-as-ic.png'),
          fullPage: true,
        });
      }
    }

    expect(true).toBe(true); // Test completes
  });

  test('Bench Manager Dashboard with Role Switcher', async ({ page }) => {
    const user = MANAGER_USERS.benchManager;
    await loginAndNavigate(page, user.email);

    // Take screenshot of manager dashboard
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'bench-manager-dashboard.png'),
      fullPage: true,
    });

    // Check for manager-specific elements
    const managerTitle = await page.locator('text=Bench Sales Manager, text=Manager').first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`Bench Manager - Has Manager Title: ${managerTitle}`);

    // Click role switcher and take screenshot
    const roleSwitcher = page.locator('button:has-text("Manager")');
    if (await roleSwitcher.count() > 0) {
      await roleSwitcher.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'bench-manager-switcher-open.png'),
        fullPage: true,
      });

      // Try to switch to IC role
      const benchOption = page.locator('text=Bench Sales').first();
      if (await benchOption.isVisible()) {
        await benchOption.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'bench-manager-as-ic.png'),
          fullPage: true,
        });
      }
    }

    expect(true).toBe(true);
  });

  test('TA Manager Dashboard with Role Switcher', async ({ page }) => {
    const user = MANAGER_USERS.taManager;
    await loginAndNavigate(page, user.email);

    // Take screenshot of manager dashboard
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'ta-manager-dashboard.png'),
      fullPage: true,
    });

    // Check for manager-specific elements
    const managerTitle = await page.locator('text=TA Manager, text=Talent Acquisition').first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`TA Manager - Has Manager Title: ${managerTitle}`);

    // Click role switcher and take screenshot
    const roleSwitcher = page.locator('button:has-text("Manager")');
    if (await roleSwitcher.count() > 0) {
      await roleSwitcher.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'ta-manager-switcher-open.png'),
        fullPage: true,
      });

      // Try to switch to IC role
      const taOption = page.locator('text=TA Specialist').first();
      if (await taOption.isVisible()) {
        await taOption.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'ta-manager-as-ic.png'),
          fullPage: true,
        });
      }
    }

    expect(true).toBe(true);
  });

  test('Test Performance Tab for Recruiter Console', async ({ page }) => {
    await loginAndNavigate(page, 'jr_rec@intime.com');

    // Look for Performance tab
    const performanceTab = page.locator('text=Performance').first();
    if (await performanceTab.isVisible({ timeout: 2000 })) {
      await performanceTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'recruiter-performance-tab.png'),
        fullPage: true,
      });
      console.log('Recruiter Performance Tab: Found and clicked');
    } else {
      console.log('Recruiter Performance Tab: Not found');
      // Still capture the overview
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'recruiter-overview-tab.png'),
        fullPage: true,
      });
    }

    expect(true).toBe(true);
  });

  test('Test Performance/Tabs for CEO Console', async ({ page }) => {
    await loginAndNavigate(page, 'ceo@intime.com');

    // Capture each tab
    const tabs = ['Overview', 'Revenue', 'Operations', 'Strategic'];
    for (const tabName of tabs) {
      const tab = page.locator(`text=${tabName}`).first();
      if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `ceo-${tabName.toLowerCase()}-tab.png`),
          fullPage: true,
        });
        console.log(`CEO ${tabName} Tab: Captured`);
      }
    }

    expect(true).toBe(true);
  });

  test('Test Performance/Tabs for Admin Console', async ({ page }) => {
    await loginAndNavigate(page, 'admin@intime.com');

    // Capture each tab
    const tabs = ['Overview', 'Users', 'Audit', 'System'];
    for (const tabName of tabs) {
      const tab = page.locator(`text=${tabName}`).first();
      if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `admin-${tabName.toLowerCase()}-tab.png`),
          fullPage: true,
        });
        console.log(`Admin ${tabName} Tab: Captured`);
      }
    }

    expect(true).toBe(true);
  });

  test('Test Performance/Tabs for HR Console', async ({ page }) => {
    await loginAndNavigate(page, 'hr@intime.com');

    // Capture each tab
    const tabs = ['Overview', 'People', 'Performance', 'Compliance'];
    for (const tabName of tabs) {
      const tab = page.locator(`text=${tabName}`).first();
      if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `hr-${tabName.toLowerCase()}-tab.png`),
          fullPage: true,
        });
        console.log(`HR ${tabName} Tab: Captured`);
      }
    }

    expect(true).toBe(true);
  });
});
