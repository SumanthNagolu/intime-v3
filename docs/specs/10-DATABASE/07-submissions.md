# Submissions Table Specification

## Overview

| Property | Value |
|----------|-------|
| Table Name | `submissions` |
| Schema | `public` |
| Purpose | Track candidate submissions through the ATS workflow from sourcing to placement |
| Primary Owner | Recruiter |
| RLS Enabled | Yes |
| Soft Delete | Yes (`deleted_at`) |
| Unique Constraint | One submission per job-candidate pair |

---

## Table Definition

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Associations
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  account_id UUID REFERENCES accounts(id),

  -- Submission workflow stage
  status TEXT NOT NULL DEFAULT 'sourced',

  -- Match scoring
  ai_match_score INTEGER,
  recruiter_match_score INTEGER,
  match_explanation TEXT,

  -- Submission details
  submitted_rate NUMERIC(10,2),
  submitted_rate_type TEXT DEFAULT 'hourly',
  submission_notes TEXT,

  -- Vendor submission tracking (internal approval before client submission)
  vendor_submitted_at TIMESTAMPTZ,
  vendor_submitted_by UUID REFERENCES user_profiles(id),
  vendor_decision TEXT,
  vendor_decision_at TIMESTAMPTZ,
  vendor_decision_by UUID REFERENCES user_profiles(id),
  vendor_notes TEXT,
  vendor_screening_notes TEXT,
  vendor_screening_completed_at TIMESTAMPTZ,

  -- Client submission tracking
  submitted_to_client_at TIMESTAMPTZ,
  submitted_to_client_by UUID REFERENCES user_profiles(id),
  client_resume_file_id UUID,
  client_profile_url TEXT,
  client_decision TEXT,
  client_decision_at TIMESTAMPTZ,
  client_decision_notes TEXT,

  -- Interview tracking
  interview_count INTEGER DEFAULT 0,
  last_interview_date TIMESTAMPTZ,
  interview_feedback TEXT,

  -- Offer tracking
  offer_extended_at TIMESTAMPTZ,
  offer_accepted_at TIMESTAMPTZ,
  offer_declined_at TIMESTAMPTZ,
  offer_decline_reason TEXT,

  -- Rejection
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  rejection_source TEXT,

  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT unique_job_candidate UNIQUE(job_id, candidate_id)
);
```

---

## Submission Workflow

### Status Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SUBMISSION WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   SOURCED    │ ← Candidate identified for job
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  SCREENING   │ ← Recruiter reviewing candidate
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    VENDOR APPROVAL STAGE                              │
│  (Internal approval before submitting to client)                     │
└──────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────┐
│ VENDOR_PENDING  │ ← Submitted to manager for approval
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│VENDOR_SCREENING │ ← Manager reviewing submission
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│VENDOR_ │ │VENDOR_ │
│ACCEPTED│ │REJECTED│ → END
└───┬────┘ └────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    CLIENT SUBMISSION STAGE                            │
└──────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────┐
│SUBMITTED_TO_     │ ← Submitted to client
│    CLIENT        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  CLIENT_REVIEW   │ ← Client reviewing candidate
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│CLIENT_ │ │CLIENT_ │
│ACCEPTED│ │REJECTED│ → END
└───┬────┘ └────────┘
    │
    ▼
┌──────────────────┐
│CLIENT_INTERVIEW  │ ← Client interviewing candidate
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  OFFER_STAGE     │ ← Offer being prepared/negotiated
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     PLACED       │ ← Candidate placed! 🎉
└──────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    TERMINAL STATES (ANY STAGE)                        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│    REJECTED      │ ← Rejected at any stage
└──────────────────┘

┌──────────────────┐
│   WITHDRAWN      │ ← Candidate withdrew from process
└──────────────────┘
```

### Status Transition Rules

| From Status | To Status | Trigger | Required Fields | Auto-set Fields |
|-------------|-----------|---------|-----------------|-----------------|
| `sourced` | `screening` | Recruiter reviews | - | - |
| `screening` | `vendor_pending` | Submit for approval | `submission_notes` | `vendor_submitted_at`, `vendor_submitted_by` |
| `vendor_pending` | `vendor_screening` | Manager starts review | - | - |
| `vendor_screening` | `vendor_accepted` | Manager approves | `vendor_decision`, `vendor_decision_by` | `vendor_decision_at` |
| `vendor_screening` | `vendor_rejected` | Manager rejects | `vendor_decision`, `vendor_notes` | `vendor_decision_at`, `rejected_at` |
| `vendor_accepted` | `submitted_to_client` | Submit to client | `client_resume_file_id` OR `client_profile_url` | `submitted_to_client_at`, `submitted_to_client_by` |
| `submitted_to_client` | `client_review` | Client reviewing | - | - |
| `client_review` | `client_accepted` | Client approves | `client_decision` | `client_decision_at` |
| `client_review` | `client_rejected` | Client rejects | `client_decision`, `client_decision_notes` | `client_decision_at`, `rejected_at` |
| `client_accepted` | `client_interview` | Interview scheduled | - | - |
| `client_interview` | `offer_stage` | Offer being prepared | - | - |
| `offer_stage` | `placed` | Offer accepted | `offer_accepted_at` | - |
| Any | `rejected` | Rejection | `rejection_reason`, `rejection_source` | `rejected_at` |
| Any | `withdrawn` | Candidate withdraws | `rejection_reason` | `rejected_at` |

---

## Field Specifications

### id
| Property | Value |
|----------|-------|
| Column Name | `id` |
| Type | `UUID` |
| Required | Yes (auto-generated) |
| Default | `gen_random_uuid()` |
| Primary Key | Yes |
| Description | Unique identifier for the submission |
| UI Display | Hidden (used in URLs) |

---

### org_id
| Property | Value |
|----------|-------|
| Column Name | `org_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `organizations(id)` |
| On Delete | CASCADE |
| Description | Organization this submission belongs to (multi-tenancy) |
| UI Display | Hidden (auto-set from session) |
| RLS | Used in isolation policy |

---

### job_id
| Property | Value |
|----------|-------|
| Column Name | `job_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `jobs(id)` |
| Description | Job this candidate is being submitted for |
| UI Label | "Job" |
| UI Type | Searchable Dropdown |
| UI Placeholder | "Search jobs..." |
| Validation | Must be active job in same org |
| Index | Yes (`idx_submissions_job_id`) |
| Unique With | `candidate_id` |

---

### candidate_id
| Property | Value |
|----------|-------|
| Column Name | `candidate_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `user_profiles(id)` |
| Description | Candidate being submitted |
| UI Label | "Candidate" |
| UI Type | Searchable Dropdown |
| UI Placeholder | "Search candidates..." |
| Validation | Must be candidate in same org |
| Index | Yes (`idx_submissions_candidate_id`) |
| Unique With | `job_id` |

---

### account_id
| Property | Value |
|----------|-------|
| Column Name | `account_id` |
| Type | `UUID` |
| Required | No (can be derived from job) |
| Foreign Key | `accounts(id)` |
| Description | Client account (denormalized from job) |
| UI Display | Display only |
| Auto-populate | From job.account_id on create |
| Index | Yes (`idx_submissions_account_id`) |

---

### status
| Property | Value |
|----------|-------|
| Column Name | `status` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'sourced'` |
| Allowed Values | See Status Enum below |
| Description | Current stage in submission workflow |
| UI Label | "Status" |
| UI Type | Status Badge / Dropdown (for manual change) |
| Index | Yes (`idx_submissions_status`) |

**Status Enum:**

| Value | Display Label | Color | Stage | Description |
|-------|---------------|-------|-------|-------------|
| `sourced` | Sourced | Gray | Initial | Candidate identified for job |
| `screening` | Screening | Blue | Initial | Recruiter reviewing candidate |
| `vendor_pending` | Pending Approval | Yellow | Vendor | Awaiting manager approval |
| `vendor_screening` | Under Review | Yellow | Vendor | Manager reviewing submission |
| `vendor_accepted` | Approved | Green | Vendor | Manager approved submission |
| `vendor_rejected` | Internal Rejection | Red | Vendor | Manager rejected submission |
| `submitted_to_client` | Submitted | Purple | Client | Submitted to client |
| `client_review` | Client Review | Purple | Client | Client reviewing candidate |
| `client_accepted` | Client Accepted | Green | Client | Client approved candidate |
| `client_rejected` | Client Rejected | Red | Client | Client rejected candidate |
| `client_interview` | Interviewing | Indigo | Client | Client interviewing candidate |
| `offer_stage` | Offer Stage | Teal | Final | Offer being prepared/negotiated |
| `placed` | Placed | Emerald | Final | Candidate placed successfully |
| `rejected` | Rejected | Red | Terminal | Rejected at any stage |
| `withdrawn` | Withdrawn | Gray | Terminal | Candidate withdrew |

---

### ai_match_score
| Property | Value |
|----------|-------|
| Column Name | `ai_match_score` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 100 |
| Description | AI-calculated match score (0-100) |
| UI Label | "AI Match" |
| UI Type | Progress Bar / Score Badge |
| UI Display | Show with icon: "🤖 85%" |
| Auto-calculate | Via AI matching service on create |

**Match Score Ranges:**
| Range | Label | Color | Description |
|-------|-------|-------|-------------|
| 90-100 | Excellent Match | Green | Highly qualified |
| 75-89 | Good Match | Blue | Well qualified |
| 60-74 | Fair Match | Yellow | Moderately qualified |
| 40-59 | Weak Match | Orange | Questionable fit |
| 0-39 | Poor Match | Red | Not recommended |

---

### recruiter_match_score
| Property | Value |
|----------|-------|
| Column Name | `recruiter_match_score` |
| Type | `INTEGER` |
| Required | No |
| Min | 0 |
| Max | 100 |
| Description | Recruiter's manual match assessment (0-100) |
| UI Label | "Recruiter Score" |
| UI Type | Slider / Number Input |
| UI Display | Show with icon: "👤 90%" |

---

### match_explanation
| Property | Value |
|----------|-------|
| Column Name | `match_explanation` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 |
| Description | AI-generated explanation of match score |
| UI Label | "Match Analysis" |
| UI Type | Display only (read-only text) |
| UI Section | Match Details (expandable) |
| Auto-generate | Via AI on create/update |

---

### submitted_rate
| Property | Value |
|----------|-------|
| Column Name | `submitted_rate` |
| Type | `NUMERIC(10,2)` |
| Required | Yes (before submitting to client) |
| Min | 0 |
| Precision | 2 decimal places |
| Description | Rate being submitted to client |
| UI Label | "Submitted Rate" |
| UI Type | Currency Input |
| UI Prefix | "$" |
| UI Suffix | Based on `submitted_rate_type` |
| Validation | Must be positive number |
| Validation | Should be within job rate range (warning if outside) |

---

### submitted_rate_type
| Property | Value |
|----------|-------|
| Column Name | `submitted_rate_type` |
| Type | `TEXT` |
| Required | Yes |
| Default | `'hourly'` |
| Allowed Values | `hourly`, `daily`, `weekly`, `monthly`, `annual` |
| Description | Rate period |
| UI Label | "Rate Type" |
| UI Type | Radio Buttons |
| Auto-populate | From job.rate_type on create |

**Enum Values:**
| Value | Display Label | Rate Suffix |
|-------|---------------|-------------|
| `hourly` | Hourly | /hr |
| `daily` | Daily | /day |
| `weekly` | Weekly | /week |
| `monthly` | Monthly | /month |
| `annual` | Annual | /year |

---

### submission_notes
| Property | Value |
|----------|-------|
| Column Name | `submission_notes` |
| Type | `TEXT` |
| Required | Yes (before vendor submission) |
| Max Length | 5000 |
| Description | Recruiter's notes about why candidate is a good fit |
| UI Label | "Submission Notes" |
| UI Type | Textarea |
| UI Placeholder | "Explain why this candidate is a good match..." |
| UI Rows | 6 |

---

### vendor_submitted_at
| Property | Value |
|----------|-------|
| Column Name | `vendor_submitted_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When submission was sent for internal approval |
| UI Display | Display only, formatted |
| Auto-set | When status changes to `vendor_pending` |

---

### vendor_submitted_by
| Property | Value |
|----------|-------|
| Column Name | `vendor_submitted_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | Recruiter who submitted for approval |
| UI Display | Display only (show name/avatar) |
| Auto-set | Current user when submitting for approval |

---

### vendor_decision
| Property | Value |
|----------|-------|
| Column Name | `vendor_decision` |
| Type | `TEXT` |
| Required | Yes (when manager reviews) |
| Allowed Values | `pending`, `accepted`, `rejected` |
| Description | Manager's decision on submission |
| UI Label | "Decision" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Color |
|-------|---------------|-------|
| `pending` | Pending | Yellow |
| `accepted` | Accepted | Green |
| `rejected` | Rejected | Red |

---

### vendor_decision_at
| Property | Value |
|----------|-------|
| Column Name | `vendor_decision_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When manager made decision |
| UI Display | Display only, formatted |
| Auto-set | When vendor_decision is set to accepted/rejected |

---

### vendor_decision_by
| Property | Value |
|----------|-------|
| Column Name | `vendor_decision_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | Manager who made decision |
| UI Display | Display only (show name/avatar) |
| Auto-set | Current user when making decision |

---

### vendor_notes
| Property | Value |
|----------|-------|
| Column Name | `vendor_notes` |
| Type | `TEXT` |
| Required | Yes (if rejected) |
| Max Length | 2000 |
| Description | Manager's notes about decision |
| UI Label | "Manager Notes" |
| UI Type | Textarea |
| UI Placeholder | "Explain your decision..." |

---

### vendor_screening_notes
| Property | Value |
|----------|-------|
| Column Name | `vendor_screening_notes` |
| Type | `TEXT` |
| Required | No |
| Max Length | 2000 |
| Description | Manager's screening/review notes |
| UI Label | "Screening Notes" |
| UI Type | Textarea |
| UI Section | Internal Use Only |

---

### vendor_screening_completed_at
| Property | Value |
|----------|-------|
| Column Name | `vendor_screening_completed_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When manager completed screening |
| UI Display | Display only |
| Auto-set | When status changes from `vendor_screening` |

---

### submitted_to_client_at
| Property | Value |
|----------|-------|
| Column Name | `submitted_to_client_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When submission was sent to client |
| UI Display | Display only, formatted |
| Auto-set | When status changes to `submitted_to_client` |

---

### submitted_to_client_by
| Property | Value |
|----------|-------|
| Column Name | `submitted_to_client_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | Who submitted to client |
| UI Display | Display only (show name/avatar) |
| Auto-set | Current user when submitting to client |

---

### client_resume_file_id
| Property | Value |
|----------|-------|
| Column Name | `client_resume_file_id` |
| Type | `UUID` |
| Required | Conditionally (if not using URL) |
| Description | Reference to resume file uploaded for client |
| UI Label | "Client Resume" |
| UI Type | File Upload |
| Accepted Types | .pdf, .doc, .docx |
| Max Size | 5 MB |
| Storage | Supabase Storage bucket: `client-resumes` |
| Either/Or | Must have this OR `client_profile_url` |

---

### client_profile_url
| Property | Value |
|----------|-------|
| Column Name | `client_profile_url` |
| Type | `TEXT` |
| Required | Conditionally (if not using file) |
| Max Length | 500 |
| Description | URL to candidate profile (e.g., vendor portal) |
| UI Label | "Profile URL" |
| UI Type | Text Input (URL) |
| UI Placeholder | "https://..." |
| Validation | Must be valid URL |
| Either/Or | Must have this OR `client_resume_file_id` |

---

### client_decision
| Property | Value |
|----------|-------|
| Column Name | `client_decision` |
| Type | `TEXT` |
| Required | Yes (when client reviews) |
| Allowed Values | `pending`, `accepted`, `rejected` |
| Description | Client's decision on candidate |
| UI Label | "Client Decision" |
| UI Type | Radio Buttons |

**Enum Values:**
| Value | Display Label | Color |
|-------|---------------|-------|
| `pending` | Pending | Yellow |
| `accepted` | Accepted | Green |
| `rejected` | Rejected | Red |

---

### client_decision_at
| Property | Value |
|----------|-------|
| Column Name | `client_decision_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When client made decision |
| UI Display | Display only, formatted |
| Auto-set | When client_decision is set to accepted/rejected |

---

### client_decision_notes
| Property | Value |
|----------|-------|
| Column Name | `client_decision_notes` |
| Type | `TEXT` |
| Required | Yes (if rejected) |
| Max Length | 2000 |
| Description | Client's feedback/notes |
| UI Label | "Client Feedback" |
| UI Type | Textarea |
| UI Placeholder | "Client feedback..." |

---

### interview_count
| Property | Value |
|----------|-------|
| Column Name | `interview_count` |
| Type | `INTEGER` |
| Required | No |
| Default | 0 |
| Min | 0 |
| Description | Number of interviews conducted |
| UI Label | "Interviews" |
| UI Type | Display only (auto-incremented) |
| Auto Update | Incremented when interview created |

---

### last_interview_date
| Property | Value |
|----------|-------|
| Column Name | `last_interview_date` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | Date of most recent interview |
| UI Label | "Last Interview" |
| UI Type | Display only, formatted |
| Auto Update | Set to latest interview date |

---

### interview_feedback
| Property | Value |
|----------|-------|
| Column Name | `interview_feedback` |
| Type | `TEXT` |
| Required | No |
| Max Length | 5000 |
| Description | Consolidated interview feedback |
| UI Label | "Interview Feedback" |
| UI Type | Textarea (read-only display) |
| Auto Update | Aggregated from interviews table |

---

### offer_extended_at
| Property | Value |
|----------|-------|
| Column Name | `offer_extended_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When offer was extended to candidate |
| UI Label | "Offer Extended" |
| UI Type | Display only, formatted |
| Auto-set | When offer created with status 'sent' |

---

### offer_accepted_at
| Property | Value |
|----------|-------|
| Column Name | `offer_accepted_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes (for placement) |
| Description | When candidate accepted offer |
| UI Label | "Offer Accepted" |
| UI Type | Display only, formatted |
| Auto-set | When offer status changes to 'accepted' |

---

### offer_declined_at
| Property | Value |
|----------|-------|
| Column Name | `offer_declined_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When candidate declined offer |
| UI Label | "Offer Declined" |
| UI Type | Display only, formatted |
| Auto-set | When offer status changes to 'declined' |

---

### offer_decline_reason
| Property | Value |
|----------|-------|
| Column Name | `offer_decline_reason` |
| Type | `TEXT` |
| Required | Yes (if offer declined) |
| Max Length | 1000 |
| Description | Why candidate declined offer |
| UI Label | "Decline Reason" |
| UI Type | Textarea |
| UI Placeholder | "Reason for declining..." |

---

### rejected_at
| Property | Value |
|----------|-------|
| Column Name | `rejected_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Description | When submission was rejected |
| UI Display | Display only, formatted |
| Auto-set | When status changes to rejected/vendor_rejected/client_rejected |

---

### rejection_reason
| Property | Value |
|----------|-------|
| Column Name | `rejection_reason` |
| Type | `TEXT` |
| Required | Yes (when rejected) |
| Max Length | 2000 |
| Description | Reason for rejection |
| UI Label | "Rejection Reason" |
| UI Type | Textarea |
| UI Placeholder | "Explain rejection reason..." |

---

### rejection_source
| Property | Value |
|----------|-------|
| Column Name | `rejection_source` |
| Type | `TEXT` |
| Required | Yes (when rejected) |
| Allowed Values | `recruiter`, `vendor`, `client`, `candidate` |
| Description | Who rejected the submission |
| UI Label | "Rejected By" |
| UI Type | Display Badge |

**Enum Values:**
| Value | Display Label | Color |
|-------|---------------|-------|
| `recruiter` | Recruiter | Gray |
| `vendor` | Internal/Manager | Orange |
| `client` | Client | Red |
| `candidate` | Candidate | Blue |

---

### owner_id
| Property | Value |
|----------|-------|
| Column Name | `owner_id` |
| Type | `UUID` |
| Required | Yes |
| Foreign Key | `user_profiles(id)` |
| Description | Primary owner/recruiter for this submission |
| UI Label | "Owner" |
| UI Type | User Select |
| Default | Current user (on create) |
| Index | Yes (`idx_submissions_owner_id`) |

---

### created_at
| Property | Value |
|----------|-------|
| Column Name | `created_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Description | Timestamp of submission creation |
| UI Display | Display only, formatted |

---

### updated_at
| Property | Value |
|----------|-------|
| Column Name | `updated_at` |
| Type | `TIMESTAMPTZ` |
| Required | Yes |
| Default | `NOW()` |
| Auto Update | Yes (via trigger) |
| Description | Timestamp of last update |
| UI Display | Display only, formatted |

---

### created_by
| Property | Value |
|----------|-------|
| Column Name | `created_by` |
| Type | `UUID` |
| Required | No |
| Foreign Key | `user_profiles(id)` |
| Description | User who created the submission |
| UI Display | Display only |

---

### deleted_at
| Property | Value |
|----------|-------|
| Column Name | `deleted_at` |
| Type | `TIMESTAMPTZ` |
| Required | No |
| Default | NULL |
| Description | Soft delete timestamp |
| UI Display | Hidden |
| Query Filter | `WHERE deleted_at IS NULL` |

---

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `submissions_pkey` | `id` | BTREE | Primary key |
| `idx_submissions_org_id` | `org_id` | BTREE | Tenant filtering |
| `idx_submissions_job_id` | `job_id` | BTREE | Job lookup |
| `idx_submissions_candidate_id` | `candidate_id` | BTREE | Candidate lookup |
| `idx_submissions_account_id` | `account_id` | BTREE | Account lookup |
| `idx_submissions_owner_id` | `owner_id` | BTREE | Owner lookup |
| `idx_submissions_status` | `status` | BTREE | Status filtering |
| `idx_submissions_deleted_at` | `deleted_at` | BTREE | Soft delete (WHERE NULL) |
| `idx_submissions_unique_job_candidate` | `job_id, candidate_id` | UNIQUE | Prevent duplicate submissions |
| `idx_submissions_vendor_submitted_at` | `vendor_submitted_at` | BTREE | Vendor tracking reports |
| `idx_submissions_submitted_to_client_at` | `submitted_to_client_at` | BTREE | Client submission reports |

---

## Constraints

### Unique Constraint
```sql
ALTER TABLE submissions
ADD CONSTRAINT unique_job_candidate UNIQUE(job_id, candidate_id);
```

**Business Rule:** One candidate can only be submitted once per job. If a submission is rejected and the recruiter wants to resubmit, they must update the existing submission record (not create a new one).

### Check Constraints
```sql
-- AI Match Score must be 0-100
ALTER TABLE submissions
ADD CONSTRAINT check_ai_match_score
CHECK (ai_match_score IS NULL OR (ai_match_score >= 0 AND ai_match_score <= 100));

-- Recruiter Match Score must be 0-100
ALTER TABLE submissions
ADD CONSTRAINT check_recruiter_match_score
CHECK (recruiter_match_score IS NULL OR (recruiter_match_score >= 0 AND recruiter_match_score <= 100));

-- Submitted rate must be positive
ALTER TABLE submissions
ADD CONSTRAINT check_submitted_rate
CHECK (submitted_rate IS NULL OR submitted_rate > 0);

-- Interview count must be non-negative
ALTER TABLE submissions
ADD CONSTRAINT check_interview_count
CHECK (interview_count >= 0);

-- Must have either client resume file or profile URL before client submission
ALTER TABLE submissions
ADD CONSTRAINT check_client_submission_docs
CHECK (
  (status NOT IN ('submitted_to_client', 'client_review', 'client_accepted', 'client_rejected', 'client_interview', 'offer_stage', 'placed'))
  OR
  (client_resume_file_id IS NOT NULL OR client_profile_url IS NOT NULL)
);
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Organization isolation
CREATE POLICY "submissions_org_isolation" ON submissions
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Recruiters can see their own submissions
CREATE POLICY "submissions_owner_access" ON submissions
  FOR ALL
  USING (
    owner_id = auth.uid()
    OR created_by = auth.uid()
  );

-- Managers can see all submissions in their org
CREATE POLICY "submissions_manager_access" ON submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND org_id = submissions.org_id
      AND role IN ('admin', 'manager', 'recruiting_manager')
    )
  );
```

---

## Triggers

### Updated At Trigger
```sql
CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Auto-populate Account ID
```sql
CREATE OR REPLACE FUNCTION submissions_auto_account_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate account_id from job if not provided
  IF NEW.account_id IS NULL THEN
    NEW.account_id := (SELECT account_id FROM jobs WHERE id = NEW.job_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_auto_account_id_trigger
  BEFORE INSERT OR UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION submissions_auto_account_id();
```

### Auto-assign RCAI Trigger
```sql
CREATE TRIGGER submissions_auto_rcai
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_rcai();
```

### Interview Count Update
```sql
CREATE OR REPLACE FUNCTION update_submission_interview_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update interview count and last interview date
  UPDATE submissions
  SET
    interview_count = (
      SELECT COUNT(*) FROM interviews
      WHERE submission_id = NEW.submission_id
    ),
    last_interview_date = (
      SELECT MAX(scheduled_at) FROM interviews
      WHERE submission_id = NEW.submission_id
    ),
    updated_at = NOW()
  WHERE id = NEW.submission_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interview_created_update_submission
  AFTER INSERT ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_submission_interview_count();
```

### Status Change Audit
```sql
CREATE OR REPLACE FUNCTION log_submission_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes to audit table
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (
      entity_type,
      entity_id,
      action,
      old_values,
      new_values,
      user_id,
      created_at
    ) VALUES (
      'submission',
      NEW.id,
      'status_change',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      auth.uid(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_status_change_audit
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION log_submission_status_change();
```

---

## Related Tables

| Table | Relationship | FK Column | Description |
|-------|--------------|-----------|-------------|
| organizations | Parent | `org_id` | Organization ownership |
| jobs | Parent | `job_id` | Job this submission is for |
| user_profiles | Parent | `candidate_id` | Candidate being submitted |
| accounts | Parent | `account_id` | Client account |
| user_profiles | Owner | `owner_id` | Submission owner |
| user_profiles | Vendor Submitted By | `vendor_submitted_by` | Who submitted for approval |
| user_profiles | Vendor Decision By | `vendor_decision_by` | Who made approval decision |
| user_profiles | Submitted to Client By | `submitted_to_client_by` | Who submitted to client |
| user_profiles | Created By | `created_by` | Who created submission |
| interviews | Children | `interviews.submission_id` | Related interviews |
| offers | Children | `offers.submission_id` | Related offers |
| placements | Children | `placements.submission_id` | Resulting placement |
| object_owners | RCAI | Polymorphic | Access control |
| activities | Related | Polymorphic | Related activities/tasks |

---

## Business Rules

### 1. One Submission Per Job-Candidate
- **Rule:** A candidate can only be submitted once per job
- **Enforcement:** `UNIQUE(job_id, candidate_id)` constraint
- **UI Behavior:** Show warning if recruiter tries to create duplicate
- **Exception:** None - resubmissions must update existing record

### 2. Status Workflow Enforcement
- **Rule:** Statuses must follow the defined workflow
- **Enforcement:** Application logic in mutations
- **UI Behavior:** Only show valid next statuses in dropdown
- **Example:** Cannot go from `sourced` directly to `submitted_to_client`

### 3. Required Fields by Status
- **Rule:** Certain fields required before status transition
- **Examples:**
  - `submission_notes` required before `vendor_pending`
  - `client_resume_file_id` OR `client_profile_url` required before `submitted_to_client`
  - `vendor_decision` required before `vendor_accepted/rejected`
  - `rejection_reason` required for all rejection statuses

### 4. Auto-populate Denormalized Fields
- **Rule:** Reduce joins by storing commonly needed data
- **Fields:**
  - `account_id` from `jobs.account_id`
  - Match scores calculated on create/update
- **Update:** Via triggers or application logic

### 5. Interview Count Tracking
- **Rule:** Keep accurate count of interviews
- **Enforcement:** Trigger on `interviews` table INSERT
- **Update:** Automatically incremented
- **UI Display:** Show count with drill-down to interview list

### 6. Offer Tracking
- **Rule:** Track offer lifecycle
- **Fields:** `offer_extended_at`, `offer_accepted_at`, `offer_declined_at`
- **Source:** Synced from `offers` table
- **Purpose:** Quick status view without joining

### 7. Rejection Tracking
- **Rule:** Always record why and by whom
- **Required:** `rejection_reason`, `rejection_source`, `rejected_at`
- **Sources:** `recruiter`, `vendor`, `client`, `candidate`
- **UI:** Different forms based on source

### 8. Rate Validation
- **Rule:** Submitted rate should align with job rate range
- **Enforcement:** Soft warning (not hard constraint)
- **UI:** Show warning if outside ±20% of job rate range
- **Example:** Job: $100-120/hr, Warning if submitted rate < $80 or > $144

### 9. Audit Trail
- **Rule:** Track all status changes
- **Enforcement:** Trigger logs to `audit_logs` table
- **Includes:** Old status, new status, timestamp, user
- **UI:** Show timeline of status changes

### 10. Soft Delete Only
- **Rule:** Never hard delete submissions
- **Enforcement:** Application logic + `deleted_at` column
- **Query:** Always filter `WHERE deleted_at IS NULL`
- **Restore:** Set `deleted_at = NULL`

---

## Common Queries

### Active Submissions for a Job
```sql
SELECT
  s.*,
  c.full_name as candidate_name,
  c.email as candidate_email,
  u.full_name as owner_name
FROM submissions s
INNER JOIN user_profiles c ON s.candidate_id = c.id
INNER JOIN user_profiles u ON s.owner_id = u.id
WHERE s.job_id = $1
  AND s.deleted_at IS NULL
  AND s.status NOT IN ('rejected', 'withdrawn', 'vendor_rejected', 'client_rejected')
ORDER BY s.created_at DESC;
```

### Submissions Pending Manager Approval
```sql
SELECT
  s.*,
  j.title as job_title,
  c.full_name as candidate_name,
  u.full_name as submitted_by_name
FROM submissions s
INNER JOIN jobs j ON s.job_id = j.id
INNER JOIN user_profiles c ON s.candidate_id = c.id
INNER JOIN user_profiles u ON s.vendor_submitted_by = u.id
WHERE s.org_id = $1
  AND s.status = 'vendor_pending'
  AND s.deleted_at IS NULL
ORDER BY s.vendor_submitted_at ASC;
```

### Submissions Awaiting Client Response
```sql
SELECT
  s.*,
  j.title as job_title,
  a.name as account_name,
  c.full_name as candidate_name,
  EXTRACT(DAY FROM NOW() - s.submitted_to_client_at) as days_pending
FROM submissions s
INNER JOIN jobs j ON s.job_id = j.id
INNER JOIN accounts a ON s.account_id = a.id
INNER JOIN user_profiles c ON s.candidate_id = c.id
WHERE s.org_id = $1
  AND s.status IN ('submitted_to_client', 'client_review')
  AND s.deleted_at IS NULL
ORDER BY s.submitted_to_client_at ASC;
```

### Submission Funnel Metrics
```sql
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM submissions
WHERE org_id = $1
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND deleted_at IS NULL
GROUP BY status
ORDER BY
  CASE status
    WHEN 'sourced' THEN 1
    WHEN 'screening' THEN 2
    WHEN 'vendor_pending' THEN 3
    WHEN 'vendor_screening' THEN 4
    WHEN 'vendor_accepted' THEN 5
    WHEN 'submitted_to_client' THEN 6
    WHEN 'client_review' THEN 7
    WHEN 'client_accepted' THEN 8
    WHEN 'client_interview' THEN 9
    WHEN 'offer_stage' THEN 10
    WHEN 'placed' THEN 11
    ELSE 99
  END;
```

### Top Performers by Placements
```sql
SELECT
  u.id,
  u.full_name,
  COUNT(*) FILTER (WHERE s.status = 'placed') as placements,
  COUNT(*) FILTER (WHERE s.status IN ('submitted_to_client', 'client_review', 'client_interview', 'offer_stage')) as active_submissions,
  COUNT(*) as total_submissions,
  ROUND(
    COUNT(*) FILTER (WHERE s.status = 'placed') * 100.0 / NULLIF(COUNT(*), 0),
    2
  ) as placement_rate
FROM user_profiles u
INNER JOIN submissions s ON u.id = s.owner_id
WHERE s.org_id = $1
  AND s.created_at >= DATE_TRUNC('quarter', CURRENT_DATE)
  AND s.deleted_at IS NULL
GROUP BY u.id, u.full_name
ORDER BY placements DESC, placement_rate DESC
LIMIT 10;
```

---

## Validation Rules

### Create Submission
```typescript
const createSubmissionSchema = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  submittedRate: z.number().positive().optional(),
  submittedRateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']).optional(),
  submissionNotes: z.string().max(5000).optional(),
  recruiterMatchScore: z.number().min(0).max(100).optional(),
});
```

### Update to Vendor Pending
```typescript
const submitForApprovalSchema = z.object({
  submissionNotes: z.string().min(10).max(5000),
  submittedRate: z.number().positive(),
  submittedRateType: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']),
  recruiterMatchScore: z.number().min(0).max(100).optional(),
});
```

### Vendor Decision
```typescript
const vendorDecisionSchema = z.object({
  decision: z.enum(['accepted', 'rejected']),
  vendorNotes: z.string().min(10).max(2000).optional(),
  vendorScreeningNotes: z.string().max(2000).optional(),
});
```

### Submit to Client
```typescript
const submitToClientSchema = z.object({
  clientResumeFileId: z.string().uuid().optional(),
  clientProfileUrl: z.string().url().max(500).optional(),
}).refine(
  (data) => data.clientResumeFileId || data.clientProfileUrl,
  { message: "Either resume file or profile URL is required" }
);
```

### Client Decision
```typescript
const clientDecisionSchema = z.object({
  decision: z.enum(['accepted', 'rejected']),
  clientDecisionNotes: z.string().min(10).max(2000).optional(),
});
```

### Rejection
```typescript
const rejectSubmissionSchema = z.object({
  rejectionReason: z.string().min(10).max(2000),
  rejectionSource: z.enum(['recruiter', 'vendor', 'client', 'candidate']),
});
```

---

## UI Components

### Submission Card
```typescript
interface SubmissionCardProps {
  submission: Submission;
  showActions?: boolean;
  compact?: boolean;
}
```

**Displays:**
- Candidate name, avatar, title
- Job title, client name
- Status badge with color
- Match scores (AI + Recruiter) with progress bars
- Days in current status
- Quick actions (context menu)

### Submission Workflow Timeline
```typescript
interface SubmissionTimelineProps {
  submissionId: string;
}
```

**Displays:**
- Vertical timeline of status changes
- Timestamps and user who made change
- Notes/comments at each stage
- Interview and offer events

### Submission Detail View
**Sections:**
1. **Overview** - Candidate, Job, Status, Scores
2. **Submission Details** - Rate, Notes, Resume
3. **Vendor Approval** - Manager review, decision, notes
4. **Client Submission** - Submission details, client feedback
5. **Interviews** - List of interviews with feedback
6. **Offers** - Offer details and status
7. **Activity** - Timeline of all changes
8. **Actions** - Context-aware action buttons

### Submission Status Dropdown
```typescript
interface StatusDropdownProps {
  currentStatus: SubmissionStatus;
  submissionId: string;
  onStatusChange: (newStatus: SubmissionStatus) => Promise<void>;
}
```

**Features:**
- Only shows valid next statuses
- Disabled options show tooltip with requirements
- Confirmation modal for destructive actions
- Pre-populates required fields form

---

## Metrics & KPIs

### Submission Metrics
1. **Total Submissions** - Count by date range
2. **Active Submissions** - Not in terminal state
3. **Placement Rate** - (Placed / Total) × 100
4. **Average Time to Placement** - Days from created to placed
5. **Vendor Approval Rate** - (Vendor Accepted / Vendor Submitted) × 100
6. **Client Acceptance Rate** - (Client Accepted / Submitted to Client) × 100
7. **Interview-to-Offer Ratio** - Offers / Interviews
8. **Offer Acceptance Rate** - (Offers Accepted / Offers Extended) × 100

### Funnel Metrics
1. **Stage Counts** - Number at each status
2. **Stage Conversion Rates** - Percentage moving to next stage
3. **Drop-off Analysis** - Where candidates are rejected most
4. **Bottleneck Detection** - Stages with longest duration

### Performance Metrics
1. **By Recruiter** - Placements, submission count, rates
2. **By Account** - Acceptance rates, time to fill
3. **By Job** - Submissions received, quality scores
4. **By Time Period** - Trends over time

---

## Export Formats

### CSV Export Columns
```
Submission ID, Candidate Name, Candidate Email, Job Title, Client Name,
Status, AI Match Score, Recruiter Score, Submitted Rate, Created Date,
Vendor Submitted Date, Client Submitted Date, Owner Name, Days in Status
```

### Excel Export Sheets
1. **Submissions** - All submission data
2. **Funnel Analysis** - Status breakdown
3. **Performance** - Metrics by recruiter
4. **Timeline** - Status change history

---

*Last Updated: 2025-11-30*
