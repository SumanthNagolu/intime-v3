# student_progress Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `student_progress` |
| Schema | `public` |
| Purpose | Detailed progress tracking for students across courses and topics |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| student_id | uuid | NO | - | Reference to student user |
| current_module | text | NO | - | Current Module |
| completed_modules | ARRAY | NO | '{}'::text[] | Completed Modules |
| struggle_areas | ARRAY | NO | '{}'::text[] | Struggle Areas |
| mastery_score | integer | NO | 0 | Mastery Score |
| total_interactions | integer | NO | 0 | Total count of interactions |
| helpful_interactions | integer | NO | 0 | Helpful Interactions |
| last_activity_at | timestamp with time zone | NO | now() | Timestamp for last activity |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| student_id | user_profiles.id | student_progress_student_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| student_progress_pkey | `CREATE UNIQUE INDEX student_progress_pkey ON public.student_progress USING btree (id)` |
| student_progress_student_id_key | `CREATE UNIQUE INDEX student_progress_student_id_key ON public.student_progress USING btree (student_id)` |
| idx_student_progress_student | `CREATE INDEX idx_student_progress_student ON public.student_progress USING btree (student_id)` |
| idx_student_progress_module | `CREATE INDEX idx_student_progress_module ON public.student_progress USING btree (current_module)` |
| idx_student_progress_mastery | `CREATE INDEX idx_student_progress_mastery ON public.student_progress USING btree (mastery_score DESC)` |
