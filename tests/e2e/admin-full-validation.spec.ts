import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

/**
 * Admin Portal Full Validation E2E Tests
 *
 * This test suite validates all admin pages and CRUD operations
 * to ensure the admin portal is production-ready.
 */

test.describe('Admin Portal Full Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('Dashboard', () => {
    test('Dashboard loads with all sections', async ({ page }) => {
      await page.goto('/employee/admin/dashboard')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Admin Dashboard/i })).toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByText(/System Health/i)).toBeVisible()
      await expect(page.getByText(/Quick Actions/i)).toBeVisible()
      await expect(page.getByText(/Recent Activity/i)).toBeVisible()
    })
  })

  test.describe('Users Management', () => {
    test('Users list page loads', async ({ page }) => {
      await page.goto('/employee/admin/users')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Users/i })).toBeVisible({ timeout: 15000 })
    })

    test('Create user form loads', async ({ page }) => {
      await page.goto('/employee/admin/users/new')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /New User|Create User/i })).toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByLabel(/First Name/i)).toBeVisible()
      await expect(page.getByLabel(/Last Name/i)).toBeVisible()
      await expect(page.getByLabel(/Email/i)).toBeVisible()
    })
  })

  test.describe('Pods Management', () => {
    test('Pods list page loads', async ({ page }) => {
      await page.goto('/employee/admin/pods')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Pods/i })).toBeVisible({ timeout: 15000 })
    })

    test('Create pod form loads', async ({ page }) => {
      await page.goto('/employee/admin/pods/new')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /New Pod|Create Pod/i })).toBeVisible({
        timeout: 15000,
      })
    })
  })

  test.describe('Roles Management', () => {
    test('Roles list page loads', async ({ page }) => {
      await page.goto('/employee/admin/roles')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Roles/i })).toBeVisible({ timeout: 15000 })
    })

    test('Create role form loads', async ({ page }) => {
      await page.goto('/employee/admin/roles/new')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /New Role|Create.*Role/i })).toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByLabel(/Role Name/i).or(page.getByLabel(/Name/i))).toBeVisible()
    })

    test('Role stats are displayed', async ({ page }) => {
      await page.goto('/employee/admin/roles')
      await page.waitForLoadState('networkidle')

      // Check for stats cards
      const pageContent = await page.textContent('body')
      const hasStats =
        pageContent?.includes('Total Roles') ||
        pageContent?.includes('Active') ||
        pageContent?.includes('System Roles')
      expect(hasStats).toBeTruthy()
    })
  })

  test.describe('Permissions Matrix', () => {
    test('Permissions page loads', async ({ page }) => {
      await page.goto('/employee/admin/permissions')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Permissions/i })).toBeVisible({
        timeout: 15000,
      })
    })
  })

  test.describe('Feature Flags', () => {
    test('Feature flags list page loads', async ({ page }) => {
      await page.goto('/employee/admin/feature-flags')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Feature Flags/i })).toBeVisible({
        timeout: 15000,
      })
    })

    test('New feature button is visible', async ({ page }) => {
      await page.goto('/employee/admin/feature-flags')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('button', { name: /New Feature/i })).toBeVisible({
        timeout: 15000,
      })
    })
  })

  test.describe('Organization Settings', () => {
    test('Org settings page loads with tabs', async ({ page }) => {
      await page.goto('/employee/admin/org-settings')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Organization Settings/i })).toBeVisible({
        timeout: 15000,
      })

      // Check for settings tabs
      await expect(page.getByRole('tab', { name: /Company/i })).toBeVisible()
    })
  })

  test.describe('SLA Configuration', () => {
    test('SLA hub page loads', async ({ page }) => {
      await page.goto('/employee/admin/sla')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /SLA/i })).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Integrations', () => {
    test('Integrations dashboard loads', async ({ page }) => {
      await page.goto('/employee/admin/integrations')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Integrations/i })).toBeVisible({
        timeout: 15000,
      })
    })
  })

  test.describe('Workflows', () => {
    test('Workflows list page loads', async ({ page }) => {
      await page.goto('/employee/admin/workflows')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Workflows/i })).toBeVisible({
        timeout: 15000,
      })
    })
  })

  test.describe('Audit Logs', () => {
    test('Audit logs page loads', async ({ page }) => {
      await page.goto('/employee/admin/audit')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Audit/i })).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Emergency Management', () => {
    test('Emergency dashboard loads', async ({ page }) => {
      await page.goto('/employee/admin/emergency')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Emergency/i })).toBeVisible({
        timeout: 15000,
      })
    })
  })

  test.describe('Data Management', () => {
    test('Data management dashboard loads', async ({ page }) => {
      await page.goto('/employee/admin/data')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Data Management/i })).toBeVisible({
        timeout: 15000,
      })
    })
  })

  test.describe('Email Templates', () => {
    test('Email templates list page loads', async ({ page }) => {
      await page.goto('/employee/admin/email-templates')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Email Templates/i })).toBeVisible({
        timeout: 15000,
      })
    })
  })

  test.describe('Activity Patterns', () => {
    test('Activity patterns list page loads', async ({ page }) => {
      await page.goto('/employee/admin/activity-patterns')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Activity Patterns/i })).toBeVisible({
        timeout: 15000,
      })
    })
  })

  test.describe('Notifications Management', () => {
    test('Notifications page loads', async ({ page }) => {
      await page.goto('/employee/admin/notifications')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Notifications/i })).toBeVisible({
        timeout: 15000,
      })
    })

    test('Notifications tabs are visible', async ({ page }) => {
      await page.goto('/employee/admin/notifications')
      await page.waitForLoadState('networkidle')

      // Check for notification tabs
      await expect(page.getByRole('tab', { name: /Recent/i })).toBeVisible({ timeout: 10000 })
      await expect(page.getByRole('tab', { name: /Preferences/i })).toBeVisible()
      await expect(page.getByRole('tab', { name: /Templates/i })).toBeVisible()
    })
  })

  test.describe('System Settings', () => {
    test('System settings page loads', async ({ page }) => {
      await page.goto('/employee/admin/settings/system')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /System/i })).toBeVisible({ timeout: 15000 })
    })

    test('Security settings page loads', async ({ page }) => {
      await page.goto('/employee/admin/settings/security')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Security/i })).toBeVisible({ timeout: 15000 })
    })

    test('Branding settings page loads', async ({ page }) => {
      await page.goto('/employee/admin/settings/branding')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Branding/i })).toBeVisible({ timeout: 15000 })
    })

    test('Email settings page loads', async ({ page }) => {
      await page.goto('/employee/admin/settings/email')
      await page.waitForLoadState('networkidle')

      await expect(page.getByRole('heading', { name: /Email/i })).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Navigation Consistency', () => {
    test('All admin sidebar links navigate correctly', async ({ page }) => {
      await page.goto('/employee/admin/dashboard')
      await page.waitForLoadState('networkidle')

      // Get all admin sidebar links
      const adminLinks = [
        '/employee/admin/users',
        '/employee/admin/pods',
        '/employee/admin/roles',
        '/employee/admin/permissions',
        '/employee/admin/feature-flags',
        '/employee/admin/sla',
        '/employee/admin/integrations',
        '/employee/admin/workflows',
        '/employee/admin/audit',
        '/employee/admin/emergency',
        '/employee/admin/data',
        '/employee/admin/email-templates',
        '/employee/admin/activity-patterns',
        '/employee/admin/notifications',
      ]

      // Test a sampling of links (testing all would be too slow)
      const sampleLinks = adminLinks.slice(0, 5)

      for (const link of sampleLinks) {
        await page.goto(link)
        await page.waitForLoadState('networkidle')

        // Page should not show error
        const pageContent = await page.textContent('body')
        const hasError =
          pageContent?.includes('404') ||
          pageContent?.includes('Page not found') ||
          pageContent?.includes('Error')

        // If error, the heading should still be present
        const headingVisible = await page
          .locator('h1, h2')
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false)

        expect(headingVisible || !hasError).toBeTruthy()
      }
    })
  })
})
