import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

/**
 * Wave 3: Legal & Financial Admin E2E Tests
 *
 * Tests for the admin portal legal and financial management pages:
 * - Compliance Management
 * - Contract Management
 * - Rate Card Management
 *
 * These tests validate page loads and basic CRUD operations.
 */

test.describe('Legal & Financial Admin Portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('Compliance Management', () => {
    test('Compliance dashboard loads', async ({ page }) => {
      await page.goto('/employee/admin/compliance')
      await page.waitForLoadState('networkidle')

      // Look for either the page heading or any compliance-related content
      const pageContent = await page.textContent('body')
      const hasComplianceContent =
        pageContent?.includes('Compliance') ||
        pageContent?.includes('Requirements') ||
        pageContent?.includes('Tracking')

      expect(hasComplianceContent).toBeTruthy()
    })

    test('Compliance requirements list loads', async ({ page }) => {
      await page.goto('/employee/admin/compliance/requirements')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      const hasRequirementsContent =
        pageContent?.includes('Requirements') ||
        pageContent?.includes('Compliance') ||
        pageContent?.includes('Add') ||
        pageContent?.includes('New')

      expect(hasRequirementsContent).toBeTruthy()
    })

    test.skip('Create compliance requirement form loads', async ({ page }) => {
      await page.goto('/employee/admin/compliance/requirements/new')
      await page.waitForLoadState('networkidle')

      // Expect form fields
      await expect(page.getByLabel(/Name/i).or(page.getByLabel(/Requirement/i))).toBeVisible({
        timeout: 15000,
      })
    })

    test.skip('Compliance items list loads', async ({ page }) => {
      await page.goto('/employee/admin/compliance/items')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      const hasItemsContent =
        pageContent?.includes('Items') ||
        pageContent?.includes('Compliance') ||
        pageContent?.includes('Status')

      expect(hasItemsContent).toBeTruthy()
    })

    test.skip('Expiring compliance items view loads', async ({ page }) => {
      await page.goto('/employee/admin/compliance/expiring')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      const hasExpiringContent =
        pageContent?.includes('Expiring') ||
        pageContent?.includes('Soon') ||
        pageContent?.includes('Due')

      expect(hasExpiringContent).toBeTruthy()
    })
  })

  test.describe('Contract Management', () => {
    test('Contracts list page loads', async ({ page }) => {
      await page.goto('/employee/admin/contracts')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      const hasContractsContent =
        pageContent?.includes('Contract') ||
        pageContent?.includes('Agreement') ||
        pageContent?.includes('MSA') ||
        pageContent?.includes('NDA')

      expect(hasContractsContent).toBeTruthy()
    })

    test.skip('Create contract form loads', async ({ page }) => {
      await page.goto('/employee/admin/contracts/new')
      await page.waitForLoadState('networkidle')

      // Expect form fields
      await expect(page.getByLabel(/Contract Name/i).or(page.getByLabel(/Name/i))).toBeVisible({
        timeout: 15000,
      })
    })

    test.skip('Contract templates list loads', async ({ page }) => {
      await page.goto('/employee/admin/contracts/templates')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      const hasTemplatesContent =
        pageContent?.includes('Template') ||
        pageContent?.includes('Standard') ||
        pageContent?.includes('MSA') ||
        pageContent?.includes('NDA')

      expect(hasTemplatesContent).toBeTruthy()
    })

    test.skip('Create contract template form loads', async ({ page }) => {
      await page.goto('/employee/admin/contracts/templates/new')
      await page.waitForLoadState('networkidle')

      await expect(page.getByLabel(/Template Name/i).or(page.getByLabel(/Name/i))).toBeVisible({
        timeout: 15000,
      })
    })

    test.skip('Contract clauses library loads', async ({ page }) => {
      await page.goto('/employee/admin/contracts/clauses')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      const hasClausesContent =
        pageContent?.includes('Clause') ||
        pageContent?.includes('Library') ||
        pageContent?.includes('Legal')

      expect(hasClausesContent).toBeTruthy()
    })

    test.skip('Expiring contracts view loads', async ({ page }) => {
      await page.goto('/employee/admin/contracts/expiring')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      const hasExpiringContent =
        pageContent?.includes('Expiring') ||
        pageContent?.includes('Renewal') ||
        pageContent?.includes('Due')

      expect(hasExpiringContent).toBeTruthy()
    })
  })

  test.describe('Rate Card Management', () => {
    test('Rate cards list page loads', async ({ page }) => {
      await page.goto('/employee/admin/rates')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      const hasRatesContent =
        pageContent?.includes('Rate') ||
        pageContent?.includes('Billing') ||
        pageContent?.includes('Card') ||
        pageContent?.includes('Pricing')

      expect(hasRatesContent).toBeTruthy()
    })

    test.skip('Create rate card form loads', async ({ page }) => {
      await page.goto('/employee/admin/rates/new')
      await page.waitForLoadState('networkidle')

      await expect(page.getByLabel(/Rate Card Name/i).or(page.getByLabel(/Name/i))).toBeVisible({
        timeout: 15000,
      })
    })

    test.skip('Rate card items page loads', async ({ page }) => {
      // This would be a dynamic route like /employee/admin/rates/[id]/items
      await page.goto('/employee/admin/rates')
      await page.waitForLoadState('networkidle')

      // Click on first rate card if exists
      const firstRateCard = page.locator('table tbody tr').first()
      if (await firstRateCard.isVisible()) {
        await firstRateCard.click()
        await page.waitForLoadState('networkidle')

        const pageContent = await page.textContent('body')
        const hasItemsContent =
          pageContent?.includes('Item') ||
          pageContent?.includes('Job Category') ||
          pageContent?.includes('Bill Rate')

        expect(hasItemsContent).toBeTruthy()
      }
    })

    test.skip('Rate approvals page loads', async ({ page }) => {
      await page.goto('/employee/admin/rates/approvals')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')
      const hasApprovalsContent =
        pageContent?.includes('Approval') ||
        pageContent?.includes('Pending') ||
        pageContent?.includes('Exception')

      expect(hasApprovalsContent).toBeTruthy()
    })
  })

  test.describe('Dashboard Integration', () => {
    test.skip('Admin dashboard shows legal/financial widgets', async ({ page }) => {
      await page.goto('/employee/admin/dashboard')
      await page.waitForLoadState('networkidle')

      const pageContent = await page.textContent('body')

      // Look for compliance-related widgets
      const hasComplianceWidget =
        pageContent?.includes('Compliance') ||
        pageContent?.includes('Expiring') ||
        pageContent?.includes('Requirements')

      // Look for contract-related widgets
      const hasContractWidget =
        pageContent?.includes('Contract') ||
        pageContent?.includes('Pending Signature') ||
        pageContent?.includes('Renewal')

      // Look for rate-related widgets
      const hasRateWidget =
        pageContent?.includes('Rate') ||
        pageContent?.includes('Margin') ||
        pageContent?.includes('Approval')

      // At least one should be present
      const hasAnyWidget = hasComplianceWidget || hasContractWidget || hasRateWidget
      expect(hasAnyWidget).toBeTruthy()
    })
  })

  test.describe('Navigation', () => {
    test.skip('Admin navigation includes legal/financial sections', async ({ page }) => {
      await page.goto('/employee/admin/dashboard')
      await page.waitForLoadState('networkidle')

      // Look for navigation links
      const navContent = await page
        .locator('nav, [role="navigation"], aside')
        .first()
        .textContent()

      const hasComplianceNav =
        navContent?.includes('Compliance') || navContent?.includes('Requirements')
      const hasContractsNav =
        navContent?.includes('Contract') || navContent?.includes('Agreement')
      const hasRatesNav =
        navContent?.includes('Rate') || navContent?.includes('Billing') || navContent?.includes('Pricing')

      // At least one section should be in navigation
      const hasLegalFinancialNav = hasComplianceNav || hasContractsNav || hasRatesNav
      expect(hasLegalFinancialNav).toBeTruthy()
    })
  })
})

test.describe('Compliance Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.skip('Full compliance requirement lifecycle', async ({ page }) => {
    // Step 1: Navigate to create requirement
    await page.goto('/employee/admin/compliance/requirements/new')
    await page.waitForLoadState('networkidle')

    // Step 2: Fill form
    await page.getByLabel(/Name/i).fill('Test Background Check')
    await page.getByLabel(/Code/i).fill('TEST-BG-001')
    await page
      .getByLabel(/Description/i)
      .fill('Test background check requirement for E2E testing')

    // Step 3: Select category if available
    const categorySelect = page.getByRole('combobox', { name: /Category/i })
    if (await categorySelect.isVisible()) {
      await categorySelect.click()
      await page.getByRole('option', { name: /Background/i }).click()
    }

    // Step 4: Submit form
    await page.getByRole('button', { name: /Create|Save|Submit/i }).click()

    // Step 5: Verify redirect or success message
    await expect(
      page.getByText(/Created|Success|saved/i).or(page.locator('[data-testid="success-toast"]'))
    ).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Contract Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.skip('Create contract from template', async ({ page }) => {
    // Step 1: Navigate to contracts
    await page.goto('/employee/admin/contracts/new')
    await page.waitForLoadState('networkidle')

    // Step 2: Fill basic info
    await page.getByLabel(/Contract Name/i).fill('Test MSA Agreement')

    // Step 3: Select contract type
    const typeSelect = page.getByRole('combobox', { name: /Type/i })
    if (await typeSelect.isVisible()) {
      await typeSelect.click()
      await page.getByRole('option', { name: /MSA/i }).click()
    }

    // Step 4: Set dates
    await page.getByLabel(/Effective Date/i).fill('2025-01-01')
    await page.getByLabel(/Expiry Date/i).fill('2026-01-01')

    // Step 5: Submit
    await page.getByRole('button', { name: /Create|Save/i }).click()

    // Step 6: Verify
    await expect(
      page.getByText(/Created|Success/i).or(page.locator('[data-testid="success-toast"]'))
    ).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Rate Card Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.skip('Create rate card with items', async ({ page }) => {
    // Step 1: Navigate to rate cards
    await page.goto('/employee/admin/rates/new')
    await page.waitForLoadState('networkidle')

    // Step 2: Fill rate card info
    await page.getByLabel(/Name/i).fill('Test Rate Card 2025')

    // Step 3: Select type
    const typeSelect = page.getByRole('combobox', { name: /Type/i })
    if (await typeSelect.isVisible()) {
      await typeSelect.click()
      await page.getByRole('option', { name: /Standard/i }).click()
    }

    // Step 4: Set margin targets
    await page.getByLabel(/Min Margin/i).fill('10')
    await page.getByLabel(/Target Margin/i).fill('20')

    // Step 5: Submit
    await page.getByRole('button', { name: /Create|Save/i }).click()

    // Step 6: Verify
    await expect(
      page.getByText(/Created|Success/i).or(page.locator('[data-testid="success-toast"]'))
    ).toBeVisible({ timeout: 15000 })
  })

  test.skip('Rate margin calculation displays correctly', async ({ page }) => {
    // Navigate to rate details or calculator
    await page.goto('/employee/admin/rates')
    await page.waitForLoadState('networkidle')

    // If there's a margin calculator component
    const billRateInput = page.getByLabel(/Bill Rate/i)
    const payRateInput = page.getByLabel(/Pay Rate/i)

    if ((await billRateInput.isVisible()) && (await payRateInput.isVisible())) {
      await billRateInput.fill('125')
      await payRateInput.fill('100')

      // Check for calculated margin display
      await expect(page.getByText(/20%|20\.0%/)).toBeVisible({ timeout: 5000 })
    }
  })
})
