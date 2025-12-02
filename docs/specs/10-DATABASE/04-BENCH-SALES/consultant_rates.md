# consultant_rates Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `consultant_rates` |
| Schema | `public` |
| Purpose | Manages historical and current rate information for consultants with effective date ranges, supporting rate negotiations and tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| consultant_id | uuid | NO | - | Reference to bench consultant |
| rate_type | text | NO | 'hourly' | Type of rate (hourly, daily, etc.) |
| min_rate | numeric | NO | - | Minimum acceptable rate |
| target_rate | numeric | NO | - | Target/desired rate |
| max_rate | numeric | YES | - | Maximum rate willing to accept |
| currency | text | NO | 'USD' | Currency for rates |
| effective_from | date | NO | - | Start date for this rate |
| effective_to | date | YES | - | End date for this rate (NULL if current) |
| notes | text | YES | - | Additional notes about rate |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| created_by | uuid | YES | - | User who created the rate record |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| consultant_id | bench_consultants.id | consultant_rates_consultant_id_fkey |
| created_by | user_profiles.id | consultant_rates_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| consultant_rates_pkey | CREATE UNIQUE INDEX consultant_rates_pkey ON public.consultant_rates USING btree (id) |
| idx_consultant_rates_consultant_id | CREATE INDEX idx_consultant_rates_consultant_id ON public.consultant_rates USING btree (consultant_id) |
