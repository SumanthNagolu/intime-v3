import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2h4bXZ1Z25qd3d3aXVmbWR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQyMDAyNSwiZXhwIjoyMDc4OTk2MDI1fQ.tQUz_5hccWbYV338i-fV-X5aL5tzw5zwspZNFKD-4Tk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFunctions() {
  try {
    console.log('📦 Reading migration file...');
    const sql = readFileSync('supabase/migrations/20251121090000_create_event_admin_functions.sql', 'utf8');

    console.log('🔧 Executing SQL via Supabase API...\n');

    // Execute the entire SQL file
    const { data, error } = await supabase.rpc('exec', { sql });

    if (error) {
      console.error('❌ Error executing SQL:', error);

      // Try individual functions
      console.log('\n🔧 Trying individual function creation...\n');

      const functions = [
        {
          name: 'get_events_filtered',
          sql: `CREATE OR REPLACE FUNCTION get_events_filtered(
  p_org_id UUID DEFAULT NULL,
  p_event_name TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  event_name TEXT,
  payload JSONB,
  status TEXT,
  created_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER,
  org_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.event_name,
    e.payload,
    e.status,
    e.created_at,
    e.processed_at,
    e.error_message,
    e.retry_count,
    e.org_id
  FROM events e
  WHERE
    (p_org_id IS NULL OR e.org_id = p_org_id)
    AND (p_event_name IS NULL OR e.event_name = p_event_name)
  ORDER BY e.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;`
        },
        {
          name: 'replay_failed_events_batch',
          sql: `CREATE OR REPLACE FUNCTION replay_failed_events_batch(
  p_batch_size INTEGER DEFAULT 10,
  p_org_id UUID DEFAULT NULL
)
RETURNS TABLE (
  event_id UUID,
  event_name TEXT,
  replayed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH failed_events AS (
    SELECT e.id, e.event_name
    FROM events e
    WHERE e.status = 'failed'
      AND (p_org_id IS NULL OR e.org_id = p_org_id)
    ORDER BY e.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  ),
  updated AS (
    UPDATE events
    SET
      status = 'pending',
      retry_count = retry_count + 1,
      error_message = NULL,
      updated_at = NOW()
    WHERE id IN (SELECT id FROM failed_events)
    RETURNING id, event_name
  )
  SELECT u.id, u.event_name, TRUE
  FROM updated u;
END;
$$;`
        },
        {
          name: 'get_event_handler_health',
          sql: `CREATE OR REPLACE FUNCTION get_event_handler_health(
  p_handler_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  handler_name TEXT,
  is_enabled BOOLEAN,
  total_processed BIGINT,
  total_failed BIGINT,
  avg_processing_time_ms NUMERIC,
  last_processed_at TIMESTAMPTZ,
  health_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    eh.handler_name,
    eh.is_enabled,
    COUNT(CASE WHEN eh.status = 'completed' THEN 1 END) as total_processed,
    COUNT(CASE WHEN eh.status = 'failed' THEN 1 END) as total_failed,
    AVG(EXTRACT(EPOCH FROM (eh.completed_at - eh.started_at)) * 1000) as avg_processing_time_ms,
    MAX(eh.completed_at) as last_processed_at,
    CASE
      WHEN NOT eh.is_enabled THEN 'disabled'
      WHEN COUNT(CASE WHEN eh.status = 'failed' THEN 1 END) > 10 THEN 'unhealthy'
      WHEN MAX(eh.completed_at) < NOW() - INTERVAL '1 hour' THEN 'stale'
      ELSE 'healthy'
    END as health_status
  FROM event_handlers eh
  WHERE p_handler_name IS NULL OR eh.handler_name = p_handler_name
  GROUP BY eh.handler_name, eh.is_enabled;
END;
$$;`
        },
        {
          name: 'disable_event_handler',
          sql: `CREATE OR REPLACE FUNCTION disable_event_handler(
  p_handler_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE event_handlers
  SET
    is_enabled = FALSE,
    updated_at = NOW()
  WHERE handler_name = p_handler_name;

  RETURN FOUND;
END;
$$;`
        },
        {
          name: 'enable_event_handler',
          sql: `CREATE OR REPLACE FUNCTION enable_event_handler(
  p_handler_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE event_handlers
  SET
    is_enabled = TRUE,
    updated_at = NOW()
  WHERE handler_name = p_handler_name;

  RETURN FOUND;
END;
$$;`
        },
        {
          name: 'get_course_enrollment_analytics',
          sql: `CREATE OR REPLACE FUNCTION get_course_enrollment_analytics(
  p_course_id UUID
)
RETURNS TABLE (
  total_enrollments BIGINT,
  active_enrollments BIGINT,
  completed_enrollments BIGINT,
  avg_completion_percentage NUMERIC,
  avg_time_to_complete_days NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_enrollments,
    COUNT(CASE WHEN se.status = 'active' THEN 1 END) as active_enrollments,
    COUNT(CASE WHEN se.status = 'completed' THEN 1 END) as completed_enrollments,
    AVG(se.completion_percentage) as avg_completion_percentage,
    AVG(EXTRACT(EPOCH FROM (se.completed_at - se.enrolled_at)) / 86400) as avg_time_to_complete_days
  FROM student_enrollments se
  WHERE se.course_id = p_course_id;
END;
$$;`
        }
      ];

      for (const func of functions) {
        console.log(`Creating function: ${func.name}`);
        // For now, just log - we'll need a different approach
        console.log(`   ⚠️  Cannot create via API - SQL execution not available`);
      }

      console.log('\n⚠️  Manual migration required via Supabase Studio or psql');
      process.exit(1);
    } else {
      console.log('✅ Migration applied successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

applyFunctions();
