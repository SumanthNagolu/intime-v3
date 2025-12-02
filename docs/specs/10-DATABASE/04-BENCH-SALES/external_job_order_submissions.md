# external_job_order_submissions Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `external_job_order_submissions` |
| Schema | `public` |
| Purpose | Tracks consultant submissions to external job orders including status, submitted rate, and client response tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| order_id | uuid | NO | - | Reference to external job order |
| consultant_id | uuid | NO | - | Reference to bench consultant |
| status | text | NO | 'submitted' | Submission status (submitted/reviewing/etc.) |
| submitted_rate | numeric | YES | - | Rate submitted to client |
| submitted_at | timestamp with time zone | NO | now() | When submission was made |
| client_response_at | timestamp with time zone | YES | - | When client responded |
| notes | text | YES | - | Submission notes |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| created_by | uuid | YES | - | User who created the submission |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| order_id | external_job_orders.id | job_order_submissions_order_id_fkey |
| consultant_id | bench_consultants.id | job_order_submissions_consultant_id_fkey |
| created_by | user_profiles.id | job_order_submissions_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| job_order_submissions_pkey | CREATE UNIQUE INDEX job_order_submissions_pkey ON public.external_job_order_submissions USING btree (id) |
| job_order_submissions_order_id_consultant_id_key | CREATE UNIQUE INDEX job_order_submissions_order_id_consultant_id_key ON public.external_job_order_submissions USING btree (order_id, consultant_id) |
| idx_job_order_submissions_order_id | CREATE INDEX idx_job_order_submissions_order_id ON public.external_job_order_submissions USING btree (order_id) |
| idx_job_order_submissions_consultant_id | CREATE INDEX idx_job_order_submissions_consultant_id ON public.external_job_order_submissions USING btree (consultant_id) |
