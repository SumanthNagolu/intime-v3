# learning_path_courses Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `learning_path_courses` |
| Schema | `public` |
| Purpose | Junction table mapping courses to learning paths |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| path_id | uuid | NO | - | Reference to learning path |
| course_id | uuid | NO | - | Reference to course |
| sequence | integer | NO | - | Sequence |
| is_required | boolean | NO | true | Boolean flag: required |
| created_at | timestamp with time zone | NO | now() | Timestamp when record was created |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| course_id | courses.id | learning_path_courses_course_id_fkey |
| path_id | learning_paths.id | learning_path_courses_path_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| learning_path_courses_pkey | `CREATE UNIQUE INDEX learning_path_courses_pkey ON public.learning_path_courses USING btree (id)` |
| learning_path_courses_path_id_course_id_key | `CREATE UNIQUE INDEX learning_path_courses_path_id_course_id_key ON public.learning_path_courses USING btree (path_id, course_id)` |
| idx_learning_path_courses_path_id | `CREATE INDEX idx_learning_path_courses_path_id ON public.learning_path_courses USING btree (path_id)` |
| idx_learning_path_courses_course_id | `CREATE INDEX idx_learning_path_courses_course_id ON public.learning_path_courses USING btree (course_id)` |
| idx_learning_path_courses_sequence | `CREATE INDEX idx_learning_path_courses_sequence ON public.learning_path_courses USING btree (sequence)` |
