# external_job_order_skills Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `external_job_order_skills` |
| Schema | `public` |
| Purpose | Defines required skills for external job orders with years of experience and proficiency level requirements |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| order_id | uuid | NO | - | Reference to external job order |
| skill_name | text | NO | - | Name of the skill |
| years_required | numeric | YES | - | Years of experience required |
| proficiency_required | integer | YES | - | Proficiency level required (1-5) |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| order_id | external_job_orders.id | job_order_skills_order_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| job_order_skills_pkey | CREATE UNIQUE INDEX job_order_skills_pkey ON public.external_job_order_skills USING btree (id) |
| idx_job_order_skills_order_id | CREATE INDEX idx_job_order_skills_order_id ON public.external_job_order_skills USING btree (order_id) |
