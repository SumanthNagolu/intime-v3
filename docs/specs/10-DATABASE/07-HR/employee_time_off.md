# employee_time_off Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employee_time_off` |
| Schema | `public` |
| Purpose | Employee time off requests and approvals |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `employee_id` | uuid | NO | - | Employee reference |
| `type` | enum | NO | - | Type |
| `status` | enum | NO | 'pending'::time_off_status | Current status |
| `start_date` | date | NO | - | Start Date |
| `end_date` | date | NO | - | End Date |
| `hours` | numeric | NO | - | Hours |
| `reason` | text | YES | - | Reason |
| `approved_by` | uuid | YES | - | Approved By |
| `approved_at` | timestamptz | YES | - | Approved At |
| `denial_reason` | text | YES | - | Denial Reason |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `approved_by` | `user_profiles.id` | Links to user profiles |
| `created_by` | `user_profiles.id` | Links to user profiles |
| `employee_id` | `employees.id` | Links to employees |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employee_time_off_pkey` | `CREATE UNIQUE INDEX employee_time_off_pkey ON public.employee_time_off USING btree (id)` |
| `idx_employee_time_off_employee_id` | `CREATE INDEX idx_employee_time_off_employee_id ON public.employee_time_off USING btree (employee_id)` |
| `idx_employee_time_off_status` | `CREATE INDEX idx_employee_time_off_status ON public.employee_time_off USING btree (status)` |
| `idx_employee_time_off_dates` | `CREATE INDEX idx_employee_time_off_dates ON public.employee_time_off USING btree (start_date, end...` |

## Usage Notes

- Extends employee data with time_off information
- Linked to employees table via employee_id foreign key
