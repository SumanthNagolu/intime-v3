/**
 * Executive Reports Screen Definition
 *
 * Board-ready reports and document generation for CEO.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const executiveReportsScreen: ScreenDefinition = {
  id: 'executive-reports',
  type: 'dashboard',
  title: 'Executive Reports',
  subtitle: 'Board-ready reports and document generation',
  icon: 'FileBarChart',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'executive.getReportsOverview',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Report Types Grid
      {
        id: 'report-types',
        type: 'custom',
        component: 'ExecutiveReportTypesGrid',
        title: 'Available Reports',
        config: {
          reports: [
            {
              id: 'board-deck',
              title: 'Board Deck',
              description: 'Comprehensive board presentation package',
              icon: 'Presentation',
              format: { type: 'PowerPoint' },
            },
            {
              id: 'investor-update',
              title: 'Investor Update',
              description: 'Monthly/quarterly investor communication',
              icon: 'TrendingUp',
              format: { type: 'PDF' },
            },
            {
              id: 'annual-review',
              title: 'Annual Review',
              description: 'Year-end performance review',
              icon: 'Calendar',
              format: { type: 'PDF' },
            },
            {
              id: 'strategic-plan',
              title: 'Strategic Plan',
              description: '3-5 year strategic planning document',
              icon: 'Target',
              format: { type: 'Word' },
            },
            {
              id: 'financial-summary',
              title: 'Financial Summary',
              description: 'Executive financial overview',
              icon: 'DollarSign',
              format: { type: 'Excel' },
            },
            {
              id: 'custom-report',
              title: 'Custom Report',
              description: 'Build a custom report',
              icon: 'FileEdit',
              format: { type: 'Multiple' },
            },
          ],
        },
      },

      // Board Deck Generator
      {
        id: 'board-deck-generator',
        type: 'info-card',
        title: 'Board Deck Generator',
        icon: 'Presentation',
        fields: [
          { id: 'period', label: 'Reporting Period', type: 'select', path: 'boardDeck.period' },
          { id: 'sections', label: 'Include Sections', type: 'multiselect', path: 'boardDeck.sections' },
          { id: 'template', label: 'Template', type: 'select', path: 'boardDeck.template' },
          { id: 'include-appendix', label: 'Include Appendix', type: 'boolean', path: 'boardDeck.includeAppendix' },
        ],
        actions: [
          {
            id: 'generate-deck',
            type: 'mutation',
            label: 'Generate Board Deck',
            icon: 'FileText',
            variant: 'primary',
            config: { type: 'mutation', procedure: 'executive.generateBoardDeck' },
          },
          {
            id: 'preview-deck',
            type: 'modal',
            label: 'Preview',
            icon: 'Eye',
            variant: 'outline',
            config: { type: 'modal', modal: 'PreviewBoardDeckModal' },
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
          { id: 'type', header: 'Type', path: 'reportType', type: 'text' },
          { id: 'frequency', header: 'Frequency', path: 'frequency', type: 'enum', config: { options: [{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }, { value: 'annual', label: 'Annual' }] } },
          { id: 'next-run', header: 'Next Generation', path: 'nextRunDate', type: 'date' },
          { id: 'recipients', header: 'Recipients', path: 'recipientCount', type: 'number' },
          { id: 'status', header: 'Status', path: 'status', type: 'enum', config: { options: [{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }], badgeColors: { active: 'green', paused: 'gray' } } },
        ],
        actions: [
          {
            id: 'edit',
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
            config: { type: 'mutation', procedure: 'executive.runScheduledReport' },
          },
        ],
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
          { id: 'type', header: 'Type', path: 'reportType', type: 'text' },
          { id: 'generated-at', header: 'Generated', path: 'generatedAt', type: 'date' },
          { id: 'generated-by', header: 'Generated By', path: 'generatedByName', type: 'text' },
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
          {
            id: 'regenerate',
            type: 'mutation',
            label: 'Regenerate',
            icon: 'RefreshCw',
            config: { type: 'mutation', procedure: 'executive.regenerateReport' },
          },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },

      // Report Templates
      {
        id: 'templates',
        type: 'table',
        title: 'Report Templates',
        icon: 'FileTemplate',
        collapsible: true,
        dataSource: {
          type: 'field',
          path: 'templates',
        },
        columns_config: [
          { id: 'name', header: 'Template Name', path: 'name', type: 'text' },
          { id: 'type', header: 'Report Type', path: 'reportType', type: 'text' },
          { id: 'last-used', header: 'Last Used', path: 'lastUsedDate', type: 'date' },
          { id: 'created-by', header: 'Created By', path: 'createdByName', type: 'text' },
        ],
        actions: [
          {
            id: 'use-template',
            type: 'modal',
            label: 'Use',
            icon: 'FileText',
            config: { type: 'modal', modal: 'UseTemplateModal' },
          },
          {
            id: 'edit-template',
            type: 'modal',
            label: 'Edit',
            icon: 'Edit',
            config: { type: 'modal', modal: 'EditTemplateModal' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'new-report',
      type: 'modal',
      label: 'Create Report',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'CreateReportModal' },
    },
    {
      id: 'schedule-report',
      type: 'modal',
      label: 'Schedule Report',
      icon: 'Calendar',
      variant: 'outline',
      config: { type: 'modal', modal: 'ScheduleReportModal' },
    },
    {
      id: 'back-to-dashboard',
      type: 'navigate',
      label: 'Back to Dashboard',
      icon: 'ArrowLeft',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/ceo/dashboard' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Home', route: '/employee/workspace' },
      { label: 'CEO Dashboard', route: '/employee/ceo/dashboard' },
      { label: 'Executive Reports' },
    ],
  },
};
