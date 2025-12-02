# external_job_order_requirements Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `external_job_order_requirements` |
| Schema | `public` |
| Purpose | Stores structured requirements for external job orders including must-haves, nice-to-haves, and other criteria with priority ordering |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| order_id | uuid | NO | - | Reference to external job order |
| requirement | text | NO | - | Requirement description |
| type | text | NO | - | Requirement type (must-have/nice-to-have) |
| priority | integer | YES | 1 | Priority order (1 = highest) |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| order_id | external_job_orders.id | job_order_requirements_order_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| job_order_requirements_pkey | CREATE UNIQUE INDEX job_order_requirements_pkey ON public.external_job_order_requirements USING btree (id) |
| idx_job_order_requirements_order_id | CREATE INDEX idx_job_order_requirements_order_id ON public.external_job_order_requirements USING btree (order_id) |
