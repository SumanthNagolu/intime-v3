# benefit_plans Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `benefit_plans` |
| Schema | `public` |
| Purpose | Benefit plan definitions (health, dental, 401k, etc.) |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `name` | text | NO | - | Name |
| `type` | enum | NO | - | Type |
| `provider` | text | YES | - | Provider |
| `status` | text | NO | 'active'::text | Current status |
| `effective_date` | date | YES | - | Effective Date |
| `termination_date` | date | YES | - | Employee termination date |
| `description` | text | YES | - | Description |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user profiles |
| `org_id` | `organizations.id` | Links to organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| `benefit_plans_pkey` | `CREATE UNIQUE INDEX benefit_plans_pkey ON public.benefit_plans USING btree (id)` |
| `idx_benefit_plans_org_id` | `CREATE INDEX idx_benefit_plans_org_id ON public.benefit_plans USING btree (org_id)` |
| `idx_benefit_plans_type` | `CREATE INDEX idx_benefit_plans_type ON public.benefit_plans USING btree (type)` |
| `idx_benefit_plans_status` | `CREATE INDEX idx_benefit_plans_status ON public.benefit_plans USING btree (status)` |

## Usage Notes

- Part of employee benefits management system
- Linked to benefit plans and employee enrollments
