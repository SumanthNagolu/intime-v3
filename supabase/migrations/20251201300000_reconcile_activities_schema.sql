-- =====================================================
-- RECONCILIATION MIGRATION: Align activities table with spec
-- Date: 2024-12-01
-- Purpose: Add missing columns to activities table per docs/specs/10-DATABASE/11-activities.md
-- =====================================================

-- This is a CLEAN migration that brings the database to the correct state
-- All changes are idempotent (safe to run multiple times)

-- =====================================================
-- 1. ADD MISSING COLUMNS TO ACTIVITIES TABLE
-- =====================================================

-- activity_number: Human-readable identifier (e.g., ACT-2024-00001)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS activity_number TEXT UNIQUE;

-- secondary_entity_type/id: For activities linking two entities (e.g., submission links candidate + job)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS secondary_entity_type TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS secondary_entity_id UUID;

-- Follow-up tracking
ALTER TABLE activities ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT FALSE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS follow_up_activity_id UUID REFERENCES activities(id);

-- Extensibility
ALTER TABLE activities ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE activities ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- 2. ADD INDEXES FOR NEW COLUMNS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_activities_activity_number ON activities(activity_number);
CREATE INDEX IF NOT EXISTS idx_activities_secondary_entity ON activities(secondary_entity_type, secondary_entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_follow_up_date ON activities(follow_up_date) WHERE follow_up_required = TRUE;
CREATE INDEX IF NOT EXISTS idx_activities_tags ON activities USING GIN(tags);

-- =====================================================
-- 3. ADD UNIQUE CONSTRAINT FOR activity_number PER ORG
-- =====================================================

-- Drop the global unique constraint if it exists
DO $$ BEGIN
  ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_activity_number_key;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add org-scoped unique constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_activities_org_activity_number'
  ) THEN
    ALTER TABLE activities ADD CONSTRAINT uq_activities_org_activity_number 
      UNIQUE (org_id, activity_number);
  END IF;
EXCEPTION WHEN OTHERS THEN 
  RAISE NOTICE 'Could not add unique constraint: %', SQLERRM;
END $$;

-- =====================================================
-- 4. CREATE ACTIVITY NUMBER GENERATOR FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_activity_number()
RETURNS TRIGGER AS $$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_seq INTEGER;
  v_activity_number TEXT;
BEGIN
  -- Only generate if not already set
  IF NEW.activity_number IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get prefix based on activity type
  v_prefix := CASE NEW.activity_type
    WHEN 'call' THEN 'CALL'
    WHEN 'email' THEN 'EMAIL'
    WHEN 'meeting' THEN 'MTG'
    WHEN 'task' THEN 'TASK'
    WHEN 'note' THEN 'NOTE'
    WHEN 'interview' THEN 'INT'
    WHEN 'follow_up' THEN 'FU'
    ELSE 'ACT'
  END;
  
  v_year := TO_CHAR(NOW(), 'YYYY');
  
  -- Get next sequence number for this org + year
  SELECT COALESCE(MAX(
    CASE 
      WHEN activity_number ~ ('^' || v_prefix || '-' || v_year || '-[0-9]+$')
      THEN CAST(SUBSTRING(activity_number FROM '[0-9]+$') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1 INTO v_seq
  FROM activities
  WHERE org_id = NEW.org_id
    AND activity_number LIKE v_prefix || '-' || v_year || '-%';
  
  -- Generate activity number: PREFIX-YYYY-NNNNN
  v_activity_number := v_prefix || '-' || v_year || '-' || LPAD(v_seq::TEXT, 5, '0');
  
  NEW.activity_number := v_activity_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating activity numbers
DROP TRIGGER IF EXISTS trigger_generate_activity_number ON activities;
CREATE TRIGGER trigger_generate_activity_number
  BEFORE INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION generate_activity_number();

-- =====================================================
-- 5. ENSURE RLS IS ENABLED
-- =====================================================

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE/UPDATE RLS POLICIES
-- =====================================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "activities_org_isolation" ON activities;
DROP POLICY IF EXISTS "Users can view org activities" ON activities;
DROP POLICY IF EXISTS "Users can manage org activities" ON activities;

-- Org isolation policy (users can only see their org's activities)
CREATE POLICY "activities_org_isolation" ON activities
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
    )
  );

-- =====================================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN activities.activity_number IS 'Human-readable identifier (e.g., CALL-2024-00001)';
COMMENT ON COLUMN activities.secondary_entity_type IS 'Type of secondary linked entity (for multi-entity activities)';
COMMENT ON COLUMN activities.secondary_entity_id IS 'ID of secondary linked entity';
COMMENT ON COLUMN activities.follow_up_required IS 'Whether this activity requires a follow-up';
COMMENT ON COLUMN activities.follow_up_date IS 'When the follow-up should occur';
COMMENT ON COLUMN activities.follow_up_activity_id IS 'Reference to the follow-up activity if created';
COMMENT ON COLUMN activities.tags IS 'Array of tags for categorization and filtering';
COMMENT ON COLUMN activities.custom_fields IS 'JSONB for org-specific custom fields';

-- =====================================================
-- 8. VERIFY OBJECT_OWNERS RLS
-- =====================================================

ALTER TABLE object_owners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "object_owners_org_isolation" ON object_owners;
CREATE POLICY "object_owners_org_isolation" ON object_owners
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
    )
  );

-- =====================================================
-- 9. VERIFY SLA TABLES RLS
-- =====================================================

ALTER TABLE sla_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sla_definitions_org_isolation" ON sla_definitions;
CREATE POLICY "sla_definitions_org_isolation" ON sla_definitions
  FOR ALL
  USING (
    org_id IS NULL  -- Global SLAs (system-wide)
    OR org_id IN (
      SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
    )
  );

ALTER TABLE sla_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sla_instances_org_isolation" ON sla_instances;
CREATE POLICY "sla_instances_org_isolation" ON sla_instances
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
    )
  );

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'RECONCILIATION MIGRATION COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Added to activities table:';
  RAISE NOTICE '  - activity_number (auto-generated, unique per org)';
  RAISE NOTICE '  - secondary_entity_type/id (for multi-entity activities)';
  RAISE NOTICE '  - follow_up_required/date/activity_id (follow-up tracking)';
  RAISE NOTICE '  - tags (array for categorization)';
  RAISE NOTICE '  - custom_fields (JSONB for extensibility)';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - Activity number generator trigger';
  RAISE NOTICE '  - RLS policies for activities, object_owners, sla tables';
  RAISE NOTICE '  - Proper indexes for new columns';
  RAISE NOTICE '';
  RAISE NOTICE 'Database is now aligned with docs/specs/10-DATABASE/';
  RAISE NOTICE '============================================================';
END $$;

