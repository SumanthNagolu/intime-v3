# learning_paths Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `learning_paths` |
| Schema | `public` |
| Purpose | Curated sequences of courses for specific learning goals |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| slug | text | NO | - | URL-friendly unique identifier |
| title | text | NO | - | Display title |
| description | text | NO | - | Detailed description |
| category | text | YES | - | Category |
| difficulty | USER-DEFINED | NO | 'beginner'::skill_level | Difficulty |
| duration_estimate_hours | integer | YES | - | Duration Estimate Hours |
| status | USER-DEFINED | NO | 'draft'::path_status | Current status |
| thumbnail_url | text | YES | - | URL for thumbnail |
| created_by | uuid | YES | - | User who created this record |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp (null if active) |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| created_by | user_profiles.id | learning_paths_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| learning_paths_pkey | `CREATE UNIQUE INDEX learning_paths_pkey ON public.learning_paths USING btree (id)` |
| learning_paths_slug_key | `CREATE UNIQUE INDEX learning_paths_slug_key ON public.learning_paths USING btree (slug)` |
| idx_learning_paths_slug | `CREATE INDEX idx_learning_paths_slug ON public.learning_paths USING btree (slug)` |
| idx_learning_paths_status | `CREATE INDEX idx_learning_paths_status ON public.learning_paths USING btree (status)` |
| idx_learning_paths_difficulty | `CREATE INDEX idx_learning_paths_difficulty ON public.learning_paths USING btree (difficulty)` |
| idx_learning_paths_deleted_at | `CREATE INDEX idx_learning_paths_deleted_at ON public.learning_paths USING btree (deleted_at) WHERE (deleted_at IS NULL)` |
