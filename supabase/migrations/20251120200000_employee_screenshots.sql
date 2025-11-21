-- Migration: Employee Screenshots Table (Audit & Compliance)
-- Story: AI-PROD-001
-- Description: Background service screenshot capture for audit compliance

-- Employee screenshots metadata table
CREATE TABLE IF NOT EXISTS employee_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- File storage
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_bucket TEXT DEFAULT 'employee-screenshots',

  -- Capture metadata
  captured_at TIMESTAMPTZ NOT NULL,
  machine_name TEXT,
  os_type TEXT, -- 'windows', 'macos', 'linux'
  active_window_title TEXT,

  -- AI analysis (populated by AI-PROD-002)
  analyzed BOOLEAN DEFAULT false,
  activity_category TEXT, -- 'coding', 'meeting', 'email', 'idle', 'social_media', 'other'
  confidence FLOAT, -- 0-100
  analyzed_at TIMESTAMPTZ,

  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete for audit compliance
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_screenshots_user_id ON employee_screenshots(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screenshots_captured_at ON employee_screenshots(captured_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screenshots_analyzed ON employee_screenshots(analyzed) WHERE NOT analyzed AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screenshots_user_date ON employee_screenshots(user_id, captured_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screenshots_machine ON employee_screenshots(machine_name);
CREATE INDEX IF NOT EXISTS idx_screenshots_category ON employee_screenshots(activity_category) WHERE analyzed = true;

-- Row Level Security
ALTER TABLE employee_screenshots ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert (background service uses service key)
-- No user policies - employees don't access this directly

-- Policy: Admins can access all screenshots
CREATE POLICY screenshots_admin_select ON employee_screenshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Managers can see their team's aggregated data only (future feature)
-- CREATE POLICY screenshots_manager_team ON employee_screenshots
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_profiles up
--       WHERE up.id = employee_screenshots.user_id
--       AND up.manager_id = auth.uid()
--     )
--     AND analyzed = true
--   );

-- Function: Automatic cleanup of old screenshots (90-day retention for compliance)
CREATE OR REPLACE FUNCTION cleanup_old_screenshots()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Soft delete screenshots older than 90 days
  UPDATE employee_screenshots
  SET deleted_at = NOW()
  WHERE captured_at < NOW() - INTERVAL '90 days'
  AND deleted_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Permanently delete screenshots older than 1 year (hard delete)
  DELETE FROM employee_screenshots
  WHERE deleted_at < NOW() - INTERVAL '1 year';

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_employee_screenshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER trigger_employee_screenshots_updated_at
  BEFORE UPDATE ON employee_screenshots
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_screenshots_updated_at();

-- Function: Get screenshot statistics for a user
CREATE OR REPLACE FUNCTION get_screenshot_stats(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE(
  total_screenshots INTEGER,
  analyzed_screenshots INTEGER,
  top_activity TEXT,
  total_hours FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_screenshots,
    COUNT(*) FILTER (WHERE analyzed = true)::INTEGER as analyzed_screenshots,
    MODE() WITHIN GROUP (ORDER BY activity_category) as top_activity,
    (COUNT(*) * 30.0 / 3600.0)::FLOAT as total_hours -- 30 seconds per screenshot
  FROM employee_screenshots
  WHERE user_id = p_user_id
  AND captured_at BETWEEN p_start_date AND p_end_date
  AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment the table
COMMENT ON TABLE employee_screenshots IS 'Employee productivity screenshots for audit and compliance (mandatory background service)';
COMMENT ON COLUMN employee_screenshots.filename IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN employee_screenshots.machine_name IS 'Hostname of the machine where screenshot was captured';
COMMENT ON COLUMN employee_screenshots.active_window_title IS 'Title of active window at capture time (for context)';
COMMENT ON COLUMN employee_screenshots.analyzed IS 'Whether AI has classified this screenshot';
COMMENT ON COLUMN employee_screenshots.activity_category IS 'AI-classified activity type';
COMMENT ON COLUMN employee_screenshots.confidence IS 'AI confidence score (0-100)';
COMMENT ON COLUMN employee_screenshots.deleted_at IS 'Soft delete timestamp for audit trail (90-day retention)';
