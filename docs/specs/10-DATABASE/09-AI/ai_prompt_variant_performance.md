# ai_prompt_variant_performance Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `ai_prompt_variant_performance` |
| Schema | `public` |
| Purpose | Materialized view comparing A/B test performance metrics across different prompt variants |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| variant_id | uuid | YES | - | Prompt variant identifier |
| variant_name | text | YES | - | Name of the variant |
| is_active | boolean | YES | - | Whether variant is currently active |
| traffic_percentage | integer | YES | - | Percentage of traffic routed to this variant |
| total_uses | bigint | YES | - | Total number of times variant was used |
| unique_users | bigint | YES | - | Number of unique users who received this variant |
| avg_rating | numeric | YES | - | Average user rating for responses |
| helpful_percentage | numeric | YES | - | Percentage of helpful responses |
| avg_response_time_ms | numeric | YES | - | Average response generation time |
| avg_tokens_used | numeric | YES | - | Average tokens per response |
| avg_cost_per_chat | numeric | YES | - | Average cost per interaction |
| escalation_rate | numeric | YES | - | Percentage of escalations |
| flagged_count | bigint | YES | - | Number of flagged responses |
| created_at | timestamp with time zone | YES | - | When variant was created |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Enables data-driven A/B testing of AI prompts
- Compares variants across quality, cost, and performance metrics
- Helps identify winning prompt configurations
