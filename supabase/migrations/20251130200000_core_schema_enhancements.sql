-- ============================================================================
-- Migration: Core Schema Enhancements for USER-ROLES Framework
-- Date: 2025-11-30
-- Description: Adds system_roles, regions, pod_members tables and enhances
--              existing tables with new fields per USER-ROLES specification
-- ============================================================================

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

-- Organization tier enum
DO $$ BEGIN
  CREATE TYPE organization_tier AS ENUM ('starter', 'growth', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Pod member role enum
DO $$ BEGIN
  CREATE TYPE pod_member_role AS ENUM ('senior', 'junior');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. ORGANIZATIONS TABLE ENHANCEMENTS
-- ============================================================================

-- Add new fields to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'starter';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS health_score INTEGER;

-- Add check constraint for tier values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'organizations_tier_check'
  ) THEN
    ALTER TABLE organizations ADD CONSTRAINT organizations_tier_check
      CHECK (tier IN ('starter', 'growth', 'enterprise'));
  END IF;
END $$;

-- ============================================================================
-- 3. REGIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Region details
  name TEXT NOT NULL,
  code TEXT, -- e.g., 'US-EAST', 'APAC'
  country TEXT,
  timezone TEXT DEFAULT 'America/New_York',

  -- Manager
  manager_id UUID REFERENCES user_profiles(id),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_regions_org_id ON regions(org_id);
CREATE INDEX IF NOT EXISTS idx_regions_manager_id ON regions(manager_id);
CREATE INDEX IF NOT EXISTS idx_regions_is_active ON regions(is_active);

-- ============================================================================
-- 4. PODS TABLE ENHANCEMENTS
-- ============================================================================

-- Add region_id to pods if not exists
ALTER TABLE pods ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE pods ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE pods ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index for region lookup
CREATE INDEX IF NOT EXISTS idx_pods_region_id ON pods(region_id);

-- ============================================================================
-- 5. POD_MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS pod_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pod reference
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,

  -- User reference
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Role in pod
  role TEXT NOT NULL CHECK (role IN ('senior', 'junior')),

  -- Membership dates
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: user can only be in one role in a pod
  UNIQUE(pod_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pod_members_org_id ON pod_members(org_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_pod_id ON pod_members(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_user_id ON pod_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_is_active ON pod_members(is_active);

-- ============================================================================
-- 6. SYSTEM_ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Role identification
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,

  -- Role category
  category TEXT NOT NULL CHECK (category IN ('pod_ic', 'pod_manager', 'leadership', 'executive', 'portal', 'admin')),

  -- Hierarchy level (for permission inheritance)
  hierarchy_level INTEGER DEFAULT 0,
  -- 0 = IC, 1 = Manager, 2 = Director, 3 = VP, 4 = C-Level, 5 = Admin

  -- Role metadata
  is_system_role BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  color_code TEXT DEFAULT '#6366f1',
  icon_name TEXT,

  -- Pod association (for pod-based roles)
  pod_type TEXT CHECK (pod_type IS NULL OR pod_type IN ('recruiting', 'bench_sales', 'ta')),

  -- Permissions summary
  default_permissions TEXT[],

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_system_roles_code ON system_roles(code);
CREATE INDEX IF NOT EXISTS idx_system_roles_category ON system_roles(category);
CREATE INDEX IF NOT EXISTS idx_system_roles_pod_type ON system_roles(pod_type);

-- ============================================================================
-- 7. AUDIT_LOGS TABLE ENHANCEMENTS
-- ============================================================================

-- Add new fields to audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_type TEXT DEFAULT 'user';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS correlation_id TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS parent_audit_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS is_compliance_relevant BOOLEAN DEFAULT FALSE;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS retention_category TEXT;

-- Update existing records to populate entity_type from table_name
UPDATE audit_logs SET entity_type = table_name WHERE entity_type IS NULL AND table_name IS NOT NULL;
UPDATE audit_logs SET actor_id = user_id WHERE actor_id IS NULL AND user_id IS NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id ON audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);

-- ============================================================================
-- 8. EVENTS TABLE ENHANCEMENTS
-- ============================================================================

-- Add new fields to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info';
ALTER TABLE events ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE events ADD COLUMN IF NOT EXISTS actor_type TEXT DEFAULT 'user';
ALTER TABLE events ADD COLUMN IF NOT EXISTS actor_id UUID;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_data JSONB DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS related_entities JSONB DEFAULT '[]';
ALTER TABLE events ADD COLUMN IF NOT EXISTS correlation_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS causation_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS parent_event_id UUID;
ALTER TABLE events ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE events ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Update existing records
UPDATE events SET actor_id = user_id WHERE actor_id IS NULL AND user_id IS NOT NULL;
UPDATE events SET event_data = payload WHERE event_data = '{}' AND payload IS NOT NULL AND payload != '{}';
UPDATE events SET occurred_at = created_at WHERE occurred_at IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_entity_type_id ON events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_correlation_id ON events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_events_actor_id ON events(actor_id);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_idempotency_key ON events(idempotency_key);

-- ============================================================================
-- 9. EVENT_SUBSCRIPTIONS TABLE ENHANCEMENTS
-- ============================================================================

-- Add new fields to event_subscriptions
ALTER TABLE event_subscriptions ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE event_subscriptions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE;
ALTER TABLE event_subscriptions ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'email';
ALTER TABLE event_subscriptions ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'immediate';
ALTER TABLE event_subscriptions ADD COLUMN IF NOT EXISTS digest BOOLEAN DEFAULT FALSE;
ALTER TABLE event_subscriptions ADD COLUMN IF NOT EXISTS filter_criteria JSONB DEFAULT '{}';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_org_id ON event_subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_user_id ON event_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_channel ON event_subscriptions(channel);

-- ============================================================================
-- 10. SEED SYSTEM ROLES
-- ============================================================================

INSERT INTO system_roles (code, name, display_name, description, category, hierarchy_level, pod_type, color_code) VALUES
  -- Pod-Based IC Roles
  ('technical_recruiter', 'Technical Recruiter', 'Recruiter', 'Job fulfillment, candidate sourcing and placement', 'pod_ic', 0, 'recruiting', '#3b82f6'),
  ('bench_sales_recruiter', 'Bench Sales Recruiter', 'Bench Sales', 'Consultant marketing and bench reduction', 'pod_ic', 0, 'bench_sales', '#8b5cf6'),
  ('ta_specialist', 'TA Specialist', 'TA Specialist', 'Talent acquisition and internal hiring', 'pod_ic', 0, 'ta', '#06b6d4'),

  -- Pod-Based Manager Roles
  ('recruiting_manager', 'Recruiting Manager', 'Recruiting Manager', 'Manages recruiting pods, clears blockers', 'pod_manager', 1, 'recruiting', '#2563eb'),
  ('bench_manager', 'Bench Sales Manager', 'Bench Manager', 'Manages bench sales pods, clears blockers', 'pod_manager', 1, 'bench_sales', '#7c3aed'),
  ('ta_manager', 'TA Manager', 'TA Manager', 'Manages TA pods, clears blockers', 'pod_manager', 1, 'ta', '#0891b2'),

  -- Leadership Roles
  ('hr_manager', 'HR Manager', 'HR Manager', 'Human resources operations', 'leadership', 1, NULL, '#ec4899'),
  ('regional_director', 'Regional Director', 'Regional Director', 'Regional operations and pod oversight', 'leadership', 2, NULL, '#f97316'),

  -- Executive Roles
  ('cfo', 'Chief Financial Officer', 'CFO', 'Financial oversight and strategy', 'executive', 4, NULL, '#16a34a'),
  ('coo', 'Chief Operating Officer', 'COO', 'Operations oversight and strategy', 'executive', 4, NULL, '#dc2626'),
  ('ceo', 'Chief Executive Officer', 'CEO', 'Executive leadership', 'executive', 4, NULL, '#ca8a04'),

  -- Admin Role
  ('admin', 'System Administrator', 'Admin', 'System configuration and user management', 'admin', 5, NULL, '#64748b'),

  -- Portal Roles
  ('client_user', 'Client Portal User', 'Client', 'External client portal access', 'portal', 0, NULL, '#059669'),
  ('candidate_user', 'Candidate Portal User', 'Candidate', 'External candidate portal access', 'portal', 0, NULL, '#0d9488')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 11. RLS POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_roles ENABLE ROW LEVEL SECURITY;

-- Regions: Organization isolation
CREATE POLICY IF NOT EXISTS "regions_org_isolation" ON regions
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Pod Members: Organization isolation
CREATE POLICY IF NOT EXISTS "pod_members_org_isolation" ON pod_members
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- System Roles: Public read access (no RLS needed for read, system roles are global)
CREATE POLICY IF NOT EXISTS "system_roles_public_read" ON system_roles
  FOR SELECT
  USING (TRUE);

-- ============================================================================
-- 12. TRIGGERS
-- ============================================================================

-- Updated at trigger for regions
CREATE TRIGGER IF NOT EXISTS regions_updated_at
  BEFORE UPDATE ON regions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for pod_members
CREATE TRIGGER IF NOT EXISTS pod_members_updated_at
  BEFORE UPDATE ON pod_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for system_roles
CREATE TRIGGER IF NOT EXISTS system_roles_updated_at
  BEFORE UPDATE ON system_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
