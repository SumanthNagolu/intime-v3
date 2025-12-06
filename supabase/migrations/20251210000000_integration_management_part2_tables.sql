-- =============================================
-- INTEGRATION MANAGEMENT TABLES - PART 2
-- Webhooks, Retry Config, OAuth, Failover
-- =============================================

-- ============================================
-- WEBHOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  secret VARCHAR(64) NOT NULL, -- HMAC secret for signature
  events TEXT[] NOT NULL DEFAULT '{}', -- Array of subscribed event types
  headers JSONB DEFAULT '{}', -- Custom headers to include
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, disabled
  consecutive_failures INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_webhooks_org_id ON webhooks(org_id);
CREATE INDEX idx_webhooks_status ON webhooks(status);
CREATE INDEX idx_webhooks_events ON webhooks USING GIN(events);

-- ============================================
-- WEBHOOK DELIVERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_id UUID, -- Reference to source event if applicable
  payload JSONB NOT NULL,
  request_url TEXT NOT NULL,
  request_headers JSONB NOT NULL,
  request_body TEXT NOT NULL,
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  duration_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, success, failed, retrying, dlq
  error_message TEXT,
  error_code VARCHAR(50),
  next_retry_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_org ON webhook_deliveries(org_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at)
  WHERE status = 'retrying' AND next_retry_at IS NOT NULL;
CREATE INDEX idx_webhook_deliveries_dlq ON webhook_deliveries(org_id, status)
  WHERE status = 'dlq';

-- ============================================
-- RETRY CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integration_retry_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  max_retries INTEGER NOT NULL DEFAULT 3,
  retry_strategy VARCHAR(20) NOT NULL DEFAULT 'exponential', -- exponential, linear, fixed
  base_delay_seconds INTEGER NOT NULL DEFAULT 5,
  max_delay_seconds INTEGER NOT NULL DEFAULT 300,
  enable_jitter BOOLEAN DEFAULT true,
  enable_dlq BOOLEAN DEFAULT true,
  dlq_retention_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id)
);

-- ============================================
-- OAUTH TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integration_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id), -- User who authorized (optional)
  provider VARCHAR(50) NOT NULL, -- google, microsoft, zoom, etc.
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_type VARCHAR(20) DEFAULT 'Bearer',
  scope TEXT, -- Space-separated scopes
  expires_at TIMESTAMPTZ,
  refresh_expires_at TIMESTAMPTZ, -- Some providers expire refresh tokens
  account_id VARCHAR(255), -- Provider account identifier
  account_email VARCHAR(255), -- Provider account email
  raw_token_response JSONB, -- Full response for debugging
  last_refreshed_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active', -- active, expired, revoked
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_oauth_tokens_integration ON integration_oauth_tokens(integration_id);
CREATE INDEX idx_oauth_tokens_org ON integration_oauth_tokens(org_id);
CREATE INDEX idx_oauth_tokens_expires ON integration_oauth_tokens(expires_at)
  WHERE status = 'active';
CREATE UNIQUE INDEX idx_oauth_tokens_unique_integration
  ON integration_oauth_tokens(integration_id)
  WHERE status = 'active';

-- ============================================
-- FAILOVER CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integration_failover_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL, -- email, sms, etc.
  primary_integration_id UUID NOT NULL REFERENCES integrations(id),
  backup_integration_id UUID REFERENCES integrations(id),
  failover_threshold INTEGER DEFAULT 3, -- Consecutive failures before failover
  auto_failover BOOLEAN DEFAULT true,
  auto_recovery BOOLEAN DEFAULT false, -- Auto-switch back when primary recovers
  recovery_check_interval_minutes INTEGER DEFAULT 30,
  current_active VARCHAR(20) DEFAULT 'primary', -- primary, backup
  last_failover_at TIMESTAMPTZ,
  last_recovery_at TIMESTAMPTZ,
  failover_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, integration_type)
);

-- Indexes
CREATE INDEX idx_failover_config_org ON integration_failover_config(org_id);
CREATE INDEX idx_failover_config_primary ON integration_failover_config(primary_integration_id);
CREATE INDEX idx_failover_config_backup ON integration_failover_config(backup_integration_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Webhooks RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhooks_org_access" ON webhooks
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Webhook Deliveries RLS
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_deliveries_org_access" ON webhook_deliveries
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Retry Config RLS
ALTER TABLE integration_retry_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "retry_config_org_access" ON integration_retry_config
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- OAuth Tokens RLS
ALTER TABLE integration_oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oauth_tokens_org_access" ON integration_oauth_tokens
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Failover Config RLS
ALTER TABLE integration_failover_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "failover_config_org_access" ON integration_failover_config
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on webhooks
CREATE OR REPLACE FUNCTION update_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- Update updated_at on retry config
CREATE TRIGGER trigger_retry_config_updated_at
  BEFORE UPDATE ON integration_retry_config
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- Update updated_at on oauth tokens
CREATE TRIGGER trigger_oauth_tokens_updated_at
  BEFORE UPDATE ON integration_oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- Update updated_at on failover config
CREATE TRIGGER trigger_failover_config_updated_at
  BEFORE UPDATE ON integration_failover_config
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get webhook stats for dashboard
CREATE OR REPLACE FUNCTION get_webhook_stats(p_org_id UUID)
RETURNS TABLE (
  total_webhooks BIGINT,
  active_webhooks BIGINT,
  total_deliveries BIGINT,
  successful_deliveries BIGINT,
  failed_deliveries BIGINT,
  dlq_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM webhooks WHERE org_id = p_org_id AND deleted_at IS NULL) as total_webhooks,
    (SELECT COUNT(*) FROM webhooks WHERE org_id = p_org_id AND status = 'active' AND deleted_at IS NULL) as active_webhooks,
    (SELECT COUNT(*) FROM webhook_deliveries WHERE org_id = p_org_id) as total_deliveries,
    (SELECT COUNT(*) FROM webhook_deliveries WHERE org_id = p_org_id AND status = 'success') as successful_deliveries,
    (SELECT COUNT(*) FROM webhook_deliveries WHERE org_id = p_org_id AND status = 'failed') as failed_deliveries,
    (SELECT COUNT(*) FROM webhook_deliveries WHERE org_id = p_org_id AND status = 'dlq') as dlq_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate webhook secret
CREATE OR REPLACE FUNCTION generate_webhook_secret()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-disable webhook after consecutive failures
CREATE OR REPLACE FUNCTION check_webhook_auto_disable()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.consecutive_failures >= 10 AND OLD.consecutive_failures < 10 THEN
    NEW.status = 'disabled';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_webhook_auto_disable
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  WHEN (NEW.consecutive_failures IS DISTINCT FROM OLD.consecutive_failures)
  EXECUTE FUNCTION check_webhook_auto_disable();
