-- ============================================================================
-- Migration: Activity Patterns Enhancement
-- Date: 2025-12-06
-- Description: Adds columns for UI customization, outcomes, points, and automation
--              to support the Activity Pattern Configuration feature (UC-ADMIN-013)
-- ============================================================================

-- Add UI/Display columns to activity_patterns
ALTER TABLE activity_patterns
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📋',
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS show_in_timeline BOOLEAN DEFAULT true;

-- Add outcomes configuration
ALTER TABLE activity_patterns
ADD COLUMN IF NOT EXISTS outcomes JSONB DEFAULT '[]';
-- Format: [{ label: string, value: string, color: string, nextAction: string }]

-- Add points/gamification columns
ALTER TABLE activity_patterns
ADD COLUMN IF NOT EXISTS points DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS point_multipliers JSONB DEFAULT '[]';
-- Format: [{ condition: { field: string, operator: string, value: any }, type: 'multiply'|'add', value: number }]

-- Add automation configuration
ALTER TABLE activity_patterns
ADD COLUMN IF NOT EXISTS auto_log_integrations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS followup_rules JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS field_dependencies JSONB DEFAULT '[]';
-- followup_rules format: [{ outcome: string, delayHours: number, taskTitle: string, assignTo: string }]
-- field_dependencies format: [{ whenField: string, equals: any, thenRequire: string[] }]

-- Add created_by column if not exists
ALTER TABLE activity_patterns
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);

-- Add options column to pattern_fields for select/multiselect types
ALTER TABLE pattern_fields
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]';
-- Format: [{ label: string, value: string }]

-- Create index for display ordering
CREATE INDEX IF NOT EXISTS idx_activity_patterns_display
ON activity_patterns(org_id, category, display_order);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_activity_patterns_category
ON activity_patterns(org_id, category, is_active);

-- Add points_earned to activities table if not exists
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS points_earned DECIMAL(5,2) DEFAULT 0;

-- Create activity stats table for aggregations
CREATE TABLE IF NOT EXISTS activity_stats_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  pattern_id UUID REFERENCES activity_patterns(id) ON DELETE SET NULL,
  count INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  total_points DECIMAL(10,2) DEFAULT 0,
  outcomes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id, date, pattern_id)
);

-- Index for stats lookups
CREATE INDEX IF NOT EXISTS idx_activity_stats_user_date
ON activity_stats_daily(user_id, date DESC);

-- Add RLS policies
ALTER TABLE activity_stats_daily ENABLE ROW LEVEL SECURITY;

-- Policy for activity_stats_daily - users can view their own stats and admins can view all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activity_stats_daily' AND policyname = 'activity_stats_daily_select_policy'
  ) THEN
    CREATE POLICY activity_stats_daily_select_policy ON activity_stats_daily
      FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles up
          JOIN system_roles sr ON up.role_id = sr.id
          WHERE up.id = auth.uid()
          AND sr.code IN ('admin', 'super_admin', 'recruiting_manager', 'bench_manager', 'ta_manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activity_stats_daily' AND policyname = 'activity_stats_daily_insert_policy'
  ) THEN
    CREATE POLICY activity_stats_daily_insert_policy ON activity_stats_daily
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activity_stats_daily' AND policyname = 'activity_stats_daily_update_policy'
  ) THEN
    CREATE POLICY activity_stats_daily_update_policy ON activity_stats_daily
      FOR UPDATE USING (true);
  END IF;
END $$;

-- Comment on new columns
COMMENT ON COLUMN activity_patterns.icon IS 'Emoji or icon identifier for UI display';
COMMENT ON COLUMN activity_patterns.color IS 'Color theme for categorization (blue, green, red, etc.)';
COMMENT ON COLUMN activity_patterns.display_order IS 'Sort order within category (lower = higher priority)';
COMMENT ON COLUMN activity_patterns.outcomes IS 'Predefined outcome options with colors and next actions';
COMMENT ON COLUMN activity_patterns.points IS 'Base points earned when activity is logged';
COMMENT ON COLUMN activity_patterns.point_multipliers IS 'Conditional point multipliers based on outcome/duration';
COMMENT ON COLUMN activity_patterns.auto_log_integrations IS 'Integration types that auto-log this activity';
COMMENT ON COLUMN activity_patterns.followup_rules IS 'Auto follow-up task creation rules';
COMMENT ON COLUMN activity_patterns.field_dependencies IS 'Conditional field requirements';
COMMENT ON COLUMN activity_patterns.show_in_timeline IS 'Whether to show this activity type in entity timelines';

COMMENT ON TABLE activity_stats_daily IS 'Aggregated daily activity statistics per user and pattern';
