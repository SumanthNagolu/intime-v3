# time_attendance Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `time_attendance` |
| Schema | `public` |
| Purpose | Employee time tracking and attendance records |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `employee_id` | uuid | NO | - | Employee reference |
| `date` | date | NO | - | Date |
| `regular_hours` | numeric | YES | 0 | Regular Hours |
| `overtime_hours` | numeric | YES | 0 | Overtime Hours |
| `pto_hours` | numeric | YES | 0 | Pto Hours |
| `sick_hours` | numeric | YES | 0 | Sick Hours |
| `holiday_hours` | numeric | YES | 0 | Holiday Hours |
| `total_hours` | numeric | YES | - | Total Hours |
| `status` | text | NO | 'draft'::text | Current status |
| `approved_by` | uuid | YES | - | Approved By |
| `approved_at` | timestamptz | YES | - | Approved At |
| `rejection_reason` | text | YES | - | Rejection Reason |
| `notes` | text | YES | - | Notes |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `approved_by` | `user_profiles.id` | Links to user profiles |
| `employee_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `time_attendance_pkey` | `CREATE UNIQUE INDEX time_attendance_pkey ON public.time_attendance USING btree (id)` |
| `time_attendance_employee_id_date_key` | `CREATE UNIQUE INDEX time_attendance_employee_id_date_key ON public.time_attendance USING btree (e...` |
| `idx_time_attendance_employee` | `CREATE INDEX idx_time_attendance_employee ON public.time_attendance USING btree (employee_id)` |
| `idx_time_attendance_date` | `CREATE INDEX idx_time_attendance_date ON public.time_attendance USING btree (date DESC)` |
| `idx_time_attendance_status` | `CREATE INDEX idx_time_attendance_status ON public.time_attendance USING btree (status)` |

## Usage Notes

