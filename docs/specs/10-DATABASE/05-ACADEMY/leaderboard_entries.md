# leaderboard_entries Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `leaderboard_entries` |
| Schema | `public` |
| Purpose | Generic leaderboard entry records |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| leaderboard_id | uuid | NO | - | Foreign key reference to leaderboard |
| user_id | uuid | NO | - | Reference to user |
| rank | integer | NO | - | Rank |
| xp_earned | integer | NO | 0 | Xp Earned |
| courses_completed | integer | NO | 0 | Courses Completed |
| lessons_completed | integer | NO | 0 | Lessons Completed |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| leaderboard_id | leaderboards.id | leaderboard_entries_leaderboard_id_fkey |
| user_id | user_profiles.id | leaderboard_entries_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| leaderboard_entries_pkey | `CREATE UNIQUE INDEX leaderboard_entries_pkey ON public.leaderboard_entries USING btree (id)` |
| leaderboard_entries_leaderboard_id_user_id_key | `CREATE UNIQUE INDEX leaderboard_entries_leaderboard_id_user_id_key ON public.leaderboard_entries USING btree (leaderboard_id, user_id)` |
| idx_leaderboard_entries_leaderboard_id | `CREATE INDEX idx_leaderboard_entries_leaderboard_id ON public.leaderboard_entries USING btree (leaderboard_id)` |
| idx_leaderboard_entries_user_id | `CREATE INDEX idx_leaderboard_entries_user_id ON public.leaderboard_entries USING btree (user_id)` |
| idx_leaderboard_entries_rank | `CREATE INDEX idx_leaderboard_entries_rank ON public.leaderboard_entries USING btree (rank)` |
| idx_leaderboard_entries_xp_earned | `CREATE INDEX idx_leaderboard_entries_xp_earned ON public.leaderboard_entries USING btree (xp_earned)` |
