# submission_status_history Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `submission_status_history` |
| Schema | `public` |
| Purpose | Audit trail of submission status changes |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| submission_id | uuid | NO | - | Foreign key to submission |
| from_status | text | YES | - | From status |
| to_status | text | NO | - | To status |
| reason | text | YES | - | Reason |
| changed_by | uuid | NO | - | Changed by |
| changed_at | timestamp with time zone | NO | now() | Changed at |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| changed_by | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |
| submission_id | submissions.id | Submissions |

## Indexes

| Index Name | Definition |
|------------|------------|
| submission_status_history_pkey | CREATE UNIQUE INDEX submission_status_history_pkey ON public.submission_status_history USING btree (id) |
| idx_submission_status_history_submission_id | CREATE INDEX idx_submission_status_history_submission_id ON public.submission_status_history USING btree (submission_id) |
