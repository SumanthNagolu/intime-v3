# marketing_formats Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `marketing_formats` |
| Schema | `public` |
| Purpose | Stores different format versions of consultant marketing materials (resume, one-pager, profile) with versioning support |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| profile_id | uuid | NO | - | Reference to marketing profile |
| format_type | text | NO | - | Type of format (resume, one-pager, etc.) |
| content | text | YES | - | Text content of the format |
| file_url | text | YES | - | URL to formatted document |
| file_id | uuid | YES | - | Reference to file storage |
| version | integer | NO | 1 | Version number of this format |
| is_default | boolean | YES | false | Whether this is the default format |
| created_at | timestamp with time zone | NO | now() | Record creation timestamp |
| updated_at | timestamp with time zone | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Constraint Name |
|--------|------------|-----------------|
| profile_id | marketing_profiles.id | marketing_formats_profile_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| marketing_formats_pkey | CREATE UNIQUE INDEX marketing_formats_pkey ON public.marketing_formats USING btree (id) |
| idx_marketing_formats_profile_id | CREATE INDEX idx_marketing_formats_profile_id ON public.marketing_formats USING btree (profile_id) |
