# V Organization Stats View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_organization_stats` |
| Schema | `public` |
| Purpose | Organization-level statistics and metrics |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| name | text | YES | name |
| slug | text | YES | slug |
| subscription_tier | text | YES | subscription tier |
| subscription_status | text | YES | subscription status |
| status | text | YES | status |
| max_users | integer | YES | max users |
| current_users | bigint | YES | current users |
| available_user_slots | bigint | YES | available user slots |
| max_candidates | integer | YES | max candidates |
| current_candidates | bigint | YES | current candidates |
| created_at | timestamptz | YES | Record creation timestamp |
| updated_at | timestamptz | YES | Record last update timestamp |

## Definition

```sql
CREATE OR REPLACE VIEW v_organization_stats AS
 SELECT o.id,
    o.name,
    o.slug,
    o.subscription_tier,
    o.subscription_status,
    o.status,
    o.max_users,
    count(DISTINCT up.id) AS current_users,
    (o.max_users - count(DISTINCT up.id)) AS available_user_slots,
    o.max_candidates,
    count(DISTINCT up.id) FILTER (WHERE (up.candidate_status IS NOT NULL)) AS current_candidates,
    o.created_at,
    o.updated_at
   FROM (organizations o
     LEFT JOIN user_profiles up ON (((up.org_id = o.id) AND (up.deleted_at IS NULL))))
  WHERE (o.deleted_at IS NULL)
  GROUP BY o.id;
```
