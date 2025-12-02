/**
 * Contact Form Screen Definitions
 *
 * Metadata-driven screens for creating and editing Contacts.
 * Uses the createFormScreen factory for standardized form patterns.
 */

import { createCreateFormScreen, createEditFormScreen } from '@/lib/metadata/factories';
import type { FormTemplateConfig } from '@/lib/metadata/templates';
import {
  crmContactBasicInputSet,
  crmContactTypeInputSet,
  crmContactCompanyInputSet,
  crmContactDecisionInputSet,
  crmContactPreferencesInputSet,
  crmContactSocialInputSet,
  crmContactNotesInputSet,
} from '@/lib/metadata/inputsets';

// ==========================================
// CONTACT FORM CONFIG
// ==========================================

const contactFormConfig: FormTemplateConfig = {
  entityId: 'contact',
  entityName: 'Contact',
  basePath: '/employee/crm/contacts',

  // Data source for edit mode
  dataSource: {
    getProcedure: 'crm.contacts.getById',
    createProcedure: 'crm.contacts.create',
    updateProcedure: 'crm.contacts.update',
    idParam: 'id',
  },

  // Form sections using InputSets
  sections: [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Contact name, email, phone, and job details',
      inputSet: crmContactBasicInputSet,
      collapsible: false,
    },
    {
      id: 'classification',
      title: 'Contact Classification',
      description: 'Type and status of the contact',
      inputSet: crmContactTypeInputSet,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: 'company',
      title: 'Company Information',
      description: 'Associated company and work location',
      inputSet: crmContactCompanyInputSet,
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: 'decision',
      title: 'Decision Making',
      description: 'Role in purchasing decisions',
      inputSet: crmContactDecisionInputSet,
      collapsible: true,
      defaultExpanded: false,
    },
    {
      id: 'preferences',
      title: 'Communication Preferences',
      description: 'Preferred contact method and timing',
      inputSet: crmContactPreferencesInputSet,
      collapsible: true,
      defaultExpanded: false,
    },
    {
      id: 'social',
      title: 'Social Links',
      description: 'LinkedIn, Twitter, and other profiles',
      inputSet: crmContactSocialInputSet,
      collapsible: true,
      defaultExpanded: false,
    },
    {
      id: 'notes',
      title: 'Notes & Tags',
      description: 'Additional notes and categorization',
      inputSet: crmContactNotesInputSet,
      collapsible: true,
      defaultExpanded: false,
    },
  ],

  // Validation rules (augments InputSet field validation)
  validation: {
    rules: [
      {
        type: 'required-if',
        field: 'email',
        condition: { field: 'preferredContactMethod', value: 'email' },
        message: 'Email is required when email is the preferred contact method',
      },
      {
        type: 'required-if',
        field: 'phone',
        condition: { field: 'preferredContactMethod', value: 'phone' },
        message: 'Phone is required when phone is the preferred contact method',
      },
    ],
  },

  // Form actions
  actions: {
    submit: {
      label: 'Save Contact',
      variant: 'primary',
      icon: 'Check',
    },
    cancel: {
      label: 'Cancel',
      variant: 'secondary',
      route: '/employee/crm/contacts',
    },
    saveAndNew: {
      label: 'Save & Add Another',
      variant: 'secondary',
      showOnCreate: true,
      showOnEdit: false,
    },
  },

  // Success handlers
  onSuccess: {
    create: {
      redirect: '/employee/crm/contacts/{{id}}',
      toast: { message: 'Contact created successfully' },
    },
    update: {
      redirect: '/employee/crm/contacts/{{id}}',
      toast: { message: 'Contact updated successfully' },
    },
  },

  // Navigation
  navigation: {
    create: {
      breadcrumbs: [
        { label: 'CRM', route: '/employee/crm' },
        { label: 'Contacts', route: '/employee/crm/contacts' },
        { label: 'New Contact' },
      ],
    },
    edit: {
      breadcrumbs: [
        { label: 'CRM', route: '/employee/crm' },
        { label: 'Contacts', route: '/employee/crm/contacts' },
        { label: '{{firstName}} {{lastName}}', route: '/employee/crm/contacts/{{id}}' },
        { label: 'Edit' },
      ],
    },
  },
};

// ==========================================
// GENERATE SCREENS
// ==========================================

export const contactCreateScreen = createCreateFormScreen(contactFormConfig);
export const contactEditScreen = createEditFormScreen(contactFormConfig);

export { contactFormConfig };

export default contactCreateScreen;
