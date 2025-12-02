# user_session_context Table

## Overview

| Property | Value |
|----------|-------|
| Table Name | `user_session_context` |
| Schema | `public` |
| Purpose | Tracks user session context including active role and session duration for role-based access control and session analytics. |

## Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key, unique identifier for session context |
| user_id | uuid | NO | - | ID of the user |
| active_role | text | NO | - | Currently active role (admin, recruiter, bench_sales, hr, client) |
| session_started_at | timestamp with time zone | NO | now() | Timestamp when session started |
| session_ended_at | timestamp with time zone | YES | - | Timestamp when session ended |
| duration_seconds | integer | YES | - | Session duration in seconds |

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| user_id | user_profiles.id | CASCADE |

## Indexes

| Index Name | Definition |
|------------|------------|
| user_session_context_pkey | CREATE UNIQUE INDEX ON user_session_context (id) |
| idx_user_session_context_user | CREATE INDEX ON user_session_context (user_id) |
| idx_user_session_context_active | CREATE INDEX ON user_session_context (user_id, active_role) WHERE session_ended_at IS NULL |
| idx_user_session_context_started | CREATE INDEX ON user_session_context (session_started_at DESC) |

## Use Cases

1. **Role Switching** - Track when users switch between roles
2. **Session Analytics** - Analyze user session patterns by role
3. **Role Usage** - Understand which roles are used most frequently
4. **Concurrent Sessions** - Detect multiple active sessions for same user
5. **Session Duration** - Calculate average session length by role
6. **Access Auditing** - Track role-based access patterns
7. **Activity Monitoring** - Monitor user activity and engagement

## Active Roles

Users in InTime v3 can have multiple roles but only one is active at a time:

- **admin** - Full system access
- **recruiter** - Recruiting/ATS features
- **bench_sales** - Bench sales and consultant placement
- **hr** - HR and talent acquisition features
- **client** - Client portal access (external users)
- **recruiting_manager** - Recruiting team lead
- **bench_sales_manager** - Bench sales team lead

## Example Queries

```sql
-- Get user's current active session
SELECT * FROM user_session_context
WHERE user_id = 'user-uuid'
  AND session_ended_at IS NULL
ORDER BY session_started_at DESC
LIMIT 1;

-- End current session and calculate duration
UPDATE user_session_context
SET
  session_ended_at = NOW(),
  duration_seconds = EXTRACT(EPOCH FROM (NOW() - session_started_at))
WHERE user_id = 'user-uuid'
  AND session_ended_at IS NULL;

-- Get role usage statistics
SELECT
  active_role,
  COUNT(*) as session_count,
  AVG(duration_seconds) / 60 as avg_duration_minutes,
  SUM(duration_seconds) / 3600 as total_hours
FROM user_session_context
WHERE session_ended_at IS NOT NULL
  AND session_started_at > NOW() - INTERVAL '30 days'
GROUP BY active_role
ORDER BY session_count DESC;

-- Find users with multiple concurrent sessions
SELECT
  user_id,
  COUNT(*) as concurrent_sessions,
  array_agg(active_role) as roles
FROM user_session_context
WHERE session_ended_at IS NULL
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Get session history for user
SELECT
  active_role,
  session_started_at,
  session_ended_at,
  duration_seconds / 60 as duration_minutes
FROM user_session_context
WHERE user_id = 'user-uuid'
ORDER BY session_started_at DESC
LIMIT 50;

-- Calculate average session duration by role
SELECT
  active_role,
  COUNT(*) as sessions,
  AVG(duration_seconds) / 60 as avg_minutes,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_seconds) / 60 as median_minutes
FROM user_session_context
WHERE session_ended_at IS NOT NULL
  AND duration_seconds > 0
  AND session_started_at > NOW() - INTERVAL '90 days'
GROUP BY active_role
ORDER BY sessions DESC;
```

## Session Lifecycle

```
1. User logs in → Create new session context with active_role
2. User switches role → End current session, create new session with new role
3. User logs out → End session, calculate duration_seconds
4. Session timeout → Background job ends stale sessions
```

## Notes

- Each user can have only one active session at a time (enforced at application level)
- Role switching creates a new session record
- Session duration is calculated when session ends
- Stale sessions (>24 hours without activity) are automatically ended by a background job
