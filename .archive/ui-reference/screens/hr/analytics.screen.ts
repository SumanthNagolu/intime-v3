/**
 * HR Analytics Screen Definition
 *
 * Metadata-driven screen for HR analytics dashboard.
 * Uses custom component for specialized analytics visualizations.
 */

import type { ScreenDefinition } from '@/lib/metadata';

export const analyticsScreen: ScreenDefinition = {
  id: 'hr-analytics',
  type: 'dashboard',

  title: 'HR Analytics',
  subtitle: 'Workforce intelligence and insights',
  icon: 'TrendingUp',

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'analytics-dashboard',
        type: 'custom',
        component: 'HRAnalyticsDashboard',
        componentProps: {
          tabs: ['Headcount', 'Turnover', 'Compensation', 'Performance', 'Time'],
          defaultTab: 'Headcount',
          enableExport: true,
          enableDrilldown: true,
        },
      },
    ],
  },

  actions: [
    {
      id: 'export-report',
      label: 'Export Report',
      type: 'custom',
      variant: 'secondary',
      icon: 'Download',
      config: {
        type: 'custom',
        handler: 'handleExportAnalyticsReport',
      },
    },
  ],

  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Analytics' },
    ],
  },
};

export default analyticsScreen;
