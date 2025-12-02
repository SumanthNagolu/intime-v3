# payroll_items Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `payroll_items` |
| Schema | `public` |
| Purpose | Individual payroll line items and deductions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `payroll_run_id` | uuid | NO | - | Reference to payroll run |
| `employee_id` | uuid | NO | - | Employee reference |
| `base_salary` | numeric | YES | - | Base Salary |
| `commission` | numeric | YES | - | Commission |
| `bonus` | numeric | YES | - | Bonus |
| `overtime_hours` | numeric | YES | - | Overtime Hours |
| `overtime_pay` | numeric | YES | - | Overtime Pay |
| `other_earnings` | numeric | YES | - | Other Earnings |
| `gross_pay` | numeric | NO | - | Gross Pay |
| `taxes_withheld` | numeric | YES | - | Taxes Withheld |
| `benefits_deductions` | numeric | YES | - | Benefits Deductions |
| `other_deductions` | numeric | YES | - | Other Deductions |
| `net_pay` | numeric | NO | - | Net Pay |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `employee_id` | `user_profiles.id` | Links to user profiles |
| `payroll_run_id` | `payroll_runs.id` | Links to payroll runs |

## Indexes

| Index Name | Definition |
|------------|------------|
| `payroll_items_pkey` | `CREATE UNIQUE INDEX payroll_items_pkey ON public.payroll_items USING btree (id)` |
| `payroll_items_payroll_run_id_employee_id_key` | `CREATE UNIQUE INDEX payroll_items_payroll_run_id_employee_id_key ON public.payroll_items USING bt...` |
| `idx_payroll_items_run` | `CREATE INDEX idx_payroll_items_run ON public.payroll_items USING btree (payroll_run_id)` |
| `idx_payroll_items_employee` | `CREATE INDEX idx_payroll_items_employee ON public.payroll_items USING btree (employee_id)` |

## Usage Notes

