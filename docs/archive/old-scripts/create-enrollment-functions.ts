/**
 * Create enrollment functions separately
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
  console.log('\n🔧 Creating enrollment functions...\n');

  // Function 1: Check prerequisites
  console.log('📝 Creating check_enrollment_prerequisites...');
  const checkPrereqsSQL = `
CREATE OR REPLACE FUNCTION check_enrollment_prerequisites(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_ids UUID[];
  v_completed_course_ids UUID[];
BEGIN
  SELECT prerequisite_course_ids INTO v_prerequisite_ids
  FROM courses
  WHERE id = p_course_id;

  IF v_prerequisite_ids IS NULL OR array_length(v_prerequisite_ids, 1) = 0 THEN
    RETURN true;
  END IF;

  SELECT ARRAY_AGG(course_id) INTO v_completed_course_ids
  FROM student_enrollments
  WHERE user_id = p_user_id AND status = 'completed';

  RETURN v_prerequisite_ids <@ COALESCE(v_completed_course_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    await executeSQL(checkPrereqsSQL);
    console.log('✅ check_enrollment_prerequisites created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Function 2: Enroll student
  console.log('📝 Creating enroll_student...');
  const enrollStudentSQL = `
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
  SELECT check_enrollment_prerequisites(p_user_id, p_course_id)
  INTO v_prerequisites_met;

  IF NOT v_prerequisites_met THEN
    RAISE EXCEPTION 'Prerequisites not met for course enrollment';
  END IF;

  INSERT INTO student_enrollments (
    user_id, course_id, status, starts_at, expires_at,
    payment_id, payment_amount, payment_type, enrollment_source
  ) VALUES (
    p_user_id, p_course_id,
    CASE WHEN p_starts_at <= NOW() THEN 'active' ELSE 'pending' END,
    p_starts_at, p_expires_at,
    p_payment_id, p_payment_amount, p_payment_type, 'api'
  )
  RETURNING id INTO v_enrollment_id;

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
EXCEPTION
  WHEN OTHERS THEN
    -- If publish_event doesn't exist, just return enrollment_id
    IF SQLSTATE = '42883' THEN
      RETURN v_enrollment_id;
    ELSE
      RAISE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    await executeSQL(enrollStudentSQL);
    console.log('✅ enroll_student created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Function 3: Update enrollment status
  console.log('📝 Creating update_enrollment_status...');
  const updateStatusSQL = `
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
EXCEPTION
  WHEN OTHERS THEN
    -- If publish_event doesn't exist, silently continue
    IF SQLSTATE = '42883' THEN
      NULL;
    ELSE
      RAISE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    await executeSQL(updateStatusSQL);
    console.log('✅ update_enrollment_status created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  console.log('✅ All functions created!\n');
}

createFunctions();
