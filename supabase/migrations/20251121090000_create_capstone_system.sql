/**
 * ACAD-012: Capstone Project System
 *
 * Tables for capstone project submissions, peer reviews, and graduation workflow.
 */

-- ============================================================================
-- CAPSTONE SUBMISSIONS
-- ============================================================================

CREATE TABLE capstone_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Submission details
  repository_url TEXT NOT NULL,
  demo_video_url TEXT,
  description TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  revision_count INTEGER DEFAULT 0,

  -- Status workflow
  status TEXT DEFAULT 'pending' CHECK (
    status IN (
      'pending',           -- Just submitted
      'peer_review',       -- Awaiting peer reviews
      'trainer_review',    -- Awaiting trainer grading
      'passed',            -- Approved
      'failed',            -- Rejected (no more attempts)
      'revision_requested' -- Needs changes
    )
  ),

  -- Grading
  graded_by UUID REFERENCES user_profiles(id),
  graded_at TIMESTAMPTZ,
  grade NUMERIC(5,2) CHECK (grade BETWEEN 0 AND 100),
  feedback TEXT,
  rubric_scores JSONB, -- { "functionality": 30, "code_quality": 25, ... }

  -- Peer reviews
  peer_review_count INTEGER DEFAULT 0,
  avg_peer_rating NUMERIC(3,2) CHECK (avg_peer_rating BETWEEN 0 AND 5),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(enrollment_id, revision_count)
);

-- Indexes
CREATE INDEX idx_capstone_submissions_user ON capstone_submissions(user_id);
CREATE INDEX idx_capstone_submissions_enrollment ON capstone_submissions(enrollment_id);
CREATE INDEX idx_capstone_submissions_course ON capstone_submissions(course_id);
CREATE INDEX idx_capstone_submissions_status ON capstone_submissions(status);
CREATE INDEX idx_capstone_submissions_grader ON capstone_submissions(graded_by);

-- ============================================================================
-- PEER REVIEWS
-- ============================================================================

CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES capstone_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Review content
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT NOT NULL,
  strengths TEXT,
  improvements TEXT,

  -- Timestamps
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints (one review per reviewer per submission)
  UNIQUE(submission_id, reviewer_id)
);

-- Indexes
CREATE INDEX idx_peer_reviews_submission ON peer_reviews(submission_id);
CREATE INDEX idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update capstone_submissions.updated_at
CREATE TRIGGER update_capstone_submissions_updated_at
  BEFORE UPDATE ON capstone_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update peer_reviews.updated_at
CREATE TRIGGER update_peer_reviews_updated_at
  BEFORE UPDATE ON peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update peer review count and average rating
CREATE OR REPLACE FUNCTION update_peer_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE capstone_submissions
  SET
    peer_review_count = (
      SELECT COUNT(*) FROM peer_reviews WHERE submission_id = NEW.submission_id
    ),
    avg_peer_rating = (
      SELECT AVG(rating)::NUMERIC(3,2) FROM peer_reviews WHERE submission_id = NEW.submission_id
    )
  WHERE id = NEW.submission_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_peer_review_stats
  AFTER INSERT OR UPDATE ON peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_peer_review_stats();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE capstone_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;

-- Students can view their own submissions
CREATE POLICY capstone_submissions_select_own
  ON capstone_submissions FOR SELECT
  USING (user_id = auth.uid());

-- Students can insert their own submissions
CREATE POLICY capstone_submissions_insert_own
  ON capstone_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Students can update their own submissions (for revisions)
CREATE POLICY capstone_submissions_update_own
  ON capstone_submissions FOR UPDATE
  USING (user_id = auth.uid() AND status = 'revision_requested');

-- Trainers/admins can view all submissions
CREATE POLICY capstone_submissions_select_trainer
  ON capstone_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('trainer', 'admin', 'super_admin')
    )
  );

-- Trainers can update submissions (for grading)
CREATE POLICY capstone_submissions_update_trainer
  ON capstone_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('trainer', 'admin', 'super_admin')
    )
  );

-- Students can view peer reviews for their submissions
CREATE POLICY peer_reviews_select_own_submission
  ON peer_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM capstone_submissions
      WHERE id = peer_reviews.submission_id
      AND user_id = auth.uid()
    )
  );

-- Students can view their own reviews
CREATE POLICY peer_reviews_select_own_reviews
  ON peer_reviews FOR SELECT
  USING (reviewer_id = auth.uid());

-- Students can insert peer reviews (but not for their own submissions)
CREATE POLICY peer_reviews_insert_student
  ON peer_reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM capstone_submissions
      WHERE id = peer_reviews.submission_id
      AND user_id = auth.uid()
    )
  );

-- Trainers can view all peer reviews
CREATE POLICY peer_reviews_select_trainer
  ON peer_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('trainer', 'admin', 'super_admin')
    )
  );

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Capstone grading queue for trainers
CREATE OR REPLACE VIEW capstone_grading_queue AS
SELECT
  cs.id,
  cs.user_id,
  cs.enrollment_id,
  cs.course_id,
  up.full_name as student_name,
  up.email as student_email,
  c.title as course_title,
  cs.repository_url,
  cs.demo_video_url,
  cs.description,
  cs.submitted_at,
  cs.status,
  cs.revision_count,
  cs.peer_review_count,
  cs.avg_peer_rating,
  EXTRACT(EPOCH FROM (NOW() - cs.submitted_at))/3600 as hours_waiting
FROM capstone_submissions cs
JOIN user_profiles up ON cs.user_id = up.id
JOIN courses c ON cs.course_id = c.id
WHERE cs.status IN ('pending', 'peer_review', 'trainer_review')
ORDER BY cs.submitted_at ASC;

-- Capstone statistics
CREATE OR REPLACE VIEW capstone_statistics AS
SELECT
  cs.course_id,
  c.title as course_title,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN cs.status = 'passed' THEN 1 END) as passed_count,
  COUNT(CASE WHEN cs.status = 'failed' THEN 1 END) as failed_count,
  COUNT(CASE WHEN cs.status = 'revision_requested' THEN 1 END) as revision_count,
  AVG(cs.grade) FILTER (WHERE cs.grade IS NOT NULL) as avg_grade,
  AVG(cs.peer_review_count) as avg_peer_reviews,
  AVG(cs.revision_count) as avg_revisions
FROM capstone_submissions cs
JOIN courses c ON cs.course_id = c.id
GROUP BY cs.course_id, c.title;

-- Peer review leaderboard
CREATE OR REPLACE VIEW peer_review_leaderboard AS
SELECT
  pr.reviewer_id,
  up.full_name as reviewer_name,
  COUNT(*) as reviews_completed,
  AVG(pr.rating) as avg_rating_given,
  COUNT(DISTINCT cs.course_id) as courses_reviewed
FROM peer_reviews pr
JOIN user_profiles up ON pr.reviewer_id = up.id
JOIN capstone_submissions cs ON pr.submission_id = cs.id
GROUP BY pr.reviewer_id, up.full_name
ORDER BY reviews_completed DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE capstone_submissions IS 'Student capstone project submissions with grading workflow';
COMMENT ON TABLE peer_reviews IS 'Peer reviews for capstone submissions';
COMMENT ON VIEW capstone_grading_queue IS 'Capstone submissions awaiting trainer grading';
COMMENT ON VIEW capstone_statistics IS 'Capstone submission statistics by course';
COMMENT ON VIEW peer_review_leaderboard IS 'Top peer reviewers by review count';
