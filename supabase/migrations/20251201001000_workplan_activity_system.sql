-- ============================================================================
-- Migration: Workplan & Activity System (Guidewire-inspired)
-- Date: 2025-12-01
-- Description: Comprehensive activity-centric workflow system with:
--              - Activity patterns (templates)
--              - Workplan templates and instances
--              - Activities (unified past/future tasks)
--              - SLA tracking, work queues, bulk operations, metrics
-- Core Principle: "No work is done unless an activity is created"
-- ============================================================================

-- ============================================================================
-- 1. ACTIVITY PATTERNS (Templates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identity
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Timing
  target_days INTEGER DEFAULT 1,
  escalation_days INTEGER,

  -- Assignment defaults
  default_assignee TEXT DEFAULT 'owner', -- 'owner', 'group', 'user', 'auto'
  assignee_group_id UUID REFERENCES pods(id),
  assignee_user_id UUID REFERENCES user_profiles(id),

  -- Priority
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Automation
  auto_complete BOOLEAN DEFAULT FALSE,
  auto_complete_condition JSONB,
  auto_action TEXT, -- 'create_interview', 'create_offer', etc.
  auto_action_config JSONB,

  -- Categorization
  category TEXT,
  entity_type TEXT NOT NULL, -- 'job', 'lead', 'submission'

  -- Instructions
  instructions TEXT,
  checklist JSONB, -- Legacy - use pattern_checklist_items

  -- Metadata
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, code)
);

CREATE INDEX IF NOT EXISTS activity_patterns_entity_type_idx ON activity_patterns(entity_type);

COMMENT ON TABLE activity_patterns IS 'Reusable activity templates with default configuration';

-- ============================================================================
-- 2. PATTERN FIELDS (Custom Fields for Patterns)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pattern_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES activity_patterns(id) ON DELETE CASCADE,

  -- Field definition
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL, -- 'text', 'number', 'date', 'select', 'multiselect', 'boolean'

  -- Validation
  is_required BOOLEAN DEFAULT FALSE,
  default_value TEXT,
  validation_rules JSONB, -- { min, max, pattern, options }

  -- Display
  order_index INTEGER DEFAULT 0,
  placeholder TEXT,
  help_text TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(pattern_id, field_name)
);

COMMENT ON TABLE pattern_fields IS 'Custom fields configuration for activity patterns';

-- ============================================================================
-- 3. PATTERN CHECKLIST ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pattern_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES activity_patterns(id) ON DELETE CASCADE,

  -- Item details
  item_text TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT FALSE,

  -- Auto-completion
  auto_complete_condition JSONB,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE pattern_checklist_items IS 'Checklist items for activity patterns';

-- ============================================================================
-- 4. ACTIVITY PATTERN SUCCESSORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_pattern_successors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES activity_patterns(id) ON DELETE CASCADE,
  successor_pattern_id UUID NOT NULL REFERENCES activity_patterns(id) ON DELETE CASCADE,

  -- Conditional triggering
  condition_type TEXT DEFAULT 'always', -- 'always', 'field_equals', 'field_in', 'expression'
  condition_field TEXT,
  condition_value TEXT,
  condition_expression JSONB,

  -- Timing
  delay_days INTEGER DEFAULT 0,

  -- Order
  order_index INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(pattern_id, successor_pattern_id)
);

COMMENT ON TABLE activity_pattern_successors IS 'Sequential flow of activity patterns';

-- ============================================================================
-- 5. WORKPLAN TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS workplan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identity
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Entity type
  entity_type TEXT NOT NULL,

  -- Trigger configuration
  trigger_event TEXT DEFAULT 'manual', -- 'create', 'status_change', 'field_change', 'manual'
  trigger_status TEXT,
  trigger_field TEXT,
  trigger_condition JSONB,

  -- Completion criteria
  completion_criteria TEXT DEFAULT 'all_required', -- 'all_required', 'all_activities', 'manual'

  -- Metadata
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, code)
);

COMMENT ON TABLE workplan_templates IS 'Workflow templates with activity sequences';

-- ============================================================================
-- 6. WORKPLAN PHASES
-- ============================================================================

CREATE TABLE IF NOT EXISTS workplan_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workplan_templates(id) ON DELETE CASCADE,

  -- Phase details
  phase_name TEXT NOT NULL,
  phase_code TEXT NOT NULL,
  description TEXT,

  -- Ordering
  order_index INTEGER DEFAULT 0,

  -- Completion criteria
  completion_criteria TEXT DEFAULT 'all_required', -- 'all_required', 'all_activities', 'any', 'manual'

  -- Auto-progression
  auto_advance BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(template_id, phase_code)
);

COMMENT ON TABLE workplan_phases IS 'Workflow phases for organizing activities';

-- ============================================================================
-- 7. WORKPLAN TEMPLATE ACTIVITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS workplan_template_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workplan_templates(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES activity_patterns(id) ON DELETE CASCADE,

  -- Ordering
  order_index INTEGER NOT NULL DEFAULT 0,
  phase TEXT, -- 'sourcing', 'screening', 'closing'

  -- Requirements
  is_required BOOLEAN DEFAULT TRUE,
  skip_condition JSONB,

  -- Parallel execution
  can_run_parallel BOOLEAN DEFAULT FALSE,
  depends_on_activity_ids UUID[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(template_id, pattern_id)
);

COMMENT ON TABLE workplan_template_activities IS 'Activity patterns within workplan templates';

-- ============================================================================
-- 8. WORKPLAN INSTANCES (Runtime)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workplan_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workplan_templates(id),

  -- Link to entity (polymorphic)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Template info (denormalized)
  template_code TEXT,
  template_name TEXT,

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'canceled'

  -- Progress tracking
  total_activities INTEGER DEFAULT 0,
  completed_activities INTEGER DEFAULT 0,
  skipped_activities INTEGER DEFAULT 0,
  -- progress_percentage calculated

  -- Current phase
  current_phase TEXT,

  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Outcome
  outcome TEXT,
  outcome_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workplan_instances_entity_idx ON workplan_instances(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS workplan_instances_status_idx ON workplan_instances(status);

COMMENT ON TABLE workplan_instances IS 'Runtime workplan execution tracking';

-- ============================================================================
-- 9. ACTIVITIES (Runtime - Unified past activities + future tasks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Link to pattern/workplan
  pattern_code TEXT,
  pattern_id UUID REFERENCES activity_patterns(id),
  workplan_instance_id UUID REFERENCES workplan_instances(id) ON DELETE SET NULL,

  -- Link to entity (polymorphic)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Activity details
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  category TEXT,

  -- Activity type (CRITICAL for unified table)
  activity_type TEXT NOT NULL DEFAULT 'task', -- 'email', 'call', 'meeting', 'note', 'task'
  direction TEXT, -- 'inbound', 'outbound' for emails/calls

  -- Instructions/checklist
  instructions TEXT,
  checklist JSONB, -- Legacy - use activity_checklist_items
  checklist_progress JSONB,

  -- Assignment (REQUIRED)
  assigned_to UUID NOT NULL REFERENCES user_profiles(id),
  assigned_group UUID REFERENCES pods(id),
  assigned_at TIMESTAMPTZ,

  -- Dates
  due_date TIMESTAMPTZ NOT NULL, -- REQUIRED
  escalation_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ, -- For scheduled activities

  -- Status (lifecycle: scheduled → open → in_progress → completed/skipped/canceled)
  status TEXT DEFAULT 'open', -- 'scheduled', 'open', 'in_progress', 'completed', 'skipped', 'canceled', 'blocked'

  -- Outcome
  outcome TEXT,
  outcome_notes TEXT,

  -- Automation flags
  auto_created BOOLEAN DEFAULT FALSE,
  auto_completed BOOLEAN DEFAULT FALSE,

  -- Predecessor tracking
  predecessor_activity_id UUID REFERENCES activities(id),
  parent_activity_id UUID REFERENCES activities(id), -- For follow-up chains

  -- Escalation tracking
  escalation_count INTEGER DEFAULT 0,
  last_escalated_at TIMESTAMPTZ,

  -- Reminder tracking
  reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS activities_entity_idx ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS activities_assigned_to_idx ON activities(assigned_to);
CREATE INDEX IF NOT EXISTS activities_status_idx ON activities(status);
CREATE INDEX IF NOT EXISTS activities_due_date_idx ON activities(due_date);
CREATE INDEX IF NOT EXISTS activities_activity_type_idx ON activities(activity_type);

COMMENT ON TABLE activities IS 'Unified table for all activities (past actions + future tasks)';

-- ============================================================================
-- 10. ACTIVITY PARTICIPANTS (RCAI Model)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- RCAI role
  role TEXT NOT NULL, -- 'responsible', 'accountable', 'consulted', 'informed'

  -- Permissions
  permission TEXT DEFAULT 'view', -- 'edit', 'view'
  is_primary BOOLEAN DEFAULT FALSE,

  -- Notification preferences
  notify_on_update BOOLEAN DEFAULT TRUE,

  -- Metadata
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES user_profiles(id),

  UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS activity_participants_activity_idx ON activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS activity_participants_user_idx ON activity_participants(user_id);

COMMENT ON TABLE activity_participants IS 'RCAI (Responsible, Accountable, Consulted, Informed) model for activities';

-- ============================================================================
-- 11. ACTIVITY FIELD VALUES
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES pattern_fields(id) ON DELETE CASCADE,

  -- Value (stored as text, typed by field definition)
  field_value TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(activity_id, field_id)
);

COMMENT ON TABLE activity_field_values IS 'Custom field values for activity instances';

-- ============================================================================
-- 12. ACTIVITY CHECKLIST ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  pattern_checklist_item_id UUID REFERENCES pattern_checklist_items(id),

  -- Item details
  item_text TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,

  -- Completion
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE activity_checklist_items IS 'Checklist items for activity instances';

-- ============================================================================
-- 13. ACTIVITY COMMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  -- Comment details
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'comment', -- 'comment', 'note', 'system'

  -- Threading
  parent_comment_id UUID REFERENCES activity_comments(id),

  -- Mentions
  mentioned_users UUID[],

  -- Visibility
  is_internal BOOLEAN DEFAULT FALSE,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS activity_comments_activity_idx ON activity_comments(activity_id);

COMMENT ON TABLE activity_comments IS 'Comments and discussion threads for activities';

-- ============================================================================
-- 14. ACTIVITY ATTACHMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  -- File details
  file_name TEXT NOT NULL,
  file_size INTEGER, -- bytes
  file_type TEXT, -- MIME type
  file_url TEXT NOT NULL,
  storage_key TEXT, -- S3/storage key

  -- Metadata
  description TEXT,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Audit
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS activity_attachments_activity_idx ON activity_attachments(activity_id);

COMMENT ON TABLE activity_attachments IS 'File attachments for activities';

-- ============================================================================
-- 15. ACTIVITY REMINDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Reminder timing
  remind_at TIMESTAMPTZ NOT NULL,
  reminder_type TEXT DEFAULT 'relative', -- 'relative', 'absolute'
  relative_days INTEGER, -- Days before due date
  relative_hours INTEGER, -- Hours before due date

  -- Notification channel
  channel TEXT DEFAULT 'email', -- 'email', 'push', 'sms', 'in_app'

  -- Status
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_reminders_activity_idx ON activity_reminders(activity_id);
CREATE INDEX IF NOT EXISTS activity_reminders_remind_at_idx ON activity_reminders(remind_at);

COMMENT ON TABLE activity_reminders IS 'Reminder configuration for activities';

-- ============================================================================
-- 16. ACTIVITY TIME ENTRIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Time tracking
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER, -- Calculated or manual

  -- Entry details
  description TEXT,
  is_billable BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_time_entries_activity_idx ON activity_time_entries(activity_id);
CREATE INDEX IF NOT EXISTS activity_time_entries_user_idx ON activity_time_entries(user_id);

COMMENT ON TABLE activity_time_entries IS 'Time tracking for activities';

-- ============================================================================
-- 17. ACTIVITY DEPENDENCIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  depends_on_activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  -- Dependency type
  dependency_type TEXT DEFAULT 'finish_to_start', -- 'finish_to_start', 'start_to_start', 'finish_to_finish'

  -- Lag time
  lag_days INTEGER DEFAULT 0,

  -- Enforcement
  is_strict BOOLEAN DEFAULT TRUE, -- Block or just warn

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(activity_id, depends_on_activity_id)
);

CREATE INDEX IF NOT EXISTS activity_dependencies_activity_idx ON activity_dependencies(activity_id);

COMMENT ON TABLE activity_dependencies IS 'Blocking dependencies between activities';

-- ============================================================================
-- 18. ACTIVITY AUTO RULES (Event-Driven Auto-Creation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_auto_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Rule identity
  rule_name TEXT NOT NULL,
  rule_code TEXT NOT NULL,
  description TEXT,

  -- Trigger configuration
  event_type TEXT NOT NULL, -- 'job.created', 'submission.status_changed', etc.
  event_category TEXT NOT NULL,
  entity_type TEXT NOT NULL,

  -- Condition
  condition JSONB, -- { field: 'status', operator: 'equals', value: 'submitted' }

  -- Action: Create Activity
  activity_pattern_id UUID NOT NULL REFERENCES activity_patterns(id),
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,

  -- Assignment override
  assign_to_field TEXT, -- 'event.actor_id', 'entity.owner_id'
  assign_to_user_id UUID REFERENCES user_profiles(id),
  assign_to_group_id UUID REFERENCES pods(id),

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- Execution order
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, rule_code)
);

CREATE INDEX IF NOT EXISTS activity_auto_rules_event_type_idx ON activity_auto_rules(event_type);

COMMENT ON TABLE activity_auto_rules IS 'Event-driven rules for automatic activity creation';

-- ============================================================================
-- 19. ACTIVITY HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  -- What changed
  action TEXT NOT NULL, -- 'created', 'status_changed', 'assigned', 'escalated', 'updated'
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,

  -- Who/when
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Context
  notes TEXT
);

CREATE INDEX IF NOT EXISTS activity_history_activity_idx ON activity_history(activity_id);
CREATE INDEX IF NOT EXISTS activity_history_changed_at_idx ON activity_history(changed_at);

COMMENT ON TABLE activity_history IS 'Audit trail of activity changes';

-- ============================================================================
-- 20. SLA DEFINITIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- SLA identity
  sla_name TEXT NOT NULL,
  sla_code TEXT NOT NULL,
  description TEXT,

  -- Applicability
  entity_type TEXT NOT NULL, -- 'activity', 'submission', 'job'
  activity_type TEXT, -- If entity_type = 'activity'
  activity_category TEXT,
  priority TEXT, -- Apply to specific priority

  -- SLA thresholds (in hours)
  target_hours INTEGER NOT NULL,
  warning_hours INTEGER, -- Warning threshold
  critical_hours INTEGER, -- Critical threshold

  -- Business hours
  use_business_hours BOOLEAN DEFAULT FALSE,
  business_hours_start TEXT DEFAULT '09:00',
  business_hours_end TEXT DEFAULT '17:00',

  -- Escalation
  escalate_on_breach BOOLEAN DEFAULT FALSE,
  escalate_to_user_id UUID REFERENCES user_profiles(id),
  escalate_to_group_id UUID REFERENCES pods(id),

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, sla_code)
);

COMMENT ON TABLE sla_definitions IS 'SLA (Service Level Agreement) configuration';

-- ============================================================================
-- 21. SLA INSTANCES (Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sla_definition_id UUID NOT NULL REFERENCES sla_definitions(id),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  -- SLA tracking
  start_time TIMESTAMPTZ NOT NULL,
  target_time TIMESTAMPTZ NOT NULL,
  warning_time TIMESTAMPTZ,
  critical_time TIMESTAMPTZ,

  -- Completion
  completed_at TIMESTAMPTZ,

  -- SLA status
  status TEXT DEFAULT 'active', -- 'active', 'met', 'warning', 'critical', 'breached', 'paused'
  paused_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,

  -- Breach tracking
  breach_duration INTEGER, -- Minutes breached
  is_breached BOOLEAN DEFAULT FALSE,
  breached_at TIMESTAMPTZ,

  -- Escalation tracking
  escalation_sent BOOLEAN DEFAULT FALSE,
  escalation_sent_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sla_instances_activity_idx ON sla_instances(activity_id);
CREATE INDEX IF NOT EXISTS sla_instances_status_idx ON sla_instances(status);
CREATE INDEX IF NOT EXISTS sla_instances_target_time_idx ON sla_instances(target_time);

COMMENT ON TABLE sla_instances IS 'SLA tracking for individual activities';

-- ============================================================================
-- 22. WORK QUEUES
-- ============================================================================

CREATE TABLE IF NOT EXISTS work_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Queue identity
  queue_name TEXT NOT NULL,
  queue_code TEXT NOT NULL,
  description TEXT,

  -- Queue configuration
  queue_type TEXT DEFAULT 'activity', -- 'activity', 'submission', 'lead'
  entity_type TEXT,

  -- Assignment
  assigned_to_group_id UUID REFERENCES pods(id),
  assignment_strategy TEXT DEFAULT 'round_robin', -- 'round_robin', 'load_balanced', 'manual'

  -- Filtering
  filter_criteria JSONB, -- Auto-populate queue based on criteria

  -- Display
  sort_order TEXT DEFAULT 'priority_desc', -- 'priority_desc', 'due_date_asc', etc.

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, queue_code)
);

COMMENT ON TABLE work_queues IS 'Work queue definitions for activity management';

-- ============================================================================
-- 23. QUEUE ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES work_queues(id) ON DELETE CASCADE,

  -- Link to entity (polymorphic)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Queue position
  priority INTEGER DEFAULT 0, -- Higher = higher priority
  order_index INTEGER DEFAULT 0,

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),
  assigned_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'queued', -- 'queued', 'assigned', 'in_progress', 'completed', 'removed'

  -- Timestamps
  enqueued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB, -- Additional context

  UNIQUE(queue_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS queue_items_queue_idx ON queue_items(queue_id);
CREATE INDEX IF NOT EXISTS queue_items_entity_idx ON queue_items(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS queue_items_status_idx ON queue_items(status);

COMMENT ON TABLE queue_items IS 'Items in work queues';

-- ============================================================================
-- 24. BULK ACTIVITY JOBS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bulk_activity_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Job details
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL, -- 'create_activities', 'update_activities', 'assign_activities', 'complete_activities'

  -- Target configuration
  activity_pattern_id UUID REFERENCES activity_patterns(id),
  target_entity_type TEXT, -- 'job', 'lead', 'submission'
  target_entity_ids UUID[], -- List of entity IDs
  target_criteria JSONB, -- Or criteria to select entities

  -- Operation details
  operation JSONB NOT NULL, -- { action: 'create', params: {...} }

  -- Progress tracking
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'canceled'
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,

  -- Results
  error_log JSONB, -- Array of errors
  result_summary JSONB,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS bulk_activity_jobs_status_idx ON bulk_activity_jobs(status);
CREATE INDEX IF NOT EXISTS bulk_activity_jobs_created_by_idx ON bulk_activity_jobs(created_by);

COMMENT ON TABLE bulk_activity_jobs IS 'Bulk operations on activities';

-- ============================================================================
-- 25. ACTIVITY METRICS (Aggregated)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Dimension (what this metric is for)
  metric_date TIMESTAMPTZ NOT NULL, -- Daily rollup
  entity_type TEXT, -- Metrics by entity type
  activity_type TEXT, -- Metrics by activity type
  activity_category TEXT,
  user_id UUID REFERENCES user_profiles(id), -- Metrics by user
  pod_id UUID REFERENCES pods(id), -- Metrics by team

  -- Volume metrics
  total_activities INTEGER DEFAULT 0,
  created_activities INTEGER DEFAULT 0,
  completed_activities INTEGER DEFAULT 0,
  overdue_activities INTEGER DEFAULT 0,

  -- Completion metrics
  completion_rate DECIMAL(5, 2), -- Percentage
  avg_completion_time_hours DECIMAL(10, 2),

  -- SLA metrics
  sla_met_count INTEGER DEFAULT 0,
  sla_breached_count INTEGER DEFAULT 0,
  sla_compliance_rate DECIMAL(5, 2),

  -- Time tracking
  total_time_minutes INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_metrics_date_idx ON activity_metrics(metric_date);
CREATE INDEX IF NOT EXISTS activity_metrics_user_idx ON activity_metrics(user_id);
CREATE INDEX IF NOT EXISTS activity_metrics_pod_idx ON activity_metrics(pod_id);

COMMENT ON TABLE activity_metrics IS 'Aggregated activity performance metrics';

-- ============================================================================
-- 26. TEAM METRICS (Aggregated by Pod/Team)
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pod_id UUID NOT NULL REFERENCES pods(id),

  -- Time dimension
  metric_date TIMESTAMPTZ NOT NULL,
  metric_period TEXT DEFAULT 'day', -- 'day', 'week', 'month', 'quarter'

  -- Team performance
  total_activities INTEGER DEFAULT 0,
  completed_activities INTEGER DEFAULT 0,
  avg_response_time_hours DECIMAL(10, 2),
  avg_resolution_time_hours DECIMAL(10, 2),

  -- Workload distribution
  total_active_members INTEGER DEFAULT 0,
  avg_activities_per_member DECIMAL(10, 2),

  -- SLA performance
  sla_compliance_rate DECIMAL(5, 2),

  -- Productivity
  activities_created_per_day DECIMAL(10, 2),
  activities_completed_per_day DECIMAL(10, 2),

  -- Quality indicators
  escalation_count INTEGER DEFAULT 0,
  reassignment_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(pod_id, metric_date, metric_period)
);

CREATE INDEX IF NOT EXISTS team_metrics_date_idx ON team_metrics(metric_date);
CREATE INDEX IF NOT EXISTS team_metrics_pod_idx ON team_metrics(pod_id);

COMMENT ON TABLE team_metrics IS 'Aggregated team performance metrics';

-- ============================================================================
-- COMPLETED: Workplan & Activity System Migration
-- ============================================================================
