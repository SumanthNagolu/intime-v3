# ai_mentor_topic_stats Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_topic_stats` |
| Schema | `public` |
| Purpose | Materialized view providing summary statistics for AI Mentor usage by course topic |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| topic_id | uuid | YES | - | Topic identifier |
| topic_title | text | YES | - | Name of the topic |
| course_title | text | YES | - | Course the topic belongs to |
| total_chats | bigint | YES | - | Total number of chat interactions |
| unique_students | bigint | YES | - | Number of unique students |
| avg_rating | numeric | YES | - | Average student rating |
| escalation_count | bigint | YES | - | Number of escalations |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Simpler version of ai_mentor_topic_quality with basic metrics
- Useful for quick topic-level dashboards
- Shows which topics are most popular and how well AI Mentor handles them
