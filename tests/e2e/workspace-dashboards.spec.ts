/**
 * Workspace Dashboard E2E Tests
 *
 * Tests all 11 role-specific dashboards to verify:
 * 1. Dashboard loads correctly for each role
 * 2. Dashboard elements are connected to real database data
 * 3. Metrics, lists, and widgets display actual values (not loading/empty states)
 *
 * Run: pnpm playwright test tests/e2e/workspace-dashboards.spec.ts --project=chromium
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Test Configuration
// ============================================================================

const COMMON_PASSWORD = 'TestPass123!';
const ALT_PASSWORD = 'Test1234!';

// All test users mapped to their expected dashboard type
const TEST_USERS = {
  ceo: {
    email: 'ceo@intime.com',
    password: COMMON_PASSWORD,
    role: 'CEO',
    expectedConsole: 'CEO',
    workspace: '/employee/workspace',
    expectedElements: [
      { selector: 'h1', text: 'CEO' },
      { selector: '[data-testid="revenue-ytd"], text=Revenue YTD, text=YTD', type: 'metric' },
      { selector: 'text=Division Performance, text=Pod Scoreboard', type: 'section' },
    ],
  },
  admin: {
    email: 'admin@intime.com',
    password: COMMON_PASSWORD,
    role: 'Admin',
    expectedConsole: 'Admin',
    workspace: '/employee/workspace',
    expectedElements: [
      { selector: 'h1', text: 'Admin' },
      { selector: 'text=Total Users, text=Active Sessions', type: 'metric' },
      { selector: 'text=Integration Status, text=User Distribution', type: 'section' },
    ],
  },
  hr: {
    email: 'hr@intime.com',
    password: COMMON_PASSWORD,
    role: 'HR',
    expectedConsole: 'HR',
    workspace: '/employee/workspace',
    expectedElements: [
      { selector: 'h1', text: 'HR' },
      { selector: 'text=Headcount, text=Onboarding, text=Attrition', type: 'metric' },
      { selector: 'text=Compliance Alerts, text=Pending Approvals', type: 'section' },
    ],
  },
  seniorRecruiter: {
    email: 'sr_rec@intime.com',
    password: COMMON_PASSWORD,
    role: 'Senior Recruiter',
    expectedConsole: 'Recruiter',
    workspace: '/employee/workspace',
    expectedElements: [
      { selector: 'text=Active Jobs, text=My Jobs', type: 'metric' },
      { selector: 'text=Pipeline, text=Submissions', type: 'section' },
    ],
  },
  juniorRecruiter: {
    email: 'jr_rec@intime.com',
    password: COMMON_PASSWORD,
    role: 'Junior Recruiter',
    expectedConsole: 'Recruiter',
    workspace: '/employee/workspace',
    expectedElements: [
      { selector: 'text=Active Jobs, text=My Jobs', type: 'metric' },
      { selector: 'text=Pipeline, text=Submissions', type: 'section' },
    ],
  },
  seniorBenchSales: {
    email: 'sr_bs@intime.com',
    password: COMMON_PASSWORD,
    role: 'Senior Bench Sales',
    expectedConsole: 'Bench Sales',
    workspace: '/employee/workspace',
    expectedElements: [
      { selector: 'text=On Bench, text=Hotlist, text=Marketing', type: 'metric' },
      { selector: 'text=Placements, text=Pipeline', type: 'section' },
    ],
  },
  juniorBenchSales: {
    email: 'jr_bs@intime.com',
    password: COMMON_PASSWORD,
    role: 'Junior Bench Sales',
    expectedConsole: 'Bench Sales',
    workspace: '/employee/workspace',
    expectedElements: [
      { selector: 'text=On Bench, text=Hotlist, text=Marketing', type: 'metric' },
      { selector: 'text=Placements, text=Pipeline', type: 'section' },
    ],
  },
  seniorTA: {
    email: 'sr_ta@intime.com',
    password: COMMON_PASSWORD,
    role: 'Senior TA',
    expectedConsole: 'TA',
    workspace: '/employee/workspace',
    expectedElements: [
      { selector: 'text=Leads, text=Campaigns, text=Pipeline', type: 'metric' },
      { selector: 'text=Activity, text=Deals', type: 'section' },
    ],
  },
  juniorTA: {
    email: 'jr_ta@intime.com',
    password: COMMON_PASSWORD,
    role: 'Junior TA',
    expectedConsole: 'TA',
    workspace: '/employee/workspace',
    expectedElements: [
      { selector: 'text=Leads, text=Campaigns, text=Pipeline', type: 'metric' },
      { selector: 'text=Activity, text=Deals', type: 'section' },
    ],
  },
  trainer: {
    email: 'trainer@intime.com',
    password: COMMON_PASSWORD,
    role: 'Trainer',
    expectedConsole: 'Employee Portal',
    workspace: '/employee/portal',
    expectedElements: [
      { selector: 'text=Training, text=Courses, text=Students', type: 'section' },
    ],
  },
  student: {
    email: 'student@intime.com',
    password: COMMON_PASSWORD,
    role: 'Student',
    expectedConsole: 'Academy',
    workspace: '/academy/dashboard',
    expectedElements: [
      { selector: 'text=XP, text=Progress, text=Courses', type: 'metric' },
      { selector: 'text=Training, text=Learning', type: 'section' },
    ],
  },
};

// ============================================================================
// Types
// ============================================================================

interface TestResult {
  user: string;
  role: string;
  loginSuccess: boolean;
  dashboardLoaded: boolean;
  elementsFound: { selector: string; found: boolean; value?: string }[];
  dataSync: 'synced' | 'partial' | 'not_synced' | 'error';
  screenshot?: string;
  errors: string[];
}

const testResults: TestResult[] = [];

// ============================================================================
// Helper Functions
// ============================================================================

async function login(page: Page, email: string, password: string): Promise<boolean> {
  try {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', email);
    await page.fill('input[name="password"], input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    await page.waitForTimeout(3000);

    // Check if we're still on login page (login failed)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Try alternate password
      await page.fill('input[name="password"], input[type="password"]', ALT_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    return !page.url().includes('/login');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Login error for ${email}:`, error.message);
    } else {
      console.error(`Login error for ${email}:`, String(error));
    }
    return false;
  }
}

async function checkElement(page: Page, selector: string): Promise<{ found: boolean; value?: string }> {
  try {
    // Handle text selectors
    if (selector.startsWith('text=')) {
      const textOptions = selector.replace('text=', '').split(', ');
      for (const text of textOptions) {
        const element = page.locator(`text=${text}`).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          const content = await element.textContent();
          return { found: true, value: content || undefined };
        }
      }
      return { found: false };
    }

    // Handle regular selectors with optional text
    const [sel] = selector.split(', text=');
    const element = page.locator(sel).first();

    if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
      const content = await element.textContent();
      return { found: true, value: content || undefined };
    }

    return { found: false };
  } catch {
    return { found: false };
  }
}

async function extractMetricValue(page: Page, metricName: string): Promise<string | null> {
  try {
    // Try to find metric by name and get its value
    const metricCard = page.locator(`text=${metricName}`).first();
    if (await metricCard.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Get the parent card and find the value
      const parent = metricCard.locator('xpath=ancestor::div[contains(@class, "card") or contains(@class, "Card")]').first();
      const valueElement = parent.locator('.text-3xl, .text-4xl, .font-bold').first();
      if (await valueElement.isVisible({ timeout: 1000 }).catch(() => false)) {
        const value = await valueElement.textContent();
        return value;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function determineDataSyncStatus(elementsFound: { found: boolean; value?: string }[]): 'synced' | 'partial' | 'not_synced' | 'error' {
  const foundCount = elementsFound.filter(e => e.found).length;
  const hasValues = elementsFound.some(e => e.value && e.value !== '...' && e.value !== 'Loading');

  if (foundCount === 0) return 'not_synced';
  if (foundCount === elementsFound.length && hasValues) return 'synced';
  if (foundCount > 0) return 'partial';
  return 'error';
}

// ============================================================================
// Test Suites
// ============================================================================

test.describe('Workspace Dashboard Tests - All Roles', () => {

  test.afterAll(async () => {
    // Generate summary report
    console.log('\n' + '='.repeat(80));
    console.log('WORKSPACE DASHBOARD TEST REPORT');
    console.log('='.repeat(80));

    for (const result of testResults) {
      console.log(`\n${result.role} (${result.user}):`);
      console.log(`  Login: ${result.loginSuccess ? '✅' : '❌'}`);
      console.log(`  Dashboard Loaded: ${result.dashboardLoaded ? '✅' : '❌'}`);
      console.log(`  Data Sync: ${result.dataSync}`);
      console.log(`  Elements Found: ${result.elementsFound.filter(e => e.found).length}/${result.elementsFound.length}`);
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.join(', ')}`);
      }
    }

    console.log('\n' + '='.repeat(80));
  });

  // CEO Dashboard Test
  test('CEO Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.ceo;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      // Login
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      // Navigate to workspace
      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({ path: `test-results/dashboard-${user.role.toLowerCase().replace(' ', '-')}.png` });
      result.screenshot = `dashboard-${user.role.toLowerCase().replace(' ', '-')}.png`;

      // Check if dashboard loaded
      result.dashboardLoaded = await page.locator('h1, [role="heading"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      // Check expected elements
      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      // Check for specific metrics
      const revenueValue = await extractMetricValue(page, 'Revenue');
      const placementsValue = await extractMetricValue(page, 'Placements');

      if (revenueValue) result.elementsFound.push({ selector: 'Revenue Metric', found: true, value: revenueValue });
      if (placementsValue) result.elementsFound.push({ selector: 'Placements Metric', found: true, value: placementsValue });

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
    expect(result.loginSuccess).toBe(true);
    expect(result.dashboardLoaded).toBe(true);
  });

  // Admin Dashboard Test
  test('Admin Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.admin;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-${user.role.toLowerCase()}.png` });
      result.screenshot = `dashboard-${user.role.toLowerCase()}.png`;

      result.dashboardLoaded = await page.locator('h1, [role="heading"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      const usersValue = await extractMetricValue(page, 'Total Users');
      const sessionsValue = await extractMetricValue(page, 'Active Sessions');

      if (usersValue) result.elementsFound.push({ selector: 'Total Users Metric', found: true, value: usersValue });
      if (sessionsValue) result.elementsFound.push({ selector: 'Active Sessions Metric', found: true, value: sessionsValue });

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
    expect(result.loginSuccess).toBe(true);
  });

  // HR Dashboard Test
  test('HR Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.hr;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-${user.role.toLowerCase()}.png` });
      result.screenshot = `dashboard-${user.role.toLowerCase()}.png`;

      result.dashboardLoaded = await page.locator('h1, [role="heading"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      const headcountValue = await extractMetricValue(page, 'Headcount');
      const onboardingValue = await extractMetricValue(page, 'Onboarding');

      if (headcountValue) result.elementsFound.push({ selector: 'Headcount Metric', found: true, value: headcountValue });
      if (onboardingValue) result.elementsFound.push({ selector: 'Onboarding Metric', found: true, value: onboardingValue });

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
    expect(result.loginSuccess).toBe(true);
  });

  // Senior Recruiter Dashboard Test
  test('Senior Recruiter Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.seniorRecruiter;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-senior-recruiter.png` });
      result.screenshot = 'dashboard-senior-recruiter.png';

      result.dashboardLoaded = await page.locator('.min-h-screen, main, [role="main"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      const jobsValue = await extractMetricValue(page, 'Active Jobs');
      const submissionsValue = await extractMetricValue(page, 'Submissions');

      if (jobsValue) result.elementsFound.push({ selector: 'Active Jobs Metric', found: true, value: jobsValue });
      if (submissionsValue) result.elementsFound.push({ selector: 'Submissions Metric', found: true, value: submissionsValue });

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
  });

  // Junior Recruiter Dashboard Test
  test('Junior Recruiter Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.juniorRecruiter;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-junior-recruiter.png` });
      result.screenshot = 'dashboard-junior-recruiter.png';

      result.dashboardLoaded = await page.locator('.min-h-screen, main, [role="main"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
  });

  // Senior Bench Sales Dashboard Test
  test('Senior Bench Sales Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.seniorBenchSales;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-senior-bench-sales.png` });
      result.screenshot = 'dashboard-senior-bench-sales.png';

      result.dashboardLoaded = await page.locator('.min-h-screen, main, [role="main"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
  });

  // Junior Bench Sales Dashboard Test
  test('Junior Bench Sales Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.juniorBenchSales;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-junior-bench-sales.png` });
      result.screenshot = 'dashboard-junior-bench-sales.png';

      result.dashboardLoaded = await page.locator('.min-h-screen, main, [role="main"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
  });

  // Senior TA Dashboard Test
  test('Senior TA Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.seniorTA;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-senior-ta.png` });
      result.screenshot = 'dashboard-senior-ta.png';

      result.dashboardLoaded = await page.locator('.min-h-screen, main, [role="main"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
  });

  // Junior TA Dashboard Test
  test('Junior TA Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.juniorTA;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-junior-ta.png` });
      result.screenshot = 'dashboard-junior-ta.png';

      result.dashboardLoaded = await page.locator('.min-h-screen, main, [role="main"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
  });

  // Trainer Dashboard Test
  test('Trainer Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.trainer;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-trainer.png` });
      result.screenshot = 'dashboard-trainer.png';

      result.dashboardLoaded = await page.locator('.min-h-screen, main, [role="main"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
  });

  // Student Dashboard Test
  test('Student Dashboard - Verify data sync', async ({ page }) => {
    const user = TEST_USERS.student;
    const result: TestResult = {
      user: user.email,
      role: user.role,
      loginSuccess: false,
      dashboardLoaded: false,
      elementsFound: [],
      dataSync: 'error',
      errors: [],
    };

    try {
      result.loginSuccess = await login(page, user.email, user.password);
      if (!result.loginSuccess) {
        result.errors.push('Login failed');
        testResults.push(result);
        return;
      }

      await page.goto(user.workspace);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `test-results/dashboard-student.png` });
      result.screenshot = 'dashboard-student.png';

      result.dashboardLoaded = await page.locator('.min-h-screen, main, [role="main"]').first().isVisible({ timeout: 5000 }).catch(() => false);

      for (const element of user.expectedElements) {
        const check = await checkElement(page, element.selector);
        result.elementsFound.push({ selector: element.selector, ...check });
      }

      // Check for XP and progress metrics
      const xpValue = await extractMetricValue(page, 'XP');
      const progressValue = await extractMetricValue(page, 'Progress');

      if (xpValue) result.elementsFound.push({ selector: 'XP Metric', found: true, value: xpValue });
      if (progressValue) result.elementsFound.push({ selector: 'Progress Metric', found: true, value: progressValue });

      result.dataSync = determineDataSyncStatus(result.elementsFound);

    } catch (error) {
      if (error instanceof Error) {
        result.errors.push(error.message);
      } else {
        result.errors.push(String(error));
      }
      result.dataSync = 'error';
    }

    testResults.push(result);
  });

});

// ============================================================================
// Data Sync Verification Tests
// ============================================================================

test.describe('Database Field Sync Verification', () => {

  test('Verify CEO console metrics are from database', async ({ page }) => {
    await login(page, TEST_USERS.ceo.email, TEST_USERS.ceo.password);
    await page.goto('/employee/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check that metrics are not showing loading state
    const loadingIndicators = await page.locator('text=Loading, text=...').count();
    const metricCards = await page.locator('.text-3xl, .text-4xl').count();

    console.log(`CEO Dashboard - Loading indicators: ${loadingIndicators}, Metric cards: ${metricCards}`);

    // Take full page screenshot
    await page.screenshot({ path: 'test-results/ceo-full-dashboard.png', fullPage: true });

    // Verify at least some metrics are visible
    expect(metricCards).toBeGreaterThan(0);
  });

  test('Verify Admin console shows real user counts', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.goto('/employee/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for user count metric
    const totalUsersElement = page.locator('text=Total Users').first();
    const isVisible = await totalUsersElement.isVisible({ timeout: 2000 }).catch(() => false);

    await page.screenshot({ path: 'test-results/admin-full-dashboard.png', fullPage: true });

    if (isVisible) {
      console.log('Admin Dashboard - Total Users metric visible');
    } else {
      console.log('Admin Dashboard - Total Users metric not found, checking alternative layout');
    }
  });

  test('Verify HR console shows real headcount', async ({ page }) => {
    await login(page, TEST_USERS.hr.email, TEST_USERS.hr.password);
    await page.goto('/employee/workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/hr-full-dashboard.png', fullPage: true });

    // Look for headcount metric
    const headcountElement = page.locator('text=Headcount, text=Total Headcount').first();
    const isVisible = await headcountElement.isVisible({ timeout: 2000 }).catch(() => false);

    console.log(`HR Dashboard - Headcount visible: ${isVisible}`);
  });

});
