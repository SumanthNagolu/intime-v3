# WAVE 4: ATS Pipeline - Implementation Plan

## Overview

This plan transforms InTime v3's ATS pipeline into an enterprise-grade recruiting system. WAVE 4 consists of 6 issues spanning the complete recruiting workflow: Job → Submission → Interview → Offer → Placement → Onboarding.

**Critical Discovery:** OFFERS-01 is already fully implemented. This plan verifies it and focuses implementation effort on the 5 remaining issues.

**Dependencies:** All Wave 3 dependencies (COMPLIANCE-01, CONTRACTS-01, RATES-01) are COMPLETE.

## Current State Analysis

| Issue | Schema | tRPC Router | UI | Status |
|-------|--------|-------------|-----|--------|
| JOBS-01 | Exists | 14 procedures | Complete | Needs migration columns |
| SUBMISSIONS-01 | Exists | 8 procedures | Complete | Needs contact_id migration |
| INTERVIEWS-01 | Exists | 9 procedures | Complete | Needs multi-interviewer |
| OFFERS-01 | Complete | 7 procedures | Complete | **VERIFY ONLY** |
| PLACEMENTS-01 | Exists | 8 procedures | Complete | Needs contact consolidation |
| ONBOARDING-01 | Partial | Missing | Missing | Employee onboarding needed |

## Desired End State

After WAVE 4 completion:
1. All ATS entities use unified `contact_id` (no `candidate_id`/`consultant_id` legacy refs)
2. All ATS entities reference `companies(id)` for client/vendor tracking
3. Multi-interviewer support with scorecard-based feedback
4. Complete placement change order tracking
5. Employee onboarding workflow operational
6. All status transitions enforced via state machines
7. Full audit trail via `entity_history`

### Key Verification Points
- [ ] No `candidate_id` columns remain in active use
- [ ] All FK references point to `contacts(id)` or `companies(id)`
- [ ] RTR (Right to Represent) tracking operational
- [ ] Interview scorecards configurable per job/client
- [ ] Placement extensions tracked via change orders
- [ ] Employee onboarding checklists functional

## What We're NOT Doing

- **NOT** reimplementing OFFERS-01 (already production-ready)
- **NOT** building timesheet/invoice/payroll (WAVE 5)
- **NOT** building campaign automation (WAVE 6)
- **NOT** creating new UI patterns (using existing PCF list views)
- **NOT** changing job intake wizard structure (only adding fields)

---

## Execution Strategy

### Parallel vs Sequential Execution

```
                     ┌─────────────────┐
                     │  PHASE 0        │
                     │  Verify OFFERS  │  (1 hour)
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │  PHASE 1        │
                     │  JOBS-01        │  (2-3 days)
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │  PHASE 2        │
                     │  SUBMISSIONS-01 │  (3-4 days)
                     └────────┬────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
   ┌────────▼────────┐       │        ┌────────▼────────┐
   │  PHASE 3A       │       │        │  PHASE 3B       │
   │  INTERVIEWS-01  │◄──────┴───────►│  PLACEMENTS-01  │
   │  (2-3 days)     │   PARALLEL     │  (2-3 days)     │
   └────────┬────────┘                └────────┬────────┘
            │                                  │
            └─────────────────┬────────────────┘
                              │
                     ┌────────▼────────┐
                     │  PHASE 4        │
                     │  ONBOARDING-01  │  (2-3 days)
                     └─────────────────┘
```

### Summary
| Phase | Issue | Can Run | Effort | Blocking |
|-------|-------|---------|--------|----------|
| 0 | OFFERS-01 | Standalone | 1 hour | None |
| 1 | JOBS-01 | Sequential | 2-3 days | None after Phase 0 |
| 2 | SUBMISSIONS-01 | Sequential | 3-4 days | After JOBS-01 |
| 3A | INTERVIEWS-01 | **PARALLEL** | 2-3 days | After SUBMISSIONS-01 |
| 3B | PLACEMENTS-01 | **PARALLEL** | 2-3 days | After SUBMISSIONS-01 |
| 4 | ONBOARDING-01 | Sequential | 2-3 days | After Phase 3 |

**Total Estimated:** 12-17 days (with parallelization: 10-14 days)

---

## Phase 0: OFFERS-01 Verification

### Overview
Verify that OFFERS-01 is production-ready. No implementation required.

### Verification Checklist

#### Schema Verification
```bash
# Run these queries to verify schema completeness
psql $DATABASE_URL -c "
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'offers'
  ORDER BY ordinal_position;
"
```

Expected tables:
- [ ] `offers` - Core offer records
- [ ] `offer_approvals` - Multi-level approval workflow
- [ ] `offer_negotiations` - Counter-offer tracking
- [ ] `offer_terms` - Itemized terms

#### tRPC Verification
```bash
# Verify router procedures exist
grep -n "offers\." src/server/routers/ats.ts
```

Expected procedures (7):
- [ ] `offers.getById`
- [ ] `offers.list`
- [ ] `offers.create`
- [ ] `offers.send`
- [ ] `offers.updateStatus`
- [ ] `offers.negotiate`
- [ ] `offers.requestApproval`

#### UI Verification
- [ ] List page loads: `/employee/recruiting/offers/`
- [ ] Detail page loads: `/employee/recruiting/offers/[id]/`
- [ ] Create wizard works: `/employee/recruiting/offers/extend/`
- [ ] Status transitions function correctly
- [ ] Approval workflow triggers

### Success Criteria

#### Automated Verification:
- [ ] All 4 offer tables exist in schema
- [ ] All 7 tRPC procedures callable
- [ ] TypeScript compilation passes: `pnpm tsc --noEmit`
- [ ] UI routes resolve without 404

#### Manual Verification:
- [ ] Create a draft offer from submission detail page
- [ ] Send offer and verify status transition
- [ ] Test approval workflow with multi-level approvers
- [ ] Accept/reject offer and verify placement creation trigger

**Implementation Note:** If verification passes, update master guide to mark OFFERS-01 as COMPLETE. If verification fails, document gaps and create remediation plan.

---

## Phase 1: JOBS-01 - Jobs Migration

### Overview
Add unified contact/company references to jobs table. Update tRPC procedures and frontend forms.

### Changes Required

#### 1. Database Migration
**File:** `supabase/migrations/20251213000100_jobs_unified_references.sql`

```sql
-- ============================================================================
-- JOBS-01: Add unified company/contact references
-- ============================================================================

-- Add company references
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS client_company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS end_client_company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS vendor_company_id UUID REFERENCES companies(id);

-- Add contact references
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS hiring_manager_contact_id UUID REFERENCES contacts(id),
ADD COLUMN IF NOT EXISTS hr_contact_id UUID REFERENCES contacts(id);

-- Add enhanced fields
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS external_job_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS priority_rank INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sla_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS intake_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS intake_completed_by UUID REFERENCES user_profiles(id);

-- Add fee structure
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS fee_type VARCHAR(50) DEFAULT 'percentage'
  CHECK (fee_type IN ('percentage', 'flat', 'hourly_spread')),
ADD COLUMN IF NOT EXISTS fee_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS fee_flat_amount NUMERIC(10,2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_client_company ON jobs(client_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_end_client ON jobs(end_client_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_vendor ON jobs(vendor_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_hiring_manager ON jobs(hiring_manager_contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(org_id, external_job_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(org_id, priority_rank DESC) WHERE status = 'open' AND deleted_at IS NULL;

-- Add to entity_skills if job_skills not migrated
-- (Only if job_skills table still exists separately)
-- INSERT INTO entity_skills (org_id, entity_type, entity_id, skill_id, proficiency_level, is_required, created_at, created_by)
-- SELECT org_id, 'job', job_id, skill_id, proficiency_level, is_required, created_at, created_by
-- FROM job_skills WHERE NOT EXISTS (SELECT 1 FROM entity_skills WHERE entity_type = 'job' AND entity_id = job_skills.job_id);

COMMENT ON COLUMN jobs.client_company_id IS 'Direct client company (unified companies table)';
COMMENT ON COLUMN jobs.end_client_company_id IS 'End client if different from direct client';
COMMENT ON COLUMN jobs.vendor_company_id IS 'Vendor company if job is through vendor';
COMMENT ON COLUMN jobs.external_job_id IS 'Client''s internal job ID for reference';
COMMENT ON COLUMN jobs.sla_days IS 'SLA for time-to-fill in days';
```

#### 2. tRPC Router Updates
**File:** `src/server/routers/ats.ts`

Update `jobs.create` input schema:
```typescript
// Add to createJobInput schema
client_company_id: z.string().uuid().optional(),
end_client_company_id: z.string().uuid().optional(),
vendor_company_id: z.string().uuid().optional(),
hiring_manager_contact_id: z.string().uuid().optional(),
hr_contact_id: z.string().uuid().optional(),
external_job_id: z.string().max(100).optional(),
priority_rank: z.number().int().default(0),
sla_days: z.number().int().default(30),
fee_type: z.enum(['percentage', 'flat', 'hourly_spread']).default('percentage'),
fee_percentage: z.number().min(0).max(100).optional(),
fee_flat_amount: z.number().min(0).optional(),
```

Update `jobs.getById` to include relations:
```typescript
// Add to select
with: {
  clientCompany: true,
  endClientCompany: true,
  vendorCompany: true,
  hiringManagerContact: true,
  hrContact: true,
}
```

Add new procedure `jobs.getByCompany`:
```typescript
getByCompany: orgProtectedProcedure
  .input(z.object({
    companyId: z.string().uuid(),
    status: z.enum(['open', 'closed', 'on_hold', 'all']).default('open'),
    limit: z.number().default(20),
    offset: z.number().default(0),
  }))
  .query(async ({ ctx, input }) => {
    // Return jobs where client_company_id = companyId
  })
```

#### 3. Job Intake Wizard Updates
**File:** `src/stores/job-intake-store.ts`

Add fields to store:
```typescript
interface JobIntakeFormData {
  // ... existing fields
  clientCompanyId: string | null;
  endClientCompanyId: string | null;
  vendorCompanyId: string | null;
  hiringManagerContactId: string | null;
  hrContactId: string | null;
  externalJobId: string;
  priorityRank: number;
  slaDays: number;
  feeType: 'percentage' | 'flat' | 'hourly_spread';
  feePercentage: number | null;
  feeFlatAmount: number | null;
}
```

#### 4. Frontend Form Components
**File:** `src/app/employee/recruiting/jobs/intake/steps/ClientDetailsStep.tsx`

Add company/contact selectors:
```tsx
// Company selector for client_company_id
<CompanySelect
  label="Client Company"
  value={formData.clientCompanyId}
  onChange={(id) => setFormData({ clientCompanyId: id })}
  filter={{ category: 'client' }}
  required
/>

// Contact selector for hiring manager
<ContactSelect
  label="Hiring Manager"
  value={formData.hiringManagerContactId}
  onChange={(id) => setFormData({ hiringManagerContactId: id })}
  filter={{ companyId: formData.clientCompanyId }}
/>
```

#### 5. Job List Config Updates
**File:** `src/configs/entities/jobs.config.ts`

Add columns:
```typescript
{
  key: 'clientCompany',
  header: 'Client',
  sortable: true,
  render: (job) => job.clientCompany?.name || '-',
},
{
  key: 'priorityRank',
  header: 'Priority',
  sortable: true,
  render: (job) => <PriorityBadge rank={job.priorityRank} />,
},
{
  key: 'slaProgress',
  header: 'SLA',
  render: (job) => <SLAIndicator job={job} />,
},
```

Add filters:
```typescript
{
  key: 'clientCompanyId',
  type: 'company-select',
  label: 'Client',
  filter: { category: 'client' },
},
{
  key: 'priorityRank',
  type: 'select',
  label: 'Priority',
  options: [
    { value: '1', label: 'Critical' },
    { value: '2', label: 'High' },
    { value: '3', label: 'Medium' },
    { value: '0', label: 'Normal' },
  ],
},
```

### Success Criteria

#### Automated Verification:
- [ ] Migration applies cleanly: `pnpm db:migrate`
- [ ] TypeScript passes: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] Existing job tests pass: `pnpm test --grep "jobs"`

#### Manual Verification:
- [ ] Create new job with client company selected
- [ ] Job list shows client company column
- [ ] Job detail shows company/contact relationships
- [ ] Filter by client company works
- [ ] SLA indicator displays correctly

**Implementation Note:** After completing this phase and all automated verification passes, pause for manual testing confirmation before proceeding to Phase 2.

---

## Phase 2: SUBMISSIONS-01 - Submissions Migration

### Overview
Migrate from `candidate_id` to `contact_id`. Add vendor submission tracking, RTR management, and enhanced scoring.

### Changes Required

#### 1. Database Migration
**File:** `supabase/migrations/20251213000200_submissions_unified_references.sql`

```sql
-- ============================================================================
-- SUBMISSIONS-01: Unified contact references and enhanced tracking
-- ============================================================================

-- Step 1: Add new contact_id column (non-breaking)
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);

-- Step 2: Vendor submission tracking
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS submitted_by_company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS submitted_by_contact_id UUID REFERENCES contacts(id),
ADD COLUMN IF NOT EXISTS is_vendor_submission BOOLEAN DEFAULT false;

-- Step 3: RTR tracking
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rtr_obtained BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rtr_obtained_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rtr_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rtr_document_id UUID REFERENCES documents(id);

-- Step 4: Rate card linkage
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS rate_card_id UUID REFERENCES rate_cards(id),
ADD COLUMN IF NOT EXISTS rate_card_item_id UUID REFERENCES rate_card_items(id),
ADD COLUMN IF NOT EXISTS negotiated_bill_rate NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS negotiated_pay_rate NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS rate_negotiation_notes TEXT;

-- Step 5: Enhanced status tracking
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS status_entered_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS expected_decision_date DATE;

-- Step 6: Scoring enhancements
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS submission_score INTEGER CHECK (submission_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS score_breakdown JSONB,
ADD COLUMN IF NOT EXISTS rank_among_submissions INTEGER;

-- Step 7: Duplicate detection
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS duplicate_of_submission_id UUID REFERENCES submissions(id);

-- Step 8: Generated column for stage category
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS stage_category VARCHAR(20) GENERATED ALWAYS AS (
  CASE
    WHEN status IN ('submitted', 'screening') THEN 'new'
    WHEN status IN ('technical_interview', 'client_interview') THEN 'interviewing'
    WHEN status IN ('offer_pending', 'offer_extended', 'offer_accepted') THEN 'offer'
    WHEN status = 'placed' THEN 'hired'
    WHEN status IN ('rejected', 'withdrawn') THEN 'closed'
    ELSE 'other'
  END
) STORED;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submissions_contact ON submissions(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_vendor ON submissions(submitted_by_company_id) WHERE is_vendor_submission = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_stage ON submissions(stage_category, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_rtr ON submissions(rtr_expires_at) WHERE rtr_obtained = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_score ON submissions(org_id, submission_score DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- Create submission_feedback table (unified feedback)
-- ============================================================================
CREATE TABLE IF NOT EXISTS submission_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  submission_id UUID NOT NULL REFERENCES submissions(id),

  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN (
    'screening', 'technical', 'client', 'reference', 'final'
  )),
  feedback_source VARCHAR(50) NOT NULL CHECK (feedback_source IN (
    'internal', 'client', 'vendor', 'reference'
  )),

  provided_by_user_id UUID REFERENCES user_profiles(id),
  provided_by_contact_id UUID REFERENCES contacts(id),

  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  recommendation VARCHAR(50) CHECK (recommendation IN (
    'strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire'
  )),
  feedback_text TEXT,
  criteria_scores JSONB,  -- {technical: 4, communication: 5, ...}

  interview_id UUID REFERENCES interviews(id),
  interview_round INTEGER,

  is_visible_to_client BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_submission_feedback_submission ON submission_feedback(submission_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_submission_feedback_interview ON submission_feedback(interview_id) WHERE interview_id IS NOT NULL AND deleted_at IS NULL;

-- ============================================================================
-- Create submission_rtr table (RTR tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS submission_rtr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  submission_id UUID NOT NULL REFERENCES submissions(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),

  rtr_type VARCHAR(50) DEFAULT 'standard' CHECK (rtr_type IN (
    'standard', 'exclusive', 'non_exclusive', 'verbal', 'written'
  )),
  obtained_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  validity_hours INTEGER DEFAULT 72,

  document_id UUID REFERENCES documents(id),

  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active', 'expired', 'revoked', 'renewed'
  )),
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_submission_rtr_submission ON submission_rtr(submission_id);
CREATE INDEX idx_submission_rtr_contact ON submission_rtr(contact_id);
CREATE INDEX idx_submission_rtr_expiry ON submission_rtr(expires_at) WHERE status = 'active';

-- ============================================================================
-- Data migration: candidate_id -> contact_id
-- ============================================================================
-- NOTE: Run this AFTER contacts are populated from candidates
-- UPDATE submissions s
-- SET contact_id = c.id
-- FROM candidates cand
-- JOIN contacts c ON c.primary_email = cand.email AND c.org_id = cand.org_id
-- WHERE s.candidate_id = cand.id AND s.contact_id IS NULL;

-- ============================================================================
-- Backward compatibility view
-- ============================================================================
CREATE OR REPLACE VIEW submissions_legacy_v AS
SELECT
  s.*,
  s.contact_id as candidate_id  -- Alias for legacy code
FROM submissions s;

COMMENT ON VIEW submissions_legacy_v IS 'Backward compatibility view - use submissions table directly';

-- RLS Policies
ALTER TABLE submission_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_rtr ENABLE ROW LEVEL SECURITY;

CREATE POLICY submission_feedback_org_isolation ON submission_feedback
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY submission_rtr_org_isolation ON submission_rtr
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);
```

#### 2. tRPC Router Updates
**File:** `src/server/routers/ats.ts`

Rename procedure:
```typescript
// Rename getByCandidate to getByContact
getByContact: orgProtectedProcedure
  .input(z.object({ contactId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    return ctx.db.query.submissions.findMany({
      where: and(
        eq(submissions.contact_id, input.contactId),
        eq(submissions.org_id, ctx.orgId),
        isNull(submissions.deleted_at)
      ),
      with: {
        job: true,
        interviews: true,
        offers: true,
      },
      orderBy: [desc(submissions.created_at)],
    });
  })
```

Add feedback procedures:
```typescript
feedback: {
  create: orgProtectedProcedure
    .input(z.object({
      submissionId: z.string().uuid(),
      feedbackType: z.enum(['screening', 'technical', 'client', 'reference', 'final']),
      feedbackSource: z.enum(['internal', 'client', 'vendor', 'reference']),
      overallRating: z.number().min(1).max(5).optional(),
      recommendation: z.enum(['strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire']).optional(),
      feedbackText: z.string().optional(),
      criteriaScores: z.record(z.number()).optional(),
      interviewId: z.string().uuid().optional(),
      isVisibleToClient: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // Insert into submission_feedback
    }),

  list: orgProtectedProcedure
    .input(z.object({ submissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return all feedback for submission
    }),
}
```

Add RTR procedures:
```typescript
rtr: {
  obtain: orgProtectedProcedure
    .input(z.object({
      submissionId: z.string().uuid(),
      contactId: z.string().uuid(),
      rtrType: z.enum(['standard', 'exclusive', 'non_exclusive', 'verbal', 'written']).default('standard'),
      validityHours: z.number().default(72),
      documentId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create RTR record and update submission
    }),

  check: orgProtectedProcedure
    .input(z.object({ contactId: z.string().uuid(), jobId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Check if valid RTR exists for contact/job combo
    }),

  revoke: orgProtectedProcedure
    .input(z.object({
      rtrId: z.string().uuid(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Revoke RTR
    }),
}
```

#### 3. Submission Pipeline Component
**File:** `src/components/recruiting/submissions/SubmissionPipeline.tsx`

Update status stages:
```typescript
const PIPELINE_STAGES = [
  { key: 'new', label: 'New', statuses: ['submitted', 'screening'] },
  { key: 'interviewing', label: 'Interviewing', statuses: ['technical_interview', 'client_interview'] },
  { key: 'offer', label: 'Offer', statuses: ['offer_pending', 'offer_extended', 'offer_accepted'] },
  { key: 'hired', label: 'Hired', statuses: ['placed'] },
] as const;
```

#### 4. Vendor Submission Form
**File:** `src/components/recruiting/submissions/VendorSubmissionForm.tsx` (NEW)

```tsx
export function VendorSubmissionForm({ jobId, onSuccess }: Props) {
  // Form for vendor-submitted candidates
  // Fields: vendor company, candidate contact, rates, RTR info
}
```

### Success Criteria

#### Automated Verification:
- [ ] Migration applies cleanly: `pnpm db:migrate`
- [ ] TypeScript passes: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] Existing submission tests pass
- [ ] New RTR/feedback tables exist

#### Manual Verification:
- [ ] Create submission using contact_id (not candidate_id)
- [ ] RTR tracking workflow functions
- [ ] Vendor submission form works
- [ ] Pipeline view shows correct stages
- [ ] Feedback collection works
- [ ] Scoring displays correctly

**Implementation Note:** After completing this phase, INTERVIEWS-01 and PLACEMENTS-01 can proceed in parallel.

---

## Phase 3A: INTERVIEWS-01 - Multi-Interviewer Enhancement (PARALLEL)

### Overview
Add multi-interviewer support, scorecard-based feedback, and enhanced scheduling. Can run in parallel with Phase 3B.

### Changes Required

#### 1. Database Migration
**File:** `supabase/migrations/20251213000300_interviews_multi_participant.sql`

```sql
-- ============================================================================
-- INTERVIEWS-01: Multi-interviewer and scorecard support
-- ============================================================================

-- Add contact reference (derived from submission)
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);

-- Update contact_id from submission
UPDATE interviews i
SET contact_id = s.contact_id
FROM submissions s
WHERE i.submission_id = s.id AND i.contact_id IS NULL;

-- Add video/room reference
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS room_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS recording_available BOOLEAN DEFAULT false;

-- ============================================================================
-- Interview Participants (multi-interviewer)
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,

  participant_type VARCHAR(50) NOT NULL CHECK (participant_type IN (
    'interviewer', 'observer', 'note_taker', 'shadow'
  )),

  -- Internal user OR external contact
  user_id UUID REFERENCES user_profiles(id),
  contact_id UUID REFERENCES contacts(id),

  is_primary BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true,

  -- Confirmation tracking
  invited_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,

  -- Attendance tracking
  attended BOOLEAN,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT participant_user_or_contact CHECK (
    (user_id IS NOT NULL AND contact_id IS NULL) OR
    (user_id IS NULL AND contact_id IS NOT NULL)
  )
);

CREATE INDEX idx_interview_participants_interview ON interview_participants(interview_id);
CREATE INDEX idx_interview_participants_user ON interview_participants(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_interview_participants_contact ON interview_participants(contact_id) WHERE contact_id IS NOT NULL;

-- ============================================================================
-- Interview Feedback (per-participant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  interview_id UUID NOT NULL REFERENCES interviews(id),
  participant_id UUID NOT NULL REFERENCES interview_participants(id),

  scorecard_id UUID REFERENCES interview_scorecards(id),

  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  recommendation VARCHAR(50) CHECK (recommendation IN (
    'strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire'
  )),

  criteria_scores JSONB,  -- [{criterionId, score, notes}]
  strengths TEXT,
  concerns TEXT,
  notes TEXT,

  is_visible_to_client BOOLEAN DEFAULT false,

  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_interview_feedback_interview ON interview_feedback(interview_id);
CREATE INDEX idx_interview_feedback_participant ON interview_feedback(participant_id);

-- ============================================================================
-- Interview Scorecards (templates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  name VARCHAR(200) NOT NULL,
  description TEXT,

  interview_type VARCHAR(50),  -- Specific type or NULL for any
  job_id UUID REFERENCES jobs(id),  -- Specific job or NULL for all
  client_company_id UUID REFERENCES companies(id),  -- Specific client or NULL for all

  criteria JSONB NOT NULL,  -- [{id, name, description, weight, scale_min, scale_max}]

  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_interview_scorecards_org ON interview_scorecards(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_interview_scorecards_job ON interview_scorecards(job_id) WHERE job_id IS NOT NULL AND deleted_at IS NULL;

-- RLS
ALTER TABLE interview_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_scorecards ENABLE ROW LEVEL SECURITY;

CREATE POLICY interview_participants_org ON interview_participants
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY interview_feedback_org ON interview_feedback
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY interview_scorecards_org ON interview_scorecards
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);
```

#### 2. tRPC Router Updates
**File:** `src/server/routers/ats.ts`

Add participant procedures:
```typescript
participants: {
  add: orgProtectedProcedure
    .input(z.object({
      interviewId: z.string().uuid(),
      participantType: z.enum(['interviewer', 'observer', 'note_taker', 'shadow']),
      userId: z.string().uuid().optional(),
      contactId: z.string().uuid().optional(),
      isPrimary: z.boolean().default(false),
      isRequired: z.boolean().default(true),
    }))
    .mutation(/* ... */),

  remove: orgProtectedProcedure
    .input(z.object({
      participantId: z.string().uuid(),
    }))
    .mutation(/* ... */),

  confirm: orgProtectedProcedure
    .input(z.object({
      participantId: z.string().uuid(),
    }))
    .mutation(/* ... */),

  decline: orgProtectedProcedure
    .input(z.object({
      participantId: z.string().uuid(),
      reason: z.string(),
    }))
    .mutation(/* ... */),
}
```

Add scorecard procedures:
```typescript
scorecards: {
  create: orgProtectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      interviewType: z.string().optional(),
      jobId: z.string().uuid().optional(),
      clientCompanyId: z.string().uuid().optional(),
      criteria: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        weight: z.number().default(1),
        scaleMin: z.number().default(1),
        scaleMax: z.number().default(5),
      })),
      isDefault: z.boolean().default(false),
    }))
    .mutation(/* ... */),

  list: orgProtectedProcedure
    .input(z.object({
      jobId: z.string().uuid().optional(),
      interviewType: z.string().optional(),
    }))
    .query(/* ... */),

  getApplicable: orgProtectedProcedure
    .input(z.object({
      interviewId: z.string().uuid(),
    }))
    .query(/* Find best matching scorecard for interview */),
}
```

#### 3. Interview Scheduler Updates
**File:** `src/stores/schedule-interview-store.ts`

Add multi-participant state:
```typescript
interface ScheduleInterviewFormData {
  // ... existing fields
  participants: Array<{
    type: 'interviewer' | 'observer' | 'note_taker' | 'shadow';
    userId?: string;
    contactId?: string;
    isPrimary: boolean;
    isRequired: boolean;
  }>;
  scorecardId: string | null;
}
```

#### 4. Participant Selection Component
**File:** `src/components/recruiting/interviews/ParticipantSelector.tsx` (NEW)

```tsx
export function ParticipantSelector({
  value,
  onChange,
  allowExternal = true
}: Props) {
  // Multi-select for internal users and external contacts
  // With role assignment (interviewer, observer, etc.)
}
```

#### 5. Feedback Collection Component
**File:** `src/components/recruiting/interviews/InterviewFeedbackForm.tsx` (UPDATE)

```tsx
export function InterviewFeedbackForm({
  interviewId,
  participantId,
  scorecardId,
  onSubmit
}: Props) {
  // Scorecard-based feedback collection
  // Per-criterion scoring with notes
}
```

### Success Criteria

#### Automated Verification:
- [ ] Migration applies cleanly: `pnpm db:migrate`
- [ ] TypeScript passes: `pnpm tsc --noEmit`
- [ ] New tables exist: `interview_participants`, `interview_feedback`, `interview_scorecards`
- [ ] Existing interview tests pass

#### Manual Verification:
- [ ] Schedule interview with multiple interviewers
- [ ] Add external (client) interviewer via contact
- [ ] Create and apply scorecard to interview
- [ ] Submit feedback per participant
- [ ] View consolidated feedback on interview detail

**Implementation Note:** This phase can run in parallel with Phase 3B (PLACEMENTS-01).

---

## Phase 3B: PLACEMENTS-01 - Placement Migration (PARALLEL)

### Overview
Consolidate candidate_id/consultant_id to contact_id. Add company references and change order tracking. Can run in parallel with Phase 3A.

### Changes Required

#### 1. Database Migration
**File:** `supabase/migrations/20251213000400_placements_unified_references.sql`

```sql
-- ============================================================================
-- PLACEMENTS-01: Unified contact and company references
-- ============================================================================

-- Add unified contact reference
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);

-- Add company references
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS client_company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS work_site_company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS vendor_company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS sub_vendor_company_id UUID REFERENCES companies(id);

-- Add contract reference
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id);

-- Add rate card reference
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS rate_card_id UUID REFERENCES rate_cards(id);

-- Enhanced status tracking
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status_changed_by UUID REFERENCES user_profiles(id);

-- Change tracking
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS original_end_date DATE,
ADD COLUMN IF NOT EXISTS extension_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_extension_date DATE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_placements_contact ON placements(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_client ON placements(client_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_vendor ON placements(vendor_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_contract ON placements(contract_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_active ON placements(org_id, status) WHERE status = 'active' AND deleted_at IS NULL;

-- ============================================================================
-- Placement Change Orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS placement_change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  placement_id UUID NOT NULL REFERENCES placements(id),

  change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
    'extension', 'rate_change', 'conversion', 'termination',
    'location_change', 'schedule_change', 'role_change'
  )),

  effective_date DATE NOT NULL,

  previous_value JSONB,  -- What it was before
  new_value JSONB,       -- What it's changing to

  reason TEXT,
  notes TEXT,

  -- Approval
  requires_approval BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES user_profiles(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Supporting document
  document_id UUID REFERENCES documents(id),

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'applied', 'cancelled'
  )),
  applied_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_placement_change_orders_placement ON placement_change_orders(placement_id);
CREATE INDEX idx_placement_change_orders_status ON placement_change_orders(status) WHERE status = 'pending';

-- ============================================================================
-- Placement Vendors (C2C chain tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS placement_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  placement_id UUID NOT NULL REFERENCES placements(id),

  vendor_company_id UUID NOT NULL REFERENCES companies(id),
  vendor_type VARCHAR(50) NOT NULL CHECK (vendor_type IN (
    'primary', 'sub_vendor', 'end_client', 'implementation_partner'
  )),
  position_in_chain INTEGER NOT NULL DEFAULT 1,

  -- Rates at this level
  bill_rate NUMERIC(10,2),
  pay_rate NUMERIC(10,2),
  markup_percentage NUMERIC(5,2),

  -- Contact at vendor
  vendor_contact_id UUID REFERENCES contacts(id),

  -- Contract reference
  vendor_contract_id UUID REFERENCES contracts(id),

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_placement_vendors_placement ON placement_vendors(placement_id);
CREATE INDEX idx_placement_vendors_company ON placement_vendors(vendor_company_id);

-- ============================================================================
-- Data Migration: Consolidate candidate_id/consultant_id
-- ============================================================================
-- Strategy: Use consultant_id if available, else candidate_id
-- UPDATE placements p
-- SET contact_id = COALESCE(
--   (SELECT c.id FROM contacts c WHERE c.primary_email = con.email AND c.org_id = con.org_id),
--   (SELECT c.id FROM contacts c WHERE c.primary_email = cand.email AND c.org_id = cand.org_id)
-- )
-- FROM consultants con, candidates cand
-- WHERE (p.consultant_id = con.id OR p.candidate_id = cand.id)
-- AND p.contact_id IS NULL;

-- Backward compat view
CREATE OR REPLACE VIEW placements_legacy_v AS
SELECT
  p.*,
  p.contact_id as consultant_id,
  p.contact_id as candidate_id
FROM placements p;

-- RLS
ALTER TABLE placement_change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY placement_change_orders_org ON placement_change_orders
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

CREATE POLICY placement_vendors_org ON placement_vendors
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);
```

#### 2. tRPC Router Updates
**File:** `src/server/routers/ats.ts`

Update existing procedures to use `contact_id`:
```typescript
// Update getById
placements.getById: orgProtectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    return ctx.db.query.placements.findFirst({
      where: and(
        eq(placements.id, input.id),
        eq(placements.org_id, ctx.orgId),
        isNull(placements.deleted_at)
      ),
      with: {
        contact: true,  // Instead of consultant/candidate
        clientCompany: true,
        vendorCompany: true,
        contract: true,
        rateCard: true,
        changeOrders: {
          orderBy: [desc(placement_change_orders.effective_date)],
        },
        vendors: {
          orderBy: [asc(placement_vendors.position_in_chain)],
        },
      },
    });
  })
```

Add change order procedures:
```typescript
changeOrders: {
  create: orgProtectedProcedure
    .input(z.object({
      placementId: z.string().uuid(),
      changeType: z.enum([
        'extension', 'rate_change', 'conversion', 'termination',
        'location_change', 'schedule_change', 'role_change'
      ]),
      effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      previousValue: z.record(z.any()).optional(),
      newValue: z.record(z.any()),
      reason: z.string().optional(),
      documentId: z.string().uuid().optional(),
      requiresApproval: z.boolean().default(true),
    }))
    .mutation(/* ... */),

  approve: orgProtectedProcedure
    .input(z.object({
      changeOrderId: z.string().uuid(),
    }))
    .mutation(/* ... */),

  reject: orgProtectedProcedure
    .input(z.object({
      changeOrderId: z.string().uuid(),
      reason: z.string(),
    }))
    .mutation(/* ... */),

  apply: orgProtectedProcedure
    .input(z.object({
      changeOrderId: z.string().uuid(),
    }))
    .mutation(/* Apply approved change to placement */),

  list: orgProtectedProcedure
    .input(z.object({
      placementId: z.string().uuid(),
      status: z.enum(['pending', 'approved', 'rejected', 'applied', 'all']).default('all'),
    }))
    .query(/* ... */),
}
```

Add vendor chain procedures:
```typescript
vendors: {
  add: orgProtectedProcedure
    .input(z.object({
      placementId: z.string().uuid(),
      vendorCompanyId: z.string().uuid(),
      vendorType: z.enum(['primary', 'sub_vendor', 'end_client', 'implementation_partner']),
      positionInChain: z.number().int(),
      billRate: z.number().optional(),
      payRate: z.number().optional(),
      vendorContactId: z.string().uuid().optional(),
    }))
    .mutation(/* ... */),

  update: orgProtectedProcedure
    .input(z.object({
      vendorId: z.string().uuid(),
      billRate: z.number().optional(),
      payRate: z.number().optional(),
      vendorContactId: z.string().uuid().optional(),
    }))
    .mutation(/* ... */),

  remove: orgProtectedProcedure
    .input(z.object({
      vendorId: z.string().uuid(),
    }))
    .mutation(/* ... */),

  getChain: orgProtectedProcedure
    .input(z.object({
      placementId: z.string().uuid(),
    }))
    .query(/* Return full vendor chain with margin calculations */),
}
```

#### 3. Placement Detail Updates
**File:** `src/app/employee/recruiting/placements/[id]/page.tsx`

Add sections for:
- Change Orders history
- Vendor Chain visualization
- Contract linking

#### 4. Change Order Form
**File:** `src/components/recruiting/placements/ChangeOrderForm.tsx` (NEW)

```tsx
export function ChangeOrderForm({
  placement,
  onSubmit
}: Props) {
  // Form for creating change orders
  // Type selection, effective date, value changes
}
```

#### 5. Vendor Chain Component
**File:** `src/components/recruiting/placements/VendorChain.tsx` (NEW)

```tsx
export function VendorChain({ placementId }: Props) {
  // Visual representation of C2C vendor chain
  // Shows margin at each level
}
```

### Success Criteria

#### Automated Verification:
- [ ] Migration applies cleanly: `pnpm db:migrate`
- [ ] TypeScript passes: `pnpm tsc --noEmit`
- [ ] New tables exist: `placement_change_orders`, `placement_vendors`
- [ ] Existing placement tests pass

#### Manual Verification:
- [ ] Create placement with contact_id
- [ ] Add vendor chain to placement
- [ ] Create and approve change order
- [ ] Extend placement via change order
- [ ] View change order history
- [ ] Margin calculations display correctly in vendor chain

**Implementation Note:** This phase can run in parallel with Phase 3A (INTERVIEWS-01).

---

## Phase 4: ONBOARDING-01 - Employee Onboarding

### Overview
Implement employee onboarding workflow using existing schema. NOTE: Consultant/placement onboarding already exists via `PlacementMilestones`.

### Changes Required

#### 1. Verify Existing Schema
Tables already exist in baseline migration:
- `onboarding_templates` - Template definitions
- `onboarding_checklists` - Assigned checklists
- `onboarding_tasks` - Individual tasks
- `onboarding_task_completions` - Completion records

#### 2. tRPC Router Implementation
**File:** `src/server/routers/hr.ts`

```typescript
onboarding: router({
  // Template management
  templates: {
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        employeeType: z.enum(['full_time', 'contractor', 'intern', 'temp']).optional(),
        department: z.string().optional(),
        tasks: z.array(z.object({
          name: z.string(),
          description: z.string().optional(),
          category: z.string(),
          dueOffsetDays: z.number().default(0),
          assigneeRole: z.string().optional(),
          isRequired: z.boolean().default(true),
          complianceRequirementId: z.string().uuid().optional(),
          documentTemplateId: z.string().uuid().optional(),
        })),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create template and tasks in transaction
      }),

    list: orgProtectedProcedure
      .input(z.object({
        employeeType: z.string().optional(),
        department: z.string().optional(),
        includeInactive: z.boolean().default(false),
      }))
      .query(/* ... */),

    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(/* ... */),

    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(/* ... */),
  },

  // Checklist assignment
  checklists: {
    assign: orgProtectedProcedure
      .input(z.object({
        contactId: z.string().uuid(),
        templateId: z.string().uuid(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        managerId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create checklist from template
        // Calculate due dates based on startDate + offset
        // Create compliance items if linked
      }),

    getByContact: orgProtectedProcedure
      .input(z.object({ contactId: z.string().uuid() }))
      .query(/* Return all checklists for employee */),

    getProgress: orgProtectedProcedure
      .input(z.object({ checklistId: z.string().uuid() }))
      .query(/* Return progress stats */),
  },

  // Task management
  tasks: {
    complete: orgProtectedProcedure
      .input(z.object({
        taskId: z.string().uuid(),
        notes: z.string().optional(),
        documentId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Mark task complete
        // Update compliance if linked
        // Trigger next tasks if dependent
      }),

    skip: orgProtectedProcedure
      .input(z.object({
        taskId: z.string().uuid(),
        reason: z.string(),
      }))
      .mutation(/* ... */),

    reassign: orgProtectedProcedure
      .input(z.object({
        taskId: z.string().uuid(),
        assigneeId: z.string().uuid(),
      }))
      .mutation(/* ... */),

    addNote: orgProtectedProcedure
      .input(z.object({
        taskId: z.string().uuid(),
        note: z.string(),
      }))
      .mutation(/* ... */),
  },

  // Dashboard queries
  dashboard: {
    getPending: orgProtectedProcedure
      .input(z.object({
        assigneeId: z.string().uuid().optional(),
        dueSoon: z.boolean().default(false),  // Due within 7 days
      }))
      .query(/* Return pending tasks */),

    getOverdue: orgProtectedProcedure
      .query(/* Return overdue tasks */),

    getStats: orgProtectedProcedure
      .query(/* Return onboarding stats */),
  },
})
```

#### 3. Onboarding Pages
**File:** `src/app/employee/hr/onboarding/page.tsx` (NEW)

```tsx
export default function OnboardingDashboardPage() {
  // Dashboard showing:
  // - Active onboardings
  // - Pending tasks
  // - Overdue items
  // - Completion stats
}
```

**File:** `src/app/employee/hr/onboarding/templates/page.tsx` (NEW)

```tsx
export default function OnboardingTemplatesPage() {
  // Template list with create/edit
}
```

**File:** `src/app/employee/hr/onboarding/[contactId]/page.tsx` (NEW)

```tsx
export default function EmployeeOnboardingPage() {
  // Employee's onboarding checklist view
  // Task completion interface
}
```

#### 4. Components
**File:** `src/components/hr/onboarding/OnboardingChecklist.tsx` (NEW)

```tsx
export function OnboardingChecklist({ checklistId }: Props) {
  // Checklist view with task grouping by category
  // Progress bar
  // Task completion UI
}
```

**File:** `src/components/hr/onboarding/OnboardingTemplateEditor.tsx` (NEW)

```tsx
export function OnboardingTemplateEditor({ template, onSave }: Props) {
  // Template creation/editing
  // Task drag-and-drop ordering
  // Compliance requirement linking
}
```

**File:** `src/components/hr/onboarding/TaskCard.tsx` (NEW)

```tsx
export function TaskCard({ task, onComplete, onSkip }: Props) {
  // Individual task display
  // Completion button
  // Document upload if required
}
```

#### 5. Navigation Updates
**File:** `src/lib/navigation/sidebar-items.ts`

Add HR onboarding section:
```typescript
{
  label: 'Onboarding',
  href: '/employee/hr/onboarding',
  icon: ClipboardCheck,
  children: [
    { label: 'Dashboard', href: '/employee/hr/onboarding' },
    { label: 'Templates', href: '/employee/hr/onboarding/templates' },
    { label: 'Active', href: '/employee/hr/onboarding/active' },
  ],
}
```

### Success Criteria

#### Automated Verification:
- [ ] tRPC procedures compile: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] HR router exports onboarding procedures

#### Manual Verification:
- [ ] Create onboarding template with tasks
- [ ] Assign template to new employee
- [ ] Complete tasks and see progress update
- [ ] Skip task with reason
- [ ] View overdue tasks on dashboard
- [ ] Compliance items auto-created for linked tasks

**Implementation Note:** After completing this phase, WAVE 4 is complete. Proceed to validation.

---

## Post-Implementation Validation

### Full System Test

After all phases complete, run comprehensive validation:

```bash
# 1. Database integrity
pnpm db:migrate
pnpm db:status

# 2. Type safety
pnpm tsc --noEmit

# 3. Linting
pnpm lint

# 4. Unit tests
pnpm test

# 5. Build verification
pnpm build
```

### Data Migration Verification

```sql
-- Verify no orphaned legacy references
SELECT COUNT(*) FROM submissions WHERE candidate_id IS NOT NULL AND contact_id IS NULL;
SELECT COUNT(*) FROM placements WHERE consultant_id IS NOT NULL AND contact_id IS NULL;
SELECT COUNT(*) FROM placements WHERE candidate_id IS NOT NULL AND contact_id IS NULL;

-- Verify FK integrity
SELECT COUNT(*) FROM jobs j
LEFT JOIN companies c ON j.client_company_id = c.id
WHERE j.client_company_id IS NOT NULL AND c.id IS NULL;

-- Verify index usage
EXPLAIN ANALYZE SELECT * FROM submissions WHERE contact_id = '[uuid]';
```

### Performance Benchmarks

| Query | Target | Verify Command |
|-------|--------|----------------|
| Job list (paginated) | <100ms | `time curl /api/trpc/ats.jobs.list` |
| Submission pipeline | <150ms | `time curl /api/trpc/ats.submissions.list` |
| Interview calendar | <100ms | `time curl /api/trpc/ats.interviews.list` |
| Placement detail | <100ms | `time curl /api/trpc/ats.placements.getById` |

---

## Rollback Plan

### Per-Phase Rollback

Each phase can be rolled back independently:

1. **JOBS-01 Rollback:**
   ```sql
   -- Drop new columns (keeps data in legacy columns)
   ALTER TABLE jobs
   DROP COLUMN IF EXISTS client_company_id,
   DROP COLUMN IF EXISTS end_client_company_id,
   -- ... etc
   ```

2. **SUBMISSIONS-01 Rollback:**
   ```sql
   -- View provides backward compatibility, no immediate rollback needed
   -- If critical, restore candidate_id column
   ```

3. **INTERVIEWS-01 Rollback:**
   ```sql
   DROP TABLE IF EXISTS interview_feedback CASCADE;
   DROP TABLE IF EXISTS interview_participants CASCADE;
   DROP TABLE IF EXISTS interview_scorecards CASCADE;
   ```

4. **PLACEMENTS-01 Rollback:**
   ```sql
   DROP TABLE IF EXISTS placement_change_orders CASCADE;
   DROP TABLE IF EXISTS placement_vendors CASCADE;
   -- View provides backward compatibility
   ```

5. **ONBOARDING-01 Rollback:**
   - Remove tRPC procedures
   - Remove UI pages
   - Schema stays (was existing)

### Emergency Rollback

If full WAVE 4 rollback needed:

```bash
# 1. Restore database backup
pg_restore -d $DATABASE_URL backup_pre_wave4.dump

# 2. Revert code to pre-wave4 commit
git revert --no-commit wave4-start..HEAD
git commit -m "Rollback WAVE 4"

# 3. Deploy rollback
pnpm build && pnpm start
```

---

## References

- Master Implementation Guide: `thoughts/shared/issues/00-MASTER-IMPLEMENTATION-GUIDE.md`
- Research Document: `thoughts/shared/research/2025-12-12-wave4-ats-pipeline-comprehensive-analysis.md`
- CLAUDE.md: Project coding standards and patterns

### Related Issue Files
- `thoughts/shared/issues/jobs-01/`
- `thoughts/shared/issues/submissions-01/`
- `thoughts/shared/issues/interviews-01/`
- `thoughts/shared/issues/offers-01/`
- `thoughts/shared/issues/placements-01/`
- `thoughts/shared/issues/onboarding-01/`

---

*End of Implementation Plan*
