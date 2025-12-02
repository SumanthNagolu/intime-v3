/**
 * Deal List Screen Definition
 *
 * Metadata-driven screen for listing Deals with pipeline view and filtering.
 * Uses the createListScreen factory for standardized list patterns.
 */

import { createListScreen } from '@/lib/metadata/factories';
import type { ListTemplateConfig } from '@/lib/metadata/templates';
import {
  DEAL_TYPE_OPTIONS,
  DEAL_STAGE_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// DEAL LIST SCREEN CONFIG
// ==========================================

const dealListConfig: ListTemplateConfig = {
  entityId: 'deal',
  entityName: 'Deal',
  entityNamePlural: 'Deals',
  basePath: '/employee/crm/deals',

  // Data source
  dataSource: {
    listProcedure: 'crm.deals.listAll',
    statsProcedure: 'crm.deals.getStats',
  },

  // Metrics displayed above the table
  metrics: [
    {
      id: 'pipelineValue',
      label: 'Pipeline Value',
      path: 'pipelineValue',
      fieldType: 'currency',
      config: { prefix: '$', format: 'compact' },
    },
    {
      id: 'active',
      label: 'Active Deals',
      path: 'active',
      fieldType: 'number',
    },
    {
      id: 'discovery',
      label: 'Discovery',
      path: 'discovery',
      fieldType: 'number',
    },
    {
      id: 'proposal',
      label: 'Proposal',
      path: 'proposal',
      fieldType: 'number',
    },
    {
      id: 'negotiation',
      label: 'Negotiation',
      path: 'negotiation',
      fieldType: 'number',
    },
    {
      id: 'wonValue',
      label: 'Won Value',
      path: 'wonValue',
      fieldType: 'currency',
      config: { prefix: '$', format: 'compact' },
    },
  ],

  // Table columns
  columns: [
    {
      id: 'title',
      label: 'Deal',
      path: 'title',
      type: 'text',
      sortable: true,
      width: '250px',
    },
    {
      id: 'accountName',
      label: 'Account',
      path: 'accountName',
      type: 'text',
      sortable: true,
    },
    {
      id: 'value',
      label: 'Value',
      path: 'value',
      type: 'currency',
      sortable: true,
      config: { prefix: '$' },
    },
    {
      id: 'stage',
      label: 'Stage',
      path: 'stage',
      type: 'enum',
      sortable: true,
      config: {
        options: DEAL_STAGE_OPTIONS,
        badgeColors: {
          discovery: 'blue',
          qualification: 'cyan',
          proposal: 'amber',
          negotiation: 'orange',
          closed_won: 'green',
          closed_lost: 'red',
        },
      },
    },
    {
      id: 'probability',
      label: 'Probability',
      path: 'probability',
      type: 'number',
      config: { suffix: '%' },
    },
    {
      id: 'dealType',
      label: 'Type',
      path: 'dealType',
      type: 'enum',
      config: {
        options: DEAL_TYPE_OPTIONS,
        badgeColors: {
          new_business: 'blue',
          expansion: 'green',
          renewal: 'purple',
          upsell: 'amber',
        },
      },
    },
    {
      id: 'ownerName',
      label: 'Owner',
      path: 'ownerName',
      type: 'text',
    },
    {
      id: 'expectedCloseDate',
      label: 'Expected Close',
      path: 'expectedCloseDate',
      type: 'date',
      sortable: true,
      config: { format: 'short' },
    },
    {
      id: 'createdAt',
      label: 'Created',
      path: 'createdAt',
      type: 'date',
      sortable: true,
      config: { format: 'relative' },
    },
  ],

  // Filter configuration
  filters: [
    {
      id: 'stage',
      label: 'Stage',
      type: 'multi-select',
      options: DEAL_STAGE_OPTIONS,
    },
    {
      id: 'dealType',
      label: 'Deal Type',
      type: 'multi-select',
      options: DEAL_TYPE_OPTIONS,
    },
    {
      id: 'minValue',
      label: 'Min Value',
      type: 'number',
      config: { prefix: '$' },
    },
    {
      id: 'maxValue',
      label: 'Max Value',
      type: 'number',
      config: { prefix: '$' },
    },
    {
      id: 'expectedCloseFrom',
      label: 'Close From',
      type: 'date',
    },
    {
      id: 'expectedCloseTo',
      label: 'Close To',
      type: 'date',
    },
  ],

  // Search configuration
  search: {
    placeholder: 'Search deals by title, account...',
    fields: ['title', 'description', 'accountName'],
  },

  // Sort defaults
  defaultSort: {
    field: 'expectedCloseDate',
    direction: 'asc',
  },

  // View modes
  viewModes: ['table', 'pipeline'],
  defaultViewMode: 'pipeline',

  // Header actions
  headerActions: [
    {
      id: 'create',
      label: 'New Deal',
      variant: 'primary',
      icon: 'Plus',
      actionType: 'navigate',
      route: '/employee/crm/deals/new',
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
      id: 'updateStage',
      label: 'Update Stage',
      icon: 'ArrowRight',
      actionType: 'custom',
      handler: 'handleUpdateStage',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'Trash',
      variant: 'destructive',
      actionType: 'mutation',
      mutation: 'crm.deals.delete',
      confirm: {
        title: 'Delete Deal',
        message: 'Are you sure you want to delete this deal? This action cannot be undone.',
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Deals' },
    ],
  },
};

// ==========================================
// GENERATE SCREEN
// ==========================================

export const dealListScreen = createListScreen(dealListConfig);

export default dealListScreen;
