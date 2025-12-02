/**
 * CRM Contact InputSets
 *
 * Reusable field groups for CRM contact forms.
 * Extends base contact InputSet with CRM-specific fields.
 */

import type { InputSetConfig, FieldDefinition } from '../types/widget.types';
import {
  CONTACT_TYPE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
  DECISION_AUTHORITY_OPTIONS,
  BUYING_ROLE_OPTIONS,
  INFLUENCE_LEVEL_OPTIONS,
  PREFERRED_CONTACT_METHOD_OPTIONS,
  TIMEZONE_OPTIONS,
} from '../options/crm-options';

// ==========================================
// CRM CONTACT BASIC INFO
// ==========================================

export const crmContactBasicFields: FieldDefinition[] = [
  {
    id: 'firstName',
    label: 'First Name',
    type: 'text',
    path: 'firstName',
    required: true,
    editable: true,
    placeholder: 'Enter first name',
  },
  {
    id: 'lastName',
    label: 'Last Name',
    type: 'text',
    path: 'lastName',
    required: true,
    editable: true,
    placeholder: 'Enter last name',
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    path: 'email',
    editable: true,
    placeholder: 'email@company.com',
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'phone',
    path: 'phone',
    editable: true,
    placeholder: '+1 (555) 000-0000',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    type: 'phone',
    path: 'mobile',
    editable: true,
    placeholder: '+1 (555) 000-0000',
  },
  {
    id: 'title',
    label: 'Job Title',
    type: 'text',
    path: 'title',
    editable: true,
    placeholder: 'e.g., VP of Engineering',
  },
  {
    id: 'department',
    label: 'Department',
    type: 'text',
    path: 'department',
    editable: true,
    placeholder: 'e.g., Engineering, IT, HR',
  },
];

export const crmContactBasicInputSet: InputSetConfig = {
  id: 'crm-contact-basic',
  name: 'CRM Contact Basic Info',
  label: 'Basic Information',
  description: 'Core contact details including name, email, phone, and title',
  fields: crmContactBasicFields,
  columns: 2,
};

// ==========================================
// CRM CONTACT TYPE & STATUS
// ==========================================

export const crmContactTypeFields: FieldDefinition[] = [
  {
    id: 'contactType',
    label: 'Contact Type',
    type: 'select',
    path: 'contactType',
    required: true,
    editable: true,
    options: CONTACT_TYPE_OPTIONS,
    defaultValue: 'general',
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    path: 'status',
    required: true,
    editable: true,
    options: CONTACT_STATUS_OPTIONS,
    defaultValue: 'active',
    config: {
      badgeColors: {
        active: 'green',
        inactive: 'gray',
        do_not_contact: 'red',
        bounced: 'orange',
        unsubscribed: 'yellow',
      },
    },
  },
];

export const crmContactTypeInputSet: InputSetConfig = {
  id: 'crm-contact-type',
  name: 'CRM Contact Type',
  label: 'Contact Classification',
  description: 'Contact type and status settings',
  fields: crmContactTypeFields,
  columns: 2,
};

// ==========================================
// CRM CONTACT COMPANY INFO
// ==========================================

export const crmContactCompanyFields: FieldDefinition[] = [
  {
    id: 'companyId',
    label: 'Company',
    type: 'select',
    path: 'companyId',
    editable: true,
    optionsSource: {
      entityType: 'account',
      labelField: 'name',
      valueField: 'id',
      searchable: true,
    },
    placeholder: 'Select or search company',
  },
  {
    id: 'companyName',
    label: 'Company Name',
    type: 'text',
    path: 'companyName',
    editable: true,
    helpText: 'Company name if not in system',
    placeholder: 'Enter company name',
  },
  {
    id: 'workLocation',
    label: 'Work Location',
    type: 'text',
    path: 'workLocation',
    editable: true,
    placeholder: 'e.g., San Francisco, CA',
  },
  {
    id: 'timezone',
    label: 'Timezone',
    type: 'select',
    path: 'timezone',
    editable: true,
    options: TIMEZONE_OPTIONS,
    defaultValue: 'America/New_York',
  },
];

export const crmContactCompanyInputSet: InputSetConfig = {
  id: 'crm-contact-company',
  name: 'CRM Contact Company',
  label: 'Company Information',
  description: 'Company and work location details',
  fields: crmContactCompanyFields,
  columns: 2,
};

// ==========================================
// CRM CONTACT DECISION MAKING
// ==========================================

export const crmContactDecisionFields: FieldDefinition[] = [
  {
    id: 'decisionAuthority',
    label: 'Decision Authority',
    type: 'select',
    path: 'decisionAuthority',
    editable: true,
    options: DECISION_AUTHORITY_OPTIONS,
    helpText: 'Role in purchase decisions',
  },
  {
    id: 'buyingRole',
    label: 'Buying Role',
    type: 'select',
    path: 'buyingRole',
    editable: true,
    options: BUYING_ROLE_OPTIONS,
    helpText: 'Role in buying process',
  },
  {
    id: 'influenceLevel',
    label: 'Influence Level',
    type: 'select',
    path: 'influenceLevel',
    editable: true,
    options: INFLUENCE_LEVEL_OPTIONS,
  },
];

export const crmContactDecisionInputSet: InputSetConfig = {
  id: 'crm-contact-decision',
  name: 'CRM Contact Decision',
  label: 'Decision Making',
  description: 'Contact\'s role in purchasing decisions',
  fields: crmContactDecisionFields,
  columns: 3,
};

// ==========================================
// CRM CONTACT COMMUNICATION PREFERENCES
// ==========================================

export const crmContactPreferencesFields: FieldDefinition[] = [
  {
    id: 'preferredContactMethod',
    label: 'Preferred Contact Method',
    type: 'select',
    path: 'preferredContactMethod',
    editable: true,
    options: PREFERRED_CONTACT_METHOD_OPTIONS,
    defaultValue: 'email',
  },
  {
    id: 'bestTimeToContact',
    label: 'Best Time to Contact',
    type: 'text',
    path: 'bestTimeToContact',
    editable: true,
    placeholder: 'e.g., Morning (9-11 AM ET)',
  },
  {
    id: 'doNotCallBefore',
    label: 'Do Not Call Before',
    type: 'time',
    path: 'doNotCallBefore',
    editable: true,
  },
  {
    id: 'doNotCallAfter',
    label: 'Do Not Call After',
    type: 'time',
    path: 'doNotCallAfter',
    editable: true,
  },
];

export const crmContactPreferencesInputSet: InputSetConfig = {
  id: 'crm-contact-preferences',
  name: 'CRM Contact Preferences',
  label: 'Communication Preferences',
  description: 'Preferred contact methods and timing',
  fields: crmContactPreferencesFields,
  columns: 2,
};

// ==========================================
// CRM CONTACT EMAIL PREFERENCES
// ==========================================

export const crmContactEmailPrefsFields: FieldDefinition[] = [
  {
    id: 'marketingEmailsOptIn',
    label: 'Marketing Emails',
    type: 'boolean',
    path: 'preferences.marketingEmailsOptIn',
    editable: true,
    defaultValue: true,
    helpText: 'Opt in to marketing emails',
  },
  {
    id: 'newsletterOptIn',
    label: 'Newsletter',
    type: 'boolean',
    path: 'preferences.newsletterOptIn',
    editable: true,
    defaultValue: true,
    helpText: 'Opt in to newsletters',
  },
  {
    id: 'productUpdatesOptIn',
    label: 'Product Updates',
    type: 'boolean',
    path: 'preferences.productUpdatesOptIn',
    editable: true,
    defaultValue: true,
    helpText: 'Receive product update emails',
  },
  {
    id: 'doNotCall',
    label: 'Do Not Call',
    type: 'boolean',
    path: 'preferences.doNotCall',
    editable: true,
    defaultValue: false,
    helpText: 'Do not contact by phone',
  },
];

export const crmContactEmailPrefsInputSet: InputSetConfig = {
  id: 'crm-contact-email-prefs',
  name: 'CRM Contact Email Preferences',
  label: 'Email Preferences',
  description: 'Email opt-in and communication settings',
  fields: crmContactEmailPrefsFields,
  columns: 2,
};

// ==========================================
// CRM CONTACT SOCIAL LINKS
// ==========================================

export const crmContactSocialFields: FieldDefinition[] = [
  {
    id: 'linkedinUrl',
    label: 'LinkedIn',
    type: 'url',
    path: 'linkedinUrl',
    editable: true,
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    id: 'twitterUrl',
    label: 'Twitter/X',
    type: 'url',
    path: 'twitterUrl',
    editable: true,
    placeholder: 'https://twitter.com/username',
  },
  {
    id: 'githubUrl',
    label: 'GitHub',
    type: 'url',
    path: 'githubUrl',
    editable: true,
    placeholder: 'https://github.com/username',
  },
];

export const crmContactSocialInputSet: InputSetConfig = {
  id: 'crm-contact-social',
  name: 'CRM Contact Social',
  label: 'Social Links',
  description: 'Social media and professional profile links',
  fields: crmContactSocialFields,
  columns: 3,
};

// ==========================================
// CRM CONTACT NOTES
// ==========================================

export const crmContactNotesFields: FieldDefinition[] = [
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    path: 'notes',
    editable: true,
    placeholder: 'Add notes about this contact...',
    span: 2,
    config: { rows: 4 },
  },
  {
    id: 'internalNotes',
    label: 'Internal Notes',
    type: 'textarea',
    path: 'internalNotes',
    editable: true,
    placeholder: 'Internal notes (not visible to contact)',
    span: 2,
    config: { rows: 3 },
  },
  {
    id: 'tags',
    label: 'Tags',
    type: 'tags',
    path: 'tags',
    editable: true,
    span: 2,
    placeholder: 'Add tags...',
  },
];

export const crmContactNotesInputSet: InputSetConfig = {
  id: 'crm-contact-notes',
  name: 'CRM Contact Notes',
  label: 'Notes & Tags',
  description: 'Additional notes and tags for the contact',
  fields: crmContactNotesFields,
  columns: 2,
};

// ==========================================
// CRM CONTACT ENGAGEMENT
// ==========================================

export const crmContactEngagementFields: FieldDefinition[] = [
  {
    id: 'lastContactedAt',
    label: 'Last Contacted',
    type: 'datetime',
    path: 'lastContactedAt',
    readonly: true,
    config: { format: 'relative' },
  },
  {
    id: 'lastResponseAt',
    label: 'Last Response',
    type: 'datetime',
    path: 'lastResponseAt',
    readonly: true,
    config: { format: 'relative' },
  },
  {
    id: 'totalInteractions',
    label: 'Total Interactions',
    type: 'number',
    path: 'totalInteractions',
    readonly: true,
  },
  {
    id: 'engagementScore',
    label: 'Engagement Score',
    type: 'number',
    path: 'engagementScore',
    readonly: true,
    config: { suffix: '/100' },
  },
];

export const crmContactEngagementInputSet: InputSetConfig = {
  id: 'crm-contact-engagement',
  name: 'CRM Contact Engagement',
  label: 'Engagement Metrics',
  description: 'Contact engagement and interaction metrics',
  fields: crmContactEngagementFields,
  columns: 4,
};

// ==========================================
// FULL CRM CONTACT INPUTSET
// ==========================================

export const crmContactFullFields: FieldDefinition[] = [
  ...crmContactBasicFields,
  ...crmContactTypeFields,
  ...crmContactCompanyFields,
  ...crmContactDecisionFields,
  ...crmContactPreferencesFields,
  ...crmContactSocialFields,
  ...crmContactNotesFields,
];

export const crmContactFullInputSet: InputSetConfig = {
  id: 'crm-contact-full',
  name: 'Full CRM Contact',
  label: 'Contact Information',
  description: 'Complete CRM contact form with all fields',
  fields: crmContactFullFields,
  columns: 2,
};

// ==========================================
// QUICK ADD CONTACT INPUTSET
// ==========================================

export const crmContactQuickAddFields: FieldDefinition[] = [
  {
    id: 'firstName',
    label: 'First Name',
    type: 'text',
    path: 'firstName',
    required: true,
    editable: true,
  },
  {
    id: 'lastName',
    label: 'Last Name',
    type: 'text',
    path: 'lastName',
    required: true,
    editable: true,
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    path: 'email',
    editable: true,
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'phone',
    path: 'phone',
    editable: true,
  },
  {
    id: 'title',
    label: 'Title',
    type: 'text',
    path: 'title',
    editable: true,
  },
  {
    id: 'contactType',
    label: 'Type',
    type: 'select',
    path: 'contactType',
    required: true,
    editable: true,
    options: CONTACT_TYPE_OPTIONS,
    defaultValue: 'client_poc',
  },
];

export const crmContactQuickAddInputSet: InputSetConfig = {
  id: 'crm-contact-quick-add',
  name: 'Quick Add CRM Contact',
  label: 'Quick Add Contact',
  description: 'Minimal fields for quickly adding a contact',
  fields: crmContactQuickAddFields,
  columns: 2,
};
