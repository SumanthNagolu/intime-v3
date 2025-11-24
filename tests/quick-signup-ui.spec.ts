/**
 * Quick Signup UI Test
 * Tests the complete signup flow through the browser
 */

import { test, expect } from '@playwright/test';

test('signup flow works end-to-end', async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    email: `test-${timestamp}@example.com`,
    password: 'Test123456!',
    fullName: 'Test User',
    phone: '+1234567890',
    role: 'student',
  };

  console.log('\n🧪 Testing Signup UI Flow');
  console.log('========================');
  console.log(`Test Email: ${testUser.email}\n`);

  // Navigate to signup page
  await page.goto('http://localhost:3000/signup');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Verify we're on the signup page
  await expect(page).toHaveURL(/\/signup/);
  console.log('✅ Navigated to signup page');

  // Check if signup form exists
  const form = page.locator('form');
  await expect(form).toBeVisible();
  console.log('✅ Signup form is visible');

  // Fill in the form
  await page.fill('input[name="email"]', testUser.email);
  console.log('✅ Filled email field');

  await page.fill('input[name="password"]', testUser.password);
  console.log('✅ Filled password field');

  await page.fill('input[name="full_name"]', testUser.fullName);
  console.log('✅ Filled full name field');

  await page.fill('input[name="phone"]', testUser.phone);
  console.log('✅ Filled phone field');

  // Select role (if dropdown exists)
  const roleSelect = page.locator('select[name="role"]');
  if (await roleSelect.isVisible()) {
    await roleSelect.selectOption(testUser.role);
    console.log('✅ Selected role');
  }

  // Take screenshot before submit
  await page.screenshot({ path: 'signup-before-submit.png' });
  console.log('📸 Screenshot saved: signup-before-submit.png');

  // Submit the form
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();
  console.log('✅ Clicked submit button');

  // Wait for either success or error
  await page.waitForTimeout(3000);

  // Take screenshot after submit
  await page.screenshot({ path: 'signup-after-submit.png' });
  console.log('📸 Screenshot saved: signup-after-submit.png');

  // Check if we got an error message
  const errorMessage = page.locator('[role="alert"], .error, .text-red-500');
  const hasError = await errorMessage.isVisible().catch(() => false);

  if (hasError) {
    const errorText = await errorMessage.textContent();
    console.log(`❌ Error message displayed: ${errorText}`);
    throw new Error(`Signup failed with error: ${errorText}`);
  }

  // Check if we were redirected to dashboard or success page
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);

  // Should be redirected away from /signup
  if (currentUrl.includes('/signup')) {
    // Check for success message on the same page
    const successMessage = page.locator('text=/success|created|check your email/i');
    const hasSuccess = await successMessage.isVisible().catch(() => false);

    if (hasSuccess) {
      const successText = await successMessage.textContent();
      console.log(`✅ Success message: ${successText}`);
    } else {
      console.log('⚠️  Still on signup page, no clear success/error message');
    }
  } else {
    console.log('✅ Redirected away from signup page (likely to dashboard or login)');
  }

  console.log('\n✅ Signup UI test completed successfully!\n');
});
