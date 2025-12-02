# interview_feedback Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `interview_feedback` |
| Schema | `public` |
| Purpose | Feedback and evaluations from interviewers |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| interview_id | uuid | NO | - | Foreign key to interview |
| submitted_by | uuid | NO | - | Submitted by |
| rating | integer | YES | - | Rating |
| recommendation | text | YES | - | Recommendation |
| strengths | text | YES | - | Strengths |
| weaknesses | text | YES | - | Weaknesses |
| notes | text | YES | - | Notes |
| submitted_at | timestamp with time zone | NO | now() | Submitted at |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| interview_id | interviews.id | Interviews |
| org_id | organizations.id | Organizations |
| submitted_by | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| interview_feedback_pkey | CREATE UNIQUE INDEX interview_feedback_pkey ON public.interview_feedback USING btree (id) |
| idx_interview_feedback_interview_id | CREATE INDEX idx_interview_feedback_interview_id ON public.interview_feedback USING btree (interview_id) |
