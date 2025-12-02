# V Session Summary View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_session_summary` |
| Schema | `public` |
| Purpose | User session summary and activity metrics |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| session_id | varchar | YES | session id |
| started_at | timestamptz | YES | started at |
| ended_at | timestamptz | YES | ended at |
| duration | varchar | YES | duration |
| branch | varchar | YES | branch |
| commit_hash | varchar | YES | commit hash |
| environment | varchar | YES | environment |
| files_modified | integer | YES | files modified |
| lines_added | integer | YES | lines added |
| lines_removed | integer | YES | lines removed |
| commands_executed | integer | YES | commands executed |
| overall_goal | text | YES | overall goal |
| successfully_completed | boolean | YES | successfully completed |
| created_at | timestamptz | YES | Record creation timestamp |
| updated_at | timestamptz | YES | Record last update timestamp |
| timeline_entries | bigint | YES | timeline entries |
| all_tags | ARRAY | YES | all tags |

## Definition

```sql
CREATE OR REPLACE VIEW v_session_summary AS
 SELECT sm.id,
    sm.session_id,
    sm.started_at,
    sm.ended_at,
    sm.duration,
    sm.branch,
    sm.commit_hash,
    sm.environment,
    sm.files_modified,
    sm.lines_added,
    sm.lines_removed,
    sm.commands_executed,
    sm.overall_goal,
    sm.successfully_completed,
    sm.created_at,
    sm.updated_at,
    count(pt.id) AS timeline_entries,
    COALESCE(array_agg(DISTINCT t.tag) FILTER (WHERE (t.tag IS NOT NULL)), ARRAY[]::text[]) AS all_tags
   FROM ((session_metadata sm
     LEFT JOIN project_timeline pt ON (((sm.session_id)::text = (pt.session_id)::text)))
     LEFT JOIN LATERAL unnest(pt.tags) t(tag) ON (true))
  GROUP BY sm.id
  ORDER BY sm.started_at DESC;
```
