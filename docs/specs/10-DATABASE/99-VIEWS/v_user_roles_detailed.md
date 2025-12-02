# V User Roles Detailed View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_user_roles_detailed` |
| Schema | `public` |
| Purpose | Detailed user role assignments and permissions |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| user_id | uuid | YES | user id |
| email | text | YES | User email address |
| full_name | text | YES | User full name |
| role_name | text | YES | role name |
| role_display_name | text | YES | role display name |
| is_primary | boolean | YES | is primary |
| assigned_at | timestamptz | YES | assigned at |
| expires_at | timestamptz | YES | expires at |
| role_status | text | YES | role status |

## Definition

```sql
CREATE OR REPLACE VIEW v_user_roles_detailed AS
 SELECT up.id AS user_id,
    up.email,
    up.full_name,
    r.name AS role_name,
    r.display_name AS role_display_name,
    ur.is_primary,
    ur.assigned_at,
    ur.expires_at,
        CASE
            WHEN ((ur.expires_at IS NOT NULL) AND (ur.expires_at < now())) THEN 'expired'::text
            WHEN (ur.deleted_at IS NOT NULL) THEN 'revoked'::text
            ELSE 'active'::text
        END AS role_status
   FROM ((user_profiles up
     JOIN user_roles ur ON ((up.id = ur.user_id)))
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE (up.deleted_at IS NULL)
  ORDER BY up.email, ur.is_primary DESC, r.name;
```
