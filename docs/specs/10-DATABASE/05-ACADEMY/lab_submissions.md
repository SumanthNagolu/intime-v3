# lab_submissions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `lab_submissions` |
| Schema | `public` |
| Purpose | Student lab work submissions with code and results |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| topic_id | uuid | NO | - | Reference to module topic |
| enrollment_id | uuid | NO | - | Foreign key reference to enrollment |
| lab_instance_id | uuid | NO | - | Foreign key reference to lab instance |
| repository_url | text | NO | - | URL for repository |
| commit_sha | text | YES | - | Commit Sha |
| branch_name | text | YES | 'main'::text | Branch Name |
| submitted_at | timestamp with time zone | YES | now() | Timestamp for submitted |
| status | text | YES | 'pending'::text | Current status |
| auto_grade_result | jsonb | YES | - | Auto Grade Result |
| auto_grade_score | numeric | YES | - | Auto Grade Score |
| auto_graded_at | timestamp with time zone | YES | - | Timestamp for auto graded |
| manual_grade_score | numeric | YES | - | Manual Grade Score |
| rubric_scores | jsonb | YES | - | Rubric Scores |
| graded_by | uuid | YES | - | Graded By |
| graded_at | timestamp with time zone | YES | - | Timestamp for graded |
| feedback | text | YES | - | Feedback |
| final_score | numeric | YES | - | Final Score |
| passed | boolean | YES | - | Passed |
| attempt_number | integer | YES | 1 | Attempt Number |
| previous_submission_id | uuid | YES | - | Foreign key reference to previous submission |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| enrollment_id | student_enrollments.id | lab_submissions_enrollment_id_fkey |
| graded_by | user_profiles.id | lab_submissions_graded_by_fkey |
| lab_instance_id | lab_instances.id | lab_submissions_lab_instance_id_fkey |
| previous_submission_id | lab_submissions.id | lab_submissions_previous_submission_id_fkey |
| topic_id | module_topics.id | lab_submissions_topic_id_fkey |
| user_id | user_profiles.id | lab_submissions_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| idx_lab_submissions_pending | `CREATE INDEX idx_lab_submissions_pending ON public.lab_submissions USING btree (status) WHERE (status = ANY (ARRAY['pending'::text, 'manual_review'::text]))` |
| lab_submissions_pkey | `CREATE UNIQUE INDEX lab_submissions_pkey ON public.lab_submissions USING btree (id)` |
| idx_lab_submissions_user | `CREATE INDEX idx_lab_submissions_user ON public.lab_submissions USING btree (user_id)` |
| idx_lab_submissions_topic | `CREATE INDEX idx_lab_submissions_topic ON public.lab_submissions USING btree (topic_id)` |
| idx_lab_submissions_status | `CREATE INDEX idx_lab_submissions_status ON public.lab_submissions USING btree (status)` |
| idx_lab_submissions_grader | `CREATE INDEX idx_lab_submissions_grader ON public.lab_submissions USING btree (graded_by)` |
| idx_lab_submissions_instance | `CREATE INDEX idx_lab_submissions_instance ON public.lab_submissions USING btree (lab_instance_id)` |
