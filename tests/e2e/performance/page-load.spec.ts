import { test, expect } from '@playwright/test'
import { loginAsRecruiter, loginAsAdmin, navigateAfterLogin } from '../helpers/auth'
import { assertFastPageLoad, assertNoLoadingSpinner, measurePageLoad } from '../utils/performance'

test.describe('Page Load Performance', () => {
  test.describe('List Pages - Recruiter', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRecruiter(page)
    })

    const listPages = [
      { name: 'Jobs', url: '/employee/recruiting/jobs' },
      { name: 'Candidates', url: '/employee/recruiting/candidates' },
      { name: 'Accounts', url: '/employee/recruiting/accounts' },
      { name: 'Placements', url: '/employee/recruiting/placements' },
      { name: 'Hotlists', url: '/employee/recruiting/hotlists' },
      { name: 'Vendors', url: '/employee/recruiting/vendors' },
      { name: 'Talent', url: '/employee/recruiting/talent' },
    ]

    for (const { name, url } of listPages) {
      test(`${name} list page loads in <500ms`, async ({ page }) => {
        await assertFastPageLoad(page, url, 500)
      })

      test(`${name} list page has no loading spinner`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        await assertNoLoadingSpinner(page)
      })
    }
  })

  test.describe('List Pages - CRM', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRecruiter(page)
    })

    const crmPages = [
      { name: 'Leads', url: '/employee/crm/leads' },
      { name: 'Deals', url: '/employee/crm/deals' },
    ]

    for (const { name, url } of crmPages) {
      test(`${name} page loads in <500ms`, async ({ page }) => {
        await assertFastPageLoad(page, url, 500)
      })

      test(`${name} page has no loading spinner`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        await assertNoLoadingSpinner(page)
      })
    }
  })

  test.describe('Detail Pages', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRecruiter(page)
    })

    test('Job detail page loads in <500ms', async ({ page }) => {
      // First navigate to jobs list to get a job ID
      await navigateAfterLogin(page, '/employee/recruiting/jobs')

      // Find and click the first job card
      const firstJobCard = page.locator('[data-testid="job-card"]').first()
      const isVisible = await firstJobCard.isVisible().catch(() => false)

      if (isVisible) {
        await firstJobCard.click()
        await page.waitForURL(/\/employee\/recruiting\/jobs\/[a-zA-Z0-9-]+/)

        // Measure subsequent load performance
        const url = page.url()
        await assertFastPageLoad(page, url, 500)
      } else {
        // Skip if no jobs exist
        test.skip()
      }
    })

    test('Candidate detail page loads in <500ms', async ({ page }) => {
      await navigateAfterLogin(page, '/employee/recruiting/candidates')

      const firstCandidateRow = page.locator('[data-testid="candidate-row"]').first()
      const isVisible = await firstCandidateRow.isVisible().catch(() => false)

      if (isVisible) {
        await firstCandidateRow.click()
        await page.waitForURL(/\/employee\/recruiting\/candidates\/[a-zA-Z0-9-]+/)

        const url = page.url()
        await assertFastPageLoad(page, url, 500)
      } else {
        test.skip()
      }
    })
  })

  test.describe('Dashboard Pages', () => {
    test('Workspace dashboard loads in <500ms', async ({ page }) => {
      await loginAsRecruiter(page)
      await assertFastPageLoad(page, '/employee/workspace/dashboard', 500)
    })

    test('Admin dashboard loads in <500ms', async ({ page }) => {
      await loginAsAdmin(page)
      await assertFastPageLoad(page, '/employee/admin/dashboard', 500)
    })
  })

  test.describe('Performance Metrics', () => {
    test('Jobs page performance metrics', async ({ page }) => {
      await loginAsRecruiter(page)
      const metrics = await measurePageLoad(page, '/employee/recruiting/jobs')

      console.log('Performance Metrics:', {
        domContentLoaded: `${metrics.domContentLoaded}ms`,
        firstContentfulPaint: `${metrics.firstContentfulPaint}ms`,
        loadComplete: `${metrics.loadComplete}ms`,
      })

      expect(metrics.firstContentfulPaint).toBeLessThan(500)
      expect(metrics.domContentLoaded).toBeLessThan(800)
    })
  })
})
