# job_skills Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `job_skills` |
| Schema | `public` |
| Purpose | Junction table linking jobs to required/preferred skills |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| job_id | uuid | NO | - | Foreign key to job |
| skill_id | uuid | NO | - | Foreign key to skill |
| importance | text | NO | 'required'::text | Importance |
| min_years | numeric | YES | - | Min years |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| job_id | jobs.id | Jobs |
| org_id | organizations.id | Organizations |
| skill_id | skills.id | Skills |

## Indexes

| Index Name | Definition |
|------------|------------|
| job_skills_pkey | CREATE UNIQUE INDEX job_skills_pkey ON public.job_skills USING btree (id) |
| job_skills_job_id_skill_id_key | CREATE UNIQUE INDEX job_skills_job_id_skill_id_key ON public.job_skills USING btree (job_id, skill_id) |
| idx_job_skills_job_id | CREATE INDEX idx_job_skills_job_id ON public.job_skills USING btree (job_id) |
| idx_job_skills_skill_id | CREATE INDEX idx_job_skills_skill_id ON public.job_skills USING btree (skill_id) |
