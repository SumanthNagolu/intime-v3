# ACTIVITY_COMMENTS Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `activity_comments` |
| Schema | `public` |
| Purpose | Comments and notes on activities with threading support |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | UUID | Primary key (UUID) |
| `activity_id` | uuid | NO | NULL | Reference to parent activity |
| `comment_text` | text | NO | NULL | Comment text |
| `comment_type` | text | YES | comment | Comment type |
| `parent_comment_id` | uuid | YES | NULL | Reference to parent comment |
| `mentioned_users` | ARRAY | YES | NULL | Array of mentioned users |
| `is_internal` | boolean | YES | false | Boolean flag: internal |
| `deleted_at` | timestamp with time zone | YES | NULL | Soft delete timestamp (NULL if active) |
| `created_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was created |
| `created_by` | uuid | NO | NULL | User who created the record |
| `updated_at` | timestamp with time zone | NO | CURRENT_TIMESTAMP | Timestamp when record was last updated |
| `updated_by` | uuid | YES | NULL | User who last updated the record |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `activity_id` | `activities.id` | Links to activities |
| `created_by` | `user_profiles.id` | Links to user_profiles |
| `parent_comment_id` | `activity_comments.id` | Links to activity_comments |
| `updated_by` | `user_profiles.id` | Links to user_profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `activity_comments_activity_idx` | `CREATE INDEX activity_comments_activity_idx ON public.activity_comments USING btree (activity_id)` |
| `activity_comments_pkey` | `CREATE UNIQUE INDEX activity_comments_pkey ON public.activity_comments USING btree (id)` |

