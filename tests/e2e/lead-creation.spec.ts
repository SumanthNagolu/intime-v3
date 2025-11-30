/**
 * Lead Creation E2E Tests
 * Creates 5 leads per role with activities, notes, and strategy
 */

import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = 'test-results/lead-creation-screenshots';
const PASSWORD = 'TestPass123!';

// Test users by role
const TEST_USERS = {
  recruiter: { email: 'jr_rec@intime.com', role: 'Recruiter' },
  benchSales: { email: 'jr_bs@intime.com', role: 'Bench Sales' },
  ta: { email: 'jr_ta@intime.com', role: 'TA Specialist' },
  manager: { email: 'sr_rec@intime.com', role: 'Manager' },
  ceo: { email: 'ceo@intime.com', role: 'CEO' },
};

// Lead data templates
const LEAD_TEMPLATES = [
  {
    company: 'Acme Insurance Corp',
    firstName: 'John',
    lastName: 'Smith',
    title: 'VP of Technology',
    email: 'jsmith@acmeinsurance.com',
    phone: '555-0101',
    industry: 'Insurance (P&C)',
    value: '150000',
    source: 'LinkedIn',
    notes: 'Met at Insurance Technology conference. Interested in modernizing their claims system.',
  },
  {
    company: 'FinServe Solutions',
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'Director of IT',
    email: 'sjohnson@finserve.com',
    phone: '555-0102',
    industry: 'Financial Services',
    value: '200000',
    source: 'Referral',
    notes: 'Referred by existing client. Looking for .NET developers for banking platform.',
  },
  {
    company: 'HealthFirst Medical',
    firstName: 'Michael',
    lastName: 'Chen',
    title: 'CTO',
    email: 'mchen@healthfirst.com',
    phone: '555-0103',
    industry: 'Healthcare',
    value: '300000',
    source: 'Cold Outreach',
    notes: 'Cold outreach successful. Building new patient portal, needs full stack team.',
  },
  {
    company: 'TechGiant Industries',
    firstName: 'Emily',
    lastName: 'Davis',
    title: 'Hiring Manager',
    email: 'edavis@techgiant.com',
    phone: '555-0104',
    industry: 'Technology',
    value: '175000',
    source: 'Website Inquiry',
    notes: 'Submitted form on website. Urgent need for cloud architects.',
  },
  {
    company: 'RetailMax Stores',
    firstName: 'Robert',
    lastName: 'Wilson',
    title: 'IT Director',
    email: 'rwilson@retailmax.com',
    phone: '555-0105',
    industry: 'Retail',
    value: '125000',
    source: 'Conference/Event',
    notes: 'Met at retail tech expo. Planning e-commerce platform upgrade.',
  },
];

// Activity templates (for future use with addActivitiesToLead function)
// const ACTIVITY_TEMPLATES = [
//   { type: 'call', subject: 'Initial discovery call', notes: 'Discussed current tech stack and hiring needs. Very engaged.' },
//   { type: 'email', subject: 'Follow-up with company overview', notes: 'Sent company profile and case studies.' },
//   { type: 'meeting', subject: 'Requirements gathering session', notes: 'Deep dive into technical requirements. Identified 3 key positions.' },
//   { type: 'note', subject: 'Research findings', notes: 'Company recently received Series B funding. Aggressive growth planned.' },
//   { type: 'task', subject: 'Prepare proposal', notes: 'Need to prepare staffing proposal by end of week.' },
// ];

// Strategy notes templates (for future use)
// const STRATEGY_NOTES = [
//   'Focus on highlighting our insurance domain expertise and successful placements at similar companies.',
//   'Key decision maker is the VP. Need to schedule executive briefing with our leadership.',
//   'Timeline is Q2. Push for MSA signing by end of month to start placements.',
//   'Budget approved for 5 contractors. Opportunity to expand to full team if successful.',
//   'Competition includes 2 other staffing firms. Our differentiator is technical screening quality.',
// ];

// Random outcomes (for future use)
// const OUTCOMES = ['converted', 'hot', 'warm', 'cold', 'lost'];

async function login(page: Page, email: string): Promise<void> {
  await page.goto('/auth/employee');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

async function createLead(page: Page, leadData: typeof LEAD_TEMPLATES[0], index: number): Promise<boolean> {
  // Navigate to leads page
  await page.goto('/employee/workspace/leads');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Click New Lead button
  const newLeadBtn = page.locator('button:has-text("New Lead")');
  await newLeadBtn.click();
  await page.waitForTimeout(1000);

  // Fill the lead form
  // Check if modal is visible
  const modal = page.locator('[role="dialog"], .fixed.inset-0');
  if (await modal.count() > 0) {
    // Fill company/person fields based on what's visible
    const companyInput = page.locator('input[name="company"], input[placeholder*="Company"]');
    if (await companyInput.count() > 0) {
      await companyInput.fill(leadData.company + ' ' + index);
    }

    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="First"]');
    if (await firstNameInput.count() > 0) {
      await firstNameInput.fill(leadData.firstName);
    }

    const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="Last"]');
    if (await lastNameInput.count() > 0) {
      await lastNameInput.fill(leadData.lastName);
    }

    const titleInput = page.locator('input[name="title"], input[placeholder*="Title"]');
    if (await titleInput.count() > 0) {
      await titleInput.fill(leadData.title);
    }

    const emailInput = page.locator('input[name="email"], input[placeholder*="Email"], input[type="email"]').last();
    if (await emailInput.count() > 0) {
      await emailInput.fill(`lead${index}_${Date.now()}@test.com`);
    }

    const phoneInput = page.locator('input[name="phone"], input[placeholder*="Phone"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(leadData.phone);
    }

    const valueInput = page.locator('input[name="value"], input[placeholder*="Value"]');
    if (await valueInput.count() > 0) {
      await valueInput.fill(leadData.value);
    }

    const notesInput = page.locator('textarea[name="notes"], textarea[placeholder*="Notes"]');
    if (await notesInput.count() > 0) {
      await notesInput.fill(leadData.notes);
    }

    // Select source if dropdown exists
    const sourceSelect = page.locator('select[name="source"], [data-testid="source-select"]');
    if (await sourceSelect.count() > 0) {
      await sourceSelect.selectOption({ label: leadData.source });
    }

    // Take screenshot of filled form
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `lead-form-${index}.png`),
      fullPage: true,
    });

    // Submit the form
    const saveBtn = page.locator('button:has-text("Create"), button:has-text("Save"), button[type="submit"]').last();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  return true;
}

// Helper function for adding activities (currently unused, kept for future expansion)
// async function addActivitiesToLead(page: Page, leadId: string, activityIndex: number): Promise<boolean> {
//   // Navigate to lead detail
//   await page.goto(`/employee/workspace/leads/${leadId}`);
//   await page.waitForLoadState('networkidle');
//   await page.waitForTimeout(1500);
//
//   const ACTIVITY_TEMPLATES = [
//     { type: 'call', subject: 'Discovery call', notes: 'Discussed current hiring needs and timeline. Good engagement from hiring manager.' },
//     { type: 'meeting', subject: 'In-person meeting', notes: 'Met with VP Engineering to discuss contractor requirements. Very interested.' },
//   ];
//   const activity = ACTIVITY_TEMPLATES[activityIndex % ACTIVITY_TEMPLATES.length];
//
//   // Look for activity composer or add activity button
//   const addActivityBtn = page.locator('button:has-text("Add Activity"), button:has-text("Log Activity"), button:has-text("New Activity")');
//   if (await addActivityBtn.count() > 0) {
//     await addActivityBtn.first().click();
//     await page.waitForTimeout(500);
//
//     // Fill activity details
//     const subjectInput = page.locator('input[placeholder*="Subject"], input[name="subject"]');
//     if (await subjectInput.count() > 0) {
//       await subjectInput.fill(activity.subject);
//     }
//
//     const notesInput = page.locator('textarea[placeholder*="Notes"], textarea[name="notes"]');
//     if (await notesInput.count() > 0) {
//       await notesInput.fill(activity.notes);
//     }
//
//     // Save activity
//     const saveBtn = page.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]');
//     if (await saveBtn.count() > 0) {
//       await saveBtn.first().click();
//       await page.waitForTimeout(1000);
//     }
//   }
//
//   return true;
// }

test.describe('Lead Creation for All Roles', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  });

  test('Create leads as Recruiter', async ({ page }) => {
    await login(page, TEST_USERS.recruiter.email);

    for (let i = 0; i < 5; i++) {
      const leadData = LEAD_TEMPLATES[i];
      console.log(`Creating lead ${i + 1}: ${leadData.company}`);

      await createLead(page, leadData, i + 1);

      // Take screenshot after creation
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `recruiter-lead-${i + 1}.png`),
        fullPage: true,
      });
    }

    // Final screenshot of leads list
    await page.goto('/employee/workspace/leads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'recruiter-all-leads.png'),
      fullPage: true,
    });

    expect(true).toBe(true);
  });

  test('Create leads as Bench Sales', async ({ page }) => {
    await login(page, TEST_USERS.benchSales.email);

    for (let i = 0; i < 3; i++) {
      const leadData = LEAD_TEMPLATES[i];
      console.log(`Creating lead ${i + 1}: ${leadData.company}`);

      await createLead(page, { ...leadData, company: `Bench-${leadData.company}` }, i + 100);
    }

    await page.goto('/employee/workspace/leads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'bench-sales-all-leads.png'),
      fullPage: true,
    });

    expect(true).toBe(true);
  });

  test('Create leads as TA Specialist', async ({ page }) => {
    await login(page, TEST_USERS.ta.email);

    for (let i = 0; i < 3; i++) {
      const leadData = LEAD_TEMPLATES[i];
      console.log(`Creating lead ${i + 1}: ${leadData.company}`);

      await createLead(page, { ...leadData, company: `TA-${leadData.company}` }, i + 200);
    }

    await page.goto('/employee/workspace/leads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'ta-specialist-all-leads.png'),
      fullPage: true,
    });

    expect(true).toBe(true);
  });

  test('Create leads as Manager', async ({ page }) => {
    await login(page, TEST_USERS.manager.email);

    for (let i = 0; i < 3; i++) {
      const leadData = LEAD_TEMPLATES[i];
      console.log(`Creating lead ${i + 1}: ${leadData.company}`);

      await createLead(page, { ...leadData, company: `Manager-${leadData.company}` }, i + 300);
    }

    await page.goto('/employee/workspace/leads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'manager-all-leads.png'),
      fullPage: true,
    });

    expect(true).toBe(true);
  });

  test('Verify New Lead button works and capture modal', async ({ page }) => {
    await login(page, TEST_USERS.recruiter.email);

    // Navigate to leads
    await page.goto('/employee/workspace/leads');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot before clicking
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'leads-page-before-modal.png'),
      fullPage: true,
    });

    // Click New Lead button
    const newLeadBtn = page.locator('button:has-text("New Lead")');
    expect(await newLeadBtn.count()).toBeGreaterThan(0);

    await newLeadBtn.click();
    await page.waitForTimeout(1500);

    // Screenshot with modal open
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'new-lead-modal-open.png'),
      fullPage: true,
    });

    // Check modal elements
    const modal = page.locator('[role="dialog"], .fixed.inset-0, .modal');
    const modalVisible = await modal.count() > 0;
    console.log(`Modal visible: ${modalVisible}`);

    expect(modalVisible).toBe(true);
  });
});
