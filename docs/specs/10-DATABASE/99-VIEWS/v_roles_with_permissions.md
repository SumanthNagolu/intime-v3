# V Roles With Permissions View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_roles_with_permissions` |
| Schema | `public` |
| Purpose | Roles with their associated permissions |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| name | text | YES | name |
| display_name | text | YES | display name |
| description | text | YES | description |
| hierarchy_level | integer | YES | hierarchy level |
| permission_count | bigint | YES | permission count |
| user_count | bigint | YES | user count |

## Definition

```sql
CREATE OR REPLACE VIEW v_roles_with_permissions AS
 SELECT r.id,
    r.name,
    r.display_name,
    r.description,
    r.hierarchy_level,
    count(rp.permission_id) AS permission_count,
    count(DISTINCT ur.user_id) AS user_count
   FROM ((roles r
     LEFT JOIN role_permissions rp ON ((r.id = rp.role_id)))
     LEFT JOIN user_roles ur ON (((r.id = ur.role_id) AND (ur.deleted_at IS NULL))))
  WHERE (r.deleted_at IS NULL)
  GROUP BY r.id, r.name, r.display_name, r.description, r.hierarchy_level
  ORDER BY r.hierarchy_level, r.name;
```
