# submission_notes Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `submission_notes` |
| Schema | `public` |
| Purpose | Notes and comments on candidate submissions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| submission_id | uuid | NO | - | Foreign key to submission |
| note | text | NO | - | Note |
| is_client_visible | boolean | YES | false | Is client visible |
| created_by | uuid | NO | - | User who created the record |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| created_by | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |
| submission_id | submissions.id | Submissions |

## Indexes

| Index Name | Definition |
|------------|------------|
| submission_notes_pkey | CREATE UNIQUE INDEX submission_notes_pkey ON public.submission_notes USING btree (id) |
| idx_submission_notes_submission_id | CREATE INDEX idx_submission_notes_submission_id ON public.submission_notes USING btree (submission_id) |
