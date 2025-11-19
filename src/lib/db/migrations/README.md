# Database Migrations - InTime v3

Complete SQL migrations for the unified database architecture.

---

## Migration Files

### Forward Migrations

| Migration | Description | Tables Created | Lines of Code |
|-----------|-------------|----------------|---------------|
| `001_create_timeline_tables.sql` | Project timeline logging | `project_timeline`, `session_metadata` | 320 |
| `002_create_user_profiles.sql` | Unified user table | `user_profiles` | 450 |
| `003_create_rbac_system.sql` | Role-based access control | `roles`, `permissions`, `role_permissions`, `user_roles` | 600 |
| `004_create_audit_tables.sql` | Audit logging with partitioning | `audit_logs`, `audit_log_retention_policy` | 500 |
| `005_create_event_bus.sql` | Event-driven architecture | `events`, `event_subscriptions`, `event_delivery_log` | 550 |
| `006_rls_policies.sql` | Row Level Security policies | N/A (policies only) | 400 |

**Total:** 2,820 lines of production-ready SQL

### Rollback Migrations

Located in `rollback/` directory:
- `002_create_user_profiles_rollback.sql`
- `003_create_rbac_system_rollback.sql`
- `004_create_audit_tables_rollback.sql`
- `005_create_event_bus_rollback.sql`
- `006_rls_policies_rollback.sql`

---

## Running Migrations

### Option 1: Supabase CLI (Recommended)

**Prerequisites:**
```bash
npm install -g supabase
supabase login
```

**Apply all migrations:**
```bash
# Development
supabase db reset  # Fresh start (drops all tables)
supabase migration up  # Apply all migrations

# Production
supabase db push --include-all
```

**Apply single migration:**
```bash
supabase migration up --version 002
```

**Rollback:**
```bash
# Run rollback SQL manually
psql $DATABASE_URL < rollback/006_rls_policies_rollback.sql
```

### Option 2: Direct PostgreSQL

**Apply migration:**
```bash
psql $DATABASE_URL < 002_create_user_profiles.sql
```

**Check migration status:**
```bash
psql $DATABASE_URL -c "SELECT * FROM _supabase_migrations ORDER BY version;"
```

### Option 3: Drizzle Kit (Future)

**Generate migrations from schema:**
```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations
```

---

## Migration Order

**Critical:** Migrations must be applied in order due to dependencies.

```
001_create_timeline_tables.sql
    ↓
002_create_user_profiles.sql
    ↓
003_create_rbac_system.sql (depends on user_profiles)
    ↓
004_create_audit_tables.sql (depends on user_profiles, RBAC)
    ↓
005_create_event_bus.sql (depends on user_profiles)
    ↓
006_rls_policies.sql (depends on all tables)
```

---

## Validation Queries

### After Migration 002 (user_profiles)

```sql
-- Check table exists
SELECT COUNT(*) FROM user_profiles;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'user_profiles';

-- Check triggers
SELECT tgname FROM pg_trigger WHERE tgrelid = 'user_profiles'::regclass;
```

### After Migration 003 (RBAC)

```sql
-- Check system roles created
SELECT name, display_name FROM roles WHERE is_system_role = TRUE;

-- Check permissions count
SELECT COUNT(*) FROM permissions;

-- Check role-permission mappings
SELECT r.name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name;
```

### After Migration 004 (Audit)

```sql
-- Check partitions created
SELECT tablename FROM pg_tables
WHERE tablename LIKE 'audit_logs_%'
ORDER BY tablename;

-- Check retention policies
SELECT * FROM audit_log_retention_policy;
```

### After Migration 005 (Events)

```sql
-- Check event tables
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM event_subscriptions;

-- Check event functions
SELECT proname FROM pg_proc
WHERE proname LIKE '%event%'
ORDER BY proname;
```

### After Migration 006 (RLS)

```sql
-- Check RLS enabled on all tables
SELECT * FROM v_rls_status;

-- Count RLS policies
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';

-- List all policies
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Common Issues & Solutions

### Issue: Migration fails with "relation already exists"

**Solution:**
```sql
-- Check if table exists
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Drop table if needed (development only!)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Re-run migration
```

### Issue: Permission denied on table

**Solution:**
```sql
-- Grant permissions to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
```

### Issue: RLS blocking all queries

**Solution:**
```sql
-- Temporarily disable RLS for debugging
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### Issue: Partition not created for current month

**Solution:**
```sql
-- Manually create partition
SELECT create_audit_log_partition(CURRENT_DATE);
```

---

## Performance Benchmarks

### Expected Query Times (after indexes)

| Query Type | Expected Time | Notes |
|------------|---------------|-------|
| Email lookup | <10ms | Indexed |
| Candidate search by status | <20ms | Partial index |
| Skill search (array) | <50ms | GIN index |
| Full-text search | <100ms | GIN index |
| Audit log query (recent) | <50ms | Partitioning benefit |
| Audit log query (old) | <200ms | Partition pruning |

### Index Sizes (estimated for 10K users)

| Table | Estimated Size | Index Size | Notes |
|-------|----------------|------------|-------|
| user_profiles | 5 MB | 2 MB | 10K rows |
| roles | <1 KB | <1 KB | 10 rows |
| permissions | <10 KB | <5 KB | 40 rows |
| audit_logs (1 month) | 10 MB | 5 MB | ~50K events |

---

## Monitoring & Maintenance

### Weekly Tasks

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries (if pg_stat_statements enabled)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Monthly Tasks

```sql
-- Create next audit partition
SELECT auto_create_next_audit_partition();

-- Clean up old partitions
SELECT * FROM cleanup_old_audit_partitions();

-- Vacuum analyze (performance)
VACUUM ANALYZE user_profiles;
VACUUM ANALYZE audit_logs;
```

### Quarterly Tasks

```sql
-- Reindex for performance
REINDEX TABLE user_profiles;
REINDEX TABLE audit_logs;

-- Update table statistics
ANALYZE user_profiles;
ANALYZE audit_logs;
```

---

## Security Checklist

Before deploying to production:

- [ ] All tables have RLS enabled (`v_rls_status`)
- [ ] All tables have appropriate policies (`v_rls_policies`)
- [ ] Service role has BYPASS RLS for backend operations
- [ ] Audit logs are immutable (UPDATE/DELETE blocked)
- [ ] Sensitive fields have appropriate RLS restrictions
- [ ] Test with non-admin user accounts
- [ ] Verify admin users can access all data
- [ ] Verify regular users can only access their own data

---

## Backup Strategy

### Before Migrations (Production)

```bash
# Full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only
pg_dump --schema-only $DATABASE_URL > schema_backup.sql
```

### Restore from Backup

```bash
# Restore full database
psql $DATABASE_URL < backup_20251118_120000.sql

# Restore schema only
psql $DATABASE_URL < schema_backup.sql
```

---

## Contact & Support

- **Database Architect:** Database Architect Agent
- **Documentation:** `/docs/architecture/DATABASE-ARCHITECTURE.md`
- **Schema Files:** `/src/lib/db/schema/`
- **Migration History:** Track in `_supabase_migrations` table

---

**Last Updated:** 2025-11-18
**Migration Version:** 006
**Status:** ✅ Production-Ready
