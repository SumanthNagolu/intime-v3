-- =============================================================================
-- Scrum/PM System Database Schema
-- Adds sprint management, backlog, board, and retrospective capabilities
-- =============================================================================

-- =============================================================================
-- SPRINTS TABLE
-- Core sprint entity for tracking sprint lifecycle
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  pod_id UUID NOT NULL REFERENCES pods(id),

  -- Sprint Identity
  sprint_number INTEGER NOT NULL,
  name TEXT NOT NULL,

  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Goals
  goal TEXT,
  goal_achieved BOOLEAN,

  -- Status: planning -> active -> review -> completed | cancelled
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'review', 'completed', 'cancelled')),

  -- Metrics (denormalized for performance)
  planned_points INTEGER DEFAULT 0,
  completed_points INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,

  -- Ceremonies
  planning_completed_at TIMESTAMPTZ,
  review_completed_at TIMESTAMPTZ,
  retro_completed_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT sprints_dates_check CHECK (end_date >= start_date),
  CONSTRAINT sprints_number_unique UNIQUE (pod_id, sprint_number)
);

-- Indexes for sprints
CREATE INDEX IF NOT EXISTS sprints_org_id_idx ON sprints(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprints_pod_id_idx ON sprints(pod_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprints_status_idx ON sprints(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprints_active_idx ON sprints(pod_id, status) WHERE status = 'active' AND deleted_at IS NULL;

-- =============================================================================
-- SPRINT ITEMS TABLE
-- Stories, tasks, bugs, spikes - the work items on the board
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  pod_id UUID NOT NULL REFERENCES pods(id),
  sprint_id UUID REFERENCES sprints(id),  -- NULL = in backlog

  -- Item Identity
  item_number TEXT NOT NULL,  -- e.g., "TEAM-123"
  title TEXT NOT NULL,
  description TEXT,

  -- Type & Status
  item_type TEXT NOT NULL DEFAULT 'story' CHECK (item_type IN ('epic', 'story', 'task', 'bug', 'spike')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),

  -- Priority & Estimation
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  story_points INTEGER,

  -- Assignment
  assignee_id UUID REFERENCES user_profiles(id),
  reporter_id UUID REFERENCES user_profiles(id),

  -- Hierarchy
  parent_id UUID REFERENCES sprint_items(id),  -- For subtasks
  epic_id UUID REFERENCES sprint_items(id),    -- Link to epic

  -- Linked Entities (recruiting integration)
  linked_entity_type TEXT CHECK (linked_entity_type IN ('job', 'submission', 'candidate', 'activity', 'account')),
  linked_entity_id UUID,

  -- Board Position
  board_column TEXT NOT NULL DEFAULT 'todo',
  board_order INTEGER NOT NULL DEFAULT 0,

  -- Backlog Position (when not in sprint)
  backlog_order INTEGER,

  -- Labels/Tags
  labels TEXT[] DEFAULT '{}',

  -- Time Tracking
  time_estimate_hours NUMERIC,
  time_spent_hours NUMERIC DEFAULT 0,

  -- Dates
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for sprint_items
CREATE INDEX IF NOT EXISTS sprint_items_org_id_idx ON sprint_items(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprint_items_pod_id_idx ON sprint_items(pod_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprint_items_sprint_id_idx ON sprint_items(sprint_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprint_items_assignee_idx ON sprint_items(assignee_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprint_items_backlog_idx ON sprint_items(org_id, pod_id, backlog_order)
  WHERE sprint_id IS NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprint_items_linked_idx ON sprint_items(linked_entity_type, linked_entity_id)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprint_items_epic_idx ON sprint_items(epic_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sprint_items_board_idx ON sprint_items(sprint_id, board_column, board_order)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- BOARD COLUMNS TABLE
-- Customizable Kanban columns per team
-- =============================================================================
CREATE TABLE IF NOT EXISTS board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  pod_id UUID NOT NULL REFERENCES pods(id),

  -- Column Definition
  column_key TEXT NOT NULL,  -- 'todo' | 'in_progress' | 'review' | 'done' | custom
  name TEXT NOT NULL,
  description TEXT,

  -- Display
  color TEXT DEFAULT 'gray',  -- Tailwind color name
  icon TEXT,  -- Lucide icon name
  position INTEGER NOT NULL DEFAULT 0,

  -- WIP Limit
  wip_limit INTEGER,  -- NULL = no limit

  -- Status Mapping
  maps_to_status TEXT NOT NULL CHECK (maps_to_status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),

  -- Behavior
  is_done_column BOOLEAN DEFAULT FALSE,  -- Items here count as completed
  is_initial_column BOOLEAN DEFAULT FALSE,  -- New items go here

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT board_columns_unique UNIQUE (pod_id, column_key)
);

-- Index for board_columns
CREATE INDEX IF NOT EXISTS board_columns_pod_idx ON board_columns(pod_id, position);

-- =============================================================================
-- SPRINT RETROSPECTIVES TABLE
-- Stores retro content: went well, to improve, action items
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  sprint_id UUID NOT NULL REFERENCES sprints(id) UNIQUE,

  -- Retro Content (arrays of items stored as JSONB)
  -- Each item: {id, text, authorId, authorName, votes, votedBy[], createdAt}
  went_well JSONB DEFAULT '[]',
  to_improve JSONB DEFAULT '[]',

  -- Action Items
  -- Each item: {id, text, assigneeId, assigneeName, completed, completedAt, dueDate, createdAt}
  action_items JSONB DEFAULT '[]',

  -- Participation
  participants UUID[] DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sprint_retrospectives
CREATE INDEX IF NOT EXISTS sprint_retrospectives_sprint_idx ON sprint_retrospectives(sprint_id);
CREATE INDEX IF NOT EXISTS sprint_retrospectives_org_idx ON sprint_retrospectives(org_id);

-- =============================================================================
-- SPRINT BURNDOWN TABLE
-- Daily snapshots for burndown chart
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_burndown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  sprint_id UUID NOT NULL REFERENCES sprints(id),

  -- Daily Snapshot
  snapshot_date DATE NOT NULL,

  -- Points
  remaining_points INTEGER NOT NULL,
  completed_points INTEGER NOT NULL,
  added_points INTEGER DEFAULT 0,  -- Scope creep tracking

  -- Items
  remaining_items INTEGER NOT NULL,
  completed_items INTEGER NOT NULL,

  -- Calculated ideal burndown (for reference line)
  ideal_remaining_points NUMERIC,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT sprint_burndown_unique UNIQUE (sprint_id, snapshot_date)
);

-- Indexes for sprint_burndown
CREATE INDEX IF NOT EXISTS sprint_burndown_sprint_idx ON sprint_burndown(sprint_id, snapshot_date);

-- =============================================================================
-- SPRINT ITEM COMMENTS TABLE
-- Comments on sprint items (discussion thread)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  item_id UUID NOT NULL REFERENCES sprint_items(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,

  -- Author
  author_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Index for sprint_item_comments
CREATE INDEX IF NOT EXISTS sprint_item_comments_item_idx ON sprint_item_comments(item_id, created_at);

-- =============================================================================
-- SPRINT ITEM HISTORY TABLE
-- Tracks changes to sprint items (for activity feed)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  item_id UUID NOT NULL REFERENCES sprint_items(id) ON DELETE CASCADE,

  -- Change Details
  field_name TEXT NOT NULL,  -- 'status', 'assignee', 'sprint', 'story_points', etc.
  old_value TEXT,
  new_value TEXT,

  -- Actor
  changed_by UUID NOT NULL REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sprint_item_history
CREATE INDEX IF NOT EXISTS sprint_item_history_item_idx ON sprint_item_history(item_id, changed_at DESC);

-- =============================================================================
-- ITEM NUMBER SEQUENCE
-- Auto-generate item numbers like TEAM-123
-- =============================================================================
CREATE SEQUENCE IF NOT EXISTS sprint_item_number_seq START WITH 1;

-- Function to generate item number
CREATE OR REPLACE FUNCTION generate_sprint_item_number()
RETURNS TRIGGER AS $$
DECLARE
  pod_prefix TEXT;
BEGIN
  -- Get pod name prefix (first 4 chars, uppercase)
  SELECT UPPER(SUBSTRING(name, 1, 4))
  INTO pod_prefix
  FROM pods
  WHERE id = NEW.pod_id;

  -- Generate item number
  NEW.item_number := COALESCE(pod_prefix, 'ITEM') || '-' || nextval('sprint_item_number_seq');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate item numbers
DROP TRIGGER IF EXISTS sprint_items_number_trigger ON sprint_items;
CREATE TRIGGER sprint_items_number_trigger
BEFORE INSERT ON sprint_items
FOR EACH ROW
WHEN (NEW.item_number IS NULL OR NEW.item_number = '')
EXECUTE FUNCTION generate_sprint_item_number();

-- =============================================================================
-- SPRINT METRICS UPDATE FUNCTION
-- Updates sprint metrics when items change
-- =============================================================================
CREATE OR REPLACE FUNCTION update_sprint_metrics()
RETURNS TRIGGER AS $$
DECLARE
  sprint_record RECORD;
BEGIN
  -- Get the sprint to update (handle both old and new sprint_id for moves)
  FOR sprint_record IN
    SELECT DISTINCT sprint_id FROM (
      SELECT NEW.sprint_id AS sprint_id WHERE NEW.sprint_id IS NOT NULL
      UNION ALL
      SELECT OLD.sprint_id AS sprint_id WHERE TG_OP != 'INSERT' AND OLD.sprint_id IS NOT NULL
    ) sub WHERE sprint_id IS NOT NULL
  LOOP
    UPDATE sprints
    SET
      total_items = (
        SELECT COUNT(*) FROM sprint_items
        WHERE sprint_id = sprint_record.sprint_id AND deleted_at IS NULL
      ),
      completed_items = (
        SELECT COUNT(*) FROM sprint_items
        WHERE sprint_id = sprint_record.sprint_id AND status = 'done' AND deleted_at IS NULL
      ),
      planned_points = (
        SELECT COALESCE(SUM(story_points), 0) FROM sprint_items
        WHERE sprint_id = sprint_record.sprint_id AND deleted_at IS NULL
      ),
      completed_points = (
        SELECT COALESCE(SUM(story_points), 0) FROM sprint_items
        WHERE sprint_id = sprint_record.sprint_id AND status = 'done' AND deleted_at IS NULL
      ),
      updated_at = NOW()
    WHERE id = sprint_record.sprint_id;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update sprint metrics
DROP TRIGGER IF EXISTS sprint_items_metrics_trigger ON sprint_items;
CREATE TRIGGER sprint_items_metrics_trigger
AFTER INSERT OR UPDATE OR DELETE ON sprint_items
FOR EACH ROW
EXECUTE FUNCTION update_sprint_metrics();

-- =============================================================================
-- DEFAULT BOARD COLUMNS FUNCTION
-- Creates default columns when a new pod is created (or on demand)
-- =============================================================================
CREATE OR REPLACE FUNCTION create_default_board_columns(p_org_id UUID, p_pod_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only create if no columns exist
  IF NOT EXISTS (SELECT 1 FROM board_columns WHERE pod_id = p_pod_id) THEN
    INSERT INTO board_columns (org_id, pod_id, column_key, name, color, position, maps_to_status, is_initial_column, is_done_column)
    VALUES
      (p_org_id, p_pod_id, 'todo', 'To Do', 'gray', 0, 'todo', TRUE, FALSE),
      (p_org_id, p_pod_id, 'in_progress', 'In Progress', 'blue', 1, 'in_progress', FALSE, FALSE),
      (p_org_id, p_pod_id, 'review', 'Review', 'amber', 2, 'review', FALSE, FALSE),
      (p_org_id, p_pod_id, 'done', 'Done', 'green', 3, 'done', FALSE, TRUE);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_retrospectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_burndown ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_item_history ENABLE ROW LEVEL SECURITY;

-- Sprints policies
CREATE POLICY sprints_org_isolation ON sprints
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Sprint items policies
CREATE POLICY sprint_items_org_isolation ON sprint_items
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Board columns policies
CREATE POLICY board_columns_org_isolation ON board_columns
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Sprint retrospectives policies
CREATE POLICY sprint_retrospectives_org_isolation ON sprint_retrospectives
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Sprint burndown policies
CREATE POLICY sprint_burndown_org_isolation ON sprint_burndown
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Sprint item comments policies
CREATE POLICY sprint_item_comments_org_isolation ON sprint_item_comments
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Sprint item history policies
CREATE POLICY sprint_item_history_org_isolation ON sprint_item_history
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- =============================================================================
-- GRANTS FOR SERVICE ROLE
-- =============================================================================
GRANT ALL ON sprints TO service_role;
GRANT ALL ON sprint_items TO service_role;
GRANT ALL ON board_columns TO service_role;
GRANT ALL ON sprint_retrospectives TO service_role;
GRANT ALL ON sprint_burndown TO service_role;
GRANT ALL ON sprint_item_comments TO service_role;
GRANT ALL ON sprint_item_history TO service_role;
GRANT USAGE, SELECT ON SEQUENCE sprint_item_number_seq TO service_role;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE sprints IS 'Sprint entity for Scrum/PM system - tracks sprint lifecycle';
COMMENT ON TABLE sprint_items IS 'Work items (stories, tasks, bugs) for sprint board and backlog';
COMMENT ON TABLE board_columns IS 'Customizable Kanban board columns per team';
COMMENT ON TABLE sprint_retrospectives IS 'Sprint retrospective data - went well, to improve, action items';
COMMENT ON TABLE sprint_burndown IS 'Daily snapshots for burndown chart visualization';
COMMENT ON TABLE sprint_item_comments IS 'Discussion comments on sprint items';
COMMENT ON TABLE sprint_item_history IS 'Change history tracking for sprint items';
