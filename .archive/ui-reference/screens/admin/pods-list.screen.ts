/**
 * Pods List Screen Definition (Admin)
 *
 * Admin screen for viewing and managing all pods in the organization.
 * Shows pods grouped by type with performance metrics.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const POD_TYPE_OPTIONS = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'ta', label: 'Talent Acquisition' },
];

const POD_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const podsTableColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Pod Name',
    path: 'name',
    type: 'text',
    sortable: true,
    width: '180px',
  },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    sortable: true,
    config: {
      options: POD_TYPE_OPTIONS,
      badgeColors: { recruiting: 'blue', bench_sales: 'purple', ta: 'cyan' },
    },
  },
  {
    id: 'manager',
    label: 'Manager',
    path: 'seniorMember.fullName',
    type: 'text',
    config: {
      avatar: { path: 'seniorMember.avatarUrl', fallback: 'initials' },
    },
  },
  {
    id: 'members',
    label: 'Members',
    path: 'memberCount',
    type: 'number',
    sortable: true,
    config: { suffix: ' / {{maxMembers}}' },
  },
  {
    id: 'placements',
    label: 'Placements (MTD)',
    path: 'placementsMTD',
    type: 'number',
    sortable: true,
    config: { target: { path: 'placementsTarget' } },
  },
  {
    id: 'revenue',
    label: 'Revenue (MTD)',
    path: 'revenueMTD',
    type: 'currency',
    sortable: true,
    config: { target: { path: 'revenueTarget' } },
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: POD_STATUS_OPTIONS,
      badgeColors: { active: 'green', inactive: 'gray' },
    },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const adminPodsListScreen: ScreenDefinition = {
  id: 'admin-pods-list',
  type: 'list',
  entityType: 'pod',

  title: 'Pods / Teams',
  subtitle: 'Manage organizational pods and team structure',
  icon: 'Users2',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'pod',
    sort: { field: 'type', direction: 'asc' },
    pagination: false,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Metrics row
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'totalPods', label: 'Total Pods', type: 'number', path: 'stats.total' },
          { id: 'recruitingPods', label: 'Recruiting', type: 'number', path: 'stats.recruiting' },
          { id: 'benchSalesPods', label: 'Bench Sales', type: 'number', path: 'stats.benchSales' },
          { id: 'taPods', label: 'TA', type: 'number', path: 'stats.ta' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'pod',
        },
      },
      // Type Tabs
      {
        id: 'type-tabs',
        type: 'custom',
        component: 'StatusTabs',
        componentProps: {
          tabs: [
            { id: 'all', label: 'All Pods', countPath: 'stats.total' },
            { id: 'recruiting', label: 'Recruiting', countPath: 'stats.recruiting' },
            { id: 'bench_sales', label: 'Bench Sales', countPath: 'stats.benchSales' },
            { id: 'ta', label: 'Talent Acquisition', countPath: 'stats.ta' },
          ],
        },
      },
      // Pod Cards Grid (alternative view)
      {
        id: 'pods-grid',
        type: 'custom',
        component: 'PodCardsGrid',
        componentProps: {
          showPerformance: true,
          showMembers: true,
          cardActions: ['view', 'edit'],
        },
        visible: { field: 'viewMode', operator: 'eq', value: 'cards' },
      },
      // Table View
      {
        id: 'pods-table',
        type: 'table',
        columns_config: podsTableColumns,
        rowClick: {
          type: 'navigate',
          route: '/admin/pods/{{id}}',
        },
        rowActions: [
          {
            id: 'view',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/admin/pods/{{id}}' },
          },
          {
            id: 'edit',
            type: 'modal',
            label: 'Edit',
            icon: 'Pencil',
            config: { type: 'modal', modal: 'EditPodModal' },
          },
          {
            id: 'add-member',
            type: 'modal',
            label: 'Add Member',
            icon: 'UserPlus',
            config: { type: 'modal', modal: 'AddPodMemberModal' },
          },
          {
            id: 'deactivate',
            type: 'mutation',
            label: 'Deactivate',
            icon: 'XCircle',
            variant: 'destructive',
            config: { type: 'mutation', procedure: 'admin.pods.deactivate' },
            confirm: {
              title: 'Deactivate Pod',
              message: 'Members will need to be reassigned. Are you sure?',
              destructive: true,
            },
            visible: { field: 'status', operator: 'eq', value: 'active' },
          },
        ],
        visible: { field: 'viewMode', operator: 'neq', value: 'cards' },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create',
      type: 'navigate',
      label: 'Create Pod',
      variant: 'primary',
      icon: 'Plus',
      config: { type: 'navigate', route: '/admin/pods/new' },
    },
    {
      id: 'toggle-view',
      type: 'custom',
      label: 'Toggle View',
      variant: 'outline',
      icon: 'Grid',
      config: { type: 'custom', handler: 'toggleViewMode' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportPods' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Admin', route: '/admin' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Pods' },
    ],
  },
};

export default adminPodsListScreen;
