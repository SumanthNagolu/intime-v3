# background_jobs Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `background_jobs` |
| Schema | `public` |
| Purpose | Queue and track asynchronous background jobs with priority-based scheduling, retry logic, and progress monitoring. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for job |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |
| job_type | text | NO | - | Type of job (e.g., 'send_bulk_email', 'generate_report', 'sync_external_data') |
| payload | jsonb | NO | - | Job parameters and input data |
| status | text | NO | 'pending' | Job status (pending, processing, completed, failed, cancelled) |
| attempts | integer | NO | 0 | Number of processing attempts |
| max_attempts | integer | NO | 3 | Maximum number of retry attempts |
| error_message | text | YES | - | Error message if job failed |
| result | jsonb | YES | - | Job result data after successful completion |
| priority | integer | NO | 5 | Job priority (1=highest, 10=lowest) |
| created_by | uuid | NO | - | ID of user who created the job |
| created_at | timestamp with time zone | NO | now() | Timestamp when job was created |
| started_at | timestamp with time zone | YES | - | Timestamp when job processing started |
| completed_at | timestamp with time zone | YES | - | Timestamp when job completed successfully |
| updated_at | timestamp with time zone | NO | now() | Timestamp when job was last updated |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |
| created_by | user_profiles.id | SET NULL |

## Indexes

| Index Name | Definition |
|------------|------------|
| background_jobs_pkey | CREATE UNIQUE INDEX ON background_jobs (id) |
| idx_background_jobs_org | CREATE INDEX ON background_jobs (org_id) |
| idx_background_jobs_status | CREATE INDEX ON background_jobs (status) WHERE status IN ('pending', 'processing') |
| idx_background_jobs_priority | CREATE INDEX ON background_jobs (priority, created_at) WHERE status = 'pending' |
| idx_background_jobs_created | CREATE INDEX ON background_jobs (created_at DESC) |
| idx_background_jobs_type | CREATE INDEX ON background_jobs (job_type) |

## Use Cases

1. **Bulk Operations** - Send bulk emails, export large datasets, batch updates
2. **Report Generation** - Generate complex analytics reports asynchronously
3. **Data Sync** - Sync data with external systems (ATS, CRM, accounting)
4. **Scheduled Tasks** - Run periodic cleanup, archival, or maintenance tasks
5. **Long-Running Operations** - Process tasks that exceed HTTP timeout limits
6. **Priority Queue** - Process high-priority jobs before low-priority ones
7. **Background Processing** - Offload heavy work from web requests

## Job Status Flow

```
pending → processing → completed
            ↓
         failed (attempts < max_attempts)
            ↓
         pending (retry with backoff)
            ↓
         failed (attempts >= max_attempts, permanent failure)
```

## Common Job Types

- **Email**: `send_bulk_email`, `send_campaign`, `send_digest`
- **Reports**: `generate_analytics_report`, `export_candidates_csv`, `generate_invoice_pdf`
- **Sync**: `sync_ats_data`, `sync_crm_contacts`, `import_resume_bulk`
- **Cleanup**: `archive_old_logs`, `purge_expired_sessions`, `cleanup_temp_files`
- **Notifications**: `send_slack_digest`, `trigger_webhooks`, `push_notifications`

## Priority Levels

1. **Critical (1-2)** - Payment processing, security alerts
2. **High (3-4)** - User-facing reports, urgent notifications
3. **Normal (5-6)** - Standard background tasks
4. **Low (7-8)** - Cleanup, maintenance, analytics
5. **Batch (9-10)** - Bulk operations, non-urgent sync

## Example Queries

```sql
-- Get next pending job to process (highest priority first)
SELECT * FROM background_jobs
WHERE status = 'pending'
ORDER BY priority ASC, created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;

-- Get job statistics by type
SELECT
  job_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM background_jobs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY job_type;

-- Find stuck jobs (processing for >30 minutes)
SELECT * FROM background_jobs
WHERE status = 'processing'
  AND started_at < NOW() - INTERVAL '30 minutes';
```
