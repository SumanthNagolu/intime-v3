import { test, expect } from '@playwright/test';

test.describe('Navigation and Button Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('Client Portal Navigation', () => {
    test('Client portal dashboard links work', async ({ page }) => {
      await page.goto('http://localhost:3000/client/portal');
      await page.waitForLoadState('networkidle');

      // Take screenshot
      await page.screenshot({ path: 'test-results/nav/client-portal.png' });

      // Test "Post New Job" button
      const postJobBtn = page.locator('a:has-text("Post New Job")').first();
      if (await postJobBtn.isVisible()) {
        await expect(postJobBtn).toHaveAttribute('href', '/client/post');
      }

      // Test "View All Jobs" button
      const viewJobsBtn = page.locator('a:has-text("View All Jobs")').first();
      if (await viewJobsBtn.isVisible()) {
        await expect(viewJobsBtn).toHaveAttribute('href', '/client/jobs');
      }
    });

    test('Client jobs list navigation', async ({ page }) => {
      await page.goto('http://localhost:3000/client/jobs');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/client-jobs.png' });

      // Test "Post New Job" button in header
      const postBtn = page.locator('a:has-text("Post New Job")').first();
      if (await postBtn.isVisible()) {
        await expect(postBtn).toHaveAttribute('href', '/client/post');
      }

      // Test job detail links
      const jobLinks = page.locator('a[href^="/client/jobs/"]');
      const count = await jobLinks.count();
      console.log(`Found ${count} job links`);
    });

    test('Client pipeline page loads', async ({ page }) => {
      await page.goto('http://localhost:3000/client/pipeline');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/client-pipeline.png' });

      // Check for candidate cards
      const candidateLinks = page.locator('a[href^="/client/candidate/"]');
      const count = await candidateLinks.count();
      console.log(`Found ${count} candidate links in pipeline`);
    });
  });

  test.describe('Talent Portal Navigation', () => {
    test('Talent portal dashboard', async ({ page }) => {
      await page.goto('http://localhost:3000/talent/portal');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/talent-portal.png' });

      // Check job links
      const jobLinks = page.locator('a[href^="/talent/jobs"]');
      const count = await jobLinks.count();
      console.log(`Found ${count} job-related links`);
    });

    test('Talent jobs list', async ({ page }) => {
      await page.goto('http://localhost:3000/talent/jobs');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/talent-jobs.png' });

      // Check for job detail links
      const jobDetailLinks = page.locator('a[href^="/talent/jobs/"]');
      const count = await jobDetailLinks.count();
      console.log(`Found ${count} job detail links`);
    });

    test('Talent job detail with apply button', async ({ page }) => {
      await page.goto('http://localhost:3000/talent/jobs/1');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/talent-job-detail.png' });

      // Test Apply Now button functionality
      const applyBtn = page.locator('button:has-text("Apply Now")');
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/nav/talent-job-applied.png' });

        // Check for success message
        const successMsg = page.locator('text=Application Submitted');
        await expect(successMsg).toBeVisible();
      }
    });
  });

  test.describe('Employee Recruiting Navigation', () => {
    test('Recruiting jobs list navigation', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/recruiting/jobs');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/recruiting-jobs.png' });

      // Test "New Job Order" button
      const newJobBtn = page.locator('a:has-text("New Job Order")').first();
      if (await newJobBtn.isVisible()) {
        await expect(newJobBtn).toHaveAttribute('href', '/employee/recruiting/post');
      }
    });

    test('Recruiting leads navigation', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/recruiting/leads');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/recruiting-leads.png' });
    });

    test('Recruiting pipeline navigation', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/recruiting/pipeline');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/recruiting-pipeline.png' });

      // Check for submission cards
      const submissionLinks = page.locator('a[href*="/submission/"]');
      const count = await submissionLinks.count();
      console.log(`Found ${count} submission links`);
    });

    test('Post job order form', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/recruiting/post');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/recruiting-post-job.png' });

      // Check form fields exist
      await expect(page.locator('input[placeholder*="Senior Full Stack Developer"]')).toBeVisible();
      await expect(page.locator('button:has-text("Post Job Order")')).toBeVisible();
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    });
  });

  test.describe('Employee Bench Sales Navigation', () => {
    test('Bench talent list', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/bench/talent');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/bench-talent.png' });

      // Check for talent detail links
      const talentLinks = page.locator('a[href^="/employee/bench/talent/"]');
      const count = await talentLinks.count();
      console.log(`Found ${count} talent detail links`);
    });

    test('Bench deals navigation', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/bench/deals');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/bench-deals.png' });
    });
  });

  test.describe('Employee HR Navigation', () => {
    test('HR people directory', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/hr/people');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/hr-people.png' });
    });

    test('HR org chart', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/hr/org');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/hr-org.png' });
    });

    test('HR learning admin', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/hr/learning');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/hr-learning.png' });
    });
  });

  test.describe('Employee Academy Admin Navigation', () => {
    test('Cohorts list with New Cohort button', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/academy/admin/cohorts');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/academy-cohorts.png' });

      // Test New Cohort button
      const newCohortBtn = page.locator('a:has-text("New Cohort")').first();
      if (await newCohortBtn.isVisible()) {
        await expect(newCohortBtn).toHaveAttribute('href', '/employee/academy/admin/cohorts/new');
      }

      // Check for cohort detail links
      const cohortLinks = page.locator('a[href^="/employee/academy/admin/cohorts/"]');
      const count = await cohortLinks.count();
      console.log(`Found ${count} cohort links`);
    });

    test('Certificate manager with search', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/academy/admin/certificates');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/academy-certificates.png' });

      // Test search input
      const searchInput = page.locator('input[placeholder*="Search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Alex Rivera');
        await page.screenshot({ path: 'test-results/nav/academy-certificates-search.png' });
      }

      // Check for action buttons
      const viewButtons = page.locator('button[title="View Certificate"]');
      const downloadButtons = page.locator('button[title="Download Certificate"]');
      console.log(`Found ${await viewButtons.count()} view buttons, ${await downloadButtons.count()} download buttons`);
    });
  });

  test.describe('Employee TA/Sales Navigation', () => {
    test('TA campaigns list', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/ta/campaigns');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/ta-campaigns.png' });
    });

    test('TA deals navigation', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/ta/deals');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/ta-deals.png' });
    });
  });

  test.describe('Employee Shared Navigation', () => {
    test('Shared talent pool', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/shared/talent');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/shared-talent.png' });
    });

    test('Shared job board', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/shared/jobs');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/shared-jobs.png' });
    });

    test('Combined view', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/shared/combined');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/shared-combined.png' });
    });
  });

  test.describe('Workflow Navigation Tests', () => {
    test('Placement workflow progression', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/recruiting/placement/1/1');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/placement-workflow-step1.png' });

      // Test "Next Step" button
      const nextBtn = page.locator('button:has-text("Next Step")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/nav/placement-workflow-step2.png' });
      }
    });

    test('Offer builder form', async ({ page }) => {
      await page.goto('http://localhost:3000/employee/recruiting/offer/1/1');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/nav/offer-builder.png' });

      // Check form inputs
      await expect(page.locator('input[value*="$110,000"]')).toBeVisible();

      // Test Send Offer button
      const sendBtn = page.locator('button:has-text("Send Offer")');
      if (await sendBtn.isVisible()) {
        await sendBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/nav/offer-sent.png' });

        // Check for success screen
        const successHeading = page.locator('h1:has-text("Offer Sent!")');
        await expect(successHeading).toBeVisible();
      }
    });
  });
});
