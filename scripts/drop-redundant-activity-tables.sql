-- ============================================
-- DROP REDUNDANT ACTIVITY TABLES
-- Run this AFTER verifying code changes work
-- ============================================

-- Safety: Create backups first (optional, remove if not needed)
-- CREATE TABLE activity_notes_backup AS SELECT * FROM activity_notes;
-- CREATE TABLE activity_history_backup AS SELECT * FROM activity_history;
-- CREATE TABLE activity_escalations_backup AS SELECT * FROM activity_escalations;

-- ============================================
-- PHASE 1: Migrate existing activity_notes to notes table
-- ============================================
INSERT INTO notes (org_id, entity_type, entity_id, content, visibility, created_by, created_at, updated_at)
SELECT
  org_id,
  'activity',
  activity_id,
  content,
  CASE WHEN is_internal THEN 'private'::note_visibility ELSE 'team'::note_visibility END,
  created_by,
  created_at,
  updated_at
FROM activity_notes
ON CONFLICT DO NOTHING;

-- ============================================
-- PHASE 2: Drop the redundant tables
-- ============================================

-- Drop RLS policies first (if they exist)
DROP POLICY IF EXISTS activity_notes_select_policy ON activity_notes;
DROP POLICY IF EXISTS activity_notes_insert_policy ON activity_notes;
DROP POLICY IF EXISTS activity_notes_update_policy ON activity_notes;
DROP POLICY IF EXISTS activity_notes_delete_policy ON activity_notes;

DROP POLICY IF EXISTS activity_history_select_policy ON activity_history;
DROP POLICY IF EXISTS activity_history_insert_policy ON activity_history;
DROP POLICY IF EXISTS activity_history_update_policy ON activity_history;
DROP POLICY IF EXISTS activity_history_delete_policy ON activity_history;

DROP POLICY IF EXISTS activity_escalations_select_policy ON activity_escalations;
DROP POLICY IF EXISTS activity_escalations_insert_policy ON activity_escalations;
DROP POLICY IF EXISTS activity_escalations_update_policy ON activity_escalations;
DROP POLICY IF EXISTS activity_escalations_delete_policy ON activity_escalations;

-- Drop indexes (if they exist separately)
DROP INDEX IF EXISTS idx_activity_notes_activity_id;
DROP INDEX IF EXISTS idx_activity_notes_org_id;
DROP INDEX IF EXISTS idx_activity_notes_created_at;

DROP INDEX IF EXISTS idx_activity_history_activity;
DROP INDEX IF EXISTS activity_history_activity_idx;
DROP INDEX IF EXISTS activity_history_changed_at_idx;

DROP INDEX IF EXISTS idx_activity_escalations_activity_id;
DROP INDEX IF EXISTS idx_activity_escalations_org_id;

-- Drop the tables (CASCADE will handle FK constraints and indexes)
DROP TABLE IF EXISTS activity_notes CASCADE;
DROP TABLE IF EXISTS activity_history CASCADE;
DROP TABLE IF EXISTS activity_escalations CASCADE;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables are dropped
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('activity_notes', 'activity_history', 'activity_escalations');

-- Should return 0 rows

-- Verify notes were migrated
SELECT entity_type, COUNT(*) as count
FROM notes
WHERE entity_type = 'activity'
GROUP BY entity_type;
