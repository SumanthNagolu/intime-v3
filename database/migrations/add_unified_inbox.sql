-- =============================================================================
-- Unified Inbox Module (Phase 1: Foundation)
-- Implements the core work queue for the unified desktop platform
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE inbox_item_type AS ENUM ('task', 'follow_up', 'approval', 'alert', 'mention', 'assignment');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE inbox_item_status AS ENUM ('pending', 'in_progress', 'completed', 'dismissed', 'snoozed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE inbox_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE inbox_source_type AS ENUM ('activity', 'workflow_approval', 'sla_alert', 'mention', 'assignment', 'system', 'email', 'calendar');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- INBOX ITEMS TABLE
-- Unified work queue for all actionable items
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Item type and classification
  item_type inbox_item_type NOT NULL,

  -- Source entity reference (polymorphic)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Display content
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,

  -- Priority and urgency
  priority inbox_priority NOT NULL DEFAULT 'normal',

  -- Timing
  due_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,

  -- Status tracking
  status inbox_item_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Completion data
  completion_notes TEXT,
  outcome TEXT,

  -- Actions available (JSON array of action definitions)
  available_actions JSONB DEFAULT '[]',

  -- Metadata for extensibility
  metadata JSONB DEFAULT '{}',

  -- Context (for AI/workflow suggestions)
  context JSONB DEFAULT '{}',

  -- Audit fields (REQUIRED per InTime standards)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Primary index for user's active inbox (most common query)
CREATE INDEX IF NOT EXISTS inbox_items_user_active_idx
  ON public.inbox_items(user_id, status, priority DESC, due_at ASC)
  WHERE status IN ('pending', 'in_progress');

-- Index for snoozed items (for waking them up)
CREATE INDEX IF NOT EXISTS inbox_items_snoozed_idx
  ON public.inbox_items(snoozed_until)
  WHERE status = 'snoozed' AND snoozed_until IS NOT NULL;

-- Index for overdue items
CREATE INDEX IF NOT EXISTS inbox_items_overdue_idx
  ON public.inbox_items(user_id, due_at)
  WHERE status IN ('pending', 'in_progress') AND due_at IS NOT NULL;

-- Index for entity lookup (seeing all inbox items for an entity)
CREATE INDEX IF NOT EXISTS inbox_items_entity_idx
  ON public.inbox_items(entity_type, entity_id)
  WHERE status IN ('pending', 'in_progress');

-- Index for org-wide reporting
CREATE INDEX IF NOT EXISTS inbox_items_org_idx
  ON public.inbox_items(org_id, status, created_at DESC);

-- Index by item type for filtering
CREATE INDEX IF NOT EXISTS inbox_items_type_idx
  ON public.inbox_items(user_id, item_type, status)
  WHERE status IN ('pending', 'in_progress');

-- Comments
COMMENT ON TABLE public.inbox_items IS 'Unified inbox for all actionable work items across the platform';
COMMENT ON COLUMN public.inbox_items.entity_type IS 'Type of entity this inbox item relates to (job, candidate, account, etc.)';
COMMENT ON COLUMN public.inbox_items.entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN public.inbox_items.available_actions IS 'JSON array of actions user can take, e.g., [{id: "call", label: "Call", type: "primary"}]';
COMMENT ON COLUMN public.inbox_items.context IS 'Contextual data for AI suggestions and workflow guidance';

-- -----------------------------------------------------------------------------
-- INBOX SOURCES TABLE
-- Tracks what created each inbox item (for deduplication and linking)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inbox_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What created this
  source_type inbox_source_type NOT NULL,
  source_id UUID NOT NULL,

  -- The inbox item it created
  inbox_item_id UUID NOT NULL REFERENCES inbox_items(id) ON DELETE CASCADE,

  -- Metadata about the source
  source_metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding inbox item by source (deduplication)
CREATE UNIQUE INDEX IF NOT EXISTS inbox_sources_unique_idx
  ON public.inbox_sources(source_type, source_id, inbox_item_id);

-- Index for finding all sources of an inbox item
CREATE INDEX IF NOT EXISTS inbox_sources_item_idx
  ON public.inbox_sources(inbox_item_id);

-- Index for finding all inbox items from a source
CREATE INDEX IF NOT EXISTS inbox_sources_source_idx
  ON public.inbox_sources(source_type, source_id);

-- Comments
COMMENT ON TABLE public.inbox_sources IS 'Maps what system events created inbox items (for deduplication and tracing)';

-- -----------------------------------------------------------------------------
-- INBOX ITEM HISTORY TABLE
-- Tracks status changes and actions on inbox items
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inbox_item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_item_id UUID NOT NULL REFERENCES inbox_items(id) ON DELETE CASCADE,

  -- What changed
  action TEXT NOT NULL, -- 'created', 'started', 'completed', 'dismissed', 'snoozed', 'unsnoozed', 'priority_changed'
  from_status inbox_item_status,
  to_status inbox_item_status,

  -- Additional details
  details JSONB DEFAULT '{}',

  -- Who and when
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for item history timeline
CREATE INDEX IF NOT EXISTS inbox_item_history_item_idx
  ON public.inbox_item_history(inbox_item_id, performed_at DESC);

-- Comments
COMMENT ON TABLE public.inbox_item_history IS 'Audit trail for all actions taken on inbox items';

-- -----------------------------------------------------------------------------
-- FUNCTION: Wake up snoozed items
-- Called by a scheduled job to move snoozed items back to pending
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION wake_snoozed_inbox_items()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE inbox_items
  SET
    status = 'pending',
    snoozed_until = NULL,
    updated_at = NOW()
  WHERE
    status = 'snoozed'
    AND snoozed_until IS NOT NULL
    AND snoozed_until <= NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION wake_snoozed_inbox_items IS 'Moves snoozed inbox items back to pending when snooze expires';

-- -----------------------------------------------------------------------------
-- TRIGGER: Update timestamps
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_inbox_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inbox_items_updated_at_trigger ON inbox_items;
CREATE TRIGGER inbox_items_updated_at_trigger
  BEFORE UPDATE ON inbox_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inbox_items_updated_at();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_item_history ENABLE ROW LEVEL SECURITY;

-- Inbox items: users can only see their own items
DROP POLICY IF EXISTS inbox_items_select_policy ON inbox_items;
CREATE POLICY inbox_items_select_policy ON inbox_items
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS inbox_items_insert_policy ON inbox_items;
CREATE POLICY inbox_items_insert_policy ON inbox_items
  FOR INSERT WITH CHECK (user_id = auth.uid() OR created_by = auth.uid());

DROP POLICY IF EXISTS inbox_items_update_policy ON inbox_items;
CREATE POLICY inbox_items_update_policy ON inbox_items
  FOR UPDATE USING (user_id = auth.uid());

-- Inbox sources: follow the inbox item permissions
DROP POLICY IF EXISTS inbox_sources_select_policy ON inbox_sources;
CREATE POLICY inbox_sources_select_policy ON inbox_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inbox_items
      WHERE inbox_items.id = inbox_sources.inbox_item_id
      AND inbox_items.user_id = auth.uid()
    )
  );

-- Inbox item history: follow the inbox item permissions
DROP POLICY IF EXISTS inbox_item_history_select_policy ON inbox_item_history;
CREATE POLICY inbox_item_history_select_policy ON inbox_item_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM inbox_items
      WHERE inbox_items.id = inbox_item_history.inbox_item_id
      AND inbox_items.user_id = auth.uid()
    )
  );
