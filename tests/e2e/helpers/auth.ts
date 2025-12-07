import type { Page } from '@playwright/test'

export const ADMIN_EMAIL = 'admin@intime.com'
export const ADMIN_PASSWORD = 'TestPass123!'
export const HR_EMAIL = 'hr@intime.com'
export const HR_PASSWORD = 'TestPass123!'
// Recruiter credentials - using actual seed user
export const RECRUITER_EMAIL = 'rec1@intime.com'
export const RECRUITER_PASSWORD = 'TestPass123!'
// Recruiter Manager credentials
export const RECRUITER_MGR_EMAIL = 'rec_mgr1@intime.com'
export const RECRUITER_MGR_PASSWORD = 'TestPass123!'
export const LOGIN_URL = '/login'

export interface LoginOptions {
  email: string
  password: string
  timeout?: number
}

/**
 * Login as a user in the employee portal
 *
 * @param page - Playwright page object
 * @param options - Login credentials and options
 */
export async function loginAsEmployee(page: Page, options: LoginOptions) {
  const { email, password, timeout = 30000 } = options

  await page.goto(LOGIN_URL)
  await page.waitForLoadState('networkidle')

  // Wait for portal selector and click Employee
  await page.waitForSelector('text=Employee', { timeout })
  await page.click('button:has-text("Employee")')

  // Wait for login form
  await page.waitForSelector('input[type="email"]', { timeout })

  // Fill credentials
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for navigation after login
  await page.waitForURL(/\/(employee|dashboard)/, { timeout })
  await page.waitForLoadState('networkidle')
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page, timeout = 30000) {
  return loginAsEmployee(page, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    timeout,
  })
}

/**
 * Login as HR user
 */
export async function loginAsHR(page: Page, timeout = 30000) {
  return loginAsEmployee(page, {
    email: HR_EMAIL,
    password: HR_PASSWORD,
    timeout,
  })
}

/**
 * Login as Recruiter user
 */
export async function loginAsRecruiter(page: Page, timeout = 30000) {
  return loginAsEmployee(page, {
    email: RECRUITER_EMAIL,
    password: RECRUITER_PASSWORD,
    timeout,
  })
}

/**
 * Navigate to a page after login
 */
export async function navigateAfterLogin(page: Page, url: string, _timeout = 15000) {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500) // Allow for any React hydration
}

/**
 * Wait for page to be fully loaded with all network requests settled
 */
export async function waitForPageReady(page: Page, _timeout = 15000) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(300)
}
