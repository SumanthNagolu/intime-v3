/**
 * Create AI Analytics Database Functions
 * ACAD-015
 */

import { validateSql } from './validate-sql';

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const functions = [
  {
    name: 'record_question_pattern',
    sql: `
CREATE OR REPLACE FUNCTION record_question_pattern(
  p_question TEXT,
  p_topic_id UUID,
  p_user_id UUID,
  p_rating INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_pattern_hash TEXT;
  v_pattern_id UUID;
  v_canonical_question TEXT;
BEGIN
  -- Simple hash based on normalized question (lowercase, trimmed)
  v_pattern_hash := MD5(LOWER(TRIM(p_question)));

  -- Try to find existing pattern
  SELECT id, canonical_question INTO v_pattern_id, v_canonical_question
  FROM ai_question_patterns
  WHERE pattern_hash = v_pattern_hash;

  IF FOUND THEN
    -- Update existing pattern
    UPDATE ai_question_patterns
    SET
      occurrence_count = occurrence_count + 1,
      unique_students = (
        SELECT COUNT(DISTINCT user_id)
        FROM ai_mentor_chats
        WHERE MD5(LOWER(TRIM(question))) = v_pattern_hash
      ),
      avg_response_quality = (
        SELECT AVG(student_rating)
        FROM ai_mentor_chats
        WHERE MD5(LOWER(TRIM(question))) = v_pattern_hash
        AND student_rating IS NOT NULL
      ),
      last_seen = NOW()
    WHERE pattern_hash = v_pattern_hash;
  ELSE
    -- Create new pattern
    INSERT INTO ai_question_patterns (
      pattern_hash,
      canonical_question,
      topic_id,
      occurrence_count,
      unique_students,
      avg_response_quality
    ) VALUES (
      v_pattern_hash,
      p_question,
      p_topic_id,
      1,
      1,
      p_rating
    )
    RETURNING id INTO v_pattern_id;
  END IF;

  RETURN v_pattern_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'create_prompt_variant',
    sql: `
CREATE OR REPLACE FUNCTION create_prompt_variant(
  p_variant_name TEXT,
  p_system_prompt TEXT,
  p_traffic_percentage INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_variant_id UUID;
BEGIN
  INSERT INTO ai_prompt_variants (
    variant_name,
    system_prompt,
    is_active,
    traffic_percentage
  ) VALUES (
    p_variant_name,
    p_system_prompt,
    false,
    p_traffic_percentage
  )
  RETURNING id INTO v_variant_id;

  RETURN v_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'activate_prompt_variant',
    sql: `
CREATE OR REPLACE FUNCTION activate_prompt_variant(
  p_variant_id UUID,
  p_traffic_percentage INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Ensure traffic percentages don't exceed 100%
  IF (SELECT SUM(traffic_percentage) FROM ai_prompt_variants WHERE is_active = true AND id != p_variant_id) + p_traffic_percentage > 100 THEN
    RAISE EXCEPTION 'Total traffic percentage would exceed 100%%';
  END IF;

  UPDATE ai_prompt_variants
  SET
    is_active = true,
    traffic_percentage = p_traffic_percentage
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'deactivate_prompt_variant',
    sql: `
CREATE OR REPLACE FUNCTION deactivate_prompt_variant(
  p_variant_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_prompt_variants
  SET
    is_active = false,
    traffic_percentage = 0,
    deactivated_at = NOW()
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'select_prompt_variant',
    sql: `
CREATE OR REPLACE FUNCTION select_prompt_variant()
RETURNS TABLE (
  variant_id UUID,
  system_prompt TEXT
) AS $$
DECLARE
  v_random INTEGER;
  v_cumulative INTEGER := 0;
  v_variant RECORD;
BEGIN
  -- Get random number 1-100
  v_random := FLOOR(RANDOM() * 100) + 1;

  -- Select variant based on traffic percentage
  FOR v_variant IN
    SELECT id, system_prompt, traffic_percentage
    FROM ai_prompt_variants
    WHERE is_active = true
    ORDER BY traffic_percentage DESC
  LOOP
    v_cumulative := v_cumulative + v_variant.traffic_percentage;

    IF v_random <= v_cumulative THEN
      variant_id := v_variant.id;
      system_prompt := v_variant.system_prompt;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;

  -- Default: return NULL (use default prompt)
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'update_prompt_variant_metrics',
    sql: `
CREATE OR REPLACE FUNCTION update_prompt_variant_metrics()
RETURNS VOID AS $$
BEGIN
  UPDATE ai_prompt_variants pv
  SET
    total_uses = (
      SELECT COUNT(*)
      FROM ai_mentor_chats
      WHERE prompt_variant_id = pv.id
    ),
    avg_rating = (
      SELECT AVG(student_rating)
      FROM ai_mentor_chats
      WHERE prompt_variant_id = pv.id
      AND student_rating IS NOT NULL
    ),
    avg_response_time_ms = (
      SELECT AVG(response_time_ms)
      FROM ai_mentor_chats
      WHERE prompt_variant_id = pv.id
    ),
    avg_tokens_used = (
      SELECT AVG(tokens_used)
      FROM ai_mentor_chats
      WHERE prompt_variant_id = pv.id
    ),
    escalation_count = (
      SELECT COUNT(*)
      FROM ai_mentor_chats
      WHERE prompt_variant_id = pv.id
      AND escalated_to_trainer = true
    )
  WHERE pv.id IN (
    SELECT DISTINCT prompt_variant_id
    FROM ai_mentor_chats
    WHERE prompt_variant_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_quality_dashboard_metrics',
    sql: `
CREATE OR REPLACE FUNCTION get_quality_dashboard_metrics(
  p_days INTEGER DEFAULT 7
) RETURNS TABLE (
  period TEXT,
  total_chats INTEGER,
  helpful_count INTEGER,
  unhelpful_count INTEGER,
  helpful_percentage NUMERIC,
  avg_rating NUMERIC,
  avg_response_time_ms INTEGER,
  total_cost NUMERIC,
  escalation_count INTEGER,
  escalation_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN p_days = 1 THEN TO_CHAR(created_at, 'HH24:00')
      ELSE TO_CHAR(created_at, 'YYYY-MM-DD')
    END as period,
    COUNT(*)::INTEGER as total_chats,
    COUNT(*) FILTER (WHERE student_rating >= 4)::INTEGER as helpful_count,
    COUNT(*) FILTER (WHERE student_rating <= 2)::INTEGER as unhelpful_count,
    (COUNT(*) FILTER (WHERE student_rating >= 4)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE student_rating IS NOT NULL), 0) * 100) as helpful_percentage,
    AVG(student_rating) as avg_rating,
    AVG(response_time_ms)::INTEGER as avg_response_time_ms,
    SUM(cost_usd) as total_cost,
    COUNT(*) FILTER (WHERE escalated_to_trainer = true)::INTEGER as escalation_count,
    (COUNT(*) FILTER (WHERE escalated_to_trainer = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100) as escalation_rate
  FROM ai_mentor_chats
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY period
  ORDER BY period DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
];

async function deployFunction(name: string, sql: string): Promise<boolean> {
  // SECURITY: Validate SQL before deployment
  const validation = validateSql(sql);
  if (!validation.isValid) {
    console.error(`  ❌ ${name}: SQL validation failed`);
    validation.errors.forEach(err => console.error(`     - ${err}`));
    return false;
  }

  if (validation.warnings.length > 0) {
    console.warn(`  ⚠️  ${name}: Warnings:`);
    validation.warnings.forEach(warn => console.warn(`     - ${warn}`));
  }

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
  console.log('📦 Deploying AI Analytics database functions...\n');

  let successCount = 0;

  for (const func of functions) {
    const success = await deployFunction(func.name, func.sql);
    if (success) successCount++;
  }

  console.log(`\n✅ Deployed ${successCount}/${functions.length} functions successfully\n`);

  if (successCount < functions.length) {
    process.exit(1);
  }
}

deployAllFunctions();
