-- Migration 012: File Management System
-- Sprint 3: Workflow Engine & Core Services
-- Created: 2025-11-19
-- Purpose: Create unified file upload tracking table

-- ========================================
-- 1. FILE_UPLOADS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL, -- 'avatars', 'resumes', 'documents', 'attachments', 'course-materials'
  file_path TEXT NOT NULL, -- Supabase Storage path: org_id/entity_type/entity_id/filename
  file_name TEXT NOT NULL, -- Original filename
  file_size INTEGER NOT NULL, -- bytes
  mime_type TEXT NOT NULL,
  entity_type TEXT, -- 'user', 'student', 'candidate', 'job', etc.
  entity_id UUID, -- ID of related entity
  uploaded_by UUID NOT NULL REFERENCES user_profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ, -- Soft delete
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- width/height for images, duration for videos, etc.

  CONSTRAINT unique_file_path UNIQUE (bucket, file_path),
  CONSTRAINT valid_bucket CHECK (bucket IN ('avatars', 'resumes', 'documents', 'attachments', 'course-materials'))
);

CREATE INDEX idx_file_uploads_org_id ON file_uploads(org_id);
CREATE INDEX idx_file_uploads_bucket ON file_uploads(bucket);
CREATE INDEX idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_not_deleted ON file_uploads(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE file_uploads IS 'Metadata for all uploaded files (files stored in Supabase Storage)';
COMMENT ON COLUMN file_uploads.file_path IS 'Full path in Supabase Storage';
COMMENT ON COLUMN file_uploads.bucket IS 'Supabase Storage bucket name';

-- ========================================
-- RLS POLICIES
-- ========================================

ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files in their org"
  ON file_uploads FOR SELECT
  USING (
    (org_id = auth_user_org_id() AND deleted_at IS NULL)
    OR user_is_admin()
  );

CREATE POLICY "Users can upload files to their org"
  ON file_uploads FOR INSERT
  WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY "Users can soft-delete their own files"
  ON file_uploads FOR UPDATE
  USING (
    org_id = auth_user_org_id()
    AND uploaded_by = auth_user_id()
  )
  WITH CHECK (
    org_id = auth_user_org_id()
    AND uploaded_by = auth_user_id()
  );
