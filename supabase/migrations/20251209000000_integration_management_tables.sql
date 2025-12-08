-- =============================================
-- INTEGRATION MANAGEMENT TABLES
-- Part 1: Core Infrastructure
-- =============================================

-- Enable pg_crypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- INTEGRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- email, calendar, hris, sms, video, storage, etc.
  provider VARCHAR(50) NOT NULL, -- sendgrid, resend, google, twilio, zoom, etc.
  name VARCHAR(100) NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}', -- Encrypted sensitive fields
  status VARCHAR(20) NOT NULL DEFAULT 'inactive', -- active, inactive, error
  is_primary BOOLEAN DEFAULT false, -- Primary integration for this type
  last_health_check TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  health_status VARCHAR(20) DEFAULT 'unknown', -- healthy, degraded, unhealthy, unknown
  error_message TEXT,
  error_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Non-sensitive metadata (rate limits, usage, etc.)
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes (use IF NOT EXISTS for idempotency)
CREATE INDEX IF NOT EXISTS idx_integrations_org_id ON integrations(org_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_org_type ON integrations(org_id, type);
CREATE INDEX IF NOT EXISTS idx_integrations_org_primary ON integrations(org_id, type, is_primary) WHERE is_primary = true AND deleted_at IS NULL;

-- Unique constraint: only one primary per type per org
CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_unique_primary
  ON integrations(org_id, type)
  WHERE is_primary = true AND deleted_at IS NULL;

-- ============================================
-- INTEGRATION HEALTH LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integration_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  check_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- manual, scheduled, auto
  status VARCHAR(20) NOT NULL, -- success, failure, timeout
  response_time_ms INTEGER,
  error_message TEXT,
  error_code VARCHAR(50),
  details JSONB DEFAULT '{}', -- Additional diagnostic info
  checked_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (use IF NOT EXISTS for idempotency)
CREATE INDEX IF NOT EXISTS idx_health_logs_integration ON integration_health_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_org ON integration_health_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_created ON integration_health_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_logs_status ON integration_health_logs(status);

-- ============================================
-- INTEGRATION TYPES LOOKUP (For UI)
-- ============================================
CREATE TABLE IF NOT EXISTS integration_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- communication, productivity, hr, finance
  icon VARCHAR(50), -- Lucide icon name
  config_schema JSONB, -- JSON schema for config validation
  providers JSONB DEFAULT '[]', -- Available providers for this type
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Seed integration types
INSERT INTO integration_types (id, name, description, category, icon, providers, sort_order) VALUES
  ('email', 'Email', 'Send transactional and marketing emails', 'communication', 'Mail', '["sendgrid", "resend", "smtp", "ses", "mailgun"]', 1),
  ('sms', 'SMS/Text', 'Send SMS notifications', 'communication', 'MessageSquare', '["twilio", "vonage", "plivo"]', 2),
  ('calendar', 'Calendar', 'Sync calendars for scheduling', 'productivity', 'Calendar', '["google", "microsoft", "caldav"]', 3),
  ('video', 'Video Conferencing', 'Schedule and host video meetings', 'productivity', 'Video', '["zoom", "teams", "google_meet"]', 4),
  ('storage', 'File Storage', 'Store and manage files', 'productivity', 'HardDrive', '["s3", "gcs", "azure_blob", "supabase"]', 5),
  ('hris', 'HRIS', 'Sync employee data', 'hr', 'Users', '["bamboohr", "workday", "adp", "gusto"]', 6),
  ('payroll', 'Payroll', 'Process payroll and payments', 'finance', 'DollarSign', '["adp", "gusto", "paylocity"]', 7),
  ('background_check', 'Background Check', 'Run background checks', 'hr', 'Shield', '["checkr", "sterling", "goodhire"]', 8),
  ('job_board', 'Job Boards', 'Post jobs and receive applications', 'hr', 'Briefcase', '["indeed", "linkedin", "ziprecruiter"]', 9),
  ('crm', 'CRM', 'Sync with CRM systems', 'productivity', 'Building', '["salesforce", "hubspot", "pipedrive"]', 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Integrations RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "integrations_org_access" ON integrations;
CREATE POLICY "integrations_org_access" ON integrations
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Health Logs RLS
ALTER TABLE integration_health_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_logs_org_access" ON integration_health_logs;
CREATE POLICY "health_logs_org_access" ON integration_health_logs
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Integration Types RLS (public read)
ALTER TABLE integration_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "integration_types_read" ON integration_types;
CREATE POLICY "integration_types_read" ON integration_types
  FOR SELECT USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on integrations
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_integrations_updated_at ON integrations;
CREATE TRIGGER trigger_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get integration stats for dashboard
CREATE OR REPLACE FUNCTION get_integration_stats(p_org_id UUID)
RETURNS TABLE (
  total_count BIGINT,
  active_count BIGINT,
  error_count BIGINT,
  inactive_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_count,
    COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL) as active_count,
    COUNT(*) FILTER (WHERE status = 'error' AND deleted_at IS NULL) as error_count,
    COUNT(*) FILTER (WHERE status = 'inactive' AND deleted_at IS NULL) as inactive_count
  FROM integrations
  WHERE org_id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
