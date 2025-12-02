# user_badges Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `user_badges` |
| Schema | `public` |
| Purpose | Tracks which badges each user has earned |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| badge_id | uuid | NO | - | Foreign key reference to badge |
| earned_at | timestamp with time zone | YES | now() | Timestamp for earned |
| progress_value | integer | YES | 0 | Progress Value |
| is_new | boolean | YES | true | Boolean flag: new |
| viewed_at | timestamp with time zone | YES | - | Timestamp for viewed |
| shared_at | timestamp with time zone | YES | - | Timestamp for shared |
| share_count | integer | YES | 0 | Count of share |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| badge_id | badges.id | user_badges_badge_id_fkey |
| user_id | user_profiles.id | user_badges_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| user_badges_pkey | `CREATE UNIQUE INDEX user_badges_pkey ON public.user_badges USING btree (id)` |
| user_badges_user_id_badge_id_key | `CREATE UNIQUE INDEX user_badges_user_id_badge_id_key ON public.user_badges USING btree (user_id, badge_id)` |
| idx_user_badges_user | `CREATE INDEX idx_user_badges_user ON public.user_badges USING btree (user_id)` |
| idx_user_badges_badge | `CREATE INDEX idx_user_badges_badge ON public.user_badges USING btree (badge_id)` |
| idx_user_badges_earned | `CREATE INDEX idx_user_badges_earned ON public.user_badges USING btree (earned_at DESC)` |
| idx_user_badges_new | `CREATE INDEX idx_user_badges_new ON public.user_badges USING btree (user_id, is_new) WHERE (is_new = true)` |
