/**
 * AI Twin Communication Layer - Database Schema
 *
 * Epic: AI Twin Living Organism
 * Phase 2: Communication Infrastructure
 *
 * Enables inter-twin communication through:
 * - Event Bus (async communication)
 * - Twin Conversations (sync communication audit trail)
 * - Organization Context Cache (shared knowledge)
 * - Daily Standups (aggregated reports)
 */

-- ============================================================================
-- STEP 1: Update existing twin_role constraint to include new roles
-- ============================================================================

-- First, drop the existing constraint
ALTER TABLE employee_twin_interactions
  DROP CONSTRAINT IF EXISTS employee_twin_interactions_twin_role_check;

-- Add updated constraint with all roles
ALTER TABLE employee_twin_interactions
  ADD CONSTRAINT employee_twin_interactions_twin_role_check
  CHECK (twin_role IN (
    'ceo',
    'admin',
    'recruiter',
    'bench_sales',
    'talent_acquisition',
    'hr',
    'immigration',
    'trainer'
  ));

-- ============================================================================
-- STEP 2: Twin Events Table (Async Communication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS twin_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  -- Source information
  source_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  source_role TEXT NOT NULL CHECK (source_role IN (
    'ceo', 'admin', 'recruiter', 'bench_sales',
    'talent_acquisition', 'hr', 'immigration', 'trainer'
  )),

  -- Target (NULL = broadcast to all)
  target_role TEXT CHECK (target_role IS NULL OR target_role IN (
    'ceo', 'admin', 'recruiter', 'bench_sales',
    'talent_acquisition', 'hr', 'immigration', 'trainer'
  )),

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'placement_complete',      -- Recruiter → Bench Sales
    'bench_ending',            -- Bench Sales → TA
    'training_graduate',       -- Trainer → Recruiter
    'deal_closed',             -- TA → Recruiting
    'escalation',              -- Any → CEO
    'approval_needed',         -- Any → Approver
    'milestone_reached',       -- Broadcast
    'cross_sell_opportunity',  -- Any → TA
    'custom'                   -- Generic custom events
  )),

  -- Payload and priority
  payload JSONB NOT NULL DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Processing status
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes for event queries
CREATE INDEX idx_twin_events_org_role ON twin_events(org_id, target_role, processed);
CREATE INDEX idx_twin_events_source ON twin_events(source_user_id, created_at DESC);
CREATE INDEX idx_twin_events_unprocessed ON twin_events(org_id, processed, priority DESC, created_at)
  WHERE processed = FALSE;
CREATE INDEX idx_twin_events_type ON twin_events(event_type, created_at DESC);

-- ============================================================================
-- STEP 3: Twin Conversations Table (Direct Query Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS twin_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  -- Participants
  initiator_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  initiator_role TEXT NOT NULL CHECK (initiator_role IN (
    'ceo', 'admin', 'recruiter', 'bench_sales',
    'talent_acquisition', 'hr', 'immigration', 'trainer',
    'organization' -- For OrganizationTwin
  )),
  responder_role TEXT NOT NULL CHECK (responder_role IN (
    'ceo', 'admin', 'recruiter', 'bench_sales',
    'talent_acquisition', 'hr', 'immigration', 'trainer',
    'organization'
  )),

  -- Conversation content
  question TEXT NOT NULL,
  response TEXT,

  -- Cost tracking
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6),
  latency_ms INTEGER,
  model_used TEXT DEFAULT 'gpt-4o-mini',

  -- Context
  context JSONB DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for conversation queries
CREATE INDEX idx_twin_conversations_org ON twin_conversations(org_id, created_at DESC);
CREATE INDEX idx_twin_conversations_initiator ON twin_conversations(initiator_role, created_at DESC);
CREATE INDEX idx_twin_conversations_responder ON twin_conversations(responder_role, created_at DESC);

-- ============================================================================
-- STEP 4: Organization Context Cache (Shared Knowledge)
-- ============================================================================

CREATE TABLE IF NOT EXISTS org_context_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  -- Context type
  context_type TEXT NOT NULL CHECK (context_type IN (
    'priorities',           -- Org-wide priorities
    'metrics',              -- Aggregate metrics
    'pillar_health',        -- Health status per pillar
    'cross_pollination',    -- Cross-pillar opportunities
    'announcements',        -- Org-wide announcements
    'goals'                 -- Quarterly/monthly goals
  )),

  -- Cached data
  data JSONB NOT NULL,

  -- Cache management
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  refresh_triggered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, context_type)
);

-- Index for cache lookups
CREATE INDEX idx_org_context_cache_lookup ON org_context_cache(org_id, context_type, expires_at);

-- ============================================================================
-- STEP 5: Organization Standups Table (Daily Reports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS org_standups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  -- Generation info
  standup_date DATE NOT NULL DEFAULT CURRENT_DATE,
  generated_by TEXT NOT NULL DEFAULT 'organization_twin',

  -- Full report
  report JSONB NOT NULL,

  -- Per-pillar summaries
  pillar_summaries JSONB DEFAULT '{}',

  -- Cross-pillar insights
  cross_pollination_insights JSONB DEFAULT '[]',

  -- Escalations and blockers
  escalations JSONB DEFAULT '[]',
  blockers JSONB DEFAULT '[]',

  -- Health metrics
  organism_health_score NUMERIC(5, 2),

  -- Cost tracking
  tokens_used INTEGER,
  cost_usd NUMERIC(10, 6),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, standup_date)
);

-- Index for standup queries
CREATE INDEX idx_org_standups_date ON org_standups(org_id, standup_date DESC);

-- ============================================================================
-- STEP 6: Enable RLS and Create Policies
-- ============================================================================

ALTER TABLE twin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_context_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_standups ENABLE ROW LEVEL SECURITY;

-- Twin Events: Users can see events targeted to their role or broadcasts
CREATE POLICY twin_events_org_access ON twin_events
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Twin Conversations: Org-level access for audit trail
CREATE POLICY twin_conversations_org_access ON twin_conversations
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Org Context Cache: Org members can read, admins can write
CREATE POLICY org_context_cache_read ON org_context_cache
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY org_context_cache_write ON org_context_cache
  FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM user_profiles
      WHERE id = auth.uid()
      AND employee_role IN ('ceo', 'admin', 'super_admin')
    )
  );

CREATE POLICY org_context_cache_update ON org_context_cache
  FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM user_profiles
      WHERE id = auth.uid()
      AND employee_role IN ('ceo', 'admin', 'super_admin')
    )
  );

-- Org Standups: Org-level access
CREATE POLICY org_standups_org_access ON org_standups
  FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 7: Helper Functions
-- ============================================================================

-- Function: Emit a twin event
CREATE OR REPLACE FUNCTION emit_twin_event(
  p_org_id UUID,
  p_source_user_id UUID,
  p_source_role TEXT,
  p_target_role TEXT,
  p_event_type TEXT,
  p_payload JSONB DEFAULT '{}',
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO twin_events (
    org_id, source_user_id, source_role, target_role,
    event_type, payload, priority
  ) VALUES (
    p_org_id, p_source_user_id, p_source_role, p_target_role,
    p_event_type, p_payload, p_priority
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- Function: Get unprocessed events for a role
CREATE OR REPLACE FUNCTION get_twin_events_for_role(
  p_org_id UUID,
  p_role TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  source_role TEXT,
  event_type TEXT,
  payload JSONB,
  priority TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    te.id,
    te.source_role,
    te.event_type,
    te.payload,
    te.priority,
    te.created_at
  FROM twin_events te
  WHERE te.org_id = p_org_id
    AND te.processed = FALSE
    AND (te.target_role = p_role OR te.target_role IS NULL)
    AND (te.expires_at IS NULL OR te.expires_at > NOW())
  ORDER BY
    CASE te.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    te.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function: Mark event as processed
CREATE OR REPLACE FUNCTION mark_twin_event_processed(
  p_event_id UUID,
  p_processed_by UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE twin_events
  SET
    processed = TRUE,
    processed_at = NOW(),
    processed_by = COALESCE(p_processed_by, auth.uid())
  WHERE id = p_event_id;

  RETURN FOUND;
END;
$$;

-- Function: Get or refresh context cache
CREATE OR REPLACE FUNCTION get_org_context(
  p_org_id UUID,
  p_context_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_data JSONB;
  v_expires TIMESTAMPTZ;
BEGIN
  SELECT data, expires_at INTO v_data, v_expires
  FROM org_context_cache
  WHERE org_id = p_org_id AND context_type = p_context_type;

  IF NOT FOUND OR v_expires < NOW() THEN
    -- Return NULL to indicate cache miss (caller should refresh)
    RETURN NULL;
  END IF;

  RETURN v_data;
END;
$$;

-- Function: Update context cache
CREATE OR REPLACE FUNCTION set_org_context(
  p_org_id UUID,
  p_context_type TEXT,
  p_data JSONB,
  p_ttl_hours INTEGER DEFAULT 24
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO org_context_cache (org_id, context_type, data, expires_at, updated_at)
  VALUES (
    p_org_id,
    p_context_type,
    p_data,
    NOW() + (p_ttl_hours || ' hours')::INTERVAL,
    NOW()
  )
  ON CONFLICT (org_id, context_type) DO UPDATE SET
    data = EXCLUDED.data,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- Function: Get today's standup
CREATE OR REPLACE FUNCTION get_today_standup(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_standup JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'date', standup_date,
    'report', report,
    'pillar_summaries', pillar_summaries,
    'cross_pollination_insights', cross_pollination_insights,
    'escalations', escalations,
    'organism_health_score', organism_health_score,
    'created_at', created_at
  ) INTO v_standup
  FROM org_standups
  WHERE org_id = p_org_id AND standup_date = CURRENT_DATE;

  RETURN v_standup;
END;
$$;

-- Function: Cleanup expired events
CREATE OR REPLACE FUNCTION cleanup_expired_twin_events()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM twin_events
  WHERE expires_at < NOW()
  RETURNING * INTO v_count;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================================
-- STEP 8: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION emit_twin_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_twin_events_for_role TO authenticated;
GRANT EXECUTE ON FUNCTION mark_twin_event_processed TO authenticated;
GRANT EXECUTE ON FUNCTION get_org_context TO authenticated;
GRANT EXECUTE ON FUNCTION set_org_context TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_standup TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_twin_events TO authenticated;

-- ============================================================================
-- STEP 9: Comments
-- ============================================================================

COMMENT ON TABLE twin_events IS 'Async event bus for inter-twin communication';
COMMENT ON TABLE twin_conversations IS 'Audit trail for direct twin-to-twin queries';
COMMENT ON TABLE org_context_cache IS 'Cached shared organizational context';
COMMENT ON TABLE org_standups IS 'Daily standup reports generated by OrganizationTwin';

COMMENT ON FUNCTION emit_twin_event IS 'Create a new event in the twin event bus';
COMMENT ON FUNCTION get_twin_events_for_role IS 'Get unprocessed events for a specific role';
COMMENT ON FUNCTION mark_twin_event_processed IS 'Mark an event as processed';
COMMENT ON FUNCTION get_org_context IS 'Get cached org context (returns NULL if expired)';
COMMENT ON FUNCTION set_org_context IS 'Update org context cache with TTL';
COMMENT ON FUNCTION get_today_standup IS 'Get todays standup report if exists';
COMMENT ON FUNCTION cleanup_expired_twin_events IS 'Remove expired events from event bus';
