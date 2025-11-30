/**
 * Interview InputSet
 *
 * Reusable interview scheduling and feedback fields.
 * Used across ATS for interview management.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

/**
 * Interview type options
 */
export const INTERVIEW_TYPE_OPTIONS = [
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'video', label: 'Video Interview' },
  { value: 'onsite', label: 'On-site Interview' },
  { value: 'technical', label: 'Technical Interview' },
  { value: 'coding', label: 'Coding Challenge' },
  { value: 'panel', label: 'Panel Interview' },
  { value: 'hiring_manager', label: 'Hiring Manager' },
  { value: 'hr', label: 'HR Interview' },
  { value: 'executive', label: 'Executive Interview' },
  { value: 'culture_fit', label: 'Culture Fit' },
  { value: 'final', label: 'Final Interview' },
];

/**
 * Interview status options
 */
export const INTERVIEW_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'no_show', label: 'No Show' },
];

/**
 * Interview outcome options
 */
export const INTERVIEW_OUTCOME_OPTIONS = [
  { value: 'pass', label: 'Pass - Proceed' },
  { value: 'strong_pass', label: 'Strong Pass' },
  { value: 'hold', label: 'Hold - More Info Needed' },
  { value: 'fail', label: 'Fail - Do Not Proceed' },
  { value: 'pending', label: 'Pending Decision' },
];

/**
 * Interview scheduling fields
 */
export const interviewScheduleFields: FieldDefinition[] = [
  {
    id: 'interviewType',
    label: 'Interview Type',
    type: 'enum',
    required: true,
    config: {
      options: INTERVIEW_TYPE_OPTIONS,
    },
  },
  {
    id: 'scheduledAt',
    label: 'Date & Time',
    type: 'datetime',
    required: true,
  },
  {
    id: 'duration',
    label: 'Duration (minutes)',
    type: 'number',
    defaultValue: 60,
    config: {
      min: 15,
      max: 480,
      step: 15,
    },
  },
  {
    id: 'timezone',
    label: 'Timezone',
    type: 'enum',
    defaultValue: 'America/New_York',
    config: {
      options: [
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'America/Phoenix', label: 'Arizona (No DST)' },
        { value: 'UTC', label: 'UTC' },
        { value: 'Europe/London', label: 'London (GMT/BST)' },
        { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
      ],
    },
  },
  {
    id: 'interviewers',
    label: 'Interviewers',
    type: 'tags',
    description: 'Add interviewer names or emails',
    config: {
      allowCustom: true,
      maxTags: 10,
    },
  },
  {
    id: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'Conference Room A / Zoom link',
    config: {
      maxLength: 500,
    },
  },
  {
    id: 'meetingLink',
    label: 'Meeting Link',
    type: 'url',
    placeholder: 'https://zoom.us/j/...',
    visible: {
      type: 'condition',
      condition: {
        field: 'interviewType',
        operator: 'in',
        value: ['video', 'phone_screen', 'coding'],
      },
    },
  },
  {
    id: 'notes',
    label: 'Notes for Candidate',
    type: 'textarea',
    placeholder: 'Any special instructions or preparation notes',
    config: {
      maxLength: 2000,
    },
  },
];

/**
 * Interview Schedule InputSet configuration
 */
export const interviewScheduleInputSet: InputSetConfig = {
  id: 'interview-schedule',
  label: 'Schedule Interview',
  description: 'Interview scheduling details',
  fields: interviewScheduleFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'interviewType', colSpan: 1 },
      { fieldId: 'duration', colSpan: 1 },
      { fieldId: 'scheduledAt', colSpan: 1 },
      { fieldId: 'timezone', colSpan: 1 },
      { fieldId: 'interviewers', colSpan: 2 },
      { fieldId: 'location', colSpan: 1 },
      { fieldId: 'meetingLink', colSpan: 1 },
      { fieldId: 'notes', colSpan: 2 },
    ],
  },
};

/**
 * Interview feedback fields
 */
export const interviewFeedbackFields: FieldDefinition[] = [
  {
    id: 'outcome',
    label: 'Outcome',
    type: 'enum',
    required: true,
    config: {
      options: INTERVIEW_OUTCOME_OPTIONS,
    },
  },
  {
    id: 'overallRating',
    label: 'Overall Rating',
    type: 'number',
    required: true,
    description: 'Rate 1-5 (5 being excellent)',
    config: {
      min: 1,
      max: 5,
    },
  },
  {
    id: 'technicalScore',
    label: 'Technical Score',
    type: 'number',
    description: 'Technical skills assessment (1-5)',
    config: {
      min: 1,
      max: 5,
    },
  },
  {
    id: 'communicationScore',
    label: 'Communication Score',
    type: 'number',
    description: 'Communication skills (1-5)',
    config: {
      min: 1,
      max: 5,
    },
  },
  {
    id: 'cultureFitScore',
    label: 'Culture Fit Score',
    type: 'number',
    description: 'Team and culture fit (1-5)',
    config: {
      min: 1,
      max: 5,
    },
  },
  {
    id: 'strengths',
    label: 'Strengths',
    type: 'textarea',
    placeholder: 'Key strengths observed during the interview',
    config: {
      maxLength: 2000,
    },
  },
  {
    id: 'areasOfImprovement',
    label: 'Areas of Improvement',
    type: 'textarea',
    placeholder: 'Areas that need development',
    config: {
      maxLength: 2000,
    },
  },
  {
    id: 'detailedFeedback',
    label: 'Detailed Feedback',
    type: 'richtext',
    description: 'Comprehensive interview notes',
    config: {
      maxLength: 10000,
    },
  },
  {
    id: 'recommendHire',
    label: 'Recommend for Hire',
    type: 'boolean',
    description: 'Would you recommend hiring this candidate?',
  },
  {
    id: 'nextSteps',
    label: 'Recommended Next Steps',
    type: 'textarea',
    placeholder: 'e.g., Proceed to final round, Additional technical screen',
    config: {
      maxLength: 1000,
    },
  },
];

/**
 * Interview Feedback InputSet configuration
 */
export const interviewFeedbackInputSet: InputSetConfig = {
  id: 'interview-feedback',
  label: 'Interview Feedback',
  description: 'Post-interview assessment',
  fields: interviewFeedbackFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'outcome', colSpan: 1 },
      { fieldId: 'overallRating', colSpan: 1 },
      { fieldId: 'technicalScore', colSpan: 1 },
      { fieldId: 'communicationScore', colSpan: 1 },
      { fieldId: 'cultureFitScore', colSpan: 1 },
      { fieldId: 'recommendHire', colSpan: 1 },
      { fieldId: 'strengths', colSpan: 1 },
      { fieldId: 'areasOfImprovement', colSpan: 1 },
      { fieldId: 'detailedFeedback', colSpan: 2 },
      { fieldId: 'nextSteps', colSpan: 2 },
    ],
  },
};

/**
 * Quick interview rating (for inline feedback)
 */
export const quickInterviewRatingInputSet: InputSetConfig = {
  id: 'quick-interview-rating',
  label: 'Quick Rating',
  description: 'Rapid interview assessment',
  fields: [
    {
      id: 'outcome',
      label: 'Result',
      type: 'enum',
      required: true,
      config: {
        options: INTERVIEW_OUTCOME_OPTIONS,
      },
    },
    {
      id: 'rating',
      label: 'Rating',
      type: 'number',
      required: true,
      config: {
        min: 1,
        max: 5,
      },
    },
    {
      id: 'quickNotes',
      label: 'Quick Notes',
      type: 'textarea',
      placeholder: 'Brief feedback...',
      config: {
        maxLength: 500,
      },
    },
  ],
  layout: {
    columns: 3,
  },
};

/**
 * Interview cancellation/reschedule
 */
export const interviewRescheduleInputSet: InputSetConfig = {
  id: 'interview-reschedule',
  label: 'Reschedule Interview',
  description: 'Reschedule or cancel interview',
  fields: [
    {
      id: 'action',
      label: 'Action',
      type: 'enum',
      required: true,
      config: {
        options: [
          { value: 'reschedule', label: 'Reschedule' },
          { value: 'cancel', label: 'Cancel' },
        ],
      },
    },
    {
      id: 'reason',
      label: 'Reason',
      type: 'enum',
      required: true,
      config: {
        options: [
          { value: 'candidate_request', label: 'Candidate Request' },
          { value: 'interviewer_unavailable', label: 'Interviewer Unavailable' },
          { value: 'scheduling_conflict', label: 'Scheduling Conflict' },
          { value: 'candidate_withdrew', label: 'Candidate Withdrew' },
          { value: 'position_filled', label: 'Position Filled' },
          { value: 'other', label: 'Other' },
        ],
      },
    },
    {
      id: 'newDateTime',
      label: 'New Date & Time',
      type: 'datetime',
      visible: {
        type: 'condition',
        condition: { field: 'action', operator: 'eq', value: 'reschedule' },
      },
    },
    {
      id: 'notes',
      label: 'Additional Notes',
      type: 'textarea',
      config: {
        maxLength: 500,
      },
    },
  ],
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'action', colSpan: 1 },
      { fieldId: 'reason', colSpan: 1 },
      { fieldId: 'newDateTime', colSpan: 2 },
      { fieldId: 'notes', colSpan: 2 },
    ],
  },
};

export default interviewScheduleInputSet;
