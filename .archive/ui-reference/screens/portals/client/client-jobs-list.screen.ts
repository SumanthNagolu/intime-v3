/**
 * Client Jobs List Screen
 *
 * Client's job orders with filtering and status tracking.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata/types';

const columns: TableColumnDefinition[] = [
  { id: 'title', header: 'Job Title', path: 'title', type: 'text', sortable: true, width: '25%' },
  {
    id: 'status',
    header: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: [
        { value: 'open', label: 'Open' },
        { value: 'filled', label: 'Filled' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
      badgeColors: { open: 'green', filled: 'blue', on_hold: 'yellow', cancelled: 'gray' },
    },
  },
  { id: 'positions', header: 'Positions', path: 'positionsCount', type: 'number' },
  { id: 'submissions', header: 'Submissions', path: 'submissionsCount', type: 'number' },
  { id: 'interviews', header: 'Interviews', path: 'interviewsCount', type: 'number' },
  { id: 'created', header: 'Posted', path: 'createdAt', type: 'date', sortable: true },
];

export const clientJobsListScreen: ScreenDefinition = {
  id: 'client-jobs-list',
  type: 'list',
  entityType: 'job',
  title: 'My Jobs',
  subtitle: 'View and manage your job orders',
  icon: 'Briefcase',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.client.getJobs',
      params: {},
    },
    pagination: true,
    pageSize: 20,
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // FILTERS
      // ===========================================
      {
        id: 'filters',
        type: 'field-grid',
        columns: 4,
        inline: true,
        fields: [
          {
            id: 'status-filter',
            type: 'select',
            label: 'Status',
            path: 'filter.status',
            config: {
              options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'open', label: 'Open' },
                { value: 'filled', label: 'Filled' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
          },
          {
            id: 'search',
            type: 'text',
            label: 'Search',
            path: 'filter.search',
            config: { placeholder: 'Search jobs...', icon: 'Search' },
          },
        ],
      },

      // ===========================================
      // JOBS TABLE
      // ===========================================
      {
        id: 'jobs-table',
        type: 'table',
        columns_config: columns,
        rowClick: { type: 'navigate', route: '/client/jobs/{{id}}' },
        emptyState: {
          title: 'No jobs found',
          description: 'Submit a new job request to get started.',
          icon: 'Briefcase',
          action: {
            id: 'submit-job',
            label: 'Submit New Job',
            type: 'navigate',
            variant: 'primary',
            config: { type: 'navigate', route: '/client/jobs/new' },
          },
        },
        pagination: { enabled: true, pageSize: 20 },
      },
    ],
  },

  actions: [
    {
      id: 'submit-job',
      label: 'Submit New Job',
      type: 'navigate',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'navigate', route: '/client/jobs/new' },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportJobs' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Jobs', active: true },
    ],
  },
};

export default clientJobsListScreen;
