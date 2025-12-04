-- ============================================================================
-- Migration: Enhanced Pods Schema for Admin Portal
-- Date: 2025-12-04
-- Description: Adds manager support, expanded pod types, and sprint metrics
-- ============================================================================

-- ============================================================================
-- 1. ENHANCE PODS TABLE
-- ============================================================================

-- Add manager_id to pods (the primary pod manager)
ALTER TABLE pods ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES user_profiles(id);

-- Add description field
ALTER TABLE pods ADD COLUMN IF NOT EXISTS description TEXT;

-- Update pod_type constraint to include 'hr' and 'mixed'
-- First drop the existing check if any, then add new one
DO $$
BEGIN
  -- Remove old constraint if exists
  ALTER TABLE pods DROP CONSTRAINT IF EXISTS pods_pod_type_check;

  -- Add new constraint with expanded types
  ALTER TABLE pods ADD CONSTRAINT pods_pod_type_check
    CHECK (pod_type IN ('recruiting', 'bench_sales', 'ta', 'hr', 'mixed'));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add index for manager lookup
CREATE INDEX IF NOT EXISTS idx_pods_manager_id ON pods(manager_id);

-- ============================================================================
-- 2. POD_MANAGERS TABLE (Manager History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pod_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pod reference
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,

  -- Manager reference
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Manager type
  is_primary BOOLEAN DEFAULT true,

  -- Assignment tracking
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  removed_at TIMESTAMPTZ,
  removed_by UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pod_managers_org_id ON pod_managers(org_id);
CREATE INDEX IF NOT EXISTS idx_pod_managers_pod_id ON pod_managers(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_managers_user_id ON pod_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_pod_managers_active ON pod_managers(pod_id) WHERE removed_at IS NULL;

-- Unique constraint: one primary manager per pod at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_pod_managers_primary
  ON pod_managers(pod_id)
  WHERE is_primary = true AND removed_at IS NULL;

-- ============================================================================
-- 3. POD_SPRINT_METRICS TABLE
-- ============================================================================

-- Drop incomplete table if exists (from partial migration)
DROP TABLE IF EXISTS pod_sprint_metrics CASCADE;

CREATE TABLE pod_sprint_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pod reference
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,

  -- Sprint period
  sprint_number INTEGER NOT NULL,
  sprint_start_date DATE NOT NULL,
  sprint_end_date DATE NOT NULL,

  -- Targets
  placements_target INTEGER DEFAULT 2,
  placements_stretch_target INTEGER DEFAULT 3,
  submissions_target INTEGER DEFAULT 20,
  submissions_stretch_target INTEGER DEFAULT 30,
  client_meetings_target INTEGER DEFAULT 5,
  new_candidates_target INTEGER DEFAULT 30,

  -- Actuals (updated by triggers or batch jobs)
  placements_actual INTEGER DEFAULT 0,
  submissions_actual INTEGER DEFAULT 0,
  client_meetings_actual INTEGER DEFAULT 0,
  new_candidates_actual INTEGER DEFAULT 0,

  -- Calculated metrics
  target_achievement_pct NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN placements_target > 0
      THEN ROUND((placements_actual::numeric / placements_target * 100), 2)
      ELSE 0
    END
  ) STORED,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one sprint number per pod
  UNIQUE(pod_id, sprint_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pod_sprint_metrics_org_id ON pod_sprint_metrics(org_id);
CREATE INDEX IF NOT EXISTS idx_pod_sprint_metrics_pod_id ON pod_sprint_metrics(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_sprint_metrics_dates ON pod_sprint_metrics(sprint_start_date, sprint_end_date);
CREATE INDEX IF NOT EXISTS idx_pod_sprint_metrics_active ON pod_sprint_metrics(pod_id) WHERE status = 'active';

-- ============================================================================
-- 4. UPDATE PODS TABLE WITH SPRINT CONFIG DEFAULTS
-- ============================================================================

-- Add sprint configuration fields if not exist
DO $$
BEGIN
  -- Add sprint_start_day with check constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pods' AND column_name = 'sprint_start_day'
  ) THEN
    ALTER TABLE pods ADD COLUMN sprint_start_day TEXT DEFAULT 'monday';
    ALTER TABLE pods ADD CONSTRAINT pods_sprint_start_day_check
      CHECK (sprint_start_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));
  END IF;
END $$;

ALTER TABLE pods ADD COLUMN IF NOT EXISTS send_sprint_summary BOOLEAN DEFAULT true;
ALTER TABLE pods ADD COLUMN IF NOT EXISTS send_midpoint_check BOOLEAN DEFAULT true;
ALTER TABLE pods ADD COLUMN IF NOT EXISTS alert_if_below_target BOOLEAN DEFAULT true;

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE pod_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_sprint_metrics ENABLE ROW LEVEL SECURITY;

-- Pod Managers: Organization isolation (using subquery for org_id)
DO $$
BEGIN
  DROP POLICY IF EXISTS "pod_managers_org_isolation" ON pod_managers;
  CREATE POLICY "pod_managers_org_isolation" ON pod_managers
    FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid() LIMIT 1));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Pod Managers: Admin/HR write access
DO $$
BEGIN
  DROP POLICY IF EXISTS "pod_managers_admin_write" ON pod_managers;
  CREATE POLICY "pod_managers_admin_write" ON pod_managers
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles up
        LEFT JOIN roles r ON up.role_id = r.id
        WHERE up.auth_id = auth.uid()
        AND (r.name IN ('admin', 'hr', 'hr_manager') OR up.is_admin = true)
      )
    );
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Pod Sprint Metrics: Organization isolation
DO $$
BEGIN
  DROP POLICY IF EXISTS "pod_sprint_metrics_org_isolation" ON pod_sprint_metrics;
  CREATE POLICY "pod_sprint_metrics_org_isolation" ON pod_sprint_metrics
    FOR ALL
    USING (org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid() LIMIT 1));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Pod Sprint Metrics: Employee read access
DO $$
BEGIN
  DROP POLICY IF EXISTS "pod_sprint_metrics_employee_read" ON pod_sprint_metrics;
  CREATE POLICY "pod_sprint_metrics_employee_read" ON pod_sprint_metrics
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles WHERE auth_id = auth.uid()
      )
    );
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Pod Sprint Metrics: Admin/Manager write access
DO $$
BEGIN
  DROP POLICY IF EXISTS "pod_sprint_metrics_admin_write" ON pod_sprint_metrics;
  CREATE POLICY "pod_sprint_metrics_admin_write" ON pod_sprint_metrics
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles up
        LEFT JOIN roles r ON up.role_id = r.id
        WHERE up.auth_id = auth.uid()
        AND (r.name IN ('admin', 'hr', 'hr_manager', 'recruiting_manager', 'bench_manager', 'ta_manager') OR up.is_admin = true)
      )
    );
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Updated at trigger for pod_managers
DROP TRIGGER IF EXISTS pod_managers_updated_at ON pod_managers;
CREATE TRIGGER pod_managers_updated_at
  BEFORE UPDATE ON pod_managers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for pod_sprint_metrics
DROP TRIGGER IF EXISTS pod_sprint_metrics_updated_at ON pod_sprint_metrics;
CREATE TRIGGER pod_sprint_metrics_updated_at
  BEFORE UPDATE ON pod_sprint_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. COMMENTS
-- ============================================================================

COMMENT ON TABLE pod_managers IS 'Historical record of pod manager assignments';
COMMENT ON TABLE pod_sprint_metrics IS 'Sprint-based performance metrics for pods';
COMMENT ON COLUMN pods.manager_id IS 'Current primary manager of the pod';
COMMENT ON COLUMN pods.sprint_start_day IS 'Day of week when sprints begin';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
