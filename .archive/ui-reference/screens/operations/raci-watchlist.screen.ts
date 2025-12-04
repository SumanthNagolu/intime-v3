/**
 * RACI Watchlist Screen
 *
 * Shows items where manager is Consulted (C) or Informed (I).
 * Per RACI model, manager is C on ALL pod objects.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const raciWatchlistScreen: ScreenDefinition = {
  id: 'raci-watchlist',
  type: 'list',
  entityType: 'raci_item',
  title: 'RACI Watchlist',
  subtitle: 'Items requiring your input or information',
  icon: 'Eye',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'awaitingInput', procedure: 'manager.getAwaitingInput' },
      { key: 'recentlyConsulted', procedure: 'manager.getRecentlyConsulted' },
      { key: 'informedItems', procedure: 'manager.getInformedItems' },
      { key: 'summary', procedure: 'manager.getRACISummary' },
    ],
  },

  layout: {
    type: 'tabs',
    tabs: [
      // ===========================================
      // TAB 1: AWAITING MY INPUT
      // ===========================================
      {
        id: 'awaiting-input',
        label: 'Awaiting My Input',
        icon: 'MessageCircle',
        badge: { type: 'field', path: 'awaitingInput.length' },
        sections: [
          {
            id: 'awaiting-alert',
            type: 'custom',
            component: 'AlertCard',
            componentProps: {
              type: 'info',
              title: 'Awaiting Your Input',
              description: 'These items need your consultation before the IC can proceed.',
            },
            visible: {
              type: 'condition',
              condition: { field: 'awaitingInput.length', operator: 'gt', value: 0 },
            },
          },
          {
            id: 'awaiting-input-table',
            type: 'table',
            dataSource: { type: 'field', path: 'awaitingInput' },
            columns_config: [
              {
                id: 'priority',
                header: '',
                path: 'priority',
                type: 'status-indicator',
                width: '30px',
                config: { colors: { high: 'red', medium: 'yellow', low: 'gray' } },
              },
              {
                id: 'entity-type',
                header: 'Type',
                path: 'entityType',
                type: 'enum',
                config: {
                  options: [
                    { value: 'job', label: 'Job', color: 'blue' },
                    { value: 'candidate', label: 'Candidate', color: 'green' },
                    { value: 'submission', label: 'Submission', color: 'purple' },
                    { value: 'account', label: 'Account', color: 'orange' },
                    { value: 'deal', label: 'Deal', color: 'cyan' },
                  ],
                },
                width: '100px',
              },
              {
                id: 'title',
                header: 'Item',
                path: 'title',
                type: 'link',
                config: { linkPattern: '{{entityUrl}}' },
              },
              {
                id: 'ic',
                header: 'IC',
                path: 'owner.fullName',
                type: 'user',
              },
              {
                id: 'input-needed',
                header: 'Input Needed',
                path: 'inputDescription',
                type: 'text',
              },
              {
                id: 'requested-at',
                header: 'Requested',
                path: 'requestedAt',
                type: 'relative-time',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                width: '120px',
                config: {
                  actions: [
                    {
                      id: 'provide-input',
                      label: 'Provide Input',
                      icon: 'MessageSquare',
                      type: 'modal',
                    config: { type: 'modal', modal: 'provide-raci-input' },
                    },
                    {
                      id: 'view',
                      label: 'View',
                      icon: 'Eye',
                      type: 'navigate',
                    config: { type: 'navigate', route: '{{entityUrl}}' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      // ===========================================
      // TAB 2: RECENTLY CONSULTED
      // ===========================================
      {
        id: 'recently-consulted',
        label: 'Recently Consulted',
        icon: 'CheckCircle',
        sections: [
          {
            id: 'recently-consulted-table',
            type: 'table',
            title: 'Items Where You Provided Input',
            description: 'Consultation provided in the last 14 days',
            dataSource: { type: 'field', path: 'recentlyConsulted' },
            columns_config: [
              {
                id: 'entity-type',
                header: 'Type',
                path: 'entityType',
                type: 'enum',
                config: {
                  options: [
                    { value: 'job', label: 'Job', color: 'blue' },
                    { value: 'candidate', label: 'Candidate', color: 'green' },
                    { value: 'submission', label: 'Submission', color: 'purple' },
                    { value: 'account', label: 'Account', color: 'orange' },
                    { value: 'deal', label: 'Deal', color: 'cyan' },
                  ],
                },
              },
              {
                id: 'title',
                header: 'Item',
                path: 'title',
                type: 'link',
                config: { linkPattern: '{{entityUrl}}' },
              },
              {
                id: 'ic',
                header: 'IC',
                path: 'owner.fullName',
                type: 'user',
              },
              {
                id: 'input-summary',
                header: 'Your Input',
                path: 'inputSummary',
                type: 'text',
              },
              {
                id: 'consulted-at',
                header: 'Consulted',
                path: 'consultedAt',
                type: 'relative-time',
              },
              {
                id: 'current-status',
                header: 'Current Status',
                path: 'currentStatus',
                type: 'enum',
                config: {
                  options: [
                    { value: 'pending', label: 'Pending', color: 'yellow' },
                    { value: 'in_progress', label: 'In Progress', color: 'blue' },
                    { value: 'completed', label: 'Completed', color: 'green' },
                    { value: 'blocked', label: 'Blocked', color: 'red' },
                  ],
                },
              },
            ],
          },
        ],
      },

      // ===========================================
      // TAB 3: INFORMED ITEMS
      // ===========================================
      {
        id: 'informed',
        label: 'Informed',
        icon: 'Info',
        badge: { type: 'field', path: 'summary.unreadInformed' },
        sections: [
          {
            id: 'informed-items-table',
            type: 'table',
            title: 'Items You\'re Informed About',
            description: 'Updates and status changes from your pod',
            dataSource: { type: 'field', path: 'informedItems' },
            columns_config: [
              {
                id: 'read-indicator',
                header: '',
                path: 'isRead',
                type: 'unread-indicator',
                width: '30px',
              },
              {
                id: 'entity-type',
                header: 'Type',
                path: 'entityType',
                type: 'enum',
                config: {
                  options: [
                    { value: 'job', label: 'Job', color: 'blue' },
                    { value: 'candidate', label: 'Candidate', color: 'green' },
                    { value: 'submission', label: 'Submission', color: 'purple' },
                    { value: 'placement', label: 'Placement', color: 'emerald' },
                    { value: 'account', label: 'Account', color: 'orange' },
                  ],
                },
              },
              {
                id: 'title',
                header: 'Item',
                path: 'title',
                type: 'link',
                config: { linkPattern: '{{entityUrl}}' },
              },
              {
                id: 'update',
                header: 'Update',
                path: 'updateDescription',
                type: 'text',
              },
              {
                id: 'ic',
                header: 'By',
                path: 'actor.fullName',
                type: 'user',
              },
              {
                id: 'informed-at',
                header: 'When',
                path: 'informedAt',
                type: 'relative-time',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                width: '80px',
                config: {
                  actions: [
                    {
                      id: 'mark-read',
                      label: 'Mark Read',
                      icon: 'Check',
                      type: 'mutation',
                    config: { type: 'mutation', procedure: 'manager.markInformedRead' },
                      visible: {
                        type: 'condition',
                        condition: { field: 'isRead', operator: 'eq', value: false },
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },

      // ===========================================
      // TAB 4: ALL ACTIVITY
      // ===========================================
      {
        id: 'all-activity',
        label: 'All Activity',
        icon: 'Activity',
        sections: [
          {
            id: 'activity-feed',
            type: 'custom',
            title: 'Pod Activity Feed',
            component: 'RACIActivityFeed',
            componentProps: {
              showFilters: true,
              filters: [
                { id: 'all', label: 'All' },
                { id: 'consulted', label: 'Consulted (C)' },
                { id: 'informed', label: 'Informed (I)' },
              ],
              entityTypeFilters: [
                { id: 'job', label: 'Jobs' },
                { id: 'candidate', label: 'Candidates' },
                { id: 'submission', label: 'Submissions' },
                { id: 'placement', label: 'Placements' },
                { id: 'account', label: 'Accounts' },
              ],
              groupByDay: true,
              maxItems: 50,
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'mark-all-read',
      label: 'Mark All Read',
      type: 'mutation',
      icon: 'CheckCheck',
      variant: 'secondary',
      config: { type: 'mutation', procedure: 'manager.markAllInformedRead' },
    },
    {
      id: 'settings',
      label: 'Notification Settings',
      type: 'modal',
      icon: 'Settings',
      variant: 'ghost',
      config: { type: 'modal', modal: 'raci-notification-settings' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: 'RACI Watchlist', active: true },
    ],
  },
};

export default raciWatchlistScreen;
