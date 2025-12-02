# session_metadata Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `session_metadata` |
| Schema | `public` |
| Purpose | Tracks coding session metadata including git state, code metrics, and development environment for analytics and productivity tracking. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | uuid_generate_v4() | Primary key, unique identifier for session metadata |
| session_id | varchar | NO | - | Unique session identifier (links to project_timeline) |
| started_at | timestamp with time zone | NO | - | Timestamp when session started |
| ended_at | timestamp with time zone | YES | - | Timestamp when session ended |
| duration | varchar | YES | - | Session duration in human-readable format (e.g., '1h 30m') |
| branch | varchar | YES | - | Git branch session was conducted on |
| commit_hash | varchar | YES | - | Initial git commit hash at session start |
| environment | varchar | YES | - | Development environment (development, staging, production) |
| files_modified | integer | YES | 0 | Number of files modified during session |
| lines_added | integer | YES | 0 | Number of lines added during session |
| lines_removed | integer | YES | 0 | Number of lines removed during session |
| commands_executed | integer | YES | 0 | Number of shell commands executed |
| overall_goal | text | YES | - | High-level goal for the session |
| successfully_completed | boolean | YES | false | Whether session goal was successfully completed |
| created_at | timestamp with time zone | YES | now() | Timestamp when record was created |
| updated_at | timestamp with time zone | YES | now() | Timestamp when record was last updated |
| org_id | uuid | NO | - | Organization ID for multi-tenant isolation |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| org_id | organizations.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| session_metadata_pkey | CREATE UNIQUE INDEX ON session_metadata (id) |
| idx_session_metadata_session_id | CREATE UNIQUE INDEX ON session_metadata (session_id) |
| idx_session_metadata_org | CREATE INDEX ON session_metadata (org_id) |
| idx_session_metadata_started | CREATE INDEX ON session_metadata (started_at DESC) |
| idx_session_metadata_branch | CREATE INDEX ON session_metadata (branch) |

## Use Cases

1. **Session Analytics** - Analyze coding session patterns and productivity
2. **Code Velocity** - Track lines of code changed over time
3. **Git Insights** - Understand branch usage and commit patterns
4. **Goal Tracking** - Monitor completion rates of session goals
5. **Developer Metrics** - Calculate developer productivity KPIs
6. **Environment Monitoring** - Track which environments are used most
7. **Time Tracking** - Measure actual development time vs estimates

## Example Queries

```sql
-- Get session statistics for last month
SELECT
  COUNT(*) as total_sessions,
  SUM(files_modified) as total_files_modified,
  SUM(lines_added) as total_lines_added,
  SUM(lines_removed) as total_lines_removed,
  AVG(files_modified) as avg_files_per_session,
  COUNT(*) FILTER (WHERE successfully_completed = true) * 100.0 / COUNT(*) as completion_rate
FROM session_metadata
WHERE org_id = 'org-uuid'
  AND started_at > NOW() - INTERVAL '30 days';

-- Get most active branches
SELECT
  branch,
  COUNT(*) as session_count,
  SUM(files_modified) as total_files_modified,
  SUM(lines_added) as total_lines_added
FROM session_metadata
WHERE org_id = 'org-uuid'
  AND branch IS NOT NULL
GROUP BY branch
ORDER BY session_count DESC
LIMIT 10;

-- Calculate average session duration
SELECT
  AVG(EXTRACT(EPOCH FROM (ended_at - started_at)) / 3600) as avg_hours,
  MIN(EXTRACT(EPOCH FROM (ended_at - started_at)) / 3600) as min_hours,
  MAX(EXTRACT(EPOCH FROM (ended_at - started_at)) / 3600) as max_hours
FROM session_metadata
WHERE org_id = 'org-uuid'
  AND ended_at IS NOT NULL
  AND started_at > NOW() - INTERVAL '90 days';

-- Get sessions with incomplete goals
SELECT
  session_id,
  overall_goal,
  started_at,
  duration,
  files_modified,
  lines_added + lines_removed as total_lines_changed
FROM session_metadata
WHERE org_id = 'org-uuid'
  AND successfully_completed = false
  AND overall_goal IS NOT NULL
ORDER BY started_at DESC;
```

## Relationship to project_timeline

Each session has two related records:
- **session_metadata** - Technical metrics (git, files, lines)
- **project_timeline** - Narrative summary (goals, decisions, learnings)

Both tables share the same `session_id` for correlation.
