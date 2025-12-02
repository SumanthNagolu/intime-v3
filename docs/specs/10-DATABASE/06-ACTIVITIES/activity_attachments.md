# ACTIVITY_ATTACHMENTS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_attachments` |
| Schema | `public` |
| Purpose | Stores file attachments associated with activities |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `file_name` | text | NO | NULL | File name |
| `file_size` | integer | YES | NULL | File size |
| `file_type` | text | YES | NULL | File type |
| `file_url` | text | NO | NULL | File url |
| `storage_key` | text | YES | NULL | Storage key |
| `description` | text | YES | NULL | Description |
| `deleted_at` | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if active) |
| `uploaded_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when uploaded |
| `uploaded_by` | uuid | NO | NULL | Uploaded by |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `uploaded_by` | `user_profiles.id` | Links to user_profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_attachments_activity_idx` | `CREATE INDEX activity_attachments_activity_idx ON public.activity_attachments USING btree (activity_id)` |
| `activity_attachments_pkey` | `CREATE UNIQUE INDEX activity_attachments_pkey ON public.activity_attachments USING btree (id)` |

