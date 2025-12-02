# V Audit Logs Recent View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_audit_logs_recent` |
| Schema | `public` |
| Purpose | Recent audit log entries for monitoring |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| created_at | timestamptz | YES | Record creation timestamp |
| table_name | text | YES | table name |
| action | text | YES | action |
| user_email | text | YES | user email |
| changed_fields | ARRAY | YES | changed fields |
| severity | text | YES | severity |
| user_name | text | YES | user name |

## Definition

```sql
CREATE OR REPLACE VIEW v_audit_logs_recent AS
 SELECT al.id,
    al.created_at,
    al.table_name,
    al.action,
    al.user_email,
    al.changed_fields,
    al.severity,
    up.full_name AS user_name
   FROM (audit_logs al
     LEFT JOIN user_profiles up ON ((al.user_id = up.id)))
  WHERE (al.created_at > (now() - '7 days'::interval))
  ORDER BY al.created_at DESC
 LIMIT 1000;
```
