# performance_goals Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `performance_goals` |
| Schema | `public` |
| Purpose | Employee performance goals and objectives |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `employee_id` | uuid | NO | - | Employee reference |
| `review_id` | uuid | YES | - | Reference to review |
| `goal` | text | NO | - | Goal |
| `category` | enum | NO | - | Category |
| `weight_percent` | integer | YES | - | Weight Percent |
| `status` | enum | NO | 'not_started'::goal_status | Current status |
| `rating` | integer | YES | - | Rating |
| `comments` | text | YES | - | Comments |
| `start_date` | date | YES | - | Start Date |
| `target_date` | date | YES | - | Target Date |
| `completed_at` | timestamptz | YES | - | Completed At |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user profiles |
| `employee_id` | `employees.id` | Links to employees |

## Indexes

| Index Name | Definition |
|------------|------------|
| `performance_goals_pkey` | `CREATE UNIQUE INDEX performance_goals_pkey ON public.performance_goals USING btree (id)` |
| `idx_performance_goals_employee_id` | `CREATE INDEX idx_performance_goals_employee_id ON public.performance_goals USING btree (employee_id)` |
| `idx_performance_goals_review_id` | `CREATE INDEX idx_performance_goals_review_id ON public.performance_goals USING btree (review_id)` |
| `idx_performance_goals_status` | `CREATE INDEX idx_performance_goals_status ON public.performance_goals USING btree (status)` |

## Usage Notes

- Part of performance management system
- Supports continuous feedback and formal reviews
