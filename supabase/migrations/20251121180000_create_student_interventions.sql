-- ACAD-027: Student Interventions and At-Risk Tracking
-- Critical Fix: Create missing student_interventions table and at-risk columns

-- =====================================================
-- ADD AT-RISK COLUMNS TO STUDENT_ENROLLMENTS
-- =====================================================

ALTER TABLE student_enrollments
  ADD COLUMN IF NOT EXISTS is_at_risk BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS at_risk_since TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS risk_reasons TEXT[];

-- Create index for querying at-risk students
CREATE INDEX IF NOT EXISTS idx_student_enrollments_at_risk
  ON student_enrollments(is_at_risk, risk_level)
  WHERE is_at_risk = TRUE;

COMMENT ON COLUMN student_enrollments.is_at_risk IS 'ACAD-027: Flag indicating if student is at risk of not completing';
COMMENT ON COLUMN student_enrollments.at_risk_since IS 'ACAD-027: Timestamp when student was flagged as at-risk';
COMMENT ON COLUMN student_enrollments.risk_level IS 'ACAD-027: Severity of risk (low, medium, high)';
COMMENT ON COLUMN student_enrollments.risk_reasons IS 'ACAD-027: Array of reasons why student is at risk';

-- =====================================================
-- CREATE STUDENT_INTERVENTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS student_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Student and enrollment identification
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Risk assessment
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_reasons TEXT[] NOT NULL,

  -- Intervention details
  intervention_type TEXT CHECK (intervention_type IN (
    'automated_email',
    'trainer_notification',
    'one_on_one_scheduled',
    'mentor_assigned',
    'resource_recommended',
    'deadline_extended',
    'other'
  )),

  -- Assignment
  assigned_trainer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'in_progress',
    'resolved',
    'escalated',
    'dismissed'
  )),

  -- Notes and outcomes
  notes TEXT,
  trainer_notes TEXT,
  resolution_notes TEXT,
  outcome TEXT CHECK (outcome IN (
    'student_improved',
    'student_completed',
    'student_dropped',
    'false_positive',
    'needs_escalation'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_assignment CHECK (
    (assigned_trainer_id IS NULL AND assigned_at IS NULL) OR
    (assigned_trainer_id IS NOT NULL AND assigned_at IS NOT NULL)
  ),
  CONSTRAINT valid_resolution CHECK (
    (status != 'resolved' AND resolved_at IS NULL) OR
    (status = 'resolved' AND resolved_at IS NOT NULL)
  )
);

-- Indexes for common queries
CREATE INDEX idx_student_interventions_student ON student_interventions(student_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_student_interventions_enrollment ON student_interventions(enrollment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_student_interventions_trainer ON student_interventions(assigned_trainer_id) WHERE deleted_at IS NULL AND status IN ('pending', 'in_progress');
CREATE INDEX idx_student_interventions_status ON student_interventions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_student_interventions_created ON student_interventions(created_at DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE student_interventions IS 'ACAD-027: Tracks interventions for at-risk students';

-- =====================================================
-- UPDATE TIMESTAMP TRIGGER
-- =====================================================

CREATE TRIGGER update_student_interventions_updated_at
  BEFORE UPDATE ON student_interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE student_interventions ENABLE ROW LEVEL SECURITY;

-- Students can view their own interventions
CREATE POLICY "Students can view own interventions"
  ON student_interventions
  FOR SELECT
  USING (
    student_id = auth.uid()
  );

-- Trainers and admins can view all interventions
CREATE POLICY "Trainers and admins can view all interventions"
  ON student_interventions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('trainer', 'admin', 'super_admin')
    )
  );

-- Trainers and admins can create interventions
CREATE POLICY "Trainers and admins can create interventions"
  ON student_interventions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('trainer', 'admin', 'super_admin')
    )
  );

-- Trainers can update interventions assigned to them
CREATE POLICY "Trainers can update assigned interventions"
  ON student_interventions
  FOR UPDATE
  USING (
    assigned_trainer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete interventions (soft delete)
CREATE POLICY "Only admins can delete interventions"
  ON student_interventions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to mark enrollment as at-risk
CREATE OR REPLACE FUNCTION mark_enrollment_at_risk(
  p_enrollment_id UUID,
  p_risk_level TEXT,
  p_risk_reasons TEXT[]
)
RETURNS VOID AS $$
BEGIN
  UPDATE student_enrollments
  SET
    is_at_risk = TRUE,
    at_risk_since = COALESCE(at_risk_since, NOW()),
    risk_level = p_risk_level,
    risk_reasons = p_risk_reasons,
    updated_at = NOW()
  WHERE id = p_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear at-risk status
CREATE OR REPLACE FUNCTION clear_at_risk_status(
  p_enrollment_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE student_enrollments
  SET
    is_at_risk = FALSE,
    at_risk_since = NULL,
    risk_level = NULL,
    risk_reasons = NULL,
    updated_at = NOW()
  WHERE id = p_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get at-risk students summary
CREATE OR REPLACE FUNCTION get_at_risk_students_summary()
RETURNS TABLE (
  total_at_risk BIGINT,
  high_risk BIGINT,
  medium_risk BIGINT,
  low_risk BIGINT,
  with_interventions BIGINT,
  pending_interventions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT se.id) AS total_at_risk,
    COUNT(DISTINCT CASE WHEN se.risk_level = 'high' THEN se.id END) AS high_risk,
    COUNT(DISTINCT CASE WHEN se.risk_level = 'medium' THEN se.id END) AS medium_risk,
    COUNT(DISTINCT CASE WHEN se.risk_level = 'low' THEN se.id END) AS low_risk,
    COUNT(DISTINCT si.enrollment_id) AS with_interventions,
    COUNT(DISTINCT CASE WHEN si.status = 'pending' THEN si.enrollment_id END) AS pending_interventions
  FROM student_enrollments se
  LEFT JOIN student_interventions si ON si.enrollment_id = se.id AND si.deleted_at IS NULL
  WHERE se.is_at_risk = TRUE
    AND se.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION mark_enrollment_at_risk(UUID, TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_at_risk_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_at_risk_students_summary() TO authenticated;

-- =====================================================
-- AUDIT LOG TRIGGERS
-- =====================================================

-- Log intervention status changes
CREATE OR REPLACE FUNCTION log_intervention_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (
      event_type,
      table_name,
      record_id,
      user_id,
      old_values,
      new_values,
      metadata
    ) VALUES (
      'intervention.status_changed',
      'student_interventions',
      NEW.id,
      auth.uid(),
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      jsonb_build_object(
        'student_id', NEW.student_id,
        'enrollment_id', NEW.enrollment_id,
        'from_status', OLD.status,
        'to_status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_intervention_status_change_trigger
  AFTER UPDATE ON student_interventions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_intervention_status_change();
