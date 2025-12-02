# badge_trigger_events Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `badge_trigger_events` |
| Schema | `public` |
| Purpose | Event definitions that can trigger badge awards |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| trigger_type | text | NO | - | Trigger Type |
| event_data | jsonb | YES | '{}'::jsonb | Event Data |
| processed | boolean | YES | false | Processed |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| user_id | user_profiles.id | badge_trigger_events_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| badge_trigger_events_pkey | `CREATE UNIQUE INDEX badge_trigger_events_pkey ON public.badge_trigger_events USING btree (id)` |
| idx_badge_trigger_events_user | `CREATE INDEX idx_badge_trigger_events_user ON public.badge_trigger_events USING btree (user_id)` |
| idx_badge_trigger_events_processed | `CREATE INDEX idx_badge_trigger_events_processed ON public.badge_trigger_events USING btree (processed) WHERE (processed = false)` |
