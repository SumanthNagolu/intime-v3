/**
 * Campaign Detail Screen Definition
 *
 * Detailed campaign view with:
 * - Campaign summary and metrics
 * - Target list management
 * - Performance analytics
 * - Activity timeline
 *
 * Routes: /employee/workspace/ta/campaigns/:id
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import { TA_CAMPAIGN_TYPE_OPTIONS } from '@/lib/metadata/options/ta-options';
import {
  CAMPAIGN_STATUS_OPTIONS,
  CAMPAIGN_TARGET_STATUS_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// CAMPAIGN DETAIL SCREEN
// ==========================================

export const campaignDetailScreen: ScreenDefinition = {
  id: 'campaign-detail',
  type: 'detail',
  entityType: 'campaign',
  title: { field: 'name' },
  icon: 'Megaphone',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.campaigns.getById',
      params: { id: { param: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar - Campaign Summary
    sidebar: {
      id: 'campaign-sidebar',
      type: 'info-card',
      header: {
        type: 'icon',
        icon: 'Megaphone',
        badge: {
          type: 'field',
          path: 'status',
          variant: 'status',
        },
      },
      sections: [
        // Campaign Type & Status
        {
          id: 'campaign-status',
          type: 'field-grid',
          columns: 1,
          fields: [
            {
              id: 'campaignType',
              label: 'Type',
              path: 'campaignType',
              type: 'enum',
              config: { options: TA_CAMPAIGN_TYPE_OPTIONS },
            },
            {
              id: 'status',
              label: 'Status',
              path: 'status',
              type: 'enum',
              config: { options: CAMPAIGN_STATUS_OPTIONS },
            },
          ],
        },

        // Key Metrics
        {
          id: 'key-metrics',
          type: 'metrics-grid',
          title: 'Performance',
          columns: 2,
          widgets: [
            {
              id: 'sent',
              type: 'metric',
              label: 'Sent',
              path: 'sentCount',
              config: { icon: 'Send' },
            },
            {
              id: 'opened',
              type: 'metric',
              label: 'Opened',
              path: 'openedCount',
              config: { icon: 'Eye' },
            },
            {
              id: 'responded',
              type: 'metric',
              label: 'Responded',
              path: 'respondedCount',
              config: { icon: 'MessageCircle' },
            },
            {
              id: 'converted',
              type: 'metric',
              label: 'Leads',
              path: 'leadsGenerated',
              config: { icon: 'UserPlus' },
            },
          ],
        },

        // Rates
        {
          id: 'rates',
          type: 'field-grid',
          title: 'Rates',
          columns: 1,
          fields: [
            {
              id: 'openRate',
              label: 'Open Rate',
              path: 'openRate',
              type: 'progress',
              config: { suffix: '%', max: 100 },
            },
            {
              id: 'responseRate',
              label: 'Response Rate',
              path: 'responseRate',
              type: 'progress',
              config: { suffix: '%', max: 100 },
            },
            {
              id: 'conversionRate',
              label: 'Conversion Rate',
              path: 'conversionRate',
              type: 'progress',
              config: { suffix: '%', max: 100 },
            },
          ],
        },

        // Dates
        {
          id: 'dates',
          type: 'field-grid',
          title: 'Schedule',
          icon: 'Calendar',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'startDate', label: 'Start Date', path: 'startDate', type: 'date', config: { format: 'medium' } },
            { id: 'endDate', label: 'End Date', path: 'endDate', type: 'date', config: { format: 'medium' } },
            { id: 'createdAt', label: 'Created', path: 'createdAt', type: 'date', config: { format: 'relative' } },
          ],
        },

        // Owner
        {
          id: 'owner-info',
          type: 'field-grid',
          title: 'Owner',
          icon: 'User',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'owner', label: 'Owner', path: 'ownerName', type: 'user' },
          ],
        },
      ],
    },

    // Main Content - Tabs
    tabs: [
      // Overview Tab
      {
        id: 'overview',
        label: 'Overview',
        icon: 'LayoutDashboard',
        sections: [
          // Description
          {
            id: 'description',
            type: 'info-card',
            title: 'Description',
            icon: 'FileText',
            widgets: [
              {
                id: 'description-text',
                type: 'rich-text',
                path: 'description',
                config: { readOnly: true },
              },
            ],
          },

          // Performance Chart
          {
            id: 'performance-chart',
            type: 'custom',
            title: 'Performance Over Time',
            icon: 'LineChart',
            component: 'CampaignPerformanceChart',
            componentProps: {
              campaignIdParam: 'id',
            },
          },

          // Funnel Visualization
          {
            id: 'funnel',
            type: 'custom',
            title: 'Campaign Funnel',
            icon: 'Filter',
            component: 'CampaignFunnel',
            componentProps: {
              stages: ['sent', 'opened', 'clicked', 'responded', 'converted'],
              dataPath: 'funnelData',
            },
          },
        ],
      },

      // Targets Tab
      {
        id: 'targets',
        label: 'Targets',
        icon: 'Users',
        badge: {
          type: 'count',
          path: 'targetCount',
        },
        sections: [
          // Target Filters
          {
            id: 'target-filters',
            type: 'field-grid',
            inline: true,
            columns: 3,
            fields: [
              {
                id: 'search',
                type: 'search',
                placeholder: 'Search targets...',
              },
              {
                id: 'status',
                type: 'multi-select',
                label: 'Status',
                options: CAMPAIGN_TARGET_STATUS_OPTIONS,
              },
            ],
          },

          // Targets Table
          {
            id: 'targets-table',
            type: 'table',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.campaigns.getTargets',
                params: { campaignId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'name', header: 'Name', accessor: 'contactName', type: 'text' },
              { id: 'email', header: 'Email', accessor: 'email', type: 'email' },
              { id: 'company', header: 'Company', accessor: 'company', type: 'text' },
              {
                id: 'status',
                header: 'Status',
                accessor: 'status',
                type: 'enum',
                config: { options: CAMPAIGN_TARGET_STATUS_OPTIONS },
              },
              { id: 'sentAt', header: 'Sent', accessor: 'sentAt', type: 'date', config: { format: 'relative' } },
              { id: 'openedAt', header: 'Opened', accessor: 'openedAt', type: 'date', config: { format: 'relative' } },
              { id: 'respondedAt', header: 'Responded', accessor: 'respondedAt', type: 'date', config: { format: 'relative' } },
            ],
            selectable: true,
            rowClick: {
              type: 'modal',
              modal: 'view-campaign-target',
            },
            emptyState: {
              title: 'No Targets',
              description: 'Add targets to this campaign',
              icon: 'Users',
            },
            rowActions: [
              {
                id: 'view-lead',
                type: 'navigate',
                label: 'View Lead',
                icon: 'User',
                visible: { field: 'leadId', operator: 'exists' },
                config: { type: 'navigate', route: '/employee/workspace/ta/leads/{leadId}' },
              },
              {
                id: 'resend',
                type: 'mutation',
                label: 'Resend',
                icon: 'RefreshCw',
                visible: { field: 'status', operator: 'in', value: ['sent', 'bounced'] },
                config: { type: 'mutation', procedure: 'ta.campaigns.resendToTarget' },
              },
              {
                id: 'remove',
                type: 'mutation',
                label: 'Remove',
                icon: 'Trash',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'ta.campaigns.removeTarget' },
              },
            ],
            actions: [
              {
                id: 'add-targets',
                type: 'modal',
                label: 'Add Targets',
                icon: 'Plus',
                variant: 'outline',
                config: {
                  type: 'modal',
                  modal: 'add-campaign-targets',
                  props: { campaignId: { param: 'id' } },
                },
              },
              {
                id: 'import-targets',
                type: 'modal',
                label: 'Import',
                icon: 'Upload',
                variant: 'ghost',
                config: {
                  type: 'modal',
                  modal: 'import-campaign-targets',
                  props: { campaignId: { param: 'id' } },
                },
              },
            ],
          },
        ],
      },

      // Content Tab
      {
        id: 'content',
        label: 'Content',
        icon: 'FileEdit',
        sections: [
          {
            id: 'content-preview',
            type: 'custom',
            title: 'Campaign Content',
            component: 'CampaignContentPreview',
            componentProps: {
              campaignIdParam: 'id',
            },
          },
        ],
      },

      // Leads Generated Tab
      {
        id: 'leads',
        label: 'Leads Generated',
        icon: 'UserPlus',
        badge: {
          type: 'count',
          path: 'leadsGenerated',
        },
        sections: [
          {
            id: 'leads-table',
            type: 'table',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.leads.listByCampaign',
                params: { campaignId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
              { id: 'company', header: 'Company', accessor: 'company', type: 'text' },
              { id: 'stage', header: 'Stage', accessor: 'stage', type: 'enum' },
              { id: 'createdAt', header: 'Created', accessor: 'createdAt', type: 'date', config: { format: 'relative' } },
            ],
            rowClick: {
              type: 'navigate',
              route: { field: 'id', template: '/employee/workspace/ta/leads/{id}' },
            },
            emptyState: {
              title: 'No Leads Yet',
              description: 'Leads generated from this campaign will appear here',
              icon: 'UserPlus',
            },
          },
        ],
      },

      // Activity Tab
      {
        id: 'activity',
        label: 'Activity',
        icon: 'Activity',
        sections: [
          {
            id: 'activity-timeline',
            type: 'timeline',
            title: 'Campaign Activity',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.campaigns.getActivity',
                params: { campaignId: { param: 'id' } },
              },
            },
            config: {
              timestampPath: 'createdAt',
              titlePath: 'event',
              descriptionPath: 'details',
              typePath: 'eventType',
            },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'launch',
      type: 'mutation',
      label: 'Launch Campaign',
      icon: 'Play',
      variant: 'primary',
      visible: { field: 'status', operator: 'in', value: ['draft', 'scheduled', 'paused'] },
      config: { type: 'mutation', procedure: 'ta.campaigns.launch' },
      confirm: {
        title: 'Launch Campaign',
        message: 'Are you sure you want to launch this campaign? Messages will be sent to all targets.',
      },
    },
    {
      id: 'pause',
      type: 'mutation',
      label: 'Pause',
      icon: 'Pause',
      variant: 'outline',
      visible: { field: 'status', operator: 'eq', value: 'active' },
      config: { type: 'mutation', procedure: 'ta.campaigns.pause' },
    },
    {
      id: 'edit',
      type: 'navigate',
      label: 'Edit',
      icon: 'Pencil',
      variant: 'ghost',
      visible: { field: 'status', operator: 'in', value: ['draft', 'scheduled', 'paused'] },
      config: { type: 'navigate', route: '/employee/workspace/ta/campaigns/{id}/edit' },
    },
    {
      id: 'duplicate',
      type: 'mutation',
      label: 'Duplicate',
      icon: 'Copy',
      variant: 'ghost',
      config: { type: 'mutation', procedure: 'ta.campaigns.duplicate' },
      onSuccess: {
        type: 'navigate',
        route: '/employee/workspace/ta/campaigns/{id}',
        toast: 'Campaign duplicated',
      },
    },
    {
      id: 'complete',
      type: 'mutation',
      label: 'Mark Complete',
      icon: 'CheckCircle',
      variant: 'outline',
      visible: { field: 'status', operator: 'eq', value: 'active' },
      config: { type: 'mutation', procedure: 'ta.campaigns.complete' },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Campaigns',
      route: '/employee/workspace/ta/campaigns',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Campaigns', route: '/employee/workspace/ta/campaigns' },
      { label: { field: 'name' } },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'l', action: 'launch', description: 'Launch campaign' },
    { key: 'e', action: 'edit', description: 'Edit campaign' },
  ],
};

export default campaignDetailScreen;
