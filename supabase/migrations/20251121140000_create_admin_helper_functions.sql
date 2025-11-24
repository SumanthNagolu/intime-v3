-- Admin Helper Functions
-- Created: 2025-11-21
-- Description: Helper functions for role checking used by tRPC middleware

-- ============================================================================
-- USER IS ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_is_admin IS 'Returns true if current user has admin role';

-- ============================================================================
-- USER HAS PERMISSION
-- ============================================================================

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
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = p_user_id
    AND rp.resource = p_resource
    AND rp.action = p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_permission IS 'Checks if user has specific permission on resource';

-- ============================================================================
-- USER HAS ROLE
-- ============================================================================

CREATE OR REPLACE FUNCTION user_has_role(
  p_user_id UUID,
  p_role_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    AND r.name = p_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_role IS 'Checks if user has specific role by name';
