# escalation_queue Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `escalation_queue` |
| Schema | `public` |
| Purpose | Materialized view providing a work queue for trainers to handle pending and in-progress escalations |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| escalation_id | uuid | YES | - | Escalation identifier |
| chat_id | uuid | YES | - | Related chat |
| user_id | uuid | YES | - | Student who asked the question |
| student_name | text | YES | - | Student's full name |
| student_email | text | YES | - | Student's email |
| topic_id | uuid | YES | - | Related topic |
| topic_title | text | YES | - | Topic name |
| reason | text | YES | - | Escalation reason |
| confidence | numeric | YES | - | AI confidence score |
| auto_detected | boolean | YES | - | Whether auto-detected |
| triggers | jsonb | YES | - | Escalation triggers |
| metadata | jsonb | YES | - | Additional context |
| status | text | YES | - | Current status |
| assigned_to | uuid | YES | - | Assigned trainer ID |
| assigned_trainer_name | text | YES | - | Assigned trainer name |
| created_at | timestamp with time zone | YES | - | When escalation was created |
| wait_time_minutes | numeric | YES | - | Time waiting for resolution |
| original_question | text | YES | - | Student's original question |
| response_count | bigint | YES | - | Number of trainer responses |

## Foreign Keys

None (Materialized View)

## Indexes

None (Materialized View)

## Usage Notes

- This is a VIEW, not a physical table
- Provides trainer-friendly view of pending work
- Includes student and topic context for quick triage
- Wait time helps prioritize older escalations
- Response count shows engagement level
