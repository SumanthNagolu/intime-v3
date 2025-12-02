# topic_difficulty_stats Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `topic_difficulty_stats` |
| Schema | `public` |
| Purpose | Aggregate difficulty metrics and student performance data per topic |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| topic_id | uuid | YES | - | Reference to module topic |
| topic_title | text | YES | - | Topic Title |
| module_title | text | YES | - | Module Title |
| course_title | text | YES | - | Course Title |
| escalation_count | bigint | YES | - | Count of escalation |
| unique_students | bigint | YES | - | Unique Students |
| avg_escalation_confidence | numeric | YES | - | Avg Escalation Confidence |
| resolved_count | bigint | YES | - | Count of resolved |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
