# benefit_dependents Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `benefit_dependents` |
| Schema | `public` |
| Purpose | Employee benefit dependents (spouse, children, etc.) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `employee_benefit_id` | uuid | NO | - | Reference to employee benefit |
| `name` | text | NO | - | Name |
| `relationship` | enum | NO | - | Relationship |
| `date_of_birth` | date | YES | - | Date Of Birth |
| `ssn_encrypted` | text | YES | - | Ssn Encrypted |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `employee_benefit_id` | `employee_benefits.id` | Links to employee benefits |

## Indexes

| Index Name | Definition |
|------------|------------|
| `benefit_dependents_pkey` | `CREATE UNIQUE INDEX benefit_dependents_pkey ON public.benefit_dependents USING btree (id)` |
| `idx_benefit_dependents_employee_benefit_id` | `CREATE INDEX idx_benefit_dependents_employee_benefit_id ON public.benefit_dependents USING btree ...` |

## Usage Notes

- Part of employee benefits management system
- Linked to benefit plans and employee enrollments
