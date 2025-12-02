# reading_stats Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `reading_stats` |
| Schema | `public` |
| Purpose | Analytics on reading engagement and completion |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | YES | - | Reference to user |
| topic_id | uuid | YES | - | Reference to module topic |
| enrollment_id | uuid | YES | - | Foreign key reference to enrollment |
| topic_title | text | YES | - | Topic Title |
| module_title | text | YES | - | Module Title |
| course_title | text | YES | - | Course Title |
| scroll_percentage | integer | YES | - | Scroll Percentage |
| total_reading_time_seconds | integer | YES | - | Total count of reading time seconds |
| session_count | integer | YES | - | Count of session |
| last_read_at | timestamp with time zone | YES | - | Timestamp for last read |
| content_type | text | YES | - | Content Type |
| current_page | integer | YES | - | Current Page |
| total_pages | integer | YES | - | Total count of pages |
| engagement_score | integer | YES | - | Engagement Score |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
