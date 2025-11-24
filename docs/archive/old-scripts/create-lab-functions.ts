/**
 * Create Lab Environment Functions
 * ACAD-008
 */

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
  console.log('\n🧪 Creating Lab Environment Functions...\n');

  // 1. Start Lab Instance
  console.log('Creating start_lab_instance()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION start_lab_instance(
      p_user_id UUID,
      p_topic_id UUID,
      p_enrollment_id UUID,
      p_forked_repo_url TEXT,
      p_original_template_url TEXT,
      p_time_limit_minutes INTEGER DEFAULT 120,
      p_github_username TEXT DEFAULT NULL,
      p_lab_template_id UUID DEFAULT NULL
    )
    RETURNS UUID AS $$
    DECLARE
      v_instance_id UUID;
      v_expires_at TIMESTAMPTZ;
    BEGIN
      -- Check for existing active instance
      SELECT id INTO v_instance_id
      FROM lab_instances
      WHERE user_id = p_user_id
        AND topic_id = p_topic_id
        AND status = 'active';

      IF v_instance_id IS NOT NULL THEN
        RAISE EXCEPTION 'User already has an active lab instance for this topic';
      END IF;

      -- Calculate expiration time
      v_expires_at := NOW() + (p_time_limit_minutes || ' minutes')::INTERVAL;

      -- Create new instance
      INSERT INTO lab_instances (
        user_id,
        topic_id,
        enrollment_id,
        lab_template_id,
        forked_repo_url,
        original_template_url,
        status,
        started_at,
        expires_at,
        github_username,
        last_activity_at
      ) VALUES (
        p_user_id,
        p_topic_id,
        p_enrollment_id,
        p_lab_template_id,
        p_forked_repo_url,
        p_original_template_url,
        'active',
        NOW(),
        v_expires_at,
        p_github_username,
        NOW()
      )
      RETURNING id INTO v_instance_id;

      RETURN v_instance_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ start_lab_instance() created\n');

  // 2. Submit Lab
  console.log('Creating submit_lab()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION submit_lab(
      p_user_id UUID,
      p_topic_id UUID,
      p_enrollment_id UUID,
      p_lab_instance_id UUID,
      p_repository_url TEXT,
      p_commit_sha TEXT DEFAULT NULL,
      p_branch_name TEXT DEFAULT 'main'
    )
    RETURNS UUID AS $$
    DECLARE
      v_submission_id UUID;
      v_attempt_number INTEGER;
    BEGIN
      -- Get next attempt number
      SELECT COALESCE(MAX(attempt_number), 0) + 1
      INTO v_attempt_number
      FROM lab_submissions
      WHERE user_id = p_user_id
        AND topic_id = p_topic_id;

      -- Create submission
      INSERT INTO lab_submissions (
        user_id,
        topic_id,
        enrollment_id,
        lab_instance_id,
        repository_url,
        commit_sha,
        branch_name,
        submitted_at,
        status,
        attempt_number
      ) VALUES (
        p_user_id,
        p_topic_id,
        p_enrollment_id,
        p_lab_instance_id,
        p_repository_url,
        p_commit_sha,
        p_branch_name,
        NOW(),
        'pending',
        v_attempt_number
      )
      RETURNING id INTO v_submission_id;

      RETURN v_submission_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ submit_lab() created\n');

  // 3. Record Auto-Grade Result
  console.log('Creating record_auto_grade()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION record_auto_grade(
      p_submission_id UUID,
      p_auto_grade_result JSONB,
      p_auto_grade_score NUMERIC,
      p_passed BOOLEAN DEFAULT NULL
    )
    RETURNS BOOLEAN AS $$
    DECLARE
      v_passed BOOLEAN;
    BEGIN
      -- Determine pass/fail (70% threshold if not explicitly provided)
      v_passed := COALESCE(p_passed, p_auto_grade_score >= 70);

      UPDATE lab_submissions
      SET
        auto_grade_result = p_auto_grade_result,
        auto_grade_score = p_auto_grade_score,
        auto_graded_at = NOW(),
        status = CASE
          WHEN v_passed THEN 'passed'
          ELSE 'manual_review'
        END,
        final_score = p_auto_grade_score,
        passed = v_passed,
        updated_at = NOW()
      WHERE id = p_submission_id;

      RETURN v_passed;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ record_auto_grade() created\n');

  // 4. Record Manual Grade
  console.log('Creating record_manual_grade()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION record_manual_grade(
      p_submission_id UUID,
      p_grader_id UUID,
      p_manual_score NUMERIC,
      p_rubric_scores JSONB DEFAULT NULL,
      p_feedback TEXT DEFAULT NULL,
      p_passed BOOLEAN DEFAULT NULL
    )
    RETURNS BOOLEAN AS $$
    DECLARE
      v_auto_score NUMERIC;
      v_final_score NUMERIC;
      v_passed BOOLEAN;
    BEGIN
      -- Get existing auto-grade score
      SELECT auto_grade_score INTO v_auto_score
      FROM lab_submissions
      WHERE id = p_submission_id;

      -- Calculate final score (average of auto + manual if both exist)
      IF v_auto_score IS NOT NULL THEN
        v_final_score := (v_auto_score + p_manual_score) / 2;
      ELSE
        v_final_score := p_manual_score;
      END IF;

      -- Determine pass/fail (70% threshold if not explicitly provided)
      v_passed := COALESCE(p_passed, v_final_score >= 70);

      UPDATE lab_submissions
      SET
        manual_grade_score = p_manual_score,
        rubric_scores = p_rubric_scores,
        graded_by = p_grader_id,
        graded_at = NOW(),
        feedback = p_feedback,
        final_score = v_final_score,
        passed = v_passed,
        status = CASE WHEN v_passed THEN 'passed' ELSE 'failed' END,
        updated_at = NOW()
      WHERE id = p_submission_id;

      RETURN v_passed;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ record_manual_grade() created\n');

  // 5. Get Active Lab Instance
  console.log('Creating get_active_lab_instance()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION get_active_lab_instance(
      p_user_id UUID,
      p_topic_id UUID
    )
    RETURNS TABLE (
      instance_id UUID,
      forked_repo_url TEXT,
      started_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      time_remaining_seconds INTEGER,
      status TEXT
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        li.id AS instance_id,
        li.forked_repo_url,
        li.started_at,
        li.expires_at,
        EXTRACT(EPOCH FROM (li.expires_at - NOW()))::INTEGER AS time_remaining_seconds,
        li.status
      FROM lab_instances li
      WHERE li.user_id = p_user_id
        AND li.topic_id = p_topic_id
        AND li.status = 'active'
      ORDER BY li.started_at DESC
      LIMIT 1;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ get_active_lab_instance() created\n');

  // 6. Expire Old Lab Instances
  console.log('Creating expire_old_lab_instances()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION expire_old_lab_instances()
    RETURNS INTEGER AS $$
    DECLARE
      v_expired_count INTEGER;
    BEGIN
      UPDATE lab_instances
      SET
        status = 'expired',
        updated_at = NOW()
      WHERE status = 'active'
        AND expires_at < NOW();

      GET DIAGNOSTICS v_expired_count = ROW_COUNT;

      RETURN v_expired_count;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ expire_old_lab_instances() created\n');

  // 7. Get Lab Submission History
  console.log('Creating get_lab_submission_history()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION get_lab_submission_history(
      p_user_id UUID,
      p_topic_id UUID
    )
    RETURNS TABLE (
      submission_id UUID,
      repository_url TEXT,
      submitted_at TIMESTAMPTZ,
      status TEXT,
      final_score NUMERIC,
      passed BOOLEAN,
      feedback TEXT,
      attempt_number INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        ls.id AS submission_id,
        ls.repository_url,
        ls.submitted_at,
        ls.status,
        ls.final_score,
        ls.passed,
        ls.feedback,
        ls.attempt_number
      FROM lab_submissions ls
      WHERE ls.user_id = p_user_id
        AND ls.topic_id = p_topic_id
      ORDER BY ls.attempt_number DESC;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ get_lab_submission_history() created\n');

  // 8. Update Lab Activity
  console.log('Creating update_lab_activity()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION update_lab_activity(
      p_instance_id UUID,
      p_time_increment_seconds INTEGER DEFAULT 0
    )
    RETURNS BOOLEAN AS $$
    BEGIN
      UPDATE lab_instances
      SET
        last_activity_at = NOW(),
        time_spent_seconds = time_spent_seconds + p_time_increment_seconds,
        updated_at = NOW()
      WHERE id = p_instance_id
        AND status = 'active';

      RETURN FOUND;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ update_lab_activity() created\n');

  console.log('✅ All lab functions created successfully!\n');
}

createFunctions().catch(console.error);
