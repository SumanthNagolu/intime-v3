# InTime v3 - Complete Conversion Playbook

Systematic guide to convert InTime to an international-level SaaS ATS/CRM platform.

---

## Conversion Order (Dependency-Based)

### Why This Order?

```
FOUNDATION (Platform)
    │
    ├── 1. Activities & Workplans  ◄── Everything depends on this
    │
    └── BUSINESS ENTITIES
            │
            ├── 2. CRM Module (Sales Pipeline)
            │       ├── 2a. Lead        ◄── Entry point, simplest
            │       ├── 2b. Account     ◄── Leads convert to Accounts
            │       ├── 2c. Contact     ◄── Accounts have Contacts
            │       └── 2d. Deal        ◄── Leads/Accounts have Deals
            │
            ├── 3. ATS Module (Core Business)
            │       ├── 3a. Job Order   ◄── Accounts create Jobs
            │       ├── 3b. Candidate   ◄── Independent, parallel to Jobs
            │       ├── 3c. Submission  ◄── Connects Candidate↔Job
            │       ├── 3d. Interview   ◄── Part of Submission flow
            │       ├── 3e. Offer       ◄── Part of Submission flow
            │       └── 3f. Placement   ◄── Final outcome
            │
            ├── 4. Bench Sales Module
            │       ├── 4a. Hotlist     ◄── Uses Candidates
            │       └── 4b. Marketing   ◄── Marketing campaigns
            │
            └── 5. Academy Module
                    ├── 5a. Course      ◄── Training content
                    ├── 5b. Enrollment  ◄── Users in courses
                    └── 5c. Certificate ◄── Completion records
```

---

## Phase 0: Foundation Setup (Activities & Workplans)

### Duration: Complete first before any entity

### Backend Tasks

```bash
# 1. Run migration
/db-migrate 20251130000000_create_workplan_activity_system.sql

# 2. Create tRPC router
```

**File: `src/server/routers/workplan.ts`**
- `listActivityPatterns` - Get available patterns
- `listWorkplanTemplates` - Get templates
- `createWorkplanInstance` - Start workplan for entity
- `listActivities` - Get activities for entity
- `createActivity` - Manual activity creation
- `updateActivity` - Update activity
- `completeActivity` - Complete with successors
- `skipActivity` - Skip activity
- `reassignActivity` - Change assignee

### Frontend Tasks

**Components to create:**
- `ActivityList` - List activities for any entity
- `ActivityCard` - Single activity display
- `ActivityForm` - Create/edit activity
- `WorkplanProgress` - Progress indicator
- `ActivityTimeline` - Timeline view

### Testing

```typescript
// tests/e2e/activities-foundation.spec.ts
test('Activity system foundation', async ({ page }) => {
  // Test activity patterns exist
  // Test workplan templates exist
  // Test manual activity creation
  // Test activity completion triggers successors
});
```

---

## Phase 1: CRM Module

### 1a. LEAD (Start Here)

**Why First:** Simplest entity, clear lifecycle, establishes patterns.

#### Backend Checklist

- [ ] **Entity Config:** `src/lib/entities/crm/lead.entity.ts` ✅ (exists)
- [ ] **Zod Schemas:** `src/lib/validations/lead.ts`
  ```typescript
  // Required schemas:
  - leadSchema (full entity)
  - createLeadInput
  - updateLeadInput
  - listLeadsInput (with filters)
  - listLeadsOutput (paginated)
  - convertLeadInput
  ```
- [ ] **tRPC Router:** `src/server/routers/crm.ts`
  ```typescript
  // Required procedures:
  - getLeadById
  - listLeads (with pagination, filters, search)
  - createLead (+ auto-create workplan)
  - updateLead (+ activity logging)
  - deleteLead (soft delete)
  - convertLeadToDeal
  - bulkAssignLeads
  - bulkUpdateLeadStatus
  - getLeadActivities
  - getLeadWorkplan
  ```
- [ ] **Workplan Integration:**
  - Auto-create `lead_qualification` workplan on lead creation
  - Status change triggers activities
  - BANT score updates trigger activities

#### Frontend Checklist

- [ ] **Screen Definitions:**
  - `src/screens/crm/lead-list.screen.ts` ✅ (exists)
  - `src/screens/crm/lead-detail.screen.ts` ✅ (exists)
  - `src/screens/crm/lead-create.screen.ts` (wizard)
- [ ] **Page Wrappers:**
  - `src/app/employee/crm/leads/page.tsx` (list)
  - `src/app/employee/crm/leads/[id]/page.tsx` (detail)
  - `src/app/employee/crm/leads/new/page.tsx` (create)
- [ ] **Custom Components (if needed):**
  - `LeadBANTScoreCard` - BANT qualification display
  - `LeadConvertDialog` - Convert to Deal/Account
  - `LeadQualificationWizard` - Guided qualification

#### E2E Test Suite

**File: `tests/e2e/crm/lead-complete-flow.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Lead Management - Complete Flow', () => {

  test.describe('Lead Creation', () => {
    test('should create a company lead with all fields', async ({ page }) => {
      await page.goto('/employee/crm/leads/new');

      // Company Information
      await page.fill('[data-testid="companyName"]', 'Acme Corporation');
      await page.selectOption('[data-testid="industry"]', 'technology');
      await page.selectOption('[data-testid="companyType"]', 'direct_client');
      await page.selectOption('[data-testid="companySize"]', '201-500');
      await page.selectOption('[data-testid="tier"]', 'enterprise');
      await page.fill('[data-testid="website"]', 'https://acme.com');
      await page.fill('[data-testid="headquarters"]', 'San Francisco, CA');

      // Contact Information
      await page.fill('[data-testid="firstName"]', 'John');
      await page.fill('[data-testid="lastName"]', 'Smith');
      await page.fill('[data-testid="title"]', 'VP of Engineering');
      await page.fill('[data-testid="email"]', 'john.smith@acme.com');
      await page.fill('[data-testid="phone"]', '(555) 123-4567');
      await page.fill('[data-testid="linkedinUrl"]', 'https://linkedin.com/in/johnsmith');
      await page.selectOption('[data-testid="decisionAuthority"]', 'decision_maker');

      // Lead Details
      await page.selectOption('[data-testid="source"]', 'referral');
      await page.fill('[data-testid="estimatedValue"]', '500000');
      await page.fill('[data-testid="notes"]', 'Hot lead from partner referral');

      // Submit
      await page.click('[data-testid="submit-lead"]');

      // Verify redirect to detail page
      await expect(page).toHaveURL(/\/employee\/crm\/leads\/[\w-]+$/);

      // Verify lead was created
      await expect(page.locator('[data-testid="lead-title"]')).toContainText('Acme Corporation');
      await expect(page.locator('[data-testid="lead-status"]')).toContainText('New');

      // Verify workplan was created
      await expect(page.locator('[data-testid="workplan-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-list"]')).toContainText('Initial Research');

      // Screenshot for verification
      await page.screenshot({ path: 'test-results/lead-created.png' });
    });

    test('should create a person lead linked to existing account', async ({ page }) => {
      // ... person lead creation flow
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/employee/crm/leads/new');
      await page.click('[data-testid="submit-lead"]');

      // Verify validation errors
      await expect(page.locator('[data-testid="error-companyName"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    });

    test('should handle duplicate lead detection', async ({ page }) => {
      // Create lead, then try to create duplicate
    });
  });

  test.describe('Lead List & Filtering', () => {
    test('should display paginated lead list', async ({ page }) => {
      await page.goto('/employee/crm/leads');

      // Verify list loads
      await expect(page.locator('[data-testid="lead-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="lead-row"]')).toHaveCount.greaterThan(0);

      // Verify pagination
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    });

    test('should filter leads by status', async ({ page }) => {
      await page.goto('/employee/crm/leads');

      // Open filter
      await page.click('[data-testid="filter-status"]');
      await page.click('[data-testid="status-qualified"]');
      await page.click('[data-testid="apply-filters"]');

      // Verify filtered results
      const statusCells = page.locator('[data-testid="lead-status"]');
      const count = await statusCells.count();
      for (let i = 0; i < count; i++) {
        await expect(statusCells.nth(i)).toContainText('Qualified');
      }
    });

    test('should filter leads by tier', async ({ page }) => {
      // Enterprise, Mid-Market, SMB filtering
    });

    test('should filter leads by source', async ({ page }) => {
      // Website, Referral, LinkedIn, etc.
    });

    test('should filter leads by owner', async ({ page }) => {
      // Filter by assigned owner
    });

    test('should filter leads by date range', async ({ page }) => {
      // Created date range filtering
    });

    test('should search leads by company name', async ({ page }) => {
      await page.goto('/employee/crm/leads');
      await page.fill('[data-testid="search-input"]', 'Acme');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Verify search results
      await expect(page.locator('[data-testid="lead-row"]')).toContainText('Acme');
    });

    test('should search leads by contact email', async ({ page }) => {
      // Search by email
    });

    test('should sort leads by different columns', async ({ page }) => {
      await page.goto('/employee/crm/leads');

      // Sort by estimated value
      await page.click('[data-testid="sort-estimatedValue"]');
      // Verify descending order

      await page.click('[data-testid="sort-estimatedValue"]');
      // Verify ascending order
    });

    test('should export filtered leads', async ({ page }) => {
      // Export to CSV/Excel
    });
  });

  test.describe('Lead Detail & Editing', () => {
    test('should display all lead information', async ({ page }) => {
      await page.goto('/employee/crm/leads/[test-lead-id]');

      // Verify all sections visible
      await expect(page.locator('[data-testid="company-info-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="contact-info-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="bant-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-section"]')).toBeVisible();
    });

    test('should edit lead in inline mode', async ({ page }) => {
      await page.goto('/employee/crm/leads/[test-lead-id]');

      // Click edit
      await page.click('[data-testid="edit-lead"]');

      // Modify fields
      await page.fill('[data-testid="estimatedValue"]', '750000');
      await page.selectOption('[data-testid="tier"]', 'strategic');

      // Save
      await page.click('[data-testid="save-lead"]');

      // Verify changes saved
      await expect(page.locator('[data-testid="estimatedValue"]')).toContainText('$750,000');
      await expect(page.locator('[data-testid="tier"]')).toContainText('Strategic');

      // Verify activity logged
      await expect(page.locator('[data-testid="activity-timeline"]')).toContainText('updated');
    });

    test('should update lead status', async ({ page }) => {
      await page.goto('/employee/crm/leads/[test-lead-id]');

      // Change status
      await page.click('[data-testid="status-dropdown"]');
      await page.click('[data-testid="status-contacted"]');

      // Verify status changed
      await expect(page.locator('[data-testid="lead-status"]')).toContainText('Contacted');

      // Verify new activity created based on status
      await expect(page.locator('[data-testid="activity-list"]')).toContainText('Discovery Call');
    });

    test('should navigate between tabs', async ({ page }) => {
      await page.goto('/employee/crm/leads/[test-lead-id]');

      // Overview tab
      await page.click('[data-testid="tab-overview"]');
      await expect(page.locator('[data-testid="company-info-section"]')).toBeVisible();

      // Qualification tab
      await page.click('[data-testid="tab-qualification"]');
      await expect(page.locator('[data-testid="bant-section"]')).toBeVisible();

      // Activity tab
      await page.click('[data-testid="tab-activity"]');
      await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible();
    });
  });

  test.describe('BANT Qualification', () => {
    test('should update BANT scores', async ({ page }) => {
      await page.goto('/employee/crm/leads/[test-lead-id]');
      await page.click('[data-testid="tab-qualification"]');

      // Update Budget score
      await page.fill('[data-testid="bantBudget"]', '20');
      await page.fill('[data-testid="bantBudgetNotes"]', 'Confirmed $500K budget for Q1');

      // Update Authority score
      await page.fill('[data-testid="bantAuthority"]', '25');
      await page.fill('[data-testid="bantAuthorityNotes"]', 'VP with final decision authority');

      // Update Need score
      await page.fill('[data-testid="bantNeed"]', '22');
      await page.fill('[data-testid="bantNeedNotes"]', 'Critical need for 5 developers');

      // Update Timeline score
      await page.fill('[data-testid="bantTimeline"]', '18');
      await page.fill('[data-testid="bantTimelineNotes"]', 'Project starts in 6 weeks');

      // Save
      await page.click('[data-testid="save-bant"]');

      // Verify total score
      await expect(page.locator('[data-testid="bant-total"]')).toContainText('85');

      // Verify qualification status updated
      await expect(page.locator('[data-testid="qualification-status"]')).toContainText('Highly Qualified');
    });

    test('should auto-qualify lead when BANT threshold met', async ({ page }) => {
      // When BANT score >= 70, auto-change status to Qualified
    });
  });

  test.describe('Activity Management', () => {
    test('should display workplan activities', async ({ page }) => {
      await page.goto('/employee/crm/leads/[test-lead-id]');
      await page.click('[data-testid="tab-activity"]');

      // Verify workplan visible
      await expect(page.locator('[data-testid="workplan-progress"]')).toBeVisible();

      // Verify activities list
      await expect(page.locator('[data-testid="activity-item"]')).toHaveCount.greaterThan(0);
    });

    test('should complete an activity', async ({ page }) => {
      await page.goto('/employee/crm/leads/[test-lead-id]');
      await page.click('[data-testid="tab-activity"]');

      // Find first open activity
      const activity = page.locator('[data-testid="activity-item"][data-status="open"]').first();
      await activity.click();

      // Complete activity
      await page.click('[data-testid="complete-activity"]');
      await page.fill('[data-testid="outcome-notes"]', 'Completed research, company looks promising');
      await page.click('[data-testid="confirm-complete"]');

      // Verify activity marked complete
      await expect(activity.locator('[data-testid="activity-status"]')).toContainText('Completed');

      // Verify successor activity created
      await expect(page.locator('[data-testid="activity-item"][data-status="open"]')).toBeVisible();
    });

    test('should create manual activity', async ({ page }) => {
      await page.goto('/employee/crm/leads/[test-lead-id]');

      // Click log activity
      await page.click('[data-testid="log-activity"]');

      // Fill activity form
      await page.fill('[data-testid="activity-subject"]', 'Follow-up call scheduled');
      await page.selectOption('[data-testid="activity-type"]', 'call');
      await page.fill('[data-testid="activity-notes"]', 'Scheduled call for next Tuesday');
      await page.fill('[data-testid="activity-dueDate"]', '2024-12-10');

      // Save
      await page.click('[data-testid="save-activity"]');

      // Verify activity added
      await expect(page.locator('[data-testid="activity-timeline"]')).toContainText('Follow-up call');
    });

    test('should skip an activity', async ({ page }) => {
      // Skip with reason
    });

    test('should reassign an activity', async ({ page }) => {
      // Reassign to different user
    });
  });

  test.describe('Lead Conversion', () => {
    test('should convert qualified lead to deal', async ({ page }) => {
      await page.goto('/employee/crm/leads/[qualified-lead-id]');

      // Click convert
      await page.click('[data-testid="convert-lead"]');

      // Verify conversion dialog
      await expect(page.locator('[data-testid="convert-dialog"]')).toBeVisible();

      // Select create new account
      await page.click('[data-testid="create-new-account"]');

      // Fill deal details
      await page.fill('[data-testid="deal-title"]', 'Acme Corp - Staff Augmentation');
      await page.fill('[data-testid="deal-value"]', '500000');
      await page.selectOption('[data-testid="deal-stage"]', 'discovery');

      // Convert
      await page.click('[data-testid="confirm-convert"]');

      // Verify redirect to deal
      await expect(page).toHaveURL(/\/employee\/crm\/deals\/[\w-]+$/);

      // Verify deal created from lead
      await expect(page.locator('[data-testid="deal-title"]')).toContainText('Acme Corp');
      await expect(page.locator('[data-testid="deal-source"]')).toContainText('Lead Conversion');
    });

    test('should convert lead to existing account', async ({ page }) => {
      // Link to existing account instead of creating new
    });

    test('should prevent converting unqualified lead', async ({ page }) => {
      await page.goto('/employee/crm/leads/[new-lead-id]');

      // Convert button should be disabled or show warning
      await page.click('[data-testid="convert-lead"]');
      await expect(page.locator('[data-testid="qualification-warning"]')).toBeVisible();
    });
  });

  test.describe('Lead Loss', () => {
    test('should mark lead as lost with reason', async ({ page }) => {
      await page.goto('/employee/crm/leads/[test-lead-id]');

      // Mark as lost
      await page.click('[data-testid="mark-lost"]');

      // Select reason
      await page.selectOption('[data-testid="loss-reason"]', 'budget_constraints');
      await page.fill('[data-testid="loss-notes"]', 'Budget was cut for Q1');

      // Confirm
      await page.click('[data-testid="confirm-lost"]');

      // Verify status changed
      await expect(page.locator('[data-testid="lead-status"]')).toContainText('Lost');

      // Verify workplan canceled
      await expect(page.locator('[data-testid="workplan-status"]')).toContainText('Canceled');
    });
  });

  test.describe('Bulk Operations', () => {
    test('should bulk assign leads to owner', async ({ page }) => {
      await page.goto('/employee/crm/leads');

      // Select multiple leads
      await page.click('[data-testid="select-lead-1"]');
      await page.click('[data-testid="select-lead-2"]');
      await page.click('[data-testid="select-lead-3"]');

      // Bulk assign
      await page.click('[data-testid="bulk-actions"]');
      await page.click('[data-testid="bulk-assign"]');
      await page.selectOption('[data-testid="assign-to"]', 'user-id');
      await page.click('[data-testid="confirm-assign"]');

      // Verify assignment
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('3 leads assigned');
    });

    test('should bulk update lead status', async ({ page }) => {
      // Similar flow for status update
    });

    test('should bulk delete leads', async ({ page }) => {
      // Soft delete with confirmation
    });
  });

  test.describe('Lead Import', () => {
    test('should import leads from CSV', async ({ page }) => {
      await page.goto('/employee/crm/leads');

      // Click import
      await page.click('[data-testid="import-leads"]');

      // Upload file
      await page.setInputFiles('[data-testid="import-file"]', 'test-data/leads.csv');

      // Map columns
      await page.selectOption('[data-testid="map-companyName"]', 'Company');
      await page.selectOption('[data-testid="map-email"]', 'Email');

      // Import
      await page.click('[data-testid="start-import"]');

      // Verify results
      await expect(page.locator('[data-testid="import-results"]')).toContainText('10 leads imported');
    });
  });
});
```

---

### 1b. ACCOUNT

**Depends on:** Lead (leads convert to accounts)

#### Backend Checklist

- [ ] **Entity Config:** `src/lib/entities/crm/account.entity.ts`
- [ ] **Zod Schemas:** `src/lib/validations/account.ts`
- [ ] **tRPC Router Extensions:**
  - `getAccountById`
  - `listAccounts`
  - `createAccount`
  - `updateAccount`
  - `deleteAccount`
  - `getAccountContacts`
  - `getAccountDeals`
  - `getAccountJobs`
  - `getAccountActivities`

#### Frontend Checklist

- [ ] **Screen Definitions:**
  - `src/screens/crm/account-list.screen.ts`
  - `src/screens/crm/account-detail.screen.ts`
- [ ] **Page Wrappers**

#### E2E Test File: `tests/e2e/crm/account-complete-flow.spec.ts`

Key test scenarios:
- Create account manually
- Create account from lead conversion
- Add/edit contacts (POCs)
- View account's deals
- View account's job orders
- Account hierarchy (parent/child)
- Account status management
- Account activity logging

---

### 1c. CONTACT (Point of Contact)

**Depends on:** Account

#### E2E Test File: `tests/e2e/crm/contact-complete-flow.spec.ts`

Key test scenarios:
- Add contact to account
- Edit contact details
- Set primary contact
- Contact communication preferences
- Contact role/decision authority
- Contact activity history

---

### 1d. DEAL

**Depends on:** Lead, Account

#### E2E Test File: `tests/e2e/crm/deal-complete-flow.spec.ts`

Key test scenarios:
- Create deal from lead conversion
- Create deal manually for account
- Deal pipeline stages
- Deal value and probability
- Deal activity tracking
- Win/lose deal
- Deal forecasting

---

## Phase 2: ATS Module

### 2a. JOB ORDER

**Depends on:** Account (clients create jobs)

#### Backend Checklist

- [ ] **Entity Config:** `src/lib/entities/ats/job.entity.ts`
- [ ] **Workplan:** `job_fulfillment` template
- [ ] **tRPC Router:**
  - `getJobById`
  - `listJobs`
  - `createJob` (+ auto-create workplan)
  - `updateJob`
  - `closeJob`
  - `getJobSubmissions`
  - `getJobActivities`

#### E2E Test File: `tests/e2e/ats/job-complete-flow.spec.ts`

```typescript
test.describe('Job Order Management', () => {
  test.describe('Job Creation', () => {
    test('should create job with all details', async ({ page }) => {
      // Basic info
      // Requirements (skills, experience)
      // Compensation (rate, employment type)
      // Location (remote, onsite, hybrid)
      // Timeline
    });

    test('should create job from account', async ({ page }) => {
      // Navigate from account, pre-fill client info
    });

    test('should clone existing job', async ({ page }) => {
      // Clone with modifications
    });
  });

  test.describe('Job Fulfillment Workflow', () => {
    test('should progress through workplan activities', async ({ page }) => {
      // Review requirements
      // Source candidates
      // Screen candidates
      // Submit to client
    });

    test('should track submissions per job', async ({ page }) => {
      // View submissions
      // Submission status breakdown
    });
  });

  test.describe('Job Status Management', () => {
    test('should update job status', async ({ page }) => {
      // Open → In Progress → Filled → Closed
    });

    test('should put job on hold', async ({ page }) => {
      // Hold with reason
    });

    test('should cancel job', async ({ page }) => {
      // Cancel with reason
    });
  });
});
```

---

### 2b. CANDIDATE (Talent)

**Depends on:** None (independent)

#### E2E Test File: `tests/e2e/ats/candidate-complete-flow.spec.ts`

Key test scenarios:
- Create candidate with full profile
- Upload and parse resume
- Add skills, experience, education
- Work authorization details
- Compensation expectations
- Candidate source tracking
- Candidate status management
- View submission history
- Candidate activity timeline

---

### 2c. SUBMISSION

**Depends on:** Job, Candidate

#### E2E Test File: `tests/e2e/ats/submission-complete-flow.spec.ts`

```typescript
test.describe('Submission Management', () => {
  test.describe('Create Submission', () => {
    test('should submit candidate to job', async ({ page }) => {
      // From job: select candidate
      // From candidate: select job
      // Submission notes
    });

    test('should prevent duplicate submissions', async ({ page }) => {
      // Same candidate to same job
    });
  });

  test.describe('Submission Workflow', () => {
    test('should track submission through stages', async ({ page }) => {
      // Submitted → Client Review → Interview → Offer → Placed
    });

    test('should handle client feedback', async ({ page }) => {
      // Approved for interview
      // Rejected with reason
    });
  });

  test.describe('Interview Scheduling', () => {
    test('should schedule interview from submission', async ({ page }) => {
      // Schedule interview
      // Send calendar invite
      // Prepare candidate
    });
  });
});
```

---

### 2d. INTERVIEW

**Depends on:** Submission

#### E2E Test File: `tests/e2e/ats/interview-complete-flow.spec.ts`

---

### 2e. OFFER

**Depends on:** Submission, Interview

#### E2E Test File: `tests/e2e/ats/offer-complete-flow.spec.ts`

---

### 2f. PLACEMENT

**Depends on:** Submission, Offer

#### E2E Test File: `tests/e2e/ats/placement-complete-flow.spec.ts`

---

## Conversion Command

### `/convert-entity` - Complete Entity Conversion

```bash
/convert-entity [entity-name]
```

This command runs the complete conversion for one entity:

1. **Backend:**
   - Create/update entity config
   - Create/update Zod schemas
   - Create/update tRPC procedures
   - Add workplan integration

2. **Frontend:**
   - Create screen definitions
   - Create page wrappers
   - Register with navigation

3. **Testing:**
   - Generate E2E test file
   - Run tests
   - Generate coverage report

---

## Daily Workflow

### Converting One Entity Per Day

```
Morning (Backend):
├── Create entity config
├── Create Zod schemas
├── Create/update tRPC procedures
├── Add workplan integration
└── Test API with scripts

Afternoon (Frontend):
├── Create list screen definition
├── Create detail screen definition
├── Create page wrappers
├── Test UI manually
└── Fix any issues

Evening (Testing):
├── Write E2E tests
├── Run full test suite
├── Screenshot all states
├── Document any issues
└── Commit and push
```

---

## Testing Standards

### Test File Structure

```
tests/e2e/
├── crm/
│   ├── lead-complete-flow.spec.ts
│   ├── account-complete-flow.spec.ts
│   ├── contact-complete-flow.spec.ts
│   └── deal-complete-flow.spec.ts
├── ats/
│   ├── job-complete-flow.spec.ts
│   ├── candidate-complete-flow.spec.ts
│   ├── submission-complete-flow.spec.ts
│   ├── interview-complete-flow.spec.ts
│   ├── offer-complete-flow.spec.ts
│   └── placement-complete-flow.spec.ts
├── bench/
│   ├── hotlist-complete-flow.spec.ts
│   └── marketing-complete-flow.spec.ts
├── academy/
│   ├── course-complete-flow.spec.ts
│   ├── enrollment-complete-flow.spec.ts
│   └── certificate-complete-flow.spec.ts
└── integration/
    ├── lead-to-placement.spec.ts  (full cycle)
    └── cross-module.spec.ts
```

### Test Coverage Requirements

Each entity test file must cover:

1. **CRUD Operations** (Create, Read, Update, Delete)
2. **List Operations** (Pagination, Filtering, Sorting, Search)
3. **Detail View** (All tabs, all sections)
4. **Status Transitions** (All valid transitions)
5. **Workplan/Activities** (Progress, completion, successors)
6. **Bulk Operations** (If applicable)
7. **Integration Points** (Related entities)
8. **Error Handling** (Validation, permissions)
9. **Edge Cases** (Empty states, limits)

### Screenshot Requirements

Take screenshots at:
- Empty state
- List with data
- Detail view (each tab)
- Edit mode
- All dialogs/modals
- Error states
- Success states

```typescript
// Screenshot naming convention
await page.screenshot({
  path: `test-results/${module}/${entity}-${state}.png`
});
```

---

## Progress Tracking

### Master Checklist

| Entity | Config | Zod | tRPC | Workplan | List Screen | Detail Screen | E2E Tests | Status |
|--------|--------|-----|------|----------|-------------|---------------|-----------|--------|
| Lead | ✅ | 🔄 | 🔄 | ✅ | ✅ | ✅ | ⬜ | 40% |
| Account | ⬜ | ⬜ | 🔄 | ⬜ | ⬜ | ⬜ | ⬜ | 10% |
| Contact | ⬜ | ⬜ | 🔄 | N/A | ⬜ | ⬜ | ⬜ | 10% |
| Deal | ⬜ | ⬜ | 🔄 | ⬜ | ⬜ | ⬜ | ⬜ | 10% |
| Job | ⬜ | ⬜ | 🔄 | ✅ | ⬜ | ⬜ | ⬜ | 15% |
| Candidate | ⬜ | ⬜ | 🔄 | ⬜ | ⬜ | ⬜ | ⬜ | 10% |
| Submission | ⬜ | ⬜ | 🔄 | ✅ | ⬜ | ⬜ | ⬜ | 15% |
| Interview | ⬜ | ⬜ | 🔄 | N/A | ⬜ | ⬜ | ⬜ | 10% |
| Offer | ⬜ | ⬜ | 🔄 | N/A | ⬜ | ⬜ | ⬜ | 10% |
| Placement | ⬜ | ⬜ | 🔄 | ⬜ | ⬜ | ⬜ | ⬜ | 10% |

### Status Legend
- ✅ Complete
- 🔄 Partial/Exists but needs update
- ⬜ Not started
- N/A Not applicable
