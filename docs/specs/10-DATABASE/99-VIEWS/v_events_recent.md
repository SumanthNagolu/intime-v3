# V Events Recent View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_events_recent` |
| Schema | `public` |
| Purpose | Recent event entries for monitoring |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| event_type | text | YES | event type |
| event_category | text | YES | event category |
| status | text | YES | status |
| user_email | text | YES | user email |
| payload | jsonb | YES | payload |
| created_at | timestamptz | YES | Record creation timestamp |
| triggered_by | text | YES | triggered by |

## Definition

```sql
CREATE OR REPLACE VIEW v_events_recent AS
 SELECT e.id,
    e.event_type,
    e.event_category,
    e.status,
    e.user_email,
    e.payload,
    e.created_at,
    up.full_name AS triggered_by
   FROM (events e
     LEFT JOIN user_profiles up ON ((e.user_id = up.id)))
  WHERE (e.created_at > (now() - '24:00:00'::interval))
  ORDER BY e.created_at DESC
 LIMIT 100;
```
