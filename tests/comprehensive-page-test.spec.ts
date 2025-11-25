import { test, expect } from '@playwright/test';

test.describe('Comprehensive Page Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home
    await page.goto('http://localhost:3000');
  });

  test.describe('Public Routes', () => {
    test('Home page loads', async ({ page }) => {
      await page.goto('http://localhost:3000/');
      await expect(page).toHaveURL('/');
      await page.screenshot({ path: 'test-results/home.png' });
    });

    test('Login page loads', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      await expect(page).toHaveURL('/login');
      await page.screenshot({ path: 'test-results/login.png' });
    });
  });

  test.describe('Client Portal Routes', () => {
    const routes = [
      '/client/portal',
      '/client/jobs',
      '/client/jobs/1',
      '/client/pipeline',
      '/client/post',
      '/client/candidate/1'
    ];

    for (const route of routes) {
      test(`${route} loads without 404`, async ({ page }) => {
        const response = await page.goto(`http://localhost:3000${route}`);
        expect(response?.status()).not.toBe(404);
        await page.screenshot({ path: `test-results/client-${route.replace(/\//g, '-')}.png` });
      });
    }
  });

  test.describe('Talent Portal Routes', () => {
    const routes = [
      '/talent/portal',
      '/talent/jobs',
      '/talent/jobs/1'
    ];

    for (const route of routes) {
      test(`${route} loads without 404`, async ({ page }) => {
        const response = await page.goto(`http://localhost:3000${route}`);
        expect(response?.status()).not.toBe(404);
        await page.screenshot({ path: `test-results/talent-${route.replace(/\//g, '-')}.png` });
      });
    }
  });

  test.describe('Employee Recruiting Routes', () => {
    const routes = [
      '/employee/recruiting/jobs',
      '/employee/recruiting/jobs/1',
      '/employee/recruiting/leads',
      '/employee/recruiting/leads/1',
      '/employee/recruiting/deals',
      '/employee/recruiting/deals/1',
      '/employee/recruiting/pipeline',
      '/employee/recruiting/accounts',
      '/employee/recruiting/accounts/1',
      '/employee/recruiting/post',
      '/employee/recruiting/sourcing/1/1',
      '/employee/recruiting/screening/1/1',
      '/employee/recruiting/submission/1/1',
      '/employee/recruiting/placement/1/1',
      '/employee/recruiting/offer/1/1'
    ];

    for (const route of routes) {
      test(`${route} loads without 404`, async ({ page }) => {
        const response = await page.goto(`http://localhost:3000${route}`);
        expect(response?.status()).not.toBe(404);
        await page.screenshot({ path: `test-results/recruiting-${route.replace(/\//g, '-')}.png` });
      });
    }
  });

  test.describe('Employee Bench Routes', () => {
    const routes = [
      '/employee/bench/talent',
      '/employee/bench/talent/1',
      '/employee/bench/deals',
      '/employee/bench/leads',
      '/employee/bench/pipeline',
      '/employee/bench/outreach/1',
      '/employee/bench/jobs/1'
    ];

    for (const route of routes) {
      test(`${route} loads without 404`, async ({ page }) => {
        const response = await page.goto(`http://localhost:3000${route}`);
        expect(response?.status()).not.toBe(404);
        await page.screenshot({ path: `test-results/bench-${route.replace(/\//g, '-')}.png` });
      });
    }
  });

  test.describe('Employee TA/Sales Routes', () => {
    const routes = [
      '/employee/ta/leads',
      '/employee/ta/deals',
      '/employee/ta/campaigns',
      '/employee/ta/campaigns/new',
      '/employee/ta/candidates/1',
      '/employee/ta/prospects/1'
    ];

    for (const route of routes) {
      test(`${route} loads without 404`, async ({ page }) => {
        const response = await page.goto(`http://localhost:3000${route}`);
        expect(response?.status()).not.toBe(404);
        await page.screenshot({ path: `test-results/ta-${route.replace(/\//g, '-')}.png` });
      });
    }
  });

  test.describe('Employee HR Routes', () => {
    const routes = [
      '/employee/hr/people',
      '/employee/hr/org',
      '/employee/hr/time',
      '/employee/hr/payroll',
      '/employee/hr/documents',
      '/employee/hr/performance',
      '/employee/hr/learning',
      '/employee/hr/recruitment',
      '/employee/hr/analytics',
      '/employee/hr/profile/1'
    ];

    for (const route of routes) {
      test(`${route} loads without 404`, async ({ page }) => {
        const response = await page.goto(`http://localhost:3000${route}`);
        expect(response?.status()).not.toBe(404);
        await page.screenshot({ path: `test-results/hr-${route.replace(/\//g, '-')}.png` });
      });
    }
  });

  test.describe('Employee Academy Admin Routes', () => {
    const routes = [
      '/employee/academy/admin/cohorts',
      '/employee/academy/admin/cohorts/1',
      '/employee/academy/admin/certificates',
      '/employee/academy/admin/students'
    ];

    for (const route of routes) {
      test(`${route} loads without 404`, async ({ page }) => {
        const response = await page.goto(`http://localhost:3000${route}`);
        expect(response?.status()).not.toBe(404);
        await page.screenshot({ path: `test-results/academy-admin-${route.replace(/\//g, '-')}.png` });
      });
    }
  });

  test.describe('Employee Shared Routes', () => {
    const routes = [
      '/employee/shared/talent',
      '/employee/shared/jobs',
      '/employee/shared/combined'
    ];

    for (const route of routes) {
      test(`${route} loads without 404`, async ({ page }) => {
        const response = await page.goto(`http://localhost:3000${route}`);
        expect(response?.status()).not.toBe(404);
        await page.screenshot({ path: `test-results/shared-${route.replace(/\//g, '-')}.png` });
      });
    }
  });
});
