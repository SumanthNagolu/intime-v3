/**
 * Process Metrics Screen Definition
 *
 * Detailed process metrics and continuous improvement tracking for COO.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const processMetricsScreen: ScreenDefinition = {
  id: 'process-metrics',
  type: 'dashboard',
  title: 'Process Metrics',
  subtitle: 'Cycle times, quality metrics, and continuous improvement',
  icon: 'Activity',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'operations.getProcessMetrics',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Cycle Time KPIs
      {
        id: 'cycle-time-kpis',
        type: 'metrics-grid',
        title: 'Cycle Time Summary',
        columns: 4,
        fields: [
          {
            id: 'avg-time-to-fill',
            label: 'Avg Time to Fill',
            type: 'number',
            path: 'cycleTimes.avgTimeToFill',
            config: { suffix: ' days', target: 30, inverse: true, icon: 'Clock' },
          },
          {
            id: 'avg-time-to-submit',
            label: 'Avg Time to Submit',
            type: 'number',
            path: 'cycleTimes.avgTimeToSubmit',
            config: { suffix: ' days', target: 5, inverse: true, icon: 'Send' },
          },
          {
            id: 'avg-interview-cycle',
            label: 'Interview Cycle',
            type: 'number',
            path: 'cycleTimes.avgInterviewCycle',
            config: { suffix: ' days', target: 10, inverse: true, icon: 'Users' },
          },
          {
            id: 'avg-offer-cycle',
            label: 'Offer to Start',
            type: 'number',
            path: 'cycleTimes.avgOfferToStart',
            config: { suffix: ' days', target: 14, inverse: true, icon: 'Calendar' },
          },
        ],
      },

      // Cycle Time by Stage Chart
      {
        id: 'cycle-time-chart',
        type: 'custom',
        component: 'CycleTimeByStageChart',
        title: 'Cycle Time by Stage',
        config: {
          stages: ['Job Open → First Submit', 'Submit → Interview', 'Interview → Offer', 'Offer → Start'],
          showTarget: true,
          height: 350,
        },
      },

      // Stage Duration Table
      {
        id: 'stage-durations',
        type: 'table',
        title: 'Stage Duration Details',
        icon: 'Clock',
        dataSource: {
          type: 'field',
          path: 'stageDurations',
        },
        columns_config: [
          { id: 'stage', header: 'Stage', path: 'stageName', type: 'text' },
          { id: 'avg-duration', header: 'Avg Duration (Days)', path: 'avgDuration', type: 'number', sortable: true },
          { id: 'median', header: 'Median', path: 'medianDuration', type: 'number' },
          { id: 'min', header: 'Min', path: 'minDuration', type: 'number' },
          { id: 'max', header: 'Max', path: 'maxDuration', type: 'number' },
          { id: 'target', header: 'Target', path: 'targetDuration', type: 'number' },
          { id: 'variance', header: 'Variance', path: 'variance', type: 'percentage' },
        ],
      },

      // Quality Metrics
      {
        id: 'quality-metrics',
        type: 'metrics-grid',
        title: 'Quality Metrics',
        columns: 4,
        fields: [
          {
            id: 'submission-quality',
            label: 'Submission Quality',
            type: 'percentage',
            path: 'quality.submissionQuality',
            config: { target: 90, icon: 'FileCheck' },
          },
          {
            id: 'interview-pass-rate',
            label: 'Interview Pass Rate',
            type: 'percentage',
            path: 'quality.interviewPassRate',
            config: { target: 70, icon: 'UserCheck' },
          },
          {
            id: 'offer-acceptance',
            label: 'Offer Acceptance',
            type: 'percentage',
            path: 'quality.offerAcceptance',
            config: { target: 85, icon: 'Check' },
          },
          {
            id: 'falloff-rate',
            label: 'Falloff Rate',
            type: 'percentage',
            path: 'quality.falloffRate',
            config: { target: 5, inverse: true, icon: 'UserX' },
          },
        ],
      },

      // Error Rates
      {
        id: 'error-rates',
        type: 'info-card',
        title: 'Error & Rework Rates',
        icon: 'AlertCircle',
        fields: [
          { id: 'data-entry-errors', label: 'Data Entry Errors', type: 'percentage', path: 'errors.dataEntryRate' },
          { id: 'submission-rework', label: 'Submission Rework Rate', type: 'percentage', path: 'errors.submissionReworkRate' },
          { id: 'interview-reschedule', label: 'Interview Reschedule Rate', type: 'percentage', path: 'errors.interviewRescheduleRate' },
          { id: 'offer-revision', label: 'Offer Revision Rate', type: 'percentage', path: 'errors.offerRevisionRate' },
        ],
      },

      // Automation Rates
      {
        id: 'automation-rates',
        type: 'custom',
        component: 'AutomationRatesChart',
        title: 'Process Automation Rates',
        config: {
          chartType: 'horizontal-bar',
          height: 300,
          processes: ['Email Sending', 'Resume Parsing', 'Interview Scheduling', 'Status Updates', 'Notifications'],
        },
      },

      // Continuous Improvement Tracking
      {
        id: 'improvement-tracking',
        type: 'table',
        title: 'Continuous Improvement Initiatives',
        icon: 'TrendingUp',
        dataSource: {
          type: 'field',
          path: 'improvements',
        },
        columns_config: [
          { id: 'initiative', header: 'Initiative', path: 'name', type: 'text' },
          { id: 'category', header: 'Category', path: 'category', type: 'enum', config: { options: [{ value: 'cycle_time', label: 'Cycle Time' }, { value: 'quality', label: 'Quality' }, { value: 'automation', label: 'Automation' }, { value: 'cost', label: 'Cost Reduction' }] } },
          { id: 'baseline', header: 'Baseline', path: 'baseline', type: 'text' },
          { id: 'target', header: 'Target', path: 'target', type: 'text' },
          { id: 'current', header: 'Current', path: 'current', type: 'text' },
          { id: 'progress', header: 'Progress', path: 'progressPercent', type: 'percentage' },
          { id: 'status', header: 'Status', path: 'status', type: 'enum', config: { options: [{ value: 'on_track', label: 'On Track' }, { value: 'at_risk', label: 'At Risk' }, { value: 'completed', label: 'Completed' }], badgeColors: { on_track: 'green', at_risk: 'yellow', completed: 'blue' } } },
        ],
        actions: [
          {
            id: 'view-details',
            type: 'modal',
            label: 'View',
            icon: 'Eye',
            config: { type: 'modal', modal: 'ImprovementDetailModal' },
          },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },

      // Benchmark Comparison
      {
        id: 'benchmark-comparison',
        type: 'custom',
        component: 'BenchmarkComparisonChart',
        title: 'Internal Benchmarks (Pod vs Pod)',
        collapsible: true,
        config: {
          chartType: 'radar',
          height: 400,
        },
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
      config: { type: 'modal', modal: 'ExportProcessMetricsModal' },
    },
    {
      id: 'new-initiative',
      type: 'modal',
      label: 'New Initiative',
      icon: 'Plus',
      variant: 'outline',
      config: { type: 'modal', modal: 'NewImprovementInitiativeModal' },
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
      { label: 'Process Metrics' },
    ],
  },
};
