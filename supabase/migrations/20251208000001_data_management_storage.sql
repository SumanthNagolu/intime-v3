-- ============================================================================
-- Migration: Data Management Storage Buckets
-- Date: 2025-12-08
-- Description: Storage buckets for data imports, exports, and GDPR exports
-- ============================================================================

-- Create storage buckets for data management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('imports', 'imports', false, 52428800, ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json', 'text/plain']),
  ('exports', 'exports', false, 104857600, ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json']),
  ('gdpr-exports', 'gdpr-exports', false, 104857600, ARRAY['application/json', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for imports bucket
CREATE POLICY "imports_org_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'imports' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "imports_org_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'imports' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "imports_service_role" ON storage.objects
  FOR ALL USING (
    bucket_id = 'imports' AND
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Storage policies for exports bucket
CREATE POLICY "exports_org_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "exports_service_role" ON storage.objects
  FOR ALL USING (
    bucket_id = 'exports' AND
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Storage policies for gdpr-exports bucket
CREATE POLICY "gdpr_exports_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'gdpr-exports' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "gdpr_exports_service_role" ON storage.objects
  FOR ALL USING (
    bucket_id = 'gdpr-exports' AND
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================================================
-- END MIGRATION
-- ============================================================================
