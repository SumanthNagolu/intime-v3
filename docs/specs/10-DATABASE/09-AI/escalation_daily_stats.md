# escalation_daily_stats Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `escalation_daily_stats` |
| Schema | `public` |
| Purpose | Materialized view providing daily aggregated metrics for AI Mentor escalation patterns and resolution |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| date | date | YES | - | Date of the statistics |
| total_escalations | bigint | YES | - | Total number of escalations |
| unique_students | bigint | YES | - | Number of unique students with escalations |
| auto_detected_count | bigint | YES | - | Escalations automatically detected by AI |
| manual_count | bigint | YES | - | Escalations manually triggered |
| avg_confidence | numeric | YES | - | Average confidence score for auto-detected escalations |
| resolved_count | bigint | YES | - | Number of escalations resolved |
| dismissed_count | bigint | YES | - | Number of escalations dismissed |
| avg_resolution_time_minutes | numeric | YES | - | Average time to resolve in minutes |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Daily rollup of escalation metrics
- Tracks resolution efficiency and auto-detection accuracy
- Useful for monitoring escalation workflow health
