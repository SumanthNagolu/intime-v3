# quiz_attempts Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `quiz_attempts` |
| Schema | `public` |
| Purpose | Individual student quiz attempt records with scores and answers |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| topic_id | uuid | NO | - | Reference to module topic |
| enrollment_id | uuid | NO | - | Foreign key reference to enrollment |
| attempt_number | integer | NO | 1 | Attempt Number |
| started_at | timestamp with time zone | NO | now() | Timestamp for started |
| submitted_at | timestamp with time zone | YES | - | Timestamp for submitted |
| time_taken_seconds | integer | YES | - | Time Taken Seconds |
| answers | jsonb | YES | - | Answers |
| total_questions | integer | NO | - | Total count of questions |
| correct_answers | integer | YES | - | Correct Answers |
| score | numeric | YES | - | Score |
| passed | boolean | YES | - | Passed |
| xp_earned | integer | YES | 0 | Xp Earned |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| enrollment_id | student_enrollments.id | quiz_attempts_enrollment_id_fkey |
| topic_id | module_topics.id | quiz_attempts_topic_id_fkey |
| user_id | user_profiles.id | quiz_attempts_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| quiz_attempts_pkey | `CREATE UNIQUE INDEX quiz_attempts_pkey ON public.quiz_attempts USING btree (id)` |
| idx_quiz_attempts_user | `CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts USING btree (user_id)` |
| idx_quiz_attempts_topic | `CREATE INDEX idx_quiz_attempts_topic ON public.quiz_attempts USING btree (topic_id)` |
| idx_quiz_attempts_enrollment | `CREATE INDEX idx_quiz_attempts_enrollment ON public.quiz_attempts USING btree (enrollment_id)` |
| idx_quiz_attempts_submitted | `CREATE INDEX idx_quiz_attempts_submitted ON public.quiz_attempts USING btree (submitted_at) WHERE (submitted_at IS NOT NULL)` |
| idx_quiz_attempts_unique | `CREATE UNIQUE INDEX idx_quiz_attempts_unique ON public.quiz_attempts USING btree (user_id, topic_id, attempt_number)` |
