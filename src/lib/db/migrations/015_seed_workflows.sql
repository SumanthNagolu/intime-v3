-- Migration 015: Seed Predefined Workflows
-- Sprint 3: Workflow Engine & Core Services
-- Created: 2025-11-19
-- Purpose: Create predefined workflow definitions for business processes

-- ========================================
-- SEED WORKFLOW DEFINITIONS
-- ========================================

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
  SELECT id INTO v_admin_id FROM user_profiles WHERE email LIKE '%admin%' ORDER BY created_at LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Organization "InTime Solutions" not found. Cannot seed workflows.';
  END IF;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found. Cannot seed workflows.';
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
    INSERT INTO workflow_states (workflow_id, name, display_name, state_order, is_initial, is_terminal, description, metadata)
    VALUES
      (v_student_workflow_id, 'application_submitted', 'Application Submitted', 1, TRUE, FALSE, 'Initial application received', '{"color": "blue", "icon": "file-text"}'),
      (v_student_workflow_id, 'assessment_scheduled', 'Assessment Scheduled', 2, FALSE, FALSE, 'Assessment date and time scheduled', '{"color": "purple", "icon": "calendar"}'),
      (v_student_workflow_id, 'assessment_completed', 'Assessment Completed', 3, FALSE, FALSE, 'Assessment test completed', '{"color": "yellow", "icon": "check-circle"}'),
      (v_student_workflow_id, 'enrollment_approved', 'Enrollment Approved', 4, FALSE, FALSE, 'Enrollment approved by admin', '{"color": "green", "icon": "user-check"}'),
      (v_student_workflow_id, 'active', 'Active Student', 5, FALSE, FALSE, 'Currently enrolled in course', '{"color": "indigo", "icon": "book-open"}'),
      (v_student_workflow_id, 'graduated', 'Graduated', 6, FALSE, TRUE, 'Successfully completed course', '{"color": "green", "icon": "award"}'),
      (v_student_workflow_id, 'rejected', 'Application Rejected', 7, FALSE, TRUE, 'Application not approved', '{"color": "red", "icon": "x-circle"}')
    RETURNING id
  )
  SELECT array_agg(id) INTO v_state_ids FROM state_inserts;

  -- Transitions
  INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, action, display_name, required_permission, metadata)
  SELECT
    v_student_workflow_id,
    v_state_ids[1], -- application_submitted
    v_state_ids[2], -- assessment_scheduled
    'schedule_assessment',
    'Schedule Assessment',
    'students:schedule',
    '{"buttonColor": "blue", "confirmMessage": "Schedule assessment for this student?"}'
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[2], -- assessment_scheduled
    v_state_ids[3], -- assessment_completed
    'complete_assessment',
    'Mark Assessment Complete',
    'students:assess',
    '{"buttonColor": "yellow", "requiresNotes": true}'
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[3], -- assessment_completed
    v_state_ids[4], -- enrollment_approved
    'approve_enrollment',
    'Approve Enrollment',
    'students:approve',
    '{"buttonColor": "green", "confirmMessage": "Approve this student for enrollment?"}'
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[3], -- assessment_completed
    v_state_ids[7], -- rejected
    'reject_application',
    'Reject Application',
    'students:approve',
    '{"buttonColor": "red", "requiresNotes": true, "confirmMessage": "Reject this application?"}'
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[4], -- enrollment_approved
    v_state_ids[5], -- active
    'start_course',
    'Start Course',
    NULL,
    '{"buttonColor": "indigo"}'
  UNION ALL SELECT
    v_student_workflow_id,
    v_state_ids[5], -- active
    v_state_ids[6], -- graduated
    'graduate',
    'Mark as Graduated',
    'students:graduate',
    '{"buttonColor": "green", "confirmMessage": "Graduate this student? This will trigger certificate generation."}'
  ;

  -- Update initial_state_id
  UPDATE workflows SET initial_state_id = v_state_ids[1]
  WHERE id = v_student_workflow_id;

  RAISE NOTICE 'Student Lifecycle workflow created (ID: %)', v_student_workflow_id;

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
    INSERT INTO workflow_states (workflow_id, name, display_name, state_order, is_initial, is_terminal, description, metadata)
    VALUES
      (v_candidate_workflow_id, 'sourced', 'Sourced', 1, TRUE, FALSE, 'Candidate identified and added to pipeline', '{"color": "gray", "icon": "user-plus"}'),
      (v_candidate_workflow_id, 'screening', 'Screening', 2, FALSE, FALSE, 'Initial screening in progress', '{"color": "blue", "icon": "search"}'),
      (v_candidate_workflow_id, 'submitted_to_client', 'Submitted to Client', 3, FALSE, FALSE, 'Resume submitted to client', '{"color": "purple", "icon": "send"}'),
      (v_candidate_workflow_id, 'interview_scheduled', 'Interview Scheduled', 4, FALSE, FALSE, 'Client interview scheduled', '{"color": "yellow", "icon": "calendar"}'),
      (v_candidate_workflow_id, 'offer_extended', 'Offer Extended', 5, FALSE, FALSE, 'Job offer extended to candidate', '{"color": "orange", "icon": "file-text"}'),
      (v_candidate_workflow_id, 'placed', 'Placed', 6, FALSE, TRUE, 'Candidate accepted offer and placed', '{"color": "green", "icon": "check-circle"}'),
      (v_candidate_workflow_id, 'rejected', 'Rejected', 7, FALSE, TRUE, 'Candidate rejected or declined', '{"color": "red", "icon": "x-circle"}')
    RETURNING id
  )
  SELECT array_agg(id) INTO v_state_ids FROM state_inserts;

  INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, action, display_name, required_permission, metadata)
  SELECT
    v_candidate_workflow_id,
    v_state_ids[1], -- sourced
    v_state_ids[2], -- screening
    'screen',
    'Start Screening',
    'candidates:screen',
    '{"buttonColor": "blue"}'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[2], -- screening
    v_state_ids[3], -- submitted_to_client
    'submit',
    'Submit to Client',
    'candidates:submit',
    '{"buttonColor": "purple", "requiresNotes": true}'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[2], -- screening
    v_state_ids[7], -- rejected
    'reject',
    'Reject Candidate',
    'candidates:screen',
    '{"buttonColor": "red", "requiresNotes": true}'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[3], -- submitted_to_client
    v_state_ids[4], -- interview_scheduled
    'schedule_interview',
    'Schedule Interview',
    'candidates:interview',
    '{"buttonColor": "yellow"}'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[4], -- interview_scheduled
    v_state_ids[5], -- offer_extended
    'extend_offer',
    'Extend Offer',
    'candidates:offer',
    '{"buttonColor": "orange", "confirmMessage": "Extend job offer to this candidate?"}'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[5], -- offer_extended
    v_state_ids[6], -- placed
    'place',
    'Mark as Placed',
    'candidates:place',
    '{"buttonColor": "green", "confirmMessage": "Mark candidate as placed?"}'
  UNION ALL SELECT
    v_candidate_workflow_id,
    v_state_ids[5], -- offer_extended
    v_state_ids[7], -- rejected
    'decline_offer',
    'Offer Declined',
    'candidates:place',
    '{"buttonColor": "red", "requiresNotes": true}'
  ;

  UPDATE workflows SET initial_state_id = v_state_ids[1]
  WHERE id = v_candidate_workflow_id;

  RAISE NOTICE 'Candidate Placement workflow created (ID: %)', v_candidate_workflow_id;

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
    INSERT INTO workflow_states (workflow_id, name, display_name, state_order, is_initial, is_terminal, description, metadata)
    VALUES
      (v_job_workflow_id, 'draft', 'Draft', 1, TRUE, FALSE, 'Job requisition being drafted', '{"color": "gray", "icon": "edit"}'),
      (v_job_workflow_id, 'pending_approval', 'Pending Approval', 2, FALSE, FALSE, 'Waiting for manager approval', '{"color": "yellow", "icon": "clock"}'),
      (v_job_workflow_id, 'approved', 'Approved', 3, FALSE, FALSE, 'Approved and ready to post', '{"color": "blue", "icon": "check"}'),
      (v_job_workflow_id, 'active', 'Active (Recruiting)', 4, FALSE, FALSE, 'Actively recruiting candidates', '{"color": "green", "icon": "users"}'),
      (v_job_workflow_id, 'filled', 'Filled', 5, FALSE, TRUE, 'Position filled successfully', '{"color": "green", "icon": "check-circle"}'),
      (v_job_workflow_id, 'closed', 'Closed (Cancelled)', 6, FALSE, TRUE, 'Requisition cancelled', '{"color": "red", "icon": "x-circle"}')
    RETURNING id
  )
  SELECT array_agg(id) INTO v_state_ids FROM state_inserts;

  INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, action, display_name, required_permission, metadata)
  SELECT
    v_job_workflow_id,
    v_state_ids[1], -- draft
    v_state_ids[2], -- pending_approval
    'submit_for_approval',
    'Submit for Approval',
    NULL,
    '{"buttonColor": "blue"}'
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[2], -- pending_approval
    v_state_ids[3], -- approved
    'approve',
    'Approve Job',
    'jobs:approve',
    '{"buttonColor": "green", "confirmMessage": "Approve this job requisition?"}'
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[2], -- pending_approval
    v_state_ids[1], -- draft
    'reject',
    'Reject (Back to Draft)',
    'jobs:approve',
    '{"buttonColor": "red", "requiresNotes": true}'
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[3], -- approved
    v_state_ids[4], -- active
    'activate',
    'Activate Job Posting',
    'jobs:activate',
    '{"buttonColor": "green"}'
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[4], -- active
    v_state_ids[5], -- filled
    'fill',
    'Mark as Filled',
    'jobs:fill',
    '{"buttonColor": "green", "confirmMessage": "Mark this position as filled?"}'
  UNION ALL SELECT
    v_job_workflow_id,
    v_state_ids[4], -- active
    v_state_ids[6], -- closed
    'close',
    'Close Job (Cancel)',
    'jobs:close',
    '{"buttonColor": "red", "requiresNotes": true, "confirmMessage": "Close this job requisition?"}'
  ;

  UPDATE workflows SET initial_state_id = v_state_ids[1]
  WHERE id = v_job_workflow_id;

  RAISE NOTICE 'Job Requisition workflow created (ID: %)', v_job_workflow_id;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Workflow seed data created successfully!';
  RAISE NOTICE '  - Student Lifecycle: % states, % transitions', 7, 6;
  RAISE NOTICE '  - Candidate Placement: % states, % transitions', 7, 7;
  RAISE NOTICE '  - Job Requisition: % states, % transitions', 6, 6;
  RAISE NOTICE '==============================================';
END $$;
