-- ACAD-015: AI Analytics
-- Sprint 3 (Week 9-10)
-- Description: Enhanced analytics for AI mentor quality tracking and optimization

-- ============================================================================
-- QUESTION PATTERNS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_question_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_hash TEXT NOT NULL UNIQUE,
  canonical_question TEXT NOT NULL,
  category TEXT,
  topic_id UUID REFERENCES module_topics(id) ON DELETE SET NULL,

  -- Metrics
  occurrence_count INTEGER DEFAULT 1,
  unique_students INTEGER DEFAULT 1,
  avg_response_quality NUMERIC(3, 2), -- Average rating
  escalation_rate NUMERIC(5, 4), -- Percentage that escalate

  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_question_patterns_hash ON ai_question_patterns(pattern_hash);
CREATE INDEX idx_question_patterns_topic ON ai_question_patterns(topic_id);
CREATE INDEX idx_question_patterns_occurrence ON ai_question_patterns(occurrence_count DESC);

-- ============================================================================
-- PROMPT A/B TESTING
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_prompt_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_name TEXT NOT NULL UNIQUE,
  system_prompt TEXT NOT NULL,

  is_active BOOLEAN DEFAULT false,
  traffic_percentage INTEGER DEFAULT 0 CHECK (traffic_percentage BETWEEN 0 AND 100),

  -- Performance metrics
  total_uses INTEGER DEFAULT 0,
  avg_rating NUMERIC(3, 2),
  avg_response_time_ms INTEGER,
  avg_tokens_used INTEGER,
  escalation_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ
);

-- Track which variant was used for each chat
ALTER TABLE ai_mentor_chats
ADD COLUMN IF NOT EXISTS prompt_variant_id UUID REFERENCES ai_prompt_variants(id) ON DELETE SET NULL;

CREATE INDEX idx_mentor_chats_prompt_variant ON ai_mentor_chats(prompt_variant_id);

-- ============================================================================
-- ENHANCED ANALYTICS VIEWS
-- ============================================================================

-- Hourly analytics for real-time monitoring
CREATE OR REPLACE VIEW ai_mentor_hourly_stats AS
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total_chats,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost,
  AVG(response_time_ms) as avg_response_time_ms,
  AVG(student_rating) FILTER (WHERE student_rating IS NOT NULL) as avg_rating,
  COUNT(*) FILTER (WHERE student_rating >= 4) as positive_ratings,
  COUNT(*) FILTER (WHERE student_rating <= 2) as negative_ratings,
  COUNT(*) FILTER (WHERE flagged_for_review = true) as flagged_count,
  COUNT(*) FILTER (WHERE escalated_to_trainer = true) as escalated_count
FROM ai_mentor_chats
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Quality metrics by topic
CREATE OR REPLACE VIEW ai_mentor_topic_quality AS
SELECT
  mt.id as topic_id,
  mt.title as topic_title,
  c.title as course_title,
  COUNT(mc.id) as total_chats,
  COUNT(DISTINCT mc.user_id) as unique_students,

  -- Quality metrics
  AVG(mc.student_rating) FILTER (WHERE mc.student_rating IS NOT NULL) as avg_rating,
  COUNT(*) FILTER (WHERE mc.student_rating >= 4)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE mc.student_rating IS NOT NULL), 0) * 100 as helpful_percentage,
  COUNT(*) FILTER (WHERE mc.student_rating <= 2)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE mc.student_rating IS NOT NULL), 0) * 100 as unhelpful_percentage,

  -- Performance metrics
  AVG(mc.response_time_ms) as avg_response_time_ms,
  AVG(mc.tokens_used) as avg_tokens_used,
  SUM(mc.cost_usd) as total_cost,

  -- Problem indicators
  COUNT(*) FILTER (WHERE mc.escalated_to_trainer = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100 as escalation_rate,
  COUNT(*) FILTER (WHERE mc.flagged_for_review = true) as flagged_count
FROM module_topics mt
JOIN course_modules cm ON cm.id = mt.module_id
JOIN courses c ON c.id = cm.course_id
LEFT JOIN ai_mentor_chats mc ON mc.topic_id = mt.id
GROUP BY mt.id, mt.title, c.title
HAVING COUNT(mc.id) > 0
ORDER BY total_chats DESC;

-- Prompt variant performance comparison
CREATE OR REPLACE VIEW ai_prompt_variant_performance AS
SELECT
  pv.id as variant_id,
  pv.variant_name,
  pv.is_active,
  pv.traffic_percentage,

  COUNT(mc.id) as total_uses,
  COUNT(DISTINCT mc.user_id) as unique_users,

  -- Quality
  AVG(mc.student_rating) FILTER (WHERE mc.student_rating IS NOT NULL) as avg_rating,
  COUNT(*) FILTER (WHERE mc.student_rating >= 4)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE mc.student_rating IS NOT NULL), 0) * 100 as helpful_percentage,

  -- Performance
  AVG(mc.response_time_ms) as avg_response_time_ms,
  AVG(mc.tokens_used) as avg_tokens_used,
  AVG(mc.cost_usd) as avg_cost_per_chat,

  -- Problems
  COUNT(*) FILTER (WHERE mc.escalated_to_trainer = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100 as escalation_rate,
  COUNT(*) FILTER (WHERE mc.flagged_for_review = true) as flagged_count,

  pv.created_at
FROM ai_prompt_variants pv
LEFT JOIN ai_mentor_chats mc ON mc.prompt_variant_id = pv.id
GROUP BY pv.id, pv.variant_name, pv.is_active, pv.traffic_percentage, pv.created_at
ORDER BY pv.created_at DESC;

-- Cost breakdown by dimension
CREATE OR REPLACE VIEW ai_mentor_cost_breakdown AS
SELECT
  DATE(mc.created_at) as date,
  mc.topic_id,
  mt.title as topic_title,

  COUNT(*) as chat_count,
  SUM(mc.tokens_used) as total_tokens,
  SUM(mc.cost_usd) as total_cost,
  AVG(mc.cost_usd) as avg_cost_per_chat,
  SUM(mc.cost_usd) / NULLIF(SUM(mc.tokens_used), 0) * 1000 as cost_per_1k_tokens,

  -- Cost efficiency (cost per helpful response)
  SUM(mc.cost_usd) / NULLIF(COUNT(*) FILTER (WHERE mc.student_rating >= 4), 0) as cost_per_helpful_response
FROM ai_mentor_chats mc
LEFT JOIN module_topics mt ON mt.id = mc.topic_id
WHERE mc.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(mc.created_at), mc.topic_id, mt.title
ORDER BY date DESC, total_cost DESC;

-- Student engagement patterns
CREATE OR REPLACE VIEW ai_mentor_student_engagement AS
SELECT
  u.id as user_id,
  u.full_name,

  -- Activity
  COUNT(mc.id) as total_chats,
  DATE(MIN(mc.created_at)) as first_chat_date,
  DATE(MAX(mc.created_at)) as last_chat_date,
  EXTRACT(EPOCH FROM (MAX(mc.created_at) - MIN(mc.created_at))) / 86400 as active_days,

  -- Quality feedback
  AVG(mc.student_rating) FILTER (WHERE mc.student_rating IS NOT NULL) as avg_rating_given,
  COUNT(*) FILTER (WHERE mc.student_rating IS NOT NULL)::NUMERIC / NULLIF(COUNT(*), 0) * 100 as rating_frequency,

  -- Engagement indicators
  COUNT(DISTINCT mc.topic_id) as topics_explored,
  COUNT(*) FILTER (WHERE mc.escalated_to_trainer = true) as escalations,

  -- Cost
  SUM(mc.cost_usd) as total_cost_incurred
FROM user_profiles u
JOIN ai_mentor_chats mc ON mc.user_id = u.id
GROUP BY u.id, u.full_name
ORDER BY total_chats DESC;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ai_question_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_variants ENABLE ROW LEVEL SECURITY;

-- Admins can view patterns
CREATE POLICY question_patterns_select_admin ON ai_question_patterns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Admins can manage prompt variants
CREATE POLICY prompt_variants_all_admin ON ai_prompt_variants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ai_question_patterns IS 'Tracks common question patterns for curriculum optimization';
COMMENT ON TABLE ai_prompt_variants IS 'A/B testing system for AI mentor prompt optimization';
COMMENT ON VIEW ai_mentor_hourly_stats IS 'Hourly metrics for real-time monitoring';
COMMENT ON VIEW ai_mentor_topic_quality IS 'Quality metrics by topic for identifying problem areas';
COMMENT ON VIEW ai_prompt_variant_performance IS 'A/B test results comparison';
COMMENT ON VIEW ai_mentor_cost_breakdown IS 'Cost analysis by date and topic';
COMMENT ON VIEW ai_mentor_student_engagement IS 'Student engagement patterns and cost attribution';
