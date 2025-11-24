/**
 * ACAD-009: Reading Materials Progress Tracking
 *
 * Creates:
 * - reading_progress table (tracks scroll position and reading time)
 * - Functions for saving/loading progress
 */

-- ============================================================================
-- READING PROGRESS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES module_topics(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,

  -- Progress tracking
  scroll_percentage INTEGER NOT NULL DEFAULT 0,
  last_scroll_position INTEGER DEFAULT 0, -- Pixels from top
  total_reading_time_seconds INTEGER NOT NULL DEFAULT 0,

  -- PDF-specific (if content is PDF)
  current_page INTEGER, -- For PDFs
  total_pages INTEGER, -- For PDFs

  -- Content metadata
  content_type TEXT, -- 'markdown', 'pdf', 'html'
  content_length INTEGER, -- Character count for text, page count for PDF

  -- Session tracking
  session_count INTEGER NOT NULL DEFAULT 1,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, topic_id),

  -- Constraints
  CONSTRAINT valid_scroll_percentage CHECK (scroll_percentage >= 0 AND scroll_percentage <= 100),
  CONSTRAINT valid_scroll_position CHECK (last_scroll_position >= 0),
  CONSTRAINT valid_reading_time CHECK (total_reading_time_seconds >= 0),
  CONSTRAINT valid_page CHECK (current_page IS NULL OR current_page > 0),
  CONSTRAINT valid_content_type CHECK (content_type IN ('markdown', 'pdf', 'html'))
);

-- Indexes
CREATE INDEX idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_topic ON reading_progress(topic_id);
CREATE INDEX idx_reading_progress_enrollment ON reading_progress(enrollment_id);
CREATE INDEX idx_reading_progress_updated ON reading_progress(updated_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Students can view and update their own progress
CREATE POLICY reading_progress_user_policy ON reading_progress
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

CREATE OR REPLACE FUNCTION update_reading_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reading_progress_timestamp
  BEFORE UPDATE ON reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_progress_timestamp();

-- ============================================================================
-- ANALYTICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW reading_stats AS
SELECT
  rp.user_id,
  rp.topic_id,
  rp.enrollment_id,
  mt.title AS topic_title,
  cm.title AS module_title,
  c.title AS course_title,
  rp.scroll_percentage,
  rp.total_reading_time_seconds,
  rp.session_count,
  rp.last_read_at,
  rp.content_type,
  rp.current_page,
  rp.total_pages,
  -- Calculate engagement score (0-100)
  CASE
    WHEN rp.scroll_percentage >= 90 THEN 100
    WHEN rp.scroll_percentage >= 75 THEN 85
    WHEN rp.scroll_percentage >= 50 THEN 70
    WHEN rp.scroll_percentage >= 25 THEN 50
    ELSE 25
  END AS engagement_score
FROM reading_progress rp
JOIN module_topics mt ON mt.id = rp.topic_id
JOIN course_modules cm ON cm.id = mt.module_id
JOIN courses c ON c.id = cm.course_id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE reading_progress IS 'Tracks reading progress for articles, PDFs, and documents';
COMMENT ON COLUMN reading_progress.scroll_percentage IS 'Percentage of content scrolled (0-100)';
COMMENT ON COLUMN reading_progress.last_scroll_position IS 'Last scroll position in pixels for resume';
COMMENT ON COLUMN reading_progress.current_page IS 'Current page number for PDFs';
COMMENT ON COLUMN reading_progress.session_count IS 'Number of times user read this content';
