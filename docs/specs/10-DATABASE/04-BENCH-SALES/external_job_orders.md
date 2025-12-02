# external_job_orders Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `external_job_orders` |
| Schema | `public` |
| Purpose | Tracks external job orders/requirements received from vendors and clients, including details like rate, location, duration, and response deadlines |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization identifier |
| vendor_id | uuid | YES | - | Reference to vendor (if from vendor) |
| client_name | text | YES | - | Client name (if not in system) |
| title | text | NO | - | Job title/position |
| description | text | YES | - | Job description |
| location | text | YES | - | Job location |
| work_mode | text | YES | - | Work mode (remote/hybrid/onsite) |
| rate_type | text | YES | 'hourly' | Rate type (hourly/daily/annual) |
| bill_rate | numeric | YES | - | Bill rate offered |
| duration_months | integer | YES | - | Expected duration in months |
| positions | integer | YES | 1 | Number of positions |
| status | job_order_status | NO | 'new' | Order status (new/reviewing/submitted/etc.) |
| priority | job_order_priority | YES | 'medium' | Priority level (low/medium/high/urgent) |
| received_at | timestamp with time zone | NO | now() | When order was received |
| response_due_at | timestamp with time zone | YES | - | Response deadline |
| source | job_order_source | YES | 'email' | Source of the order (email/phone/portal) |
| original_source_url | text | YES | - | Original source URL if applicable |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | User who created the record |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| org_id | organizations.id | job_orders_org_id_fkey |
| vendor_id | vendors.id | job_orders_vendor_id_fkey |
| created_by | user_profiles.id | job_orders_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| job_orders_pkey | CREATE UNIQUE INDEX job_orders_pkey ON public.external_job_orders USING btree (id) |
| idx_job_orders_org_id | CREATE INDEX idx_job_orders_org_id ON public.external_job_orders USING btree (org_id) |
| idx_job_orders_vendor_id | CREATE INDEX idx_job_orders_vendor_id ON public.external_job_orders USING btree (vendor_id) |
| idx_job_orders_status | CREATE INDEX idx_job_orders_status ON public.external_job_orders USING btree (status) |
| idx_job_orders_priority | CREATE INDEX idx_job_orders_priority ON public.external_job_orders USING btree (priority) |
| idx_external_job_orders_org | CREATE INDEX idx_external_job_orders_org ON public.external_job_orders USING btree (org_id) |
| idx_external_job_orders_status | CREATE INDEX idx_external_job_orders_status ON public.external_job_orders USING btree (org_id, status) WHERE (deleted_at IS NULL) |
