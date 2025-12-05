-- ============================================================================
-- Migration: Permission Management Tables
-- Date: 2025-12-06
-- Description: Create tables for comprehensive permission management system
--              including RBAC, overrides, feature flags, API tokens, and bulk updates
-- ============================================================================

-- =============================================================================
-- 1. DROP AND RECREATE PERMISSIONS TABLE
-- The existing permissions table has a different schema (resource, scope, display_name, is_dangerous)
-- We need to recreate it with the new schema (code, name, object_type, action)
-- =============================================================================

-- Drop dependent views first
DROP VIEW IF EXISTS v_role_permissions_audit CASCADE;

-- Drop role_permissions first (it references permissions)
DROP TABLE IF EXISTS role_permissions CASCADE;

-- Drop the old permissions table
DROP TABLE IF EXISTS permissions CASCADE;

-- Create new permissions table with proper schema
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  object_type VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT permissions_valid_action CHECK (
    action IN ('create', 'read', 'update', 'delete', 'approve', 'reject', 'export', 'import', 'manage', 'assign')
  )
);

CREATE INDEX idx_permissions_object_type ON permissions(object_type);
CREATE INDEX idx_permissions_action ON permissions(action);
CREATE INDEX idx_permissions_code ON permissions(code);

-- =============================================================================
-- 2. ROLE PERMISSIONS TABLE
-- =============================================================================

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES system_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  scope_condition VARCHAR(50) DEFAULT 'own',
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES user_profiles(id),
  UNIQUE(role_id, permission_id),
  CONSTRAINT role_permissions_valid_scope CHECK (
    scope_condition IN ('own', 'own_raci', 'own_ra', 'team', 'region', 'org', 'draft_only')
  )
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- =============================================================================
-- 3. PERMISSION OVERRIDES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL,
  scope_override VARCHAR(50),
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES user_profiles(id),
  CONSTRAINT permission_overrides_valid_scope CHECK (
    scope_override IS NULL OR scope_override IN ('own', 'own_raci', 'own_ra', 'team', 'region', 'org', 'draft_only')
  )
);

CREATE INDEX IF NOT EXISTS idx_permission_overrides_user ON permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_org ON permission_overrides(org_id);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_expires ON permission_overrides(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_permission_overrides_active ON permission_overrides(user_id, permission_id) WHERE revoked_at IS NULL;

-- =============================================================================
-- 4. FEATURE FLAGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  default_enabled BOOLEAN DEFAULT false,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE NULLS NOT DISTINCT (org_id, code)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_org ON feature_flags(org_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_code ON feature_flags(code);

-- =============================================================================
-- 5. FEATURE FLAG ROLES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS feature_flag_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES system_roles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feature_flag_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_flag_roles_flag ON feature_flag_roles(feature_flag_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_roles_role ON feature_flag_roles(role_id);

-- =============================================================================
-- 6. API TOKENS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  token_prefix VARCHAR(10) NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_used_ip INET,
  usage_count INTEGER DEFAULT 0,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_org ON api_tokens(org_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_api_tokens_active ON api_tokens(org_id) WHERE revoked_at IS NULL;

-- =============================================================================
-- 7. BULK UPDATE HISTORY TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS bulk_update_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  update_type VARCHAR(50) NOT NULL,
  affected_user_ids UUID[] NOT NULL,
  changes JSONB NOT NULL,
  previous_state JSONB NOT NULL,
  reason TEXT NOT NULL,
  applied_by UUID NOT NULL REFERENCES user_profiles(id),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID REFERENCES user_profiles(id),
  CONSTRAINT bulk_update_history_valid_type CHECK (
    update_type IN ('enable_feature', 'disable_feature', 'change_scope', 'add_permission', 'remove_permission')
  )
);

CREATE INDEX IF NOT EXISTS idx_bulk_update_history_org ON bulk_update_history(org_id);
CREATE INDEX IF NOT EXISTS idx_bulk_update_history_applied ON bulk_update_history(applied_at DESC);

-- =============================================================================
-- 8. RLS POLICIES
-- =============================================================================

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_update_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "permissions_public_read" ON permissions;
DROP POLICY IF EXISTS "role_permissions_public_read" ON role_permissions;
DROP POLICY IF EXISTS "permission_overrides_org_isolation" ON permission_overrides;
DROP POLICY IF EXISTS "feature_flags_access" ON feature_flags;
DROP POLICY IF EXISTS "feature_flags_org_write" ON feature_flags;
DROP POLICY IF EXISTS "feature_flag_roles_read" ON feature_flag_roles;
DROP POLICY IF EXISTS "api_tokens_org_isolation" ON api_tokens;
DROP POLICY IF EXISTS "bulk_update_history_org_isolation" ON bulk_update_history;

-- Permissions: Public read access (permissions are global)
CREATE POLICY "permissions_public_read" ON permissions
  FOR SELECT USING (true);

-- Role Permissions: Public read access
CREATE POLICY "role_permissions_public_read" ON role_permissions
  FOR SELECT USING (true);

-- Permission Overrides: Org isolation
CREATE POLICY "permission_overrides_org_isolation" ON permission_overrides
  FOR ALL USING (
    org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

-- Feature Flags: Global or org isolation
CREATE POLICY "feature_flags_access" ON feature_flags
  FOR SELECT USING (
    is_global = true OR org_id IS NULL OR org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

CREATE POLICY "feature_flags_org_write" ON feature_flags
  FOR INSERT WITH CHECK (
    org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

-- Feature Flag Roles: Public read access
CREATE POLICY "feature_flag_roles_read" ON feature_flag_roles
  FOR SELECT USING (true);

-- API Tokens: Org isolation
CREATE POLICY "api_tokens_org_isolation" ON api_tokens
  FOR ALL USING (
    org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

-- Bulk Update History: Org isolation
CREATE POLICY "bulk_update_history_org_isolation" ON bulk_update_history
  FOR ALL USING (
    org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

-- =============================================================================
-- 9. SEED PERMISSIONS DATA
-- =============================================================================

-- Jobs permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('jobs.create', 'Create Jobs', 'Create new job requisitions', 'jobs', 'create'),
('jobs.read', 'View Jobs', 'View job requisitions', 'jobs', 'read'),
('jobs.update', 'Update Jobs', 'Edit job requisitions', 'jobs', 'update'),
('jobs.delete', 'Delete Jobs', 'Delete job requisitions', 'jobs', 'delete'),
('jobs.approve', 'Approve Jobs', 'Approve job requisitions', 'jobs', 'approve')
ON CONFLICT (code) DO NOTHING;

-- Candidates permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('candidates.create', 'Create Candidates', 'Add new candidates', 'candidates', 'create'),
('candidates.read', 'View Candidates', 'View candidate profiles', 'candidates', 'read'),
('candidates.update', 'Update Candidates', 'Edit candidate profiles', 'candidates', 'update'),
('candidates.delete', 'Delete Candidates', 'Delete candidates', 'candidates', 'delete'),
('candidates.export', 'Export Candidates', 'Export candidate data', 'candidates', 'export')
ON CONFLICT (code) DO NOTHING;

-- Submissions permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('submissions.create', 'Create Submissions', 'Submit candidates to jobs', 'submissions', 'create'),
('submissions.read', 'View Submissions', 'View submissions', 'submissions', 'read'),
('submissions.update', 'Update Submissions', 'Update submission status', 'submissions', 'update'),
('submissions.delete', 'Delete Submissions', 'Delete submissions', 'submissions', 'delete'),
('submissions.approve', 'Approve Submissions', 'Approve candidate submissions', 'submissions', 'approve')
ON CONFLICT (code) DO NOTHING;

-- Accounts (CRM) permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('accounts.create', 'Create Accounts', 'Add new client accounts', 'accounts', 'create'),
('accounts.read', 'View Accounts', 'View client accounts', 'accounts', 'read'),
('accounts.update', 'Update Accounts', 'Edit client accounts', 'accounts', 'update'),
('accounts.delete', 'Delete Accounts', 'Delete client accounts', 'accounts', 'delete'),
('accounts.manage', 'Manage Accounts', 'Full account management', 'accounts', 'manage')
ON CONFLICT (code) DO NOTHING;

-- Users permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('users.create', 'Create Users', 'Add new users', 'users', 'create'),
('users.read', 'View Users', 'View user profiles', 'users', 'read'),
('users.update', 'Update Users', 'Edit user profiles', 'users', 'update'),
('users.delete', 'Delete Users', 'Delete users', 'users', 'delete'),
('users.manage', 'Manage Users', 'Full user management', 'users', 'manage')
ON CONFLICT (code) DO NOTHING;

-- Reports permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('reports.read', 'View Reports', 'View reports and analytics', 'reports', 'read'),
('reports.create', 'Create Reports', 'Create custom reports', 'reports', 'create'),
('reports.export', 'Export Reports', 'Export report data', 'reports', 'export')
ON CONFLICT (code) DO NOTHING;

-- Settings permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('settings.read', 'View Settings', 'View system settings', 'settings', 'read'),
('settings.update', 'Update Settings', 'Modify system settings', 'settings', 'update'),
('settings.manage', 'Manage Settings', 'Full settings management', 'settings', 'manage')
ON CONFLICT (code) DO NOTHING;

-- Permissions management
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('permissions.read', 'View Permissions', 'View permission matrix', 'permissions', 'read'),
('permissions.update', 'Update Permissions', 'Modify role permissions', 'permissions', 'update'),
('permissions.manage', 'Manage Permissions', 'Full permission management', 'permissions', 'manage')
ON CONFLICT (code) DO NOTHING;

-- Pods permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('pods.create', 'Create Pods', 'Create new pods', 'pods', 'create'),
('pods.read', 'View Pods', 'View pods', 'pods', 'read'),
('pods.update', 'Update Pods', 'Edit pods', 'pods', 'update'),
('pods.delete', 'Delete Pods', 'Delete pods', 'pods', 'delete'),
('pods.manage', 'Manage Pods', 'Full pod management', 'pods', 'manage')
ON CONFLICT (code) DO NOTHING;

-- Consultants permissions (bench sales)
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('consultants.create', 'Create Consultants', 'Add new consultants', 'consultants', 'create'),
('consultants.read', 'View Consultants', 'View consultant profiles', 'consultants', 'read'),
('consultants.update', 'Update Consultants', 'Edit consultant profiles', 'consultants', 'update'),
('consultants.delete', 'Delete Consultants', 'Delete consultants', 'consultants', 'delete'),
('consultants.assign', 'Assign Consultants', 'Assign consultants to projects', 'consultants', 'assign')
ON CONFLICT (code) DO NOTHING;

-- Leads permissions
INSERT INTO permissions (code, name, description, object_type, action) VALUES
('leads.create', 'Create Leads', 'Add new leads', 'leads', 'create'),
('leads.read', 'View Leads', 'View leads', 'leads', 'read'),
('leads.update', 'Update Leads', 'Edit leads', 'leads', 'update'),
('leads.delete', 'Delete Leads', 'Delete leads', 'leads', 'delete'),
('leads.assign', 'Assign Leads', 'Assign leads to users', 'leads', 'assign')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 10. SEED ROLE PERMISSIONS
-- =============================================================================

-- Technical Recruiter permissions
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id,
  CASE
    WHEN p.action = 'create' THEN 'org'
    WHEN p.action IN ('read', 'update') THEN 'own_raci'
    WHEN p.action = 'delete' THEN 'draft_only'
    ELSE 'own'
  END,
  true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'technical_recruiter'
  AND p.object_type IN ('jobs', 'candidates', 'submissions')
  AND p.action IN ('create', 'read', 'update', 'delete')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Bench Sales Recruiter permissions
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id,
  CASE
    WHEN p.action = 'create' THEN 'org'
    WHEN p.action IN ('read', 'update') THEN 'own_raci'
    WHEN p.action = 'delete' THEN 'draft_only'
    ELSE 'own'
  END,
  true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'bench_sales_recruiter'
  AND p.object_type IN ('consultants', 'accounts')
  AND p.action IN ('create', 'read', 'update', 'delete')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- TA Specialist permissions
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id,
  CASE
    WHEN p.action = 'create' THEN 'org'
    WHEN p.action IN ('read', 'update') THEN 'own_raci'
    WHEN p.action = 'delete' THEN 'draft_only'
    ELSE 'own'
  END,
  true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'ta_specialist'
  AND p.object_type IN ('leads', 'candidates')
  AND p.action IN ('create', 'read', 'update', 'delete')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Pod Managers (all pod types) - team scope
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id, 'team', true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code IN ('recruiting_manager', 'bench_manager', 'ta_manager')
  AND p.object_type IN ('jobs', 'candidates', 'submissions', 'consultants', 'accounts', 'leads')
  AND p.action IN ('create', 'read', 'update', 'delete', 'approve')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- HR Manager permissions
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id, 'org', true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'hr_manager'
  AND p.object_type IN ('users', 'pods', 'reports')
  AND p.action IN ('create', 'read', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Regional Director permissions
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id, 'region', true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'regional_director'
  AND p.object_type IN ('jobs', 'candidates', 'submissions', 'accounts', 'reports')
  AND p.action IN ('create', 'read', 'update', 'approve')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin permissions (full org scope, all permissions)
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id, 'org', true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Executive permissions (C-level: read/approve org-wide)
INSERT INTO role_permissions (role_id, permission_id, scope_condition, granted)
SELECT sr.id, p.id, 'org', true
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code IN ('ceo', 'coo', 'cfo')
  AND p.action IN ('read', 'approve')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 11. SEED FEATURE FLAGS
-- =============================================================================

INSERT INTO feature_flags (code, name, description, default_enabled, is_global) VALUES
('ai_twin', 'AI Twin System', 'AI-powered assistant for recruiters', false, true),
('bulk_email', 'Bulk Email Campaigns', 'Send bulk emails to candidates', false, true),
('advanced_analytics', 'Advanced Analytics', 'Detailed analytics dashboard', false, true),
('api_access', 'API Access', 'External API access', false, true),
('data_export', 'Data Export', 'Export data in various formats', true, true),
('mobile_app', 'Mobile App Access', 'Access via mobile application', false, true),
('integrations', 'Third-party Integrations', 'Connect with external services', false, true),
('bulk_operations', 'Bulk Operations', 'Perform bulk updates on records', false, true),
('custom_reports', 'Custom Reports', 'Create and save custom reports', false, true),
('workflow_automation', 'Workflow Automation', 'Automated workflows and triggers', false, true)
ON CONFLICT DO NOTHING;

-- Enable features for specific role categories
-- AI Twin for Pod ICs and Managers
INSERT INTO feature_flag_roles (feature_flag_id, role_id, enabled)
SELECT ff.id, sr.id, true
FROM feature_flags ff
CROSS JOIN system_roles sr
WHERE ff.code = 'ai_twin'
  AND sr.category IN ('pod_ic', 'pod_manager')
ON CONFLICT (feature_flag_id, role_id) DO NOTHING;

-- Advanced Analytics for Managers and above
INSERT INTO feature_flag_roles (feature_flag_id, role_id, enabled)
SELECT ff.id, sr.id, true
FROM feature_flags ff
CROSS JOIN system_roles sr
WHERE ff.code = 'advanced_analytics'
  AND sr.category IN ('pod_manager', 'leadership', 'executive', 'admin')
ON CONFLICT (feature_flag_id, role_id) DO NOTHING;

-- API Access for Leadership, Executive, Admin
INSERT INTO feature_flag_roles (feature_flag_id, role_id, enabled)
SELECT ff.id, sr.id, true
FROM feature_flags ff
CROSS JOIN system_roles sr
WHERE ff.code = 'api_access'
  AND sr.category IN ('leadership', 'executive', 'admin')
ON CONFLICT (feature_flag_id, role_id) DO NOTHING;

-- Data Export for all roles except portal
INSERT INTO feature_flag_roles (feature_flag_id, role_id, enabled)
SELECT ff.id, sr.id, true
FROM feature_flags ff
CROSS JOIN system_roles sr
WHERE ff.code = 'data_export'
  AND sr.category NOT IN ('portal')
ON CONFLICT (feature_flag_id, role_id) DO NOTHING;

-- Bulk Operations for Managers and above
INSERT INTO feature_flag_roles (feature_flag_id, role_id, enabled)
SELECT ff.id, sr.id, true
FROM feature_flags ff
CROSS JOIN system_roles sr
WHERE ff.code = 'bulk_operations'
  AND sr.category IN ('pod_manager', 'leadership', 'executive', 'admin')
ON CONFLICT (feature_flag_id, role_id) DO NOTHING;

-- Custom Reports for Leadership and above
INSERT INTO feature_flag_roles (feature_flag_id, role_id, enabled)
SELECT ff.id, sr.id, true
FROM feature_flags ff
CROSS JOIN system_roles sr
WHERE ff.code = 'custom_reports'
  AND sr.category IN ('leadership', 'executive', 'admin')
ON CONFLICT (feature_flag_id, role_id) DO NOTHING;

-- =============================================================================
-- 12. HELPER FUNCTION FOR PERMISSION CHECKING
-- =============================================================================

CREATE OR REPLACE FUNCTION app_check_permission(
  p_user_id UUID,
  p_permission_code TEXT,
  p_entity_id UUID DEFAULT NULL
)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  scope TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role_id UUID;
  v_role_permission RECORD;
  v_override RECORD;
  v_user_status TEXT;
BEGIN
  -- Get user's role and status
  SELECT role_id, status INTO v_user_role_id, v_user_status
  FROM user_profiles
  WHERE id = p_user_id;

  IF v_user_role_id IS NULL THEN
    RETURN QUERY SELECT false, 'User has no assigned role'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  IF v_user_status != 'active' THEN
    RETURN QUERY SELECT false, ('User status is ' || v_user_status)::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check for active override (takes priority)
  SELECT po.* INTO v_override
  FROM permission_overrides po
  JOIN permissions p ON po.permission_id = p.id
  WHERE po.user_id = p_user_id
    AND p.code = p_permission_code
    AND po.revoked_at IS NULL
    AND (po.expires_at IS NULL OR po.expires_at > NOW())
  LIMIT 1;

  IF FOUND THEN
    IF v_override.granted THEN
      RETURN QUERY SELECT true, ('Allowed by custom override: ' || v_override.reason)::TEXT, v_override.scope_override;
    ELSE
      RETURN QUERY SELECT false, ('Denied by custom override: ' || v_override.reason)::TEXT, NULL::TEXT;
    END IF;
    RETURN;
  END IF;

  -- Check role permission
  SELECT rp.*, p.code INTO v_role_permission
  FROM role_permissions rp
  JOIN permissions p ON rp.permission_id = p.id
  WHERE rp.role_id = v_user_role_id
    AND p.code = p_permission_code
    AND rp.granted = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Permission not granted to role'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Permission granted with scope
  RETURN QUERY SELECT true, 'Allowed by role permission'::TEXT, v_role_permission.scope_condition;
END;
$$;

COMMENT ON FUNCTION app_check_permission IS 'Application-level permission check with override support';

-- =============================================================================
-- 13. GRANTS
-- =============================================================================

GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT ALL ON permission_overrides TO authenticated;
GRANT SELECT ON feature_flags TO authenticated;
GRANT SELECT ON feature_flag_roles TO authenticated;
GRANT ALL ON api_tokens TO authenticated;
GRANT ALL ON bulk_update_history TO authenticated;

-- Admin-only write access
GRANT INSERT, UPDATE, DELETE ON permissions TO service_role;
GRANT INSERT, UPDATE, DELETE ON role_permissions TO service_role;
GRANT INSERT, UPDATE, DELETE ON feature_flags TO service_role;
GRANT INSERT, UPDATE, DELETE ON feature_flag_roles TO service_role;

-- =============================================================================
-- 14. TRIGGERS FOR UPDATED_AT
-- =============================================================================

DROP TRIGGER IF EXISTS feature_flags_updated_at ON feature_flags;
CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
