# V Workflow Metrics View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_workflow_metrics` |
| Schema | `public` |
| Purpose | Workflow performance metrics and statistics |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| workflow_id | uuid | YES | workflow id |
| workflow_name | text | YES | workflow name |
| entity_type | text | YES | entity type |
| total_instances | bigint | YES | total instances |
| active_instances | bigint | YES | active instances |
| completed_instances | bigint | YES | completed instances |
| cancelled_instances | bigint | YES | cancelled instances |
| avg_completion_hours | numeric | YES | avg completion hours |
| last_started_at | timestamptz | YES | last started at |
| org_id | uuid | YES | org id |

## Definition

```sql
CREATE OR REPLACE VIEW v_workflow_metrics AS
 SELECT w.id AS workflow_id,
    w.name AS workflow_name,
    w.entity_type,
    count(*) AS total_instances,
    count(*) FILTER (WHERE (wi.status = 'active'::text)) AS active_instances,
    count(*) FILTER (WHERE (wi.status = 'completed'::text)) AS completed_instances,
    count(*) FILTER (WHERE (wi.status = 'cancelled'::text)) AS cancelled_instances,
    round(avg((EXTRACT(epoch FROM (wi.completed_at - wi.started_at)) / (3600)::numeric)), 2) AS avg_completion_hours,
    max(wi.started_at) AS last_started_at,
    w.org_id
   FROM (workflows w
     LEFT JOIN workflow_instances wi ON ((w.id = wi.workflow_id)))
  WHERE ((w.org_id = auth_user_org_id()) OR user_is_admin())
  GROUP BY w.id, w.name, w.entity_type, w.org_id;
```
