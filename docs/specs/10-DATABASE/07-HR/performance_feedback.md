# performance_feedback Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `performance_feedback` |
| Schema | `public` |
| Purpose | Continuous performance feedback and comments |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `review_id` | uuid | NO | - | Reference to review |
| `feedback_type` | enum | NO | - | Feedback Type |
| `content` | text | NO | - | Content |
| `category` | text | YES | - | Category |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `performance_feedback_pkey` | `CREATE UNIQUE INDEX performance_feedback_pkey ON public.performance_feedback USING btree (id)` |
| `idx_performance_feedback_review_id` | `CREATE INDEX idx_performance_feedback_review_id ON public.performance_feedback USING btree (revie...` |
| `idx_performance_feedback_type` | `CREATE INDEX idx_performance_feedback_type ON public.performance_feedback USING btree (feedback_t...` |

## Usage Notes

- Part of performance management system
- Supports continuous feedback and formal reviews
