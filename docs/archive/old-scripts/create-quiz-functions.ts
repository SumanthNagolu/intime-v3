/**
 * Create Quiz System Database Functions
 * ACAD-010
 *
 * Creates database functions for quiz management.
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const functions = [
  {
    name: 'get_question_bank',
    description: 'Get filtered and searchable question bank',
    sql: `
CREATE OR REPLACE FUNCTION get_question_bank(
  p_topic_id UUID DEFAULT NULL,
  p_question_type TEXT DEFAULT NULL,
  p_difficulty TEXT DEFAULT NULL,
  p_search_text TEXT DEFAULT NULL,
  p_include_public BOOLEAN DEFAULT TRUE,
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  topic_id UUID,
  question_text TEXT,
  question_type TEXT,
  options JSONB,
  correct_answers JSONB,
  explanation TEXT,
  difficulty TEXT,
  points INTEGER,
  code_language TEXT,
  is_public BOOLEAN,
  created_by UUID,
  created_by_name TEXT,
  times_used BIGINT,
  avg_correct_percentage NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qbs.question_id,
    qbs.topic_id,
    qbs.question_text,
    qbs.question_type,
    qq.options,
    qq.correct_answers,
    qq.explanation,
    qbs.difficulty,
    qbs.points,
    qq.code_language,
    qbs.is_public,
    qbs.created_by,
    qbs.created_by_name,
    qbs.times_used,
    qbs.avg_correct_percentage,
    qbs.created_at,
    qbs.updated_at
  FROM question_bank_stats qbs
  JOIN quiz_questions qq ON qq.id = qbs.question_id
  WHERE
    (p_topic_id IS NULL OR qbs.topic_id = p_topic_id)
    AND (p_question_type IS NULL OR qbs.question_type = p_question_type)
    AND (p_difficulty IS NULL OR qbs.difficulty = p_difficulty)
    AND (p_created_by IS NULL OR qbs.created_by = p_created_by)
    AND (NOT p_include_public OR qbs.is_public = TRUE OR qbs.topic_id = p_topic_id)
    AND (
      p_search_text IS NULL OR
      qbs.question_text ILIKE '%' || p_search_text || '%'
    )
  ORDER BY qbs.created_at DESC;
END;
$$;
    `,
  },
  {
    name: 'get_quiz_questions',
    description: 'Get quiz questions for a topic with optional randomization',
    sql: `
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
  code_language TEXT,
  randomized_options JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_randomize_options BOOLEAN;
BEGIN
  -- Get quiz settings
  SELECT qs.randomize_options INTO v_randomize_options
  FROM quiz_settings qs
  WHERE qs.topic_id = p_topic_id;

  -- Default to false if no settings
  v_randomize_options := COALESCE(v_randomize_options, FALSE);

  RETURN QUERY
  SELECT
    qq.id,
    qq.question_text,
    qq.question_type,
    qq.options,
    qq.difficulty,
    qq.points,
    qq.code_language,
    CASE
      WHEN v_randomize_options AND p_randomize THEN
        -- Randomize options order
        (SELECT jsonb_agg(elem ORDER BY random())
         FROM jsonb_array_elements(qq.options) elem)
      ELSE
        qq.options
    END AS randomized_options
  FROM quiz_questions qq
  WHERE qq.topic_id = p_topic_id
  ORDER BY
    CASE WHEN p_randomize THEN random() ELSE qq.created_at::text END;
END;
$$;
    `,
  },
  {
    name: 'create_quiz_question',
    description: 'Create a new quiz question with validation',
    sql: `
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
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_question_id UUID;
  v_user_id UUID;
BEGIN
  -- Get user ID
  v_user_id := COALESCE(p_created_by, auth.uid());

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Insert question (validation trigger will run automatically)
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
  )
  VALUES (
    p_topic_id,
    p_question_text,
    p_question_type,
    p_options,
    p_correct_answers,
    p_explanation,
    p_difficulty,
    p_points,
    p_code_language,
    p_is_public,
    v_user_id
  )
  RETURNING id INTO v_question_id;

  RETURN v_question_id;
END;
$$;
    `,
  },
  {
    name: 'update_quiz_question',
    description: 'Update an existing quiz question',
    sql: `
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
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
    `,
  },
  {
    name: 'delete_quiz_question',
    description: 'Delete a quiz question',
    sql: `
CREATE OR REPLACE FUNCTION delete_quiz_question(
  p_question_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM quiz_questions
  WHERE id = p_question_id;

  RETURN FOUND;
END;
$$;
    `,
  },
  {
    name: 'get_or_create_quiz_settings',
    description: 'Get quiz settings for a topic, creating default if not exists',
    sql: `
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
  xp_reward INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings_id UUID;
BEGIN
  -- Try to get existing settings
  SELECT qs.id INTO v_settings_id
  FROM quiz_settings qs
  WHERE qs.topic_id = p_topic_id;

  -- Create default settings if not exists
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
    qs.xp_reward
  FROM quiz_settings qs
  WHERE qs.id = v_settings_id;
END;
$$;
    `,
  },
  {
    name: 'update_quiz_settings',
    description: 'Update quiz settings for a topic',
    sql: `
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
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings_id UUID;
BEGIN
  -- Ensure settings exist
  SELECT id INTO v_settings_id
  FROM get_or_create_quiz_settings(p_topic_id);

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
$$;
    `,
  },
  {
    name: 'bulk_import_quiz_questions',
    description: 'Bulk import quiz questions from JSON array',
    sql: `
CREATE OR REPLACE FUNCTION bulk_import_quiz_questions(
  p_topic_id UUID,
  p_questions JSONB,
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  imported_count INTEGER,
  errors JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_question JSONB;
  v_question_id UUID;
  v_imported_count INTEGER := 0;
  v_errors JSONB := '[]'::jsonb;
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_created_by, auth.uid());

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, '["User must be authenticated"]'::jsonb;
    RETURN;
  END IF;

  -- Iterate through questions
  FOR v_question IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    BEGIN
      -- Insert question
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
      )
      VALUES (
        p_topic_id,
        v_question->>'question_text',
        v_question->>'question_type',
        v_question->'options',
        v_question->'correct_answers',
        v_question->>'explanation',
        COALESCE(v_question->>'difficulty', 'medium'),
        COALESCE((v_question->>'points')::integer, 1),
        v_question->>'code_language',
        COALESCE((v_question->>'is_public')::boolean, FALSE),
        v_user_id
      )
      RETURNING id INTO v_question_id;

      v_imported_count := v_imported_count + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Collect error
      v_errors := v_errors || jsonb_build_object(
        'question', v_question->'question_text',
        'error', SQLERRM
      );
    END;
  END LOOP;

  RETURN QUERY SELECT
    v_imported_count > 0,
    v_imported_count,
    v_errors;
END;
$$;
    `,
  },
];

async function createFunctions() {
  console.log('Creating quiz system database functions...\n');

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

  console.log('\n✅ All quiz system functions created!');
}

createFunctions();
