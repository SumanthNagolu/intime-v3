# lab_statistics Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `lab_statistics` |
| Schema | `public` |
| Purpose | Analytics on lab completion rates and time spent |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| topic_id | uuid | YES | - | Reference to module topic |
| lab_title | text | YES | - | Lab Title |
| total_students_started | bigint | YES | - | Total count of students started |
| total_students_submitted | bigint | YES | - | Total count of students submitted |
| total_passed | bigint | YES | - | Total count of passed |
| total_failed | bigint | YES | - | Total count of failed |
| avg_final_score | numeric | YES | - | Avg Final Score |
| avg_time_spent_seconds | numeric | YES | - | Avg Time Spent Seconds |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
