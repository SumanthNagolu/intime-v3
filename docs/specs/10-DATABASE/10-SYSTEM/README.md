# SYSTEM Domain Documentation

## Overview

The SYSTEM domain provides foundational infrastructure tables for InTime v3, handling cross-cutting concerns like auditing, notifications, events, background jobs, file storage, and session tracking.

## Table Categories

### 1. Audit & Compliance (3 tables)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| [audit_logs](./audit_logs.md) | Comprehensive audit trail | Monthly partitioning, hierarchical event tracking, compliance flags |
| [audit_log_retention_policy](./audit_log_retention_policy.md) | Data retention policies | Configurable retention periods, archival schedules |
| audit_logs_YYYY_MM | Monthly partitions | Inherited schema from parent table |

**Use Cases**: Compliance (GDPR, SOC2), security investigations, change history, debugging

### 2. Notifications & Communications (3 tables)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| [notifications](./notifications.md) | Multi-channel user notifications | In-app, email, Slack delivery; read receipts; archival |
| [email_logs](./email_logs.md) | Email delivery tracking | Resend integration, engagement metrics (opens/clicks) |
| [email_templates](./email_templates.md) | Reusable email templates | Variable interpolation, categorization, soft deletion |

**Use Cases**: Real-time notifications, transactional emails, marketing campaigns, delivery monitoring

### 3. Event-Driven Architecture (3 tables)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| [events](./events.md) | Event sourcing & message queue | Retry logic, correlation tracking, idempotency support |
| [event_subscriptions](./event_subscriptions.md) | Event subscription management | Pattern matching, webhooks, auto-disable on failures |
| [event_delivery_log](./event_delivery_log.md) | Delivery attempt tracking | Response codes, timing metrics, error details |

**Use Cases**: Async processing, event-driven workflows, webhooks, system integration

### 4. Background Processing (1 table)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| [background_jobs](./background_jobs.md) | Async job queue | Priority-based scheduling, retry logic, progress monitoring |

**Use Cases**: Bulk operations, report generation, data sync, scheduled tasks

### 5. File Management (1 table)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| [file_uploads](./file_uploads.md) | File storage tracking | Supabase Storage integration, entity associations, soft deletion |

**Use Cases**: Resume storage, document management, profile pictures, course materials

### 6. Analytics & Tracking (2 tables)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| [engagement_tracking](./engagement_tracking.md) | Email/campaign engagement | Open/click tracking, bounce monitoring, user behavior analysis |
| [project_timeline](./project_timeline.md) | AI-assisted dev sessions | Session metadata, code metrics, decisions, learnings |

**Use Cases**: Email analytics, campaign optimization, development velocity tracking

### 7. Caching & Performance (1 table)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| [org_context_cache](./org_context_cache.md) | Organization context cache | TTL-based expiration, background refresh triggers |

**Use Cases**: Performance optimization, rate limiting, dashboard data caching

### 8. Payments (1 table)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| [payment_transactions](./payment_transactions.md) | Payment tracking | Stripe integration, multi-currency support, refund handling |

**Use Cases**: Course payments, subscription billing, financial reporting

### 9. Session Management (2 tables)

| Table | Purpose | Key Features |
|-------|---------|--------------|
| [session_metadata](./session_metadata.md) | Coding session metrics | Git state, code velocity, environment tracking |
| [user_session_context](./user_session_context.md) | User role sessions | Active role tracking, session duration, role switching |

**Use Cases**: Session analytics, role-based access control, activity monitoring

## Architecture Patterns

### Multi-Tenancy

All SYSTEM tables support multi-tenant isolation via `org_id`:

```sql
SELECT * FROM events WHERE org_id = 'org-uuid';
SELECT * FROM notifications WHERE org_id = 'org-uuid' AND user_id = 'user-uuid';
```

### Event-Driven Architecture

The SYSTEM domain implements a complete event-driven architecture:

```
1. Event occurs → Insert into `events` table
2. Event workers poll `events` for pending events
3. Match event against `event_subscriptions` patterns
4. Deliver to subscribed handlers/webhooks
5. Log delivery attempt in `event_delivery_log`
6. Update event status (completed/failed)
```

### Audit Trail Pattern

All data changes are automatically tracked:

```
1. User performs action
2. Trigger captures before/after values
3. Insert into `audit_logs` (auto-partitioned by month)
4. Record includes correlation_id for tracing
5. Retention policy determines how long to keep
```

### Background Job Pattern

Long-running operations are queued for async processing:

```
1. Create job in `background_jobs` with priority
2. Worker polls for pending jobs (ordered by priority)
3. Worker updates status to 'processing'
4. On completion, store result and set status to 'completed'
5. On failure, increment attempts and retry if < max_attempts
```

## Performance Considerations

### Indexing Strategy

All tables use strategic indexes for common query patterns:

- **Time-series**: DESC indexes on timestamps for recent-first queries
- **Foreign keys**: Indexed for join performance
- **Partial indexes**: Filter null values to reduce index size
- **Composite indexes**: Multi-column indexes for complex queries

### Table Partitioning

`audit_logs` uses monthly partitioning for:
- Efficient queries on recent data
- Faster archival of old data
- Improved vacuum/analyze performance

### Caching

`org_context_cache` reduces database load for:
- Frequently accessed data
- Expensive aggregate queries
- Rate limiting counters

## Common Queries

### Get Unread Notifications

```sql
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
  AND is_read = false
  AND is_archived = false
ORDER BY created_at DESC;
```

### Process Pending Events

```sql
SELECT * FROM events
WHERE status = 'pending'
  AND (next_retry_at IS NULL OR next_retry_at <= NOW())
ORDER BY created_at ASC
LIMIT 100;
```

### Get Next Background Job

```sql
SELECT * FROM background_jobs
WHERE status = 'pending'
ORDER BY priority ASC, created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

### Audit Trail for Entity

```sql
SELECT * FROM audit_logs
WHERE entity_type = 'job'
  AND entity_id = 'job-uuid'
ORDER BY created_at DESC;
```

## Integration Points

### External Services

- **Resend** - Email delivery via `email_logs`
- **Stripe** - Payment processing via `payment_transactions`
- **Supabase Storage** - File storage via `file_uploads`
- **Slack** - Notifications via `event_subscriptions` webhooks

### Internal Systems

- **ATS** - Publishes recruiting events to `events`
- **Academy** - Publishes training events to `events`
- **CRM** - Publishes sales events to `events`
- **Bench Sales** - Publishes consultant events to `events`

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Event Queue Depth**: Number of pending events
2. **Job Queue Depth**: Number of pending background jobs
3. **Email Delivery Rate**: Percentage of successfully delivered emails
4. **Event Delivery Rate**: Percentage of successful webhook deliveries
5. **Cache Hit Rate**: Percentage of cache hits vs misses
6. **Audit Log Growth**: Rate of audit log partition growth

### Alert Conditions

```sql
-- Alert if event queue is backed up (>1000 pending)
SELECT COUNT(*) FROM events WHERE status = 'pending';

-- Alert if email delivery rate drops below 95%
SELECT COUNT(*) FILTER (WHERE status = 'delivered') * 100.0 / COUNT(*)
FROM email_logs
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Alert if webhook delivery failures exceed 10%
SELECT COUNT(*) FILTER (WHERE status = 'failed') * 100.0 / COUNT(*)
FROM event_delivery_log
WHERE attempted_at > NOW() - INTERVAL '1 hour';
```

## Maintenance Tasks

### Daily

- Clean up expired cache entries in `org_context_cache`
- Archive completed background jobs older than 7 days
- Process failed events with pending retries

### Weekly

- Vacuum analyze all tables
- Review failed background jobs
- Analyze event subscription failure rates

### Monthly

- Create next month's audit log partition
- Archive old audit logs per retention policy
- Generate storage usage reports from `file_uploads`

## Security Considerations

1. **Sensitive Data**: Email addresses, IP addresses stored in audit logs
2. **PII**: Payment details in `payment_transactions`
3. **Access Control**: All queries filtered by `org_id`
4. **Audit**: All access logged via `audit_logs`
5. **Retention**: Compliance-driven retention policies

## Future Enhancements

1. **Real-time Notifications**: WebSocket integration for in-app notifications
2. **Event Replay**: Rebuild state by replaying events from `events` table
3. **Advanced Analytics**: Materialized views for common aggregations
4. **Auto-scaling**: Dynamic worker pool based on queue depth
5. **Dead Letter Queue**: Separate table for permanently failed events

## Related Documentation

- [Core Domain](../01-CORE/README.md) - Organizations, users, roles
- [ATS Domain](../02-ATS/README.md) - Recruiting workflow
- [Academy Domain](../05-ACADEMY/README.md) - Training platform
- [CRM Domain](../03-CRM/README.md) - Client management
