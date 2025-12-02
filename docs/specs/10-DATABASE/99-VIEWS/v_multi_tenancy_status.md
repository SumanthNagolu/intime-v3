# V Multi Tenancy Status View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_multi_tenancy_status` |
| Schema | `public` |
| Purpose | Multi-tenancy configuration and status |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| table_name | text | YES | table name |
| total_records | bigint | YES | total records |
| unique_orgs | bigint | YES | unique orgs |
| active_orgs | bigint | YES | active orgs |
| soft_deleted_orgs | bigint | YES | soft deleted orgs |

## Definition

```sql
CREATE OR REPLACE VIEW v_multi_tenancy_status AS
 SELECT 'organizations'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT organizations.id) AS unique_orgs,
    count(*) FILTER (WHERE (organizations.status = 'active'::text)) AS active_orgs,
    count(*) FILTER (WHERE (organizations.deleted_at IS NOT NULL)) AS soft_deleted_orgs
   FROM organizations
UNION ALL
 SELECT 'user_profiles'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT user_profiles.org_id) AS unique_orgs,
    count(*) FILTER (WHERE (user_profiles.org_id IS NOT NULL)) AS active_orgs,
    NULL::bigint AS soft_deleted_orgs
   FROM user_profiles
UNION ALL
 SELECT 'audit_logs'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT audit_logs.org_id) AS unique_orgs,
    count(*) FILTER (WHERE (audit_logs.org_id IS NOT NULL)) AS active_orgs,
    NULL::bigint AS soft_deleted_orgs
   FROM audit_logs
UNION ALL
 SELECT 'events'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT events.org_id) AS unique_orgs,
    count(*) FILTER (WHERE (events.org_id IS NOT NULL)) AS active_orgs,
    NULL::bigint AS soft_deleted_orgs
   FROM events
UNION ALL
 SELECT 'event_delivery_log'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT event_delivery_log.org_id) AS unique_orgs,
    count(*) FILTER (WHERE (event_delivery_log.org_id IS NOT NULL)) AS active_orgs,
    NULL::bigint AS soft_deleted_orgs
   FROM event_delivery_log
UNION ALL
 SELECT 'project_timeline'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT project_timeline.org_id) AS unique_orgs,
    count(*) FILTER (WHERE (project_timeline.org_id IS NOT NULL)) AS active_orgs,
    NULL::bigint AS soft_deleted_orgs
   FROM project_timeline
UNION ALL
 SELECT 'session_metadata'::text AS table_name,
    count(*) AS total_records,
    count(DISTINCT session_metadata.org_id) AS unique_orgs,
    count(*) FILTER (WHERE (session_metadata.org_id IS NOT NULL)) AS active_orgs,
    NULL::bigint AS soft_deleted_orgs
   FROM session_metadata;
```
