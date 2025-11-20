# 🤖 FULLY AUTOMATED Migration Guide

**NO MANUAL SQL EXECUTION** - Everything runs through your browser!

---

## 🎯 Solution Overview

Instead of copy/pasting SQL, I've created:
1. **Web UI** at `/setup/migrate` - Click a button to run migrations
2. **API Endpoint** at `/api/migrate` - Executes SQL via HTTP
3. **Bootstrap Script** - One-time setup (minimal)

**Advantage:**
- ✅ No DNS/network issues (uses HTTP)
- ✅ No manual copy/paste
- ✅ Full logging and error handling
- ✅ Can retry failed migrations
- ✅ Tracks migration status

---

## 🚀 Quick Start (3 Steps)

### Step 1: Bootstrap (ONE TIME - 30 seconds)

Run this **once** in Supabase Dashboard SQL Editor:

1. Open: https://supabase.com/dashboard → SQL Editor
2. Copy/paste contents of `BOOTSTRAP.sql`
3. Click "Run"

**What it does:** Creates RPC functions so we can execute SQL via HTTP API.

**File content:**
```sql
CREATE OR REPLACE FUNCTION exec_migration(migration_sql TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE migration_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 2: Start Dev Server

```bash
pnpm dev
```

### Step 3: Run Automated Migration

1. Open: **http://localhost:3000/setup/migrate**
2. Click **"🚀 Run Migrations"** button
3. Watch the logs as migrations execute
4. Done! ✅

---

## 📱 Web UI Features

### Check Status
- Click "🔍 Check Status" to see which tables exist
- Shows row counts for each table
- No changes made to database

### Run Migrations
- Click "🚀 Run Migrations" to execute all SQL files
- Real-time logging in browser
- Continues even if one migration fails
- Shows success/failure for each file

### Visual Feedback
- ✅ Green = Success
- ❌ Red = Failed (with error details)
- ⏳ Yellow = In progress
- Live log stream

---

## 🔧 How It Works

### Architecture

```
Browser
  ↓
/setup/migrate page (React)
  ↓
POST /api/migrate (Next.js API Route)
  ↓
Supabase Client (HTTP)
  ↓
exec_migration() RPC function
  ↓
PostgreSQL executes SQL
```

**No direct database connection needed!** Everything goes through Supabase's HTTP API.

### Migration Flow

1. API reads migration files from `src/lib/db/migrations/`
2. For each file:
   - Removes sample data (to avoid conflicts)
   - Calls `exec_migration(sql)` via RPC
   - Logs success/failure
3. Seeds system roles
4. Returns results to browser

---

## 🎭 Alternative: If Bootstrap Fails

If you can't/won't run BOOTSTRAP.sql, there's a fallback:

### Option A: Use Supabase CLI

```bash
# One-time setup
npm install -g supabase
supabase login
supabase link --project-ref gkwhxmvugnjwwwiufmdy

# Run migrations
supabase db push
```

### Option B: Manual (Last Resort)

Copy/paste `ALL-MIGRATIONS.sql` in Supabase Dashboard.

---

## 🐛 Troubleshooting

### Error: "exec_migration does not exist"

**Cause:** Bootstrap script not run

**Fix:** Run `BOOTSTRAP.sql` in Supabase Dashboard

### Error: "permission denied"

**Cause:** Service role key missing or invalid

**Fix:** Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`

### Error: "relation already exists"

**Cause:** Migrations already applied (this is OK!)

**Result:** Migration marked as failed but no actual problem

**Fix:** Check "Results" - if tables exist, you're good!

### Web UI Won't Load

**Cause:** Dev server not running

**Fix:**
```bash
pnpm dev
```

Then visit http://localhost:3000/setup/migrate

---

## 📊 What Gets Migrated

### 7 Migration Files
1. `001_create_timeline_tables.sql` - Timeline logging
2. `002_create_user_profiles.sql` - User management
3. `003_create_rbac_system.sql` - Roles & permissions
4. `004_create_audit_tables.sql` - Audit logging
5. `005_create_event_bus.sql` - Event system
6. `006_rls_policies.sql` - Security policies
7. `007_add_multi_tenancy.sql` - Organizations

### Plus: Role Seeding
- 8 system roles automatically inserted
- Uses `ON CONFLICT DO NOTHING` (safe to re-run)

---

## ✅ Verification

After migration completes:

1. Check the web UI - should show all tables with row counts
2. Roles table should have 8 rows
3. Test signup: http://localhost:3000/signup
4. Create test account and verify it works

---

## 🔄 Re-running Migrations

**Safe to re-run!** All migrations use:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `INSERT ... ON CONFLICT DO NOTHING`

So running multiple times won't break anything.

---

## 🎓 For Cursor AI

If you want Cursor to run this:

```
@cursor please run the automated migration:
1. Make sure dev server is running (pnpm dev)
2. Open http://localhost:3000/setup/migrate in browser
3. Click "Run Migrations" button
4. Report the results back to me
```

Or if Cursor can execute API calls directly:

```
@cursor please:
1. POST to http://localhost:3000/api/migrate with body: {"action": "run"}
2. Wait for response
3. Show me the results
```

---

## 📝 Files Created

```
✅ src/app/api/migrate/route.ts         # API endpoint
✅ src/app/setup/migrate/page.tsx       # Web UI
✅ BOOTSTRAP.sql                         # One-time setup
✅ AUTOMATED-MIGRATION-GUIDE.md         # This file
```

---

## 🎯 Summary

**Old way (manual):**
1. Copy ALL-MIGRATIONS.sql
2. Open Supabase Dashboard
3. Paste in SQL Editor
4. Click Run
5. Hope it works

**New way (automated):**
1. Run BOOTSTRAP.sql once (30 sec)
2. Visit /setup/migrate
3. Click button
4. Done!

**Even better:**
- Real-time logs
- Error handling
- Can retry
- No copy/paste errors
- Trackable history

---

## 🚀 Next Steps After Migration

1. ✅ Migrations complete
2. Test signup: `/signup`
3. Test login: `/login`
4. Verify dashboard: `/dashboard`
5. Begin Sprint 2 development!

---

**Questions?** Check the web UI at `/setup/migrate` - it has built-in instructions and troubleshooting!
