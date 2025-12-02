# topic_unlock_requirements Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `topic_unlock_requirements` |
| Schema | `public` |
| Purpose | Prerequisites and conditions for unlocking topics |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| topic_id | uuid | YES | - | Reference to module topic |
| module_id | uuid | YES | - | Reference to course module |
| topic_title | text | YES | - | Topic Title |
| topic_number | integer | YES | - | Topic Number |
| prerequisite_topic_ids | ARRAY | YES | - | Prerequisite Topic Ids |
| prerequisite_titles | ARRAY | YES | - | Prerequisite Titles |
| prerequisite_numbers | ARRAY | YES | - | Prerequisite Numbers |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
