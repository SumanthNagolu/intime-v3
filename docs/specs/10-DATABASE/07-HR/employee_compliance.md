# employee_compliance Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employee_compliance` |
| Schema | `public` |
| Purpose | Employee compliance requirements and completion status |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `employee_id` | uuid | NO | - | Employee reference |
| `requirement_id` | uuid | NO | - | Reference to requirement |
| `status` | enum | NO | 'pending'::compliance_status | Current status |
| `due_date` | date | YES | - | Due Date |
| `completed_at` | timestamptz | YES | - | Completed At |
| `document_url` | text | YES | - | Document Url |
| `notes` | text | YES | - | Notes |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `employee_id` | `employees.id` | Links to employees |
| `requirement_id` | `compliance_requirements.id` | Links to compliance requirements |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employee_compliance_pkey` | `CREATE UNIQUE INDEX employee_compliance_pkey ON public.employee_compliance USING btree (id)` |
| `idx_employee_compliance_employee_id` | `CREATE INDEX idx_employee_compliance_employee_id ON public.employee_compliance USING btree (emplo...` |
| `idx_employee_compliance_requirement_id` | `CREATE INDEX idx_employee_compliance_requirement_id ON public.employee_compliance USING btree (re...` |
| `idx_employee_compliance_status` | `CREATE INDEX idx_employee_compliance_status ON public.employee_compliance USING btree (status)` |

## Usage Notes

- Extends employee data with compliance information
- Linked to employees table via employee_id foreign key
