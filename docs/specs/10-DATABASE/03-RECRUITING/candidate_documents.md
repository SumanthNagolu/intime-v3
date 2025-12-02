# candidate_documents Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `candidate_documents` |
| Schema | `public` |
| Purpose | General document storage for candidate-related files |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| org_id | uuid | NO | - | Organization ID |
| candidate_id | uuid | NO | - | Foreign key to candidate |
| type | text | NO | - | Type |
| file_url | text | NO | - | File url |
| file_name | text | NO | - | File name |
| version | integer | YES | 1 | Version |
| is_primary | boolean | YES | false | Is primary |
| uploaded_at | timestamp with time zone | NO | now() | Uploaded at |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| candidate_id | user_profiles.id | User profiles |
| org_id | organizations.id | Organizations |

## Indexes

| Index Name | Definition |
|------------|------------|
| candidate_documents_pkey | CREATE UNIQUE INDEX candidate_documents_pkey ON public.candidate_documents USING btree (id) |
| idx_candidate_documents_candidate_id | CREATE INDEX idx_candidate_documents_candidate_id ON public.candidate_documents USING btree (candidate_id) |
