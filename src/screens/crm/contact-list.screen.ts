/**
 * Contact List Screen Definition
 *
 * Metadata-driven screen for listing Contacts with filtering and actions.
 * Uses the createListScreen factory for standardized list patterns.
 */

import { createListScreen } from '@/lib/metadata/factories';
import type { ListTemplateConfig } from '@/lib/metadata/templates';
import {
  CONTACT_TYPE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
  DECISION_AUTHORITY_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// CONTACT LIST SCREEN CONFIG
// ==========================================

const contactListConfig: ListTemplateConfig = {
  entityId: 'contact',
  entityName: 'Contact',
  entityNamePlural: 'Contacts',
  basePath: '/employee/crm/contacts',

  // Data source
  dataSource: {
    listProcedure: 'crm.contacts.listAll',
    statsProcedure: 'crm.contacts.getStats',
  },

  // Metrics displayed above the table
  metrics: [
    {
      id: 'total',
      label: 'Total Contacts',
      path: 'total',
      fieldType: 'number',
    },
    {
      id: 'active',
      label: 'Active',
      path: 'byStatus.active',
      fieldType: 'number',
    },
    {
      id: 'clientPocs',
      label: 'Client POCs',
      path: 'byType.client_poc',
      fieldType: 'number',
    },
    {
      id: 'decisionMakers',
      label: 'Decision Makers',
      path: 'decisionMakers',
      fieldType: 'number',
    },
    {
      id: 'newThisMonth',
      label: 'New This Month',
      path: 'newThisMonth',
      fieldType: 'number',
    },
  ],

  // Table columns
  columns: [
    {
      id: 'name',
      label: 'Name',
      path: 'firstName',
      type: 'composite',
      sortable: true,
      width: '200px',
      config: {
        template: '{{firstName}} {{lastName}}',
        fields: ['firstName', 'lastName'],
      },
    },
    {
      id: 'email',
      label: 'Email',
      path: 'email',
      type: 'email',
      sortable: true,
    },
    {
      id: 'title',
      label: 'Title',
      path: 'title',
      type: 'text',
    },
    {
      id: 'company',
      label: 'Company',
      path: 'accountName',
      type: 'text',
      sortable: true,
    },
    {
      id: 'contactType',
      label: 'Type',
      path: 'contactType',
      type: 'enum',
      sortable: true,
      config: {
        options: CONTACT_TYPE_OPTIONS,
        badgeColors: {
          client_poc: 'blue',
          candidate: 'green',
          vendor: 'orange',
          partner: 'purple',
          internal: 'gray',
          general: 'default',
        },
      },
    },
    {
      id: 'status',
      label: 'Status',
      path: 'status',
      type: 'enum',
      sortable: true,
      config: {
        options: CONTACT_STATUS_OPTIONS,
        badgeColors: {
          active: 'green',
          inactive: 'gray',
          do_not_contact: 'red',
          bounced: 'orange',
          unsubscribed: 'yellow',
        },
      },
    },
    {
      id: 'decisionAuthority',
      label: 'Decision Role',
      path: 'decisionAuthority',
      type: 'enum',
      config: {
        options: DECISION_AUTHORITY_OPTIONS,
        badgeColors: {
          final_decision_maker: 'purple',
          key_influencer: 'blue',
          gatekeeper: 'orange',
          recommender: 'green',
          end_user: 'gray',
        },
      },
    },
    {
      id: 'phone',
      label: 'Phone',
      path: 'phone',
      type: 'phone',
    },
    {
      id: 'lastContactedAt',
      label: 'Last Contacted',
      path: 'lastContactedAt',
      type: 'date',
      sortable: true,
      config: { format: 'relative' },
    },
    {
      id: 'createdAt',
      label: 'Created',
      path: 'createdAt',
      type: 'date',
      sortable: true,
      config: { format: 'short' },
    },
  ],

  // Filter configuration
  filters: [
    {
      id: 'contactType',
      label: 'Contact Type',
      type: 'multi-select',
      options: CONTACT_TYPE_OPTIONS,
    },
    {
      id: 'status',
      label: 'Status',
      type: 'multi-select',
      options: CONTACT_STATUS_OPTIONS,
    },
    {
      id: 'decisionAuthority',
      label: 'Decision Role',
      type: 'multi-select',
      options: DECISION_AUTHORITY_OPTIONS,
    },
    {
      id: 'hasEmail',
      label: 'Has Email',
      type: 'boolean',
    },
  ],

  // Search configuration
  search: {
    placeholder: 'Search contacts by name, email, company...',
    fields: ['firstName', 'lastName', 'email', 'companyName', 'title'],
  },

  // Sort defaults
  defaultSort: {
    field: 'createdAt',
    direction: 'desc',
  },

  // Header actions
  headerActions: [
    {
      id: 'create',
      label: 'New Contact',
      variant: 'primary',
      icon: 'Plus',
      actionType: 'navigate',
      route: '/employee/crm/contacts/new',
    },
    {
      id: 'import',
      label: 'Import',
      variant: 'secondary',
      icon: 'Upload',
      actionType: 'custom',
      handler: 'handleImport',
    },
    {
      id: 'export',
      label: 'Export',
      variant: 'secondary',
      icon: 'Download',
      actionType: 'custom',
      handler: 'handleExport',
    },
  ],

  // Row actions
  rowActions: [
    {
      id: 'view',
      label: 'View',
      icon: 'Eye',
      actionType: 'navigate',
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: 'Pencil',
      actionType: 'navigate',
    },
    {
      id: 'email',
      label: 'Send Email',
      icon: 'Mail',
      actionType: 'custom',
      handler: 'handleSendEmail',
    },
    {
      id: 'call',
      label: 'Log Call',
      icon: 'Phone',
      actionType: 'custom',
      handler: 'handleLogCall',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'Trash',
      variant: 'destructive',
      actionType: 'mutation',
      mutation: 'crm.contacts.delete',
      confirm: {
        title: 'Delete Contact',
        message: 'Are you sure you want to delete this contact? This action cannot be undone.',
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Contacts' },
    ],
  },
};

// ==========================================
// GENERATE SCREEN
// ==========================================

export const contactListScreen = createListScreen(contactListConfig);

export default contactListScreen;
