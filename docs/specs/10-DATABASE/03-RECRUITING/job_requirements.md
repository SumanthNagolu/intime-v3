# job_requirements Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `job_requirements` |
| Schema | `public` |
| Purpose | Defines detailed requirements and qualifications for job positions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| job_id | uuid | NO | - | Foreign key to job |
| requirement | text | NO | - | Requirement |
| type | text | NO | 'must_have'::text | Type |
| sequence | integer | YES | 0 | Sequence |
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
| job_requirements_pkey | CREATE UNIQUE INDEX job_requirements_pkey ON public.job_requirements USING btree (id) |
| idx_job_requirements_job_id | CREATE INDEX idx_job_requirements_job_id ON public.job_requirements USING btree (job_id) |
