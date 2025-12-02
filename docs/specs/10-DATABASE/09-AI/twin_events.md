# twin_events Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `twin_events` |
| Schema | `public` |
| Purpose | Event queue for asynchronous twin-to-twin communication and proactive suggestions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for the event |
| org_id | uuid | NO | - | Organization context for the event |
| source_user_id | uuid | NO | - | User whose twin generated the event |
| source_role | text | NO | - | Role of the twin generating the event |
| target_role | text | YES | - | Role of the twin that should process the event |
| event_type | text | NO | - | Type of event (e.g., 'suggestion', 'alert', 'request') |
| payload | jsonb | NO | '{}'::jsonb | Event data and context |
| priority | text | NO | 'medium'::text | Event priority (low, medium, high, urgent) |
| processed | boolean | NO | false | Whether the event has been processed |
| processed_at | timestamp with time zone | YES | - | When event was processed |
| processed_by | uuid | YES | - | Twin/user that processed the event |
| created_at | timestamp with time zone | NO | now() | When event was created |
| expires_at | timestamp with time zone | YES | (now() + '7 days'::interval) | When event expires if not processed |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| source_user_id | user_profiles.id | - |
| processed_by | user_profiles.id | - |

## Indexes

| Index Name | Definition |
|------------|------------|
| twin_events_pkey | CREATE UNIQUE INDEX twin_events_pkey ON public.twin_events USING btree (id) |
| idx_twin_events_org_role | CREATE INDEX idx_twin_events_org_role ON public.twin_events USING btree (org_id, target_role, processed) |
| idx_twin_events_source | CREATE INDEX idx_twin_events_source ON public.twin_events USING btree (source_user_id, created_at DESC) |
| idx_twin_events_unprocessed | CREATE INDEX idx_twin_events_unprocessed ON public.twin_events USING btree (org_id, processed, priority DESC, created_at) WHERE (processed = false) |
| idx_twin_events_type | CREATE INDEX idx_twin_events_type ON public.twin_events USING btree (event_type, created_at DESC) |

## Usage Notes

- Enables asynchronous twin communication and task delegation
- Priority-based processing supports urgent vs routine suggestions
- Expiration prevents stale events from accumulating
- Partial index on unprocessed events optimizes queue queries
- Supports proactive twin suggestions and alerts
