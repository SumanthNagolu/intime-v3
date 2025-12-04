/**
 * Operations Analytics Screen Definition
 *
 * Org-wide operations metrics and analytics for COO.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const operationsAnalyticsScreen: ScreenDefinition = {
  id: 'operations-analytics',
  type: 'dashboard',
  title: 'Operations Analytics',
  subtitle: 'Organization-wide operational metrics and trends',
  icon: 'BarChart3',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'operations.getAnalytics',
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'funnel',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: PIPELINE FUNNEL
      // ─────────────────────────────────────────────────────
      {
        id: 'funnel',
        label: 'Pipeline Funnel',
        icon: 'Filter',
        sections: [
          {
            id: 'funnel-chart',
            type: 'custom',
            component: 'PipelineFunnelChart',
            title: 'Pipeline Funnel (Leads → Placements)',
            config: {
              stages: ['Leads', 'Qualified', 'Jobs', 'Submissions', 'Interviews', 'Offers', 'Placements'],
              height: 400,
              showConversionRates: true,
            },
          },
          {
            id: 'funnel-kpis',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              { id: 'total-leads', label: 'Total Leads', type: 'number', path: 'funnel.totalLeads' },
              { id: 'conversion-rate', label: 'Overall Conversion', type: 'percentage', path: 'funnel.overallConversion' },
              { id: 'avg-ttf', label: 'Avg Time to Fill', type: 'number', path: 'funnel.avgTimeToFill', config: { suffix: ' days' } },
              { id: 'fill-rate', label: 'Fill Rate', type: 'percentage', path: 'funnel.fillRate' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 2: CONVERSION RATES
      // ─────────────────────────────────────────────────────
      {
        id: 'conversions',
        label: 'Conversion Rates',
        icon: 'ArrowUpRight',
        sections: [
          {
            id: 'conversion-by-stage',
            type: 'custom',
            component: 'ConversionByStageChart',
            title: 'Conversion Rate by Stage',
            config: {
              chartType: 'bar',
              height: 350,
            },
          },
          {
            id: 'conversion-trend',
            type: 'custom',
            component: 'ConversionTrendChart',
            title: 'Conversion Rate Trends (6 Months)',
            config: {
              chartType: 'line',
              height: 300,
            },
          },
          {
            id: 'conversion-table',
            type: 'table',
            title: 'Stage Conversion Details',
            dataSource: {
              type: 'field',
              path: 'conversions.byStage',
            },
            columns_config: [
              { id: 'from-stage', header: 'From Stage', path: 'fromStage', type: 'text' },
              { id: 'to-stage', header: 'To Stage', path: 'toStage', type: 'text' },
              { id: 'conversion-rate', header: 'Conversion %', path: 'conversionRate', type: 'percentage' },
              { id: 'volume', header: 'Volume', path: 'volume', type: 'number' },
              { id: 'trend', header: 'Trend', path: 'trend', type: 'percentage' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 3: TIME IN STAGE
      // ─────────────────────────────────────────────────────
      {
        id: 'time-analysis',
        label: 'Time Analysis',
        icon: 'Clock',
        sections: [
          {
            id: 'time-in-stage-chart',
            type: 'custom',
            component: 'TimeInStageChart',
            title: 'Average Time in Stage',
            config: {
              chartType: 'horizontal-bar',
              height: 350,
            },
          },
          {
            id: 'bottleneck-analysis',
            type: 'custom',
            component: 'BottleneckAnalysisChart',
            title: 'Stage Bottleneck Analysis',
            config: {
              showThresholds: true,
              height: 300,
            },
          },
          {
            id: 'time-table',
            type: 'table',
            title: 'Time in Stage Details',
            dataSource: {
              type: 'field',
              path: 'timeAnalysis.byStage',
            },
            columns_config: [
              { id: 'stage', header: 'Stage', path: 'stage', type: 'text' },
              { id: 'avg-time', header: 'Avg Time (Days)', path: 'avgTimeDays', type: 'number' },
              { id: 'target', header: 'Target (Days)', path: 'targetDays', type: 'number' },
              { id: 'variance', header: 'Variance', path: 'variance', type: 'percentage' },
              { id: 'volume', header: 'Volume', path: 'volume', type: 'number' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 4: EFFICIENCY METRICS
      // ─────────────────────────────────────────────────────
      {
        id: 'efficiency',
        label: 'Efficiency',
        icon: 'Zap',
        sections: [
          {
            id: 'efficiency-kpis',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              { id: 'submissions-per-placement', label: 'Submissions per Placement', type: 'number', path: 'efficiency.submissionsPerPlacement' },
              { id: 'interviews-per-placement', label: 'Interviews per Placement', type: 'number', path: 'efficiency.interviewsPerPlacement' },
              { id: 'recruiter-productivity', label: 'Recruiter Productivity', type: 'percentage', path: 'efficiency.recruiterProductivity' },
              { id: 'automation-rate', label: 'Automation Rate', type: 'percentage', path: 'efficiency.automationRate' },
            ],
          },
          {
            id: 'efficiency-trend',
            type: 'custom',
            component: 'EfficiencyTrendChart',
            title: 'Efficiency Trends (12 Months)',
            config: { height: 350 },
          },
          {
            id: 'quality-metrics',
            type: 'info-card',
            title: 'Quality Metrics',
            icon: 'Award',
            fields: [
              { id: 'submission-quality', label: 'Submission Quality Score', type: 'percentage', path: 'quality.submissionQuality' },
              { id: 'interview-pass-rate', label: 'Interview Pass Rate', type: 'percentage', path: 'quality.interviewPassRate' },
              { id: 'offer-acceptance', label: 'Offer Acceptance Rate', type: 'percentage', path: 'quality.offerAcceptance' },
              { id: 'falloff-rate', label: 'Falloff Rate', type: 'percentage', path: 'quality.falloffRate' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 5: DRILL DOWN
      // ─────────────────────────────────────────────────────
      {
        id: 'drilldown',
        label: 'Drill Down',
        icon: 'Search',
        sections: [
          {
            id: 'drilldown-filters',
            type: 'form',
            inline: true,
            fields: [
              { id: 'dimension', name: 'dimension', label: 'Dimension', type: 'select', config: { options: [{ value: 'pod', label: 'By Pod' }, { value: 'recruiter', label: 'By Recruiter' }, { value: 'client', label: 'By Client' }] } },
              { id: 'metric', name: 'metric', label: 'Metric', type: 'select', config: { options: [{ value: 'placements', label: 'Placements' }, { value: 'conversion', label: 'Conversion Rate' }, { value: 'time_to_fill', label: 'Time to Fill' }] } },
              { id: 'period', name: 'period', label: 'Period', type: 'select', config: { options: [{ value: 'mtd', label: 'MTD' }, { value: 'qtd', label: 'QTD' }, { value: 'ytd', label: 'YTD' }] } },
            ],
          },
          {
            id: 'drilldown-chart',
            type: 'custom',
            component: 'DrilldownChart',
            title: 'Drill Down Analysis',
            config: { height: 400 },
          },
          {
            id: 'drilldown-table',
            type: 'table',
            title: 'Detailed Breakdown',
            dataSource: {
              type: 'field',
              path: 'drilldown.data',
            },
            columns_config: [
              { id: 'name', header: 'Name', path: 'name', type: 'text', sortable: true },
              { id: 'placements', header: 'Placements', path: 'placements', type: 'number', sortable: true },
              { id: 'submissions', header: 'Submissions', path: 'submissions', type: 'number' },
              { id: 'conversion', header: 'Conversion', path: 'conversion', type: 'percentage', sortable: true },
              { id: 'avg-ttf', header: 'Avg TTF', path: 'avgTTF', type: 'number' },
              { id: 'trend', header: 'Trend', path: 'trend', type: 'percentage' },
            ],
            pagination: { enabled: true, pageSize: 15 },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'export',
      type: 'modal',
      label: 'Export Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportAnalyticsReportModal' },
    },
    {
      id: 'back-to-dashboard',
      type: 'navigate',
      label: 'Back to Dashboard',
      icon: 'ArrowLeft',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/coo/dashboard' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Home', route: '/employee/workspace' },
      { label: 'COO Dashboard', route: '/employee/coo/dashboard' },
      { label: 'Operations Analytics' },
    ],
  },
};
