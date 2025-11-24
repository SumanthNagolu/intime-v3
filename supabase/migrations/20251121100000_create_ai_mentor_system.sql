-- ACAD-013: AI Mentor Integration
-- Sprint 3 (Week 9-10)
-- Description: AI-powered 24/7 mentorship with Socratic prompting, chat history, rate limiting, and cost tracking

-- ============================================================================
-- AI MENTOR CHAT HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_mentor_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES module_topics(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,

  -- Conversation
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  conversation_context JSONB DEFAULT '[]'::jsonb, -- Previous messages for context

  -- Metrics
  tokens_used INTEGER NOT NULL DEFAULT 0,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  cost_usd NUMERIC(10, 6) DEFAULT 0, -- Track actual cost

  -- Quality Control
  student_rating INTEGER CHECK (student_rating BETWEEN 1 AND 5),
  student_feedback TEXT,
  flagged_for_review BOOLEAN DEFAULT false,
  escalated_to_trainer BOOLEAN DEFAULT false,
  escalation_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rated_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_ai_mentor_chats_user_id ON ai_mentor_chats(user_id);
CREATE INDEX idx_ai_mentor_chats_topic_id ON ai_mentor_chats(topic_id);
CREATE INDEX idx_ai_mentor_chats_course_id ON ai_mentor_chats(course_id);
CREATE INDEX idx_ai_mentor_chats_created_at ON ai_mentor_chats(created_at DESC);
CREATE INDEX idx_ai_mentor_chats_flagged ON ai_mentor_chats(flagged_for_review) WHERE flagged_for_review = true;
CREATE INDEX idx_ai_mentor_chats_escalated ON ai_mentor_chats(escalated_to_trainer) WHERE escalated_to_trainer = true;

-- ============================================================================
-- RATE LIMITING
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_mentor_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Limits per period
  hourly_count INTEGER NOT NULL DEFAULT 0,
  daily_count INTEGER NOT NULL DEFAULT 0,
  monthly_count INTEGER NOT NULL DEFAULT 0,

  -- Reset timestamps
  hourly_reset_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  daily_reset_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 day'),
  monthly_reset_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),

  -- Cost tracking
  monthly_cost_usd NUMERIC(10, 4) DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_ai_mentor_rate_limits_user_id ON ai_mentor_rate_limits(user_id);

-- ============================================================================
-- CONVERSATION SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_mentor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES module_topics(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,

  title TEXT, -- Auto-generated from first question
  message_count INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC(10, 6) DEFAULT 0,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_mentor_sessions_user_id ON ai_mentor_sessions(user_id);
CREATE INDEX idx_ai_mentor_sessions_last_message ON ai_mentor_sessions(last_message_at DESC);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Daily usage and cost analytics
CREATE OR REPLACE VIEW ai_mentor_daily_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_chats,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost,
  AVG(response_time_ms) as avg_response_time_ms,
  AVG(student_rating) FILTER (WHERE student_rating IS NOT NULL) as avg_rating,
  COUNT(*) FILTER (WHERE flagged_for_review = true) as flagged_count,
  COUNT(*) FILTER (WHERE escalated_to_trainer = true) as escalated_count
FROM ai_mentor_chats
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Per-student analytics
CREATE OR REPLACE VIEW ai_mentor_student_stats AS
SELECT
  u.id as user_id,
  u.full_name,
  u.email,
  COUNT(c.id) as total_chats,
  SUM(c.tokens_used) as total_tokens,
  SUM(c.cost_usd) as total_cost,
  AVG(c.response_time_ms) as avg_response_time_ms,
  AVG(c.student_rating) FILTER (WHERE c.student_rating IS NOT NULL) as avg_rating,
  COUNT(*) FILTER (WHERE c.flagged_for_review = true) as flagged_count,
  COUNT(*) FILTER (WHERE c.escalated_to_trainer = true) as escalated_count,
  MAX(c.created_at) as last_chat_at
FROM user_profiles u
LEFT JOIN ai_mentor_chats c ON c.user_id = u.id
WHERE EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = u.id AND r.name = 'student'
)
GROUP BY u.id, u.full_name, u.email;

-- Topic-level analytics (which topics need most help)
CREATE OR REPLACE VIEW ai_mentor_topic_stats AS
SELECT
  mt.id as topic_id,
  mt.title as topic_title,
  c.title as course_title,
  COUNT(mc.id) as total_chats,
  COUNT(DISTINCT mc.user_id) as unique_students,
  AVG(mc.student_rating) FILTER (WHERE mc.student_rating IS NOT NULL) as avg_rating,
  COUNT(*) FILTER (WHERE mc.escalated_to_trainer = true) as escalation_count
FROM module_topics mt
JOIN course_modules m ON m.id = mt.module_id
JOIN courses c ON c.id = m.course_id
LEFT JOIN ai_mentor_chats mc ON mc.topic_id = mt.id
GROUP BY mt.id, mt.title, c.title
ORDER BY total_chats DESC;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ai_mentor_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_mentor_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_mentor_sessions ENABLE ROW LEVEL SECURITY;

-- Students can view their own chats
CREATE POLICY ai_mentor_chats_select_own ON ai_mentor_chats
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Students can insert their own chats (via function only)
CREATE POLICY ai_mentor_chats_insert_own ON ai_mentor_chats
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

-- Students can update ratings on their chats
CREATE POLICY ai_mentor_chats_update_rating ON ai_mentor_chats
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trainers and admins can view all chats
CREATE POLICY ai_mentor_chats_select_staff ON ai_mentor_chats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'trainer')
    )
  );

-- Rate limits: Students can view their own
CREATE POLICY ai_mentor_rate_limits_select_own ON ai_mentor_rate_limits
  FOR SELECT
  USING (user_id = auth.uid());

-- Sessions: Students can view their own
CREATE POLICY ai_mentor_sessions_select_own ON ai_mentor_sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins and trainers can view all sessions
CREATE POLICY ai_mentor_sessions_select_staff ON ai_mentor_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'trainer')
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ai_mentor_chats IS 'AI mentor chat history with metrics and quality control';
COMMENT ON TABLE ai_mentor_rate_limits IS 'Rate limiting per user to prevent abuse and control costs';
COMMENT ON TABLE ai_mentor_sessions IS 'Conversation sessions grouping related chat messages';
COMMENT ON VIEW ai_mentor_daily_stats IS 'Daily aggregated AI mentor usage and cost statistics';
COMMENT ON VIEW ai_mentor_student_stats IS 'Per-student AI mentor usage analytics';
COMMENT ON VIEW ai_mentor_topic_stats IS 'Topic-level analytics showing which topics need most help';
