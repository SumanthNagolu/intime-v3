/**
 * Job Order List Screen Definition
 *
 * Metadata-driven screen for listing and managing external Job Orders from vendors.
 * These are job opportunities that bench consultants can be submitted to.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const JOB_ORDER_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'filled', label: 'Filled' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'closed', label: 'Closed' },
];

const JOB_ORDER_PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

const WORK_MODE_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const jobOrderTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'title',
    label: 'Job Title',
    path: 'title',
    type: 'text',
    sortable: true,
    width: '250px',
  },
  {
    id: 'clientName',
    label: 'End Client',
    path: 'clientName',
    type: 'text',
  },
  {
    id: 'vendorName',
    label: 'Vendor',
    path: 'vendor.name',
    type: 'text',
  },
  {
    id: 'location',
    label: 'Location',
    path: 'location',
    type: 'text',
  },
  {
    id: 'workMode',
    label: 'Work Mode',
    path: 'workMode',
    type: 'enum',
    config: {
      options: WORK_MODE_OPTIONS,
      badgeColors: {
        remote: 'green',
        hybrid: 'blue',
        onsite: 'purple',
      },
    },
  },
  {
    id: 'billRate',
    label: 'Rate',
    path: 'billRate',
    type: 'currency',
    sortable: true,
    config: { suffix: '/hr' },
  },
  {
    id: 'positions',
    label: 'Positions',
    path: 'positions',
    type: 'number',
    width: '80px',
  },
  {
    id: 'submissionCount',
    label: 'Submissions',
    path: 'submissionCount',
    type: 'number',
    width: '100px',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: JOB_ORDER_STATUS_OPTIONS,
      badgeColors: {
        open: 'green',
        filled: 'purple',
        on_hold: 'yellow',
        closed: 'gray',
      },
    },
  },
  {
    id: 'priority',
    label: 'Priority',
    path: 'priority',
    type: 'enum',
    sortable: true,
    config: {
      options: JOB_ORDER_PRIORITY_OPTIONS,
      badgeColors: {
        urgent: 'red',
        high: 'orange',
        normal: 'blue',
        low: 'gray',
      },
    },
  },
  {
    id: 'postedAt',
    label: 'Posted',
    path: 'postedAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const jobOrderListScreen: ScreenDefinition = {
  id: 'job-order-list',
  type: 'list',
  entityType: 'job_order',

  title: 'Job Orders',
  subtitle: 'Browse and submit consultants to vendor job orders',
  icon: 'Briefcase',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'job_order',
    procedure: 'bench.jobOrders.list',
    defaultSort: { field: 'postedAt', direction: 'desc' },
    defaultPageSize: 25,
  },

  // Layout
  layout: {
    type: 'list',
    sections: [
      // Metrics row
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'totalOrders',
            label: 'Total Orders',
            type: 'number',
            path: 'stats.total',
          },
          {
            id: 'openOrders',
            label: 'Open',
            type: 'number',
            path: 'stats.open',
          },
          {
            id: 'urgentOrders',
            label: 'Urgent',
            type: 'number',
            path: 'stats.urgent',
          },
          {
            id: 'submissionsThisWeek',
            label: 'Submissions (Week)',
            type: 'number',
            path: 'stats.submissionsThisWeek',
          },
          {
            id: 'placements',
            label: 'Placements',
            type: 'number',
            path: 'stats.placements',
          },
        ],
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.jobOrders.getStats',
          },
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        layout: 'horizontal',
        fields: [
          {
            id: 'search',
            label: 'Search',
            type: 'text',
            path: 'search',
            config: { placeholder: 'Search job titles...' },
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            options: JOB_ORDER_STATUS_OPTIONS,
          },
          {
            id: 'priority',
            label: 'Priority',
            type: 'multiselect',
            path: 'filters.priority',
            options: JOB_ORDER_PRIORITY_OPTIONS,
          },
          {
            id: 'workMode',
            label: 'Work Mode',
            type: 'multiselect',
            path: 'filters.workMode',
            options: WORK_MODE_OPTIONS,
          },
          {
            id: 'vendorId',
            label: 'Vendor',
            type: 'select',
            path: 'filters.vendorId',
            config: {
              entityType: 'vendor',
              displayField: 'name',
            },
          },
        ],
      },
      // Table
      {
        id: 'job-orders-table',
        type: 'table',
        columns_config: jobOrderTableColumns,
        selectable: true,
        pagination: { defaultPageSize: 25 },
        rowClick: {
          type: 'navigate',
          route: '/employee/bench/job-orders/{{id}}',
        },
        rowActions: [
          {
            id: 'view',
            label: 'View Details',
            icon: 'Eye',
            type: 'navigate',
            config: {
              type: 'navigate',
              route: '/employee/bench/job-orders/{{id}}',
            },
          },
          {
            id: 'submit-consultant',
            label: 'Submit Consultant',
            icon: 'UserPlus',
            type: 'modal',
            config: {
              type: 'modal',
              modal: 'SubmitConsultantModal',
              props: { jobOrderId: '{{id}}' },
            },
          },
          {
            id: 'find-matches',
            label: 'Find Matches',
            icon: 'Search',
            type: 'modal',
            config: {
              type: 'modal',
              modal: 'FindMatchingCandidatesModal',
              props: { jobOrderId: '{{id}}' },
            },
          },
          {
            id: 'edit',
            label: 'Edit',
            icon: 'Pencil',
            type: 'navigate',
            config: {
              type: 'navigate',
              route: '/employee/bench/job-orders/{{id}}/edit',
            },
          },
          {
            id: 'close',
            label: 'Close',
            icon: 'X',
            type: 'mutation',
            config: {
              type: 'mutation',
              procedure: 'bench.jobOrders.close',
              input: { id: '{{id}}' },
            },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'eq', value: 'open' },
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
      label: 'Add Job Order',
      type: 'navigate',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'navigate',
        route: '/employee/bench/job-orders/new',
      },
    },
    {
      id: 'find-matches',
      label: 'Find Matches',
      type: 'modal',
      variant: 'secondary',
      icon: 'Search',
      config: {
        type: 'modal',
        modal: 'FindMatchingCandidatesModal',
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      variant: 'secondary',
      icon: 'Download',
      config: {
        type: 'custom',
        handler: 'handleExport',
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Dashboard',
      route: '/employee/bench',
    },
    breadcrumbs: [
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Job Orders' },
    ],
  },
};

export default jobOrderListScreen;
