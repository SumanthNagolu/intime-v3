# pod_sprint_metrics Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `pod_sprint_metrics` |
| Schema | `public` |
| Purpose | Sprint-level performance metrics for pods |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `pod_id` | uuid | NO | - | Reference to pod |
| `sprint_number` | integer | NO | - | Sprint Number |
| `sprint_start_date` | date | NO | - | Sprint Start Date |
| `sprint_end_date` | date | NO | - | Sprint End Date |
| `total_placements` | integer | NO | 0 | Total Placements |
| `total_credits` | numeric | NO | 0 | Total Credits |
| `target_met` | boolean | YES | false | Target Met |
| `total_estimated_revenue` | numeric | YES | 0 | Total Estimated Revenue |
| `average_margin` | numeric | YES | - | Average Margin |
| `placements_from_recruiting` | integer | YES | 0 | Placements From Recruiting |
| `placements_from_bench_sales` | integer | YES | 0 | Placements From Bench Sales |
| `placements_from_academy` | integer | YES | 0 | Placements From Academy |
| `placements_from_ta` | integer | YES | 0 | Placements From Ta |
| `placements_from_cross_border` | integer | YES | 0 | Placements From Cross Border |
| `submissions_count` | integer | YES | 0 | Submissions Count |
| `interviews_count` | integer | YES | 0 | Interviews Count |
| `offers_count` | integer | YES | 0 | Offers Count |
| `submission_to_placement_rate` | numeric | YES | - | Submission To Placement Rate |
| `calculated_at` | timestamptz | NO | now() | Calculated At |
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
| `pod_sprint_metrics_pkey` | `CREATE UNIQUE INDEX pod_sprint_metrics_pkey ON public.pod_sprint_metrics USING btree (id)` |
| `unique_pod_sprint` | `CREATE UNIQUE INDEX unique_pod_sprint ON public.pod_sprint_metrics USING btree (pod_id, sprint_nu...` |
| `idx_pod_sprint_metrics_org` | `CREATE INDEX idx_pod_sprint_metrics_org ON public.pod_sprint_metrics USING btree (org_id)` |
| `idx_pod_sprint_metrics_pod` | `CREATE INDEX idx_pod_sprint_metrics_pod ON public.pod_sprint_metrics USING btree (pod_id)` |
| `idx_pod_sprint_metrics_sprint` | `CREATE INDEX idx_pod_sprint_metrics_sprint ON public.pod_sprint_metrics USING btree (sprint_number)` |
| `idx_pod_sprint_metrics_target` | `CREATE INDEX idx_pod_sprint_metrics_target ON public.pod_sprint_metrics USING btree (pod_id) WHER...` |

## Usage Notes

