# event_subscriptions Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `event_subscriptions` |
| Schema | `public` |
| Purpose | Manages event subscriptions for webhooks and internal handlers with pattern matching, failure tracking, auto-disable on consecutive failures, and multi-channel delivery. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, unique identifier for subscription |
| subscriber_name | text | NO | - | Name of the subscriber (e.g., 'slack_notifier', 'email_sender') |
| event_pattern | text | NO | - | Event type pattern to match (e.g., 'recruiting.*', 'job.created') |
| handler_function | text | YES | - | Internal function to call when event matches |
| webhook_url | text | YES | - | External webhook URL to POST event data to |
| is_active | boolean | YES | true | Whether subscription is currently active |
| created_at | timestamp with time zone | NO | now() | Timestamp when subscription was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when subscription was last updated |
| last_triggered_at | timestamp with time zone | YES | - | Timestamp when subscription was last triggered |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |
| failure_count | integer | YES | 0 | Total number of delivery failures |
| consecutive_failures | integer | YES | 0 | Number of consecutive failures (resets on success) |
| last_failure_at | timestamp with time zone | YES | - | Timestamp of most recent failure |
| last_failure_message | text | YES | - | Error message from most recent failure |
| auto_disabled_at | timestamp with time zone | YES | - | Timestamp when subscription was auto-disabled due to failures |
| user_id | uuid | YES | - | ID of user who created the subscription (for user-specific subscriptions) |
| channel | text | NO | 'email' | Notification channel (email, slack, webhook, in_app) |
| frequency | text | YES | 'immediate' | Delivery frequency (immediate, hourly, daily, weekly) |
| digest | boolean | YES | false | Whether to batch multiple events into a digest |
| filter_criteria | jsonb | YES | '{}' | Additional filters beyond event_pattern (e.g., severity, entity_type) |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |
| user_id | user_profiles.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| event_subscriptions_pkey | CREATE UNIQUE INDEX ON event_subscriptions (id) |
| idx_event_subscriptions_org | CREATE INDEX ON event_subscriptions (org_id) |
| idx_event_subscriptions_active | CREATE INDEX ON event_subscriptions (is_active) WHERE is_active = true |
| idx_event_subscriptions_pattern | CREATE INDEX ON event_subscriptions (event_pattern) |
| idx_event_subscriptions_user | CREATE INDEX ON event_subscriptions (user_id) WHERE user_id IS NOT NULL |

## Use Cases

1. **Webhook Integration** - Forward events to external systems via HTTP webhooks
2. **Internal Event Handlers** - Route events to internal processing functions
3. **User Notifications** - Subscribe users to specific event types
4. **Slack Integration** - Push events to Slack channels
5. **Email Digests** - Batch events and send periodic summaries
6. **Circuit Breaker** - Auto-disable subscriptions after consecutive failures
7. **Event Filtering** - Use pattern matching and criteria to filter events

## Event Pattern Matching

Patterns support wildcards:

- `*` - Matches any segment (e.g., `recruiting.*` matches `recruiting.job.created`, `recruiting.candidate.applied`)
- `**` - Matches any number of segments (e.g., `recruiting.**` matches all recruiting events at any depth)
- Exact match - `recruiting.job.created` matches only that specific event

## Auto-Disable Logic

Subscriptions are automatically disabled after 10 consecutive failures to prevent notification spam and reduce load on failing endpoints.

```sql
-- Auto-disable after 10 consecutive failures
UPDATE event_subscriptions
SET is_active = false, auto_disabled_at = NOW()
WHERE consecutive_failures >= 10 AND is_active = true;
```

## Example Subscriptions

```sql
-- Subscribe to all job-related events via webhook
INSERT INTO event_subscriptions (org_id, subscriber_name, event_pattern, webhook_url)
VALUES ('org-uuid', 'external_ats', 'recruiting.job.*', 'https://api.example.com/webhooks/jobs');

-- Subscribe to all events for Slack notifications
INSERT INTO event_subscriptions (org_id, subscriber_name, event_pattern, handler_function, channel)
VALUES ('org-uuid', 'slack_notifier', 'recruiting.*', 'send_slack_notification', 'slack');

-- User-specific subscription with filters
INSERT INTO event_subscriptions (org_id, user_id, subscriber_name, event_pattern, channel, filter_criteria)
VALUES (
  'org-uuid',
  'user-uuid',
  'hiring_manager_alerts',
  'recruiting.interview.*',
  'email',
  '{"severity": ["warning", "error"], "entity_type": "interview"}'::jsonb
);
```
