# productivity_reports Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `productivity_reports` |
| Schema | `public` |
| Purpose | Productivity analysis and reporting |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `user_id` | uuid | NO | - | User profile reference |
| `date` | date | NO | - | Date |
| `summary` | text | NO | - | Summary |
| `productive_hours` | double precision | NO | - | Productive Hours |
| `top_activities` | jsonb | NO | '[]'::jsonb | Top Activities |
| `insights` | jsonb | NO | '[]'::jsonb | Insights |
| `recommendations` | jsonb | NO | '[]'::jsonb | Recommendations |
| `created_at` | timestamptz | YES | now() | Record creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `user_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `productivity_reports_pkey` | `CREATE UNIQUE INDEX productivity_reports_pkey ON public.productivity_reports USING btree (id)` |
| `productivity_reports_user_id_date_key` | `CREATE UNIQUE INDEX productivity_reports_user_id_date_key ON public.productivity_reports USING bt...` |
| `idx_productivity_reports_user_date` | `CREATE INDEX idx_productivity_reports_user_date ON public.productivity_reports USING btree (user_...` |
| `idx_productivity_reports_date` | `CREATE INDEX idx_productivity_reports_date ON public.productivity_reports USING btree (date DESC)` |
| `idx_productivity_reports_user` | `CREATE INDEX idx_productivity_reports_user ON public.productivity_reports USING btree (user_id)` |

## Usage Notes

