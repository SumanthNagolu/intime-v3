import { chromium } from '@playwright/test';

async function testLogin() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    console.log('Taking screenshot of login page...');
    await page.screenshot({ path: 'login-page.png', fullPage: true });

    console.log('Filling in credentials...');
    await page.fill('input[type="email"]', 'rec1@intime.com');
    await page.fill('input[type="password"]', 'TestPass123!');

    console.log('Taking screenshot before submit...');
    await page.screenshot({ path: 'before-submit.png', fullPage: true });

    console.log('Clicking login button...');
    // Wait for navigation after clicking submit
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);

    await page.waitForLoadState('networkidle');

    console.log('After login - Current URL:', page.url());
    await page.screenshot({ path: 'after-login.png', fullPage: true });

    // Wait a bit more to see what happens
    await page.waitForTimeout(3000);
    console.log('Final URL:', page.url());
    await page.screenshot({ path: 'final-state.png', fullPage: true });

    // Keep browser open
    console.log('\nBrowser will stay open. Press Ctrl+C to close.');
    await new Promise(() => {});
  } catch (error) {
    console.error('Error during login:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
    throw error;
  }
}

testLogin().catch(console.error);
