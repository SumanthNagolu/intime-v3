# employees Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employees` |
| Schema | `public` |
| Purpose | Core employee records with employment details, hierarchy, and compensation |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `user_id` | uuid | NO | - | User profile reference |
| `employee_number` | text | YES | - | Unique employee identifier |
| `status` | enum | NO | 'onboarding'::employment_status | Current status |
| `employment_type` | enum | NO | 'fte'::employment_type | Employment type (FTE, contractor, etc.) |
| `hire_date` | date | NO | - | Employee hire date |
| `termination_date` | date | YES | - | Employee termination date |
| `termination_reason` | text | YES | - | Termination Reason |
| `department` | text | YES | - | Department name |
| `job_title` | text | YES | - | Job title or position |
| `manager_id` | uuid | YES | - | Manager employee reference |
| `location` | text | YES | - | Work location |
| `work_mode` | enum | YES | 'on_site'::work_mode | Work mode (remote, hybrid, on-site) |
| `salary_type` | enum | NO | 'annual'::salary_type | Salary type (annual, hourly, etc.) |
| `salary_amount` | numeric | YES | - | Salary amount |
| `currency` | text | YES | 'USD'::text | Currency code (USD, etc.) |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |
| `updated_by` | uuid | YES | - | User who last updated the record |
| `deleted_at` | timestamptz | YES | - | Soft delete timestamp (NULL if active) |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user profiles |
| `manager_id` | `employees.id` | Links to employees |
| `org_id` | `organizations.id` | Links to organizations |
| `updated_by` | `user_profiles.id` | Links to user profiles |
| `user_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employees_pkey` | `CREATE UNIQUE INDEX employees_pkey ON public.employees USING btree (id)` |
| `employees_user_id_key` | `CREATE UNIQUE INDEX employees_user_id_key ON public.employees USING btree (user_id)` |
| `employees_employee_number_key` | `CREATE UNIQUE INDEX employees_employee_number_key ON public.employees USING btree (employee_number)` |
| `idx_employees_org_id` | `CREATE INDEX idx_employees_org_id ON public.employees USING btree (org_id)` |
| `idx_employees_user_id` | `CREATE INDEX idx_employees_user_id ON public.employees USING btree (user_id)` |
| `idx_employees_status` | `CREATE INDEX idx_employees_status ON public.employees USING btree (status)` |
| `idx_employees_manager_id` | `CREATE INDEX idx_employees_manager_id ON public.employees USING btree (manager_id)` |
| `idx_employees_deleted_at` | `CREATE INDEX idx_employees_deleted_at ON public.employees USING btree (deleted_at) WHERE (deleted...` |

## Usage Notes

- Core employee table linking user profiles to employment records
- Self-referential manager_id for org hierarchy
- Supports soft deletes via deleted_at
- Employment status enum: onboarding, active, terminated, etc.
