# V Rls Policies View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_rls_policies` |
| Schema | `public` |
| Purpose | Row Level Security policies configuration |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| schemaname | name | YES | schemaname |
| tablename | name | YES | tablename |
| policyname | name | YES | policyname |
| permissive | text | YES | permissive |
| roles | ARRAY | YES | roles |
| cmd | text | YES | cmd |
| qual | text | YES | qual |
| with_check | text | YES | with check |

## Definition

```sql
CREATE OR REPLACE VIEW v_rls_policies AS
 SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
   FROM pg_policies
  WHERE (schemaname = 'public'::name)
  ORDER BY tablename, policyname;
```
