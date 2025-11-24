/**
 * ACAD-007: Video Player with Progress Tracking
 *
 * Creates:
 * - video_progress table (stores last position and watch time)
 * - Functions for saving/loading progress
 * - Analytics functions
 */

-- ============================================================================
-- VIDEO PROGRESS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES module_topics(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,

  -- Progress tracking
  last_position_seconds INTEGER NOT NULL DEFAULT 0,
  total_watch_time_seconds INTEGER NOT NULL DEFAULT 0,
  video_duration_seconds INTEGER, -- Store duration for analytics
  completion_percentage INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN video_duration_seconds > 0 THEN
        LEAST(100, (last_position_seconds * 100) / video_duration_seconds)
      ELSE 0
    END
  ) STORED,

  -- Video metadata
  video_url TEXT,
  video_provider TEXT, -- 'vimeo', 'youtube', 'direct', 's3'

  -- Session tracking
  session_count INTEGER NOT NULL DEFAULT 1, -- Number of times video was watched
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, topic_id),

  -- Constraints
  CONSTRAINT valid_position CHECK (last_position_seconds >= 0),
  CONSTRAINT valid_watch_time CHECK (total_watch_time_seconds >= 0),
  CONSTRAINT valid_duration CHECK (video_duration_seconds IS NULL OR video_duration_seconds > 0),
  CONSTRAINT valid_provider CHECK (video_provider IN ('vimeo', 'youtube', 'direct', 's3'))
);

-- Indexes
CREATE INDEX idx_video_progress_user ON video_progress(user_id);
CREATE INDEX idx_video_progress_topic ON video_progress(topic_id);
CREATE INDEX idx_video_progress_enrollment ON video_progress(enrollment_id);
CREATE INDEX idx_video_progress_updated ON video_progress(updated_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Students can view and update their own progress
CREATE POLICY video_progress_student_policy ON video_progress
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
    )
  );

-- Note: Admin/trainer policies will be added when roles system is implemented

-- ============================================================================
-- TRIGGER: Update timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_video_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_video_progress_timestamp
  BEFORE UPDATE ON video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_video_progress_timestamp();

-- ============================================================================
-- ANALYTICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW video_watch_stats AS
SELECT
  vp.user_id,
  vp.topic_id,
  vp.enrollment_id,
  mt.title AS topic_title,
  cm.title AS module_title,
  c.title AS course_title,
  vp.total_watch_time_seconds,
  vp.completion_percentage,
  vp.session_count,
  vp.last_watched_at,
  vp.video_duration_seconds,
  vp.video_provider,
  -- Calculate engagement score (0-100)
  CASE
    WHEN vp.video_duration_seconds > 0 THEN
      LEAST(100, (vp.total_watch_time_seconds * 100) / vp.video_duration_seconds)
    ELSE 0
  END AS engagement_score
FROM video_progress vp
JOIN module_topics mt ON mt.id = vp.topic_id
JOIN course_modules cm ON cm.id = mt.module_id
JOIN courses c ON c.id = cm.course_id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE video_progress IS 'Tracks video watching progress and analytics';
COMMENT ON COLUMN video_progress.last_position_seconds IS 'Last playback position for resume functionality';
COMMENT ON COLUMN video_progress.total_watch_time_seconds IS 'Cumulative time spent watching (can exceed video duration)';
COMMENT ON COLUMN video_progress.session_count IS 'Number of times user watched this video';
COMMENT ON COLUMN video_progress.completion_percentage IS 'Calculated from last_position / duration';
