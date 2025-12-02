/**
 * HR Benefits InputSets
 *
 * Reusable field groups for HR benefits forms.
 * Based on hr.ts schema tables: benefitPlans, benefitPlanOptions, employeeBenefits, benefitDependents.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// OPTIONS
// ==========================================

export const BENEFIT_TYPE_OPTIONS = [
  { value: 'health', label: 'Health Insurance' },
  { value: 'dental', label: 'Dental Insurance' },
  { value: 'vision', label: 'Vision Insurance' },
  { value: '401k', label: '401(k)' },
  { value: 'life', label: 'Life Insurance' },
  { value: 'disability', label: 'Disability Insurance' },
  { value: 'hsa', label: 'HSA' },
  { value: 'fsa', label: 'FSA' },
];

export const COVERAGE_LEVEL_OPTIONS = [
  { value: 'employee', label: 'Employee Only' },
  { value: 'employee_spouse', label: 'Employee + Spouse' },
  { value: 'employee_children', label: 'Employee + Children' },
  { value: 'family', label: 'Family' },
];

export const BENEFIT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'terminated', label: 'Terminated' },
];

export const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'domestic_partner', label: 'Domestic Partner' },
  { value: 'other', label: 'Other' },
];

// ==========================================
// BENEFIT PLAN FIELDS
// ==========================================

export const hrBenefitPlanFields: FieldDefinition[] = [
  {
    id: 'name',
    label: 'Plan Name',
    fieldType: 'text',
    required: true,
    placeholder: 'Gold Health Plan',
    config: { maxLength: 200 },
  },
  {
    id: 'type',
    label: 'Benefit Type',
    fieldType: 'select',
    required: true,
    options: BENEFIT_TYPE_OPTIONS,
  },
  {
    id: 'provider',
    label: 'Provider',
    fieldType: 'text',
    placeholder: 'Aetna',
    config: { maxLength: 100 },
  },
  {
    id: 'effectiveDate',
    label: 'Effective Date',
    fieldType: 'date',
  },
  {
    id: 'terminationDate',
    label: 'Termination Date',
    fieldType: 'date',
  },
  {
    id: 'description',
    label: 'Description',
    fieldType: 'textarea',
    placeholder: 'Plan details and coverage information...',
    config: { rows: 4 },
  },
];

export const hrBenefitPlanInputSet: InputSetConfig = {
  id: 'hr-benefit-plan',
  label: 'Benefit Plan',
  description: 'Create or edit a benefit plan',
  fields: hrBenefitPlanFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'name', colSpan: 2 },
      { fieldId: 'type', colSpan: 1 },
      { fieldId: 'provider', colSpan: 1 },
      { fieldId: 'effectiveDate', colSpan: 1 },
      { fieldId: 'terminationDate', colSpan: 1 },
      { fieldId: 'description', colSpan: 2 },
    ],
  },
};

// ==========================================
// BENEFIT PLAN OPTION FIELDS
// ==========================================

export const hrBenefitPlanOptionFields: FieldDefinition[] = [
  {
    id: 'optionName',
    label: 'Option Name',
    fieldType: 'text',
    required: true,
    placeholder: 'Individual Coverage',
    config: { maxLength: 100 },
  },
  {
    id: 'coverageLevel',
    label: 'Coverage Level',
    fieldType: 'select',
    required: true,
    options: COVERAGE_LEVEL_OPTIONS,
  },
  {
    id: 'employerContribution',
    label: 'Employer Contribution',
    fieldType: 'currency',
    placeholder: '500.00',
    description: 'Monthly employer contribution',
  },
  {
    id: 'employeeContribution',
    label: 'Employee Contribution',
    fieldType: 'currency',
    placeholder: '150.00',
    description: 'Monthly employee contribution',
  },
  {
    id: 'description',
    label: 'Description',
    fieldType: 'textarea',
    config: { rows: 2 },
  },
];

export const hrBenefitPlanOptionInputSet: InputSetConfig = {
  id: 'hr-benefit-plan-option',
  label: 'Plan Option',
  description: 'Create or edit a plan option',
  fields: hrBenefitPlanOptionFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'optionName', colSpan: 1 },
      { fieldId: 'coverageLevel', colSpan: 1 },
      { fieldId: 'employerContribution', colSpan: 1 },
      { fieldId: 'employeeContribution', colSpan: 1 },
      { fieldId: 'description', colSpan: 2 },
    ],
  },
};

// ==========================================
// BENEFIT ENROLLMENT FIELDS
// ==========================================

export const hrBenefitEnrollmentFields: FieldDefinition[] = [
  {
    id: 'planOptionId',
    label: 'Plan Option',
    fieldType: 'reference',
    required: true,
    config: {
      entity: 'benefitPlanOption',
      displayField: 'optionName',
      groupBy: 'planName',
    },
  },
  {
    id: 'coverageStart',
    label: 'Coverage Start Date',
    fieldType: 'date',
    required: true,
  },
  {
    id: 'coverageEnd',
    label: 'Coverage End Date',
    fieldType: 'date',
  },
];

export const hrBenefitEnrollmentInputSet: InputSetConfig = {
  id: 'hr-benefit-enrollment',
  label: 'Benefit Enrollment',
  description: 'Enroll in a benefit plan',
  fields: hrBenefitEnrollmentFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'planOptionId', colSpan: 2 },
      { fieldId: 'coverageStart', colSpan: 1 },
      { fieldId: 'coverageEnd', colSpan: 1 },
    ],
  },
};

// ==========================================
// DEPENDENT FIELDS
// ==========================================

export const hrBenefitDependentFields: FieldDefinition[] = [
  {
    id: 'name',
    label: 'Full Name',
    fieldType: 'text',
    required: true,
    placeholder: 'Jane Doe',
    config: { maxLength: 200 },
  },
  {
    id: 'relationship',
    label: 'Relationship',
    fieldType: 'select',
    required: true,
    options: RELATIONSHIP_OPTIONS,
  },
  {
    id: 'dateOfBirth',
    label: 'Date of Birth',
    fieldType: 'date',
  },
  {
    id: 'ssn',
    label: 'SSN',
    fieldType: 'text',
    placeholder: 'XXX-XX-XXXX',
    config: {
      maxLength: 11,
      mask: '***-**-****',
      sensitive: true,
    },
  },
];

export const hrBenefitDependentInputSet: InputSetConfig = {
  id: 'hr-benefit-dependent',
  label: 'Add Dependent',
  description: 'Add a dependent to benefit enrollment',
  fields: hrBenefitDependentFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'name', colSpan: 1 },
      { fieldId: 'relationship', colSpan: 1 },
      { fieldId: 'dateOfBirth', colSpan: 1 },
      { fieldId: 'ssn', colSpan: 1 },
    ],
  },
};
