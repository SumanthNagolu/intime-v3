/**
 * Prerequisites and Sequencing Helper Views
 * Story: ACAD-006
 *
 * Creates helper views and functions for prerequisite checking and sequencing
 */

-- =====================================================
-- VIEW: module_unlock_requirements
-- =====================================================
CREATE OR REPLACE VIEW module_unlock_requirements AS
SELECT
  cm.id AS module_id,
  cm.course_id,
  cm.title AS module_title,
  cm.module_number,
  cm.prerequisite_module_ids,
  (
    SELECT ARRAY_AGG(cm2.title)
    FROM course_modules cm2
    WHERE cm2.id = ANY(cm.prerequisite_module_ids)
  ) AS prerequisite_titles,
  (
    SELECT ARRAY_AGG(cm2.module_number)
    FROM course_modules cm2
    WHERE cm2.id = ANY(cm.prerequisite_module_ids)
  ) AS prerequisite_numbers
FROM course_modules cm;

-- =====================================================
-- VIEW: topic_unlock_requirements
-- =====================================================
CREATE OR REPLACE VIEW topic_unlock_requirements AS
SELECT
  mt.id AS topic_id,
  mt.module_id,
  mt.title AS topic_title,
  mt.topic_number,
  mt.prerequisite_topic_ids,
  (
    SELECT ARRAY_AGG(mt2.title)
    FROM module_topics mt2
    WHERE mt2.id = ANY(mt.prerequisite_topic_ids)
  ) AS prerequisite_titles,
  (
    SELECT ARRAY_AGG(mt2.topic_number)
    FROM module_topics mt2
    WHERE mt2.id = ANY(mt.prerequisite_topic_ids)
  ) AS prerequisite_numbers
FROM module_topics mt;

-- =====================================================
-- FUNCTION: check_course_prerequisites
-- =====================================================
CREATE OR REPLACE FUNCTION check_course_prerequisites(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_course_ids UUID[];
  v_completed_course_ids UUID[];
BEGIN
  -- Get prerequisite courses
  SELECT prerequisite_course_ids INTO v_prerequisite_course_ids
  FROM courses
  WHERE id = p_course_id;

  -- If no prerequisites, course is accessible
  IF v_prerequisite_course_ids IS NULL OR array_length(v_prerequisite_course_ids, 1) = 0 THEN
    RETURN true;
  END IF;

  -- Get completed courses for user
  SELECT ARRAY_AGG(course_id) INTO v_completed_course_ids
  FROM student_enrollments
  WHERE user_id = p_user_id
    AND status = 'completed';

  -- Check if all prerequisite courses are completed
  RETURN v_prerequisite_course_ids <@ COALESCE(v_completed_course_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: check_module_prerequisites
-- =====================================================
CREATE OR REPLACE FUNCTION check_module_prerequisites(
  p_user_id UUID,
  p_module_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_module_ids UUID[];
  v_module_course_id UUID;
  v_completed_topics UUID[];
BEGIN
  -- Get prerequisite modules and course ID
  SELECT prerequisite_module_ids, course_id
  INTO v_prerequisite_module_ids, v_module_course_id
  FROM course_modules
  WHERE id = p_module_id;

  -- If no prerequisites, module is accessible
  IF v_prerequisite_module_ids IS NULL OR array_length(v_prerequisite_module_ids, 1) = 0 THEN
    RETURN true;
  END IF;

  -- Check if user has completed all topics in prerequisite modules
  FOR i IN 1..array_length(v_prerequisite_module_ids, 1) LOOP
    DECLARE
      v_prereq_module_id UUID := v_prerequisite_module_ids[i];
      v_total_topics INTEGER;
      v_completed_count INTEGER;
    BEGIN
      -- Get total required topics in prerequisite module
      SELECT COUNT(*)
      INTO v_total_topics
      FROM module_topics
      WHERE module_id = v_prereq_module_id
        AND is_required = true;

      -- Get completed topics count
      SELECT COUNT(*)
      INTO v_completed_count
      FROM topic_completions tc
      JOIN module_topics mt ON mt.id = tc.topic_id
      WHERE tc.user_id = p_user_id
        AND mt.module_id = v_prereq_module_id
        AND mt.is_required = true;

      -- If not all required topics completed, prerequisite not met
      IF v_completed_count < v_total_topics THEN
        RETURN false;
      END IF;
    END;
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: get_locked_topics_for_user
-- =====================================================
CREATE OR REPLACE FUNCTION get_locked_topics_for_user(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS TABLE (
  topic_id UUID,
  topic_title TEXT,
  module_id UUID,
  module_title TEXT,
  topic_number INTEGER,
  is_unlocked BOOLEAN,
  missing_prerequisites TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mt.id AS topic_id,
    mt.title AS topic_title,
    cm.id AS module_id,
    cm.title AS module_title,
    mt.topic_number,
    is_topic_unlocked(p_user_id, mt.id) AS is_unlocked,
    COALESCE(
      (
        SELECT ARRAY_AGG(mt2.title)
        FROM module_topics mt2
        WHERE mt2.id = ANY(mt.prerequisite_topic_ids)
          AND NOT EXISTS (
            SELECT 1
            FROM topic_completions tc
            WHERE tc.user_id = p_user_id
              AND tc.topic_id = mt2.id
          )
      ),
      ARRAY[]::TEXT[]
    ) AS missing_prerequisites
  FROM module_topics mt
  JOIN course_modules cm ON cm.id = mt.module_id
  WHERE cm.course_id = p_course_id
    AND mt.is_published = true
  ORDER BY cm.module_number, mt.topic_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: get_next_unlocked_topic
-- =====================================================
CREATE OR REPLACE FUNCTION get_next_unlocked_topic(
  p_user_id UUID,
  p_enrollment_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_course_id UUID;
  v_next_topic_id UUID;
BEGIN
  -- Get course ID from enrollment
  SELECT course_id INTO v_course_id
  FROM student_enrollments
  WHERE id = p_enrollment_id;

  -- Find first unlocked, incomplete topic
  SELECT mt.id INTO v_next_topic_id
  FROM module_topics mt
  JOIN course_modules cm ON cm.id = mt.module_id
  WHERE cm.course_id = v_course_id
    AND mt.is_published = true
    AND is_topic_unlocked(p_user_id, mt.id) = true
    AND NOT EXISTS (
      SELECT 1
      FROM topic_completions tc
      WHERE tc.user_id = p_user_id
        AND tc.topic_id = mt.id
    )
  ORDER BY cm.module_number, mt.topic_number
  LIMIT 1;

  RETURN v_next_topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: bypass_prerequisites_for_role
-- =====================================================
CREATE OR REPLACE FUNCTION bypass_prerequisites_for_role(
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_bypass_role BOOLEAN;
BEGIN
  -- Check if user has admin, trainer, or course_admin role
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
      AND r.name IN ('admin', 'trainer', 'course_admin')
  ) INTO v_has_bypass_role;

  RETURN COALESCE(v_has_bypass_role, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON VIEW module_unlock_requirements IS 'Helper view showing module prerequisites with titles';
COMMENT ON VIEW topic_unlock_requirements IS 'Helper view showing topic prerequisites with titles';
COMMENT ON FUNCTION check_course_prerequisites IS 'Checks if user has completed prerequisite courses';
COMMENT ON FUNCTION check_module_prerequisites IS 'Checks if user has completed prerequisite modules';
COMMENT ON FUNCTION get_locked_topics_for_user IS 'Returns all topics for a course with unlock status';
COMMENT ON FUNCTION get_next_unlocked_topic IS 'Finds the next available topic for a student';
COMMENT ON FUNCTION bypass_prerequisites_for_role IS 'Checks if user has role that bypasses prerequisites';
