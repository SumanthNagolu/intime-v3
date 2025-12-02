# org_context_cache Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `org_context_cache` |
| Schema | `public` |
| Purpose | Caches frequently accessed organization-wide context data with TTL-based expiration to improve performance and reduce database load. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for cache entry |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |
| context_type | text | NO | - | Type of cached context (e.g., 'active_jobs', 'team_members', 'subscription_limits') |
| data | jsonb | NO | - | Cached data payload |
| expires_at | timestamp with time zone | NO | now() + 24 hours | TTL - when cache entry expires |
| refresh_triggered_at | timestamp with time zone | YES | - | Timestamp when background refresh was triggered |
| created_at | timestamp with time zone | NO | now() | Timestamp when cache entry was created |
| updated_at | timestamp with time zone | NO | now() | Timestamp when cache entry was last updated |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| org_context_cache_pkey | CREATE UNIQUE INDEX ON org_context_cache (id) |
| idx_org_context_cache_org_type | CREATE UNIQUE INDEX ON org_context_cache (org_id, context_type) |
| idx_org_context_cache_expires | CREATE INDEX ON org_context_cache (expires_at) WHERE expires_at > NOW() |

## Use Cases

1. **Performance Optimization** - Cache expensive queries and computations
2. **Rate Limiting** - Store organization-wide rate limit counters
3. **Subscription Limits** - Cache usage limits and quotas
4. **Dashboard Data** - Cache dashboard metrics and KPIs
5. **Lookup Tables** - Cache frequently accessed reference data
6. **Background Refresh** - Trigger async refresh before expiration

## Common Context Types

- **active_jobs_count** - Number of active job postings
- **team_members** - List of organization team members
- **subscription_limits** - Usage quotas and limits
- **dashboard_metrics** - Pre-computed dashboard KPIs
- **active_candidates_count** - Number of candidates in pipeline
- **job_categories** - List of job categories used by org
- **custom_fields** - Organization's custom field definitions

## Cache TTL Strategy

| Context Type | TTL | Refresh Strategy |
|--------------|-----|------------------|
| subscription_limits | 1 hour | On-demand |
| dashboard_metrics | 5 minutes | Background refresh |
| team_members | 1 day | Event-driven invalidation |
| active_jobs_count | 15 minutes | Background refresh |
| custom_fields | 1 day | Event-driven invalidation |

## Example Queries

```sql
-- Get cached context (or return null if expired)
SELECT data FROM org_context_cache
WHERE org_id = 'org-uuid'
  AND context_type = 'dashboard_metrics'
  AND expires_at > NOW();

-- Upsert cache entry
INSERT INTO org_context_cache (org_id, context_type, data, expires_at)
VALUES (
  'org-uuid',
  'active_jobs_count',
  '{"count": 42, "by_status": {"open": 30, "closed": 12}}'::jsonb,
  NOW() + INTERVAL '15 minutes'
)
ON CONFLICT (org_id, context_type)
DO UPDATE SET
  data = EXCLUDED.data,
  expires_at = EXCLUDED.expires_at,
  updated_at = NOW();

-- Invalidate cache for specific context
DELETE FROM org_context_cache
WHERE org_id = 'org-uuid'
  AND context_type = 'team_members';

-- Clean up expired cache entries
DELETE FROM org_context_cache
WHERE expires_at < NOW();
```

## Background Refresh Pattern

```sql
-- Find caches that need refresh soon (within 2 minutes)
SELECT * FROM org_context_cache
WHERE expires_at < NOW() + INTERVAL '2 minutes'
  AND expires_at > NOW()
  AND refresh_triggered_at IS NULL;

-- Mark as refresh triggered
UPDATE org_context_cache
SET refresh_triggered_at = NOW()
WHERE id = 'cache-id';
```
