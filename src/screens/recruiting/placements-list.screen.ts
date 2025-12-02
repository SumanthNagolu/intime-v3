/**
 * Placements List Screen
 *
 * List of active and historical placements with check-in tracking.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const placementsListScreen: ScreenDefinition = {
  id: 'placements-list',
  type: 'list',
  entityType: 'placement',
  title: 'Placements',
  icon: 'Award',

  dataSource: {
    type: 'list',
    entityType: 'placement',
    pagination: true,
    pageSize: 25,
    sort: { field: 'start_date', direction: 'desc' },
    include: ['candidate', 'job', 'job.account', 'checkIns'],
  },

  layout: {
    type: 'single-column',
    sections: [
      // Summary Stats
      {
        id: 'placement-stats',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'active',
            label: 'Active',
            type: 'number',
            path: 'stats.active',
            config: { icon: 'Users', color: 'success' },
          },
          {
            id: 'due-checkin',
            label: 'Due for Check-in',
            type: 'number',
            path: 'stats.dueForCheckin',
            config: { icon: 'Clock', color: 'warning' },
          },
          {
            id: 'ending-soon',
            label: 'Ending in 30 Days',
            type: 'number',
            path: 'stats.endingSoon',
            config: { icon: 'Calendar' },
          },
          {
            id: 'ytd-revenue',
            label: 'YTD Revenue',
            type: 'currency',
            path: 'stats.ytdRevenue',
            config: { icon: 'DollarSign' },
          },
        ],
      },

      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'search',
            type: 'text',
            path: 'filters.search',
            placeholder: 'Search placements...',
            config: { icon: 'Search' },
          },
          {
            id: 'status',
            type: 'multiselect',
            path: 'filters.status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Pending Start' },
              { value: 'active', label: 'Active' },
              { value: 'extended', label: 'Extended' },
              { value: 'completed', label: 'Completed' },
              { value: 'terminated', label: 'Terminated' },
            ],
          },
          {
            id: 'account',
            type: 'select',
            path: 'filters.accountId',
            label: 'Client',
            placeholder: 'All Clients',
            optionsSource: { type: 'entity', entityType: 'account' },
            config: { searchable: true },
          },
          {
            id: 'checkin-status',
            type: 'select',
            path: 'filters.checkinStatus',
            label: 'Check-in Status',
            options: [
              { value: 'due', label: 'Due for Check-in' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'up_to_date', label: 'Up to Date' },
            ],
          },
          {
            id: 'end-date',
            type: 'select',
            path: 'filters.endDate',
            label: 'End Date',
            options: [
              { value: 'ending_this_week', label: 'Ending This Week' },
              { value: 'ending_this_month', label: 'Ending This Month' },
              { value: 'ending_in_30', label: 'Ending in 30 Days' },
              { value: 'ended', label: 'Already Ended' },
            ],
          },
          {
            id: 'my-placements-only',
            type: 'boolean',
            path: 'filters.myPlacementsOnly',
            label: 'My Placements',
          },
        ],
      },

      // Placements Table
      {
        id: 'placements-table',
        type: 'table',
        columns_config: [
          {
            id: 'candidate',
            header: 'Consultant',
            path: 'candidate.fullName',
            sortable: true,
            width: '18%',
            config: {
              link: true,
              linkPath: '/employee/workspace/candidates/{{candidate.id}}',
              avatar: true,
              avatarPath: 'candidate.avatarUrl',
            },
          },
          {
            id: 'account',
            header: 'Client',
            path: 'job.account.name',
            sortable: true,
            config: {
              link: true,
              linkPath: '/employee/workspace/accounts/{{job.account.id}}',
            },
          },
          {
            id: 'job',
            header: 'Position',
            path: 'job.title',
            config: {
              link: true,
              linkPath: '/employee/workspace/jobs/{{job.id}}',
            },
          },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'placement-status-badge',
            sortable: true,
          },
          {
            id: 'start-date',
            header: 'Start',
            path: 'startDate',
            type: 'date',
            sortable: true,
          },
          {
            id: 'end-date',
            header: 'End',
            path: 'endDate',
            type: 'date',
            sortable: true,
            config: { highlightIfSoon: 30 },
          },
          {
            id: 'bill-rate',
            header: 'Bill Rate',
            path: 'billRate',
            type: 'currency',
            sortable: true,
          },
          {
            id: 'pay-rate',
            header: 'Pay Rate',
            path: 'payRate',
            type: 'currency',
            visible: { type: 'permission', permission: 'placement.rates.view' },
          },
          {
            id: 'checkin-indicator',
            header: 'Check-in',
            path: 'nextCheckin',
            type: 'checkin-indicator',
            config: {
              checkpoints: ['30day', '60day', '90day'],
              showDue: true,
            },
          },
          {
            id: 'owner',
            header: 'Owner',
            path: 'owner.name',
            type: 'user-avatar',
          },
        ],
        selectable: true,
        rowClick: { type: 'navigate', route: '/employee/workspace/placements/{{id}}' },
        emptyState: {
          title: 'No placements found',
          description: 'Placements are created when candidates accept offers',
        },
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'Create Placement',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'placement-create' },
    },
    {
      id: 'bulk-checkin',
      label: 'Log Check-in',
      type: 'modal',
      icon: 'CheckCircle',
      variant: 'default',
      config: { type: 'modal', modal: 'placement-checkin' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'function',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'function', handler: 'exportPlacements' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Placements', active: true },
    ],
  },
};

export default placementsListScreen;
