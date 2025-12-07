-- Migration: Create saved_searches table for persisting candidate search criteria
-- This supports the E02 Search Candidates feature with saved search functionality

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Search metadata
  entity_type TEXT NOT NULL DEFAULT 'candidate',
  name TEXT NOT NULL,
  description TEXT,

  -- Search criteria stored as JSON
  filters JSONB NOT NULL DEFAULT '{}',

  -- Flags
  is_default BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  email_alerts BOOLEAN DEFAULT FALSE,
  alert_frequency TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'immediate'

  -- Usage tracking
  result_count INTEGER,
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Ensure unique names per user per entity type
  CONSTRAINT saved_searches_unique_name UNIQUE(org_id, user_id, name, entity_type)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_searches_org ON saved_searches(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_searches_entity ON saved_searches(entity_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_searches_default ON saved_searches(user_id, entity_type, is_default) WHERE is_default = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_searches_shared ON saved_searches(org_id, entity_type, is_shared) WHERE is_shared = TRUE AND deleted_at IS NULL;

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Policy for org access: users can access their own searches and shared searches in their org
CREATE POLICY saved_searches_select_policy ON saved_searches
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
    AND (user_id = auth.uid() OR is_shared = TRUE)
    AND deleted_at IS NULL
  );

CREATE POLICY saved_searches_insert_policy ON saved_searches
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY saved_searches_update_policy ON saved_searches
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY saved_searches_delete_policy ON saved_searches
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_searches_updated_at_trigger
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_searches_updated_at();

-- Add comment for documentation
COMMENT ON TABLE saved_searches IS 'Stores user-saved search criteria for candidates, jobs, and other entities';
COMMENT ON COLUMN saved_searches.filters IS 'JSONB containing search filters that match the searchCandidatesInput schema';
COMMENT ON COLUMN saved_searches.is_shared IS 'When true, search is visible to all users in the organization';
COMMENT ON COLUMN saved_searches.email_alerts IS 'When true, user receives notifications when new matches are found';
