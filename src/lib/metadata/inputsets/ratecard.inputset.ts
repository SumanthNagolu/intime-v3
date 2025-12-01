/**
 * Rate Card InputSet
 *
 * Bill/Pay rate input with automatic margin calculation.
 * Used for submissions, placements, and job orders.
 *
 * @see docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// RATE TYPE OPTIONS
// ==========================================

/**
 * Rate type options
 */
export const RATE_TYPE_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual Salary' },
];

/**
 * Currency options
 */
export const RATE_CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'EUR', label: 'EUR (€)' },
];

// ==========================================
// RATE CARD FIELDS
// ==========================================

/**
 * Full rate card fields (bill + pay + margin)
 */
export const rateCardFields: FieldDefinition[] = [
  {
    id: 'rateType',
    label: 'Rate Type',
    type: 'enum',
    required: true,
    defaultValue: 'hourly',
    config: {
      options: RATE_TYPE_OPTIONS,
    },
  },
  {
    id: 'currency',
    label: 'Currency',
    type: 'enum',
    required: true,
    defaultValue: 'USD',
    config: {
      options: RATE_CURRENCY_OPTIONS,
    },
  },
  {
    id: 'billRate',
    label: 'Bill Rate',
    type: 'currency',
    required: true,
    description: 'Rate charged to client',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'payRate',
    label: 'Pay Rate',
    type: 'currency',
    required: true,
    description: 'Rate paid to candidate/consultant',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'marginAmount',
    label: 'Margin ($)',
    type: 'currency',
    readonly: true,
    description: 'Bill Rate - Pay Rate (calculated)',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'marginPercent',
    label: 'Margin %',
    type: 'percentage',
    readonly: true,
    description: '(Bill - Pay) / Bill × 100 (calculated)',
    config: {
      decimals: 1,
      suffix: '%',
    },
  },
  {
    id: 'rateEffectiveDate',
    label: 'Effective Date',
    type: 'date',
    description: 'When this rate takes effect',
  },
  {
    id: 'rateNotes',
    label: 'Rate Notes',
    type: 'text',
    placeholder: 'Any special rate considerations...',
  },
];

/**
 * Rate Card InputSet - Full configuration
 */
export const rateCardInputSet: InputSetConfig = {
  id: 'rate-card',
  label: 'Rate Information',
  description: 'Bill rate, pay rate, and margin calculation',
  fields: rateCardFields,
  layout: {
    columns: 3,
    fieldLayout: [
      { fieldId: 'rateType', colSpan: 1 },
      { fieldId: 'currency', colSpan: 1 },
      { fieldId: 'rateEffectiveDate', colSpan: 1 },
      { fieldId: 'billRate', colSpan: 1 },
      { fieldId: 'payRate', colSpan: 1 },
      { fieldId: 'marginAmount', colSpan: 1 },
      { fieldId: 'marginPercent', colSpan: 1 },
      { fieldId: 'rateNotes', colSpan: 2 },
    ],
  },
};

// ==========================================
// RATE RANGE INPUTSET (For Jobs)
// ==========================================

/**
 * Rate range fields (for job postings)
 */
export const rateRangeFields: FieldDefinition[] = [
  {
    id: 'rateType',
    label: 'Rate Type',
    type: 'enum',
    required: true,
    defaultValue: 'hourly',
    config: {
      options: RATE_TYPE_OPTIONS,
    },
  },
  {
    id: 'currency',
    label: 'Currency',
    type: 'enum',
    required: true,
    defaultValue: 'USD',
    config: {
      options: RATE_CURRENCY_OPTIONS,
    },
  },
  {
    id: 'rateMin',
    label: 'Minimum Rate',
    type: 'currency',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'rateMax',
    label: 'Maximum Rate',
    type: 'currency',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'targetRate',
    label: 'Target Rate',
    type: 'currency',
    description: 'Preferred rate for this position',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
];

/**
 * Rate Range InputSet - For job postings
 */
export const rateRangeInputSet: InputSetConfig = {
  id: 'rate-range',
  label: 'Rate Range',
  description: 'Minimum and maximum rate for job postings',
  fields: rateRangeFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'rateType', colSpan: 1 },
      { fieldId: 'currency', colSpan: 1 },
      { fieldId: 'rateMin', colSpan: 1 },
      { fieldId: 'rateMax', colSpan: 1 },
      { fieldId: 'targetRate', colSpan: 2 },
    ],
  },
};

// ==========================================
// SIMPLE RATE INPUTSET (For Candidates)
// ==========================================

/**
 * Simple desired rate fields
 */
export const desiredRateFields: FieldDefinition[] = [
  {
    id: 'desiredRateType',
    label: 'Rate Type',
    type: 'enum',
    defaultValue: 'hourly',
    config: {
      options: RATE_TYPE_OPTIONS,
    },
  },
  {
    id: 'desiredRate',
    label: 'Desired Rate',
    type: 'currency',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'desiredRateMin',
    label: 'Minimum Acceptable',
    type: 'currency',
    description: 'Lowest acceptable rate',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'openToNegotiation',
    label: 'Open to Negotiation',
    type: 'boolean',
    defaultValue: true,
  },
];

/**
 * Simple Rate InputSet - For candidate desired compensation
 */
export const desiredRateInputSet: InputSetConfig = {
  id: 'desired-rate',
  label: 'Desired Compensation',
  description: 'Candidate desired rate information',
  fields: desiredRateFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'desiredRateType', colSpan: 1 },
      { fieldId: 'desiredRate', colSpan: 1 },
      { fieldId: 'desiredRateMin', colSpan: 1 },
      { fieldId: 'openToNegotiation', colSpan: 1 },
    ],
  },
};

// ==========================================
// OVERTIME RATE INPUTSET
// ==========================================

/**
 * Overtime rate fields
 */
export const overtimeRateFields: FieldDefinition[] = [
  {
    id: 'regularBillRate',
    label: 'Regular Bill Rate',
    type: 'currency',
    required: true,
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'regularPayRate',
    label: 'Regular Pay Rate',
    type: 'currency',
    required: true,
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'regularHoursPerWeek',
    label: 'Regular Hours/Week',
    type: 'number',
    defaultValue: 40,
  },
  {
    id: 'otMultiplier',
    label: 'OT Multiplier',
    type: 'number',
    defaultValue: 1.5,
    config: {
      decimals: 2,
      suffix: 'x',
    },
  },
  {
    id: 'otBillRate',
    label: 'OT Bill Rate',
    type: 'currency',
    description: 'Typically 1.5x regular bill rate',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'otPayRate',
    label: 'OT Pay Rate',
    type: 'currency',
    description: 'Typically 1.5x regular pay rate',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'doubleTimeMultiplier',
    label: 'DT Multiplier',
    type: 'number',
    defaultValue: 2.0,
    config: {
      decimals: 2,
      suffix: 'x',
    },
  },
  {
    id: 'dtBillRate',
    label: 'DT Bill Rate',
    type: 'currency',
    description: 'Double time bill rate (if applicable)',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
  {
    id: 'dtPayRate',
    label: 'DT Pay Rate',
    type: 'currency',
    description: 'Double time pay rate (if applicable)',
    config: {
      prefix: '$',
      decimals: 2,
    },
  },
];

/**
 * Overtime Rate InputSet
 */
export const overtimeRateInputSet: InputSetConfig = {
  id: 'overtime-rate',
  label: 'Overtime Rate Configuration',
  description: 'Regular and overtime rate settings',
  fields: overtimeRateFields,
  layout: {
    columns: 3,
    fieldLayout: [
      { fieldId: 'regularBillRate', colSpan: 1 },
      { fieldId: 'regularPayRate', colSpan: 1 },
      { fieldId: 'regularHoursPerWeek', colSpan: 1 },
      { fieldId: 'otMultiplier', colSpan: 1 },
      { fieldId: 'otBillRate', colSpan: 1 },
      { fieldId: 'otPayRate', colSpan: 1 },
      { fieldId: 'doubleTimeMultiplier', colSpan: 1 },
      { fieldId: 'dtBillRate', colSpan: 1 },
      { fieldId: 'dtPayRate', colSpan: 1 },
    ],
  },
};

export default rateCardInputSet;

