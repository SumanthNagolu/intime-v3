# badge_progress Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `badge_progress` |
| Schema | `public` |
| Purpose | Incremental progress toward badge completion |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| badge_id | uuid | NO | - | Foreign key reference to badge |
| current_value | integer | YES | 0 | Current Value |
| target_value | integer | NO | - | Target Value |
| last_updated | timestamp with time zone | YES | now() | Last Updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| badge_id | badges.id | badge_progress_badge_id_fkey |
| user_id | user_profiles.id | badge_progress_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| badge_progress_pkey | `CREATE UNIQUE INDEX badge_progress_pkey ON public.badge_progress USING btree (id)` |
| badge_progress_user_id_badge_id_key | `CREATE UNIQUE INDEX badge_progress_user_id_badge_id_key ON public.badge_progress USING btree (user_id, badge_id)` |
| idx_badge_progress_user | `CREATE INDEX idx_badge_progress_user ON public.badge_progress USING btree (user_id)` |
