# user_levels Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `user_levels` |
| Schema | `public` |
| Purpose | Current level and XP status for each user |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | NO | - | Reference to user |
| current_level | integer | NO | 1 | Current Level |
| current_xp | integer | NO | 0 | Current Xp |
| xp_to_next_level | integer | NO | 100 | Xp To Next Level |
| level_up_at | timestamp with time zone | YES | - | Timestamp for level up |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| user_id | user_profiles.id | user_levels_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| user_levels_pkey | `CREATE UNIQUE INDEX user_levels_pkey ON public.user_levels USING btree (user_id)` |
| idx_user_levels_current_level | `CREATE INDEX idx_user_levels_current_level ON public.user_levels USING btree (current_level)` |
| idx_user_levels_current_xp | `CREATE INDEX idx_user_levels_current_xp ON public.user_levels USING btree (current_xp)` |
