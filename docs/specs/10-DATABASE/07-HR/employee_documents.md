# employee_documents Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employee_documents` |
| Schema | `public` |
| Purpose | Employee document storage and metadata |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `employee_id` | uuid | NO | - | Employee reference |
| `document_type` | enum | NO | - | Document Type |
| `file_name` | text | NO | - | File Name |
| `file_url` | text | NO | - | File Url |
| `issue_date` | date | YES | - | Issue Date |
| `expiry_date` | date | YES | - | Expiry Date |
| `status` | enum | NO | 'pending'::document_status | Current status |
| `verified_by` | uuid | YES | - | Verified By |
| `verified_at` | timestamptz | YES | - | Verified At |
| `notes` | text | YES | - | Notes |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| `created_by` | uuid | YES | - | User who created the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `created_by` | `user_profiles.id` | Links to user profiles |
| `employee_id` | `employees.id` | Links to employees |
| `verified_by` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employee_documents_pkey` | `CREATE UNIQUE INDEX employee_documents_pkey ON public.employee_documents USING btree (id)` |
| `idx_employee_documents_employee_id` | `CREATE INDEX idx_employee_documents_employee_id ON public.employee_documents USING btree (employe...` |
| `idx_employee_documents_type` | `CREATE INDEX idx_employee_documents_type ON public.employee_documents USING btree (document_type)` |
| `idx_employee_documents_status` | `CREATE INDEX idx_employee_documents_status ON public.employee_documents USING btree (status)` |

## Usage Notes

- Extends employee data with documents information
- Linked to employees table via employee_id foreign key
