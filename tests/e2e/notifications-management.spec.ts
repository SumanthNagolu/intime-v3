import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

const NOTIFICATIONS_URL = '/employee/admin/notifications'

test.describe('Notifications Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('ADMIN-NOTIF-001: Navigate to notifications page', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(new RegExp(NOTIFICATIONS_URL))
    // Use exact: true to match only the main h1 heading
    await expect(page.getByRole('heading', { name: 'Notifications', exact: true })).toBeVisible()
  })

  test('ADMIN-NOTIF-002: View notification stats', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')

    // Check for stats cards - use exact text to avoid matching "Unread Only" checkbox
    await expect(page.getByText('Total', { exact: true })).toBeVisible()
    await expect(page.getByText('Unread', { exact: true })).toBeVisible()
    await expect(page.getByText('Read', { exact: true })).toBeVisible()
  })

  test('ADMIN-NOTIF-003: View Recent Notifications tab', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')

    // Recent Notifications tab should be default
    const recentTab = page.getByRole('tab', { name: /Recent Notifications/i })
    await expect(recentTab).toBeVisible()
    await expect(recentTab).toHaveAttribute('data-state', 'active')
  })

  test('ADMIN-NOTIF-004: View Preferences tab', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')

    const preferencesTab = page.getByRole('tab', { name: /Preferences/i })
    await expect(preferencesTab).toBeVisible()
    await preferencesTab.click()
    await page.waitForLoadState('networkidle')

    // Check for preference categories (use first() to avoid multiple matches)
    await expect(page.getByText(/System/i).first()).toBeVisible()
    await expect(page.getByText(/Security/i).first()).toBeVisible()
  })

  test('ADMIN-NOTIF-005: View Templates tab', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')

    const templatesTab = page.getByRole('tab', { name: /Templates/i })
    await expect(templatesTab).toBeVisible()
    await templatesTab.click()
    await page.waitForLoadState('networkidle')

    // Check for template search
    await expect(page.getByPlaceholder(/Search templates/i)).toBeVisible()
  })

  test('ADMIN-NOTIF-006: Toggle unread only filter', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')

    const unreadOnlyCheckbox = page.getByLabel(/Unread Only/i)
    if (await unreadOnlyCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unreadOnlyCheckbox.check()
      await page.waitForLoadState('networkidle')
      await expect(unreadOnlyCheckbox).toBeChecked()
    }
  })

  test('ADMIN-NOTIF-007: Mark all as read button exists', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')

    const markAllButton = page.getByRole('button', { name: /Mark All Read/i })
    await expect(markAllButton).toBeVisible()
  })

  test('ADMIN-NOTIF-008: Clear read button exists', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')

    const clearButton = page.getByRole('button', { name: /Clear Read/i })
    await expect(clearButton).toBeVisible()
  })

  test('ADMIN-NOTIF-009: Notification channels visible in preferences', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')

    const preferencesTab = page.getByRole('tab', { name: /Preferences/i })
    await preferencesTab.click()
    await page.waitForLoadState('networkidle')

    // Check for notification channels
    await expect(page.getByText(/Email/i)).toBeVisible()
    await expect(page.getByText(/In-App/i)).toBeVisible()
  })

  test('ADMIN-NOTIF-010: Search templates', async ({ page }) => {
    await page.goto(NOTIFICATIONS_URL)
    await page.waitForLoadState('networkidle')

    const templatesTab = page.getByRole('tab', { name: /Templates/i })
    await templatesTab.click()
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/Search templates/i)
    await searchInput.fill('welcome')
    await page.waitForTimeout(500)
  })
})
