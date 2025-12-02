# BULK_ACTIVITY_JOBS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `bulk_activity_jobs` |
| Schema | `public` |
| Purpose | Batch jobs for creating/updating multiple activities |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `job_name` | text | NO | NULL | Job name |
| `job_type` | text | NO | NULL | Job type |
| `activity_pattern_id` | uuid | YES | NULL | Reference to activity pattern |
| `target_entity_type` | text | YES | NULL | Target entity type |
| `target_entity_ids` | ARRAY | YES | NULL | Array of target entity ids |
| `target_criteria` | jsonb | YES | NULL | JSON data for target criteria |
| `operation` | jsonb | NO | NULL | JSON data for operation |
| `status` | text | YES | pending | Current status of the record |
| `total_items` | integer | YES | 0 | Total items |
| `processed_items` | integer | YES | 0 | Processed items |
| `failed_items` | integer | YES | 0 | Failed items |
| `error_log` | jsonb | YES | NULL | JSON data for error log |
| `result_summary` | jsonb | YES | NULL | JSON data for result summary |
| `started_at` | timestamp with time zone | YES | NULL | Timestamp when started |
| `completed_at` | timestamp with time zone | YES | NULL | Timestamp when completed |
| `canceled_at` | timestamp with time zone | YES | NULL | Timestamp when canceled |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `created_by` | uuid | NO | NULL | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_pattern_id` | `activity_patterns.id` | Links to activity_patterns |
| `created_by` | `user_profiles.id` | Links to user_profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `bulk_activity_jobs_created_by_idx` | `CREATE INDEX bulk_activity_jobs_created_by_idx ON public.bulk_activity_jobs USING btree (created_by)` |
| `bulk_activity_jobs_pkey` | `CREATE UNIQUE INDEX bulk_activity_jobs_pkey ON public.bulk_activity_jobs USING btree (id)` |
| `bulk_activity_jobs_status_idx` | `CREATE INDEX bulk_activity_jobs_status_idx ON public.bulk_activity_jobs USING btree (status)` |

