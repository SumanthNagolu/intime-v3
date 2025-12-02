# V Workflow Instances With State View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_workflow_instances_with_state` |
| Schema | `public` |
| Purpose | Workflow instances with their current state |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| org_id | uuid | YES | org id |
| workflow_name | text | YES | workflow name |
| entity_type | text | YES | entity type |
| entity_id | uuid | YES | entity id |
| current_state | text | YES | current state |
| current_state_display | text | YES | current state display |
| is_terminal | boolean | YES | is terminal |
| status | text | YES | status |
| started_at | timestamptz | YES | started at |
| completed_at | timestamptz | YES | completed at |
| cancelled_at | timestamptz | YES | cancelled at |
| duration_hours | numeric | YES | duration hours |
| created_by_name | text | YES | created by name |
| created_at | timestamptz | YES | Record creation timestamp |
| updated_at | timestamptz | YES | Record last update timestamp |

## Definition

```sql
CREATE OR REPLACE VIEW v_workflow_instances_with_state AS
 SELECT wi.id,
    wi.org_id,
    w.name AS workflow_name,
    wi.entity_type,
    wi.entity_id,
    ws.name AS current_state,
    ws.display_name AS current_state_display,
    ws.is_terminal,
    wi.status,
    wi.started_at,
    wi.completed_at,
    wi.cancelled_at,
    (EXTRACT(epoch FROM (COALESCE(wi.completed_at, now()) - wi.started_at)) / (3600)::numeric) AS duration_hours,
    up.full_name AS created_by_name,
    wi.created_at,
    wi.updated_at
   FROM (((workflow_instances wi
     JOIN workflows w ON ((wi.workflow_id = w.id)))
     JOIN workflow_states ws ON ((wi.current_state_id = ws.id)))
     JOIN user_profiles up ON ((wi.created_by = up.id)))
  WHERE ((wi.org_id = auth_user_org_id()) OR user_is_admin());
```
