# V Events Failed View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_events_failed` |
| Schema | `public` |
| Purpose | Failed event processing entries for troubleshooting |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| event_type | text | YES | event type |
| status | text | YES | status |
| retry_count | integer | YES | retry count |
| max_retries | integer | YES | max retries |
| next_retry_at | timestamptz | YES | next retry at |
| error_message | text | YES | error message |
| created_at | timestamptz | YES | Record creation timestamp |
| failed_at | timestamptz | YES | failed at |

## Definition

```sql
CREATE OR REPLACE VIEW v_events_failed AS
 SELECT id,
    event_type,
    status,
    retry_count,
    max_retries,
    next_retry_at,
    error_message,
    created_at,
    failed_at
   FROM events e
  WHERE (status = ANY (ARRAY['failed'::text, 'dead_letter'::text]))
  ORDER BY created_at DESC;
```
