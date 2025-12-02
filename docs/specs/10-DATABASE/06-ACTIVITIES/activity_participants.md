# ACTIVITY_PARTICIPANTS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_participants` |
| Schema | `public` |
| Purpose | Users participating in activities (attendees, collaborators) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `user_id` | uuid | NO | NULL | Reference to user |
| `role` | text | NO | NULL | Role |
| `permission` | text | YES | view | Permission |
| `is_primary` | boolean | YES | false | Boolean flag: primary |
| `notify_on_update` | boolean | YES | true | Notify on update |
| `added_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when added |
| `added_by` | uuid | YES | NULL | Added by |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `added_by` | `user_profiles.id` | Links to user_profiles |
| `user_id` | `user_profiles.id` | Links to user_profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_participants_activity_id_user_id_key` | `CREATE UNIQUE INDEX activity_participants_activity_id_user_id_key ON public.activity_participants USING btree (activity_id, user_id)` |
| `activity_participants_activity_idx` | `CREATE INDEX activity_participants_activity_idx ON public.activity_participants USING btree (activity_id)` |
| `activity_participants_pkey` | `CREATE UNIQUE INDEX activity_participants_pkey ON public.activity_participants USING btree (id)` |
| `activity_participants_user_idx` | `CREATE INDEX activity_participants_user_idx ON public.activity_participants USING btree (user_id)` |

