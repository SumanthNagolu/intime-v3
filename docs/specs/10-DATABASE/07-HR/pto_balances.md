# pto_balances Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `pto_balances` |
| Schema | `public` |
| Purpose | Employee PTO accrual and balance tracking |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `employee_id` | uuid | NO | - | Employee reference |
| `year` | integer | NO | - | Year |
| `annual_accrual_days` | numeric | YES | 15.0 | Annual Accrual Days |
| `accrual_rate_per_pay_period` | numeric | YES | - | Accrual Rate Per Pay Period |
| `total_accrued` | numeric | YES | 0 | Total Accrued |
| `total_used` | numeric | YES | 0 | Total Used |
| `total_pending` | numeric | YES | 0 | Total Pending |
| `current_balance` | numeric | YES | - | Current Balance |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `employee_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `pto_balances_pkey` | `CREATE UNIQUE INDEX pto_balances_pkey ON public.pto_balances USING btree (employee_id, year)` |
| `idx_pto_balances_year` | `CREATE INDEX idx_pto_balances_year ON public.pto_balances USING btree (year)` |
| `idx_pto_balances_employee` | `CREATE INDEX idx_pto_balances_employee ON public.pto_balances USING btree (employee_id)` |

## Usage Notes

