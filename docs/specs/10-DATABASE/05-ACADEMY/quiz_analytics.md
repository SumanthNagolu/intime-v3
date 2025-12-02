# quiz_analytics Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `quiz_analytics` |
| Schema | `public` |
| Purpose | Aggregate analytics on quiz performance and question effectiveness |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| topic_id | uuid | YES | - | Reference to module topic |
| topic_title | text | YES | - | Topic Title |
| module_id | uuid | YES | - | Reference to course module |
| module_title | text | YES | - | Module Title |
| course_id | uuid | YES | - | Reference to course |
| course_title | text | YES | - | Course Title |
| total_questions | bigint | YES | - | Total count of questions |
| easy_questions | bigint | YES | - | Easy Questions |
| medium_questions | bigint | YES | - | Medium Questions |
| hard_questions | bigint | YES | - | Hard Questions |
| total_attempts | bigint | YES | - | Total count of attempts |
| unique_students | bigint | YES | - | Unique Students |
| passed_attempts | bigint | YES | - | Passed Attempts |
| avg_score | numeric | YES | - | Avg Score |
| avg_time_seconds | numeric | YES | - | Avg Time Seconds |
| pass_rate | double precision | YES | - | Pass Rate |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
