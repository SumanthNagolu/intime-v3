-- ============================================================================
-- AUDIT LOGS & SECURITY MONITORING TABLES
-- UC-ADMIN-008 Implementation
-- ============================================================================

-- 1. Enhance audit_logs table with additional fields
-- ============================================================================

-- Add severity column (INFO, LOW, MEDIUM, HIGH, CRITICAL)
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'INFO'
CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

-- Add result column (SUCCESS, FAILURE)
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS result TEXT DEFAULT 'SUCCESS'
CHECK (result IN ('SUCCESS', 'FAILURE'));

-- Add event_id for sequential numbering (useful for exports/references)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'event_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN event_id BIGSERIAL;
  END IF;
END $$;

-- Add session tracking
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Add request context fields
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS ip_address INET;

ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS user_agent TEXT;

ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS request_method TEXT;

ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS request_path TEXT;

ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS response_code INTEGER;

ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;

-- Add object_name for display purposes
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS object_name TEXT;

-- 2. Create security_alerts table
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Alert identification
  alert_type TEXT NOT NULL, -- 'brute_force', 'unusual_location', 'privilege_escalation', 'mass_export', 'after_hours'
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

  -- Alert content
  title TEXT NOT NULL,
  description TEXT,

  -- Related data
  related_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  related_user_email TEXT,
  related_events JSONB DEFAULT '[]'::jsonb, -- Array of audit_log event_ids

  -- Investigation workflow
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Risk assessment
  risk_level TEXT CHECK (risk_level IN ('LOW', 'LOW_MEDIUM', 'MEDIUM', 'MEDIUM_HIGH', 'HIGH')),
  risk_indicators JSONB DEFAULT '{}'::jsonb,

  -- Recommended actions
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  actions_taken JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create alert_rules table
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Rule identification
  name TEXT NOT NULL,
  description TEXT,

  -- Trigger conditions
  event_type TEXT NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'PERMISSION_CHANGE'
  result_condition TEXT DEFAULT 'ANY' CHECK (result_condition IN ('ANY', 'SUCCESS', 'FAILURE')),
  threshold_count INTEGER NOT NULL DEFAULT 5,
  time_window_minutes INTEGER NOT NULL DEFAULT 10,

  -- Additional conditions (optional)
  object_type TEXT, -- Filter by object type
  additional_conditions JSONB DEFAULT '{}'::jsonb, -- Custom conditions

  -- Alert configuration
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

  -- Notification channels
  notification_channels JSONB DEFAULT '{"dashboard": true}'::jsonb,
  -- Structure: { "dashboard": true, "email": ["admin@example.com"], "slack": "#channel" }

  -- Auto-actions
  auto_action TEXT CHECK (auto_action IN ('none', 'lock_account', 'block_ip', 'require_2fa', 'notify_manager')),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Unique constraint on name per org
  CONSTRAINT unique_alert_rule_name_per_org UNIQUE (org_id, name)
);

-- 4. Create indexes for performance
-- ============================================================================

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_result ON audit_logs(result);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_id ON audit_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Composite index for common query pattern (org + time range)
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(org_id, created_at DESC);

-- Security alerts indexes
CREATE INDEX IF NOT EXISTS idx_security_alerts_org ON security_alerts(org_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created ON security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user ON security_alerts(related_user_id);

-- Alert rules indexes
CREATE INDEX IF NOT EXISTS idx_alert_rules_org ON alert_rules(org_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alert_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_alert_rules_event_type ON alert_rules(event_type);

-- 5. Enable RLS
-- ============================================================================

ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for security_alerts
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view security alerts in their org" ON security_alerts;
DROP POLICY IF EXISTS "Admins can manage security alerts in their org" ON security_alerts;

CREATE POLICY "Users can view security alerts in their org"
ON security_alerts FOR SELECT
USING (
  org_id IN (SELECT org_id FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage security alerts"
ON security_alerts FOR ALL
USING (
  org_id IN (SELECT org_id FROM user_profiles WHERE id = auth.uid())
);

-- 7. RLS Policies for alert_rules
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view alert rules in their org" ON alert_rules;
DROP POLICY IF EXISTS "Admins can manage alert rules in their org" ON alert_rules;

CREATE POLICY "Users can view alert rules in their org"
ON alert_rules FOR SELECT
USING (
  org_id IN (SELECT org_id FROM user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage alert rules"
ON alert_rules FOR ALL
USING (
  org_id IN (SELECT org_id FROM user_profiles WHERE id = auth.uid())
);

-- 8. Update trigger for updated_at
-- ============================================================================

-- Create function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Security alerts trigger
DROP TRIGGER IF EXISTS update_security_alerts_updated_at ON security_alerts;
CREATE TRIGGER update_security_alerts_updated_at
  BEFORE UPDATE ON security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Alert rules trigger
DROP TRIGGER IF EXISTS update_alert_rules_updated_at ON alert_rules;
CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Function to get audit stats for dashboard
-- ============================================================================

CREATE OR REPLACE FUNCTION get_audit_stats(
  p_org_id UUID,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  total_events BIGINT,
  failed_logins BIGINT,
  security_alerts BIGINT,
  data_exports BIGINT,
  failed_login_rate NUMERIC,
  permission_changes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE action = 'LOGIN' AND result = 'FAILURE') AS failed_logins_count,
      COUNT(*) FILTER (WHERE action = 'LOGIN') AS total_logins,
      COUNT(*) FILTER (WHERE action = 'EXPORT') AS exports,
      COUNT(*) FILTER (WHERE action IN ('PERMISSION_CHANGE', 'ROLE_CHANGE')) AS perm_changes
    FROM audit_logs
    WHERE org_id = p_org_id
      AND created_at >= NOW() - (p_hours || ' hours')::INTERVAL
  ),
  alerts AS (
    SELECT COUNT(*) AS alert_count
    FROM security_alerts
    WHERE org_id = p_org_id
      AND status IN ('open', 'investigating')
  )
  SELECT
    s.total AS total_events,
    s.failed_logins_count AS failed_logins,
    a.alert_count AS security_alerts,
    s.exports AS data_exports,
    CASE WHEN s.total_logins > 0
      THEN ROUND((s.failed_logins_count::NUMERIC / s.total_logins::NUMERIC) * 100, 2)
      ELSE 0
    END AS failed_login_rate,
    s.perm_changes AS permission_changes
  FROM stats s, alerts a;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant access to service role
-- ============================================================================

GRANT ALL ON security_alerts TO service_role;
GRANT ALL ON alert_rules TO service_role;
GRANT EXECUTE ON FUNCTION get_audit_stats TO service_role;
