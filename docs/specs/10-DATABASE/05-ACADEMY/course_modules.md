# course_modules Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `course_modules` |
| Schema | `public` |
| Purpose | Organizational units within courses, grouping related topics together |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| course_id | uuid | NO | - | Reference to course |
| slug | text | NO | - | URL-friendly unique identifier |
| title | text | NO | - | Display title |
| description | text | YES | - | Detailed description |
| module_number | integer | NO | - | Module Number |
| estimated_duration_hours | integer | YES | - | Estimated Duration Hours |
| prerequisite_module_ids | ARRAY | YES | - | Prerequisite Module Ids |
| is_published | boolean | YES | false | Whether content is published and visible |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| course_id | courses.id | course_modules_course_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| course_modules_pkey | `CREATE UNIQUE INDEX course_modules_pkey ON public.course_modules USING btree (id)` |
| unique_course_module_number | `CREATE UNIQUE INDEX unique_course_module_number ON public.course_modules USING btree (course_id, module_number)` |
| unique_course_module_slug | `CREATE UNIQUE INDEX unique_course_module_slug ON public.course_modules USING btree (course_id, slug)` |
| idx_course_modules_course_id | `CREATE INDEX idx_course_modules_course_id ON public.course_modules USING btree (course_id)` |
| idx_course_modules_number | `CREATE INDEX idx_course_modules_number ON public.course_modules USING btree (course_id, module_number)` |
