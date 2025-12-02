# ACTIVITY_HISTORY Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_history` |
| Schema | `public` |
| Purpose | Audit trail of changes made to activities |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `action` | text | NO | NULL | Action |
| `field_changed` | text | YES | NULL | Field changed |
| `old_value` | text | YES | NULL | Old value |
| `new_value` | text | YES | NULL | New value |
| `changed_by` | uuid | YES | NULL | Changed by |
| `changed_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when changed |
| `notes` | text | YES | NULL | Notes |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `changed_by` | `user_profiles.id` | Links to user_profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_history_activity_idx` | `CREATE INDEX activity_history_activity_idx ON public.activity_history USING btree (activity_id)` |
| `activity_history_changed_at_idx` | `CREATE INDEX activity_history_changed_at_idx ON public.activity_history USING btree (changed_at)` |
| `activity_history_pkey` | `CREATE UNIQUE INDEX activity_history_pkey ON public.activity_history USING btree (id)` |

