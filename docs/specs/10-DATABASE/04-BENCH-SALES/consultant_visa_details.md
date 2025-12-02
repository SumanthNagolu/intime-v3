# consultant_visa_details Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `consultant_visa_details` |
| Schema | `public` |
| Purpose | Comprehensive tracking of consultant visa information including type, validity dates, LCA status, employer of record, and alert levels for expiry management |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| consultant_id | uuid | NO | - | Reference to bench consultant |
| visa_type | visa_type | NO | - | Type of visa (enum) |
| visa_start_date | date | YES | - | Visa start/issue date |
| visa_expiry_date | date | YES | - | Visa expiration date |
| lca_status | text | YES | - | Labor Condition Application status |
| employer_of_record | text | YES | - | Current employer of record |
| grace_period_ends | date | YES | - | Grace period end date |
| alert_level | visa_alert_level | YES | 'green' | Alert status (green/yellow/red) |
| notes | text | YES | - | Additional visa-related notes |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| consultant_id | bench_consultants.id | consultant_visa_details_consultant_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| consultant_visa_details_pkey | CREATE UNIQUE INDEX consultant_visa_details_pkey ON public.consultant_visa_details USING btree (id) |
| idx_consultant_visa_details_consultant_id | CREATE INDEX idx_consultant_visa_details_consultant_id ON public.consultant_visa_details USING btree (consultant_id) |
| idx_consultant_visa_details_alert_level | CREATE INDEX idx_consultant_visa_details_alert_level ON public.consultant_visa_details USING btree (alert_level) |
