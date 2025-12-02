/**
 * Campaign Detail Screen Definition
 *
 * Metadata-driven screen for viewing Campaign details with tabs for
 * targets, content, metrics, and activity.
 */

import { createDetailScreen } from '@/lib/metadata/factories';
import type { DetailTemplateConfig } from '@/lib/metadata/templates';
import {
  campaignBasicInputSet,
  campaignScheduleInputSet,
  campaignTargetInputSet,
  campaignGoalsInputSet,
  campaignAssignmentInputSet,
  campaignNotesInputSet,
  campaignMetricsInputSet,
  campaignRatesInputSet,
  campaignCostInputSet,
} from '@/lib/metadata/inputsets';
import {
  CAMPAIGN_TYPE_OPTIONS,
  CAMPAIGN_STATUS_OPTIONS,
  CAMPAIGN_TARGET_STATUS_OPTIONS,
  CAMPAIGN_CONTENT_TYPE_OPTIONS,
} from '@/lib/metadata/options/crm-options';

// ==========================================
// CAMPAIGN DETAIL SCREEN CONFIG
// ==========================================

const campaignDetailConfig: DetailTemplateConfig = {
  entityId: 'campaign',
  entityName: 'Campaign',
  basePath: '/employee/crm/campaigns',

  // Data source
  dataSource: {
    getProcedure: 'crm.campaigns.getById',
    idParam: 'id',
  },

  // Title template
  titleTemplate: '{{name}}',
  subtitleTemplate: '{{campaignType}} - {{status}}',

  // Sidebar configuration
  sidebar: {
    position: 'left',
    width: 320,
    sections: [
      {
        id: 'status',
        type: 'stats',
        title: 'Campaign Status',
        fields: [
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
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
              size: 'large',
            },
          },
        ],
      },
      {
        id: 'quickInfo',
        type: 'info-list',
        fields: [
          {
            id: 'campaignType',
            label: 'Type',
            path: 'campaignType',
            type: 'enum',
            icon: 'Tag',
            config: { options: CAMPAIGN_TYPE_OPTIONS },
          },
          {
            id: 'startDate',
            label: 'Start Date',
            path: 'startDate',
            type: 'date',
            icon: 'Calendar',
            config: { format: 'medium' },
          },
          {
            id: 'endDate',
            label: 'End Date',
            path: 'endDate',
            type: 'date',
            icon: 'CalendarCheck',
            config: { format: 'medium' },
          },
          {
            id: 'owner',
            label: 'Owner',
            path: 'owner.fullName',
            type: 'text',
            icon: 'User',
          },
          {
            id: 'budget',
            label: 'Budget',
            path: 'budget',
            type: 'currency',
            icon: 'DollarSign',
            config: { prefix: '$' },
          },
        ],
      },
      {
        id: 'goals',
        type: 'stats',
        title: 'Goals',
        fields: [
          {
            id: 'goalLeads',
            label: 'Lead Goal',
            path: 'goalLeads',
            type: 'number',
          },
          {
            id: 'goalResponses',
            label: 'Response Goal',
            path: 'goalResponses',
            type: 'number',
          },
          {
            id: 'goalMeetings',
            label: 'Meeting Goal',
            path: 'goalMeetings',
            type: 'number',
          },
        ],
      },
      {
        id: 'quickActions',
        type: 'action-list',
        actions: [
          {
            id: 'launch',
            label: 'Launch Campaign',
            icon: 'Play',
            actionType: 'mutation',
            mutation: 'crm.campaigns.launch',
            showWhen: { field: 'status', operator: 'in', value: ['draft', 'scheduled', 'paused'] },
          },
          {
            id: 'pause',
            label: 'Pause Campaign',
            icon: 'Pause',
            actionType: 'mutation',
            mutation: 'crm.campaigns.pause',
            showWhen: { field: 'status', operator: 'eq', value: 'active' },
          },
          {
            id: 'complete',
            label: 'Complete Campaign',
            icon: 'CheckCircle',
            actionType: 'mutation',
            mutation: 'crm.campaigns.complete',
            showWhen: { field: 'status', operator: 'in', value: ['active', 'paused'] },
          },
          {
            id: 'addTargets',
            label: 'Add Targets',
            icon: 'UserPlus',
            actionType: 'custom',
            handler: 'handleAddTargets',
          },
          {
            id: 'addContent',
            label: 'Add Content',
            icon: 'FileText',
            actionType: 'custom',
            handler: 'handleAddContent',
          },
        ],
      },
    ],
  },

  // Tabs configuration
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'FileText',
      sections: [
        {
          id: 'basicInfo',
          type: 'input-set',
          inputSet: campaignBasicInputSet,
          title: 'Basic Information',
          readonly: true,
        },
        {
          id: 'schedule',
          type: 'input-set',
          inputSet: campaignScheduleInputSet,
          title: 'Schedule',
          readonly: true,
        },
        {
          id: 'target',
          type: 'input-set',
          inputSet: campaignTargetInputSet,
          title: 'Target Audience',
          readonly: true,
        },
        {
          id: 'goals',
          type: 'input-set',
          inputSet: campaignGoalsInputSet,
          title: 'Goals & Budget',
          readonly: true,
        },
        {
          id: 'assignment',
          type: 'input-set',
          inputSet: campaignAssignmentInputSet,
          title: 'Assignment',
          readonly: true,
        },
        {
          id: 'notes',
          type: 'input-set',
          inputSet: campaignNotesInputSet,
          title: 'Notes',
          readonly: true,
        },
      ],
    },
    {
      id: 'targets',
      label: 'Targets',
      icon: 'Users',
      badge: {
        path: 'targets.length',
        variant: 'secondary',
      },
      sections: [
        {
          id: 'targetList',
          type: 'related-table',
          title: 'Campaign Targets',
          dataPath: 'targets',
          dataSource: {
            procedure: 'crm.campaigns.getTargets',
            params: { campaignId: '{{id}}' },
          },
          columns: [
            {
              id: 'targetType',
              label: 'Type',
              path: 'targetType',
              type: 'enum',
              config: {
                options: [
                  { value: 'lead', label: 'Lead' },
                  { value: 'contact', label: 'Contact' },
                  { value: 'account', label: 'Account' },
                ],
              },
            },
            { id: 'targetId', label: 'Target ID', path: 'targetId', type: 'text' },
            {
              id: 'status',
              label: 'Status',
              path: 'status',
              type: 'enum',
              config: {
                options: CAMPAIGN_TARGET_STATUS_OPTIONS,
                badgeColors: {
                  pending: 'gray',
                  sent: 'blue',
                  opened: 'cyan',
                  clicked: 'amber',
                  responded: 'green',
                  converted: 'purple',
                  bounced: 'red',
                  unsubscribed: 'orange',
                },
              },
            },
            { id: 'sentAt', label: 'Sent', path: 'sentAt', type: 'date', config: { format: 'relative' } },
            { id: 'openedAt', label: 'Opened', path: 'openedAt', type: 'date', config: { format: 'relative' } },
            { id: 'clickedAt', label: 'Clicked', path: 'clickedAt', type: 'date', config: { format: 'relative' } },
            { id: 'respondedAt', label: 'Responded', path: 'respondedAt', type: 'date', config: { format: 'relative' } },
          ],
          emptyState: {
            title: 'No targets',
            message: 'Add leads, contacts, or accounts to target with this campaign.',
            action: {
              label: 'Add Targets',
              handler: 'handleAddTargets',
            },
          },
        },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      icon: 'FileText',
      badge: {
        path: 'content.length',
        variant: 'secondary',
      },
      sections: [
        {
          id: 'contentList',
          type: 'related-table',
          title: 'Campaign Content',
          dataPath: 'content',
          dataSource: {
            procedure: 'crm.campaigns.getContent',
            params: { campaignId: '{{id}}' },
          },
          columns: [
            {
              id: 'contentType',
              label: 'Type',
              path: 'contentType',
              type: 'enum',
              config: { options: CAMPAIGN_CONTENT_TYPE_OPTIONS },
            },
            { id: 'name', label: 'Name', path: 'name', type: 'text' },
            { id: 'subject', label: 'Subject', path: 'subject', type: 'text' },
            { id: 'variant', label: 'Variant', path: 'variant', type: 'text' },
            { id: 'isActive', label: 'Active', path: 'isActive', type: 'boolean' },
          ],
          actions: [
            {
              id: 'preview',
              label: 'Preview',
              icon: 'Eye',
              actionType: 'custom',
              handler: 'handlePreviewContent',
            },
            {
              id: 'edit',
              label: 'Edit',
              icon: 'Pencil',
              actionType: 'custom',
              handler: 'handleEditContent',
            },
          ],
          emptyState: {
            title: 'No content',
            message: 'Create email templates, scripts, or other content for this campaign.',
            action: {
              label: 'Add Content',
              handler: 'handleAddContent',
            },
          },
        },
      ],
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: 'BarChart3',
      sections: [
        {
          id: 'metricsOverview',
          type: 'input-set',
          inputSet: campaignMetricsInputSet,
          title: 'Performance Metrics',
          readonly: true,
        },
        {
          id: 'rates',
          type: 'input-set',
          inputSet: campaignRatesInputSet,
          title: 'Performance Rates',
          readonly: true,
        },
        {
          id: 'cost',
          type: 'input-set',
          inputSet: campaignCostInputSet,
          title: 'Cost & ROI',
          readonly: true,
        },
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: 'Activity',
      sections: [
        {
          id: 'activityTimeline',
          type: 'timeline',
          title: 'Activity Timeline',
          dataPath: 'activities',
          config: {
            activityTypes: ['email', 'note', 'status_change'],
            showAddButton: false,
            groupByDate: true,
          },
          emptyState: {
            title: 'No activity yet',
            message: 'Activity will appear as the campaign runs.',
          },
        },
      ],
    },
  ],

  // Header actions
  headerActions: [
    {
      id: 'edit',
      label: 'Edit',
      variant: 'primary',
      icon: 'Pencil',
      actionType: 'navigate',
      routeTemplate: '/employee/crm/campaigns/{{id}}/edit',
    },
    {
      id: 'launch',
      label: 'Launch',
      variant: 'secondary',
      icon: 'Play',
      actionType: 'mutation',
      mutation: 'crm.campaigns.launch',
      showWhen: { field: 'status', operator: 'in', value: ['draft', 'scheduled', 'paused'] },
      onSuccess: {
        toast: { message: 'Campaign launched successfully' },
      },
    },
    {
      id: 'pause',
      label: 'Pause',
      variant: 'secondary',
      icon: 'Pause',
      actionType: 'mutation',
      mutation: 'crm.campaigns.pause',
      showWhen: { field: 'status', operator: 'eq', value: 'active' },
      onSuccess: {
        toast: { message: 'Campaign paused' },
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      variant: 'destructive',
      icon: 'Trash',
      actionType: 'mutation',
      mutation: 'crm.campaigns.delete',
      confirm: {
        title: 'Delete Campaign',
        message: 'Are you sure you want to delete this campaign? This action cannot be undone.',
      },
      onSuccess: {
        redirect: '/employee/crm/campaigns',
        toast: { message: 'Campaign deleted successfully' },
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Campaigns', route: '/employee/crm/campaigns' },
      { label: '{{name}}' },
    ],
  },
};

// ==========================================
// GENERATE SCREEN
// ==========================================

export const campaignDetailScreen = createDetailScreen(campaignDetailConfig);

export default campaignDetailScreen;
