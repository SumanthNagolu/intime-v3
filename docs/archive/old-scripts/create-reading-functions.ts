/**
 * Create Reading Progress Functions
 * ACAD-009
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
  console.log('\n📚 Creating Reading Progress Functions...\n');

  // 1. Save Reading Progress
  console.log('Creating save_reading_progress()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION save_reading_progress(
      p_user_id UUID,
      p_topic_id UUID,
      p_enrollment_id UUID,
      p_scroll_percentage INTEGER,
      p_last_scroll_position INTEGER,
      p_reading_time_increment INTEGER DEFAULT 0,
      p_content_type TEXT DEFAULT 'markdown',
      p_content_length INTEGER DEFAULT NULL,
      p_current_page INTEGER DEFAULT NULL,
      p_total_pages INTEGER DEFAULT NULL
    )
    RETURNS UUID AS $$
    DECLARE
      v_progress_id UUID;
    BEGIN
      INSERT INTO reading_progress (
        user_id,
        topic_id,
        enrollment_id,
        scroll_percentage,
        last_scroll_position,
        total_reading_time_seconds,
        content_type,
        content_length,
        current_page,
        total_pages,
        session_count,
        last_read_at
      ) VALUES (
        p_user_id,
        p_topic_id,
        p_enrollment_id,
        p_scroll_percentage,
        p_last_scroll_position,
        p_reading_time_increment,
        p_content_type,
        p_content_length,
        p_current_page,
        p_total_pages,
        1,
        NOW()
      )
      ON CONFLICT (user_id, topic_id) DO UPDATE SET
        scroll_percentage = GREATEST(reading_progress.scroll_percentage, p_scroll_percentage),
        last_scroll_position = p_last_scroll_position,
        total_reading_time_seconds = reading_progress.total_reading_time_seconds + p_reading_time_increment,
        content_type = COALESCE(p_content_type, reading_progress.content_type),
        content_length = COALESCE(p_content_length, reading_progress.content_length),
        current_page = COALESCE(p_current_page, reading_progress.current_page),
        total_pages = COALESCE(p_total_pages, reading_progress.total_pages),
        last_read_at = NOW(),
        session_count = reading_progress.session_count + 1
      RETURNING id INTO v_progress_id;

      RETURN v_progress_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ save_reading_progress() created\n');

  // 2. Get Reading Progress
  console.log('Creating get_reading_progress()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION get_reading_progress(
      p_user_id UUID,
      p_topic_id UUID
    )
    RETURNS TABLE (
      scroll_percentage INTEGER,
      last_scroll_position INTEGER,
      total_reading_time_seconds INTEGER,
      current_page INTEGER,
      total_pages INTEGER,
      content_type TEXT,
      session_count INTEGER,
      last_read_at TIMESTAMPTZ
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        rp.scroll_percentage,
        rp.last_scroll_position,
        rp.total_reading_time_seconds,
        rp.current_page,
        rp.total_pages,
        rp.content_type,
        rp.session_count,
        rp.last_read_at
      FROM reading_progress rp
      WHERE rp.user_id = p_user_id
        AND rp.topic_id = p_topic_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ get_reading_progress() created\n');

  // 3. Get User Reading Stats
  console.log('Creating get_user_reading_stats()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION get_user_reading_stats(
      p_user_id UUID
    )
    RETURNS TABLE (
      total_articles_read INTEGER,
      total_reading_time_seconds INTEGER,
      total_articles_completed INTEGER,
      avg_scroll_percentage NUMERIC
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        COUNT(*)::INTEGER AS total_articles_read,
        SUM(rp.total_reading_time_seconds)::INTEGER AS total_reading_time_seconds,
        COUNT(*) FILTER (WHERE rp.scroll_percentage >= 90)::INTEGER AS total_articles_completed,
        ROUND(AVG(rp.scroll_percentage), 2) AS avg_scroll_percentage
      FROM reading_progress rp
      WHERE rp.user_id = p_user_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ get_user_reading_stats() created\n');

  // 4. Get Course Reading Stats
  console.log('Creating get_course_reading_stats()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION get_course_reading_stats(
      p_course_id UUID
    )
    RETURNS TABLE (
      topic_id UUID,
      topic_title TEXT,
      total_readers INTEGER,
      avg_scroll_percentage NUMERIC,
      total_reading_time_hours NUMERIC
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        mt.id AS topic_id,
        mt.title AS topic_title,
        COUNT(DISTINCT rp.user_id)::INTEGER AS total_readers,
        ROUND(AVG(rp.scroll_percentage), 2) AS avg_scroll_percentage,
        ROUND(SUM(rp.total_reading_time_seconds)::NUMERIC / 3600, 2) AS total_reading_time_hours
      FROM module_topics mt
      JOIN course_modules cm ON cm.id = mt.module_id
      LEFT JOIN reading_progress rp ON rp.topic_id = mt.id
      WHERE cm.course_id = p_course_id
        AND mt.content_type IN ('reading', 'article')
      GROUP BY mt.id, mt.title
      ORDER BY mt.topic_number;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ get_course_reading_stats() created\n');

  // 5. Reset Reading Progress
  console.log('Creating reset_reading_progress()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION reset_reading_progress(
      p_user_id UUID,
      p_topic_id UUID
    )
    RETURNS BOOLEAN AS $$
    BEGIN
      UPDATE reading_progress
      SET
        scroll_percentage = 0,
        last_scroll_position = 0,
        total_reading_time_seconds = 0,
        current_page = NULL,
        session_count = 0,
        updated_at = NOW()
      WHERE user_id = p_user_id
        AND topic_id = p_topic_id;

      RETURN FOUND;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ reset_reading_progress() created\n');

  console.log('✅ All reading functions created successfully!\n');
}

createFunctions().catch(console.error);
