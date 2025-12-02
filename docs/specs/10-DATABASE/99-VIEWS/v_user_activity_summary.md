# V User Activity Summary View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_user_activity_summary` |
| Schema | `public` |
| Purpose | User activity summary and engagement metrics |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| user_id | uuid | YES | user id |
| user_email | text | YES | user email |
| total_actions | bigint | YES | total actions |
| inserts | bigint | YES | inserts |
| updates | bigint | YES | updates |
| deletes | bigint | YES | deletes |
| last_activity | timestamptz | YES | last activity |

## Definition

```sql
CREATE OR REPLACE VIEW v_user_activity_summary AS
 SELECT user_id,
    user_email,
    count(*) AS total_actions,
    count(*) FILTER (WHERE (action = 'INSERT'::text)) AS inserts,
    count(*) FILTER (WHERE (action = 'UPDATE'::text)) AS updates,
    count(*) FILTER (WHERE (action = 'DELETE'::text)) AS deletes,
    max(created_at) AS last_activity
   FROM audit_logs
  WHERE ((user_id IS NOT NULL) AND (created_at > (now() - '30 days'::interval)))
  GROUP BY user_id, user_email
  ORDER BY (count(*)) DESC;
```
