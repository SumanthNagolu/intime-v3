/**
 * TA Campaigns Screen Definition
 *
 * Campaign management for Talent Acquisition with:
 * - Campaign list with metrics
 * - Status filtering
 * - Performance tracking
 *
 * Routes: /employee/workspace/ta/campaigns
 *
 * @see docs/specs/20-USER-ROLES/03-ta/02-run-campaign.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import { TA_CAMPAIGN_TYPE_OPTIONS } from '@/lib/metadata/options/ta-options';
import { CAMPAIGN_STATUS_OPTIONS } from '@/lib/metadata/options/crm-options';

// ==========================================
// TABLE COLUMNS
// ==========================================

const campaignTableColumns = [
  {
    id: 'name',
    header: 'Campaign',
    accessor: 'name',
    type: 'composite',
    sortable: true,
    width: '250px',
    config: {
      primary: { path: 'name' },
      secondary: { path: 'description', truncate: 50 },
    },
  },
  {
    id: 'campaignType',
    header: 'Type',
    accessor: 'campaignType',
    type: 'enum',
    sortable: true,
    config: {
      options: TA_CAMPAIGN_TYPE_OPTIONS,
      badgeColors: {
        talent_sourcing: 'blue',
        employer_branding: 'purple',
        training_promotion: 'green',
        client_outreach: 'amber',
        event: 'cyan',
        referral: 'emerald',
      },
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
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
    id: 'targetCount',
    header: 'Targets',
    accessor: 'targetCount',
    type: 'number',
    sortable: true,
  },
  {
    id: 'sentCount',
    header: 'Sent',
    accessor: 'sentCount',
    type: 'number',
    sortable: true,
  },
  {
    id: 'responseRate',
    header: 'Response Rate',
    accessor: 'responseRate',
    type: 'number',
    sortable: true,
    config: { suffix: '%' },
  },
  {
    id: 'leadsGenerated',
    header: 'Leads',
    accessor: 'leadsGenerated',
    type: 'number',
    sortable: true,
  },
  {
    id: 'startDate',
    header: 'Start Date',
    accessor: 'startDate',
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
];

// ==========================================
// TA CAMPAIGNS SCREEN
// ==========================================

export const taCampaignsScreen: ScreenDefinition = {
  id: 'ta-campaigns',
  type: 'list',
  entityType: 'campaign',
  title: 'Campaigns',
  subtitle: 'Create and manage outreach campaigns',
  icon: 'Megaphone',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.campaigns.list',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Campaign Metrics
      {
        id: 'campaign-metrics',
        type: 'metrics-grid',
        columns: 5,
        widgets: [
          {
            id: 'total',
            type: 'metric',
            label: 'Total Campaigns',
            path: 'stats.total',
            config: { icon: 'Megaphone' },
          },
          {
            id: 'active',
            type: 'metric',
            label: 'Active',
            path: 'stats.active',
            config: { icon: 'Play', variant: 'success' },
          },
          {
            id: 'avgResponseRate',
            type: 'metric',
            label: 'Avg Response Rate',
            path: 'stats.avgResponseRate',
            config: { icon: 'TrendingUp', suffix: '%' },
          },
          {
            id: 'totalLeads',
            type: 'metric',
            label: 'Total Leads Generated',
            path: 'stats.totalLeadsGenerated',
            config: { icon: 'UserPlus' },
          },
          {
            id: 'totalSent',
            type: 'metric',
            label: 'Total Sent',
            path: 'stats.totalSent',
            config: { icon: 'Send' },
          },
        ],
      },

      // Filters
      {
        id: 'filters',
        type: 'field-grid',
        inline: true,
        columns: 4,
        fields: [
          {
            id: 'search',
            type: 'search',
            placeholder: 'Search campaigns...',
            config: { fields: ['name', 'description'] },
          },
          {
            id: 'status',
            type: 'multi-select',
            label: 'Status',
            options: CAMPAIGN_STATUS_OPTIONS,
          },
          {
            id: 'campaignType',
            type: 'multi-select',
            label: 'Type',
            options: TA_CAMPAIGN_TYPE_OPTIONS,
          },
          {
            id: 'dateRange',
            type: 'date-range',
            label: 'Date Range',
          },
        ],
      },

      // Campaigns Table
      {
        id: 'campaigns-table',
        type: 'table',
        columns_config: campaignTableColumns,
        selectable: true,
        pagination: {
          enabled: true,
          pageSize: 20,
          showPageSizeSelector: true,
        },
        rowClick: {
          type: 'navigate',
          route: { field: 'id', template: '/employee/workspace/ta/campaigns/{id}' },
        },
        emptyState: {
          title: 'No Campaigns',
          description: 'Create your first campaign to start generating leads',
          icon: 'Megaphone',
          action: {
            id: 'create-campaign',
            type: 'navigate',
            label: 'Create Campaign',
            icon: 'Plus',
            config: { type: 'navigate', route: '/employee/workspace/ta/campaigns/new' },
          },
        },
        rowActions: [
          {
            id: 'view',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/employee/workspace/ta/campaigns/{id}' },
          },
          {
            id: 'edit',
            type: 'navigate',
            label: 'Edit',
            icon: 'Pencil',
            config: { type: 'navigate', route: '/employee/workspace/ta/campaigns/{id}/edit' },
          },
          {
            id: 'launch',
            type: 'mutation',
            label: 'Launch',
            icon: 'Play',
            visible: { field: 'status', operator: 'in', value: ['draft', 'scheduled', 'paused'] },
            config: { type: 'mutation', procedure: 'ta.campaigns.launch' },
          },
          {
            id: 'pause',
            type: 'mutation',
            label: 'Pause',
            icon: 'Pause',
            visible: { field: 'status', operator: 'eq', value: 'active' },
            config: { type: 'mutation', procedure: 'ta.campaigns.pause' },
          },
          {
            id: 'duplicate',
            type: 'mutation',
            label: 'Duplicate',
            icon: 'Copy',
            config: { type: 'mutation', procedure: 'ta.campaigns.duplicate' },
          },
          {
            id: 'delete',
            type: 'mutation',
            label: 'Delete',
            icon: 'Trash',
            variant: 'destructive',
            config: { type: 'mutation', procedure: 'ta.campaigns.delete' },
            confirm: {
              title: 'Delete Campaign',
              message: 'Are you sure you want to delete this campaign?',
              destructive: true,
            },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'create-campaign',
      type: 'navigate',
      label: 'New Campaign',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/ta/campaigns/new' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportCampaigns' },
    },
  ],

  // Bulk Actions
  bulkActions: [
    {
      id: 'bulk-launch',
      type: 'mutation',
      label: 'Launch',
      icon: 'Play',
      config: { type: 'mutation', procedure: 'ta.campaigns.bulkLaunch' },
    },
    {
      id: 'bulk-pause',
      type: 'mutation',
      label: 'Pause',
      icon: 'Pause',
      config: { type: 'mutation', procedure: 'ta.campaigns.bulkPause' },
    },
    {
      id: 'bulk-delete',
      type: 'mutation',
      label: 'Delete',
      icon: 'Trash',
      variant: 'destructive',
      config: { type: 'mutation', procedure: 'ta.campaigns.bulkDelete' },
      confirm: {
        title: 'Delete Selected Campaigns',
        message: 'Are you sure you want to delete the selected campaigns?',
        destructive: true,
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Campaigns' },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'n', action: 'create-campaign', description: 'Create new campaign' },
    { key: '/', action: 'focus-search', description: 'Focus search' },
  ],
};

export default taCampaignsScreen;
