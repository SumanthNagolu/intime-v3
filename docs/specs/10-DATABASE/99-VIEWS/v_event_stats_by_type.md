# V Event Stats By Type View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_event_stats_by_type` |
| Schema | `public` |
| Purpose | Aggregated statistics of events grouped by type |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| event_type | text | YES | event type |
| total_events | bigint | YES | total events |
| completed | bigint | YES | completed |
| failed | bigint | YES | failed |
| dead_letter | bigint | YES | dead letter |
| avg_processing_time_seconds | numeric | YES | avg processing time seconds |
| last_event_at | timestamptz | YES | last event at |

## Definition

```sql
CREATE OR REPLACE VIEW v_event_stats_by_type AS
 SELECT event_type,
    count(*) AS total_events,
    count(*) FILTER (WHERE (status = 'completed'::text)) AS completed,
    count(*) FILTER (WHERE (status = 'failed'::text)) AS failed,
    count(*) FILTER (WHERE (status = 'dead_letter'::text)) AS dead_letter,
    avg(EXTRACT(epoch FROM (processed_at - created_at))) AS avg_processing_time_seconds,
    max(created_at) AS last_event_at
   FROM events
  WHERE (created_at > (now() - '7 days'::interval))
  GROUP BY event_type
  ORDER BY (count(*)) DESC;
```
