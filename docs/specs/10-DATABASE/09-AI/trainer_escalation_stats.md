# trainer_escalation_stats Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `trainer_escalation_stats` |
| Schema | `public` |
| Purpose | Materialized view providing performance metrics for trainers handling escalations |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| trainer_id | uuid | YES | - | Trainer identifier |
| trainer_name | text | YES | - | Trainer's full name |
| total_assigned | bigint | YES | - | Total escalations assigned |
| resolved_count | bigint | YES | - | Number resolved |
| dismissed_count | bigint | YES | - | Number dismissed |
| avg_resolution_time_minutes | numeric | YES | - | Average time to resolve |
| total_responses | bigint | YES | - | Total responses provided |
| last_resolution_at | timestamp with time zone | YES | - | Most recent resolution timestamp |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Tracks trainer productivity and performance
- Useful for workload balancing and performance reviews
- Identifies top performers and those needing support
