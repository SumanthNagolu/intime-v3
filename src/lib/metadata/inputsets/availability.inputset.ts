/**
 * Availability InputSet
 *
 * Candidate/consultant availability tracking.
 * Includes start date, notice period, work preferences.
 *
 * @see docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// AVAILABILITY OPTIONS
// ==========================================

/**
 * Availability status options
 */
export const AVAILABILITY_STATUS_OPTIONS = [
  { value: 'immediately_available', label: 'Immediately Available', color: '#22c55e' },
  { value: 'notice_period', label: 'On Notice Period', color: '#eab308' },
  { value: 'not_looking', label: 'Not Currently Looking', color: '#6b7280' },
  { value: 'on_assignment', label: 'Currently on Assignment', color: '#3b82f6' },
  { value: 'unavailable', label: 'Unavailable', color: '#ef4444' },
];

/**
 * Notice period options
 */
export const NOTICE_PERIOD_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '1_week', label: '1 Week' },
  { value: '2_weeks', label: '2 Weeks' },
  { value: '3_weeks', label: '3 Weeks' },
  { value: '1_month', label: '1 Month' },
  { value: '6_weeks', label: '6 Weeks' },
  { value: '2_months', label: '2 Months' },
  { value: '3_months', label: '3+ Months' },
];

/**
 * Work mode preference options
 */
export const WORK_MODE_OPTIONS = [
  { value: 'remote', label: 'Remote Only' },
  { value: 'onsite', label: 'On-site Only' },
  { value: 'hybrid', label: 'Hybrid (Flexible)' },
  { value: 'hybrid_2_3', label: 'Hybrid (2-3 days)' },
  { value: 'any', label: 'Open to Any' },
];

/**
 * Employment type preferences
 */
export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'fulltime_w2', label: 'Full-time W2' },
  { value: 'contract_w2', label: 'Contract W2' },
  { value: 'contract_1099', label: 'Contract 1099' },
  { value: 'corp_to_corp', label: 'Corp to Corp (C2C)' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'any', label: 'Open to Any' },
];

/**
 * Travel percentage options
 */
export const TRAVEL_PERCENT_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '25', label: 'Up to 25%' },
  { value: '50', label: 'Up to 50%' },
  { value: '75', label: 'Up to 75%' },
  { value: '100', label: '100% (Full Travel)' },
];

// ==========================================
// AVAILABILITY FIELDS
// ==========================================

/**
 * Full availability fields
 */
export const availabilityFields: FieldDefinition[] = [
  {
    id: 'availabilityStatus',
    label: 'Current Status',
    type: 'enum',
    required: true,
    config: {
      options: AVAILABILITY_STATUS_OPTIONS,
    },
  },
  {
    id: 'noticePeriod',
    label: 'Notice Period',
    type: 'enum',
    description: 'Time needed before they can start',
    config: {
      options: NOTICE_PERIOD_OPTIONS,
    },
  },
  {
    id: 'earliestStartDate',
    label: 'Earliest Start Date',
    type: 'date',
    description: 'Earliest date they can begin work',
  },
  {
    id: 'targetStartDate',
    label: 'Target Start Date',
    type: 'date',
    description: 'Preferred start date',
  },
  {
    id: 'currentAssignmentEndDate',
    label: 'Current Assignment Ends',
    type: 'date',
    visible: {
      type: 'condition',
      condition: { field: 'availabilityStatus', operator: 'eq', value: 'on_assignment' },
    },
  },
  {
    id: 'workModePreference',
    label: 'Work Mode Preference',
    type: 'enum',
    defaultValue: 'any',
    config: {
      options: WORK_MODE_OPTIONS,
    },
  },
  {
    id: 'employmentTypes',
    label: 'Employment Types',
    type: 'multiselect',
    description: 'Select all types they are open to',
    config: {
      options: EMPLOYMENT_TYPE_OPTIONS,
    },
  },
  {
    id: 'willingToTravel',
    label: 'Willing to Travel',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'travelPercent',
    label: 'Travel %',
    type: 'enum',
    visible: {
      type: 'condition',
      condition: { field: 'willingToTravel', operator: 'eq', value: true },
    },
    config: {
      options: TRAVEL_PERCENT_OPTIONS,
    },
  },
  {
    id: 'willingToRelocate',
    label: 'Willing to Relocate',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'preferredLocations',
    label: 'Preferred Locations',
    type: 'tags',
    description: 'Cities/states they prefer to work in',
    config: {
      allowCustom: true,
      suggestions: [
        'New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Seattle',
        'Austin', 'Dallas', 'Atlanta', 'Boston', 'Denver', 'Remote',
      ],
    },
  },
  {
    id: 'availabilityNotes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Any additional availability details...',
  },
];

/**
 * Full Availability InputSet
 */
export const availabilityInputSet: InputSetConfig = {
  id: 'availability',
  label: 'Availability & Preferences',
  description: 'When the candidate can start and work preferences',
  fields: availabilityFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'availabilityStatus', colSpan: 1 },
      { fieldId: 'noticePeriod', colSpan: 1 },
      { fieldId: 'earliestStartDate', colSpan: 1 },
      { fieldId: 'targetStartDate', colSpan: 1 },
      { fieldId: 'currentAssignmentEndDate', colSpan: 2 },
      { fieldId: 'workModePreference', colSpan: 1 },
      { fieldId: 'employmentTypes', colSpan: 1 },
      { fieldId: 'willingToTravel', colSpan: 1 },
      { fieldId: 'travelPercent', colSpan: 1 },
      { fieldId: 'willingToRelocate', colSpan: 1 },
      { fieldId: 'preferredLocations', colSpan: 1 },
      { fieldId: 'availabilityNotes', colSpan: 2 },
    ],
  },
};

// ==========================================
// SIMPLE AVAILABILITY INPUTSET
// ==========================================

/**
 * Simple availability fields (compact)
 */
export const simpleAvailabilityFields: FieldDefinition[] = [
  {
    id: 'availabilityStatus',
    label: 'Status',
    type: 'enum',
    required: true,
    config: {
      options: AVAILABILITY_STATUS_OPTIONS,
    },
  },
  {
    id: 'noticePeriod',
    label: 'Notice Period',
    type: 'enum',
    config: {
      options: NOTICE_PERIOD_OPTIONS,
    },
  },
  {
    id: 'earliestStartDate',
    label: 'Available From',
    type: 'date',
  },
  {
    id: 'workModePreference',
    label: 'Work Mode',
    type: 'enum',
    config: {
      options: WORK_MODE_OPTIONS,
    },
  },
];

/**
 * Simple Availability InputSet - Compact version
 */
export const simpleAvailabilityInputSet: InputSetConfig = {
  id: 'simple-availability',
  label: 'Availability',
  description: 'Quick availability check',
  fields: simpleAvailabilityFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'availabilityStatus', colSpan: 1 },
      { fieldId: 'noticePeriod', colSpan: 1 },
      { fieldId: 'earliestStartDate', colSpan: 1 },
      { fieldId: 'workModePreference', colSpan: 1 },
    ],
  },
};

// ==========================================
// PLACEMENT AVAILABILITY INPUTSET
// ==========================================

/**
 * Placement availability fields (for active placements)
 */
export const placementAvailabilityFields: FieldDefinition[] = [
  {
    id: 'placementStartDate',
    label: 'Start Date',
    type: 'date',
    required: true,
  },
  {
    id: 'placementEndDate',
    label: 'End Date',
    type: 'date',
    required: true,
  },
  {
    id: 'extensionLikelihood',
    label: 'Extension Likelihood',
    type: 'enum',
    config: {
      options: [
        { value: 'high', label: 'High', color: '#22c55e' },
        { value: 'medium', label: 'Medium', color: '#eab308' },
        { value: 'low', label: 'Low', color: '#ef4444' },
        { value: 'unknown', label: 'Unknown', color: '#6b7280' },
      ],
    },
  },
  {
    id: 'renewalDiscussed',
    label: 'Renewal Discussed',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'availableAfterPlacement',
    label: 'Available After Placement',
    type: 'boolean',
    defaultValue: true,
  },
  {
    id: 'nextAvailableDate',
    label: 'Next Available',
    type: 'date',
    readonly: true,
    description: 'Calculated from end date',
  },
];

/**
 * Placement Availability InputSet
 */
export const placementAvailabilityInputSet: InputSetConfig = {
  id: 'placement-availability',
  label: 'Placement Dates',
  description: 'Placement duration and renewal tracking',
  fields: placementAvailabilityFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'placementStartDate', colSpan: 1 },
      { fieldId: 'placementEndDate', colSpan: 1 },
      { fieldId: 'extensionLikelihood', colSpan: 1 },
      { fieldId: 'renewalDiscussed', colSpan: 1 },
      { fieldId: 'availableAfterPlacement', colSpan: 1 },
      { fieldId: 'nextAvailableDate', colSpan: 1 },
    ],
  },
};

export default availabilityInputSet;

