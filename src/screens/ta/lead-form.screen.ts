/**
 * Lead Form Screen Definition
 *
 * Create/Edit lead form with:
 * - Contact information
 * - Company details
 * - Source and campaign attribution
 * - Initial BANT qualification
 * - Estimated value
 *
 * Routes:
 * - /employee/workspace/ta/leads/new (create)
 * - /employee/workspace/ta/leads/:id/edit (edit)
 *
 * @see docs/specs/20-USER-ROLES/03-ta/05-generate-leads.md
 */

import type { ScreenDefinition, SectionDefinition } from '@/lib/metadata/types/screen.types';
import type { FieldDefinition } from '@/lib/metadata/types/widget.types';
import {
  TA_LEAD_STAGE_OPTIONS,
  BANT_BUDGET_OPTIONS,
  BANT_AUTHORITY_OPTIONS,
  BANT_NEED_OPTIONS,
  BANT_TIMELINE_OPTIONS,
} from '@/lib/metadata/options/ta-options';
import {
  LEAD_TYPE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// LEAD FORM CONFIG
// ==========================================

export const leadFormConfig: {
  entityType: string;
  domain: string;
  sections: Array<{ id: string; title: string; icon: string; columns: number; fields: FieldDefinition[]; description?: string; collapsible?: boolean; collapsed?: boolean }>;
} = {
  entityType: 'lead',
  domain: 'ta',

  // Form sections
  sections: [
    // Contact Information
    {
      id: 'contact-info',
      title: 'Contact Information',
      icon: 'User',
      columns: 2,
      fields: [
        {
          id: 'leadType',
          label: 'Lead Type',
          path: 'leadType',
          type: 'select',
          options: LEAD_TYPE_OPTIONS,
          required: true,
          defaultValue: 'person',
        },
        {
          id: 'name',
          label: 'Full Name',
          path: 'name',
          type: 'text',
          required: true,
          placeholder: 'Enter full name',
        },
        {
          id: 'email',
          label: 'Email',
          path: 'email',
          type: 'email',
          required: true,
          placeholder: 'email@company.com',
        },
        {
          id: 'phone',
          label: 'Phone',
          path: 'phone',
          type: 'phone',
          placeholder: '+1 (555) 000-0000',
        },
        {
          id: 'title',
          label: 'Job Title',
          path: 'title',
          type: 'text',
          placeholder: 'e.g., VP of Engineering',
        },
        {
          id: 'linkedinUrl',
          label: 'LinkedIn URL',
          path: 'linkedinUrl',
          type: 'url',
          placeholder: 'https://linkedin.com/in/...',
        },
      ],
    },

    // Company Information
    {
      id: 'company-info',
      title: 'Company Information',
      icon: 'Building2',
      columns: 2,
      fields: [
        {
          id: 'company',
          label: 'Company Name',
          path: 'company',
          type: 'text',
          required: true,
          placeholder: 'Enter company name',
        },
        {
          id: 'industry',
          label: 'Industry',
          path: 'industry',
          type: 'select',
          options: INDUSTRY_OPTIONS,
        },
        {
          id: 'companySize',
          label: 'Company Size',
          path: 'companySize',
          type: 'select',
          options: COMPANY_SIZE_OPTIONS,
        },
        {
          id: 'website',
          label: 'Website',
          path: 'website',
          type: 'url',
          placeholder: 'https://company.com',
        },
        {
          id: 'location',
          label: 'Location',
          path: 'location',
          type: 'text',
          placeholder: 'City, State',
        },
      ],
    },

    // Source & Attribution
    {
      id: 'source-attribution',
      title: 'Source & Attribution',
      icon: 'Tag',
      columns: 2,
      fields: [
        {
          id: 'leadSource',
          label: 'Lead Source',
          path: 'leadSource',
          type: 'select',
          options: LEAD_SOURCE_OPTIONS,
          required: true,
        },
        {
          id: 'campaignId',
          label: 'Campaign',
          path: 'campaignId',
          type: 'async-select',
          config: {
            procedure: 'ta.campaigns.listForSelect',
            labelPath: 'name',
            valuePath: 'id',
          },
        },
        {
          id: 'referredBy',
          label: 'Referred By',
          path: 'referredBy',
          type: 'text',
          placeholder: 'Name of referrer',
          visible: { field: 'leadSource', operator: 'eq', value: 'referral' },
        },
        {
          id: 'ownerId',
          label: 'Assign To',
          path: 'ownerId',
          type: 'user-select',
          config: {
            procedure: 'users.listTASpecialists',
            currentUserDefault: true,
          },
        },
      ],
    },

    // Initial Value Estimate
    {
      id: 'value-estimate',
      title: 'Value Estimate',
      icon: 'DollarSign',
      columns: 2,
      fields: [
        {
          id: 'estimatedValue',
          label: 'Estimated Value',
          path: 'estimatedValue',
          type: 'currency',
          config: { prefix: '$' },
          placeholder: '0.00',
        },
        {
          id: 'probability',
          label: 'Probability (%)',
          path: 'probability',
          type: 'number',
          config: { min: 0, max: 100, suffix: '%' },
          defaultValue: 10,
        },
      ],
    },

    // Initial BANT (Optional)
    {
      id: 'initial-bant',
      title: 'Initial Qualification (Optional)',
      icon: 'ClipboardCheck',
      description: 'Complete BANT qualification during the discovery process',
      columns: 2,
      collapsible: true,
      collapsed: true,
      fields: [
        {
          id: 'bantBudget',
          label: 'Budget',
          path: 'bantBudget',
          type: 'select',
          options: BANT_BUDGET_OPTIONS,
          defaultValue: 'unknown',
        },
        {
          id: 'bantAuthority',
          label: 'Authority',
          path: 'bantAuthority',
          type: 'select',
          options: BANT_AUTHORITY_OPTIONS,
          defaultValue: 'unknown',
        },
        {
          id: 'bantNeed',
          label: 'Need',
          path: 'bantNeed',
          type: 'select',
          options: BANT_NEED_OPTIONS,
          defaultValue: 'unknown',
        },
        {
          id: 'bantTimeline',
          label: 'Timeline',
          path: 'bantTimeline',
          type: 'select',
          options: BANT_TIMELINE_OPTIONS,
          defaultValue: 'unknown',
        },
      ],
    },

    // Notes
    {
      id: 'notes-section',
      title: 'Additional Notes',
      icon: 'FileText',
      columns: 1,
      fields: [
        {
          id: 'description',
          label: 'Notes',
          path: 'description',
          type: 'textarea',
          config: { rows: 4 },
          placeholder: 'Any additional notes about this lead...',
        },
      ],
    },
  ],
};

// ==========================================
// CREATE LEAD SCREEN
// ==========================================

export const leadCreateScreen: ScreenDefinition = {
  id: 'lead-create',
  type: 'wizard',
  entityType: 'lead',
  title: 'Create New Lead',
  icon: 'UserPlus',

  steps: [
    {
      id: 'contact',
      title: 'Contact Info',
      description: 'Basic contact information',
      icon: 'User',
      sections: [
        {
          id: 'contact-info',
          type: 'form',
          columns: 2,
          fields: leadFormConfig.sections[0].fields,
        },
      ],
      validation: {
        required: ['name', 'email', 'leadType'],
      },
    },
    {
      id: 'company',
      title: 'Company',
      description: 'Company details',
      icon: 'Building2',
      sections: [
        {
          id: 'company-info',
          type: 'form',
          columns: 2,
          fields: leadFormConfig.sections[1].fields,
        },
      ],
      validation: {
        required: ['company'],
      },
    },
    {
      id: 'source',
      title: 'Source',
      description: 'Lead source and assignment',
      icon: 'Tag',
      sections: [
        {
          id: 'source-attribution',
          type: 'form',
          columns: 2,
          fields: leadFormConfig.sections[2].fields,
        },
      ],
      validation: {
        required: ['leadSource'],
      },
    },
    {
      id: 'value',
      title: 'Value & Notes',
      description: 'Estimated value and notes',
      icon: 'DollarSign',
      sections: [
        {
          id: 'value-estimate',
          type: 'form',
          columns: 2,
          fields: leadFormConfig.sections[3].fields,
        },
        {
          id: 'notes-section',
          type: 'form',
          columns: 1,
          fields: leadFormConfig.sections[5].fields,
        },
      ],
    },
  ],

  navigation: {
    showProgress: true,
    showStepNumbers: true,
    allowSkip: false,
    saveDraft: true,
  },

  onComplete: {
    action: 'create',
    entityType: 'lead',
    successRedirect: '/employee/workspace/ta/leads/{id}',
    successMessage: 'Lead created successfully',
    handler: 'ta.leads.create',
  },

  actions: [
    {
      id: 'cancel',
      type: 'navigate',
      label: 'Cancel',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/ta/leads' },
    },
  ],

  breadcrumbs: [
    { label: 'Workspace', route: '/employee/workspace' },
    { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
    { label: 'Leads', route: '/employee/workspace/ta/leads' },
    { label: 'New Lead' },
  ],
};

// ==========================================
// EDIT LEAD SCREEN
// ==========================================

export const leadEditScreen: ScreenDefinition = {
  id: 'lead-edit',
  type: 'detail',
  entityType: 'lead',
  title: { template: 'Edit: {name}', fields: ['name'] },
  icon: 'Pencil',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.leads.getById',
      params: { id: { param: 'id' } },
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Contact Information
      {
        id: 'contact-info',
        type: 'form',
        title: 'Contact Information',
        icon: 'User',
        columns: 2,
        fields: leadFormConfig.sections[0].fields,
      },

      // Company Information
      {
        id: 'company-info',
        type: 'form',
        title: 'Company Information',
        icon: 'Building2',
        columns: 2,
        fields: leadFormConfig.sections[1].fields,
      },

      // Source & Attribution
      {
        id: 'source-attribution',
        type: 'form',
        title: 'Source & Attribution',
        icon: 'Tag',
        columns: 2,
        fields: leadFormConfig.sections[2].fields,
      },

      // Stage (edit only)
      {
        id: 'stage-section',
        type: 'form',
        title: 'Stage',
        icon: 'GitBranch',
        columns: 2,
        fields: [
          {
            id: 'stage',
            label: 'Lead Stage',
            path: 'stage',
            type: 'select',
            options: TA_LEAD_STAGE_OPTIONS,
            required: true,
          },
        ],
      },

      // Value Estimate
      {
        id: 'value-estimate',
        type: 'form',
        title: 'Value Estimate',
        icon: 'DollarSign',
        columns: 2,
        fields: leadFormConfig.sections[3].fields,
      },

      // BANT Qualification
      {
        id: 'bant-qualification',
        type: 'form',
        title: 'BANT Qualification',
        icon: 'ClipboardCheck',
        columns: 2,
        collapsible: true,
        fields: leadFormConfig.sections[4].fields,
      },

      // Notes
      {
        id: 'notes-section',
        type: 'form',
        title: 'Additional Notes',
        icon: 'FileText',
        columns: 1,
        fields: leadFormConfig.sections[5].fields,
      },
    ],
  },

  actions: [
    {
      id: 'save',
      type: 'mutation',
      label: 'Save Changes',
      icon: 'Save',
      variant: 'primary',
      config: {
        type: 'mutation',
        procedure: 'ta.leads.update',
        input: { id: { param: 'id' } },
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/workspace/ta/leads/{id}',
        toast: 'Lead updated successfully',
      },
    },
    {
      id: 'cancel',
      type: 'navigate',
      label: 'Cancel',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/ta/leads/{id}' },
    },
  ],

  navigation: {
    back: {
      label: 'Back to Lead',
      route: '/employee/workspace/ta/leads/{id}',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Leads', route: '/employee/workspace/ta/leads' },
      { label: { field: 'name' }, route: '/employee/workspace/ta/leads/{id}' },
      { label: 'Edit' },
    ],
  },
};

export default { leadCreateScreen, leadEditScreen, leadFormConfig };
