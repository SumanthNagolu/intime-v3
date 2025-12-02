# employee_screenshots Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `employee_screenshots` |
| Schema | `public` |
| Purpose | Employee screenshot tracking for productivity monitoring |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique identifier (UUID primary key) |
| `user_id` | uuid | NO | - | User profile reference |
| `filename` | text | NO | - | Filename |
| `file_size` | integer | NO | - | File Size |
| `storage_bucket` | text | YES | 'employee-screenshots'::text | Storage Bucket |
| `captured_at` | timestamptz | NO | - | Captured At |
| `machine_name` | text | YES | - | Machine Name |
| `os_type` | text | YES | - | Os Type |
| `active_window_title` | text | YES | - | Active Window Title |
| `analyzed` | boolean | YES | false | Analyzed |
| `activity_category` | text | YES | - | Activity Category |
| `confidence` | double precision | YES | - | Confidence |
| `analyzed_at` | timestamptz | YES | - | Analyzed At |
| `created_at` | timestamptz | YES | now() | Record creation timestamp |
| `updated_at` | timestamptz | YES | now() | Last update timestamp |
| `deleted_at` | timestamptz | YES | - | Soft delete timestamp (NULL if active) |

## Foreign Keys

| Column | References | Description |
|--------|------------|-------------|
| `user_id` | `user_profiles.id` | Links to user profiles |

## Indexes

| Index Name | Definition |
|------------|------------|
| `employee_screenshots_pkey` | `CREATE UNIQUE INDEX employee_screenshots_pkey ON public.employee_screenshots USING btree (id)` |
| `idx_screenshots_user_id` | `CREATE INDEX idx_screenshots_user_id ON public.employee_screenshots USING btree (user_id) WHERE (...` |
| `idx_screenshots_captured_at` | `CREATE INDEX idx_screenshots_captured_at ON public.employee_screenshots USING btree (captured_at ...` |
| `idx_screenshots_analyzed` | `CREATE INDEX idx_screenshots_analyzed ON public.employee_screenshots USING btree (analyzed) WHERE...` |
| `idx_screenshots_user_date` | `CREATE INDEX idx_screenshots_user_date ON public.employee_screenshots USING btree (user_id, captu...` |
| `idx_screenshots_machine` | `CREATE INDEX idx_screenshots_machine ON public.employee_screenshots USING btree (machine_name)` |
| `idx_screenshots_category` | `CREATE INDEX idx_screenshots_category ON public.employee_screenshots USING btree (activity_catego...` |

## Usage Notes

- Extends employee data with screenshots information
- Linked to employees table via employee_id foreign key
