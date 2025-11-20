# 🚀 Run Migrations - ZERO Manual Steps

I've created **3 automated solutions**. Pick whichever you prefer.

---

## ⚡ Quickest: HTML File (30 seconds)

**No terminal. No commands. Just click a button.**

### Steps:
1. **Double-click** `MIGRATION-RUNNER.html` (in project root)
2. Enter your **Service Role Key** from `.env.local`
3. Click **"Run Migrations"** button
4. Watch the logs
5. Done!

**Pros:**
- ✅ Simplest option
- ✅ Visual interface
- ✅ Real-time logs
- ✅ Works in any browser

**One-time setup (30 seconds):**
- Open Supabase Dashboard → SQL Editor
- Copy/paste this (8 lines):
  ```sql
  CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
  RETURNS jsonb AS $$
  BEGIN
    EXECUTE sql;
    RETURN jsonb_build_object('success', true);
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;
  ```
- Click "Run"
- Now HTML file will work forever

---

## 🖥️ Option 2: Node.js Script

**If you prefer terminal commands.**

### Steps:
```bash
pnpm tsx scripts/run-migrations-automated.ts
```

**Pros:**
- ✅ Fixes SQL errors automatically
- ✅ Handles idempotency (safe to re-run)
- ✅ Detailed logging
- ✅ Verifies database after completion

**Same one-time setup as HTML option above**

---

## 🌐 Option 3: Web UI (Your Dev Server)

**Already built into your app!**

### Steps:
1. Make sure dev server is running: `pnpm dev`
2. Visit: **http://localhost:3000/setup/migrate**
3. Click **"Run Migrations"**
4. Done!

**Pros:**
- ✅ Part of your application
- ✅ No separate files needed
- ✅ Beautiful UI
- ✅ Retry capability

**Same one-time setup as above**

---

## 📋 The One-Time Setup (Explained)

**Why needed:**
Supabase doesn't allow arbitrary SQL execution via HTTP API for security. We need to create a helper function ONCE that lets our automated tools run SQL.

**Where to run it:**
Supabase Dashboard → SQL Editor → Paste → Run

**The SQL:**
```sql
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS jsonb AS $$
BEGIN
  EXECUTE sql;
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;
```

**How long:** 30 seconds total

**How many times:** Once per project (never again)

---

## 🎯 What Gets Done

All 3 options do the same thing:

1. ✅ Execute 7 migration files:
   - Timeline tables
   - User profiles
   - RBAC system
   - Audit tables
   - Event bus
   - RLS policies
   - Multi-tenancy

2. ✅ Seed 8 system roles:
   - super_admin
   - admin
   - recruiter
   - trainer
   - student
   - candidate
   - employee
   - client

3. ✅ Verify database state
4. ✅ Show detailed logs

---

## ❓ Which Option Should I Use?

**Recommended: HTML File** (`MIGRATION-RUNNER.html`)
- Easiest
- No dependencies
- Works immediately
- Visual feedback

**If you love terminal:** Node.js script

**If you want it in your app:** Web UI at /setup/migrate

---

## 🆘 Troubleshooting

### "exec_sql function does not exist"
→ You haven't run the one-time setup SQL yet
→ Go to Supabase Dashboard → SQL Editor → Run the 8-line SQL above

### "Permission denied"
→ Check your Service Role Key in `.env.local`
→ Make sure you're using SERVICE_ROLE key, not ANON key

### "Migration failed"
→ Check the logs for specific error
→ Safe to re-run (all migrations are idempotent)
→ If stuck, show me the error

---

## ✅ After Migration Complete

Test your auth flow:

1. **Signup:** http://localhost:3000/signup
2. **Login:** http://localhost:3000/login
3. **Dashboard:** http://localhost:3000/dashboard

---

## 🎓 For Future Migrations

Once the one-time setup is done, you can:
- Add new migration files to `src/lib/db/migrations/`
- Run any of the 3 options again
- Migrations are safe to re-run (idempotent)
- Bootstrap function never needs to be recreated

---

**Questions?** Show me the error logs and I'll fix it immediately.
