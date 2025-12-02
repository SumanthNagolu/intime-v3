# video_watch_stats Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `video_watch_stats` |
| Schema | `public` |
| Purpose | Analytics on video engagement and drop-off points |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | YES | - | Reference to user |
| topic_id | uuid | YES | - | Reference to module topic |
| enrollment_id | uuid | YES | - | Foreign key reference to enrollment |
| topic_title | text | YES | - | Topic Title |
| module_title | text | YES | - | Module Title |
| course_title | text | YES | - | Course Title |
| total_watch_time_seconds | integer | YES | - | Total count of watch time seconds |
| completion_percentage | integer | YES | - | Completion Percentage |
| session_count | integer | YES | - | Count of session |
| last_watched_at | timestamp with time zone | YES | - | Timestamp for last watched |
| video_duration_seconds | integer | YES | - | Video Duration Seconds |
| video_provider | text | YES | - | Video Provider |
| engagement_score | integer | YES | - | Engagement Score |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
