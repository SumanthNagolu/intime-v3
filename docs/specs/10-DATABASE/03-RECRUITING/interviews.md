# interviews Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `interviews` |
| Schema | `public` |
| Purpose | Interview scheduling and coordination for submissions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| submission_id | uuid | NO | - | Foreign key to submission |
| job_id | uuid | NO | - | Foreign key to job |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| round_number | integer | NO | 1 | Round number |
| interview_type | text | YES | 'technical'::text | Interview type |
| scheduled_at | timestamp with time zone | YES | - | Scheduled at |
| duration_minutes | integer | YES | 60 | Duration minutes |
| timezone | text | YES | 'America/New_York'::text | Timezone |
| meeting_link | text | YES | - | Meeting link |
| meeting_location | text | YES | - | Meeting location |
| interviewer_names | ARRAY | YES | - | Interviewer names |
| interviewer_emails | ARRAY | YES | - | Interviewer emails |
| scheduled_by | uuid | YES | - | Scheduled by |
| status | text | NO | 'scheduled'::text | Status |
| cancellation_reason | text | YES | - | Cancellation reason |
| feedback | text | YES | - | Feedback |
| rating | integer | YES | - | Rating |
| recommendation | text | YES | - | Recommendation |
| submitted_by | uuid | YES | - | Submitted by |
| feedback_submitted_at | timestamp with time zone | YES | - | Feedback submitted at |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| org_id | uuid | NO | - | Organization ID |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| candidate_id | user_profiles.id | User profiles |
| job_id | jobs.id | Jobs |
| org_id | organizations.id | Organizations |
| scheduled_by | user_profiles.id | User profiles |
| submission_id | submissions.id | Submissions |
| submitted_by | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| interviews_pkey | CREATE UNIQUE INDEX interviews_pkey ON public.interviews USING btree (id) |
| idx_interviews_submission | CREATE INDEX idx_interviews_submission ON public.interviews USING btree (submission_id) |
| idx_interviews_candidate | CREATE INDEX idx_interviews_candidate ON public.interviews USING btree (candidate_id) |
| idx_interviews_job | CREATE INDEX idx_interviews_job ON public.interviews USING btree (job_id) |
| idx_interviews_scheduled | CREATE INDEX idx_interviews_scheduled ON public.interviews USING btree (scheduled_at) |
| idx_interviews_status | CREATE INDEX idx_interviews_status ON public.interviews USING btree (status) |
| idx_interviews_org_id | CREATE INDEX idx_interviews_org_id ON public.interviews USING btree (org_id) |
