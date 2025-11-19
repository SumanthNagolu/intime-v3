-- Migration: Create Project Timeline Tables
-- Description: Comprehensive logging system for Claude Code interactions
-- Created: 2025-11-17
-- Author: InTime v3 Team

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- TABLE: project_timeline
-- Purpose: Main timeline entries for all sessions and interactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_timeline (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(50) NOT NULL,
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Session metadata
  agent_type VARCHAR(50),
  agent_model VARCHAR(100),
  duration VARCHAR(50),

  -- Content
  conversation_summary TEXT NOT NULL,
  user_intent TEXT,

  -- Actions and results (structured data)
  actions_taken JSONB DEFAULT '{
    "completed": [],
    "inProgress": [],
    "blocked": []
  }'::jsonb,

  files_changed JSONB DEFAULT '{
    "created": [],
    "modified": [],
    "deleted": []
  }'::jsonb,

  -- Decisions and context
  decisions JSONB DEFAULT '[]'::jsonb,
  assumptions JSONB DEFAULT '[]'::jsonb,

  -- Results and outcomes
  results JSONB DEFAULT '{
    "status": "success",
    "summary": "",
    "metrics": {},
    "artifacts": []
  }'::jsonb,

  -- Future planning
  future_notes JSONB DEFAULT '[]'::jsonb,

  -- Linking and categorization
  related_commits TEXT[],
  related_prs TEXT[],
  related_docs TEXT[],
  tags TEXT[],

  -- AI-generated insights
  ai_generated_summary TEXT,
  key_learnings TEXT[],

  -- Full-text search
  search_vector TSVECTOR,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- TABLE: session_metadata
-- Purpose: Track individual sessions for quick lookups
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_metadata (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(50) NOT NULL UNIQUE,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration VARCHAR(50),

  -- Context
  branch VARCHAR(100),
  commit_hash VARCHAR(40),
  environment VARCHAR(20),

  -- Stats
  files_modified INTEGER DEFAULT 0,
  lines_added INTEGER DEFAULT 0,
  lines_removed INTEGER DEFAULT 0,
  commands_executed INTEGER DEFAULT 0,

  -- Summary
  overall_goal TEXT,
  successfully_completed BOOLEAN DEFAULT FALSE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Timeline indexes
CREATE INDEX idx_timeline_session_id ON project_timeline(session_id);
CREATE INDEX idx_timeline_session_date ON project_timeline(session_date DESC);
CREATE INDEX idx_timeline_agent_type ON project_timeline(agent_type);
CREATE INDEX idx_timeline_tags ON project_timeline USING GIN(tags);
CREATE INDEX idx_timeline_search ON project_timeline USING GIN(search_vector);
CREATE INDEX idx_timeline_created_at ON project_timeline(created_at DESC);
CREATE INDEX idx_timeline_not_archived ON project_timeline(is_archived) WHERE is_archived = FALSE;

-- Session metadata indexes
CREATE INDEX idx_session_started_at ON session_metadata(started_at DESC);
CREATE INDEX idx_session_branch ON session_metadata(branch);
CREATE INDEX idx_session_environment ON session_metadata(environment);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update the search_vector column
CREATE OR REPLACE FUNCTION update_timeline_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.conversation_summary, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.user_intent, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.ai_generated_summary, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, ARRAY[]::TEXT[]), ' ')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update search_vector on insert/update
CREATE TRIGGER trigger_update_timeline_search
  BEFORE INSERT OR UPDATE ON project_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_timeline_search_vector();

-- Auto-update updated_at on timeline
CREATE TRIGGER trigger_timeline_updated_at
  BEFORE UPDATE ON project_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on session_metadata
CREATE TRIGGER trigger_session_updated_at
  BEFORE UPDATE ON session_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Note: Adjust these policies based on your authentication setup
-- ============================================================================

-- Enable RLS
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
-- TODO: Adjust based on your auth setup (Supabase Auth, custom auth, etc.)
CREATE POLICY "Allow all for authenticated users" ON project_timeline
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON session_metadata
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Recent timeline entries with session metadata
CREATE OR REPLACE VIEW v_timeline_recent AS
SELECT
  pt.*,
  sm.started_at as session_started_at,
  sm.ended_at as session_ended_at,
  sm.branch as session_branch,
  sm.successfully_completed
FROM project_timeline pt
LEFT JOIN session_metadata sm ON pt.session_id = sm.session_id
WHERE pt.is_archived = FALSE
  AND pt.deleted_at IS NULL
ORDER BY pt.session_date DESC
LIMIT 100;

-- View: Timeline statistics by tag
CREATE OR REPLACE VIEW v_timeline_stats_by_tag AS
SELECT
  unnest(tags) as tag,
  COUNT(*) as entry_count,
  COUNT(DISTINCT session_id) as session_count,
  MIN(session_date) as first_occurrence,
  MAX(session_date) as last_occurrence
FROM project_timeline
WHERE is_archived = FALSE
  AND deleted_at IS NULL
GROUP BY tag
ORDER BY entry_count DESC;

-- View: Session summary
CREATE OR REPLACE VIEW v_session_summary AS
SELECT
  sm.*,
  COUNT(pt.id) as timeline_entries,
  array_agg(DISTINCT unnest(pt.tags)) FILTER (WHERE pt.tags IS NOT NULL) as all_tags
FROM session_metadata sm
LEFT JOIN project_timeline pt ON sm.session_id = pt.session_id
GROUP BY sm.id
ORDER BY sm.started_at DESC;

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample session
INSERT INTO session_metadata (
  session_id,
  started_at,
  ended_at,
  duration,
  branch,
  environment,
  overall_goal,
  successfully_completed
) VALUES (
  'sample-session-001',
  NOW() - INTERVAL '1 hour',
  NOW(),
  '60 minutes',
  'main',
  'development',
  'Set up project timeline logging system',
  TRUE
);

-- Insert sample timeline entry
INSERT INTO project_timeline (
  session_id,
  session_date,
  agent_type,
  agent_model,
  duration,
  conversation_summary,
  user_intent,
  actions_taken,
  files_changed,
  decisions,
  results,
  tags
) VALUES (
  'sample-session-001',
  NOW(),
  'claude',
  'claude-sonnet-4-5',
  '60 minutes',
  'Created comprehensive project timeline system with database schema, migrations, and helper functions.',
  'Implement a powerful logging system to track all Claude Code interactions',
  '{"completed": ["Database schema created", "SQL migration written", "TypeScript types defined"]}'::jsonb,
  '{"created": ["src/lib/db/schema/timeline.ts", "src/lib/db/migrations/001_create_timeline_tables.sql"], "modified": [], "deleted": []}'::jsonb,
  '[{"decision": "Use JSONB for structured data", "reasoning": "Provides queryability while maintaining flexibility"}]'::jsonb,
  '{"status": "success", "summary": "Timeline system successfully implemented", "metrics": {"files_created": 2, "lines_added": 400}}'::jsonb,
  ARRAY['database', 'logging', 'architecture', 'setup']
);

-- ============================================================================
-- GRANTS (adjust based on your user setup)
-- ============================================================================

-- Grant permissions to authenticated users
-- GRANT ALL ON project_timeline TO authenticated;
-- GRANT ALL ON session_metadata TO authenticated;
-- GRANT SELECT ON v_timeline_recent TO authenticated;
-- GRANT SELECT ON v_timeline_stats_by_tag TO authenticated;
-- GRANT SELECT ON v_session_summary TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created: project_timeline, session_metadata';
  RAISE NOTICE 'Views created: v_timeline_recent, v_timeline_stats_by_tag, v_session_summary';
  RAISE NOTICE 'Sample data inserted for testing';
END $$;
