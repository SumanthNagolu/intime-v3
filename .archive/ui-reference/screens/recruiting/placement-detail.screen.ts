/**
 * Placement Detail Screen
 *
 * Comprehensive placement view with check-ins, extensions, and financials.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const placementDetailScreen: ScreenDefinition = {
  id: 'placement-detail',
  type: 'detail',
  entityType: 'placement',
  title: { type: 'template', template: '{{candidate.fullName}} at {{job.account.name}}' },
  subtitle: { type: 'field', path: 'job.title' },
  icon: 'Award',

  dataSource: {
    type: 'entity',
    entityType: 'placement',
    entityId: { type: 'param', path: 'id' },
    include: [
      'candidate',
      'job',
      'job.account',
      'submission',
      'checkIns',
      'extensions',
      'timesheets',
      'activities',
      'objectOwners',
    ],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'placement-overview',
      title: 'Placement Overview',
      fields: [
        {
          id: 'status',
          type: 'field',
          path: 'status',
          label: 'Status',
          widget: 'PlacementStatusBadge',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        {
          id: 'candidate',
          type: 'field',
          path: 'candidate.fullName',
          label: 'Consultant',
          widget: 'EntityLink',
          config: { entityType: 'candidate', idPath: 'candidate.id' },
        },
        {
          id: 'account',
          type: 'field',
          path: 'job.account.name',
          label: 'Client',
          widget: 'EntityLink',
          config: { entityType: 'account', idPath: 'job.account.id' },
        },
        {
          id: 'job',
          type: 'field',
          path: 'job.title',
          label: 'Position',
          widget: 'EntityLink',
          config: { entityType: 'job', idPath: 'job.id' },
        },
        {
          id: 'divider-2',
          type: 'divider',
        },
        {
          id: 'start-date',
          type: 'field',
          path: 'startDate',
          label: 'Start Date',
          widget: 'DateDisplay',
        },
        {
          id: 'end-date',
          type: 'field',
          path: 'endDate',
          label: 'End Date',
          widget: 'DateDisplay',
          config: { highlightIfSoon: 30 },
        },
        {
          id: 'duration',
          type: 'field',
          path: 'durationMonths',
          label: 'Duration',
          config: { suffix: ' months' },
        },
        {
          id: 'days-remaining',
          type: 'field',
          path: 'daysRemaining',
          label: 'Days Remaining',
          widget: 'DaysRemainingIndicator',
        },
        {
          id: 'divider-3',
          type: 'divider',
        },
        {
          id: 'bill-rate',
          type: 'field',
          path: 'billRate',
          label: 'Bill Rate',
          widget: 'CurrencyDisplay',
        },
        {
          id: 'pay-rate',
          type: 'field',
          path: 'payRate',
          label: 'Pay Rate',
          widget: 'CurrencyDisplay',
          visible: { type: 'permission', permission: 'placement.rates.view' },
        },
        {
          id: 'margin',
          type: 'field',
          path: 'margin',
          label: 'Margin',
          widget: 'PercentageDisplay',
          visible: { type: 'permission', permission: 'placement.margin.view' },
        },
        {
          id: 'divider-4',
          type: 'divider',
        },
        {
          id: 'owner',
          type: 'field',
          path: 'owner.name',
          label: 'Owner',
          widget: 'UserAvatar',
        },
      ],
      footer: {
        type: 'metrics-row',
        metrics: [
          { label: 'Extensions', value: { type: 'field', path: 'extensionsCount' }, icon: 'RefreshCw' },
          { label: 'Check-ins', value: { type: 'field', path: 'checkInsCount' }, icon: 'CheckSquare' },
        ],
      },
      actions: [
        {
          id: 'call-consultant',
          label: 'Call',
          type: 'function',
          icon: 'Phone',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'function', handler: 'initiateCall', params: { phonePath: 'candidate.phone' } },
        },
        {
          id: 'email-consultant',
          label: 'Email',
          type: 'modal',
          icon: 'Mail',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'send-email', context: 'placement' },
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
          // Contract Details
          {
            id: 'contract-details',
            type: 'info-card',
            title: 'Contract Details',
            columns: 2,
            fields: [
              { type: 'field', path: 'contractType', label: 'Contract Type' },
              { type: 'field', path: 'workLocation', label: 'Work Location' },
              { type: 'field', path: 'remoteType', label: 'Work Type', widget: 'RemoteTypeBadge' },
              { type: 'field', path: 'reportingTo', label: 'Reports To' },
              { type: 'field', path: 'poNumber', label: 'PO Number' },
              { type: 'field', path: 'requisitionNumber', label: 'Req Number' },
            ],
          },

          // Compensation
          {
            id: 'compensation',
            type: 'input-set',
            title: 'Compensation',
            inputSet: 'RateCardInputSet',
            readOnly: true,
            visible: { type: 'permission', permission: 'placement.compensation.view' },
          },

          // Consultant Contact
          {
            id: 'consultant-contact',
            type: 'info-card',
            title: 'Consultant Contact',
            fields: [
              { type: 'field', path: 'candidate.email', label: 'Email', widget: 'EmailDisplay' },
              { type: 'field', path: 'candidate.phone', label: 'Phone', widget: 'PhoneDisplay' },
              { type: 'field', path: 'candidate.personalEmail', label: 'Personal Email', widget: 'EmailDisplay' },
              { type: 'field', path: 'candidate.emergencyContact', label: 'Emergency Contact' },
            ],
          },

          // Client Contacts
          {
            id: 'client-contacts',
            type: 'table',
            title: 'Client Contacts',
            dataSource: { type: 'related', relation: 'job.account.contacts' },
            columns_config: [
              { id: 'name', header: 'Name', path: 'fullName' },
              { id: 'title', header: 'Title', path: 'jobTitle' },
              { id: 'email', header: 'Email', path: 'email', type: 'email' },
              { id: 'phone', header: 'Phone', path: 'phone', type: 'phone' },
              { id: 'isPrimary', header: '', path: 'isPrimary', type: 'primary-badge' },
            ],
          },
        ],
      },

      // ==========================================
      // CHECK-INS TAB
      // ==========================================
      {
        id: 'checkins',
        label: 'Check-ins',
        icon: 'CheckSquare',
        badge: {
          type: 'conditional',
          condition: { field: 'nextCheckinOverdue', operator: 'eq', value: true },
          ifTrue: { value: '!', variant: 'warning' },
        },
        sections: [
          // Check-in Progress
          {
            id: 'checkin-progress',
            type: 'custom',
            component: 'CheckInProgressTracker',
            componentProps: {
              checkpoints: [
                { day: 30, label: '30-Day', required: true },
                { day: 60, label: '60-Day', required: true },
                { day: 90, label: '90-Day', required: true },
              ],
              startDate: { type: 'field', path: 'startDate' },
              checkIns: { type: 'field', path: 'checkIns' },
              showUpcoming: true,
            },
          },

          // Check-in History
          {
            id: 'checkin-history',
            type: 'table',
            title: 'Check-in History',
            dataSource: { type: 'related', relation: 'checkIns' },
            columns_config: [
              { id: 'type', header: 'Check-in', path: 'type', type: 'checkin-type-badge' },
              { id: 'date', header: 'Date', path: 'completedAt', type: 'date' },
              { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
              { id: 'rating', header: 'Rating', path: 'satisfactionRating', type: 'star-rating' },
              { id: 'notes', header: 'Notes', path: 'notes', type: 'truncated-text' },
              { id: 'completedBy', header: 'By', path: 'completedBy.name', type: 'user-avatar' },
            ],
            emptyState: {
              title: 'No check-ins yet',
              description: 'Check-ins help ensure placement success',
            },
          },
        ],
        actions: [
          {
            id: 'log-checkin',
            label: 'Log Check-in',
            type: 'modal',
            icon: 'CheckSquare',
            variant: 'primary',
            config: { type: 'modal', modal: 'placement-checkin' },
          },
        ],
      },

      // ==========================================
      // EXTENSIONS TAB
      // ==========================================
      {
        id: 'extensions',
        label: 'Extensions',
        icon: 'RefreshCw',
        badge: { type: 'count', path: 'extensionsCount' },
        sections: [
          {
            id: 'extensions-list',
            type: 'table',
            title: 'Extension History',
            dataSource: { type: 'related', relation: 'extensions' },
            columns_config: [
              { id: 'extension-number', header: '#', path: 'extensionNumber' },
              { id: 'original-end', header: 'Original End', path: 'originalEndDate', type: 'date' },
              { id: 'new-end', header: 'New End', path: 'newEndDate', type: 'date' },
              { id: 'duration', header: 'Extension', path: 'extensionMonths', config: { suffix: ' months' } },
              { id: 'rate-change', header: 'Rate Change', path: 'rateChange', type: 'percentage-change' },
              { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
              { id: 'approved-at', header: 'Approved', path: 'approvedAt', type: 'date' },
            ],
            emptyState: {
              title: 'No extensions',
              description: 'Extensions will appear here when processed',
            },
          },
        ],
        actions: [
          {
            id: 'request-extension',
            label: 'Request Extension',
            type: 'modal',
            icon: 'Plus',
            variant: 'primary',
            config: { type: 'modal', modal: 'placement-extension' },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'eq', value: 'active' },
            },
          },
        ],
      },

      // ==========================================
      // TIMESHEETS TAB
      // ==========================================
      {
        id: 'timesheets',
        label: 'Timesheets',
        icon: 'Clock',
        sections: [
          {
            id: 'timesheets-list',
            type: 'table',
            title: 'Timesheet History',
            dataSource: { type: 'related', relation: 'timesheets' },
            columns_config: [
              { id: 'period', header: 'Period', path: 'periodLabel' },
              { id: 'hours', header: 'Hours', path: 'totalHours', type: 'number' },
              { id: 'regular', header: 'Regular', path: 'regularHours', type: 'number' },
              { id: 'overtime', header: 'OT', path: 'overtimeHours', type: 'number' },
              { id: 'status', header: 'Status', path: 'status', type: 'timesheet-status-badge' },
              { id: 'submitted-at', header: 'Submitted', path: 'submittedAt', type: 'date' },
              { id: 'approved-at', header: 'Approved', path: 'approvedAt', type: 'date' },
            ],
            emptyState: {
              title: 'No timesheets',
              description: 'Timesheets will appear here if integrated',
            },
          },
        ],
      },

      // ==========================================
      // ISSUES TAB
      // ==========================================
      {
        id: 'issues',
        label: 'Issues',
        icon: 'AlertTriangle',
        badge: {
          type: 'count',
          path: 'openIssuesCount',
          variant: 'warning',
        },
        sections: [
          {
            id: 'issues-list',
            type: 'table',
            title: 'Flagged Issues',
            dataSource: { type: 'related', relation: 'issues' },
            columns_config: [
              { id: 'title', header: 'Issue', path: 'title' },
              { id: 'type', header: 'Type', path: 'type', type: 'issue-type-badge' },
              { id: 'severity', header: 'Severity', path: 'severity', type: 'severity-badge' },
              { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
              { id: 'reported-at', header: 'Reported', path: 'reportedAt', type: 'date' },
              { id: 'resolved-at', header: 'Resolved', path: 'resolvedAt', type: 'date' },
            ],
            emptyState: {
              title: 'No issues reported',
              description: 'Issues and concerns will appear here',
            },
          },
        ],
        actions: [
          {
            id: 'report-issue',
            label: 'Report Issue',
            type: 'modal',
            icon: 'AlertTriangle',
            variant: 'default',
            config: { type: 'modal', modal: 'placement-issue' },
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
    ],
  },

  actions: [
    {
      id: 'edit',
      label: 'Edit Placement',
      type: 'navigate',
      icon: 'Edit',
      variant: 'default',
      config: { type: 'navigate', route: '/employee/workspace/placements/{{id}}/edit' },
    },
    {
      id: 'log-checkin',
      label: 'Log Check-in',
      type: 'modal',
      icon: 'CheckSquare',
      variant: 'primary',
      config: { type: 'modal', modal: 'placement-checkin' },
      visible: { field: 'status', operator: 'eq', value: 'active' },
    },
    {
      id: 'extend',
      label: 'Extend',
      type: 'modal',
      icon: 'RefreshCw',
      variant: 'default',
      config: { type: 'modal', modal: 'placement-extension' },
      visible: { field: 'status', operator: 'eq', value: 'active' },
    },
    {
      id: 'terminate',
      label: 'Terminate',
      type: 'modal',
      icon: 'XCircle',
      variant: 'destructive',
      config: { type: 'modal', modal: 'placement-terminate' },
      visible: { field: 'status', operator: 'eq', value: 'active' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Placements', route: '/employee/workspace/placements' },
      { label: { type: 'field', path: 'candidate.fullName' }, active: true },
    ],
  },
};

export default placementDetailScreen;
