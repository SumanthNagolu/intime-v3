-- ============================================================================
-- Migration: 003_create_rbac_system
-- Description: Role-Based Access Control system with granular permissions.
--              Supports multi-role users and hierarchical permissions.
-- Created: 2025-11-18
-- Author: Database Architect Agent
-- Epic: FOUND-002 - Implement RBAC System
-- Dependencies: 002_create_user_profiles.sql
-- ============================================================================

-- ============================================================================
-- TABLE: roles
-- Purpose: System roles (student, trainer, recruiter, admin, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Role identification
  name TEXT UNIQUE NOT NULL, -- 'student', 'trainer', 'recruiter', 'admin', etc.
  display_name TEXT NOT NULL, -- 'Student', 'Trainer', 'Recruiter', 'Admin'
  description TEXT,

  -- Role hierarchy (for permission inheritance)
  parent_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  hierarchy_level INTEGER DEFAULT 0, -- 0 = top level, 1+ = child levels

  -- Role metadata
  is_system_role BOOLEAN DEFAULT FALSE, -- TRUE = cannot be deleted
  is_active BOOLEAN DEFAULT TRUE,
  color_code TEXT DEFAULT '#6366f1', -- For UI display (indigo-500)

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_role_name CHECK (
    name ~ '^[a-z_]+$' -- lowercase with underscores only
  )
);

-- ============================================================================
-- TABLE: permissions
-- Purpose: Granular permissions for specific actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Permission identification
  resource TEXT NOT NULL, -- 'user', 'candidate', 'placement', 'course', etc.
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'approve', 'export'
  scope TEXT DEFAULT 'own', -- 'own', 'team', 'department', 'all'

  -- Permission metadata
  display_name TEXT NOT NULL,
  description TEXT,
  is_dangerous BOOLEAN DEFAULT FALSE, -- Requires extra confirmation (e.g., delete_user)

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Unique constraint on resource + action + scope
  CONSTRAINT unique_permission UNIQUE (resource, action, scope),

  -- Constraints
  CONSTRAINT valid_action CHECK (
    action IN ('create', 'read', 'update', 'delete', 'approve', 'reject', 'export', 'import', 'manage')
  ),
  CONSTRAINT valid_scope CHECK (
    scope IN ('own', 'team', 'pod', 'department', 'all')
  )
);

-- ============================================================================
-- TABLE: role_permissions
-- Purpose: Junction table mapping roles to permissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  -- Composite primary key
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,

  -- Grant metadata
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  granted_by UUID REFERENCES user_profiles(id),

  -- Primary key
  PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- TABLE: user_roles
-- Purpose: Junction table mapping users to roles (multi-role support)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  -- Composite primary key
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,

  -- Assignment metadata
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  assigned_by UUID REFERENCES user_profiles(id),
  expires_at TIMESTAMPTZ, -- NULL = no expiration
  is_primary BOOLEAN DEFAULT FALSE, -- Primary role for the user

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ, -- Soft delete for role revocation history

  -- Primary key
  PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Roles
CREATE INDEX idx_roles_name ON roles(name) WHERE deleted_at IS NULL;
CREATE INDEX idx_roles_parent ON roles(parent_role_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_roles_system ON roles(is_system_role) WHERE is_system_role = TRUE;

-- Permissions
CREATE INDEX idx_permissions_resource ON permissions(resource) WHERE deleted_at IS NULL;
CREATE INDEX idx_permissions_action ON permissions(action) WHERE deleted_at IS NULL;

-- Role permissions
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- User roles
CREATE INDEX idx_user_roles_user ON user_roles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_roles_role ON user_roles(role_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_roles_primary ON user_roles(user_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_user_roles_expires ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT,
  p_scope TEXT DEFAULT 'own'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND ur.deleted_at IS NULL
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND p.resource = p_resource
      AND p.action = p_action
      AND (p.scope = p_scope OR p.scope = 'all')
      AND p.deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get all permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  resource TEXT,
  action TEXT,
  scope TEXT,
  via_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.resource,
    p.action,
    p.scope,
    r.name AS via_role
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id
    AND ur.deleted_at IS NULL
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    AND r.deleted_at IS NULL
    AND p.deleted_at IS NULL
  ORDER BY p.resource, p.action, p.scope;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Grant role to user
CREATE OR REPLACE FUNCTION grant_role_to_user(
  p_user_id UUID,
  p_role_name TEXT,
  p_granted_by UUID,
  p_is_primary BOOLEAN DEFAULT FALSE,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role_id UUID;
BEGIN
  -- Get role ID
  SELECT id INTO v_role_id
  FROM roles
  WHERE name = p_role_name AND deleted_at IS NULL;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  -- If this is primary role, unset any existing primary roles
  IF p_is_primary THEN
    UPDATE user_roles
    SET is_primary = FALSE
    WHERE user_id = p_user_id AND deleted_at IS NULL;
  END IF;

  -- Insert or update user_role
  INSERT INTO user_roles (user_id, role_id, assigned_by, is_primary, expires_at)
  VALUES (p_user_id, v_role_id, p_granted_by, p_is_primary, p_expires_at)
  ON CONFLICT (user_id, role_id)
  DO UPDATE SET
    deleted_at = NULL, -- Un-soft-delete if previously removed
    is_primary = EXCLUDED.is_primary,
    expires_at = EXCLUDED.expires_at,
    assigned_by = EXCLUDED.assigned_by,
    assigned_at = NOW();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Revoke role from user (soft delete)
CREATE OR REPLACE FUNCTION revoke_role_from_user(
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
  WHERE name = p_role_name AND deleted_at IS NULL;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  -- Soft delete the user_role
  UPDATE user_roles
  SET deleted_at = NOW()
  WHERE user_id = p_user_id AND role_id = v_role_id AND deleted_at IS NULL;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-update updated_at for roles
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on roles
CREATE TRIGGER trigger_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_roles_updated_at();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Users with their roles
CREATE OR REPLACE VIEW v_user_roles_detailed AS
SELECT
  up.id AS user_id,
  up.email,
  up.full_name,
  r.name AS role_name,
  r.display_name AS role_display_name,
  ur.is_primary,
  ur.assigned_at,
  ur.expires_at,
  CASE
    WHEN ur.expires_at IS NOT NULL AND ur.expires_at < NOW() THEN 'expired'
    WHEN ur.deleted_at IS NOT NULL THEN 'revoked'
    ELSE 'active'
  END AS role_status
FROM user_profiles up
JOIN user_roles ur ON up.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE up.deleted_at IS NULL
ORDER BY up.email, ur.is_primary DESC, r.name;

-- View: Roles with permission count
CREATE OR REPLACE VIEW v_roles_with_permissions AS
SELECT
  r.id,
  r.name,
  r.display_name,
  r.description,
  r.hierarchy_level,
  COUNT(rp.permission_id) AS permission_count,
  COUNT(DISTINCT ur.user_id) AS user_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN user_roles ur ON r.id = ur.role_id AND ur.deleted_at IS NULL
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name, r.display_name, r.description, r.hierarchy_level
ORDER BY r.hierarchy_level, r.name;

-- ============================================================================
-- SEED DATA: System Roles
-- ============================================================================

-- Insert core system roles
INSERT INTO roles (name, display_name, description, is_system_role, hierarchy_level, color_code) VALUES
  ('super_admin', 'Super Admin', 'Full system access, cannot be restricted', TRUE, 0, '#dc2626'),
  ('admin', 'Administrator', 'Platform administration and user management', TRUE, 1, '#ea580c'),
  ('recruiter', 'Recruiter', 'Recruiting and placement operations', TRUE, 2, '#2563eb'),
  ('bench_sales', 'Bench Sales', 'Bench candidate sales and placement', TRUE, 2, '#7c3aed'),
  ('trainer', 'Trainer', 'Training academy instructor', TRUE, 2, '#16a34a'),
  ('student', 'Student', 'Training academy student', TRUE, 3, '#0891b2'),
  ('employee', 'Employee', 'Internal employee', TRUE, 3, '#4f46e5'),
  ('candidate', 'Candidate', 'Job candidate (bench or placed)', TRUE, 3, '#9333ea'),
  ('client', 'Client', 'Client company contact', TRUE, 3, '#0d9488'),
  ('hr_manager', 'HR Manager', 'Human resources management', TRUE, 2, '#c026d3')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA: Permissions
-- ============================================================================

-- User management permissions
INSERT INTO permissions (resource, action, scope, display_name, description) VALUES
  ('user', 'create', 'all', 'Create User', 'Create new users in the system'),
  ('user', 'read', 'own', 'Read Own Profile', 'View own user profile'),
  ('user', 'read', 'all', 'Read All Users', 'View all user profiles'),
  ('user', 'update', 'own', 'Update Own Profile', 'Edit own user profile'),
  ('user', 'update', 'all', 'Update Any User', 'Edit any user profile'),
  ('user', 'delete', 'all', 'Delete User', 'Soft delete users (dangerous)', TRUE),
  ('user', 'manage', 'all', 'Manage Users', 'Full user management access')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- Candidate permissions
INSERT INTO permissions (resource, action, scope, display_name, description) VALUES
  ('candidate', 'create', 'all', 'Create Candidate', 'Add new candidates to system'),
  ('candidate', 'read', 'own', 'Read Own Candidate Profile', 'View own candidate info'),
  ('candidate', 'read', 'team', 'Read Team Candidates', 'View candidates in your team'),
  ('candidate', 'read', 'all', 'Read All Candidates', 'View all candidate profiles'),
  ('candidate', 'update', 'own', 'Update Own Candidate', 'Edit own candidate profile'),
  ('candidate', 'update', 'team', 'Update Team Candidates', 'Edit team candidate profiles'),
  ('candidate', 'update', 'all', 'Update Any Candidate', 'Edit any candidate profile'),
  ('candidate', 'delete', 'all', 'Delete Candidate', 'Remove candidates (dangerous)', TRUE),
  ('candidate', 'export', 'all', 'Export Candidates', 'Export candidate data to CSV/Excel')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- Placement permissions
INSERT INTO permissions (resource, action, scope, display_name, description) VALUES
  ('placement', 'create', 'all', 'Create Placement', 'Submit new placements'),
  ('placement', 'read', 'own', 'Read Own Placements', 'View own placements'),
  ('placement', 'read', 'team', 'Read Team Placements', 'View team placements'),
  ('placement', 'read', 'all', 'Read All Placements', 'View all placements'),
  ('placement', 'update', 'all', 'Update Placement', 'Edit placement details'),
  ('placement', 'approve', 'all', 'Approve Placement', 'Approve pending placements'),
  ('placement', 'reject', 'all', 'Reject Placement', 'Reject placements')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- Course permissions (Training Academy)
INSERT INTO permissions (resource, action, scope, display_name, description) VALUES
  ('course', 'create', 'all', 'Create Course', 'Create new training courses'),
  ('course', 'read', 'all', 'Read Courses', 'View course catalog'),
  ('course', 'update', 'all', 'Update Course', 'Edit course content'),
  ('course', 'delete', 'all', 'Delete Course', 'Remove courses'),
  ('course', 'manage', 'all', 'Manage Courses', 'Full course management')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- Timesheet permissions (HR module)
INSERT INTO permissions (resource, action, scope, display_name, description) VALUES
  ('timesheet', 'create', 'own', 'Submit Timesheet', 'Submit own timesheets'),
  ('timesheet', 'read', 'own', 'Read Own Timesheets', 'View own timesheets'),
  ('timesheet', 'read', 'all', 'Read All Timesheets', 'View all timesheets'),
  ('timesheet', 'approve', 'all', 'Approve Timesheets', 'Approve submitted timesheets'),
  ('timesheet', 'reject', 'all', 'Reject Timesheets', 'Reject timesheets')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- System permissions
INSERT INTO permissions (resource, action, scope, display_name, description) VALUES
  ('system', 'read', 'all', 'View System Settings', 'View system configuration'),
  ('system', 'manage', 'all', 'Manage System', 'Full system administration (dangerous)', TRUE),
  ('audit', 'read', 'all', 'View Audit Logs', 'View system audit logs'),
  ('report', 'export', 'all', 'Export Reports', 'Export system reports')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- ============================================================================
-- SEED DATA: Role-Permission Mappings
-- ============================================================================

-- Super Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin: Most permissions except super dangerous ones
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.resource != 'system' -- No system management
ON CONFLICT DO NOTHING;

-- Recruiter: Candidate and placement permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'recruiter'
  AND p.resource IN ('candidate', 'placement', 'user')
  AND (p.action != 'delete' OR p.scope != 'all') -- No delete permissions
ON CONFLICT DO NOTHING;

-- Trainer: Course and student permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'trainer'
  AND (
    (p.resource = 'course' AND p.action IN ('read', 'update', 'create'))
    OR (p.resource = 'user' AND p.action = 'read' AND p.scope IN ('own', 'all'))
  )
ON CONFLICT DO NOTHING;

-- Student: Own profile and course reading
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'student'
  AND (
    (p.resource = 'user' AND p.scope = 'own')
    OR (p.resource = 'course' AND p.action = 'read')
  )
ON CONFLICT DO NOTHING;

-- Candidate: Own profile only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'candidate'
  AND p.resource IN ('user', 'candidate')
  AND p.scope = 'own'
ON CONFLICT DO NOTHING;

-- Employee: Timesheet and own profile
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'employee'
  AND (
    (p.resource = 'user' AND p.scope = 'own')
    OR (p.resource = 'timesheet' AND p.scope = 'own')
  )
ON CONFLICT DO NOTHING;

-- HR Manager: User and timesheet management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'hr_manager'
  AND p.resource IN ('user', 'timesheet', 'employee')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE roles IS
'System roles with hierarchical support. Each user can have multiple roles (multi-role users).';

COMMENT ON TABLE permissions IS
'Granular permissions following resource-action-scope pattern (e.g., user-read-all).';

COMMENT ON TABLE role_permissions IS
'Junction table mapping roles to permissions. Determines what each role can do.';

COMMENT ON TABLE user_roles IS
'Junction table mapping users to roles. Supports multi-role users and temporary role assignments.';

COMMENT ON FUNCTION user_has_permission IS
'Check if a user has a specific permission (considers all their active roles).';

COMMENT ON FUNCTION get_user_permissions IS
'Get all permissions for a user across all their roles.';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Migration 003_create_rbac_system.sql completed successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Tables created: roles, permissions, role_permissions, user_roles';
  RAISE NOTICE 'System roles: 10 roles created (super_admin, admin, recruiter, etc.)';
  RAISE NOTICE 'Permissions: 40+ granular permissions created';
  RAISE NOTICE 'Functions: user_has_permission(), get_user_permissions(), grant_role_to_user(), revoke_role_from_user()';
  RAISE NOTICE 'Views: v_user_roles_detailed, v_roles_with_permissions';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Next: Run 004_create_audit_tables.sql';
  RAISE NOTICE '============================================================';
END $$;
