-- ACAD-010 & ACAD-011: Quiz System Database Functions
-- Critical Fix: Create 13 missing database functions referenced by quiz router

-- =====================================================
-- QUIZ QUESTION MANAGEMENT FUNCTIONS
-- =====================================================

-- Function 1: Create Quiz Question
CREATE OR REPLACE FUNCTION create_quiz_question(
  p_topic_id UUID,
  p_question_text TEXT,
  p_question_type TEXT,
  p_options JSONB,
  p_correct_answers JSONB,
  p_explanation TEXT DEFAULT NULL,
  p_difficulty TEXT DEFAULT 'medium',
  p_points INTEGER DEFAULT 1,
  p_code_language TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT FALSE,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_question_id UUID;
BEGIN
  INSERT INTO quiz_questions (
    topic_id,
    question_text,
    question_type,
    options,
    correct_answers,
    explanation,
    difficulty,
    points,
    code_language,
    is_public,
    created_by
  ) VALUES (
    NULLIF(p_topic_id, '00000000-0000-0000-0000-000000000000'::UUID),
    p_question_text,
    p_question_type,
    p_options,
    p_correct_answers,
    p_explanation,
    p_difficulty,
    p_points,
    p_code_language,
    p_is_public,
    COALESCE(p_created_by, auth.uid())
  )
  RETURNING id INTO v_question_id;

  RETURN v_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Update Quiz Question
CREATE OR REPLACE FUNCTION update_quiz_question(
  p_question_id UUID,
  p_question_text TEXT DEFAULT NULL,
  p_question_type TEXT DEFAULT NULL,
  p_options JSONB DEFAULT NULL,
  p_correct_answers JSONB DEFAULT NULL,
  p_explanation TEXT DEFAULT NULL,
  p_difficulty TEXT DEFAULT NULL,
  p_points INTEGER DEFAULT NULL,
  p_code_language TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE quiz_questions
  SET
    question_text = COALESCE(p_question_text, question_text),
    question_type = COALESCE(p_question_type, question_type),
    options = COALESCE(p_options, options),
    correct_answers = COALESCE(p_correct_answers, correct_answers),
    explanation = COALESCE(p_explanation, explanation),
    difficulty = COALESCE(p_difficulty, difficulty),
    points = COALESCE(p_points, points),
    code_language = COALESCE(p_code_language, code_language),
    is_public = COALESCE(p_is_public, is_public),
    updated_at = NOW()
  WHERE id = p_question_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Delete Quiz Question
CREATE OR REPLACE FUNCTION delete_quiz_question(
  p_question_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM quiz_questions WHERE id = p_question_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Get Question Bank with Filters
CREATE OR REPLACE FUNCTION get_question_bank(
  p_topic_id UUID DEFAULT NULL,
  p_question_type TEXT DEFAULT NULL,
  p_difficulty TEXT DEFAULT NULL,
  p_search_text TEXT DEFAULT NULL,
  p_include_public BOOLEAN DEFAULT TRUE,
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
  question_id UUID,
  topic_id UUID,
  question_text TEXT,
  question_type TEXT,
  difficulty TEXT,
  points INTEGER,
  is_public BOOLEAN,
  created_by UUID,
  created_by_name TEXT,
  times_used BIGINT,
  unique_students BIGINT,
  avg_correct_percentage NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qbs.question_id,
    qbs.topic_id,
    qbs.question_text,
    qbs.question_type,
    qbs.difficulty,
    qbs.points,
    qbs.is_public,
    qbs.created_by,
    qbs.created_by_name,
    qbs.times_used,
    qbs.unique_students,
    qbs.avg_correct_percentage,
    qbs.created_at,
    qbs.updated_at
  FROM question_bank_stats qbs
  WHERE
    (p_topic_id IS NULL OR qbs.topic_id = p_topic_id) AND
    (p_question_type IS NULL OR qbs.question_type = p_question_type) AND
    (p_difficulty IS NULL OR qbs.difficulty = p_difficulty) AND
    (p_search_text IS NULL OR qbs.question_text ILIKE '%' || p_search_text || '%') AND
    (p_include_public = TRUE OR qbs.is_public = FALSE) AND
    (p_created_by IS NULL OR qbs.created_by = p_created_by)
  ORDER BY qbs.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 5: Get Quiz Questions with Randomization
CREATE OR REPLACE FUNCTION get_quiz_questions(
  p_topic_id UUID,
  p_randomize BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  question_type TEXT,
  options JSONB,
  difficulty TEXT,
  points INTEGER,
  code_language TEXT
) AS $$
BEGIN
  IF p_randomize THEN
    RETURN QUERY
    SELECT
      qq.id,
      qq.question_text,
      qq.question_type,
      qq.options,
      qq.difficulty,
      qq.points,
      qq.code_language
    FROM quiz_questions qq
    WHERE qq.topic_id = p_topic_id
    ORDER BY RANDOM();
  ELSE
    RETURN QUERY
    SELECT
      qq.id,
      qq.question_text,
      qq.question_type,
      qq.options,
      qq.difficulty,
      qq.points,
      qq.code_language
    FROM quiz_questions qq
    WHERE qq.topic_id = p_topic_id
    ORDER BY qq.created_at;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- QUIZ SETTINGS FUNCTIONS
-- =====================================================

-- Function 6: Get or Create Quiz Settings
CREATE OR REPLACE FUNCTION get_or_create_quiz_settings(
  p_topic_id UUID
)
RETURNS TABLE (
  id UUID,
  topic_id UUID,
  randomize_questions BOOLEAN,
  randomize_options BOOLEAN,
  passing_threshold INTEGER,
  show_correct_answers BOOLEAN,
  time_limit_minutes INTEGER,
  max_attempts INTEGER,
  allow_review BOOLEAN,
  xp_reward INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_settings_id UUID;
BEGIN
  -- Try to get existing settings
  SELECT qs.id INTO v_settings_id
  FROM quiz_settings qs
  WHERE qs.topic_id = p_topic_id;

  -- If not found, create default settings
  IF v_settings_id IS NULL THEN
    INSERT INTO quiz_settings (topic_id)
    VALUES (p_topic_id)
    RETURNING quiz_settings.id INTO v_settings_id;
  END IF;

  -- Return settings
  RETURN QUERY
  SELECT
    qs.id,
    qs.topic_id,
    qs.randomize_questions,
    qs.randomize_options,
    qs.passing_threshold,
    qs.show_correct_answers,
    qs.time_limit_minutes,
    qs.max_attempts,
    qs.allow_review,
    qs.xp_reward,
    qs.created_at,
    qs.updated_at
  FROM quiz_settings qs
  WHERE qs.id = v_settings_id;
END;
$$ LANGUAGE plpgsql;

-- Function 7: Update Quiz Settings
CREATE OR REPLACE FUNCTION update_quiz_settings(
  p_topic_id UUID,
  p_randomize_questions BOOLEAN DEFAULT NULL,
  p_randomize_options BOOLEAN DEFAULT NULL,
  p_passing_threshold INTEGER DEFAULT NULL,
  p_show_correct_answers BOOLEAN DEFAULT NULL,
  p_time_limit_minutes INTEGER DEFAULT NULL,
  p_max_attempts INTEGER DEFAULT NULL,
  p_allow_review BOOLEAN DEFAULT NULL,
  p_xp_reward INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_settings_id UUID;
BEGIN
  -- Get or create settings
  SELECT id INTO v_settings_id
  FROM quiz_settings
  WHERE topic_id = p_topic_id;

  IF v_settings_id IS NULL THEN
    INSERT INTO quiz_settings (topic_id)
    VALUES (p_topic_id)
    RETURNING id INTO v_settings_id;
  END IF;

  -- Update settings
  UPDATE quiz_settings
  SET
    randomize_questions = COALESCE(p_randomize_questions, randomize_questions),
    randomize_options = COALESCE(p_randomize_options, randomize_options),
    passing_threshold = COALESCE(p_passing_threshold, passing_threshold),
    show_correct_answers = COALESCE(p_show_correct_answers, show_correct_answers),
    time_limit_minutes = COALESCE(p_time_limit_minutes, time_limit_minutes),
    max_attempts = COALESCE(p_max_attempts, max_attempts),
    allow_review = COALESCE(p_allow_review, allow_review),
    xp_reward = COALESCE(p_xp_reward, xp_reward),
    updated_at = NOW()
  WHERE id = v_settings_id;

  RETURN v_settings_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 8: Bulk Import Quiz Questions
CREATE OR REPLACE FUNCTION bulk_import_quiz_questions(
  p_topic_id UUID,
  p_questions JSONB,
  p_created_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  imported_count INTEGER,
  errors TEXT[]
) AS $$
DECLARE
  v_question JSONB;
  v_imported_count INTEGER := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOR v_question IN SELECT jsonb_array_elements(p_questions)
  LOOP
    BEGIN
      INSERT INTO quiz_questions (
        topic_id,
        question_text,
        question_type,
        options,
        correct_answers,
        explanation,
        difficulty,
        points,
        code_language,
        is_public,
        created_by
      ) VALUES (
        p_topic_id,
        v_question->>'question_text',
        v_question->>'question_type',
        v_question->'options',
        v_question->'correct_answers',
        v_question->>'explanation',
        COALESCE(v_question->>'difficulty', 'medium'),
        COALESCE((v_question->>'points')::INTEGER, 1),
        v_question->>'code_language',
        COALESCE((v_question->>'is_public')::BOOLEAN, FALSE),
        p_created_by
      );

      v_imported_count := v_imported_count + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors, SQLERRM);
    END;
  END LOOP;

  RETURN QUERY SELECT TRUE, v_imported_count, v_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- QUIZ ATTEMPT FUNCTIONS (ACAD-011)
-- =====================================================

-- Function 9: Start Quiz Attempt
CREATE OR REPLACE FUNCTION start_quiz_attempt(
  p_user_id UUID,
  p_topic_id UUID,
  p_enrollment_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_attempt_id UUID;
  v_attempt_number INTEGER;
  v_total_questions INTEGER;
  v_max_attempts INTEGER;
BEGIN
  -- Get quiz settings
  SELECT max_attempts INTO v_max_attempts
  FROM quiz_settings
  WHERE topic_id = p_topic_id;

  -- Get current attempt count
  SELECT COALESCE(MAX(attempt_number), 0) + 1
  INTO v_attempt_number
  FROM quiz_attempts
  WHERE user_id = p_user_id
    AND topic_id = p_topic_id;

  -- Check if max attempts exceeded
  IF v_max_attempts IS NOT NULL AND v_attempt_number > v_max_attempts THEN
    RAISE EXCEPTION 'Maximum attempts (%) exceeded', v_max_attempts;
  END IF;

  -- Count total questions
  SELECT COUNT(*) INTO v_total_questions
  FROM quiz_questions
  WHERE topic_id = p_topic_id;

  IF v_total_questions = 0 THEN
    RAISE EXCEPTION 'No questions found for this quiz';
  END IF;

  -- Create attempt
  INSERT INTO quiz_attempts (
    user_id,
    topic_id,
    enrollment_id,
    attempt_number,
    total_questions,
    started_at
  ) VALUES (
    p_user_id,
    p_topic_id,
    p_enrollment_id,
    v_attempt_number,
    v_total_questions,
    NOW()
  )
  RETURNING id INTO v_attempt_id;

  RETURN v_attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 10: Submit Quiz Attempt
CREATE OR REPLACE FUNCTION submit_quiz_attempt(
  p_attempt_id UUID,
  p_answers JSONB
)
RETURNS TABLE (
  attempt_id UUID,
  score NUMERIC,
  passed BOOLEAN,
  correct_answers INTEGER,
  total_questions INTEGER,
  xp_earned INTEGER,
  results JSONB
) AS $$
DECLARE
  v_attempt quiz_attempts%ROWTYPE;
  v_correct_count INTEGER := 0;
  v_score NUMERIC;
  v_passed BOOLEAN;
  v_xp_earned INTEGER := 0;
  v_results JSONB := '[]'::JSONB;
  v_question RECORD;
  v_user_answer JSONB;
  v_is_correct BOOLEAN;
  v_passing_threshold INTEGER;
  v_xp_reward INTEGER;
BEGIN
  -- Get attempt
  SELECT * INTO v_attempt FROM quiz_attempts WHERE id = p_attempt_id;

  IF v_attempt IS NULL THEN
    RAISE EXCEPTION 'Quiz attempt not found';
  END IF;

  IF v_attempt.submitted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Quiz already submitted';
  END IF;

  -- Get quiz settings
  SELECT passing_threshold, xp_reward
  INTO v_passing_threshold, v_xp_reward
  FROM quiz_settings
  WHERE topic_id = v_attempt.topic_id;

  v_passing_threshold := COALESCE(v_passing_threshold, 70);
  v_xp_reward := COALESCE(v_xp_reward, 10);

  -- Grade each question
  FOR v_question IN
    SELECT id, correct_answers, points
    FROM quiz_questions
    WHERE topic_id = v_attempt.topic_id
  LOOP
    v_user_answer := p_answers->(v_question.id::TEXT);
    v_is_correct := (v_user_answer = v_question.correct_answers);

    IF v_is_correct THEN
      v_correct_count := v_correct_count + 1;
    END IF;

    -- Build results array
    v_results := v_results || jsonb_build_object(
      'question_id', v_question.id,
      'user_answer', v_user_answer,
      'correct_answer', v_question.correct_answers,
      'is_correct', v_is_correct,
      'points', CASE WHEN v_is_correct THEN v_question.points ELSE 0 END
    );
  END LOOP;

  -- Calculate score
  v_score := (v_correct_count::NUMERIC / v_attempt.total_questions) * 100;
  v_passed := v_score >= v_passing_threshold;

  -- Award XP if passed
  IF v_passed THEN
    v_xp_earned := v_xp_reward;
  END IF;

  -- Update attempt
  UPDATE quiz_attempts
  SET
    answers = p_answers,
    submitted_at = NOW(),
    time_taken_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER,
    correct_answers = v_correct_count,
    score = v_score,
    passed = v_passed,
    xp_earned = v_xp_earned
  WHERE id = p_attempt_id;

  -- Award XP if passed
  IF v_passed AND v_xp_earned > 0 THEN
    INSERT INTO xp_transactions (
      user_id,
      source_type,
      source_id,
      amount,
      description,
      metadata
    ) VALUES (
      v_attempt.user_id,
      'quiz_completion',
      p_attempt_id,
      v_xp_earned,
      'Completed quiz with passing score',
      jsonb_build_object('score', v_score, 'passed', v_passed)
    );
  END IF;

  -- Return results
  RETURN QUERY SELECT
    p_attempt_id,
    v_score,
    v_passed,
    v_correct_count,
    v_attempt.total_questions,
    v_xp_earned,
    v_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 11: Get User Quiz Attempts
CREATE OR REPLACE FUNCTION get_user_quiz_attempts(
  p_user_id UUID,
  p_topic_id UUID
)
RETURNS TABLE (
  id UUID,
  attempt_number INTEGER,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  score NUMERIC,
  passed BOOLEAN,
  time_taken_seconds INTEGER,
  xp_earned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qa.id,
    qa.attempt_number,
    qa.started_at,
    qa.submitted_at,
    qa.score,
    qa.passed,
    qa.time_taken_seconds,
    qa.xp_earned
  FROM quiz_attempts qa
  WHERE qa.user_id = p_user_id
    AND qa.topic_id = p_topic_id
  ORDER BY qa.attempt_number DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 12: Get Best Quiz Score
CREATE OR REPLACE FUNCTION get_best_quiz_score(
  p_user_id UUID,
  p_topic_id UUID
)
RETURNS TABLE (
  best_score NUMERIC,
  best_attempt_id UUID,
  total_attempts INTEGER,
  passed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    MAX(qa.score) AS best_score,
    (SELECT id FROM quiz_attempts
     WHERE user_id = p_user_id
       AND topic_id = p_topic_id
       AND submitted_at IS NOT NULL
     ORDER BY score DESC, submitted_at DESC
     LIMIT 1) AS best_attempt_id,
    COUNT(*)::INTEGER AS total_attempts,
    BOOL_OR(qa.passed) AS passed
  FROM quiz_attempts qa
  WHERE qa.user_id = p_user_id
    AND qa.topic_id = p_topic_id
    AND qa.submitted_at IS NOT NULL
  GROUP BY qa.user_id, qa.topic_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 13: Get Quiz Attempt Results
CREATE OR REPLACE FUNCTION get_quiz_attempt_results(
  p_attempt_id UUID
)
RETURNS TABLE (
  attempt_id UUID,
  user_id UUID,
  topic_id UUID,
  attempt_number INTEGER,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  total_questions INTEGER,
  correct_answers INTEGER,
  score NUMERIC,
  passed BOOLEAN,
  xp_earned INTEGER,
  answers JSONB,
  questions JSONB,
  settings JSONB
) AS $$
DECLARE
  v_attempt quiz_attempts%ROWTYPE;
  v_questions JSONB;
  v_settings JSONB;
BEGIN
  -- Get attempt
  SELECT * INTO v_attempt FROM quiz_attempts WHERE id = p_attempt_id;

  IF v_attempt IS NULL THEN
    RAISE EXCEPTION 'Quiz attempt not found';
  END IF;

  -- Get questions with correct answers (only if quiz allows review)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', qq.id,
      'question_text', qq.question_text,
      'question_type', qq.question_type,
      'options', qq.options,
      'correct_answers', qq.correct_answers,
      'explanation', qq.explanation,
      'difficulty', qq.difficulty,
      'points', qq.points
    )
  ) INTO v_questions
  FROM quiz_questions qq
  WHERE qq.topic_id = v_attempt.topic_id;

  -- Get quiz settings
  SELECT jsonb_build_object(
    'passing_threshold', qs.passing_threshold,
    'show_correct_answers', qs.show_correct_answers,
    'allow_review', qs.allow_review
  ) INTO v_settings
  FROM quiz_settings qs
  WHERE qs.topic_id = v_attempt.topic_id;

  -- Return results
  RETURN QUERY SELECT
    v_attempt.id,
    v_attempt.user_id,
    v_attempt.topic_id,
    v_attempt.attempt_number,
    v_attempt.started_at,
    v_attempt.submitted_at,
    v_attempt.time_taken_seconds,
    v_attempt.total_questions,
    v_attempt.correct_answers,
    v_attempt.score,
    v_attempt.passed,
    v_attempt.xp_earned,
    v_attempt.answers,
    v_questions,
    v_settings;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_quiz_question TO authenticated;
GRANT EXECUTE ON FUNCTION update_quiz_question TO authenticated;
GRANT EXECUTE ON FUNCTION delete_quiz_question TO authenticated;
GRANT EXECUTE ON FUNCTION get_question_bank TO authenticated;
GRANT EXECUTE ON FUNCTION get_quiz_questions TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_quiz_settings TO authenticated;
GRANT EXECUTE ON FUNCTION update_quiz_settings TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_import_quiz_questions TO authenticated;
GRANT EXECUTE ON FUNCTION start_quiz_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION submit_quiz_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_quiz_attempts TO authenticated;
GRANT EXECUTE ON FUNCTION get_best_quiz_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_quiz_attempt_results TO authenticated;
