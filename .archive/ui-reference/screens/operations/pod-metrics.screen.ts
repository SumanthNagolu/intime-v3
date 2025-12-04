/**
 * Pod Metrics Screen Definition
 * 
 * Detailed pod-level KPIs and performance tracking.
 * 
 * @see docs/specs/20-USER-ROLES/04-manager/10-pod-metrics.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const podMetricsScreen: ScreenDefinition = {
  id: 'pod-metrics',
  type: 'dashboard',
  entityType: 'pod',
  title: { type: 'computed', template: 'Pod Metrics - {{podName}}' },
  description: 'Detailed performance metrics and KPI tracking',
  
  dataSource: {
    type: 'query',
    query: {
      procedure: 'manager.getPodMetrics',
      params: {
        podId: { type: 'context', path: 'user.podId' },
      },
    },
  },
  
  layout: {
    type: 'tabs',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: SPRINT METRICS
      // ─────────────────────────────────────────────────────
      {
        id: 'sprint',
        label: 'Sprint Metrics',
        icon: 'target',
        sections: [
          {
            id: 'sprint-overview',
            type: 'custom',
            component: 'SprintProgressWidget',
            span: 4,
          },
          {
            id: 'ic-contributions',
            type: 'table',
            title: 'Individual Contributions',
            dataSource: {
              type: 'field',
              path: 'sprintMetrics.icContributions',
            },
            columns_config: [
              {
                id: 'ic',
                header: 'IC',
                path: 'name',
                type: 'user',
              },
              {
                id: 'goal',
                header: 'Sprint Goal',
                path: 'goal',
                type: 'number',
              },
              {
                id: 'actual',
                header: 'Actual',
                path: 'actual',
                type: 'number',
              },
              {
                id: 'status',
                header: 'Status',
                path: 'status',
                type: 'badge',
                config: {
                  options: [
                    { value: 'on_track', label: 'On Track', color: 'success' },
                    { value: 'at_risk', label: 'At Risk', color: 'warning' },
                    { value: 'off_track', label: 'Off Track', color: 'destructive' },
                    { value: 'complete', label: 'Complete ✓', color: 'success' },
                  ],
                },
              },
              {
                id: 'completion-day',
                header: 'Completed On',
                path: 'completionDay',
                type: 'text',
              },
            ],
          },
          {
            id: 'sprint-trend',
            type: 'custom',
            component: 'SprintTrendChart',
            title: 'Sprint-over-Sprint Trend',
            description: 'Performance comparison across recent sprints',
            span: 4,
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 2: PIPELINE HEALTH
      // ─────────────────────────────────────────────────────
      {
        id: 'pipeline',
        label: 'Pipeline Health',
        icon: 'git-branch',
        sections: [
          {
            id: 'pipeline-kpis',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              {
                id: 'coverage-ratio',
                label: 'Coverage Ratio',
                path: 'pipelineMetrics.coverageRatio',
                type: 'number',
                config: {
                  format: { type: 'decimal' },
                  suffix: 'x',
                  target: 3.0,
                  trend: { type: 'field', path: 'pipelineMetrics.coverageTrend' },
                },
              },
              {
                id: 'active-jobs',
                label: 'Active Jobs',
                path: 'pipelineMetrics.activeJobs',
                type: 'number',
                config: {
                  icon: 'briefcase',
                },
              },
              {
                id: 'active-submissions',
                label: 'Active Submissions',
                path: 'pipelineMetrics.activeSubmissions',
                type: 'number',
                config: {
                  icon: 'send',
                },
              },
              {
                id: 'stale-jobs',
                label: 'Stale Jobs',
                path: 'pipelineMetrics.staleJobs',
                type: 'number',
                config: {
                  icon: 'alert-circle',
                  alertThreshold: 3,
                },
              },
            ],
          },
          {
            id: 'job-coverage-breakdown',
            type: 'custom',
            component: 'JobCoverageChart',
            title: 'Job Coverage Breakdown',
            span: 2,
          },
          {
            id: 'submission-funnel',
            type: 'custom',
            component: 'SubmissionFunnelChart',
            title: 'Submission Pipeline',
            span: 2,
          },
          {
            id: 'stale-jobs-table',
            type: 'table',
            title: 'Jobs Needing Attention',
            description: 'Jobs with no activity in 7+ days',
            dataSource: {
              type: 'field',
              path: 'pipelineMetrics.staleJobsList',
            },
            emptyMessage: 'No stale jobs - great job!',
            columns_config: [
              {
                id: 'job',
                header: 'Job',
                path: 'title',
                type: 'link',
                config: { linkPattern: '/employee/jobs/{{id}}' },
              },
              {
                id: 'client',
                header: 'Client',
                accessor: 'clientName',
                type: 'text',
              },
              {
                id: 'last-activity',
                header: 'Last Activity',
                accessor: 'lastActivityAt',
                type: 'relative-time',
              },
              {
                id: 'assigned-to',
                header: 'Assigned IC',
                accessor: 'assignedToName',
                type: 'user',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                actions: [
                  {
                    id: 'follow-up',
                    label: 'Create Follow-up',
                    icon: 'phone',
                    type: 'modal',
                    config: { type: 'modal', modal: 'create-follow-up' },
                  },
                  {
                    id: 'reassign',
                    label: 'Reassign',
                    icon: 'user-plus',
                    type: 'modal',
                    config: { type: 'modal', modal: 'reassign-job' },
                  },
                ],
              },
            ],
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 3: CONVERSION RATES
      // ─────────────────────────────────────────────────────
      {
        id: 'conversions',
        label: 'Conversions',
        icon: 'trending-up',
        sections: [
          {
            id: 'overall-efficiency',
            type: 'metrics-grid',
            columns: 1,
            metrics: [
              {
                id: 'overall-conversion',
                label: 'Overall Pipeline Efficiency',
                value: { type: 'field', path: 'conversionMetrics.overall' },
                format: { type: 'percentage' },
                target: 5,
                size: 'large',
                trend: { type: 'field', path: 'conversionMetrics.overallTrend' },
              },
            ],
          },
          {
            id: 'conversion-funnel',
            type: 'custom',
            component: 'ConversionFunnelVisualization',
            title: 'Funnel Visualization',
            span: 4,
          },
          {
            id: 'stage-breakdown',
            type: 'table',
            title: 'Stage-by-Stage Breakdown',
            dataSource: {
              type: 'field',
              path: 'conversionMetrics.stages',
            },
            columns_config: [
              {
                id: 'stage',
                header: 'Conversion Stage',
                path: 'name',
                type: 'text',
                primary: true,
              },
              {
                id: 'target',
                header: 'Target',
                accessor: 'target',
                type: 'percentage',
              },
              {
                id: 'actual',
                header: 'Actual',
                accessor: 'actual',
                type: 'percentage',
              },
              {
                id: 'status',
                header: 'Status',
                accessor: 'status',
                type: 'badge',
                options: [
                  { value: 'above', label: 'Above Target', color: 'success' },
                  { value: 'on_target', label: 'On Target', color: 'info' },
                  { value: 'below', label: 'Below Target', color: 'warning' },
                  { value: 'critical', label: 'Critical', color: 'destructive' },
                ],
              },
              {
                id: 'trend',
                header: 'Trend (30d)',
                accessor: 'trend',
                type: 'trend',
              },
            ],
          },
          {
            id: 'insights',
            type: 'custom',
            component: 'ConversionInsights',
            title: 'Key Insights',
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 4: IC PERFORMANCE
      // ─────────────────────────────────────────────────────
      {
        id: 'ics',
        label: 'IC Performance',
        icon: 'users',
        sections: [
          {
            id: 'pod-averages',
            type: 'info-card',
            title: 'Pod Benchmarks',
            fields: [
              { id: 'avg-placements', label: 'Avg Placements/Sprint', path: 'icMetrics.podAvg.placements' },
              { id: 'avg-submissions', label: 'Avg Submissions/Week', path: 'icMetrics.podAvg.submissions' },
              { id: 'avg-conversion', label: 'Avg Conversion Rate', path: 'icMetrics.podAvg.conversion', format: 'percentage' },
            ],
          },
          {
            id: 'ic-comparison',
            type: 'table',
            title: 'IC Comparison',
            dataSource: {
              type: 'field',
              path: 'icMetrics.ics',
            },
            sortable: true,
            columns_config: [
              {
                id: 'ic',
                header: 'IC',
                path: 'name',
                type: 'user',
                primary: true,
              },
              {
                id: 'placements',
                header: 'Placements/Sprint',
                accessor: 'placementsPerSprint',
                type: 'number',
                sortable: true,
              },
              {
                id: 'submissions',
                header: 'Submissions/Week',
                accessor: 'submissionsPerWeek',
                type: 'number',
                sortable: true,
              },
              {
                id: 'conversion',
                header: 'Conv. Rate',
                accessor: 'conversionRate',
                type: 'percentage',
                sortable: true,
              },
              {
                id: 'vs-avg',
                header: 'vs Pod Avg',
                accessor: 'vsPodAvg',
                type: 'percentage',
                highlight: {
                  positive: 'success',
                  negative: 'destructive',
                  neutral: 'muted',
                },
              },
              {
                id: 'status',
                header: 'Status',
                accessor: 'status',
                type: 'badge',
                options: [
                  { value: 'top_performer', label: '⭐ Top Performer', color: 'success' },
                  { value: 'solid', label: 'Solid', color: 'info' },
                  { value: 'needs_coaching', label: 'Needs Coaching', color: 'warning' },
                  { value: 'at_risk', label: 'At Risk', color: 'destructive' },
                ],
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                actions: [
                  {
                    id: 'view-details',
                    label: 'View Details',
                    icon: 'eye',
                    type: 'modal',
                    config: { type: 'modal', modal: 'ic-detail' },
                  },
                  {
                    id: 'schedule-1on1',
                    label: 'Schedule 1:1',
                    icon: 'calendar',
                    type: 'modal',
                    config: { type: 'modal', modal: 'schedule-1on1' },
                  },
                ],
              },
            ],
          },
          // TODO: Add panel/modal support to SectionDefinition type
          // {
          //   id: 'ic-detail-panel',
          //   type: 'panel',
          //   panelId: 'ic-detail',
          //   title: 'IC Performance Detail',
          //   sections: [...]
          // },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 5: REVENUE & MARGIN
      // ─────────────────────────────────────────────────────
      {
        id: 'revenue',
        label: 'Revenue',
        icon: 'dollar-sign',
        sections: [
          {
            id: 'revenue-kpis',
            type: 'metrics-grid',
            columns: 4,
            metrics: [
              {
                id: 'total-revenue',
                label: 'Total Pod Revenue',
                value: { type: 'field', path: 'revenueMetrics.totalRevenue' },
                format: { type: 'currency' },
                target: { type: 'field', path: 'revenueMetrics.targetRevenue' },
                size: 'large',
              },
              {
                id: 'active-placements',
                label: 'Active Placements',
                value: { type: 'field', path: 'revenueMetrics.activePlacements' },
                icon: 'users',
              },
              {
                id: 'avg-margin',
                label: 'Avg Margin/hr',
                value: { type: 'field', path: 'revenueMetrics.avgMargin' },
                format: { type: 'currency' },
                target: 20,
              },
              {
                id: 'margin-pct',
                label: 'Avg Margin %',
                value: { type: 'field', path: 'revenueMetrics.avgMarginPct' },
                format: { type: 'percentage' },
                target: 20,
              },
            ],
          },
          {
            id: 'placement-breakdown',
            type: 'table',
            title: 'Placement Breakdown',
            dataSource: {
              type: 'field',
              path: 'revenueMetrics.placements',
            },
            columns_config: [
              {
                id: 'placement',
                header: 'Placement',
                path: 'candidateName',
                type: 'link',
                config: { linkPattern: '/employee/placements/{{id}}' },
              },
              {
                id: 'client',
                header: 'Client',
                accessor: 'clientName',
                type: 'text',
              },
              {
                id: 'bill-rate',
                header: 'Bill Rate',
                accessor: 'billRate',
                type: 'currency',
              },
              {
                id: 'pay-rate',
                header: 'Pay Rate',
                accessor: 'payRate',
                type: 'currency',
              },
              {
                id: 'margin',
                header: 'Margin',
                accessor: 'margin',
                type: 'currency',
              },
              {
                id: 'monthly-revenue',
                header: 'Monthly Revenue',
                accessor: 'monthlyRevenue',
                type: 'currency',
              },
            ],
          },
          {
            id: 'revenue-trend',
            type: 'custom',
            component: 'RevenueTrendChart',
            title: 'Revenue Trend (6 Months)',
            span: 2,
          },
          {
            id: 'revenue-by-ic',
            type: 'custom',
            component: 'RevenueByICChart',
            title: 'Revenue per IC',
            span: 2,
          },
          {
            id: 'margin-quality',
            type: 'custom',
            component: 'MarginQualityBreakdown',
            title: 'Margin Quality Analysis',
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 6: CLIENT SATISFACTION
      // ─────────────────────────────────────────────────────
      {
        id: 'satisfaction',
        label: 'Client Satisfaction',
        icon: 'star',
        sections: [
          {
            id: 'nps-overview',
            type: 'custom',
            component: 'NPSScoreWidget',
            span: 4,
          },
          {
            id: 'feedback-breakdown',
            type: 'table',
            title: 'Client Feedback Ratings',
            dataSource: {
              type: 'field',
              path: 'satisfactionMetrics.categories',
            },
            columns_config: [
              {
                id: 'category',
                header: 'Category',
                path: 'name',
                type: 'text',
                primary: true,
              },
              {
                id: 'avg-rating',
                header: 'Avg Rating',
                accessor: 'avgRating',
                type: 'rating',
              },
              {
                id: 'status',
                header: 'Status',
                accessor: 'status',
                type: 'badge',
                options: [
                  { value: 'excellent', label: '✅ Excellent', color: 'success' },
                  { value: 'good', label: '🟢 Good', color: 'info' },
                  { value: 'needs_improvement', label: '🟡 Needs Work', color: 'warning' },
                  { value: 'poor', label: '🔴 Poor', color: 'destructive' },
                ],
              },
            ],
          },
          {
            id: 'recent-feedback',
            type: 'table',
            title: 'Recent Client Feedback',
            dataSource: {
              type: 'field',
              path: 'satisfactionMetrics.recentFeedback',
            },
            columns_config: [
              {
                id: 'client',
                header: 'Client',
                path: 'clientName',
                type: 'text',
              },
              {
                id: 'rating',
                header: 'Rating',
                accessor: 'rating',
                type: 'rating',
              },
              {
                id: 'comment',
                header: 'Comment',
                accessor: 'comment',
                type: 'text',
                truncate: 80,
              },
              {
                id: 'date',
                header: 'Date',
                accessor: 'createdAt',
                type: 'date',
              },
            ],
          },
          {
            id: 'retention-metrics',
            type: 'info-card',
            title: 'Client Retention',
            fields: [
              { id: 'clients-last-quarter', label: 'Clients (Last Quarter)', path: 'satisfactionMetrics.clientsLastQuarter' },
              { id: 'clients-this-quarter', label: 'Clients (This Quarter)', path: 'satisfactionMetrics.clientsThisQuarter' },
              { id: 'retention-rate', label: 'Retention Rate', path: 'satisfactionMetrics.retentionRate', format: 'percentage' },
              { id: 'lost-clients', label: 'Lost Clients', path: 'satisfactionMetrics.lostClients' },
            ],
          },
        ],
      },
    ],
  },
  
  actions: [
    {
      id: 'export-report',
      label: 'Export Report',
      icon: 'download',
      type: 'modal',
                    config: { type: 'modal', modal: 'export-report' },
      position: 'header',
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: 'refresh-cw',
      type: 'custom',
      handler: 'refresh',
      position: 'header',
    },
  ],

  // TODO: Add modals support to ScreenDefinition type
  // modals: [...],

  keyboardShortcuts: [
    { key: 'r', action: 'refresh', description: 'Refresh metrics' },
    { key: 'x', action: 'modal:export-report', description: 'Export report' },
    { key: '1', action: 'tab:sprint', description: 'Sprint metrics' },
    { key: '2', action: 'tab:pipeline', description: 'Pipeline health' },
    { key: '3', action: 'tab:conversions', description: 'Conversions' },
    { key: '4', action: 'tab:ics', description: 'IC performance' },
    { key: '5', action: 'tab:revenue', description: 'Revenue' },
    { key: '6', action: 'tab:satisfaction', description: 'Client satisfaction' },
    { key: 'g p', action: 'navigate:/employee/manager/pod', description: 'Go to Pod Dashboard' },
  ],
};

