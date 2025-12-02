# ai_mentor_daily_stats Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_daily_stats` |
| Schema | `public` |
| Purpose | Materialized view providing daily aggregated metrics for AI Mentor performance and usage |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| date | date | YES | - | Date of the statistics |
| total_chats | bigint | YES | - | Total number of chat interactions |
| unique_users | bigint | YES | - | Number of unique students who used AI Mentor |
| total_tokens | bigint | YES | - | Total tokens consumed |
| total_cost | numeric | YES | - | Total cost in USD |
| avg_response_time_ms | numeric | YES | - | Average response time in milliseconds |
| avg_rating | numeric | YES | - | Average student rating |
| flagged_count | bigint | YES | - | Number of chats flagged for review |
| escalated_count | bigint | YES | - | Number of chats escalated to trainers |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Daily rollup of AI Mentor activity for dashboards
- Tracks key performance indicators (response time, ratings, escalations)
- Useful for trend analysis and monitoring AI Mentor health
