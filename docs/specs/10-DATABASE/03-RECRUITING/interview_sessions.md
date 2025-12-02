# interview_sessions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `interview_sessions` |
| Schema | `public` |
| Purpose | Individual interview rounds within an interview process |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| student_id | uuid | NO | - | Foreign key to student |
| interview_type | text | NO | - | Interview type |
| guidewire_module | text | YES | - | Guidewire module |
| questions | jsonb | NO | '[]'::jsonb | Questions |
| average_score | numeric | NO | 0 | Average score |
| started_at | timestamp with time zone | NO | now() | Started at |
| completed_at | timestamp with time zone | YES | - | Completed at |
| duration | integer | YES | - | Duration |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| student_id | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| interview_sessions_pkey | CREATE UNIQUE INDEX interview_sessions_pkey ON public.interview_sessions USING btree (id) |
| idx_interview_sessions_student | CREATE INDEX idx_interview_sessions_student ON public.interview_sessions USING btree (student_id, created_at DESC) |
| idx_interview_sessions_type | CREATE INDEX idx_interview_sessions_type ON public.interview_sessions USING btree (interview_type) |
| idx_interview_sessions_module | CREATE INDEX idx_interview_sessions_module ON public.interview_sessions USING btree (guidewire_module) WHERE (guidewire_module IS NOT NULL) |
| idx_interview_sessions_score | CREATE INDEX idx_interview_sessions_score ON public.interview_sessions USING btree (average_score DESC) |
