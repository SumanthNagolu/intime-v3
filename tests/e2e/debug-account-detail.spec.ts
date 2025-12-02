import { test, expect } from '@playwright/test';

test('debug account detail', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[type="email"]', 'rec1@intime.com');
  await page.fill('input[type="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/employee/**');
  
  // Navigate to accounts list
  await page.goto('/employee/recruiting/accounts');
  await page.waitForLoadState('networkidle');
  
  // Click on first account in the table
  await page.locator('tr[class*="cursor-pointer"]').first().click();
  await page.waitForURL('**/accounts/**');
  
  // Wait and capture any errors
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/account-detail-debug.png', fullPage: true });
  
  // Check for error display
  const errorElement = await page.locator('[class*="red"]').first();
  if (await errorElement.isVisible()) {
    const errorText = await errorElement.textContent();
    console.log('Error found:', errorText);
  }
  
  // Log any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
});
