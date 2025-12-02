# ai_mentor_student_stats Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_student_stats` |
| Schema | `public` |
| Purpose | Materialized view providing comprehensive student-level statistics for AI Mentor usage |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | YES | - | Student identifier |
| full_name | text | YES | - | Student's full name |
| email | text | YES | - | Student's email address |
| total_chats | bigint | YES | - | Total number of chat interactions |
| total_tokens | bigint | YES | - | Total tokens consumed |
| total_cost | numeric | YES | - | Total cost in USD |
| avg_response_time_ms | numeric | YES | - | Average response time |
| avg_rating | numeric | YES | - | Average rating provided by student |
| flagged_count | bigint | YES | - | Number of flagged interactions |
| escalated_count | bigint | YES | - | Number of escalated interactions |
| last_chat_at | timestamp with time zone | YES | - | Timestamp of most recent chat |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Comprehensive per-student metrics for reporting
- Useful for student performance analysis and support
- Identifies students with quality issues (high flagged/escalated counts)
