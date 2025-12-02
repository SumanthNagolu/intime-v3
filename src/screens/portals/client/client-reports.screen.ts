/**
 * Client Reports Screen
 *
 * Available reports for client portal users.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const clientReportsScreen: ScreenDefinition = {
  id: 'client-reports',
  type: 'dashboard',
  title: 'Reports',
  subtitle: 'View and export analytics',
  icon: 'BarChart3',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'reportsList', procedure: 'portal.client.getAvailableReports' },
      { key: 'recentReports', procedure: 'portal.client.getRecentReports' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // AVAILABLE REPORTS
      // ===========================================
      {
        id: 'available-reports',
        type: 'custom',
        title: 'Available Reports',
        component: 'ReportsGrid',
        componentProps: {
          layout: 'cards',
          columns: 3,
        },
        config: {
          reports: [
            {
              id: 'hiring-activity',
              title: 'Hiring Activity',
              description: 'Jobs, submissions, and interviews over time',
              icon: 'TrendingUp',
              color: 'blue',
              route: '/client/reports/hiring-activity',
            },
            {
              id: 'time-to-fill',
              title: 'Time to Fill Analysis',
              description: 'Average time from job posting to placement',
              icon: 'Clock',
              color: 'purple',
              route: '/client/reports/time-to-fill',
            },
            {
              id: 'placement-history',
              title: 'Placement History',
              description: 'Historical placement data and trends',
              icon: 'Users',
              color: 'green',
              route: '/client/reports/placements',
            },
            {
              id: 'spending-summary',
              title: 'Spending Summary',
              description: 'Total spend and cost breakdown',
              icon: 'DollarSign',
              color: 'orange',
              route: '/client/reports/spending',
            },
            {
              id: 'diversity',
              title: 'Diversity Report',
              description: 'Diversity metrics across placements',
              icon: 'PieChart',
              color: 'pink',
              route: '/client/reports/diversity',
              visible: { type: 'field', path: 'features.diversityReporting' },
            },
            {
              id: 'vendor-performance',
              title: 'Vendor Performance',
              description: 'InTime performance metrics and SLAs',
              icon: 'Award',
              color: 'yellow',
              route: '/client/reports/vendor-performance',
            },
          ],
        },
      },

      // ===========================================
      // RECENT REPORTS
      // ===========================================
      {
        id: 'recent-reports',
        type: 'table',
        title: 'Recently Generated Reports',
        dataSource: { type: 'field', path: 'recentReports' },
        columns_config: [
          { id: 'name', header: 'Report Name', path: 'name', type: 'text' },
          { id: 'type', header: 'Type', path: 'type', type: 'text' },
          { id: 'generatedAt', header: 'Generated', path: 'generatedAt', type: 'datetime' },
          { id: 'format', header: 'Format', path: 'format', type: 'text' },
        ],
        rowActions: [
          {
            id: 'download',
            label: 'Download',
            type: 'download',
            icon: 'Download',
            config: { type: 'download', url: { type: 'field', path: 'downloadUrl' } },
          },
          {
            id: 'regenerate',
            label: 'Regenerate',
            type: 'mutation',
            icon: 'RefreshCw',
            config: { type: 'mutation', procedure: 'portal.client.regenerateReport', input: { id: { type: 'field', path: 'id' } } },
          },
        ],
        emptyState: {
          title: 'No reports generated yet',
          description: 'Generate a report to see it here.',
          icon: 'FileText',
        },
      },

      // ===========================================
      // QUICK STATS
      // ===========================================
      {
        id: 'quick-stats',
        type: 'metrics-grid',
        title: 'Quick Statistics',
        columns: 4,
        fields: [
          {
            id: 'total-jobs',
            label: 'Total Jobs (YTD)',
            type: 'number',
            path: 'stats.totalJobs',
            config: { icon: 'Briefcase' },
          },
          {
            id: 'total-placements',
            label: 'Total Placements (YTD)',
            type: 'number',
            path: 'stats.totalPlacements',
            config: { icon: 'Users' },
          },
          {
            id: 'avg-time-to-fill',
            label: 'Avg Time to Fill',
            type: 'number',
            path: 'stats.avgTimeToFill',
            config: { suffix: ' days', icon: 'Clock' },
          },
          {
            id: 'total-spend',
            label: 'Total Spend (YTD)',
            type: 'currency',
            path: 'stats.totalSpend',
            config: { icon: 'DollarSign' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'schedule-report',
      label: 'Schedule Report',
      type: 'modal',
      icon: 'Calendar',
      variant: 'default',
      config: { type: 'modal', modal: 'ScheduleReport' },
    },
    {
      id: 'export-all',
      label: 'Export All Data',
      type: 'modal',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportAllData' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Reports', active: true },
    ],
  },
};

export default clientReportsScreen;
