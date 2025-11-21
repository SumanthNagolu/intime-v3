# ACAD-004: Create Content Upload System

**Status:** ⚪ Not Started

**Story Points:** 5
**Sprint:** Sprint 1 (Week 5-6)
**Priority:** HIGH

---

## User Story

As a **Course Admin**,
I want **to upload course content (videos, PDFs, images) to cloud storage**,
So that **students can access learning materials from anywhere**.

---

## Acceptance Criteria

- [ ] Supabase Storage bucket created for course content
- [ ] Upload videos to S3/Supabase Storage (up to 2GB per file)
- [ ] Upload PDFs, images, documents (up to 50MB per file)
- [ ] Generate signed URLs for secure access
- [ ] Organize content by course/module/topic structure
- [ ] Track uploaded files in `content_assets` table
- [ ] Support file replacement (versioning)
- [ ] CDN integration for fast global delivery
- [ ] RLS policies restrict uploads to admins/course_admins

---

## Technical Implementation

### Database Migration

Create file: `supabase/migrations/024_create_content_assets.sql`

```sql
-- ============================================================================
-- CONTENT_ASSETS: Track uploaded course content
-- ============================================================================

CREATE TABLE content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE, -- e.g., 'courses/guidewire/module-1/video-1.mp4'
  file_type TEXT NOT NULL CHECK (
    file_type IN ('video', 'pdf', 'image', 'document', 'other')
  ),
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,

  -- Where used
  topic_id UUID REFERENCES module_topics(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES topic_lessons(id) ON DELETE SET NULL,

  -- CDN/Access
  cdn_url TEXT,
  is_public BOOLEAN DEFAULT false,

  -- Metadata
  uploaded_by UUID REFERENCES user_profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  replaced_by UUID REFERENCES content_assets(id), -- Version tracking

  -- Search
  searchable_content TEXT -- Extracted text from PDFs for search
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_assets_topic_id ON content_assets(topic_id);
CREATE INDEX idx_assets_lesson_id ON content_assets(lesson_id);
CREATE INDEX idx_assets_file_type ON content_assets(file_type);
CREATE INDEX idx_assets_storage_path ON content_assets(storage_path);

-- Full-text search on content
CREATE INDEX idx_assets_search ON content_assets USING GIN(to_tsvector('english', searchable_content));

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public assets viewable by all"
  ON content_assets
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Enrolled students view course assets"
  ON content_assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM student_enrollments se
      JOIN course_modules cm ON cm.course_id = se.course_id
      JOIN module_topics mt ON mt.module_id = cm.id
      WHERE mt.id = content_assets.topic_id
        AND se.user_id = auth.uid()
        AND se.status = 'active'
    )
  );

CREATE POLICY "Admins upload content"
  ON content_assets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'course_admin'))
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Generate signed URL
CREATE OR REPLACE FUNCTION get_signed_url(
  p_storage_path TEXT,
  p_expires_in_seconds INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
BEGIN
  -- Supabase Storage will generate signed URL
  -- This is a placeholder - actual implementation via Supabase SDK
  RETURN 'https://cdn.intime.com/' || p_storage_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record upload
CREATE OR REPLACE FUNCTION record_content_upload(
  p_filename TEXT,
  p_storage_path TEXT,
  p_file_type TEXT,
  p_mime_type TEXT,
  p_file_size_bytes BIGINT,
  p_topic_id UUID DEFAULT NULL,
  p_lesson_id UUID DEFAULT NULL,
  p_uploaded_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_asset_id UUID;
BEGIN
  INSERT INTO content_assets (
    filename,
    storage_path,
    file_type,
    mime_type,
    file_size_bytes,
    topic_id,
    lesson_id,
    uploaded_by
  ) VALUES (
    p_filename,
    p_storage_path,
    p_file_type,
    p_mime_type,
    p_file_size_bytes,
    p_topic_id,
    p_lesson_id,
    p_uploaded_by
  )
  RETURNING id INTO v_asset_id;

  RETURN v_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### TypeScript Upload Service

Create file: `src/lib/storage/upload.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface UploadResult {
  assetId: string;
  storagePath: string;
  cdnUrl: string;
}

export async function uploadCourseContent(
  file: File,
  topicId?: string,
  lessonId?: string
): Promise<UploadResult> {
  const supabase = createAdminClient();

  // Generate storage path
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `courses/${topicId || 'general'}/${timestamp}-${sanitizedName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('course-content')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase
    .storage
    .from('course-content')
    .getPublicUrl(storagePath);

  // Record in database
  const fileType = getFileType(file.type);
  const { data: assetId, error: dbError } = await supabase.rpc(
    'record_content_upload',
    {
      p_filename: file.name,
      p_storage_path: storagePath,
      p_file_type: fileType,
      p_mime_type: file.type,
      p_file_size_bytes: file.size,
      p_topic_id: topicId || null,
      p_lesson_id: lessonId || null,
    }
  );

  if (dbError) {
    throw new Error(`Failed to record upload: ${dbError.message}`);
  }

  return {
    assetId,
    storagePath,
    cdnUrl: urlData.publicUrl,
  };
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('application/')) return 'document';
  return 'other';
}

export async function getSignedUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .storage
    .from('course-content')
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}
```

### tRPC Router

Create file: `src/server/routers/content.ts`

```typescript
import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { uploadCourseContent, getSignedUrl } from '@/lib/storage/upload';

export const contentRouter = router({
  // Upload content (admin only)
  uploadContent: adminProcedure
    .input(z.object({
      file: z.instanceof(File),
      topicId: z.string().uuid().optional(),
      lessonId: z.string().uuid().optional(),
    }))
    .mutation(async ({ input }) => {
      return await uploadCourseContent(
        input.file,
        input.topicId,
        input.lessonId
      );
    }),

  // Get signed URL for private content
  getContentUrl: protectedProcedure
    .input(z.object({
      storagePath: z.string(),
      expiresIn: z.number().int().positive().default(3600),
    }))
    .query(async ({ input }) => {
      const url = await getSignedUrl(input.storagePath, input.expiresIn);
      return { signedUrl: url };
    }),
});
```

---

## Dependencies

- **ACAD-001** (Courses/Topics) - Required for organizing content
- **FOUND-001** (User Profiles) - Required for uploaded_by tracking

---

## Testing

```typescript
describe('Content Upload', () => {
  it('should upload video file', async () => {
    const file = new File(['test'], 'video.mp4', { type: 'video/mp4' });
    const result = await uploadCourseContent(file, 'topic-id');

    expect(result.assetId).toBeTruthy();
    expect(result.cdnUrl).toContain('video.mp4');
  });

  it('should generate signed URLs', async () => {
    const url = await getSignedUrl('path/to/file.pdf', 7200);
    expect(url).toContain('token=');
  });
});
```

---

## Verification Queries

```sql
-- List uploaded content
SELECT
  ca.filename,
  ca.file_type,
  ca.file_size_bytes / 1024 / 1024 AS size_mb,
  mt.title AS topic,
  ca.uploaded_at
FROM content_assets ca
LEFT JOIN module_topics mt ON mt.id = ca.topic_id
ORDER BY ca.uploaded_at DESC;

-- Storage usage by course
SELECT
  c.title,
  COUNT(ca.id) AS file_count,
  SUM(ca.file_size_bytes) / 1024 / 1024 / 1024 AS total_gb
FROM content_assets ca
JOIN module_topics mt ON mt.id = ca.topic_id
JOIN course_modules cm ON cm.id = mt.module_id
JOIN courses c ON c.id = cm.course_id
GROUP BY c.title
ORDER BY total_gb DESC;
```

---

**Related Stories:**
- **Next:** ACAD-005 (Course Admin UI)
- **Depends On:** ACAD-001, FOUND-001
