# external_job_order_notes Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `external_job_order_notes` |
| Schema | `public` |
| Purpose | Stores notes and comments related to external job orders for collaboration and tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| order_id | uuid | NO | - | Reference to external job order |
| note | text | NO | - | Note content |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| created_by | uuid | YES | - | User who created the note |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| order_id | external_job_orders.id | job_order_notes_order_id_fkey |
| created_by | user_profiles.id | job_order_notes_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| job_order_notes_pkey | CREATE UNIQUE INDEX job_order_notes_pkey ON public.external_job_order_notes USING btree (id) |
| idx_job_order_notes_order_id | CREATE INDEX idx_job_order_notes_order_id ON public.external_job_order_notes USING btree (order_id) |
