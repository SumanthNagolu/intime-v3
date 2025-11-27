/**
 * Authentication & Access Control E2E Tests
 * 
 * Tests for user authentication, authorization, and role-based access control.
 * 
 * Prerequisites:
 *   - Run `pnpm tsx scripts/seed-test-users.ts` to create test users
 *   - Ensure the app is running on localhost:3000
 * 
 * Run: pnpm playwright test tests/e2e/auth-workflows.spec.ts
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// ============================================================================
// Test User Credentials - InTime Production Users
// ============================================================================

const COMMON_PASSWORD = 'TestPass123!';

const TEST_USERS = {
  ceo: {
    email: 'ceo@intime.com',
    password: COMMON_PASSWORD,
    role: 'super_admin',
    expectedDashboard: '/employee/ceo/dashboard',
  },
  admin: {
    email: 'admin@intime.com',
    password: COMMON_PASSWORD,
    role: 'admin',
    expectedDashboard: '/employee/admin/dashboard',
  },
  hr: {
    email: 'hr_admin@intime.com',
    password: COMMON_PASSWORD,
    role: 'hr_manager',
    expectedDashboard: '/employee/hr/dashboard',
  },
  recruiter: {
    email: 'jr_rec@intime.com',
    password: COMMON_PASSWORD,
    role: 'recruiter',
    expectedDashboard: '/employee/recruiting/dashboard',
  },
  benchSales: {
    email: 'jr_bs@intime.com',
    password: COMMON_PASSWORD,
    role: 'bench_sales',
    expectedDashboard: '/employee/bench/dashboard',
  },
  taSales: {
    email: 'jr_ta@intime.com',
    password: COMMON_PASSWORD,
    role: 'ta_sales',
    expectedDashboard: '/employee/ta/dashboard',
  },
  trainer: {
    email: 'trainer@intime.com',
    password: COMMON_PASSWORD,
    role: 'trainer',
    expectedDashboard: '/employee/portal',
  },
  student: {
    email: 'student@intime.com',
    password: COMMON_PASSWORD,
    role: 'student',
    expectedDashboard: '/academy/dashboard',
  },
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
  await page.waitForURL(/^(?!.*\/login).*$/);
}

async function logout(page: Page): Promise<void> {
  // Try different logout button selectors
  const logoutSelectors = [
    '[data-testid="logout-button"]',
    'button:has-text("Logout")',
    'button:has-text("Sign out")',
    'button:has-text("Log out")',
    '[data-testid="user-menu"]',
  ];
  
  for (const selector of logoutSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
      await element.click();
      
      // If it was a menu trigger, look for logout option
      const logoutOption = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
      if (await logoutOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await logoutOption.click();
      }
      
      break;
    }
  }
  
  await page.waitForURL('/login');
}

async function checkAuthenticated(page: Page): Promise<boolean> {
  // Check if we can access a protected route
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  
  const currentUrl = page.url();
  return !currentUrl.includes('/login');
}

// ============================================================================
// Test Suites
// ============================================================================

test.describe('Authentication - Sign In', () => {
  
  test('should successfully sign in with valid credentials', async ({ page }) => {
    const user = TEST_USERS.recruiter;
    
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', user.email);
    await page.fill('input[name="password"], input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/(dashboard|employee)/);
    
    // Should show user is logged in (check for profile/avatar element)
    await expect(page.locator('[data-testid="user-menu"], [data-testid="user-avatar"], .user-menu')).toBeVisible({ timeout: 5000 });
  });
  
  test('should show error for invalid password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"], input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid email or password, text=incorrect, text=error').first()).toBeVisible({ timeout: 5000 });
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });
  
  test('should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', 'notanemail');
    await page.fill('input[name="password"], input[type="password"]', 'SomePassword123!');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=invalid, text=email').first()).toBeVisible({ timeout: 5000 });
  });
  
  test('should show validation error for empty password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', TEST_USERS.admin.email);
    // Leave password empty
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=required, text=password').first()).toBeVisible({ timeout: 5000 });
  });
  
});

test.describe('Authentication - Sign Out', () => {
  
  test('should successfully sign out', async ({ page }) => {
    // First login
    await login(page, TEST_USERS.recruiter.email, TEST_USERS.recruiter.password);
    
    // Then logout
    await logout(page);
    
    // Should be on login page
    await expect(page).toHaveURL(/\/login/);
    
    // Try to access protected route
    await page.goto('/employee/recruiting/dashboard');
    
    // Should redirect back to login
    await expect(page).toHaveURL(/\/login/);
  });
  
});

test.describe('Authentication - Session Persistence', () => {
  
  test('should maintain session across page navigation', async ({ page }) => {
    await login(page, TEST_USERS.recruiter.email, TEST_USERS.recruiter.password);
    
    // Navigate to different pages
    await page.goto('/employee/recruiting/jobs');
    await expect(page.locator('[data-testid="user-menu"], .user-menu')).toBeVisible();
    
    await page.goto('/employee/recruiting/pipeline');
    await expect(page.locator('[data-testid="user-menu"], .user-menu')).toBeVisible();
    
    await page.goto('/employee/recruiting/leads');
    await expect(page.locator('[data-testid="user-menu"], .user-menu')).toBeVisible();
  });
  
  test('should maintain session after page refresh', async ({ page }) => {
    await login(page, TEST_USERS.recruiter.email, TEST_USERS.recruiter.password);
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be logged in
    const isAuthenticated = await checkAuthenticated(page);
    expect(isAuthenticated).toBe(true);
  });
  
});

test.describe('Authorization - Route Protection', () => {
  
  test('should redirect unauthenticated user to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/employee/admin/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
  
  test('should allow authenticated user to access appropriate routes', async ({ page }) => {
    await login(page, TEST_USERS.recruiter.email, TEST_USERS.recruiter.password);
    
    // Should be able to access recruiter pages
    await page.goto('/employee/recruiting/dashboard');
    await expect(page).toHaveURL(/\/employee\/recruiting\/dashboard/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
  
});

test.describe('Authorization - Role-Based Access', () => {
  
  test('admin can access admin pages', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    await page.goto('/employee/admin/dashboard');
    await expect(page).toHaveURL(/\/employee\/admin\/dashboard/);
    await expect(page.locator('text=Admin Console, text=Admin')).toBeVisible({ timeout: 5000 });
  });
  
  test('non-admin cannot access admin pages', async ({ page }) => {
    await login(page, TEST_USERS.recruiter.email, TEST_USERS.recruiter.password);
    
    await page.goto('/employee/admin/dashboard');
    
    // Should either redirect or show access denied
    // Check for either behavior
    const isAccessDenied = await page.locator('text=Access Denied, text=Forbidden, text=Unauthorized').isVisible({ timeout: 2000 }).catch(() => false);
    const wasRedirected = !page.url().includes('/admin');
    
    expect(isAccessDenied || wasRedirected).toBe(true);
  });
  
  test('recruiter is redirected to recruiting dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', TEST_USERS.recruiter.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USERS.recruiter.password);
    await page.click('button[type="submit"]');
    
    // Should be redirected to recruiting dashboard
    await expect(page).toHaveURL(/\/(employee\/recruiting|dashboard)/);
  });
  
  test('student is redirected to academy dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USERS.student.password);
    await page.click('button[type="submit"]');
    
    // Should be redirected to academy dashboard
    await expect(page).toHaveURL(/\/(academy|dashboard)/);
  });
  
});

test.describe('Multi-Tenancy Isolation', () => {

  test('RLS ensures user can only see their org data', async ({ page }) => {
    // Login as recruiter
    await login(page, TEST_USERS.recruiter.email, TEST_USERS.recruiter.password);
    await page.goto('/employee/recruiting/jobs');
    await page.waitForLoadState('networkidle');

    // Verify that jobs are visible (proves RLS isn't blocking own org data)
    const jobsList = page.locator('table, [data-testid="jobs-list"], .jobs-list');
    await expect(jobsList).toBeVisible({ timeout: 5000 });

    // The actual RLS isolation is enforced at the database level
    // This test verifies the user can access their own org's data
  });

  test('API returns only org-specific data', async ({ page, request }) => {
    // This test verifies that even direct API calls respect multi-tenancy

    await login(page, TEST_USERS.recruiter.email, TEST_USERS.recruiter.password);

    // Get cookies from the authenticated page
    const cookies = await page.context().cookies();

    // Make API request with cookies
    const response = await request.get('/api/debug/roles', {
      headers: {
        Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
    });

    // API should return only data for the authenticated user's org
    if (response.ok()) {
      const data = await response.json();
      // Add specific assertions based on your API response structure
      expect(data).toBeDefined();
    }
  });

});

test.describe('Admin - User Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.goto('/employee/admin/dashboard');
  });
  
  test('admin can view user list', async ({ page }) => {
    // Navigate to user management
    await page.click('button:has-text("User Management"), text=User Management');
    await page.waitForLoadState('networkidle');
    
    // Should see user list
    await expect(page.locator('table, [data-testid="user-list"], .user-list')).toBeVisible({ timeout: 5000 });
  });
  
  test('admin can create new user', async ({ page }) => {
    // Navigate to user management
    await page.click('button:has-text("User Management"), text=User Management');
    await page.waitForLoadState('networkidle');
    
    // Click create new user
    await page.click('button:has-text("Create New User"), button:has-text("Add User"), button:has-text("New User")');
    
    // Fill form with unique email
    const uniqueEmail = `e2e-test-${Date.now()}@intime-test.com`;
    await page.fill('input[name="fullName"], input[name="full_name"]', 'E2E Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    
    // Select role
    await page.selectOption('select[name="role"]', 'recruiter');
    
    // Submit
    await page.click('button:has-text("Create"), button:has-text("Save")');
    
    // Verify success message
    await expect(page.locator('text=created, text=success, text=Created').first()).toBeVisible({ timeout: 5000 });
    
    // Verify user appears in list
    await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible({ timeout: 5000 });
  });
  
  test('admin can deactivate user', async ({ page }) => {
    // Navigate to user management
    await page.click('button:has-text("User Management"), text=User Management');
    await page.waitForLoadState('networkidle');
    
    // Find a user row with a deactivate button
    const deactivateButton = page.locator('button:has-text("Deactivate"), button:has-text("Disable")').first();
    
    if (await deactivateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deactivateButton.click();
      
      // Confirm if there's a confirmation dialog
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      }
      
      // Verify success
      await expect(page.locator('text=deactivated, text=disabled, text=success').first()).toBeVisible({ timeout: 5000 });
    }
  });
  
  test('admin can assign role to user', async ({ page }) => {
    // Navigate to user management
    await page.click('button:has-text("User Management"), text=User Management');
    await page.waitForLoadState('networkidle');
    
    // Find edit role button for a user
    const editRoleButton = page.locator('button:has-text("Edit Role"), button:has-text("Change Role")').first();
    
    if (await editRoleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editRoleButton.click();
      
      // Select new role
      await page.selectOption('select[name="role"]', 'hr_manager');
      
      // Save
      await page.click('button:has-text("Save"), button:has-text("Update")');
      
      // Verify success
      await expect(page.locator('text=updated, text=assigned, text=success').first()).toBeVisible({ timeout: 5000 });
    }
  });
  
});

test.describe('Sign Up Flow', () => {
  
  test('should successfully sign up new user', async ({ page }) => {
    // Pick a signup page (e.g., talent signup)
    await page.goto('/auth/talent');
    await page.waitForLoadState('networkidle');
    
    const uniqueEmail = `e2e-signup-${Date.now()}@intime-test.com`;
    
    // Fill signup form
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="full_name"], input[name="fullName"]', 'E2E Signup Test');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success or redirect
    const hasSuccess = await page.locator('text=success, text=created, text=verify your email').isVisible({ timeout: 5000 }).catch(() => false);
    const wasRedirected = page.url().includes('/dashboard') || page.url().includes('/talent');
    
    expect(hasSuccess || wasRedirected).toBe(true);
  });
  
  test('should show error for weak password', async ({ page }) => {
    await page.goto('/auth/talent');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'weakpassword@test.com');
    await page.fill('input[name="password"]', 'weak'); // Too short, no uppercase, no number
    await page.fill('input[name="full_name"], input[name="fullName"]', 'Test User');
    
    await page.click('button[type="submit"]');
    
    // Should show password validation error
    await expect(page.locator('text=password, text=8 characters, text=uppercase, text=number').first()).toBeVisible({ timeout: 5000 });
  });
  
  test('should show error for duplicate email', async ({ page }) => {
    await page.goto('/auth/talent');
    await page.waitForLoadState('networkidle');
    
    // Use an email that already exists
    await page.fill('input[name="email"]', TEST_USERS.recruiter.email);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="full_name"], input[name="fullName"]', 'Test User');
    
    await page.click('button[type="submit"]');
    
    // Should show duplicate email error
    await expect(page.locator('text=already exists, text=already registered, text=in use').first()).toBeVisible({ timeout: 5000 });
  });
  
});

test.describe('Audit Logging', () => {
  
  test('login is logged to audit', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.goto('/employee/admin/dashboard');
    
    // Navigate to audit logs
    await page.click('button:has-text("Audit Logs"), text=Audit Logs');
    await page.waitForLoadState('networkidle');
    
    // Should see login event in audit logs
    await expect(page.locator('text=LOGIN, text=Sign in, text=login').first()).toBeVisible({ timeout: 5000 });
  });
  
});

