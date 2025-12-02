# employee_metadata Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employee_metadata` |
| Schema | `public` |
| Purpose | Flexible key-value metadata storage for employee records |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `user_id` | uuid | NO | - | User profile reference |
| `employment_type` | text | YES | 'full_time'::text | Employment type (FTE, contractor, etc.) |
| `employee_id_number` | text | YES | - | Employee Id Number |
| `bonus_target` | numeric | YES | - | Bonus Target |
| `commission_plan` | text | YES | - | Commission Plan |
| `equity_shares` | integer | YES | - | Equity Shares |
| `pod_id` | uuid | YES | - | Reference to pod |
| `pod_role` | text | YES | - | Pod Role |
| `kpi_targets` | jsonb | YES | - | Kpi Targets |
| `monthly_placement_target` | integer | YES | - | Monthly Placement Target |
| `work_schedule` | text | YES | 'standard'::text | Work Schedule |
| `weekly_hours` | integer | YES | 40 | Weekly Hours |
| `benefits_eligible` | boolean | YES | true | Benefits Eligible |
| `benefits_start_date` | date | YES | - | Benefits Start Date |
| `emergency_contact_name` | text | YES | - | Emergency Contact Name |
| `emergency_contact_phone` | text | YES | - | Emergency Contact Phone |
| `emergency_contact_relationship` | text | YES | - | Emergency Contact Relationship |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `user_id` | `user_profiles.id` | Links to user profiles |
| `pod_id` | `pods.id` | Links to pods |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employee_metadata_pkey` | `CREATE UNIQUE INDEX employee_metadata_pkey ON public.employee_metadata USING btree (user_id)` |
| `employee_metadata_employee_id_number_key` | `CREATE UNIQUE INDEX employee_metadata_employee_id_number_key ON public.employee_metadata USING bt...` |
| `idx_employee_metadata_pod` | `CREATE INDEX idx_employee_metadata_pod ON public.employee_metadata USING btree (pod_id)` |
| `idx_employee_id_number` | `CREATE INDEX idx_employee_id_number ON public.employee_metadata USING btree (employee_id_number) ...` |

## Usage Notes

- Extends employee data with metadata information
- Linked to employees table via employee_id foreign key
