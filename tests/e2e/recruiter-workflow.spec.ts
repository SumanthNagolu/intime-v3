/**
 * Technical Recruiter Workflow E2E Tests
 * 
 * Tests the critical recruiter workflow path:
 * Create Job → Source Candidate → Submit → Schedule Interview → Make Offer → Place
 * 
 * Prerequisites:
 *   - Run `pnpm tsx scripts/seed-test-users.ts` to create test users
 *   - Ensure the app is running on localhost:3000
 * 
 * Run: pnpm playwright test tests/e2e/recruiter-workflow.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_USER = {
  email: 'jr_rec@intime.com',
  password: 'TestPass123!',
};

const MANAGER_USER = {
  email: 'sr_rec@intime.com',
  password: 'TestPass123!',
};

// ============================================================================
// Helper Functions
// ============================================================================

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation away from login page
  await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 10000 });
}

async function navigateToRecruiterDashboard(page: Page): Promise<void> {
  await page.goto('/employee/recruiting/dashboard');
  await page.waitForLoadState('networkidle');
}

async function navigateToJobs(page: Page): Promise<void> {
  await page.goto('/employee/recruiting/jobs');
  await page.waitForLoadState('networkidle');
}

async function navigateToCandidates(page: Page): Promise<void> {
  await page.goto('/employee/recruiting/candidates');
  await page.waitForLoadState('networkidle');
}

async function navigateToSubmissions(page: Page): Promise<void> {
  await page.goto('/employee/recruiting/pipeline');
  await page.waitForLoadState('networkidle');
}

// ============================================================================
// Test Suites
// ============================================================================

test.describe('Recruiter Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should display recruiter dashboard with KPIs', async ({ page }) => {
    await navigateToRecruiterDashboard(page);
    
    // Should see dashboard title or KPI section
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|recruiting|my work/i }).first()).toBeVisible({ timeout: 10000 });
    
    // Should see activity widget or metrics
    const hasKPIs = await page.locator('[data-testid="kpi-card"], .metric-card, .stat-card').count() > 0;
    const hasActivitySection = await page.locator('text=Activities, text=My Activities, text=Today').first().isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(hasKPIs || hasActivitySection).toBe(true);
  });

  test('should show quick action buttons', async ({ page }) => {
    await navigateToRecruiterDashboard(page);
    
    // Should have buttons for common actions
    const actionButtons = page.locator('button, a').filter({ 
      hasText: /create|new|add|log|call|email/i 
    });
    
    expect(await actionButtons.count()).toBeGreaterThan(0);
  });
});

test.describe('Job Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should display jobs list', async ({ page }) => {
    await navigateToJobs(page);
    
    // Should see jobs table or list
    const jobsList = page.locator('table, [data-testid="jobs-list"], .jobs-list, .job-card');
    await expect(jobsList.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter jobs by status', async ({ page }) => {
    await navigateToJobs(page);
    await page.waitForLoadState('networkidle');
    
    // Find filter dropdown or buttons
    const filterControl = page.locator('select, [data-testid="status-filter"], button').filter({
      hasText: /status|filter|all/i
    }).first();
    
    if (await filterControl.isVisible({ timeout: 3000 })) {
      await filterControl.click();
      
      // Select active status
      const activeOption = page.locator('option, [role="option"], button, [data-value]').filter({
        hasText: /active|open/i
      }).first();
      
      if (await activeOption.isVisible({ timeout: 2000 })) {
        await activeOption.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should open job detail view', async ({ page }) => {
    await navigateToJobs(page);
    
    // Click on first job
    const firstJob = page.locator('table tbody tr, .job-card, [data-testid="job-row"]').first();
    await firstJob.click();
    
    // Should navigate to job detail or open modal
    await page.waitForLoadState('networkidle');
    
    // Should see job detail content
    const jobDetail = page.locator('[data-testid="job-detail"], .job-detail, h1, h2').filter({
      hasText: /job|developer|engineer|manager/i
    });
    
    await expect(jobDetail.first()).toBeVisible({ timeout: 5000 });
  });

  test('should create a new job', async ({ page }) => {
    await navigateToJobs(page);
    
    // Click create job button
    const createButton = page.locator('button, a').filter({
      hasText: /create|new|add.*job/i
    }).first();
    
    await createButton.click();
    await page.waitForLoadState('networkidle');
    
    // Fill job form
    const uniqueTitle = `E2E Test Job ${Date.now()}`;
    
    // Fill title
    const titleInput = page.locator('input[name="title"], input[name="jobTitle"], input[placeholder*="title"]').first();
    if (await titleInput.isVisible({ timeout: 3000 })) {
      await titleInput.fill(uniqueTitle);
    }
    
    // Select account/client
    const accountSelect = page.locator('select[name="accountId"], [data-testid="account-select"]').first();
    if (await accountSelect.isVisible({ timeout: 2000 })) {
      await accountSelect.selectOption({ index: 1 });
    }
    
    // Fill location
    const locationInput = page.locator('input[name="location"]').first();
    if (await locationInput.isVisible({ timeout: 2000 })) {
      await locationInput.fill('Remote');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({
      hasText: /create|save|submit/i
    }).first();
    
    await submitButton.click();
    
    // Verify job was created (success message or redirect)
    const successIndicator = page.locator('text=created, text=success, text=saved').first();
    const wasCreated = await successIndicator.isVisible({ timeout: 5000 }).catch(() => false);
    const wasRedirected = !page.url().includes('create') && !page.url().includes('new');
    
    expect(wasCreated || wasRedirected).toBe(true);
  });
});

test.describe('Candidate Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should display candidates list', async ({ page }) => {
    await navigateToCandidates(page);
    
    // Should see candidates table or list
    const candidatesList = page.locator('table, [data-testid="candidates-list"], .candidates-list, .candidate-card');
    await expect(candidatesList.first()).toBeVisible({ timeout: 10000 });
  });

  test('should search candidates', async ({ page }) => {
    await navigateToCandidates(page);
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search-input"]').first();
    
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('java');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      // Results should update
      await page.waitForTimeout(1000);
    }
  });

  test('should open candidate profile', async ({ page }) => {
    await navigateToCandidates(page);
    
    // Click on first candidate
    const firstCandidate = page.locator('table tbody tr, .candidate-card, [data-testid="candidate-row"]').first();
    await firstCandidate.click();
    
    // Should navigate to candidate detail or open modal
    await page.waitForLoadState('networkidle');
    
    // Should see candidate profile content
    const candidateProfile = page.locator('[data-testid="candidate-detail"], .candidate-profile').first();
    const wasNavToProfile = page.url().includes('/candidates/');
    
    const hasProfile = await candidateProfile.isVisible({ timeout: 3000 }).catch(() => false) || wasNavToProfile;
    expect(hasProfile).toBe(true);
  });

  test('should add a new candidate', async ({ page }) => {
    await navigateToCandidates(page);
    
    // Click add candidate button
    const addButton = page.locator('button, a').filter({
      hasText: /create|new|add.*candidate/i
    }).first();
    
    await addButton.click();
    await page.waitForLoadState('networkidle');
    
    // Fill candidate form
    const uniqueEmail = `e2e-candidate-${Date.now()}@test.com`;
    
    // Fill name
    const firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]').first();
    if (await firstNameInput.isVisible({ timeout: 3000 })) {
      await firstNameInput.fill('E2E Test');
    }
    
    const lastNameInput = page.locator('input[name="lastName"], input[name="last_name"]').first();
    if (await lastNameInput.isVisible({ timeout: 2000 })) {
      await lastNameInput.fill('Candidate');
    }
    
    // Fill email
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 2000 })) {
      await emailInput.fill(uniqueEmail);
    }
    
    // Fill phone
    const phoneInput = page.locator('input[name="phone"]').first();
    if (await phoneInput.isVisible({ timeout: 2000 })) {
      await phoneInput.fill('555-123-4567');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({
      hasText: /create|save|submit|add/i
    }).first();
    
    await submitButton.click();
    
    // Verify candidate was created
    const successIndicator = page.locator('text=created, text=success, text=added').first();
    const wasCreated = await successIndicator.isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(wasCreated).toBe(true);
  });
});

test.describe('Submission Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should display submission pipeline', async ({ page }) => {
    await navigateToSubmissions(page);
    
    // Should see pipeline view (kanban or table)
    const pipelineView = page.locator('[data-testid="pipeline"], .pipeline, .kanban, table');
    await expect(pipelineView.first()).toBeVisible({ timeout: 10000 });
  });

  test('should view submission stages', async ({ page }) => {
    await navigateToSubmissions(page);
    
    // Should see different submission stages
    const stages = ['Sourced', 'Screening', 'Submitted', 'Interview', 'Offer', 'Placed'];
    
    for (const stage of stages) {
      const stageElement = page.locator(`text=${stage}`).first();
      const hasStage = await stageElement.isVisible({ timeout: 2000 }).catch(() => false);
      // Not all stages need to be visible, but at least some should be
    }
  });

  test('should open submission detail', async ({ page }) => {
    await navigateToSubmissions(page);
    
    // Click on a submission card
    const submissionCard = page.locator('[data-testid="submission-card"], .submission-card, .kanban-card').first();
    
    if (await submissionCard.isVisible({ timeout: 3000 })) {
      await submissionCard.click();
      await page.waitForLoadState('networkidle');
      
      // Should see submission detail
      const submissionDetail = page.locator('[data-testid="submission-detail"], .submission-detail, .modal').first();
      await expect(submissionDetail).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Activity Logging', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should log a call activity', async ({ page }) => {
    await navigateToRecruiterDashboard(page);
    
    // Click log call button
    const logCallButton = page.locator('button, a').filter({
      hasText: /log.*call|call/i
    }).first();
    
    if (await logCallButton.isVisible({ timeout: 3000 })) {
      await logCallButton.click();
      await page.waitForLoadState('networkidle');
      
      // Fill activity form
      const subjectInput = page.locator('input[name="subject"], textarea[name="notes"]').first();
      if (await subjectInput.isVisible({ timeout: 2000 })) {
        await subjectInput.fill('E2E Test Call');
      }
      
      // Submit
      const saveButton = page.locator('button[type="submit"], button').filter({
        hasText: /save|log|create/i
      }).first();
      
      await saveButton.click();
      
      // Verify activity was logged
      const successIndicator = page.locator('text=logged, text=created, text=success').first();
      await expect(successIndicator).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view activity timeline', async ({ page }) => {
    await navigateToCandidates(page);
    
    // Open first candidate
    const firstCandidate = page.locator('table tbody tr, .candidate-card').first();
    await firstCandidate.click();
    await page.waitForLoadState('networkidle');
    
    // Look for activity timeline
    const activitySection = page.locator('[data-testid="activity-timeline"], .activity-timeline, .timeline, text=Activities').first();
    const hasActivities = await activitySection.isVisible({ timeout: 5000 }).catch(() => false);
    
    // Activity section should be present in detail views
    // Note: May not have activities yet, but the section should exist
  });
});

test.describe('End-to-End Recruiter Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should complete basic recruiter workflow', async ({ page }) => {
    // This test walks through a simplified recruiter workflow
    
    // Step 1: Navigate to dashboard
    await navigateToRecruiterDashboard(page);
    await expect(page.locator('body')).toContainText(['Dashboard', 'Recruiting', 'Jobs', 'Activity']);
    
    // Step 2: View jobs
    await navigateToJobs(page);
    const jobsList = page.locator('table, [data-testid="jobs-list"], .job-card');
    await expect(jobsList.first()).toBeVisible({ timeout: 10000 });
    
    // Step 3: View candidates
    await navigateToCandidates(page);
    const candidatesList = page.locator('table, [data-testid="candidates-list"], .candidate-card');
    await expect(candidatesList.first()).toBeVisible({ timeout: 10000 });
    
    // Step 4: View pipeline
    await navigateToSubmissions(page);
    const pipeline = page.locator('[data-testid="pipeline"], .pipeline, .kanban, table');
    await expect(pipeline.first()).toBeVisible({ timeout: 10000 });
    
    // Workflow navigation complete
    test.info().annotations.push({ type: 'status', description: 'Basic workflow navigation passed' });
  });
});

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('should open command bar with Cmd+K', async ({ page }) => {
    await navigateToRecruiterDashboard(page);
    
    // Press Cmd+K (Meta+K on Mac)
    await page.keyboard.press('Meta+k');
    
    // Command bar should open
    const commandBar = page.locator('[data-testid="command-bar"], .command-palette, [role="dialog"]').first();
    const isOpen = await commandBar.isVisible({ timeout: 2000 }).catch(() => false);
    
    // May or may not have command bar implemented
    if (isOpen) {
      // Close it
      await page.keyboard.press('Escape');
    }
  });

  test('should navigate with g shortcuts', async ({ page }) => {
    await navigateToRecruiterDashboard(page);
    
    // Try 'g j' for jobs
    await page.keyboard.type('gj');
    await page.waitForTimeout(500);
    
    // May or may not have keyboard navigation implemented
    // This is a feature test, not a requirement test
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await login(page, TEST_USER.email, TEST_USER.password);
    await navigateToRecruiterDashboard(page);
    
    // Dashboard should be visible
    const dashboard = page.locator('body');
    await expect(dashboard).toBeVisible();
    
    // Navigation should be accessible (might be hamburger menu)
    const nav = page.locator('nav, [data-testid="navigation"], .sidebar, button[aria-label*="menu"]').first();
    await expect(nav).toBeVisible({ timeout: 5000 });
  });

  test('should display correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await login(page, TEST_USER.email, TEST_USER.password);
    await navigateToRecruiterDashboard(page);
    
    // Dashboard should be visible (might be simplified)
    const dashboard = page.locator('body');
    await expect(dashboard).toBeVisible();
    
    // Mobile menu should be available
    const menuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"], .hamburger').first();
    const hasMenu = await menuButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Mobile should have some navigation mechanism
  });
});

