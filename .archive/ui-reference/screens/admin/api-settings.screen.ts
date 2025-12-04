/**
 * API Settings Screen Definition
 *
 * Manage API keys, webhooks, and rate limits.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const API_KEY_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'expired', label: 'Expired' },
];

const WEBHOOK_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'failed', label: 'Failed' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const apiKeysColumns: TableColumnDefinition[] = [
  { id: 'name', label: 'Name', path: 'name', type: 'text', sortable: true },
  { id: 'prefix', label: 'Key Prefix', path: 'keyPrefix', type: 'text', config: { monospace: true } },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: API_KEY_STATUS_OPTIONS,
      badgeColors: { active: 'green', revoked: 'red', expired: 'yellow' },
    },
  },
  { id: 'createdBy', label: 'Created By', path: 'createdBy.fullName', type: 'text' },
  { id: 'lastUsed', label: 'Last Used', path: 'lastUsedAt', type: 'date', config: { format: 'relative' } },
  { id: 'expiresAt', label: 'Expires', path: 'expiresAt', type: 'date' },
];

const webhooksColumns: TableColumnDefinition[] = [
  { id: 'name', label: 'Name', path: 'name', type: 'text', sortable: true },
  { id: 'url', label: 'URL', path: 'url', type: 'url', config: { truncate: 40 } },
  { id: 'events', label: 'Events', path: 'eventCount', type: 'number', config: { suffix: ' events' } },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: WEBHOOK_STATUS_OPTIONS,
      badgeColors: { active: 'green', paused: 'yellow', failed: 'red' },
    },
  },
  { id: 'successRate', label: 'Success Rate', path: 'successRate', type: 'progress', config: { max: 100 } },
  { id: 'lastTriggered', label: 'Last Triggered', path: 'lastTriggeredAt', type: 'date', config: { format: 'relative' } },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const apiSettingsScreen: ScreenDefinition = {
  id: 'api-settings',
  type: 'detail',
  // entityType: 'organization', // Admin entity

  title: 'API & Webhooks',
  subtitle: 'Manage API access and webhook configurations',
  icon: 'Code',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.settings.getApi',
      params: {},
    },
  },

  // Layout
  layout: {
    type: 'tabs',
    defaultTab: 'api-keys',
    tabs: [
      // API Keys Tab
      {
        id: 'api-keys',
        label: 'API Keys',
        icon: 'Key',
        sections: [
          {
            id: 'api-keys-info',
            type: 'info-card',
            title: 'API Access',
            description: 'Generate API keys for programmatic access to your data',
            fields: [
              { id: 'baseUrl', label: 'API Base URL', type: 'text', path: 'api.baseUrl', config: { copyable: true } },
              { id: 'version', label: 'Current Version', type: 'text', path: 'api.version' },
              { id: 'docsUrl', label: 'Documentation', type: 'url', path: 'api.docsUrl' },
            ],
          },
          {
            id: 'api-keys-table',
            type: 'table',
            title: 'API Keys',
            columns_config: apiKeysColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.apiKeys.list',
                params: {},
              },
            },
            rowActions: [
              {
                id: 'view',
                type: 'modal',
                label: 'View',
                icon: 'Eye',
                config: { type: 'modal', modal: 'ViewApiKeyModal' },
              },
              {
                id: 'revoke',
                type: 'mutation',
                label: 'Revoke',
                icon: 'X',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'admin.apiKeys.revoke' },
                confirm: {
                  title: 'Revoke API Key',
                  message: 'This key will immediately stop working. This cannot be undone.',
                  destructive: true,
                },
                visible: { field: 'status', operator: 'eq', value: 'active' },
              },
            ],
            emptyState: {
              title: 'No API keys',
              description: 'Create an API key to enable programmatic access',
              icon: 'Key',
            },
            actions: [
              {
                id: 'create-key',
                type: 'modal',
                label: 'Create API Key',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'CreateApiKeyModal' },
              },
            ],
          },
        ],
      },
      // Webhooks Tab
      {
        id: 'webhooks',
        label: 'Webhooks',
        icon: 'Link',
        sections: [
          {
            id: 'webhooks-info',
            type: 'info-card',
            title: 'Webhooks',
            description: 'Receive real-time notifications when events occur',
            fields: [
              { id: 'signingSecret', label: 'Signing Secret', type: 'text', path: 'webhooks.signingSecret', config: { copyable: true } },
            ],
            actions: [
              {
                id: 'regenerate-secret',
                type: 'mutation',
                label: 'Regenerate Secret',
                icon: 'RefreshCw',
                config: { type: 'mutation', procedure: 'admin.webhooks.regenerateSecret' },
                confirm: {
                  title: 'Regenerate Signing Secret',
                  message: 'All existing webhooks will need to be updated with the new secret.',
                },
              },
            ],
          },
          {
            id: 'webhooks-table',
            type: 'table',
            title: 'Webhook Endpoints',
            columns_config: webhooksColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.webhooks.list',
                params: {},
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'EditWebhookModal',
            },
            rowActions: [
              {
                id: 'edit',
                type: 'modal',
                label: 'Edit',
                icon: 'Pencil',
                config: { type: 'modal', modal: 'EditWebhookModal' },
              },
              {
                id: 'test',
                type: 'custom',
                label: 'Test',
                icon: 'Zap',
                config: { type: 'custom', handler: 'handleTestWebhook' },
              },
              {
                id: 'pause',
                type: 'mutation',
                label: 'Pause',
                icon: 'Pause',
                config: { type: 'mutation', procedure: 'admin.webhooks.pause' },
                visible: { field: 'status', operator: 'eq', value: 'active' },
              },
              {
                id: 'resume',
                type: 'mutation',
                label: 'Resume',
                icon: 'Play',
                config: { type: 'mutation', procedure: 'admin.webhooks.resume' },
                visible: { field: 'status', operator: 'eq', value: 'paused' },
              },
              {
                id: 'delete',
                type: 'mutation',
                label: 'Delete',
                icon: 'Trash2',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'admin.webhooks.delete' },
                confirm: {
                  title: 'Delete Webhook',
                  message: 'This webhook will be permanently deleted.',
                  destructive: true,
                },
              },
            ],
            emptyState: {
              title: 'No webhooks',
              description: 'Create a webhook to receive event notifications',
              icon: 'Link',
            },
            actions: [
              {
                id: 'create-webhook',
                type: 'modal',
                label: 'Create Webhook',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'CreateWebhookModal' },
              },
            ],
          },
        ],
      },
      // Rate Limits Tab
      {
        id: 'rate-limits',
        label: 'Rate Limits',
        icon: 'Gauge',
        sections: [
          {
            id: 'rate-limit-info',
            type: 'metrics-grid',
            title: 'Current Usage',
            columns: 4,
            fields: [
              { id: 'requestsToday', label: 'Requests Today', type: 'number', path: 'usage.requestsToday' },
              { id: 'requestsLimit', label: 'Daily Limit', type: 'number', path: 'usage.dailyLimit' },
              { id: 'rateLimitHits', label: 'Rate Limit Hits', type: 'number', path: 'usage.rateLimitHits' },
              { id: 'averageLatency', label: 'Avg Latency', type: 'text', path: 'usage.averageLatency', config: { suffix: 'ms' } },
            ],
          },
          {
            id: 'rate-limit-settings',
            type: 'form',
            title: 'Rate Limit Configuration',
            description: 'Set API rate limits for your organization',
            columns: 2,
            editable: true,
            fields: [
              {
                id: 'requestsPerMinute',
                label: 'Requests per Minute',
                type: 'number',
                path: 'rateLimits.requestsPerMinute',
                config: { min: 10, max: 1000, step: 10 },
              },
              {
                id: 'requestsPerHour',
                label: 'Requests per Hour',
                type: 'number',
                path: 'rateLimits.requestsPerHour',
                config: { min: 100, max: 10000, step: 100 },
              },
              {
                id: 'requestsPerDay',
                label: 'Requests per Day',
                type: 'number',
                path: 'rateLimits.requestsPerDay',
                config: { min: 1000, max: 100000, step: 1000 },
              },
              {
                id: 'burstLimit',
                label: 'Burst Limit',
                type: 'number',
                path: 'rateLimits.burstLimit',
                config: { min: 10, max: 100, helpText: 'Max requests in a 1-second burst' },
              },
            ],
            actions: [
              {
                id: 'save-limits',
                type: 'mutation',
                label: 'Save Rate Limits',
                variant: 'primary',
                icon: 'Save',
                config: { type: 'mutation', procedure: 'admin.settings.updateRateLimits' },
              },
            ],
          },
          {
            id: 'usage-chart',
            type: 'custom',
            title: 'API Usage Over Time',
            component: 'ApiUsageChart',
            componentProps: {
              period: '7days',
              showLimit: true,
            },
          },
        ],
      },
      // Available Events Tab
      {
        id: 'events',
        label: 'Event Types',
        icon: 'Zap',
        sections: [
          {
            id: 'events-list',
            type: 'custom',
            title: 'Available Webhook Events',
            description: 'Events that can trigger webhook notifications',
            component: 'WebhookEventList',
            componentProps: {
              categories: [
                {
                  id: 'candidate',
                  label: 'Candidates',
                  events: [
                    { id: 'candidate.created', description: 'New candidate added' },
                    { id: 'candidate.updated', description: 'Candidate profile updated' },
                    { id: 'candidate.status_changed', description: 'Candidate status changed' },
                    { id: 'candidate.submitted', description: 'Candidate submitted to job' },
                  ],
                },
                {
                  id: 'job',
                  label: 'Jobs',
                  events: [
                    { id: 'job.created', description: 'New job created' },
                    { id: 'job.updated', description: 'Job updated' },
                    { id: 'job.published', description: 'Job published' },
                    { id: 'job.closed', description: 'Job closed' },
                  ],
                },
                {
                  id: 'submission',
                  label: 'Submissions',
                  events: [
                    { id: 'submission.created', description: 'New submission created' },
                    { id: 'submission.status_changed', description: 'Submission status changed' },
                    { id: 'submission.approved', description: 'Submission approved' },
                    { id: 'submission.rejected', description: 'Submission rejected' },
                  ],
                },
                {
                  id: 'placement',
                  label: 'Placements',
                  events: [
                    { id: 'placement.created', description: 'New placement started' },
                    { id: 'placement.extended', description: 'Placement extended' },
                    { id: 'placement.ended', description: 'Placement ended' },
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  },

  // Navigation
  navigation: {
    back: { label: 'Back to Settings', route: '/admin/settings' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Settings', route: '/admin/settings' },
      { label: 'API & Webhooks' },
    ],
  },
};

export default apiSettingsScreen;
