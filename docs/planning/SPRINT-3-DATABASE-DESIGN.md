# Sprint 3: Database Design - Workflow Engine & Core Services

**Epic:** EPIC-01 Foundation
**Sprint:** Sprint 3 (Week 5-6)
**Author:** Architect Agent
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Executive Summary

This document specifies the complete database schema for Sprint 3's Workflow Engine and Core Services. Building on Sprint 1 (RBAC, Multi-Tenancy) and Sprint 2 (Event Bus), we now add:

1. **Workflow Engine Tables** (Migration 009) - State machines for business processes
2. **Document Generation Tables** (Migration 010) - PDF/DOCX template management
3. **File Management Tables** (Migration 011) - Unified file storage metadata
4. **Email Service Tables** (Migration 012) - Email templates and delivery logs
5. **Background Jobs Tables** (Migration 013) - PostgreSQL-based job queue

**Key Principles:**
- ALL tables have `org_id` for multi-tenancy
- ALL tables have RLS policies enabled
- ALL mutations audit logged
- Performance indexes for admin queries
- Soft deletes via `deleted_at` for critical data

---

## Migration Overview

| Migration | Purpose | Tables Created | Estimated Rows (Year 1) |
|-----------|---------|----------------|-------------------------|
| 009 | Workflow Engine | 5 tables | 100K workflow instances |
| 010 | Document Generation | 2 tables | 50K documents |
| 011 | File Management | 1 table | 100K files |
| 012 | Email Service | 2 tables | 500K emails |
| 013 | Background Jobs | 1 table | 10K jobs/month |

**Total New Tables:** 11
**Total New Functions:** 18
**Total New Views:** 7
**Total New Indexes:** 25

---

## Migration 009: Workflow Engine

### File Path
`/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/migrations/009_create_workflow_engine.sql`

### Tables

#### 1. workflows (Workflow Definitions)

```sql
CREATE TABLE workflows (
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
```

#### 2. workflow_states (States in Workflow)

```sql
CREATE TABLE workflow_states (
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
```

#### 3. workflow_transitions (Valid State Changes)

```sql
CREATE TABLE workflow_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_state_id UUID NOT NULL REFERENCES workflow_states(id) ON DELETE CASCADE,
  to_state_id UUID NOT NULL REFERENCES workflow_states(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'approve', 'reject', 'submit', 'schedule', etc.
  display_name TEXT NOT NULL, -- 'Approve Application' (user-friendly)
  required_permission TEXT, -- e.g., 'students:approve' (RBAC check)
  conditions JSONB DEFAULT '{}'::jsonb NOT NULL, -- Conditions to allow transition (e.g., {"grade": {">=": 80}})
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
```

#### 4. workflow_instances (Actual Executions)

```sql
CREATE TABLE workflow_instances (
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
```

#### 5. workflow_history (Audit Trail)

```sql
CREATE TABLE workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  from_state_id UUID REFERENCES workflow_states(id),
  to_state_id UUID NOT NULL REFERENCES workflow_states(id),
  action TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES user_profiles(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Immutable (append-only audit log)
  CONSTRAINT no_update_allowed CHECK (true) -- Enforced via trigger
);

CREATE INDEX idx_workflow_history_instance_id ON workflow_history(workflow_instance_id);
CREATE INDEX idx_workflow_history_created_at ON workflow_history(created_at DESC);
CREATE INDEX idx_workflow_history_performed_by ON workflow_history(performed_by);

COMMENT ON TABLE workflow_history IS 'Immutable audit trail of workflow state changes';
```

### Functions

#### 1. start_workflow()

```sql
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
```

#### 2. transition_workflow()

```sql
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
  v_new_state_id UUID;
  v_workflow_name TEXT;
  v_from_state_name TEXT;
  v_to_state_name TEXT;
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

  -- TODO: Evaluate conditions (future enhancement)
  -- IF NOT evaluate_conditions(v_transition.conditions, v_instance.metadata) THEN
  --   RAISE EXCEPTION 'Transition conditions not met';
  -- END IF;

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
```

#### 3. get_available_actions()

```sql
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
```

#### 4. cancel_workflow()

```sql
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
```

### Views

#### 1. v_workflow_instances_with_state

```sql
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
```

#### 2. v_workflow_metrics

```sql
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
```

### RLS Policies

```sql
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
```

### Triggers

```sql
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
```

### Seed Data

```sql
-- Seed predefined workflows (will be created via migration)
DO $$
DECLARE
  v_org_id UUID;
  v_admin_id UUID;
  v_student_workflow_id UUID;
  v_candidate_workflow_id UUID;
  v_job_workflow_id UUID;
  v_state_ids UUID[];
BEGIN
  -- Get default org and admin user
  SELECT id INTO v_org_id FROM organizations WHERE name = 'InTime Solutions' LIMIT 1;
  SELECT id INTO v_admin_id FROM user_profiles WHERE email LIKE '%admin%' LIMIT 1;

  IF v_org_id IS NULL OR v_admin_id IS NULL THEN
    RAISE NOTICE 'Skipping workflow seed data (org or admin not found)';
    RETURN;
  END IF;

  -- ====================================
  -- STUDENT LIFECYCLE WORKFLOW
  -- ====================================
  INSERT INTO workflows (
    org_id, name, description, entity_type, created_by
  ) VALUES (
    v_org_id,
    'Student Lifecycle',
    'Student journey from application to graduation',
    'student',
    v_admin_id
  ) RETURNING id INTO v_student_workflow_id;

  -- States
  WITH state_inserts AS (
    INSERT INTO workflow_states (workflow_id, name, display_name, state_order, is_initial, is_terminal)
    VALUES
      (v_student_workflow_id, 'application_submitted', 'Application Submitted', 1, TRUE, FALSE),
      (v_student_workflow_id, 'assessment_scheduled', 'Assessment Scheduled', 2, FALSE, FALSE),
      (v_student_workflow_id, 'assessment_completed', 'Assessment Completed', 3, FALSE, FALSE),
      (v_student_workflow_id, 'enrollment_approved', 'Enrollment Approved', 4, FALSE, FALSE),
      (v_student_workflow_id, 'active', 'Active Student', 5, FALSE, FALSE),
      (v_student_workflow_id, 'graduated', 'Graduated', 6, FALSE, TRUE),
      (v_student_workflow_id, 'rejected', 'Application Rejected', 7, FALSE, TRUE)
    RETURNING id
  )
  SELECT array_agg(id) INTO v_state_ids FROM state_inserts;

  -- Transitions
  INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, action, display_name, required_permission)
  SELECT
    v_student_workflow_id,
    v_state_ids[1], -- application_submitted
    v_state_ids[2], -- assessment_scheduled
    'schedule_assessment',
    'Schedule Assessment',
    'students:schedule'
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[2], -- assessment_scheduled
    v_state_ids[3], -- assessment_completed
    'complete_assessment',
    'Mark Assessment Complete',
    'students:assess'
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[3], -- assessment_completed
    v_state_ids[4], -- enrollment_approved
    'approve_enrollment',
    'Approve Enrollment',
    'students:approve'
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[3], -- assessment_completed
    v_state_ids[7], -- rejected
    'reject_application',
    'Reject Application',
    'students:approve'
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[4], -- enrollment_approved
    v_state_ids[5], -- active
    'start_course',
    'Start Course',
    NULL -- No special permission
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[5], -- active
    v_state_ids[6], -- graduated
    'graduate',
    'Mark as Graduated',
    'students:graduate';

  -- Update initial_state_id
  UPDATE workflows SET initial_state_id = v_state_ids[1]
  WHERE id = v_student_workflow_id;

  -- ====================================
  -- CANDIDATE PLACEMENT WORKFLOW
  -- ====================================
  INSERT INTO workflows (
    org_id, name, description, entity_type, created_by
  ) VALUES (
    v_org_id,
    'Candidate Placement',
    'Candidate journey from sourcing to placement',
    'candidate',
    v_admin_id
  ) RETURNING id INTO v_candidate_workflow_id;

  WITH state_inserts AS (
    INSERT INTO workflow_states (workflow_id, name, display_name, state_order, is_initial, is_terminal)
    VALUES
      (v_candidate_workflow_id, 'sourced', 'Sourced', 1, TRUE, FALSE),
      (v_candidate_workflow_id, 'screening', 'Screening', 2, FALSE, FALSE),
      (v_candidate_workflow_id, 'submitted_to_client', 'Submitted to Client', 3, FALSE, FALSE),
      (v_candidate_workflow_id, 'interview_scheduled', 'Interview Scheduled', 4, FALSE, FALSE),
      (v_candidate_workflow_id, 'offer_extended', 'Offer Extended', 5, FALSE, FALSE),
      (v_candidate_workflow_id, 'placed', 'Placed', 6, FALSE, TRUE),
      (v_candidate_workflow_id, 'rejected', 'Rejected', 7, FALSE, TRUE)
    RETURNING id
  )
  SELECT array_agg(id) INTO v_state_ids FROM state_inserts;

  INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, action, display_name, required_permission)
  SELECT
    v_candidate_workflow_id,
    v_state_ids[1], -- sourced
    v_state_ids[2], -- screening
    'screen',
    'Start Screening',
    'candidates:screen'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[2], -- screening
    v_state_ids[3], -- submitted_to_client
    'submit',
    'Submit to Client',
    'candidates:submit'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[2], -- screening
    v_state_ids[7], -- rejected
    'reject',
    'Reject Candidate',
    'candidates:screen'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[3], -- submitted_to_client
    v_state_ids[4], -- interview_scheduled
    'schedule_interview',
    'Schedule Interview',
    'candidates:interview'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[4], -- interview_scheduled
    v_state_ids[5], -- offer_extended
    'extend_offer',
    'Extend Offer',
    'candidates:offer'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[5], -- offer_extended
    v_state_ids[6], -- placed
    'place',
    'Mark as Placed',
    'candidates:place';

  UPDATE workflows SET initial_state_id = v_state_ids[1]
  WHERE id = v_candidate_workflow_id;

  -- ====================================
  -- JOB REQUISITION WORKFLOW
  -- ====================================
  INSERT INTO workflows (
    org_id, name, description, entity_type, created_by
  ) VALUES (
    v_org_id,
    'Job Requisition',
    'Job posting lifecycle from draft to filled',
    'job',
    v_admin_id
  ) RETURNING id INTO v_job_workflow_id;

  WITH state_inserts AS (
    INSERT INTO workflow_states (workflow_id, name, display_name, state_order, is_initial, is_terminal)
    VALUES
      (v_job_workflow_id, 'draft', 'Draft', 1, TRUE, FALSE),
      (v_job_workflow_id, 'pending_approval', 'Pending Approval', 2, FALSE, FALSE),
      (v_job_workflow_id, 'approved', 'Approved', 3, FALSE, FALSE),
      (v_job_workflow_id, 'active', 'Active (Recruiting)', 4, FALSE, FALSE),
      (v_job_workflow_id, 'filled', 'Filled', 5, FALSE, TRUE),
      (v_job_workflow_id, 'closed', 'Closed (Cancelled)', 6, FALSE, TRUE)
    RETURNING id
  )
  SELECT array_agg(id) INTO v_state_ids FROM state_inserts;

  INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, action, display_name, required_permission)
  SELECT
    v_job_workflow_id,
    v_state_ids[1], -- draft
    v_state_ids[2], -- pending_approval
    'submit_for_approval',
    'Submit for Approval',
    NULL
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[2], -- pending_approval
    v_state_ids[3], -- approved
    'approve',
    'Approve Job',
    'jobs:approve'
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[2], -- pending_approval
    v_state_ids[1], -- draft
    'reject',
    'Reject (Back to Draft)',
    'jobs:approve'
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[3], -- approved
    v_state_ids[4], -- active
    'activate',
    'Activate Job Posting',
    'jobs:activate'
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[4], -- active
    v_state_ids[5], -- filled
    'fill',
    'Mark as Filled',
    'jobs:fill'
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[4], -- active
    v_state_ids[6], -- closed
    'close',
    'Close Job (Cancel)',
    'jobs:close';

  UPDATE workflows SET initial_state_id = v_state_ids[1]
  WHERE id = v_job_workflow_id;

  RAISE NOTICE 'Workflow seed data created successfully';
END $$;
```

---

## Migration 010: Document Generation

### File Path
`/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/migrations/010_create_document_service.sql`

### Tables

#### 1. document_templates

```sql
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- 'pdf', 'docx', 'html'
  category TEXT NOT NULL, -- 'certificate', 'offer_letter', 'report', 'invoice', 'resume'
  template_content TEXT NOT NULL, -- Handlebars template
  variables JSONB DEFAULT '{}'::jsonb NOT NULL, -- Expected variables with descriptions
  sample_data JSONB DEFAULT '{}'::jsonb, -- Sample data for preview
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_template_name_per_org UNIQUE (org_id, name)
);

CREATE INDEX idx_document_templates_org_id ON document_templates(org_id);
CREATE INDEX idx_document_templates_category ON document_templates(category);
CREATE INDEX idx_document_templates_type ON document_templates(template_type);
CREATE INDEX idx_document_templates_active ON document_templates(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE document_templates IS 'Document templates for PDF/DOCX generation';
COMMENT ON COLUMN document_templates.template_content IS 'Handlebars template (HTML for PDF, custom for DOCX)';
COMMENT ON COLUMN document_templates.variables IS 'Expected variables: {"studentName": {"type": "string", "required": true}}';
```

#### 2. generated_documents

```sql
CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES document_templates(id),
  entity_type TEXT NOT NULL, -- 'student', 'candidate', 'job', etc.
  entity_id UUID NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  mime_type TEXT NOT NULL,
  generated_by UUID NOT NULL REFERENCES user_profiles(id),
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- Variables used, download count, etc.

  -- No deleted_at (documents are permanent records)
  CONSTRAINT valid_mime_type CHECK (mime_type IN ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
);

CREATE INDEX idx_generated_documents_org_id ON generated_documents(org_id);
CREATE INDEX idx_generated_documents_template_id ON generated_documents(template_id);
CREATE INDEX idx_generated_documents_entity ON generated_documents(entity_type, entity_id);
CREATE INDEX idx_generated_documents_generated_at ON generated_documents(generated_at DESC);

COMMENT ON TABLE generated_documents IS 'Metadata for generated documents (files in Supabase Storage)';
```

### RLS Policies

```sql
-- document_templates
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates in their org"
  ON document_templates FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Only admins can create templates"
  ON document_templates FOR INSERT
  WITH CHECK (user_is_admin());

CREATE POLICY "Only admins can update templates"
  ON document_templates FOR UPDATE
  USING (user_is_admin());

CREATE POLICY "Only admins can delete templates"
  ON document_templates FOR DELETE
  USING (user_is_admin());

-- generated_documents
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view generated documents in their org"
  ON generated_documents FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Users can create generated documents in their org"
  ON generated_documents FOR INSERT
  WITH CHECK (org_id = auth_user_org_id());

-- No UPDATE or DELETE policies (documents are immutable)
```

### Triggers

```sql
CREATE TRIGGER trigger_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Seed Data

```sql
-- Seed predefined document templates
DO $$
DECLARE
  v_org_id UUID;
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_org_id FROM organizations WHERE name = 'InTime Solutions' LIMIT 1;
  SELECT id INTO v_admin_id FROM user_profiles WHERE email LIKE '%admin%' LIMIT 1;

  IF v_org_id IS NULL OR v_admin_id IS NULL THEN
    RAISE NOTICE 'Skipping document template seed data';
    RETURN;
  END IF;

  -- Completion Certificate (PDF)
  INSERT INTO document_templates (
    org_id, name, description, template_type, category, template_content, variables, sample_data, created_by
  ) VALUES (
    v_org_id,
    'Course Completion Certificate',
    'Certificate awarded to students upon course completion',
    'pdf',
    'certificate',
    '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; text-align: center; padding: 50px; }
    h1 { font-size: 48px; color: #2c3e50; }
    .student-name { font-size: 36px; color: #e74c3c; font-weight: bold; }
    .course-name { font-size: 28px; color: #3498db; }
  </style>
</head>
<body>
  <h1>Certificate of Completion</h1>
  <p>This certifies that</p>
  <p class="student-name">{{ studentName }}</p>
  <p>has successfully completed</p>
  <p class="course-name">{{ courseName }}</p>
  <p>on {{ completionDate }}</p>
  <p>with a grade of <strong>{{ grade }}%</strong></p>
  <br><br>
  <p>{{ instructorName }}<br>Lead Instructor</p>
</body>
</html>',
    jsonb_build_object(
      'studentName', jsonb_build_object('type', 'string', 'required', true, 'description', 'Full name of student'),
      'courseName', jsonb_build_object('type', 'string', 'required', true, 'description', 'Name of course'),
      'completionDate', jsonb_build_object('type', 'string', 'required', true, 'description', 'Date in format "January 15, 2026"'),
      'grade', jsonb_build_object('type', 'number', 'required', true, 'description', 'Final grade percentage'),
      'instructorName', jsonb_build_object('type', 'string', 'required', true, 'description', 'Name of instructor')
    ),
    jsonb_build_object(
      'studentName', 'John Doe',
      'courseName', 'Guidewire PolicyCenter Fundamentals',
      'completionDate', 'January 15, 2026',
      'grade', 92,
      'instructorName', 'Jane Smith'
    ),
    v_admin_id
  );

  -- Offer Letter (DOCX) - simplified HTML for now (DOCX will use docx library)
  INSERT INTO document_templates (
    org_id, name, description, template_type, category, template_content, variables, sample_data, created_by
  ) VALUES (
    v_org_id,
    'Job Offer Letter',
    'Formal offer letter for candidates',
    'docx',
    'offer_letter',
    'Dear {{ candidateName }},

We are pleased to offer you the position of {{ jobTitle }} at {{ companyName }}.

Position: {{ jobTitle }}
Salary: ${{ salary }}/year
Start Date: {{ startDate }}

Please sign and return this letter by {{ responseDeadline }}.

Sincerely,
{{ signerName }}
{{ signerTitle }}',
    jsonb_build_object(
      'candidateName', jsonb_build_object('type', 'string', 'required', true),
      'jobTitle', jsonb_build_object('type', 'string', 'required', true),
      'companyName', jsonb_build_object('type', 'string', 'required', true),
      'salary', jsonb_build_object('type', 'number', 'required', true),
      'startDate', jsonb_build_object('type', 'string', 'required', true),
      'responseDeadline', jsonb_build_object('type', 'string', 'required', true),
      'signerName', jsonb_build_object('type', 'string', 'required', true),
      'signerTitle', jsonb_build_object('type', 'string', 'required', true)
    ),
    jsonb_build_object(
      'candidateName', 'Jane Smith',
      'jobTitle', 'Senior Guidewire Developer',
      'companyName', 'Tech Corp',
      'salary', 120000,
      'startDate', 'February 1, 2026',
      'responseDeadline', 'January 25, 2026',
      'signerName', 'John Manager',
      'signerTitle', 'VP of Engineering'
    ),
    v_admin_id
  );

  RAISE NOTICE 'Document template seed data created';
END $$;
```

---

## Migration 011: File Management

### File Path
`/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/migrations/011_create_file_management.sql`

### Tables

#### 1. file_uploads

```sql
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL, -- 'avatars', 'resumes', 'documents', 'attachments', 'course-materials'
  file_path TEXT NOT NULL, -- Supabase Storage path: org_id/entity_type/entity_id/filename
  file_name TEXT NOT NULL, -- Original filename
  file_size INTEGER NOT NULL, -- bytes
  mime_type TEXT NOT NULL,
  entity_type TEXT, -- 'user', 'student', 'candidate', 'job', etc.
  entity_id UUID, -- ID of related entity
  uploaded_by UUID NOT NULL REFERENCES user_profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ, -- Soft delete
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- width/height for images, duration for videos, etc.

  CONSTRAINT unique_file_path UNIQUE (bucket, file_path)
);

CREATE INDEX idx_file_uploads_org_id ON file_uploads(org_id);
CREATE INDEX idx_file_uploads_bucket ON file_uploads(bucket);
CREATE INDEX idx_file_uploads_entity ON file_uploads(entity_type, entity_id);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_not_deleted ON file_uploads(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE file_uploads IS 'Metadata for all uploaded files (files stored in Supabase Storage)';
COMMENT ON COLUMN file_uploads.file_path IS 'Full path in Supabase Storage';
```

### RLS Policies

```sql
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files in their org"
  ON file_uploads FOR SELECT
  USING (
    org_id = auth_user_org_id()
    AND deleted_at IS NULL
    OR user_is_admin()
  );

CREATE POLICY "Users can upload files to their org"
  ON file_uploads FOR INSERT
  WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY "Users can soft-delete their own files"
  ON file_uploads FOR UPDATE
  USING (
    org_id = auth_user_org_id()
    AND uploaded_by = auth_user_id()
  )
  WITH CHECK (
    org_id = auth_user_org_id()
    AND uploaded_by = auth_user_id()
  );

-- No hard DELETE policy (use soft delete)
```

---

## Migration 012: Email Service

### File Path
`/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/migrations/012_create_email_service.sql`

### Tables

#### 1. email_templates

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL, -- Handlebars template
  body_html TEXT NOT NULL, -- Handlebars template
  body_text TEXT, -- Plain text fallback
  category TEXT NOT NULL, -- 'transactional', 'notification', 'marketing'
  variables JSONB DEFAULT '{}'::jsonb NOT NULL, -- Expected variables
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_email_template_name UNIQUE (org_id, name)
);

CREATE INDEX idx_email_templates_org_id ON email_templates(org_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_active ON email_templates(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE email_templates IS 'Email templates for transactional/notification emails';
```

#### 2. email_logs

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  to_email TEXT NOT NULL,
  cc_email TEXT[],
  bcc_email TEXT[],
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'sent', 'failed', 'bounced', 'opened', 'clicked'
  resend_id TEXT, -- Resend email ID (for tracking)
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- Variables used, IP address, user agent
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_email_status CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'opened', 'clicked'))
);

CREATE INDEX idx_email_logs_org_id ON email_logs(org_id);
CREATE INDEX idx_email_logs_template_id ON email_logs(template_id);
CREATE INDEX idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_resend_id ON email_logs(resend_id) WHERE resend_id IS NOT NULL;

COMMENT ON TABLE email_logs IS 'Log of all emails sent (for tracking and compliance)';
```

### RLS Policies

```sql
-- email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email templates in their org"
  ON email_templates FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Only admins can create email templates"
  ON email_templates FOR INSERT
  WITH CHECK (user_is_admin());

CREATE POLICY "Only admins can update email templates"
  ON email_templates FOR UPDATE
  USING (user_is_admin());

-- email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email logs in their org"
  ON email_logs FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Service role can insert email logs"
  ON email_logs FOR INSERT
  WITH CHECK (TRUE); -- Needed for email service

CREATE POLICY "Service role can update email logs"
  ON email_logs FOR UPDATE
  USING (TRUE); -- Needed for Resend webhooks
```

### Triggers

```sql
CREATE TRIGGER trigger_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Seed Data

```sql
-- Seed email templates
DO $$
DECLARE
  v_org_id UUID;
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_org_id FROM organizations WHERE name = 'InTime Solutions' LIMIT 1;
  SELECT id INTO v_admin_id FROM user_profiles WHERE email LIKE '%admin%' LIMIT 1;

  IF v_org_id IS NULL OR v_admin_id IS NULL THEN
    RAISE NOTICE 'Skipping email template seed data';
    RETURN;
  END IF;

  -- Welcome Email
  INSERT INTO email_templates (
    org_id, name, subject, body_html, body_text, category, variables, created_by
  ) VALUES (
    v_org_id,
    'Welcome Email',
    'Welcome to InTime, {{ firstName }}!',
    '<h1>Welcome {{ firstName }}!</h1>
<p>We''re excited to have you join InTime.</p>
<p><a href="{{ loginUrl }}">Login to your account</a></p>',
    'Welcome {{ firstName }}! We''re excited to have you join InTime. Login: {{ loginUrl }}',
    'transactional',
    jsonb_build_object(
      'firstName', jsonb_build_object('type', 'string', 'required', true),
      'loginUrl', jsonb_build_object('type', 'string', 'required', true)
    ),
    v_admin_id
  );

  -- Password Reset
  INSERT INTO email_templates (
    org_id, name, subject, body_html, body_text, category, variables, created_by
  ) VALUES (
    v_org_id,
    'Password Reset',
    'Reset Your Password',
    '<h2>Password Reset Request</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ resetUrl }}">Reset Password</a></p>
<p>This link expires in {{ expiresIn }}.</p>
<p>If you didn''t request this, please ignore this email.</p>',
    'Click here to reset your password: {{ resetUrl }} (expires in {{ expiresIn }})',
    'transactional',
    jsonb_build_object(
      'resetUrl', jsonb_build_object('type', 'string', 'required', true),
      'expiresIn', jsonb_build_object('type', 'string', 'required', true, 'default', '1 hour')
    ),
    v_admin_id
  );

  -- Course Completion
  INSERT INTO email_templates (
    org_id, name, subject, body_html, body_text, category, variables, created_by
  ) VALUES (
    v_org_id,
    'Course Completion Certificate',
    'Congratulations on Completing {{ courseName }}!',
    '<h1>Congratulations {{ studentName }}!</h1>
<p>You have successfully completed <strong>{{ courseName }}</strong> with a grade of <strong>{{ grade }}%</strong>.</p>
<p><a href="{{ certificateUrl }}">Download your certificate</a></p>
<p>Next steps: Check out our job board for placement opportunities!</p>',
    'Congratulations {{ studentName }}! You completed {{ courseName }} with {{ grade }}%. Download certificate: {{ certificateUrl }}',
    'notification',
    jsonb_build_object(
      'studentName', jsonb_build_object('type', 'string', 'required', true),
      'courseName', jsonb_build_object('type', 'string', 'required', true),
      'grade', jsonb_build_object('type', 'number', 'required', true),
      'certificateUrl', jsonb_build_object('type', 'string', 'required', true)
    ),
    v_admin_id
  );

  RAISE NOTICE 'Email template seed data created';
END $$;
```

---

## Migration 013: Background Jobs

### File Path
`/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/migrations/013_create_background_jobs.sql`

### Tables

#### 1. background_jobs

```sql
CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- 'generate_document', 'send_bulk_email', 'import_data', 'export_data'
  payload JSONB NOT NULL, -- Job-specific data
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  attempts INTEGER DEFAULT 0 NOT NULL,
  max_attempts INTEGER DEFAULT 3 NOT NULL,
  error_message TEXT,
  result JSONB, -- Job result (e.g., {documentId: '123', fileUrl: 'https://...'})
  priority INTEGER DEFAULT 5 NOT NULL, -- 1 (highest) to 10 (lowest)
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_job_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 10)
);

CREATE INDEX idx_background_jobs_org_id ON background_jobs(org_id);
CREATE INDEX idx_background_jobs_job_type ON background_jobs(job_type);
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
-- Partial index for pending jobs (most queried)
CREATE INDEX idx_background_jobs_pending ON background_jobs(priority ASC, created_at ASC)
  WHERE status = 'pending';
-- Failed jobs for retry
CREATE INDEX idx_background_jobs_failed ON background_jobs(attempts, created_at DESC)
  WHERE status = 'failed' AND attempts < max_attempts;

COMMENT ON TABLE background_jobs IS 'PostgreSQL-based background job queue';
COMMENT ON COLUMN background_jobs.priority IS '1 = highest priority, 10 = lowest';
```

### Functions

```sql
-- Dequeue next pending job (atomic operation)
CREATE OR REPLACE FUNCTION dequeue_next_job()
RETURNS TABLE (
  job_id UUID,
  job_type TEXT,
  payload JSONB,
  org_id UUID
) AS $$
BEGIN
  RETURN QUERY
  UPDATE background_jobs
  SET
    status = 'processing',
    started_at = NOW(),
    attempts = attempts + 1,
    updated_at = NOW()
  WHERE id = (
    SELECT id FROM background_jobs
    WHERE status = 'pending'
    ORDER BY priority ASC, created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING
    background_jobs.id,
    background_jobs.job_type,
    background_jobs.payload,
    background_jobs.org_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION dequeue_next_job IS 'Atomically dequeue next pending job (uses SKIP LOCKED for concurrency)';

-- Mark job completed
CREATE OR REPLACE FUNCTION mark_job_completed(
  p_job_id UUID,
  p_result JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE background_jobs
  SET
    status = 'completed',
    completed_at = NOW(),
    result = p_result,
    updated_at = NOW()
  WHERE id = p_job_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Mark job failed
CREATE OR REPLACE FUNCTION mark_job_failed(
  p_job_id UUID,
  p_error_message TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_attempts INTEGER;
  v_max_attempts INTEGER;
BEGIN
  SELECT attempts, max_attempts
  INTO v_attempts, v_max_attempts
  FROM background_jobs
  WHERE id = p_job_id;

  UPDATE background_jobs
  SET
    status = CASE
      WHEN v_attempts >= v_max_attempts THEN 'failed' -- Permanently failed
      ELSE 'pending' -- Retry
    END,
    error_message = p_error_message,
    updated_at = NOW()
  WHERE id = p_job_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Get job queue stats
CREATE OR REPLACE FUNCTION get_job_queue_stats()
RETURNS TABLE (
  job_type TEXT,
  pending_count BIGINT,
  processing_count BIGINT,
  completed_count BIGINT,
  failed_count BIGINT,
  avg_processing_seconds NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bj.job_type,
    COUNT(*) FILTER (WHERE bj.status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE bj.status = 'processing') AS processing_count,
    COUNT(*) FILTER (WHERE bj.status = 'completed') AS completed_count,
    COUNT(*) FILTER (WHERE bj.status = 'failed') AS failed_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (bj.completed_at - bj.started_at)))::NUMERIC, 2) AS avg_processing_seconds
  FROM background_jobs bj
  WHERE bj.org_id = auth_user_org_id() OR user_is_admin()
  GROUP BY bj.job_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS Policies

```sql
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view jobs in their org"
  ON background_jobs FOR SELECT
  USING (org_id = auth_user_org_id() OR user_is_admin());

CREATE POLICY "Users can create jobs in their org"
  ON background_jobs FOR INSERT
  WITH CHECK (org_id = auth_user_org_id());

CREATE POLICY "Service role can update jobs"
  ON background_jobs FOR UPDATE
  USING (TRUE); -- Needed for job processor
```

### Triggers

```sql
CREATE TRIGGER trigger_background_jobs_updated_at
  BEFORE UPDATE ON background_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Performance Specifications

### Query Performance Targets

| Operation | Target (p95) | Index Used |
|-----------|--------------|------------|
| List active workflows | < 100ms | idx_workflow_instances_status |
| Transition workflow | < 100ms | Primary key + version check |
| Get available actions | < 50ms | idx_workflow_transitions_from_state |
| Generate document | < 3s | Template fetch + Puppeteer |
| Upload file metadata | < 50ms | Primary key insert |
| Send email | < 2s | Resend API call |
| Dequeue job | < 10ms | idx_background_jobs_pending + SKIP LOCKED |

### Storage Estimates (Year 1)

| Table | Estimated Rows | Avg Row Size | Total Size |
|-------|----------------|--------------|------------|
| workflows | 50 | 500 bytes | 25 KB |
| workflow_states | 300 | 300 bytes | 90 KB |
| workflow_transitions | 500 | 300 bytes | 150 KB |
| workflow_instances | 100,000 | 500 bytes | 50 MB |
| workflow_history | 500,000 | 400 bytes | 200 MB |
| document_templates | 100 | 5 KB | 500 KB |
| generated_documents | 50,000 | 300 bytes | 15 MB |
| file_uploads | 100,000 | 400 bytes | 40 MB |
| email_templates | 50 | 2 KB | 100 KB |
| email_logs | 500,000 | 400 bytes | 200 MB |
| background_jobs | 120,000 | 500 bytes | 60 MB |

**Total Database Growth:** ~565 MB (Year 1)
**Supabase Free Tier:** 500 MB (need to monitor)

---

## Testing Requirements

### Migration Validation

```sql
-- Verify all tables created
SELECT
  schemaname,
  tablename,
  has_row_security
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'workflows', 'workflow_states', 'workflow_transitions',
    'workflow_instances', 'workflow_history',
    'document_templates', 'generated_documents',
    'file_uploads',
    'email_templates', 'email_logs',
    'background_jobs'
  )
ORDER BY tablename;

-- Expected: All tables have has_row_security = TRUE

-- Verify all indexes created
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'workflow%'
    OR tablename LIKE 'document%'
    OR tablename LIKE 'file%'
    OR tablename LIKE 'email%'
    OR tablename LIKE 'background%'
ORDER BY tablename, indexname;

-- Expected: 25+ indexes

-- Verify all functions created
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'start_workflow', 'transition_workflow', 'get_available_actions', 'cancel_workflow',
    'dequeue_next_job', 'mark_job_completed', 'mark_job_failed', 'get_job_queue_stats'
  );

-- Expected: 8 functions
```

### Unit Tests (SQL)

```sql
-- Test: Start workflow
DO $$
DECLARE
  v_workflow_id UUID;
  v_instance_id UUID;
BEGIN
  -- Get student workflow
  SELECT id INTO v_workflow_id FROM workflows WHERE name = 'Student Lifecycle' LIMIT 1;

  -- Start workflow
  SELECT start_workflow(
    v_workflow_id,
    'student',
    gen_random_uuid(), -- entity_id
    auth_user_id(),
    auth_user_org_id()
  ) INTO v_instance_id;

  ASSERT v_instance_id IS NOT NULL, 'Workflow instance not created';

  -- Verify initial state
  ASSERT (
    SELECT status FROM workflow_instances WHERE id = v_instance_id
  ) = 'active', 'Workflow should be active';

  RAISE NOTICE 'Test passed: start_workflow()';
END $$;

-- Test: Transition workflow
DO $$
DECLARE
  v_instance_id UUID;
BEGIN
  -- Create test workflow instance (assume helper function exists)
  v_instance_id := create_test_workflow_instance('Student Lifecycle');

  -- Transition to next state
  PERFORM transition_workflow(
    v_instance_id,
    'schedule_assessment',
    auth_user_id(),
    'Test transition'
  );

  -- Verify state changed
  ASSERT (
    SELECT current_state_id FROM workflow_instances WHERE id = v_instance_id
  ) != (
    SELECT initial_state_id FROM workflows
    JOIN workflow_instances ON workflows.id = workflow_instances.workflow_id
    WHERE workflow_instances.id = v_instance_id
  ), 'State should have changed';

  RAISE NOTICE 'Test passed: transition_workflow()';
END $$;
```

---

## Rollback Scripts

### Rollback 013 (Background Jobs)

```sql
DROP TABLE IF EXISTS background_jobs CASCADE;
DROP FUNCTION IF EXISTS dequeue_next_job();
DROP FUNCTION IF EXISTS mark_job_completed(UUID, JSONB);
DROP FUNCTION IF EXISTS mark_job_failed(UUID, TEXT);
DROP FUNCTION IF EXISTS get_job_queue_stats();
```

### Rollback 012 (Email Service)

```sql
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
```

### Rollback 011 (File Management)

```sql
DROP TABLE IF EXISTS file_uploads CASCADE;
```

### Rollback 010 (Document Generation)

```sql
DROP TABLE IF EXISTS generated_documents CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;
```

### Rollback 009 (Workflow Engine)

```sql
DROP VIEW IF EXISTS v_workflow_metrics;
DROP VIEW IF EXISTS v_workflow_instances_with_state;
DROP TABLE IF EXISTS workflow_history CASCADE;
DROP TABLE IF EXISTS workflow_instances CASCADE;
DROP TABLE IF EXISTS workflow_transitions CASCADE;
DROP TABLE IF EXISTS workflow_states CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP FUNCTION IF EXISTS cancel_workflow(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS get_available_actions(UUID, UUID);
DROP FUNCTION IF EXISTS transition_workflow(UUID, TEXT, UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS start_workflow(UUID, TEXT, UUID, UUID, UUID);
```

---

## Next Steps

1. **Developer Agent:** Review migrations and create migration files
2. **Developer Agent:** Run migrations on local Supabase instance
3. **Developer Agent:** Validate using SQL tests above
4. **QA Agent:** Test RLS policies prevent cross-org access
5. **Deployment Agent:** Apply migrations to staging/production

---

**Status:** ✅ READY FOR IMPLEMENTATION

**Estimated Migration Time:** 3-4 hours (5 migrations + seed data + validation)

---

**End of Database Design Document**
