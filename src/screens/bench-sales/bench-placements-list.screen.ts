/**
 * Bench Placements List Screen
 *
 * List of consultant placements with:
 * - Own + Team view (per 00-OVERVIEW.md)
 * - 30/60/90 day check-in indicators
 * - Rate/margin tracking
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md Section 5.4
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

// ==========================================
// OPTIONS
// ==========================================

const PLACEMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Start' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
];

const CONTRACT_TYPE_OPTIONS = [
  { value: 'c2c', label: 'C2C' },
  { value: 'w2', label: 'W2' },
  { value: '1099', label: '1099' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const placementsTableColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'checkInStatus',
    label: '',
    path: 'checkInStatus',
    type: 'custom',
    width: '40px',
    config: { component: 'CheckInStatusIndicator' },
  },
  {
    id: 'consultant',
    label: 'Consultant',
    path: 'consultant.fullName',
    type: 'text',
    sortable: true,
    width: '180px',
    config: {
      link: true,
      linkPath: '/employee/bench/consultants/{{consultantId}}',
      avatar: true,
      avatarPath: 'consultant.avatarUrl',
    },
  },
  {
    id: 'vendor',
    label: 'Vendor',
    path: 'vendor.name',
    type: 'text',
    sortable: true,
  },
  {
    id: 'client',
    label: 'End Client',
    path: 'clientName',
    type: 'text',
  },
  {
    id: 'role',
    label: 'Role',
    path: 'role',
    type: 'text',
  },
  {
    id: 'contractType',
    label: 'Contract',
    path: 'contractType',
    type: 'enum',
    config: {
      options: CONTRACT_TYPE_OPTIONS,
      badgeColors: {
        c2c: 'purple',
        w2: 'blue',
        '1099': 'green',
      },
    },
  },
  {
    id: 'billRate',
    label: 'Bill Rate',
    path: 'billRate',
    type: 'currency',
    sortable: true,
    config: { suffix: '/hr' },
  },
  {
    id: 'margin',
    label: 'Margin',
    path: 'margin',
    type: 'currency',
    config: { suffix: '/hr' },
  },
  {
    id: 'marginPercent',
    label: 'Margin %',
    path: 'marginPercent',
    type: 'number',
    config: { suffix: '%' },
  },
  {
    id: 'startDate',
    label: 'Start',
    path: 'startDate',
    type: 'date',
    sortable: true,
  },
  {
    id: 'endDate',
    label: 'End',
    path: 'endDate',
    type: 'date',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: PLACEMENT_STATUS_OPTIONS,
      badgeColors: {
        pending: 'yellow',
        active: 'green',
        on_hold: 'orange',
        completed: 'blue',
        terminated: 'red',
      },
    },
  },
  {
    id: 'daysActive',
    label: 'Days Active',
    path: 'daysActive',
    type: 'number',
    sortable: true,
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const benchPlacementsListScreen: ScreenDefinition = {
  id: 'bench-placements-list',
  type: 'list',
  entityType: 'placement',

  title: 'Placements',
  subtitle: 'Track consultant placements and check-ins',
  icon: 'UserCheck',

  dataSource: {
    type: 'list',
    entityType: 'placement',
    sort: { field: 'startDate', direction: 'desc' },
    pageSize: 25,
  },

  layout: {
    type: 'single-column',
    sections: [
      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'activePlacements',
            label: 'Active Placements',
            type: 'number',
            path: 'stats.active',
          },
          {
            id: 'pendingStart',
            label: 'Pending Start',
            type: 'number',
            path: 'stats.pending',
          },
          {
            id: 'endingSoon',
            label: 'Ending Soon (30d)',
            type: 'number',
            path: 'stats.endingSoon',
            config: { variant: 'warning' },
          },
          {
            id: 'checkInsDue',
            label: 'Check-ins Due',
            type: 'number',
            path: 'stats.checkInsDue',
            config: { variant: 'warning' },
          },
          {
            id: 'monthlyRevenue',
            label: 'Monthly Revenue',
            type: 'currency',
            path: 'stats.monthlyRevenue',
          },
          {
            id: 'avgMargin',
            label: 'Avg Margin',
            type: 'number',
            path: 'stats.avgMarginPercent',
            config: { suffix: '%' },
          },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'placement',
        },
      },

      // Check-in Legend
      {
        id: 'checkin-legend',
        type: 'custom',
        component: 'CheckInLegend',
        componentProps: {
          checkIns: [
            { day: 30, label: '30-Day Check-in', icon: 'Circle' },
            { day: 60, label: '60-Day Check-in', icon: 'Circle' },
            { day: 90, label: '90-Day Check-in', icon: 'Circle' },
          ],
          statuses: [
            { value: 'pending', label: 'Pending', color: 'yellow' },
            { value: 'completed', label: 'Completed', color: 'green' },
            { value: 'overdue', label: 'Overdue', color: 'red' },
          ],
        },
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
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            options: PLACEMENT_STATUS_OPTIONS,
          },
          {
            id: 'contractType',
            label: 'Contract Type',
            type: 'multiselect',
            path: 'filters.contractType',
            options: CONTRACT_TYPE_OPTIONS,
          },
          {
            id: 'vendorId',
            label: 'Vendor',
            type: 'select',
            path: 'filters.vendorId',
            config: { entityType: 'vendor', displayField: 'name' },
          },
          {
            id: 'dateFrom',
            label: 'Date From',
            type: 'date',
            path: 'filters.dateFrom',
          },
          {
            id: 'dateTo',
            label: 'Date To',
            type: 'date',
            path: 'filters.dateTo',
          },
          {
            id: 'checkInsDue',
            label: 'Check-ins Due Only',
            type: 'boolean',
            path: 'filters.checkInsDue',
          },
        ],
      },

      // Table
      {
        id: 'placements-table',
        type: 'table',
        columns_config: placementsTableColumns,
        actions: [
          {
            id: 'view',
            label: 'View Details',
            icon: 'Eye',
            type: 'navigate',
            config: { type: 'navigate', route: '/employee/bench/placements/{{id}}' },
          },
          {
            id: 'check-in',
            label: 'Record Check-in',
            icon: 'CheckCircle',
            type: 'modal',
            config: { type: 'modal', modal: 'placement-check-in', props: { placementId: '{{id}}' } },
          },
          {
            id: 'extend',
            label: 'Request Extension',
            icon: 'Calendar',
            type: 'modal',
            config: { type: 'modal', modal: 'placement-extension', props: { placementId: '{{id}}' } },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'eq', value: 'active' },
            },
          },
          {
            id: 'end',
            label: 'End Placement',
            icon: 'X',
            type: 'modal',
            variant: 'destructive',
            config: { type: 'modal', modal: 'end-placement', props: { placementId: '{{id}}' } },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'eq', value: 'active' },
            },
          },
        ],
        emptyState: {
          title: 'No placements found',
          description: 'Placements will appear here when consultants are placed',
        },
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'New Placement',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'create-placement' },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'custom', handler: 'exportPlacements' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Placements', active: true },
    ],
  },
};

export default benchPlacementsListScreen;
