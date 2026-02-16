/**
 * Workflow Guide Definitions
 *
 * These define the ideal workflow journeys for each entity type.
 * Used by the WorkflowGuide component to show users their progress
 * and guide them to the next action.
 *
 * Separate from the workflow engine (which handles automations).
 */

// ============================================
// Types
// ============================================

export type StageStatus = 'completed' | 'current' | 'upcoming' | 'blocked' | 'skipped'
export type ActionType = 'human' | 'confirm' | 'auto' | 'gate'

export interface WorkflowAction {
  id: string
  label: string
  description?: string
  type: ActionType
  href?: string
  icon?: string
  isPrimary?: boolean
}

export interface WorkflowStage {
  id: string
  name: string
  description: string
  guidance?: string
  isComplete: (entity: Record<string, unknown>) => boolean
  actions: WorkflowAction[]
  sla?: {
    hours: number
    warningThreshold: number // 0-1, percentage of time before warning
  }
  blockers?: Array<{
    condition: (entity: Record<string, unknown>) => boolean
    message: string
  }>
}

export interface WorkflowDefinition {
  id: string
  name: string
  entityType: string
  description: string
  stages: WorkflowStage[]
}

// ============================================
// Job Fulfillment Workflow
// ============================================

export const JOB_WORKFLOW: WorkflowDefinition = {
  id: 'job_fulfillment',
  name: 'Job Fulfillment',
  entityType: 'job',
  description: 'Take a job from intake to fill',
  stages: [
    {
      id: 'intake',
      name: 'Intake',
      description: 'Understand job requirements',
      guidance: 'Complete the intake call with the hiring manager to understand the full requirements, culture fit, and timeline.',
      isComplete: (job) => Boolean(job.requirements_complete || job.intake_completed_at),
      actions: [
        {
          id: 'intake_call',
          label: 'Conduct Intake Call',
          description: 'Schedule and complete intake call',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'complete_requirements',
          label: 'Complete Requirements',
          description: 'Mark requirements as complete',
          type: 'confirm',
        },
      ],
      sla: { hours: 24, warningThreshold: 0.75 },
    },
    {
      id: 'sourcing',
      name: 'Sourcing',
      description: 'Find qualified candidates',
      guidance: 'Use AI matching or search to find 3-5 qualified candidates. Review their profiles before submitting.',
      isComplete: (job) => Number(job.submissions_count) > 0,
      actions: [
        {
          id: 'view_matches',
          label: 'View AI Matches',
          description: 'See AI-matched candidates',
          type: 'auto',
          isPrimary: true,
        },
        {
          id: 'search_pool',
          label: 'Search Pool',
          description: 'Search candidate database',
          type: 'human',
        },
        {
          id: 'submit_candidate',
          label: 'Submit Candidate',
          description: 'Submit to this job',
          type: 'confirm',
        },
      ],
      sla: { hours: 24, warningThreshold: 0.75 },
    },
    {
      id: 'submission',
      name: 'Submission',
      description: 'Get client feedback',
      guidance: 'Follow up with the client on submitted candidates. Aim for feedback within 48 hours.',
      isComplete: (job) => Number(job.interviews_count) > 0 || job.has_accepted_submission,
      actions: [
        {
          id: 'follow_up_client',
          label: 'Follow Up',
          description: 'Check on submission status',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'add_more_candidates',
          label: 'Add Candidates',
          description: 'Submit more candidates',
          type: 'confirm',
        },
      ],
      sla: { hours: 48, warningThreshold: 0.75 },
    },
    {
      id: 'interview',
      name: 'Interview',
      description: 'Coordinate interviews',
      guidance: 'Schedule interviews, prep candidates, and collect feedback promptly.',
      isComplete: (job) => job.has_interview_feedback,
      actions: [
        {
          id: 'schedule_interview',
          label: 'Schedule Interview',
          description: 'Set up interview time',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'prep_candidate',
          label: 'Prep Candidate',
          description: 'Brief candidate on interview',
          type: 'human',
        },
        {
          id: 'collect_feedback',
          label: 'Collect Feedback',
          description: 'Get interview results',
          type: 'confirm',
        },
      ],
      sla: { hours: 72, warningThreshold: 0.5 },
    },
    {
      id: 'offer',
      name: 'Offer',
      description: 'Extend and negotiate offer',
      guidance: 'Work with both sides to reach agreeable terms. Get verbal acceptance before paperwork.',
      isComplete: (job) => job.has_accepted_offer,
      actions: [
        {
          id: 'extend_offer',
          label: 'Extend Offer',
          description: 'Present offer to candidate',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'negotiate',
          label: 'Negotiate Terms',
          description: 'Handle counter offers',
          type: 'human',
        },
      ],
      sla: { hours: 48, warningThreshold: 0.75 },
    },
    {
      id: 'close',
      name: 'Close',
      description: 'Complete placement',
      guidance: 'Finalize paperwork, confirm start date, and ensure smooth onboarding.',
      isComplete: (job) => job.status === 'filled' || job.status === 'closed',
      actions: [
        {
          id: 'create_placement',
          label: 'Create Placement',
          description: 'Convert to placement',
          type: 'confirm',
          isPrimary: true,
        },
        {
          id: 'send_welcome',
          label: 'Send Welcome',
          description: 'Send onboarding info',
          type: 'auto',
        },
      ],
    },
  ],
}

// ============================================
// Candidate Recruiting Workflow
// ============================================

export const CANDIDATE_WORKFLOW: WorkflowDefinition = {
  id: 'candidate_recruiting',
  name: 'Candidate Recruiting',
  entityType: 'candidate',
  description: 'Take a candidate from sourcing to placement',
  stages: [
    {
      id: 'sourcing',
      name: 'Sourcing',
      description: 'Initial contact and screening',
      guidance: 'Reach out to candidate, verify interest, and conduct initial screening.',
      isComplete: (candidate) => candidate.screening_completed || candidate.status !== 'new',
      actions: [
        {
          id: 'initial_outreach',
          label: 'Initial Outreach',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'phone_screen',
          label: 'Phone Screen',
          type: 'human',
        },
      ],
      sla: { hours: 24, warningThreshold: 0.75 },
    },
    {
      id: 'qualification',
      name: 'Qualification',
      description: 'Verify skills and availability',
      guidance: 'Complete technical assessment and verify work authorization, availability, and rate expectations.',
      isComplete: (candidate) => Boolean(candidate.qualification_completed || candidate.is_qualified),
      actions: [
        {
          id: 'verify_skills',
          label: 'Verify Skills',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'check_authorization',
          label: 'Work Authorization',
          type: 'confirm',
        },
        {
          id: 'confirm_availability',
          label: 'Confirm Availability',
          type: 'confirm',
        },
      ],
      sla: { hours: 48, warningThreshold: 0.75 },
    },
    {
      id: 'submission',
      name: 'Submission',
      description: 'Submit to matching jobs',
      guidance: 'Find matching jobs and submit the candidate. Keep them updated on progress.',
      isComplete: (candidate) => Number(candidate.active_submissions) > 0,
      actions: [
        {
          id: 'find_jobs',
          label: 'Find Matching Jobs',
          type: 'auto',
          isPrimary: true,
        },
        {
          id: 'submit_to_job',
          label: 'Submit to Job',
          type: 'confirm',
        },
      ],
    },
    {
      id: 'interview',
      name: 'Interview',
      description: 'Interview preparation and support',
      guidance: 'Prep candidate for interviews, provide company info, and debrief after each round.',
      isComplete: (candidate) => candidate.has_passed_interview,
      actions: [
        {
          id: 'prep_interview',
          label: 'Prep for Interview',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'debrief',
          label: 'Debrief',
          type: 'human',
        },
      ],
    },
    {
      id: 'placement',
      name: 'Placement',
      description: 'Offer negotiation and start',
      guidance: 'Help negotiate offer, handle paperwork, and ensure smooth start.',
      isComplete: (candidate) => candidate.status === 'placed' || candidate.has_active_placement,
      actions: [
        {
          id: 'negotiate_offer',
          label: 'Negotiate Offer',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'onboard',
          label: 'Complete Onboarding',
          type: 'confirm',
        },
      ],
    },
  ],
}

// ============================================
// Account Acquisition Workflow
// ============================================

export const ACCOUNT_WORKFLOW: WorkflowDefinition = {
  id: 'account_acquisition',
  name: 'Account Acquisition',
  entityType: 'account',
  description: 'Take an account from prospect to active client',
  stages: [
    {
      id: 'discovery',
      name: 'Discovery',
      description: 'Understand their needs',
      guidance: 'Research the company, identify decision makers, and understand their hiring needs.',
      isComplete: (account) => Boolean(account.discovery_completed),
      actions: [
        {
          id: 'research',
          label: 'Research Company',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'identify_contacts',
          label: 'Identify Contacts',
          type: 'human',
        },
      ],
      sla: { hours: 48, warningThreshold: 0.75 },
    },
    {
      id: 'outreach',
      name: 'Outreach',
      description: 'Initial contact',
      guidance: 'Make initial contact with decision makers. Aim for a meeting.',
      isComplete: (account) => Boolean(account.first_meeting_scheduled || account.first_contact_made),
      actions: [
        {
          id: 'initial_contact',
          label: 'Make Contact',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'schedule_meeting',
          label: 'Schedule Meeting',
          type: 'confirm',
        },
      ],
      sla: { hours: 72, warningThreshold: 0.5 },
    },
    {
      id: 'qualification',
      name: 'Qualification',
      description: 'Assess opportunity',
      guidance: 'Understand budget, timeline, decision process. Qualify the opportunity.',
      isComplete: (account) => Boolean(account.is_qualified),
      actions: [
        {
          id: 'discovery_call',
          label: 'Discovery Call',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'qualify_account',
          label: 'Qualify Account',
          type: 'confirm',
        },
      ],
    },
    {
      id: 'proposal',
      name: 'Proposal',
      description: 'Present solution',
      guidance: 'Create and present proposal tailored to their needs.',
      isComplete: (account) => Boolean(account.proposal_sent),
      actions: [
        {
          id: 'create_proposal',
          label: 'Create Proposal',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'present_proposal',
          label: 'Present',
          type: 'human',
        },
      ],
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      description: 'Finalize terms',
      guidance: 'Negotiate rates, terms, and SLAs. Get to agreement.',
      isComplete: (account) => Boolean(account.terms_agreed),
      actions: [
        {
          id: 'negotiate_terms',
          label: 'Negotiate Terms',
          type: 'human',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'contracting',
      name: 'Contracting',
      description: 'Execute agreement',
      guidance: 'Get contract signed and vendor setup completed.',
      isComplete: (account) => Boolean(account.contract_signed),
      actions: [
        {
          id: 'send_contract',
          label: 'Send Contract',
          type: 'confirm',
          isPrimary: true,
        },
        {
          id: 'vendor_setup',
          label: 'Complete Vendor Setup',
          type: 'gate',
        },
      ],
    },
    {
      id: 'activation',
      name: 'Activation',
      description: 'First job order',
      guidance: 'Get first job order and deliver successfully.',
      isComplete: (account) => account.status === 'active' && Number(account.jobs_count) > 0,
      actions: [
        {
          id: 'get_first_job',
          label: 'Get First Job',
          type: 'human',
          isPrimary: true,
        },
      ],
    },
  ],
}

// ============================================
// Deal Workflow
// ============================================

export const DEAL_WORKFLOW: WorkflowDefinition = {
  id: 'deal_pipeline',
  name: 'Deal Pipeline',
  entityType: 'deal',
  description: 'Move a deal from lead to close',
  stages: [
    {
      id: 'lead',
      name: 'Lead',
      description: 'New opportunity identified',
      isComplete: (deal) => deal.stage !== 'lead',
      actions: [
        {
          id: 'qualify',
          label: 'Qualify Lead',
          type: 'confirm',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'discovery',
      name: 'Discovery',
      description: 'Understanding needs',
      isComplete: (deal) => ['proposal', 'negotiation', 'closed_won', 'closed_lost'].includes(deal.stage as string),
      actions: [
        {
          id: 'discovery_call',
          label: 'Schedule Discovery',
          type: 'human',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'proposal',
      name: 'Proposal',
      description: 'Solution presented',
      isComplete: (deal) => ['negotiation', 'closed_won', 'closed_lost'].includes(deal.stage as string),
      actions: [
        {
          id: 'create_proposal',
          label: 'Send Proposal',
          type: 'confirm',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      description: 'Terms discussion',
      isComplete: (deal) => ['closed_won', 'closed_lost'].includes(deal.stage as string),
      actions: [
        {
          id: 'negotiate',
          label: 'Negotiate Terms',
          type: 'human',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'closed',
      name: 'Closed',
      description: 'Deal complete',
      isComplete: (deal) => deal.stage === 'closed_won' || deal.stage === 'closed_lost',
      actions: [
        {
          id: 'close_deal',
          label: 'Close Deal',
          type: 'confirm',
          isPrimary: true,
        },
      ],
    },
  ],
}

// ============================================
// Submission Workflow
// ============================================

export const SUBMISSION_WORKFLOW: WorkflowDefinition = {
  id: 'submission_tracking',
  name: 'Submission Tracking',
  entityType: 'submission',
  description: 'Track a submission through the client process',
  stages: [
    {
      id: 'submitted',
      name: 'Submitted',
      description: 'Sent to client',
      isComplete: (sub) => sub.status !== 'submitted',
      actions: [
        {
          id: 'follow_up',
          label: 'Follow Up',
          type: 'human',
          isPrimary: true,
        },
      ],
      sla: { hours: 48, warningThreshold: 0.75 },
    },
    {
      id: 'reviewing',
      name: 'Reviewing',
      description: 'Client reviewing',
      isComplete: (sub) => ['interview_scheduled', 'rejected', 'withdrawn'].includes(sub.status as string),
      actions: [
        {
          id: 'check_status',
          label: 'Check Status',
          type: 'human',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'interview',
      name: 'Interview',
      description: 'Interview scheduled',
      isComplete: (sub) => sub.status === 'offer_extended' || sub.interview_completed,
      actions: [
        {
          id: 'prep_candidate',
          label: 'Prep Candidate',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'debrief',
          label: 'Debrief',
          type: 'human',
        },
      ],
    },
    {
      id: 'offer',
      name: 'Offer',
      description: 'Offer extended',
      isComplete: (sub) => sub.status === 'accepted' || sub.status === 'declined',
      actions: [
        {
          id: 'negotiate',
          label: 'Negotiate',
          type: 'human',
          isPrimary: true,
        },
      ],
    },
  ],
}

// ============================================
// Placement Workflow
// ============================================

export const PLACEMENT_WORKFLOW: WorkflowDefinition = {
  id: 'placement_management',
  name: 'Placement Management',
  entityType: 'placement',
  description: 'Manage an active placement',
  stages: [
    {
      id: 'onboarding',
      name: 'Onboarding',
      description: 'Getting started',
      isComplete: (placement) => Boolean(placement.onboarding_complete),
      actions: [
        {
          id: 'first_day_check',
          label: 'First Day Check-in',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'paperwork',
          label: 'Complete Paperwork',
          type: 'confirm',
        },
      ],
      sla: { hours: 24, warningThreshold: 0.5 },
    },
    {
      id: 'active',
      name: 'Active',
      description: 'Placement in progress',
      isComplete: (placement) => placement.status === 'completed' || placement.status === 'terminated',
      actions: [
        {
          id: 'weekly_checkin',
          label: 'Weekly Check-in',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'timesheet_review',
          label: 'Review Timesheet',
          type: 'confirm',
        },
      ],
    },
    {
      id: 'extension',
      name: 'Extension',
      description: 'Contract renewal',
      isComplete: (placement) => Boolean(placement.extension_confirmed || placement.status === 'completed'),
      actions: [
        {
          id: 'discuss_extension',
          label: 'Discuss Extension',
          type: 'human',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'offboarding',
      name: 'Offboarding',
      description: 'Wrapping up',
      isComplete: (placement) => placement.status === 'completed',
      actions: [
        {
          id: 'exit_interview',
          label: 'Exit Interview',
          type: 'human',
          isPrimary: true,
        },
        {
          id: 'final_paperwork',
          label: 'Final Paperwork',
          type: 'confirm',
        },
      ],
    },
  ],
}

// ============================================
// Workflow Registry
// ============================================

export const WORKFLOW_DEFINITIONS: Record<string, WorkflowDefinition> = {
  job: JOB_WORKFLOW,
  candidate: CANDIDATE_WORKFLOW,
  account: ACCOUNT_WORKFLOW,
  deal: DEAL_WORKFLOW,
  submission: SUBMISSION_WORKFLOW,
  placement: PLACEMENT_WORKFLOW,
}

export function getWorkflowDefinition(entityType: string): WorkflowDefinition | null {
  return WORKFLOW_DEFINITIONS[entityType] ?? null
}

// ============================================
// Helper Functions
// ============================================

export function calculateCurrentStage(
  workflow: WorkflowDefinition,
  entity: Record<string, unknown>
): WorkflowStage | null {
  for (const stage of workflow.stages) {
    if (!stage.isComplete(entity)) {
      return stage
    }
  }
  // All stages complete
  return workflow.stages[workflow.stages.length - 1]
}

export function getStageStatus(
  stage: WorkflowStage,
  entity: Record<string, unknown>,
  currentStageId: string
): StageStatus {
  if (stage.isComplete(entity)) {
    return 'completed'
  }
  if (stage.id === currentStageId) {
    return 'current'
  }
  // Check for blockers
  if (stage.blockers?.some((b) => b.condition(entity))) {
    return 'blocked'
  }
  return 'upcoming'
}

export function getWorkflowProgress(
  workflow: WorkflowDefinition,
  entity: Record<string, unknown>
): {
  completedStages: number
  totalStages: number
  percentage: number
  currentStage: WorkflowStage | null
  nextActions: WorkflowAction[]
} {
  const completedStages = workflow.stages.filter((s) => s.isComplete(entity)).length
  const totalStages = workflow.stages.length
  const currentStage = calculateCurrentStage(workflow, entity)

  return {
    completedStages,
    totalStages,
    percentage: Math.round((completedStages / totalStages) * 100),
    currentStage,
    nextActions: currentStage?.actions.filter((a) => a.isPrimary) ?? [],
  }
}
