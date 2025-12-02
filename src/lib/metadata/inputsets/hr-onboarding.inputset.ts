/**
 * HR Onboarding InputSets
 *
 * Reusable field groups for HR onboarding forms.
 * Based on hr.ts schema tables: employeeOnboarding, onboardingTasks.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// OPTIONS
// ==========================================

export const ONBOARDING_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
];

export const TASK_CATEGORY_OPTIONS = [
  { value: 'paperwork', label: 'Paperwork' },
  { value: 'it_setup', label: 'IT Setup' },
  { value: 'training', label: 'Training' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'other', label: 'Other' },
];

// ==========================================
// ONBOARDING TASK FIELDS
// ==========================================

export const hrOnboardingTaskFields: FieldDefinition[] = [
  {
    id: 'taskName',
    label: 'Task Name',
    fieldType: 'text',
    required: true,
    placeholder: 'Complete I-9 Form',
    config: { maxLength: 200 },
  },
  {
    id: 'category',
    label: 'Category',
    fieldType: 'select',
    required: true,
    options: TASK_CATEGORY_OPTIONS,
  },
  {
    id: 'description',
    label: 'Description',
    fieldType: 'textarea',
    placeholder: 'Detailed task instructions...',
    config: { rows: 3 },
  },
  {
    id: 'isRequired',
    label: 'Required',
    fieldType: 'boolean',
    description: 'This task must be completed',
  },
  {
    id: 'dueDaysFromStart',
    label: 'Due (Days from Start)',
    fieldType: 'number',
    placeholder: '3',
    description: 'Number of days from hire date',
    config: { min: 1, max: 90 },
  },
  {
    id: 'sortOrder',
    label: 'Order',
    fieldType: 'number',
    placeholder: '1',
    config: { min: 0 },
  },
];

export const hrOnboardingTaskInputSet: InputSetConfig = {
  id: 'hr-onboarding-task',
  label: 'Onboarding Task',
  description: 'Create or edit an onboarding task',
  fields: hrOnboardingTaskFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'taskName', colSpan: 2 },
      { fieldId: 'category', colSpan: 1 },
      { fieldId: 'isRequired', colSpan: 1 },
      { fieldId: 'description', colSpan: 2 },
      { fieldId: 'dueDaysFromStart', colSpan: 1 },
      { fieldId: 'sortOrder', colSpan: 1 },
    ],
  },
};

// ==========================================
// TASK COMPLETION FIELDS
// ==========================================

export const hrOnboardingTaskCompletionFields: FieldDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    fieldType: 'select',
    required: true,
    options: TASK_STATUS_OPTIONS,
  },
  {
    id: 'notes',
    label: 'Notes',
    fieldType: 'textarea',
    placeholder: 'Completion notes or comments...',
    config: { rows: 3 },
  },
];

export const hrOnboardingTaskCompletionInputSet: InputSetConfig = {
  id: 'hr-onboarding-task-completion',
  label: 'Update Task',
  description: 'Mark task as complete or skipped',
  fields: hrOnboardingTaskCompletionFields,
  layout: {
    columns: 1,
    fieldLayout: [
      { fieldId: 'status', colSpan: 1 },
      { fieldId: 'notes', colSpan: 1 },
    ],
  },
};

// ==========================================
// ONBOARDING ASSIGNMENT FIELDS
// ==========================================

export const hrOnboardingAssignmentFields: FieldDefinition[] = [
  {
    id: 'assignedTo',
    label: 'Assign To',
    fieldType: 'reference',
    required: true,
    config: {
      entity: 'user',
      displayField: 'fullName',
    },
  },
  {
    id: 'notes',
    label: 'Notes',
    fieldType: 'textarea',
    placeholder: 'Special instructions for onboarding...',
    config: { rows: 3 },
  },
];

export const hrOnboardingAssignmentInputSet: InputSetConfig = {
  id: 'hr-onboarding-assignment',
  label: 'Assign Onboarding',
  description: 'Assign onboarding to HR representative',
  fields: hrOnboardingAssignmentFields,
  layout: {
    columns: 1,
    fieldLayout: [
      { fieldId: 'assignedTo', colSpan: 1 },
      { fieldId: 'notes', colSpan: 1 },
    ],
  },
};
