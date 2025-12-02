# user_achievements Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `user_achievements` |
| Schema | `public` |
| Purpose | Tracks which achievements each user has earned |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| achievement_id | uuid | NO | - | Foreign key reference to achievement |
| unlocked_at | timestamp with time zone | NO | now() | Timestamp for unlocked |
| progress | jsonb | YES | - | Progress |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| achievement_id | achievements.id | user_achievements_achievement_id_fkey |
| user_id | user_profiles.id | user_achievements_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| user_achievements_pkey | `CREATE UNIQUE INDEX user_achievements_pkey ON public.user_achievements USING btree (id)` |
| user_achievements_user_id_achievement_id_key | `CREATE UNIQUE INDEX user_achievements_user_id_achievement_id_key ON public.user_achievements USING btree (user_id, achievement_id)` |
| idx_user_achievements_user_id | `CREATE INDEX idx_user_achievements_user_id ON public.user_achievements USING btree (user_id)` |
| idx_user_achievements_achievement_id | `CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements USING btree (achievement_id)` |
| idx_user_achievements_unlocked_at | `CREATE INDEX idx_user_achievements_unlocked_at ON public.user_achievements USING btree (unlocked_at)` |
