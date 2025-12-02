# comments Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `comments` |
| Schema | `public` |
| Purpose | Comments and notes on any entity type |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `org_id` | uuid | NO | - | Organization identifier |
| `entity_type` | text | NO | - | Entity Type |
| `entity_id` | uuid | NO | - | Reference to entity |
| `content` | text | NO | - | Content |
| `parent_comment_id` | uuid | YES | - | Reference to parent comment |
| `reply_count` | integer | YES | 0 | Reply Count |
| `author_id` | uuid | NO | - | Reference to author |
| `mentioned_user_ids` | ARRAY | YES | - | Mentioned User Ids |
| `reactions` | jsonb | YES | '{}'::jsonb | Reactions |
| `is_deleted` | boolean | YES | false | Deleted flag |
| `deleted_at` | timestamptz | YES | - | Soft delete timestamp (NULL if active) |
| `deleted_by` | uuid | YES | - | Deleted By |
| `is_edited` | boolean | YES | false | Edited flag |
| `edited_at` | timestamptz | YES | - | Edited At |
| `original_content` | text | YES | - | Original Content |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `author_id` | `user_profiles.id` | Links to user profiles |
| `deleted_by` | `user_profiles.id` | Links to user profiles |
| `org_id` | `organizations.id` | Links to organizations |
| `parent_comment_id` | `comments.id` | Links to comments |

## Indexes

| Index Name | Definition |
|------------|------------|
| `comments_pkey` | `CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id)` |
| `idx_comments_org` | `CREATE INDEX idx_comments_org ON public.comments USING btree (org_id)` |
| `idx_comments_entity` | `CREATE INDEX idx_comments_entity ON public.comments USING btree (entity_type, entity_id) WHERE (N...` |
| `idx_comments_author` | `CREATE INDEX idx_comments_author ON public.comments USING btree (author_id)` |
| `idx_comments_parent` | `CREATE INDEX idx_comments_parent ON public.comments USING btree (parent_comment_id)` |
| `idx_comments_created` | `CREATE INDEX idx_comments_created ON public.comments USING btree (created_at DESC)` |

## Usage Notes

- Generic commenting system for any entity type
- Supports threaded discussions via parent_id
