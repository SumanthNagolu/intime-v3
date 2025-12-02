# V Timeline Recent View

## Overview

| Property | Value |
|----------|-------|
| View Name | `v_timeline_recent` |
| Schema | `public` |
| Purpose | Recent timeline events and activities |

## Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | YES | Unique identifier |
| session_id | varchar | YES | session id |
| session_date | timestamptz | YES | session date |
| agent_type | varchar | YES | agent type |
| agent_model | varchar | YES | agent model |
| duration | varchar | YES | duration |
| conversation_summary | text | YES | conversation summary |
| user_intent | text | YES | user intent |
| actions_taken | jsonb | YES | actions taken |
| files_changed | jsonb | YES | files changed |
| decisions | jsonb | YES | decisions |
| assumptions | jsonb | YES | assumptions |
| results | jsonb | YES | results |
| future_notes | jsonb | YES | future notes |
| related_commits | ARRAY | YES | related commits |
| related_prs | ARRAY | YES | related prs |
| related_docs | ARRAY | YES | related docs |
| tags | ARRAY | YES | tags |
| ai_generated_summary | text | YES | ai generated summary |
| key_learnings | ARRAY | YES | key learnings |
| search_vector | tsvector | YES | Full-text search vector |
| created_at | timestamptz | YES | Record creation timestamp |
| updated_at | timestamptz | YES | Record last update timestamp |
| deleted_at | timestamptz | YES | Soft delete timestamp |
| is_archived | boolean | YES | is archived |
| session_started_at | timestamptz | YES | session started at |
| session_ended_at | timestamptz | YES | session ended at |
| session_branch | varchar | YES | session branch |
| successfully_completed | boolean | YES | successfully completed |

## Definition

```sql
CREATE OR REPLACE VIEW v_timeline_recent AS
 SELECT pt.id,
    pt.session_id,
    pt.session_date,
    pt.agent_type,
    pt.agent_model,
    pt.duration,
    pt.conversation_summary,
    pt.user_intent,
    pt.actions_taken,
    pt.files_changed,
    pt.decisions,
    pt.assumptions,
    pt.results,
    pt.future_notes,
    pt.related_commits,
    pt.related_prs,
    pt.related_docs,
    pt.tags,
    pt.ai_generated_summary,
    pt.key_learnings,
    pt.search_vector,
    pt.created_at,
    pt.updated_at,
    pt.deleted_at,
    pt.is_archived,
    sm.started_at AS session_started_at,
    sm.ended_at AS session_ended_at,
    sm.branch AS session_branch,
    sm.successfully_completed
   FROM (project_timeline pt
     LEFT JOIN session_metadata sm ON (((pt.session_id)::text = (sm.session_id)::text)))
  WHERE ((pt.is_archived = false) AND (pt.deleted_at IS NULL))
  ORDER BY pt.session_date DESC
 LIMIT 100;
```
