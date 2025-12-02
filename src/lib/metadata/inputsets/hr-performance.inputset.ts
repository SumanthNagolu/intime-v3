/**
 * HR Performance InputSets
 *
 * Reusable field groups for HR performance management forms.
 * Based on hr.ts schema tables: performanceGoals, performanceFeedback.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// OPTIONS
// ==========================================

export const PERFORMANCE_GOAL_CATEGORY_OPTIONS = [
  { value: 'business', label: 'Business Goals' },
  { value: 'development', label: 'Development Goals' },
  { value: 'behavioral', label: 'Behavioral Goals' },
];

export const GOAL_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const FEEDBACK_TYPE_OPTIONS = [
  { value: 'strength', label: 'Strength' },
  { value: 'improvement', label: 'Area for Improvement' },
  { value: 'comment', label: 'General Comment' },
];

export const RATING_OPTIONS = [
  { value: '1', label: '1 - Needs Improvement' },
  { value: '2', label: '2 - Below Expectations' },
  { value: '3', label: '3 - Meets Expectations' },
  { value: '4', label: '4 - Exceeds Expectations' },
  { value: '5', label: '5 - Outstanding' },
];

// ==========================================
// PERFORMANCE GOAL FIELDS
// ==========================================

export const hrPerformanceGoalFields: FieldDefinition[] = [
  {
    id: 'goal',
    label: 'Goal',
    fieldType: 'textarea',
    required: true,
    placeholder: 'Describe the performance goal...',
    config: { rows: 3 },
  },
  {
    id: 'category',
    label: 'Category',
    fieldType: 'select',
    required: true,
    options: PERFORMANCE_GOAL_CATEGORY_OPTIONS,
  },
  {
    id: 'weightPercent',
    label: 'Weight (%)',
    fieldType: 'number',
    placeholder: '25',
    config: { min: 0, max: 100 },
    description: 'Percentage weight toward overall performance',
  },
  {
    id: 'startDate',
    label: 'Start Date',
    fieldType: 'date',
  },
  {
    id: 'targetDate',
    label: 'Target Date',
    fieldType: 'date',
  },
  {
    id: 'status',
    label: 'Status',
    fieldType: 'select',
    options: GOAL_STATUS_OPTIONS,
  },
  {
    id: 'comments',
    label: 'Comments',
    fieldType: 'textarea',
    placeholder: 'Additional notes or context...',
    config: { rows: 2 },
  },
];

export const hrPerformanceGoalInputSet: InputSetConfig = {
  id: 'hr-performance-goal',
  label: 'Performance Goal',
  description: 'Create or edit a performance goal',
  fields: hrPerformanceGoalFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'goal', colSpan: 2 },
      { fieldId: 'category', colSpan: 1 },
      { fieldId: 'weightPercent', colSpan: 1 },
      { fieldId: 'startDate', colSpan: 1 },
      { fieldId: 'targetDate', colSpan: 1 },
      { fieldId: 'status', colSpan: 1 },
      { fieldId: 'comments', colSpan: 2 },
    ],
  },
};

// ==========================================
// GOAL RATING FIELDS
// ==========================================

export const hrGoalRatingFields: FieldDefinition[] = [
  {
    id: 'rating',
    label: 'Rating',
    fieldType: 'select',
    required: true,
    options: RATING_OPTIONS,
  },
  {
    id: 'comments',
    label: 'Rating Comments',
    fieldType: 'textarea',
    placeholder: 'Explain the rating...',
    config: { rows: 3 },
  },
];

export const hrGoalRatingInputSet: InputSetConfig = {
  id: 'hr-goal-rating',
  label: 'Goal Rating',
  description: 'Rate goal completion',
  fields: hrGoalRatingFields,
  layout: {
    columns: 1,
    fieldLayout: [
      { fieldId: 'rating', colSpan: 1 },
      { fieldId: 'comments', colSpan: 1 },
    ],
  },
};

// ==========================================
// PERFORMANCE FEEDBACK FIELDS
// ==========================================

export const hrPerformanceFeedbackFields: FieldDefinition[] = [
  {
    id: 'feedbackType',
    label: 'Feedback Type',
    fieldType: 'select',
    required: true,
    options: FEEDBACK_TYPE_OPTIONS,
  },
  {
    id: 'category',
    label: 'Category',
    fieldType: 'text',
    placeholder: 'Communication, Leadership, Technical...',
    config: { maxLength: 100 },
  },
  {
    id: 'content',
    label: 'Feedback',
    fieldType: 'textarea',
    required: true,
    placeholder: 'Provide specific, actionable feedback...',
    config: { rows: 4 },
  },
];

export const hrPerformanceFeedbackInputSet: InputSetConfig = {
  id: 'hr-performance-feedback',
  label: 'Performance Feedback',
  description: 'Provide performance feedback',
  fields: hrPerformanceFeedbackFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'feedbackType', colSpan: 1 },
      { fieldId: 'category', colSpan: 1 },
      { fieldId: 'content', colSpan: 2 },
    ],
  },
};

// ==========================================
// SELF-ASSESSMENT FIELDS
// ==========================================

export const hrSelfAssessmentFields: FieldDefinition[] = [
  {
    id: 'accomplishments',
    label: 'Key Accomplishments',
    fieldType: 'textarea',
    required: true,
    placeholder: 'Describe your key accomplishments this period...',
    config: { rows: 4 },
  },
  {
    id: 'challenges',
    label: 'Challenges Faced',
    fieldType: 'textarea',
    placeholder: 'Describe any challenges you faced...',
    config: { rows: 3 },
  },
  {
    id: 'developmentAreas',
    label: 'Development Areas',
    fieldType: 'textarea',
    placeholder: 'Areas you want to develop...',
    config: { rows: 3 },
  },
  {
    id: 'overallRating',
    label: 'Self Rating',
    fieldType: 'select',
    options: RATING_OPTIONS,
  },
];

export const hrSelfAssessmentInputSet: InputSetConfig = {
  id: 'hr-self-assessment',
  label: 'Self Assessment',
  description: 'Complete your self-assessment',
  fields: hrSelfAssessmentFields,
  layout: {
    columns: 1,
    fieldLayout: [
      { fieldId: 'accomplishments', colSpan: 1 },
      { fieldId: 'challenges', colSpan: 1 },
      { fieldId: 'developmentAreas', colSpan: 1 },
      { fieldId: 'overallRating', colSpan: 1 },
    ],
  },
};

// ==========================================
// MANAGER EVALUATION FIELDS
// ==========================================

export const hrManagerEvaluationFields: FieldDefinition[] = [
  {
    id: 'overallRating',
    label: 'Overall Rating',
    fieldType: 'select',
    required: true,
    options: RATING_OPTIONS,
  },
  {
    id: 'summary',
    label: 'Performance Summary',
    fieldType: 'textarea',
    required: true,
    placeholder: 'Summarize the employee performance...',
    config: { rows: 4 },
  },
  {
    id: 'developmentPlan',
    label: 'Development Plan',
    fieldType: 'textarea',
    placeholder: 'Recommended development activities...',
    config: { rows: 3 },
  },
  {
    id: 'promotionReadiness',
    label: 'Promotion Readiness',
    fieldType: 'select',
    options: [
      { value: 'ready_now', label: 'Ready Now' },
      { value: 'ready_in_1_year', label: 'Ready in 1 Year' },
      { value: 'ready_in_2_years', label: 'Ready in 2+ Years' },
      { value: 'not_applicable', label: 'Not Applicable' },
    ],
  },
];

export const hrManagerEvaluationInputSet: InputSetConfig = {
  id: 'hr-manager-evaluation',
  label: 'Manager Evaluation',
  description: 'Complete manager evaluation',
  fields: hrManagerEvaluationFields,
  layout: {
    columns: 1,
    fieldLayout: [
      { fieldId: 'overallRating', colSpan: 1 },
      { fieldId: 'summary', colSpan: 1 },
      { fieldId: 'developmentPlan', colSpan: 1 },
      { fieldId: 'promotionReadiness', colSpan: 1 },
    ],
  },
};
