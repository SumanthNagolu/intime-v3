# V Timeline Stats By Tag View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_timeline_stats_by_tag` |
| Schema | `public` |
| Purpose | Timeline statistics aggregated by tag |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| tag | text | YES | tag |
| entry_count | bigint | YES | entry count |
| session_count | bigint | YES | session count |
| first_occurrence | timestamptz | YES | first occurrence |
| last_occurrence | timestamptz | YES | last occurrence |

## Definition

```sql
CREATE OR REPLACE VIEW v_timeline_stats_by_tag AS
 SELECT unnest(tags) AS tag,
    count(*) AS entry_count,
    count(DISTINCT session_id) AS session_count,
    min(session_date) AS first_occurrence,
    max(session_date) AS last_occurrence
   FROM project_timeline
  WHERE ((is_archived = false) AND (deleted_at IS NULL))
  GROUP BY (unnest(tags))
  ORDER BY (count(*)) DESC;
```
