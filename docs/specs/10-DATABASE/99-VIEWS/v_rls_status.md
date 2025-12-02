# V Rls Status View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_rls_status` |
| Schema | `public` |
| Purpose | Current Row Level Security status across tables |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| schemaname | name | YES | schemaname |
| tablename | name | YES | tablename |
| rls_enabled | boolean | YES | rls enabled |

## Definition

```sql
CREATE OR REPLACE VIEW v_rls_status AS
 SELECT schemaname,
    tablename,
    rowsecurity AS rls_enabled
   FROM pg_tables
  WHERE ((schemaname = 'public'::name) AND (tablename = ANY (ARRAY['user_profiles'::name, 'roles'::name, 'permissions'::name, 'user_roles'::name, 'role_permissions'::name, 'audit_logs'::name, 'events'::name, 'event_subscriptions'::name])))
  ORDER BY tablename;
```
