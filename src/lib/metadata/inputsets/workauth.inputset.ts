/**
 * Work Authorization InputSet
 *
 * Reusable work authorization fields for candidates and placements.
 * Critical for staffing compliance and immigration requirements.
 * Supports both US and Canada work authorizations.
 * 
 * @see docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// US WORK AUTHORIZATION OPTIONS
// ==========================================

/**
 * US Visa/Work Authorization Status options
 */
export const US_WORK_AUTH_OPTIONS = [
  { value: 'USC', label: 'US Citizen' },
  { value: 'GC', label: 'Green Card (Permanent Resident)' },
  { value: 'GC_EAD', label: 'Green Card EAD (I-485 pending)' },
  { value: 'H1B', label: 'H-1B Visa' },
  { value: 'H1B_TRANSFER', label: 'H-1B Transfer' },
  { value: 'H4EAD', label: 'H-4 EAD' },
  { value: 'L1A', label: 'L-1A (Manager/Executive)' },
  { value: 'L1B', label: 'L-1B (Specialized Knowledge)' },
  { value: 'L2EAD', label: 'L-2 EAD' },
  { value: 'OPT', label: 'OPT (F-1)' },
  { value: 'OPTSTE', label: 'OPT STEM Extension' },
  { value: 'CPT', label: 'CPT' },
  { value: 'TN', label: 'TN Visa' },
  { value: 'E2', label: 'E-2 Visa' },
  { value: 'E3', label: 'E-3 Visa (Australian)' },
  { value: 'O1', label: 'O-1 Visa (Extraordinary Ability)' },
  { value: 'EAD', label: 'EAD (Other)' },
  { value: 'OTHER', label: 'Other' },
  { value: 'NEED_SPONSORSHIP', label: 'Needs Sponsorship' },
];

// Legacy export for backwards compatibility
export const WORK_AUTH_STATUS_OPTIONS = US_WORK_AUTH_OPTIONS;

// ==========================================
// CANADA WORK AUTHORIZATION OPTIONS
// ==========================================

/**
 * Canada Work Authorization options
 */
export const CANADA_WORK_AUTH_OPTIONS = [
  { value: 'CA_CITIZEN', label: 'Canadian Citizen' },
  { value: 'CA_PR', label: 'Permanent Resident' },
  { value: 'CA_WORK_PERMIT', label: 'Closed Work Permit' },
  { value: 'CA_OWP', label: 'Open Work Permit' },
  { value: 'CA_PGWP', label: 'Post-Graduation Work Permit' },
  { value: 'CA_LMIA', label: 'LMIA-based Work Permit' },
  { value: 'CA_IEC', label: 'International Experience Canada' },
  { value: 'CA_BRIDGING_OWP', label: 'Bridging Open Work Permit' },
  { value: 'CA_COOP', label: 'Co-op Work Permit' },
  { value: 'CA_SPOUSAL_OWP', label: 'Spousal Open Work Permit' },
  { value: 'CA_OTHER', label: 'Other (Canada)' },
];

/**
 * Combined work authorization options for all countries
 */
export const ALL_WORK_AUTH_OPTIONS = [
  { value: '_US_', label: '── United States ──', disabled: true },
  ...US_WORK_AUTH_OPTIONS,
  { value: '_CA_', label: '── Canada ──', disabled: true },
  ...CANADA_WORK_AUTH_OPTIONS,
];

/**
 * Country options for work authorization
 */
export const WORK_COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
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

// ==========================================
// MULTI-COUNTRY WORK AUTHORIZATION
// ==========================================

/**
 * Multi-country work authorization fields
 */
export const multiCountryWorkAuthFields: FieldDefinition[] = [
  {
    id: 'workAuthCountry',
    label: 'Country',
    type: 'enum',
    required: true,
    config: {
      options: WORK_COUNTRY_OPTIONS,
    },
  },
  {
    id: 'usWorkAuth',
    label: 'US Work Authorization',
    type: 'enum',
    visible: {
      type: 'condition',
      condition: { field: 'workAuthCountry', operator: 'eq', value: 'US' },
    },
    config: {
      options: US_WORK_AUTH_OPTIONS,
    },
  },
  {
    id: 'canadaWorkAuth',
    label: 'Canada Work Authorization',
    type: 'enum',
    visible: {
      type: 'condition',
      condition: { field: 'workAuthCountry', operator: 'eq', value: 'CA' },
    },
    config: {
      options: CANADA_WORK_AUTH_OPTIONS,
    },
  },
  {
    id: 'workAuthExpiry',
    label: 'Authorization Expiry Date',
    type: 'date',
    description: 'Leave blank for permanent status (Citizen, PR)',
  },
  {
    id: 'sponsorshipRequired',
    label: 'Sponsorship Required',
    type: 'boolean',
    description: 'Does this candidate need work visa sponsorship?',
  },
  {
    id: 'currentSponsor',
    label: 'Current Sponsoring Employer',
    type: 'text',
    description: 'For H1B transfers and employer-specific permits',
    visible: {
      type: 'condition',
      condition: { field: 'sponsorshipRequired', operator: 'eq', value: false },
    },
  },
];

/**
 * Multi-country Work Authorization InputSet
 */
export const multiCountryWorkAuthInputSet: InputSetConfig = {
  id: 'multi-country-workauth',
  label: 'Work Authorization',
  description: 'Work authorization for US and Canada',
  fields: multiCountryWorkAuthFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'workAuthCountry', colSpan: 2 },
      { fieldId: 'usWorkAuth', colSpan: 1 },
      { fieldId: 'canadaWorkAuth', colSpan: 1 },
      { fieldId: 'workAuthExpiry', colSpan: 1 },
      { fieldId: 'sponsorshipRequired', colSpan: 1 },
      { fieldId: 'currentSponsor', colSpan: 2 },
    ],
  },
};

/**
 * Canada-specific work authorization InputSet
 */
export const canadaWorkAuthInputSet: InputSetConfig = {
  id: 'canada-workauth',
  label: 'Canada Work Authorization',
  description: 'Work authorization status for Canada',
  fields: [
    {
      id: 'canadaWorkAuthType',
      label: 'Work Authorization',
      type: 'enum',
      required: true,
      config: {
        options: CANADA_WORK_AUTH_OPTIONS,
      },
    },
    {
      id: 'workPermitExpiry',
      label: 'Work Permit Expiry',
      type: 'date',
      visible: {
        type: 'condition',
        condition: {
          field: 'canadaWorkAuthType',
          operator: 'in',
          value: ['CA_WORK_PERMIT', 'CA_OWP', 'CA_PGWP', 'CA_LMIA', 'CA_IEC', 'CA_BRIDGING_OWP', 'CA_COOP', 'CA_SPOUSAL_OWP'],
        },
      },
    },
    {
      id: 'lmiaRequired',
      label: 'LMIA Required for New Employment',
      type: 'boolean',
      visible: {
        type: 'condition',
        condition: {
          field: 'canadaWorkAuthType',
          operator: 'in',
          value: ['CA_WORK_PERMIT', 'CA_LMIA'],
        },
      },
    },
    {
      id: 'prApplicationPending',
      label: 'PR Application Pending',
      type: 'boolean',
      description: 'Is permanent residency application in progress?',
    },
  ],
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'canadaWorkAuthType', colSpan: 2 },
      { fieldId: 'workPermitExpiry', colSpan: 1 },
      { fieldId: 'lmiaRequired', colSpan: 1 },
      { fieldId: 'prApplicationPending', colSpan: 2 },
    ],
  },
};

export default workAuthInputSet;
