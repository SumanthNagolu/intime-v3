-- ============================================================================
-- Migration: User Management System
-- Date: 2025-12-05
-- Description: Adds tables and enhancements for user management (ADMIN-US-003)
--              - Enhances user_profiles with additional fields
--              - Creates login_history table
--              - Creates user_invitations table
-- ============================================================================

-- ============================================================================
-- 1. ENHANCE USER_PROFILES TABLE
-- ============================================================================

-- Add new columns to user_profiles for user management
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES user_profiles(id);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES system_roles(id);

-- Add status field if not exists (pending, active, suspended, deactivated)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'status') THEN
    ALTER TABLE user_profiles ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Add constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'user_profiles_status_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_status_check
      CHECK (status IN ('pending', 'active', 'suspended', 'deactivated'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_manager ON user_profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at DESC);

-- ============================================================================
-- 2. LOGIN_HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Login details
  email VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  failure_reason VARCHAR(100), -- 'invalid_password', 'account_suspended', 'account_deactivated', etc.

  -- Device info (optional metadata)
  device_info JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for login_history
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_org_id ON login_history(org_id);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON login_history(email);
CREATE INDEX IF NOT EXISTS idx_login_history_created ON login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_success ON login_history(success);

-- Comments
COMMENT ON TABLE login_history IS 'Tracks user login attempts for security auditing';
COMMENT ON COLUMN login_history.failure_reason IS 'Reason for login failure if success is false';

-- ============================================================================
-- 3. USER_INVITATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Invitation details
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),

  -- Role and pod assignment
  role_id UUID NOT NULL REFERENCES system_roles(id),
  pod_id UUID REFERENCES pods(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Token for invitation link
  token VARCHAR(255) NOT NULL UNIQUE,

  -- Who invited
  invited_by UUID NOT NULL REFERENCES user_profiles(id),

  -- Lifecycle
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Additional settings
  require_two_factor BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_invitations
CREATE INDEX IF NOT EXISTS idx_user_invitations_org ON user_invitations(org_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_by ON user_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires ON user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(accepted_at, cancelled_at);

-- Comments
COMMENT ON TABLE user_invitations IS 'Stores pending user invitations for organization onboarding';
COMMENT ON COLUMN user_invitations.token IS 'Unique token for invitation link validation';

-- ============================================================================
-- 4. POD_MANAGERS TABLE (for tracking manager assignments over time)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pod_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pod reference
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,

  -- Manager reference
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Manager type
  is_primary BOOLEAN DEFAULT false,

  -- Assignment tracking
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  removed_at TIMESTAMPTZ,
  removed_by UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for pod_managers
CREATE INDEX IF NOT EXISTS idx_pod_managers_org ON pod_managers(org_id);
CREATE INDEX IF NOT EXISTS idx_pod_managers_pod ON pod_managers(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_managers_user ON pod_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_pod_managers_active ON pod_managers(pod_id, is_primary) WHERE removed_at IS NULL;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_managers ENABLE ROW LEVEL SECURITY;

-- Login History: Organization isolation
DROP POLICY IF EXISTS "login_history_org_policy" ON login_history;
CREATE POLICY "login_history_org_policy" ON login_history
  FOR ALL
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- User Invitations: Organization isolation
DROP POLICY IF EXISTS "user_invitations_org_policy" ON user_invitations;
CREATE POLICY "user_invitations_org_policy" ON user_invitations
  FOR ALL
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- Pod Managers: Organization isolation
DROP POLICY IF EXISTS "pod_managers_org_policy" ON pod_managers;
CREATE POLICY "pod_managers_org_policy" ON pod_managers
  FOR ALL
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Updated at trigger for user_invitations
DROP TRIGGER IF EXISTS user_invitations_updated_at ON user_invitations;
CREATE TRIGGER user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for pod_managers
DROP TRIGGER IF EXISTS pod_managers_updated_at ON pod_managers;
CREATE TRIGGER pod_managers_updated_at
  BEFORE UPDATE ON pod_managers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. HELPER FUNCTION: Generate secure invitation token
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a secure random token
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$$;

COMMENT ON FUNCTION generate_invitation_token IS 'Generates a secure random token for user invitations';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
