# events Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `events` |
| Schema | `public` |
| Purpose | Event sourcing and message queue table for asynchronous processing, event-driven architecture, with retry logic, correlation tracking, and idempotency support. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, unique identifier for event |
| event_type | text | NO | - | Type of event (e.g., 'job.created', 'candidate.applied', 'offer.accepted') |
| event_category | text | NO | - | Event category (domain grouping: recruiting, bench_sales, academy, crm) |
| aggregate_id | uuid | YES | - | ID of the aggregate root entity this event belongs to |
| payload | jsonb | NO | '{}' | Event data payload |
| metadata | jsonb | YES | '{}' | Additional event metadata (headers, context, etc.) |
| user_id | uuid | YES | - | ID of user who triggered the event |
| user_email | text | YES | - | Email of user who triggered the event |
| status | text | YES | 'pending' | Processing status (pending, processing, completed, failed) |
| retry_count | integer | YES | 0 | Number of processing attempts |
| max_retries | integer | YES | 3 | Maximum number of retry attempts |
| next_retry_at | timestamp with time zone | YES | - | Timestamp for next retry attempt |
| error_message | text | YES | - | Error message if processing failed |
| created_at | timestamp with time zone | NO | now() | Timestamp when event was created |
| processed_at | timestamp with time zone | YES | - | Timestamp when event was successfully processed |
| failed_at | timestamp with time zone | YES | - | Timestamp when event permanently failed |
| event_version | integer | YES | 1 | Event schema version for backward compatibility |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |
| severity | text | YES | 'info' | Event severity (debug, info, warning, error, critical) |
| entity_type | text | YES | - | Type of entity the event relates to |
| entity_id | uuid | YES | - | ID of the specific entity |
| actor_type | text | YES | 'user' | Type of actor who triggered the event (user, system, api, service) |
| actor_id | uuid | YES | - | ID of the actor |
| event_data | jsonb | YES | '{}' | Normalized event data (separate from payload for querying) |
| related_entities | jsonb | YES | '[]' | Array of related entity references |
| correlation_id | text | YES | - | ID to correlate related events across services |
| causation_id | text | YES | - | ID of the event that caused this event |
| parent_event_id | uuid | YES | - | Reference to parent event for hierarchical tracking |
| occurred_at | timestamp with time zone | YES | now() | Timestamp when the event actually occurred (vs created_at) |
| idempotency_key | text | YES | - | Unique key to prevent duplicate event processing |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |
| user_id | user_profiles.id | SET NULL |

## Indexes

| Index Name | Definition |
|------------|------------|
| events_pkey | CREATE UNIQUE INDEX ON events (id) |
| idx_events_event_type | CREATE INDEX ON events (event_type) |
| idx_events_event_category | CREATE INDEX ON events (event_category) |
| idx_events_aggregate_id | CREATE INDEX ON events (aggregate_id) WHERE aggregate_id IS NOT NULL |
| idx_events_status | CREATE INDEX ON events (status) WHERE status IN ('pending', 'processing', 'failed') |
| idx_events_created_at | CREATE INDEX ON events (created_at DESC) |
| idx_events_user_id | CREATE INDEX ON events (user_id) WHERE user_id IS NOT NULL |
| idx_events_next_retry | CREATE INDEX ON events (next_retry_at) WHERE next_retry_at IS NOT NULL |
| idx_events_org_id | CREATE INDEX ON events (org_id) |
| idx_events_entity_type_id | CREATE INDEX ON events (entity_type, entity_id) |
| idx_events_correlation_id | CREATE INDEX ON events (correlation_id) |
| idx_events_actor_id | CREATE INDEX ON events (actor_id) |
| idx_events_occurred_at | CREATE INDEX ON events (occurred_at) |
| idx_events_idempotency_key | CREATE INDEX ON events (idempotency_key) |

## Use Cases

1. **Event Sourcing** - Build event-driven architecture with complete event history
2. **Async Processing** - Queue events for background processing
3. **Retry Logic** - Automatically retry failed events with exponential backoff
4. **Event Correlation** - Track related events across distributed systems
5. **Idempotency** - Prevent duplicate processing using idempotency_key
6. **Audit Trail** - Maintain immutable log of all business events
7. **Analytics** - Analyze event patterns and user behavior
8. **Webhooks** - Trigger external webhooks based on internal events

## Event Naming Convention

Events follow a `domain.entity.action` pattern:

- **Recruiting**: `recruiting.job.created`, `recruiting.candidate.applied`, `recruiting.interview.scheduled`
- **Bench Sales**: `bench.consultant.submitted`, `bench.hotlist.generated`, `bench.deal.closed`
- **Academy**: `academy.enrollment.created`, `academy.module.completed`, `academy.certificate.earned`
- **CRM**: `crm.lead.created`, `crm.deal.won`, `crm.account.updated`

## Event Processing Workflow

```
pending → processing → completed
            ↓
         failed (retry_count < max_retries)
            ↓
         pending (with next_retry_at)
            ↓
         failed (retry_count >= max_retries, permanent failure)
```

## Example Query

```sql
-- Get pending events ready for processing
SELECT * FROM events
WHERE status = 'pending'
  AND (next_retry_at IS NULL OR next_retry_at <= NOW())
ORDER BY created_at ASC
LIMIT 100;
```
