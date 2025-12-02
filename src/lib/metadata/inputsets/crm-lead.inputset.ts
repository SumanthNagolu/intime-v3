/**
 * CRM Lead InputSets
 *
 * Reusable field configurations for Lead entity screens.
 * Includes BANT scoring, touchpoints, and qualification tracking.
 */

import type { InputSetConfig, FieldDefinition } from '../types';
import { ACTIVITY_TYPE_OPTIONS, ACTIVITY_OUTCOME_OPTIONS, DIRECTION_OPTIONS } from './timeline.inputset';

// ==========================================
// LEAD TOUCHPOINT OPTIONS
// ==========================================

export const TOUCHPOINT_TYPE_OPTIONS = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'text', label: 'Text Message' },
  { value: 'event', label: 'Event' },
] as const;

export const TOUCHPOINT_OUTCOME_OPTIONS = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
  { value: 'no_response', label: 'No Response' },
] as const;

export const NEED_URGENCY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

export const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '30_days', label: 'Within 30 Days' },
  { value: '90_days', label: 'Within 90 Days' },
  { value: '6_months', label: 'Within 6 Months' },
  { value: '12_months', label: 'Within 12 Months' },
  { value: 'unknown', label: 'Unknown' },
] as const;

export const BUDGET_TIMEFRAME_OPTIONS = [
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'next_quarter', label: 'Next Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'next_year', label: 'Next Year' },
] as const;

export const DECISION_MAKER_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'partial', label: 'Partial' },
  { value: 'unknown', label: 'Unknown' },
] as const;

export const QUALIFICATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'disqualified', label: 'Disqualified' },
] as const;

// ==========================================
// LEAD BANT SCORING FIELDS
// ==========================================

export const leadBANTScoreFields: FieldDefinition[] = [
  {
    id: 'bantBudget',
    label: 'Budget Score',
    type: 'number',
    path: 'bantBudget',
    description: '0-25: Has budget allocated for this need?',
    config: { min: 0, max: 25 },
  },
  {
    id: 'bantAuthority',
    label: 'Authority Score',
    type: 'number',
    path: 'bantAuthority',
    description: '0-25: Can they make the decision?',
    config: { min: 0, max: 25 },
  },
  {
    id: 'bantNeed',
    label: 'Need Score',
    type: 'number',
    path: 'bantNeed',
    description: '0-25: Is there a clear business need?',
    config: { min: 0, max: 25 },
  },
  {
    id: 'bantTimeline',
    label: 'Timeline Score',
    type: 'number',
    path: 'bantTimeline',
    description: '0-25: When do they need to make a decision?',
    config: { min: 0, max: 25 },
  },
];

export const leadBANTNotesFields: FieldDefinition[] = [
  {
    id: 'bantBudgetNotes',
    label: 'Budget Notes',
    type: 'textarea',
    path: 'bantBudgetNotes',
    config: { rows: 2 },
  },
  {
    id: 'bantAuthorityNotes',
    label: 'Authority Notes',
    type: 'textarea',
    path: 'bantAuthorityNotes',
    config: { rows: 2 },
  },
  {
    id: 'bantNeedNotes',
    label: 'Need Notes',
    type: 'textarea',
    path: 'bantNeedNotes',
    config: { rows: 2 },
  },
  {
    id: 'bantTimelineNotes',
    label: 'Timeline Notes',
    type: 'textarea',
    path: 'bantTimelineNotes',
    config: { rows: 2 },
  },
];

// ==========================================
// LEAD QUALIFICATION FIELDS
// ==========================================

export const leadQualificationBudgetFields: FieldDefinition[] = [
  {
    id: 'hasBudget',
    label: 'Has Budget',
    type: 'boolean',
    path: 'hasBudget',
  },
  {
    id: 'budgetAmount',
    label: 'Budget Amount',
    type: 'currency',
    path: 'budgetAmount',
    config: { prefix: '$' },
  },
  {
    id: 'budgetTimeframe',
    label: 'Budget Timeframe',
    type: 'enum',
    path: 'budgetTimeframe',
    config: { options: BUDGET_TIMEFRAME_OPTIONS },
  },
  {
    id: 'budgetNotes',
    label: 'Budget Notes',
    type: 'textarea',
    path: 'budgetNotes',
    config: { rows: 3 },
  },
];

export const leadQualificationAuthorityFields: FieldDefinition[] = [
  {
    id: 'decisionMaker',
    label: 'Decision Maker',
    type: 'enum',
    path: 'decisionMaker',
    config: { options: DECISION_MAKER_OPTIONS },
  },
  {
    id: 'decisionProcess',
    label: 'Decision Process',
    type: 'textarea',
    path: 'decisionProcess',
    config: { rows: 2 },
  },
  {
    id: 'otherStakeholders',
    label: 'Other Stakeholders',
    type: 'textarea',
    path: 'otherStakeholders',
    config: { rows: 2 },
  },
  {
    id: 'authorityNotes',
    label: 'Authority Notes',
    type: 'textarea',
    path: 'authorityNotes',
    config: { rows: 3 },
  },
];

export const leadQualificationNeedFields: FieldDefinition[] = [
  {
    id: 'needIdentified',
    label: 'Need Identified',
    type: 'boolean',
    path: 'needIdentified',
  },
  {
    id: 'needUrgency',
    label: 'Need Urgency',
    type: 'enum',
    path: 'needUrgency',
    config: {
      options: NEED_URGENCY_OPTIONS,
      badgeColors: {
        critical: 'red',
        high: 'orange',
        medium: 'yellow',
        low: 'gray',
      },
    },
  },
  {
    id: 'painPoints',
    label: 'Pain Points',
    type: 'tags',
    path: 'painPoints',
  },
  {
    id: 'currentSolution',
    label: 'Current Solution',
    type: 'textarea',
    path: 'currentSolution',
    config: { rows: 2 },
  },
  {
    id: 'needNotes',
    label: 'Need Notes',
    type: 'textarea',
    path: 'needNotes',
    config: { rows: 3 },
  },
];

export const leadQualificationTimelineFields: FieldDefinition[] = [
  {
    id: 'timeline',
    label: 'Timeline',
    type: 'enum',
    path: 'timeline',
    config: { options: TIMELINE_OPTIONS },
  },
  {
    id: 'decisionDate',
    label: 'Decision Date',
    type: 'date',
    path: 'decisionDate',
  },
  {
    id: 'projectStartDate',
    label: 'Project Start Date',
    type: 'date',
    path: 'projectStartDate',
  },
  {
    id: 'timelineNotes',
    label: 'Timeline Notes',
    type: 'textarea',
    path: 'timelineNotes',
    config: { rows: 3 },
  },
];

export const leadQualificationStatusFields: FieldDefinition[] = [
  {
    id: 'qualificationStatus',
    label: 'Qualification Status',
    type: 'enum',
    path: 'qualificationStatus',
    config: {
      options: QUALIFICATION_STATUS_OPTIONS,
      badgeColors: {
        pending: 'yellow',
        qualified: 'green',
        disqualified: 'red',
      },
    },
  },
  {
    id: 'qualifiedAt',
    label: 'Qualified At',
    type: 'datetime',
    path: 'qualifiedAt',
    config: { format: 'medium' },
  },
];

// ==========================================
// LEAD TOUCHPOINT FIELDS
// ==========================================

export const leadTouchpointFields: FieldDefinition[] = [
  {
    id: 'touchpointType',
    label: 'Type',
    type: 'enum',
    path: 'touchpointType',
    required: true,
    config: {
      options: TOUCHPOINT_TYPE_OPTIONS,
      badgeColors: {
        call: 'green',
        email: 'blue',
        meeting: 'purple',
        linkedin: 'cyan',
        text: 'gray',
        event: 'amber',
      },
    },
  },
  {
    id: 'direction',
    label: 'Direction',
    type: 'enum',
    path: 'direction',
    required: true,
    config: {
      options: DIRECTION_OPTIONS,
      badgeColors: {
        inbound: 'green',
        outbound: 'blue',
      },
    },
  },
  {
    id: 'subject',
    label: 'Subject',
    type: 'text',
    path: 'subject',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    path: 'notes',
    config: { rows: 3 },
  },
  {
    id: 'outcome',
    label: 'Outcome',
    type: 'enum',
    path: 'outcome',
    config: {
      options: TOUCHPOINT_OUTCOME_OPTIONS,
      badgeColors: {
        positive: 'green',
        neutral: 'gray',
        negative: 'red',
        no_response: 'yellow',
      },
    },
  },
  {
    id: 'nextSteps',
    label: 'Next Steps',
    type: 'textarea',
    path: 'nextSteps',
    config: { rows: 2 },
  },
  {
    id: 'nextFollowUpDate',
    label: 'Next Follow-Up',
    type: 'date',
    path: 'nextFollowUpDate',
  },
  {
    id: 'durationMinutes',
    label: 'Duration (min)',
    type: 'number',
    path: 'durationMinutes',
    config: { min: 0 },
  },
  {
    id: 'touchpointDate',
    label: 'Date',
    type: 'datetime',
    path: 'touchpointDate',
    config: { format: 'medium' },
  },
];

// ==========================================
// INPUT SETS
// ==========================================

/**
 * BANT Score InputSet - Score summary grid
 */
export const leadBANTScoreInputSet: InputSetConfig = {
  id: 'lead-bant-score',
  name: 'BANT Scores',
  description: 'Budget, Authority, Need, Timeline scores',
  fields: leadBANTScoreFields,
  layout: {
    columns: 4,
    gap: 'md',
  },
};

/**
 * BANT Notes InputSet - Detailed notes for each BANT factor
 */
export const leadBANTNotesInputSet: InputSetConfig = {
  id: 'lead-bant-notes',
  name: 'BANT Notes',
  description: 'Detailed notes for each BANT qualification factor',
  fields: leadBANTNotesFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Qualification Budget InputSet
 */
export const leadQualificationBudgetInputSet: InputSetConfig = {
  id: 'lead-qualification-budget',
  name: 'Budget Qualification',
  description: 'Budget-related qualification details',
  fields: leadQualificationBudgetFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Qualification Authority InputSet
 */
export const leadQualificationAuthorityInputSet: InputSetConfig = {
  id: 'lead-qualification-authority',
  name: 'Authority Qualification',
  description: 'Authority and decision-maker details',
  fields: leadQualificationAuthorityFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Qualification Need InputSet
 */
export const leadQualificationNeedInputSet: InputSetConfig = {
  id: 'lead-qualification-need',
  name: 'Need Qualification',
  description: 'Business need and pain points',
  fields: leadQualificationNeedFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Qualification Timeline InputSet
 */
export const leadQualificationTimelineInputSet: InputSetConfig = {
  id: 'lead-qualification-timeline',
  name: 'Timeline Qualification',
  description: 'Decision and project timeline',
  fields: leadQualificationTimelineFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Qualification Status InputSet
 */
export const leadQualificationStatusInputSet: InputSetConfig = {
  id: 'lead-qualification-status',
  name: 'Qualification Status',
  description: 'Overall qualification status',
  fields: leadQualificationStatusFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Touchpoint InputSet - For logging new touchpoints
 */
export const leadTouchpointInputSet: InputSetConfig = {
  id: 'lead-touchpoint',
  name: 'Touchpoint',
  description: 'Log a lead touchpoint/interaction',
  fields: leadTouchpointFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Full BANT InputSet - All BANT fields combined
 */
export const leadBANTFullInputSet: InputSetConfig = {
  id: 'lead-bant-full',
  name: 'Full BANT Qualification',
  description: 'Complete BANT qualification with scores and notes',
  fields: [...leadBANTScoreFields, ...leadBANTNotesFields],
  layout: {
    columns: 2,
    gap: 'md',
  },
};

export default {
  leadBANTScoreInputSet,
  leadBANTNotesInputSet,
  leadQualificationBudgetInputSet,
  leadQualificationAuthorityInputSet,
  leadQualificationNeedInputSet,
  leadQualificationTimelineInputSet,
  leadQualificationStatusInputSet,
  leadTouchpointInputSet,
  leadBANTFullInputSet,
};
