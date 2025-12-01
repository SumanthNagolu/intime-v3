-- ============================================================================
-- Migration: Update Activities Schema with Missing Fields
-- 
-- Implements: docs/specs/10-DATABASE/11-activities.md
-- 
-- This migration adds fields that were identified in the gap analysis:
--   - activity_number: Human-readable identifier
--   - secondary_entity_type/id: For cross-entity activities
--   - follow_up fields: For follow-up tracking
--   - tags: For categorization
--   - custom_fields: For extensibility
-- ============================================================================

-- ============================================================================
-- ADD MISSING COLUMNS TO ACTIVITIES
-- ============================================================================

-- Human-readable activity number (ACT-2025-00001)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'activity_number'
  ) THEN
    ALTER TABLE activities ADD COLUMN activity_number TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_activities_activity_number 
      ON activities(activity_number) WHERE activity_number IS NOT NULL;
  END IF;
END $$;

-- Secondary entity reference (for cross-entity activities)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'secondary_entity_type'
  ) THEN
    ALTER TABLE activities ADD COLUMN secondary_entity_type TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'secondary_entity_id'
  ) THEN
    ALTER TABLE activities ADD COLUMN secondary_entity_id UUID;
    CREATE INDEX IF NOT EXISTS idx_activities_secondary_entity 
      ON activities(secondary_entity_type, secondary_entity_id)
      WHERE secondary_entity_type IS NOT NULL;
  END IF;
END $$;

-- Follow-up tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'follow_up_required'
  ) THEN
    ALTER TABLE activities ADD COLUMN follow_up_required BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'follow_up_date'
  ) THEN
    ALTER TABLE activities ADD COLUMN follow_up_date TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'follow_up_activity_id'
  ) THEN
    ALTER TABLE activities ADD COLUMN follow_up_activity_id UUID;
  END IF;
END $$;

-- Tags for categorization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'tags'
  ) THEN
    ALTER TABLE activities ADD COLUMN tags TEXT[] DEFAULT '{}';
    CREATE INDEX IF NOT EXISTS idx_activities_tags 
      ON activities USING GIN(tags);
  END IF;
END $$;

-- Custom fields for extensibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'custom_fields'
  ) THEN
    ALTER TABLE activities ADD COLUMN custom_fields JSONB DEFAULT '{}';
  END IF;
END $$;

-- ============================================================================
-- ACTIVITY NUMBER SEQUENCE
-- ============================================================================

-- Create sequence for activity numbers (per org)
CREATE SEQUENCE IF NOT EXISTS activity_number_seq;

-- Function to generate activity number
CREATE OR REPLACE FUNCTION generate_activity_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  IF NEW.activity_number IS NULL THEN
    v_year := to_char(NOW(), 'YYYY');
    v_seq := nextval('activity_number_seq');
    NEW.activity_number := 'ACT-' || v_year || '-' || lpad(v_seq::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating activity number
DROP TRIGGER IF EXISTS activities_generate_number ON activities;
CREATE TRIGGER activities_generate_number
  BEFORE INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION generate_activity_number();

-- ============================================================================
-- ADDITIONAL INDEXES
-- ============================================================================

-- Index for follow-up queries
CREATE INDEX IF NOT EXISTS idx_activities_follow_up 
  ON activities(follow_up_required, follow_up_date)
  WHERE follow_up_required = TRUE AND status IN ('open', 'in_progress');

-- Composite index for my tasks query
CREATE INDEX IF NOT EXISTS idx_activities_my_tasks
  ON activities(assigned_to, status, due_date)
  WHERE status IN ('open', 'in_progress');

-- Index for entity timeline
CREATE INDEX IF NOT EXISTS idx_activities_entity_timeline
  ON activities(entity_type, entity_id, created_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN activities.activity_number IS 'Human-readable activity identifier (ACT-YYYY-NNNNN)';
COMMENT ON COLUMN activities.secondary_entity_type IS 'Type of secondary related entity (for cross-entity activities)';
COMMENT ON COLUMN activities.secondary_entity_id IS 'ID of secondary related entity';
COMMENT ON COLUMN activities.follow_up_required IS 'Whether a follow-up activity is needed';
COMMENT ON COLUMN activities.follow_up_date IS 'Date by which follow-up should occur';
COMMENT ON COLUMN activities.follow_up_activity_id IS 'Reference to the created follow-up activity';
COMMENT ON COLUMN activities.tags IS 'Tags for activity categorization and filtering';
COMMENT ON COLUMN activities.custom_fields IS 'Custom fields for extensibility (JSONB)';

-- ============================================================================
-- DONE
-- ============================================================================

