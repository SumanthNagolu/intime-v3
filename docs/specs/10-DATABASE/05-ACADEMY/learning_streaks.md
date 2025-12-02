# learning_streaks Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `learning_streaks` |
| Schema | `public` |
| Purpose | Gamification feature tracking consecutive days of learning activity |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| streak_type | USER-DEFINED | NO | - | Streak Type |
| current_count | integer | NO | 0 | Count of current |
| longest_count | integer | NO | 0 | Count of longest |
| last_activity_date | timestamp with time zone | YES | - | Last Activity Date |
| streak_started_at | timestamp with time zone | YES | - | Timestamp for streak started |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| user_id | user_profiles.id | learning_streaks_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| learning_streaks_pkey | `CREATE UNIQUE INDEX learning_streaks_pkey ON public.learning_streaks USING btree (id)` |
| learning_streaks_user_id_streak_type_key | `CREATE UNIQUE INDEX learning_streaks_user_id_streak_type_key ON public.learning_streaks USING btree (user_id, streak_type)` |
| idx_learning_streaks_user_id | `CREATE INDEX idx_learning_streaks_user_id ON public.learning_streaks USING btree (user_id)` |
| idx_learning_streaks_streak_type | `CREATE INDEX idx_learning_streaks_streak_type ON public.learning_streaks USING btree (streak_type)` |
| idx_learning_streaks_current_count | `CREATE INDEX idx_learning_streaks_current_count ON public.learning_streaks USING btree (current_count)` |
| idx_learning_streaks_last_activity_date | `CREATE INDEX idx_learning_streaks_last_activity_date ON public.learning_streaks USING btree (last_activity_date)` |
