/**
 * Create content asset functions separately
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  console.log('\n🔧 Creating content asset functions...\n');

  // Function 1: record_content_upload
  console.log('📝 Creating record_content_upload...');
  const recordUploadSQL = `
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
  IF p_file_type NOT IN ('video', 'pdf', 'image', 'document', 'other') THEN
    RAISE EXCEPTION 'Invalid file type: %', p_file_type;
  END IF;

  IF p_file_size_bytes <= 0 THEN
    RAISE EXCEPTION 'Invalid file size: %', p_file_size_bytes;
  END IF;

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
  `;

  try {
    await executeSQL(recordUploadSQL);
    console.log('✅ record_content_upload created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Function 2: replace_content_asset
  console.log('📝 Creating replace_content_asset...');
  const replaceAssetSQL = `
CREATE OR REPLACE FUNCTION replace_content_asset(
  p_old_asset_id UUID,
  p_new_asset_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE content_assets
  SET
    replaced_by = p_new_asset_id,
    is_current = false,
    updated_at = NOW()
  WHERE id = p_old_asset_id;

  UPDATE content_assets
  SET is_current = true
  WHERE id = p_new_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    await executeSQL(replaceAssetSQL);
    console.log('✅ replace_content_asset created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Function 3: get_asset_storage_path
  console.log('📝 Creating get_asset_storage_path...');
  const getStoragePathSQL = `
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
  `;

  try {
    await executeSQL(getStoragePathSQL);
    console.log('✅ get_asset_storage_path created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Function 4: get_topic_assets
  console.log('📝 Creating get_topic_assets...');
  const getTopicAssetsSQL = `
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
  `;

  try {
    await executeSQL(getTopicAssetsSQL);
    console.log('✅ get_topic_assets created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  // Function 5: get_course_storage_usage
  console.log('📝 Creating get_course_storage_usage...');
  const getStorageUsageSQL = `
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
  `;

  try {
    await executeSQL(getStorageUsageSQL);
    console.log('✅ get_course_storage_usage created\n');
  } catch (error: any) {
    console.log('❌ Failed:', error.message, '\n');
  }

  console.log('✅ All functions created!\n');
}

createFunctions();
