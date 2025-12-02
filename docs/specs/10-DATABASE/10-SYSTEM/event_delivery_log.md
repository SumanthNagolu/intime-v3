# event_delivery_log Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `event_delivery_log` |
| Schema | `public` |
| Purpose | Tracks individual event delivery attempts to subscriptions with response codes, timing metrics, and error details for monitoring and debugging. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, unique identifier for delivery log |
| event_id | uuid | NO | - | Reference to the event that was delivered |
| subscription_id | uuid | NO | - | Reference to the subscription that received the event |
| attempted_at | timestamp with time zone | NO | now() | Timestamp when delivery was attempted |
| status | text | NO | - | Delivery status (success, failed, timeout, rejected) |
| response_code | integer | YES | - | HTTP response code (for webhook deliveries) |
| response_body | text | YES | - | Response body from webhook endpoint |
| error_message | text | YES | - | Error message if delivery failed |
| duration_ms | integer | YES | - | Delivery duration in milliseconds |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| event_id | events.id | CASCADE |
| subscription_id | event_subscriptions.id | CASCADE |
| org_id | organizations.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| event_delivery_log_pkey | CREATE UNIQUE INDEX ON event_delivery_log (id) |
| idx_event_delivery_log_event | CREATE INDEX ON event_delivery_log (event_id) |
| idx_event_delivery_log_subscription | CREATE INDEX ON event_delivery_log (subscription_id) |
| idx_event_delivery_log_attempted | CREATE INDEX ON event_delivery_log (attempted_at DESC) |
| idx_event_delivery_log_status | CREATE INDEX ON event_delivery_log (status) |
| idx_event_delivery_log_org | CREATE INDEX ON event_delivery_log (org_id) |

## Use Cases

1. **Delivery Monitoring** - Track success/failure rates for event subscriptions
2. **Performance Analysis** - Measure delivery latency and response times
3. **Debugging** - Investigate webhook delivery failures with full response details
4. **SLA Tracking** - Monitor delivery SLAs and identify slow endpoints
5. **Audit Trail** - Maintain complete history of event delivery attempts
6. **Alerting** - Trigger alerts when delivery failure rate exceeds threshold

## Delivery Status Values

- **success** - Event delivered and acknowledged successfully (HTTP 2xx)
- **failed** - Delivery failed due to error (HTTP 4xx/5xx, network error)
- **timeout** - Delivery exceeded timeout threshold
- **rejected** - Webhook endpoint rejected the event (invalid payload, etc.)

## Example Queries

```sql
-- Get delivery success rate for a subscription
SELECT
  subscription_id,
  COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) as success_rate,
  AVG(duration_ms) as avg_duration_ms
FROM event_delivery_log
WHERE subscription_id = 'subscription-uuid'
  AND attempted_at > NOW() - INTERVAL '7 days'
GROUP BY subscription_id;

-- Find slow deliveries (>5 seconds)
SELECT
  es.subscriber_name,
  e.event_type,
  edl.duration_ms,
  edl.attempted_at
FROM event_delivery_log edl
JOIN event_subscriptions es ON edl.subscription_id = es.id
JOIN events e ON edl.event_id = e.id
WHERE edl.duration_ms > 5000
ORDER BY edl.duration_ms DESC
LIMIT 50;

-- Get recent failures for debugging
SELECT
  es.subscriber_name,
  e.event_type,
  edl.response_code,
  edl.error_message,
  edl.attempted_at
FROM event_delivery_log edl
JOIN event_subscriptions es ON edl.subscription_id = es.id
JOIN events e ON edl.event_id = e.id
WHERE edl.status = 'failed'
ORDER BY edl.attempted_at DESC
LIMIT 100;
```
