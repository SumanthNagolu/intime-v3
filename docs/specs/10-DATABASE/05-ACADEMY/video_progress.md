# video_progress Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `video_progress` |
| Schema | `public` |
| Purpose | Tracks video watch progress and timestamps |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Unique identifier (primary key) |
| user_id | uuid | NO | - | Reference to user |
| topic_id | uuid | NO | - | Reference to module topic |
| enrollment_id | uuid | NO | - | Foreign key reference to enrollment |
| last_position_seconds | integer | NO | 0 | Last Position Seconds |
| total_watch_time_seconds | integer | NO | 0 | Total count of watch time seconds |
| video_duration_seconds | integer | YES | - | Video Duration Seconds |
| completion_percentage | integer | YES | - | Completion Percentage |
| video_url | text | YES | - | URL for video |
| video_provider | text | YES | - | Video Provider |
| session_count | integer | NO | 1 | Count of session |
| last_watched_at | timestamp with time zone | YES | now() | Timestamp for last watched |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |

## Foreign Keys

| Column | References | Constraint |
|--------|------------|------------|
| enrollment_id | student_enrollments.id | video_progress_enrollment_id_fkey |
| topic_id | module_topics.id | video_progress_topic_id_fkey |
| user_id | user_profiles.id | video_progress_user_id_fkey |

## Indexes

| Index Name | Definition |
|------------|------------|
| video_progress_pkey | `CREATE UNIQUE INDEX video_progress_pkey ON public.video_progress USING btree (id)` |
| video_progress_user_id_topic_id_key | `CREATE UNIQUE INDEX video_progress_user_id_topic_id_key ON public.video_progress USING btree (user_id, topic_id)` |
| idx_video_progress_user | `CREATE INDEX idx_video_progress_user ON public.video_progress USING btree (user_id)` |
| idx_video_progress_topic | `CREATE INDEX idx_video_progress_topic ON public.video_progress USING btree (topic_id)` |
| idx_video_progress_enrollment | `CREATE INDEX idx_video_progress_enrollment ON public.video_progress USING btree (enrollment_id)` |
| idx_video_progress_updated | `CREATE INDEX idx_video_progress_updated ON public.video_progress USING btree (updated_at DESC)` |
