# pods Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `pods` |
| Schema | `public` |
| Purpose | Team pods with sprint metrics (recruiting, bench sales, TA) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `name` | text | NO | - | Name |
| `pod_type` | text | NO | - | Pod Type |
| `senior_member_id` | uuid | YES | - | Reference to senior member |
| `junior_member_id` | uuid | YES | - | Reference to junior member |
| `sprint_duration_weeks` | integer | YES | 2 | Sprint Duration Weeks |
| `placements_per_sprint_target` | integer | YES | 2 | Placements Per Sprint Target |
| `total_placements` | integer | YES | 0 | Total Placements |
| `current_sprint_placements` | integer | YES | 0 | Current Sprint Placements |
| `current_sprint_start_date` | date | YES | - | Current Sprint Start Date |
| `average_placements_per_sprint` | numeric | YES | - | Average Placements Per Sprint |
| `is_active` | boolean | YES | true | Active/inactive flag |
| `formed_date` | date | YES | - | Formed Date |
| `dissolved_date` | date | YES | - | Dissolved Date |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |
| `region_id` | uuid | YES | - | Reference to region |
| `status` | text | YES | 'active'::text | Current status |
| `deleted_at` | timestamptz | YES | - | Soft delete timestamp (NULL if active) |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user profiles |
| `junior_member_id` | `user_profiles.id` | Links to user profiles |
| `org_id` | `organizations.id` | Links to organizations |
| `region_id` | `regions.id` | Links to regions |
| `senior_member_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `pods_pkey` | `CREATE UNIQUE INDEX pods_pkey ON public.pods USING btree (id)` |
| `idx_pods_org` | `CREATE INDEX idx_pods_org ON public.pods USING btree (org_id)` |
| `idx_pods_type` | `CREATE INDEX idx_pods_type ON public.pods USING btree (pod_type)` |
| `idx_pods_members` | `CREATE INDEX idx_pods_members ON public.pods USING btree (senior_member_id, junior_member_id)` |
| `idx_pods_active` | `CREATE INDEX idx_pods_active ON public.pods USING btree (is_active) WHERE (is_active = true)` |
| `idx_pods_region_id` | `CREATE INDEX idx_pods_region_id ON public.pods USING btree (region_id)` |

## Usage Notes

- Pods are teams in InTime v3
- Each pod has a senior (manager) and junior (recruiter) member
- Pod types: recruiting, bench_sales, ta
- Tracks sprint metrics and placement targets
