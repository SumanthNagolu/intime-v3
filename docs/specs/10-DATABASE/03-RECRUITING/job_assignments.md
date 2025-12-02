# job_assignments Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `job_assignments` |
| Schema | `public` |
| Purpose | Tracks user assignments to jobs (recruiters working on specific requisitions) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| job_id | uuid | NO | - | Foreign key to job |
| user_id | uuid | NO | - | Foreign key to user |
| role | text | NO | 'secondary'::text | Role |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| job_id | jobs.id | Jobs |
| org_id | organizations.id | Organizations |
| user_id | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| job_assignments_pkey | CREATE UNIQUE INDEX job_assignments_pkey ON public.job_assignments USING btree (id) |
| job_assignments_job_id_user_id_key | CREATE UNIQUE INDEX job_assignments_job_id_user_id_key ON public.job_assignments USING btree (job_id, user_id) |
| idx_job_assignments_job_id | CREATE INDEX idx_job_assignments_job_id ON public.job_assignments USING btree (job_id) |
| idx_job_assignments_user_id | CREATE INDEX idx_job_assignments_user_id ON public.job_assignments USING btree (user_id) |
