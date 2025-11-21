# Database Workflow - SINGLE SOURCE OF TRUTH

**Date:** 2025-11-20
**Status:** ✅ OPERATIONAL
**Owner:** Database Architect Agent

---

## 🚨 THE PROBLEM WE FIXED

### Before (Chaos)
- ❌ 20 different migration scripts
- ❌ Manual commands that sometimes work, sometimes fail
- ❌ 3-4 back-and-forth cycles to fix issues
- ❌ Context loss on every retry
- ❌ No clear process

### After (Reliability)
- ✅ ONE migration script (`db-migrate.ts`)
- ✅ Automated, consistent process
- ✅ Tests locally before production
- ✅ Clear error messages
- ✅ No context loss

---

## 🎯 THE SOLUTION

### Single Command System

```bash
# THIS IS THE ONLY WAY TO RUN MIGRATIONS
pnpm db:migrate:local    # Test locally first (RECOMMENDED)
pnpm db:migrate          # Run on production
pnpm db:status           # Check migration status
pnpm db:rollback         # Rollback guidance
```

### Never Do This Again
```bash
# ❌ DON'T create custom migration scripts
# ❌ DON'T run psql commands manually
# ❌ DON'T use different supabase commands
# ❌ DON'T skip local testing
```

---

## 📋 WORKFLOW STEPS

### Step 1: Create Migration File

```bash
# Create new migration with timestamp
cd supabase/migrations
touch $(date +%Y%m%d%H%M%S)_your_feature_name.sql
```

**Example:** `20251120170000_add_user_preferences.sql`

### Step 2: Write Migration SQL

```sql
-- 20251120170000_add_user_preferences.sql

-- Add new table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Add comments
COMMENT ON TABLE user_preferences IS 'User-specific application preferences';
```

**Required Elements:**
- ✅ `IF NOT EXISTS` for idempotency
- ✅ RLS policies (security first!)
- ✅ Indexes on foreign keys
- ✅ Timestamps (created_at, updated_at)
- ✅ Proper cascades on foreign keys
- ✅ Comments for documentation

### Step 3: Test Locally FIRST

```bash
# ALWAYS test locally before production
pnpm db:migrate:local
```

**What this does:**
1. ✅ Starts local Supabase (Docker)
2. ✅ Runs migration on local database
3. ✅ Catches errors before production
4. ✅ Stops local Supabase when done

**If it fails:**
- Fix the SQL in the migration file
- Run `pnpm db:migrate:local` again
- Repeat until it works

### Step 4: Deploy to Production

```bash
# Only after local testing passes
pnpm db:migrate
```

**What this does:**
1. ✅ Connects to production database
2. ✅ Runs pending migrations
3. ✅ Shows what was applied
4. ✅ Reports success or failure

---

## 🔧 COMMON SCENARIOS

### Scenario 1: Adding New Table

```sql
-- Always use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS my_new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Always add RLS
ALTER TABLE my_new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation"
  ON my_new_table
  FOR ALL
  USING (org_id = auth.jwt() ->> 'org_id'::UUID);

-- Always add indexes
CREATE INDEX idx_my_new_table_org_id ON my_new_table(org_id);
```

### Scenario 2: Adding Column to Existing Table

```sql
-- Use IF NOT EXISTS for column (Postgres 9.6+)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_number TEXT;
  END IF;
END $$;

-- Add constraint if needed
ALTER TABLE users ADD CONSTRAINT phone_number_format
  CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$');
```

### Scenario 3: Modifying Existing Data

```sql
-- Use transaction for data migrations
BEGIN;

-- Update existing data
UPDATE users
SET email_verified = true
WHERE email_verified IS NULL;

-- Make column non-null after update
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

COMMIT;
```

### Scenario 4: Migration Failed - Rollback

```sql
-- Create rollback migration
-- File: 20251120180000_rollback_user_preferences.sql

-- Drop policies first
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Drop table
DROP TABLE IF EXISTS user_preferences;
```

**Then run:**
```bash
pnpm db:migrate  # Applies the rollback
```

---

## ⚠️ COMMON MISTAKES & FIXES

### Mistake 1: Forgetting IF NOT EXISTS

**Problem:**
```sql
CREATE TABLE users (...);  -- ❌ Fails if table exists
```

**Fix:**
```sql
CREATE TABLE IF NOT EXISTS users (...);  -- ✅ Idempotent
```

### Mistake 2: No RLS Policies

**Problem:**
```sql
CREATE TABLE sensitive_data (...);  -- ❌ No security!
```

**Fix:**
```sql
CREATE TABLE sensitive_data (...);
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;  -- ✅ Secure

CREATE POLICY "org_isolation" ON sensitive_data
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id'::UUID);
```

### Mistake 3: Missing Indexes

**Problem:**
```sql
CREATE TABLE orders (
  customer_id UUID REFERENCES customers(id)  -- ❌ Slow queries!
);
```

**Fix:**
```sql
CREATE TABLE orders (
  customer_id UUID REFERENCES customers(id)
);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);  -- ✅ Fast!
```

### Mistake 4: Non-Idempotent Migrations

**Problem:**
```sql
ALTER TABLE users ADD COLUMN status TEXT;  -- ❌ Fails if run twice
```

**Fix:**
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'status'
  ) THEN
    ALTER TABLE users ADD COLUMN status TEXT;
  END IF;
END $$;  -- ✅ Safe to run multiple times
```

---

## 🚀 WHO HANDLES WHAT

### Database Architect Agent

**Responsibilities:**
- ✅ Design database schema
- ✅ Write migration SQL
- ✅ Add RLS policies
- ✅ Create indexes
- ✅ Test locally first
- ✅ Deploy to production

**Triggers When:**
- `/workflows:database [feature-name]`
- New data requirements identified
- Schema changes needed

**Deliverables:**
- Migration file in `supabase/migrations/`
- RLS policies for security
- Indexes for performance
- Documentation in code comments

### Developer Agent

**Responsibilities:**
- ✅ Use existing schema
- ✅ Write queries via Drizzle ORM
- ❌ Does NOT modify schema directly

### You (Human)

**Responsibilities:**
- ✅ Review migration before production
- ✅ Approve deployment
- ❌ Does NOT write raw SQL manually
- ❌ Does NOT run migrations directly

---

## 📊 MIGRATION CHECKLIST

Before running `pnpm db:migrate`, verify:

- [ ] Migration file has timestamp format: `YYYYMMDDHHMMSS_name.sql`
- [ ] SQL uses `IF NOT EXISTS` / `IF EXISTS` for idempotency
- [ ] All tables have RLS enabled
- [ ] All tables have appropriate RLS policies
- [ ] Foreign keys have indexes
- [ ] Frequently queried fields have indexes
- [ ] Timestamps (created_at, updated_at) added
- [ ] Proper ON DELETE/UPDATE cascades
- [ ] Comments added for documentation
- [ ] Tested locally with `pnpm db:migrate:local`
- [ ] Migration passed local testing
- [ ] No hardcoded values (use variables)
- [ ] No destructive operations without backup plan

---

## 🔍 TROUBLESHOOTING

### Error: "Supabase CLI not installed"

```bash
brew install supabase/tap/supabase
```

### Error: "SUPABASE_DB_URL not set"

```bash
# Add to .env.local
SUPABASE_DB_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Error: "Migration failed on local database"

1. Read the error message carefully
2. Fix the SQL in your migration file
3. Run `pnpm db:migrate:local` again
4. Repeat until it works
5. **DO NOT** deploy to production until local works

### Error: "Column already exists"

Your migration is not idempotent. Use this pattern:

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT...) THEN
    ALTER TABLE ... ADD COLUMN ...
  END IF;
END $$;
```

### Error: "RLS policy already exists"

```sql
-- Drop existing policy first
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Then create
CREATE POLICY "policy_name" ON table_name ...
```

---

## 📚 BEST PRACTICES

### 1. Always Test Locally First

```bash
# GOOD
pnpm db:migrate:local  # Test
pnpm db:migrate        # Deploy

# BAD
pnpm db:migrate        # YOLO to production ❌
```

### 2. One Migration = One Logical Change

**Good:**
- `20251120170000_add_user_preferences.sql` (adds one feature)
- `20251120180000_add_user_notifications.sql` (adds another feature)

**Bad:**
- `20251120170000_add_everything.sql` (too many changes)

### 3. Migrations Are Immutable

**Once a migration runs on production, NEVER modify it.**

**Good:**
- Create new migration to fix/change
- Keep history intact

**Bad:**
- Edit existing migration
- Delete migration files

### 4. Document Complex Migrations

```sql
-- This migration adds user preference tracking
-- to enable personalized UI themes and language settings.
--
-- Related to: Story ACAD-015, Epic 02
-- Author: Database Architect
-- Date: 2025-11-20

CREATE TABLE user_preferences (...);
```

### 5. Use Transactions for Data Migrations

```sql
BEGIN;

-- Multiple related changes
UPDATE ...
INSERT ...
ALTER ...

COMMIT;  -- All or nothing
```

---

## 🎯 QUICK REFERENCE

### Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `pnpm db:migrate:local` | Test locally | **ALWAYS FIRST** |
| `pnpm db:migrate` | Deploy to prod | After local passes |
| `pnpm db:status` | Check status | See what's pending |
| `pnpm db:rollback` | Get rollback help | When migration fails |

### File Location

```
supabase/
└── migrations/
    ├── 20251119184000_add_multi_tenancy.sql          ✅ Applied
    ├── 20251119190000_update_event_bus.sql           ✅ Applied
    └── 20251120170000_your_new_migration.sql         ⏳ Pending
```

### SQL Patterns

```sql
-- Table creation (idempotent)
CREATE TABLE IF NOT EXISTS ...

-- Column addition (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (...) THEN
    ALTER TABLE ... ADD COLUMN ...
  END IF;
END $$;

-- RLS (required)
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON ... FOR ALL USING (...);

-- Indexes (performance)
CREATE INDEX IF NOT EXISTS idx_... ON ...(...);

-- Comments (documentation)
COMMENT ON TABLE ... IS '...';
```

---

## 🎊 SUCCESS CRITERIA

### You Know It's Working When

✅ Migrations run without manual intervention
✅ Local testing catches errors before production
✅ No more back-and-forth to fix failures
✅ No context loss between attempts
✅ Clear error messages when something fails
✅ One reliable command works every time

### Red Flags

❌ Creating new migration scripts
❌ Running psql commands manually
❌ Skipping local testing
❌ Getting different results each time
❌ Asking how to run migrations

---

## 📞 SUMMARY

**OLD WAY (Broken):**
```
1. Write SQL
2. Try random script #1 ❌ Fails
3. Try random script #2 ❌ Fails
4. Ask for help, lose context
5. Try random script #3 ❌ Fails
6. Give up or succeed by luck
```

**NEW WAY (Reliable):**
```
1. Write SQL in supabase/migrations/
2. Run: pnpm db:migrate:local
3. Fix any errors, repeat step 2 until it works
4. Run: pnpm db:migrate
5. Done! ✅
```

**Key Principle:** ONE command, tested locally first, deployed confidently.

---

**Database Workflow Documentation Complete**
**Date:** 2025-11-20
**Status:** ✅ OPERATIONAL
**Next:** Start using `pnpm db:migrate:local` for all migrations

---

**Questions? Run:**
```bash
pnpm db:status  # See what's pending
```

**Need help? Check:**
- This document (DATABASE-WORKFLOW.md)
- Migration files (supabase/migrations/)
- Error messages (they're clear now!)
