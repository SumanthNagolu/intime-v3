# payroll_runs Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `payroll_runs` |
| Schema | `public` |
| Purpose | Payroll processing runs and batch metadata |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `period_start_date` | date | NO | - | Period Start Date |
| `period_end_date` | date | NO | - | Period End Date |
| `pay_date` | date | NO | - | Pay Date |
| `status` | text | NO | 'draft'::text | Current status |
| `employee_count` | integer | NO | 0 | Employee Count |
| `total_gross_pay` | numeric | YES | 0 | Total Gross Pay |
| `total_taxes` | numeric | YES | 0 | Total Taxes |
| `total_net_pay` | numeric | YES | 0 | Total Net Pay |
| `gusto_payroll_id` | text | YES | - | Reference to gusto payroll |
| `processed_at` | timestamptz | YES | - | Processed At |
| `processing_error` | text | YES | - | Processing Error |
| `approved_by` | uuid | YES | - | Approved By |
| `approved_at` | timestamptz | YES | - | Approved At |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `approved_by` | `user_profiles.id` | Links to user profiles |
| `created_by` | `user_profiles.id` | Links to user profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `payroll_runs_pkey` | `CREATE UNIQUE INDEX payroll_runs_pkey ON public.payroll_runs USING btree (id)` |
| `idx_payroll_runs_org` | `CREATE INDEX idx_payroll_runs_org ON public.payroll_runs USING btree (org_id)` |
| `idx_payroll_runs_period` | `CREATE INDEX idx_payroll_runs_period ON public.payroll_runs USING btree (period_start_date, perio...` |
| `idx_payroll_runs_status` | `CREATE INDEX idx_payroll_runs_status ON public.payroll_runs USING btree (status)` |
| `idx_payroll_runs_pay_date` | `CREATE INDEX idx_payroll_runs_pay_date ON public.payroll_runs USING btree (pay_date DESC)` |

## Usage Notes

