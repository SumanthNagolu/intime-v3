# V Role Permissions Audit View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_role_permissions_audit` |
| Schema | `public` |
| Purpose | Audit trail of role permissions changes |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| role_name | text | YES | role name |
| role_display_name | text | YES | role display name |
| hierarchy_level | integer | YES | hierarchy level |
| is_system_role | boolean | YES | is system role |
| role_active | boolean | YES | role active |
| resource | text | YES | resource |
| action | text | YES | action |
| scope | text | YES | scope |
| permission_display_name | text | YES | permission display name |
| is_dangerous | boolean | YES | is dangerous |
| granted_at | timestamptz | YES | granted at |

## Definition

```sql
CREATE OR REPLACE VIEW v_role_permissions_audit AS
 SELECT r.name AS role_name,
    r.display_name AS role_display_name,
    r.hierarchy_level,
    r.is_system_role,
    r.is_active AS role_active,
    p.resource,
    p.action,
    p.scope,
    p.display_name AS permission_display_name,
    p.is_dangerous,
    rp.granted_at
   FROM ((roles r
     JOIN role_permissions rp ON ((r.id = rp.role_id)))
     JOIN permissions p ON ((rp.permission_id = p.id)))
  WHERE ((r.deleted_at IS NULL) AND (p.deleted_at IS NULL))
  ORDER BY r.hierarchy_level, r.name, p.resource, p.action, p.scope;
```
