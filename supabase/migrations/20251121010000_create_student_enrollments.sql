-- ============================================================================
-- Migration: Create Student Enrollments System
-- Story: ACAD-002
-- Description: Track course enrollments, payments, and access control
-- ============================================================================

-- ============================================================================
-- STUDENT_ENROLLMENTS: Track course enrollments and access
-- ============================================================================

CREATE TABLE student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who & What
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,

  -- Enrollment status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'completed', 'dropped', 'expired')
  ),

  -- Dates
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  starts_at TIMESTAMPTZ, -- When course access begins
  expires_at TIMESTAMPTZ, -- Subscription end date
  completed_at TIMESTAMPTZ, -- Graduation date
  dropped_at TIMESTAMPTZ, -- If student withdraws

  -- Payment tracking
  payment_id TEXT, -- Stripe payment/subscription ID
  payment_amount NUMERIC(10,2),
  payment_type TEXT CHECK (payment_type IN ('subscription', 'one_time', 'free', 'scholarship')),

  -- Progress tracking
  current_module_id UUID REFERENCES course_modules(id),
  current_topic_id UUID REFERENCES module_topics(id),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),

  -- Metadata
  enrollment_source TEXT, -- 'web', 'admin', 'api', 'bulk_import'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_course_enrollment UNIQUE (user_id, course_id),
  CONSTRAINT valid_dates CHECK (
    (completed_at IS NULL OR completed_at >= enrolled_at) AND
    (dropped_at IS NULL OR dropped_at >= enrolled_at)
  )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_enrollments_user_id ON student_enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON student_enrollments(course_id);
CREATE INDEX idx_enrollments_status ON student_enrollments(status);
CREATE INDEX idx_enrollments_active ON student_enrollments(user_id, status)
  WHERE status = 'active';
CREATE INDEX idx_enrollments_payment ON student_enrollments(payment_id)
  WHERE payment_id IS NOT NULL;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can view their own enrollments
CREATE POLICY "Students view own enrollments"
  ON student_enrollments
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'trainer', 'course_admin')
      )
    )
  );

-- Only admins/course_admins can create enrollments
CREATE POLICY "Admins create enrollments"
  ON student_enrollments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'course_admin')
      )
    )
  );

-- Students can update their own enrollment (drop course)
CREATE POLICY "Students update own enrollments"
  ON student_enrollments
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'trainer', 'course_admin')
      )
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Check prerequisites before enrollment
CREATE OR REPLACE FUNCTION check_enrollment_prerequisites(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_ids UUID[];
  v_completed_course_ids UUID[];
BEGIN
  -- Get prerequisite course IDs
  SELECT prerequisite_course_ids INTO v_prerequisite_ids
  FROM courses
  WHERE id = p_course_id;

  -- If no prerequisites, allow enrollment
  IF v_prerequisite_ids IS NULL OR array_length(v_prerequisite_ids, 1) = 0 THEN
    RETURN true;
  END IF;

  -- Get completed course IDs for this user
  SELECT ARRAY_AGG(course_id) INTO v_completed_course_ids
  FROM student_enrollments
  WHERE user_id = p_user_id
    AND status = 'completed';

  -- Check if all prerequisites are completed
  RETURN v_prerequisite_ids <@ COALESCE(v_completed_course_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Enroll student in course
CREATE OR REPLACE FUNCTION enroll_student(
  p_user_id UUID,
  p_course_id UUID,
  p_payment_id TEXT,
  p_payment_amount NUMERIC,
  p_payment_type TEXT,
  p_starts_at TIMESTAMPTZ DEFAULT NOW(),
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_enrollment_id UUID;
  v_prerequisites_met BOOLEAN;
BEGIN
  -- Check prerequisites
  SELECT check_enrollment_prerequisites(p_user_id, p_course_id)
  INTO v_prerequisites_met;

  IF NOT v_prerequisites_met THEN
    RAISE EXCEPTION 'Prerequisites not met for course enrollment';
  END IF;

  -- Create enrollment
  INSERT INTO student_enrollments (
    user_id,
    course_id,
    status,
    starts_at,
    expires_at,
    payment_id,
    payment_amount,
    payment_type,
    enrollment_source
  ) VALUES (
    p_user_id,
    p_course_id,
    CASE
      WHEN p_starts_at <= NOW() THEN 'active'
      ELSE 'pending'
    END,
    p_starts_at,
    p_expires_at,
    p_payment_id,
    p_payment_amount,
    p_payment_type,
    'api'
  )
  RETURNING id INTO v_enrollment_id;

  -- Publish enrollment event
  PERFORM publish_event(
    'course.enrolled',
    jsonb_build_object(
      'enrollment_id', v_enrollment_id,
      'user_id', p_user_id,
      'course_id', p_course_id,
      'payment_type', p_payment_type
    ),
    jsonb_build_object('source', 'enroll_student'),
    p_user_id
  );

  RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update enrollment status
CREATE OR REPLACE FUNCTION update_enrollment_status(
  p_enrollment_id UUID,
  p_new_status TEXT
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
BEGIN
  UPDATE student_enrollments
  SET
    status = p_new_status,
    updated_at = NOW(),
    completed_at = CASE WHEN p_new_status = 'completed' THEN NOW() ELSE completed_at END,
    dropped_at = CASE WHEN p_new_status = 'dropped' THEN NOW() ELSE dropped_at END
  WHERE id = p_enrollment_id
  RETURNING user_id, course_id INTO v_user_id, v_course_id;

  -- Publish status change event
  PERFORM publish_event(
    'enrollment.status_changed',
    jsonb_build_object(
      'enrollment_id', p_enrollment_id,
      'user_id', v_user_id,
      'course_id', v_course_id,
      'new_status', p_new_status
    ),
    jsonb_build_object('source', 'update_enrollment_status'),
    v_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enrollment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enrollment_updated_at
BEFORE UPDATE ON student_enrollments
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE student_enrollments IS 'Track student enrollments in courses with payment and progress tracking';
COMMENT ON COLUMN student_enrollments.status IS 'Enrollment lifecycle: pending → active → completed/dropped/expired';
COMMENT ON COLUMN student_enrollments.payment_type IS 'Payment method: subscription (recurring), one_time (single payment), free (no charge), scholarship (sponsored)';
COMMENT ON FUNCTION enroll_student IS 'Enroll a student in a course with prerequisite validation and event publishing';
COMMENT ON FUNCTION check_enrollment_prerequisites IS 'Check if student has completed all prerequisite courses';
