# benefit_plan_options Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `benefit_plan_options` |
| Schema | `public` |
| Purpose | Available benefit plan options and tiers |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `plan_id` | uuid | NO | - | Reference to plan |
| `option_name` | text | NO | - | Option Name |
| `coverage_level` | enum | NO | - | Coverage Level |
| `employer_contribution` | numeric | YES | - | Employer Contribution |
| `employee_contribution` | numeric | YES | - | Employee Contribution |
| `description` | text | YES | - | Description |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `plan_id` | `benefit_plans.id` | Links to benefit plans |

## Indexes

| Index Name | Definition |
|------------|------------|
| `benefit_plan_options_pkey` | `CREATE UNIQUE INDEX benefit_plan_options_pkey ON public.benefit_plan_options USING btree (id)` |
| `idx_benefit_plan_options_plan_id` | `CREATE INDEX idx_benefit_plan_options_plan_id ON public.benefit_plan_options USING btree (plan_id)` |

## Usage Notes

- Part of employee benefits management system
- Linked to benefit plans and employee enrollments
