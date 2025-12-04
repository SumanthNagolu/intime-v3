/**
 * System Logs Screen Definition
 *
 * View system logs, errors, and background job status.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const LOG_LEVEL_OPTIONS = [
  { value: 'error', label: 'Error' },
  { value: 'warn', label: 'Warning' },
  { value: 'info', label: 'Info' },
  { value: 'debug', label: 'Debug' },
];

const LOG_SOURCE_OPTIONS = [
  { value: 'api', label: 'API' },
  { value: 'auth', label: 'Authentication' },
  { value: 'database', label: 'Database' },
  { value: 'integration', label: 'Integration' },
  { value: 'scheduler', label: 'Scheduler' },
  { value: 'email', label: 'Email' },
  { value: 'webhook', label: 'Webhook' },
];

const JOB_STATUS_OPTIONS = [
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const errorLogsColumns: TableColumnDefinition[] = [
  {
    id: 'timestamp',
    label: 'Time',
    path: 'timestamp',
    type: 'date',
    sortable: true,
    width: '160px',
    config: { format: 'long' },
  },
  {
    id: 'level',
    label: 'Level',
    path: 'level',
    type: 'enum',
    width: '80px',
    config: {
      options: LOG_LEVEL_OPTIONS,
      badgeColors: { error: 'red', warn: 'yellow', info: 'blue', debug: 'gray' },
    },
  },
  {
    id: 'source',
    label: 'Source',
    path: 'source',
    type: 'enum',
    width: '100px',
    config: { options: LOG_SOURCE_OPTIONS },
  },
  {
    id: 'message',
    label: 'Message',
    path: 'message',
    type: 'text',
  },
  {
    id: 'stack',
    label: 'Stack',
    path: 'hasStack',
    type: 'boolean',
    width: '60px',
    config: { trueLabel: 'Yes', falseLabel: '-' },
  },
];

const apiLogsColumns: TableColumnDefinition[] = [
  {
    id: 'timestamp',
    label: 'Time',
    path: 'timestamp',
    type: 'date',
    sortable: true,
    width: '140px',
    config: { format: 'short' },
  },
  {
    id: 'method',
    label: 'Method',
    path: 'method',
    type: 'enum',
    width: '80px',
    config: {
      options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ],
      badgeColors: { GET: 'blue', POST: 'green', PUT: 'yellow', DELETE: 'red' },
    },
  },
  {
    id: 'path',
    label: 'Path',
    path: 'path',
    type: 'text',
    config: { monospace: true },
  },
  {
    id: 'status',
    label: 'Status',
    path: 'statusCode',
    type: 'number',
    width: '80px',
  },
  {
    id: 'duration',
    label: 'Duration',
    path: 'durationMs',
    type: 'number',
    width: '80px',
    config: { suffix: 'ms' },
  },
  {
    id: 'user',
    label: 'User',
    path: 'user.email',
    type: 'text',
  },
];

const jobsColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Job',
    path: 'name',
    type: 'text',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: JOB_STATUS_OPTIONS,
      badgeColors: {
        running: 'blue',
        completed: 'green',
        failed: 'red',
        scheduled: 'yellow',
        cancelled: 'gray',
      },
    },
  },
  {
    id: 'lastRun',
    label: 'Last Run',
    path: 'lastRunAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
  {
    id: 'nextRun',
    label: 'Next Run',
    path: 'nextRunAt',
    type: 'date',
    config: { format: 'relative' },
  },
  {
    id: 'duration',
    label: 'Duration',
    path: 'lastDurationMs',
    type: 'number',
    config: { suffix: 'ms' },
  },
  {
    id: 'successRate',
    label: 'Success Rate',
    path: 'successRate',
    type: 'progress',
    config: { max: 100 },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const systemLogsScreen: ScreenDefinition = {
  id: 'system-logs',
  type: 'dashboard',
  // entityType: 'systemLog', // Admin entity

  title: 'System Logs',
  subtitle: 'Monitor system health and troubleshoot issues',
  icon: 'Terminal',

  // Permissions
  permissions: [],

  // Layout
  layout: {
    type: 'tabs',
    defaultTab: 'errors',
    tabs: [
      // Error Logs Tab
      {
        id: 'errors',
        label: 'Error Logs',
        icon: 'AlertCircle',
        badge: { type: 'count', path: 'stats.errorCount', variant: 'destructive' },
        sections: [
          {
            id: 'error-metrics',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              { id: 'errorsToday', label: 'Errors Today', type: 'number', path: 'errors.today' },
              { id: 'warningsToday', label: 'Warnings Today', type: 'number', path: 'errors.warningsToday' },
              { id: 'errorRate', label: 'Error Rate', type: 'text', path: 'errors.rate', config: { suffix: '%' } },
              { id: 'mttr', label: 'Avg Resolution Time', type: 'text', path: 'errors.mttr' },
            ],
          },
          {
            id: 'error-filters',
            type: 'form',
            inline: true,
            fields: [
              {
                id: 'level',
                label: 'Level',
                type: 'multiselect',
                path: 'filters.level',
                options: [...LOG_LEVEL_OPTIONS],
              },
              {
                id: 'source',
                label: 'Source',
                type: 'multiselect',
                path: 'filters.source',
                options: [...LOG_SOURCE_OPTIONS],
              },
              {
                id: 'dateRange',
                label: 'Date Range',
                type: 'date-range',
                path: 'filters.dateRange',
              },
            ],
          },
          {
            id: 'error-logs-table',
            type: 'table',
            columns_config: errorLogsColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.logs.getErrors',
                params: {},
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'ErrorLogDetailModal',
            },
            pagination: { enabled: true, pageSize: 50 },
          },
        ],
      },
      // API Logs Tab
      {
        id: 'api',
        label: 'API Requests',
        icon: 'Globe',
        sections: [
          {
            id: 'api-metrics',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              { id: 'requestsToday', label: 'Requests Today', type: 'number', path: 'api.requestsToday' },
              { id: 'avgLatency', label: 'Avg Latency', type: 'text', path: 'api.avgLatency', config: { suffix: 'ms' } },
              { id: 'errorRate', label: 'Error Rate', type: 'text', path: 'api.errorRate', config: { suffix: '%' } },
              { id: 'p99Latency', label: 'P99 Latency', type: 'text', path: 'api.p99Latency', config: { suffix: 'ms' } },
            ],
          },
          {
            id: 'api-chart',
            type: 'custom',
            title: 'Request Volume',
            component: 'ApiRequestChart',
            componentProps: {
              period: '24h',
              showErrors: true,
            },
          },
          {
            id: 'api-filters',
            type: 'form',
            inline: true,
            fields: [
              {
                id: 'method',
                label: 'Method',
                type: 'multiselect',
                path: 'filters.method',
                options: [
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                  { value: 'DELETE', label: 'DELETE' },
                ],
              },
              {
                id: 'status',
                label: 'Status',
                type: 'select',
                path: 'filters.status',
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'success', label: '2xx Success' },
                  { value: 'error', label: '4xx/5xx Error' },
                ],
              },
              {
                id: 'minDuration',
                label: 'Min Duration (ms)',
                type: 'number',
                path: 'filters.minDuration',
              },
            ],
          },
          {
            id: 'api-logs-table',
            type: 'table',
            columns_config: apiLogsColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.logs.getApiRequests',
                params: {},
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'ApiLogDetailModal',
            },
            pagination: { enabled: true, pageSize: 50 },
          },
        ],
      },
      // Background Jobs Tab
      {
        id: 'jobs',
        label: 'Background Jobs',
        icon: 'Cpu',
        sections: [
          {
            id: 'jobs-metrics',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              { id: 'running', label: 'Running', type: 'number', path: 'jobs.running' },
              { id: 'scheduled', label: 'Scheduled', type: 'number', path: 'jobs.scheduled' },
              { id: 'failed24h', label: 'Failed (24h)', type: 'number', path: 'jobs.failed24h' },
              { id: 'successRate', label: 'Success Rate', type: 'progress', path: 'jobs.successRate', config: { max: 100 } },
            ],
          },
          {
            id: 'jobs-filters',
            type: 'form',
            inline: true,
            fields: [
              {
                id: 'status',
                label: 'Status',
                type: 'multiselect',
                path: 'filters.status',
                options: [...JOB_STATUS_OPTIONS],
              },
              {
                id: 'onlyFailed',
                label: 'Only failed jobs',
                type: 'checkbox',
                path: 'filters.onlyFailed',
              },
            ],
          },
          {
            id: 'jobs-table',
            type: 'table',
            columns_config: jobsColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.jobs.list',
                params: {},
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'JobDetailModal',
            },
            rowActions: [
              {
                id: 'run',
                type: 'mutation',
                label: 'Run Now',
                icon: 'Play',
                config: { type: 'mutation', procedure: 'admin.jobs.runNow' },
                visible: { field: 'status', operator: 'neq', value: 'running' },
              },
              {
                id: 'retry',
                type: 'mutation',
                label: 'Retry',
                icon: 'RefreshCw',
                config: { type: 'mutation', procedure: 'admin.jobs.retry' },
                visible: { field: 'status', operator: 'eq', value: 'failed' },
              },
              {
                id: 'cancel',
                type: 'mutation',
                label: 'Cancel',
                icon: 'X',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'admin.jobs.cancel' },
                visible: { field: 'status', operator: 'eq', value: 'running' },
              },
            ],
          },
        ],
      },
      // Performance Tab
      {
        id: 'performance',
        label: 'Performance',
        icon: 'TrendingUp',
        sections: [
          {
            id: 'performance-overview',
            type: 'custom',
            title: 'System Performance',
            component: 'PerformanceDashboard',
            componentProps: {
              metrics: ['cpu', 'memory', 'database', 'api_latency'],
              period: '24h',
            },
          },
          {
            id: 'slow-queries',
            type: 'table',
            title: 'Slow Queries',
            columns_config: [
              { id: 'query', label: 'Query', path: 'queryPreview', type: 'text', config: { monospace: true, truncate: 60 } },
              { id: 'duration', label: 'Duration', path: 'durationMs', type: 'number', sortable: true, config: { suffix: 'ms' } },
              { id: 'calls', label: 'Calls', path: 'callCount', type: 'number', sortable: true },
              { id: 'avgDuration', label: 'Avg', path: 'avgDurationMs', type: 'number', config: { suffix: 'ms' } },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.performance.getSlowQueries',
                params: { limit: 20 },
              },
            },
          },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'export',
      type: 'custom',
      label: 'Export Logs',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportLogs' },
    },
    {
      id: 'refresh',
      type: 'custom',
      label: 'Refresh',
      variant: 'outline',
      icon: 'RefreshCw',
      config: { type: 'custom', handler: 'handleRefresh' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Admin', route: '/admin' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'System Logs' },
    ],
  },
};

export default systemLogsScreen;
