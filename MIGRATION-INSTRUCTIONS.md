# Database Migration Instructions

## Quick Start

To apply all database migrations to your Supabase project:

### Option 1: Via Supabase Dashboard (Recommended)

1. Open your Supabase project: https://supabase.com/dashboard/project/gkwhxmvugnjwwwiufmdy
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Copy the entire contents of `APPLY-MIGRATIONS.sql` (in project root)
5. Paste into the SQL Editor
6. Click **Run** to execute all migrations

### Option 2: Via psql (Command Line)

If you have network access:

```bash
psql "${SUPABASE_DB_URL}" -f APPLY-MIGRATIONS.sql
```

## What Gets Created

The migrations will create:

### 1. Timeline Tables (001)
- `project_timeline_entries` - Track project milestones and events
- `project_timeline_tags` - Tag system for timeline entries

### 2. User Profiles (002)
- `user_profiles` - Unified user table with multi-role support
- Columns for student, employee, candidate, and client data

### 3. RBAC System (003)
- `roles` - System roles (admin, student, trainer, recruiter, etc.)
- `permissions` - Granular permissions
- `role_permissions` - Role-permission mappings
- `user_roles` - User-role assignments (supports multiple roles per user)

### 4. Audit Tables (004)
- `audit_logs` - Comprehensive audit trail
- Tracks all data changes with before/after snapshots
- Automatic retention and partitioning

### 5. Event Bus (005)
- `event_bus` - Central event log
- `event_subscriptions` - Event subscribers
- PostgreSQL LISTEN/NOTIFY triggers

### 6. RLS Policies (006)
- Row-Level Security policies for ALL tables
- User can only see/modify their own data
- Admin override capabilities

## Verification

After applying migrations, verify with:

```sql
-- Check all tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see: audit_logs, event_bus, event_subscriptions, permissions,
-- project_timeline_entries, project_timeline_tags, role_permissions,
-- roles, user_profiles, user_roles
```

## Rollback

If needed, rollback scripts are in `src/lib/db/migrations/rollback/`

Apply in reverse order:
1. 006_rls_policies_rollback.sql
2. 005_create_event_bus_rollback.sql
3. 004_create_audit_tables_rollback.sql
4. 003_create_rbac_system_rollback.sql
5. 002_create_user_profiles_rollback.sql

---

**Status:** ⏳ Migrations pending manual application
**Supabase Project:** gkwhxmvugnjwwwiufmdy
**Total Lines:** 2,822 lines of SQL
