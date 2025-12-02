# path_enrollments Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `path_enrollments` |
| Schema | `public` |
| Purpose | Tracks student enrollments in learning paths |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| path_id | uuid | NO | - | Reference to learning path |
| status | USER-DEFINED | NO | 'pending'::enrollment_status | Current status |
| enrolled_at | timestamp with time zone | NO | now() | Timestamp for enrolled |
| completed_at | timestamp with time zone | YES | - | Timestamp for completed |
| progress_percent | integer | YES | 0 | Progress Percent |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| path_id | learning_paths.id | path_enrollments_path_id_fkey |
| user_id | user_profiles.id | path_enrollments_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| path_enrollments_pkey | `CREATE UNIQUE INDEX path_enrollments_pkey ON public.path_enrollments USING btree (id)` |
| path_enrollments_user_id_path_id_key | `CREATE UNIQUE INDEX path_enrollments_user_id_path_id_key ON public.path_enrollments USING btree (user_id, path_id)` |
| idx_path_enrollments_user_id | `CREATE INDEX idx_path_enrollments_user_id ON public.path_enrollments USING btree (user_id)` |
| idx_path_enrollments_path_id | `CREATE INDEX idx_path_enrollments_path_id ON public.path_enrollments USING btree (path_id)` |
| idx_path_enrollments_status | `CREATE INDEX idx_path_enrollments_status ON public.path_enrollments USING btree (status)` |
