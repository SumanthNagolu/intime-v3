-- =====================================================
-- CAMPAIGN ACTIVITY WORKFLOW SYSTEM
-- Guidewire-inspired workflow for campaign management
-- =====================================================

-- =====================================================
-- CAMPAIGN ACTIVITY PATTERNS
-- =====================================================

INSERT INTO activity_patterns (
  org_id, code, name, description, target_days, escalation_days, 
  priority, entity_type, category, is_system, default_assignee,
  instructions, checklist
) VALUES
-- Setup Phase
(NULL, 'campaign_setup', 'Setup Campaign', 
 'Configure campaign basics: goals, target audience, timeline, and success metrics', 
 1, 2, 'high', 'campaign', 'setup', TRUE, 'owner',
 'Review campaign objectives and ensure all required fields are populated. Define clear goals and success metrics.',
 '[{"item": "Define campaign objective", "required": true}, {"item": "Set target metrics (response rate, meetings)", "required": true}, {"item": "Confirm date range", "required": true}, {"item": "Identify target audience", "required": true}]'::JSONB),

-- List Building Phase  
(NULL, 'campaign_build_list', 'Build Prospect List', 
 'Identify and add target prospects to the campaign', 
 3, 5, 'high', 'campaign', 'sourcing', TRUE, 'owner',
 'Source prospects from existing database, LinkedIn, or other channels. Ensure data quality and relevance.',
 '[{"item": "Define ideal prospect profile", "required": true}, {"item": "Source prospects from database", "required": false}, {"item": "Add LinkedIn prospects", "required": false}, {"item": "Verify contact information", "required": true}, {"item": "Remove duplicates", "required": true}]'::JSONB),

-- Sequence Configuration Phase
(NULL, 'campaign_configure_sequences', 'Configure Sequences', 
 'Set up outreach sequences with email templates, timing, and touchpoints', 
 2, 3, 'normal', 'campaign', 'setup', TRUE, 'owner',
 'Design multi-touch outreach sequences. Include email, LinkedIn, and call touchpoints as appropriate.',
 '[{"item": "Create initial outreach email", "required": true}, {"item": "Set follow-up timing", "required": true}, {"item": "Configure LinkedIn steps if applicable", "required": false}, {"item": "Set up call reminders", "required": false}, {"item": "Test email deliverability", "required": true}]'::JSONB),

-- Review & Launch Phase
(NULL, 'campaign_review_launch', 'Review & Launch', 
 'Final review of campaign setup before activation', 
 1, 1, 'urgent', 'campaign', 'approval', TRUE, 'owner',
 'Perform final quality check and get approval to launch. Verify all components are ready.',
 '[{"item": "Review prospect list quality", "required": true}, {"item": "Proof email templates", "required": true}, {"item": "Verify sequences configured correctly", "required": true}, {"item": "Get manager approval if required", "required": false}, {"item": "Activate campaign", "required": true}]'::JSONB),

-- Monitoring & Review Activities (recurring/milestone)
(NULL, 'campaign_7_day_review', '7 Day Review', 
 'Review campaign performance after first week', 
 7, 10, 'normal', 'campaign', 'review', TRUE, 'owner',
 'Analyze initial metrics, response rates, and engagement. Identify early optimizations.',
 '[{"item": "Review open and click rates", "required": true}, {"item": "Check response quality", "required": true}, {"item": "Identify underperforming sequences", "required": false}, {"item": "Document learnings", "required": true}]'::JSONB),

(NULL, 'campaign_30_day_review', '30 Day Review', 
 'Comprehensive campaign review at 30-day mark', 
 30, 35, 'high', 'campaign', 'review', TRUE, 'owner',
 'Deep dive into campaign performance. Evaluate ROI, conversion rates, and make strategic adjustments.',
 '[{"item": "Analyze conversion metrics", "required": true}, {"item": "Calculate cost per lead", "required": true}, {"item": "Review pipeline generated", "required": true}, {"item": "Recommend continuation or pause", "required": true}, {"item": "Update strategy if needed", "required": false}]'::JSONB),

(NULL, 'campaign_performance_review', 'Performance Review', 
 'Weekly performance check and optimization', 
 7, 10, 'normal', 'campaign', 'review', TRUE, 'owner',
 'Regular review to track progress against goals and identify optimization opportunities.',
 '[{"item": "Check metrics against goals", "required": true}, {"item": "Review bounce and unsubscribe rates", "required": true}, {"item": "Identify top performing sequences", "required": false}, {"item": "Log notes for handoff", "required": true}]'::JSONB),

-- Manual/Ad-hoc Activity Types
(NULL, 'campaign_manager_review', 'Manager Review', 
 'Request manager review of campaign strategy or performance', 
 2, 3, 'high', 'campaign', 'approval', TRUE, 'manager',
 'Request manager review for strategic decisions, budget approval, or escalations.',
 '[{"item": "Prepare summary document", "required": true}, {"item": "Schedule review meeting", "required": false}, {"item": "Document decision", "required": true}]'::JSONB),

(NULL, 'campaign_client_review', 'Client Review', 
 'Review campaign approach with client stakeholder', 
 5, 7, 'high', 'campaign', 'review', TRUE, 'owner',
 'Present campaign strategy or results to client for feedback and approval.',
 '[{"item": "Prepare presentation", "required": true}, {"item": "Schedule client meeting", "required": true}, {"item": "Document feedback", "required": true}, {"item": "Update campaign based on feedback", "required": false}]'::JSONB),

(NULL, 'campaign_strategy_adjustment', 'Strategy Adjustment', 
 'Make strategic changes to campaign approach', 
 1, 2, 'normal', 'campaign', 'workflow', TRUE, 'owner',
 'Document and implement strategic changes based on performance data or feedback.',
 '[{"item": "Document reason for adjustment", "required": true}, {"item": "Update targeting criteria", "required": false}, {"item": "Revise messaging", "required": false}, {"item": "Update sequences", "required": false}]'::JSONB),

(NULL, 'campaign_pause_evaluation', 'Pause Evaluation', 
 'Evaluate whether to pause or continue campaign', 
 1, 1, 'urgent', 'campaign', 'approval', TRUE, 'owner',
 'Assess campaign performance and decide whether to pause, continue, or terminate.',
 '[{"item": "Review current metrics", "required": true}, {"item": "Compare to goals", "required": true}, {"item": "Document recommendation", "required": true}, {"item": "Get manager approval for pause", "required": false}]'::JSONB),

(NULL, 'campaign_completion_review', 'Campaign Completion', 
 'Final review and wrap-up of completed campaign', 
 2, 3, 'normal', 'campaign', 'workflow', TRUE, 'owner',
 'Document final results, lessons learned, and archive campaign.',
 '[{"item": "Calculate final ROI", "required": true}, {"item": "Document lessons learned", "required": true}, {"item": "Archive campaign data", "required": false}, {"item": "Create summary report", "required": true}]'::JSONB)

ON CONFLICT (org_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_days = EXCLUDED.target_days,
  escalation_days = EXCLUDED.escalation_days,
  priority = EXCLUDED.priority,
  instructions = EXCLUDED.instructions,
  checklist = EXCLUDED.checklist,
  updated_at = NOW();

-- =====================================================
-- ACTIVITY PATTERN SUCCESSORS (Workflow Chains)
-- =====================================================

-- Get pattern IDs for successor linking
DO $$
DECLARE
  v_setup_id UUID;
  v_build_list_id UUID;
  v_configure_id UUID;
  v_review_launch_id UUID;
  v_7_day_id UUID;
  v_30_day_id UUID;
BEGIN
  -- Get pattern IDs
  SELECT id INTO v_setup_id FROM activity_patterns WHERE code = 'campaign_setup' AND org_id IS NULL;
  SELECT id INTO v_build_list_id FROM activity_patterns WHERE code = 'campaign_build_list' AND org_id IS NULL;
  SELECT id INTO v_configure_id FROM activity_patterns WHERE code = 'campaign_configure_sequences' AND org_id IS NULL;
  SELECT id INTO v_review_launch_id FROM activity_patterns WHERE code = 'campaign_review_launch' AND org_id IS NULL;
  SELECT id INTO v_7_day_id FROM activity_patterns WHERE code = 'campaign_7_day_review' AND org_id IS NULL;
  SELECT id INTO v_30_day_id FROM activity_patterns WHERE code = 'campaign_30_day_review' AND org_id IS NULL;

  -- Chain: setup -> build_list
  INSERT INTO activity_pattern_successors (pattern_id, successor_pattern_id, condition_type, delay_days, order_index)
  VALUES (v_setup_id, v_build_list_id, 'always', 0, 1)
  ON CONFLICT (pattern_id, successor_pattern_id) DO NOTHING;

  -- Chain: build_list -> configure_sequences
  INSERT INTO activity_pattern_successors (pattern_id, successor_pattern_id, condition_type, delay_days, order_index)
  VALUES (v_build_list_id, v_configure_id, 'always', 0, 1)
  ON CONFLICT (pattern_id, successor_pattern_id) DO NOTHING;

  -- Chain: configure_sequences -> review_launch
  INSERT INTO activity_pattern_successors (pattern_id, successor_pattern_id, condition_type, delay_days, order_index)
  VALUES (v_configure_id, v_review_launch_id, 'always', 0, 1)
  ON CONFLICT (pattern_id, successor_pattern_id) DO NOTHING;

  -- Chain: review_launch -> 7_day_review (after launch, 7 day delay)
  INSERT INTO activity_pattern_successors (pattern_id, successor_pattern_id, condition_type, delay_days, order_index)
  VALUES (v_review_launch_id, v_7_day_id, 'always', 7, 1)
  ON CONFLICT (pattern_id, successor_pattern_id) DO NOTHING;

  -- Chain: 7_day_review -> 30_day_review (23 more days = 30 total from launch)
  INSERT INTO activity_pattern_successors (pattern_id, successor_pattern_id, condition_type, delay_days, order_index)
  VALUES (v_7_day_id, v_30_day_id, 'always', 23, 1)
  ON CONFLICT (pattern_id, successor_pattern_id) DO NOTHING;
END $$;

-- =====================================================
-- CAMPAIGN WORKPLAN TEMPLATE
-- =====================================================

INSERT INTO workplan_templates (
  org_id, code, name, description, entity_type, 
  trigger_event, completion_criteria, is_system
) VALUES (
  NULL, 
  'campaign_standard', 
  'Standard Campaign Workflow', 
  'Automated workflow for campaign setup, launch, and monitoring',
  'campaign',
  'create',
  'all_required',
  TRUE
)
ON CONFLICT (org_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Link activities to workplan template
DO $$
DECLARE
  v_template_id UUID;
  v_setup_id UUID;
  v_build_list_id UUID;
  v_configure_id UUID;
  v_review_launch_id UUID;
BEGIN
  -- Get template and pattern IDs
  SELECT id INTO v_template_id FROM workplan_templates WHERE code = 'campaign_standard' AND org_id IS NULL;
  SELECT id INTO v_setup_id FROM activity_patterns WHERE code = 'campaign_setup' AND org_id IS NULL;
  SELECT id INTO v_build_list_id FROM activity_patterns WHERE code = 'campaign_build_list' AND org_id IS NULL;
  SELECT id INTO v_configure_id FROM activity_patterns WHERE code = 'campaign_configure_sequences' AND org_id IS NULL;
  SELECT id INTO v_review_launch_id FROM activity_patterns WHERE code = 'campaign_review_launch' AND org_id IS NULL;

  -- Insert template activities with ordering
  INSERT INTO workplan_template_activities (template_id, pattern_id, order_index, phase, is_required)
  VALUES 
    (v_template_id, v_setup_id, 1, 'setup', TRUE),
    (v_template_id, v_build_list_id, 2, 'sourcing', TRUE),
    (v_template_id, v_configure_id, 3, 'setup', TRUE),
    (v_template_id, v_review_launch_id, 4, 'launch', TRUE)
  ON CONFLICT (template_id, pattern_id) DO UPDATE SET
    order_index = EXCLUDED.order_index,
    phase = EXCLUDED.phase,
    is_required = EXCLUDED.is_required;
END $$;

-- =====================================================
-- ADD 'campaign' TO ACTIVITY ROUTER ENTITY TYPES
-- =====================================================

-- Add activity type constraint if not exists for 'task' type used in ad-hoc activities
-- (The activities table should already support campaign as entity_type)

-- =====================================================
-- FUNCTION: Create campaign workplan and first activity
-- =====================================================

CREATE OR REPLACE FUNCTION create_campaign_workplan(
  p_campaign_id UUID,
  p_org_id UUID,
  p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_template workplan_templates%ROWTYPE;
  v_instance_id UUID;
  v_first_pattern activity_patterns%ROWTYPE;
  v_activity_id UUID;
  v_owner_id UUID;
BEGIN
  -- Get campaign owner for activity assignment
  SELECT owner_id INTO v_owner_id
  FROM campaigns
  WHERE id = p_campaign_id AND org_id = p_org_id;

  -- Use creator if no owner set
  v_owner_id := COALESCE(v_owner_id, p_created_by);

  -- Get the campaign standard template
  SELECT * INTO v_template
  FROM workplan_templates
  WHERE code = 'campaign_standard'
    AND (org_id IS NULL OR org_id = p_org_id)
    AND is_active = TRUE
  ORDER BY org_id NULLS LAST
  LIMIT 1;

  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Campaign workplan template not found';
  END IF;

  -- Create workplan instance
  INSERT INTO workplan_instances (
    org_id, template_id, entity_type, entity_id,
    template_code, template_name, total_activities,
    status, created_by
  ) VALUES (
    p_org_id, v_template.id, 'campaign', p_campaign_id,
    v_template.code, v_template.name, 4,
    'active', p_created_by
  ) RETURNING id INTO v_instance_id;

  -- Get first activity pattern (setup)
  SELECT ap.* INTO v_first_pattern
  FROM activity_patterns ap
  JOIN workplan_template_activities wta ON wta.pattern_id = ap.id
  WHERE wta.template_id = v_template.id
  ORDER BY wta.order_index
  LIMIT 1;

  -- Create first activity
  INSERT INTO activities (
    org_id, entity_type, entity_id,
    pattern_code, pattern_id, workplan_instance_id,
    subject, description, instructions, checklist,
    priority, category, activity_type,
    due_date, escalation_date,
    assigned_to, status,
    auto_created, created_by
  ) VALUES (
    p_org_id, 'campaign', p_campaign_id,
    v_first_pattern.code, v_first_pattern.id, v_instance_id,
    v_first_pattern.name, v_first_pattern.description, v_first_pattern.instructions, v_first_pattern.checklist,
    v_first_pattern.priority, v_first_pattern.category, 'task',
    NOW() + (v_first_pattern.target_days || ' days')::INTERVAL,
    NOW() + (COALESCE(v_first_pattern.escalation_days, v_first_pattern.target_days + 1) || ' days')::INTERVAL,
    v_owner_id, 'open',
    TRUE, p_created_by
  ) RETURNING id INTO v_activity_id;

  -- Log activity history
  INSERT INTO activity_history (activity_id, action, changed_by, notes)
  VALUES (v_activity_id, 'created', p_created_by, 'Auto-created from campaign workflow');

  RETURN v_instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Complete activity and trigger successors
-- =====================================================

CREATE OR REPLACE FUNCTION complete_campaign_activity(
  p_activity_id UUID,
  p_completed_by UUID,
  p_outcome TEXT DEFAULT 'completed',
  p_outcome_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  activity_id UUID,
  successor_created BOOLEAN,
  successor_id UUID,
  successor_name TEXT
) AS $$
DECLARE
  v_activity activities%ROWTYPE;
  v_pattern_id UUID;
  v_successor RECORD;
  v_new_activity_id UUID;
  v_pattern activity_patterns%ROWTYPE;
BEGIN
  -- Get the activity
  SELECT * INTO v_activity
  FROM activities
  WHERE id = p_activity_id;

  IF v_activity IS NULL THEN
    RAISE EXCEPTION 'Activity not found: %', p_activity_id;
  END IF;

  IF v_activity.status = 'completed' THEN
    RAISE EXCEPTION 'Activity already completed';
  END IF;

  -- Mark activity as completed
  UPDATE activities SET
    status = 'completed',
    completed_at = NOW(),
    outcome = p_outcome,
    outcome_notes = p_outcome_notes,
    updated_at = NOW(),
    updated_by = p_completed_by
  WHERE id = p_activity_id;

  -- Log history
  INSERT INTO activity_history (activity_id, action, field_changed, old_value, new_value, changed_by)
  VALUES (p_activity_id, 'status_changed', 'status', v_activity.status, 'completed', p_completed_by);

  -- Initialize return values
  activity_id := p_activity_id;
  successor_created := FALSE;
  successor_id := NULL;
  successor_name := NULL;

  -- Check for successor activities
  IF v_activity.pattern_id IS NOT NULL THEN
    FOR v_successor IN
      SELECT aps.*, ap.code, ap.name as pattern_name, ap.description, 
             ap.target_days, ap.escalation_days, ap.priority, ap.category,
             ap.instructions, ap.checklist
      FROM activity_pattern_successors aps
      JOIN activity_patterns ap ON ap.id = aps.successor_pattern_id
      WHERE aps.pattern_id = v_activity.pattern_id
      ORDER BY aps.order_index
    LOOP
      -- Create successor activity
      INSERT INTO activities (
        org_id, entity_type, entity_id,
        pattern_code, pattern_id, workplan_instance_id,
        subject, description, instructions, checklist,
        priority, category, activity_type,
        due_date, escalation_date,
        assigned_to, status,
        predecessor_activity_id, auto_created, created_by
      ) VALUES (
        v_activity.org_id, v_activity.entity_type, v_activity.entity_id,
        v_successor.code, v_successor.successor_pattern_id, v_activity.workplan_instance_id,
        v_successor.pattern_name, v_successor.description, v_successor.instructions, v_successor.checklist,
        v_successor.priority, v_successor.category, 'task',
        NOW() + (v_successor.delay_days || ' days')::INTERVAL + (v_successor.target_days || ' days')::INTERVAL,
        NOW() + (v_successor.delay_days || ' days')::INTERVAL + (COALESCE(v_successor.escalation_days, v_successor.target_days + 1) || ' days')::INTERVAL,
        v_activity.assigned_to, 'open',
        p_activity_id, TRUE, p_completed_by
      ) RETURNING id INTO v_new_activity_id;

      -- Log history for new activity
      INSERT INTO activity_history (activity_id, action, changed_by, notes)
      VALUES (v_new_activity_id, 'created', p_completed_by, 
              'Auto-created as successor of: ' || v_activity.subject);

      successor_created := TRUE;
      successor_id := v_new_activity_id;
      successor_name := v_successor.pattern_name;

      RETURN NEXT;
    END LOOP;
  END IF;

  -- Return at least one row with completion info
  IF NOT successor_created THEN
    RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Auto-create workplan on campaign create
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_campaign_workplan()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create workplan for new campaigns
  IF TG_OP = 'INSERT' THEN
    PERFORM create_campaign_workplan(NEW.id, NEW.org_id, NEW.created_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_campaign_workplan ON campaigns;

CREATE TRIGGER trg_campaign_workplan
  AFTER INSERT ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION trigger_campaign_workplan();

-- =====================================================
-- FUNCTION: Check and update campaign status based on activities
-- =====================================================

CREATE OR REPLACE FUNCTION check_campaign_status_progression(
  p_campaign_id UUID,
  p_org_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_campaign campaigns%ROWTYPE;
  v_setup_complete BOOLEAN;
  v_all_required_complete BOOLEAN;
  v_new_status TEXT;
  v_total_required INTEGER;
  v_completed_required INTEGER;
BEGIN
  -- Get campaign
  SELECT * INTO v_campaign
  FROM campaigns
  WHERE id = p_campaign_id AND org_id = p_org_id;

  IF v_campaign IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check if setup activities are complete
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed') = COUNT(*),
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_setup_complete, v_total_required, v_completed_required
  FROM activities
  WHERE entity_type = 'campaign'
    AND entity_id = p_campaign_id
    AND org_id = p_org_id
    AND pattern_code IN ('campaign_setup', 'campaign_build_list', 'campaign_configure_sequences', 'campaign_review_launch');

  -- Determine new status based on progress
  v_new_status := v_campaign.status;

  -- Draft -> Active: When review_launch is completed
  IF v_campaign.status = 'draft' THEN
    SELECT EXISTS (
      SELECT 1 FROM activities
      WHERE entity_type = 'campaign'
        AND entity_id = p_campaign_id
        AND pattern_code = 'campaign_review_launch'
        AND status = 'completed'
    ) INTO v_all_required_complete;

    IF v_all_required_complete THEN
      v_new_status := 'active';
    END IF;
  END IF;

  -- Only update if status changed
  IF v_new_status <> v_campaign.status THEN
    UPDATE campaigns
    SET 
      status = v_new_status,
      updated_at = NOW()
    WHERE id = p_campaign_id;

    -- Log the status change
    INSERT INTO activities (
      org_id, entity_type, entity_id,
      activity_type, subject, description,
      status, created_by
    ) VALUES (
      p_org_id, 'campaign', p_campaign_id,
      'note', 'Campaign Status Changed',
      'Campaign status automatically changed from ' || v_campaign.status || ' to ' || v_new_status || ' based on completed activities',
      'completed', NULL
    );
  END IF;

  RETURN v_new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Auto-check campaign status after activity completion
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_activity_completion_check()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when activity is completed
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    -- Only for campaign activities
    IF NEW.entity_type = 'campaign' THEN
      PERFORM check_campaign_status_progression(NEW.entity_id, NEW.org_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_activity_completion_check ON activities;

CREATE TRIGGER trg_activity_completion_check
  AFTER UPDATE OF status ON activities
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status <> 'completed')
  EXECUTE FUNCTION trigger_activity_completion_check();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_campaign_workplan(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_campaign_activity(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_campaign_status_progression(UUID, UUID) TO authenticated;

