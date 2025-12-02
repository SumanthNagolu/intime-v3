# resume_versions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `resume_versions` |
| Schema | `public` |
| Purpose | Version history for candidate resumes |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| student_id | uuid | NO | - | Foreign key to student |
| version | integer | NO | 1 | Version |
| format | text | NO | - | Format |
| content | jsonb | NO | - | Content |
| ats_score | integer | NO | 0 | Ats score |
| keyword_matches | ARRAY | NO | '{}'::text[] | Keyword matches |
| target_job_description | text | YES | - | Target job description |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| student_id | user_profiles.id | User profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| resume_versions_pkey | CREATE UNIQUE INDEX resume_versions_pkey ON public.resume_versions USING btree (id) |
| resume_versions_student_id_version_key | CREATE UNIQUE INDEX resume_versions_student_id_version_key ON public.resume_versions USING btree (student_id, version) |
| idx_resume_versions_student | CREATE INDEX idx_resume_versions_student ON public.resume_versions USING btree (student_id, created_at DESC) |
| idx_resume_versions_format | CREATE INDEX idx_resume_versions_format ON public.resume_versions USING btree (format) |
| idx_resume_versions_ats_score | CREATE INDEX idx_resume_versions_ats_score ON public.resume_versions USING btree (ats_score DESC) |
