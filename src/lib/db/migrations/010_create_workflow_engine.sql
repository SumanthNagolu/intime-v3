-- Migration 010: Workflow Engine
-- Sprint 3: Workflow Engine & Core Services
-- Created: 2025-11-19
-- Purpose: Create workflow state machine tables

-- ========================================
-- 1. WORKFLOWS TABLE (Workflow Definitions)
-- ========================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL, -- 'student', 'candidate', 'job', 'consultant', 'client'
  initial_state_id UUID, -- Will be set after workflow_states created
  version INTEGER DEFAULT 1 NOT NULL, -- For versioning workflows
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_workflow_name_per_org UNIQUE (org_id, name, version)
);

CREATE INDEX idx_workflows_org_id ON workflows(org_id);
CREATE INDEX idx_workflows_entity_type ON workflows(entity_type);
CREATE INDEX idx_workflows_active ON workflows(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE workflows IS 'Workflow definitions (templates) for business processes';
COMMENT ON COLUMN workflows.entity_type IS 'Type of entity this workflow applies to';
COMMENT ON COLUMN workflows.version IS 'Workflow version (for iteration without breaking active instances)';

-- ========================================
-- 2. WORKFLOW_STATES TABLE (States in Workflow)
-- ========================================

CREATE TABLE IF NOT EXISTS workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'application_submitted', 'assessment_scheduled', etc.
  display_name TEXT NOT NULL, -- 'Application Submitted' (user-friendly)
  description TEXT,
  state_order INTEGER NOT NULL, -- Order in workflow (1, 2, 3...)
  is_initial BOOLEAN DEFAULT FALSE NOT NULL,
  is_terminal BOOLEAN DEFAULT FALSE NOT NULL, -- End state (no transitions out)
  actions JSONB DEFAULT '[]'::jsonb NOT NULL, -- Available actions from this state
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- UI hints, colors, icons
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_state_name_per_workflow UNIQUE (workflow_id, name),
  CONSTRAINT unique_state_order_per_workflow UNIQUE (workflow_id, state_order)
);

CREATE INDEX idx_workflow_states_workflow_id ON workflow_states(workflow_id);
CREATE INDEX idx_workflow_states_terminal ON workflow_states(is_terminal) WHERE is_terminal = TRUE;

COMMENT ON TABLE workflow_states IS 'States in a workflow definition';
COMMENT ON COLUMN workflow_states.state_order IS 'Display order in UI (not necessarily execution order)';
COMMENT ON COLUMN workflow_states.actions IS 'Available actions from this state (e.g., ["approve", "reject"])';

-- ========================================
-- 3. WORKFLOW_TRANSITIONS TABLE (Valid State Changes)
-- ========================================

CREATE TABLE IF NOT EXISTS workflow_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_state_id UUID NOT NULL REFERENCES workflow_states(id) ON DELETE CASCADE,
  to_state_id UUID NOT NULL REFERENCES workflow_states(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'approve', 'reject', 'submit', 'schedule', etc.
  display_name TEXT NOT NULL, -- 'Approve Application' (user-friendly)
  required_permission TEXT, -- e.g., 'students:approve' (RBAC check)
  conditions JSONB DEFAULT '{}'::jsonb NOT NULL, -- Conditions to allow transition
  auto_transition BOOLEAN DEFAULT FALSE NOT NULL, -- Auto-transition if conditions met
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- UI hints (button color, confirmation message)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_transition_action UNIQUE (workflow_id, from_state_id, action),
  CONSTRAINT no_self_transition CHECK (from_state_id != to_state_id)
);

CREATE INDEX idx_workflow_transitions_workflow_id ON workflow_transitions(workflow_id);
CREATE INDEX idx_workflow_transitions_from_state ON workflow_transitions(from_state_id);
CREATE INDEX idx_workflow_transitions_action ON workflow_transitions(action);

COMMENT ON TABLE workflow_transitions IS 'Valid state transitions (edges in state machine)';
COMMENT ON COLUMN workflow_transitions.conditions IS 'JSON conditions that must be met for transition';
COMMENT ON COLUMN workflow_transitions.auto_transition IS 'If true, transition happens automatically when conditions met';

-- ========================================
-- 4. WORKFLOW_INSTANCES TABLE (Actual Executions)
-- ========================================

CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL, -- ID of student, candidate, job, etc.
  current_state_id UUID NOT NULL REFERENCES workflow_states(id),
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' NOT NULL, -- 'active', 'completed', 'cancelled', 'failed'
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- Instance-specific data
  version INTEGER DEFAULT 0 NOT NULL, -- Optimistic locking
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'cancelled', 'failed')),
  CONSTRAINT unique_entity_workflow UNIQUE (org_id, entity_type, entity_id, workflow_id)
);

CREATE INDEX idx_workflow_instances_org_id ON workflow_instances(org_id);
CREATE INDEX idx_workflow_instances_workflow_id ON workflow_instances(workflow_id);
CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status) WHERE status = 'active';
CREATE INDEX idx_workflow_instances_current_state ON workflow_instances(current_state_id);

COMMENT ON TABLE workflow_instances IS 'Active workflow instances (executions)';
COMMENT ON COLUMN workflow_instances.version IS 'Version for optimistic locking (prevent concurrent transitions)';
COMMENT ON COLUMN workflow_instances.metadata IS 'Runtime data (e.g., approval notes, rejections)';

-- ========================================
-- 5. WORKFLOW_HISTORY TABLE (Audit Trail)
-- ========================================

CREATE TABLE IF NOT EXISTS workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  from_state_id UUID REFERENCES workflow_states(id),
  to_state_id UUID NOT NULL REFERENCES workflow_states(id),
  action TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES user_profiles(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_workflow_history_instance_id ON workflow_history(workflow_instance_id);
CREATE INDEX idx_workflow_history_created_at ON workflow_history(created_at DESC);
CREATE INDEX idx_workflow_history_performed_by ON workflow_history(performed_by);

COMMENT ON TABLE workflow_history IS 'Immutable audit trail of workflow state changes';

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function: start_workflow()
CREATE OR REPLACE FUNCTION start_workflow(
  p_workflow_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_user_id UUID,
  p_org_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_initial_state_id UUID;
  v_instance_id UUID;
BEGIN
  -- Get initial state
  SELECT id INTO v_initial_state_id
  FROM workflow_states
  WHERE workflow_id = p_workflow_id
    AND is_initial = TRUE
  LIMIT 1;

  IF v_initial_state_id IS NULL THEN
    RAISE EXCEPTION 'Workflow % has no initial state', p_workflow_id;
  END IF;

  -- Create instance
  INSERT INTO workflow_instances (
    org_id,
    workflow_id,
    entity_type,
    entity_id,
    current_state_id,
    created_by
  ) VALUES (
    p_org_id,
    p_workflow_id,
    p_entity_type,
    p_entity_id,
    v_initial_state_id,
    p_user_id
  ) RETURNING id INTO v_instance_id;

  -- Record initial state in history
  INSERT INTO workflow_history (
    workflow_instance_id,
    from_state_id,
    to_state_id,
    action,
    performed_by,
    notes
  ) VALUES (
    v_instance_id,
    NULL,
    v_initial_state_id,
    'start',
    p_user_id,
    'Workflow started'
  );

  -- Publish event
  PERFORM publish_event(
    'workflow.started',
    p_entity_id,
    jsonb_build_object(
      'instanceId', v_instance_id,
      'workflowId', p_workflow_id,
      'entityType', p_entity_type,
      'entityId', p_entity_id,
      'initialState', v_initial_state_id
    ),
    p_user_id,
    '{}'::jsonb
  );

  RETURN v_instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION start_workflow IS 'Start a new workflow instance';

-- Function: transition_workflow()
CREATE OR REPLACE FUNCTION transition_workflow(
  p_instance_id UUID,
  p_action TEXT,
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_expected_version INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_instance RECORD;
  v_transition RECORD;
BEGIN
  -- Lock instance row (pessimistic locking)
  SELECT
    wi.*,
    w.name AS workflow_name,
    ws_current.name AS current_state_name
  INTO v_instance
  FROM workflow_instances wi
  JOIN workflows w ON wi.workflow_id = w.id
  JOIN workflow_states ws_current ON wi.current_state_id = ws_current.id
  WHERE wi.id = p_instance_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow instance % not found', p_instance_id;
  END IF;

  -- Check status is active
  IF v_instance.status != 'active' THEN
    RAISE EXCEPTION 'Cannot transition workflow in % status', v_instance.status;
  END IF;

  -- Optimistic locking check
  IF p_expected_version IS NOT NULL AND v_instance.version != p_expected_version THEN
    RAISE EXCEPTION 'Workflow instance was modified by another user (version mismatch)';
  END IF;

  -- Find valid transition
  SELECT
    wt.*,
    ws_to.id AS to_state_id,
    ws_to.name AS to_state_name,
    ws_to.is_terminal
  INTO v_transition
  FROM workflow_transitions wt
  JOIN workflow_states ws_to ON wt.to_state_id = ws_to.id
  WHERE wt.workflow_id = v_instance.workflow_id
    AND wt.from_state_id = v_instance.current_state_id
    AND wt.action = p_action;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid transition: action "%" not allowed from state "%"',
      p_action, v_instance.current_state_name;
  END IF;

  -- Check permission if required
  IF v_transition.required_permission IS NOT NULL THEN
    IF NOT user_has_permission(p_user_id, v_transition.required_permission, 'execute') THEN
      RAISE EXCEPTION 'User does not have permission: %', v_transition.required_permission;
    END IF;
  END IF;

  -- Update instance
  UPDATE workflow_instances
  SET
    current_state_id = v_transition.to_state_id,
    status = CASE
      WHEN v_transition.is_terminal THEN 'completed'
      ELSE 'active'
    END,
    completed_at = CASE
      WHEN v_transition.is_terminal THEN NOW()
      ELSE NULL
    END,
    version = version + 1,
    updated_at = NOW()
  WHERE id = p_instance_id;

  -- Record in history
  INSERT INTO workflow_history (
    workflow_instance_id,
    from_state_id,
    to_state_id,
    action,
    performed_by,
    notes
  ) VALUES (
    p_instance_id,
    v_instance.current_state_id,
    v_transition.to_state_id,
    p_action,
    p_user_id,
    p_notes
  );

  -- Publish event
  PERFORM publish_event(
    'workflow.state_changed',
    v_instance.entity_id,
    jsonb_build_object(
      'instanceId', p_instance_id,
      'workflowId', v_instance.workflow_id,
      'workflowName', v_instance.workflow_name,
      'fromState', v_instance.current_state_name,
      'toState', v_transition.to_state_name,
      'action', p_action,
      'entityType', v_instance.entity_type,
      'entityId', v_instance.entity_id,
      'isCompleted', v_transition.is_terminal
    ),
    p_user_id,
    '{}'::jsonb
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION transition_workflow IS 'Transition workflow instance to new state';

-- Function: get_available_actions()
CREATE OR REPLACE FUNCTION get_available_actions(
  p_instance_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  action TEXT,
  display_name TEXT,
  to_state_name TEXT,
  required_permission TEXT,
  has_permission BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wt.action,
    wt.display_name,
    ws_to.display_name AS to_state_name,
    wt.required_permission,
    CASE
      WHEN wt.required_permission IS NULL THEN TRUE
      ELSE user_has_permission(p_user_id, wt.required_permission, 'execute')
    END AS has_permission
  FROM workflow_instances wi
  JOIN workflow_transitions wt ON wt.workflow_id = wi.workflow_id
    AND wt.from_state_id = wi.current_state_id
  JOIN workflow_states ws_to ON wt.to_state_id = ws_to.id
  WHERE wi.id = p_instance_id
    AND wi.status = 'active'
  ORDER BY ws_to.state_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_available_actions IS 'Get available actions for workflow instance (with permission check)';

-- Function: cancel_workflow()
CREATE OR REPLACE FUNCTION cancel_workflow(
  p_instance_id UUID,
  p_user_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_instance RECORD;
BEGIN
  SELECT * INTO v_instance
  FROM workflow_instances
  WHERE id = p_instance_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow instance % not found', p_instance_id;
  END IF;

  IF v_instance.status != 'active' THEN
    RAISE EXCEPTION 'Cannot cancel workflow in % status', v_instance.status;
  END IF;

  UPDATE workflow_instances
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE id = p_instance_id;

  INSERT INTO workflow_history (
    workflow_instance_id,
    from_state_id,
    to_state_id,
    action,
    performed_by,
    notes
  ) VALUES (
    p_instance_id,
    v_instance.current_state_id,
    v_instance.current_state_id,
    'cancel',
    p_user_id,
    p_reason
  );

  PERFORM publish_event(
    'workflow.cancelled',
    v_instance.entity_id,
    jsonb_build_object(
      'instanceId', p_instance_id,
      'reason', p_reason
    ),
    p_user_id,
    '{}'::jsonb
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cancel_workflow IS 'Cancel an active workflow instance';

-- ========================================
-- VIEWS
-- ========================================

-- View: v_workflow_instances_with_state
CREATE OR REPLACE VIEW v_workflow_instances_with_state AS
SELECT
  wi.id,
  wi.org_id,
  w.name AS workflow_name,
  wi.entity_type,
  wi.entity_id,
  ws.name AS current_state,
  ws.display_name AS current_state_display,
  ws.is_terminal,
  wi.status,
  wi.started_at,
  wi.completed_at,
  wi.cancelled_at,
  EXTRACT(EPOCH FROM (COALESCE(wi.completed_at, NOW()) - wi.started_at)) / 3600 AS duration_hours,
  up.full_name AS created_by_name,
  wi.created_at,
  wi.updated_at
FROM workflow_instances wi
JOIN workflows w ON wi.workflow_id = w.id
JOIN workflow_states ws ON wi.current_state_id = ws.id
JOIN user_profiles up ON wi.created_by = up.id
WHERE (wi.org_id = auth_user_org_id() OR user_is_admin());

COMMENT ON VIEW v_workflow_instances_with_state IS 'Workflow instances with current state info (org-filtered)';

-- View: v_workflow_metrics
CREATE OR REPLACE VIEW v_workflow_metrics AS
SELECT
  w.id AS workflow_id,
  w.name AS workflow_name,
  w.entity_type,
  COUNT(*) AS total_instances,
  COUNT(*) FILTER (WHERE wi.status = 'active') AS active_instances,
  COUNT(*) FILTER (WHERE wi.status = 'completed') AS completed_instances,
  COUNT(*) FILTER (WHERE wi.status = 'cancelled') AS cancelled_instances,
  ROUND(AVG(EXTRACT(EPOCH FROM (wi.completed_at - wi.started_at)) / 3600)::NUMERIC, 2) AS avg_completion_hours,
  MAX(wi.started_at) AS last_started_at,
  w.org_id
FROM workflows w
LEFT JOIN workflow_instances wi ON w.id = wi.workflow_id
WHERE (w.org_id = auth_user_org_id() OR user_is_admin())
GROUP BY w.id, w.name, w.entity_type, w.org_id;

COMMENT ON VIEW v_workflow_metrics IS 'Workflow metrics by workflow type';

-- ========================================
-- RLS POLICIES
-- ========================================

-- workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows in their org"
  ON workflows FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Only admins can create workflows"
  ON workflows FOR INSERT
  WITH CHECK (user_is_admin());

CREATE POLICY "Only admins can update workflows"
  ON workflows FOR UPDATE
  USING (user_is_admin());

CREATE POLICY "Only admins can delete workflows"
  ON workflows FOR DELETE
  USING (user_is_admin());

-- workflow_states
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow states"
  ON workflow_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      WHERE w.id = workflow_states.workflow_id
        AND (w.org_id = auth_user_org_id() OR user_is_admin())
    )
  );

CREATE POLICY "Only admins can modify workflow states"
  ON workflow_states FOR ALL
  USING (user_is_admin());

-- workflow_transitions
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow transitions"
  ON workflow_transitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      WHERE w.id = workflow_transitions.workflow_id
        AND (w.org_id = auth_user_org_id() OR user_is_admin())
    )
  );

CREATE POLICY "Only admins can modify workflow transitions"
  ON workflow_transitions FOR ALL
  USING (user_is_admin());

-- workflow_instances
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow instances in their org"
  ON workflow_instances FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Users can create workflow instances in their org"
  ON workflow_instances FOR INSERT
  WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY "Service role can update workflow instances"
  ON workflow_instances FOR UPDATE
  USING (TRUE); -- Needed for transition_workflow() function

-- workflow_history
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow history for their org instances"
  ON workflow_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflow_instances wi
      WHERE wi.id = workflow_history.workflow_instance_id
        AND (wi.org_id = auth_user_org_id() OR user_is_admin())
    )
  );

CREATE POLICY "Service role can insert workflow history"
  ON workflow_history FOR INSERT
  WITH CHECK (TRUE); -- Needed for transition_workflow() function

-- ========================================
-- TRIGGERS
-- ========================================

-- Prevent updates/deletes on workflow_history (immutable audit log)
CREATE OR REPLACE FUNCTION prevent_workflow_history_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Workflow history is immutable (cannot UPDATE or DELETE)';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_workflow_history_update
  BEFORE UPDATE ON workflow_history
  FOR EACH ROW
  EXECUTE FUNCTION prevent_workflow_history_modification();

CREATE TRIGGER trigger_prevent_workflow_history_delete
  BEFORE DELETE ON workflow_history
  FOR EACH ROW
  EXECUTE FUNCTION prevent_workflow_history_modification();

-- Update workflow_instances.updated_at
CREATE TRIGGER trigger_workflow_instances_updated_at
  BEFORE UPDATE ON workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update workflows.updated_at
CREATE TRIGGER trigger_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
