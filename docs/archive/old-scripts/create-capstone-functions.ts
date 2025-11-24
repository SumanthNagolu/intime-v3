/**
 * Create Database Functions for ACAD-012: Capstone System
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const functions = [
  {
    name: 'submit_capstone',
    sql: `
CREATE OR REPLACE FUNCTION submit_capstone(
  p_user_id UUID,
  p_enrollment_id UUID,
  p_course_id UUID,
  p_repository_url TEXT,
  p_demo_video_url TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_submission_id UUID;
  v_previous_submission_count INTEGER;
BEGIN
  -- Check if user has an active enrollment
  IF NOT EXISTS (
    SELECT 1 FROM student_enrollments
    WHERE id = p_enrollment_id
    AND user_id = p_user_id
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid or inactive enrollment';
  END IF;

  -- Count previous submissions for revision count
  SELECT COUNT(*) INTO v_previous_submission_count
  FROM capstone_submissions
  WHERE enrollment_id = p_enrollment_id;

  -- Create submission
  INSERT INTO capstone_submissions (
    user_id,
    enrollment_id,
    course_id,
    repository_url,
    demo_video_url,
    description,
    revision_count,
    status
  ) VALUES (
    p_user_id,
    p_enrollment_id,
    p_course_id,
    p_repository_url,
    p_demo_video_url,
    p_description,
    v_previous_submission_count,
    'pending'
  )
  RETURNING id INTO v_submission_id;

  -- Log event
  PERFORM publish_event(
    'capstone.submitted',
    v_submission_id,
    jsonb_build_object(
      'user_id', p_user_id,
      'enrollment_id', p_enrollment_id,
      'course_id', p_course_id,
      'revision_count', v_previous_submission_count
    ),
    p_user_id
  );

  RETURN v_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'submit_peer_review',
    sql: `
CREATE OR REPLACE FUNCTION submit_peer_review(
  p_submission_id UUID,
  p_reviewer_id UUID,
  p_rating INTEGER,
  p_comments TEXT,
  p_strengths TEXT DEFAULT NULL,
  p_improvements TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_review_id UUID;
  v_submission_user_id UUID;
BEGIN
  -- Get submission owner
  SELECT user_id INTO v_submission_user_id
  FROM capstone_submissions
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- Prevent self-review
  IF v_submission_user_id = p_reviewer_id THEN
    RAISE EXCEPTION 'Cannot review your own submission';
  END IF;

  -- Check if reviewer is enrolled in the same course
  IF NOT EXISTS (
    SELECT 1 FROM student_enrollments se1
    WHERE se1.user_id = p_reviewer_id
    AND se1.course_id = (
      SELECT course_id FROM capstone_submissions WHERE id = p_submission_id
    )
    AND se1.status IN ('active', 'completed')
  ) THEN
    RAISE EXCEPTION 'Must be enrolled in the same course to peer review';
  END IF;

  -- Insert or update peer review
  INSERT INTO peer_reviews (
    submission_id,
    reviewer_id,
    rating,
    comments,
    strengths,
    improvements
  ) VALUES (
    p_submission_id,
    p_reviewer_id,
    p_rating,
    p_comments,
    p_strengths,
    p_improvements
  )
  ON CONFLICT (submission_id, reviewer_id)
  DO UPDATE SET
    rating = EXCLUDED.rating,
    comments = EXCLUDED.comments,
    strengths = EXCLUDED.strengths,
    improvements = EXCLUDED.improvements,
    reviewed_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_review_id;

  -- Update submission status if enough peer reviews
  UPDATE capstone_submissions
  SET status = CASE
    WHEN peer_review_count >= 3 AND status = 'pending' THEN 'trainer_review'
    ELSE status
  END
  WHERE id = p_submission_id;

  RETURN v_review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'grade_capstone',
    sql: `
CREATE OR REPLACE FUNCTION grade_capstone(
  p_submission_id UUID,
  p_grader_id UUID,
  p_grade NUMERIC,
  p_feedback TEXT,
  p_rubric_scores JSONB DEFAULT NULL,
  p_status TEXT DEFAULT 'passed'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_enrollment_id UUID;
  v_user_id UUID;
BEGIN
  -- Validate status
  IF p_status NOT IN ('passed', 'failed', 'revision_requested') THEN
    RAISE EXCEPTION 'Invalid status. Must be: passed, failed, or revision_requested';
  END IF;

  -- Update submission
  UPDATE capstone_submissions
  SET
    graded_by = p_grader_id,
    graded_at = NOW(),
    grade = p_grade,
    feedback = p_feedback,
    rubric_scores = p_rubric_scores,
    status = p_status,
    updated_at = NOW()
  WHERE id = p_submission_id
  RETURNING enrollment_id, user_id INTO v_enrollment_id, v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- If passed, check graduation eligibility
  IF p_status = 'passed' THEN
    -- Award XP for capstone completion
    INSERT INTO xp_transactions (
      user_id,
      enrollment_id,
      amount,
      reason,
      source_type,
      source_id
    ) VALUES (
      v_user_id,
      v_enrollment_id,
      100, -- Capstone XP reward
      'Capstone project passed',
      'capstone',
      p_submission_id
    );

    -- Check if eligible for graduation
    IF check_graduation_eligibility(v_enrollment_id) THEN
      PERFORM trigger_graduation(v_enrollment_id);
    END IF;
  END IF;

  -- Log event
  PERFORM publish_event(
    'capstone.graded',
    p_submission_id,
    jsonb_build_object(
      'user_id', v_user_id,
      'enrollment_id', v_enrollment_id,
      'grade', p_grade,
      'status', p_status,
      'grader_id', p_grader_id
    ),
    p_grader_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'check_graduation_eligibility',
    sql: `
CREATE OR REPLACE FUNCTION check_graduation_eligibility(p_enrollment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_capstone_passed BOOLEAN;
  v_all_topics_complete BOOLEAN;
BEGIN
  -- Check if capstone passed
  SELECT EXISTS (
    SELECT 1 FROM capstone_submissions
    WHERE enrollment_id = p_enrollment_id
    AND status = 'passed'
  ) INTO v_capstone_passed;

  -- Check if all topics completed (100% progress)
  SELECT (completion_percentage >= 100) INTO v_all_topics_complete
  FROM student_enrollments
  WHERE id = p_enrollment_id;

  RETURN v_capstone_passed AND v_all_topics_complete;
END;
$$ LANGUAGE plpgsql;
    `,
  },
  {
    name: 'trigger_graduation',
    sql: `
CREATE OR REPLACE FUNCTION trigger_graduation(p_enrollment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
  v_enrollment_rec RECORD;
BEGIN
  -- Get enrollment details
  SELECT * INTO v_enrollment_rec
  FROM student_enrollments
  WHERE id = p_enrollment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enrollment not found';
  END IF;

  v_user_id := v_enrollment_rec.user_id;
  v_course_id := v_enrollment_rec.course_id;

  -- Update enrollment status to completed
  UPDATE student_enrollments
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_enrollment_id;

  -- Grant 'candidate' role (graduates become bench candidates)
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = v_user_id
    AND r.name = 'candidate'
  ) THEN
    PERFORM grant_role_to_user(
      v_user_id,
      'candidate',
      v_user_id, -- Self-granted via system
      FALSE, -- Not primary
      NULL -- No expiration
    );
  END IF;

  -- Publish graduation event (will trigger certificate generation)
  PERFORM publish_event(
    'student.graduated',
    v_user_id,
    jsonb_build_object(
      'enrollment_id', p_enrollment_id,
      'course_id', v_course_id,
      'graduated_at', NOW()
    ),
    v_user_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_capstone_submissions',
    sql: `
CREATE OR REPLACE FUNCTION get_capstone_submissions(
  p_user_id UUID DEFAULT NULL,
  p_course_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  student_name TEXT,
  student_email TEXT,
  enrollment_id UUID,
  course_id UUID,
  course_title TEXT,
  repository_url TEXT,
  demo_video_url TEXT,
  description TEXT,
  submitted_at TIMESTAMPTZ,
  revision_count INTEGER,
  status TEXT,
  graded_by UUID,
  grader_name TEXT,
  graded_at TIMESTAMPTZ,
  grade NUMERIC,
  feedback TEXT,
  rubric_scores JSONB,
  peer_review_count INTEGER,
  avg_peer_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.user_id,
    up.full_name as student_name,
    up.email as student_email,
    cs.enrollment_id,
    cs.course_id,
    c.title as course_title,
    cs.repository_url,
    cs.demo_video_url,
    cs.description,
    cs.submitted_at,
    cs.revision_count,
    cs.status,
    cs.graded_by,
    grader.full_name as grader_name,
    cs.graded_at,
    cs.grade,
    cs.feedback,
    cs.rubric_scores,
    cs.peer_review_count,
    cs.avg_peer_rating
  FROM capstone_submissions cs
  JOIN user_profiles up ON cs.user_id = up.id
  JOIN courses c ON cs.course_id = c.id
  LEFT JOIN user_profiles grader ON cs.graded_by = grader.id
  WHERE
    (p_user_id IS NULL OR cs.user_id = p_user_id)
    AND (p_course_id IS NULL OR cs.course_id = p_course_id)
    AND (p_status IS NULL OR cs.status = p_status)
  ORDER BY cs.submitted_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
    `,
  },
  {
    name: 'get_peer_reviews_for_submission',
    sql: `
CREATE OR REPLACE FUNCTION get_peer_reviews_for_submission(p_submission_id UUID)
RETURNS TABLE (
  id UUID,
  reviewer_id UUID,
  reviewer_name TEXT,
  rating INTEGER,
  comments TEXT,
  strengths TEXT,
  improvements TEXT,
  reviewed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id,
    pr.reviewer_id,
    up.full_name as reviewer_name,
    pr.rating,
    pr.comments,
    pr.strengths,
    pr.improvements,
    pr.reviewed_at
  FROM peer_reviews pr
  JOIN user_profiles up ON pr.reviewer_id = up.id
  WHERE pr.submission_id = p_submission_id
  ORDER BY pr.reviewed_at DESC;
END;
$$ LANGUAGE plpgsql;
    `,
  },
  {
    name: 'get_submissions_for_peer_review',
    sql: `
CREATE OR REPLACE FUNCTION get_submissions_for_peer_review(
  p_reviewer_id UUID,
  p_course_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  student_name TEXT,
  course_title TEXT,
  repository_url TEXT,
  demo_video_url TEXT,
  description TEXT,
  submitted_at TIMESTAMPTZ,
  peer_review_count INTEGER,
  already_reviewed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.user_id,
    up.full_name as student_name,
    c.title as course_title,
    cs.repository_url,
    cs.demo_video_url,
    cs.description,
    cs.submitted_at,
    cs.peer_review_count,
    EXISTS (
      SELECT 1 FROM peer_reviews pr
      WHERE pr.submission_id = cs.id
      AND pr.reviewer_id = p_reviewer_id
    ) as already_reviewed
  FROM capstone_submissions cs
  JOIN user_profiles up ON cs.user_id = up.id
  JOIN courses c ON cs.course_id = c.id
  WHERE
    cs.course_id = p_course_id
    AND cs.user_id != p_reviewer_id -- Don't show own submissions
    AND cs.status IN ('pending', 'peer_review')
  ORDER BY cs.peer_review_count ASC, cs.submitted_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
    `,
  },
];

async function createFunctions() {
  console.log('🔧 Creating ACAD-012 Capstone System Functions\n');

  for (const func of functions) {
    console.log(`Creating function: ${func.name}...`);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/execute-sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql: func.sql }),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log(`✅ ${func.name} created`);
    } else {
      console.error(`❌ Failed to create ${func.name}:`);
      console.error(result.error);
      process.exit(1);
    }
  }

  console.log('\n✅ All functions created successfully!');
}

createFunctions();
