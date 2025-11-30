/**
 * Dashboard Screenshot Capture Test
 * Captures screenshots of all role-specific dashboards for verification.
 */

import { test, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const TEST_USERS = {
  ceo: { email: 'ceo@intime.com', password: 'TestPass123!', role: 'CEO' },
  admin: { email: 'admin@intime.com', password: 'TestPass123!', role: 'Admin' },
  hr: { email: 'hr@intime.com', password: 'TestPass123!', role: 'HR' },
  recruiterJr: { email: 'jr_rec@intime.com', password: 'TestPass123!', role: 'Recruiter' },
  recruiterSr: { email: 'sr_rec@intime.com', password: 'TestPass123!', role: 'Sr Recruiter' },
  benchSalesJr: { email: 'jr_bs@intime.com', password: 'TestPass123!', role: 'Bench Sales' },
  benchSalesSr: { email: 'sr_bs@intime.com', password: 'TestPass123!', role: 'Sr Bench Sales' },
  taJr: { email: 'jr_ta@intime.com', password: 'TestPass123!', role: 'TA Specialist' },
  taSr: { email: 'sr_ta@intime.com', password: 'TestPass123!', role: 'Sr TA' },
  trainer: { email: 'trainer@intime.com', password: 'TestPass123!', role: 'Trainer' },
  student: { email: 'student@intime.com', password: 'TestPass123!', role: 'Student' },
};

const SCREENSHOT_DIR = 'test-results/dashboard-screenshots';

interface CaptureResult {
  user: string;
  role: string;
  loginSuccess: boolean;
  screenshotPath: string;
  dashboardElements: string[];
  errors: string[];
}

async function loginAndCapture(page: Page, user: typeof TEST_USERS.ceo, outputName: string): Promise<CaptureResult> {
  const results: CaptureResult = {
    user: user.email,
    role: user.role,
    loginSuccess: false,
    screenshotPath: '',
    dashboardElements: [],
    errors: [],
  };

  try {
    // Navigate to employee login
    await page.goto('/auth/employee');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForTimeout(3000);

    // Check if login succeeded
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/') && !currentUrl.includes('/employee/')) {
      results.errors.push('Login failed - still on auth page');
      return results;
    }

    results.loginSuccess = true;

    // Navigate to workspace
    await page.goto('/employee/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Capture dashboard elements visible
    const elementsToCheck = [
      { selector: 'text=Active Jobs', name: 'Active Jobs' },
      { selector: 'text=In Pipeline', name: 'In Pipeline' },
      { selector: 'text=Interviews', name: 'Interviews' },
      { selector: 'text=Placements', name: 'Placements' },
      { selector: 'text=On Bench', name: 'On Bench' },
      { selector: 'text=Hotlist', name: 'Hotlist' },
      { selector: 'text=Leads', name: 'Leads' },
      { selector: 'text=Deals', name: 'Deals' },
      { selector: 'text=Revenue', name: 'Revenue' },
      { selector: 'text=Headcount', name: 'Headcount' },
      { selector: 'text=Total Users', name: 'Total Users' },
      { selector: 'text=Gross Margin', name: 'Gross Margin' },
      { selector: 'text=Organization Overview', name: 'Org Overview' },
      { selector: 'text=Department Performance', name: 'Department Performance' },
    ];

    for (const elem of elementsToCheck) {
      try {
        const isVisible = await page.locator(elem.selector).first().isVisible({ timeout: 500 });
        if (isVisible) {
          results.dashboardElements.push(elem.name);
        }
      } catch {
        // Element not found
      }
    }

    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    // Take screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `${outputName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    results.screenshotPath = screenshotPath;

  } catch (error) {
    if (error instanceof Error) {
      results.errors.push(error.message);
    } else {
      results.errors.push(String(error));
    }
  }

  return results;
}

test.describe('Dashboard Screenshots - All Roles', () => {
  const allResults: CaptureResult[] = [];

  test.afterAll(async () => {
    // Generate summary report
    const reportPath = path.join(SCREENSHOT_DIR, 'SCREENSHOT-REPORT.md');
    let report = `# Dashboard Screenshot Report\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n\n`;
    report += `## Results Summary\n\n`;
    report += `| Role | User | Login | Elements Found | Screenshot |\n`;
    report += `|------|------|-------|----------------|------------|\n`;

    for (const r of allResults) {
      const login = r.loginSuccess ? 'Success' : 'Failed';
      const elements = r.dashboardElements.length > 0 ? r.dashboardElements.join(', ') : 'None';
      const screenshot = r.screenshotPath ? `[View](${path.basename(r.screenshotPath)})` : 'N/A';
      report += `| ${r.role} | ${r.user} | ${login} | ${elements} | ${screenshot} |\n`;
    }

    report += `\n## Errors\n\n`;
    for (const r of allResults) {
      if (r.errors.length > 0) {
        report += `### ${r.role} (${r.user})\n`;
        for (const err of r.errors) {
          report += `- ${err}\n`;
        }
        report += `\n`;
      }
    }

    fs.writeFileSync(reportPath, report);
    console.log(`\nReport saved to: ${reportPath}`);
  });

  test('CEO Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.ceo, 'ceo-dashboard');
    allResults.push(result);
    console.log(`CEO: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('Admin Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.admin, 'admin-dashboard');
    allResults.push(result);
    console.log(`Admin: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('HR Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.hr, 'hr-dashboard');
    allResults.push(result);
    console.log(`HR: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('Junior Recruiter Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.recruiterJr, 'recruiter-jr-dashboard');
    allResults.push(result);
    console.log(`Jr Recruiter: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('Senior Recruiter Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.recruiterSr, 'recruiter-sr-dashboard');
    allResults.push(result);
    console.log(`Sr Recruiter: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('Junior Bench Sales Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.benchSalesJr, 'bench-jr-dashboard');
    allResults.push(result);
    console.log(`Jr Bench: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('Senior Bench Sales Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.benchSalesSr, 'bench-sr-dashboard');
    allResults.push(result);
    console.log(`Sr Bench: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('Junior TA Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.taJr, 'ta-jr-dashboard');
    allResults.push(result);
    console.log(`Jr TA: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('Senior TA Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.taSr, 'ta-sr-dashboard');
    allResults.push(result);
    console.log(`Sr TA: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('Trainer Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.trainer, 'trainer-dashboard');
    allResults.push(result);
    console.log(`Trainer: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });

  test('Student Dashboard', async ({ page }) => {
    const result = await loginAndCapture(page, TEST_USERS.student, 'student-dashboard');
    allResults.push(result);
    console.log(`Student: ${result.loginSuccess ? 'OK' : 'FAILED'} - Elements: ${result.dashboardElements.join(', ')}`);
  });
});
