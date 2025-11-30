/**
 * Contact InputSet
 *
 * Reusable contact information fields for persons (candidates, POCs, etc.)
 * Follows Guidewire InputSet pattern for composable form sections.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

/**
 * Basic contact fields (name only)
 */
export const nameFields: FieldDefinition[] = [
  {
    id: 'firstName',
    label: 'First Name',
    fieldType: 'text',
    placeholder: 'John',
    required: true,
    config: {
      maxLength: 100,
    },
  },
  {
    id: 'lastName',
    label: 'Last Name',
    fieldType: 'text',
    placeholder: 'Doe',
    required: true,
    config: {
      maxLength: 100,
    },
  },
  {
    id: 'middleName',
    label: 'Middle Name',
    fieldType: 'text',
    placeholder: 'William',
    config: {
      maxLength: 100,
    },
  },
];

/**
 * Full contact fields
 */
export const contactFields: FieldDefinition[] = [
  ...nameFields,
  {
    id: 'email',
    label: 'Email',
    fieldType: 'email',
    placeholder: 'john.doe@example.com',
    required: true,
    config: {
      maxLength: 255,
    },
  },
  {
    id: 'phone',
    label: 'Phone',
    fieldType: 'phone',
    placeholder: '(555) 123-4567',
    config: {
      maxLength: 20,
    },
  },
  {
    id: 'mobilePhone',
    label: 'Mobile Phone',
    fieldType: 'phone',
    placeholder: '(555) 987-6543',
    config: {
      maxLength: 20,
    },
  },
  {
    id: 'title',
    label: 'Job Title',
    fieldType: 'text',
    placeholder: 'Software Engineer',
    config: {
      maxLength: 200,
    },
  },
  {
    id: 'department',
    label: 'Department',
    fieldType: 'text',
    placeholder: 'Engineering',
    config: {
      maxLength: 100,
    },
  },
];

/**
 * Full contact InputSet configuration
 */
export const contactInputSet: InputSetConfig = {
  id: 'contact',
  label: 'Contact Information',
  description: 'Basic contact details',
  fields: contactFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'firstName', colSpan: 1 },
      { fieldId: 'lastName', colSpan: 1 },
      { fieldId: 'email', colSpan: 2 },
      { fieldId: 'phone', colSpan: 1 },
      { fieldId: 'mobilePhone', colSpan: 1 },
      { fieldId: 'title', colSpan: 1 },
      { fieldId: 'department', colSpan: 1 },
    ],
  },
};

/**
 * Quick contact InputSet (minimal fields)
 */
export const quickContactInputSet: InputSetConfig = {
  id: 'quick-contact',
  label: 'Contact',
  description: 'Minimal contact information',
  fields: [
    nameFields[0], // firstName
    nameFields[1], // lastName
    contactFields.find((f) => f.id === 'email')!,
    contactFields.find((f) => f.id === 'phone')!,
  ],
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'firstName', colSpan: 1 },
      { fieldId: 'lastName', colSpan: 1 },
      { fieldId: 'email', colSpan: 1 },
      { fieldId: 'phone', colSpan: 1 },
    ],
  },
};

/**
 * POC (Point of Contact) InputSet for client contacts
 */
export const pocInputSet: InputSetConfig = {
  id: 'poc',
  label: 'Point of Contact',
  description: 'Client or account contact person',
  fields: [
    ...nameFields.slice(0, 2), // First and last name only
    {
      id: 'email',
      label: 'Email',
      fieldType: 'email',
      required: true,
    },
    {
      id: 'phone',
      label: 'Phone',
      fieldType: 'phone',
    },
    {
      id: 'title',
      label: 'Title',
      fieldType: 'text',
      placeholder: 'Hiring Manager',
    },
    {
      id: 'isPrimary',
      label: 'Primary Contact',
      fieldType: 'boolean',
      description: 'Mark as primary contact for this account',
    },
  ],
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'firstName', colSpan: 1 },
      { fieldId: 'lastName', colSpan: 1 },
      { fieldId: 'email', colSpan: 1 },
      { fieldId: 'phone', colSpan: 1 },
      { fieldId: 'title', colSpan: 1 },
      { fieldId: 'isPrimary', colSpan: 1 },
    ],
  },
};

/**
 * Professional links InputSet (LinkedIn, GitHub, etc.)
 */
export const professionalLinksInputSet: InputSetConfig = {
  id: 'professional-links',
  label: 'Professional Links',
  description: 'Online profiles and portfolios',
  fields: [
    {
      id: 'linkedinUrl',
      label: 'LinkedIn',
      fieldType: 'url',
      placeholder: 'https://linkedin.com/in/johndoe',
    },
    {
      id: 'githubUrl',
      label: 'GitHub',
      fieldType: 'url',
      placeholder: 'https://github.com/johndoe',
    },
    {
      id: 'portfolioUrl',
      label: 'Portfolio',
      fieldType: 'url',
      placeholder: 'https://johndoe.dev',
    },
    {
      id: 'resumeUrl',
      label: 'Resume URL',
      fieldType: 'url',
      placeholder: 'https://drive.google.com/...',
    },
  ],
  layout: {
    columns: 2,
  },
};

export default contactInputSet;
