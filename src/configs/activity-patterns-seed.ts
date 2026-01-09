/**
 * Activity Patterns Seed Configuration
 * 
 * Comprehensive activity patterns for InTime staffing platform
 * Based on Bullhorn ATS, Ceipal staffing, and Guidewire activity patterns
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type Category = 'communication' | 'calendar' | 'workflow' | 'documentation' | 'research' | 'administrative'
export type EntityType = 'candidate' | 'job' | 'submission' | 'placement' | 'account' | 'contact' | 'lead' | 'deal' | 'consultant' | 'vendor' | 'interview' | 'general'
export type Priority = 'urgent' | 'high' | 'normal' | 'low'
export type OutcomeColor = 'green' | 'yellow' | 'orange' | 'red' | 'gray' | 'blue' | 'purple'
export type NextAction = 'log_notes' | 'schedule_followup' | 'retry_later' | 'update_info' | 'mark_invalid' | 'create_task' | 'send_email' | 'none'

export interface Outcome {
  label: string
  value: string
  color: OutcomeColor
  nextAction: NextAction
}

export interface ActivityPatternSeed {
  code: string
  name: string
  description: string
  category: Category
  entityType: EntityType
  icon: string
  color: string
  targetDays: number
  priority: Priority
  outcomes: Outcome[]
  points: number
  displayOrder: number
}

// ============================================
// OUTCOME PRESETS (DRY)
// ============================================

const CALL_OUTCOMES: Outcome[] = [
  { label: 'Connected', value: 'connected', color: 'green', nextAction: 'log_notes' },
  { label: 'Voicemail', value: 'voicemail', color: 'yellow', nextAction: 'schedule_followup' },
  { label: 'No Answer', value: 'no_answer', color: 'orange', nextAction: 'retry_later' },
  { label: 'Wrong Number', value: 'wrong_number', color: 'red', nextAction: 'update_info' },
]

const QUALIFY_OUTCOMES: Outcome[] = [
  { label: 'Qualified', value: 'qualified', color: 'green', nextAction: 'create_task' },
  { label: 'Not Qualified', value: 'not_qualified', color: 'red', nextAction: 'log_notes' },
  { label: 'Need More Info', value: 'need_info', color: 'yellow', nextAction: 'schedule_followup' },
]

const INTEREST_OUTCOMES: Outcome[] = [
  { label: 'Interested', value: 'interested', color: 'green', nextAction: 'create_task' },
  { label: 'Not Interested', value: 'not_interested', color: 'red', nextAction: 'log_notes' },
  { label: 'Callback', value: 'callback', color: 'yellow', nextAction: 'schedule_followup' },
]

const MEETING_OUTCOMES: Outcome[] = [
  { label: 'Completed', value: 'completed', color: 'green', nextAction: 'log_notes' },
  { label: 'Rescheduled', value: 'rescheduled', color: 'yellow', nextAction: 'schedule_followup' },
  { label: 'Cancelled', value: 'cancelled', color: 'red', nextAction: 'log_notes' },
  { label: 'No Show', value: 'no_show', color: 'red', nextAction: 'retry_later' },
]

const PASS_FAIL_OUTCOMES: Outcome[] = [
  { label: 'Pass', value: 'pass', color: 'green', nextAction: 'create_task' },
  { label: 'Fail', value: 'fail', color: 'red', nextAction: 'log_notes' },
  { label: 'Reschedule', value: 'reschedule', color: 'yellow', nextAction: 'schedule_followup' },
]

const REVIEW_OUTCOMES: Outcome[] = [
  { label: 'Approved', value: 'approved', color: 'green', nextAction: 'create_task' },
  { label: 'Rejected', value: 'rejected', color: 'red', nextAction: 'log_notes' },
  { label: 'Revisions Needed', value: 'revisions', color: 'yellow', nextAction: 'create_task' },
]

const DOC_OUTCOMES: Outcome[] = [
  { label: 'Completed', value: 'completed', color: 'green', nextAction: 'none' },
  { label: 'Pending Documents', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' },
  { label: 'Issue Found', value: 'issue', color: 'red', nextAction: 'create_task' },
]

const VERIFY_OUTCOMES: Outcome[] = [
  { label: 'Verified', value: 'verified', color: 'green', nextAction: 'none' },
  { label: 'Not Verified', value: 'not_verified', color: 'red', nextAction: 'create_task' },
  { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' },
]

const CHECKIN_OUTCOMES: Outcome[] = [
  { label: 'Going Well', value: 'going_well', color: 'green', nextAction: 'log_notes' },
  { label: 'Issues', value: 'issues', color: 'orange', nextAction: 'create_task' },
  { label: 'Escalate', value: 'escalate', color: 'red', nextAction: 'create_task' },
]

const RATE_OUTCOMES: Outcome[] = [
  { label: 'Rate Agreed', value: 'agreed', color: 'green', nextAction: 'log_notes' },
  { label: 'Counter Offer', value: 'counter', color: 'yellow', nextAction: 'schedule_followup' },
  { label: 'Declined', value: 'declined', color: 'red', nextAction: 'log_notes' },
]

const RESEARCH_OUTCOMES: Outcome[] = [
  { label: 'Completed', value: 'completed', color: 'green', nextAction: 'log_notes' },
  { label: 'Needs More Research', value: 'more_research', color: 'yellow', nextAction: 'create_task' },
]

const SENT_OUTCOMES: Outcome[] = [
  { label: 'Sent', value: 'sent', color: 'green', nextAction: 'none' },
  { label: 'Failed', value: 'failed', color: 'red', nextAction: 'retry_later' },
]

const RESPONSE_OUTCOMES: Outcome[] = [
  { label: 'Responded', value: 'responded', color: 'green', nextAction: 'log_notes' },
  { label: 'No Response', value: 'no_response', color: 'gray', nextAction: 'retry_later' },
]

// ============================================
// CANDIDATE PATTERNS
// ============================================

export const CANDIDATE_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'cand_phone_screen', name: 'Phone Screen', description: 'Initial phone screening call with candidate', category: 'communication', entityType: 'candidate', icon: '📞', color: 'blue', targetDays: 1, priority: 'high', outcomes: [...QUALIFY_OUTCOMES, { label: 'Callback', value: 'callback', color: 'yellow', nextAction: 'schedule_followup' }], points: 10, displayOrder: 10 },
  { code: 'cand_availability_check', name: 'Availability Check', description: 'Check candidate availability for opportunities', category: 'communication', entityType: 'candidate', icon: '📱', color: 'blue', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Available', value: 'available', color: 'green', nextAction: 'create_task' }, { label: 'Not Available', value: 'not_available', color: 'red', nextAction: 'log_notes' }, { label: 'Callback', value: 'callback', color: 'yellow', nextAction: 'schedule_followup' }], points: 5, displayOrder: 20 },
  { code: 'cand_rate_negotiation', name: 'Rate Negotiation', description: 'Discuss and negotiate rate expectations', category: 'communication', entityType: 'candidate', icon: '💰', color: 'green', targetDays: 2, priority: 'normal', outcomes: RATE_OUTCOMES, points: 10, displayOrder: 30 },
  { code: 'cand_offer_discussion', name: 'Offer Discussion', description: 'Present and discuss offer with candidate', category: 'communication', entityType: 'candidate', icon: '🎁', color: 'green', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Accepted', value: 'accepted', color: 'green', nextAction: 'create_task' }, { label: 'Negotiating', value: 'negotiating', color: 'yellow', nextAction: 'schedule_followup' }, { label: 'Declined', value: 'declined', color: 'red', nextAction: 'log_notes' }], points: 15, displayOrder: 40 },
  { code: 'cand_reference_call', name: 'Reference Check Call', description: 'Contact provided reference for verification', category: 'communication', entityType: 'candidate', icon: '👥', color: 'purple', targetDays: 3, priority: 'normal', outcomes: [{ label: 'Positive', value: 'positive', color: 'green', nextAction: 'log_notes' }, { label: 'Mixed', value: 'mixed', color: 'yellow', nextAction: 'log_notes' }, { label: 'Negative', value: 'negative', color: 'red', nextAction: 'create_task' }, { label: 'No Response', value: 'no_response', color: 'gray', nextAction: 'retry_later' }], points: 8, displayOrder: 50 },
  { code: 'cand_reengagement', name: 'Re-engagement Outreach', description: 'Reach out to inactive candidate', category: 'communication', entityType: 'candidate', icon: '🔄', color: 'blue', targetDays: 1, priority: 'normal', outcomes: INTEREST_OUTCOMES, points: 5, displayOrder: 60 },
  { code: 'cand_linkedin_outreach', name: 'LinkedIn InMail', description: 'Send LinkedIn message to candidate', category: 'communication', entityType: 'candidate', icon: '💼', color: 'blue', targetDays: 1, priority: 'normal', outcomes: RESPONSE_OUTCOMES, points: 3, displayOrder: 70 },
  { code: 'cand_text_followup', name: 'Text Follow-up', description: 'Send text message follow-up', category: 'communication', entityType: 'candidate', icon: '💬', color: 'blue', targetDays: 1, priority: 'normal', outcomes: RESPONSE_OUTCOMES, points: 2, displayOrder: 80 },
  
  // Calendar
  { code: 'cand_tech_interview', name: 'Technical Interview', description: 'Conduct technical assessment interview', category: 'calendar', entityType: 'candidate', icon: '💻', color: 'teal', targetDays: 3, priority: 'high', outcomes: PASS_FAIL_OUTCOMES, points: 15, displayOrder: 100 },
  { code: 'cand_behavioral_interview', name: 'Behavioral Interview', description: 'Conduct behavioral assessment interview', category: 'calendar', entityType: 'candidate', icon: '🎯', color: 'teal', targetDays: 3, priority: 'high', outcomes: PASS_FAIL_OUTCOMES, points: 15, displayOrder: 110 },
  { code: 'cand_video_screening', name: 'Video Screening', description: 'Conduct video screening call', category: 'calendar', entityType: 'candidate', icon: '📹', color: 'teal', targetDays: 2, priority: 'normal', outcomes: QUALIFY_OUTCOMES, points: 10, displayOrder: 120 },
  { code: 'cand_skills_assessment', name: 'Skills Assessment', description: 'Administer skills assessment test', category: 'calendar', entityType: 'candidate', icon: '📝', color: 'teal', targetDays: 5, priority: 'normal', outcomes: [{ label: 'Completed', value: 'completed', color: 'green', nextAction: 'log_notes' }, { label: 'Incomplete', value: 'incomplete', color: 'yellow', nextAction: 'schedule_followup' }, { label: 'No Show', value: 'no_show', color: 'red', nextAction: 'retry_later' }], points: 10, displayOrder: 130 },
  
  // Workflow
  { code: 'cand_resume_review', name: 'Resume Review', description: 'Review candidate resume for fit', category: 'workflow', entityType: 'candidate', icon: '📄', color: 'violet', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Proceed', value: 'proceed', color: 'green', nextAction: 'create_task' }, { label: 'Reject', value: 'reject', color: 'red', nextAction: 'log_notes' }, { label: 'Need Info', value: 'need_info', color: 'yellow', nextAction: 'schedule_followup' }], points: 5, displayOrder: 200 },
  { code: 'cand_skills_match', name: 'Skills Matching', description: 'Match candidate skills to job requirements', category: 'workflow', entityType: 'candidate', icon: '🔗', color: 'violet', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Good Fit', value: 'good_fit', color: 'green', nextAction: 'create_task' }, { label: 'Partial Match', value: 'partial', color: 'yellow', nextAction: 'log_notes' }, { label: 'No Match', value: 'no_match', color: 'red', nextAction: 'log_notes' }], points: 5, displayOrder: 210 },
  { code: 'cand_submittal_prep', name: 'Submission Preparation', description: 'Prepare candidate for submission', category: 'workflow', entityType: 'candidate', icon: '📋', color: 'violet', targetDays: 1, priority: 'high', outcomes: [{ label: 'Ready', value: 'ready', color: 'green', nextAction: 'create_task' }, { label: 'Needs Work', value: 'needs_work', color: 'yellow', nextAction: 'create_task' }], points: 8, displayOrder: 220 },
  { code: 'cand_rtr_request', name: 'Request RTR', description: 'Request Right to Represent from candidate', category: 'workflow', entityType: 'candidate', icon: '✅', color: 'violet', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Obtained', value: 'obtained', color: 'green', nextAction: 'none' }, { label: 'Declined', value: 'declined', color: 'red', nextAction: 'log_notes' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }], points: 5, displayOrder: 230 },
  
  // Documentation
  { code: 'cand_i9_verification', name: 'I-9 Verification', description: 'Complete I-9 employment verification', category: 'documentation', entityType: 'candidate', icon: '🪪', color: 'gray', targetDays: 3, priority: 'high', outcomes: VERIFY_OUTCOMES, points: 5, displayOrder: 300 },
  { code: 'cand_bgc_initiation', name: 'Background Check', description: 'Initiate background check process', category: 'documentation', entityType: 'candidate', icon: '🔍', color: 'gray', targetDays: 1, priority: 'high', outcomes: DOC_OUTCOMES, points: 5, displayOrder: 310 },
  { code: 'cand_drug_screen', name: 'Drug Screen', description: 'Coordinate drug screening', category: 'documentation', entityType: 'candidate', icon: '🏥', color: 'gray', targetDays: 3, priority: 'high', outcomes: [{ label: 'Passed', value: 'passed', color: 'green', nextAction: 'none' }, { label: 'Failed', value: 'failed', color: 'red', nextAction: 'create_task' }, { label: 'No Show', value: 'no_show', color: 'orange', nextAction: 'schedule_followup' }], points: 5, displayOrder: 320 },
  { code: 'cand_w4_collection', name: 'W-4 Collection', description: 'Collect W-4 tax form', category: 'documentation', entityType: 'candidate', icon: '📑', color: 'gray', targetDays: 3, priority: 'normal', outcomes: DOC_OUTCOMES, points: 3, displayOrder: 330 },
  { code: 'cand_cert_verification', name: 'Certification Verification', description: 'Verify certifications and credentials', category: 'documentation', entityType: 'candidate', icon: '🏆', color: 'gray', targetDays: 5, priority: 'normal', outcomes: VERIFY_OUTCOMES, points: 5, displayOrder: 340 },
  
  // Research
  { code: 'cand_market_rate', name: 'Market Rate Analysis', description: 'Research market rate for candidate skills', category: 'research', entityType: 'candidate', icon: '📊', color: 'amber', targetDays: 2, priority: 'normal', outcomes: [{ label: 'Rate Competitive', value: 'competitive', color: 'green', nextAction: 'log_notes' }, { label: 'Rate High', value: 'high', color: 'yellow', nextAction: 'log_notes' }, { label: 'Rate Low', value: 'low', color: 'blue', nextAction: 'log_notes' }], points: 5, displayOrder: 400 },
  { code: 'cand_linkedin_research', name: 'LinkedIn Research', description: 'Research candidate profile on LinkedIn', category: 'research', entityType: 'candidate', icon: '🔍', color: 'amber', targetDays: 1, priority: 'normal', outcomes: RESEARCH_OUTCOMES, points: 3, displayOrder: 410 },
  { code: 'cand_employer_verification', name: 'Employment Verification', description: 'Verify employment history', category: 'research', entityType: 'candidate', icon: '🏢', color: 'amber', targetDays: 3, priority: 'normal', outcomes: VERIFY_OUTCOMES, points: 5, displayOrder: 420 },
]

// ============================================
// JOB PATTERNS
// ============================================

export const JOB_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'job_kickoff_call', name: 'Job Kickoff Call', description: 'Initial call to discuss job requirements', category: 'communication', entityType: 'job', icon: '📞', color: 'blue', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Requirements Clear', value: 'clear', color: 'green', nextAction: 'create_task' }, { label: 'Need Clarification', value: 'clarify', color: 'yellow', nextAction: 'schedule_followup' }], points: 15, displayOrder: 10 },
  { code: 'job_status_update', name: 'Status Update Call', description: 'Update client on job progress', category: 'communication', entityType: 'job', icon: '📱', color: 'blue', targetDays: 3, priority: 'normal', outcomes: [{ label: 'Continued', value: 'continued', color: 'green', nextAction: 'log_notes' }, { label: 'Paused', value: 'paused', color: 'yellow', nextAction: 'log_notes' }, { label: 'Closed', value: 'closed', color: 'red', nextAction: 'create_task' }], points: 5, displayOrder: 20 },
  { code: 'job_feedback_request', name: 'Feedback Request', description: 'Request feedback on submissions', category: 'communication', entityType: 'job', icon: '💬', color: 'blue', targetDays: 1, priority: 'high', outcomes: [{ label: 'Feedback Received', value: 'received', color: 'green', nextAction: 'log_notes' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }], points: 5, displayOrder: 30 },
  { code: 'job_reqs_clarification', name: 'Requirements Clarification', description: 'Clarify job requirements with client', category: 'communication', entityType: 'job', icon: '❓', color: 'blue', targetDays: 1, priority: 'high', outcomes: [{ label: 'Clarified', value: 'clarified', color: 'green', nextAction: 'log_notes' }, { label: 'Escalate', value: 'escalate', color: 'red', nextAction: 'create_task' }], points: 5, displayOrder: 40 },
  
  // Calendar
  { code: 'job_intake_meeting', name: 'Job Intake Meeting', description: 'Meeting to capture job requirements', category: 'calendar', entityType: 'job', icon: '📅', color: 'teal', targetDays: 2, priority: 'urgent', outcomes: [{ label: 'Requirements Captured', value: 'captured', color: 'green', nextAction: 'create_task' }, { label: 'Need Follow-up', value: 'followup', color: 'yellow', nextAction: 'schedule_followup' }], points: 20, displayOrder: 100 },
  { code: 'job_strategy_session', name: 'Sourcing Strategy Session', description: 'Define sourcing strategy for job', category: 'calendar', entityType: 'job', icon: '🎯', color: 'teal', targetDays: 3, priority: 'high', outcomes: [{ label: 'Strategy Defined', value: 'defined', color: 'green', nextAction: 'create_task' }], points: 10, displayOrder: 110 },
  { code: 'job_pipeline_review', name: 'Pipeline Review', description: 'Review candidate pipeline for job', category: 'calendar', entityType: 'job', icon: '📊', color: 'teal', targetDays: 5, priority: 'normal', outcomes: [{ label: 'Continue', value: 'continue', color: 'green', nextAction: 'log_notes' }, { label: 'Pivot Strategy', value: 'pivot', color: 'yellow', nextAction: 'create_task' }], points: 5, displayOrder: 120 },
  
  // Workflow
  { code: 'job_sourcing_start', name: 'Start Sourcing', description: 'Begin active sourcing for job', category: 'workflow', entityType: 'job', icon: '🔍', color: 'violet', targetDays: 1, priority: 'high', outcomes: [{ label: 'Sourcing Active', value: 'active', color: 'green', nextAction: 'none' }], points: 5, displayOrder: 200 },
  { code: 'job_priority_change', name: 'Priority Update', description: 'Update job priority level', category: 'workflow', entityType: 'job', icon: '⚡', color: 'violet', targetDays: 0, priority: 'normal', outcomes: [{ label: 'High', value: 'high', color: 'red', nextAction: 'none' }, { label: 'Medium', value: 'medium', color: 'yellow', nextAction: 'none' }, { label: 'Low', value: 'low', color: 'gray', nextAction: 'none' }], points: 2, displayOrder: 210 },
  { code: 'job_req_approval', name: 'Requisition Approval', description: 'Get requisition approval', category: 'workflow', entityType: 'job', icon: '✅', color: 'violet', targetDays: 2, priority: 'high', outcomes: REVIEW_OUTCOMES, points: 5, displayOrder: 220 },
  { code: 'job_close_process', name: 'Job Close Process', description: 'Process job closure', category: 'workflow', entityType: 'job', icon: '🔒', color: 'violet', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Filled', value: 'filled', color: 'green', nextAction: 'none' }, { label: 'Cancelled', value: 'cancelled', color: 'red', nextAction: 'log_notes' }, { label: 'On Hold', value: 'on_hold', color: 'yellow', nextAction: 'log_notes' }], points: 5, displayOrder: 230 },
  { code: 'job_extension_request', name: 'Extension Request', description: 'Request job order extension', category: 'workflow', entityType: 'job', icon: '📆', color: 'violet', targetDays: 2, priority: 'normal', outcomes: [{ label: 'Extended', value: 'extended', color: 'green', nextAction: 'log_notes' }, { label: 'Declined', value: 'declined', color: 'red', nextAction: 'log_notes' }], points: 5, displayOrder: 240 },
  
  // Documentation
  { code: 'job_desc_creation', name: 'Job Description Creation', description: 'Create job description document', category: 'documentation', entityType: 'job', icon: '📝', color: 'gray', targetDays: 2, priority: 'high', outcomes: DOC_OUTCOMES, points: 10, displayOrder: 300 },
  { code: 'job_posting_approval', name: 'Job Posting Approval', description: 'Get approval for job posting', category: 'documentation', entityType: 'job', icon: '✔️', color: 'gray', targetDays: 1, priority: 'high', outcomes: REVIEW_OUTCOMES, points: 5, displayOrder: 310 },
  { code: 'job_rate_card_review', name: 'Rate Card Review', description: 'Review and approve rate card', category: 'documentation', entityType: 'job', icon: '💵', color: 'gray', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Rates Approved', value: 'approved', color: 'green', nextAction: 'none' }], points: 5, displayOrder: 320 },
  
  // Research
  { code: 'job_market_analysis', name: 'Market Analysis', description: 'Analyze market conditions for role', category: 'research', entityType: 'job', icon: '📈', color: 'amber', targetDays: 3, priority: 'normal', outcomes: [{ label: 'Market Hot', value: 'hot', color: 'red', nextAction: 'log_notes' }, { label: 'Market Cold', value: 'cold', color: 'blue', nextAction: 'log_notes' }, { label: 'Niche Role', value: 'niche', color: 'purple', nextAction: 'log_notes' }], points: 8, displayOrder: 400 },
  { code: 'job_competitor_check', name: 'Competitor Analysis', description: 'Check competitor job postings', category: 'research', entityType: 'job', icon: '🔎', color: 'amber', targetDays: 2, priority: 'normal', outcomes: RESEARCH_OUTCOMES, points: 5, displayOrder: 410 },
  { code: 'job_talent_mapping', name: 'Talent Mapping', description: 'Map available talent pool', category: 'research', entityType: 'job', icon: '🗺️', color: 'amber', targetDays: 5, priority: 'normal', outcomes: [{ label: 'Pool Identified', value: 'identified', color: 'green', nextAction: 'log_notes' }], points: 10, displayOrder: 420 },
]

// ============================================
// SUBMISSION PATTERNS
// ============================================

export const SUBMISSION_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'sub_client_followup', name: 'Client Follow-up', description: 'Follow up with client on submission', category: 'communication', entityType: 'submission', icon: '📞', color: 'blue', targetDays: 2, priority: 'high', outcomes: [{ label: 'Feedback Received', value: 'received', color: 'green', nextAction: 'log_notes' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }], points: 5, displayOrder: 10 },
  { code: 'sub_candidate_update', name: 'Candidate Update', description: 'Update candidate on submission status', category: 'communication', entityType: 'submission', icon: '💬', color: 'blue', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Updated', value: 'updated', color: 'green', nextAction: 'none' }, { label: 'Unreachable', value: 'unreachable', color: 'yellow', nextAction: 'retry_later' }], points: 3, displayOrder: 20 },
  { code: 'sub_rejection_debrief', name: 'Rejection Debrief', description: 'Debrief on rejection reasons', category: 'communication', entityType: 'submission', icon: '📝', color: 'blue', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Feedback Captured', value: 'captured', color: 'green', nextAction: 'log_notes' }], points: 5, displayOrder: 30 },
  { code: 'sub_offer_coordination', name: 'Offer Coordination', description: 'Coordinate offer details', category: 'communication', entityType: 'submission', icon: '🎁', color: 'blue', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Offer Extended', value: 'extended', color: 'green', nextAction: 'create_task' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }], points: 10, displayOrder: 40 },
  
  // Workflow
  { code: 'sub_internal_review', name: 'Internal Review', description: 'Internal review before submission', category: 'workflow', entityType: 'submission', icon: '👁️', color: 'violet', targetDays: 1, priority: 'high', outcomes: REVIEW_OUTCOMES, points: 5, displayOrder: 100 },
  { code: 'sub_client_submission', name: 'Submit to Client', description: 'Submit candidate to client', category: 'workflow', entityType: 'submission', icon: '📤', color: 'violet', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Submitted', value: 'submitted', color: 'green', nextAction: 'schedule_followup' }], points: 15, displayOrder: 110 },
  { code: 'sub_interview_scheduling', name: 'Schedule Interview', description: 'Schedule interview with client', category: 'workflow', entityType: 'submission', icon: '📅', color: 'violet', targetDays: 2, priority: 'high', outcomes: [{ label: 'Scheduled', value: 'scheduled', color: 'green', nextAction: 'none' }, { label: 'Pending Availability', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }], points: 10, displayOrder: 120 },
  { code: 'sub_offer_extension', name: 'Extend Offer', description: 'Extend offer to candidate', category: 'workflow', entityType: 'submission', icon: '✉️', color: 'violet', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Offer Extended', value: 'extended', color: 'green', nextAction: 'schedule_followup' }], points: 15, displayOrder: 130 },
  { code: 'sub_counter_review', name: 'Counter Offer Review', description: 'Review counter offer', category: 'workflow', entityType: 'submission', icon: '⚖️', color: 'violet', targetDays: 1, priority: 'high', outcomes: [{ label: 'Accepted', value: 'accepted', color: 'green', nextAction: 'create_task' }, { label: 'Negotiating', value: 'negotiating', color: 'yellow', nextAction: 'schedule_followup' }, { label: 'Declined', value: 'declined', color: 'red', nextAction: 'log_notes' }], points: 10, displayOrder: 140 },
  { code: 'sub_withdrawal', name: 'Withdrawal Processing', description: 'Process submission withdrawal', category: 'workflow', entityType: 'submission', icon: '↩️', color: 'violet', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Withdrawn', value: 'withdrawn', color: 'red', nextAction: 'log_notes' }, { label: 'Reconsidered', value: 'reconsidered', color: 'green', nextAction: 'log_notes' }], points: 3, displayOrder: 150 },
  
  // Documentation
  { code: 'sub_package_prep', name: 'Package Preparation', description: 'Prepare submission package', category: 'documentation', entityType: 'submission', icon: '📦', color: 'gray', targetDays: 1, priority: 'high', outcomes: [{ label: 'Package Ready', value: 'ready', color: 'green', nextAction: 'create_task' }], points: 8, displayOrder: 200 },
  { code: 'sub_feedback_doc', name: 'Document Feedback', description: 'Document client feedback', category: 'documentation', entityType: 'submission', icon: '📝', color: 'gray', targetDays: 1, priority: 'normal', outcomes: [{ label: 'Documented', value: 'documented', color: 'green', nextAction: 'none' }], points: 3, displayOrder: 210 },
  { code: 'sub_rtr_attachment', name: 'Attach RTR', description: 'Attach RTR document to submission', category: 'documentation', entityType: 'submission', icon: '📎', color: 'gray', targetDays: 1, priority: 'high', outcomes: [{ label: 'Attached', value: 'attached', color: 'green', nextAction: 'none' }], points: 2, displayOrder: 220 },
]

// ============================================
// INTERVIEW PATTERNS
// ============================================

export const INTERVIEW_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'int_confirmation', name: 'Interview Confirmation', description: 'Confirm interview details', category: 'communication', entityType: 'interview', icon: '✅', color: 'blue', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Confirmed', value: 'confirmed', color: 'green', nextAction: 'none' }, { label: 'Rescheduled', value: 'rescheduled', color: 'yellow', nextAction: 'schedule_followup' }, { label: 'Cancelled', value: 'cancelled', color: 'red', nextAction: 'log_notes' }], points: 5, displayOrder: 10 },
  { code: 'int_prep_call', name: 'Interview Prep Call', description: 'Prep candidate for interview', category: 'communication', entityType: 'interview', icon: '📞', color: 'blue', targetDays: 1, priority: 'high', outcomes: [{ label: 'Candidate Prepped', value: 'prepped', color: 'green', nextAction: 'none' }], points: 10, displayOrder: 20 },
  { code: 'int_debrief_candidate', name: 'Candidate Debrief', description: 'Debrief with candidate after interview', category: 'communication', entityType: 'interview', icon: '💬', color: 'blue', targetDays: 1, priority: 'high', outcomes: [{ label: 'Positive', value: 'positive', color: 'green', nextAction: 'log_notes' }, { label: 'Negative', value: 'negative', color: 'red', nextAction: 'log_notes' }, { label: 'Mixed', value: 'mixed', color: 'yellow', nextAction: 'log_notes' }], points: 5, displayOrder: 30 },
  { code: 'int_debrief_client', name: 'Client Debrief', description: 'Debrief with client after interview', category: 'communication', entityType: 'interview', icon: '🏢', color: 'blue', targetDays: 1, priority: 'high', outcomes: [{ label: 'Positive', value: 'positive', color: 'green', nextAction: 'create_task' }, { label: 'Negative', value: 'negative', color: 'red', nextAction: 'log_notes' }, { label: 'Next Round', value: 'next_round', color: 'blue', nextAction: 'schedule_followup' }], points: 8, displayOrder: 40 },
  
  // Calendar
  { code: 'int_schedule_phone', name: 'Schedule Phone Interview', description: 'Schedule phone interview', category: 'calendar', entityType: 'interview', icon: '📱', color: 'teal', targetDays: 2, priority: 'high', outcomes: [{ label: 'Scheduled', value: 'scheduled', color: 'green', nextAction: 'none' }], points: 5, displayOrder: 100 },
  { code: 'int_schedule_video', name: 'Schedule Video Interview', description: 'Schedule video interview', category: 'calendar', entityType: 'interview', icon: '📹', color: 'teal', targetDays: 2, priority: 'high', outcomes: [{ label: 'Scheduled', value: 'scheduled', color: 'green', nextAction: 'none' }], points: 5, displayOrder: 110 },
  { code: 'int_schedule_onsite', name: 'Schedule On-site Interview', description: 'Schedule on-site interview', category: 'calendar', entityType: 'interview', icon: '🏢', color: 'teal', targetDays: 5, priority: 'high', outcomes: [{ label: 'Scheduled', value: 'scheduled', color: 'green', nextAction: 'none' }], points: 8, displayOrder: 120 },
  { code: 'int_schedule_panel', name: 'Schedule Panel Interview', description: 'Schedule panel interview', category: 'calendar', entityType: 'interview', icon: '👥', color: 'teal', targetDays: 5, priority: 'high', outcomes: [{ label: 'Scheduled', value: 'scheduled', color: 'green', nextAction: 'none' }], points: 10, displayOrder: 130 },
  
  // Workflow
  { code: 'int_feedback_collection', name: 'Collect Feedback', description: 'Collect interview feedback', category: 'workflow', entityType: 'interview', icon: '📋', color: 'violet', targetDays: 2, priority: 'high', outcomes: [{ label: 'Feedback Received', value: 'received', color: 'green', nextAction: 'log_notes' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }], points: 5, displayOrder: 200 },
  { code: 'int_next_steps', name: 'Determine Next Steps', description: 'Determine next steps after interview', category: 'workflow', entityType: 'interview', icon: '🔜', color: 'violet', targetDays: 1, priority: 'high', outcomes: [{ label: 'Advance', value: 'advance', color: 'green', nextAction: 'create_task' }, { label: 'Reject', value: 'reject', color: 'red', nextAction: 'log_notes' }, { label: 'Hold', value: 'hold', color: 'yellow', nextAction: 'log_notes' }], points: 5, displayOrder: 210 },
  { code: 'int_reschedule', name: 'Reschedule Interview', description: 'Reschedule interview', category: 'workflow', entityType: 'interview', icon: '🔄', color: 'violet', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Rescheduled', value: 'rescheduled', color: 'green', nextAction: 'none' }, { label: 'Cancelled', value: 'cancelled', color: 'red', nextAction: 'log_notes' }], points: 3, displayOrder: 220 },
]

// ============================================
// PLACEMENT PATTERNS
// ============================================

export const PLACEMENT_PATTERNS: ActivityPatternSeed[] = [
  // Communication
  { code: 'plc_day1_checkin', name: 'Day 1 Check-in', description: 'First day check-in call', category: 'communication', entityType: 'placement', icon: '🌟', color: 'blue', targetDays: 0, priority: 'urgent', outcomes: CHECKIN_OUTCOMES, points: 15, displayOrder: 10 },
  { code: 'plc_week1_checkin', name: 'Week 1 Check-in', description: 'First week check-in call', category: 'communication', entityType: 'placement', icon: '📞', color: 'blue', targetDays: 7, priority: 'high', outcomes: CHECKIN_OUTCOMES, points: 10, displayOrder: 20 },
  { code: 'plc_30day_review', name: '30-Day Review', description: '30-day performance review call', category: 'communication', entityType: 'placement', icon: '📊', color: 'blue', targetDays: 30, priority: 'high', outcomes: [{ label: 'Performing', value: 'performing', color: 'green', nextAction: 'log_notes' }, { label: 'Concerns', value: 'concerns', color: 'yellow', nextAction: 'create_task' }, { label: 'Escalate', value: 'escalate', color: 'red', nextAction: 'create_task' }], points: 10, displayOrder: 30 },
  { code: 'plc_90day_review', name: '90-Day Review', description: '90-day performance review call', category: 'communication', entityType: 'placement', icon: '📈', color: 'blue', targetDays: 90, priority: 'normal', outcomes: [{ label: 'Successful', value: 'successful', color: 'green', nextAction: 'log_notes' }, { label: 'Issues', value: 'issues', color: 'yellow', nextAction: 'create_task' }], points: 10, displayOrder: 40 },
  { code: 'plc_extension_discussion', name: 'Extension Discussion', description: 'Discuss placement extension', category: 'communication', entityType: 'placement', icon: '📆', color: 'blue', targetDays: 14, priority: 'high', outcomes: [{ label: 'Extending', value: 'extending', color: 'green', nextAction: 'create_task' }, { label: 'Ending', value: 'ending', color: 'red', nextAction: 'log_notes' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }], points: 10, displayOrder: 50 },
  { code: 'plc_end_confirmation', name: 'End Date Confirmation', description: 'Confirm placement end date', category: 'communication', entityType: 'placement', icon: '📅', color: 'blue', targetDays: 14, priority: 'normal', outcomes: [{ label: 'Confirmed', value: 'confirmed', color: 'green', nextAction: 'create_task' }, { label: 'Extended', value: 'extended', color: 'blue', nextAction: 'log_notes' }], points: 5, displayOrder: 60 },
  { code: 'plc_offboarding', name: 'Offboarding Call', description: 'Placement offboarding call', category: 'communication', entityType: 'placement', icon: '👋', color: 'blue', targetDays: 3, priority: 'normal', outcomes: [{ label: 'Completed', value: 'completed', color: 'green', nextAction: 'none' }], points: 10, displayOrder: 70 },
  
  // Calendar
  { code: 'plc_start_meeting', name: 'Start Date Meeting', description: 'Coordinate start date details', category: 'calendar', entityType: 'placement', icon: '🗓️', color: 'teal', targetDays: 2, priority: 'urgent', outcomes: [{ label: 'Confirmed', value: 'confirmed', color: 'green', nextAction: 'none' }], points: 10, displayOrder: 100 },
  { code: 'plc_qbr', name: 'Quarterly Business Review', description: 'QBR meeting with client', category: 'calendar', entityType: 'placement', icon: '📊', color: 'teal', targetDays: 90, priority: 'normal', outcomes: [{ label: 'Positive', value: 'positive', color: 'green', nextAction: 'log_notes' }, { label: 'Action Items', value: 'action_items', color: 'yellow', nextAction: 'create_task' }], points: 15, displayOrder: 110 },
  { code: 'plc_performance_review', name: 'Performance Review', description: 'Formal performance review meeting', category: 'calendar', entityType: 'placement', icon: '📋', color: 'teal', targetDays: 90, priority: 'normal', outcomes: [{ label: 'Exceeds', value: 'exceeds', color: 'green', nextAction: 'log_notes' }, { label: 'Meets', value: 'meets', color: 'blue', nextAction: 'log_notes' }, { label: 'Below', value: 'below', color: 'red', nextAction: 'create_task' }], points: 10, displayOrder: 120 },
  
  // Workflow
  { code: 'plc_onboarding_start', name: 'Start Onboarding', description: 'Initiate placement onboarding', category: 'workflow', entityType: 'placement', icon: '🚀', color: 'violet', targetDays: 0, priority: 'urgent', outcomes: [{ label: 'Started', value: 'started', color: 'green', nextAction: 'create_task' }], points: 10, displayOrder: 200 },
  { code: 'plc_timesheet_reminder', name: 'Timesheet Reminder', description: 'Send timesheet reminder', category: 'workflow', entityType: 'placement', icon: '⏰', color: 'violet', targetDays: 7, priority: 'normal', outcomes: [{ label: 'Submitted', value: 'submitted', color: 'green', nextAction: 'none' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }], points: 3, displayOrder: 210 },
  { code: 'plc_invoice_generation', name: 'Invoice Generation', description: 'Generate placement invoice', category: 'workflow', entityType: 'placement', icon: '💰', color: 'violet', targetDays: 7, priority: 'normal', outcomes: [{ label: 'Generated', value: 'generated', color: 'green', nextAction: 'none' }, { label: 'Issue', value: 'issue', color: 'red', nextAction: 'create_task' }], points: 5, displayOrder: 220 },
  { code: 'plc_rate_increase', name: 'Rate Increase Process', description: 'Process rate increase request', category: 'workflow', entityType: 'placement', icon: '📈', color: 'violet', targetDays: 3, priority: 'normal', outcomes: [{ label: 'Approved', value: 'approved', color: 'green', nextAction: 'log_notes' }, { label: 'Denied', value: 'denied', color: 'red', nextAction: 'log_notes' }], points: 5, displayOrder: 230 },
  { code: 'plc_issue_escalation', name: 'Issue Escalation', description: 'Escalate placement issue', category: 'workflow', entityType: 'placement', icon: '⚠️', color: 'violet', targetDays: 1, priority: 'urgent', outcomes: [{ label: 'Resolved', value: 'resolved', color: 'green', nextAction: 'log_notes' }, { label: 'Escalated', value: 'escalated', color: 'red', nextAction: 'create_task' }], points: 10, displayOrder: 240 },
  { code: 'plc_conversion', name: 'Conversion Process', description: 'Process perm conversion', category: 'workflow', entityType: 'placement', icon: '🔄', color: 'violet', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Converting', value: 'converting', color: 'green', nextAction: 'create_task' }, { label: 'Not Converting', value: 'not_converting', color: 'gray', nextAction: 'log_notes' }], points: 15, displayOrder: 250 },
  
  // Documentation
  { code: 'plc_contract_execution', name: 'Contract Execution', description: 'Execute placement contract', category: 'documentation', entityType: 'placement', icon: '📝', color: 'gray', targetDays: 3, priority: 'urgent', outcomes: [{ label: 'Signed', value: 'signed', color: 'green', nextAction: 'none' }, { label: 'Pending', value: 'pending', color: 'yellow', nextAction: 'schedule_followup' }], points: 10, displayOrder: 300 },
  { code: 'plc_sow_review', name: 'SOW Review', description: 'Review Statement of Work', category: 'documentation', entityType: 'placement', icon: '📋', color: 'gray', targetDays: 3, priority: 'high', outcomes: REVIEW_OUTCOMES, points: 8, displayOrder: 310 },
  { code: 'plc_compliance_audit', name: 'Compliance Audit', description: 'Placement compliance audit', category: 'documentation', entityType: 'placement', icon: '✅', color: 'gray', targetDays: 30, priority: 'normal', outcomes: [{ label: 'Compliant', value: 'compliant', color: 'green', nextAction: 'none' }, { label: 'Non-Compliant', value: 'non_compliant', color: 'red', nextAction: 'create_task' }], points: 10, displayOrder: 320 },
  { code: 'plc_po_tracking', name: 'PO Tracking', description: 'Track purchase order status', category: 'documentation', entityType: 'placement', icon: '📑', color: 'gray', targetDays: 5, priority: 'normal', outcomes: [{ label: 'PO Active', value: 'active', color: 'green', nextAction: 'none' }, { label: 'PO Expiring', value: 'expiring', color: 'orange', nextAction: 'create_task' }], points: 5, displayOrder: 330 },
]

// Continue in part 2...







