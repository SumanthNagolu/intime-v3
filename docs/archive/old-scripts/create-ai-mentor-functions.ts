/**
 * Create AI Mentor Database Functions
 * ACAD-013
 *
 * Database functions for AI mentor operations:
 * - store_ai_chat
 * - update_ai_session
 * - check_rate_limits
 * - increment_rate_limits
 * - get_chat_history
 */

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const functions = [
  {
    name: 'store_ai_chat',
    sql: `
CREATE OR REPLACE FUNCTION store_ai_chat(
  p_user_id UUID,
  p_topic_id UUID,
  p_course_id UUID,
  p_session_id UUID,
  p_question TEXT,
  p_response TEXT,
  p_conversation_context JSONB,
  p_tokens_used INTEGER,
  p_response_time_ms INTEGER,
  p_cost_usd NUMERIC
) RETURNS UUID AS $$
DECLARE
  v_chat_id UUID;
BEGIN
  INSERT INTO ai_mentor_chats (
    user_id,
    topic_id,
    course_id,
    question,
    response,
    conversation_context,
    tokens_used,
    response_time_ms,
    cost_usd
  ) VALUES (
    p_user_id,
    p_topic_id,
    p_course_id,
    p_question,
    p_response,
    p_conversation_context,
    p_tokens_used,
    p_response_time_ms,
    p_cost_usd
  )
  RETURNING id INTO v_chat_id;

  RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'update_ai_session',
    sql: `
CREATE OR REPLACE FUNCTION update_ai_session(
  p_session_id UUID,
  p_user_id UUID,
  p_topic_id UUID,
  p_course_id UUID,
  p_question TEXT,
  p_tokens_used INTEGER,
  p_cost_usd NUMERIC
) RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_title TEXT;
BEGIN
  -- If session_id is provided, update existing session
  IF p_session_id IS NOT NULL THEN
    UPDATE ai_mentor_sessions
    SET
      message_count = message_count + 1,
      total_tokens = total_tokens + p_tokens_used,
      total_cost_usd = total_cost_usd + p_cost_usd,
      last_message_at = NOW()
    WHERE id = p_session_id
    RETURNING id INTO v_session_id;

    RETURN v_session_id;
  END IF;

  -- Otherwise, create new session
  -- Generate title from question (first 60 chars)
  v_title := CASE
    WHEN LENGTH(p_question) <= 60 THEN p_question
    ELSE SUBSTRING(p_question FROM 1 FOR 57) || '...'
  END;

  INSERT INTO ai_mentor_sessions (
    user_id,
    topic_id,
    course_id,
    title,
    message_count,
    total_tokens,
    total_cost_usd,
    started_at,
    last_message_at
  ) VALUES (
    p_user_id,
    p_topic_id,
    p_course_id,
    v_title,
    1,
    p_tokens_used,
    p_cost_usd,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'check_rate_limits',
    sql: `
CREATE OR REPLACE FUNCTION check_rate_limits(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_limits ai_mentor_rate_limits;
  v_now TIMESTAMPTZ := NOW();
  v_hourly_remaining INTEGER;
  v_daily_remaining INTEGER;
  v_monthly_remaining INTEGER;
  v_is_limited BOOLEAN;
  v_reset_at TIMESTAMPTZ;
BEGIN
  -- Get or create rate limit record
  SELECT * INTO v_limits
  FROM ai_mentor_rate_limits
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Create new rate limit record
    INSERT INTO ai_mentor_rate_limits (
      user_id,
      hourly_count,
      daily_count,
      monthly_count,
      hourly_reset_at,
      daily_reset_at,
      monthly_reset_at,
      monthly_cost_usd
    ) VALUES (
      p_user_id,
      0,
      0,
      0,
      v_now + INTERVAL '1 hour',
      v_now + INTERVAL '1 day',
      v_now + INTERVAL '1 month',
      0
    )
    RETURNING * INTO v_limits;
  END IF;

  -- Reset counters if needed
  IF v_now >= v_limits.hourly_reset_at THEN
    UPDATE ai_mentor_rate_limits
    SET hourly_count = 0,
        hourly_reset_at = v_now + INTERVAL '1 hour'
    WHERE user_id = p_user_id
    RETURNING * INTO v_limits;
  END IF;

  IF v_now >= v_limits.daily_reset_at THEN
    UPDATE ai_mentor_rate_limits
    SET daily_count = 0,
        daily_reset_at = v_now + INTERVAL '1 day'
    WHERE user_id = p_user_id
    RETURNING * INTO v_limits;
  END IF;

  IF v_now >= v_limits.monthly_reset_at THEN
    UPDATE ai_mentor_rate_limits
    SET monthly_count = 0,
        monthly_cost_usd = 0,
        monthly_reset_at = v_now + INTERVAL '1 month'
    WHERE user_id = p_user_id
    RETURNING * INTO v_limits;
  END IF;

  -- Calculate remaining
  v_hourly_remaining := GREATEST(0, 10 - v_limits.hourly_count);
  v_daily_remaining := GREATEST(0, 50 - v_limits.daily_count);
  v_monthly_remaining := GREATEST(0, 500 - v_limits.monthly_count);

  -- Check if limited
  v_is_limited := (
    v_limits.hourly_count >= 10 OR
    v_limits.daily_count >= 50 OR
    v_limits.monthly_count >= 500 OR
    v_limits.monthly_cost_usd >= 5.0
  );

  -- Get earliest reset time
  v_reset_at := LEAST(
    v_limits.hourly_reset_at,
    v_limits.daily_reset_at,
    v_limits.monthly_reset_at
  );

  RETURN jsonb_build_object(
    'hourlyRemaining', v_hourly_remaining,
    'dailyRemaining', v_daily_remaining,
    'monthlyRemaining', v_monthly_remaining,
    'monthlyCostUsd', v_limits.monthly_cost_usd,
    'isLimited', v_is_limited,
    'resetAt', v_reset_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'increment_rate_limits',
    sql: `
CREATE OR REPLACE FUNCTION increment_rate_limits(
  p_user_id UUID,
  p_tokens_used INTEGER,
  p_cost_usd NUMERIC
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_mentor_rate_limits
  SET
    hourly_count = hourly_count + 1,
    daily_count = daily_count + 1,
    monthly_count = monthly_count + 1,
    monthly_cost_usd = monthly_cost_usd + p_cost_usd,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- If record doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO ai_mentor_rate_limits (
      user_id,
      hourly_count,
      daily_count,
      monthly_count,
      monthly_cost_usd,
      hourly_reset_at,
      daily_reset_at,
      monthly_reset_at
    ) VALUES (
      p_user_id,
      1,
      1,
      1,
      p_cost_usd,
      NOW() + INTERVAL '1 hour',
      NOW() + INTERVAL '1 day',
      NOW() + INTERVAL '1 month'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_ai_chat_history',
    sql: `
CREATE OR REPLACE FUNCTION get_ai_chat_history(
  p_user_id UUID,
  p_session_id UUID,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  id UUID,
  question TEXT,
  response TEXT,
  conversation_context JSONB,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  cost_usd NUMERIC,
  student_rating INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.question,
    c.response,
    c.conversation_context,
    c.tokens_used,
    c.response_time_ms,
    c.cost_usd,
    c.student_rating,
    c.created_at
  FROM ai_mentor_chats c
  JOIN ai_mentor_sessions s ON s.id = p_session_id
  WHERE c.user_id = p_user_id
  AND s.user_id = p_user_id
  ORDER BY c.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_user_ai_sessions',
    sql: `
CREATE OR REPLACE FUNCTION get_user_ai_sessions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  id UUID,
  topic_id UUID,
  course_id UUID,
  title TEXT,
  message_count INTEGER,
  total_tokens INTEGER,
  total_cost_usd NUMERIC,
  started_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.topic_id,
    s.course_id,
    s.title,
    s.message_count,
    s.total_tokens,
    s.total_cost_usd,
    s.started_at,
    s.last_message_at
  FROM ai_mentor_sessions s
  WHERE s.user_id = p_user_id
  AND s.ended_at IS NULL
  ORDER BY s.last_message_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'rate_ai_chat',
    sql: `
CREATE OR REPLACE FUNCTION rate_ai_chat(
  p_chat_id UUID,
  p_user_id UUID,
  p_rating INTEGER,
  p_feedback TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Validate rating
  IF p_rating NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  -- Update chat with rating
  UPDATE ai_mentor_chats
  SET
    student_rating = p_rating,
    student_feedback = p_feedback,
    rated_at = NOW(),
    -- Auto-flag low ratings
    flagged_for_review = CASE WHEN p_rating <= 2 THEN true ELSE flagged_for_review END
  WHERE id = p_chat_id
  AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat not found or unauthorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'escalate_ai_chat',
    sql: `
CREATE OR REPLACE FUNCTION escalate_ai_chat(
  p_chat_id UUID,
  p_user_id UUID,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_mentor_chats
  SET
    escalated_to_trainer = true,
    escalation_reason = p_reason,
    escalated_at = NOW(),
    flagged_for_review = true
  WHERE id = p_chat_id
  AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat not found or unauthorized';
  END IF;

  -- TODO: Send notification to trainers
  -- This could publish an event or insert into notifications table
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
];

async function deployFunction(name: string, sql: string): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(`  ✅ ${name}`);
      return true;
    } else {
      console.error(`  ❌ ${name}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ ${name}:`, error);
    return false;
  }
}

async function deployAllFunctions() {
  console.log('📦 Deploying AI Mentor database functions...\n');

  let successCount = 0;

  for (const func of functions) {
    const success = await deployFunction(func.name, func.sql);
    if (success) successCount++;
  }

  console.log(`\\n✅ Deployed ${successCount}/${functions.length} functions successfully\\n`);

  if (successCount < functions.length) {
    process.exit(1);
  }
}

deployAllFunctions();
