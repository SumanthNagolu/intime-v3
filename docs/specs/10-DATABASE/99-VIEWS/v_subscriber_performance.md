# V Subscriber Performance View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_subscriber_performance` |
| Schema | `public` |
| Purpose | Subscriber engagement and performance metrics |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| subscriber_name | text | YES | subscriber name |
| event_pattern | text | YES | event pattern |
| total_deliveries | bigint | YES | total deliveries |
| successful | bigint | YES | successful |
| failed | bigint | YES | failed |
| avg_duration_ms | numeric | YES | avg duration ms |
| last_delivery_at | timestamptz | YES | last delivery at |

## Definition

```sql
CREATE OR REPLACE VIEW v_subscriber_performance AS
 SELECT es.subscriber_name,
    es.event_pattern,
    count(edl.id) AS total_deliveries,
    count(*) FILTER (WHERE (edl.status = 'success'::text)) AS successful,
    count(*) FILTER (WHERE (edl.status = 'failure'::text)) AS failed,
    avg(edl.duration_ms) AS avg_duration_ms,
    max(edl.attempted_at) AS last_delivery_at
   FROM (event_subscriptions es
     LEFT JOIN event_delivery_log edl ON ((es.id = edl.subscription_id)))
  WHERE (edl.attempted_at > (now() - '7 days'::interval))
  GROUP BY es.id, es.subscriber_name, es.event_pattern
  ORDER BY (count(edl.id)) DESC;
```
