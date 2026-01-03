-- ============================================
-- PHASE 1: Add blocking activity columns
-- Run this in Supabase Studio SQL Editor
-- ============================================

-- 1. Add columns to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS is_blocking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS blocking_statuses text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS escalated_to_user_id uuid REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS original_assigned_to uuid REFERENCES user_profiles(id);

-- 2. Add columns to activity_patterns table
ALTER TABLE activity_patterns
ADD COLUMN IF NOT EXISTS is_blocking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS blocking_statuses jsonb DEFAULT '[]'::jsonb;

-- 3. Add comments for documentation
COMMENT ON COLUMN activities.is_blocking IS 'If true, this activity blocks entity status changes to closing statuses';
COMMENT ON COLUMN activities.blocking_statuses IS 'Specific statuses this activity blocks (empty = blocks all closing statuses)';
COMMENT ON COLUMN activities.escalated_to_user_id IS 'User the activity was escalated to (manager/supervisor)';
COMMENT ON COLUMN activities.original_assigned_to IS 'Original assignee before escalation';

COMMENT ON COLUMN activity_patterns.is_blocking IS 'If true, activities created from this pattern are blocking by default';
COMMENT ON COLUMN activity_patterns.blocking_statuses IS 'Default blocking statuses for activities created from this pattern';

-- 4. Create index for blocking activities lookup
CREATE INDEX IF NOT EXISTS idx_activities_blocking
ON activities(entity_type, entity_id)
WHERE is_blocking = true AND status IN ('open', 'in_progress', 'scheduled') AND deleted_at IS NULL;

-- 5. Create index for escalated activities
CREATE INDEX IF NOT EXISTS idx_activities_escalated
ON activities(escalated_to_user_id)
WHERE escalated_to_user_id IS NOT NULL AND status IN ('open', 'in_progress', 'scheduled') AND deleted_at IS NULL;

-- ============================================
-- PHASE 9: Seed watchlist and blocking patterns
-- ============================================

-- Insert watchlist patterns for each entity type
INSERT INTO activity_patterns (
  code, name, description, category, entity_type, icon, color,
  target_days, priority, is_system, is_active, display_order,
  instructions, is_blocking, blocking_statuses
) VALUES
  -- Account watchlist
  ('sys_watchlist_account', 'Account Watchlist', 'Auto-created when account has no open activities',
   'administrative', 'account', '👁️', 'gray', 30, 'low', true, true, 999,
   'This account has no open activities. Review and create appropriate follow-up activities.',
   false, '[]'::jsonb),

  -- Job watchlist
  ('sys_watchlist_job', 'Job Watchlist', 'Auto-created when job has no open activities',
   'administrative', 'job', '👁️', 'gray', 14, 'low', true, true, 999,
   'This job has no open activities. Check sourcing status and create necessary tasks.',
   false, '[]'::jsonb),

  -- Submission watchlist
  ('sys_watchlist_submission', 'Submission Watchlist', 'Auto-created when submission has no open activities',
   'administrative', 'submission', '👁️', 'gray', 7, 'low', true, true, 999,
   'This submission has no open activities. Follow up on status and next steps.',
   false, '[]'::jsonb),

  -- Placement watchlist
  ('sys_watchlist_placement', 'Placement Watchlist', 'Auto-created when placement has no open activities',
   'administrative', 'placement', '👁️', 'gray', 14, 'low', true, true, 999,
   'This placement has no open activities. Check consultant status and upcoming milestones.',
   false, '[]'::jsonb),

  -- Candidate watchlist
  ('sys_watchlist_candidate', 'Candidate Watchlist', 'Auto-created when candidate has no open activities',
   'administrative', 'candidate', '👁️', 'gray', 30, 'low', true, true, 999,
   'This candidate has no open activities. Review for potential job matches.',
   false, '[]'::jsonb),

  -- Lead watchlist
  ('sys_watchlist_lead', 'Lead Watchlist', 'Auto-created when lead has no open activities',
   'administrative', 'lead', '👁️', 'gray', 7, 'low', true, true, 999,
   'This lead has no open activities. Follow up to maintain engagement.',
   false, '[]'::jsonb),

  -- Deal watchlist
  ('sys_watchlist_deal', 'Deal Watchlist', 'Auto-created when deal has no open activities',
   'administrative', 'deal', '👁️', 'gray', 7, 'low', true, true, 999,
   'This deal has no open activities. Review pipeline and create next steps.',
   false, '[]'::jsonb),

  -- Campaign watchlist
  ('sys_watchlist_campaign', 'Campaign Watchlist', 'Auto-created when campaign has no open activities',
   'administrative', 'campaign', '👁️', 'gray', 14, 'low', true, true, 999,
   'This campaign has no open activities. Check performance and engagement.',
   false, '[]'::jsonb),

  -- Contact watchlist
  ('sys_watchlist_contact', 'Contact Watchlist', 'Auto-created when contact has no open activities',
   'administrative', 'contact', '👁️', 'gray', 30, 'low', true, true, 999,
   'This contact has no open activities. Consider reaching out to maintain relationship.',
   false, '[]'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_blocking = EXCLUDED.is_blocking,
  blocking_statuses = EXCLUDED.blocking_statuses,
  instructions = EXCLUDED.instructions,
  updated_at = now();

-- Insert blocking activity patterns
INSERT INTO activity_patterns (
  code, name, description, category, entity_type, icon, color,
  target_days, priority, is_system, is_active, display_order,
  instructions, checklist, is_blocking, blocking_statuses
) VALUES
  -- Account closing requirements (blocking)
  ('sys_account_closeout', 'Account Closeout Review', 'Required before closing an account',
   'workflow', 'account', '🔒', 'red', 3, 'high', true, true, 50,
   'Complete all items before closing this account. All open matters must be resolved.',
   '[{"id": "open_jobs", "label": "All open jobs closed or transferred", "required": true},
     {"id": "active_placements", "label": "No active placements", "required": true},
     {"id": "outstanding_invoices", "label": "All invoices paid or written off", "required": true},
     {"id": "final_review", "label": "Manager approval obtained", "required": true}]'::jsonb,
   true, '["inactive", "closed", "churned", "lost"]'::jsonb),

  -- Job closing requirements (blocking)
  ('sys_job_closeout', 'Job Closeout Review', 'Required before closing a job',
   'workflow', 'job', '🔒', 'red', 2, 'high', true, true, 50,
   'Complete all items before closing this job order.',
   '[{"id": "pending_submissions", "label": "All submissions resolved", "required": true},
     {"id": "candidate_notifications", "label": "All candidates notified", "required": true},
     {"id": "client_confirmation", "label": "Client confirmation received", "required": true}]'::jsonb,
   true, '["closed", "cancelled", "filled"]'::jsonb),

  -- Submission rejection review (blocking)
  ('sys_submission_reject', 'Submission Rejection Review', 'Required before rejecting a submission',
   'workflow', 'submission', '🔒', 'red', 1, 'high', true, true, 50,
   'Document rejection reason and notify candidate before finalizing.',
   '[{"id": "rejection_reason", "label": "Rejection reason documented", "required": true},
     {"id": "candidate_notified", "label": "Candidate notified", "required": true}]'::jsonb,
   true, '["rejected", "withdrawn", "declined"]'::jsonb),

  -- Placement end review (blocking)
  ('sys_placement_end', 'Placement End Review', 'Required before ending a placement',
   'workflow', 'placement', '🔒', 'red', 5, 'high', true, true, 50,
   'Complete all offboarding tasks before ending this placement.',
   '[{"id": "final_timesheet", "label": "Final timesheet submitted", "required": true},
     {"id": "equipment_return", "label": "Equipment returned (if applicable)", "required": false},
     {"id": "exit_interview", "label": "Exit interview completed", "required": false},
     {"id": "client_feedback", "label": "Client feedback collected", "required": true}]'::jsonb,
   true, '["terminated", "ended", "cancelled"]'::jsonb),

  -- Compliance verification (blocking for multiple entity types)
  ('sys_compliance_check', 'Compliance Verification', 'Required compliance check before closing',
   'documentation', 'candidate', '📋', 'orange', 2, 'high', true, true, 60,
   'Verify all compliance requirements are met.',
   '[{"id": "documents_valid", "label": "All documents valid and on file", "required": true},
     {"id": "background_clear", "label": "Background check clear", "required": true}]'::jsonb,
   true, '["inactive", "archived"]'::jsonb),

  -- Deal close requirements (blocking)
  ('sys_deal_closeout', 'Deal Closeout Review', 'Required before closing a deal',
   'workflow', 'deal', '🔒', 'red', 2, 'high', true, true, 50,
   'Complete all required steps before closing this deal.',
   '[{"id": "contract_signed", "label": "Contract signed (if won)", "required": false},
     {"id": "loss_reason", "label": "Loss reason documented (if lost)", "required": false},
     {"id": "handoff_complete", "label": "Handoff to operations complete", "required": false}]'::jsonb,
   true, '["closed_lost", "closed_won", "cancelled"]'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_blocking = EXCLUDED.is_blocking,
  blocking_statuses = EXCLUDED.blocking_statuses,
  instructions = EXCLUDED.instructions,
  checklist = EXCLUDED.checklist,
  updated_at = now();

-- Verify the changes
SELECT 'activities columns' as table_name,
       column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'activities'
  AND column_name IN ('is_blocking', 'blocking_statuses', 'escalated_to_user_id', 'original_assigned_to')
UNION ALL
SELECT 'activity_patterns columns' as table_name,
       column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'activity_patterns'
  AND column_name IN ('is_blocking', 'blocking_statuses');

-- Show seeded patterns
SELECT code, name, is_blocking, blocking_statuses::text
FROM activity_patterns
WHERE code LIKE 'sys_%'
ORDER BY entity_type, code;
