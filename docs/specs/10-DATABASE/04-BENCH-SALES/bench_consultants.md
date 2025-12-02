# bench_consultants Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `bench_consultants` |
| Schema | `public` |
| Purpose | Core table for managing consultants on the bench, tracking their availability status, work authorization, rates, and assignment to bench sales representatives |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization identifier |
| candidate_id | uuid | NO | - | Reference to candidate profile (unique) |
| status | bench_status | NO | 'available' | Bench availability status |
| bench_start_date | date | NO | - | Date when consultant went on bench |
| visa_type | visa_type | YES | - | Type of visa (enum) |
| visa_expiry_date | date | YES | - | Visa expiration date |
| work_auth_status | text | YES | - | Current work authorization status |
| min_acceptable_rate | numeric | YES | - | Minimum rate consultant will accept |
| target_rate | numeric | YES | - | Target rate for marketing |
| currency | text | YES | 'USD' | Currency for rates |
| willing_relocate | boolean | YES | false | Whether consultant is willing to relocate |
| preferred_locations | text[] | YES | - | Array of preferred work locations |
| marketing_status | marketing_status | YES | 'draft' | Status of marketing materials |
| bench_sales_rep_id | uuid | YES | - | Assigned bench sales representative |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | User who created the record |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| org_id | organizations.id | bench_consultants_org_id_fkey |
| candidate_id | user_profiles.id | bench_consultants_candidate_id_fkey |
| bench_sales_rep_id | user_profiles.id | bench_consultants_bench_sales_rep_id_fkey |
| created_by | user_profiles.id | bench_consultants_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| bench_consultants_pkey | CREATE UNIQUE INDEX bench_consultants_pkey ON public.bench_consultants USING btree (id) |
| bench_consultants_candidate_id_key | CREATE UNIQUE INDEX bench_consultants_candidate_id_key ON public.bench_consultants USING btree (candidate_id) |
| idx_bench_consultants_org_id | CREATE INDEX idx_bench_consultants_org_id ON public.bench_consultants USING btree (org_id) |
| idx_bench_consultants_candidate_id | CREATE INDEX idx_bench_consultants_candidate_id ON public.bench_consultants USING btree (candidate_id) |
| idx_bench_consultants_status | CREATE INDEX idx_bench_consultants_status ON public.bench_consultants USING btree (status) |
| idx_bench_consultants_bench_sales_rep_id | CREATE INDEX idx_bench_consultants_bench_sales_rep_id ON public.bench_consultants USING btree (bench_sales_rep_id) |
| idx_bench_consultants_org | CREATE INDEX idx_bench_consultants_org ON public.bench_consultants USING btree (org_id) |
