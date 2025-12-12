# WAVE 4: ATS Pipeline - Comprehensive Codebase Analysis

**Date:** 2025-12-12
**Git Commit:** d0237ce
**Branch:** main
**Repository:** intime-v3
**Research Type:** Pre-Implementation Analysis
**Scope:** JOBS-01, SUBMISSIONS-01, INTERVIEWS-01, OFFERS-01, PLACEMENTS-01, ONBOARDING-01

---

## Executive Summary

WAVE 4 encompasses the core ATS (Applicant Tracking System) pipeline, consisting of 6 issues that form the recruiting workflow from job posting through candidate onboarding. This analysis reveals that **implementation status varies significantly across components**:

| Issue | Status | Effort Required |
|-------|--------|-----------------|
| JOBS-01 | Schema exists, needs migration | Medium |
| SUBMISSIONS-01 | Schema exists, needs migration | Medium |
| INTERVIEWS-01 | Schema exists, needs enhancement | Low-Medium |
| OFFERS-01 | **FULLY IMPLEMENTED** | None (verify only) |
| PLACEMENTS-01 | Schema exists, needs migration | Medium |
| ONBOARDING-01 | Partial (employee onboarding missing) | Medium |

**Critical Finding:** OFFERS-01 is marked as "NEW" in the master guide but is **already production-ready** with full schema, tRPC router, and UI components.

**Wave 3 Dependencies:** All three Wave 3 issues (COMPLIANCE-01, CONTRACTS-01, RATES-01) are **fully implemented** and ready to support WAVE 4.

---

## Table of Contents

1. [Wave 3 Dependencies Status](#wave-3-dependencies-status)
2. [JOBS-01: Jobs Migration Analysis](#jobs-01-jobs-migration-analysis)
3. [SUBMISSIONS-01: Submissions Migration Analysis](#submissions-01-submissions-migration-analysis)
4. [INTERVIEWS-01: Interviews System Analysis](#interviews-01-interviews-system-analysis)
5. [OFFERS-01: Offers System Analysis](#offers-01-offers-system-analysis)
6. [PLACEMENTS-01: Placements Migration Analysis](#placements-01-placements-migration-analysis)
7. [ONBOARDING-01: Onboarding System Analysis](#onboarding-01-onboarding-system-analysis)
8. [Cross-Cutting Patterns](#cross-cutting-patterns)
9. [Implementation Recommendations](#implementation-recommendations)
10. [File Reference Index](#file-reference-index)

---

## Wave 3 Dependencies Status

All Wave 3 dependencies are **FULLY IMPLEMENTED**:

### COMPLIANCE-01 (Complete)
- **Migration:** `supabase/migrations/20251212100000_create_compliance_system.sql`
- **Tables:** `compliance_requirements`, `compliance_documents`, `compliance_tracking`, `compliance_alerts`, `compliance_audit_log`
- **Router:** `src/server/routers/compliance.ts` (all procedures implemented)
- **UI:** Full admin interface at `/employee/admin/compliance/`

### CONTRACTS-01 (Complete)
- **Migration:** `supabase/migrations/20251212100100_create_contracts_system.sql`
- **Tables:** `contract_templates`, `contracts`, `contract_terms`, `contract_versions`, `contract_signatures`, `contract_amendments`
- **Router:** `src/server/routers/contracts.ts` (all procedures implemented)
- **UI:** Full contracts management with versioning and e-signature support

### RATES-01 (Complete)
- **Migration:** `supabase/migrations/20251212100200_create_rates_system.sql`
- **Tables:** `rate_cards`, `rate_card_items`, `entity_rates`, `rate_history`, `rate_negotiations`
- **Router:** `src/server/routers/rates.ts` (all procedures implemented)
- **UI:** Rate card management, margin calculator, markup rules engine

---

## JOBS-01: Jobs Migration Analysis

### Current Schema Location
- **Primary:** `supabase/migrations/00000000000000_baseline.sql` lines 19979-20028
- **Table:** `jobs` (40+ columns)

### Existing Columns
```sql
id, org_id, title, description, status, job_type, employment_type,
experience_level, min_salary, max_salary, currency, location_type,
city, state, country, remote_percentage, department, team,
hiring_manager_id, posted_at, closes_at, target_start_date,
positions_open, positions_filled, priority, visibility,
application_deadline, requirements, responsibilities, benefits,
created_at, updated_at, deleted_at, created_by, updated_by
```

### Legacy References (Need Migration)
1. **`hiring_manager_id`** → references `user_profiles(id)`
   - Should also add `hiring_manager_contact_id` → `contacts(id)` for external HMs
2. **`account_id`** (if exists) → needs mapping to `client_company_id` → `companies(id)`

### Required New Columns
Per JOBS-01 specification:
```sql
-- Company references (unified contacts system)
client_company_id UUID REFERENCES companies(id)
end_client_company_id UUID REFERENCES companies(id)
vendor_company_id UUID REFERENCES companies(id)

-- Contact references
hiring_manager_contact_id UUID REFERENCES contacts(id)
hr_contact_id UUID REFERENCES contacts(id)

-- Enhanced fields
external_job_id VARCHAR  -- Client's job ID
priority_rank INTEGER
sla_days INTEGER
intake_completed_at TIMESTAMPTZ
intake_completed_by UUID REFERENCES user_profiles(id)

-- Fee structure
fee_type VARCHAR  -- 'percentage', 'flat', 'hourly_spread'
fee_percentage NUMERIC(5,2)
fee_flat_amount NUMERIC(10,2)
```

### Related Tables
- `job_skills` → migrate to `entity_skills` (polymorphic)
- `job_requirements` → keep or merge into JSONB
- `job_questions` → screening questions

### tRPC Router Analysis
**File:** `src/server/routers/ats.ts` lines 474-1452

**Existing Procedures (14):**
| Procedure | Lines | Status |
|-----------|-------|--------|
| `jobs.getById` | 474-520 | Working |
| `jobs.list` | 522-650 | Working |
| `jobs.create` | 652-780 | Needs company_id update |
| `jobs.update` | 782-850 | Needs company_id update |
| `jobs.updateStatus` | 852-900 | Working |
| `jobs.archive` | 902-940 | Working |
| `jobs.clone` | 942-1010 | Needs update |
| `jobs.getRequirements` | 1012-1050 | Working |
| `jobs.updateRequirements` | 1052-1120 | Working |
| `jobs.getScreeningQuestions` | 1122-1160 | Working |
| `jobs.updateScreeningQuestions` | 1162-1230 | Working |
| `jobs.getStats` | 1232-1300 | Working |
| `jobs.getPipelineMetrics` | 1302-1380 | Working |
| `jobs.bulkUpdateStatus` | 1382-1452 | Working |

### Frontend Components
**List Page:** `src/app/employee/recruiting/jobs/page.tsx`
- Uses PCF pattern with `jobsListConfig`
- Config: `src/configs/entities/jobs.config.ts`

**Detail Page:** `src/app/employee/recruiting/jobs/[id]/page.tsx`
- Journey-based navigation (6 steps)
- Sections: Overview, Requirements, Pipeline, Activity

**Intake Wizard:** `src/app/employee/recruiting/jobs/intake/page.tsx`
- Store: `src/stores/job-intake-store.ts`
- 6-step wizard with localStorage persistence

### Migration Approach
1. Add new columns (non-breaking)
2. Create data migration to populate `client_company_id` from `account_id`
3. Migrate `job_skills` to `entity_skills`
4. Update tRPC procedures for new FKs
5. Create backward-compat view `jobs_legacy_v`
6. Update frontend forms to use company/contact selectors

---

## SUBMISSIONS-01: Submissions Migration Analysis

### Current Schema Location
- **Primary:** `supabase/migrations/00000000000000_baseline.sql` lines 24152-24201
- **Table:** `submissions`

### Existing Columns
```sql
id, org_id, job_id, candidate_id, recruiter_id, status,
submitted_at, source, source_detail, bill_rate, pay_rate,
resume_id, cover_letter, screening_score, screening_notes,
client_feedback, rejection_reason, created_at, updated_at, deleted_at
```

### Legacy References (Need Migration)
1. **`candidate_id`** → references `candidates(id)`
   - MUST rename to `contact_id` → `contacts(id)`
2. **`recruiter_id`** → references `user_profiles(id)` (keep as-is)

### Required New Columns
Per SUBMISSIONS-01 specification:
```sql
-- Vendor submission tracking
submitted_by_company_id UUID REFERENCES companies(id)
submitted_by_contact_id UUID REFERENCES contacts(id)
is_vendor_submission BOOLEAN DEFAULT false

-- RTR tracking
rtr_obtained BOOLEAN DEFAULT false
rtr_obtained_at TIMESTAMPTZ
rtr_expires_at TIMESTAMPTZ
rtr_document_id UUID REFERENCES documents(id)

-- Rate card linkage
rate_card_id UUID REFERENCES rate_cards(id)
rate_card_item_id UUID REFERENCES rate_card_items(id)
negotiated_bill_rate NUMERIC(10,2)
negotiated_pay_rate NUMERIC(10,2)
rate_negotiation_notes TEXT

-- Enhanced status tracking
status_entered_at TIMESTAMPTZ
expected_decision_date DATE
stage_category VARCHAR GENERATED ALWAYS AS (
  CASE
    WHEN status IN ('submitted', 'screening') THEN 'new'
    WHEN status IN ('technical_interview', 'client_interview') THEN 'interviewing'
    WHEN status IN ('offer_pending', 'offer_extended', 'offer_accepted') THEN 'offer'
    WHEN status = 'placed' THEN 'hired'
    WHEN status IN ('rejected', 'withdrawn') THEN 'closed'
    ELSE 'other'
  END
) STORED

-- Scoring
submission_score INTEGER CHECK (submission_score BETWEEN 0 AND 100)
score_breakdown JSONB
rank_among_submissions INTEGER

-- Duplicate detection
is_duplicate BOOLEAN DEFAULT false
duplicate_of_submission_id UUID REFERENCES submissions(id)
```

### New Tables Required
```sql
-- Unified feedback table
submission_feedback (
  id, org_id, submission_id,
  feedback_type, feedback_source,
  provided_by_user_id, provided_by_contact_id,
  overall_rating, recommendation, feedback_text,
  criteria_scores JSONB,
  interview_id, interview_round,
  is_visible_to_client,
  created_at, updated_at, deleted_at
)

-- RTR tracking
submission_rtr (
  id, org_id, submission_id, contact_id,
  rtr_type, obtained_at, expires_at, validity_hours,
  document_id, status, revoked_at, revoked_reason,
  created_at, created_by
)
```

### tRPC Router Analysis
**File:** `src/server/routers/ats.ts` lines 1458-2224

**Existing Procedures (8):**
| Procedure | Lines | Status |
|-----------|-------|--------|
| `submissions.getById` | 1458-1520 | Needs contact_id update |
| `submissions.list` | 1522-1680 | Needs contact_id update |
| `submissions.create` | 1682-1780 | Needs contact_id update |
| `submissions.update` | 1782-1850 | Needs contact_id update |
| `submissions.updateStatus` | 1852-1920 | Working |
| `submissions.reject` | 1922-1990 | Working |
| `submissions.getByJob` | 1992-2080 | Working |
| `submissions.getByCandidate` | 2082-2224 | RENAME to getByContact |

### Status Values (Current)
```typescript
type SubmissionStatus =
  | 'submitted'
  | 'screening'
  | 'interviewing'
  | 'offered'
  | 'placed'
  | 'rejected'
  | 'withdrawn'
```

### Status Values (Target - Granular)
```typescript
type SubmissionStatus =
  | 'submitted'
  | 'screening'
  | 'technical_interview'
  | 'client_interview'
  | 'offer_pending'
  | 'offer_extended'
  | 'offer_accepted'
  | 'placed'
  | 'rejected'
  | 'withdrawn'
  | 'on_hold'
```

### Frontend Components
**List Page:** `src/app/employee/recruiting/submissions/page.tsx`
**Detail Page:** `src/app/employee/recruiting/submissions/[id]/page.tsx`
**Pipeline View:** `src/components/recruiting/submissions/SubmissionPipeline.tsx`

### Migration Approach
1. Add new columns (non-breaking)
2. Rename `candidate_id` to `contact_id`
3. Data migration: map candidates to contacts via email
4. Create `submission_feedback` and `submission_rtr` tables
5. Migrate inline rates to `entity_rates`
6. Update tRPC procedures
7. Create backward-compat view

---

## INTERVIEWS-01: Interviews System Analysis

### Current Schema Location
- **Primary:** `supabase/migrations/00000000000000_baseline.sql` lines 19774-19841
- **Table:** `interviews`

### Existing Columns
```sql
id, org_id, submission_id, job_id, candidate_id,
interview_type, status, scheduled_at, duration_minutes,
location, meeting_link, interviewer_id,
notes, feedback, rating, recommendation,
completed_at, canceled_at, cancel_reason,
created_at, updated_at, deleted_at
```

### Legacy References
1. **`candidate_id`** → should be derived from `submission.contact_id`
2. **`interviewer_id`** → single interviewer, needs multi-interviewer support

### Required Changes
Per INTERVIEWS-01 specification:
```sql
-- Contact reference (from submission)
ADD COLUMN contact_id UUID REFERENCES contacts(id)

-- Multiple interviewers support
CREATE TABLE interview_participants (
  id, org_id, interview_id,
  participant_type,  -- 'interviewer', 'observer', 'note_taker'
  user_id UUID REFERENCES user_profiles(id),
  contact_id UUID REFERENCES contacts(id),  -- external interviewers
  is_primary BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  created_at, updated_at
)

-- Enhanced feedback
CREATE TABLE interview_feedback (
  id, org_id, interview_id, participant_id,
  overall_rating, recommendation,
  criteria_scores JSONB,  -- {technical: 4, communication: 5, ...}
  strengths TEXT,
  concerns TEXT,
  notes TEXT,
  is_visible_to_client BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at, updated_at
)

-- Scorecards
CREATE TABLE interview_scorecards (
  id, org_id, name, description,
  interview_type VARCHAR,
  criteria JSONB,  -- [{name, description, weight, scale}]
  is_default BOOLEAN DEFAULT false,
  created_at, updated_at, deleted_at
)
```

### tRPC Router Analysis
**File:** `src/server/routers/ats.ts` lines 2232-3155

**Existing Procedures (9):**
| Procedure | Lines | Status |
|-----------|-------|--------|
| `interviews.getById` | 2232-2300 | Needs enhancement |
| `interviews.list` | 2302-2450 | Working |
| `interviews.create` | 2452-2580 | Needs participants support |
| `interviews.update` | 2582-2680 | Working |
| `interviews.schedule` | 2682-2800 | Needs participants |
| `interviews.reschedule` | 2802-2880 | Working |
| `interviews.cancel` | 2882-2960 | Working |
| `interviews.complete` | 2962-3050 | Needs feedback integration |
| `interviews.submitFeedback` | 3052-3155 | Needs enhancement |

### Frontend Components
**List Page:** `src/app/employee/recruiting/interviews/page.tsx`
**Scheduling:** `src/components/recruiting/interviews/InterviewScheduler.tsx`
**Store:** `src/stores/schedule-interview-store.ts`

### Migration Approach
1. Add `contact_id` column (derive from submission)
2. Create `interview_participants` table
3. Create `interview_feedback` table
4. Create `interview_scorecards` table
5. Migrate existing `interviewer_id` to participants
6. Update tRPC procedures for multi-interviewer
7. Update UI for participant management

---

## OFFERS-01: Offers System Analysis

### CRITICAL FINDING: ALREADY FULLY IMPLEMENTED

Despite being marked as "NEW" in the master guide, the offers system is **production-ready**.

### Schema Location
- **Primary:** `supabase/migrations/00000000000000_baseline.sql` lines 21385-21431
- **Tables:** `offers`, `offer_approvals`, `offer_negotiations`, `offer_terms`

### Existing Tables

#### offers
```sql
id, org_id, submission_id, job_id, candidate_id,
status,  -- 'draft', 'pending_approval', 'approved', 'sent', 'accepted', 'rejected', 'expired', 'withdrawn'
version, current_version_id,
base_salary, bonus, equity, sign_on_bonus,
start_date, expiration_date,
benefits_summary, terms_conditions,
sent_at, sent_by, responded_at,
acceptance_deadline,
created_at, updated_at, deleted_at, created_by
```

#### offer_approvals
```sql
id, org_id, offer_id, approver_id,
approval_level, status, comments,
approved_at, rejected_at,
created_at, updated_at
```

#### offer_negotiations
```sql
id, org_id, offer_id,
initiated_by, negotiation_type,
requested_changes JSONB,
response, response_by,
status, resolved_at,
created_at, updated_at
```

#### offer_terms
```sql
id, org_id, offer_id,
term_type, term_name, term_value,
is_negotiable, display_order,
created_at, updated_at
```

### tRPC Router Analysis
**File:** `src/server/routers/ats.ts` lines 3169-3812

**Existing Procedures (7):**
| Procedure | Lines | Status |
|-----------|-------|--------|
| `offers.getById` | 3169-3250 | **WORKING** |
| `offers.list` | 3252-3400 | **WORKING** |
| `offers.create` | 3402-3520 | **WORKING** |
| `offers.send` | 3522-3600 | **WORKING** |
| `offers.updateStatus` | 3602-3680 | **WORKING** |
| `offers.negotiate` | 3682-3750 | **WORKING** |
| `offers.requestApproval` | 3752-3812 | **WORKING** |

### Frontend Components
**List Page:** `src/app/employee/recruiting/offers/page.tsx` - **EXISTS**
**Detail Page:** `src/app/employee/recruiting/offers/[id]/page.tsx` - **EXISTS**
**Wizard:** `src/app/employee/recruiting/offers/extend/page.tsx` - **EXISTS**
**Store:** `src/stores/extend-offer-store.ts` - **EXISTS**
**Components:** `src/components/recruiting/offers/` - Multiple components exist

### Verification Checklist
- [x] Database schema complete
- [x] tRPC procedures implemented
- [x] List page functional
- [x] Detail page functional
- [x] Creation wizard functional
- [x] Status transitions working
- [x] Approval workflow functional
- [x] Negotiation tracking functional

### Recommendation
**NO IMPLEMENTATION REQUIRED.** Update the master guide to mark OFFERS-01 as COMPLETE.

---

## PLACEMENTS-01: Placements Migration Analysis

### Current Schema Location
- **Primary:** `supabase/migrations/00000000000000_baseline.sql` lines 22294-22355
- **Table:** `placements`

### Existing Columns
```sql
id, org_id, job_id, submission_id, offer_id,
candidate_id, consultant_id,  -- DUAL reference issue
status, placement_type,
start_date, end_date, duration_weeks,
bill_rate, pay_rate, ot_bill_rate, ot_pay_rate,
fee_type, fee_percentage, fee_amount,
client_manager_id, account_manager_id,
work_location, remote_percentage,
created_at, updated_at, deleted_at
```

### Legacy References (Need Migration)
1. **`candidate_id`** AND **`consultant_id`** → consolidate to `contact_id`
2. **`client_manager_id`** → unclear reference, needs mapping

### Required New Columns
Per PLACEMENTS-01 specification:
```sql
-- Unified contact reference
contact_id UUID REFERENCES contacts(id)  -- THE person being placed

-- Company references (C2C tracking)
client_company_id UUID REFERENCES companies(id)
work_site_company_id UUID REFERENCES companies(id)  -- May differ from client
vendor_company_id UUID REFERENCES companies(id)  -- For vendor placements
sub_vendor_company_id UUID REFERENCES companies(id)  -- For sub-vendor chain

-- Enhanced status
status VARCHAR  -- 'pending_start', 'active', 'on_hold', 'ending', 'completed', 'terminated'
status_reason TEXT
status_changed_at TIMESTAMPTZ
status_changed_by UUID REFERENCES user_profiles(id)

-- Contract reference
contract_id UUID REFERENCES contracts(id)

-- Rate card reference
rate_card_id UUID REFERENCES rate_cards(id)

-- Change tracking
original_end_date DATE
extension_count INTEGER DEFAULT 0
last_extension_date DATE
```

### New Tables Required
```sql
-- Track placement modifications
CREATE TABLE placement_change_orders (
  id, org_id, placement_id,
  change_type,  -- 'extension', 'rate_change', 'conversion', 'termination', 'location_change'
  effective_date DATE,
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  document_id UUID REFERENCES documents(id),
  created_at, created_by
)

-- For C2C vendor chain tracking
CREATE TABLE placement_vendors (
  id, org_id, placement_id,
  vendor_company_id UUID REFERENCES companies(id),
  vendor_type,  -- 'primary', 'sub_vendor', 'end_client'
  position_in_chain INTEGER,
  bill_rate NUMERIC(10,2),
  pay_rate NUMERIC(10,2),
  markup_percentage NUMERIC(5,2),
  created_at, updated_at
)
```

### tRPC Router Analysis
**File:** `src/server/routers/ats.ts` lines 3817-4670

**Existing Procedures (8):**
| Procedure | Lines | Status |
|-----------|-------|--------|
| `placements.getById` | 3817-3900 | Needs contact_id |
| `placements.list` | 3902-4050 | Needs update |
| `placements.create` | 4052-4200 | Needs company refs |
| `placements.update` | 4202-4300 | Needs update |
| `placements.updateStatus` | 4302-4380 | Working |
| `placements.extend` | 4382-4480 | Needs change order |
| `placements.terminate` | 4482-4560 | Needs change order |
| `placements.getFinancials` | 4562-4670 | Working |

### Frontend Components
**List Page:** `src/app/employee/recruiting/placements/page.tsx`
**Detail Page:** `src/app/employee/recruiting/placements/[id]/page.tsx`

### Existing Placement Milestones System
The placement onboarding (milestones) system **already exists**:
- `src/components/recruiting/placements/PlacementMilestones.tsx`
- Milestone types: background_check, drug_screen, i9_verification, etc.

### Migration Approach
1. Add new columns (non-breaking)
2. Consolidate `candidate_id`/`consultant_id` to `contact_id`
3. Data migration: determine logic for which ID to use
4. Add company reference columns
5. Create `placement_change_orders` table
6. Create `placement_vendors` table
7. Update tRPC procedures
8. Update frontend for company selectors

---

## ONBOARDING-01: Onboarding System Analysis

### FINDING: Multiple Onboarding Systems Exist

The codebase has **three distinct onboarding contexts**:

| Type | Status | Purpose |
|------|--------|---------|
| Account Onboarding | COMPLETE | New client account setup |
| Placement Onboarding | COMPLETE | Placement milestones |
| Employee Onboarding | SCHEMA ONLY | Internal employee onboarding |

### 1. Account Onboarding (COMPLETE)

**Store:** `src/stores/account-onboarding-store.ts`
**Wizard:** `src/app/employee/recruiting/accounts/onboard/page.tsx`
**Steps:** 6 steps with localStorage persistence

This is for onboarding new **client accounts**, not consultants.

### 2. Placement Onboarding / Milestones (COMPLETE)

**Component:** `src/components/recruiting/placements/PlacementMilestones.tsx`
**Table:** `placement_milestones` in baseline migration

This tracks pre-start requirements for a **placement**:
- Background check
- Drug screening
- I-9 verification
- Equipment provisioning
- System access setup

### 3. Employee Onboarding (SCHEMA ONLY - Needs Implementation)

**Schema:** Tables exist in baseline migration
- `onboarding_templates`
- `onboarding_checklists`
- `onboarding_tasks`
- `onboarding_task_completions`

**Router:** `src/server/routers/hr.ts` - NO onboarding procedures found
**UI:** None exists

### ONBOARDING-01 Specification Analysis

The spec in `thoughts/shared/issues/onboarding-01` describes **consultant onboarding** for placements, which overlaps with the existing placement milestones system.

However, it also describes **employee onboarding** which doesn't exist:

#### Required for Consultant Onboarding (Partially Exists)
- Pre-start checklist → **EXISTS** as placement_milestones
- Document collection → **EXISTS** via documents table
- Compliance verification → **EXISTS** via compliance tables (WAVE 3)

#### Required for Employee Onboarding (NEEDS IMPLEMENTATION)
```typescript
// tRPC procedures needed in hr.ts
onboarding.getTemplates
onboarding.createTemplate
onboarding.assignChecklist
onboarding.getChecklist
onboarding.completeTask
onboarding.getProgress
```

#### Frontend Needed
- `/employee/hr/onboarding/` - Onboarding dashboard
- `/employee/hr/onboarding/templates/` - Template management
- `/employee/hr/onboarding/[employeeId]/` - Employee checklist view

### Migration Approach
1. **For Consultant Onboarding:** Leverage existing placement_milestones
2. **For Employee Onboarding:**
   - Implement tRPC procedures in `hr.ts`
   - Create UI components
   - Wire up to existing schema

---

## Cross-Cutting Patterns

### Pattern 1: Dual Reference Transition

The codebase is transitioning from legacy references to unified system:

| Legacy | New | Tables Affected |
|--------|-----|-----------------|
| `candidate_id` | `contact_id` | submissions, interviews, offers, placements |
| `account_id` | `company_id` / `client_company_id` | jobs, placements |
| `consultant_id` | `contact_id` | placements |

**Migration SQL Pattern:**
```sql
-- Step 1: Add new column
ALTER TABLE submissions ADD COLUMN contact_id UUID REFERENCES contacts(id);

-- Step 2: Migrate data
UPDATE submissions s
SET contact_id = c.id
FROM candidates cand
JOIN contacts c ON c.primary_email = cand.email AND c.org_id = cand.org_id
WHERE s.candidate_id = cand.id;

-- Step 3: Create backward-compat view
CREATE VIEW submissions_legacy_v AS
SELECT *, contact_id as candidate_id FROM submissions;

-- Step 4 (later): Drop old column
ALTER TABLE submissions DROP COLUMN candidate_id;
```

### Pattern 2: Status Transition Matrix

All entity status changes should follow explicit transition rules:

```typescript
// src/lib/status-transitions/submission-status.ts
export const SUBMISSION_STATUS_TRANSITIONS: Record<string, string[]> = {
  'submitted': ['screening', 'rejected', 'withdrawn'],
  'screening': ['technical_interview', 'rejected', 'withdrawn'],
  'technical_interview': ['client_interview', 'rejected', 'withdrawn'],
  'client_interview': ['offer_pending', 'rejected', 'withdrawn', 'on_hold'],
  'offer_pending': ['offer_extended', 'rejected', 'withdrawn'],
  'offer_extended': ['offer_accepted', 'rejected', 'withdrawn'],
  'offer_accepted': ['placed', 'withdrawn'],
  'placed': [], // Terminal state
  'rejected': [], // Terminal state
  'withdrawn': [], // Terminal state
  'on_hold': ['client_interview', 'withdrawn'],
}
```

### Pattern 3: Polymorphic Entity Tables

Used for notes, documents, activities, history:

```typescript
// Entity type registry
type EntityType =
  | 'job' | 'submission' | 'interview' | 'offer' | 'placement'
  | 'account' | 'contact' | 'campaign' | 'lead' | 'deal'
  | 'consultant' | 'vendor' | 'employee'

// Query pattern
const notes = await db.query.notes.findMany({
  where: and(
    eq(notes.entity_type, 'submission'),
    eq(notes.entity_id, submissionId),
    isNull(notes.deleted_at)
  )
})
```

### Pattern 4: Entity History Tracking

Three tiers of history:

1. **Entity-specific tables** (e.g., `submission_status_history`)
   - Quick status tracking
   - Optimized queries

2. **Unified `entity_history` table**
   - Cross-entity history
   - Polymorphic (entity_type/entity_id)

3. **`audit_log` table**
   - Security/compliance
   - Captures all changes

**Migration Pattern:** Consolidate entity-specific history to `entity_history`

### Pattern 5: Rate Handling

Current: Inline rates (`bill_rate`, `pay_rate` on submission/placement)
Target: Rate cards + `entity_rates`

```typescript
// New pattern
const rate = await db.query.entity_rates.findFirst({
  where: and(
    eq(entity_rates.entity_type, 'submission'),
    eq(entity_rates.entity_id, submissionId),
    eq(entity_rates.is_current, true)
  )
})

// With rate card reference
const rate = await db.query.entity_rates.findFirst({
  where: and(
    eq(entity_rates.entity_type, 'submission'),
    eq(entity_rates.entity_id, submissionId)
  ),
  with: {
    rate_card_item: {
      with: {
        rate_card: true
      }
    }
  }
})
```

---

## Implementation Recommendations

### Priority Order

1. **Skip OFFERS-01** - Already complete
2. **JOBS-01** - Foundation for other entities
3. **SUBMISSIONS-01** - Core pipeline entity
4. **INTERVIEWS-01** - Lower complexity
5. **PLACEMENTS-01** - Depends on submissions
6. **ONBOARDING-01 (Employee only)** - Independent

### Recommended Phases

#### Phase A: Foundation (JOBS-01)
- Add company/contact columns to jobs
- Update tRPC procedures
- Update frontend forms
- Estimated: 2-3 days implementation

#### Phase B: Pipeline Core (SUBMISSIONS-01)
- Rename candidate_id to contact_id
- Add vendor submission tracking
- Create feedback/RTR tables
- Update status values
- Estimated: 3-4 days implementation

#### Phase C: Interview Enhancement (INTERVIEWS-01)
- Add contact_id (derived)
- Create participants table
- Create feedback table
- Create scorecards
- Estimated: 2-3 days implementation

#### Phase D: Placement Migration (PLACEMENTS-01)
- Consolidate candidate_id/consultant_id
- Add company references
- Create change orders table
- Create vendors table
- Estimated: 2-3 days implementation

#### Phase E: Employee Onboarding (ONBOARDING-01)
- Implement tRPC procedures
- Create UI components
- Wire to existing schema
- Estimated: 2-3 days implementation

### Testing Strategy

Each phase should include:
1. Migration script testing on staging
2. tRPC procedure unit tests
3. Frontend integration tests
4. Backward compatibility verification
5. Performance benchmarks

---

## File Reference Index

### Database Migrations
| File | Content |
|------|---------|
| `supabase/migrations/00000000000000_baseline.sql` | All core tables |
| `supabase/migrations/20251212100000_create_compliance_system.sql` | Compliance (WAVE 3) |
| `supabase/migrations/20251212100100_create_contracts_system.sql` | Contracts (WAVE 3) |
| `supabase/migrations/20251212100200_create_rates_system.sql` | Rates (WAVE 3) |

### tRPC Routers
| File | Entities |
|------|----------|
| `src/server/routers/ats.ts` | Jobs, Submissions, Interviews, Offers, Placements |
| `src/server/routers/hr.ts` | Employees, Onboarding (schema exists, procedures missing) |
| `src/server/routers/compliance.ts` | Compliance system |
| `src/server/routers/contracts.ts` | Contracts system |
| `src/server/routers/rates.ts` | Rates system |

### Stores (Zustand)
| File | Purpose |
|------|---------|
| `src/stores/job-intake-store.ts` | Job creation wizard |
| `src/stores/schedule-interview-store.ts` | Interview scheduling |
| `src/stores/extend-offer-store.ts` | Offer extension wizard |
| `src/stores/submit-to-client-store.ts` | Submission to client |
| `src/stores/account-onboarding-store.ts` | Account onboarding |

### Frontend Pages
| Path | Entity |
|------|--------|
| `src/app/employee/recruiting/jobs/` | Jobs list/detail |
| `src/app/employee/recruiting/submissions/` | Submissions list/detail |
| `src/app/employee/recruiting/interviews/` | Interviews list/detail |
| `src/app/employee/recruiting/offers/` | Offers list/detail |
| `src/app/employee/recruiting/placements/` | Placements list/detail |

### Configuration Files
| File | Purpose |
|------|---------|
| `src/configs/entities/jobs.config.ts` | Jobs list config |
| `src/lib/navigation/entity-journeys.ts` | Journey navigation |
| `src/lib/navigation/entity-sections.ts` | Section navigation |

---

## Appendix: Schema Change Summary

### New Tables Required (WAVE 4)
1. `submission_feedback` - Unified feedback
2. `submission_rtr` - RTR tracking
3. `interview_participants` - Multi-interviewer
4. `interview_feedback` - Enhanced feedback
5. `interview_scorecards` - Scorecard templates
6. `placement_change_orders` - Change tracking
7. `placement_vendors` - Vendor chain

### Column Additions Summary
- **jobs:** 8 new columns (company/contact refs, fee structure)
- **submissions:** 20+ new columns (vendor, RTR, scoring, status)
- **interviews:** 2 new columns (contact_id, room_id)
- **placements:** 12 new columns (contact, companies, contract)

### Column Renames/Drops
- `submissions.candidate_id` → `contact_id`
- `placements.candidate_id` + `consultant_id` → `contact_id`
- `jobs.account_id` → `client_company_id` (if exists)

---

*End of Research Document*
