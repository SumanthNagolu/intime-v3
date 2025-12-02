/**
 * CRM Account InputSets
 *
 * Reusable field configurations for Account entity screens.
 * Includes addresses, contracts, team, preferences, and metrics.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// ACCOUNT OPTIONS
// ==========================================

export const ADDRESS_TYPE_OPTIONS = [
  { value: 'hq', label: 'Headquarters' },
  { value: 'billing', label: 'Billing' },
  { value: 'office', label: 'Office' },
  { value: 'shipping', label: 'Shipping' },
] as const;

export const CONTRACT_TYPE_OPTIONS = [
  { value: 'msa', label: 'MSA' },
  { value: 'sow', label: 'SOW' },
  { value: 'nda', label: 'NDA' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'addendum', label: 'Addendum' },
] as const;

export const CONTRACT_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
] as const;

export const ACCOUNT_TEAM_ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'support', label: 'Support' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'account_manager', label: 'Account Manager' },
] as const;

export const WORK_MODE_PREFERENCE_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

export const RATE_TYPE_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
] as const;

export const VISA_TYPE_OPTIONS = [
  { value: 'USC', label: 'US Citizen' },
  { value: 'GC', label: 'Green Card' },
  { value: 'H1B', label: 'H-1B' },
  { value: 'L1', label: 'L-1' },
  { value: 'OPT', label: 'OPT' },
  { value: 'CPT', label: 'CPT' },
  { value: 'TN', label: 'TN Visa' },
  { value: 'EAD', label: 'EAD' },
] as const;

export const SECURITY_CLEARANCE_OPTIONS = [
  { value: 'none', label: 'None Required' },
  { value: 'public_trust', label: 'Public Trust' },
  { value: 'secret', label: 'Secret' },
  { value: 'top_secret', label: 'Top Secret' },
  { value: 'sci', label: 'TS/SCI' },
] as const;

// ==========================================
// ACCOUNT ADDRESS FIELDS
// ==========================================

export const accountAddressFields: FieldDefinition[] = [
  {
    id: 'addressType',
    label: 'Address Type',
    type: 'enum',
    path: 'addressType',
    required: true,
    config: { options: ADDRESS_TYPE_OPTIONS },
  },
  {
    id: 'street',
    label: 'Street Address',
    type: 'text',
    path: 'street',
    config: { span: 2 },
  },
  {
    id: 'street2',
    label: 'Street Address 2',
    type: 'text',
    path: 'street2',
    config: { span: 2 },
  },
  {
    id: 'city',
    label: 'City',
    type: 'text',
    path: 'city',
  },
  {
    id: 'state',
    label: 'State/Province',
    type: 'text',
    path: 'state',
  },
  {
    id: 'postalCode',
    label: 'Postal Code',
    type: 'text',
    path: 'postalCode',
  },
  {
    id: 'country',
    label: 'Country',
    type: 'text',
    path: 'country',
    config: { defaultValue: 'USA' },
  },
  {
    id: 'isPrimary',
    label: 'Primary Address',
    type: 'boolean',
    path: 'isPrimary',
  },
  {
    id: 'isActive',
    label: 'Active',
    type: 'boolean',
    path: 'isActive',
    config: { defaultValue: true },
  },
];

// ==========================================
// ACCOUNT CONTRACT FIELDS
// ==========================================

export const accountContractFields: FieldDefinition[] = [
  {
    id: 'name',
    label: 'Contract Name',
    type: 'text',
    path: 'name',
    config: { span: 2 },
  },
  {
    id: 'contractType',
    label: 'Contract Type',
    type: 'enum',
    path: 'contractType',
    required: true,
    config: {
      options: CONTRACT_TYPE_OPTIONS,
      badgeColors: {
        msa: 'purple',
        sow: 'blue',
        nda: 'gray',
        amendment: 'amber',
        addendum: 'cyan',
      },
    },
  },
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    path: 'status',
    required: true,
    config: {
      options: CONTRACT_STATUS_OPTIONS,
      badgeColors: {
        draft: 'gray',
        pending_review: 'yellow',
        active: 'green',
        expired: 'orange',
        terminated: 'red',
      },
    },
  },
  {
    id: 'startDate',
    label: 'Start Date',
    type: 'date',
    path: 'startDate',
  },
  {
    id: 'endDate',
    label: 'End Date',
    type: 'date',
    path: 'endDate',
  },
  {
    id: 'signedDate',
    label: 'Signed Date',
    type: 'date',
    path: 'signedDate',
  },
  {
    id: 'value',
    label: 'Contract Value',
    type: 'currency',
    path: 'value',
    config: { prefix: '$' },
  },
  {
    id: 'paymentTermsDays',
    label: 'Payment Terms (Days)',
    type: 'number',
    path: 'paymentTermsDays',
    config: { min: 0, max: 180 },
  },
  {
    id: 'documentUrl',
    label: 'Document URL',
    type: 'url',
    path: 'documentUrl',
    config: { span: 2 },
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    path: 'notes',
    config: { rows: 3, span: 2 },
  },
];

// ==========================================
// ACCOUNT TEAM FIELDS
// ==========================================

export const accountTeamFields: FieldDefinition[] = [
  {
    id: 'userId',
    label: 'Team Member',
    type: 'select',
    path: 'userId',
    required: true,
    config: {
      entityType: 'user',
      displayField: 'fullName',
    },
  },
  {
    id: 'role',
    label: 'Role',
    type: 'enum',
    path: 'role',
    required: true,
    config: {
      options: ACCOUNT_TEAM_ROLE_OPTIONS,
      badgeColors: {
        owner: 'purple',
        secondary: 'blue',
        support: 'gray',
        recruiter: 'green',
        account_manager: 'amber',
      },
    },
  },
  {
    id: 'isPrimary',
    label: 'Primary Contact',
    type: 'boolean',
    path: 'isPrimary',
  },
  {
    id: 'isActive',
    label: 'Active',
    type: 'boolean',
    path: 'isActive',
    config: { defaultValue: true },
  },
  {
    id: 'assignedAt',
    label: 'Assigned At',
    type: 'datetime',
    path: 'assignedAt',
    config: { format: 'medium' },
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    path: 'notes',
    config: { rows: 2, span: 2 },
  },
];

// ==========================================
// ACCOUNT PREFERENCES FIELDS
// ==========================================

export const accountPreferencesSkillsFields: FieldDefinition[] = [
  {
    id: 'preferredSkills',
    label: 'Preferred Skills',
    type: 'tags',
    path: 'preferredSkills',
    description: 'Skills this client typically looks for',
  },
  {
    id: 'excludedSkills',
    label: 'Excluded Skills',
    type: 'tags',
    path: 'excludedSkills',
    description: 'Skills to avoid for this client',
  },
];

export const accountPreferencesVisaFields: FieldDefinition[] = [
  {
    id: 'preferredVisaTypes',
    label: 'Preferred Visa Types',
    type: 'multi-select',
    path: 'preferredVisaTypes',
    config: { options: VISA_TYPE_OPTIONS },
  },
  {
    id: 'excludedVisaTypes',
    label: 'Excluded Visa Types',
    type: 'multi-select',
    path: 'excludedVisaTypes',
    config: { options: VISA_TYPE_OPTIONS },
  },
];

export const accountPreferencesRateFields: FieldDefinition[] = [
  {
    id: 'rateRangeMin',
    label: 'Rate Range Min',
    type: 'currency',
    path: 'rateRangeMin',
    config: { prefix: '$' },
  },
  {
    id: 'rateRangeMax',
    label: 'Rate Range Max',
    type: 'currency',
    path: 'rateRangeMax',
    config: { prefix: '$' },
  },
  {
    id: 'preferredRateType',
    label: 'Preferred Rate Type',
    type: 'enum',
    path: 'preferredRateType',
    config: { options: RATE_TYPE_OPTIONS },
  },
];

export const accountPreferencesWorkFields: FieldDefinition[] = [
  {
    id: 'workModePreference',
    label: 'Work Mode Preference',
    type: 'enum',
    path: 'workModePreference',
    config: {
      options: WORK_MODE_PREFERENCE_OPTIONS,
      badgeColors: {
        remote: 'green',
        onsite: 'blue',
        hybrid: 'purple',
      },
    },
  },
  {
    id: 'onsiteRequirement',
    label: 'Onsite Requirements',
    type: 'text',
    path: 'onsiteRequirement',
  },
  {
    id: 'backgroundCheckRequired',
    label: 'Background Check Required',
    type: 'boolean',
    path: 'backgroundCheckRequired',
  },
  {
    id: 'drugScreenRequired',
    label: 'Drug Screen Required',
    type: 'boolean',
    path: 'drugScreenRequired',
  },
  {
    id: 'securityClearanceRequired',
    label: 'Security Clearance',
    type: 'enum',
    path: 'securityClearanceRequired',
    config: { options: SECURITY_CLEARANCE_OPTIONS },
  },
];

export const accountPreferencesInterviewFields: FieldDefinition[] = [
  {
    id: 'typicalInterviewRounds',
    label: 'Typical Interview Rounds',
    type: 'number',
    path: 'typicalInterviewRounds',
    config: { min: 1, max: 10 },
  },
  {
    id: 'interviewTurnaroundDays',
    label: 'Interview Turnaround (Days)',
    type: 'number',
    path: 'interviewTurnaroundDays',
    config: { min: 1 },
  },
  {
    id: 'interviewProcessNotes',
    label: 'Interview Process Notes',
    type: 'textarea',
    path: 'interviewProcessNotes',
    config: { rows: 4, span: 2 },
  },
];

export const accountPreferencesNotesFields: FieldDefinition[] = [
  {
    id: 'notes',
    label: 'Additional Notes',
    type: 'textarea',
    path: 'notes',
    config: { rows: 4, span: 2 },
  },
];

// ==========================================
// ACCOUNT METRICS FIELDS
// ==========================================

export const accountMetricsPlacementFields: FieldDefinition[] = [
  {
    id: 'totalPlacements',
    label: 'Total Placements',
    type: 'number',
    path: 'totalPlacements',
  },
  {
    id: 'activePlacements',
    label: 'Active Placements',
    type: 'number',
    path: 'activePlacements',
  },
  {
    id: 'endedPlacements',
    label: 'Ended Placements',
    type: 'number',
    path: 'endedPlacements',
  },
];

export const accountMetricsRevenueFields: FieldDefinition[] = [
  {
    id: 'totalRevenue',
    label: 'Total Revenue',
    type: 'currency',
    path: 'totalRevenue',
    config: { prefix: '$', format: 'compact' },
  },
  {
    id: 'totalMargin',
    label: 'Total Margin',
    type: 'currency',
    path: 'totalMargin',
    config: { prefix: '$', format: 'compact' },
  },
];

export const accountMetricsPerformanceFields: FieldDefinition[] = [
  {
    id: 'avgTtfDays',
    label: 'Avg. Time to Fill (Days)',
    type: 'number',
    path: 'avgTtfDays',
    config: { decimals: 1 },
  },
  {
    id: 'submissionToInterviewRate',
    label: 'Submit to Interview %',
    type: 'percentage',
    path: 'submissionToInterviewRate',
  },
  {
    id: 'interviewToOfferRate',
    label: 'Interview to Offer %',
    type: 'percentage',
    path: 'interviewToOfferRate',
  },
  {
    id: 'offerAcceptanceRate',
    label: 'Offer Acceptance %',
    type: 'percentage',
    path: 'offerAcceptanceRate',
  },
];

export const accountMetricsActivityFields: FieldDefinition[] = [
  {
    id: 'totalSubmissions',
    label: 'Total Submissions',
    type: 'number',
    path: 'totalSubmissions',
  },
  {
    id: 'totalInterviews',
    label: 'Total Interviews',
    type: 'number',
    path: 'totalInterviews',
  },
  {
    id: 'totalOffers',
    label: 'Total Offers',
    type: 'number',
    path: 'totalOffers',
  },
  {
    id: 'healthScore',
    label: 'Health Score',
    type: 'number',
    path: 'healthScore',
    description: '0-100 scale',
    config: { min: 0, max: 100 },
  },
];

// ==========================================
// INPUT SETS
// ==========================================

/**
 * Account Address InputSet
 */
export const accountAddressInputSet: InputSetConfig = {
  id: 'account-address',
  name: 'Account Address',
  description: 'Address details for an account',
  fields: accountAddressFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Account Contract InputSet
 */
export const accountContractInputSet: InputSetConfig = {
  id: 'account-contract',
  name: 'Account Contract',
  description: 'Contract details for an account',
  fields: accountContractFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Account Team InputSet
 */
export const accountTeamInputSet: InputSetConfig = {
  id: 'account-team',
  name: 'Account Team',
  description: 'Team member assignment for an account',
  fields: accountTeamFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Account Preferences - Skills InputSet
 */
export const accountPreferencesSkillsInputSet: InputSetConfig = {
  id: 'account-preferences-skills',
  name: 'Skill Preferences',
  description: 'Preferred and excluded skills',
  fields: accountPreferencesSkillsFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Account Preferences - Visa InputSet
 */
export const accountPreferencesVisaInputSet: InputSetConfig = {
  id: 'account-preferences-visa',
  name: 'Visa Preferences',
  description: 'Work authorization preferences',
  fields: accountPreferencesVisaFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Account Preferences - Rate InputSet
 */
export const accountPreferencesRateInputSet: InputSetConfig = {
  id: 'account-preferences-rate',
  name: 'Rate Preferences',
  description: 'Rate range and type preferences',
  fields: accountPreferencesRateFields,
  layout: {
    columns: 3,
    gap: 'md',
  },
};

/**
 * Account Preferences - Work InputSet
 */
export const accountPreferencesWorkInputSet: InputSetConfig = {
  id: 'account-preferences-work',
  name: 'Work Preferences',
  description: 'Work mode and compliance preferences',
  fields: accountPreferencesWorkFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Account Preferences - Interview InputSet
 */
export const accountPreferencesInterviewInputSet: InputSetConfig = {
  id: 'account-preferences-interview',
  name: 'Interview Preferences',
  description: 'Interview process preferences',
  fields: accountPreferencesInterviewFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Account Preferences - Full InputSet
 */
export const accountPreferencesFullInputSet: InputSetConfig = {
  id: 'account-preferences-full',
  name: 'Full Preferences',
  description: 'Complete account preferences',
  fields: [
    ...accountPreferencesSkillsFields,
    ...accountPreferencesVisaFields,
    ...accountPreferencesRateFields,
    ...accountPreferencesWorkFields,
    ...accountPreferencesInterviewFields,
    ...accountPreferencesNotesFields,
  ],
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Account Metrics - Placements InputSet
 */
export const accountMetricsPlacementInputSet: InputSetConfig = {
  id: 'account-metrics-placements',
  name: 'Placement Metrics',
  description: 'Placement counts for the account',
  fields: accountMetricsPlacementFields,
  layout: {
    columns: 3,
    gap: 'md',
  },
};

/**
 * Account Metrics - Revenue InputSet
 */
export const accountMetricsRevenueInputSet: InputSetConfig = {
  id: 'account-metrics-revenue',
  name: 'Revenue Metrics',
  description: 'Revenue and margin metrics',
  fields: accountMetricsRevenueFields,
  layout: {
    columns: 2,
    gap: 'md',
  },
};

/**
 * Account Metrics - Performance InputSet
 */
export const accountMetricsPerformanceInputSet: InputSetConfig = {
  id: 'account-metrics-performance',
  name: 'Performance Metrics',
  description: 'Performance rates and metrics',
  fields: accountMetricsPerformanceFields,
  layout: {
    columns: 4,
    gap: 'md',
  },
};

/**
 * Account Metrics - Activity InputSet
 */
export const accountMetricsActivityInputSet: InputSetConfig = {
  id: 'account-metrics-activity',
  name: 'Activity Metrics',
  description: 'Activity counts and health score',
  fields: accountMetricsActivityFields,
  layout: {
    columns: 4,
    gap: 'md',
  },
};

/**
 * Account Metrics - Full InputSet
 */
export const accountMetricsFullInputSet: InputSetConfig = {
  id: 'account-metrics-full',
  name: 'Full Metrics',
  description: 'Complete account metrics',
  fields: [
    ...accountMetricsPlacementFields,
    ...accountMetricsRevenueFields,
    ...accountMetricsPerformanceFields,
    ...accountMetricsActivityFields,
  ],
  layout: {
    columns: 4,
    gap: 'md',
  },
};

export default {
  accountAddressInputSet,
  accountContractInputSet,
  accountTeamInputSet,
  accountPreferencesSkillsInputSet,
  accountPreferencesVisaInputSet,
  accountPreferencesRateInputSet,
  accountPreferencesWorkInputSet,
  accountPreferencesInterviewInputSet,
  accountPreferencesFullInputSet,
  accountMetricsPlacementInputSet,
  accountMetricsRevenueInputSet,
  accountMetricsPerformanceInputSet,
  accountMetricsActivityInputSet,
  accountMetricsFullInputSet,
};
