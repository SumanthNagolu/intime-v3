/**
 * Deal Detail Screen
 *
 * Comprehensive deal/opportunity view with pipeline tracking, related entities, and activities.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const dealDetailScreen: ScreenDefinition = {
  id: 'deal-detail',
  type: 'detail',
  entityType: 'deal',
  title: { type: 'field', path: 'name' },
  subtitle: { type: 'template', template: '{{stage}} - {{probability}}% probability' },
  icon: 'DollarSign',

  dataSource: {
    type: 'entity',
    entityType: 'deal',
    entityId: { type: 'param', path: 'id' },
    include: ['account', 'contact', 'activities', 'jobs', 'notes', 'owner'],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'deal-info',
      title: 'Deal Info',
      header: {
        type: 'icon',
        icon: 'DollarSign',
        size: 'lg',
      },
      fields: [
        {
          id: 'name',
          type: 'field',
          path: 'name',
          label: 'Deal Name',
        },
        {
          id: 'value',
          type: 'field',
          path: 'value',
          label: 'Value',
          widget: 'CurrencyDisplay',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        {
          id: 'stage',
          type: 'field',
          path: 'stage',
          label: 'Stage',
          widget: 'DealStageBadge',
        },
        {
          id: 'probability',
          type: 'field',
          path: 'probability',
          label: 'Probability',
          widget: 'PercentageDisplay',
        },
        {
          id: 'expected-close',
          type: 'field',
          path: 'expectedCloseDate',
          label: 'Expected Close',
          widget: 'DateDisplay',
        },
        {
          id: 'divider-2',
          type: 'divider',
        },
        {
          id: 'account',
          type: 'field',
          path: 'account.name',
          label: 'Account',
          widget: 'EntityLink',
          config: { entityType: 'account', idPath: 'account.id' },
        },
        {
          id: 'contact',
          type: 'field',
          path: 'contact.fullName',
          label: 'Primary Contact',
          widget: 'EntityLink',
          config: { entityType: 'contact', idPath: 'contact.id' },
        },
        {
          id: 'divider-3',
          type: 'divider',
        },
        {
          id: 'owner',
          type: 'field',
          path: 'owner.name',
          label: 'Owner',
          widget: 'UserAvatar',
        },
        {
          id: 'created-at',
          type: 'field',
          path: 'createdAt',
          label: 'Created',
          widget: 'RelativeTime',
        },
      ],
      footer: {
        type: 'progress',
        label: 'Pipeline Progress',
        path: 'pipelineProgress',
        maxValue: 100,
      },
      actions: [
        {
          id: 'call-contact',
          label: 'Call',
          type: 'function',
          icon: 'Phone',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'function', handler: 'initiateCall', params: { phonePath: 'contact.phone' } },
        },
        {
          id: 'email-contact',
          label: 'Email',
          type: 'modal',
          icon: 'Mail',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'send-email', context: { dealId: { type: 'param', path: 'id' } } },
        },
      ],
    },
    tabs: [
      // ==========================================
      // OVERVIEW TAB
      // ==========================================
      {
        id: 'overview',
        label: 'Overview',
        icon: 'Info',
        sections: [
          // Deal Summary
          {
            id: 'deal-summary',
            type: 'metrics-grid',
            columns: 4,
            widgets: [
              {
                id: 'value',
                type: 'metric-card',
                label: 'Deal Value',
                dataField: 'value',
                config: { icon: 'DollarSign', format: 'currency' },
              },
              {
                id: 'probability',
                type: 'metric-card',
                label: 'Win Probability',
                dataField: 'probability',
                config: { icon: 'Target', format: 'percentage' },
              },
              {
                id: 'expected-revenue',
                type: 'metric-card',
                label: 'Expected Revenue',
                dataField: 'expectedRevenue',
                config: { icon: 'TrendingUp', format: 'currency' },
              },
              {
                id: 'days-in-stage',
                type: 'metric-card',
                label: 'Days in Stage',
                dataField: 'daysInStage',
                config: { icon: 'Clock' },
              },
            ],
          },

          // Deal Details
          {
            id: 'deal-details',
            type: 'info-card',
            title: 'Deal Details',
            columns: 2,
            fields: [
              { type: 'field', path: 'name', label: 'Deal Name' },
              { type: 'field', path: 'type', label: 'Deal Type', widget: 'DealTypeBadge' },
              { type: 'field', path: 'stage', label: 'Stage', widget: 'DealStageBadge' },
              { type: 'field', path: 'probability', label: 'Probability', widget: 'PercentageDisplay' },
              { type: 'field', path: 'value', label: 'Value', widget: 'CurrencyDisplay' },
              { type: 'field', path: 'expectedCloseDate', label: 'Expected Close', widget: 'DateDisplay' },
              { type: 'field', path: 'leadSource', label: 'Lead Source' },
              { type: 'field', path: 'nextStep', label: 'Next Step' },
            ],
          },

          // Competitors
          {
            id: 'competitors',
            type: 'info-card',
            title: 'Competitor Info',
            columns: 2,
            collapsible: true,
            defaultExpanded: false,
            fields: [
              { type: 'field', path: 'competitors', label: 'Competitors', widget: 'TagsDisplay' },
              { type: 'field', path: 'competitivePosition', label: 'Our Position' },
            ],
          },

          // Description
          {
            id: 'description',
            type: 'info-card',
            title: 'Description',
            collapsible: true,
            fields: [
              { type: 'field', path: 'description', label: '', widget: 'RichTextDisplay' },
            ],
          },
        ],
      },

      // ==========================================
      // RELATED JOBS TAB
      // ==========================================
      {
        id: 'jobs',
        label: 'Jobs',
        icon: 'Briefcase',
        badge: { type: 'count', path: 'jobsCount' },
        sections: [
          {
            id: 'jobs-list',
            type: 'table',
            title: 'Associated Jobs',
            dataSource: { type: 'related', relation: 'jobs' },
            columns_config: [
              { id: 'title', header: 'Job Title', path: 'title' },
              { id: 'status', header: 'Status', path: 'status', type: 'job-status-badge' },
              { id: 'openings', header: 'Openings', path: 'openings', type: 'number' },
              { id: 'submissions', header: 'Submissions', path: 'submissionsCount', type: 'number' },
              { id: 'created', header: 'Created', path: 'createdAt', type: 'date' },
            ],
            rowClick: { type: 'navigate', route: '/employee/workspace/jobs/{{id}}' },
            emptyState: {
              title: 'No jobs',
              description: 'This deal is not associated with any jobs yet',
            },
          },
        ],
        actions: [
          {
            id: 'create-job',
            label: 'Create Job',
            type: 'modal',
            icon: 'Plus',
            variant: 'primary',
            config: { type: 'modal', modal: 'job-create', context: { dealId: { type: 'param', path: 'id' } } },
          },
          {
            id: 'link-job',
            label: 'Link Existing Job',
            type: 'modal',
            icon: 'Link',
            variant: 'default',
            config: { type: 'modal', modal: 'link-job', context: { dealId: { type: 'param', path: 'id' } } },
          },
        ],
      },

      // ==========================================
      // CONTACTS TAB
      // ==========================================
      {
        id: 'contacts',
        label: 'Contacts',
        icon: 'Users',
        badge: { type: 'count', path: 'contactsCount' },
        sections: [
          {
            id: 'contacts-list',
            type: 'table',
            title: 'Deal Contacts',
            dataSource: { type: 'related', relation: 'contacts' },
            columns_config: [
              { id: 'name', header: 'Name', path: 'fullName' },
              { id: 'title', header: 'Title', path: 'jobTitle' },
              { id: 'role', header: 'Deal Role', path: 'dealRole', type: 'badge' },
              { id: 'email', header: 'Email', path: 'email', type: 'email' },
              { id: 'phone', header: 'Phone', path: 'phone', type: 'phone' },
            ],
            rowClick: { type: 'navigate', route: '/employee/workspace/contacts/{{id}}' },
            emptyState: {
              title: 'No contacts',
              description: 'Add contacts involved in this deal',
            },
          },
        ],
        actions: [
          {
            id: 'add-contact',
            label: 'Add Contact',
            type: 'modal',
            icon: 'Plus',
            variant: 'default',
            config: { type: 'modal', modal: 'add-deal-contact', context: { dealId: { type: 'param', path: 'id' } } },
          },
        ],
      },

      // ==========================================
      // ACTIVITY TAB
      // ==========================================
      {
        id: 'activity',
        label: 'Activity',
        icon: 'Activity',
        badge: {
          type: 'overdue-count',
          path: 'overdueActivitiesCount',
          variant: 'warning',
        },
        sections: [
          {
            id: 'activity-timeline',
            type: 'timeline',
            dataSource: { type: 'related', relation: 'activities' },
            config: {
              showEvents: true,
              showNotes: true,
              showEmails: true,
              showStageChanges: true,
              groupByDate: true,
              allowQuickLog: true,
              quickLogTypes: ['call', 'email', 'meeting', 'note'],
            },
          },
        ],
        actions: [
          {
            id: 'log-activity',
            label: 'Log Activity',
            type: 'modal',
            icon: 'Plus',
            variant: 'default',
            config: { type: 'modal', modal: 'log-activity', context: { dealId: { type: 'param', path: 'id' } } },
          },
        ],
      },

      // ==========================================
      // HISTORY TAB
      // ==========================================
      {
        id: 'history',
        label: 'History',
        icon: 'History',
        sections: [
          {
            id: 'stage-history',
            type: 'timeline',
            title: 'Stage History',
            dataSource: { type: 'related', relation: 'stageHistory' },
            config: {
              showTimestamps: true,
              showDuration: true,
              itemComponent: 'StageChangeItem',
            },
          },
          {
            id: 'audit-trail',
            type: 'table',
            title: 'Change History',
            dataSource: { type: 'related', relation: 'auditTrail' },
            collapsible: true,
            defaultExpanded: false,
            columns_config: [
              { id: 'field', header: 'Field', path: 'fieldName' },
              { id: 'oldValue', header: 'Old Value', path: 'oldValue' },
              { id: 'newValue', header: 'New Value', path: 'newValue' },
              { id: 'changedBy', header: 'Changed By', path: 'changedBy.name', type: 'user-avatar' },
              { id: 'changedAt', header: 'Date', path: 'changedAt', type: 'datetime' },
            ],
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'advance-stage',
      label: 'Advance Stage',
      type: 'modal',
      icon: 'ArrowRight',
      variant: 'primary',
      config: { type: 'modal', modal: 'advance-deal-stage', context: { dealId: { type: 'param', path: 'id' } } },
      visible: {
        field: 'stage',
        operator: 'nin',
        value: ['closed_won', 'closed_lost'],
      },
    },
    {
      id: 'mark-won',
      label: 'Mark Won',
      type: 'modal',
      icon: 'Trophy',
      variant: 'default',
      config: { type: 'modal', modal: 'close-deal-won', context: { dealId: { type: 'param', path: 'id' } } },
      visible: {
        field: 'stage',
        operator: 'nin',
        value: ['closed_won', 'closed_lost'],
      },
    },
    {
      id: 'mark-lost',
      label: 'Mark Lost',
      type: 'modal',
      icon: 'XCircle',
      variant: 'outline',
      config: { type: 'modal', modal: 'close-deal-lost', context: { dealId: { type: 'param', path: 'id' } } },
      visible: {
        field: 'stage',
        operator: 'nin',
        value: ['closed_won', 'closed_lost'],
      },
    },
    {
      id: 'edit',
      label: 'Edit Deal',
      type: 'navigate',
      icon: 'Edit',
      variant: 'default',
      config: { type: 'navigate', route: '/employee/workspace/deals/{{id}}/edit' },
    },
    {
      id: 'delete',
      label: 'Delete',
      type: 'modal',
      icon: 'Trash2',
      variant: 'destructive',
      config: { type: 'modal', modal: 'deal-delete' },
      confirm: {
        title: 'Delete Deal',
        message: 'Are you sure you want to delete this deal? This action cannot be undone.',
        confirmLabel: 'Delete',
        destructive: true,
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Deals', route: '/employee/workspace/deals' },
      { label: { type: 'field', path: 'name' }, active: true },
    ],
  },
};

export default dealDetailScreen;
