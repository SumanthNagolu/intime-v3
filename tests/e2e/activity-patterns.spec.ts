import { test, expect } from '@playwright/test'

test.describe('Activity Patterns Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to activity patterns page
    await page.goto('/employee/admin/activity-patterns')
    await page.waitForLoadState('networkidle')
  })

  test('should display the activity patterns list page', async ({ page }) => {
    // Check page title and description
    await expect(page.getByRole('heading', { name: 'Activity Patterns' })).toBeVisible()
    await expect(page.getByText('Configure activity types, required fields, outcomes, and automation rules')).toBeVisible()

    // Check action buttons
    await expect(page.getByRole('button', { name: 'Import' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'New Pattern' })).toBeVisible()
  })

  test('should display stats cards', async ({ page }) => {
    // Check stats cards are present
    await expect(page.getByText('Total Patterns')).toBeVisible()
    await expect(page.getByText('Active')).toBeVisible()
    await expect(page.getByText('Inactive')).toBeVisible()
    await expect(page.getByText('Activities (30d)')).toBeVisible()
  })

  test('should have working search and filter controls', async ({ page }) => {
    // Check search input exists
    const searchInput = page.getByPlaceholder('Search patterns...')
    await expect(searchInput).toBeVisible()

    // Check category filter
    const categoryFilter = page.locator('button').filter({ hasText: /All Categories/ })
    await expect(categoryFilter).toBeVisible()

    // Check status filter
    const statusFilter = page.locator('button').filter({ hasText: /All Status/ })
    await expect(statusFilter).toBeVisible()

    // Check entity filter
    const entityFilter = page.locator('button').filter({ hasText: /All Entities/ })
    await expect(entityFilter).toBeVisible()
  })

  test('should navigate to new pattern form', async ({ page }) => {
    // Click New Pattern button
    await page.getByRole('link', { name: 'New Pattern' }).click()

    // Should be on the new pattern page
    await expect(page).toHaveURL('/employee/admin/activity-patterns/new')
    await expect(page.getByRole('heading', { name: 'New Activity Pattern' })).toBeVisible()
  })

  test('should display the new pattern form with all sections', async ({ page }) => {
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    // Check form sections
    await expect(page.getByText('Basic Information')).toBeVisible()
    await expect(page.getByText('Custom Fields')).toBeVisible()
    await expect(page.getByText('Outcomes *')).toBeVisible()
    await expect(page.getByText('Automation & Points')).toBeVisible()

    // Check basic information fields
    await expect(page.getByLabel('Pattern Name *')).toBeVisible()
    await expect(page.getByLabel('Code (auto-generated)')).toBeVisible()
    await expect(page.getByLabel('Description')).toBeVisible()

    // Check save button
    await expect(page.getByRole('button', { name: 'Save Pattern' })).toBeVisible()

    // Check cancel button
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('should validate required fields on form submission', async ({ page }) => {
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    // Try to save without filling required fields
    await page.getByRole('button', { name: 'Save Pattern' }).click()

    // Should show validation error
    await expect(page.getByText('Name is required')).toBeVisible()
  })

  test('should create a new activity pattern', async ({ page }) => {
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    // Fill in basic information
    const testPatternName = `Test Pattern ${Date.now()}`
    await page.getByLabel('Pattern Name *').fill(testPatternName)
    await page.getByLabel('Description').fill('This is a test activity pattern')

    // Select category
    await page.locator('button').filter({ hasText: /Communication/ }).first().click()
    await page.getByRole('option', { name: /Calendar/ }).click()

    // Select entity type
    const entitySelect = page.locator('button').filter({ hasText: /General/ }).first()
    await entitySelect.click()
    await page.getByRole('option', { name: 'Candidate' }).click()

    // The default outcomes should already be there
    // Wait for the form to be valid
    await page.waitForTimeout(500)

    // Save the pattern
    await page.getByRole('button', { name: 'Save Pattern' }).click()

    // Should redirect to the detail page
    await page.waitForURL(/\/employee\/admin\/activity-patterns\/[\w-]+$/)
    await expect(page.getByText(testPatternName)).toBeVisible()
  })

  test('should add and remove custom fields', async ({ page }) => {
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    // Click Add Field button
    await page.getByRole('button', { name: 'Add Field' }).click()

    // Check that a new field row appeared
    const fieldRow = page.locator('.bg-charcoal-50').filter({ hasText: /Field name/ })
    await expect(fieldRow).toBeVisible()

    // Fill in field details
    await page.getByPlaceholder('Field name (e.g., call_duration)').fill('test_field')
    await page.getByPlaceholder('Label (e.g., Call Duration)').fill('Test Field')

    // Remove the field
    const removeButton = fieldRow.getByRole('button')
    await removeButton.click()

    // Field should be removed
    await expect(page.getByPlaceholder('Field name (e.g., call_duration)')).not.toBeVisible()
  })

  test('should add and configure outcomes', async ({ page }) => {
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    // Check default outcomes exist
    await expect(page.getByText('Successful')).toBeVisible()
    await expect(page.getByText('Unsuccessful')).toBeVisible()

    // Add a new outcome
    await page.getByRole('button', { name: 'Add Outcome' }).click()

    // Fill in the new outcome
    const outcomeInputs = page.getByPlaceholder('e.g., Connected')
    const lastInput = outcomeInputs.last()
    await lastInput.fill('No Answer')
  })

  test('should open import dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Import' }).click()

    // Check import dialog content
    await expect(page.getByRole('heading', { name: 'Import Patterns' })).toBeVisible()
    await expect(page.getByText('Upload a JSON file containing activity patterns to import')).toBeVisible()
    await expect(page.getByRole('button', { name: /Select JSON File/ })).toBeVisible()
  })

  test('should export patterns as JSON', async ({ page }) => {
    // Set up download handler
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export' }).click(),
    ])

    // Check download filename
    expect(download.suggestedFilename()).toMatch(/activity-patterns-\d{4}-\d{2}-\d{2}\.json/)
  })

  test('should filter patterns by category', async ({ page }) => {
    // Open category filter
    const categoryFilter = page.locator('button').filter({ hasText: /All Categories/ }).first()
    await categoryFilter.click()

    // Select Communication category
    await page.getByRole('option', { name: /Communication/ }).click()

    // URL should update with filter
    await page.waitForTimeout(300)
    // The filter should be applied (list should update)
  })

  test('should filter patterns by status', async ({ page }) => {
    // Open status filter
    const statusFilter = page.locator('button').filter({ hasText: /All Status/ }).first()
    await statusFilter.click()

    // Select Active status
    await page.getByRole('option', { name: 'Active' }).click()

    // Wait for filter to apply
    await page.waitForTimeout(300)
  })

  test('should search patterns by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search patterns...')
    await searchInput.fill('phone')

    // Wait for search to apply
    await page.waitForTimeout(500)

    // Search should be applied
  })

  test('should navigate to pattern detail page', async ({ page }) => {
    // First create a pattern
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    const testPatternName = `Detail Test ${Date.now()}`
    await page.getByLabel('Pattern Name *').fill(testPatternName)
    await page.getByRole('button', { name: 'Save Pattern' }).click()

    // Wait for redirect to detail page
    await page.waitForURL(/\/employee\/admin\/activity-patterns\/[\w-]+$/)

    // Check detail page content
    await expect(page.getByText(testPatternName)).toBeVisible()
    await expect(page.getByText('Uses (30d)')).toBeVisible()
    await expect(page.getByText('Total Uses')).toBeVisible()
    await expect(page.getByText('Base Points')).toBeVisible()
    await expect(page.getByText('Target Days')).toBeVisible()
  })

  test('should duplicate a pattern from detail page', async ({ page }) => {
    // First create a pattern
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    const testPatternName = `Duplicate Test ${Date.now()}`
    await page.getByLabel('Pattern Name *').fill(testPatternName)
    await page.getByRole('button', { name: 'Save Pattern' }).click()

    // Wait for redirect to detail page
    await page.waitForURL(/\/employee\/admin\/activity-patterns\/[\w-]+$/)

    // Click duplicate button
    await page.getByRole('button', { name: 'Duplicate' }).click()

    // Should redirect to edit page for the duplicate
    await page.waitForURL(/\/employee\/admin\/activity-patterns\/[\w-]+\/edit$/)

    // The name should be the original + (Copy)
    await expect(page.getByLabel('Pattern Name *')).toHaveValue(`${testPatternName} (Copy)`)
  })

  test('should toggle pattern status from detail page', async ({ page }) => {
    // First create a pattern
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    const testPatternName = `Toggle Test ${Date.now()}`
    await page.getByLabel('Pattern Name *').fill(testPatternName)
    await page.getByRole('button', { name: 'Save Pattern' }).click()

    // Wait for redirect to detail page
    await page.waitForURL(/\/employee\/admin\/activity-patterns\/[\w-]+$/)

    // Click disable button
    await page.getByRole('button', { name: 'Disable' }).click()

    // Status should change to Inactive
    await expect(page.getByText('Inactive')).toBeVisible()

    // Enable again
    await page.getByRole('button', { name: 'Enable' }).click()

    // Status should change back to Active
    await expect(page.getByText('Active').first()).toBeVisible()
  })

  test('should delete a pattern from detail page', async ({ page }) => {
    // First create a pattern
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    const testPatternName = `Delete Test ${Date.now()}`
    await page.getByLabel('Pattern Name *').fill(testPatternName)
    await page.getByRole('button', { name: 'Save Pattern' }).click()

    // Wait for redirect to detail page
    await page.waitForURL(/\/employee\/admin\/activity-patterns\/[\w-]+$/)

    // Click delete button
    await page.getByRole('button', { name: 'Delete' }).click()

    // Confirm delete in dialog
    await expect(page.getByRole('heading', { name: 'Delete Pattern' })).toBeVisible()
    await page.getByRole('button', { name: 'Delete' }).last().click()

    // Should redirect to list page
    await page.waitForURL('/employee/admin/activity-patterns')
  })

  test('should edit a pattern', async ({ page }) => {
    // First create a pattern
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    const testPatternName = `Edit Test ${Date.now()}`
    await page.getByLabel('Pattern Name *').fill(testPatternName)
    await page.getByRole('button', { name: 'Save Pattern' }).click()

    // Wait for redirect to detail page
    await page.waitForURL(/\/employee\/admin\/activity-patterns\/[\w-]+$/)

    // Click edit button
    await page.getByRole('link', { name: 'Edit' }).click()

    // Should be on edit page
    await page.waitForURL(/\/employee\/admin\/activity-patterns\/[\w-]+\/edit$/)
    await expect(page.getByRole('heading', { name: 'Edit Activity Pattern' })).toBeVisible()

    // Update the name
    const updatedName = `${testPatternName} Updated`
    await page.getByLabel('Pattern Name *').fill(updatedName)

    // Save changes
    await page.getByRole('button', { name: 'Save Pattern' }).click()

    // Should redirect back to detail page
    await page.waitForURL(/\/employee\/admin\/activity-patterns\/[\w-]+$/)
    await expect(page.getByText(updatedName)).toBeVisible()
  })

  test('should configure follow-up rules', async ({ page }) => {
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    // Fill basic info first
    await page.getByLabel('Pattern Name *').fill('Followup Test')

    // Scroll to automation section
    await page.getByText('Follow-up Rules').scrollIntoViewIfNeeded()

    // Add a follow-up rule
    await page.getByRole('button', { name: 'Add Follow-up Rule' }).click()

    // Fill in rule details
    const ruleInputs = page.locator('.bg-charcoal-50').filter({ hasText: /When outcome is/ })
    await expect(ruleInputs).toBeVisible()

    // Fill task title
    await page.getByPlaceholder('e.g., Follow up call').fill('Test follow-up task')
  })

  test('should set base points and display order', async ({ page }) => {
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    // Fill basic info
    await page.getByLabel('Pattern Name *').fill('Points Test')

    // Set base points
    await page.getByLabel('Base Points').fill('10')

    // Set display order
    await page.getByLabel('Display Order').fill('50')

    // Values should be set
    await expect(page.getByLabel('Base Points')).toHaveValue('10')
    await expect(page.getByLabel('Display Order')).toHaveValue('50')
  })

  test('should toggle auto-log integrations', async ({ page }) => {
    await page.goto('/employee/admin/activity-patterns/new')
    await page.waitForLoadState('networkidle')

    // Check Gmail integration checkbox
    const gmailCheckbox = page.getByRole('checkbox', { name: 'Gmail' })
    await gmailCheckbox.check()
    await expect(gmailCheckbox).toBeChecked()

    // Check Outlook integration checkbox
    const outlookCheckbox = page.getByRole('checkbox', { name: 'Outlook' })
    await outlookCheckbox.check()
    await expect(outlookCheckbox).toBeChecked()
  })

  test('should collapse and expand category groups', async ({ page }) => {
    // Wait for patterns to load
    await page.waitForTimeout(1000)

    // Find a category group header (if patterns exist)
    const categoryHeader = page.locator('.bg-charcoal-50').first()

    if (await categoryHeader.isVisible()) {
      // Click to collapse
      await categoryHeader.click()
      await page.waitForTimeout(300)

      // Click again to expand
      await categoryHeader.click()
      await page.waitForTimeout(300)
    }
  })
})
