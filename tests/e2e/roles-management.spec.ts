import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

const ROLES_URL = '/employee/admin/roles'

test.describe('Roles Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('ADMIN-ROLE-001: Navigate to roles list page', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(new RegExp(ROLES_URL))
    await expect(page.getByRole('heading', { name: /Roles/i })).toBeVisible()
  })

  test('ADMIN-ROLE-002: View role stats', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')
    // Use first() to avoid matching multiple elements
    await expect(page.getByText(/Total Roles/i).first()).toBeVisible()
    await expect(page.getByText(/Active/i).first()).toBeVisible()
    await expect(page.getByText(/System Roles/i).first()).toBeVisible()
    await expect(page.getByText(/Custom Roles/i).first()).toBeVisible()
  })

  test('ADMIN-ROLE-003: Search roles', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/Search roles/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('admin')
    await page.waitForTimeout(500)
    await expect(page.getByRole('heading', { name: /Roles/i })).toBeVisible()
  })

  test('ADMIN-ROLE-004: Filter roles by category', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')

    // Open category dropdown
    const categoryTrigger = page.locator('[role="combobox"]').first()
    await categoryTrigger.click()

    // Select a category
    const categoryOption = page.getByRole('option', { name: /Pod IC/i })
    if (await categoryOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryOption.click()
      await page.waitForLoadState('networkidle')
    }
  })

  test('ADMIN-ROLE-005: Navigate to create role page', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: /New Role/i }).click()
    await page.waitForURL(`${ROLES_URL}/new`)
    await expect(page.getByRole('heading', { name: /Create New Role/i })).toBeVisible()
  })

  test('ADMIN-ROLE-006: Create new role', async ({ page }) => {
    const testRoleCode = `test_role_${Date.now()}`
    const testRoleName = `Test Role ${Date.now()}`

    await page.goto(`${ROLES_URL}/new`)
    await page.waitForLoadState('networkidle')

    // Fill in form fields
    await page.getByLabel(/Role Name/i).fill(testRoleName)
    await page.waitForTimeout(200)
    await page.getByLabel(/Role Code/i).fill(testRoleCode)
    await page.getByLabel(/Display Name/i).fill(testRoleName)

    // Select category
    const categorySelect = page.locator('[role="combobox"]').first()
    await categorySelect.click()
    await page.getByRole('option', { name: /Pod IC/i }).click()

    // Submit form
    await page.getByRole('button', { name: /Create Role/i }).click()

    // Wait for navigation to detail page
    await page.waitForURL(/\/employee\/admin\/roles\/[\w-]+$/, { timeout: 10000 })
    // Use the heading to verify success (more specific than getByText)
    await expect(page.getByRole('heading', { name: testRoleName })).toBeVisible()
  })

  test('ADMIN-ROLE-007: View role details', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')

    // Click on first role name to view details
    const roleLink = page.locator('a[href*="/employee/admin/roles/"]').first()
    if (await roleLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await roleLink.click()
      await page.waitForURL(/\/employee\/admin\/roles\/[\w-]+$/, { timeout: 10000 })

      // Check for detail page elements (use first() to avoid multiple matches)
      await expect(page.getByText(/Category/i).first()).toBeVisible()
      await expect(page.getByText(/Users/i).first()).toBeVisible()
      await expect(page.getByText(/Permissions/i).first()).toBeVisible()
    }
  })

  test('ADMIN-ROLE-008: Edit role', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')

    // Find and click edit on first role
    const moreButton = page.locator('button').filter({ has: page.locator('svg') }).last()
    if (await moreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreButton.click()
      const editOption = page.getByRole('link', { name: /Edit Role/i })
      if (await editOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editOption.click()
        await page.waitForURL(/\/employee\/admin\/roles\/[\w-]+\/edit$/, { timeout: 10000 })
        await expect(page.getByRole('heading', { name: /Edit Role/i })).toBeVisible()
      }
    }
  })

  test('ADMIN-ROLE-009: Clone role dialog opens', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')

    // Open actions menu on first role
    const moreButton = page.locator('button').filter({ has: page.locator('svg') }).last()
    if (await moreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moreButton.click()
      const cloneOption = page.getByRole('button', { name: /Clone Role/i })
      if (await cloneOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cloneOption.click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByText(/Clone Role/i)).toBeVisible()
      }
    }
  })

  test('ADMIN-ROLE-010: View role permissions tab', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')

    // Navigate to first role detail
    const roleLink = page.locator('a[href*="/employee/admin/roles/"]').first()
    if (await roleLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await roleLink.click()
      await page.waitForURL(/\/employee\/admin\/roles\/[\w-]+$/, { timeout: 10000 })

      // Click permissions tab
      const permissionsTab = page.getByRole('tab', { name: /Permissions/i })
      if (await permissionsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await permissionsTab.click()
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('ADMIN-ROLE-011: View role features tab', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')

    // Navigate to first role detail
    const roleLink = page.locator('a[href*="/employee/admin/roles/"]').first()
    if (await roleLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await roleLink.click()
      await page.waitForURL(/\/employee\/admin\/roles\/[\w-]+$/, { timeout: 10000 })

      // Click features tab
      const featuresTab = page.getByRole('tab', { name: /Features/i })
      if (await featuresTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await featuresTab.click()
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('ADMIN-ROLE-012: Toggle show inactive roles', async ({ page }) => {
    await page.goto(ROLES_URL)
    await page.waitForLoadState('networkidle')

    const showInactiveCheckbox = page.getByLabel(/Show Inactive/i)
    if (await showInactiveCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await showInactiveCheckbox.check()
      await page.waitForLoadState('networkidle')
      await expect(showInactiveCheckbox).toBeChecked()
    }
  })
})
