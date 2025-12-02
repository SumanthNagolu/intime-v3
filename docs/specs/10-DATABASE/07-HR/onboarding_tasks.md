# onboarding_tasks Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `onboarding_tasks` |
| Schema | `public` |
| Purpose | Individual onboarding task assignments and completion |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `onboarding_id` | uuid | NO | - | Reference to onboarding |
| `task_name` | text | NO | - | Task Name |
| `category` | enum | NO | 'other'::task_category | Category |
| `description` | text | YES | - | Description |
| `is_required` | boolean | YES | true | Required flag |
| `due_days_from_start` | integer | YES | - | Due Days From Start |
| `status` | enum | NO | 'pending'::task_status | Current status |
| `completed_at` | timestamptz | YES | - | Completed At |
| `completed_by` | uuid | YES | - | Completed By |
| `notes` | text | YES | - | Notes |
| `sort_order` | integer | NO | 0 | Sort Order |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `completed_by` | `user_profiles.id` | Links to user profiles |
| `onboarding_id` | `employee_onboarding.id` | Links to employee onboarding |

## Indexes

| Index Name | Definition |
|------------|------------|
| `onboarding_tasks_pkey` | `CREATE UNIQUE INDEX onboarding_tasks_pkey ON public.onboarding_tasks USING btree (id)` |
| `idx_onboarding_tasks_onboarding_id` | `CREATE INDEX idx_onboarding_tasks_onboarding_id ON public.onboarding_tasks USING btree (onboardin...` |
| `idx_onboarding_tasks_status` | `CREATE INDEX idx_onboarding_tasks_status ON public.onboarding_tasks USING btree (status)` |

## Usage Notes

- Part of employee onboarding workflow
- Tracks tasks and checklist completion
