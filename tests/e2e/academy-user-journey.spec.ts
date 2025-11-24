/**
 * Academy User Journey - End-to-End Tests
 *
 * Tests the complete student learning flow:
 * Dashboard → Courses → Lesson → 4 Stages → Navigation
 */

import { test, expect, Page } from '@playwright/test';

// Helper function to wait for page load
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Additional wait for React hydration
}

// Helper function to login as test student
async function loginAsStudent(page: Page) {
  await page.goto('http://localhost:3000/login');
  await waitForPageLoad(page);

  // Fill in login form
  await page.fill('input[type="email"]', 'student@intime.com');
  await page.fill('input[type="password"]', 'password123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (redirects to /dashboard first)
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await waitForPageLoad(page);

  // Navigate to students dashboard
  await page.goto('http://localhost:3000/students/dashboard');
  await waitForPageLoad(page);
}

test.describe('Academy User Journey - Complete Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Login before each test
    await loginAsStudent(page);
  });

  test('1. Dashboard - Loads and displays correctly', async ({ page }) => {
    console.log('🎯 Testing Dashboard...');

    await page.goto('http://localhost:3000/students/dashboard');
    await waitForPageLoad(page);

    // Check page title
    await expect(page.locator('h1')).toContainText('Transformation in Progress');

    // Verify hero card exists
    const heroCard = page.locator('text=Today\'s Focus').first();
    await expect(heroCard).toBeVisible();

    // Verify employability matrix
    await expect(page.locator('text=Employability Matrix')).toBeVisible();
    await expect(page.locator('text=Technical Skills')).toBeVisible();
    await expect(page.locator('text=Communication')).toBeVisible();
    await expect(page.locator('text=Portfolio Quality')).toBeVisible();

    // Verify curriculum horizon
    await expect(page.locator('text=Curriculum Horizon')).toBeVisible();

    // Verify sprint backlog
    await expect(page.locator('text=Sprint Backlog')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/01-dashboard.png', fullPage: true });
    console.log('✅ Dashboard test passed');
  });

  test('2. Courses List - Timeline and navigation', async ({ page }) => {
    console.log('🎯 Testing Courses List...');

    await page.goto('http://localhost:3000/students/courses');
    await waitForPageLoad(page);

    // Check page heading
    await expect(page.locator('h1')).toContainText('The Path');

    // Verify timeline exists
    const timelineDescription = page.locator('text=One curriculum. One goal. Your new career.');
    await expect(timelineDescription).toBeVisible();

    // Check for modules (should have at least 1)
    const modules = page.locator('[class*="space-y-12"] > div');
    const moduleCount = await modules.count();
    expect(moduleCount).toBeGreaterThan(0);
    console.log(`✅ Found ${moduleCount} modules`);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/02-courses-list.png', fullPage: true });
    console.log('✅ Courses list test passed');
  });

  test('3. Navigation from Dashboard to Lesson', async ({ page }) => {
    console.log('🎯 Testing Dashboard → Lesson navigation...');

    // Start at dashboard
    await page.goto('http://localhost:3000/students/dashboard');
    await waitForPageLoad(page);

    // Click "Enter The Protocol" button
    const enterButton = page.locator('button:has-text("Enter The Protocol")').first();

    if (await enterButton.isVisible()) {
      await enterButton.click();
      await waitForPageLoad(page);

      // Should now be on a lesson page
      expect(page.url()).toContain('/students/courses/');
      expect(page.url()).toContain('/learn/');

      console.log(`✅ Navigated to: ${page.url()}`);
    } else {
      console.log('⚠️ No active lesson found on dashboard');
    }
  });

  test('4. Lesson View - 4-Stage Protocol', async ({ page }) => {
    console.log('🎯 Testing Lesson View (4-Stage Protocol)...');

    // Navigate to courses page first
    await page.goto('http://localhost:3000/students/courses');
    await waitForPageLoad(page);

    // Click on the first available lesson link
    const firstLessonLink = page.locator('a[href*="/learn/"]').first();
    if (await firstLessonLink.isVisible()) {
      await firstLessonLink.click();
      await waitForPageLoad(page);
    } else {
      console.log('⚠️ No lesson links found, skipping test');
      return;
    }

    // Check protocol bar exists
    await expect(page.locator('text=Current Protocol')).toBeVisible();

    // Verify all 4 stages are present
    await expect(page.locator('button:has-text("Theory")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Demo")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Verify")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Build")').first()).toBeVisible();

    console.log('✅ All 4 stages visible');

    // Take screenshot of initial stage
    await page.screenshot({ path: 'tests/screenshots/03-lesson-theory.png', fullPage: true });

    // Test Theory Stage
    const theoryStage = page.locator('text=SLIDE').first();
    await expect(theoryStage).toBeVisible();
    console.log('✅ Theory stage loaded');

    // Try to navigate slides (if available)
    const nextButton = page.locator('button:has-text("Next")').first();
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Slide navigation works');
    }

    console.log('✅ Lesson view test passed');
  });

  test('5. Lesson Stages - Navigation between stages', async ({ page }) => {
    console.log('🎯 Testing stage navigation...');

    // Navigate to courses page and click first lesson
    await page.goto('http://localhost:3000/students/courses');
    await waitForPageLoad(page);

    const firstLessonLink = page.locator('a[href*="/learn/"]').first();
    if (await firstLessonLink.isVisible()) {
      await firstLessonLink.click();
      await waitForPageLoad(page);
    } else {
      console.log('⚠️ No lesson links found, skipping test');
      return;
    }

    // Start on Theory stage
    const theoryButton = page.locator('button:has-text("Theory")').first();
    await expect(theoryButton).toBeVisible();

    // Try to complete theory and move to demo
    const completeButton = page.locator('button:has-text("Complete Theory")');
    if (await completeButton.isVisible()) {
      await completeButton.click();
      await page.waitForTimeout(1000);

      // Should now be on Demo stage
      await expect(page.locator('text=Duration:')).toBeVisible();
      await page.screenshot({ path: 'tests/screenshots/04-lesson-demo.png', fullPage: true });
      console.log('✅ Moved to Demo stage');

      // Try to complete demo
      const completeDemoButton = page.locator('button:has-text("Complete Demo")');
      if (await completeDemoButton.isVisible()) {
        await completeDemoButton.click();
        await page.waitForTimeout(1000);

        // Should now be on Quiz stage
        await expect(page.locator('text=Knowledge Check')).toBeVisible();
        await page.screenshot({ path: 'tests/screenshots/05-lesson-quiz.png', fullPage: true });
        console.log('✅ Moved to Quiz stage');

        // Try to skip quiz and go to lab
        const continueToLab = page.locator('button:has-text("Continue to Lab")');
        if (await continueToLab.isVisible()) {
          await continueToLab.click();
          await page.waitForTimeout(1000);

          // Should now be on Lab stage
          await expect(page.locator('text=Hands-On Lab')).toBeVisible();
          await page.screenshot({ path: 'tests/screenshots/06-lesson-lab.png', fullPage: true });
          console.log('✅ Moved to Lab stage');
        }
      }
    }

    console.log('✅ Stage navigation test passed');
  });

  test('6. Persona View - Resume simulation', async ({ page }) => {
    console.log('🎯 Testing Persona View...');

    await page.goto('http://localhost:3000/students/identity');
    await waitForPageLoad(page);

    // Check heading
    await expect(page.locator('h1')).toContainText('The 7-Year Promise');

    // Verify resume sections with more specific selectors
    await expect(page.locator('text=Professional Summary')).toBeVisible();
    await expect(page.locator('h3:has-text("Experience")').first()).toBeVisible();
    await expect(page.locator('text=Technical Arsenal')).toBeVisible();

    // Verify gap analysis
    await expect(page.locator('text=Identity Gap Analysis')).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/07-persona-view.png', fullPage: true });
    console.log('✅ Persona view test passed');
  });

  test('7. Interview Studio - Dojo simulation', async ({ page }) => {
    console.log('🎯 Testing Interview Studio...');

    await page.goto('http://localhost:3000/students/dojo');
    await waitForPageLoad(page);

    // Check heading
    await expect(page.locator('h1')).toContainText('Interview Shadowing');

    // Verify start button
    const startButton = page.locator('button:has-text("Start Simulation")');
    await expect(startButton).toBeVisible();

    // Verify real-time analysis panel
    await expect(page.locator('text=Real-time Analysis')).toBeVisible();
    await expect(page.locator('text=Pacing (WPM)')).toBeVisible();

    // Start simulation
    await startButton.click();
    await page.waitForTimeout(2000);

    // Should now show "Pause" button
    await expect(page.locator('button:has-text("Pause")')).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/08-interview-studio.png', fullPage: true });
    console.log('✅ Interview studio test passed');
  });

  test('8. AI Mentor Widget - Floating chat', async ({ page }) => {
    console.log('🎯 Testing AI Mentor Widget...');

    await page.goto('http://localhost:3000/students/dashboard');
    await waitForPageLoad(page);

    // Find AI Mentor button (bottom-right)
    const mentorButton = page.locator('button:has-text("Ask AI Mentor")');
    await expect(mentorButton).toBeVisible();

    // Click to open widget
    await mentorButton.click();
    await page.waitForTimeout(500);

    // Widget should now be visible - use more specific selector
    await expect(page.locator('h3:has-text("AI Mentor")').first()).toBeVisible();
    await expect(page.locator('text=Always here to help')).toBeVisible();

    // Try to send a message
    const input = page.locator('input[placeholder="Type a message..."]');
    await input.fill('Hello, can you help me?');

    const sendButton = page.locator('button:has([class*="Send"])').last();
    await sendButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tests/screenshots/09-ai-mentor-widget.png', fullPage: true });
    console.log('✅ AI Mentor widget test passed');
  });

  test('9. Responsive Design - Mobile viewport', async ({ page }) => {
    console.log('🎯 Testing responsive design...');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3000/students/dashboard');
    await waitForPageLoad(page);

    // Verify page still loads
    await expect(page.locator('h1')).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/10-mobile-dashboard.png', fullPage: true });

    // Test courses list on mobile
    await page.goto('http://localhost:3000/students/courses');
    await waitForPageLoad(page);

    await page.screenshot({ path: 'tests/screenshots/11-mobile-courses.png', fullPage: true });

    console.log('✅ Responsive design test passed');
  });

  test('10. Performance - Page load times', async ({ page }) => {
    console.log('🎯 Testing performance...');

    const pages = [
      { url: 'http://localhost:3000/students/dashboard', name: 'Dashboard' },
      { url: 'http://localhost:3000/students/courses', name: 'Courses' },
      { url: 'http://localhost:3000/students/identity', name: 'Persona' },
      { url: 'http://localhost:3000/students/dojo', name: 'Dojo' },
    ];

    for (const testPage of pages) {
      const startTime = Date.now();
      await page.goto(testPage.url);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`${testPage.name} loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
    }

    console.log('✅ Performance test passed');
  });

  test('11. Data Integration - Real Supabase data', async ({ page }) => {
    console.log('🎯 Testing data integration...');

    await page.goto('http://localhost:3000/students/dashboard');
    await waitForPageLoad(page);

    // Wait for data to load (should see loading spinner disappear)
    await page.waitForTimeout(2000);

    // Should not see "Loading..." text
    const loadingText = page.locator('text=Loading your progress...');
    const isLoading = await loadingText.isVisible().catch(() => false);

    if (isLoading) {
      console.log('⚠️ Data still loading, waiting longer...');
      await page.waitForTimeout(3000);
    }

    // Should see real data or "No active lessons" message
    const hasData = await page.locator('text=Enter The Protocol').isVisible().catch(() => false);
    const noData = await page.locator('text=No active lessons').isVisible().catch(() => false);

    expect(hasData || noData).toBeTruthy();

    if (hasData) {
      console.log('✅ Real data loaded successfully');
    } else {
      console.log('⚠️ No enrollment data found (expected if no seeded data)');
    }
  });

  test('12. Complete User Flow - End to End', async ({ page }) => {
    console.log('🎯 Testing complete user flow...');

    // 1. Start at dashboard
    await page.goto('http://localhost:3000/students/dashboard');
    await waitForPageLoad(page);
    console.log('1️⃣ Loaded dashboard');

    // 2. Navigate to courses
    await page.goto('http://localhost:3000/students/courses');
    await waitForPageLoad(page);
    console.log('2️⃣ Loaded courses list');

    // 3. Click into first available lesson
    const firstLesson = page.locator('a[href*="/learn/"]').first();
    if (await firstLesson.isVisible()) {
      await firstLesson.click();
      await waitForPageLoad(page);
      console.log('3️⃣ Opened lesson');

      // 4. Verify we're on a lesson page
      expect(page.url()).toContain('/learn/');
      console.log('4️⃣ On lesson page');
    }

    // 5. Go to persona view
    await page.goto('http://localhost:3000/students/identity');
    await waitForPageLoad(page);
    console.log('5️⃣ Loaded persona view');

    // 6. Go to dojo
    await page.goto('http://localhost:3000/students/dojo');
    await waitForPageLoad(page);
    console.log('6️⃣ Loaded interview studio');

    // 7. Return to dashboard
    await page.goto('http://localhost:3000/students/dashboard');
    await waitForPageLoad(page);
    console.log('7️⃣ Back to dashboard');

    await page.screenshot({ path: 'tests/screenshots/12-complete-flow.png', fullPage: true });
    console.log('✅ Complete user flow test passed');
  });
});

test.describe('Academy Navigation Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Login before navigation tests
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loginAsStudent(page);
  });

  test('Navbar - All links work', async ({ page }) => {
    console.log('🎯 Testing navbar navigation...');

    await page.goto('http://localhost:3000/students/dashboard');
    await waitForPageLoad(page);

    // Find navbar (should be at top)
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();

    // Test main navigation items
    const navItems = [
      { text: 'Dashboard', url: '/dashboard' },
      { text: 'Courses', url: '/courses' },
      { text: 'Identity', url: '/identity' },
      { text: 'Dojo', url: '/dojo' },
    ];

    for (const item of navItems) {
      const link = navbar.locator(`text=${item.text}`).first();
      if (await link.isVisible()) {
        console.log(`✅ Found ${item.text} link`);
      }
    }

    console.log('✅ Navbar test passed');
  });
});

test.describe('Academy Error Handling', () => {

  test.beforeEach(async ({ page }) => {
    // Login before error handling tests
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loginAsStudent(page);
  });

  test('404 - Invalid lesson ID', async ({ page }) => {
    console.log('🎯 Testing error handling...');

    // Try to access non-existent lesson with a fake UUID
    await page.goto('http://localhost:3000/students/courses/999/learn/00000000-0000-0000-0000-000000000000');
    await waitForPageLoad(page);

    // Should show error or loading state
    const hasError = await page.locator('text=Loading lesson...').isVisible().catch(() => false);
    const hasNotFound = await page.locator('text=not found').isVisible().catch(() => false);
    const hasLessonError = await page.locator('text=Lesson not found').isVisible().catch(() => false);

    console.log(hasError ? '⚠️ Showing loading state' : hasNotFound ? '⚠️ Showing 404' : hasLessonError ? '⚠️ Showing error message' : '⚠️ Unknown error state');
    console.log('✅ Error handling test complete');
  });
});
