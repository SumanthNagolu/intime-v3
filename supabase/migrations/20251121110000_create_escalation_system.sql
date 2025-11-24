-- ACAD-014: Escalation Logic
-- Sprint 3 (Week 9-10)
-- Description: Automatic escalation to human trainers when students are stuck

-- ============================================================================
-- ESCALATION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_mentor_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES ai_mentor_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES module_topics(id) ON DELETE SET NULL,

  -- Escalation details
  reason TEXT NOT NULL,
  confidence NUMERIC(3, 2) CHECK (confidence BETWEEN 0 AND 1), -- 0.00-1.00
  auto_detected BOOLEAN DEFAULT true,
  triggers JSONB DEFAULT '{}'::jsonb, -- Which detection triggers fired
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Resolution
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'resolved', 'dismissed')
  ),
  resolved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolution_time_minutes INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_escalations_chat_id ON ai_mentor_escalations(chat_id);
CREATE INDEX idx_escalations_user_id ON ai_mentor_escalations(user_id);
CREATE INDEX idx_escalations_topic_id ON ai_mentor_escalations(topic_id);
CREATE INDEX idx_escalations_status ON ai_mentor_escalations(status) WHERE status IN ('pending', 'in_progress');
CREATE INDEX idx_escalations_assigned_to ON ai_mentor_escalations(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_escalations_created_at ON ai_mentor_escalations(created_at DESC);

-- ============================================================================
-- TRAINER RESPONSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS trainer_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escalation_id UUID NOT NULL REFERENCES ai_mentor_escalations(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT false, -- Internal notes vs. student-visible

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trainer_responses_escalation_id ON trainer_responses(escalation_id);
CREATE INDEX idx_trainer_responses_trainer_id ON trainer_responses(trainer_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS escalation_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escalation_id UUID NOT NULL REFERENCES ai_mentor_escalations(id) ON DELETE CASCADE,

  notification_type TEXT NOT NULL CHECK (
    notification_type IN ('slack', 'email', 'in_app')
  ),
  recipient_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  recipient_email TEXT,
  recipient_slack_id TEXT,

  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escalation_notifications_escalation_id ON escalation_notifications(escalation_id);
CREATE INDEX idx_escalation_notifications_sent_at ON escalation_notifications(sent_at);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Escalation queue for trainers (pending/in-progress)
CREATE OR REPLACE VIEW escalation_queue AS
SELECT
  e.id as escalation_id,
  e.chat_id,
  e.user_id,
  u.full_name as student_name,
  u.email as student_email,
  e.topic_id,
  mt.title as topic_title,
  e.reason,
  e.confidence,
  e.auto_detected,
  e.triggers,
  e.metadata,
  e.status,
  e.assigned_to,
  trainer.full_name as assigned_trainer_name,
  e.created_at,
  -- Time waiting
  EXTRACT(EPOCH FROM (NOW() - e.created_at)) / 60 as wait_time_minutes,
  -- Original question
  c.question as original_question,
  -- Response count
  (SELECT COUNT(*) FROM trainer_responses WHERE escalation_id = e.id) as response_count
FROM ai_mentor_escalations e
JOIN user_profiles u ON u.id = e.user_id
LEFT JOIN module_topics mt ON mt.id = e.topic_id
LEFT JOIN user_profiles trainer ON trainer.id = e.assigned_to
LEFT JOIN ai_mentor_chats c ON c.id = e.chat_id
WHERE e.status IN ('pending', 'in_progress')
ORDER BY e.created_at ASC;

-- Escalation statistics (daily)
CREATE OR REPLACE VIEW escalation_daily_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_escalations,
  COUNT(DISTINCT user_id) as unique_students,
  COUNT(*) FILTER (WHERE auto_detected = true) as auto_detected_count,
  COUNT(*) FILTER (WHERE auto_detected = false) as manual_count,
  AVG(confidence) as avg_confidence,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
  COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_count,
  AVG(resolution_time_minutes) FILTER (WHERE resolution_time_minutes IS NOT NULL) as avg_resolution_time_minutes
FROM ai_mentor_escalations
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Trainer performance
CREATE OR REPLACE VIEW trainer_escalation_stats AS
SELECT
  t.id as trainer_id,
  t.full_name as trainer_name,
  COUNT(e.id) as total_assigned,
  COUNT(*) FILTER (WHERE e.status = 'resolved') as resolved_count,
  COUNT(*) FILTER (WHERE e.status = 'dismissed') as dismissed_count,
  AVG(e.resolution_time_minutes) FILTER (WHERE e.resolution_time_minutes IS NOT NULL) as avg_resolution_time_minutes,
  COUNT(tr.id) as total_responses,
  MAX(e.resolved_at) as last_resolution_at
FROM user_profiles t
JOIN user_roles ur ON ur.user_id = t.id
JOIN roles r ON r.id = ur.role_id
LEFT JOIN ai_mentor_escalations e ON e.assigned_to = t.id
LEFT JOIN trainer_responses tr ON tr.trainer_id = t.id
WHERE r.name = 'trainer'
GROUP BY t.id, t.full_name;

-- Topic difficulty (topics with most escalations)
CREATE OR REPLACE VIEW topic_difficulty_stats AS
SELECT
  mt.id as topic_id,
  mt.title as topic_title,
  cm.title as module_title,
  c.title as course_title,
  COUNT(e.id) as escalation_count,
  COUNT(DISTINCT e.user_id) as unique_students,
  AVG(e.confidence) as avg_escalation_confidence,
  COUNT(*) FILTER (WHERE e.status = 'resolved') as resolved_count
FROM module_topics mt
JOIN course_modules cm ON cm.id = mt.module_id
JOIN courses c ON c.id = cm.course_id
LEFT JOIN ai_mentor_escalations e ON e.topic_id = mt.id
GROUP BY mt.id, mt.title, cm.title, c.title
HAVING COUNT(e.id) > 0
ORDER BY escalation_count DESC;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ai_mentor_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_notifications ENABLE ROW LEVEL SECURITY;

-- Students can view their own escalations
CREATE POLICY escalations_select_own ON ai_mentor_escalations
  FOR SELECT
  USING (user_id = auth.uid());

-- Trainers and admins can view all escalations
CREATE POLICY escalations_select_staff ON ai_mentor_escalations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'trainer')
    )
  );

-- Trainers can update assigned escalations
CREATE POLICY escalations_update_assigned ON ai_mentor_escalations
  FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Trainer responses: Students can view non-internal responses
CREATE POLICY trainer_responses_select_student ON trainer_responses
  FOR SELECT
  USING (
    is_internal_note = false AND
    EXISTS (
      SELECT 1 FROM ai_mentor_escalations e
      WHERE e.id = escalation_id
      AND e.user_id = auth.uid()
    )
  );

-- Trainer responses: Trainers can view all
CREATE POLICY trainer_responses_select_staff ON trainer_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'trainer')
    )
  );

-- Trainers can insert responses
CREATE POLICY trainer_responses_insert_staff ON trainer_responses
  FOR INSERT
  WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'trainer')
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_escalation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER escalation_updated_at
  BEFORE UPDATE ON ai_mentor_escalations
  FOR EACH ROW
  EXECUTE FUNCTION update_escalation_updated_at();

-- Auto-calculate resolution time
CREATE OR REPLACE FUNCTION calculate_resolution_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
    NEW.resolution_time_minutes = EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER escalation_resolution_time
  BEFORE UPDATE ON ai_mentor_escalations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_resolution_time();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ai_mentor_escalations IS 'Tracks escalations from AI mentor to human trainers';
COMMENT ON TABLE trainer_responses IS 'Trainer responses to student escalations';
COMMENT ON TABLE escalation_notifications IS 'Notification delivery tracking for escalations';
COMMENT ON VIEW escalation_queue IS 'Real-time queue of pending/in-progress escalations for trainers';
COMMENT ON VIEW escalation_daily_stats IS 'Daily aggregated escalation statistics';
COMMENT ON VIEW trainer_escalation_stats IS 'Per-trainer escalation handling performance';
COMMENT ON VIEW topic_difficulty_stats IS 'Topics ranked by escalation frequency';
