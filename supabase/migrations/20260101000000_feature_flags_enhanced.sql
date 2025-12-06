-- ============================================================================
-- Migration: Feature Flags Enhanced
-- Date: 2025-12-06
-- Description: Extend feature_flags table with rollout strategies, usage tracking,
--              and feedback collection for UC-ADMIN-014
-- ============================================================================

-- =============================================================================
-- 1. EXTEND FEATURE FLAGS TABLE WITH NEW COLUMNS
-- =============================================================================

-- Add state column (replaces default_enabled logic)
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'disabled'
  CHECK (state IN ('enabled', 'disabled', 'beta', 'internal', 'percentage', 'coming_soon'));

-- Add rollout strategy column
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS rollout_strategy TEXT NOT NULL DEFAULT 'none'
  CHECK (rollout_strategy IN ('all', 'roles', 'users', 'percentage', 'pods', 'none'));

-- Add rollout percentage (0-100)
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS rollout_percentage INTEGER DEFAULT 0
  CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100);

-- Add user/pod targeting arrays
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS enabled_users UUID[] DEFAULT '{}';

ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS enabled_pods UUID[] DEFAULT '{}';

-- Add enabled_roles array (convert from join table for simpler queries)
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS enabled_roles UUID[] DEFAULT '{}';

-- Add category column
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add UI visibility options
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN DEFAULT true;

ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS show_new_badge BOOLEAN DEFAULT false;

ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS show_beta_badge BOOLEAN DEFAULT false;

-- Add usage and feedback options
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS log_usage BOOLEAN DEFAULT true;

ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS show_feedback_prompt BOOLEAN DEFAULT false;

-- Add schedule and safeguards (JSONB for flexibility)
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS rollout_schedule JSONB DEFAULT '[]';

ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS safeguards JSONB DEFAULT '{}';

ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add audit fields
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);

ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES user_profiles(id);

-- =============================================================================
-- 2. RENAME CODE TO KEY FOR CONSISTENCY WITH SPEC
-- =============================================================================

-- Note: Using DO block to make rename idempotent
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feature_flags' AND column_name = 'code'
  ) THEN
    ALTER TABLE feature_flags RENAME COLUMN code TO key;
  END IF;
END $$;

-- =============================================================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_feature_flags_org_key ON feature_flags(org_id, key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_org_state ON feature_flags(org_id, state);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled_users ON feature_flags USING GIN(enabled_users);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled_pods ON feature_flags USING GIN(enabled_pods);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled_roles ON feature_flags USING GIN(enabled_roles);

-- =============================================================================
-- 4. CREATE FEATURE FLAG USAGE TABLE (ANALYTICS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS feature_flag_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  was_enabled BOOLEAN NOT NULL,
  context JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_feature_flag_usage_flag ON feature_flag_usage(feature_flag_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flag_usage_user ON feature_flag_usage(user_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flag_usage_org ON feature_flag_usage(org_id, checked_at DESC);

-- =============================================================================
-- 5. CREATE FEATURE FLAG FEEDBACK TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS feature_flag_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flag_feedback_flag ON feature_flag_feedback(feature_flag_id);

-- =============================================================================
-- 6. CREATE FEATURE FLAG CATEGORIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS feature_flag_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (org_id, name)
);

-- Seed default categories (org_id NULL = global categories)
INSERT INTO feature_flag_categories (org_id, name, display_order) VALUES
  (NULL, 'AI & Automation', 1),
  (NULL, 'Communication', 2),
  (NULL, 'Reporting', 3),
  (NULL, 'Workflow', 4),
  (NULL, 'Integration', 5),
  (NULL, 'UI/UX', 6),
  (NULL, 'Experimental', 7)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 7. ENABLE RLS ON NEW TABLES
-- =============================================================================

ALTER TABLE feature_flag_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "feature_flag_usage_select" ON feature_flag_usage;
DROP POLICY IF EXISTS "feature_flag_usage_insert" ON feature_flag_usage;
DROP POLICY IF EXISTS "feature_flag_feedback_select" ON feature_flag_feedback;
DROP POLICY IF EXISTS "feature_flag_feedback_insert" ON feature_flag_feedback;
DROP POLICY IF EXISTS "feature_flag_categories_select" ON feature_flag_categories;

-- Usage table: Users can view own org usage, insert own usage
CREATE POLICY "feature_flag_usage_select" ON feature_flag_usage
  FOR SELECT
  USING (
    org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

CREATE POLICY "feature_flag_usage_insert" ON feature_flag_usage
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Feedback table: Users can view org feedback, insert own feedback
CREATE POLICY "feature_flag_feedback_select" ON feature_flag_feedback
  FOR SELECT
  USING (
    org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

CREATE POLICY "feature_flag_feedback_insert" ON feature_flag_feedback
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Categories: Public read for global, org-scoped for custom
CREATE POLICY "feature_flag_categories_select" ON feature_flag_categories
  FOR SELECT
  USING (
    org_id IS NULL OR org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

-- =============================================================================
-- 8. MIGRATE EXISTING DATA
-- =============================================================================

-- Migrate existing feature_flag_roles data to enabled_roles array
UPDATE feature_flags f SET enabled_roles = (
  SELECT COALESCE(array_agg(ffr.role_id), '{}')
  FROM feature_flag_roles ffr
  WHERE ffr.feature_flag_id = f.id AND ffr.enabled = true
)
WHERE enabled_roles = '{}' OR enabled_roles IS NULL;

-- Update state based on existing default_enabled
UPDATE feature_flags
SET state = CASE
  WHEN default_enabled = true THEN 'enabled'
  ELSE 'disabled'
END,
rollout_strategy = CASE
  WHEN default_enabled = true AND (array_length(enabled_roles, 1) IS NULL OR array_length(enabled_roles, 1) = 0) THEN 'all'
  WHEN array_length(enabled_roles, 1) > 0 THEN 'roles'
  ELSE 'none'
END
WHERE state = 'disabled' AND rollout_strategy = 'none';

-- =============================================================================
-- 9. ADD UPDATE POLICIES FOR FEATURE FLAGS
-- =============================================================================

DROP POLICY IF EXISTS "feature_flags_org_update" ON feature_flags;
DROP POLICY IF EXISTS "feature_flags_org_delete" ON feature_flags;

CREATE POLICY "feature_flags_org_update" ON feature_flags
  FOR UPDATE
  USING (
    is_global = false AND org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

CREATE POLICY "feature_flags_org_delete" ON feature_flags
  FOR DELETE
  USING (
    is_global = false AND org_id = COALESCE(
      (SELECT org_id FROM user_profiles WHERE id = auth.uid()),
      (auth.jwt() ->> 'org_id')::uuid
    )
  );

-- =============================================================================
-- 10. GRANTS
-- =============================================================================

GRANT SELECT, INSERT ON feature_flag_usage TO authenticated;
GRANT SELECT, INSERT ON feature_flag_feedback TO authenticated;
GRANT SELECT ON feature_flag_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON feature_flag_categories TO service_role;

-- Allow authenticated users to update/delete their own org's feature flags
GRANT UPDATE, DELETE ON feature_flags TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
