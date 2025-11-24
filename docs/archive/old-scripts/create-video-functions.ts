/**
 * Create Video Progress Functions
 * ACAD-007
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
  console.log('\n🎬 Creating Video Progress Functions...\n');

  // 1. Save Video Progress
  console.log('Creating save_video_progress()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION save_video_progress(
      p_user_id UUID,
      p_topic_id UUID,
      p_enrollment_id UUID,
      p_last_position_seconds INTEGER,
      p_video_duration_seconds INTEGER,
      p_video_url TEXT,
      p_video_provider TEXT,
      p_watch_time_increment INTEGER DEFAULT 0
    )
    RETURNS UUID AS $$
    DECLARE
      v_progress_id UUID;
    BEGIN
      INSERT INTO video_progress (
        user_id,
        topic_id,
        enrollment_id,
        last_position_seconds,
        video_duration_seconds,
        video_url,
        video_provider,
        total_watch_time_seconds,
        session_count,
        last_watched_at
      ) VALUES (
        p_user_id,
        p_topic_id,
        p_enrollment_id,
        p_last_position_seconds,
        p_video_duration_seconds,
        p_video_url,
        p_video_provider,
        p_watch_time_increment,
        1,
        NOW()
      )
      ON CONFLICT (user_id, topic_id) DO UPDATE SET
        last_position_seconds = p_last_position_seconds,
        video_duration_seconds = COALESCE(p_video_duration_seconds, video_progress.video_duration_seconds),
        total_watch_time_seconds = video_progress.total_watch_time_seconds + p_watch_time_increment,
        last_watched_at = NOW(),
        session_count = video_progress.session_count + 1
      RETURNING id INTO v_progress_id;

      RETURN v_progress_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ save_video_progress() created\n');

  // 2. Get Video Progress
  console.log('Creating get_video_progress()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION get_video_progress(
      p_user_id UUID,
      p_topic_id UUID
    )
    RETURNS TABLE (
      last_position_seconds INTEGER,
      total_watch_time_seconds INTEGER,
      completion_percentage INTEGER,
      session_count INTEGER,
      last_watched_at TIMESTAMPTZ
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        vp.last_position_seconds,
        vp.total_watch_time_seconds,
        vp.completion_percentage,
        vp.session_count,
        vp.last_watched_at
      FROM video_progress vp
      WHERE vp.user_id = p_user_id
        AND vp.topic_id = p_topic_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ get_video_progress() created\n');

  // 3. Get User Watch Stats
  console.log('Creating get_user_watch_stats()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION get_user_watch_stats(
      p_user_id UUID
    )
    RETURNS TABLE (
      total_videos_watched INTEGER,
      total_watch_time_seconds INTEGER,
      total_videos_completed INTEGER,
      avg_completion_percentage NUMERIC
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        COUNT(*)::INTEGER AS total_videos_watched,
        SUM(vp.total_watch_time_seconds)::INTEGER AS total_watch_time_seconds,
        COUNT(*) FILTER (WHERE vp.completion_percentage >= 90)::INTEGER AS total_videos_completed,
        ROUND(AVG(vp.completion_percentage), 2) AS avg_completion_percentage
      FROM video_progress vp
      WHERE vp.user_id = p_user_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ get_user_watch_stats() created\n');

  // 4. Get Course Watch Stats
  console.log('Creating get_course_watch_stats()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION get_course_watch_stats(
      p_course_id UUID
    )
    RETURNS TABLE (
      topic_id UUID,
      topic_title TEXT,
      total_viewers INTEGER,
      avg_completion_percentage NUMERIC,
      total_watch_time_hours NUMERIC
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        mt.id AS topic_id,
        mt.title AS topic_title,
        COUNT(DISTINCT vp.user_id)::INTEGER AS total_viewers,
        ROUND(AVG(vp.completion_percentage), 2) AS avg_completion_percentage,
        ROUND(SUM(vp.total_watch_time_seconds)::NUMERIC / 3600, 2) AS total_watch_time_hours
      FROM module_topics mt
      JOIN course_modules cm ON cm.id = mt.module_id
      LEFT JOIN video_progress vp ON vp.topic_id = mt.id
      WHERE cm.course_id = p_course_id
        AND mt.content_type = 'video'
      GROUP BY mt.id, mt.title
      ORDER BY mt.topic_number;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ get_course_watch_stats() created\n');

  // 5. Reset Video Progress (for testing/re-watching)
  console.log('Creating reset_video_progress()...');
  await executeSQL(`
    CREATE OR REPLACE FUNCTION reset_video_progress(
      p_user_id UUID,
      p_topic_id UUID
    )
    RETURNS BOOLEAN AS $$
    BEGIN
      UPDATE video_progress
      SET
        last_position_seconds = 0,
        total_watch_time_seconds = 0,
        session_count = 0,
        updated_at = NOW()
      WHERE user_id = p_user_id
        AND topic_id = p_topic_id;

      RETURN FOUND;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('✅ reset_video_progress() created\n');

  console.log('✅ All video functions created successfully!\n');
}

createFunctions().catch(console.error);
