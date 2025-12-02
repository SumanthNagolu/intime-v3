# employee_onboarding Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employee_onboarding` |
| Schema | `public` |
| Purpose | Employee onboarding status and workflow tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `employee_id` | uuid | NO | - | Employee reference |
| `checklist_template_id` | uuid | YES | - | Reference to checklist template |
| `status` | enum | NO | 'not_started'::onboarding_status | Current status |
| `started_at` | timestamptz | YES | - | Started At |
| `completed_at` | timestamptz | YES | - | Completed At |
| `assigned_to` | uuid | YES | - | Assigned To |
| `notes` | text | YES | - | Notes |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `assigned_to` | `user_profiles.id` | Links to user profiles |
| `created_by` | `user_profiles.id` | Links to user profiles |
| `employee_id` | `employees.id` | Links to employees |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employee_onboarding_pkey` | `CREATE UNIQUE INDEX employee_onboarding_pkey ON public.employee_onboarding USING btree (id)` |
| `idx_employee_onboarding_employee_id` | `CREATE INDEX idx_employee_onboarding_employee_id ON public.employee_onboarding USING btree (emplo...` |
| `idx_employee_onboarding_status` | `CREATE INDEX idx_employee_onboarding_status ON public.employee_onboarding USING btree (status)` |

## Usage Notes

- Extends employee data with onboarding information
- Linked to employees table via employee_id foreign key
