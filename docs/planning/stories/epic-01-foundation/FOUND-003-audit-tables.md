# FOUND-003: Create Audit Logging Tables

**Story Points:** 3
**Sprint:** Sprint 1 (Week 1-2)
**Priority:** HIGH

---

## User Story

As a **Compliance Officer**,
I want **comprehensive audit trails for all sensitive operations**,
So that **we can track who did what, when, and meet regulatory requirements**.

---

## Acceptance Criteria

- [ ] `audit_logs` table created with proper structure
- [ ] Trigger functions capture INSERT/UPDATE/DELETE on sensitive tables
- [ ] Audit logs immutable (no updates/deletes allowed)
- [ ] Partitioning by month for performance (6-month retention)
- [ ] Query helpers for common audit searches
- [ ] Automated cleanup of logs older than 6 months

---

## Technical Implementation

### Database Schema

Create file: `supabase/migrations/003_create_audit_system.sql`

```sql
-- Audit logs table (partitioned by month)
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  PRIMARY KEY (id, changed_at)
) PARTITION BY RANGE (changed_at);

-- Create partitions for next 6 months
DO $$
DECLARE
  start_date DATE := DATE_TRUNC('month', CURRENT_DATE);
  end_date DATE;
  partition_name TEXT;
BEGIN
  FOR i IN 0..5 LOOP
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'audit_logs_' || TO_CHAR(start_date, 'YYYY_MM');

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_logs
       FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );

    start_date := end_date;
  END LOOP;
END $$;

-- Indexes
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at DESC);

-- Prevent modifications to audit logs
CREATE RULE audit_logs_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  audit_row audit_logs;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    audit_row.old_data = row_to_json(OLD);
    audit_row.new_data = NULL;
    audit_row.record_id = OLD.id;
  ELSIF (TG_OP = 'UPDATE') THEN
    audit_row.old_data = row_to_json(OLD);
    audit_row.new_data = row_to_json(NEW);
    audit_row.record_id = NEW.id;
  ELSIF (TG_OP = 'INSERT') THEN
    audit_row.old_data = NULL;
    audit_row.new_data = row_to_json(NEW);
    audit_row.record_id = NEW.id;
  END IF;

  audit_row.table_name = TG_TABLE_NAME;
  audit_row.operation = TG_OP;
  audit_row.changed_by = current_setting('app.current_user_id', TRUE)::UUID;
  audit_row.changed_at = NOW();

  INSERT INTO audit_logs (
    table_name, operation, record_id,
    old_data, new_data, changed_by, changed_at
  ) VALUES (
    audit_row.table_name, audit_row.operation, audit_row.record_id,
    audit_row.old_data, audit_row.new_data, audit_row.changed_by, audit_row.changed_at
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_user_profiles
AFTER INSERT OR UPDATE OR DELETE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Note: Add more triggers as tables are created
-- CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
-- CREATE TRIGGER audit_jobs AFTER INSERT OR UPDATE OR DELETE ON jobs FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Query helper: Get audit history for a record
CREATE OR REPLACE FUNCTION get_audit_history(
  p_table_name TEXT,
  p_record_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  operation TEXT,
  changed_at TIMESTAMPTZ,
  changed_by_email TEXT,
  old_data JSONB,
  new_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.operation,
    al.changed_at,
    up.email AS changed_by_email,
    al.old_data,
    al.new_data
  FROM audit_logs al
  LEFT JOIN user_profiles up ON al.changed_by = up.id
  WHERE al.table_name = p_table_name
    AND al.record_id = p_record_id
  ORDER BY al.changed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Query helper: Get recent activity by user
CREATE OR REPLACE FUNCTION get_user_activity(
  p_user_id UUID,
  p_since TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_limit INT DEFAULT 100
)
RETURNS TABLE (
  table_name TEXT,
  operation TEXT,
  changed_at TIMESTAMPTZ,
  record_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.table_name,
    al.operation,
    al.changed_at,
    al.record_id
  FROM audit_logs al
  WHERE al.changed_by = p_user_id
    AND al.changed_at >= p_since
  ORDER BY al.changed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automated cleanup job (call monthly via cron)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS VOID AS $$
DECLARE
  cutoff_date DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months');
  partition_name TEXT;
BEGIN
  -- Drop partitions older than 6 months
  FOR partition_name IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'audit_logs_%'
      AND tablename < 'audit_logs_' || TO_CHAR(cutoff_date, 'YYYY_MM')
  LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || partition_name;
  END LOOP;

  -- Create new partition for 6 months from now
  partition_name := 'audit_logs_' || TO_CHAR(CURRENT_DATE + INTERVAL '6 months', 'YYYY_MM');
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_logs
     FOR VALUES FROM (%L) TO (%L)',
    partition_name,
    DATE_TRUNC('month', CURRENT_DATE + INTERVAL '6 months'),
    DATE_TRUNC('month', CURRENT_DATE + INTERVAL '7 months')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### TypeScript Types

Create file: `src/types/audit.ts`

```typescript
export interface AuditLog {
  id: string;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  changed_by: string;
  changed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface AuditHistoryEntry {
  operation: string;
  changed_at: string;
  changed_by_email: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
}
```

### Helper Utilities

Create file: `src/lib/audit.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export async function getAuditHistory(
  tableName: string,
  recordId: string,
  limit: number = 50
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc('get_audit_history', {
      p_table_name: tableName,
      p_record_id: recordId,
      p_limit: limit
    });

  if (error) {
    console.error('Failed to fetch audit history:', error);
    return [];
  }

  return data;
}

export async function getUserActivity(
  userId: string,
  since?: Date,
  limit: number = 100
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc('get_user_activity', {
      p_user_id: userId,
      p_since: since?.toISOString(),
      p_limit: limit
    });

  if (error) {
    console.error('Failed to fetch user activity:', error);
    return [];
  }

  return data;
}

// Middleware: Set current user ID for audit logging
export function setAuditContext(userId: string) {
  const supabase = createClient();

  return supabase.rpc('set_config', {
    setting: 'app.current_user_id',
    value: userId,
    is_local: true
  });
}
```

---

## Dependencies

- **Requires:** FOUND-001 (user_profiles table)
- **Used by:** All future tables that need audit trails

---

## Testing Checklist

- [ ] Audit trigger captures INSERT operations
- [ ] Audit trigger captures UPDATE operations (old and new data)
- [ ] Audit trigger captures DELETE operations
- [ ] Audit logs immutable (UPDATE/DELETE blocked)
- [ ] Partitioning works correctly
- [ ] Query helpers return expected results
- [ ] Cleanup function drops old partitions
- [ ] Performance acceptable with 100K+ audit records

---

## Verification Queries

```sql
-- Test: Create and modify a user, check audit
INSERT INTO user_profiles (email, full_name)
VALUES ('audit-test@example.com', 'Audit Test');

UPDATE user_profiles
SET full_name = 'Audit Test Updated'
WHERE email = 'audit-test@example.com';

-- Check audit logs created
SELECT * FROM audit_logs
WHERE table_name = 'user_profiles'
  AND record_id = (SELECT id FROM user_profiles WHERE email = 'audit-test@example.com')
ORDER BY changed_at DESC;
-- Expected: 2 rows (INSERT and UPDATE)

-- Test: Get audit history
SELECT * FROM get_audit_history(
  'user_profiles',
  (SELECT id FROM user_profiles WHERE email = 'audit-test@example.com')
);

-- Test: Attempt to modify audit log (should fail)
UPDATE audit_logs SET operation = 'MODIFIED';
-- Expected: No rows updated (rule blocks modification)

-- Test: Check partitions exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'audit_logs_%'
ORDER BY tablename;
-- Expected: 6 partitions (current month + 5 future)
```

---

## Documentation Updates

- [ ] Document audit log structure in `/docs/architecture/AUDIT-SYSTEM.md`
- [ ] Add compliance section explaining 6-month retention
- [ ] Document how to add audit triggers to new tables

---

## Related Stories

- **Depends on:** FOUND-001 (database schema)
- **Used by:** All future epics (audit trails required)

---

## Notes

- Partitioning by month keeps query performance high
- 6-month retention balances compliance with storage costs
- Immutability enforced via database rules (not just application logic)
- `changed_by` populated via session variable (set in middleware)

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
