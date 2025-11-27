-- ============================================================================
-- Migration: 20251127000000_auth_access_control_fixes
-- Description: Production readiness fixes for Authentication & Access Control
--              - Fix permission action constraint to allow assign/send/issue
--              - Add missing indexes on auth_id, org_id, email
--              - Add missing ta_sales role
--              - Ensure RLS is properly enabled on all core tables
-- Created: 2025-11-27
-- Author: InTime Development Team
-- ============================================================================

-- ============================================================================
-- 1. FIX PERMISSION ACTION CONSTRAINT
-- The current constraint only allows: create, read, update, delete, approve,
-- reject, export, import, manage
-- Need to add: assign, send, issue (used by RBAC seed data)
-- ============================================================================

-- Drop existing constraint
ALTER TABLE permissions
  DROP CONSTRAINT IF EXISTS valid_action;

-- Create new constraint with expanded action list
ALTER TABLE permissions
  ADD CONSTRAINT valid_action CHECK (
    action IN (
      'create', 'read', 'update', 'delete',  -- CRUD operations
      'approve', 'reject',                    -- Workflow actions
      'export', 'import',                     -- Data transfer
      'manage',                               -- Full control
      'assign',                               -- Role/resource assignment
      'send',                                 -- Hotlist/email sending
      'issue'                                 -- Certificate issuance
    )
  );

COMMENT ON CONSTRAINT valid_action ON permissions IS
  'Allowed permission actions: CRUD, workflow (approve/reject), data (export/import), manage, assign, send, issue';

-- ============================================================================
-- 2. ADD MISSING INDEXES
-- Ensure optimal query performance for auth lookups
-- ============================================================================

-- user_profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id
  ON user_profiles(auth_id)
  WHERE auth_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON user_profiles(email)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_org_id
  ON user_profiles(org_id)
  WHERE deleted_at IS NULL;

-- Composite index for common auth lookup pattern
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_lookup
  ON user_profiles(auth_id, org_id, email)
  WHERE deleted_at IS NULL AND is_active = TRUE;

-- organizations indexes (ensure unique slug lookup is fast)
CREATE INDEX IF NOT EXISTS idx_organizations_email
  ON organizations(email)
  WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. ADD MISSING ta_sales ROLE
-- The seed script defines 11 roles but migration only has 10
-- ============================================================================

INSERT INTO roles (name, display_name, description, is_system_role, hierarchy_level, color_code)
VALUES (
  'ta_sales',
  'Talent Acquisition / Sales',
  'Talent acquisition and sales operations including campaigns and leads',
  TRUE,
  2,
  '#0891b2'
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  hierarchy_level = EXCLUDED.hierarchy_level,
  color_code = EXCLUDED.color_code;

-- ============================================================================
-- 4. VERIFY AND FIX RLS ON ALL CORE TABLES
-- Ensure RLS is enabled (idempotent)
-- ============================================================================

-- Core auth tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Audit tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. ADD MISSING RLS POLICY FOR ORGANIZATIONS (PUBLIC SELECT FOR SIGNUP)
-- During signup, users need to create orgs before they have auth context
-- ============================================================================

-- Allow service role to insert organizations during signup
DROP POLICY IF EXISTS "Service role can create organizations" ON organizations;
CREATE POLICY "Service role can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (TRUE);  -- Service role bypasses RLS anyway, but this documents intent

-- Allow authenticated users to view active organizations (for org switching)
DROP POLICY IF EXISTS "Authenticated users can view active organizations" ON organizations;
CREATE POLICY "Authenticated users can view active organizations"
  ON organizations
  FOR SELECT
  USING (
    status = 'active'
    AND deleted_at IS NULL
    AND (
      -- User belongs to this org
      id = auth_user_org_id()
      -- Or user is admin
      OR user_is_admin()
    )
  );

-- ============================================================================
-- 6. ADD HELPER FUNCTION FOR PERMISSION CHECKING IN APPLICATION CODE
-- ============================================================================

CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT,
  p_required_scope TEXT DEFAULT 'own'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
BEGIN
  -- Check if user has exact permission or higher scope permission
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND ur.deleted_at IS NULL
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND r.deleted_at IS NULL
      AND r.is_active = TRUE
      AND p.deleted_at IS NULL
      AND p.resource = p_resource
      AND p.action = p_action
      AND (
        -- Exact scope match
        p.scope = p_required_scope
        -- Or higher scope (all > department > pod > team > own)
        OR p.scope = 'all'
        OR (p_required_scope = 'own' AND p.scope IN ('team', 'pod', 'department', 'all'))
        OR (p_required_scope = 'team' AND p.scope IN ('pod', 'department', 'all'))
        OR (p_required_scope = 'pod' AND p.scope IN ('department', 'all'))
        OR (p_required_scope = 'department' AND p.scope = 'all')
      )
  ) INTO v_has_permission;

  RETURN v_has_permission;
END;
$$;

COMMENT ON FUNCTION check_user_permission IS
  'Check if user has permission for resource:action with scope hierarchy (all > department > pod > team > own)';

-- ============================================================================
-- 7. CREATE VALIDATION VIEW FOR RLS STATUS
-- ============================================================================

CREATE OR REPLACE VIEW v_auth_rls_status AS
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced,
  COUNT(p.polname) AS policy_count,
  array_agg(p.polname ORDER BY p.polname) AS policies
FROM pg_class c
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relkind = 'r'
  AND c.relname IN (
    'user_profiles',
    'roles',
    'permissions',
    'user_roles',
    'role_permissions',
    'organizations',
    'audit_logs'
  )
GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
ORDER BY c.relname;

COMMENT ON VIEW v_auth_rls_status IS
  'Validation view showing RLS status for auth/access control tables';

-- ============================================================================
-- 8. CREATE VIEW FOR ROLE-PERMISSION AUDIT
-- ============================================================================

CREATE OR REPLACE VIEW v_role_permissions_audit AS
SELECT
  r.name AS role_name,
  r.display_name AS role_display_name,
  r.hierarchy_level,
  r.is_system_role,
  r.is_active AS role_active,
  p.resource,
  p.action,
  p.scope,
  p.display_name AS permission_display_name,
  p.is_dangerous,
  rp.granted_at
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.deleted_at IS NULL
  AND p.deleted_at IS NULL
ORDER BY r.hierarchy_level, r.name, p.resource, p.action, p.scope;

COMMENT ON VIEW v_role_permissions_audit IS
  'Audit view showing all role-permission assignments';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
DECLARE
  v_role_count INTEGER;
  v_permission_count INTEGER;
  v_tables_with_rls INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_role_count FROM roles WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO v_permission_count FROM permissions WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO v_tables_with_rls
  FROM pg_class
  WHERE relnamespace = 'public'::regnamespace
    AND relrowsecurity = TRUE
    AND relname IN ('user_profiles', 'roles', 'permissions', 'user_roles', 'role_permissions', 'organizations', 'audit_logs');

  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Migration 20251127000000_auth_access_control_fixes completed!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '  1. Permission constraint updated (added assign, send, issue)';
  RAISE NOTICE '  2. Added indexes on auth_id, org_id, email';
  RAISE NOTICE '  3. Added ta_sales role (11 total roles now)';
  RAISE NOTICE '  4. Verified RLS enabled on % core tables', v_tables_with_rls;
  RAISE NOTICE '  5. Added check_user_permission() helper function';
  RAISE NOTICE '  6. Created v_auth_rls_status and v_role_permissions_audit views';
  RAISE NOTICE '';
  RAISE NOTICE 'Current counts:';
  RAISE NOTICE '  - Roles: %', v_role_count;
  RAISE NOTICE '  - Permissions: %', v_permission_count;
  RAISE NOTICE '  - Tables with RLS: %', v_tables_with_rls;
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run seed script to populate permissions and assign roles';
  RAISE NOTICE '  pnpm tsx scripts/seed-test-users.ts';
  RAISE NOTICE '============================================================';
END $$;
