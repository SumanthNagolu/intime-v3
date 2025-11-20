/**
 * Migration 018: Agent Framework Tables
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Stories: AI-INF-004, AI-INF-005, AI-INF-006, AI-INF-007
 *
 * Creates tables for:
 * - Prompt template storage with versioning
 * - AI cost tracking (Helicone integration)
 * - Agent interaction logging
 *
 * @module migrations/018_add_agent_framework
 */

-- =============================================================================
-- TABLE 1: AI Prompts
-- =============================================================================
-- Stores prompt templates with version control

CREATE TABLE IF NOT EXISTS ai_prompts (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template identification
  name TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  category TEXT NOT NULL,

  -- Template content
  content TEXT NOT NULL,
  description TEXT,
  variables JSONB NOT NULL DEFAULT '[]',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT ai_prompts_name_version_unique UNIQUE (name, version),
  CONSTRAINT ai_prompts_name_check CHECK (name ~ '^[a-z0-9_]+$'),
  CONSTRAINT ai_prompts_version_positive CHECK (version > 0)
);

-- Indexes
CREATE INDEX idx_ai_prompts_name ON ai_prompts(name);
CREATE INDEX idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX idx_ai_prompts_active ON ai_prompts(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

-- Admins can manage all prompts
CREATE POLICY ai_prompts_admin_all ON ai_prompts
  FOR ALL
  USING (user_is_admin(auth_user_id()));

-- All authenticated users can read active prompts
CREATE POLICY ai_prompts_read_active ON ai_prompts
  FOR SELECT
  USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER trigger_ai_prompts_updated_at
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Comments
COMMENT ON TABLE ai_prompts IS 'AI prompt templates with version control (Sprint 2: AI-INF-006)';
COMMENT ON COLUMN ai_prompts.variables IS 'Array of required variable names (JSON array of strings)';

-- =============================================================================
-- TABLE 2: AI Cost Tracking
-- =============================================================================
-- Tracks AI API costs via Helicone integration

CREATE TABLE IF NOT EXISTS ai_cost_tracking (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- AI provider details
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic')),
  model TEXT NOT NULL,

  -- Usage metrics
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0.00,
  latency_ms INT NOT NULL DEFAULT 0,

  -- Optional metadata
  metadata JSONB NOT NULL DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT ai_cost_tracking_tokens_positive CHECK (input_tokens >= 0 AND output_tokens >= 0),
  CONSTRAINT ai_cost_tracking_cost_positive CHECK (cost_usd >= 0),
  CONSTRAINT ai_cost_tracking_latency_positive CHECK (latency_ms >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_ai_cost_tracking_org_date ON ai_cost_tracking(org_id, created_at DESC);
CREATE INDEX idx_ai_cost_tracking_user ON ai_cost_tracking(user_id);
CREATE INDEX idx_ai_cost_tracking_provider ON ai_cost_tracking(provider);
CREATE INDEX idx_ai_cost_tracking_model ON ai_cost_tracking(model);
CREATE INDEX idx_ai_cost_tracking_date ON ai_cost_tracking(created_at DESC);

-- RLS Policies
ALTER TABLE ai_cost_tracking ENABLE ROW LEVEL SECURITY;

-- Users can insert their own cost data
CREATE POLICY ai_cost_tracking_insert_own ON ai_cost_tracking
  FOR INSERT
  WITH CHECK (user_id = auth_user_id() AND org_id = auth_user_org_id());

-- Users can view their own cost data
CREATE POLICY ai_cost_tracking_select_own ON ai_cost_tracking
  FOR SELECT
  USING (user_id = auth_user_id());

-- Org admins can view all org cost data
CREATE POLICY ai_cost_tracking_select_org_admin ON ai_cost_tracking
  FOR SELECT
  USING (user_is_org_admin(auth_user_id(), org_id));

-- Platform admins can view all
CREATE POLICY ai_cost_tracking_select_platform_admin ON ai_cost_tracking
  FOR SELECT
  USING (user_is_admin(auth_user_id()));

-- Comments
COMMENT ON TABLE ai_cost_tracking IS 'AI API cost tracking via Helicone (Sprint 2: AI-INF-004)';
COMMENT ON COLUMN ai_cost_tracking.cost_usd IS 'Cost in USD (6 decimal precision for micro-transactions)';
COMMENT ON COLUMN ai_cost_tracking.metadata IS 'Additional context (agent name, task type, etc.)';

-- =============================================================================
-- TABLE 3: AI Agent Interactions
-- =============================================================================
-- Logs all agent executions for monitoring and analytics

CREATE TABLE IF NOT EXISTS ai_agent_interactions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Agent details
  agent_name TEXT NOT NULL,
  interaction_type TEXT NOT NULL,

  -- Input/output
  input TEXT,
  output TEXT,

  -- Performance metrics
  model_used TEXT,
  tokens_used INT DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0.00,
  latency_ms INT DEFAULT 0,

  -- Success tracking
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,

  -- Optional metadata
  metadata JSONB NOT NULL DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT ai_agent_interactions_tokens_positive CHECK (tokens_used >= 0),
  CONSTRAINT ai_agent_interactions_cost_positive CHECK (cost_usd >= 0),
  CONSTRAINT ai_agent_interactions_latency_positive CHECK (latency_ms >= 0)
);

-- Indexes
CREATE INDEX idx_ai_agent_interactions_org_date ON ai_agent_interactions(org_id, created_at DESC);
CREATE INDEX idx_ai_agent_interactions_user ON ai_agent_interactions(user_id);
CREATE INDEX idx_ai_agent_interactions_agent ON ai_agent_interactions(agent_name);
CREATE INDEX idx_ai_agent_interactions_type ON ai_agent_interactions(interaction_type);
CREATE INDEX idx_ai_agent_interactions_success ON ai_agent_interactions(success) WHERE success = false;

-- RLS Policies
ALTER TABLE ai_agent_interactions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own interactions
CREATE POLICY ai_agent_interactions_insert_own ON ai_agent_interactions
  FOR INSERT
  WITH CHECK (user_id = auth_user_id() AND org_id = auth_user_org_id());

-- Users can view their own interactions
CREATE POLICY ai_agent_interactions_select_own ON ai_agent_interactions
  FOR SELECT
  USING (user_id = auth_user_id());

-- Org admins can view all org interactions
CREATE POLICY ai_agent_interactions_select_org_admin ON ai_agent_interactions
  FOR SELECT
  USING (user_is_org_admin(auth_user_id(), org_id));

-- Platform admins can view all
CREATE POLICY ai_agent_interactions_select_platform_admin ON ai_agent_interactions
  FOR SELECT
  USING (user_is_admin(auth_user_id()));

-- Comments
COMMENT ON TABLE ai_agent_interactions IS 'Agent execution logs (Sprint 2: AI-INF-005)';
COMMENT ON COLUMN ai_agent_interactions.interaction_type IS 'Type of interaction (query, briefing, suggestion, etc.)';

-- =============================================================================
-- VALIDATION VIEW
-- =============================================================================
-- Provides visibility into agent framework status

CREATE OR REPLACE VIEW v_agent_framework_status AS
SELECT
  -- Prompt templates
  (SELECT COUNT(*) FROM ai_prompts WHERE is_active = true) AS active_prompts,
  (SELECT COUNT(DISTINCT name) FROM ai_prompts) AS unique_templates,

  -- Cost tracking
  (SELECT COUNT(*) FROM ai_cost_tracking WHERE created_at > NOW() - INTERVAL '24 hours') AS cost_entries_24h,
  (SELECT COALESCE(SUM(cost_usd), 0) FROM ai_cost_tracking WHERE created_at > NOW() - INTERVAL '24 hours') AS cost_24h_usd,
  (SELECT COALESCE(SUM(cost_usd), 0) FROM ai_cost_tracking WHERE created_at > NOW() - INTERVAL '30 days') AS cost_30d_usd,

  -- Agent interactions
  (SELECT COUNT(*) FROM ai_agent_interactions WHERE created_at > NOW() - INTERVAL '24 hours') AS interactions_24h,
  (SELECT COUNT(*) FROM ai_agent_interactions WHERE created_at > NOW() - INTERVAL '24 hours' AND success = false) AS failures_24h,
  (SELECT COUNT(DISTINCT agent_name) FROM ai_agent_interactions WHERE created_at > NOW() - INTERVAL '7 days') AS active_agents_7d;

COMMENT ON VIEW v_agent_framework_status IS 'Agent framework health and usage metrics';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant access to authenticated users
GRANT SELECT ON ai_prompts TO authenticated;
GRANT SELECT ON ai_cost_tracking TO authenticated;
GRANT INSERT ON ai_cost_tracking TO authenticated;
GRANT SELECT ON ai_agent_interactions TO authenticated;
GRANT INSERT ON ai_agent_interactions TO authenticated;
GRANT SELECT ON v_agent_framework_status TO authenticated;

-- =============================================================================
-- SEED DATA: Initial Prompt Templates
-- =============================================================================

INSERT INTO ai_prompts (name, version, category, description, variables, content) VALUES
  ('code_mentor', 1, 'training', 'Socratic method teaching for code mentorship',
   '["studentName", "currentModule", "completedModules", "struggleArea"]'::jsonb,
   'You are a Socratic code mentor for Guidewire developers...' -- Full content would be here
  ),
  ('resume_builder', 1, 'recruiting', 'ATS-optimized resume builder',
   '["consultantName", "guidewireProducts", "yearsExperience", "certifications", "targetRole", "targetCompany"]'::jsonb,
   'You are an ATS-optimized resume builder...'
  ),
  ('employee_twin_recruiter', 1, 'employee_twin', 'AI twin for recruiters',
   '["employeeName", "activeCandidates", "openRequisitions", "weeklyPlacements", "pipelineStatus"]'::jsonb,
   'You are an AI assistant for a technical recruiter...'
  ),
  ('activity_classification', 1, 'productivity', 'Screenshot activity classifier',
   '[]'::jsonb,
   'You are an activity classifier...'
  ),
  ('daily_timeline', 1, 'productivity', 'Daily productivity report generator',
   '["employeeName", "date", "totalScreenshots", "productiveHours", "activityBreakdown"]'::jsonb,
   'You are a productivity report generator...'
  )
ON CONFLICT (name, version) DO NOTHING;

-- =============================================================================
-- END MIGRATION 018
-- =============================================================================
