/**
 * HR Employee InputSets
 *
 * Reusable field groups for HR employee forms.
 * Based on hr.ts schema tables: employees, employeeProfiles, employeeDocuments.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// OPTIONS (import from hr-options for reuse)
// ==========================================

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'fte', label: 'Full-Time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
  { value: 'part_time', label: 'Part-Time' },
];

export const HR_WORK_MODE_OPTIONS = [
  { value: 'on_site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const SALARY_TYPE_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'annual', label: 'Annual' },
];

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'INR', label: 'INR (₹)' },
];

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'contract', label: 'Contract' },
  { value: 'i9', label: 'I-9' },
  { value: 'w4', label: 'W-4' },
  { value: 'tax_form', label: 'Tax Form' },
  { value: 'nda', label: 'NDA' },
  { value: 'handbook_ack', label: 'Handbook Acknowledgment' },
  { value: 'performance_review', label: 'Performance Review' },
  { value: 'termination', label: 'Termination' },
  { value: 'other', label: 'Other' },
];

export const DOCUMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'expired', label: 'Expired' },
  { value: 'rejected', label: 'Rejected' },
];

// ==========================================
// EMPLOYEE BASIC FIELDS
// ==========================================

export const hrEmployeeBasicFields: FieldDefinition[] = [
  {
    id: 'firstName',
    label: 'First Name',
    fieldType: 'text',
    placeholder: 'John',
    required: true,
    config: { maxLength: 100 },
  },
  {
    id: 'lastName',
    label: 'Last Name',
    fieldType: 'text',
    placeholder: 'Doe',
    required: true,
    config: { maxLength: 100 },
  },
  {
    id: 'email',
    label: 'Email',
    fieldType: 'email',
    placeholder: 'john.doe@company.com',
    required: true,
    config: { maxLength: 255 },
  },
  {
    id: 'phone',
    label: 'Phone',
    fieldType: 'phone',
    placeholder: '(555) 123-4567',
    config: { maxLength: 20 },
  },
  {
    id: 'employeeNumber',
    label: 'Employee Number',
    fieldType: 'text',
    placeholder: 'EMP-001',
    config: { maxLength: 50 },
  },
];

export const hrEmployeeBasicInputSet: InputSetConfig = {
  id: 'hr-employee-basic',
  label: 'Personal Information',
  description: 'Basic employee contact details',
  fields: hrEmployeeBasicFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'firstName', colSpan: 1 },
      { fieldId: 'lastName', colSpan: 1 },
      { fieldId: 'email', colSpan: 2 },
      { fieldId: 'phone', colSpan: 1 },
      { fieldId: 'employeeNumber', colSpan: 1 },
    ],
  },
};

// ==========================================
// EMPLOYEE EMPLOYMENT FIELDS
// ==========================================

export const hrEmployeeEmploymentFields: FieldDefinition[] = [
  {
    id: 'status',
    label: 'Employment Status',
    fieldType: 'select',
    required: true,
    options: EMPLOYMENT_STATUS_OPTIONS,
  },
  {
    id: 'employmentType',
    label: 'Employment Type',
    fieldType: 'select',
    required: true,
    options: EMPLOYMENT_TYPE_OPTIONS,
  },
  {
    id: 'hireDate',
    label: 'Hire Date',
    fieldType: 'date',
    required: true,
  },
  {
    id: 'department',
    label: 'Department',
    fieldType: 'text',
    placeholder: 'Engineering',
    config: { maxLength: 100 },
  },
  {
    id: 'jobTitle',
    label: 'Job Title',
    fieldType: 'text',
    placeholder: 'Software Engineer',
    config: { maxLength: 200 },
  },
  {
    id: 'managerId',
    label: 'Manager',
    fieldType: 'reference',
    config: {
      entity: 'employee',
      displayField: 'fullName',
    },
  },
  {
    id: 'location',
    label: 'Location',
    fieldType: 'text',
    placeholder: 'New York, NY',
    config: { maxLength: 200 },
  },
  {
    id: 'workMode',
    label: 'Work Mode',
    fieldType: 'select',
    options: HR_WORK_MODE_OPTIONS,
  },
];

export const hrEmployeeEmploymentInputSet: InputSetConfig = {
  id: 'hr-employee-employment',
  label: 'Employment Information',
  description: 'Employment status and organizational details',
  fields: hrEmployeeEmploymentFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'status', colSpan: 1 },
      { fieldId: 'employmentType', colSpan: 1 },
      { fieldId: 'hireDate', colSpan: 1 },
      { fieldId: 'workMode', colSpan: 1 },
      { fieldId: 'department', colSpan: 1 },
      { fieldId: 'jobTitle', colSpan: 1 },
      { fieldId: 'managerId', colSpan: 1 },
      { fieldId: 'location', colSpan: 1 },
    ],
  },
};

// ==========================================
// EMPLOYEE COMPENSATION FIELDS
// ==========================================

export const hrEmployeeCompensationFields: FieldDefinition[] = [
  {
    id: 'salaryType',
    label: 'Salary Type',
    fieldType: 'select',
    required: true,
    options: SALARY_TYPE_OPTIONS,
  },
  {
    id: 'salaryAmount',
    label: 'Salary Amount',
    fieldType: 'currency',
    placeholder: '75000.00',
    config: { precision: 2 },
  },
  {
    id: 'currency',
    label: 'Currency',
    fieldType: 'select',
    options: CURRENCY_OPTIONS,
  },
];

export const hrEmployeeCompensationInputSet: InputSetConfig = {
  id: 'hr-employee-compensation',
  label: 'Compensation',
  description: 'Salary and compensation details',
  fields: hrEmployeeCompensationFields,
  layout: {
    columns: 3,
    fieldLayout: [
      { fieldId: 'salaryType', colSpan: 1 },
      { fieldId: 'salaryAmount', colSpan: 1 },
      { fieldId: 'currency', colSpan: 1 },
    ],
  },
};

// ==========================================
// EMPLOYEE ADDRESS FIELDS
// ==========================================

export const hrEmployeeAddressFields: FieldDefinition[] = [
  {
    id: 'addressStreet',
    label: 'Street Address',
    fieldType: 'text',
    placeholder: '123 Main St, Apt 4B',
    config: { maxLength: 255 },
  },
  {
    id: 'addressCity',
    label: 'City',
    fieldType: 'text',
    placeholder: 'New York',
    config: { maxLength: 100 },
  },
  {
    id: 'addressState',
    label: 'State',
    fieldType: 'text',
    placeholder: 'NY',
    config: { maxLength: 50 },
  },
  {
    id: 'addressPostal',
    label: 'Postal Code',
    fieldType: 'text',
    placeholder: '10001',
    config: { maxLength: 20 },
  },
  {
    id: 'addressCountry',
    label: 'Country',
    fieldType: 'text',
    placeholder: 'USA',
    config: { maxLength: 100 },
  },
];

export const hrEmployeeAddressInputSet: InputSetConfig = {
  id: 'hr-employee-address',
  label: 'Home Address',
  description: 'Employee residential address',
  fields: hrEmployeeAddressFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'addressStreet', colSpan: 2 },
      { fieldId: 'addressCity', colSpan: 1 },
      { fieldId: 'addressState', colSpan: 1 },
      { fieldId: 'addressPostal', colSpan: 1 },
      { fieldId: 'addressCountry', colSpan: 1 },
    ],
  },
};

// ==========================================
// EMERGENCY CONTACT FIELDS
// ==========================================

export const hrEmployeeEmergencyFields: FieldDefinition[] = [
  {
    id: 'emergencyContactName',
    label: 'Contact Name',
    fieldType: 'text',
    placeholder: 'Jane Doe',
    config: { maxLength: 100 },
  },
  {
    id: 'emergencyContactPhone',
    label: 'Contact Phone',
    fieldType: 'phone',
    placeholder: '(555) 987-6543',
    config: { maxLength: 20 },
  },
  {
    id: 'emergencyContactRelationship',
    label: 'Relationship',
    fieldType: 'text',
    placeholder: 'Spouse',
    config: { maxLength: 50 },
  },
];

export const hrEmployeeEmergencyInputSet: InputSetConfig = {
  id: 'hr-employee-emergency',
  label: 'Emergency Contact',
  description: 'Emergency contact information',
  fields: hrEmployeeEmergencyFields,
  layout: {
    columns: 3,
    fieldLayout: [
      { fieldId: 'emergencyContactName', colSpan: 1 },
      { fieldId: 'emergencyContactPhone', colSpan: 1 },
      { fieldId: 'emergencyContactRelationship', colSpan: 1 },
    ],
  },
};

// ==========================================
// EMPLOYEE TERMINATION FIELDS
// ==========================================

export const hrEmployeeTerminationFields: FieldDefinition[] = [
  {
    id: 'terminationDate',
    label: 'Termination Date',
    fieldType: 'date',
    required: true,
  },
  {
    id: 'terminationReason',
    label: 'Reason',
    fieldType: 'textarea',
    placeholder: 'Enter termination reason...',
    config: { rows: 4 },
  },
];

export const hrEmployeeTerminationInputSet: InputSetConfig = {
  id: 'hr-employee-termination',
  label: 'Termination',
  description: 'Employee termination details',
  fields: hrEmployeeTerminationFields,
  layout: {
    columns: 1,
    fieldLayout: [
      { fieldId: 'terminationDate', colSpan: 1 },
      { fieldId: 'terminationReason', colSpan: 1 },
    ],
  },
};

// ==========================================
// EMPLOYEE DOCUMENT FIELDS
// ==========================================

export const hrEmployeeDocumentFields: FieldDefinition[] = [
  {
    id: 'documentType',
    label: 'Document Type',
    fieldType: 'select',
    required: true,
    options: DOCUMENT_TYPE_OPTIONS,
  },
  {
    id: 'fileName',
    label: 'File Name',
    fieldType: 'text',
    required: true,
    config: { maxLength: 255 },
  },
  {
    id: 'fileUrl',
    label: 'File',
    fieldType: 'file',
    required: true,
    config: {
      accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg',
      maxSize: 10 * 1024 * 1024, // 10MB
    },
  },
  {
    id: 'issueDate',
    label: 'Issue Date',
    fieldType: 'date',
  },
  {
    id: 'expiryDate',
    label: 'Expiry Date',
    fieldType: 'date',
  },
  {
    id: 'status',
    label: 'Status',
    fieldType: 'select',
    options: DOCUMENT_STATUS_OPTIONS,
  },
  {
    id: 'notes',
    label: 'Notes',
    fieldType: 'textarea',
    config: { rows: 3 },
  },
];

export const hrEmployeeDocumentInputSet: InputSetConfig = {
  id: 'hr-employee-document',
  label: 'Document Upload',
  description: 'Upload and manage employee documents',
  fields: hrEmployeeDocumentFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'documentType', colSpan: 1 },
      { fieldId: 'status', colSpan: 1 },
      { fieldId: 'fileName', colSpan: 2 },
      { fieldId: 'fileUrl', colSpan: 2 },
      { fieldId: 'issueDate', colSpan: 1 },
      { fieldId: 'expiryDate', colSpan: 1 },
      { fieldId: 'notes', colSpan: 2 },
    ],
  },
};

// ==========================================
// FULL EMPLOYEE INPUTSET (FOR NEW EMPLOYEE FORM)
// ==========================================

export const hrEmployeeFullInputSet: InputSetConfig = {
  id: 'hr-employee-full',
  label: 'New Employee',
  description: 'Complete employee information form',
  fields: [
    ...hrEmployeeBasicFields,
    ...hrEmployeeEmploymentFields,
    ...hrEmployeeCompensationFields,
  ],
  layout: {
    columns: 2,
  },
};

// ==========================================
// QUICK ADD EMPLOYEE (MINIMAL FIELDS)
// ==========================================

export const hrEmployeeQuickAddInputSet: InputSetConfig = {
  id: 'hr-employee-quick-add',
  label: 'Quick Add Employee',
  description: 'Minimal fields for adding an employee',
  fields: [
    hrEmployeeBasicFields[0], // firstName
    hrEmployeeBasicFields[1], // lastName
    hrEmployeeBasicFields[2], // email
    hrEmployeeEmploymentFields[1], // employmentType
    hrEmployeeEmploymentFields[2], // hireDate
    hrEmployeeEmploymentFields[4], // jobTitle
  ],
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'firstName', colSpan: 1 },
      { fieldId: 'lastName', colSpan: 1 },
      { fieldId: 'email', colSpan: 2 },
      { fieldId: 'employmentType', colSpan: 1 },
      { fieldId: 'hireDate', colSpan: 1 },
      { fieldId: 'jobTitle', colSpan: 2 },
    ],
  },
};
