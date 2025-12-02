/**
 * TA Analytics Screen Definition
 *
 * Comprehensive analytics dashboard for Talent Acquisition with:
 * - Lead generation metrics
 * - Conversion funnel analysis
 * - Campaign performance
 * - Pipeline velocity
 * - Training pipeline metrics
 * - Period comparison
 *
 * Routes: /employee/workspace/ta/analytics
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';

// ==========================================
// TA ANALYTICS SCREEN
// ==========================================

export const taAnalyticsScreen: ScreenDefinition = {
  id: 'ta-analytics',
  type: 'dashboard',
  title: 'TA Analytics',
  subtitle: 'Performance metrics and insights',
  icon: 'BarChart3',

  dataSource: {
    type: 'aggregate',
    sources: [
      {
        id: 'overview',
        type: 'query',
        query: {
          procedure: 'ta.analytics.getOverview',
          params: {},
        },
      },
      {
        id: 'leadMetrics',
        type: 'query',
        query: {
          procedure: 'ta.analytics.getLeadMetrics',
          params: {},
        },
      },
      {
        id: 'dealMetrics',
        type: 'query',
        query: {
          procedure: 'ta.analytics.getDealMetrics',
          params: {},
        },
      },
      {
        id: 'campaignMetrics',
        type: 'query',
        query: {
          procedure: 'ta.analytics.getCampaignMetrics',
          params: {},
        },
      },
      {
        id: 'trainingMetrics',
        type: 'query',
        query: {
          procedure: 'ta.analytics.getTrainingMetrics',
          params: {},
        },
      },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // Period Selector
      {
        id: 'period-selector',
        type: 'custom',
        component: 'AnalyticsPeriodSelector',
        componentProps: {
          periods: ['7d', '30d', '90d', 'ytd', 'custom'],
          defaultPeriod: '30d',
          comparePrevious: true,
        },
      },

      // KPI Overview
      {
        id: 'kpi-overview',
        type: 'metrics-grid',
        title: 'Key Performance Indicators',
        columns: 4,
        widgets: [
          {
            id: 'leads-generated',
            type: 'metric',
            label: 'Leads Generated',
            path: 'overview.leadsGenerated',
            config: {
              icon: 'UserPlus',
              trend: { path: 'overview.leadsTrend', format: 'percentage' },
              comparison: { path: 'overview.leadsPrevious', label: 'vs previous' },
            },
          },
          {
            id: 'conversion-rate',
            type: 'metric',
            label: 'Lead → Deal Conversion',
            path: 'overview.conversionRate',
            config: {
              icon: 'TrendingUp',
              suffix: '%',
              trend: { path: 'overview.conversionTrend', format: 'points' },
            },
          },
          {
            id: 'deals-closed',
            type: 'metric',
            label: 'Deals Closed',
            path: 'overview.dealsClosed',
            config: {
              icon: 'Handshake',
              trend: { path: 'overview.dealsClosedTrend', format: 'percentage' },
            },
          },
          {
            id: 'revenue-generated',
            type: 'metric',
            label: 'Revenue Generated',
            path: 'overview.revenueGenerated',
            config: {
              icon: 'DollarSign',
              format: 'currency',
              prefix: '$',
              trend: { path: 'overview.revenueTrend', format: 'percentage' },
            },
          },
        ],
      },

      // Lead Analytics Section
      {
        id: 'lead-analytics',
        type: 'info-card',
        title: 'Lead Analytics',
        icon: 'Users',
        columns: 2,
        sections: [
          // Lead Generation Trend
          {
            id: 'lead-trend',
            type: 'custom',
            title: 'Lead Generation Trend',
            component: 'TimeSeriesChart',
            componentProps: {
              dataPath: 'leadMetrics.trend',
              xField: 'date',
              yField: 'count',
              chartType: 'area',
              color: 'blue',
            },
          },
          // Lead Sources
          {
            id: 'lead-sources',
            type: 'custom',
            title: 'Lead Sources',
            component: 'PieChart',
            componentProps: {
              dataPath: 'leadMetrics.bySource',
              labelField: 'source',
              valueField: 'count',
            },
          },
        ],
      },

      // Lead Funnel
      {
        id: 'lead-funnel-section',
        type: 'custom',
        title: 'Lead Conversion Funnel',
        icon: 'Filter',
        component: 'ConversionFunnel',
        componentProps: {
          dataPath: 'leadMetrics.funnel',
          stages: [
            { id: 'new', label: 'New Leads' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'engaged', label: 'Engaged' },
            { id: 'qualifying', label: 'Qualifying' },
            { id: 'qualified', label: 'Qualified' },
            { id: 'converted', label: 'Converted to Deal' },
          ],
        },
      },

      // Deal Analytics Section
      {
        id: 'deal-analytics',
        type: 'info-card',
        title: 'Deal Analytics',
        icon: 'TrendingUp',
        columns: 2,
        sections: [
          // Pipeline Value Trend
          {
            id: 'pipeline-trend',
            type: 'custom',
            title: 'Pipeline Value Trend',
            component: 'TimeSeriesChart',
            componentProps: {
              dataPath: 'dealMetrics.pipelineTrend',
              xField: 'date',
              yField: 'value',
              chartType: 'line',
              format: 'currency',
            },
          },
          // Deal Stage Distribution
          {
            id: 'deal-stages',
            type: 'custom',
            title: 'Deal Stage Distribution',
            component: 'BarChart',
            componentProps: {
              dataPath: 'dealMetrics.byStage',
              xField: 'stage',
              yField: 'value',
              format: 'currency',
            },
          },
        ],
      },

      // Deal Velocity Metrics
      {
        id: 'deal-velocity',
        type: 'metrics-grid',
        title: 'Deal Velocity',
        columns: 4,
        widgets: [
          {
            id: 'avg-cycle-time',
            type: 'metric',
            label: 'Avg Cycle Time',
            path: 'dealMetrics.avgCycleTime',
            config: {
              icon: 'Clock',
              suffix: ' days',
              lowerIsBetter: true,
            },
          },
          {
            id: 'avg-deal-size',
            type: 'metric',
            label: 'Avg Deal Size',
            path: 'dealMetrics.avgDealSize',
            config: {
              icon: 'DollarSign',
              format: 'currency',
              prefix: '$',
            },
          },
          {
            id: 'win-rate',
            type: 'metric',
            label: 'Win Rate',
            path: 'dealMetrics.winRate',
            config: {
              icon: 'Trophy',
              suffix: '%',
            },
          },
          {
            id: 'deals-in-pipeline',
            type: 'metric',
            label: 'Deals in Pipeline',
            path: 'dealMetrics.activeDeals',
            config: {
              icon: 'Briefcase',
            },
          },
        ],
      },

      // Campaign Performance
      {
        id: 'campaign-performance',
        type: 'info-card',
        title: 'Campaign Performance',
        icon: 'Megaphone',
        sections: [
          {
            id: 'campaign-metrics',
            type: 'metrics-grid',
            columns: 4,
            widgets: [
              {
                id: 'campaigns-run',
                type: 'metric',
                label: 'Campaigns Run',
                path: 'campaignMetrics.campaignsRun',
                config: { icon: 'Megaphone' },
              },
              {
                id: 'avg-response-rate',
                type: 'metric',
                label: 'Avg Response Rate',
                path: 'campaignMetrics.avgResponseRate',
                config: { icon: 'MessageCircle', suffix: '%' },
              },
              {
                id: 'leads-from-campaigns',
                type: 'metric',
                label: 'Leads Generated',
                path: 'campaignMetrics.leadsGenerated',
                config: { icon: 'UserPlus' },
              },
              {
                id: 'cost-per-lead',
                type: 'metric',
                label: 'Cost per Lead',
                path: 'campaignMetrics.costPerLead',
                config: { icon: 'DollarSign', format: 'currency', prefix: '$' },
              },
            ],
          },
          {
            id: 'campaign-comparison',
            type: 'table',
            title: 'Top Campaigns',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.analytics.getTopCampaigns',
                params: { limit: 5 },
              },
            },
            columns_config: [
              { id: 'name', header: 'Campaign', accessor: 'name', type: 'text' },
              { id: 'type', header: 'Type', accessor: 'campaignType', type: 'enum' },
              { id: 'sent', header: 'Sent', accessor: 'sentCount', type: 'number' },
              { id: 'responseRate', header: 'Response Rate', accessor: 'responseRate', type: 'number', config: { suffix: '%' } },
              { id: 'leads', header: 'Leads', accessor: 'leadsGenerated', type: 'number' },
              { id: 'roi', header: 'ROI', accessor: 'roi', type: 'number', config: { suffix: '%' } },
            ],
          },
        ],
      },

      // Training Pipeline Metrics
      {
        id: 'training-metrics',
        type: 'info-card',
        title: 'Training Pipeline',
        icon: 'GraduationCap',
        columns: 2,
        sections: [
          {
            id: 'training-summary',
            type: 'metrics-grid',
            columns: 2,
            widgets: [
              {
                id: 'applications-received',
                type: 'metric',
                label: 'Applications',
                path: 'trainingMetrics.applicationsReceived',
                config: { icon: 'FileText' },
              },
              {
                id: 'enrollments',
                type: 'metric',
                label: 'Enrollments',
                path: 'trainingMetrics.enrollments',
                config: { icon: 'UserPlus' },
              },
              {
                id: 'completion-rate',
                type: 'metric',
                label: 'Completion Rate',
                path: 'trainingMetrics.completionRate',
                config: { icon: 'CheckCircle', suffix: '%' },
              },
              {
                id: 'placement-rate',
                type: 'metric',
                label: 'Placement Rate',
                path: 'trainingMetrics.placementRate',
                config: { icon: 'Briefcase', suffix: '%' },
              },
            ],
          },
          {
            id: 'training-by-program',
            type: 'custom',
            title: 'By Program',
            component: 'HorizontalBarChart',
            componentProps: {
              dataPath: 'trainingMetrics.byProgram',
              labelField: 'program',
              valueField: 'enrollments',
            },
          },
        ],
      },

      // Activity Metrics
      {
        id: 'activity-metrics',
        type: 'metrics-grid',
        title: 'Activity Metrics',
        icon: 'Activity',
        columns: 4,
        widgets: [
          {
            id: 'total-activities',
            type: 'metric',
            label: 'Total Activities',
            path: 'overview.totalActivities',
            config: { icon: 'Activity' },
          },
          {
            id: 'calls-made',
            type: 'metric',
            label: 'Calls Made',
            path: 'overview.callsMade',
            config: { icon: 'Phone' },
          },
          {
            id: 'emails-sent',
            type: 'metric',
            label: 'Emails Sent',
            path: 'overview.emailsSent',
            config: { icon: 'Mail' },
          },
          {
            id: 'meetings-held',
            type: 'metric',
            label: 'Meetings Held',
            path: 'overview.meetingsHeld',
            config: { icon: 'Calendar' },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'export-report',
      type: 'custom',
      label: 'Export Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportAnalytics' },
    },
    {
      id: 'schedule-report',
      type: 'modal',
      label: 'Schedule Report',
      icon: 'Clock',
      variant: 'outline',
      config: { type: 'modal', modal: 'schedule-analytics-report' },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Analytics' },
    ],
  },
};

export default taAnalyticsScreen;
