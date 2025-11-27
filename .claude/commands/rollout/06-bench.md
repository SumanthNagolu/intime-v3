# Phase 5: Bench Sales

## Component Overview

**Priority:** HIGH
**Dependencies:** Recruiting (Phase 4)
**Blocks:** None

---

## Scope

### Database Tables
- `bench_metadata` - Consultant bench status
- `external_jobs` - Scraped external jobs
- `job_sources` - Job board configurations
- `bench_submissions` - Vendor submissions
- `hotlists` - Hotlist templates
- `hotlist_sends` - Hotlist distribution history
- `immigration_cases` - Visa tracking

### Server Actions (TO CREATE)
- `src/app/actions/bench-consultants.ts` - Bench management
- `src/app/actions/bench-jobs.ts` - External job management
- `src/app/actions/bench-submissions.ts` - Vendor submissions
- `src/app/actions/bench-hotlists.ts` - Hotlist CRUD
- `src/app/actions/bench-immigration.ts` - Visa tracking

### UI Components
- `src/components/bench/BenchDashboard.tsx`
- `src/components/bench/BenchTalentList.tsx`
- `src/components/bench/BenchTalentDetail.tsx`
- `src/components/bench/JobCollector.tsx`
- `src/components/bench/JobHuntRoom.tsx`
- `src/components/bench/HotlistBuilder.tsx`

### Pages
- `src/app/employee/bench/dashboard/page.tsx`

---

## Phase 1: Audit

### 1.1 Schema Check

Read and verify:
```
src/lib/db/schema/bench.ts
```

Check for:
- `bench_metadata` with days_on_bench
- `external_jobs` with source tracking
- `hotlists` template structure
- `immigration_cases` visa status

### 1.2 Component Inventory

Critical bench components:
- BenchDashboard.tsx - Bench metrics
- BenchTalentList.tsx - Consultants list
- JobCollector.tsx - External jobs view
- HotlistBuilder.tsx - Create/send hotlists

---

## Phase 2: Database Fixes

### 2.1 Bench Tables

```sql
-- Bench metadata (extends user_profiles)
CREATE TABLE IF NOT EXISTS bench_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Bench status
  bench_start_date DATE,
  days_on_bench INTEGER GENERATED ALWAYS AS (
    CASE WHEN bench_start_date IS NOT NULL
      THEN EXTRACT(DAY FROM CURRENT_DATE - bench_start_date)::INTEGER
      ELSE 0
    END
  ) STORED,

  -- Marketing status
  marketing_status TEXT DEFAULT 'active', -- active, paused, placed
  priority_level TEXT DEFAULT 'normal', -- low, normal, high, critical

  -- Rates
  expected_rate_min NUMERIC(10,2),
  expected_rate_max NUMERIC(10,2),
  floor_rate NUMERIC(10,2),

  -- Preferences
  preferred_locations TEXT[],
  remote_preference TEXT, -- onsite, remote, hybrid
  notice_period TEXT,

  -- Tracking
  last_submission_at TIMESTAMPTZ,
  total_submissions INTEGER DEFAULT 0,

  -- Audit
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- External jobs (scraped from job boards)
CREATE TABLE IF NOT EXISTS external_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Source info
  source TEXT NOT NULL, -- 'dice', 'indeed', 'linkedin', etc.
  external_id TEXT, -- ID from source
  source_url TEXT,

  -- Job details
  title TEXT NOT NULL,
  company_name TEXT,
  location TEXT,
  description TEXT,

  -- Requirements
  skills TEXT[],
  experience_years INTEGER,
  visa_requirements TEXT[],

  -- Rates
  rate_info TEXT,

  -- Vendor
  posted_by TEXT, -- Vendor/recruiter name
  contact_email TEXT,
  contact_phone TEXT,

  -- Status
  status TEXT DEFAULT 'new', -- new, reviewed, matched, submitted, archived
  is_relevant BOOLEAN DEFAULT true,

  -- Matching
  matched_candidates UUID[],

  -- Audit
  posted_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES user_profiles(id)
);

-- Bench submissions (to vendors)
CREATE TABLE IF NOT EXISTS bench_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  external_job_id UUID REFERENCES external_jobs(id),

  -- Vendor info
  vendor_name TEXT NOT NULL,
  vendor_email TEXT,
  vendor_phone TEXT,

  -- Submission details
  submitted_at TIMESTAMPTZ DEFAULT now(),
  rate_submitted NUMERIC(10,2),
  resume_url TEXT,

  -- Status
  status TEXT DEFAULT 'submitted', -- submitted, shortlisted, interview, rejected, placed
  vendor_feedback TEXT,

  -- Tracking
  follow_up_date DATE,
  last_follow_up_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES user_profiles(id)
);

-- Hotlists
CREATE TABLE IF NOT EXISTS hotlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  name TEXT NOT NULL,
  description TEXT,

  -- Template
  email_subject TEXT,
  email_body TEXT,

  -- Candidates
  candidate_ids UUID[],

  -- Stats
  total_sends INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hotlist sends
CREATE TABLE IF NOT EXISTS hotlist_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotlist_id UUID NOT NULL REFERENCES hotlists(id),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Recipients
  recipient_emails TEXT[] NOT NULL,
  recipient_count INTEGER,

  -- Content
  subject TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Status
  sent_at TIMESTAMPTZ DEFAULT now(),
  responses INTEGER DEFAULT 0,

  -- Tracking
  sent_by UUID REFERENCES user_profiles(id)
);

-- Immigration cases
CREATE TABLE IF NOT EXISTS immigration_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Visa info
  visa_type TEXT NOT NULL, -- H1B, GC, OPT, CPT, TN, L1
  current_status TEXT, -- active, pending, approved, denied, expired

  -- Dates
  start_date DATE,
  expiry_date DATE,
  days_until_expiry INTEGER GENERATED ALWAYS AS (
    CASE WHEN expiry_date IS NOT NULL
      THEN EXTRACT(DAY FROM expiry_date - CURRENT_DATE)::INTEGER
      ELSE NULL
    END
  ) STORED,

  -- Case details
  case_number TEXT,
  attorney_name TEXT,
  attorney_email TEXT,

  -- Employer
  sponsor_employer TEXT,
  job_title TEXT,

  -- Documents
  documents JSONB DEFAULT '[]',

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 RLS Policies

```sql
-- Bench sales team access
CREATE POLICY "bench_access" ON bench_metadata FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

CREATE POLICY "bench_external_jobs" ON external_jobs FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

CREATE POLICY "bench_submissions" ON bench_submissions FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

CREATE POLICY "bench_hotlists" ON hotlists FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

CREATE POLICY "bench_immigration" ON immigration_cases FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);
```

### 2.3 Indexes

```sql
CREATE INDEX idx_bench_days ON bench_metadata(days_on_bench DESC);
CREATE INDEX idx_bench_status ON bench_metadata(marketing_status);
CREATE INDEX idx_external_jobs_status ON external_jobs(status) WHERE status = 'new';
CREATE INDEX idx_immigration_expiry ON immigration_cases(expiry_date) WHERE expiry_date IS NOT NULL;
```

---

## Phase 3: Server Actions

### 3.1 Bench Consultant Management

Create `src/app/actions/bench-consultants.ts`:

```typescript
'use server';

// List bench consultants
export async function listBenchConsultantsAction(filters?: {
  status?: string;
  minDaysOnBench?: number;
  skills?: string[];
  priority?: string;
}): Promise<ActionResult<BenchConsultant[]>>

// Get consultant detail
export async function getBenchConsultantAction(
  userId: string
): Promise<ActionResult<BenchConsultantWithHistory>>

// Update bench status
export async function updateBenchStatusAction(userId: string, input: {
  marketingStatus?: string;
  priorityLevel?: string;
  expectedRateMin?: number;
  expectedRateMax?: number;
  floorRate?: number;
  preferredLocations?: string[];
  remotePreference?: string;
}): Promise<ActionResult<BenchMetadata>>

// Mark consultant as placed
export async function markConsultantPlacedAction(
  userId: string,
  placementId: string
): Promise<ActionResult<void>>

// Get bench alerts (30/60/90 day warnings)
export async function getBenchAlertsAction(): Promise<ActionResult<BenchAlert[]>>
```

### 3.2 External Job Management

Create `src/app/actions/bench-jobs.ts`:

```typescript
'use server';

// List external jobs
export async function listExternalJobsAction(filters?: {
  status?: string;
  source?: string;
  skills?: string[];
  search?: string;
  page?: number;
}): Promise<ActionResult<{ jobs: ExternalJob[]; total: number }>>

// Get external job detail
export async function getExternalJobAction(jobId: string): Promise<ActionResult<ExternalJob>>

// Mark job reviewed
export async function reviewExternalJobAction(jobId: string, isRelevant: boolean): Promise<ActionResult<void>>

// Match candidates to job
export async function matchCandidatesAction(
  jobId: string,
  candidateIds: string[]
): Promise<ActionResult<void>>

// Archive job
export async function archiveExternalJobAction(jobId: string): Promise<ActionResult<void>>

// Refresh jobs from source
export async function refreshJobSourceAction(source: string): Promise<ActionResult<{ count: number }>>
```

### 3.3 Vendor Submissions

Create `src/app/actions/bench-submissions.ts`:

```typescript
'use server';

// List vendor submissions
export async function listVendorSubmissionsAction(filters?: {
  candidateId?: string;
  externalJobId?: string;
  status?: string;
}): Promise<ActionResult<BenchSubmission[]>>

// Create vendor submission
export async function createVendorSubmissionAction(input: {
  candidateId: string;
  externalJobId?: string;
  vendorName: string;
  vendorEmail?: string;
  rateSubmitted?: number;
  resumeUrl?: string;
}): Promise<ActionResult<BenchSubmission>>

// Update submission status
export async function updateVendorSubmissionAction(
  submissionId: string,
  input: {
    status?: string;
    vendorFeedback?: string;
    followUpDate?: string;
  }
): Promise<ActionResult<BenchSubmission>>

// Log follow-up
export async function logFollowUpAction(
  submissionId: string,
  notes: string
): Promise<ActionResult<void>>

// Get submission metrics
export async function getSubmissionMetricsAction(
  candidateId?: string
): Promise<ActionResult<SubmissionMetrics>>
```

### 3.4 Hotlist Management

Create `src/app/actions/bench-hotlists.ts`:

```typescript
'use server';

// List hotlists
export async function listHotlistsAction(): Promise<ActionResult<Hotlist[]>>

// Get hotlist with candidates
export async function getHotlistAction(hotlistId: string): Promise<ActionResult<HotlistWithCandidates>>

// Create hotlist
export async function createHotlistAction(input: {
  name: string;
  description?: string;
  emailSubject?: string;
  emailBody?: string;
  candidateIds: string[];
}): Promise<ActionResult<Hotlist>>

// Update hotlist
export async function updateHotlistAction(
  hotlistId: string,
  input: Partial<Hotlist>
): Promise<ActionResult<Hotlist>>

// Add candidates to hotlist
export async function addToHotlistAction(
  hotlistId: string,
  candidateIds: string[]
): Promise<ActionResult<void>>

// Remove candidate from hotlist
export async function removeFromHotlistAction(
  hotlistId: string,
  candidateId: string
): Promise<ActionResult<void>>

// Send hotlist
export async function sendHotlistAction(
  hotlistId: string,
  recipientEmails: string[]
): Promise<ActionResult<HotlistSend>>

// Get hotlist analytics
export async function getHotlistAnalyticsAction(
  hotlistId: string
): Promise<ActionResult<HotlistAnalytics>>
```

### 3.5 Immigration Tracking

Create `src/app/actions/bench-immigration.ts`:

```typescript
'use server';

// List immigration cases
export async function listImmigrationCasesAction(filters?: {
  visaType?: string;
  status?: string;
  expiringWithinDays?: number;
}): Promise<ActionResult<ImmigrationCase[]>>

// Get case detail
export async function getImmigrationCaseAction(caseId: string): Promise<ActionResult<ImmigrationCase>>

// Create immigration case
export async function createImmigrationCaseAction(input: {
  candidateId: string;
  visaType: string;
  startDate?: string;
  expiryDate?: string;
  caseNumber?: string;
  sponsorEmployer?: string;
}): Promise<ActionResult<ImmigrationCase>>

// Update case
export async function updateImmigrationCaseAction(
  caseId: string,
  input: Partial<ImmigrationCase>
): Promise<ActionResult<ImmigrationCase>>

// Get expiring cases (alerts)
export async function getExpiringCasesAction(
  withinDays: number
): Promise<ActionResult<ImmigrationCase[]>>

// Upload document
export async function uploadCaseDocumentAction(
  caseId: string,
  document: {
    name: string;
    type: string;
    url: string;
  }
): Promise<ActionResult<void>>
```

---

## Phase 4: UI Integration

### 4.1 BenchDashboard.tsx

Wire metrics:
- Total on bench
- 30/60/90 day alerts
- Submissions this week
- Recent placements
- Hotlist performance

### 4.2 BenchTalentList.tsx

Connect to consultants:
```typescript
const [consultants, setConsultants] = useState<BenchConsultant[]>([]);

useEffect(() => {
  listBenchConsultantsAction(filters).then(result => {
    if (result.success) setConsultants(result.data);
  });
}, [filters]);
```

Visual indicators:
- Days on bench badges (green/yellow/red)
- Priority flags
- Recent activity

### 4.3 JobCollector.tsx

External jobs view:
- Source filter
- Skills filter
- Match candidates button
- Quick submit action

### 4.4 HotlistBuilder.tsx

Hotlist creation:
- Select consultants
- Edit template
- Preview
- Send to emails

---

## Phase 5: E2E Tests

### Test File: `tests/e2e/bench-workflows.spec.ts`

```typescript
test.describe('Bench Sales Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'jr_bs@intime.com', 'TestPass123!');
  });

  // Bench Consultants
  test('can view bench consultants');
  test('can filter by days on bench');
  test('can update consultant marketing status');
  test('can set consultant rates');
  test('30/60/90 day alerts display correctly');

  // External Jobs
  test('can view external jobs');
  test('can filter jobs by source');
  test('can mark job as reviewed');
  test('can match candidates to job');
  test('can archive irrelevant jobs');

  // Vendor Submissions
  test('can create vendor submission');
  test('can update submission status');
  test('can log follow-up');
  test('submission metrics display correctly');

  // Hotlists
  test('can create hotlist');
  test('can add candidates to hotlist');
  test('can preview hotlist');
  test('can send hotlist to vendors');
  test('can view send history');

  // Immigration
  test('can view immigration cases');
  test('can create immigration case');
  test('expiring visas show alerts');
  test('can upload case documents');

  // Access Control
  test('bench_sales can access bench module');
  test('recruiter can view bench consultants');
});
```

---

## Phase 6: Verification Checklist

### Database
- [ ] bench_metadata table exists with computed columns
- [ ] external_jobs table exists
- [ ] bench_submissions table exists
- [ ] hotlists and hotlist_sends exist
- [ ] immigration_cases table exists
- [ ] All RLS policies active
- [ ] Performance indexes created

### Server Actions
- [ ] Bench consultant CRUD works
- [ ] Days on bench calculation correct
- [ ] External job management works
- [ ] Vendor submission workflow complete
- [ ] Hotlist create/send works
- [ ] Immigration case tracking works
- [ ] Expiry alerts work

### UI
- [ ] BenchDashboard shows real metrics
- [ ] BenchTalentList with filtering
- [ ] JobCollector displays external jobs
- [ ] HotlistBuilder full workflow
- [ ] Immigration alerts display
- [ ] All loading/error states

### E2E Tests
- [ ] All bench scenarios passing

---

## Next Step

When complete, run:
```
Execute /rollout/07-academy
```
