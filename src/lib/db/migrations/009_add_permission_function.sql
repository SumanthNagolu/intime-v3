-- ============================================================================
-- Migration: 009_add_permission_function
-- Description: Add user_has_permission function for RBAC checks
-- Author: Developer Agent
-- Date: 2025-11-19
-- Epic: FOUND-010 (tRPC Setup)
-- Dependencies: 007_add_multi_tenancy.sql (requires user_roles, role_permissions tables)
-- ============================================================================

-- ============================================================================
-- PART 1: ADD PERMISSION CHECK FUNCTION
-- ============================================================================

-- Function: Check if user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.resource = p_resource
      AND p.action = p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_permission IS 'Check if user has specific permission (resource + action)';

-- ============================================================================
-- PART 2: ADD CONVENIENCE FUNCTIONS
-- ============================================================================

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth_user_id()
      AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_is_admin IS 'Check if current user has admin role';

-- Function: Check if user belongs to organization
CREATE OR REPLACE FUNCTION user_belongs_to_org(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth_user_id()
      AND org_id = p_org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_belongs_to_org IS 'Check if current user belongs to specified organization';

-- Function: Check if user has role
CREATE OR REPLACE FUNCTION user_has_role(p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth_user_id()
      AND r.name = p_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_role IS 'Check if current user has specified role';

-- ============================================================================
-- PART 3: GRANT ROLE FUNCTION (for event handlers)
-- ============================================================================

-- Function: Grant role to user
CREATE OR REPLACE FUNCTION grant_role_to_user(
  p_user_id UUID,
  p_role_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role_id UUID;
BEGIN
  -- Get role ID
  SELECT id INTO v_role_id
  FROM roles
  WHERE name = p_role_name;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role not found: %', p_role_name;
  END IF;

  -- Insert user_role (ignore if already exists)
  INSERT INTO user_roles (user_id, role_id, granted_at, granted_by)
  VALUES (p_user_id, v_role_id, NOW(), auth_user_id())
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION grant_role_to_user IS 'Grant role to user (used by event handlers)';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Migration 009_add_permission_function.sql completed successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  - Created user_has_permission(user_id, resource, action)';
  RAISE NOTICE '  - Created user_is_admin()';
  RAISE NOTICE '  - Created user_belongs_to_org(org_id)';
  RAISE NOTICE '  - Created user_has_role(role_name)';
  RAISE NOTICE '  - Created grant_role_to_user(user_id, role_name)';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Usage Examples:';
  RAISE NOTICE '  SELECT user_has_permission(''<uuid>'', ''events'', ''view'');';
  RAISE NOTICE '  SELECT user_is_admin();';
  RAISE NOTICE '  SELECT user_belongs_to_org(''<uuid>'');';
  RAISE NOTICE '  SELECT grant_role_to_user(''<uuid>'', ''candidate'');';
  RAISE NOTICE '============================================================';
END $$;
