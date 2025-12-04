/**
 * Account Detail Screen
 *
 * Comprehensive client account view with jobs, contacts, placements, and metrics.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const accountDetailScreen: ScreenDefinition = {
  id: 'account-detail',
  type: 'detail',
  entityType: 'account',
  title: { type: 'field', path: 'name' },
  subtitle: { type: 'field', path: 'industry' },
  icon: 'Building2',

  dataSource: {
    type: 'entity',
    entityType: 'account',
    entityId: { type: 'param', path: 'id' },
    include: [
      'contacts',
      'jobs',
      'placements',
      'activities',
      'deals',
      'objectOwners',
      'metrics',
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'account-info',
      title: 'Account Info',
      header: {
        type: 'avatar',
        path: 'logoUrl',
        fallbackPath: 'initials',
        size: 'lg',
      },
      fields: [
        {
          id: 'health-score',
          type: 'field',
          path: 'healthScore',
          label: 'Health Score',
          widget: 'HealthScoreGauge',
          config: { size: 'sm' },
        },
        {
          id: 'status',
          type: 'field',
          path: 'status',
          label: 'Status',
          widget: 'AccountStatusBadge',
        },
        {
          id: 'tier',
          type: 'field',
          path: 'tier',
          label: 'Tier',
          widget: 'TierBadge',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        {
          id: 'industry',
          type: 'field',
          path: 'industry',
          label: 'Industry',
        },
        {
          id: 'website',
          type: 'field',
          path: 'website',
          label: 'Website',
          widget: 'LinkDisplay',
        },
        {
          id: 'location',
          type: 'field',
          path: 'headquarters',
          label: 'Headquarters',
        },
        {
          id: 'employees',
          type: 'field',
          path: 'employeeCount',
          label: 'Employees',
          config: { format: 'number' },
        },
        {
          id: 'divider-2',
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
          id: 'last-contact',
          type: 'field',
          path: 'lastContactAt',
          label: 'Last Contact',
          widget: 'DateTimeDisplay',
          config: { relative: true, warnIfStale: 14 },
        },
        {
          id: 'nps',
          type: 'field',
          path: 'nps',
          label: 'NPS Score',
          widget: 'NPSDisplay',
        },
      ],
      footer: {
        type: 'metrics-row',
        metrics: [
          { label: 'Jobs', value: { type: 'field', path: 'activeJobsCount' }, icon: 'Briefcase' },
          { label: 'Placements', value: { type: 'field', path: 'placementsCount' }, icon: 'Users' },
          { label: 'YTD', value: { type: 'field', path: 'ytdRevenue' }, format: 'currency', icon: 'DollarSign' },
        ],
      },
      actions: [
        {
          id: 'log-call',
          label: 'Log Call',
          type: 'modal',
          icon: 'Phone',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'log-activity', preset: { activityType: 'call' } },
        },
        {
          id: 'log-email',
          label: 'Email',
          type: 'modal',
          icon: 'Mail',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'send-email', context: 'account' },
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
          // Company Info
          {
            id: 'company-info',
            type: 'info-card',
            title: 'Company Information',
            columns: 2,
            fields: [
              { type: 'field', path: 'name', label: 'Company Name' },
              { type: 'field', path: 'legalName', label: 'Legal Name' },
              { type: 'field', path: 'industry', label: 'Industry' },
              { type: 'field', path: 'subIndustry', label: 'Sub-Industry' },
              { type: 'field', path: 'website', label: 'Website', widget: 'LinkDisplay' },
              { type: 'field', path: 'linkedinUrl', label: 'LinkedIn', widget: 'SocialLink', config: { platform: 'linkedin' } },
              { type: 'field', path: 'founded', label: 'Founded' },
              { type: 'field', path: 'employeeCount', label: 'Employees' },
            ],
          },

          // Address
          {
            id: 'address',
            type: 'input-set',
            title: 'Address',
            inputSet: 'AddressInputSet',
            readOnly: true,
          },

          // Billing Info
          {
            id: 'billing',
            type: 'info-card',
            title: 'Billing Information',
            visible: { type: 'permission', permission: 'account.billing.view' },
            fields: [
              { type: 'field', path: 'paymentTerms', label: 'Payment Terms' },
              { id: 'credit-limit', type: 'currency', path: 'creditLimit', label: 'Credit Limit' },
              { type: 'field', path: 'billingContact', label: 'Billing Contact' },
            ],
          },

          // Notes
          {
            id: 'notes',
            type: 'info-card',
            title: 'Notes',
            fields: [
              { type: 'field', path: 'notes', label: '', widget: 'RichTextDisplay' },
            ],
          },
        ],
      },

      // ==========================================
      // JOBS TAB
      // ==========================================
      {
        id: 'jobs',
        label: 'Jobs',
        icon: 'Briefcase',
        badge: { type: 'count', path: 'activeJobsCount' },
        sections: [
          {
            id: 'jobs-table',
            type: 'table',
            dataSource: {
              type: 'related',
              relation: 'jobs',
              sort: { field: 'createdAt', direction: 'desc' },
            },
            columns_config: [
              {
                id: 'title',
                header: 'Title',
                path: 'title',
                sortable: true,
                config: { link: true, linkPath: '/employee/workspace/jobs/{{id}}' },
              },
              { id: 'status', header: 'Status', path: 'status', type: 'job-status-badge' },
              { id: 'priority', header: 'Priority', path: 'priority', type: 'priority-badge' },
              { id: 'submissions', header: 'Subs', path: 'submissionsCount', type: 'number' },
              { id: 'days-open', header: 'Days', path: 'daysOpen', type: 'days-open-indicator' },
              { id: 'owner', header: 'Owner', path: 'owner.name', type: 'user-avatar' },
              { id: 'created', header: 'Created', path: 'createdAt', type: 'date' },
            ],
            emptyState: {
              title: 'No jobs for this account',
              action: {
                label: 'Create Job',
                type: 'navigate',
                config: { type: 'navigate', route: '/employee/workspace/jobs/new?accountId={{id}}' },
              },
            },
          },
        ],
        actions: [
          {
            id: 'create-job',
            label: 'Create Job',
            type: 'navigate',
            icon: 'Plus',
            variant: 'primary',
            config: { type: 'navigate', route: '/employee/workspace/jobs/new?accountId={{id}}' },
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
        badge: { type: 'count', path: 'contacts.length' },
        sections: [
          {
            id: 'contacts-table',
            type: 'table',
            dataSource: { type: 'related', relation: 'contacts' },
            columns_config: [
              {
                id: 'name',
                header: 'Name',
                path: 'fullName',
                sortable: true,
                config: { avatar: true, avatarPath: 'avatarUrl' },
              },
              { id: 'title', header: 'Title', path: 'jobTitle' },
              { id: 'email', header: 'Email', path: 'email', type: 'email' },
              { id: 'phone', header: 'Phone', path: 'phone', type: 'phone' },
              { id: 'department', header: 'Department', path: 'department' },
              { id: 'isPrimary', header: '', path: 'isPrimary', type: 'primary-badge' },
              { id: 'lastContact', header: 'Last Contact', path: 'lastContactAt', type: 'datetime', config: { relative: true } },
            ],
            rowClick: { type: 'navigate', route: '/employee/workspace/contacts/{{id}}' },
            emptyState: {
              title: 'No contacts added',
              action: {
                label: 'Add Contact',
                type: 'modal',
                config: { type: 'modal', modal: 'contact-create', context: { accountId: '{{id}}' } },
              },
            },
          },
        ],
        actions: [
          {
            id: 'add-contact',
            label: 'Add Contact',
            type: 'modal',
            icon: 'UserPlus',
            variant: 'primary',
            config: { type: 'modal', modal: 'contact-create', context: { accountId: '{{id}}' } },
          },
        ],
      },

      // ==========================================
      // PLACEMENTS TAB
      // ==========================================
      {
        id: 'placements',
        label: 'Placements',
        icon: 'Award',
        badge: { type: 'count', path: 'placementsCount' },
        sections: [
          // Active Placements
          {
            id: 'active-placements',
            type: 'table',
            title: 'Active Placements',
            dataSource: {
              type: 'related',
              relation: 'placements',
              filter: { status: 'active' },
            },
            columns_config: [
              { id: 'candidate', header: 'Consultant', path: 'candidate.fullName' },
              { id: 'job', header: 'Position', path: 'job.title' },
              { id: 'startDate', header: 'Start Date', path: 'startDate', type: 'date' },
              { id: 'endDate', header: 'End Date', path: 'endDate', type: 'date' },
              { id: 'billRate', header: 'Bill Rate', path: 'billRate', type: 'currency' },
              { id: 'status', header: 'Status', path: 'status', type: 'placement-status-badge' },
            ],
            rowClick: { type: 'navigate', route: '/employee/workspace/placements/{{id}}' },
          },

          // Historical Placements
          {
            id: 'historical-placements',
            type: 'table',
            title: 'Past Placements',
            collapsible: true,
            defaultExpanded: false,
            dataSource: {
              type: 'related',
              relation: 'placements',
              filter: { status: { operator: 'in', value: ['completed', 'terminated'] } },
            },
            columns_config: [
              { id: 'candidate', header: 'Consultant', path: 'candidate.fullName' },
              { id: 'job', header: 'Position', path: 'job.title' },
              { id: 'startDate', header: 'Start', path: 'startDate', type: 'date' },
              { id: 'endDate', header: 'End', path: 'endDate', type: 'date' },
              { id: 'duration', header: 'Duration', path: 'durationMonths', config: { suffix: ' months' } },
              { id: 'status', header: 'Status', path: 'status', type: 'placement-status-badge' },
            ],
          },
        ],
      },

      // ==========================================
      // METRICS TAB
      // ==========================================
      {
        id: 'metrics',
        label: 'Metrics',
        icon: 'BarChart3',
        sections: [
          {
            id: 'performance-metrics',
            type: 'metrics-grid',
            title: 'Performance Metrics',
            columns: 3,
            fields: [
              { id: 'ytd-revenue', label: 'YTD Revenue', type: 'currency', path: 'metrics.ytdRevenue' },
              { id: 'total-placements', label: 'Total Placements', type: 'number', path: 'metrics.totalPlacements' },
              { id: 'avg-bill-rate', label: 'Avg Bill Rate', type: 'currency', path: 'metrics.avgBillRate' },
              { id: 'fill-rate', label: 'Fill Rate', type: 'percentage', path: 'metrics.fillRate' },
              { id: 'time-to-fill', label: 'Avg Time to Fill', type: 'number', path: 'metrics.avgTimeToFill', config: { suffix: ' days' } },
              { id: 'retention-rate', label: '90-Day Retention', type: 'percentage', path: 'metrics.retentionRate' },
            ],
          },
          {
            id: 'performance-chart',
            type: 'custom',
            title: 'Revenue Trend',
            component: 'AccountRevenueChart',
            componentProps: {
              period: 'quarterly',
              showComparison: true,
            },
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
            config: { type: 'modal', modal: 'log-activity' },
          },
        ],
      },

      // ==========================================
      // OWNERSHIP TAB
      // ==========================================
      {
        id: 'ownership',
        label: 'Ownership',
        icon: 'Shield',
        sections: [
          {
            id: 'raci-assignments',
            type: 'input-set',
            title: 'RACI Assignments',
            inputSet: 'RACIInputSet',
            readOnly: true,
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'edit',
      label: 'Edit Account',
      type: 'navigate',
      icon: 'Edit',
      variant: 'default',
      config: { type: 'navigate', route: '/employee/workspace/accounts/{{id}}/edit' },
    },
    {
      id: 'create-job',
      label: 'Create Job',
      type: 'navigate',
      icon: 'Briefcase',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/jobs/new?accountId={{id}}' },
    },
    {
      id: 'add-contact',
      label: 'Add Contact',
      type: 'modal',
      icon: 'UserPlus',
      variant: 'default',
      config: { type: 'modal', modal: 'contact-create', context: { accountId: '{{id}}' } },
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      type: 'modal',
      icon: 'Plus',
      variant: 'default',
      config: { type: 'modal', modal: 'log-activity' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Accounts', route: '/employee/workspace/accounts' },
      { label: { type: 'field', path: 'name' }, active: true },
    ],
  },
};

export default accountDetailScreen;
