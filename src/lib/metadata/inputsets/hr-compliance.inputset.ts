/**
 * HR Compliance InputSets
 *
 * Reusable field groups for HR compliance and I-9 forms.
 * Based on hr.ts schema tables: complianceRequirements, employeeCompliance, i9Records.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// OPTIONS
// ==========================================

export const COMPLIANCE_TYPE_OPTIONS = [
  { value: 'federal', label: 'Federal' },
  { value: 'state', label: 'State' },
  { value: 'local', label: 'Local' },
];

export const COMPLIANCE_FREQUENCY_OPTIONS = [
  { value: 'once', label: 'One-Time' },
  { value: 'annual', label: 'Annual' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
];

export const COMPLIANCE_APPLIES_TO_OPTIONS = [
  { value: 'all', label: 'All Employees' },
  { value: 'fte', label: 'Full-Time Only' },
  { value: 'contractor', label: 'Contractors Only' },
];

export const COMPLIANCE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'exempt', label: 'Exempt' },
];

export const I9_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'section1_complete', label: 'Section 1 Complete' },
  { value: 'completed', label: 'Completed' },
  { value: 'expired', label: 'Expired' },
];

// ==========================================
// COMPLIANCE REQUIREMENT FIELDS
// ==========================================

export const hrComplianceRequirementFields: FieldDefinition[] = [
  {
    id: 'name',
    label: 'Requirement Name',
    fieldType: 'text',
    required: true,
    placeholder: 'I-9 Employment Eligibility',
    config: { maxLength: 200 },
  },
  {
    id: 'type',
    label: 'Type',
    fieldType: 'select',
    required: true,
    options: COMPLIANCE_TYPE_OPTIONS,
  },
  {
    id: 'jurisdiction',
    label: 'Jurisdiction',
    fieldType: 'text',
    placeholder: 'USA, California, etc.',
    config: { maxLength: 100 },
  },
  {
    id: 'appliesTo',
    label: 'Applies To',
    fieldType: 'select',
    required: true,
    options: COMPLIANCE_APPLIES_TO_OPTIONS,
  },
  {
    id: 'frequency',
    label: 'Frequency',
    fieldType: 'select',
    required: true,
    options: COMPLIANCE_FREQUENCY_OPTIONS,
  },
  {
    id: 'description',
    label: 'Description',
    fieldType: 'textarea',
    placeholder: 'Detailed description of compliance requirement...',
    config: { rows: 3 },
  },
  {
    id: 'documentTemplateUrl',
    label: 'Template Document',
    fieldType: 'url',
    placeholder: 'https://...',
  },
  {
    id: 'isActive',
    label: 'Active',
    fieldType: 'boolean',
    description: 'Requirement is currently active',
  },
];

export const hrComplianceRequirementInputSet: InputSetConfig = {
  id: 'hr-compliance-requirement',
  label: 'Compliance Requirement',
  description: 'Create or edit a compliance requirement',
  fields: hrComplianceRequirementFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'name', colSpan: 2 },
      { fieldId: 'type', colSpan: 1 },
      { fieldId: 'jurisdiction', colSpan: 1 },
      { fieldId: 'appliesTo', colSpan: 1 },
      { fieldId: 'frequency', colSpan: 1 },
      { fieldId: 'description', colSpan: 2 },
      { fieldId: 'documentTemplateUrl', colSpan: 1 },
      { fieldId: 'isActive', colSpan: 1 },
    ],
  },
};

// ==========================================
// EMPLOYEE COMPLIANCE FIELDS
// ==========================================

export const hrEmployeeComplianceFields: FieldDefinition[] = [
  {
    id: 'requirementId',
    label: 'Requirement',
    fieldType: 'reference',
    required: true,
    config: {
      entity: 'complianceRequirement',
      displayField: 'name',
    },
  },
  {
    id: 'status',
    label: 'Status',
    fieldType: 'select',
    required: true,
    options: COMPLIANCE_STATUS_OPTIONS,
  },
  {
    id: 'dueDate',
    label: 'Due Date',
    fieldType: 'date',
  },
  {
    id: 'documentUrl',
    label: 'Document',
    fieldType: 'file',
    config: {
      accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg',
      maxSize: 10 * 1024 * 1024,
    },
  },
  {
    id: 'notes',
    label: 'Notes',
    fieldType: 'textarea',
    config: { rows: 2 },
  },
];

export const hrEmployeeComplianceInputSet: InputSetConfig = {
  id: 'hr-employee-compliance',
  label: 'Employee Compliance',
  description: 'Track employee compliance status',
  fields: hrEmployeeComplianceFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'requirementId', colSpan: 2 },
      { fieldId: 'status', colSpan: 1 },
      { fieldId: 'dueDate', colSpan: 1 },
      { fieldId: 'documentUrl', colSpan: 2 },
      { fieldId: 'notes', colSpan: 2 },
    ],
  },
};

// ==========================================
// I-9 SECTION 1 FIELDS (Employee)
// ==========================================

export const hrI9Section1Fields: FieldDefinition[] = [
  {
    id: 'lastName',
    label: 'Last Name',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'firstName',
    label: 'First Name',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'middleInitial',
    label: 'Middle Initial',
    fieldType: 'text',
    config: { maxLength: 1 },
  },
  {
    id: 'address',
    label: 'Street Address',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'city',
    label: 'City',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'state',
    label: 'State',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'zipCode',
    label: 'ZIP Code',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'dateOfBirth',
    label: 'Date of Birth',
    fieldType: 'date',
    required: true,
  },
  {
    id: 'ssn',
    label: 'Social Security Number',
    fieldType: 'text',
    required: true,
    config: { mask: '***-**-****', sensitive: true },
  },
  {
    id: 'email',
    label: 'Email Address',
    fieldType: 'email',
  },
  {
    id: 'phone',
    label: 'Phone Number',
    fieldType: 'phone',
  },
  {
    id: 'citizenshipStatus',
    label: 'Citizenship/Immigration Status',
    fieldType: 'select',
    required: true,
    options: [
      { value: 'citizen', label: 'U.S. Citizen' },
      { value: 'noncitizen_national', label: 'Noncitizen National' },
      { value: 'lpr', label: 'Lawful Permanent Resident' },
      { value: 'alien_authorized', label: 'Alien Authorized to Work' },
    ],
  },
];

export const hrI9Section1InputSet: InputSetConfig = {
  id: 'hr-i9-section1',
  label: 'I-9 Section 1',
  description: 'Employee Information and Attestation',
  fields: hrI9Section1Fields,
  layout: {
    columns: 3,
    fieldLayout: [
      { fieldId: 'lastName', colSpan: 1 },
      { fieldId: 'firstName', colSpan: 1 },
      { fieldId: 'middleInitial', colSpan: 1 },
      { fieldId: 'address', colSpan: 3 },
      { fieldId: 'city', colSpan: 1 },
      { fieldId: 'state', colSpan: 1 },
      { fieldId: 'zipCode', colSpan: 1 },
      { fieldId: 'dateOfBirth', colSpan: 1 },
      { fieldId: 'ssn', colSpan: 1 },
      { fieldId: 'citizenshipStatus', colSpan: 1 },
      { fieldId: 'email', colSpan: 1 },
      { fieldId: 'phone', colSpan: 1 },
    ],
  },
};

// ==========================================
// I-9 SECTION 2 FIELDS (Employer)
// ==========================================

export const hrI9Section2Fields: FieldDefinition[] = [
  {
    id: 'listADocument',
    label: 'List A Document',
    fieldType: 'text',
    description: 'Identity and Employment Authorization',
    placeholder: 'U.S. Passport',
  },
  {
    id: 'listBDocument',
    label: 'List B Document',
    fieldType: 'text',
    description: 'Identity',
    placeholder: "Driver's License",
  },
  {
    id: 'listCDocument',
    label: 'List C Document',
    fieldType: 'text',
    description: 'Employment Authorization',
    placeholder: 'Social Security Card',
  },
  {
    id: 'authorizedRepName',
    label: 'Authorized Representative Name',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'authorizedRepTitle',
    label: 'Title',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'employerName',
    label: 'Employer Name',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'employerAddress',
    label: 'Employer Address',
    fieldType: 'text',
    required: true,
  },
];

export const hrI9Section2InputSet: InputSetConfig = {
  id: 'hr-i9-section2',
  label: 'I-9 Section 2',
  description: 'Employer Review and Verification',
  fields: hrI9Section2Fields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'listADocument', colSpan: 2 },
      { fieldId: 'listBDocument', colSpan: 1 },
      { fieldId: 'listCDocument', colSpan: 1 },
      { fieldId: 'authorizedRepName', colSpan: 1 },
      { fieldId: 'authorizedRepTitle', colSpan: 1 },
      { fieldId: 'employerName', colSpan: 2 },
      { fieldId: 'employerAddress', colSpan: 2 },
    ],
  },
};

// ==========================================
// I-9 REVERIFICATION FIELDS
// ==========================================

export const hrI9ReverificationFields: FieldDefinition[] = [
  {
    id: 'reverificationDate',
    label: 'Reverification Date',
    fieldType: 'date',
    required: true,
  },
  {
    id: 'documentTitle',
    label: 'Document Title',
    fieldType: 'text',
    required: true,
  },
  {
    id: 'documentNumber',
    label: 'Document Number',
    fieldType: 'text',
  },
  {
    id: 'expirationDate',
    label: 'Expiration Date',
    fieldType: 'date',
  },
  {
    id: 'signature',
    label: 'Signature',
    fieldType: 'signature',
    required: true,
  },
];

export const hrI9ReverificationInputSet: InputSetConfig = {
  id: 'hr-i9-reverification',
  label: 'I-9 Reverification',
  description: 'Supplement B - Reverification and Rehire',
  fields: hrI9ReverificationFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'reverificationDate', colSpan: 1 },
      { fieldId: 'expirationDate', colSpan: 1 },
      { fieldId: 'documentTitle', colSpan: 1 },
      { fieldId: 'documentNumber', colSpan: 1 },
      { fieldId: 'signature', colSpan: 2 },
    ],
  },
};
