/**
 * Create progress tracking functions separately
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EXECUTE_SQL_URL = `${SUPABASE_URL}/functions/v1/execute-sql`;

async function executeSQL(sql: string): Promise<any> {
  const response = await fetch(EXECUTE_SQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

async function createFunctions() {
  console.log('\n🔧 Creating progress tracking functions...\n');

  // Function 1: get_user_total_xp
  console.log('📝 Creating get_user_total_xp...');
  const getUserTotalXpSQL = `
CREATE OR REPLACE FUNCTION get_user_total_xp(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total_xp INTEGER;
BEGIN
  SELECT COALESCE(total_xp, 0) INTO v_total_xp
  FROM user_xp_totals
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_total_xp, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    await executeSQL(getUserTotalXpSQL);
    console.log('✅ get_user_total_xp created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Function 2: is_topic_unlocked
  console.log('📝 Creating is_topic_unlocked...');
  const isTopicUnlockedSQL = `
CREATE OR REPLACE FUNCTION is_topic_unlocked(
  p_user_id UUID,
  p_topic_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_topics UUID[];
  v_completed_topics UUID[];
BEGIN
  SELECT prerequisite_topic_ids INTO v_prerequisite_topics
  FROM module_topics
  WHERE id = p_topic_id;

  IF v_prerequisite_topics IS NULL OR array_length(v_prerequisite_topics, 1) = 0 THEN
    RETURN true;
  END IF;

  SELECT ARRAY_AGG(topic_id) INTO v_completed_topics
  FROM topic_completions
  WHERE user_id = p_user_id;

  RETURN v_prerequisite_topics <@ COALESCE(v_completed_topics, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    await executeSQL(isTopicUnlockedSQL);
    console.log('✅ is_topic_unlocked created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Function 3: update_enrollment_progress
  console.log('📝 Creating update_enrollment_progress...');
  const updateEnrollmentProgressSQL = `
CREATE OR REPLACE FUNCTION update_enrollment_progress(
  p_enrollment_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
  v_total_topics INTEGER;
  v_completed_topics INTEGER;
  v_new_percentage INTEGER;
  v_current_percentage INTEGER;
BEGIN
  SELECT user_id, course_id, completion_percentage
  INTO v_user_id, v_course_id, v_current_percentage
  FROM student_enrollments
  WHERE id = p_enrollment_id;

  SELECT total_topics INTO v_total_topics
  FROM courses
  WHERE id = v_course_id;

  IF v_total_topics = 0 THEN
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_completed_topics
  FROM topic_completions
  WHERE enrollment_id = p_enrollment_id;

  v_new_percentage := LEAST(100, (v_completed_topics * 100) / v_total_topics);

  UPDATE student_enrollments
  SET
    completion_percentage = v_new_percentage,
    updated_at = NOW(),
    completed_at = CASE
      WHEN v_new_percentage = 100 AND v_current_percentage < 100 THEN NOW()
      ELSE completed_at
    END,
    status = CASE
      WHEN v_new_percentage = 100 AND status = 'active' THEN 'completed'
      ELSE status
    END
  WHERE id = p_enrollment_id;

  IF v_new_percentage = 100 AND v_current_percentage < 100 THEN
    BEGIN
      PERFORM publish_event(
        'course.graduated',
        jsonb_build_object(
          'enrollment_id', p_enrollment_id,
          'user_id', v_user_id,
          'course_id', v_course_id,
          'completed_topics', v_completed_topics
        ),
        jsonb_build_object('source', 'update_enrollment_progress'),
        v_user_id
      );
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLSTATE = '42883' THEN
          NULL;
        ELSE
          RAISE;
        END IF;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    await executeSQL(updateEnrollmentProgressSQL);
    console.log('✅ update_enrollment_progress created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Function 4: complete_topic (most complex)
  console.log('📝 Creating complete_topic...');
  const completeTopicSQL = `
CREATE OR REPLACE FUNCTION complete_topic(
  p_user_id UUID,
  p_enrollment_id UUID,
  p_topic_id UUID,
  p_time_spent_seconds INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_completion_id UUID;
  v_course_id UUID;
  v_module_id UUID;
  v_topic_unlocked BOOLEAN;
  v_content_type TEXT;
  v_xp_earned INTEGER;
BEGIN
  SELECT is_topic_unlocked(p_user_id, p_topic_id) INTO v_topic_unlocked;

  IF NOT v_topic_unlocked THEN
    RAISE EXCEPTION 'Topic is locked. Complete prerequisites first.';
  END IF;

  SELECT course_id, module_id, content_type
  INTO v_course_id, v_module_id, v_content_type
  FROM module_topics
  WHERE id = p_topic_id;

  v_xp_earned := CASE v_content_type
    WHEN 'video' THEN 10
    WHEN 'reading' THEN 10
    WHEN 'quiz' THEN 20
    WHEN 'lab' THEN 30
    WHEN 'project' THEN 50
    ELSE 10
  END;

  INSERT INTO topic_completions (
    user_id, enrollment_id, course_id, module_id, topic_id,
    time_spent_seconds, xp_earned, completion_source
  ) VALUES (
    p_user_id, p_enrollment_id, v_course_id, v_module_id, p_topic_id,
    p_time_spent_seconds, v_xp_earned, 'manual'
  )
  ON CONFLICT (user_id, topic_id) DO UPDATE
  SET
    time_spent_seconds = topic_completions.time_spent_seconds + EXCLUDED.time_spent_seconds,
    updated_at = NOW()
  RETURNING id INTO v_completion_id;

  IF v_completion_id IS NOT NULL THEN
    INSERT INTO xp_transactions (
      user_id, amount, transaction_type,
      reference_type, reference_id, description
    ) VALUES (
      p_user_id, v_xp_earned, 'topic_completion',
      'topic_completion', v_completion_id,
      'Completed topic: ' || v_content_type
    );
  END IF;

  PERFORM update_enrollment_progress(p_enrollment_id);

  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_xp_totals;
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLSTATE = '55000' THEN
        NULL;
      ELSE
        RAISE;
      END IF;
  END;

  RETURN v_completion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    await executeSQL(completeTopicSQL);
    console.log('✅ complete_topic created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  console.log('✅ All functions created!\n');
}

createFunctions();
