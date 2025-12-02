# grading_queue Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `grading_queue` |
| Schema | `public` |
| Purpose | Queue management for all types of grading tasks |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| submission_id | uuid | YES | - | Foreign key reference to submission |
| user_id | uuid | YES | - | Reference to user |
| student_name | text | YES | - | Student Name |
| student_email | text | YES | - | Student Email |
| topic_id | uuid | YES | - | Reference to module topic |
| topic_title | text | YES | - | Topic Title |
| module_title | text | YES | - | Module Title |
| course_title | text | YES | - | Course Title |
| repository_url | text | YES | - | URL for repository |
| commit_sha | text | YES | - | Commit Sha |
| submitted_at | timestamp with time zone | YES | - | Timestamp for submitted |
| status | text | YES | - | Current status |
| auto_grade_score | numeric | YES | - | Auto Grade Score |
| attempt_number | integer | YES | - | Attempt Number |
| enrollment_id | uuid | YES | - | Foreign key reference to enrollment |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
