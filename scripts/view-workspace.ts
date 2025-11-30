/**
 * Script to view and capture the new workspace pages
 */

import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login first
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/auth/employee`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Wait for form to be visible and fill login form
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('jr_rec@intime.com');

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill('TestPass123!');

  // Click sign in button
  await page.click('button:has-text("Sign In")');

  // Wait for navigation after login
  await page.waitForTimeout(4000);
  console.log('Logged in successfully');

  console.log('Opening workspace dashboard...');

  // Navigate to workspace dashboard - Recruiting role (default)
  await page.goto(`${BASE_URL}/employee/workspace`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '.playwright-mcp/workspace-dashboard-recruiting.png', fullPage: false });
  console.log('Screenshot: workspace-dashboard-recruiting.png');

  // Switch to Bench Sales role
  await page.goto(`${BASE_URL}/employee/workspace?role=bench`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '.playwright-mcp/workspace-dashboard-bench.png', fullPage: false });
  console.log('Screenshot: workspace-dashboard-bench.png');

  // Switch to TA/BD role
  await page.goto(`${BASE_URL}/employee/workspace?role=ta`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '.playwright-mcp/workspace-dashboard-ta.png', fullPage: false });
  console.log('Screenshot: workspace-dashboard-ta.png');

  // Switch to Manager role
  await page.goto(`${BASE_URL}/employee/workspace?role=manager`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '.playwright-mcp/workspace-dashboard-manager.png', fullPage: false });
  console.log('Screenshot: workspace-dashboard-manager.png');

  // Switch to Executive role
  await page.goto(`${BASE_URL}/employee/workspace?role=executive`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '.playwright-mcp/workspace-dashboard-executive.png', fullPage: false });
  console.log('Screenshot: workspace-dashboard-executive.png');

  // Navigate to Leads workspace
  await page.goto(`${BASE_URL}/employee/workspace/leads`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '.playwright-mcp/workspace-leads.png', fullPage: false });
  console.log('Screenshot: workspace-leads.png');

  // Navigate to Jobs workspace
  await page.goto(`${BASE_URL}/employee/workspace/jobs`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '.playwright-mcp/workspace-jobs.png', fullPage: false });
  console.log('Screenshot: workspace-jobs.png');

  // Navigate to Talent workspace
  await page.goto(`${BASE_URL}/employee/workspace/talent`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '.playwright-mcp/workspace-talent.png', fullPage: false });
  console.log('Screenshot: workspace-talent.png');

  // Navigate to Submissions workspace
  await page.goto(`${BASE_URL}/employee/workspace/submissions`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '.playwright-mcp/workspace-submissions.png', fullPage: false });
  console.log('Screenshot: workspace-submissions.png');

  console.log('\nAll screenshots saved to .playwright-mcp/');
  console.log('Browser will stay open for manual inspection. Press Ctrl+C to close.');

  // Keep browser open for inspection
  await page.waitForTimeout(60000);

  await browser.close();
}

main().catch(console.error);
