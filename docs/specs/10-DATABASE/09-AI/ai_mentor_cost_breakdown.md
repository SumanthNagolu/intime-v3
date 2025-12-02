# ai_mentor_cost_breakdown Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_mentor_cost_breakdown` |
| Schema | `public` |
| Purpose | Materialized view providing cost analysis by topic for AI Mentor interactions |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| date | date | YES | - | Date of the analysis |
| topic_id | uuid | YES | - | Topic being analyzed |
| topic_title | text | YES | - | Name of the topic |
| chat_count | bigint | YES | - | Number of chats for this topic |
| total_tokens | bigint | YES | - | Total tokens consumed |
| total_cost | numeric | YES | - | Total cost in USD |
| avg_cost_per_chat | numeric | YES | - | Average cost per chat interaction |
| cost_per_1k_tokens | numeric | YES | - | Cost per 1000 tokens |
| cost_per_helpful_response | numeric | YES | - | Cost per positively rated response |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Aggregates cost metrics by date and topic
- Provides ROI analysis for AI Mentor by topic
- Useful for identifying expensive topics that may need optimization
