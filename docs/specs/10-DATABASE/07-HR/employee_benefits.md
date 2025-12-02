# employee_benefits Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employee_benefits` |
| Schema | `public` |
| Purpose | Employee benefit enrollments and coverage tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `employee_id` | uuid | NO | - | Employee reference |
| `plan_option_id` | uuid | NO | - | Reference to plan option |
| `status` | enum | NO | 'pending'::benefit_status | Current status |
| `enrollment_date` | date | YES | - | Enrollment Date |
| `coverage_start` | date | YES | - | Coverage Start |
| `coverage_end` | date | YES | - | Coverage End |
| `dependents_count` | integer | YES | 0 | Dependents Count |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user profiles |
| `employee_id` | `employees.id` | Links to employees |
| `plan_option_id` | `benefit_plan_options.id` | Links to benefit plan options |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employee_benefits_pkey` | `CREATE UNIQUE INDEX employee_benefits_pkey ON public.employee_benefits USING btree (id)` |
| `idx_employee_benefits_employee_id` | `CREATE INDEX idx_employee_benefits_employee_id ON public.employee_benefits USING btree (employee_id)` |
| `idx_employee_benefits_plan_option_id` | `CREATE INDEX idx_employee_benefits_plan_option_id ON public.employee_benefits USING btree (plan_o...` |
| `idx_employee_benefits_status` | `CREATE INDEX idx_employee_benefits_status ON public.employee_benefits USING btree (status)` |

## Usage Notes

- Extends employee data with benefits information
- Linked to employees table via employee_id foreign key
