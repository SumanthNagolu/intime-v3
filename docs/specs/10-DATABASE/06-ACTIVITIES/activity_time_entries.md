# ACTIVITY_TIME_ENTRIES Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_time_entries` |
| Schema | `public` |
| Purpose | Time tracking entries for activities |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `user_id` | uuid | NO | NULL | Reference to user |
| `start_time` | timestamp with time zone | NO | NULL | Start time |
| `end_time` | timestamp with time zone | YES | NULL | End time |
| `duration_minutes` | integer | YES | NULL | Duration minutes |
| `description` | text | YES | NULL | Description |
| `is_billable` | boolean | YES | false | Boolean flag: billable |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `user_id` | `user_profiles.id` | Links to user_profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_time_entries_activity_idx` | `CREATE INDEX activity_time_entries_activity_idx ON public.activity_time_entries USING btree (activity_id)` |
| `activity_time_entries_pkey` | `CREATE UNIQUE INDEX activity_time_entries_pkey ON public.activity_time_entries USING btree (id)` |
| `activity_time_entries_user_idx` | `CREATE INDEX activity_time_entries_user_idx ON public.activity_time_entries USING btree (user_id)` |

