# V Auth Rls Status View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_auth_rls_status` |
| Schema | `public` |
| Purpose | Authentication and Row Level Security status |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| table_name | name | YES | table name |
| rls_enabled | boolean | YES | rls enabled |
| rls_forced | boolean | YES | rls forced |
| policy_count | bigint | YES | policy count |
| policies | ARRAY | YES | policies |

## Definition

```sql
CREATE OR REPLACE VIEW v_auth_rls_status AS
 SELECT c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    count(p.polname) AS policy_count,
    array_agg(p.polname ORDER BY p.polname) AS policies
   FROM (pg_class c
     LEFT JOIN pg_policy p ON ((p.polrelid = c.oid)))
  WHERE ((c.relnamespace = ('public'::regnamespace)::oid) AND (c.relkind = 'r'::"char") AND (c.relname = ANY (ARRAY['user_profiles'::name, 'roles'::name, 'permissions'::name, 'user_roles'::name, 'role_permissions'::name, 'organizations'::name, 'audit_logs'::name])))
  GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
  ORDER BY c.relname;
```
