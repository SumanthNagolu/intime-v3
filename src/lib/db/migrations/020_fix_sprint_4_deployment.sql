-- Migration 020: Sprint 4 Deployment Fixes
-- Epic: 2.5 - AI Infrastructure (Sprint 4)
-- Description: Fix deployment blockers for productivity tracking

-- =============================================================================
-- Fix #3: Supabase Storage Bucket Setup Instructions
-- =============================================================================
-- NOTE: Supabase Storage buckets cannot be created via SQL.
-- These must be created manually in the Supabase Dashboard:
--
-- 1. Navigate to Storage in Supabase Dashboard
-- 2. Create bucket: 'employee-screenshots'
--    - Public: NO (private bucket)
--    - File size limit: 5MB
--    - Allowed MIME types: image/png, image/jpeg, image/webp
-- 3. Set bucket policies:
--    - SELECT: Authenticated users can view their own screenshots
--    - INSERT: Authenticated users can upload screenshots
--    - UPDATE: Service role only
--    - DELETE: Authenticated users can delete their own

-- Storage RLS Policies (applied via Supabase Dashboard):
-- Policy: "Users can upload own screenshots"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'employee-screenshots' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy: "Users can view own screenshots"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'employee-screenshots' AND auth.uid()::text = (storage.foldername(name))[1])

-- =============================================================================
-- Verify RLS Functions Exist (from migration 017)
-- =============================================================================
-- These functions should already exist from migration 017.
-- Verify they're present:

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_role') THEN
    RAISE EXCEPTION 'Missing has_role() function - run migration 017 first';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_org_member') THEN
    RAISE EXCEPTION 'Missing is_org_member() function - run migration 017 first';
  END IF;
END $$;

-- =============================================================================
-- Additional Indexes for Performance
-- =============================================================================

-- Improve productivity report queries
CREATE INDEX IF NOT EXISTS idx_productivity_reports_user_date
  ON productivity_reports(user_id, date DESC);

-- Improve screenshot classification queries
CREATE INDEX IF NOT EXISTS idx_employee_screenshots_analyzed
  ON employee_screenshots(user_id, analyzed, captured_at DESC)
  WHERE is_deleted = FALSE;

-- Improve twin interactions queries
CREATE INDEX IF NOT EXISTS idx_twin_interactions_user_role
  ON employee_twin_interactions(user_id, twin_role, created_at DESC);

-- =============================================================================
-- Validation and Constraints
-- =============================================================================

-- Ensure productivity reports have valid data
ALTER TABLE productivity_reports
  ADD CONSTRAINT IF NOT EXISTS productivity_reports_hours_check
  CHECK (productive_hours >= 0 AND productive_hours <= 24);

-- Ensure screenshots have valid timestamps
ALTER TABLE employee_screenshots
  ADD CONSTRAINT IF NOT EXISTS employee_screenshots_future_check
  CHECK (captured_at <= NOW() + INTERVAL '1 hour'); -- Allow small clock skew

-- =============================================================================
-- Grants for Service Role
-- =============================================================================

-- Ensure service role has necessary permissions
GRANT ALL ON productivity_reports TO service_role;
GRANT ALL ON employee_screenshots TO service_role;
GRANT ALL ON employee_twin_interactions TO service_role;

-- =============================================================================
-- Documentation
-- =============================================================================

COMMENT ON SCHEMA public IS 'Migration 020: Sprint 4 deployment fixes applied successfully';

-- =============================================================================
-- Deployment Checklist
-- =============================================================================
/*
MANUAL STEPS REQUIRED AFTER MIGRATION:

1. [ ] Create Supabase Storage bucket 'employee-screenshots' (see instructions above)
2. [ ] Configure storage policies in Supabase Dashboard
3. [ ] Verify environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - OPENAI_API_KEY
   - ANTHROPIC_API_KEY (for Guru agents)
4. [ ] Test screenshot upload/classification flow
5. [ ] Test productivity report generation
6. [ ] Test employee twin interactions
7. [ ] Monitor Helicone for AI cost tracking
*/
