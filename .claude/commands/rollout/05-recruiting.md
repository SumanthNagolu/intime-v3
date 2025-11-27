# Phase 4: Recruiting

## Component Overview

**Priority:** CRITICAL (Core Revenue)
**Dependencies:** Authentication (Phase 0)
**Blocks:** Bench Sales (Phase 5)

---

## Scope

### Database Tables
- `jobs` - Job postings
- `submissions` - Candidate submissions
- `interviews` - Interview scheduling
- `offers` - Offer management
- `placements` - Placement records
- `accounts` - Client accounts
- `user_profiles` - Candidate data

### Server Actions (TO CREATE)
- `src/app/actions/recruiting-jobs.ts` - Job CRUD
- `src/app/actions/recruiting-submissions.ts` - Submission workflow
- `src/app/actions/recruiting-interviews.ts` - Interview scheduling
- `src/app/actions/recruiting-offers.ts` - Offer management
- `src/app/actions/recruiting-placements.ts` - Placement tracking
- `src/app/actions/recruiting-accounts.ts` - Client accounts

### UI Components
- `src/components/recruiting/RecruiterDashboard.tsx`
- `src/components/recruiting/JobDetail.tsx`
- `src/components/recruiting/PipelineView.tsx`
- `src/components/recruiting/CandidateDetail.tsx`
- `src/components/recruiting/SubmissionBuilder.tsx`
- `src/components/recruiting/InterviewScheduler.tsx`
- `src/components/recruiting/OfferBuilder.tsx`
- `src/components/recruiting/PlacementWorkflow.tsx`
- `src/components/recruiting/AccountsList.tsx`
- `src/components/recruiting/AccountDetail.tsx`
- `src/components/recruiting/SourcingRoom.tsx`
- `src/components/recruiting/ScreeningRoom.tsx`

### Pages
- `src/app/employee/recruiting/dashboard/page.tsx`
- `src/app/employee/recruiting/jobs/page.tsx`
- `src/app/employee/recruiting/pipeline/page.tsx`

---

## Phase 1: Audit

### 1.1 Schema Check

Read and verify:
```
src/lib/db/schema/ats.ts
```

Check for:
- `jobs` table with status, client, requirements
- `submissions` with stage pipeline
- `interviews` with scheduling fields
- `offers` with compensation details
- `placements` with billing info

### 1.2 Component Inventory

Critical components to audit:
- RecruiterDashboard.tsx - Key metrics
- PipelineView.tsx - Kanban submission pipeline
- SubmissionBuilder.tsx - Submit candidate to job
- InterviewScheduler.tsx - Schedule interviews
- OfferBuilder.tsx - Generate offers

---

## Phase 2: Database Fixes

### 2.1 ATS Tables

```sql
-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Job info
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  responsibilities TEXT[],

  -- Client
  account_id UUID REFERENCES accounts(id),
  client_job_id TEXT, -- Client's internal ID

  -- Position details
  employment_type TEXT, -- 'full_time', 'contract', 'c2c', 'w2'
  location TEXT,
  remote_type TEXT, -- 'onsite', 'remote', 'hybrid'
  duration TEXT, -- For contracts
  visa_requirements TEXT[],

  -- Compensation
  bill_rate_min NUMERIC(10,2),
  bill_rate_max NUMERIC(10,2),
  pay_rate_min NUMERIC(10,2),
  pay_rate_max NUMERIC(10,2),

  -- Status
  status TEXT DEFAULT 'open', -- open, on_hold, filled, closed
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent

  -- Assignment
  assigned_recruiters UUID[],
  primary_recruiter_id UUID REFERENCES user_profiles(id),

  -- Tracking
  submissions_count INTEGER DEFAULT 0,
  interviews_count INTEGER DEFAULT 0,
  positions_total INTEGER DEFAULT 1,
  positions_filled INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id),
  closed_at TIMESTAMPTZ
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Pipeline stage
  stage TEXT DEFAULT 'sourced',
  -- sourced -> screened -> submitted -> client_review ->
  -- interview_scheduled -> interview_completed ->
  -- offer_extended -> offer_accepted -> placed | rejected

  -- Rates
  bill_rate NUMERIC(10,2),
  pay_rate NUMERIC(10,2),
  markup_percentage NUMERIC(5,2),

  -- Client submission
  submitted_to_client_at TIMESTAMPTZ,
  client_feedback TEXT,
  client_decision TEXT, -- 'pending', 'interview', 'rejected', 'offer'

  -- Assignment
  recruiter_id UUID REFERENCES user_profiles(id),

  -- Notes
  internal_notes TEXT,
  resume_version_url TEXT,

  -- Tracking
  rejection_reason TEXT,
  rejection_stage TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  submission_id UUID NOT NULL REFERENCES submissions(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Schedule
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  timezone TEXT,

  -- Type
  interview_type TEXT, -- 'phone', 'video', 'onsite', 'technical'
  round_number INTEGER DEFAULT 1,

  -- Location/Link
  location TEXT,
  meeting_link TEXT,

  -- Participants
  interviewers TEXT[], -- Names or emails

  -- Result
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  feedback TEXT,
  recommendation TEXT, -- 'strong_yes', 'yes', 'neutral', 'no', 'strong_no'
  next_steps TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  submission_id UUID NOT NULL REFERENCES submissions(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Compensation
  bill_rate NUMERIC(10,2),
  pay_rate NUMERIC(10,2),
  employment_type TEXT,

  -- Start date
  start_date DATE,
  end_date DATE, -- For contracts

  -- Status
  status TEXT DEFAULT 'draft', -- draft, sent, accepted, declined, expired
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  -- Document
  offer_letter_url TEXT,
  signed_offer_url TEXT,

  -- Notes
  terms TEXT,
  special_conditions TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Placements table
CREATE TABLE IF NOT EXISTS placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  offer_id UUID REFERENCES offers(id),
  submission_id UUID NOT NULL REFERENCES submissions(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  account_id UUID REFERENCES accounts(id),

  -- Active period
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active', -- active, completed, terminated

  -- Billing
  bill_rate NUMERIC(10,2) NOT NULL,
  pay_rate NUMERIC(10,2) NOT NULL,
  overtime_bill_rate NUMERIC(10,2),
  overtime_pay_rate NUMERIC(10,2),

  -- Assignment
  recruiter_id UUID REFERENCES user_profiles(id),
  account_manager_id UUID REFERENCES user_profiles(id),

  -- Tracking
  hours_worked NUMERIC(10,2) DEFAULT 0,
  total_billed NUMERIC(12,2) DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT
);
```

### 2.2 RLS Policies

```sql
-- Jobs: Recruiter access
CREATE POLICY "recruiter_jobs" ON jobs FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

-- Submissions: Assigned recruiter or org admin
CREATE POLICY "recruiter_submissions" ON submissions FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

-- Similar policies for interviews, offers, placements
```

### 2.3 Critical Indexes

```sql
CREATE INDEX idx_jobs_status ON jobs(status) WHERE status = 'open';
CREATE INDEX idx_jobs_account ON jobs(account_id);
CREATE INDEX idx_submissions_job ON submissions(job_id);
CREATE INDEX idx_submissions_stage ON submissions(stage);
CREATE INDEX idx_placements_active ON placements(status) WHERE status = 'active';
```

---

## Phase 3: Server Actions

### 3.1 Job Management

Create `src/app/actions/recruiting-jobs.ts`:

```typescript
'use server';

// List jobs with filters
export async function listJobsAction(filters?: {
  status?: string;
  accountId?: string;
  recruiterId?: string;
  search?: string;
  page?: number;
}): Promise<ActionResult<{ jobs: Job[]; total: number }>>

// Get job with submissions
export async function getJobAction(jobId: string): Promise<ActionResult<JobWithSubmissions>>

// Create job
export async function createJobAction(input: {
  title: string;
  description?: string;
  accountId?: string;
  employmentType: string;
  location?: string;
  billRateMin?: number;
  billRateMax?: number;
  requirements?: string[];
}): Promise<ActionResult<Job>>

// Update job
export async function updateJobAction(jobId: string, input: Partial<Job>): Promise<ActionResult<Job>>

// Change job status
export async function updateJobStatusAction(jobId: string, status: string): Promise<ActionResult<Job>>

// Assign recruiters
export async function assignRecruitersAction(jobId: string, recruiterIds: string[]): Promise<ActionResult<Job>>

// Clone job
export async function cloneJobAction(jobId: string): Promise<ActionResult<Job>>
```

### 3.2 Submission Pipeline

Create `src/app/actions/recruiting-submissions.ts`:

```typescript
'use server';

// List submissions
export async function listSubmissionsAction(filters?: {
  jobId?: string;
  stage?: string;
  recruiterId?: string;
}): Promise<ActionResult<Submission[]>>

// Get submission detail
export async function getSubmissionAction(submissionId: string): Promise<ActionResult<SubmissionWithDetails>>

// Create submission (source candidate to job)
export async function createSubmissionAction(input: {
  jobId: string;
  candidateId: string;
  billRate?: number;
  payRate?: number;
  notes?: string;
}): Promise<ActionResult<Submission>>

// Advance stage
export async function advanceSubmissionAction(
  submissionId: string,
  notes?: string
): Promise<ActionResult<Submission>>

// Reject submission
export async function rejectSubmissionAction(
  submissionId: string,
  reason: string,
  stage: string
): Promise<ActionResult<Submission>>

// Submit to client
export async function submitToclientAction(
  submissionId: string,
  resumeUrl?: string
): Promise<ActionResult<Submission>>

// Update client feedback
export async function updateClientFeedbackAction(
  submissionId: string,
  feedback: string,
  decision: string
): Promise<ActionResult<Submission>>

// Bulk actions
export async function bulkAdvanceSubmissionsAction(
  submissionIds: string[]
): Promise<ActionResult<void>>
```

### 3.3 Interview Scheduling

Create `src/app/actions/recruiting-interviews.ts`:

```typescript
'use server';

// List interviews
export async function listInterviewsAction(filters?: {
  submissionId?: string;
  candidateId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<Interview[]>>

// Schedule interview
export async function scheduleInterviewAction(input: {
  submissionId: string;
  scheduledAt: string;
  durationMinutes?: number;
  interviewType: string;
  interviewers?: string[];
  meetingLink?: string;
  location?: string;
}): Promise<ActionResult<Interview>>

// Update interview
export async function updateInterviewAction(
  interviewId: string,
  input: Partial<Interview>
): Promise<ActionResult<Interview>>

// Complete interview
export async function completeInterviewAction(
  interviewId: string,
  input: {
    feedback: string;
    recommendation: string;
    nextSteps?: string;
  }
): Promise<ActionResult<Interview>>

// Cancel interview
export async function cancelInterviewAction(
  interviewId: string,
  reason?: string
): Promise<ActionResult<Interview>>
```

### 3.4 Offer Management

Create `src/app/actions/recruiting-offers.ts`:

```typescript
'use server';

// List offers
export async function listOffersAction(filters?: {
  status?: string;
  candidateId?: string;
}): Promise<ActionResult<Offer[]>>

// Create offer
export async function createOfferAction(input: {
  submissionId: string;
  billRate: number;
  payRate: number;
  startDate: string;
  endDate?: string;
  terms?: string;
}): Promise<ActionResult<Offer>>

// Send offer
export async function sendOfferAction(offerId: string): Promise<ActionResult<Offer>>

// Mark offer accepted
export async function acceptOfferAction(offerId: string): Promise<ActionResult<Offer>>

// Mark offer declined
export async function declineOfferAction(offerId: string, reason?: string): Promise<ActionResult<Offer>>

// Generate offer letter
export async function generateOfferLetterAction(offerId: string): Promise<ActionResult<{ url: string }>>
```

### 3.5 Placement Tracking

Create `src/app/actions/recruiting-placements.ts`:

```typescript
'use server';

// List placements
export async function listPlacementsAction(filters?: {
  status?: string;
  recruiterId?: string;
  accountId?: string;
}): Promise<ActionResult<Placement[]>>

// Create placement (from offer)
export async function createPlacementAction(offerId: string): Promise<ActionResult<Placement>>

// Update placement
export async function updatePlacementAction(
  placementId: string,
  input: Partial<Placement>
): Promise<ActionResult<Placement>>

// End placement
export async function endPlacementAction(
  placementId: string,
  input: {
    endDate: string;
    reason?: string;
  }
): Promise<ActionResult<Placement>>

// Log hours
export async function logPlacementHoursAction(
  placementId: string,
  hours: number,
  weekOf: string
): Promise<ActionResult<void>>

// Get placement metrics
export async function getPlacementMetricsAction(): Promise<ActionResult<PlacementMetrics>>
```

---

## Phase 4: UI Integration

### 4.1 RecruiterDashboard.tsx

Wire metrics:
- Open jobs count
- Submissions by stage
- Interviews this week
- Active placements
- Revenue metrics

### 4.2 PipelineView.tsx

Kanban board implementation:
```typescript
const stages = [
  'sourced', 'screened', 'submitted', 'client_review',
  'interview_scheduled', 'interview_completed',
  'offer_extended', 'offer_accepted', 'placed'
];

const handleDragEnd = async (submissionId: string, newStage: string) => {
  const result = await advanceSubmissionAction(submissionId);
  // ...
};
```

### 4.3 SubmissionBuilder.tsx

Form to submit candidate:
- Select candidate
- Set rates
- Add notes
- Upload resume version
- Submit to client

### 4.4 InterviewScheduler.tsx

Calendar/scheduling UI:
- Date/time picker
- Duration
- Interview type
- Add interviewers
- Generate meeting link

### 4.5 OfferBuilder.tsx

Offer generation:
- Pull rates from submission
- Set start date
- Add terms
- Generate letter
- Send to candidate

---

## Phase 5: E2E Tests

### Test File: `tests/e2e/recruiting-workflows.spec.ts`

```typescript
test.describe('Recruiting Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'jr_rec@intime.com', 'TestPass123!');
  });

  // Jobs
  test('can view job list');
  test('can create new job');
  test('can update job details');
  test('can change job status');
  test('can assign recruiters to job');

  // Submissions
  test('can view pipeline');
  test('can create submission');
  test('can advance submission stage');
  test('can reject submission');
  test('can submit to client');
  test('can update client feedback');

  // Interviews
  test('can schedule interview');
  test('can update interview details');
  test('can complete interview with feedback');
  test('can cancel interview');

  // Offers
  test('can create offer');
  test('can send offer');
  test('can mark offer accepted');
  test('can mark offer declined');

  // Placements
  test('can create placement from offer');
  test('can view active placements');
  test('can log placement hours');
  test('can end placement');

  // Full workflow
  test('complete recruiting cycle: source -> place');
});
```

---

## Phase 6: Verification Checklist

### Database
- [ ] jobs table exists with RLS
- [ ] submissions table with stage pipeline
- [ ] interviews table exists
- [ ] offers table exists
- [ ] placements table exists
- [ ] All critical indexes created

### Server Actions
- [ ] Job CRUD operations work
- [ ] Submission pipeline advances correctly
- [ ] Interview scheduling works
- [ ] Offer workflow complete
- [ ] Placement creation from offer works
- [ ] Metrics calculations correct

### UI
- [ ] RecruiterDashboard shows real metrics
- [ ] PipelineView with drag-and-drop
- [ ] SubmissionBuilder form works
- [ ] InterviewScheduler functional
- [ ] OfferBuilder generates offers
- [ ] All loading/error states

### E2E Tests
- [ ] All recruiting scenarios passing
- [ ] Full workflow test passes

---

## Next Step

When complete, run:
```
Execute /rollout/06-bench
```
