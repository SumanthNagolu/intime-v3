/**
 * Integration Detail Screen Definition
 *
 * Configure and manage a specific integration.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const SYNC_FREQUENCY_OPTIONS = [
  { value: 'realtime', label: 'Real-time' },
  { value: '15min', label: 'Every 15 minutes' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'manual', label: 'Manual only' },
];

const SYNC_STATUS_OPTIONS = [
  { value: 'success', label: 'Success' },
  { value: 'running', label: 'Running' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const syncLogsColumns: TableColumnDefinition[] = [
  { id: 'startedAt', label: 'Started', path: 'startedAt', type: 'date', config: { format: 'long' } },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: SYNC_STATUS_OPTIONS,
      badgeColors: { success: 'green', running: 'blue', failed: 'red', pending: 'yellow' },
    },
  },
  { id: 'recordsProcessed', label: 'Records', path: 'recordsProcessed', type: 'number' },
  { id: 'duration', label: 'Duration', path: 'durationMs', type: 'text', config: { format: 'duration' } },
  { id: 'message', label: 'Message', path: 'message', type: 'text' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const integrationDetailScreen: ScreenDefinition = {
  id: 'integration-detail',
  type: 'detail',
  // entityType: 'integration', // Admin entity

  title: fieldValue('name'),
  subtitle: fieldValue('description'),
  icon: 'Plug',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.integrations.getById',
      params: { id: fieldValue('id') },
    },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar - Integration Info
    sidebar: {
      id: 'integration-info',
      type: 'info-card',
      header: {
        type: 'icon',
        path: 'logoUrl',
        size: 'lg',
      },
      fields: [
        { id: 'name', label: 'Integration', type: 'text', path: 'name' },
        { id: 'category', label: 'Category', type: 'text', path: 'categoryLabel' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: [
              { value: 'connected', label: 'Connected' },
              { value: 'disconnected', label: 'Disconnected' },
              { value: 'error', label: 'Error' },
              { value: 'pending', label: 'Pending Setup' },
            ],
            badgeColors: {
              connected: 'green',
              disconnected: 'gray',
              error: 'red',
              pending: 'yellow',
            },
          },
        },
        { id: 'lastSyncAt', label: 'Last Sync', type: 'date', path: 'lastSyncAt', config: { format: 'relative' } },
        { id: 'connectedAt', label: 'Connected', type: 'date', path: 'connectedAt' },
        { id: 'connectedBy', label: 'Connected By', type: 'text', path: 'connectedBy.fullName' },
      ],
      footer: {
        type: 'actions',
        actions: [
          {
            id: 'sync-now',
            type: 'mutation',
            label: 'Sync Now',
            icon: 'RefreshCw',
            variant: 'secondary',
            config: { type: 'mutation', procedure: 'admin.integrations.sync' },
            visible: { field: 'status', operator: 'eq', value: 'connected' },
          },
          {
            id: 'test-connection',
            type: 'custom',
            label: 'Test Connection',
            icon: 'CheckCircle',
            variant: 'outline',
            config: { type: 'custom', handler: 'handleTestConnection' },
            visible: { field: 'status', operator: 'eq', value: 'connected' },
          },
        ],
      },
    },

    // Main content - Tabs
    tabs: [
      // Configuration Tab
      {
        id: 'configuration',
        label: 'Configuration',
        icon: 'Settings',
        sections: [
          // Credentials Section
          {
            id: 'credentials',
            type: 'form',
            title: 'Credentials',
            description: 'API keys and authentication',
            icon: 'Key',
            columns: 1,
            editable: true,
            fields: [
              {
                id: 'apiKey',
                label: 'API Key',
                type: 'text',
                path: 'config.apiKey',
                config: { placeholder: 'Enter API key...' },
              },
              {
                id: 'apiSecret',
                label: 'API Secret',
                type: 'text',
                path: 'config.apiSecret',
                config: { placeholder: 'Enter API secret...' },
                visible: { field: 'requiresSecret', operator: 'eq', value: true },
              },
              {
                id: 'accessToken',
                label: 'Access Token',
                type: 'text',
                path: 'config.accessToken',
                config: { placeholder: 'Enter access token...' },
                visible: { field: 'authType', operator: 'eq', value: 'oauth' },
              },
              {
                id: 'refreshToken',
                label: 'Refresh Token',
                type: 'text',
                path: 'config.refreshToken',
                visible: { field: 'authType', operator: 'eq', value: 'oauth' },
              },
            ],
            actions: [
              {
                id: 'connect-oauth',
                type: 'custom',
                label: 'Connect via OAuth',
                icon: 'ExternalLink',
                variant: 'secondary',
                config: { type: 'custom', handler: 'handleOAuthConnect' },
                visible: { field: 'authType', operator: 'eq', value: 'oauth' },
              },
              {
                id: 'save-credentials',
                type: 'mutation',
                label: 'Save Credentials',
                variant: 'primary',
                icon: 'Save',
                config: { type: 'mutation', procedure: 'admin.integrations.updateCredentials' },
              },
            ],
          },
          // Sync Settings
          {
            id: 'sync-settings',
            type: 'form',
            title: 'Sync Settings',
            description: 'Configure synchronization behavior',
            icon: 'RefreshCw',
            columns: 2,
            editable: true,
            fields: [
              {
                id: 'syncFrequency',
                label: 'Sync Frequency',
                type: 'select',
                path: 'sync.frequency',
                options: [...SYNC_FREQUENCY_OPTIONS],
              },
              {
                id: 'syncDirection',
                label: 'Sync Direction',
                type: 'radio',
                path: 'sync.direction',
                config: {
                  options: [
                    { value: 'import', label: 'Import only' },
                    { value: 'export', label: 'Export only' },
                    { value: 'bidirectional', label: 'Bidirectional' },
                  ],
                },
              },
              {
                id: 'autoSync',
                label: 'Auto-sync enabled',
                type: 'checkbox',
                path: 'sync.autoEnabled',
                config: { defaultValue: true },
              },
              {
                id: 'syncOnCreate',
                label: 'Sync on record creation',
                type: 'checkbox',
                path: 'sync.onRecordCreate',
              },
              {
                id: 'syncOnUpdate',
                label: 'Sync on record update',
                type: 'checkbox',
                path: 'sync.onRecordUpdate',
              },
            ],
            actions: [
              {
                id: 'save-sync',
                type: 'mutation',
                label: 'Save Sync Settings',
                variant: 'primary',
                icon: 'Save',
                config: { type: 'mutation', procedure: 'admin.integrations.updateSyncSettings' },
              },
            ],
          },
          // Data Mapping (if applicable)
          {
            id: 'field-mapping',
            type: 'custom',
            title: 'Field Mapping',
            description: 'Map fields between systems',
            icon: 'GitMerge',
            component: 'FieldMappingEditor',
            componentProps: {
              integrationId: fieldValue('id'),
            },
            visible: { field: 'supportsFieldMapping', operator: 'eq', value: true },
          },
        ],
      },
      // Sync Logs Tab
      {
        id: 'logs',
        label: 'Sync Logs',
        icon: 'FileText',
        sections: [
          {
            id: 'logs-filter',
            type: 'form',
            inline: true,
            fields: [
              {
                id: 'dateRange',
                label: 'Date Range',
                type: 'date-range',
                path: 'filters.dateRange',
              },
              {
                id: 'status',
                label: 'Status',
                type: 'multiselect',
                path: 'filters.status',
                options: [...SYNC_STATUS_OPTIONS],
              },
            ],
          },
          {
            id: 'sync-logs-table',
            type: 'table',
            columns_config: syncLogsColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.integrations.getSyncLogs',
                params: { integrationId: fieldValue('id') },
              },
            },
            rowClick: {
              type: 'modal',
              modal: 'SyncLogDetailModal',
            },
            emptyState: {
              title: 'No sync logs',
              description: 'Sync logs will appear here after the first sync',
              icon: 'FileText',
            },
          },
        ],
      },
      // Webhooks Tab (if supported)
      {
        id: 'webhooks',
        label: 'Webhooks',
        icon: 'Link',
        visible: { field: 'supportsWebhooks', operator: 'eq', value: true },
        sections: [
          {
            id: 'webhook-config',
            type: 'info-card',
            title: 'Incoming Webhook',
            description: 'URL for receiving events from the integration',
            fields: [
              {
                id: 'webhookUrl',
                label: 'Webhook URL',
                type: 'text',
                path: 'webhooks.incomingUrl',
                config: { copyable: true },
              },
              {
                id: 'webhookSecret',
                label: 'Webhook Secret',
                type: 'text',
                path: 'webhooks.secret',
                config: { copyable: true },
              },
            ],
            actions: [
              {
                id: 'regenerate-secret',
                type: 'mutation',
                label: 'Regenerate Secret',
                icon: 'RefreshCw',
                config: { type: 'mutation', procedure: 'admin.integrations.regenerateWebhookSecret' },
                confirm: {
                  title: 'Regenerate Webhook Secret',
                  message: 'The old secret will no longer work. Update your integration settings.',
                },
              },
            ],
          },
          {
            id: 'webhook-events',
            type: 'custom',
            title: 'Event Subscriptions',
            description: 'Select which events to receive',
            component: 'WebhookEventSelector',
            componentProps: {
              integrationId: fieldValue('id'),
            },
          },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'sync-now',
      type: 'mutation',
      label: 'Sync Now',
      variant: 'primary',
      icon: 'RefreshCw',
      config: { type: 'mutation', procedure: 'admin.integrations.sync' },
      visible: { field: 'status', operator: 'eq', value: 'connected' },
    },
    {
      id: 'disconnect',
      type: 'mutation',
      label: 'Disconnect',
      variant: 'destructive',
      icon: 'Unplug',
      config: { type: 'mutation', procedure: 'admin.integrations.disconnect' },
      confirm: {
        title: 'Disconnect Integration',
        message: 'This will stop all syncing. You can reconnect later.',
        destructive: true,
      },
      visible: { field: 'status', operator: 'eq', value: 'connected' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Integrations', route: '/admin/integrations' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Integrations', route: '/admin/integrations' },
      { label: fieldValue('name') },
    ],
  },
};

export default integrationDetailScreen;
