# consultant_work_authorization Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `consultant_work_authorization` |
| Schema | `public` |
| Purpose | Stores work authorization documents and verification information for consultants including document URLs, verification status, and validity periods |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| consultant_id | uuid | NO | - | Reference to bench consultant |
| auth_type | text | NO | - | Type of work authorization |
| start_date | date | YES | - | Authorization start date |
| end_date | date | YES | - | Authorization end date |
| document_url | text | YES | - | URL to authorization document |
| document_file_id | uuid | YES | - | Reference to file storage |
| verified_by | uuid | YES | - | User who verified the document |
| verified_at | timestamp with time zone | YES | - | Verification timestamp |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| consultant_id | bench_consultants.id | consultant_work_authorization_consultant_id_fkey |
| verified_by | user_profiles.id | consultant_work_authorization_verified_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| consultant_work_authorization_pkey | CREATE UNIQUE INDEX consultant_work_authorization_pkey ON public.consultant_work_authorization USING btree (id) |
| idx_consultant_work_auth_consultant_id | CREATE INDEX idx_consultant_work_auth_consultant_id ON public.consultant_work_authorization USING btree (consultant_id) |
