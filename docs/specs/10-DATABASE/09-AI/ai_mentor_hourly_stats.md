# ai_mentor_hourly_stats Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_hourly_stats` |
| Schema | `public` |
| Purpose | Materialized view providing hourly aggregated metrics for AI Mentor usage patterns and performance trends |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| hour | timestamp with time zone | YES | - | Hour timestamp for the statistics |
| total_chats | bigint | YES | - | Total number of chat interactions |
| unique_users | bigint | YES | - | Number of unique students |
| total_tokens | bigint | YES | - | Total tokens consumed |
| total_cost | numeric | YES | - | Total cost in USD |
| avg_response_time_ms | numeric | YES | - | Average response time in milliseconds |
| avg_rating | numeric | YES | - | Average student rating |
| positive_ratings | bigint | YES | - | Count of positive ratings |
| negative_ratings | bigint | YES | - | Count of negative ratings |
| flagged_count | bigint | YES | - | Number of chats flagged for review |
| escalated_count | bigint | YES | - | Number of chats escalated to trainers |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Provides granular hourly metrics for detailed analysis
- Useful for identifying peak usage times and performance patterns
- Helps optimize resource allocation and AI Mentor availability
