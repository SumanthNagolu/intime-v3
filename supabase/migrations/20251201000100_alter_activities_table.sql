-- ============================================================================
-- Migration: Enhance Activities Table
-- Date: 2025-12-01
-- Description: Add missing columns to existing activities table for
--              workplan integration and enhanced activity tracking
-- ============================================================================

-- ============================================================================
-- ALTER ACTIVITIES TABLE - Add Workplan Integration
-- ============================================================================

-- Link to pattern/workplan
ALTER TABLE activities ADD COLUMN IF NOT EXISTS pattern_code TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS pattern_id UUID REFERENCES activity_patterns(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS workplan_instance_id UUID REFERENCES workplan_instances(id) ON DELETE SET NULL;

-- Activity details
ALTER TABLE activities ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS category TEXT;

-- Instructions/checklist
ALTER TABLE activities ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS checklist JSONB;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS checklist_progress JSONB;

-- Assignment enhancements
ALTER TABLE activities ADD COLUMN IF NOT EXISTS assigned_group UUID REFERENCES pods(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Date enhancements
ALTER TABLE activities ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Outcome enhancements
ALTER TABLE activities ADD COLUMN IF NOT EXISTS outcome_notes TEXT;

-- Automation flags
ALTER TABLE activities ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT FALSE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS auto_completed BOOLEAN DEFAULT FALSE;

-- Predecessor tracking
ALTER TABLE activities ADD COLUMN IF NOT EXISTS predecessor_activity_id UUID REFERENCES activities(id);

-- Escalation tracking
ALTER TABLE activities ADD COLUMN IF NOT EXISTS escalation_count INTEGER DEFAULT 0;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS last_escalated_at TIMESTAMPTZ;

-- Reminder tracking
ALTER TABLE activities ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- Soft delete
ALTER TABLE activities ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Audit enhancement
ALTER TABLE activities ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES user_profiles(id);

-- ============================================================================
-- UPDATE INDEXES
-- ============================================================================

-- Add new indexes for performance (IF NOT EXISTS pattern)
DO $$
BEGIN
  -- Entity index (may already exist)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'activities_entity_idx'
  ) THEN
    CREATE INDEX activities_entity_idx ON activities(entity_type, entity_id);
  END IF;

  -- Assigned to index (may already exist)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'activities_assigned_to_idx'
  ) THEN
    CREATE INDEX activities_assigned_to_idx ON activities(assigned_to);
  END IF;

  -- Status index (may already exist)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'activities_status_idx'
  ) THEN
    CREATE INDEX activities_status_idx ON activities(status);
  END IF;

  -- Due date index (may already exist)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'activities_due_date_idx'
  ) THEN
    CREATE INDEX activities_due_date_idx ON activities(due_date);
  END IF;

  -- Activity type index (may already exist)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'activities_activity_type_idx'
  ) THEN
    CREATE INDEX activities_activity_type_idx ON activities(activity_type);
  END IF;

  -- Workplan instance index (new)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'activities_workplan_instance_idx'
  ) THEN
    CREATE INDEX activities_workplan_instance_idx ON activities(workplan_instance_id);
  END IF;

  -- Pattern index (new)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'activities_pattern_idx'
  ) THEN
    CREATE INDEX activities_pattern_idx ON activities(pattern_id);
  END IF;
END $$;

-- ============================================================================
-- UPDATE COMMENTS
-- ============================================================================

COMMENT ON TABLE activities IS 'Unified table for all activities (past actions + future tasks) - Enhanced with workplan integration';

COMMENT ON COLUMN activities.pattern_code IS 'Code of the activity pattern used (denormalized for performance)';
COMMENT ON COLUMN activities.pattern_id IS 'Reference to activity pattern template';
COMMENT ON COLUMN activities.workplan_instance_id IS 'Reference to workplan instance if part of a workflow';
COMMENT ON COLUMN activities.description IS 'Extended description of the activity';
COMMENT ON COLUMN activities.category IS 'Activity category for grouping';
COMMENT ON COLUMN activities.instructions IS 'Step-by-step instructions for completing the activity';
COMMENT ON COLUMN activities.checklist IS 'Checklist items as JSONB (legacy - use activity_checklist_items)';
COMMENT ON COLUMN activities.checklist_progress IS 'Checklist completion progress';
COMMENT ON COLUMN activities.assigned_group IS 'Pod/team assigned to this activity';
COMMENT ON COLUMN activities.assigned_at IS 'When the activity was assigned';
COMMENT ON COLUMN activities.started_at IS 'When work started on this activity';
COMMENT ON COLUMN activities.scheduled_for IS 'Scheduled date/time for this activity';
COMMENT ON COLUMN activities.outcome_notes IS 'Detailed notes about the outcome';
COMMENT ON COLUMN activities.auto_created IS 'Whether this activity was auto-created by a rule';
COMMENT ON COLUMN activities.auto_completed IS 'Whether this activity was auto-completed';
COMMENT ON COLUMN activities.predecessor_activity_id IS 'Activity that must complete before this one';
COMMENT ON COLUMN activities.escalation_count IS 'Number of times this activity has been escalated';
COMMENT ON COLUMN activities.last_escalated_at IS 'When this activity was last escalated';
COMMENT ON COLUMN activities.reminder_sent_at IS 'When the last reminder was sent';
COMMENT ON COLUMN activities.reminder_count IS 'Number of reminders sent';
COMMENT ON COLUMN activities.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN activities.updated_by IS 'User who last updated this activity';

-- ============================================================================
-- COMPLETED: Activities Table Enhancement
-- ============================================================================
