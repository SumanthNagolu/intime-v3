/**
 * Create Escalation Database Functions
 * ACAD-014
 */

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const functions = [
  {
    name: 'create_escalation',
    sql: `
CREATE OR REPLACE FUNCTION create_escalation(
  p_chat_id UUID,
  p_user_id UUID,
  p_topic_id UUID,
  p_reason TEXT,
  p_confidence NUMERIC DEFAULT 0.5,
  p_auto_detected BOOLEAN DEFAULT true,
  p_triggers JSONB DEFAULT '{}'::jsonb,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_escalation_id UUID;
BEGIN
  -- Create escalation record
  INSERT INTO ai_mentor_escalations (
    chat_id,
    user_id,
    topic_id,
    reason,
    confidence,
    auto_detected,
    triggers,
    metadata,
    status
  ) VALUES (
    p_chat_id,
    p_user_id,
    p_topic_id,
    p_reason,
    p_confidence,
    p_auto_detected,
    p_triggers,
    p_metadata,
    'pending'
  )
  RETURNING id INTO v_escalation_id;

  -- Update the original chat
  UPDATE ai_mentor_chats
  SET
    escalated_to_trainer = true,
    escalation_reason = p_reason,
    escalated_at = NOW()
  WHERE id = p_chat_id;

  RETURN v_escalation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'assign_escalation',
    sql: `
CREATE OR REPLACE FUNCTION assign_escalation(
  p_escalation_id UUID,
  p_trainer_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_mentor_escalations
  SET
    assigned_to = p_trainer_id,
    assigned_at = NOW(),
    status = CASE WHEN status = 'pending' THEN 'in_progress' ELSE status END
  WHERE id = p_escalation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escalation not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'add_trainer_response',
    sql: `
CREATE OR REPLACE FUNCTION add_trainer_response(
  p_escalation_id UUID,
  p_trainer_id UUID,
  p_message TEXT,
  p_is_internal_note BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
  v_response_id UUID;
BEGIN
  -- Insert trainer response
  INSERT INTO trainer_responses (
    escalation_id,
    trainer_id,
    message,
    is_internal_note
  ) VALUES (
    p_escalation_id,
    p_trainer_id,
    p_message,
    p_is_internal_note
  )
  RETURNING id INTO v_response_id;

  -- Update escalation status if not already in progress
  UPDATE ai_mentor_escalations
  SET status = CASE WHEN status = 'pending' THEN 'in_progress' ELSE status END
  WHERE id = p_escalation_id;

  RETURN v_response_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'resolve_escalation',
    sql: `
CREATE OR REPLACE FUNCTION resolve_escalation(
  p_escalation_id UUID,
  p_trainer_id UUID,
  p_resolution_notes TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_mentor_escalations
  SET
    status = 'resolved',
    resolved_by = p_trainer_id,
    resolved_at = NOW(),
    resolution_notes = p_resolution_notes,
    resolution_time_minutes = EXTRACT(EPOCH FROM (NOW() - created_at)) / 60
  WHERE id = p_escalation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escalation not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'dismiss_escalation',
    sql: `
CREATE OR REPLACE FUNCTION dismiss_escalation(
  p_escalation_id UUID,
  p_trainer_id UUID,
  p_dismissal_reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE ai_mentor_escalations
  SET
    status = 'dismissed',
    resolved_by = p_trainer_id,
    resolved_at = NOW(),
    resolution_notes = p_dismissal_reason,
    resolution_time_minutes = EXTRACT(EPOCH FROM (NOW() - created_at)) / 60
  WHERE id = p_escalation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escalation not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_escalation_details',
    sql: `
CREATE OR REPLACE FUNCTION get_escalation_details(
  p_escalation_id UUID
) RETURNS TABLE (
  escalation_id UUID,
  chat_id UUID,
  user_id UUID,
  student_name TEXT,
  student_email TEXT,
  topic_id UUID,
  topic_title TEXT,
  reason TEXT,
  confidence NUMERIC,
  auto_detected BOOLEAN,
  triggers JSONB,
  metadata JSONB,
  status TEXT,
  assigned_to UUID,
  assigned_trainer_name TEXT,
  created_at TIMESTAMPTZ,
  wait_time_minutes NUMERIC,
  original_question TEXT,
  original_response TEXT,
  response_count INTEGER,
  resolution_notes TEXT,
  resolution_time_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.chat_id,
    e.user_id,
    u.full_name,
    u.email,
    e.topic_id,
    mt.title,
    e.reason,
    e.confidence,
    e.auto_detected,
    e.triggers,
    e.metadata,
    e.status,
    e.assigned_to,
    trainer.full_name,
    e.created_at,
    EXTRACT(EPOCH FROM (NOW() - e.created_at)) / 60,
    c.question,
    c.response,
    (SELECT COUNT(*)::INTEGER FROM trainer_responses WHERE escalation_id = e.id),
    e.resolution_notes,
    e.resolution_time_minutes
  FROM ai_mentor_escalations e
  JOIN user_profiles u ON u.id = e.user_id
  LEFT JOIN module_topics mt ON mt.id = e.topic_id
  LEFT JOIN user_profiles trainer ON trainer.id = e.assigned_to
  LEFT JOIN ai_mentor_chats c ON c.id = e.chat_id
  WHERE e.id = p_escalation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_trainer_responses',
    sql: `
CREATE OR REPLACE FUNCTION get_trainer_responses(
  p_escalation_id UUID,
  p_include_internal BOOLEAN DEFAULT false
) RETURNS TABLE (
  response_id UUID,
  trainer_id UUID,
  trainer_name TEXT,
  message TEXT,
  is_internal_note BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tr.id,
    tr.trainer_id,
    u.full_name,
    tr.message,
    tr.is_internal_note,
    tr.created_at
  FROM trainer_responses tr
  JOIN user_profiles u ON u.id = tr.trainer_id
  WHERE tr.escalation_id = p_escalation_id
  AND (p_include_internal = true OR tr.is_internal_note = false)
  ORDER BY tr.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'record_notification',
    sql: `
CREATE OR REPLACE FUNCTION record_notification(
  p_escalation_id UUID,
  p_notification_type TEXT,
  p_recipient_id UUID DEFAULT NULL,
  p_recipient_email TEXT DEFAULT NULL,
  p_recipient_slack_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO escalation_notifications (
    escalation_id,
    notification_type,
    recipient_id,
    recipient_email,
    recipient_slack_id,
    sent_at
  ) VALUES (
    p_escalation_id,
    p_notification_type,
    p_recipient_id,
    p_recipient_email,
    p_recipient_slack_id,
    NOW()
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'auto_assign_escalation',
    sql: `
CREATE OR REPLACE FUNCTION auto_assign_escalation(
  p_escalation_id UUID
) RETURNS UUID AS $$
DECLARE
  v_assigned_trainer UUID;
BEGIN
  -- Find trainer with least active escalations
  SELECT t.id INTO v_assigned_trainer
  FROM user_profiles t
  JOIN user_roles ur ON ur.user_id = t.id
  JOIN roles r ON r.id = ur.role_id
  LEFT JOIN ai_mentor_escalations e ON e.assigned_to = t.id AND e.status IN ('pending', 'in_progress')
  WHERE r.name = 'trainer'
  GROUP BY t.id
  ORDER BY COUNT(e.id) ASC, RANDOM()
  LIMIT 1;

  IF v_assigned_trainer IS NOT NULL THEN
    PERFORM assign_escalation(p_escalation_id, v_assigned_trainer);
  END IF;

  RETURN v_assigned_trainer;
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
  console.log('📦 Deploying Escalation database functions...\n');

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
