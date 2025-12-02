# V Audit Logs Critical View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_audit_logs_critical` |
| Schema | `public` |
| Purpose | Critical audit log entries requiring attention |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| created_at | timestamptz | YES | Record creation timestamp |
| table_name | text | YES | table name |
| action | text | YES | action |
| user_email | text | YES | user email |
| record_id | uuid | YES | record id |
| metadata | jsonb | YES | metadata |
| user_name | text | YES | user name |

## Definition

```sql
CREATE OR REPLACE VIEW v_audit_logs_critical AS
 SELECT al.id,
    al.created_at,
    al.table_name,
    al.action,
    al.user_email,
    al.record_id,
    al.metadata,
    up.full_name AS user_name
   FROM (audit_logs al
     LEFT JOIN user_profiles up ON ((al.user_id = up.id)))
  WHERE (al.severity = ANY (ARRAY['error'::text, 'critical'::text]))
  ORDER BY al.created_at DESC;
```
