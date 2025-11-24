/**
 * Content Upload System
 * Story: ACAD-004
 *
 * Creates:
 * - content_assets: Track uploaded course content
 * - Functions: record_content_upload, get_signed_url
 * - RLS policies for secure access
 */

-- =====================================================
-- TABLE: content_assets
-- =====================================================
CREATE TABLE IF NOT EXISTS content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File details
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE, -- e.g., 'courses/guidewire/module-1/video-1.mp4'
  file_type TEXT NOT NULL CHECK (
    file_type IN ('video', 'pdf', 'image', 'document', 'other')
  ),
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),

  -- Associations
  topic_id UUID REFERENCES module_topics(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES topic_lessons(id) ON DELETE SET NULL,

  -- CDN/Access
  cdn_url TEXT,
  is_public BOOLEAN DEFAULT false,

  -- Version tracking
  replaced_by UUID REFERENCES content_assets(id) ON DELETE SET NULL,
  is_current BOOLEAN DEFAULT true,

  -- Metadata
  uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Search (for PDF text extraction)
  searchable_content TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_content_assets_topic ON content_assets(topic_id);
CREATE INDEX idx_content_assets_lesson ON content_assets(lesson_id);
CREATE INDEX idx_content_assets_file_type ON content_assets(file_type);
CREATE INDEX idx_content_assets_storage_path ON content_assets(storage_path);
CREATE INDEX idx_content_assets_uploaded_by ON content_assets(uploaded_by);
CREATE INDEX idx_content_assets_is_current ON content_assets(is_current) WHERE is_current = true;

-- Full-text search on extracted content
CREATE INDEX idx_content_assets_search
  ON content_assets
  USING GIN(to_tsvector('english', COALESCE(searchable_content, '')));

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;

-- Public assets viewable by all
CREATE POLICY "Public assets viewable by all"
  ON content_assets FOR SELECT
  USING (is_public = true);

-- Enrolled students can view course assets
CREATE POLICY "Enrolled students view course assets"
  ON content_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM student_enrollments se
      JOIN course_modules cm ON cm.course_id = se.course_id
      JOIN module_topics mt ON mt.module_id = cm.id
      WHERE mt.id = content_assets.topic_id
        AND se.user_id = auth.uid()
        AND se.status IN ('active', 'completed')
    )
  );

-- Note: Admin upload policy will be added when roles system is implemented
-- For now, uploads must go through service role

-- =====================================================
-- FUNCTION: record_content_upload
-- =====================================================
CREATE OR REPLACE FUNCTION record_content_upload(
  p_filename TEXT,
  p_storage_path TEXT,
  p_file_type TEXT,
  p_mime_type TEXT,
  p_file_size_bytes BIGINT,
  p_topic_id UUID DEFAULT NULL,
  p_lesson_id UUID DEFAULT NULL,
  p_uploaded_by UUID DEFAULT NULL,
  p_cdn_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_asset_id UUID;
BEGIN
  -- Validate file type
  IF p_file_type NOT IN ('video', 'pdf', 'image', 'document', 'other') THEN
    RAISE EXCEPTION 'Invalid file type: %', p_file_type;
  END IF;

  -- Validate file size
  IF p_file_size_bytes <= 0 THEN
    RAISE EXCEPTION 'Invalid file size: %', p_file_size_bytes;
  END IF;

  -- Insert asset record
  INSERT INTO content_assets (
    filename,
    storage_path,
    file_type,
    mime_type,
    file_size_bytes,
    topic_id,
    lesson_id,
    uploaded_by,
    cdn_url
  ) VALUES (
    p_filename,
    p_storage_path,
    p_file_type,
    p_mime_type,
    p_file_size_bytes,
    p_topic_id,
    p_lesson_id,
    COALESCE(p_uploaded_by, auth.uid()),
    p_cdn_url
  )
  RETURNING id INTO v_asset_id;

  RETURN v_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: replace_content_asset
-- =====================================================
CREATE OR REPLACE FUNCTION replace_content_asset(
  p_old_asset_id UUID,
  p_new_asset_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Mark old asset as replaced
  UPDATE content_assets
  SET
    replaced_by = p_new_asset_id,
    is_current = false,
    updated_at = NOW()
  WHERE id = p_old_asset_id;

  -- Ensure new asset is marked as current
  UPDATE content_assets
  SET is_current = true
  WHERE id = p_new_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: get_asset_storage_path
-- =====================================================
CREATE OR REPLACE FUNCTION get_asset_storage_path(p_asset_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_storage_path TEXT;
BEGIN
  SELECT storage_path INTO v_storage_path
  FROM content_assets
  WHERE id = p_asset_id;

  RETURN v_storage_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: get_topic_assets
-- =====================================================
CREATE OR REPLACE FUNCTION get_topic_assets(p_topic_id UUID)
RETURNS TABLE (
  asset_id UUID,
  filename TEXT,
  file_type TEXT,
  file_size_bytes BIGINT,
  cdn_url TEXT,
  uploaded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    content_assets.filename,
    content_assets.file_type,
    content_assets.file_size_bytes,
    content_assets.cdn_url,
    content_assets.uploaded_at
  FROM content_assets
  WHERE topic_id = p_topic_id
    AND is_current = true
  ORDER BY uploaded_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: get_course_storage_usage
-- =====================================================
CREATE OR REPLACE FUNCTION get_course_storage_usage(p_course_id UUID)
RETURNS TABLE (
  file_count BIGINT,
  total_bytes BIGINT,
  video_count BIGINT,
  video_bytes BIGINT,
  document_count BIGINT,
  document_bytes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as file_count,
    COALESCE(SUM(ca.file_size_bytes), 0) as total_bytes,
    COUNT(*) FILTER (WHERE ca.file_type = 'video') as video_count,
    COALESCE(SUM(ca.file_size_bytes) FILTER (WHERE ca.file_type = 'video'), 0) as video_bytes,
    COUNT(*) FILTER (WHERE ca.file_type IN ('pdf', 'document')) as document_count,
    COALESCE(SUM(ca.file_size_bytes) FILTER (WHERE ca.file_type IN ('pdf', 'document')), 0) as document_bytes
  FROM content_assets ca
  JOIN module_topics mt ON mt.id = ca.topic_id
  JOIN course_modules cm ON cm.id = mt.module_id
  WHERE cm.course_id = p_course_id
    AND ca.is_current = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_content_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_assets_updated_at
  BEFORE UPDATE ON content_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_content_assets_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE content_assets IS 'Tracks uploaded course content files (videos, PDFs, images)';
COMMENT ON COLUMN content_assets.storage_path IS 'Unique path in Supabase Storage bucket';
COMMENT ON COLUMN content_assets.replaced_by IS 'ID of newer version that replaced this asset';
COMMENT ON COLUMN content_assets.is_current IS 'Whether this is the current version (not replaced)';
COMMENT ON COLUMN content_assets.searchable_content IS 'Extracted text from PDFs for full-text search';
COMMENT ON FUNCTION record_content_upload IS 'Records a new content upload in the database';
COMMENT ON FUNCTION replace_content_asset IS 'Marks an asset as replaced by a newer version';
COMMENT ON FUNCTION get_topic_assets IS 'Returns all current assets for a topic';
COMMENT ON FUNCTION get_course_storage_usage IS 'Calculates storage usage statistics for a course';
