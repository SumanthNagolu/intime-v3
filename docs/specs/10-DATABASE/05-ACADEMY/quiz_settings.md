# quiz_settings Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `quiz_settings` |
| Schema | `public` |
| Purpose | Configuration for quizzes including time limits, attempts, and passing scores |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| topic_id | uuid | NO | - | Reference to module topic |
| randomize_questions | boolean | NO | false | Randomize Questions |
| randomize_options | boolean | NO | false | Randomize Options |
| passing_threshold | integer | NO | 70 | Passing Threshold |
| show_correct_answers | boolean | NO | true | Show Correct Answers |
| time_limit_minutes | integer | YES | - | Time Limit Minutes |
| max_attempts | integer | YES | - | Max Attempts |
| allow_review | boolean | NO | true | Allow Review |
| xp_reward | integer | NO | 10 | Xp Reward |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| topic_id | module_topics.id | quiz_settings_topic_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| quiz_settings_pkey | `CREATE UNIQUE INDEX quiz_settings_pkey ON public.quiz_settings USING btree (id)` |
| quiz_settings_topic_id_key | `CREATE UNIQUE INDEX quiz_settings_topic_id_key ON public.quiz_settings USING btree (topic_id)` |
| idx_quiz_settings_topic | `CREATE INDEX idx_quiz_settings_topic ON public.quiz_settings USING btree (topic_id)` |
