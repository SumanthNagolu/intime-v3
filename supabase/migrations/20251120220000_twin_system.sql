/**
 * AI Twin System - Database Schema
 *
 * Story: AI-TWIN-001
 *
 * Tracks Employee AI Twin interactions and preferences.
 */

-- Employee Twin Interactions table (matches EmployeeTwin.ts implementation)
CREATE TABLE IF NOT EXISTS employee_twin_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL, -- For multi-tenancy
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Interaction details
  twin_role TEXT NOT NULL CHECK (twin_role IN ('recruiter', 'trainer', 'bench_sales', 'admin')),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('morning_briefing', 'suggestion', 'question')),

  -- Content
  prompt TEXT, -- User's question (for Q&A)
  response TEXT NOT NULL, -- Twin's response

  -- Metadata
  context JSONB DEFAULT '{}'::jsonb, -- Context used for generation
  model_used TEXT DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  cost_usd FLOAT,
  latency_ms INTEGER,

  -- Engagement/Feedback
  was_helpful BOOLEAN, -- User feedback
  user_feedback TEXT, -- Optional text feedback
  dismissed BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employee_twin_interactions_user ON employee_twin_interactions(user_id, created_at DESC);
CREATE INDEX idx_employee_twin_interactions_type ON employee_twin_interactions(interaction_type, created_at DESC);
CREATE INDEX idx_employee_twin_interactions_role ON employee_twin_interactions(twin_role, created_at DESC);

-- Twin preferences table
CREATE TABLE IF NOT EXISTS twin_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,

  -- Notification preferences
  enable_morning_briefing BOOLEAN DEFAULT true,
  morning_briefing_time TIME DEFAULT '09:00:00',

  enable_proactive_suggestions BOOLEAN DEFAULT true,
  suggestion_frequency INTEGER DEFAULT 3, -- Per day

  -- Communication channels
  notify_via_ui BOOLEAN DEFAULT true,
  notify_via_slack BOOLEAN DEFAULT false,
  notify_via_email BOOLEAN DEFAULT false,

  -- Privacy settings
  use_productivity_data BOOLEAN DEFAULT true,
  use_activity_data BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_twin_preferences_user ON twin_preferences(user_id);

-- Helper function: Get today's interaction count
CREATE OR REPLACE FUNCTION get_twin_interaction_count(
  p_user_id UUID,
  p_interaction_type TEXT,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM employee_twin_interactions
  WHERE user_id = p_user_id
    AND interaction_type = p_interaction_type
    AND DATE(created_at) = p_date;

  RETURN v_count;
END;
$$;

-- Helper function: Get user's twin preferences
CREATE OR REPLACE FUNCTION get_twin_preferences(p_user_id UUID)
RETURNS TABLE (
  enable_morning_briefing BOOLEAN,
  morning_briefing_time TIME,
  enable_proactive_suggestions BOOLEAN,
  suggestion_frequency INTEGER,
  notify_via_ui BOOLEAN,
  notify_via_slack BOOLEAN,
  notify_via_email BOOLEAN,
  use_productivity_data BOOLEAN,
  use_activity_data BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tp.enable_morning_briefing,
    tp.morning_briefing_time,
    tp.enable_proactive_suggestions,
    tp.suggestion_frequency,
    tp.notify_via_ui,
    tp.notify_via_slack,
    tp.notify_via_email,
    tp.use_productivity_data,
    tp.use_activity_data
  FROM twin_preferences tp
  WHERE tp.user_id = p_user_id;

  -- If no preferences exist, return defaults
  IF NOT FOUND THEN
    INSERT INTO twin_preferences (user_id) VALUES (p_user_id);
    RETURN QUERY SELECT * FROM get_twin_preferences(p_user_id);
  END IF;
END;
$$;

-- RLS Policies
ALTER TABLE employee_twin_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own interactions
CREATE POLICY employee_twin_interactions_user_own ON employee_twin_interactions
  FOR ALL
  USING (user_id = auth.uid());

-- Users can manage their own preferences
CREATE POLICY twin_preferences_user_own ON twin_preferences
  FOR ALL
  USING (user_id = auth.uid());

-- Managers can view team interactions (aggregated analytics) (future feature)
-- CREATE POLICY employee_twin_interactions_manager_team ON employee_twin_interactions
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_profiles
--       WHERE id = user_id
--       AND manager_id = auth.uid()
--     )
--   );

-- Cleanup function: Remove old interactions (90 days)
CREATE OR REPLACE FUNCTION cleanup_old_twin_interactions()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM employee_twin_interactions
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_twin_interaction_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_twin_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_twin_interactions TO authenticated;

COMMENT ON TABLE employee_twin_interactions IS 'Tracks all Employee AI Twin interactions';
COMMENT ON TABLE twin_preferences IS 'User preferences for AI Twin behavior';
COMMENT ON FUNCTION get_twin_interaction_count IS 'Count interactions by type for a user on a given date';
COMMENT ON FUNCTION get_twin_preferences IS 'Get or initialize user twin preferences';
COMMENT ON FUNCTION cleanup_old_twin_interactions IS 'Remove interactions older than 90 days';
