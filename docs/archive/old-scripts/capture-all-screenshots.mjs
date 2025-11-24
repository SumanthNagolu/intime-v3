#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const screenshotsDir = join(projectRoot, 'screenshots');

// Test user credentials
const credentials = {
  email: 'admin@intime.test',
  password: 'Admin123456!',
};

// All pages to capture
const pages = [
  // Student/User Pages
  { route: '/dashboard', name: '04-dashboard', waitFor: 'text=Welcome' },
  { route: '/my-productivity', name: '05-my-productivity', waitFor: 'text=Productivity' },
  { route: '/my-twin', name: '06-my-twin', waitFor: 'text=AI Twin' },
  { route: '/privacy/consent', name: '07-privacy-consent', waitFor: 'text=Privacy' },

  // Admin Pages
  { route: '/admin', name: '08-admin-dashboard', waitFor: 'text=Admin' },
  { route: '/admin/courses', name: '09-admin-courses', waitFor: 'text=Courses' },
  { route: '/admin/courses/new', name: '10-admin-create-course', waitFor: 'text=Create' },
  { route: '/admin/events', name: '11-admin-events', waitFor: 'text=Events' },
  { route: '/admin/handlers', name: '12-admin-handlers', waitFor: 'text=Handlers' },
  { route: '/admin/screenshots', name: '13-admin-screenshots', waitFor: 'text=Screenshots' },
  { route: '/admin/timeline', name: '14-admin-timeline', waitFor: 'text=Timeline' },
  { route: '/setup/migrate', name: '15-setup-migrate', waitFor: 'text=Migration' },
];

async function captureScreenshots() {
  console.log('\n📸 Starting screenshot capture process...\n');

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Fill in credentials
    console.log('2. Logging in as admin@intime.test...');
    await page.fill('input[name="email"], input[type="email"]', credentials.email);
    await page.fill('input[name="password"], input[type="password"]', credentials.password);

    // Click submit button
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    console.log('3. Waiting for login to complete...');
    await page.waitForURL(/\/(dashboard|admin)/);
    await page.waitForLoadState('networkidle');

    console.log('✅ Login successful!\n');
    console.log('---\n');

    // Ensure public directory exists
    await mkdir(join(screenshotsDir, 'protected'), { recursive: true });

    let successCount = 0;
    let failureCount = 0;

    // Capture each page
    for (const pageInfo of pages) {
      try {
        console.log(`📸 Capturing: ${pageInfo.name}...`);

        // Navigate to the page
        await page.goto(`http://localhost:3000${pageInfo.route}`, {
          waitUntil: 'networkidle',
          timeout: 10000,
        });

        // Wait for specific content if specified
        if (pageInfo.waitFor) {
          try {
            await page.waitForSelector(`text="${pageInfo.waitFor.replace('text=', '')}"`, {
              timeout: 5000,
            });
          } catch (e) {
            console.log(`  ⚠️  Content not found, capturing anyway`);
          }
        }

        // Take screenshot
        const screenshotPath = join(screenshotsDir, 'protected', `${pageInfo.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        console.log(`  ✅ Saved: protected/${pageInfo.name}.png\n`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        failureCount++;
      }
    }

    console.log('---\n');
    console.log(`🎉 Screenshot capture complete!\n`);
    console.log(`✅ Successful: ${successCount}/${pages.length}`);
    if (failureCount > 0) {
      console.log(`❌ Failed: ${failureCount}/${pages.length}`);
    }
    console.log(`\n📁 All screenshots saved to: ${screenshotsDir}\n`);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
