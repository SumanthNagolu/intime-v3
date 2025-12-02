/**
 * TA (Talent Acquisition) Options Registry
 *
 * Centralized enum options for TA-specific entities.
 * Used by screen factories, InputSets, and widgets.
 */

import type { OptionDefinition } from '../types/widget.types';

// ==========================================
// LEAD STAGE OPTIONS (Kanban stages)
// ==========================================

export const TA_LEAD_STAGE_OPTIONS: OptionDefinition[] = [
  { value: 'new', label: 'New', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'contacted', label: 'Contacted', color: 'cyan', bgColor: 'bg-cyan-100' },
  { value: 'engaged', label: 'Engaged', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'qualifying', label: 'Qualifying', color: 'orange', bgColor: 'bg-orange-100' },
  { value: 'qualified', label: 'Qualified', color: 'green', bgColor: 'bg-green-100' },
  { value: 'disqualified', label: 'Disqualified', color: 'red', bgColor: 'bg-red-100' },
];

// ==========================================
// BANT QUALIFICATION OPTIONS
// ==========================================

export const BANT_SCORE_OPTIONS: OptionDefinition[] = [
  { value: 'unknown', label: 'Unknown', color: 'gray', bgColor: 'bg-gray-100' },
  { value: 'low', label: 'Low', color: 'red', bgColor: 'bg-red-100' },
  { value: 'medium', label: 'Medium', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'high', label: 'High', color: 'green', bgColor: 'bg-green-100' },
];

export const BANT_BUDGET_OPTIONS: OptionDefinition[] = [
  { value: 'unknown', label: 'Unknown', color: 'gray' },
  { value: 'no_budget', label: 'No Budget', color: 'red' },
  { value: 'limited', label: 'Limited Budget', color: 'amber' },
  { value: 'allocated', label: 'Budget Allocated', color: 'green' },
  { value: 'approved', label: 'Budget Approved', color: 'emerald' },
];

export const BANT_AUTHORITY_OPTIONS: OptionDefinition[] = [
  { value: 'unknown', label: 'Unknown', color: 'gray' },
  { value: 'influencer', label: 'Influencer Only', color: 'amber' },
  { value: 'recommender', label: 'Recommender', color: 'blue' },
  { value: 'decision_maker', label: 'Decision Maker', color: 'green' },
  { value: 'economic_buyer', label: 'Economic Buyer', color: 'emerald' },
];

export const BANT_NEED_OPTIONS: OptionDefinition[] = [
  { value: 'unknown', label: 'Unknown', color: 'gray' },
  { value: 'no_need', label: 'No Clear Need', color: 'red' },
  { value: 'exploring', label: 'Exploring Options', color: 'amber' },
  { value: 'defined', label: 'Need Defined', color: 'blue' },
  { value: 'urgent', label: 'Urgent Need', color: 'green' },
];

export const BANT_TIMELINE_OPTIONS: OptionDefinition[] = [
  { value: 'unknown', label: 'Unknown', color: 'gray' },
  { value: 'no_timeline', label: 'No Timeline', color: 'red' },
  { value: '6_months_plus', label: '6+ Months', color: 'amber' },
  { value: '3_6_months', label: '3-6 Months', color: 'blue' },
  { value: '1_3_months', label: '1-3 Months', color: 'cyan' },
  { value: 'immediate', label: 'Immediate', color: 'green' },
];

// ==========================================
// TRAINING APPLICATION OPTIONS
// ==========================================

export const TRAINING_APPLICATION_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'new', label: 'New', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'reviewing', label: 'Reviewing', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'interview_scheduled', label: 'Interview Scheduled', color: 'cyan', bgColor: 'bg-cyan-100' },
  { value: 'interviewed', label: 'Interviewed', color: 'purple', bgColor: 'bg-purple-100' },
  { value: 'approved', label: 'Approved', color: 'green', bgColor: 'bg-green-100' },
  { value: 'enrolled', label: 'Enrolled', color: 'emerald', bgColor: 'bg-emerald-100' },
  { value: 'rejected', label: 'Rejected', color: 'red', bgColor: 'bg-red-100' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'gray', bgColor: 'bg-gray-100' },
];

export const TRAINING_PROGRAM_OPTIONS: OptionDefinition[] = [
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'servicenow', label: 'ServiceNow' },
  { value: 'workday', label: 'Workday' },
  { value: 'sap', label: 'SAP' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'data_engineering', label: 'Data Engineering' },
  { value: 'full_stack', label: 'Full Stack' },
  { value: 'qa_automation', label: 'QA Automation' },
];

export const ENROLLMENT_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'pending', label: 'Pending Start', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'active', label: 'In Progress', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'completed', label: 'Completed', color: 'green', bgColor: 'bg-green-100' },
  { value: 'dropped', label: 'Dropped', color: 'red', bgColor: 'bg-red-100' },
  { value: 'on_hold', label: 'On Hold', color: 'gray', bgColor: 'bg-gray-100' },
];

// ==========================================
// INTERNAL JOB OPTIONS
// ==========================================

export const INTERNAL_JOB_STATUS_OPTIONS: OptionDefinition[] = [
  { value: 'draft', label: 'Draft', color: 'gray', bgColor: 'bg-gray-100' },
  { value: 'open', label: 'Open', color: 'green', bgColor: 'bg-green-100' },
  { value: 'on_hold', label: 'On Hold', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'filled', label: 'Filled', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'cancelled', label: 'Cancelled', color: 'red', bgColor: 'bg-red-100' },
];

export const INTERNAL_JOB_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
];

export const INTERNAL_CANDIDATE_STAGE_OPTIONS: OptionDefinition[] = [
  { value: 'applied', label: 'Applied', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'screening', label: 'Screening', color: 'cyan', bgColor: 'bg-cyan-100' },
  { value: 'interview', label: 'Interview', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'offer', label: 'Offer', color: 'purple', bgColor: 'bg-purple-100' },
  { value: 'hired', label: 'Hired', color: 'green', bgColor: 'bg-green-100' },
  { value: 'rejected', label: 'Rejected', color: 'red', bgColor: 'bg-red-100' },
];

// ==========================================
// TA DEAL OPTIONS
// ==========================================

export const TA_DEAL_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'staffing', label: 'Staffing Services', color: 'blue' },
  { value: 'training', label: 'Training Program', color: 'green' },
  { value: 'consulting', label: 'Consulting', color: 'purple' },
  { value: 'recruitment', label: 'Direct Recruitment', color: 'amber' },
];

export const TA_DEAL_STAGE_OPTIONS: OptionDefinition[] = [
  { value: 'qualification', label: 'Qualification', color: 'blue', bgColor: 'bg-blue-100' },
  { value: 'discovery', label: 'Discovery', color: 'cyan', bgColor: 'bg-cyan-100' },
  { value: 'proposal', label: 'Proposal', color: 'amber', bgColor: 'bg-amber-100' },
  { value: 'negotiation', label: 'Negotiation', color: 'orange', bgColor: 'bg-orange-100' },
  { value: 'closed_won', label: 'Closed Won', color: 'green', bgColor: 'bg-green-100' },
  { value: 'closed_lost', label: 'Closed Lost', color: 'red', bgColor: 'bg-red-100' },
];

// ==========================================
// CAMPAIGN OPTIONS (TA-specific)
// ==========================================

export const TA_CAMPAIGN_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'talent_sourcing', label: 'Talent Sourcing', color: 'blue' },
  { value: 'employer_branding', label: 'Employer Branding', color: 'purple' },
  { value: 'training_promotion', label: 'Training Promotion', color: 'green' },
  { value: 'client_outreach', label: 'Client Outreach', color: 'amber' },
  { value: 'event', label: 'Event/Webinar', color: 'cyan' },
  { value: 'referral', label: 'Referral Program', color: 'emerald' },
];

// ==========================================
// ACTIVITY OPTIONS (TA-specific)
// ==========================================

export const TA_ACTIVITY_TYPE_OPTIONS: OptionDefinition[] = [
  { value: 'outreach', label: 'Outreach', color: 'blue' },
  { value: 'follow_up', label: 'Follow-up', color: 'cyan' },
  { value: 'qualification_call', label: 'Qualification Call', color: 'amber' },
  { value: 'discovery_meeting', label: 'Discovery Meeting', color: 'purple' },
  { value: 'proposal_review', label: 'Proposal Review', color: 'orange' },
  { value: 'contract_discussion', label: 'Contract Discussion', color: 'green' },
  { value: 'training_interview', label: 'Training Interview', color: 'teal' },
  { value: 'internal_interview', label: 'Internal Interview', color: 'indigo' },
];

// ==========================================
// CENTRALIZED TA OPTIONS REGISTRY
// ==========================================

export const TA_OPTIONS = {
  // Lead
  leadStage: TA_LEAD_STAGE_OPTIONS,
  bantScore: BANT_SCORE_OPTIONS,
  bantBudget: BANT_BUDGET_OPTIONS,
  bantAuthority: BANT_AUTHORITY_OPTIONS,
  bantNeed: BANT_NEED_OPTIONS,
  bantTimeline: BANT_TIMELINE_OPTIONS,

  // Training
  trainingApplicationStatus: TRAINING_APPLICATION_STATUS_OPTIONS,
  trainingProgram: TRAINING_PROGRAM_OPTIONS,
  enrollmentStatus: ENROLLMENT_STATUS_OPTIONS,

  // Internal Jobs
  internalJobStatus: INTERNAL_JOB_STATUS_OPTIONS,
  internalJobType: INTERNAL_JOB_TYPE_OPTIONS,
  internalCandidateStage: INTERNAL_CANDIDATE_STAGE_OPTIONS,

  // Deals
  dealType: TA_DEAL_TYPE_OPTIONS,
  dealStage: TA_DEAL_STAGE_OPTIONS,

  // Campaigns
  campaignType: TA_CAMPAIGN_TYPE_OPTIONS,

  // Activities
  activityType: TA_ACTIVITY_TYPE_OPTIONS,
} as const;

export type TaOptionsKey = keyof typeof TA_OPTIONS;
