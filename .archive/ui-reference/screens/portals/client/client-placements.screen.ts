/**
 * Client Placements Screen
 *
 * Active and historical placements for the client.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata/types';

const columns: TableColumnDefinition[] = [
  { id: 'consultant', header: 'Consultant', path: 'consultantName', type: 'text', width: '20%' },
  { id: 'role', header: 'Role', path: 'jobTitle', type: 'text', width: '20%' },
  { id: 'startDate', header: 'Start Date', path: 'startDate', type: 'date', sortable: true },
  { id: 'endDate', header: 'End Date', path: 'endDate', type: 'date', sortable: true },
  {
    id: 'status',
    header: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: [
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'terminated', label: 'Terminated' },
        { value: 'extended', label: 'Extended' },
      ],
      badgeColors: { active: 'green', completed: 'blue', terminated: 'gray', extended: 'purple' },
    },
  },
];

export const clientPlacementsScreen: ScreenDefinition = {
  id: 'client-placements',
  type: 'list',
  entityType: 'placement',
  title: 'Placements',
  subtitle: 'View active and historical placements',
  icon: 'Users',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.client.getPlacements',
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
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'extended', label: 'Extended' },
              ],
            },
          },
          {
            id: 'date-range',
            type: 'date-range',
            label: 'Date Range',
            path: 'filter.dateRange',
          },
          {
            id: 'search',
            type: 'text',
            label: 'Search',
            path: 'filter.search',
            config: { placeholder: 'Search placements...', icon: 'Search' },
          },
        ],
      },

      // ===========================================
      // PLACEMENTS TABLE
      // ===========================================
      {
        id: 'placements-table',
        type: 'table',
        columns_config: columns,
        rowClick: { type: 'navigate', route: '/client/placements/{{id}}' },
        emptyState: {
          title: 'No placements found',
          description: 'Your placements will appear here once consultants are placed.',
          icon: 'Users',
        },
        pagination: { enabled: true, pageSize: 20 },
      },
    ],
  },

  actions: [
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportPlacements' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Placements', active: true },
    ],
  },
};

export default clientPlacementsScreen;
