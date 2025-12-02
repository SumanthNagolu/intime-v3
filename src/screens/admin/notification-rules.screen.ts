/**
 * Notification Rules Screen Definition
 *
 * Configure notification templates and trigger rules.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const NOTIFICATION_CATEGORY_OPTIONS = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'crm', label: 'CRM' },
  { value: 'hr', label: 'HR' },
  { value: 'system', label: 'System' },
  { value: 'admin', label: 'Admin' },
];

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' },
  { value: 'sms', label: 'SMS' },
  { value: 'slack', label: 'Slack' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const notificationRulesColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Notification',
    path: 'name',
    type: 'text',
    sortable: true,
    config: {
      subtitle: { path: 'eventType', style: 'monospace' },
    },
  },
  {
    id: 'category',
    label: 'Category',
    path: 'category',
    type: 'enum',
    sortable: true,
    config: {
      options: NOTIFICATION_CATEGORY_OPTIONS,
      badgeColors: {
        recruiting: 'blue',
        bench_sales: 'purple',
        crm: 'green',
        hr: 'cyan',
        system: 'gray',
        admin: 'red',
      },
    },
  },
  {
    id: 'channels',
    label: 'Channels',
    path: 'channelsDisplay',
    type: 'text',
  },
  {
    id: 'recipientRule',
    label: 'Recipients',
    path: 'recipientRuleDisplay',
    type: 'text',
  },
  {
    id: 'enabled',
    label: 'Enabled',
    path: 'isActive',
    type: 'boolean',
  },
  {
    id: 'sentCount',
    label: 'Sent (24h)',
    path: 'sentCount24h',
    type: 'number',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const notificationRulesScreen: ScreenDefinition = {
  id: 'notification-rules',
  type: 'list',
  // entityType: 'notificationRule', // Admin entity

  title: 'Notification Rules',
  subtitle: 'Configure notification triggers and templates',
  icon: 'Bell',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'list',
    // entityType: 'notificationRule', // Admin entity
    sort: { field: 'category', direction: 'asc' },
    pagination: false,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'total', label: 'Total Rules', type: 'number', path: 'stats.total' },
          { id: 'active', label: 'Active', type: 'number', path: 'stats.active' },
          { id: 'sent24h', label: 'Sent (24h)', type: 'number', path: 'stats.sent24h' },
          { id: 'deliveryRate', label: 'Delivery Rate', type: 'progress', path: 'stats.deliveryRate', config: { max: 100 } },
        ],
        dataSource: {
          type: 'aggregate',
          // entityType: 'notificationRule', // Admin entity
        },
      },
      // Category Tabs
      {
        id: 'category-tabs',
        type: 'custom',
        component: 'CategoryTabs',
        componentProps: {
          tabs: [
            { id: 'all', label: 'All', countPath: 'stats.total' },
            { id: 'recruiting', label: 'Recruiting', countPath: 'stats.recruiting' },
            { id: 'bench_sales', label: 'Bench Sales', countPath: 'stats.benchSales' },
            { id: 'crm', label: 'CRM', countPath: 'stats.crm' },
            { id: 'system', label: 'System', countPath: 'stats.system' },
          ],
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'search',
            label: 'Search',
            type: 'text',
            path: 'search',
            config: { placeholder: 'Search notifications...' },
          },
          {
            id: 'channel',
            label: 'Channel',
            type: 'multiselect',
            path: 'filters.channel',
            options: [...CHANNEL_OPTIONS],
          },
          {
            id: 'enabled',
            label: 'Status',
            type: 'select',
            path: 'filters.enabled',
            options: [
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active only' },
              { value: 'inactive', label: 'Inactive only' },
            ],
          },
        ],
      },
      // Notification Rules Table
      {
        id: 'notification-rules-table',
        type: 'table',
        columns_config: notificationRulesColumns,
        rowClick: {
          type: 'modal',
          modal: 'EditNotificationRuleModal',
        },
        rowActions: [
          {
            id: 'edit',
            type: 'modal',
            label: 'Edit',
            icon: 'Pencil',
            config: { type: 'modal', modal: 'EditNotificationRuleModal' },
          },
          {
            id: 'toggle',
            type: 'mutation',
            label: 'Toggle',
            icon: 'ToggleRight',
            config: { type: 'mutation', procedure: 'admin.notificationRules.toggle' },
          },
          {
            id: 'preview',
            type: 'modal',
            label: 'Preview',
            icon: 'Eye',
            config: { type: 'modal', modal: 'PreviewNotificationModal' },
          },
          {
            id: 'test',
            type: 'modal',
            label: 'Send Test',
            icon: 'Send',
            config: { type: 'modal', modal: 'SendTestNotificationModal' },
          },
          {
            id: 'duplicate',
            type: 'mutation',
            label: 'Duplicate',
            icon: 'Copy',
            config: { type: 'mutation', procedure: 'admin.notificationRules.duplicate' },
          },
        ],
      },
      // Channel Configuration
      {
        id: 'channel-config',
        type: 'custom',
        title: 'Channel Configuration',
        description: 'Configure delivery channels',
        component: 'NotificationChannelConfig',
        componentProps: {
          channels: [
            { id: 'email', name: 'Email', icon: 'Mail', configurable: true },
            { id: 'push', name: 'Push', icon: 'Bell', configurable: true },
            { id: 'sms', name: 'SMS', icon: 'MessageSquare', configurable: true },
            { id: 'slack', name: 'Slack', icon: 'Hash', configurable: true },
          ],
        },
        collapsible: true,
        defaultExpanded: false,
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create',
      type: 'modal',
      label: 'Create Rule',
      variant: 'primary',
      icon: 'Plus',
      config: { type: 'modal', modal: 'CreateNotificationRuleModal' },
    },
    {
      id: 'templates',
      type: 'navigate',
      label: 'Email Templates',
      variant: 'secondary',
      icon: 'FileText',
      config: { type: 'navigate', route: '/admin/settings/email' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Workflows', route: '/admin/workflows' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Workflows', route: '/admin/workflows' },
      { label: 'Notification Rules' },
    ],
  },
};

export default notificationRulesScreen;
