/**
 * Deal Form Screen Definition
 *
 * Create/Edit deal form with:
 * - Deal information
 * - Value and probability
 * - Account/Contact linking
 * - Expected close date
 *
 * Routes:
 * - /employee/workspace/ta/deals/new (create)
 * - /employee/workspace/ta/deals/:id/edit (edit)
 */

import type { ScreenDefinition, SectionDefinition } from '@/lib/metadata/types/screen.types';
import type { FieldDefinition } from '@/lib/metadata/types/widget.types';
import {
  TA_DEAL_TYPE_OPTIONS,
  TA_DEAL_STAGE_OPTIONS,
} from '@/lib/metadata/options/ta-options';

// ==========================================
// DEAL FORM CONFIG
// ==========================================

export const dealFormConfig: {
  entityType: string;
  domain: string;
  sections: Array<{ id: string; title: string; icon: string; columns: number; fields: FieldDefinition[] }>;
} = {
  entityType: 'deal',
  domain: 'ta',

  sections: [
    // Deal Information
    {
      id: 'deal-info',
      title: 'Deal Information',
      icon: 'Handshake',
      columns: 2,
      fields: [
        {
          id: 'title',
          label: 'Deal Title',
          path: 'title',
          type: 'text',
          required: true,
          placeholder: 'Enter deal title',
        },
        {
          id: 'dealType',
          label: 'Deal Type',
          path: 'dealType',
          type: 'select',
          options: TA_DEAL_TYPE_OPTIONS,
          required: true,
        },
        {
          id: 'description',
          label: 'Description',
          path: 'description',
          type: 'textarea',
          config: { rows: 3 },
          placeholder: 'Describe the opportunity...',
          span: 2,
        },
      ],
    },

    // Account & Contact
    {
      id: 'account-contact',
      title: 'Account & Contact',
      icon: 'Building2',
      columns: 2,
      fields: [
        {
          id: 'accountId',
          label: 'Account',
          path: 'accountId',
          type: 'async-select',
          config: {
            procedure: 'ta.accounts.listForSelect',
            labelPath: 'name',
            valuePath: 'id',
            allowCreate: true,
            createModal: 'quick-create-account',
          },
          required: true,
        },
        {
          id: 'contactId',
          label: 'Primary Contact',
          path: 'contactId',
          type: 'async-select',
          config: {
            procedure: 'ta.contacts.listByAccount',
            labelPath: 'name',
            valuePath: 'id',
            dependsOn: 'accountId',
            allowCreate: true,
            createModal: 'quick-create-contact',
          },
        },
        {
          id: 'leadId',
          label: 'From Lead',
          path: 'leadId',
          type: 'async-select',
          config: {
            procedure: 'ta.leads.listForSelect',
            labelPath: 'name',
            valuePath: 'id',
          },
        },
      ],
    },

    // Value & Probability
    {
      id: 'value-probability',
      title: 'Value & Probability',
      icon: 'DollarSign',
      columns: 2,
      fields: [
        {
          id: 'value',
          label: 'Deal Value',
          path: 'value',
          type: 'currency',
          config: { prefix: '$' },
          required: true,
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
        {
          id: 'expectedCloseDate',
          label: 'Expected Close Date',
          path: 'expectedCloseDate',
          type: 'date',
          required: true,
        },
      ],
    },

    // Assignment
    {
      id: 'assignment',
      title: 'Assignment',
      icon: 'UserCheck',
      columns: 2,
      fields: [
        {
          id: 'ownerId',
          label: 'Deal Owner',
          path: 'ownerId',
          type: 'user-select',
          config: {
            procedure: 'users.listTASpecialists',
            currentUserDefault: true,
          },
          required: true,
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
          id: 'notes',
          label: 'Notes',
          path: 'notes',
          type: 'textarea',
          config: { rows: 4 },
          placeholder: 'Any additional notes...',
        },
      ],
    },
  ],
};

// ==========================================
// CREATE DEAL SCREEN
// ==========================================

export const dealCreateScreen: ScreenDefinition = {
  id: 'deal-create',
  type: 'detail',
  entityType: 'deal',
  title: 'Create New Deal',
  icon: 'Plus',

  layout: {
    type: 'single-column',
    sections: dealFormConfig.sections.map(section => ({
      id: section.id,
      type: 'form',
      title: section.title,
      icon: section.icon,
      columns: section.columns,
      fields: section.fields,
    })),
  },

  actions: [
    {
      id: 'create',
      type: 'mutation',
      label: 'Create Deal',
      icon: 'Plus',
      variant: 'primary',
      config: {
        type: 'mutation',
        procedure: 'ta.deals.create',
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/workspace/ta/deals/{id}',
        toast: 'Deal created successfully',
      },
    },
    {
      id: 'cancel',
      type: 'navigate',
      label: 'Cancel',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/ta/deals' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Deals', route: '/employee/workspace/ta/deals' },
      { label: 'New Deal' },
    ],
  },
};

// ==========================================
// EDIT DEAL SCREEN
// ==========================================

export const dealEditScreen: ScreenDefinition = {
  id: 'deal-edit',
  type: 'detail',
  entityType: 'deal',
  title: { template: 'Edit: {title}', fields: ['title'] },
  icon: 'Pencil',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.deals.getById',
      params: { id: { param: 'id' } },
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      ...dealFormConfig.sections.map(section => ({
        id: section.id,
        type: 'form' as const,
        title: section.title,
        icon: section.icon,
        columns: section.columns,
        fields: section.fields,
      })),
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
            label: 'Deal Stage',
            path: 'stage',
            type: 'select',
            options: TA_DEAL_STAGE_OPTIONS,
            required: true,
          },
        ],
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
        procedure: 'ta.deals.update',
        input: { id: { param: 'id' } },
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/workspace/ta/deals/{id}',
        toast: 'Deal updated successfully',
      },
    },
    {
      id: 'cancel',
      type: 'navigate',
      label: 'Cancel',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/ta/deals/{id}' },
    },
  ],

  navigation: {
    back: {
      label: 'Back to Deal',
      route: '/employee/workspace/ta/deals/{id}',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Deals', route: '/employee/workspace/ta/deals' },
      { label: { field: 'title' }, route: '/employee/workspace/ta/deals/{id}' },
      { label: 'Edit' },
    ],
  },
};

export default { dealCreateScreen, dealEditScreen, dealFormConfig };
