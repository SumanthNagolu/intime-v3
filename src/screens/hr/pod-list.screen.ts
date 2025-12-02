/**
 * Pod List Screen Definition
 *
 * Metadata-driven screen for managing HR pods/teams.
 */

import type { ScreenDefinition } from '@/lib/metadata';

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
// SCREEN DEFINITION
// ==========================================

export const podListScreen: ScreenDefinition = {
  id: 'pod-list',
  type: 'list',
  entityType: 'pod',

  title: 'Pods / Teams',
  subtitle: 'Manage recruiting and bench sales pods',
  icon: 'Users2',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'pod',
    sort: { field: 'name', direction: 'asc' },
    pagination: true,
    limit: 25,
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
          { id: 'totalPlacements', label: 'Placements (MTD)', type: 'number', path: 'stats.totalPlacements' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'pod',
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        fields: [
          { id: 'search', label: 'Search', type: 'text', path: 'search', config: { placeholder: 'Search pods...' } },
          { id: 'type', label: 'Type', type: 'multiselect', path: 'filters.type', options: [...POD_TYPE_OPTIONS] },
          { id: 'status', label: 'Status', type: 'select', path: 'filters.status', options: [...POD_STATUS_OPTIONS] },
        ],
      },
      // Table
      {
        id: 'pods-table',
        type: 'table',
        columns_config: [
          { id: 'name', label: 'Pod Name', path: 'name', type: 'text', sortable: true },
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
          { id: 'senior', label: 'Senior (Manager)', path: 'seniorMember.fullName', type: 'text' },
          { id: 'junior', label: 'Junior (Recruiter)', path: 'juniorMember.fullName', type: 'text' },
          { id: 'activeJobs', label: 'Active Jobs', path: 'activeJobsCount', type: 'number', sortable: true },
          { id: 'placements', label: 'Placements', path: 'placementsMTD', type: 'number', sortable: true },
          { id: 'revenue', label: 'Revenue', path: 'revenueMTD', type: 'currency', sortable: true },
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
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create',
      label: 'Create Pod',
      type: 'modal',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'CreatePodModal',
      },
    },
    {
      id: 'performance-report',
      label: 'Performance Report',
      type: 'custom',
      variant: 'secondary',
      icon: 'BarChart',
      config: {
        type: 'custom',
        handler: 'handlePerformanceReport',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Pods' },
    ],
  },
};

export default podListScreen;
