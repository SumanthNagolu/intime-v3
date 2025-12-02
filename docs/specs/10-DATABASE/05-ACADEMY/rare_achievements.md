# rare_achievements Table

## Overview
| Property | Value |
|----------|-------|
| Table Name | `rare_achievements` |
| Schema | `public` |
| Purpose | Special high-difficulty achievements with lower earn rates |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| badge_id | uuid | YES | - | Foreign key reference to badge |
| badge_name | text | YES | - | Badge Name |
| rarity | text | YES | - | Rarity |
| earner_count | bigint | YES | - | Count of earner |
| earner_percentage | numeric | YES | - | Earner Percentage |

## Foreign Keys

No foreign key constraints defined.

## Indexes

No indexes defined.
