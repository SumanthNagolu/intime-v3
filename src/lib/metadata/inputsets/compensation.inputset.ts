/**
 * Compensation InputSet
 *
 * Reusable compensation/rate fields for jobs, placements, and candidates.
 * Follows Guidewire InputSet pattern for composable form sections.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

/**
 * Rate type options
 */
export const RATE_TYPE_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

/**
 * Currency options
 */
export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

/**
 * Employment type options
 */
export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'W2', label: 'W2 Employee' },
  { value: 'C2C', label: 'C2C (Corp-to-Corp)' },
  { value: '1099', label: '1099 Contractor' },
  { value: 'FTE', label: 'Full-Time Employee' },
  { value: 'PTE', label: 'Part-Time Employee' },
  { value: 'INTERN', label: 'Intern' },
];

/**
 * Bill rate fields (client side)
 */
export const billRateFields: FieldDefinition[] = [
  {
    id: 'billRateMin',
    label: 'Bill Rate (Min)',
    type: 'currency',
    placeholder: '0.00',
    config: {
      currency: 'USD',
      min: 0,
    },
  },
  {
    id: 'billRateMax',
    label: 'Bill Rate (Max)',
    type: 'currency',
    placeholder: '0.00',
    config: {
      currency: 'USD',
      min: 0,
    },
  },
  {
    id: 'billRateType',
    label: 'Rate Type',
    type: 'enum',
    defaultValue: 'hourly',
    config: {
      options: RATE_TYPE_OPTIONS,
    },
  },
];

/**
 * Pay rate fields (candidate side)
 */
export const payRateFields: FieldDefinition[] = [
  {
    id: 'payRateMin',
    label: 'Pay Rate (Min)',
    type: 'currency',
    placeholder: '0.00',
    config: {
      currency: 'USD',
      min: 0,
    },
  },
  {
    id: 'payRateMax',
    label: 'Pay Rate (Max)',
    type: 'currency',
    placeholder: '0.00',
    config: {
      currency: 'USD',
      min: 0,
    },
  },
  {
    id: 'payRateType',
    label: 'Rate Type',
    type: 'enum',
    defaultValue: 'hourly',
    config: {
      options: RATE_TYPE_OPTIONS,
    },
  },
];

/**
 * Full compensation fields
 */
export const compensationFields: FieldDefinition[] = [
  {
    id: 'currency',
    label: 'Currency',
    type: 'enum',
    defaultValue: 'USD',
    config: {
      options: CURRENCY_OPTIONS,
    },
  },
  ...billRateFields,
  ...payRateFields,
  {
    id: 'employmentType',
    label: 'Employment Type',
    type: 'enum',
    config: {
      options: EMPLOYMENT_TYPE_OPTIONS,
    },
  },
];

/**
 * Compensation InputSet configuration
 */
export const compensationInputSet: InputSetConfig = {
  id: 'compensation',
  label: 'Compensation',
  description: 'Rate and pay information',
  fields: compensationFields,
  layout: {
    columns: 3,
    fieldLayout: [
      { fieldId: 'currency', colSpan: 1 },
      { fieldId: 'employmentType', colSpan: 2 },
      { fieldId: 'billRateMin', colSpan: 1 },
      { fieldId: 'billRateMax', colSpan: 1 },
      { fieldId: 'billRateType', colSpan: 1 },
      { fieldId: 'payRateMin', colSpan: 1 },
      { fieldId: 'payRateMax', colSpan: 1 },
      { fieldId: 'payRateType', colSpan: 1 },
    ],
  },
};

/**
 * Job rate InputSet (bill rate only)
 */
export const jobRateInputSet: InputSetConfig = {
  id: 'job-rate',
  label: 'Job Rate',
  description: 'Client bill rate for the position',
  fields: [
    {
      id: 'currency',
      label: 'Currency',
      type: 'enum',
      defaultValue: 'USD',
      config: {
        options: CURRENCY_OPTIONS,
      },
    },
    ...billRateFields,
  ],
  layout: {
    columns: 4,
    fieldLayout: [
      { fieldId: 'currency', colSpan: 1 },
      { fieldId: 'billRateMin', colSpan: 1 },
      { fieldId: 'billRateMax', colSpan: 1 },
      { fieldId: 'billRateType', colSpan: 1 },
    ],
  },
};

/**
 * Candidate rate InputSet (desired pay)
 */
export const candidateRateInputSet: InputSetConfig = {
  id: 'candidate-rate',
  label: 'Desired Rate',
  description: 'Candidate pay expectations',
  fields: [
    {
      id: 'currency',
      label: 'Currency',
      type: 'enum',
      defaultValue: 'USD',
      config: {
        options: CURRENCY_OPTIONS,
      },
    },
    {
      id: 'desiredRateMin',
      label: 'Min Rate',
      type: 'currency',
      placeholder: '0.00',
      config: {
        currency: 'USD',
        min: 0,
      },
    },
    {
      id: 'desiredRateMax',
      label: 'Max Rate',
      type: 'currency',
      placeholder: '0.00',
      config: {
        currency: 'USD',
        min: 0,
      },
    },
    {
      id: 'rateType',
      label: 'Rate Type',
      type: 'enum',
      defaultValue: 'hourly',
      config: {
        options: RATE_TYPE_OPTIONS,
      },
    },
    {
      id: 'employmentPreference',
      label: 'Employment Preference',
      type: 'multiselect',
      config: {
        options: EMPLOYMENT_TYPE_OPTIONS,
      },
    },
    {
      id: 'rateNegotiable',
      label: 'Rate Negotiable',
      type: 'boolean',
      defaultValue: true,
    },
  ],
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'currency', colSpan: 1 },
      { fieldId: 'rateType', colSpan: 1 },
      { fieldId: 'desiredRateMin', colSpan: 1 },
      { fieldId: 'desiredRateMax', colSpan: 1 },
      { fieldId: 'employmentPreference', colSpan: 2 },
      { fieldId: 'rateNegotiable', colSpan: 2 },
    ],
  },
};

/**
 * Placement rate InputSet (finalized rates)
 */
export const placementRateInputSet: InputSetConfig = {
  id: 'placement-rate',
  label: 'Placement Rate',
  description: 'Final agreed rates for placement',
  fields: [
    {
      id: 'currency',
      label: 'Currency',
      type: 'enum',
      defaultValue: 'USD',
      required: true,
      config: {
        options: CURRENCY_OPTIONS,
      },
    },
    {
      id: 'billRate',
      label: 'Bill Rate',
      type: 'currency',
      required: true,
      description: 'Rate charged to client',
      config: {
        currency: 'USD',
        min: 0,
      },
    },
    {
      id: 'payRate',
      label: 'Pay Rate',
      type: 'currency',
      required: true,
      description: 'Rate paid to consultant',
      config: {
        currency: 'USD',
        min: 0,
      },
    },
    {
      id: 'rateType',
      label: 'Rate Type',
      type: 'enum',
      required: true,
      config: {
        options: RATE_TYPE_OPTIONS,
      },
    },
    {
      id: 'employmentType',
      label: 'Employment Type',
      type: 'enum',
      required: true,
      config: {
        options: EMPLOYMENT_TYPE_OPTIONS,
      },
    },
    {
      id: 'margin',
      label: 'Margin',
      type: 'percentage',
      computed: true,
      description: 'Auto-calculated: (Bill Rate - Pay Rate) / Bill Rate',
    },
  ],
  layout: {
    columns: 3,
    fieldLayout: [
      { fieldId: 'currency', colSpan: 1 },
      { fieldId: 'rateType', colSpan: 1 },
      { fieldId: 'employmentType', colSpan: 1 },
      { fieldId: 'billRate', colSpan: 1 },
      { fieldId: 'payRate', colSpan: 1 },
      { fieldId: 'margin', colSpan: 1 },
    ],
  },
};

export default compensationInputSet;
