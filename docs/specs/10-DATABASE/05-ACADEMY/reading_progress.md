# reading_progress Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `reading_progress` |
| Schema | `public` |
| Purpose | Tracks progress through reading materials |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| topic_id | uuid | NO | - | Reference to module topic |
| enrollment_id | uuid | NO | - | Foreign key reference to enrollment |
| scroll_percentage | integer | NO | 0 | Scroll Percentage |
| last_scroll_position | integer | YES | 0 | Last Scroll Position |
| total_reading_time_seconds | integer | NO | 0 | Total count of reading time seconds |
| current_page | integer | YES | - | Current Page |
| total_pages | integer | YES | - | Total count of pages |
| content_type | text | YES | - | Content Type |
| content_length | integer | YES | - | Content Length |
| session_count | integer | NO | 1 | Count of session |
| last_read_at | timestamp with time zone | YES | now() | Timestamp for last read |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| enrollment_id | student_enrollments.id | reading_progress_enrollment_id_fkey |
| topic_id | module_topics.id | reading_progress_topic_id_fkey |
| user_id | user_profiles.id | reading_progress_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| reading_progress_pkey | `CREATE UNIQUE INDEX reading_progress_pkey ON public.reading_progress USING btree (id)` |
| reading_progress_user_id_topic_id_key | `CREATE UNIQUE INDEX reading_progress_user_id_topic_id_key ON public.reading_progress USING btree (user_id, topic_id)` |
| idx_reading_progress_user | `CREATE INDEX idx_reading_progress_user ON public.reading_progress USING btree (user_id)` |
| idx_reading_progress_topic | `CREATE INDEX idx_reading_progress_topic ON public.reading_progress USING btree (topic_id)` |
| idx_reading_progress_enrollment | `CREATE INDEX idx_reading_progress_enrollment ON public.reading_progress USING btree (enrollment_id)` |
| idx_reading_progress_updated | `CREATE INDEX idx_reading_progress_updated ON public.reading_progress USING btree (updated_at DESC)` |
