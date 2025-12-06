-- Migration: Workflow Configuration System
-- Creates tables for workflow automation, approval chains, and business rules

-- ============================================
-- WORKFLOWS TABLE (Main workflow definitions)
-- ============================================
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN (
    'approval', 'status_auto', 'notification', 'sla_escalation',
    'field_auto', 'assignment', 'webhook', 'scheduled'
  )),
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'jobs', 'candidates', 'submissions', 'placements',
    'accounts', 'contacts', 'leads', 'deals', 'activities',
    'employees', 'consultants', 'vendors', 'interviews'
  )),
  trigger_event TEXT NOT NULL CHECK (trigger_event IN (
    'record_created', 'record_updated', 'field_changed',
    'status_changed', 'time_based', 'manual'
  )),
  trigger_conditions JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'disabled', 'archived'
  )),
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES workflows(id),
  schedule_config JSONB, -- For scheduled workflows: { cron: string, timezone: string }
  activated_at TIMESTAMPTZ,
  activated_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,
  UNIQUE(org_id, name, version)
);

-- Add comment for documentation
COMMENT ON TABLE workflows IS 'Workflow automation definitions supporting approval chains, notifications, and business rules';
COMMENT ON COLUMN workflows.workflow_type IS 'Type of workflow: approval, status_auto, notification, sla_escalation, field_auto, assignment, webhook, scheduled';
COMMENT ON COLUMN workflows.trigger_conditions IS 'JSON conditions that must be met for workflow to trigger';
COMMENT ON COLUMN workflows.schedule_config IS 'Configuration for scheduled workflows including cron expression and timezone';

-- ============================================
-- WORKFLOW STEPS (For approval workflows)
-- ============================================
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  approver_type TEXT NOT NULL CHECK (approver_type IN (
    'specific_user', 'record_owner', 'owners_manager',
    'role_based', 'pod_manager', 'custom_formula'
  )),
  approver_config JSONB DEFAULT '{}',
  timeout_hours INTEGER,
  timeout_unit TEXT DEFAULT 'hours' CHECK (timeout_unit IN (
    'minutes', 'hours', 'business_hours', 'days', 'business_days'
  )),
  timeout_action TEXT CHECK (timeout_action IN (
    'escalate', 'auto_approve', 'auto_reject', 'reminder', 'nothing'
  )),
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_percent INTEGER CHECK (reminder_percent >= 0 AND reminder_percent <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE workflow_steps IS 'Individual steps in approval chain workflows';
COMMENT ON COLUMN workflow_steps.approver_type IS 'How to determine the approver: specific_user, record_owner, owners_manager, role_based, pod_manager, custom_formula';
COMMENT ON COLUMN workflow_steps.approver_config IS 'Configuration for approver resolution (e.g., user_id for specific_user, role_name for role_based)';
COMMENT ON COLUMN workflow_steps.timeout_action IS 'What to do when step times out';

-- ============================================
-- WORKFLOW ACTIONS
-- ============================================
CREATE TABLE workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  action_trigger TEXT NOT NULL CHECK (action_trigger IN (
    'on_start', 'on_approval', 'on_rejection', 'on_cancellation',
    'on_completion', 'on_timeout', 'on_each_step'
  )),
  action_order INTEGER NOT NULL DEFAULT 1,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'update_field', 'send_notification', 'create_activity',
    'trigger_webhook', 'run_workflow', 'assign_user', 'create_task'
  )),
  action_config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE workflow_actions IS 'Actions to execute at various workflow stages';
COMMENT ON COLUMN workflow_actions.action_trigger IS 'When to execute this action';
COMMENT ON COLUMN workflow_actions.action_config IS 'Configuration for the action (varies by action_type)';

-- ============================================
-- WORKFLOW EXECUTIONS (Runtime tracking)
-- ============================================
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id),
  workflow_version INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'approved', 'rejected',
    'escalated', 'cancelled', 'expired', 'completed', 'failed'
  )),
  current_step INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),
  completion_notes TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE workflow_executions IS 'Running instances of workflows';
COMMENT ON COLUMN workflow_executions.current_step IS 'Current step number for approval workflows';
COMMENT ON COLUMN workflow_executions.metadata IS 'Additional runtime data for the execution';

-- ============================================
-- WORKFLOW APPROVALS (Approval records)
-- ============================================
CREATE TABLE workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES workflow_steps(id),
  step_order INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES user_profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'escalated', 'expired', 'delegated'
  )),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_notes TEXT,
  reminder_sent_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  delegated_to UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE workflow_approvals IS 'Individual approval requests within workflow executions';

-- ============================================
-- WORKFLOW EXECUTION LOGS (Detailed history)
-- ============================================
CREATE TABLE workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  actor_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE workflow_execution_logs IS 'Detailed audit trail for workflow executions';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Workflows indexes
CREATE INDEX idx_workflows_org_status ON workflows(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_org_type ON workflows(org_id, workflow_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_org_entity ON workflows(org_id, entity_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_org_name ON workflows(org_id, name) WHERE deleted_at IS NULL;
CREATE INDEX idx_workflows_status ON workflows(status) WHERE deleted_at IS NULL;

-- Workflow steps indexes
CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id, step_order);

-- Workflow actions indexes
CREATE INDEX idx_workflow_actions_workflow ON workflow_actions(workflow_id, action_trigger);

-- Workflow executions indexes
CREATE INDEX idx_workflow_executions_entity ON workflow_executions(entity_type, entity_id);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id, status);
CREATE INDEX idx_workflow_executions_org ON workflow_executions(org_id, status);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status, started_at);

-- Workflow approvals indexes
CREATE INDEX idx_workflow_approvals_approver ON workflow_approvals(approver_id, status);
CREATE INDEX idx_workflow_approvals_execution ON workflow_approvals(execution_id);
CREATE INDEX idx_workflow_approvals_pending ON workflow_approvals(status, due_at) WHERE status = 'pending';

-- Workflow execution logs indexes
CREATE INDEX idx_workflow_execution_logs_execution ON workflow_execution_logs(execution_id, created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;

-- Policies for workflows
CREATE POLICY workflows_org_isolation ON workflows
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Policies for workflow_steps (through workflow)
CREATE POLICY workflow_steps_via_workflow ON workflow_steps
  FOR ALL USING (
    workflow_id IN (SELECT id FROM workflows WHERE org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()))
  );

-- Policies for workflow_actions (through workflow)
CREATE POLICY workflow_actions_via_workflow ON workflow_actions
  FOR ALL USING (
    workflow_id IN (SELECT id FROM workflows WHERE org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()))
  );

-- Policies for workflow_executions
CREATE POLICY workflow_executions_org_isolation ON workflow_executions
  FOR ALL USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));

-- Policies for workflow_approvals (through execution)
CREATE POLICY workflow_approvals_via_execution ON workflow_approvals
  FOR ALL USING (
    execution_id IN (SELECT id FROM workflow_executions WHERE org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()))
  );

-- Policies for workflow_execution_logs (through execution)
CREATE POLICY workflow_execution_logs_via_execution ON workflow_execution_logs
  FOR ALL USING (
    execution_id IN (SELECT id FROM workflow_executions WHERE org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()))
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get workflow statistics for an organization
CREATE OR REPLACE FUNCTION get_workflow_stats(p_org_id UUID)
RETURNS TABLE (
  total_count BIGINT,
  active_count BIGINT,
  draft_count BIGINT,
  disabled_count BIGINT,
  total_executions BIGINT,
  pending_approvals BIGINT,
  executions_today BIGINT,
  executions_this_week BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE w.deleted_at IS NULL) as total_count,
    COUNT(*) FILTER (WHERE w.status = 'active' AND w.deleted_at IS NULL) as active_count,
    COUNT(*) FILTER (WHERE w.status = 'draft' AND w.deleted_at IS NULL) as draft_count,
    COUNT(*) FILTER (WHERE w.status = 'disabled' AND w.deleted_at IS NULL) as disabled_count,
    (SELECT COUNT(*) FROM workflow_executions we WHERE we.org_id = p_org_id) as total_executions,
    (SELECT COUNT(*) FROM workflow_approvals wa
     JOIN workflow_executions we ON wa.execution_id = we.id
     WHERE we.org_id = p_org_id AND wa.status = 'pending') as pending_approvals,
    (SELECT COUNT(*) FROM workflow_executions we
     WHERE we.org_id = p_org_id AND we.started_at >= CURRENT_DATE) as executions_today,
    (SELECT COUNT(*) FROM workflow_executions we
     WHERE we.org_id = p_org_id AND we.started_at >= CURRENT_DATE - INTERVAL '7 days') as executions_this_week
  FROM workflows w
  WHERE w.org_id = p_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get execution count for a specific workflow
CREATE OR REPLACE FUNCTION get_workflow_execution_count(p_workflow_id UUID)
RETURNS TABLE (
  total_runs BIGINT,
  successful_runs BIGINT,
  failed_runs BIGINT,
  last_run_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_runs,
    COUNT(*) FILTER (WHERE we.status IN ('approved', 'completed')) as successful_runs,
    COUNT(*) FILTER (WHERE we.status IN ('rejected', 'failed', 'expired')) as failed_runs,
    MAX(we.started_at) as last_run_at
  FROM workflow_executions we
  WHERE we.workflow_id = p_workflow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at on workflows
CREATE OR REPLACE FUNCTION update_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_workflows_updated_at();

-- ============================================
-- GRANTS
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_actions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_executions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_execution_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_workflow_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_workflow_execution_count(UUID) TO authenticated;
