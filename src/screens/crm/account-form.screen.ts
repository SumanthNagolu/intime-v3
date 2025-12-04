/**
 * Account Form Screen Definitions
 *
 * Metadata-driven screens for creating and editing Accounts.
 * Uses the createFormScreen factory for standardized form patterns.
 */

import type { ScreenDefinition, FieldDefinition, InputSetConfig } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'banking', label: 'Banking' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'government', label: 'Government' },
  { value: 'education', label: 'Education' },
  { value: 'energy', label: 'Energy' },
  { value: 'telecommunications', label: 'Telecom' },
  { value: 'pharmaceutical', label: 'Pharmaceutical' },
  { value: 'other', label: 'Other' },
];

const COMPANY_TYPE_OPTIONS = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
  { value: 'msp_vms', label: 'MSP/VMS' },
  { value: 'system_integrator', label: 'System Integrator' },
  { value: 'staffing_agency', label: 'Staffing Agency' },
  { value: 'vendor', label: 'Vendor' },
];

const STATUS_OPTIONS = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'churned', label: 'Churned' },
];

const TIER_OPTIONS = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'mid_market', label: 'Mid-Market' },
  { value: 'smb', label: 'SMB' },
  { value: 'strategic', label: 'Strategic' },
];

const RESPONSIVENESS_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const QUALITY_OPTIONS = [
  { value: 'premium', label: 'Premium' },
  { value: 'standard', label: 'Standard' },
  { value: 'budget', label: 'Budget' },
];

// ==========================================
// FORM FIELDS
// ==========================================

const companyInfoFields: FieldDefinition[] = [
  {
    id: 'name',
    label: 'Company Name',
    type: 'text',
    path: 'name',
    required: true,
    placeholder: 'Enter company name',
    span: 2,
  },
  {
    id: 'industry',
    label: 'Industry',
    type: 'select',
    path: 'industry',
    options: INDUSTRY_OPTIONS,
    placeholder: 'Select industry',
  },
  {
    id: 'companyType',
    label: 'Company Type',
    type: 'select',
    path: 'companyType',
    options: COMPANY_TYPE_OPTIONS,
    placeholder: 'Select type',
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    path: 'status',
    required: true,
    options: STATUS_OPTIONS,
    config: { defaultValue: 'prospect' },
  },
  {
    id: 'tier',
    label: 'Tier',
    type: 'select',
    path: 'tier',
    options: TIER_OPTIONS,
    placeholder: 'Select tier',
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    path: 'description',
    span: 2,
    config: { rows: 4 },
    placeholder: 'Brief description of the account',
  },
];

const contactInfoFields: FieldDefinition[] = [
  {
    id: 'phone',
    label: 'Phone',
    type: 'phone',
    path: 'phone',
    placeholder: '+1 (555) 123-4567',
  },
  {
    id: 'website',
    label: 'Website',
    type: 'url',
    path: 'website',
    placeholder: 'https://example.com',
  },
  {
    id: 'headquartersLocation',
    label: 'Headquarters Location',
    type: 'text',
    path: 'headquartersLocation',
    span: 2,
    placeholder: 'City, State, Country',
  },
];

const managementFields: FieldDefinition[] = [
  {
    id: 'accountManagerId',
    label: 'Account Manager',
    type: 'select',
    path: 'accountManagerId',
    config: {
      entityType: 'user',
      displayField: 'fullName',
      placeholder: 'Select account manager',
    },
  },
  {
    id: 'responsiveness',
    label: 'Responsiveness',
    type: 'select',
    path: 'responsiveness',
    options: RESPONSIVENESS_OPTIONS,
  },
  {
    id: 'preferredQuality',
    label: 'Preferred Quality',
    type: 'select',
    path: 'preferredQuality',
    options: QUALITY_OPTIONS,
  },
];

const businessTermsFields: FieldDefinition[] = [
  {
    id: 'contractStartDate',
    label: 'Contract Start',
    type: 'date',
    path: 'contractStartDate',
  },
  {
    id: 'contractEndDate',
    label: 'Contract End',
    type: 'date',
    path: 'contractEndDate',
  },
  {
    id: 'paymentTermsDays',
    label: 'Payment Terms (Days)',
    type: 'number',
    path: 'paymentTermsDays',
    min: 0,
    max: 180,
    placeholder: 'e.g., 30',
  },
  {
    id: 'markupPercentage',
    label: 'Markup %',
    type: 'percentage',
    path: 'markupPercentage',
  },
  {
    id: 'annualRevenueTarget',
    label: 'Annual Revenue Target',
    type: 'currency',
    path: 'annualRevenueTarget',
    placeholder: '0.00',
  },
];

// ==========================================
// INPUT SETS
// ==========================================

export const accountBasicInputSet: InputSetConfig = {
  id: 'account-basic',
  name: 'Company Information',
  description: 'Basic company details',
  fields: companyInfoFields,
  layout: { columns: 2, gap: 'md' },
};

export const accountContactInputSet: InputSetConfig = {
  id: 'account-contact',
  name: 'Contact Information',
  description: 'Primary contact details',
  fields: contactInfoFields,
  layout: { columns: 2, gap: 'md' },
};

export const accountManagementInputSet: InputSetConfig = {
  id: 'account-management',
  name: 'Account Management',
  description: 'Ownership and management settings',
  fields: managementFields,
  layout: { columns: 3, gap: 'md' },
};

export const accountTermsInputSet: InputSetConfig = {
  id: 'account-terms',
  name: 'Business Terms',
  description: 'Contract and payment terms',
  fields: businessTermsFields,
  layout: { columns: 2, gap: 'md' },
};

// ==========================================
// CREATE SCREEN
// ==========================================

export const accountCreateScreen: ScreenDefinition = {
  id: 'account-create',
  type: 'wizard',
  entityType: 'account',

  title: 'New Account',
  subtitle: 'Create a new client account',
  icon: 'Building2',

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'company-info',
        type: 'field-grid',
        title: 'Company Information',
        icon: 'Building',
        columns: 2,
        fields: companyInfoFields,
      },
      {
        id: 'contact-info',
        type: 'field-grid',
        title: 'Contact Information',
        icon: 'Phone',
        columns: 2,
        fields: contactInfoFields,
      },
      {
        id: 'account-management',
        type: 'field-grid',
        title: 'Account Management',
        icon: 'UserCog',
        columns: 3,
        fields: managementFields,
        collapsible: true,
        defaultExpanded: true,
      },
      {
        id: 'business-terms',
        type: 'field-grid',
        title: 'Business Terms',
        icon: 'FileText',
        columns: 2,
        fields: businessTermsFields,
        collapsible: true,
        defaultExpanded: false,
      },
    ],
  },

  actions: [
    {
      id: 'cancel',
      label: 'Cancel',
      type: 'navigate',
      variant: 'outline',
      config: {
        type: 'navigate',
        route: '/employee/recruiting/accounts',
      },
    },
    {
      id: 'save',
      label: 'Create Account',
      type: 'mutation',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'mutation',
        procedure: 'crm.accounts.create',
      },
    },
  ],

  navigation: {
    back: { label: 'Back to Accounts', route: '/employee/recruiting/accounts' },
    breadcrumbs: [
      { label: 'Recruiting', route: '/employee/recruiting' },
      { label: 'Accounts', route: '/employee/recruiting/accounts' },
      { label: 'New Account' },
    ],
  },
};

// ==========================================
// EDIT SCREEN
// ==========================================

export const accountEditScreen: ScreenDefinition = {
  id: 'account-edit',
  type: 'wizard',
  entityType: 'account',

  title: { type: 'field', path: 'name' },
  subtitle: 'Edit Account',
  icon: 'Building2',

  dataSource: {
    type: 'entity',
    entityType: 'account',
    entityId: { type: 'param', path: 'id' },
  },

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'company-info',
        type: 'field-grid',
        title: 'Company Information',
        icon: 'Building',
        columns: 2,
        fields: companyInfoFields,
      },
      {
        id: 'contact-info',
        type: 'field-grid',
        title: 'Contact Information',
        icon: 'Phone',
        columns: 2,
        fields: contactInfoFields,
      },
      {
        id: 'account-management',
        type: 'field-grid',
        title: 'Account Management',
        icon: 'UserCog',
        columns: 3,
        fields: managementFields,
        collapsible: true,
        defaultExpanded: true,
      },
      {
        id: 'business-terms',
        type: 'field-grid',
        title: 'Business Terms',
        icon: 'FileText',
        columns: 2,
        fields: businessTermsFields,
        collapsible: true,
        defaultExpanded: true,
      },
    ],
  },

  actions: [
    {
      id: 'cancel',
      label: 'Cancel',
      type: 'navigate',
      variant: 'outline',
      config: {
        type: 'navigate',
        route: '/employee/recruiting/accounts/{{id}}',
      },
    },
    {
      id: 'save',
      label: 'Save Changes',
      type: 'mutation',
      variant: 'primary',
      icon: 'Save',
      config: {
        type: 'mutation',
        procedure: 'crm.accounts.update',
      },
    },
  ],

  navigation: {
    back: { label: 'Back to Account', route: '/employee/recruiting/accounts/{{id}}' },
    breadcrumbs: [
      { label: 'Recruiting', route: '/employee/recruiting' },
      { label: 'Accounts', route: '/employee/recruiting/accounts' },
      { label: { type: 'field', path: 'name' }, route: '/employee/recruiting/accounts/{{id}}' },
      { label: 'Edit' },
    ],
  },
};

// Export config for factory usage
export const accountFormConfig = {
  entityType: 'account',
  domain: 'crm',
  basePath: '/employee/recruiting/accounts',
  procedures: {
    getById: 'crm.accounts.getById',
    create: 'crm.accounts.create',
    update: 'crm.accounts.update',
  },
};

export default accountCreateScreen;
