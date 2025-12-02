# courses Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `courses` |
| Schema | `public` |
| Purpose | Main course catalog containing course metadata, pricing, and publishing status |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| slug | text | NO | - | URL-friendly unique identifier |
| title | text | NO | - | Display title |
| subtitle | text | YES | - | Subtitle |
| description | text | NO | - | Detailed description |
| total_modules | integer | NO | 0 | Total count of modules |
| total_topics | integer | NO | 0 | Total count of topics |
| estimated_duration_weeks | integer | NO | - | Estimated Duration Weeks |
| price_monthly | numeric | YES | - | Price Monthly |
| price_one_time | numeric | YES | - | Price One Time |
| is_included_in_all_access | boolean | YES | true | Boolean flag: included in all access |
| prerequisite_course_ids | ARRAY | YES | - | Prerequisite Course Ids |
| skill_level | text | YES | - | Skill Level |
| thumbnail_url | text | YES | - | URL for thumbnail |
| promo_video_url | text | YES | - | URL for promo video |
| is_published | boolean | YES | false | Whether content is published and visible |
| is_featured | boolean | YES | false | Whether item is featured/highlighted |
| created_by | uuid | YES | - | User who created this record |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft delete timestamp (null if active) |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| created_by | user_profiles.id | courses_created_by_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| courses_pkey | `CREATE UNIQUE INDEX courses_pkey ON public.courses USING btree (id)` |
| courses_slug_key | `CREATE UNIQUE INDEX courses_slug_key ON public.courses USING btree (slug)` |
| idx_courses_slug | `CREATE INDEX idx_courses_slug ON public.courses USING btree (slug)` |
| idx_courses_published | `CREATE INDEX idx_courses_published ON public.courses USING btree (is_published) WHERE (is_published = true)` |
| idx_courses_featured | `CREATE INDEX idx_courses_featured ON public.courses USING btree (is_featured) WHERE (is_featured = true)` |
