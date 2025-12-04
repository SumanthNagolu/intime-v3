/**
 * Vendor Onboarding Screen (Wizard)
 *
 * Multi-step wizard for onboarding new vendors.
 * Steps per 14-onboard-vendor.md:
 * 1. Company Info
 * 2. Contacts
 * 3. Agreement Terms
 * 4. Commission Structure
 * 5. Focus Areas
 * 6. Review & Activate
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/14-onboard-vendor.md
 */

import type { ScreenDefinition, WizardStepDefinition } from '@/lib/metadata/types';

// ==========================================
// OPTIONS
// ==========================================

const VENDOR_TYPE_OPTIONS = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'prime_vendor', label: 'Prime Vendor' },
  { value: 'tier_1', label: 'Tier 1' },
  { value: 'tier_2', label: 'Tier 2' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
];

const VENDOR_TIER_OPTIONS = [
  { value: 'preferred', label: 'Preferred' },
  { value: 'standard', label: 'Standard' },
  { value: 'new', label: 'New' },
];

const PAYMENT_TERMS_OPTIONS = [
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
];

const MARKUP_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'tiered', label: 'Tiered' },
  { value: 'negotiated', label: 'Per-Placement Negotiated' },
];

const INVOICE_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

// ==========================================
// WIZARD STEPS
// ==========================================

const wizardSteps: WizardStepDefinition[] = [
  // Step 1: Company Info
  {
    id: 'company',
    title: 'Company Info',
    description: 'Basic vendor company information',
    icon: 'Building2',
    sections: [
      {
        id: 'basic-info',
        type: 'form',
        title: 'Company Details',
        columns: 2,
        fields: [
          {
            id: 'name',
            label: 'Company Name',
            type: 'text',
            path: 'company.name',
            required: true,
            span: 2,
          },
          {
            id: 'type',
            label: 'Vendor Type',
            type: 'select',
            path: 'company.type',
            required: true,
            options: VENDOR_TYPE_OPTIONS,
          },
          {
            id: 'tier',
            label: 'Tier',
            type: 'select',
            path: 'company.tier',
            options: VENDOR_TIER_OPTIONS,
            config: { defaultValue: 'new' },
          },
          {
            id: 'website',
            label: 'Website',
            type: 'url',
            path: 'company.website',
          },
          {
            id: 'industry',
            label: 'Industry',
            type: 'text',
            path: 'company.industry',
          },
        ],
      },
      {
        id: 'address',
        type: 'form',
        title: 'Address',
        columns: 2,
        fields: [
          {
            id: 'street',
            label: 'Street Address',
            type: 'text',
            path: 'address.street',
            span: 2,
          },
          {
            id: 'city',
            label: 'City',
            type: 'text',
            path: 'address.city',
          },
          {
            id: 'state',
            label: 'State',
            type: 'text',
            path: 'address.state',
          },
          {
            id: 'zip',
            label: 'ZIP Code',
            type: 'text',
            path: 'address.zip',
          },
          {
            id: 'country',
            label: 'Country',
            type: 'text',
            path: 'address.country',
            config: { defaultValue: 'USA' },
          },
        ],
      },
    ],
    validation: {
      required: ['company.name', 'company.type'],
    },
  },

  // Step 2: Contacts
  {
    id: 'contacts',
    title: 'Contacts',
    description: 'Add vendor contacts',
    icon: 'Users',
    sections: [
      {
        id: 'primary-contact',
        type: 'form',
        title: 'Primary Contact',
        columns: 2,
        fields: [
          {
            id: 'primaryFirstName',
            label: 'First Name',
            type: 'text',
            path: 'primaryContact.firstName',
            required: true,
          },
          {
            id: 'primaryLastName',
            label: 'Last Name',
            type: 'text',
            path: 'primaryContact.lastName',
            required: true,
          },
          {
            id: 'primaryEmail',
            label: 'Email',
            type: 'email',
            path: 'primaryContact.email',
            required: true,
          },
          {
            id: 'primaryPhone',
            label: 'Phone',
            type: 'phone',
            path: 'primaryContact.phone',
          },
          {
            id: 'primaryTitle',
            label: 'Job Title',
            type: 'text',
            path: 'primaryContact.title',
          },
          {
            id: 'primaryDepartment',
            label: 'Department',
            type: 'text',
            path: 'primaryContact.department',
          },
        ],
      },
      {
        id: 'additional-contacts',
        type: 'custom',
        title: 'Additional Contacts',
        component: 'ContactListEditor',
        componentProps: {
          path: 'additionalContacts',
          maxContacts: 5,
          fields: ['firstName', 'lastName', 'email', 'phone', 'title', 'department'],
        },
      },
    ],
    validation: {
      required: ['primaryContact.firstName', 'primaryContact.lastName', 'primaryContact.email'],
    },
  },

  // Step 3: Agreement Terms
  {
    id: 'agreements',
    title: 'Agreements',
    description: 'Upload legal documents',
    icon: 'FileText',
    sections: [
      {
        id: 'documents',
        type: 'custom',
        title: 'Required Documents',
        component: 'DocumentUploader',
        componentProps: {
          documents: [
            { id: 'msa', label: 'Master Service Agreement (MSA)', required: true },
            { id: 'nda', label: 'Non-Disclosure Agreement (NDA)', required: true },
            { id: 'coi', label: 'Certificate of Insurance (COI)', required: false },
            { id: 'w9', label: 'W-9 Form', required: true },
          ],
          path: 'documents',
          allowedTypes: ['pdf', 'doc', 'docx'],
          maxSize: 10, // MB
        },
      },
      {
        id: 'agreement-dates',
        type: 'form',
        title: 'Agreement Dates',
        columns: 2,
        fields: [
          {
            id: 'msaStartDate',
            label: 'MSA Start Date',
            type: 'date',
            path: 'agreements.msaStartDate',
          },
          {
            id: 'msaEndDate',
            label: 'MSA End Date',
            type: 'date',
            path: 'agreements.msaEndDate',
          },
          {
            id: 'autoRenew',
            label: 'Auto-Renew',
            type: 'boolean',
            path: 'agreements.autoRenew',
            config: { helpText: 'Automatically renew agreement on expiry' },
          },
        ],
      },
    ],
    validation: {
      custom: 'validateDocuments',
    },
  },

  // Step 4: Commission Structure
  {
    id: 'commission',
    title: 'Commission',
    description: 'Define commission and payment terms',
    icon: 'DollarSign',
    sections: [
      {
        id: 'payment-terms',
        type: 'form',
        title: 'Payment Terms',
        columns: 2,
        fields: [
          {
            id: 'paymentTerms',
            label: 'Payment Terms',
            type: 'select',
            path: 'billing.paymentTerms',
            required: true,
            options: PAYMENT_TERMS_OPTIONS,
          },
          {
            id: 'invoiceFrequency',
            label: 'Invoice Frequency',
            type: 'select',
            path: 'billing.invoiceFrequency',
            options: INVOICE_FREQUENCY_OPTIONS,
          },
          {
            id: 'billingEmail',
            label: 'Billing Email',
            type: 'email',
            path: 'billing.billingEmail',
          },
        ],
      },
      {
        id: 'commission-structure',
        type: 'form',
        title: 'Commission Structure',
        description: 'Note: Commission terms are custom per vendor - no standard percentages',
        columns: 2,
        fields: [
          {
            id: 'markupType',
            label: 'Markup Type',
            type: 'select',
            path: 'commission.markupType',
            required: true,
            options: MARKUP_TYPE_OPTIONS,
          },
          {
            id: 'markupValue',
            label: 'Markup Value',
            type: 'number',
            path: 'commission.markupValue',
            config: {
              suffix: '%',
              helpText: 'Default markup percentage',
            },
            visible: { field: 'commission.markupType', operator: 'eq', value: 'percentage' },
          },
          {
            id: 'fixedMarkup',
            label: 'Fixed Markup',
            type: 'currency',
            path: 'commission.fixedMarkup',
            config: {
              suffix: '/hr',
              helpText: 'Fixed amount per hour',
            },
            visible: { field: 'commission.markupType', operator: 'eq', value: 'fixed' },
          },
        ],
      },
      {
        id: 'tiered-rates',
        type: 'custom',
        title: 'Tiered Rates',
        component: 'TieredRateEditor',
        visible: { field: 'commission.markupType', operator: 'eq', value: 'tiered' },
        componentProps: {
          path: 'commission.tiers',
          columns: ['minRate', 'maxRate', 'markupPercent'],
        },
      },
      {
        id: 'commission-notes',
        type: 'form',
        title: 'Commission Notes',
        fields: [
          {
            id: 'commissionNotes',
            label: 'Notes',
            type: 'textarea',
            path: 'commission.notes',
            config: {
              rows: 3,
              placeholder: 'Additional commission terms or special arrangements...',
            },
          },
        ],
      },
    ],
    validation: {
      required: ['billing.paymentTerms', 'commission.markupType'],
    },
  },

  // Step 5: Focus Areas
  {
    id: 'focus',
    title: 'Focus Areas',
    description: 'Preferred skills, industries, and locations',
    icon: 'Target',
    sections: [
      {
        id: 'skills-focus',
        type: 'form',
        title: 'Skill Focus',
        fields: [
          {
            id: 'preferredSkills',
            label: 'Preferred Skills',
            type: 'tags',
            path: 'focus.skills',
            config: {
              suggestions: true,
              helpText: 'Technology skills this vendor typically needs',
            },
          },
        ],
      },
      {
        id: 'industry-focus',
        type: 'form',
        title: 'Industry Focus',
        fields: [
          {
            id: 'preferredIndustries',
            label: 'Preferred Industries',
            type: 'tags',
            path: 'focus.industries',
            config: {
              suggestions: ['Finance', 'Healthcare', 'Technology', 'Retail', 'Manufacturing', 'Government'],
              helpText: 'Industries this vendor typically serves',
            },
          },
        ],
      },
      {
        id: 'location-focus',
        type: 'form',
        title: 'Location Focus',
        fields: [
          {
            id: 'preferredLocations',
            label: 'Preferred Locations',
            type: 'tags',
            path: 'focus.locations',
            config: {
              placeholder: 'Add locations...',
              helpText: 'Geographic areas this vendor covers',
            },
          },
          {
            id: 'remoteOk',
            label: 'Remote Work OK',
            type: 'boolean',
            path: 'focus.remoteOk',
            config: { helpText: 'Vendor accepts remote placements' },
          },
        ],
      },
    ],
  },

  // Step 6: Review & Activate
  {
    id: 'review',
    title: 'Review & Activate',
    description: 'Review and activate vendor',
    icon: 'CheckCircle',
    sections: [
      {
        id: 'review-summary',
        type: 'custom',
        title: 'Vendor Summary',
        component: 'VendorOnboardReview',
        componentProps: {
          showAllSections: true,
          allowEdit: true,
        },
      },
      {
        id: 'activation',
        type: 'form',
        title: 'Activation',
        fields: [
          {
            id: 'assignedOwner',
            label: 'Assigned Owner',
            type: 'select',
            path: 'activation.ownerId',
            required: true,
            config: {
              entityType: 'user',
              filter: { role: 'bench_sales' },
              displayField: 'fullName',
              defaultValue: 'currentUser',
            },
          },
          {
            id: 'status',
            label: 'Initial Status',
            type: 'select',
            path: 'activation.status',
            options: [
              { value: 'active', label: 'Active - Ready for job orders' },
              { value: 'pending', label: 'Pending - Awaiting document approval' },
            ],
            config: { defaultValue: 'active' },
          },
          {
            id: 'sendWelcomeEmail',
            label: 'Send Welcome Email',
            type: 'boolean',
            path: 'activation.sendWelcomeEmail',
            config: { defaultValue: true },
          },
        ],
      },
    ],
    validation: {
      required: ['activation.ownerId'],
    },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const vendorOnboardScreen: ScreenDefinition = {
  id: 'vendor-onboard',
  type: 'wizard',
  entityType: 'vendor',

  title: 'Onboard Vendor',
  subtitle: 'Add a new vendor partner',
  icon: 'Building2',

  layout: {
    type: 'wizard-steps',
    steps: wizardSteps,
  },

  navigation: {
    allowSkip: false,
    showProgress: true,
    showStepNumbers: true,
    saveDraft: true,
    allowResume: true,
  },

  onComplete: {
    action: 'create',
    entityType: 'vendor',
    successRedirect: '/employee/bench/vendors/{{id}}',
    successMessage: 'Vendor onboarded successfully!',
  },

  actions: [
    {
      id: 'save-draft',
      label: 'Save Draft',
      type: 'custom',
      icon: 'Save',
      variant: 'ghost',
      config: { type: 'custom', handler: 'saveDraft' },
    },
    {
      id: 'cancel',
      label: 'Cancel',
      type: 'navigate',
      icon: 'X',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/bench/vendors' },
      confirm: {
        title: 'Cancel Onboarding',
        message: 'Are you sure? Any unsaved changes will be lost.',
        confirmLabel: 'Yes, Cancel',
        destructive: true,
      },
    },
  ],

  breadcrumbs: [
    { label: 'Workspace', route: '/employee/workspace' },
    { label: 'Bench Sales', route: '/employee/bench' },
    { label: 'Vendors', route: '/employee/bench/vendors' },
    { label: 'Onboard', active: true },
  ],
};

export default vendorOnboardScreen;
