/**
 * Financial Reports Screen Definition
 *
 * Generate and schedule financial reports for CFO.
 *
 * @see docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const financialReportsScreen: ScreenDefinition = {
  id: 'financial-reports',
  type: 'dashboard',
  title: 'Financial Reports',
  subtitle: 'Generate, schedule, and export financial reports',
  icon: 'FileBarChart',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'finance.getReportsOverview',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Report Types Grid
      {
        id: 'report-types',
        type: 'custom',
        component: 'ReportTypesGrid',
        title: 'Available Reports',
        config: {
          reports: [
            {
              id: 'pl-statement',
              title: 'P&L Statement',
              description: 'Monthly, quarterly, or annual profit and loss',
              icon: 'TrendingUp',
              periods: ['monthly', 'quarterly', 'annual'],
            },
            {
              id: 'cash-flow',
              title: 'Cash Flow Statement',
              description: 'Cash inflows and outflows analysis',
              icon: 'Banknote',
              periods: ['monthly', 'quarterly'],
            },
            {
              id: 'ar-aging',
              title: 'AR Aging Report',
              description: 'Accounts receivable aging breakdown',
              icon: 'Clock',
              periods: ['current', 'monthly'],
            },
            {
              id: 'commission',
              title: 'Commission Report',
              description: 'Commission calculations and payments',
              icon: 'Wallet',
              periods: ['monthly', 'quarterly'],
            },
            {
              id: 'margin-analysis',
              title: 'Margin Analysis Report',
              description: 'Detailed margin breakdown by dimension',
              icon: 'PieChart',
              periods: ['monthly', 'quarterly'],
            },
            {
              id: 'revenue-forecast',
              title: 'Revenue Forecast',
              description: 'Projected revenue based on active placements',
              icon: 'LineChart',
              periods: ['3-month', '6-month', '12-month'],
            },
          ],
        },
      },

      // Quick Generate Section
      {
        id: 'quick-generate',
        type: 'info-card',
        title: 'Quick Generate',
        icon: 'Zap',
        fields: [
          { id: 'report-type', label: 'Report Type', type: 'select', path: 'quickGenerate.reportType' },
          { id: 'period', label: 'Period', type: 'select', path: 'quickGenerate.period' },
          { id: 'format', label: 'Format', type: 'select', path: 'quickGenerate.format' },
        ],
        actions: [
          {
            id: 'generate',
            type: 'mutation',
            label: 'Generate Report',
            icon: 'FileText',
            variant: 'primary',
            config: { type: 'mutation', procedure: 'finance.generateReport' },
          },
        ],
      },

      // Scheduled Reports
      {
        id: 'scheduled-reports',
        type: 'table',
        title: 'Scheduled Reports',
        icon: 'Calendar',
        dataSource: {
          type: 'field',
          path: 'scheduledReports',
        },
        columns_config: [
          { id: 'report-name', header: 'Report', path: 'reportName', type: 'text' },
          { id: 'frequency', header: 'Frequency', path: 'frequency', type: 'enum', config: { options: [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }] } },
          { id: 'next-run', header: 'Next Run', path: 'nextRunDate', type: 'date' },
          { id: 'recipients', header: 'Recipients', path: 'recipientCount', type: 'number' },
          { id: 'format', header: 'Format', path: 'format', type: 'text' },
          { id: 'status', header: 'Status', path: 'status', type: 'enum', config: { options: [{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }], badgeColors: { active: 'green', paused: 'gray' } } },
        ],
        actions: [
          {
            id: 'edit-schedule',
            type: 'modal',
            label: 'Edit',
            icon: 'Edit',
            config: { type: 'modal', modal: 'EditScheduledReportModal' },
          },
          {
            id: 'run-now',
            type: 'mutation',
            label: 'Run Now',
            icon: 'Play',
            config: { type: 'mutation', procedure: 'finance.runScheduledReport' },
          },
          {
            id: 'delete-schedule',
            type: 'mutation',
            label: 'Delete',
            icon: 'Trash2',
            variant: 'destructive',
            confirm: {
              title: 'Delete Scheduled Report',
              message: 'Are you sure you want to delete this scheduled report?',
              destructive: true,
            },
            config: { type: 'mutation', procedure: 'finance.deleteScheduledReport' },
          },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },

      // Recent Reports
      {
        id: 'recent-reports',
        type: 'table',
        title: 'Recent Reports',
        icon: 'History',
        dataSource: {
          type: 'field',
          path: 'recentReports',
        },
        columns_config: [
          { id: 'report-name', header: 'Report', path: 'reportName', type: 'text' },
          { id: 'generated-at', header: 'Generated', path: 'generatedAt', type: 'date' },
          { id: 'generated-by', header: 'Generated By', path: 'generatedBy', type: 'text' },
          { id: 'period', header: 'Period', path: 'period', type: 'text' },
          { id: 'format', header: 'Format', path: 'format', type: 'text' },
          { id: 'size', header: 'Size', path: 'fileSize', type: 'text' },
        ],
        actions: [
          {
            id: 'download',
            type: 'download',
            label: 'Download',
            icon: 'Download',
            config: { type: 'download', url: '${downloadUrl}' },
          },
          {
            id: 'share',
            type: 'modal',
            label: 'Share',
            icon: 'Share2',
            config: { type: 'modal', modal: 'ShareReportModal' },
          },
        ],
        pagination: { enabled: true, pageSize: 15 },
      },

      // Board Deck Generator
      {
        id: 'board-deck',
        type: 'info-card',
        title: 'Board Deck Generator',
        icon: 'Presentation',
        fields: [
          { id: 'period', label: 'Reporting Period', type: 'select', path: 'boardDeck.period' },
          { id: 'template', label: 'Template', type: 'select', path: 'boardDeck.template' },
          { id: 'include-forecast', label: 'Include Forecast', type: 'boolean', path: 'boardDeck.includeForecast' },
          { id: 'include-comparatives', label: 'Include Comparatives', type: 'boolean', path: 'boardDeck.includeComparatives' },
        ],
        actions: [
          {
            id: 'generate-deck',
            type: 'mutation',
            label: 'Generate Board Deck',
            icon: 'FileText',
            variant: 'primary',
            config: { type: 'mutation', procedure: 'finance.generateBoardDeck' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'new-schedule',
      type: 'modal',
      label: 'Schedule Report',
      icon: 'Calendar',
      variant: 'primary',
      config: { type: 'modal', modal: 'NewScheduledReportModal' },
    },
    {
      id: 'back-to-dashboard',
      type: 'navigate',
      label: 'Back to Dashboard',
      icon: 'ArrowLeft',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/cfo/dashboard' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Home', route: '/employee/workspace' },
      { label: 'CFO Dashboard', route: '/employee/cfo/dashboard' },
      { label: 'Financial Reports' },
    ],
  },
};
