/**
 * Create Quiz Engine Database Functions
 * ACAD-011
 *
 * Creates database functions for quiz taking, grading, and attempt management.
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const functions = [
  {
    name: 'start_quiz_attempt',
    description: 'Start a new quiz attempt',
    sql: `
CREATE OR REPLACE FUNCTION start_quiz_attempt(
  p_user_id UUID,
  p_topic_id UUID,
  p_enrollment_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_id UUID;
  v_attempt_number INTEGER;
  v_max_attempts INTEGER;
  v_total_questions INTEGER;
BEGIN
  -- Get quiz settings
  SELECT max_attempts INTO v_max_attempts
  FROM quiz_settings
  WHERE topic_id = p_topic_id;

  -- Check if max attempts reached
  IF v_max_attempts IS NOT NULL THEN
    SELECT COUNT(*) INTO v_attempt_number
    FROM quiz_attempts
    WHERE user_id = p_user_id AND topic_id = p_topic_id;

    IF v_attempt_number >= v_max_attempts THEN
      RAISE EXCEPTION 'Maximum attempts (%) reached for this quiz', v_max_attempts;
    END IF;
  END IF;

  -- Get next attempt number
  SELECT COALESCE(MAX(attempt_number), 0) + 1 INTO v_attempt_number
  FROM quiz_attempts
  WHERE user_id = p_user_id AND topic_id = p_topic_id;

  -- Count total questions
  SELECT COUNT(*) INTO v_total_questions
  FROM quiz_questions
  WHERE topic_id = p_topic_id;

  -- Create attempt record
  INSERT INTO quiz_attempts (
    user_id,
    topic_id,
    enrollment_id,
    attempt_number,
    total_questions,
    started_at
  )
  VALUES (
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
$$;
    `,
  },
  {
    name: 'submit_quiz_attempt',
    description: 'Submit and grade quiz attempt',
    sql: `
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt RECORD;
  v_question RECORD;
  v_total_points INTEGER := 0;
  v_earned_points INTEGER := 0;
  v_correct_count INTEGER := 0;
  v_score NUMERIC;
  v_passed BOOLEAN;
  v_passing_threshold INTEGER;
  v_xp_reward INTEGER;
  v_xp_earned INTEGER := 0;
  v_is_first_pass BOOLEAN := FALSE;
  v_results JSONB := '[]'::jsonb;
  v_question_result JSONB;
  v_user_answers JSONB;
  v_is_correct BOOLEAN;
  v_time_taken_seconds INTEGER;
BEGIN
  -- Get attempt details
  SELECT * INTO v_attempt
  FROM quiz_attempts
  WHERE id = p_attempt_id;

  IF v_attempt IS NULL THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;

  IF v_attempt.submitted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Quiz already submitted';
  END IF;

  -- Get quiz settings
  SELECT passing_threshold, xp_reward
  INTO v_passing_threshold, v_xp_reward
  FROM quiz_settings
  WHERE topic_id = v_attempt.topic_id;

  -- Default values if no settings
  v_passing_threshold := COALESCE(v_passing_threshold, 70);
  v_xp_reward := COALESCE(v_xp_reward, 10);

  -- Grade each question
  FOR v_question IN
    SELECT * FROM quiz_questions
    WHERE topic_id = v_attempt.topic_id
    ORDER BY created_at
  LOOP
    v_total_points := v_total_points + v_question.points;
    v_user_answers := p_answers->v_question.id::text;

    -- Check if answer is correct (exact match for JSONB arrays)
    v_is_correct := (v_user_answers = v_question.correct_answers);

    IF v_is_correct THEN
      v_earned_points := v_earned_points + v_question.points;
      v_correct_count := v_correct_count + 1;
    END IF;

    -- Build result for this question
    v_question_result := jsonb_build_object(
      'question_id', v_question.id,
      'is_correct', v_is_correct,
      'user_answers', v_user_answers,
      'correct_answers', v_question.correct_answers,
      'points_earned', CASE WHEN v_is_correct THEN v_question.points ELSE 0 END,
      'points_possible', v_question.points
    );

    v_results := v_results || v_question_result;
  END LOOP;

  -- Calculate score
  IF v_total_points > 0 THEN
    v_score := ROUND((v_earned_points::NUMERIC / v_total_points) * 100, 2);
  ELSE
    v_score := 0;
  END IF;

  -- Determine pass/fail
  v_passed := v_score >= v_passing_threshold;

  -- Calculate time taken
  v_time_taken_seconds := EXTRACT(EPOCH FROM (NOW() - v_attempt.started_at))::INTEGER;

  -- Update attempt record
  UPDATE quiz_attempts
  SET
    submitted_at = NOW(),
    answers = p_answers,
    correct_answers = v_correct_count,
    score = v_score,
    passed = v_passed,
    time_taken_seconds = v_time_taken_seconds
  WHERE id = p_attempt_id;

  -- Award XP and complete topic if passed (only on first pass)
  IF v_passed THEN
    -- Check if this is the first pass
    SELECT NOT EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE user_id = v_attempt.user_id
        AND topic_id = v_attempt.topic_id
        AND passed = TRUE
        AND id != p_attempt_id
    ) INTO v_is_first_pass;

    IF v_is_first_pass THEN
      -- Award XP
      INSERT INTO xp_transactions (
        user_id,
        enrollment_id,
        activity_type,
        activity_id,
        xp_earned,
        description
      )
      VALUES (
        v_attempt.user_id,
        v_attempt.enrollment_id,
        'quiz_passed',
        p_attempt_id,
        v_xp_reward,
        'Passed quiz on first attempt'
      );

      v_xp_earned := v_xp_reward;

      -- Update attempt with XP
      UPDATE quiz_attempts
      SET xp_earned = v_xp_reward
      WHERE id = p_attempt_id;

      -- Complete topic
      PERFORM complete_topic(
        v_attempt.user_id,
        v_attempt.topic_id,
        v_attempt.enrollment_id,
        'quiz',
        p_attempt_id
      );
    END IF;
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
$$;
    `,
  },
  {
    name: 'get_user_quiz_attempts',
    description: 'Get all quiz attempts for a user and topic',
    sql: `
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
  correct_answers INTEGER,
  total_questions INTEGER,
  time_taken_seconds INTEGER,
  xp_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qa.id,
    qa.attempt_number,
    qa.started_at,
    qa.submitted_at,
    qa.score,
    qa.passed,
    qa.correct_answers,
    qa.total_questions,
    qa.time_taken_seconds,
    qa.xp_earned
  FROM quiz_attempts qa
  WHERE qa.user_id = p_user_id
    AND qa.topic_id = p_topic_id
  ORDER BY qa.attempt_number DESC;
END;
$$;
    `,
  },
  {
    name: 'get_best_quiz_score',
    description: 'Get best quiz score for a user and topic',
    sql: `
CREATE OR REPLACE FUNCTION get_best_quiz_score(
  p_user_id UUID,
  p_topic_id UUID
)
RETURNS TABLE (
  best_score NUMERIC,
  best_attempt_id UUID,
  total_attempts INTEGER,
  passed_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    MAX(qa.score) AS best_score,
    (
      SELECT qa2.id
      FROM quiz_attempts qa2
      WHERE qa2.user_id = p_user_id
        AND qa2.topic_id = p_topic_id
        AND qa2.score = MAX(qa.score)
      ORDER BY qa2.submitted_at ASC
      LIMIT 1
    ) AS best_attempt_id,
    COUNT(*)::INTEGER AS total_attempts,
    COUNT(CASE WHEN qa.passed THEN 1 END)::INTEGER AS passed_attempts
  FROM quiz_attempts qa
  WHERE qa.user_id = p_user_id
    AND qa.topic_id = p_topic_id
    AND qa.submitted_at IS NOT NULL
  GROUP BY qa.user_id, qa.topic_id;
END;
$$;
    `,
  },
  {
    name: 'get_quiz_attempt_results',
    description: 'Get detailed results for a specific attempt',
    sql: `
CREATE OR REPLACE FUNCTION get_quiz_attempt_results(
  p_attempt_id UUID
)
RETURNS TABLE (
  attempt_id UUID,
  user_id UUID,
  topic_id UUID,
  attempt_number INTEGER,
  score NUMERIC,
  passed BOOLEAN,
  correct_answers INTEGER,
  total_questions INTEGER,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  xp_earned INTEGER,
  answers JSONB,
  questions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt RECORD;
  v_questions JSONB;
BEGIN
  -- Get attempt
  SELECT * INTO v_attempt
  FROM quiz_attempts
  WHERE id = p_attempt_id;

  IF v_attempt IS NULL THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;

  -- Get questions with correct answers
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', qq.id,
      'question_text', qq.question_text,
      'question_type', qq.question_type,
      'options', qq.options,
      'correct_answers', qq.correct_answers,
      'explanation', qq.explanation,
      'points', qq.points,
      'difficulty', qq.difficulty,
      'code_language', qq.code_language
    ) ORDER BY qq.created_at
  ) INTO v_questions
  FROM quiz_questions qq
  WHERE qq.topic_id = v_attempt.topic_id;

  RETURN QUERY SELECT
    v_attempt.id,
    v_attempt.user_id,
    v_attempt.topic_id,
    v_attempt.attempt_number,
    v_attempt.score,
    v_attempt.passed,
    v_attempt.correct_answers,
    v_attempt.total_questions,
    v_attempt.started_at,
    v_attempt.submitted_at,
    v_attempt.time_taken_seconds,
    v_attempt.xp_earned,
    v_attempt.answers,
    v_questions;
END;
$$;
    `,
  },
];

async function createFunctions() {
  console.log('Creating quiz engine database functions...\n');

  for (const func of functions) {
    try {
      console.log(`Creating function: ${func.name}...`);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql: func.sql }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${func.name} created successfully`);
      } else {
        console.error(`❌ Failed to create ${func.name}:`, data.error);
      }
    } catch (error) {
      console.error(`❌ Error creating ${func.name}:`, error);
    }
  }

  console.log('\n✅ All quiz engine functions created!');
}

createFunctions();
