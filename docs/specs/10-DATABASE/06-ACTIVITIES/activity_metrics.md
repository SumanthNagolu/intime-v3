# ACTIVITY_METRICS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_metrics` |
| Schema | `public` |
| Purpose | Performance metrics and analytics for activities |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `org_id` | uuid | NO | NULL | Organization ID (multi-tenant isolation) |
| `metric_date` | timestamp with time zone | NO | NULL | Metric date |
| `entity_type` | text | YES | NULL | Type of entity (polymorphic relationship) |
| `activity_type` | text | YES | NULL | Activity type |
| `activity_category` | text | YES | NULL | Activity category |
| `user_id` | uuid | YES | NULL | Reference to user |
| `pod_id` | uuid | YES | NULL | Reference to pod |
| `total_activities` | integer | YES | 0 | Total activities |
| `created_activities` | integer | YES | 0 | Created activities |
| `completed_activities` | integer | YES | 0 | Completed activities |
| `overdue_activities` | integer | YES | 0 | Overdue activities |
| `completion_rate` | numeric | YES | NULL | Completion rate |
| `avg_completion_time_hours` | numeric | YES | NULL | Avg completion time hours |
| `sla_met_count` | integer | YES | 0 | Count of sla met |
| `sla_breached_count` | integer | YES | 0 | Count of sla breached |
| `sla_compliance_rate` | numeric | YES | NULL | Sla compliance rate |
| `total_time_minutes` | integer | YES | 0 | Total time minutes |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `org_id` | `organizations.id` | Links to organizations |
| `pod_id` | `pods.id` | Links to pods |
| `user_id` | `user_profiles.id` | Links to user_profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_metrics_date_idx` | `CREATE INDEX activity_metrics_date_idx ON public.activity_metrics USING btree (metric_date)` |
| `activity_metrics_pkey` | `CREATE UNIQUE INDEX activity_metrics_pkey ON public.activity_metrics USING btree (id)` |
| `activity_metrics_pod_idx` | `CREATE INDEX activity_metrics_pod_idx ON public.activity_metrics USING btree (pod_id)` |
| `activity_metrics_user_idx` | `CREATE INDEX activity_metrics_user_idx ON public.activity_metrics USING btree (user_id)` |

