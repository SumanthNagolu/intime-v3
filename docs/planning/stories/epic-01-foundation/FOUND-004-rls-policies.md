# FOUND-004: Implement Row Level Security (RLS) Policies

**Story Points:** 8
**Sprint:** Sprint 1 (Week 1-2)
**Priority:** CRITICAL

---

## User Story

As a **Security Architect**,
I want **Row Level Security policies on all tables**,
So that **users can only access data they're authorized to see, enforced at the database level**.

---

## Acceptance Criteria

- [ ] RLS enabled on all tables (user_profiles, roles, permissions, user_roles, audit_logs)
- [ ] Policies created for each role type (admin, student, employee, candidate, client)
- [ ] Users can only read their own data unless they have elevated permissions
- [ ] Admin role bypasses restrictions (full access)
- [ ] Service role key properly configured for backend operations
- [ ] All policies tested with different user roles
- [ ] Performance impact measured (should be < 10ms per query)

---

## Technical Implementation

### Database Policies

Create file: `supabase/migrations/004_create_rls_policies.sql`

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get current user's roles
CREATE OR REPLACE FUNCTION auth.user_roles()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT r.name
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN 'admin' = ANY(auth.user_roles());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USER_PROFILES POLICIES
-- =====================================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (
  auth.uid() = id
  OR auth.is_admin()
  OR 'employee' = ANY(auth.user_roles()) -- Employees can see all profiles
);

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND (
    -- Can't change critical fields
    (OLD.email = NEW.email)
    AND (OLD.created_at = NEW.created_at)
  )
);

-- Policy: Admins can do anything
CREATE POLICY "Admins full access to profiles"
ON user_profiles FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

-- Policy: Employees can create new profiles (onboarding)
CREATE POLICY "Employees can create profiles"
ON user_profiles FOR INSERT
WITH CHECK ('employee' = ANY(auth.user_roles()));

-- Policy: Soft deletes only by admin
CREATE POLICY "Only admins can soft delete"
ON user_profiles FOR UPDATE
USING (auth.is_admin())
WITH CHECK (
  auth.is_admin()
  AND NEW.deleted_at IS NOT NULL
);

-- =====================================================
-- ROLES & PERMISSIONS POLICIES (Read-only for most users)
-- =====================================================

-- Policy: Everyone can read roles
CREATE POLICY "Anyone can read roles"
ON roles FOR SELECT
USING (true);

-- Policy: Only admins can modify roles
CREATE POLICY "Only admins modify roles"
ON roles FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

-- Policy: Everyone can read permissions
CREATE POLICY "Anyone can read permissions"
ON permissions FOR SELECT
USING (true);

-- Policy: Only admins can modify permissions
CREATE POLICY "Only admins modify permissions"
ON permissions FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

-- Policy: Users can read role_permissions
CREATE POLICY "Anyone can read role permissions"
ON role_permissions FOR SELECT
USING (true);

-- Policy: Only admins modify role_permissions
CREATE POLICY "Only admins modify role permissions"
ON role_permissions FOR ALL
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

-- =====================================================
-- USER_ROLES POLICIES
-- =====================================================

-- Policy: Users can see their own roles
CREATE POLICY "Users can see own roles"
ON user_roles FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.is_admin()
  OR 'employee' = ANY(auth.user_roles())
);

-- Policy: Only admins can assign roles
CREATE POLICY "Only admins assign roles"
ON user_roles FOR INSERT
WITH CHECK (auth.is_admin());

-- Policy: Only admins can revoke roles
CREATE POLICY "Only admins revoke roles"
ON user_roles FOR DELETE
USING (auth.is_admin());

-- =====================================================
-- AUDIT_LOGS POLICIES
-- =====================================================

-- Policy: Admins can read all audit logs
CREATE POLICY "Admins can read audit logs"
ON audit_logs FOR SELECT
USING (auth.is_admin());

-- Policy: Users can read their own audit trail
CREATE POLICY "Users can read own audit trail"
ON audit_logs FOR SELECT
USING (
  changed_by = auth.uid()
  OR record_id = auth.uid() -- If the audit is about them
);

-- Policy: Employees can read audit logs for work-related records
CREATE POLICY "Employees can read work audit logs"
ON audit_logs FOR SELECT
USING ('employee' = ANY(auth.user_roles()));

-- Policy: System can insert audit logs (no user restriction)
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true); -- Audit trigger handles this

-- Note: UPDATE/DELETE already blocked by rules in migration 003
```

### Service Role Configuration

Update file: `.env.local.example`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # For bypassing RLS in backend

# Use service role for admin operations
# WARNING: Never expose service role key to client!
```

### TypeScript RLS Helpers

Create file: `src/lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// Admin client bypasses RLS (use carefully!)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
```

Update file: `src/lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal errors
          }
        }
      }
    }
  );
}
```

### Testing Utilities

Create file: `src/lib/test/rls-test-helpers.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function testRLSPolicy(
  testName: string,
  userId: string,
  query: () => Promise<any>,
  expectedResult: 'success' | 'error'
) {
  try {
    const result = await query();

    if (expectedResult === 'success' && result.data) {
      console.log(`✅ ${testName}: PASS`);
      return true;
    } else if (expectedResult === 'error' && result.error) {
      console.log(`✅ ${testName}: PASS (correctly blocked)`);
      return true;
    } else {
      console.log(`❌ ${testName}: FAIL`);
      return false;
    }
  } catch (error) {
    if (expectedResult === 'error') {
      console.log(`✅ ${testName}: PASS (correctly threw error)`);
      return true;
    } else {
      console.log(`❌ ${testName}: FAIL with error:`, error);
      return false;
    }
  }
}
```

---

## Dependencies

- **Requires:** FOUND-001 (tables exist), FOUND-002 (roles configured)
- **Blocks:** All feature development (security foundation)

---

## Testing Checklist

### Scenario 1: Regular User Access
- [ ] User can read their own profile
- [ ] User cannot read other users' profiles
- [ ] User can update their own non-critical fields
- [ ] User cannot update email or created_at

### Scenario 2: Admin Access
- [ ] Admin can read all profiles
- [ ] Admin can create new users
- [ ] Admin can soft delete users
- [ ] Admin can assign roles

### Scenario 3: Employee Access
- [ ] Employee can read all profiles (for work)
- [ ] Employee can create new candidate profiles
- [ ] Employee cannot delete profiles
- [ ] Employee can read audit logs for work records

### Scenario 4: Student Access
- [ ] Student can only read their own profile
- [ ] Student cannot see other students
- [ ] Student can update their profile picture
- [ ] Student cannot change enrollment date

### Performance Tests
- [ ] Profile query with RLS: < 10ms
- [ ] Audit log query with RLS: < 50ms
- [ ] Role check overhead: < 5ms

---

## Verification Queries

```sql
-- Test as regular user (simulate auth.uid())
SET LOCAL "request.jwt.claims" TO '{"sub": "user-id-here"}';

-- Should succeed: Read own profile
SELECT * FROM user_profiles WHERE id = 'user-id-here';

-- Should fail: Read another user's profile
SELECT * FROM user_profiles WHERE id = 'different-user-id';

-- Test as admin
SET LOCAL "request.jwt.claims" TO '{"sub": "admin-user-id"}';

-- Create admin user first
INSERT INTO user_profiles (id, email, full_name)
VALUES ('admin-user-id', 'admin@example.com', 'Admin User');

SELECT grant_role_to_user('admin-user-id', 'admin');

-- Should succeed: Read all profiles
SELECT COUNT(*) FROM user_profiles;

-- Test performance
EXPLAIN ANALYZE
SELECT * FROM user_profiles
WHERE id = auth.uid();

-- Expected: Seq Scan or Index Scan, < 10ms execution time
```

---

## Documentation Updates

- [ ] Create `/docs/architecture/RLS-POLICIES.md` with policy matrix
- [ ] Document when to use service role vs anon key
- [ ] Add security best practices guide
- [ ] Document testing procedures for new policies

---

## Related Stories

- **Depends on:** FOUND-001 (tables), FOUND-002 (roles)
- **Blocks:** All feature epics (security requirement)

---

## Notes

- RLS enforced at database level (can't be bypassed by client)
- Service role key bypasses RLS (use only in trusted server code)
- Performance impact minimal with proper indexes
- Policies can be refined as features are added

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
