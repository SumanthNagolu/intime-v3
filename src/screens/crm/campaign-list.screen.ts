/**
 * Campaign List Screen Definition
 *
 * Metadata-driven screen for listing Campaigns with filtering and metrics.
 * Uses the createListScreen factory for standardized list patterns.
 */

import { createListScreen } from '@/lib/metadata/factories';
import type { ListTemplateConfig } from '@/lib/metadata/templates';
import {
  CAMPAIGN_TYPE_OPTIONS,
  CAMPAIGN_STATUS_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// CAMPAIGN LIST SCREEN CONFIG
// ==========================================

const campaignListConfig: ListTemplateConfig = {
  entityId: 'campaign',
  entityName: 'Campaign',
  entityNamePlural: 'Campaigns',
  basePath: '/employee/crm/campaigns',

  // Data source
  dataSource: {
    listProcedure: 'crm.campaigns.list',
    statsProcedure: 'crm.campaigns.getStats',
  },

  // Metrics displayed above the table
  metrics: [
    {
      id: 'total',
      label: 'Total Campaigns',
      path: 'total',
      fieldType: 'number',
    },
    {
      id: 'active',
      label: 'Active',
      path: 'active',
      fieldType: 'number',
    },
    {
      id: 'draft',
      label: 'Draft',
      path: 'byStatus.draft',
      fieldType: 'number',
    },
    {
      id: 'scheduled',
      label: 'Scheduled',
      path: 'byStatus.scheduled',
      fieldType: 'number',
    },
    {
      id: 'totalBudget',
      label: 'Total Budget',
      path: 'totalBudget',
      fieldType: 'currency',
      config: { prefix: '$', format: 'compact' },
    },
    {
      id: 'activeBudget',
      label: 'Active Budget',
      path: 'activeBudget',
      fieldType: 'currency',
      config: { prefix: '$', format: 'compact' },
    },
  ],

  // Table columns
  columns: [
    {
      id: 'name',
      label: 'Campaign',
      path: 'name',
      type: 'text',
      sortable: true,
      width: '250px',
    },
    {
      id: 'campaignType',
      label: 'Type',
      path: 'campaignType',
      type: 'enum',
      sortable: true,
      config: {
        options: CAMPAIGN_TYPE_OPTIONS,
        badgeColors: {
          email: 'blue',
          linkedin: 'cyan',
          event: 'purple',
          webinar: 'green',
          content: 'amber',
          outbound_call: 'red',
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
        options: CAMPAIGN_STATUS_OPTIONS,
        badgeColors: {
          draft: 'gray',
          scheduled: 'blue',
          active: 'green',
          paused: 'amber',
          completed: 'purple',
          cancelled: 'red',
        },
      },
    },
    {
      id: 'startDate',
      label: 'Start Date',
      path: 'startDate',
      type: 'date',
      sortable: true,
      config: { format: 'medium' },
    },
    {
      id: 'endDate',
      label: 'End Date',
      path: 'endDate',
      type: 'date',
      sortable: true,
      config: { format: 'medium' },
    },
    {
      id: 'budget',
      label: 'Budget',
      path: 'budget',
      type: 'currency',
      config: { prefix: '$' },
    },
    {
      id: 'goalLeads',
      label: 'Lead Goal',
      path: 'goalLeads',
      type: 'number',
    },
    {
      id: 'ownerName',
      label: 'Owner',
      path: 'ownerName',
      type: 'text',
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
      id: 'status',
      label: 'Status',
      type: 'multi-select',
      options: CAMPAIGN_STATUS_OPTIONS,
    },
    {
      id: 'campaignType',
      label: 'Campaign Type',
      type: 'multi-select',
      options: CAMPAIGN_TYPE_OPTIONS,
    },
    {
      id: 'dateRange',
      label: 'Date Range',
      type: 'date-range',
    },
  ],

  // Search configuration
  search: {
    placeholder: 'Search campaigns by name...',
    fields: ['name', 'description'],
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
      label: 'New Campaign',
      variant: 'primary',
      icon: 'Plus',
      actionType: 'navigate',
      route: '/employee/crm/campaigns/new',
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
      id: 'launch',
      label: 'Launch',
      icon: 'Play',
      actionType: 'mutation',
      mutation: 'crm.campaigns.launch',
      showWhen: { field: 'status', operator: 'in', value: ['draft', 'scheduled', 'paused'] },
    },
    {
      id: 'pause',
      label: 'Pause',
      icon: 'Pause',
      actionType: 'mutation',
      mutation: 'crm.campaigns.pause',
      showWhen: { field: 'status', operator: 'eq', value: 'active' },
    },
    {
      id: 'complete',
      label: 'Complete',
      icon: 'CheckCircle',
      actionType: 'mutation',
      mutation: 'crm.campaigns.complete',
      showWhen: { field: 'status', operator: 'in', value: ['active', 'paused'] },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'Trash',
      variant: 'destructive',
      actionType: 'mutation',
      mutation: 'crm.campaigns.delete',
      confirm: {
        title: 'Delete Campaign',
        message: 'Are you sure you want to delete this campaign? This action cannot be undone.',
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Campaigns' },
    ],
  },
};

// ==========================================
// GENERATE SCREEN
// ==========================================

export const campaignListScreen = createListScreen(campaignListConfig);

export default campaignListScreen;
