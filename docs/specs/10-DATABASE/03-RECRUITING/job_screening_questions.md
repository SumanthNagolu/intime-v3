# job_screening_questions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `job_screening_questions` |
| Schema | `public` |
| Purpose | Custom screening questions configured for specific jobs |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| job_id | uuid | NO | - | Foreign key to job |
| question | text | NO | - | Question |
| type | text | NO | 'text'::text | Type |
| options | jsonb | YES | - | Options |
| is_required | boolean | YES | false | Is required |
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
| job_screening_questions_pkey | CREATE UNIQUE INDEX job_screening_questions_pkey ON public.job_screening_questions USING btree (id) |
| idx_job_screening_questions_job_id | CREATE INDEX idx_job_screening_questions_job_id ON public.job_screening_questions USING btree (job_id) |
