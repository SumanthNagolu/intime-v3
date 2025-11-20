-- Migration: 007_add_multi_tenancy.sql
-- Description: Add multi-tenancy support with organizations table and org_id fields
-- Author: InTime Development Team
-- Date: 2025-11-19

-- =============================================================================
-- ORGANIZATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic information
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier (e.g., 'intime-solutions')
  legal_name TEXT, -- Official legal business name

  -- Contact information
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',

  -- Billing
  billing_email TEXT,
  tax_id TEXT, -- EIN, VAT, etc.

  -- Subscription & limits
  subscription_tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'startup', 'business', 'enterprise'
  subscription_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  max_users INTEGER DEFAULT 5,
  max_candidates INTEGER DEFAULT 100,
  max_storage_gb INTEGER DEFAULT 10,

  -- Features
  features JSONB DEFAULT '{}', -- Feature flags per organization
  settings JSONB DEFAULT '{}', -- Organization-specific settings

  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'deleted'
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step TEXT, -- Current step if not completed

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_tier ON organizations(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_organizations_deleted_at ON organizations(deleted_at) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE organizations IS 'Multi-tenant organizations (staffing companies using InTime)';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly identifier for the organization';
COMMENT ON COLUMN organizations.subscription_tier IS 'Pricing tier: free, startup, business, enterprise';
COMMENT ON COLUMN organizations.max_users IS 'Maximum number of users allowed in this organization';

-- =============================================================================
-- ADD ORG_ID TO EXISTING TABLES
-- =============================================================================

-- User Profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'org_id') THEN
        ALTER TABLE user_profiles ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        CREATE INDEX idx_user_profiles_org_id ON user_profiles(org_id);
        COMMENT ON COLUMN user_profiles.org_id IS 'Organization this user belongs to (multi-tenancy)';
    END IF;
END $$;

-- Audit Logs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'org_id') THEN
        ALTER TABLE audit_logs ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
        COMMENT ON COLUMN audit_logs.org_id IS 'Organization this audit log belongs to';
    END IF;
END $$;

-- Events
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'org_id') THEN
        ALTER TABLE events ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        CREATE INDEX idx_events_org_id ON events(org_id);
        COMMENT ON COLUMN events.org_id IS 'Organization this event belongs to';
    END IF;
END $$;

-- Event Delivery Log
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_delivery_log' AND column_name = 'org_id') THEN
        ALTER TABLE event_delivery_log ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        CREATE INDEX idx_event_delivery_log_org_id ON event_delivery_log(org_id);
        COMMENT ON COLUMN event_delivery_log.org_id IS 'Organization this delivery log belongs to';
    END IF;
END $$;

-- Project Timeline (AI Memory)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_timeline' AND column_name = 'org_id') THEN
        ALTER TABLE project_timeline ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        CREATE INDEX idx_project_timeline_org_id ON project_timeline(org_id);
        COMMENT ON COLUMN project_timeline.org_id IS 'Organization this timeline entry belongs to';
    END IF;
END $$;

-- Session Metadata (AI Memory)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_metadata' AND column_name = 'org_id') THEN
        ALTER TABLE session_metadata ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        CREATE INDEX idx_session_metadata_org_id ON session_metadata(org_id);
        COMMENT ON COLUMN session_metadata.org_id IS 'Organization this session belongs to';
    END IF;
END $$;

-- =============================================================================
-- UPDATE RLS POLICIES FOR MULTI-TENANCY
-- =============================================================================

-- Helper function: Get user's organization ID
CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT org_id
  FROM user_profiles
  WHERE id = auth_user_id();
$$;

COMMENT ON FUNCTION auth_user_org_id IS 'Returns the organization ID of the current authenticated user';

-- Helper function: Check if user belongs to organization
CREATE OR REPLACE FUNCTION user_belongs_to_org(check_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth_user_id()
      AND org_id = check_org_id
  );
$$;

COMMENT ON FUNCTION user_belongs_to_org IS 'Checks if the current user belongs to the specified organization';

-- =============================================================================
-- UPDATE EXISTING RLS POLICIES
-- =============================================================================

-- User Profiles: Add org_id check to existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (
    id = auth_user_id()
    OR user_is_admin()
  );

DROP POLICY IF EXISTS "Users can view profiles in their org" ON user_profiles;
CREATE POLICY "Users can view profiles in their org"
  ON user_profiles
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    AND org_id IS NOT NULL
  );

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (
    id = auth_user_id()
    OR user_is_admin()
  )
  WITH CHECK (
    id = auth_user_id()
    OR user_is_admin()
  );

-- Audit Logs: Restrict to same organization
DROP POLICY IF EXISTS "Users can view audit logs in their org" ON audit_logs;
CREATE POLICY "Users can view audit logs in their org"
  ON audit_logs
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- Events: Restrict to same organization
DROP POLICY IF EXISTS "Users can view events in their org" ON events;
CREATE POLICY "Users can view events in their org"
  ON events
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- Event Delivery Log: Restrict to same organization
DROP POLICY IF EXISTS "Users can view delivery logs in their org" ON event_delivery_log;
CREATE POLICY "Users can view delivery logs in their org"
  ON event_delivery_log
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- Project Timeline: Restrict to same organization
DROP POLICY IF EXISTS "Users can view timeline in their org" ON project_timeline;
CREATE POLICY "Users can view timeline in their org"
  ON project_timeline
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- Session Metadata: Restrict to same organization
DROP POLICY IF EXISTS "Users can view sessions in their org" ON session_metadata;
CREATE POLICY "Users can view sessions in their org"
  ON session_metadata
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- =============================================================================
-- ORGANIZATIONS TABLE RLS POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can view their own organization
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can view their own organization"
  ON organizations
  FOR SELECT
  USING (
    id = auth_user_org_id()
    OR user_is_admin()
  );

-- Only admins can update organizations
DROP POLICY IF EXISTS "Only admins can update organizations" ON organizations;
CREATE POLICY "Only admins can update organizations"
  ON organizations
  FOR UPDATE
  USING (
    user_is_admin()
    OR (
      id = auth_user_org_id()
      AND user_has_role('org_admin')
    )
  );

-- Only system admins can create organizations
DROP POLICY IF EXISTS "Only admins can create organizations" ON organizations;
CREATE POLICY "Only admins can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (
    user_is_admin()
  );

-- Only system admins can delete organizations (soft delete)
DROP POLICY IF EXISTS "Only admins can delete organizations" ON organizations;
CREATE POLICY "Only admins can delete organizations"
  ON organizations
  FOR DELETE
  USING (
    user_is_admin()
  );

-- =============================================================================
-- DATA MIGRATION
-- =============================================================================

-- Create a default organization for existing data (InTime Solutions)
INSERT INTO organizations (
  id,
  name,
  slug,
  legal_name,
  email,
  subscription_tier,
  subscription_status,
  max_users,
  max_candidates,
  max_storage_gb,
  status,
  onboarding_completed
) VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'InTime Solutions',
  'intime-solutions',
  'InTime Solutions LLC',
  'admin@intimeesolutions.com',
  'enterprise',
  'active',
  999,
  999999,
  1000,
  'active',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- Assign all existing users to the default organization
UPDATE user_profiles
SET org_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE org_id IS NULL;

-- Assign all existing audit logs to the default organization
UPDATE audit_logs
SET org_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE org_id IS NULL;

-- Assign all existing events to the default organization
UPDATE events
SET org_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE org_id IS NULL;

-- Assign all existing event delivery logs to the default organization
UPDATE event_delivery_log
SET org_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE org_id IS NULL;

-- Assign all existing project timeline entries to the default organization
UPDATE project_timeline
SET org_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE org_id IS NULL;

-- Assign all existing session metadata to the default organization
UPDATE session_metadata
SET org_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE org_id IS NULL;

-- =============================================================================
-- MAKE ORG_ID NOT NULL AFTER DATA MIGRATION
-- =============================================================================

-- Now that all existing records have org_id, make it required
ALTER TABLE user_profiles
  ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE audit_logs
  ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE events
  ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE event_delivery_log
  ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE project_timeline
  ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE session_metadata
  ALTER COLUMN org_id SET NOT NULL;

-- =============================================================================
-- VALIDATION VIEWS
-- =============================================================================

CREATE OR REPLACE VIEW v_multi_tenancy_status AS
SELECT
  'organizations' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT id) AS unique_orgs,
  COUNT(*) FILTER (WHERE status = 'active') AS active_orgs,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS soft_deleted_orgs
FROM organizations
UNION ALL
SELECT
  'user_profiles' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(*) FILTER (WHERE org_id IS NOT NULL) AS records_with_org,
  NULL AS soft_deleted
FROM user_profiles
UNION ALL
SELECT
  'audit_logs' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(*) FILTER (WHERE org_id IS NOT NULL) AS records_with_org,
  NULL AS soft_deleted
FROM audit_logs
UNION ALL
SELECT
  'events' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(*) FILTER (WHERE org_id IS NOT NULL) AS records_with_org,
  NULL AS soft_deleted
FROM events
UNION ALL
SELECT
  'event_delivery_log' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(*) FILTER (WHERE org_id IS NOT NULL) AS records_with_org,
  NULL AS soft_deleted
FROM event_delivery_log
UNION ALL
SELECT
  'project_timeline' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(*) FILTER (WHERE org_id IS NOT NULL) AS records_with_org,
  NULL AS soft_deleted
FROM project_timeline
UNION ALL
SELECT
  'session_metadata' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(*) FILTER (WHERE org_id IS NOT NULL) AS records_with_org,
  NULL AS soft_deleted
FROM session_metadata;

COMMENT ON VIEW v_multi_tenancy_status IS 'Validation view showing multi-tenancy data distribution across tables';

-- View: Organization with user count
CREATE OR REPLACE VIEW v_organization_stats AS
SELECT
  o.id,
  o.name,
  o.slug,
  o.subscription_tier,
  o.subscription_status,
  o.status,
  o.max_users,
  COUNT(DISTINCT up.id) AS current_users,
  o.max_users - COUNT(DISTINCT up.id) AS available_user_slots,
  o.max_candidates,
  COUNT(DISTINCT up.id) FILTER (WHERE up.candidate_status IS NOT NULL) AS current_candidates,
  o.created_at,
  o.updated_at
FROM organizations o
LEFT JOIN user_profiles up ON up.org_id = o.id AND up.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id;

COMMENT ON VIEW v_organization_stats IS 'Organization statistics including user counts and capacity';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger: Update updated_at on organizations
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_organizations ON organizations;
CREATE TRIGGER set_timestamp_organizations
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
