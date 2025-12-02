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

const contactFormConfig: Omit<FormTemplateConfig, 'mode' | 'submit'> = {
  entityType: 'contact',
  domain: 'crm',
  displayName: 'Contact',
  basePath: '/employee/crm/contacts',

  // Data source for edit mode
  procedures: {
    getById: 'crm.contacts.getById',
    create: 'crm.contacts.create',
    update: 'crm.contacts.update',
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
