-- ============================================================================
-- SETTINGS TABLES MIGRATION
-- System & Organization Settings Management
-- ============================================================================

-- ============================================================================
-- SYSTEM SETTINGS TABLE
-- Global platform-wide configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  category VARCHAR(50) NOT NULL,
  data_type VARCHAR(20) NOT NULL DEFAULT 'string',
  description TEXT,
  default_value JSONB,
  constraints JSONB,
  is_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Categories: general, security, email, files, api
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- Trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ORGANIZATION SETTINGS TABLE
-- Per-organization configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id),
  UNIQUE(org_id, key)
);

-- Categories: general, branding, localization, business, compliance
CREATE INDEX idx_org_settings_org ON organization_settings(org_id);
CREATE INDEX idx_org_settings_category ON organization_settings(org_id, category);

-- RLS Policy
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org settings"
  ON organization_settings FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Users can manage their org settings"
  ON organization_settings FOR ALL
  USING (org_id = auth_user_org_id() OR user_is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_org_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ORGANIZATION BRANDING TABLE
-- Branding assets metadata (files stored in Supabase Storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES user_profiles(id),
  UNIQUE(org_id, asset_type)
);

-- Asset types: logo_light, logo_dark, favicon, login_background
CREATE INDEX idx_org_branding_org ON organization_branding(org_id);

-- RLS Policy
ALTER TABLE organization_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org branding"
  ON organization_branding FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Users can manage their org branding"
  ON organization_branding FOR ALL
  USING (org_id = auth_user_org_id() OR user_is_admin());

-- ============================================================================
-- SEED SYSTEM SETTINGS DEFAULTS
-- ============================================================================

-- General Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints) VALUES
  ('default_timezone', '"America/New_York"', 'general', 'string', 'Default timezone for new organizations', '"America/New_York"', '{"type": "timezone"}'),
  ('default_date_format', '"MM/DD/YYYY"', 'general', 'string', 'Default date format', '"MM/DD/YYYY"', '{"options": ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]}'),
  ('default_time_format', '"12h"', 'general', 'string', 'Default time format (12h or 24h)', '"12h"', '{"options": ["12h", "24h"]}'),
  ('default_currency', '"USD"', 'general', 'string', 'Default currency code', '"USD"', '{"type": "currency"}'),
  ('decimal_separator', '"."', 'general', 'string', 'Decimal separator for numbers', '"."', '{"options": [".", ","]}'),
  ('thousands_separator', '","', 'general', 'string', 'Thousands separator for numbers', '","', '{"options": [",", ".", " "]}')
ON CONFLICT (key) DO NOTHING;

-- Security Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints, is_sensitive) VALUES
  ('password_min_length', '12', 'security', 'number', 'Minimum password length', '12', '{"min": 8, "max": 128}', false),
  ('password_require_uppercase', 'true', 'security', 'boolean', 'Require uppercase letter in password', 'true', null, false),
  ('password_require_lowercase', 'true', 'security', 'boolean', 'Require lowercase letter in password', 'true', null, false),
  ('password_require_number', 'true', 'security', 'boolean', 'Require number in password', 'true', null, false),
  ('password_require_special', 'true', 'security', 'boolean', 'Require special character in password', 'true', null, false),
  ('password_history_count', '5', 'security', 'number', 'Number of previous passwords to remember', '5', '{"min": 0, "max": 24}', false),
  ('password_expiry_days', '90', 'security', 'number', 'Days until password expires (0 = never)', '90', '{"min": 0, "max": 365}', false),
  ('session_timeout_minutes', '30', 'security', 'number', 'Session timeout in minutes', '30', '{"min": 5, "max": 480}', false),
  ('max_concurrent_sessions', '3', 'security', 'number', 'Maximum concurrent sessions per user', '3', '{"min": 1, "max": 10}', false),
  ('remember_me_enabled', 'true', 'security', 'boolean', 'Allow "Remember Me" option', 'true', null, false),
  ('failed_login_lockout', '5', 'security', 'number', 'Failed login attempts before lockout', '5', '{"min": 3, "max": 10}', false),
  ('lockout_duration_minutes', '15', 'security', 'number', 'Account lockout duration in minutes', '15', '{"min": 5, "max": 60}', false),
  ('two_factor_requirement', '"optional"', 'security', 'string', '2FA requirement level', '"optional"', '{"options": ["disabled", "optional", "required"]}', false),
  ('ip_allowlist_enabled', 'false', 'security', 'boolean', 'Enable IP allowlist', 'false', null, true),
  ('ip_allowlist', '[]', 'security', 'array', 'Allowed IP addresses/ranges', '[]', '{"type": "ip_list"}', true)
ON CONFLICT (key) DO NOTHING;

-- Email Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints) VALUES
  ('email_from_address', '"noreply@intime.io"', 'email', 'string', 'Default from email address', '"noreply@intime.io"', '{"type": "email"}'),
  ('email_from_name', '"InTime Platform"', 'email', 'string', 'Default from name', '"InTime Platform"', null),
  ('email_reply_to', '"support@intime.io"', 'email', 'string', 'Reply-to email address', '"support@intime.io"', '{"type": "email"}'),
  ('email_footer_text', '"2024 InTime. All rights reserved."', 'email', 'string', 'Default email footer', '"2024 InTime. All rights reserved."', null),
  ('bounce_handling_enabled', 'true', 'email', 'boolean', 'Enable bounce handling', 'true', null)
ON CONFLICT (key) DO NOTHING;

-- File Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints) VALUES
  ('max_file_size_mb', '25', 'files', 'number', 'Maximum file upload size in MB', '25', '{"min": 1, "max": 100}'),
  ('allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "gif"]', 'files', 'array', 'Allowed file extensions', '["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "gif"]', null),
  ('storage_quota_gb', '100', 'files', 'number', 'Storage quota per organization in GB', '100', '{"min": 10, "max": 1000}')
ON CONFLICT (key) DO NOTHING;

-- API Settings
INSERT INTO system_settings (key, value, category, data_type, description, default_value, constraints) VALUES
  ('api_enabled', 'true', 'api', 'boolean', 'Enable API access', 'true', null),
  ('api_rate_limit_requests', '1000', 'api', 'number', 'API rate limit (requests per hour)', '1000', '{"min": 100, "max": 10000}'),
  ('api_rate_limit_window_minutes', '60', 'api', 'number', 'Rate limit window in minutes', '60', '{"options": [15, 30, 60]}'),
  ('api_version', '"v1"', 'api', 'string', 'Current API version', '"v1"', null)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE system_settings IS 'Global platform-wide configuration settings';
COMMENT ON TABLE organization_settings IS 'Per-organization configuration settings';
COMMENT ON TABLE organization_branding IS 'Organization branding asset metadata';

COMMENT ON COLUMN system_settings.key IS 'Unique setting identifier';
COMMENT ON COLUMN system_settings.value IS 'Setting value stored as JSONB';
COMMENT ON COLUMN system_settings.category IS 'Setting category: general, security, email, files, api';
COMMENT ON COLUMN system_settings.data_type IS 'Data type: string, number, boolean, array, object';
COMMENT ON COLUMN system_settings.is_sensitive IS 'Whether the setting contains sensitive data';

COMMENT ON COLUMN organization_settings.category IS 'Setting category: general, branding, localization, business, compliance';
COMMENT ON COLUMN organization_branding.asset_type IS 'Asset type: logo_light, logo_dark, favicon, login_background';
