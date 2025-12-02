# submissions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `submissions` |
| Schema | `public` |
| Purpose | Candidate submissions to specific jobs (core ATS workflow entity) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| job_id | uuid | NO | - | Foreign key to job |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| account_id | uuid | YES | - | Foreign key to account |
| status | text | NO | 'sourced'::text | Status |
| ai_match_score | integer | YES | - | Ai match score |
| recruiter_match_score | integer | YES | - | Recruiter match score |
| match_explanation | text | YES | - | Match explanation |
| submitted_rate | numeric | YES | - | Submitted rate |
| submitted_rate_type | text | YES | 'hourly'::text | Submitted rate type |
| submission_notes | text | YES | - | Submission notes |
| submitted_to_client_at | timestamp with time zone | YES | - | Submitted to client at |
| submitted_to_client_by | uuid | YES | - | Submitted to client by |
| client_resume_file_id | uuid | YES | - | Foreign key to client_resume_file |
| client_profile_url | text | YES | - | Client profile url |
| interview_count | integer | YES | 0 | Interview count |
| last_interview_date | timestamp with time zone | YES | - | Last interview date |
| interview_feedback | text | YES | - | Interview feedback |
| offer_extended_at | timestamp with time zone | YES | - | Offer extended at |
| offer_accepted_at | timestamp with time zone | YES | - | Offer accepted at |
| offer_declined_at | timestamp with time zone | YES | - | Offer declined at |
| offer_decline_reason | text | YES | - | Offer decline reason |
| rejected_at | timestamp with time zone | YES | - | Rejected at |
| rejection_reason | text | YES | - | Rejection reason |
| rejection_source | text | YES | - | Rejection source |
| owner_id | uuid | NO | - | Foreign key to owner |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| created_by | uuid | YES | - | User who created the record |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |
| vendor_submitted_at | timestamp with time zone | YES | - | Vendor submitted at |
| vendor_submitted_by | uuid | YES | - | Vendor submitted by |
| vendor_decision | text | YES | - | Vendor decision |
| vendor_decision_at | timestamp with time zone | YES | - | Vendor decision at |
| vendor_decision_by | uuid | YES | - | Vendor decision by |
| vendor_notes | text | YES | - | Vendor notes |
| vendor_screening_notes | text | YES | - | Vendor screening notes |
| vendor_screening_completed_at | timestamp with time zone | YES | - | Vendor screening completed at |
| client_decision | text | YES | - | Client decision |
| client_decision_at | timestamp with time zone | YES | - | Client decision at |
| client_decision_notes | text | YES | - | Client decision notes |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| account_id | accounts.id | Accounts |
| candidate_id | user_profiles.id | User profiles |
| created_by | user_profiles.id | User profiles |
| job_id | jobs.id | Jobs |
| org_id | organizations.id | Organizations |
| owner_id | user_profiles.id | User profiles |
| submitted_to_client_by | user_profiles.id | User profiles |
| vendor_decision_by | user_profiles.id | User profiles |
| vendor_submitted_by | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| submissions_pkey | CREATE UNIQUE INDEX submissions_pkey ON public.submissions USING btree (id) |
| idx_submissions_job | CREATE INDEX idx_submissions_job ON public.submissions USING btree (job_id) WHERE (deleted_at IS NULL) |
| idx_submissions_candidate | CREATE INDEX idx_submissions_candidate ON public.submissions USING btree (candidate_id) |
| idx_submissions_account | CREATE INDEX idx_submissions_account ON public.submissions USING btree (account_id) |
| idx_submissions_status | CREATE INDEX idx_submissions_status ON public.submissions USING btree (status) WHERE (deleted_at IS NULL) |
| idx_submissions_owner | CREATE INDEX idx_submissions_owner ON public.submissions USING btree (owner_id) |
| idx_submissions_created | CREATE INDEX idx_submissions_created ON public.submissions USING btree (created_at DESC) |
| idx_submissions_unique | CREATE UNIQUE INDEX idx_submissions_unique ON public.submissions USING btree (job_id, candidate_id) WHERE (deleted_at IS NULL) |
| idx_submissions_org | CREATE INDEX idx_submissions_org ON public.submissions USING btree (org_id) |
