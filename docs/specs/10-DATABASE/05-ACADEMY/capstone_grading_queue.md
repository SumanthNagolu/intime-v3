# capstone_grading_queue Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `capstone_grading_queue` |
| Schema | `public` |
| Purpose | Queue management for instructor grading of capstone projects |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | YES | - | Unique identifier (primary key) |
| user_id | uuid | YES | - | Reference to user |
| enrollment_id | uuid | YES | - | Foreign key reference to enrollment |
| course_id | uuid | YES | - | Reference to course |
| student_name | text | YES | - | Student Name |
| student_email | text | YES | - | Student Email |
| course_title | text | YES | - | Course Title |
| repository_url | text | YES | - | URL for repository |
| demo_video_url | text | YES | - | URL for demo video |
| description | text | YES | - | Detailed description |
| submitted_at | timestamp with time zone | YES | - | Timestamp for submitted |
| status | text | YES | - | Current status |
| revision_count | integer | YES | - | Count of revision |
| peer_review_count | integer | YES | - | Count of peer review |
| avg_peer_rating | numeric | YES | - | Avg Peer Rating |
| hours_waiting | numeric | YES | - | Hours Waiting |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
