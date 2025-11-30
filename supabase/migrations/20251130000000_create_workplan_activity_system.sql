-- =====================================================
-- WORKPLAN & ACTIVITY SYSTEM
-- Guidewire-inspired process tracking for InTime v3
-- =====================================================

-- =====================================================
-- ACTIVITY PATTERNS (Templates)
-- Defines reusable activity templates
-- =====================================================

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
  default_assignee TEXT DEFAULT 'owner' CHECK (default_assignee IN ('owner', 'group', 'user', 'auto')),
  assignee_group_id UUID REFERENCES groups(id),
  assignee_user_id UUID REFERENCES user_profiles(id),

  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Automation
  auto_complete BOOLEAN DEFAULT FALSE,
  auto_complete_condition JSONB,
  auto_action TEXT, -- 'create_interview', 'create_offer', 'create_placement', etc.
  auto_action_config JSONB,

  -- Categorization
  category TEXT,
  entity_type TEXT NOT NULL, -- 'job', 'lead', 'submission', etc.

  -- Instructions
  instructions TEXT,
  checklist JSONB, -- Array of checklist items

  -- Metadata
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Unique code per org (or global for system patterns)
  UNIQUE (org_id, code)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_activity_patterns_entity ON activity_patterns(entity_type, is_active);
CREATE INDEX IF NOT EXISTS idx_activity_patterns_org ON activity_patterns(org_id) WHERE org_id IS NOT NULL;

-- =====================================================
-- ACTIVITY PATTERN SUCCESSORS
-- Defines which activities trigger after completion
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_pattern_successors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES activity_patterns(id) ON DELETE CASCADE,
  successor_pattern_id UUID NOT NULL REFERENCES activity_patterns(id) ON DELETE CASCADE,

  -- Conditional triggering
  condition_type TEXT DEFAULT 'always' CHECK (condition_type IN ('always', 'field_equals', 'field_in', 'expression')),
  condition_field TEXT,
  condition_value TEXT,
  condition_expression JSONB,

  -- Timing
  delay_days INTEGER DEFAULT 0,

  -- Order if multiple successors
  order_index INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Prevent duplicate successors
  UNIQUE (pattern_id, successor_pattern_id)
);

CREATE INDEX IF NOT EXISTS idx_pattern_successors_pattern ON activity_pattern_successors(pattern_id);

-- =====================================================
-- WORKPLAN TEMPLATES
-- Defines process workflows as ordered activity sets
-- =====================================================

CREATE TABLE IF NOT EXISTS workplan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identity
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- What entity type uses this workplan
  entity_type TEXT NOT NULL,

  -- Trigger configuration
  trigger_event TEXT DEFAULT 'manual' CHECK (trigger_event IN ('create', 'status_change', 'field_change', 'manual')),
  trigger_status TEXT, -- If status_change, which status triggers
  trigger_field TEXT, -- If field_change, which field
  trigger_condition JSONB, -- Additional conditions

  -- Completion criteria
  completion_criteria TEXT DEFAULT 'all_required' CHECK (completion_criteria IN ('all_required', 'all_activities', 'manual')),

  -- Metadata
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE (org_id, code)
);

CREATE INDEX IF NOT EXISTS idx_workplan_templates_entity ON workplan_templates(entity_type, is_active);
CREATE INDEX IF NOT EXISTS idx_workplan_templates_trigger ON workplan_templates(entity_type, trigger_event, trigger_status);

-- =====================================================
-- WORKPLAN TEMPLATE ACTIVITIES
-- Maps activities to workplan templates with ordering
-- =====================================================

CREATE TABLE IF NOT EXISTS workplan_template_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workplan_templates(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES activity_patterns(id) ON DELETE CASCADE,

  -- Ordering
  order_index INTEGER NOT NULL DEFAULT 0,
  phase TEXT, -- Optional grouping: 'sourcing', 'screening', 'closing'

  -- Requirements
  is_required BOOLEAN DEFAULT TRUE,
  skip_condition JSONB, -- Condition to skip this activity

  -- Parallel execution
  can_run_parallel BOOLEAN DEFAULT FALSE,
  depends_on_activity_ids UUID[], -- Activities that must complete first

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE (template_id, pattern_id)
);

CREATE INDEX IF NOT EXISTS idx_workplan_activities_template ON workplan_template_activities(template_id, order_index);

-- =====================================================
-- WORKPLAN INSTANCES
-- Runtime instances of workplans attached to entities
-- =====================================================

CREATE TABLE IF NOT EXISTS workplan_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workplan_templates(id),

  -- Link to entity (polymorphic)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Template info (denormalized for history)
  template_code TEXT,
  template_name TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'canceled')),

  -- Progress tracking
  total_activities INTEGER DEFAULT 0,
  completed_activities INTEGER DEFAULT 0,
  skipped_activities INTEGER DEFAULT 0,

  -- Current phase
  current_phase TEXT,

  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Cancellation/completion info
  outcome TEXT,
  outcome_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One active workplan per entity per template
  UNIQUE (entity_type, entity_id, template_code, status)
);

-- Generated column for progress percentage
ALTER TABLE workplan_instances
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER GENERATED ALWAYS AS (
  CASE WHEN total_activities > 0
  THEN ((completed_activities + skipped_activities) * 100 / total_activities)
  ELSE 0 END
) STORED;

CREATE INDEX IF NOT EXISTS idx_workplan_instances_entity ON workplan_instances(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workplan_instances_status ON workplan_instances(org_id, status);

-- =====================================================
-- ACTIVITIES
-- Runtime activity instances (work items)
-- =====================================================

-- Drop existing if exists to recreate with full schema
-- (Keep existing data by using ALTER instead if table exists)

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
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT,

  -- Instructions/checklist (copied from pattern)
  instructions TEXT,
  checklist JSONB,
  checklist_progress JSONB, -- Tracks completion of checklist items

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),
  assigned_group UUID REFERENCES groups(id),
  assigned_at TIMESTAMPTZ,

  -- Dates
  due_date TIMESTAMPTZ,
  escalation_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'skipped', 'canceled', 'blocked')),

  -- Outcome (when completed)
  outcome TEXT,
  outcome_notes TEXT,

  -- Automation flags
  auto_created BOOLEAN DEFAULT FALSE,
  auto_completed BOOLEAN DEFAULT FALSE,

  -- Predecessor tracking
  predecessor_activity_id UUID REFERENCES activities(id),

  -- Escalation tracking
  escalation_count INTEGER DEFAULT 0,
  last_escalated_at TIMESTAMPTZ,

  -- Reminder tracking
  reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES user_profiles(id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activities_org_status ON activities(org_id, status);
CREATE INDEX IF NOT EXISTS idx_activities_assigned ON activities(assigned_to, status) WHERE status IN ('open', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_activities_group ON activities(assigned_group, status) WHERE status IN ('open', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_activities_due ON activities(due_date) WHERE status IN ('open', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_workplan ON activities(workplan_instance_id);
CREATE INDEX IF NOT EXISTS idx_activities_escalation ON activities(escalation_date) WHERE status = 'open' AND escalation_date IS NOT NULL;

-- =====================================================
-- ACTIVITY HISTORY
-- Tracks all changes to activities
-- =====================================================

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
  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Additional context
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_activity_history_activity ON activity_history(activity_id, changed_at DESC);

-- =====================================================
-- SEED SYSTEM ACTIVITY PATTERNS
-- =====================================================

-- Job Fulfillment Activities
INSERT INTO activity_patterns (org_id, code, name, description, target_days, priority, entity_type, category, is_system) VALUES
(NULL, 'review_job_requirements', 'Review Job Requirements', 'Review and understand the job requirements, client expectations, and must-have skills', 1, 'high', 'job', 'setup', TRUE),
(NULL, 'source_candidates', 'Source Candidates', 'Search for and identify potential candidates from various sources', 5, 'normal', 'job', 'sourcing', TRUE),
(NULL, 'screen_candidates', 'Screen Candidates', 'Review resumes and conduct initial phone screens', 3, 'normal', 'job', 'screening', TRUE),
(NULL, 'submit_to_client', 'Submit to Client', 'Prepare and send candidate submissions to the client', 1, 'high', 'job', 'submission', TRUE),
(NULL, 'schedule_interview', 'Schedule Interview', 'Coordinate and schedule interview between candidate and client', 2, 'high', 'job', 'interview', TRUE),
(NULL, 'collect_feedback', 'Collect Interview Feedback', 'Gather feedback from both client and candidate after interview', 1, 'high', 'job', 'interview', TRUE),
(NULL, 'extend_offer', 'Extend Offer', 'Coordinate offer extension and negotiation', 2, 'high', 'job', 'closing', TRUE),
(NULL, 'close_position', 'Close Position', 'Finalize placement and close the job order', 1, 'normal', 'job', 'closing', TRUE)
ON CONFLICT (org_id, code) DO NOTHING;

-- Lead Qualification Activities
INSERT INTO activity_patterns (org_id, code, name, description, target_days, priority, entity_type, category, is_system) VALUES
(NULL, 'initial_research', 'Initial Research', 'Research the lead company and contact before outreach', 1, 'normal', 'lead', 'research', TRUE),
(NULL, 'initial_outreach', 'Initial Outreach', 'Make first contact with the lead via email or phone', 2, 'high', 'lead', 'outreach', TRUE),
(NULL, 'follow_up_outreach', 'Follow-up Outreach', 'Follow up on previous outreach attempt', 2, 'normal', 'lead', 'outreach', TRUE),
(NULL, 'discovery_call', 'Discovery Call', 'Conduct discovery call to understand needs', 5, 'high', 'lead', 'qualification', TRUE),
(NULL, 'assess_bant', 'Assess BANT', 'Evaluate Budget, Authority, Need, Timeline', 1, 'high', 'lead', 'qualification', TRUE),
(NULL, 'create_proposal', 'Create Proposal', 'Prepare and create proposal for the lead', 3, 'normal', 'lead', 'proposal', TRUE),
(NULL, 'present_proposal', 'Present Proposal', 'Present proposal to the lead', 5, 'high', 'lead', 'proposal', TRUE),
(NULL, 'convert_to_deal', 'Convert to Deal', 'Convert qualified lead to deal', 1, 'high', 'lead', 'closing', TRUE)
ON CONFLICT (org_id, code) DO NOTHING;

-- Submission Activities
INSERT INTO activity_patterns (org_id, code, name, description, target_days, priority, entity_type, category, is_system) VALUES
(NULL, 'prepare_submission', 'Prepare Submission', 'Prepare candidate profile and submission documents', 1, 'high', 'submission', 'preparation', TRUE),
(NULL, 'send_to_client', 'Send to Client', 'Submit candidate to client for review', 1, 'high', 'submission', 'submission', TRUE),
(NULL, 'await_client_response', 'Await Client Response', 'Wait for and track client response', 3, 'normal', 'submission', 'tracking', TRUE),
(NULL, 'prepare_candidate', 'Prepare Candidate', 'Brief candidate on interview and client expectations', 1, 'high', 'submission', 'interview', TRUE),
(NULL, 'conduct_interview', 'Conduct Interview', 'Interview takes place', 1, 'high', 'submission', 'interview', TRUE),
(NULL, 'collect_interview_feedback', 'Collect Interview Feedback', 'Gather feedback from interview', 1, 'high', 'submission', 'interview', TRUE),
(NULL, 'negotiate_offer', 'Negotiate Offer', 'Negotiate offer terms between client and candidate', 5, 'high', 'submission', 'offer', TRUE),
(NULL, 'create_placement', 'Create Placement', 'Finalize and create placement record', 1, 'high', 'submission', 'closing', TRUE)
ON CONFLICT (org_id, code) DO NOTHING;

-- =====================================================
-- SEED WORKPLAN TEMPLATES
-- =====================================================

INSERT INTO workplan_templates (org_id, code, name, description, entity_type, trigger_event, is_system) VALUES
(NULL, 'job_fulfillment', 'Job Fulfillment Process', 'Standard workflow for filling a job order', 'job', 'create', TRUE),
(NULL, 'lead_qualification', 'Lead Qualification (BANT)', 'Qualify leads using BANT methodology', 'lead', 'create', TRUE),
(NULL, 'submission_processing', 'Submission to Placement', 'Process submission through interview to placement', 'submission', 'create', TRUE)
ON CONFLICT (org_id, code) DO NOTHING;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to create workplan instance from template
CREATE OR REPLACE FUNCTION create_workplan_instance(
  p_template_code TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_org_id UUID,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_template workplan_templates%ROWTYPE;
  v_instance_id UUID;
  v_activity_count INTEGER;
BEGIN
  -- Get template
  SELECT * INTO v_template
  FROM workplan_templates
  WHERE code = p_template_code
    AND (org_id IS NULL OR org_id = p_org_id)
    AND is_active = TRUE
  ORDER BY org_id NULLS LAST
  LIMIT 1;

  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Workplan template not found: %', p_template_code;
  END IF;

  -- Count activities
  SELECT COUNT(*) INTO v_activity_count
  FROM workplan_template_activities
  WHERE template_id = v_template.id;

  -- Create instance
  INSERT INTO workplan_instances (
    org_id, template_id, entity_type, entity_id,
    template_code, template_name, total_activities, created_by
  ) VALUES (
    p_org_id, v_template.id, p_entity_type, p_entity_id,
    v_template.code, v_template.name, v_activity_count, p_created_by
  ) RETURNING id INTO v_instance_id;

  -- Create initial activities (order_index = 1 or no dependencies)
  INSERT INTO activities (
    org_id, pattern_code, pattern_id, workplan_instance_id,
    entity_type, entity_id, subject, description, priority,
    category, instructions, due_date, auto_created, created_by
  )
  SELECT
    p_org_id,
    ap.code,
    ap.id,
    v_instance_id,
    p_entity_type,
    p_entity_id,
    ap.name,
    ap.description,
    ap.priority,
    ap.category,
    ap.instructions,
    NOW() + (ap.target_days || ' days')::INTERVAL,
    TRUE,
    p_created_by
  FROM workplan_template_activities wta
  JOIN activity_patterns ap ON ap.id = wta.pattern_id
  WHERE wta.template_id = v_template.id
    AND wta.order_index = 1;

  RETURN v_instance_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete activity and trigger successors
CREATE OR REPLACE FUNCTION complete_activity(
  p_activity_id UUID,
  p_outcome TEXT DEFAULT NULL,
  p_outcome_notes TEXT DEFAULT NULL,
  p_completed_by UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_activity activities%ROWTYPE;
  v_successor RECORD;
BEGIN
  -- Get and update activity
  UPDATE activities
  SET
    status = 'completed',
    outcome = COALESCE(p_outcome, outcome),
    outcome_notes = COALESCE(p_outcome_notes, outcome_notes),
    completed_at = NOW(),
    updated_at = NOW(),
    updated_by = p_completed_by
  WHERE id = p_activity_id
    AND status IN ('open', 'in_progress')
  RETURNING * INTO v_activity;

  IF v_activity IS NULL THEN
    RAISE EXCEPTION 'Activity not found or already completed: %', p_activity_id;
  END IF;

  -- Update workplan progress
  IF v_activity.workplan_instance_id IS NOT NULL THEN
    UPDATE workplan_instances
    SET
      completed_activities = completed_activities + 1,
      updated_at = NOW()
    WHERE id = v_activity.workplan_instance_id;
  END IF;

  -- Record history
  INSERT INTO activity_history (activity_id, action, field_changed, new_value, changed_by)
  VALUES (p_activity_id, 'status_changed', 'status', 'completed', p_completed_by);

  -- Create successor activities
  FOR v_successor IN
    SELECT ap.*, aps.condition_type, aps.condition_field, aps.condition_value, aps.delay_days
    FROM activity_pattern_successors aps
    JOIN activity_patterns ap ON ap.id = aps.successor_pattern_id
    WHERE aps.pattern_id = v_activity.pattern_id
    ORDER BY aps.order_index
  LOOP
    -- Check condition (simplified - expand based on condition_type)
    IF v_successor.condition_type = 'always'
       OR (v_successor.condition_type = 'field_equals'
           AND p_outcome = v_successor.condition_value) THEN

      INSERT INTO activities (
        org_id, pattern_code, pattern_id, workplan_instance_id,
        entity_type, entity_id, subject, description, priority,
        category, instructions, due_date, predecessor_activity_id,
        auto_created, created_by
      ) VALUES (
        v_activity.org_id,
        v_successor.code,
        v_successor.id,
        v_activity.workplan_instance_id,
        v_activity.entity_type,
        v_activity.entity_id,
        v_successor.name,
        v_successor.description,
        v_successor.priority,
        v_successor.category,
        v_successor.instructions,
        NOW() + ((COALESCE(v_successor.delay_days, 0) + v_successor.target_days) || ' days')::INTERVAL,
        p_activity_id,
        TRUE,
        p_completed_by
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_patterns_updated_at
  BEFORE UPDATE ON activity_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workplan_templates_updated_at
  BEFORE UPDATE ON workplan_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workplan_instances_updated_at
  BEFORE UPDATE ON workplan_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
