/**
 * HR Time Off InputSets
 *
 * Reusable field groups for HR time off forms.
 * Based on hr.ts schema table: employeeTimeOff.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// OPTIONS
// ==========================================

export const TIME_OFF_TYPE_OPTIONS = [
  { value: 'pto', label: 'PTO' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal' },
  { value: 'bereavement', label: 'Bereavement' },
  { value: 'jury_duty', label: 'Jury Duty' },
  { value: 'parental', label: 'Parental Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

export const TIME_OFF_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ==========================================
// TIME OFF REQUEST FIELDS
// ==========================================

export const hrTimeOffRequestFields: FieldDefinition[] = [
  {
    id: 'type',
    label: 'Time Off Type',
    fieldType: 'select',
    required: true,
    options: TIME_OFF_TYPE_OPTIONS,
  },
  {
    id: 'startDate',
    label: 'Start Date',
    fieldType: 'date',
    required: true,
  },
  {
    id: 'endDate',
    label: 'End Date',
    fieldType: 'date',
    required: true,
  },
  {
    id: 'hours',
    label: 'Hours',
    fieldType: 'number',
    required: true,
    placeholder: '8',
    config: {
      min: 0.5,
      max: 160,
      step: 0.5,
    },
  },
  {
    id: 'reason',
    label: 'Reason',
    fieldType: 'textarea',
    placeholder: 'Enter reason for time off...',
    config: { rows: 3 },
  },
];

export const hrTimeOffRequestInputSet: InputSetConfig = {
  id: 'hr-timeoff-request',
  label: 'Time Off Request',
  description: 'Submit a time off request',
  fields: hrTimeOffRequestFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'type', colSpan: 2 },
      { fieldId: 'startDate', colSpan: 1 },
      { fieldId: 'endDate', colSpan: 1 },
      { fieldId: 'hours', colSpan: 2 },
      { fieldId: 'reason', colSpan: 2 },
    ],
  },
};

// ==========================================
// TIME OFF APPROVAL FIELDS
// ==========================================

export const hrTimeOffApprovalFields: FieldDefinition[] = [
  {
    id: 'status',
    label: 'Decision',
    fieldType: 'select',
    required: true,
    options: [
      { value: 'approved', label: 'Approve' },
      { value: 'denied', label: 'Deny' },
    ],
  },
  {
    id: 'denialReason',
    label: 'Denial Reason',
    fieldType: 'textarea',
    placeholder: 'Enter reason for denial...',
    config: { rows: 3 },
    visible: {
      type: 'condition',
      condition: { field: 'status', operator: 'eq', value: 'denied' },
    },
  },
];

export const hrTimeOffApprovalInputSet: InputSetConfig = {
  id: 'hr-timeoff-approval',
  label: 'Time Off Approval',
  description: 'Approve or deny time off request',
  fields: hrTimeOffApprovalFields,
  layout: {
    columns: 1,
    fieldLayout: [
      { fieldId: 'status', colSpan: 1 },
      { fieldId: 'denialReason', colSpan: 1 },
    ],
  },
};

// ==========================================
// TIME OFF BALANCE FIELDS (Display)
// ==========================================

export const hrTimeOffBalanceFields: FieldDefinition[] = [
  {
    id: 'ptoBalance',
    label: 'PTO Balance',
    fieldType: 'number',
    config: { suffix: 'hours' },
  },
  {
    id: 'ptoUsed',
    label: 'PTO Used',
    fieldType: 'number',
    config: { suffix: 'hours' },
  },
  {
    id: 'sickBalance',
    label: 'Sick Leave Balance',
    fieldType: 'number',
    config: { suffix: 'hours' },
  },
  {
    id: 'sickUsed',
    label: 'Sick Leave Used',
    fieldType: 'number',
    config: { suffix: 'hours' },
  },
];

export const hrTimeOffBalanceInputSet: InputSetConfig = {
  id: 'hr-timeoff-balance',
  label: 'Time Off Balances',
  description: 'Current time off balances',
  fields: hrTimeOffBalanceFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'ptoBalance', colSpan: 1 },
      { fieldId: 'ptoUsed', colSpan: 1 },
      { fieldId: 'sickBalance', colSpan: 1 },
      { fieldId: 'sickUsed', colSpan: 1 },
    ],
  },
};
