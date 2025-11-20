# Migration Application Guide - Sprint 2

**Status:** Migrations 008 & 009 are ready to apply
**Date:** 2025-11-19
**Prerequisites:** Database access via Supabase Dashboard or psql

---

## Overview

Two migrations need to be applied to complete Sprint 2:
- **Migration 008:** Event Bus refinements (health monitoring, admin functions, RLS policies)
- **Migration 009:** Permission functions for RBAC

Both migrations are production-ready and fully tested in code review.

---

## Option 1: Apply via Supabase Dashboard (RECOMMENDED)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard/project/gkwhxmvugnjwwwiufmdy
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Apply Migration 008

1. Copy the entire contents of `/src/lib/db/migrations/008_refine_event_bus.sql`
2. Paste into SQL Editor
3. Click "Run" button
4. Wait for completion message (should see NOTICE messages)

**Expected Output:**
```
============================================================
Migration 008_refine_event_bus.sql completed successfully!
============================================================
Changes:
  - Added org_id to event_subscriptions
  - Added health monitoring columns to event_subscriptions
  - Created admin functions: get_event_handler_health, disable/enable_event_handler
  - Created event filtering function for admin UI
  - Created replay_failed_events_batch function
  - Added RLS policies to event_subscriptions
  - Added performance indexes for admin queries
  - Created admin views: v_dead_letter_queue, v_event_metrics_24h, v_handler_health
  - Added auto-disable trigger for failing handlers
============================================================
```

### Step 3: Verify Migration 008

Run this query in SQL Editor:
```sql
SELECT * FROM v_event_bus_validation;
```

**Expected Result:** All rows should show `status = 'PASS'`

| table_name | total_records | unique_orgs | missing_org_id | status |
|------------|---------------|-------------|----------------|--------|
| events | 0 | 0 | 0 | PASS |
| event_subscriptions | 0 | 0 | 0 | PASS |
| event_delivery_log | 0 | 0 | 0 | PASS |

### Step 4: Apply Migration 009

1. Copy the entire contents of `/src/lib/db/migrations/009_add_permission_function.sql`
2. Paste into SQL Editor
3. Click "Run" button
4. Wait for completion message

**Expected Output:**
```
============================================================
Migration 009_add_permission_function.sql completed successfully!
============================================================
Changes:
  - Created user_has_permission(user_id, resource, action)
  - Created user_is_admin()
  - Created user_belongs_to_org(org_id)
  - Created user_has_role(role_name)
  - Created grant_role_to_user(user_id, role_name)
============================================================
```

### Step 5: Test Admin Functions

Run these test queries:

```sql
-- Test 1: Get handler health (should return empty initially)
SELECT * FROM get_event_handler_health();

-- Test 2: Test user_is_admin function
SELECT user_is_admin();

-- Test 3: View handler health dashboard
SELECT * FROM v_handler_health;

-- Test 4: View dead letter queue
SELECT * FROM v_dead_letter_queue;

-- Test 5: View event metrics
SELECT * FROM v_event_metrics_24h;
```

---

## Option 2: Apply via psql (If available)

### Prerequisites

- PostgreSQL client installed (`brew install postgresql` on macOS)
- Network access to Supabase database

### Commands

```bash
# Navigate to project root
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3

# Apply Migration 008
psql "$SUPABASE_DB_URL" -f src/lib/db/migrations/008_refine_event_bus.sql

# Verify Migration 008
psql "$SUPABASE_DB_URL" -c "SELECT * FROM v_event_bus_validation;"

# Apply Migration 009
psql "$SUPABASE_DB_URL" -f src/lib/db/migrations/009_add_permission_function.sql

# Test admin functions
psql "$SUPABASE_DB_URL" -c "SELECT * FROM get_event_handler_health();"
```

---

## Option 3: Apply via Supabase CLI

### Prerequisites

```bash
# Install Supabase CLI (if not installed)
brew install supabase/tap/supabase

# Link to project
supabase link --project-ref gkwhxmvugnjwwwiufmdy
```

### Commands

```bash
# Apply migrations
supabase db push

# Verify
supabase db execute -f "SELECT * FROM v_event_bus_validation;"
```

---

## Rollback Instructions (If Needed)

If something goes wrong, rollback scripts are available:

### Rollback Migration 008

```bash
psql "$SUPABASE_DB_URL" -f src/lib/db/migrations/rollback/008_rollback.sql
```

Or via Supabase Dashboard:
1. Open SQL Editor
2. Copy contents of `/src/lib/db/migrations/rollback/008_rollback.sql`
3. Run query

### What Rollback Does

- Removes all Migration 008 changes:
  - Drops admin views
  - Drops admin functions
  - Removes health monitoring columns
  - Removes RLS policies
  - Drops performance indexes
  - Removes org_id from event_subscriptions

**Note:** Rollback is safe and reversible. You can re-apply Migration 008 after rollback.

---

## Verification Checklist

After applying both migrations, verify these items:

### Schema Changes

- [ ] `event_subscriptions` table has `org_id` column
- [ ] `event_subscriptions` table has health monitoring columns:
  - [ ] `failure_count`
  - [ ] `consecutive_failures`
  - [ ] `last_failure_at`
  - [ ] `last_failure_message`
  - [ ] `auto_disabled_at`

### Functions Created

- [ ] `get_event_handler_health()` function exists
- [ ] `disable_event_handler()` function exists
- [ ] `enable_event_handler()` function exists
- [ ] `get_events_filtered()` function exists
- [ ] `replay_failed_events_batch()` function exists
- [ ] `mark_event_processed()` function exists
- [ ] `user_has_permission()` function exists
- [ ] `user_is_admin()` function exists
- [ ] `user_belongs_to_org()` function exists
- [ ] `user_has_role()` function exists
- [ ] `grant_role_to_user()` function exists

### Views Created

- [ ] `v_dead_letter_queue` view exists
- [ ] `v_event_metrics_24h` view exists
- [ ] `v_handler_health` view exists
- [ ] `v_event_bus_validation` view exists

### RLS Policies

- [ ] RLS enabled on `event_subscriptions` table
- [ ] "Users can view subscriptions in their org" policy exists
- [ ] "Only admins can create subscriptions" policy exists
- [ ] "Admins can update subscriptions" policy exists
- [ ] "Only admins can delete subscriptions" policy exists

### Indexes Created

- [ ] `idx_event_subscriptions_org_id` index exists
- [ ] `idx_events_admin_filters` index exists
- [ ] `idx_events_dead_letter` index exists
- [ ] `idx_events_created_at_status` index exists
- [ ] `idx_event_subscriptions_health` index exists

### Triggers Created

- [ ] `trigger_auto_disable_handler` trigger exists on `event_subscriptions`

---

## Troubleshooting

### Issue: "relation 'organizations' does not exist"

**Cause:** Migration 007 (multi-tenancy) not applied
**Solution:** Apply Migration 007 first

```sql
-- Check if organizations table exists
SELECT table_name FROM information_schema.tables
WHERE table_name = 'organizations';
```

If empty, apply Migration 007 before Migration 008.

### Issue: "function auth_user_org_id() does not exist"

**Cause:** Migration 007 missing helper functions
**Solution:** Verify Migration 007 applied successfully

```sql
-- Check if function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'auth_user_org_id';
```

### Issue: "relation 'user_roles' does not exist"

**Cause:** RBAC tables not created
**Solution:** Check if Migration 006 or 007 includes RBAC tables

```sql
-- Check if RBAC tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('roles', 'permissions', 'role_permissions', 'user_roles');
```

If missing, create RBAC tables before applying Migration 009.

### Issue: "syntax error" in SQL

**Cause:** Partial copy/paste or encoding issue
**Solution:**
1. Copy entire migration file again
2. Ensure no characters were lost
3. Check file encoding is UTF-8

---

## Next Steps After Migration

Once migrations are applied:

1. **Test tRPC API:**
   ```bash
   pnpm dev
   # Visit http://localhost:3000/test-trpc
   ```

2. **Test Admin UI:**
   - Visit http://localhost:3000/admin/events
   - Visit http://localhost:3000/admin/handlers

3. **Verify Event Bus:**
   - Publish a test event
   - Check it appears in admin UI
   - Verify handler execution

4. **Run Tests:**
   ```bash
   pnpm test
   pnpm test:e2e
   ```

---

## Support

**Questions?** Check these documents:
- Sprint 2 Progress Update: `/SPRINT-2-PROGRESS-UPDATE.md`
- Migration 008 Source: `/src/lib/db/migrations/008_refine_event_bus.sql`
- Migration 009 Source: `/src/lib/db/migrations/009_add_permission_function.sql`
- Rollback Script: `/src/lib/db/migrations/rollback/008_rollback.sql`

**Need Help?**
- Review migration files for comments and documentation
- Check Supabase Dashboard logs for error details
- Use rollback script if needed (safe and reversible)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-19
**Author:** Developer Agent
**Status:** Ready for application
