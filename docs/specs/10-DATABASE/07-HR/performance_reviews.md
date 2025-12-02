# performance_reviews Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `performance_reviews` |
| Schema | `public` |
| Purpose | Formal performance review cycles and ratings |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `employee_id` | uuid | NO | - | Employee reference |
| `reviewer_id` | uuid | NO | - | Reference to reviewer |
| `review_cycle` | text | NO | - | Review Cycle |
| `review_type` | text | YES | 'annual'::text | Review Type |
| `period_start_date` | date | NO | - | Period Start Date |
| `period_end_date` | date | NO | - | Period End Date |
| `overall_rating` | integer | YES | - | Overall Rating |
| `quality_of_work` | integer | YES | - | Quality Of Work |
| `communication` | integer | YES | - | Communication |
| `teamwork` | integer | YES | - | Teamwork |
| `initiative` | integer | YES | - | Initiative |
| `reliability` | integer | YES | - | Reliability |
| `goals_achieved` | jsonb | YES | - | Goals Achieved |
| `goals_next_period` | jsonb | YES | - | Goals Next Period |
| `strengths` | text | YES | - | Strengths |
| `areas_for_improvement` | text | YES | - | Areas For Improvement |
| `manager_comments` | text | YES | - | Manager Comments |
| `employee_self_assessment` | text | YES | - | Employee Self Assessment |
| `employee_comments` | text | YES | - | Employee Comments |
| `status` | text | NO | 'draft'::text | Current status |
| `scheduled_date` | date | YES | - | Scheduled Date |
| `completed_at` | timestamptz | YES | - | Completed At |
| `employee_acknowledged_at` | timestamptz | YES | - | Employee Acknowledged At |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `employee_id` | `user_profiles.id` | Links to user profiles |
| `org_id` | `organizations.id` | Links to organizations |
| `reviewer_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `performance_reviews_pkey` | `CREATE UNIQUE INDEX performance_reviews_pkey ON public.performance_reviews USING btree (id)` |
| `idx_reviews_org` | `CREATE INDEX idx_reviews_org ON public.performance_reviews USING btree (org_id)` |
| `idx_reviews_employee` | `CREATE INDEX idx_reviews_employee ON public.performance_reviews USING btree (employee_id)` |
| `idx_reviews_reviewer` | `CREATE INDEX idx_reviews_reviewer ON public.performance_reviews USING btree (reviewer_id)` |
| `idx_reviews_cycle` | `CREATE INDEX idx_reviews_cycle ON public.performance_reviews USING btree (review_cycle)` |
| `idx_reviews_status` | `CREATE INDEX idx_reviews_status ON public.performance_reviews USING btree (status)` |

## Usage Notes

- Part of performance management system
- Supports continuous feedback and formal reviews
