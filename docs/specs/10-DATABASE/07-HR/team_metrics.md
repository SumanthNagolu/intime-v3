# team_metrics Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `team_metrics` |
| Schema | `public` |
| Purpose | Team-level performance metrics and KPIs |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `pod_id` | uuid | NO | - | Reference to pod |
| `metric_date` | timestamptz | NO | - | Metric Date |
| `metric_period` | text | YES | 'day'::text | Metric Period |
| `total_activities` | integer | YES | 0 | Total Activities |
| `completed_activities` | integer | YES | 0 | Completed Activities |
| `avg_response_time_hours` | numeric | YES | - | Avg Response Time Hours |
| `avg_resolution_time_hours` | numeric | YES | - | Avg Resolution Time Hours |
| `total_active_members` | integer | YES | 0 | Total Active Members |
| `avg_activities_per_member` | numeric | YES | - | Avg Activities Per Member |
| `sla_compliance_rate` | numeric | YES | - | Sla Compliance Rate |
| `activities_created_per_day` | numeric | YES | - | Activities Created Per Day |
| `activities_completed_per_day` | numeric | YES | - | Activities Completed Per Day |
| `escalation_count` | integer | YES | 0 | Escalation Count |
| `reassignment_count` | integer | YES | 0 | Reassignment Count |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `org_id` | `organizations.id` | Links to organizations |
| `pod_id` | `pods.id` | Links to pods |

## Indexes

| Index Name | Definition |
|------------|------------|
| `team_metrics_pkey` | `CREATE UNIQUE INDEX team_metrics_pkey ON public.team_metrics USING btree (id)` |
| `team_metrics_pod_id_metric_date_metric_period_key` | `CREATE UNIQUE INDEX team_metrics_pod_id_metric_date_metric_period_key ON public.team_metrics USIN...` |
| `team_metrics_date_idx` | `CREATE INDEX team_metrics_date_idx ON public.team_metrics USING btree (metric_date)` |
| `team_metrics_pod_idx` | `CREATE INDEX team_metrics_pod_idx ON public.team_metrics USING btree (pod_id)` |

## Usage Notes

