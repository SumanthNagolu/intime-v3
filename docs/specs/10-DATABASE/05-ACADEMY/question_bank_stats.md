# question_bank_stats Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `question_bank_stats` |
| Schema | `public` |
| Purpose | Statistics on question difficulty and discrimination index |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| question_id | uuid | YES | - | Foreign key reference to question |
| topic_id | uuid | YES | - | Reference to module topic |
| question_text | text | YES | - | Question Text |
| question_type | text | YES | - | Question Type |
| difficulty | text | YES | - | Difficulty |
| points | integer | YES | - | Points |
| is_public | boolean | YES | - | Boolean flag: public |
| created_by | uuid | YES | - | User who created this record |
| created_by_name | text | YES | - | Created By Name |
| times_used | bigint | YES | - | Times Used |
| unique_students | bigint | YES | - | Unique Students |
| avg_correct_percentage | numeric | YES | - | Avg Correct Percentage |
| created_at | timestamp with time zone | YES | - | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | - | Timestamp when record was last updated |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
