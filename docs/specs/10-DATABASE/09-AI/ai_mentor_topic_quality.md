# ai_mentor_topic_quality Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_topic_quality` |
| Schema | `public` |
| Purpose | Materialized view analyzing AI Mentor response quality and performance metrics by course topic |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| topic_id | uuid | YES | - | Topic identifier |
| topic_title | text | YES | - | Name of the topic |
| course_title | text | YES | - | Course the topic belongs to |
| total_chats | bigint | YES | - | Total chat interactions for this topic |
| unique_students | bigint | YES | - | Number of unique students asking about this topic |
| avg_rating | numeric | YES | - | Average student rating for responses |
| helpful_percentage | numeric | YES | - | Percentage of responses rated as helpful |
| unhelpful_percentage | numeric | YES | - | Percentage of responses rated as unhelpful |
| avg_response_time_ms | numeric | YES | - | Average response generation time |
| avg_tokens_used | numeric | YES | - | Average tokens per response |
| total_cost | numeric | YES | - | Total cost for this topic |
| escalation_rate | numeric | YES | - | Percentage of chats escalated to trainers |
| flagged_count | bigint | YES | - | Number of flagged responses |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Identifies topics where AI Mentor performs well or poorly
- High escalation rates indicate topics needing better training data
- Helps prioritize content improvements and prompt optimization
