# ai_mentor_student_engagement Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_student_engagement` |
| Schema | `public` |
| Purpose | Materialized view analyzing student engagement patterns with AI Mentor over time |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| user_id | uuid | YES | - | Student identifier |
| full_name | text | YES | - | Student's full name |
| total_chats | bigint | YES | - | Total number of AI Mentor interactions |
| first_chat_date | date | YES | - | Date of first interaction |
| last_chat_date | date | YES | - | Date of most recent interaction |
| active_days | numeric | YES | - | Number of days with AI Mentor activity |
| avg_rating_given | numeric | YES | - | Average rating this student gives |
| rating_frequency | numeric | YES | - | Percentage of chats where student provided rating |
| topics_explored | bigint | YES | - | Number of unique topics discussed |
| escalations | bigint | YES | - | Number of escalations triggered |
| total_cost_incurred | numeric | YES | - | Total AI cost attributed to this student |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Provides student-level engagement analytics
- Useful for identifying power users and students needing support
- Helps measure AI Mentor adoption and effectiveness per student
