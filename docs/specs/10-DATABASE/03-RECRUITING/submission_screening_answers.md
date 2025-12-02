# submission_screening_answers Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `submission_screening_answers` |
| Schema | `public` |
| Purpose | Candidate answers to job-specific screening questions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| submission_id | uuid | NO | - | Foreign key to submission |
| question_id | uuid | NO | - | Foreign key to question |
| answer | text | YES | - | Answer |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| org_id | organizations.id | Organizations |
| question_id | job_screening_questions.id | Job screening questions |
| submission_id | submissions.id | Submissions |

## Indexes

| Index Name | Definition |
|------------|------------|
| submission_screening_answers_pkey | CREATE UNIQUE INDEX submission_screening_answers_pkey ON public.submission_screening_answers USING btree (id) |
| submission_screening_answers_submission_id_question_id_key | CREATE UNIQUE INDEX submission_screening_answers_submission_id_question_id_key ON public.submission_screening_answers USING btree (submission_id, question_id) |
| idx_submission_screening_answers_submission_id | CREATE INDEX idx_submission_screening_answers_submission_id ON public.submission_screening_answers USING btree (submission_id) |
