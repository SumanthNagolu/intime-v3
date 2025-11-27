# Phase 7: Client Portal

## Component Overview

**Priority:** MEDIUM
**Dependencies:** Recruiting (Phase 4)
**Blocks:** None

---

## Scope

### Database Tables
- `accounts` - Client companies
- `jobs` - Client's job postings
- `submissions` - Submissions for client review
- `placements` - Active placements at client
- `invoices` - Client billing
- `timesheets` - Timesheet approvals

### Server Actions (TO CREATE)
- `src/app/actions/client-dashboard.ts` - Client view data
- `src/app/actions/client-jobs.ts` - Job management
- `src/app/actions/client-submissions.ts` - Review submissions
- `src/app/actions/client-timesheets.ts` - Approve timesheets
- `src/app/actions/client-billing.ts` - View invoices

### UI Components
- `src/components/client/ClientDashboard.tsx`
- `src/components/client/ClientJobsList.tsx`
- `src/components/client/ClientJobDetail.tsx`
- `src/components/client/ClientPipeline.tsx`

### Pages
- `src/app/client/dashboard/page.tsx`
- `src/app/auth/client/page.tsx`

---

## Phase 1: Audit

### 1.1 Schema Check

Client-specific fields:
- `user_profiles.client_*` fields
- `accounts` table for client companies
- `jobs.account_id` linking
- `submissions` client view

### 1.2 Component Inventory

Client-facing components:
- ClientDashboard.tsx - Overview
- ClientJobsList.tsx - Their jobs
- ClientPipeline.tsx - Submission reviews

---

## Phase 2: Database Fixes

### 2.1 Client Tables

```sql
-- Accounts (already exists, verify structure)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Company info
  company_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,

  -- Contact
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,

  -- Billing
  billing_address JSONB,
  payment_terms INTEGER DEFAULT 30,
  default_markup_percentage NUMERIC(5,2),

  -- Relationship
  tier TEXT DEFAULT 'standard', -- standard, preferred, strategic
  status TEXT DEFAULT 'active', -- active, inactive, churned

  -- Assignment
  account_manager_id UUID REFERENCES user_profiles(id),

  -- Stats
  total_jobs INTEGER DEFAULT 0,
  total_placements INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Client users (link to accounts)
-- Using user_profiles.client_* fields

-- Client job access (which clients can see which jobs)
-- Jobs already have account_id FK

-- Timesheets
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id UUID NOT NULL REFERENCES placements(id),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Period
  week_starting DATE NOT NULL,
  week_ending DATE NOT NULL,

  -- Hours
  hours JSONB NOT NULL, -- {mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0}
  total_hours NUMERIC(5,2) NOT NULL,
  overtime_hours NUMERIC(5,2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft', -- draft, submitted, approved, rejected
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES user_profiles(id),
  rejection_reason TEXT,

  -- Notes
  notes TEXT,

  UNIQUE(placement_id, week_starting)
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Invoice details
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,

  -- Amounts
  subtotal NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,

  -- Status
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Line items stored in separate table or JSONB
  line_items JSONB,

  -- Files
  pdf_url TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);
```

### 2.2 RLS Policies (Client-Specific)

```sql
-- Clients see their own account
CREATE POLICY "client_own_account" ON accounts FOR SELECT USING (
  id = (SELECT client_account_id FROM user_profiles WHERE auth_id = auth.uid())
);

-- Clients see jobs for their account
CREATE POLICY "client_own_jobs" ON jobs FOR SELECT USING (
  account_id = (SELECT client_account_id FROM user_profiles WHERE auth_id = auth.uid())
);

-- Clients see submissions for their jobs
CREATE POLICY "client_job_submissions" ON submissions FOR SELECT USING (
  job_id IN (
    SELECT id FROM jobs
    WHERE account_id = (SELECT client_account_id FROM user_profiles WHERE auth_id = auth.uid())
  )
);

-- Clients see placements at their company
CREATE POLICY "client_placements" ON placements FOR SELECT USING (
  account_id = (SELECT client_account_id FROM user_profiles WHERE auth_id = auth.uid())
);

-- Clients see and approve timesheets for their placements
CREATE POLICY "client_timesheets" ON timesheets FOR ALL USING (
  placement_id IN (
    SELECT id FROM placements
    WHERE account_id = (SELECT client_account_id FROM user_profiles WHERE auth_id = auth.uid())
  )
);

-- Clients see their invoices
CREATE POLICY "client_invoices" ON invoices FOR SELECT USING (
  account_id = (SELECT client_account_id FROM user_profiles WHERE auth_id = auth.uid())
);
```

### 2.3 Add client_account_id to user_profiles

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS client_account_id UUID REFERENCES accounts(id);
```

---

## Phase 3: Server Actions

### 3.1 Client Dashboard

Create `src/app/actions/client-dashboard.ts`:

```typescript
'use server';

// Get client dashboard data
export async function getClientDashboardAction(): Promise<ActionResult<ClientDashboard>>

interface ClientDashboard {
  accountInfo: {
    companyName: string;
    tier: string;
    accountManager: { name: string; email: string };
  };
  metrics: {
    activeJobs: number;
    pendingSubmissions: number;
    activePlacements: number;
    pendingTimesheets: number;
  };
  recentActivity: ActivityItem[];
}

// Get account details
export async function getClientAccountAction(): Promise<ActionResult<Account>>
```

### 3.2 Client Job Management

Create `src/app/actions/client-jobs.ts`:

```typescript
'use server';

// List client's jobs
export async function listClientJobsAction(filters?: {
  status?: string;
  search?: string;
}): Promise<ActionResult<Job[]>>

// Get job detail with submissions
export async function getClientJobAction(jobId: string): Promise<ActionResult<JobWithSubmissions>>

// Request new job (client creates job request)
export async function requestJobAction(input: {
  title: string;
  description: string;
  requirements?: string[];
  positionsNeeded: number;
  urgency: string;
}): Promise<ActionResult<Job>>

// Close job
export async function closeClientJobAction(jobId: string): Promise<ActionResult<Job>>
```

### 3.3 Submission Review

Create `src/app/actions/client-submissions.ts`:

```typescript
'use server';

// List submissions for client's jobs
export async function listClientSubmissionsAction(filters?: {
  jobId?: string;
  status?: string;
}): Promise<ActionResult<Submission[]>>

// Get submission detail (candidate info)
export async function getClientSubmissionAction(
  submissionId: string
): Promise<ActionResult<SubmissionForClient>>

// Provide feedback on submission
export async function reviewSubmissionAction(
  submissionId: string,
  input: {
    decision: 'interview' | 'reject' | 'hold';
    feedback: string;
  }
): Promise<ActionResult<Submission>>

// Request interview
export async function requestInterviewAction(
  submissionId: string,
  input: {
    preferredDates: string[];
    interviewType: string;
    interviewers?: string[];
    notes?: string;
  }
): Promise<ActionResult<void>>
```

### 3.4 Timesheet Management

Create `src/app/actions/client-timesheets.ts`:

```typescript
'use server';

// List pending timesheets
export async function listPendingTimesheetsAction(): Promise<ActionResult<Timesheet[]>>

// List all timesheets
export async function listClientTimesheetsAction(filters?: {
  placementId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<Timesheet[]>>

// Get timesheet detail
export async function getTimesheetAction(timesheetId: string): Promise<ActionResult<Timesheet>>

// Approve timesheet
export async function approveTimesheetAction(timesheetId: string): Promise<ActionResult<Timesheet>>

// Reject timesheet
export async function rejectTimesheetAction(
  timesheetId: string,
  reason: string
): Promise<ActionResult<Timesheet>>

// Bulk approve timesheets
export async function bulkApproveTimesheetsAction(
  timesheetIds: string[]
): Promise<ActionResult<void>>
```

### 3.5 Billing

Create `src/app/actions/client-billing.ts`:

```typescript
'use server';

// List invoices
export async function listClientInvoicesAction(filters?: {
  status?: string;
  year?: number;
}): Promise<ActionResult<Invoice[]>>

// Get invoice detail
export async function getClientInvoiceAction(invoiceId: string): Promise<ActionResult<Invoice>>

// Download invoice PDF
export async function downloadInvoiceAction(invoiceId: string): Promise<ActionResult<{ url: string }>>

// Get billing summary
export async function getBillingSummaryAction(): Promise<ActionResult<BillingSummary>>
```

---

## Phase 4: UI Integration

### 4.1 ClientDashboard.tsx

Client overview:
- Active jobs count
- Pending reviews count
- Active placements
- Recent activity feed
- Account manager contact

### 4.2 ClientJobsList.tsx

Job listing for client:
- Their open positions
- Submission counts per job
- Job status
- Request new job button

### 4.3 ClientPipeline.tsx

Submission review interface:
- Candidates submitted
- Resume viewer
- Feedback form
- Interview request

### 4.4 Timesheet Approval

Timesheet queue:
- List of pending timesheets
- Hours breakdown
- Approve/reject buttons
- Bulk actions

---

## Phase 5: E2E Tests

### Test File: `tests/e2e/client-workflows.spec.ts`

```typescript
test.describe('Client Portal', () => {

  // Need a client test user
  const CLIENT_USER = {
    email: 'client@test-company.com',
    password: 'TestPass123!'
  };

  test.beforeEach(async ({ page }) => {
    await login(page, CLIENT_USER.email, CLIENT_USER.password);
  });

  test.describe('Dashboard', () => {
    test('can view client dashboard');
    test('dashboard shows correct metrics');
    test('can see account manager info');
  });

  test.describe('Jobs', () => {
    test('can view own jobs');
    test('can request new job');
    test('can see submission count per job');
    test('cannot see other client jobs');
  });

  test.describe('Submissions', () => {
    test('can view submissions for own jobs');
    test('can view candidate details');
    test('can provide feedback on submission');
    test('can request interview');
    test('can reject submission');
  });

  test.describe('Placements', () => {
    test('can view active placements');
    test('can see placement details');
  });

  test.describe('Timesheets', () => {
    test('can view pending timesheets');
    test('can approve timesheet');
    test('can reject timesheet with reason');
    test('can bulk approve timesheets');
    test('can view timesheet history');
  });

  test.describe('Billing', () => {
    test('can view invoices');
    test('can download invoice PDF');
    test('can see billing summary');
  });

  test.describe('Access Control', () => {
    test('client cannot access recruiter pages');
    test('client cannot see other clients data');
    test('client cannot modify submissions directly');
  });
});
```

---

## Phase 6: Verification Checklist

### Database
- [ ] accounts table complete
- [ ] client_account_id column in user_profiles
- [ ] timesheets table exists
- [ ] invoices table exists
- [ ] RLS policies filter by client account
- [ ] Clients isolated from other clients

### Server Actions
- [ ] getClientDashboardAction returns correct data
- [ ] Job listing shows only client's jobs
- [ ] Submission review works
- [ ] Interview request creates record
- [ ] Timesheet approval workflow works
- [ ] Invoice listing and download work

### UI
- [ ] ClientDashboard shows real metrics
- [ ] ClientJobsList shows client's jobs
- [ ] Submission review interface works
- [ ] Timesheet approval UI functional
- [ ] Invoice download works
- [ ] All loading/error states

### E2E Tests
- [ ] All client scenarios passing
- [ ] Multi-client isolation verified

---

## Completion

The client portal is the final core component. After completing this phase:

1. Run full E2E suite: `pnpm playwright test`
2. Performance testing
3. Security review
4. Production deployment

---

## Production Checklist

After all 8 phases complete:

- [ ] All E2E tests passing
- [ ] No mock data in production code
- [ ] RLS verified on all tables
- [ ] Audit logging complete
- [ ] Performance acceptable
- [ ] Security review passed
- [ ] Documentation updated
- [ ] Deploy to production
