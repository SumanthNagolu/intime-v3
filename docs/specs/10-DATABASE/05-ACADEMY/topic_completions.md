# topic_completions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `topic_completions` |
| Schema | `public` |
| Purpose | Tracks student completion status for individual topics |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| enrollment_id | uuid | NO | - | Foreign key reference to enrollment |
| course_id | uuid | NO | - | Reference to course |
| module_id | uuid | NO | - | Reference to course module |
| topic_id | uuid | NO | - | Reference to module topic |
| completed_at | timestamp with time zone | NO | now() | Timestamp for completed |
| time_spent_seconds | integer | YES | 0 | Time Spent Seconds |
| xp_earned | integer | NO | 0 | Xp Earned |
| completion_source | text | YES | 'manual'::text | Completion Source |
| notes | text | YES | - | Notes |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| course_id | courses.id | topic_completions_course_id_fkey |
| enrollment_id | student_enrollments.id | topic_completions_enrollment_id_fkey |
| module_id | course_modules.id | topic_completions_module_id_fkey |
| topic_id | module_topics.id | topic_completions_topic_id_fkey |
| user_id | user_profiles.id | topic_completions_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| topic_completions_pkey | `CREATE UNIQUE INDEX topic_completions_pkey ON public.topic_completions USING btree (id)` |
| unique_user_topic_completion | `CREATE UNIQUE INDEX unique_user_topic_completion ON public.topic_completions USING btree (user_id, topic_id)` |
| idx_topic_completions_user | `CREATE INDEX idx_topic_completions_user ON public.topic_completions USING btree (user_id)` |
| idx_topic_completions_enrollment | `CREATE INDEX idx_topic_completions_enrollment ON public.topic_completions USING btree (enrollment_id)` |
| idx_topic_completions_course | `CREATE INDEX idx_topic_completions_course ON public.topic_completions USING btree (course_id)` |
| idx_topic_completions_completed_at | `CREATE INDEX idx_topic_completions_completed_at ON public.topic_completions USING btree (completed_at DESC)` |
