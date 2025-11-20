# 🚀 Apply Database Migrations - Quick Guide

## What You Need to Do (10 minutes)

You need to apply 2 SQL migration files to your Supabase database via the SQL Editor.

---

## Step 1: Open Supabase SQL Editor

**Click this link** → [Open SQL Editor](https://supabase.com/dashboard/project/gkwhxmvugnjwwwiufmdy/sql/new)

Or manually:
1. Go to: https://supabase.com/dashboard
2. Select project: `gkwhxmvugnjwwwiufmdy`
3. Click "SQL Editor" in sidebar
4. Click "New query"

---

## Step 2: Apply Migration 008 (Event Bus Refinements)

### Copy This SQL:
```bash
cat src/lib/db/migrations/008_refine_event_bus.sql | pbcopy
```

**Or manually:**
1. Open file: `src/lib/db/migrations/008_refine_event_bus.sql`
2. Copy ALL contents (Cmd+A, Cmd+C)

### Paste and Run:
1. Paste into SQL Editor
2. Click "RUN" button (or press Cmd+Enter)
3. Wait for "Success" message

**Expected Result:** Should see "Success. No rows returned"

---

## Step 3: Apply Migration 009 (Permission Functions)

### Copy This SQL:
```bash
cat src/lib/db/migrations/009_add_permission_function.sql | pbcopy
```

**Or manually:**
1. Open file: `src/lib/db/migrations/009_add_permission_function.sql`
2. Copy ALL contents (Cmd+A, Cmd+C)

### Paste and Run:
1. Paste into SQL Editor (clear previous query first)
2. Click "RUN"
3. Wait for "Success" message

---

## Step 4: Verify Migrations Applied

Run this verification SQL in the editor:

```sql
-- Check if org_id added to event_subscriptions
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'event_subscriptions' AND column_name = 'org_id';

-- Check if admin functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_name LIKE 'admin_%' OR routine_name = 'user_has_permission';

-- Check if admin views exist
SELECT table_name
FROM information_schema.views
WHERE table_name LIKE 'admin_%';
```

**Expected Results:**
- Should see `org_id` column
- Should see 5 admin functions
- Should see 4 admin views

---

## ✅ Done!

Once migrations are applied, come back and let me know. I'll then configure Sentry for you.

---

## 🆘 Troubleshooting

### "Permission denied" error
- Make sure you're logged into Supabase dashboard
- Make sure you're in the correct project (`gkwhxmvugnjwwwiufmdy`)

### "Relation already exists" error
- Migration might already be partially applied
- Check verification queries above to see what's missing
- Can skip to next migration if this one is done

### "Syntax error" near XXX
- Make sure you copied the ENTIRE file
- Make sure there are no extra characters at start/end
- Try copying again

---

**Need help?** Let me know what error you're seeing and I'll help debug.
