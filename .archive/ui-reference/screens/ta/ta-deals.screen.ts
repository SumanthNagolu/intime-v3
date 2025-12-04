/**
 * TA Deals Screen Definition
 *
 * Deal pipeline management for Talent Acquisition with:
 * - Pipeline/Kanban view by stage
 * - Table view with filtering
 * - Value and probability tracking
 * - Quick stage progression
 *
 * Routes: /employee/workspace/ta/deals
 *
 * @see docs/specs/20-USER-ROLES/03-ta/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import {
  TA_DEAL_TYPE_OPTIONS,
  TA_DEAL_STAGE_OPTIONS,
} from '@/lib/metadata/options/ta-options';
import { INDUSTRY_OPTIONS } from '@/lib/metadata/options/crm-options';

// ==========================================
// TABLE COLUMNS
// ==========================================

const dealTableColumns = [
  {
    id: 'title',
    header: 'Deal',
    accessor: 'title',
    type: 'composite',
    sortable: true,
    width: '250px',
    config: {
      primary: { path: 'title' },
      secondary: { path: 'accountName' },
    },
  },
  {
    id: 'value',
    header: 'Value',
    accessor: 'value',
    type: 'currency',
    sortable: true,
    config: { prefix: '$' },
  },
  {
    id: 'stage',
    header: 'Stage',
    accessor: 'stage',
    type: 'enum',
    sortable: true,
    config: {
      options: TA_DEAL_STAGE_OPTIONS,
      badgeColors: {
        qualification: 'blue',
        discovery: 'cyan',
        proposal: 'amber',
        negotiation: 'orange',
        closed_won: 'green',
        closed_lost: 'red',
      },
    },
  },
  {
    id: 'dealType',
    header: 'Type',
    accessor: 'dealType',
    type: 'enum',
    config: {
      options: TA_DEAL_TYPE_OPTIONS,
    },
  },
  {
    id: 'probability',
    header: 'Prob.',
    accessor: 'probability',
    type: 'number',
    sortable: true,
    config: { suffix: '%' },
  },
  {
    id: 'weightedValue',
    header: 'Weighted',
    accessor: 'weightedValue',
    type: 'currency',
    sortable: true,
    config: { prefix: '$' },
  },
  {
    id: 'expectedCloseDate',
    header: 'Expected Close',
    accessor: 'expectedCloseDate',
    type: 'date',
    sortable: true,
    config: { format: 'short' },
  },
  {
    id: 'owner',
    header: 'Owner',
    accessor: 'ownerName',
    type: 'text',
  },
  {
    id: 'lastActivity',
    header: 'Last Activity',
    accessor: 'lastActivityAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// PIPELINE CONFIGURATION
// ==========================================

const pipelineConfig = {
  stages: TA_DEAL_STAGE_OPTIONS.filter(s => !['closed_won', 'closed_lost'].includes(s.value)),
  closedStages: ['closed_won', 'closed_lost'],
  cardConfig: {
    titlePath: 'title',
    subtitlePath: 'accountName',
    valuePath: 'value',
    valueFormat: 'currency',
    badges: [
      { path: 'dealType', type: 'enum', options: TA_DEAL_TYPE_OPTIONS },
    ],
    metrics: [
      { label: 'Prob.', path: 'probability', format: 'percentage' },
      { label: 'Weighted', path: 'weightedValue', format: 'currency' },
    ],
    footer: {
      leftPath: 'expectedCloseDate',
      leftFormat: 'date',
      leftLabel: 'Close:',
      rightPath: 'ownerName',
    },
    progressBar: {
      valuePath: 'probability',
      maxValue: 100,
    },
  },
  onDragEnd: {
    mutation: 'ta.deals.updateStage',
    inputMapping: {
      dealId: 'id',
      stage: 'newStage',
    },
  },
  aggregation: {
    showTotal: true,
    showCount: true,
    valueField: 'value',
    weightedValueField: 'weightedValue',
  },
};

// ==========================================
// TA DEALS SCREEN
// ==========================================

export const taDealsScreen: ScreenDefinition = {
  id: 'ta-deals',
  type: 'list',
  entityType: 'deal',
  title: 'Deal Pipeline',
  subtitle: 'Manage your sales pipeline and opportunities',
  icon: 'TrendingUp',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.deals.list',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Pipeline Metrics
      {
        id: 'pipeline-metrics',
        type: 'metrics-grid',
        columns: 5,
        widgets: [
          {
            id: 'pipeline-value',
            type: 'metric',
            label: 'Pipeline Value',
            path: 'stats.pipelineValue',
            config: {
              icon: 'DollarSign',
              format: 'currency',
              prefix: '$',
            },
          },
          {
            id: 'weighted-value',
            type: 'metric',
            label: 'Weighted Value',
            path: 'stats.weightedValue',
            config: {
              icon: 'Scale',
              format: 'currency',
              prefix: '$',
            },
          },
          {
            id: 'active-deals',
            type: 'metric',
            label: 'Active Deals',
            path: 'stats.activeCount',
            config: { icon: 'Briefcase' },
          },
          {
            id: 'won-this-month',
            type: 'metric',
            label: 'Won (MTD)',
            path: 'stats.wonMTD',
            config: {
              icon: 'Trophy',
              format: 'currency',
              prefix: '$',
              variant: 'success',
            },
          },
          {
            id: 'avg-deal-size',
            type: 'metric',
            label: 'Avg Deal Size',
            path: 'stats.avgDealSize',
            config: {
              icon: 'BarChart',
              format: 'currency',
              prefix: '$',
            },
          },
        ],
      },

      // Stage Summary
      {
        id: 'stage-summary',
        type: 'custom',
        component: 'PipelineStageSummary',
        componentProps: {
          stages: TA_DEAL_STAGE_OPTIONS,
          dataPath: 'stats.byStage',
          valueField: 'value',
          countField: 'count',
        },
      },

      // Filters Section
      {
        id: 'filters',
        type: 'field-grid',
        inline: true,
        columns: 5,
        fields: [
          {
            id: 'search',
            type: 'search',
            placeholder: 'Search deals...',
            config: { fields: ['title', 'accountName'] },
          },
          {
            id: 'stage',
            type: 'multi-select',
            label: 'Stage',
            options: TA_DEAL_STAGE_OPTIONS,
          },
          {
            id: 'dealType',
            type: 'multi-select',
            label: 'Deal Type',
            options: TA_DEAL_TYPE_OPTIONS,
          },
          {
            id: 'minValue',
            type: 'currency',
            label: 'Min Value',
            config: { prefix: '$' },
          },
          {
            id: 'closeDate',
            type: 'date-range',
            label: 'Expected Close',
          },
        ],
      },

      // View Toggle & Pipeline/Table
      {
        id: 'deals-view',
        type: 'custom',
        component: 'ViewToggleContainer',
        componentProps: {
          views: ['pipeline', 'table'],
          defaultView: 'pipeline',
          pipelineConfig,
          tableConfig: {
            columns: dealTableColumns,
            selectable: true,
            rowClick: {
              type: 'navigate',
              route: { field: 'id', template: '/employee/workspace/ta/deals/{id}' },
            },
          },
        },
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'create-deal',
      type: 'navigate',
      label: 'New Deal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/ta/deals/new' },
    },
    {
      id: 'export-deals',
      type: 'custom',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportDeals' },
    },
  ],

  // Bulk Actions
  bulkActions: [
    {
      id: 'bulk-assign',
      type: 'modal',
      label: 'Assign Owner',
      icon: 'UserCheck',
      config: { type: 'modal', modal: 'bulk-assign-owner' },
    },
    {
      id: 'bulk-stage',
      type: 'modal',
      label: 'Update Stage',
      icon: 'ArrowRight',
      config: { type: 'modal', modal: 'bulk-update-stage' },
    },
    {
      id: 'bulk-delete',
      type: 'mutation',
      label: 'Delete',
      icon: 'Trash',
      variant: 'destructive',
      config: { type: 'mutation', procedure: 'ta.deals.bulkDelete' },
      confirm: {
        title: 'Delete Selected Deals',
        message: 'Are you sure you want to delete the selected deals? This action cannot be undone.',
        destructive: true,
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Deals' },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'n', action: 'create-deal', description: 'Create new deal' },
    { key: 'p', action: 'toggle-pipeline', description: 'Toggle pipeline view' },
    { key: 't', action: 'toggle-table', description: 'Toggle table view' },
    { key: '/', action: 'focus-search', description: 'Focus search' },
  ],
};

export default taDealsScreen;
