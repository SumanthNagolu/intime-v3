-- =====================================================
-- Helper Functions for Business Modules
-- Date: 2024-11-23
-- Description: Essential helper functions for RLS, timestamps, and auth
-- =====================================================

-- =====================================================
-- 1. AUTO-UPDATE TIMESTAMP FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Auto-update updated_at timestamp on row modification';

-- =====================================================
-- 2. AUTH HELPER FUNCTIONS
-- =====================================================

-- Get current user's organization ID from JWT or user_profiles
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT org_id
    FROM user_profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth_org_id IS 'Get current user organization ID from user_profiles';

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION auth_has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth_has_role IS 'Check if current user has a specific role';

-- Get active role from JWT user_metadata (for context switching)
CREATE OR REPLACE FUNCTION auth_active_role()
RETURNS TEXT AS $$
DECLARE
  active_role TEXT;
BEGIN
  -- Get active_role from JWT user_metadata
  active_role := COALESCE(
    auth.jwt()->>'active_role',
    (
      SELECT r.name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      ORDER BY r.hierarchy_level ASC
      LIMIT 1
    )
  );

  RETURN active_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth_active_role IS 'Get current active role from JWT or default to primary role';

-- Check if user has active role (for context switching)
CREATE OR REPLACE FUNCTION auth_has_active_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth_active_role() = role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth_has_active_role IS 'Check if current active role matches specified role';

-- Get user's available roles for context switching
CREATE OR REPLACE FUNCTION get_user_available_roles()
RETURNS TABLE (
  role_name TEXT,
  role_display_name TEXT,
  role_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.name,
    r.display_name,
    r.description
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid()
  ORDER BY r.display_order ASC, r.display_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_user_available_roles IS 'Get list of roles user can switch to';

-- Check if user can switch to a specific role
CREATE OR REPLACE FUNCTION can_switch_to_role(p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = p_role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION can_switch_to_role IS 'Check if user has permission to switch to specified role';

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON SCHEMA public IS 'Helper functions for authentication, authorization, and timestamps';
