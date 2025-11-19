# Scripts Directory

Helper scripts for database management and development.

---

## 🚀 Quick Start

### Apply All Migrations

**Recommended:** Use Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Copy/paste contents of `../ALL-MIGRATIONS.sql`
4. Click "Run"

See `../MIGRATION-INSTRUCTIONS.md` for detailed instructions.

---

## 📋 Available Scripts

### Database Status

Check which tables exist and their row counts:

```bash
pnpm exec tsx scripts/check-database-status.ts
```

### Consolidate Migrations

Regenerate `ALL-MIGRATIONS.sql` from individual migration files:

```bash
bash scripts/consolidate-migrations.sh
```

### Auto-Migration (Experimental)

**Note:** Currently fails due to DNS/network issues.

Attempts to automatically execute migrations using `pg` library:

```bash
pnpm exec tsx scripts/apply-migrations-auto.ts
```

**Known issue:** Cannot resolve `db.gkwhxmvugnjwwwiufmdy.supabase.co`

**Workaround:** Use Supabase Dashboard instead.

---

## ⚠️ Network Issues

### Why Direct Database Connection Fails

```
Error: getaddrinfo ENOTFOUND db.gkwhxmvugnjwwwiufmdy.supabase.co
```

**Causes:**
- Firewall blocking PostgreSQL port (5432)
- VPN/corporate network restrictions
- DNS configuration issues

**Solution:**
- Use Supabase Dashboard SQL Editor (uses HTTPS)
- Fix network configuration
- Use Supabase CLI (may work if HTTPS is allowed)

---

## 🔧 Supabase CLI Alternative

If you have Supabase CLI installed:

```bash
# Install
npm install -g supabase

# Link project
supabase link --project-ref gkwhxmvugnjwwwiufmdy

# Apply migrations
supabase db push
```

---

## 📦 Seed Data

### Seed Roles

Included in `ALL-MIGRATIONS.sql` automatically.

Manual execution (if needed):

```sql
-- Copy and run in Supabase SQL Editor
INSERT INTO roles (name, display_name, description, is_system_role, hierarchy_level, color_code)
VALUES
  ('super_admin', 'Super Administrator', 'Full system access with all permissions', TRUE, 0, '#dc2626'),
  ('admin', 'Administrator', 'Administrative access to manage users and settings', TRUE, 1, '#ea580c'),
  ('recruiter', 'Recruiter', 'Manages candidates, placements, and client relationships', TRUE, 2, '#0891b2'),
  ('trainer', 'Trainer', 'Manages training courses and student progress', TRUE, 2, '#7c3aed'),
  ('student', 'Student', 'Enrolled in training academy courses', TRUE, 3, '#2563eb'),
  ('candidate', 'Candidate', 'Job seeker available for placement', TRUE, 3, '#16a34a'),
  ('employee', 'Employee', 'Internal team member', TRUE, 3, '#4f46e5'),
  ('client', 'Client', 'Hiring company representative', TRUE, 3, '#9333ea')
ON CONFLICT (name) DO NOTHING;
```

---

## 📝 File Reference

| Script | Purpose | Status |
|--------|---------|--------|
| `check-database-status.ts` | Verify tables exist | ✅ Working |
| `consolidate-migrations.sh` | Generate ALL-MIGRATIONS.sql | ✅ Working |
| `apply-migrations-auto.ts` | Auto-run migrations | ❌ DNS issues |
| `seed-roles.ts` | Seed roles via Supabase client | ❌ RLS blocks access |
| `seed-roles-pg.ts` | Seed roles via pg | ❌ DNS issues |
| `seed-roles-sql.sql` | SQL seed file | ✅ Manual use |

---

**Recommended:** Use Supabase Dashboard for all SQL operations until network issues are resolved.
