/**
 * Work Authorization InputSet
 *
 * Reusable work authorization fields for candidates and placements.
 * Critical for staffing compliance and immigration requirements.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

/**
 * Visa/Work Authorization Status options
 */
export const WORK_AUTH_STATUS_OPTIONS = [
  { value: 'USC', label: 'US Citizen' },
  { value: 'GC', label: 'Green Card (Permanent Resident)' },
  { value: 'H1B', label: 'H-1B Visa' },
  { value: 'H4EAD', label: 'H-4 EAD' },
  { value: 'L1', label: 'L-1 Visa' },
  { value: 'L2EAD', label: 'L-2 EAD' },
  { value: 'OPT', label: 'OPT (F-1)' },
  { value: 'OPTSTE', label: 'OPT STEM Extension' },
  { value: 'CPT', label: 'CPT' },
  { value: 'TN', label: 'TN Visa' },
  { value: 'E2', label: 'E-2 Visa' },
  { value: 'E3', label: 'E-3 Visa' },
  { value: 'O1', label: 'O-1 Visa' },
  { value: 'EAD', label: 'EAD (Other)' },
  { value: 'OTHER', label: 'Other' },
  { value: 'NEED_SPONSORSHIP', label: 'Needs Sponsorship' },
];

/**
 * Work authorization fields
 */
export const workAuthFields: FieldDefinition[] = [
  {
    id: 'workAuthStatus',
    label: 'Work Authorization',
    type: 'enum',
    required: true,
    config: {
      options: WORK_AUTH_STATUS_OPTIONS,
    },
  },
  {
    id: 'visaExpiry',
    label: 'Visa Expiry Date',
    type: 'date',
    visible: {
      type: 'condition',
      condition: {
        field: 'workAuthStatus',
        operator: 'in',
        value: ['H1B', 'H4EAD', 'L1', 'L2EAD', 'OPT', 'OPTSTE', 'CPT', 'TN', 'E2', 'E3', 'O1', 'EAD'],
      },
    },
  },
  {
    id: 'eadExpiry',
    label: 'EAD Expiry Date',
    type: 'date',
    visible: {
      type: 'condition',
      condition: {
        field: 'workAuthStatus',
        operator: 'in',
        value: ['H4EAD', 'L2EAD', 'OPT', 'OPTSTE', 'EAD'],
      },
    },
  },
  {
    id: 'needsSponsorship',
    label: 'Needs Sponsorship',
    type: 'boolean',
    description: 'Will require H-1B or other work visa sponsorship',
  },
  {
    id: 'willingToRelocate',
    label: 'Willing to Relocate',
    type: 'boolean',
    defaultValue: true,
  },
  {
    id: 'relocationPreferences',
    label: 'Relocation Preferences',
    type: 'tags',
    visible: {
      type: 'condition',
      condition: { field: 'willingToRelocate', operator: 'eq', value: true },
    },
    config: {
      allowCustom: true,
      suggestions: [
        'New York', 'California', 'Texas', 'Florida', 'Illinois',
        'Washington', 'Remote Only', 'Anywhere in US',
      ],
    },
  },
];

/**
 * Work Authorization InputSet configuration
 */
export const workAuthInputSet: InputSetConfig = {
  id: 'workauth',
  label: 'Work Authorization',
  description: 'Immigration and work authorization status',
  fields: workAuthFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'workAuthStatus', colSpan: 2 },
      { fieldId: 'visaExpiry', colSpan: 1 },
      { fieldId: 'eadExpiry', colSpan: 1 },
      { fieldId: 'needsSponsorship', colSpan: 1 },
      { fieldId: 'willingToRelocate', colSpan: 1 },
      { fieldId: 'relocationPreferences', colSpan: 2 },
    ],
  },
};

/**
 * Detailed visa information for compliance
 */
export const visaDetailsFields: FieldDefinition[] = [
  {
    id: 'visaType',
    label: 'Visa Type',
    type: 'enum',
    required: true,
    config: {
      options: WORK_AUTH_STATUS_OPTIONS,
    },
  },
  {
    id: 'visaNumber',
    label: 'Visa Number',
    type: 'text',
    maxLength: 50,
  },
  {
    id: 'i94Number',
    label: 'I-94 Number',
    type: 'text',
    description: 'Arrival/Departure Record Number',
    maxLength: 20,
  },
  {
    id: 'i94Expiry',
    label: 'I-94 Expiry',
    type: 'date',
  },
  {
    id: 'sponsoringEmployer',
    label: 'Sponsoring Employer',
    type: 'text',
    visible: {
      type: 'condition',
      condition: {
        field: 'visaType',
        operator: 'in',
        value: ['H1B', 'L1', 'O1'],
      },
    },
    maxLength: 200,
  },
  {
    id: 'h1bTransferNeeded',
    label: 'H-1B Transfer Required',
    type: 'boolean',
    visible: {
      type: 'condition',
      condition: { field: 'visaType', operator: 'eq', value: 'H1B' },
    },
  },
  {
    id: 'gcPriority',
    label: 'Green Card Priority Date',
    type: 'date',
    description: 'If Green Card process is in progress',
  },
  {
    id: 'gcCategory',
    label: 'Green Card Category',
    type: 'enum',
    config: {
      options: [
        { value: 'EB1', label: 'EB-1 (Priority Workers)' },
        { value: 'EB2', label: 'EB-2 (Advanced Degree)' },
        { value: 'EB3', label: 'EB-3 (Skilled Workers)' },
        { value: 'PERM', label: 'PERM in Progress' },
        { value: 'NA', label: 'Not Applicable' },
      ],
    },
  },
];

/**
 * Visa Details InputSet (for compliance/HR)
 */
export const visaDetailsInputSet: InputSetConfig = {
  id: 'visa-details',
  label: 'Visa Details',
  description: 'Detailed visa and immigration information',
  fields: visaDetailsFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'visaType', colSpan: 1 },
      { fieldId: 'visaNumber', colSpan: 1 },
      { fieldId: 'i94Number', colSpan: 1 },
      { fieldId: 'i94Expiry', colSpan: 1 },
      { fieldId: 'sponsoringEmployer', colSpan: 2 },
      { fieldId: 'h1bTransferNeeded', colSpan: 2 },
      { fieldId: 'gcPriority', colSpan: 1 },
      { fieldId: 'gcCategory', colSpan: 1 },
    ],
  },
};

/**
 * Simple work eligibility check
 */
export const workEligibilityInputSet: InputSetConfig = {
  id: 'work-eligibility',
  label: 'Work Eligibility',
  description: 'Quick work authorization check',
  fields: [
    {
      id: 'legallyAuthorized',
      label: 'Legally Authorized to Work',
      type: 'boolean',
      required: true,
      description: 'Are you legally authorized to work in the United States?',
    },
    {
      id: 'requiresSponsorship',
      label: 'Requires Visa Sponsorship',
      type: 'boolean',
      required: true,
      description: 'Will you now or in the future require sponsorship for employment visa status?',
    },
    {
      id: 'workAuthType',
      label: 'Authorization Type',
      type: 'enum',
      visible: {
        type: 'condition',
        condition: { field: 'legallyAuthorized', operator: 'eq', value: true },
      },
      config: {
        options: WORK_AUTH_STATUS_OPTIONS,
      },
    },
  ],
  layout: {
    columns: 1,
  },
};

export default workAuthInputSet;
