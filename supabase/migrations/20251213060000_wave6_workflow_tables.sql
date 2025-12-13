-- ============================================
-- WAVE 6: WORKFLOW EXECUTION TABLES
-- Issue: WORKFLOWS-01 Phase 1
-- Purpose: Enable the workflow engine to function
-- These tables fix the schema mismatch that broke 18 procedures
-- ============================================

-- 1. Workflow Executions (Run tracking)
-- Tracks individual executions of workflow instances
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,

  -- Execution Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused')),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,

  -- Trigger Info
  triggered_by UUID REFERENCES user_profiles(id),
  trigger_type VARCHAR(50) CHECK (trigger_type IN ('manual', 'automatic', 'scheduled', 'event', 'api')),
  trigger_event JSONB,  -- Event payload that triggered execution

  -- Progress Tracking
  current_step_index INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,

  -- Error Handling
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,

  -- Context (accumulated variables during execution)
  execution_context JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for workflow_executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_instance ON workflow_executions(instance_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_org ON workflow_executions(org_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_retry ON workflow_executions(next_retry_at)
  WHERE status = 'failed' AND retry_count < max_retries;
CREATE INDEX IF NOT EXISTS idx_workflow_executions_running ON workflow_executions(org_id)
  WHERE status = 'running';


-- 2. Workflow Steps (Individual step execution)
-- Tracks execution of each step within an execution
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,

  -- Step Definition Reference
  state_id UUID REFERENCES workflow_states(id),
  transition_id UUID REFERENCES workflow_transitions(id),

  -- Step Details
  step_type VARCHAR(50) NOT NULL CHECK (step_type IN ('state', 'transition', 'action', 'condition', 'wait', 'approval')),
  step_name VARCHAR(255),
  step_config JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'waiting')),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Wait Configuration
  wait_until TIMESTAMPTZ,
  wait_condition JSONB,

  -- Results
  result JSONB,
  error_message TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for workflow_steps
CREATE INDEX IF NOT EXISTS idx_workflow_steps_execution ON workflow_steps(execution_id, position);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_waiting ON workflow_steps(wait_until)
  WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON workflow_steps(execution_id, status);


-- 3. Workflow Actions (Action execution log)
-- Tracks individual action executions within steps
CREATE TABLE IF NOT EXISTS workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,

  -- Action Definition
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
    'send_email', 'send_notification', 'create_task', 'create_activity',
    'update_field', 'webhook', 'wait', 'condition', 'assign', 'escalate',
    'create_document', 'update_status', 'add_note', 'trigger_workflow'
  )),
  action_config JSONB NOT NULL,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'cancelled')),

  -- Timing
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Results
  result JSONB,
  error_message TEXT,
  error_code VARCHAR(50),

  -- Retry
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for workflow_actions
CREATE INDEX IF NOT EXISTS idx_workflow_actions_execution ON workflow_actions(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_step ON workflow_actions(step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_scheduled ON workflow_actions(scheduled_at)
  WHERE status = 'pending' AND scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_actions_status ON workflow_actions(status, created_at DESC)
  WHERE status IN ('pending', 'running', 'failed');


-- 4. Workflow Approvals (Approval chain tracking)
-- Tracks approval requests and responses for workflow steps
CREATE TABLE IF NOT EXISTS workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,

  -- Approver
  approver_id UUID NOT NULL REFERENCES user_profiles(id),
  approver_type VARCHAR(50) CHECK (approver_type IN ('user', 'role', 'manager', 'owner', 'pod_lead')),
  approver_role VARCHAR(100),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'delegated', 'escalated', 'expired', 'cancelled')),

  -- Timing
  requested_at TIMESTAMPTZ DEFAULT now(),
  due_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  -- Response
  response_notes TEXT,

  -- Delegation
  delegated_to UUID REFERENCES user_profiles(id),
  delegated_at TIMESTAMPTZ,
  delegation_reason TEXT,

  -- Escalation
  escalated_to UUID REFERENCES user_profiles(id),
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  escalation_level INTEGER DEFAULT 0,

  -- Sequence (for multi-approver chains)
  sequence_order INTEGER DEFAULT 1,
  is_parallel BOOLEAN DEFAULT false,

  -- Context
  approval_context JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for workflow_approvals
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_execution ON workflow_approvals(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_approver ON workflow_approvals(approver_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_due ON workflow_approvals(due_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_org_pending ON workflow_approvals(org_id)
  WHERE status = 'pending';


-- 5. Workflow Execution Logs (Detailed execution logs)
-- High-volume logging table for debugging and audit
CREATE TABLE IF NOT EXISTS workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  action_id UUID REFERENCES workflow_actions(id) ON DELETE CASCADE,

  -- Log Details
  level VARCHAR(20) NOT NULL DEFAULT 'info'
    CHECK (level IN ('debug', 'info', 'warning', 'error')),
  message TEXT NOT NULL,

  -- Context
  data JSONB,

  -- Source
  source VARCHAR(100),  -- 'engine', 'action', 'trigger', 'condition'

  -- Timing
  occurred_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for workflow_execution_logs
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_execution ON workflow_execution_logs(execution_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_level ON workflow_execution_logs(level, occurred_at DESC)
  WHERE level IN ('warning', 'error');
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_step ON workflow_execution_logs(step_id)
  WHERE step_id IS NOT NULL;


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;

-- Org isolation for workflow_executions
CREATE POLICY org_isolation_workflow_executions ON workflow_executions
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Org isolation for workflow_approvals
CREATE POLICY org_isolation_workflow_approvals ON workflow_approvals
  FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Execution-based access for workflow_steps (inherit from parent execution)
CREATE POLICY execution_access_workflow_steps ON workflow_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workflow_executions we
      WHERE we.id = execution_id
      AND we.org_id = current_setting('app.org_id', true)::uuid
    )
  );

-- Execution-based access for workflow_actions
CREATE POLICY execution_access_workflow_actions ON workflow_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workflow_executions we
      WHERE we.id = execution_id
      AND we.org_id = current_setting('app.org_id', true)::uuid
    )
  );

-- Execution-based access for workflow_execution_logs
CREATE POLICY execution_access_workflow_logs ON workflow_execution_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workflow_executions we
      WHERE we.id = execution_id
      AND we.org_id = current_setting('app.org_id', true)::uuid
    )
  );


-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get pending approvals for a user
CREATE OR REPLACE FUNCTION get_pending_approvals(p_user_id UUID)
RETURNS TABLE (
  approval_id UUID,
  execution_id UUID,
  workflow_name VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  requested_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  approval_context JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wa.id AS approval_id,
    wa.execution_id,
    w.name AS workflow_name,
    wi.entity_type,
    wi.entity_id,
    wa.requested_at,
    wa.due_at,
    wa.approval_context
  FROM workflow_approvals wa
  JOIN workflow_executions we ON we.id = wa.execution_id
  JOIN workflow_instances wi ON wi.id = we.instance_id
  JOIN workflows w ON w.id = wi.workflow_id
  WHERE wa.approver_id = p_user_id
    AND wa.status = 'pending'
  ORDER BY wa.due_at ASC NULLS LAST, wa.requested_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to cancel all pending actions when execution fails
CREATE OR REPLACE FUNCTION cancel_pending_workflow_actions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'failed' OR NEW.status = 'cancelled' THEN
    UPDATE workflow_actions
    SET status = 'cancelled',
        completed_at = now()
    WHERE execution_id = NEW.id
      AND status IN ('pending', 'running');

    UPDATE workflow_approvals
    SET status = 'cancelled',
        updated_at = now()
    WHERE execution_id = NEW.id
      AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cancel_pending_actions
  AFTER UPDATE OF status ON workflow_executions
  FOR EACH ROW
  WHEN (NEW.status IN ('failed', 'cancelled'))
  EXECUTE FUNCTION cancel_pending_workflow_actions();


-- Function to auto-escalate expired approvals
CREATE OR REPLACE FUNCTION escalate_expired_approvals()
RETURNS INTEGER AS $$
DECLARE
  escalated_count INTEGER := 0;
BEGIN
  UPDATE workflow_approvals
  SET
    status = 'expired',
    updated_at = now()
  WHERE status = 'pending'
    AND due_at IS NOT NULL
    AND due_at < now();

  GET DIAGNOSTICS escalated_count = ROW_COUNT;
  RETURN escalated_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE workflow_executions IS 'Tracks individual runs of workflow instances. Each trigger creates a new execution.';
COMMENT ON TABLE workflow_steps IS 'Individual steps within a workflow execution. Maps to states, transitions, or standalone actions.';
COMMENT ON TABLE workflow_actions IS 'Specific actions executed within steps (email, notification, field update, etc).';
COMMENT ON TABLE workflow_approvals IS 'Approval requests for workflows requiring human approval before proceeding.';
COMMENT ON TABLE workflow_execution_logs IS 'Detailed logging for workflow executions. High volume - consider retention policy.';

COMMENT ON COLUMN workflow_executions.trigger_event IS 'JSON payload containing the event that triggered this execution';
COMMENT ON COLUMN workflow_executions.execution_context IS 'Accumulated context/variables available to all steps';
COMMENT ON COLUMN workflow_steps.wait_until IS 'For wait steps, when the wait period ends';
COMMENT ON COLUMN workflow_approvals.is_parallel IS 'If true, all approvers in same sequence_order can approve in parallel';


-- ============================================
-- NOTIFICATION INFRASTRUCTURE TABLES
-- Issue: NOTIFICATIONS-01
-- Purpose: Enable user notification preferences and templates
-- ============================================

-- 1. Notification Preferences (User settings per category)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Category (matches notifications.category)
  category VARCHAR(100) NOT NULL,

  -- Channel Preferences (which channels for this category)
  channels JSONB DEFAULT '["in_app"]',
  -- Example: ["in_app", "email"] or ["in_app", "email", "sms"]

  -- Frequency Settings
  frequency VARCHAR(50) DEFAULT 'immediate'
    CHECK (frequency IN ('immediate', 'hourly_digest', 'daily_digest', 'weekly_digest', 'never')),

  -- Digest Configuration
  digest_time TIME DEFAULT '09:00',  -- When to send daily/weekly digest
  digest_day VARCHAR(10) DEFAULT 'monday',  -- For weekly digest

  -- Quiet Hours (no notifications during this window)
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  quiet_hours_timezone VARCHAR(50) DEFAULT 'America/New_York',

  -- Do Not Disturb (temporary override)
  dnd_enabled BOOLEAN DEFAULT false,
  dnd_until TIMESTAMPTZ,

  -- Sound/Vibration (for push notifications)
  sound_enabled BOOLEAN DEFAULT true,

  -- Email Specific
  email_unsubscribed BOOLEAN DEFAULT false,
  email_unsubscribed_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_user_category UNIQUE(user_id, category)
);

-- Indexes for notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_org_user ON notification_preferences(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_dnd ON notification_preferences(dnd_until)
  WHERE dnd_enabled = true;


-- 2. Notification Templates (Reusable notification content)
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,  -- NULL for system templates

  -- Template Identity
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,  -- Programmatic identifier (e.g., 'submission_created')
  description TEXT,
  category VARCHAR(100) NOT NULL,

  -- In-App Content (with variable placeholders {{variable}})
  title_template VARCHAR(500) NOT NULL,
  message_template TEXT NOT NULL,

  -- Default Type and Priority
  default_type VARCHAR(50) DEFAULT 'info'
    CHECK (default_type IN ('info', 'success', 'warning', 'error', 'action_required')),
  default_priority VARCHAR(20) DEFAULT 'normal'
    CHECK (default_priority IN ('low', 'normal', 'high', 'urgent')),

  -- Action Configuration
  action_url_template TEXT,  -- Template for action URL (e.g., '/jobs/{{job.id}}')
  action_label VARCHAR(100),

  -- Channel-Specific Templates
  email_subject_template VARCHAR(500),
  email_body_template TEXT,  -- HTML template
  email_body_text_template TEXT,  -- Plain text fallback

  sms_template VARCHAR(500),  -- Max 160 chars recommended

  push_title_template VARCHAR(100),
  push_body_template VARCHAR(255),
  push_image_url TEXT,

  -- Default Channels for this Template
  default_channels JSONB DEFAULT '["in_app"]',

  -- Variables Definition (for validation and documentation)
  variables JSONB DEFAULT '[]',
  -- Example: [
  --   { "name": "job.title", "type": "string", "required": true, "description": "Job title" },
  --   { "name": "candidate.name", "type": "string", "required": true }
  -- ]

  -- Conditions (when to use this template)
  conditions JSONB DEFAULT '{}',
  -- Example: { "entity_type": "submission", "event": "created" }

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,  -- Built-in templates (cannot be deleted)

  -- Versioning
  version INTEGER DEFAULT 1,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Unique constraint for template slug per org (or globally for system templates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_templates_unique_slug ON notification_templates(COALESCE(org_id, '00000000-0000-0000-0000-000000000000'), slug)
  WHERE is_active = true;

-- Indexes for notification_templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_org ON notification_templates(org_id)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON notification_templates(org_id, category)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notification_templates_slug ON notification_templates(slug)
  WHERE is_active = true;


-- ============================================
-- RLS POLICIES FOR NOTIFICATION TABLES
-- ============================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own preferences
CREATE POLICY user_isolation_notification_preferences ON notification_preferences
  FOR ALL USING (user_id = current_setting('app.user_id', true)::uuid);

-- Org isolation for templates (system templates visible to all)
CREATE POLICY org_isolation_notification_templates ON notification_templates
  FOR ALL USING (
    org_id IS NULL  -- System templates visible to all
    OR org_id = current_setting('app.org_id', true)::uuid
  );


-- ============================================
-- DEFAULT NOTIFICATION TEMPLATES (Seed Data)
-- Insert system-level notification templates
-- ============================================

INSERT INTO notification_templates (
  org_id, name, slug, category,
  title_template, message_template,
  email_subject_template, email_body_template,
  default_channels, is_system, variables
) VALUES
-- Submission Notifications
(NULL, 'Submission Created', 'submission_created', 'submission',
 'New submission for {{job.title}}',
 '{{candidate.name}} was submitted to {{job.title}} by {{submitter.name}}',
 'New Candidate Submission: {{job.title}}',
 '<p>A new candidate has been submitted:</p><p><strong>Candidate:</strong> {{candidate.name}}</p><p><strong>Job:</strong> {{job.title}}</p>',
 '["in_app", "email"]', true,
 '[{"name": "job.title", "type": "string", "required": true}, {"name": "candidate.name", "type": "string", "required": true}, {"name": "submitter.name", "type": "string", "required": true}]'),

(NULL, 'Submission Status Changed', 'submission_status_changed', 'submission',
 'Submission status: {{status}}',
 '{{candidate.name}} for {{job.title}} is now {{status}}',
 'Submission Update: {{candidate.name}} - {{status}}',
 '<p>Submission status has been updated:</p><p><strong>Candidate:</strong> {{candidate.name}}</p><p><strong>Status:</strong> {{status}}</p>',
 '["in_app"]', true,
 '[{"name": "status", "type": "string", "required": true}]'),

-- Interview Notifications
(NULL, 'Interview Scheduled', 'interview_scheduled', 'interview',
 'Interview scheduled: {{candidate.name}}',
 'Interview with {{candidate.name}} for {{job.title}} on {{interview.date}} at {{interview.time}}',
 'Interview Scheduled: {{candidate.name}} for {{job.title}}',
 '<p>An interview has been scheduled:</p><p><strong>Candidate:</strong> {{candidate.name}}</p><p><strong>Date:</strong> {{interview.date}}</p><p><strong>Time:</strong> {{interview.time}}</p>',
 '["in_app", "email"]', true,
 '[{"name": "interview.date", "type": "string", "required": true}, {"name": "interview.time", "type": "string", "required": true}]'),

-- Deal Notifications
(NULL, 'Deal Stage Changed', 'deal_stage_changed', 'deal',
 'Deal moved to {{stage}}',
 '{{deal.name}} has been moved to {{stage}}',
 'Deal Update: {{deal.name}} - {{stage}}',
 '<p>Deal stage has been updated:</p><p><strong>Deal:</strong> {{deal.name}}</p><p><strong>New Stage:</strong> {{stage}}</p>',
 '["in_app"]', true,
 '[{"name": "deal.name", "type": "string", "required": true}, {"name": "stage", "type": "string", "required": true}]'),

(NULL, 'Deal Closed Won', 'deal_closed_won', 'deal',
 'Deal Won: {{deal.name}}',
 '{{deal.name}} worth {{deal.value}} has been closed won!',
 'Congratulations! Deal Won: {{deal.name}}',
 '<p>Great news! A deal has been closed:</p><p><strong>Deal:</strong> {{deal.name}}</p><p><strong>Value:</strong> {{deal.value}}</p>',
 '["in_app", "email"]', true,
 '[{"name": "deal.name", "type": "string", "required": true}, {"name": "deal.value", "type": "string", "required": true}]'),

-- Assignment Notifications
(NULL, 'Task Assigned', 'task_assigned', 'assignment',
 'New task assigned',
 '{{assigner.name}} assigned you: {{task.title}}',
 'New Task: {{task.title}}',
 '<p>You have been assigned a new task:</p><p><strong>Task:</strong> {{task.title}}</p><p><strong>Assigned by:</strong> {{assigner.name}}</p>',
 '["in_app", "email"]', true,
 '[{"name": "task.title", "type": "string", "required": true}, {"name": "assigner.name", "type": "string", "required": true}]'),

-- Workflow Notifications
(NULL, 'Approval Required', 'approval_required', 'workflow',
 'Approval needed: {{item.title}}',
 '{{requester.name}} is requesting your approval for {{item.title}}',
 'Approval Request: {{item.title}}',
 '<p>Your approval is required:</p><p><strong>Item:</strong> {{item.title}}</p><p><strong>Requested by:</strong> {{requester.name}}</p><p><a href="{{action_url}}">Review and Approve</a></p>',
 '["in_app", "email"]', true,
 '[{"name": "item.title", "type": "string", "required": true}, {"name": "requester.name", "type": "string", "required": true}]'),

-- Campaign Notifications
(NULL, 'Campaign Activated', 'campaign_activated', 'campaign',
 'Campaign is now live',
 '{{campaign.name}} has been activated with {{campaign.enrolled_count}} prospects',
 'Campaign Live: {{campaign.name}}',
 '<p>Your campaign is now active:</p><p><strong>Campaign:</strong> {{campaign.name}}</p><p><strong>Enrolled:</strong> {{campaign.enrolled_count}} prospects</p>',
 '["in_app"]', true,
 '[{"name": "campaign.name", "type": "string", "required": true}]'),

-- Mention Notifications
(NULL, 'Mentioned in Comment', 'mention_comment', 'mention',
 '{{mentioner.name}} mentioned you',
 '{{mentioner.name}} mentioned you in a comment on {{entity.name}}',
 'You were mentioned: {{entity.name}}',
 '<p>{{mentioner.name}} mentioned you:</p><blockquote>{{comment.excerpt}}</blockquote>',
 '["in_app", "email"]', true,
 '[{"name": "mentioner.name", "type": "string", "required": true}]')
ON CONFLICT DO NOTHING;


-- ============================================
-- DEALS SCHEMA ENHANCEMENTS
-- Issue: DEALS-01
-- Purpose: Add missing FK and provide backward compatibility
-- ============================================

-- 1. Add lead_contact_id FK (links deal to lead contact)
-- This column may already exist, so we use a DO block for safety
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'lead_contact_id'
  ) THEN
    ALTER TABLE deals ADD COLUMN lead_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_deals_lead_contact ON deals(lead_contact_id)
  WHERE deleted_at IS NULL;

-- 2. Create legacy view for deal_stages_history → entity_history compatibility
-- Note: The actual table has stage names (text), not stage IDs
CREATE OR REPLACE VIEW deal_stages_history_legacy AS
SELECT
  dsh.id,
  d.org_id,
  dsh.deal_id AS entity_id,
  'deal'::text AS entity_type,
  'stage_change'::text AS change_type,
  'stage'::text AS field_name,
  to_jsonb(dsh.previous_stage) AS old_value,
  to_jsonb(dsh.stage) AS new_value,
  dsh.changed_by,
  dsh.entered_at AS changed_at,
  jsonb_build_object(
    'duration_days', dsh.duration_days,
    'notes', dsh.notes,
    'reason', dsh.reason
  ) AS metadata
FROM deal_stages_history dsh
LEFT JOIN deals d ON d.id = dsh.deal_id;

-- 3. Note: deals table already has company_id column
-- No additional view needed for backward compatibility


-- ============================================
-- NOTIFICATION TABLE COMMENTS
-- ============================================

COMMENT ON TABLE notification_preferences IS 'User-specific notification preferences per category. Controls channels, frequency, and quiet hours.';
COMMENT ON TABLE notification_templates IS 'Reusable notification templates with variable support. System templates (org_id NULL) are global.';

COMMENT ON COLUMN notification_preferences.channels IS 'Array of enabled channels: in_app, email, sms, push';
COMMENT ON COLUMN notification_preferences.frequency IS 'Delivery frequency: immediate, hourly_digest, daily_digest, weekly_digest, never';
COMMENT ON COLUMN notification_preferences.quiet_hours_enabled IS 'When true, only in_app notifications during quiet hours';
COMMENT ON COLUMN notification_templates.slug IS 'Unique identifier for programmatic access (e.g., submission_created)';
COMMENT ON COLUMN notification_templates.variables IS 'JSON schema defining available merge variables';
COMMENT ON COLUMN notification_templates.is_system IS 'System templates cannot be deleted and are visible to all orgs';
