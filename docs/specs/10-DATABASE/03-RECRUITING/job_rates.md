# job_rates Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `job_rates` |
| Schema | `public` |
| Purpose | Stores detailed rate structures and terms for job positions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| job_id | uuid | NO | - | Foreign key to job |
| bill_rate_min | numeric | YES | - | Bill rate min |
| bill_rate_max | numeric | YES | - | Bill rate max |
| pay_rate_min | numeric | YES | - | Pay rate min |
| pay_rate_max | numeric | YES | - | Pay rate max |
| currency | text | YES | 'USD'::text | Currency |
| rate_type | text | YES | 'hourly'::text | Rate type |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| job_id | jobs.id | Jobs |
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| job_rates_pkey | CREATE UNIQUE INDEX job_rates_pkey ON public.job_rates USING btree (id) |
| idx_job_rates_job_id | CREATE INDEX idx_job_rates_job_id ON public.job_rates USING btree (job_id) |
