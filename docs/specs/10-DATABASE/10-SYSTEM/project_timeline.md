# project_timeline Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `project_timeline` |
| Schema | `public` |
| Purpose | Tracks AI-assisted development sessions (Claude Code sessions) with metadata about session duration, code changes, git operations, and goals for development analytics and AI pair programming insights. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, unique identifier for timeline entry |
| session_id | varchar | NO | - | Unique session identifier (matches session_metadata.session_id) |
| session_date | timestamp with time zone | NO | now() | Date when session occurred |
| agent_type | varchar | YES | - | Type of AI agent (e.g., 'claude_code', 'copilot') |
| agent_model | varchar | YES | - | Specific model version (e.g., 'claude-sonnet-4-5') |
| duration | varchar | YES | - | Session duration in human-readable format (e.g., '2h 15m') |
| conversation_summary | text | NO | - | Brief summary of what was discussed/accomplished |
| user_intent | text | YES | - | What the user was trying to achieve |
| actions_taken | jsonb | YES | {"completed": [], "inProgress": [], "blocked": []} | List of actions taken during session |
| files_changed | jsonb | YES | {"modified": [], "created": [], "deleted": []} | Files modified, created, or deleted |
| decisions | jsonb | YES | [] | Key technical decisions made |
| assumptions | jsonb | YES | [] | Assumptions made during development |
| results | jsonb | YES | {"status": "success", "summary": "", "metrics": {}, "artifacts": []} | Session outcomes and deliverables |
| future_notes | jsonb | YES | [] | Notes for future sessions or follow-up tasks |
| related_commits | text[] | YES | - | Git commit hashes created during session |
| related_prs | text[] | YES | - | Pull request numbers created during session |
| related_docs | text[] | YES | - | Documentation files created or updated |
| tags | text[] | YES | - | Tags for categorization (e.g., 'bug-fix', 'feature', 'refactor') |
| ai_generated_summary | text | YES | - | AI-generated session summary |
| key_learnings | text[] | YES | - | Key learnings or insights from the session |
| search_vector | tsvector | YES | - | Full-text search vector for session content |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| deleted_at | timestamp with time zone | YES | - | Soft deletion timestamp |
| is_archived | boolean | YES | false | Whether session is archived |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| project_timeline_pkey | CREATE UNIQUE INDEX ON project_timeline (id) |
| idx_project_timeline_session | CREATE INDEX ON project_timeline (session_id) |
| idx_project_timeline_org | CREATE INDEX ON project_timeline (org_id) |
| idx_project_timeline_date | CREATE INDEX ON project_timeline (session_date DESC) |
| idx_project_timeline_tags | CREATE INDEX ON project_timeline USING gin(tags) |
| idx_project_timeline_search | CREATE INDEX ON project_timeline USING gin(search_vector) |

## Use Cases

1. **Development Analytics** - Track coding velocity and AI pair programming effectiveness
2. **Session History** - Review past development sessions and decisions
3. **Knowledge Base** - Build searchable repository of development insights
4. **Progress Tracking** - Monitor project progress over time
5. **Team Collaboration** - Share context between team members
6. **AI Performance** - Analyze AI assistant effectiveness
7. **Documentation** - Auto-generate development logs

## Actions Taken Structure

```json
{
  "completed": [
    "Implemented user authentication with Supabase",
    "Created tRPC router for jobs API",
    "Added tests for job creation flow"
  ],
  "inProgress": [
    "Refactoring notification system"
  ],
  "blocked": [
    "Waiting for API key from external service"
  ]
}
```

## Files Changed Structure

```json
{
  "modified": [
    "src/server/routers/jobs.ts",
    "src/lib/db/schema/ats.ts"
  ],
  "created": [
    "src/components/jobs/JobForm.tsx",
    "tests/e2e/job-creation.spec.ts"
  ],
  "deleted": [
    "src/components/legacy/OldJobForm.tsx"
  ]
}
```

## Example Queries

```sql
-- Get recent development sessions
SELECT
  session_date,
  agent_model,
  duration,
  conversation_summary,
  array_length((files_changed->>'modified')::text[], 1) as files_modified,
  array_length(related_commits, 1) as commits_made
FROM project_timeline
WHERE org_id = 'org-uuid'
  AND deleted_at IS NULL
ORDER BY session_date DESC
LIMIT 20;

-- Search sessions by content
SELECT * FROM project_timeline
WHERE search_vector @@ to_tsquery('authentication & oauth')
  AND org_id = 'org-uuid'
ORDER BY session_date DESC;

-- Get development velocity metrics
SELECT
  DATE_TRUNC('week', session_date) as week,
  COUNT(*) as sessions,
  SUM(array_length((files_changed->>'modified')::text[], 1)) as files_changed,
  SUM(array_length(related_commits, 1)) as commits_made
FROM project_timeline
WHERE org_id = 'org-uuid'
  AND session_date > NOW() - INTERVAL '3 months'
GROUP BY week
ORDER BY week DESC;
```
