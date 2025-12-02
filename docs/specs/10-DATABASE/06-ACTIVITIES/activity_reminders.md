# ACTIVITY_REMINDERS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_reminders` |
| Schema | `public` |
| Purpose | Reminder notifications for activities |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `user_id` | uuid | NO | NULL | Reference to user |
| `remind_at` | timestamp with time zone | NO | NULL | Timestamp when remind |
| `reminder_type` | text | YES | relative | Reminder type |
| `relative_days` | integer | YES | NULL | Relative days |
| `relative_hours` | integer | YES | NULL | Relative hours |
| `channel` | text | YES | email | Channel |
| `is_sent` | boolean | YES | false | Boolean flag: sent |
| `sent_at` | timestamp with time zone | YES | NULL | Timestamp when sent |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `user_id` | `user_profiles.id` | Links to user_profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_reminders_activity_idx` | `CREATE INDEX activity_reminders_activity_idx ON public.activity_reminders USING btree (activity_id)` |
| `activity_reminders_pkey` | `CREATE UNIQUE INDEX activity_reminders_pkey ON public.activity_reminders USING btree (id)` |
| `activity_reminders_remind_at_idx` | `CREATE INDEX activity_reminders_remind_at_idx ON public.activity_reminders USING btree (remind_at)` |

