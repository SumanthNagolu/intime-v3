/**
 * Admin Dashboard Screen Definition
 *
 * Main dashboard for system administrators with system health overview,
 * KPIs, alerts, and quick actions.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ALERT_SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

const ALERT_TYPE_OPTIONS = [
  { value: 'security', label: 'Security' },
  { value: 'system', label: 'System' },
  { value: 'user', label: 'User' },
  { value: 'data', label: 'Data' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const alertsTableColumns: TableColumnDefinition[] = [
  {
    id: 'severity',
    label: 'Severity',
    path: 'severity',
    type: 'enum',
    width: '100px',
    config: {
      options: ALERT_SEVERITY_OPTIONS,
      badgeColors: { critical: 'red', warning: 'yellow', info: 'blue' },
    },
  },
  { id: 'message', label: 'Alert', path: 'message', type: 'text' },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    config: {
      options: ALERT_TYPE_OPTIONS,
      badgeColors: { security: 'red', system: 'purple', user: 'blue', data: 'cyan' },
    },
  },
  { id: 'createdAt', label: 'Time', path: 'createdAt', type: 'date', config: { format: 'relative' } },
];

const recentActivityColumns: TableColumnDefinition[] = [
  { id: 'actor', label: 'User', path: 'actor.fullName', type: 'text' },
  { id: 'action', label: 'Action', path: 'action', type: 'text' },
  { id: 'entity', label: 'Entity', path: 'entityDescription', type: 'text' },
  { id: 'timestamp', label: 'Time', path: 'timestamp', type: 'date', config: { format: 'relative' } },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const adminDashboardScreen: ScreenDefinition = {
  id: 'admin-dashboard',
  type: 'dashboard',
  // entityType: 'organization', // Admin entity

  title: 'Admin Dashboard',
  subtitle: 'System administration and monitoring',
  icon: 'Shield',

  // Permissions
  permissions: [],

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // System Health Metrics
      {
        id: 'system-metrics',
        type: 'metrics-grid',
        title: 'System Overview',
        columns: 4,
        fields: [
          {
            id: 'totalUsers',
            label: 'Total Users',
            type: 'number',
            path: 'metrics.totalUsers',
            config: { subtitle: { path: 'metrics.activeUsers', template: '{{value}} active' } },
          },
          {
            id: 'activeSessions',
            label: 'Active Sessions',
            type: 'number',
            path: 'metrics.activeSessions',
          },
          {
            id: 'storageUsed',
            label: 'Storage Used',
            type: 'text',
            path: 'metrics.storageUsed',
            config: { subtitle: { path: 'metrics.storageTotal', template: 'of {{value}}' } },
          },
          {
            id: 'apiCalls',
            label: 'API Calls (Today)',
            type: 'number',
            path: 'metrics.apiCallsToday',
          },
        ],
        dataSource: {
          type: 'aggregate',
          // entityType: 'organization', // Admin entity
        },
      },
      // Quick Actions
      {
        id: 'quick-actions',
        type: 'custom',
        component: 'QuickActionsGrid',
        componentProps: {
          actions: [
            { label: 'Add User', icon: 'UserPlus', route: '/admin/users/invite' },
            { label: 'System Settings', icon: 'Settings', route: '/admin/settings' },
            { label: 'Audit Logs', icon: 'FileText', route: '/admin/audit' },
            { label: 'Data Management', icon: 'Database', route: '/admin/data' },
          ],
        },
      },
      // Alerts Panel
      {
        id: 'alerts',
        type: 'table',
        title: 'System Alerts',
        icon: 'AlertTriangle',
        columns_config: alertsTableColumns,
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'admin.alerts.list',
            params: { limit: 10 },
          },
        },
        emptyState: {
          title: 'No alerts',
          description: 'System is running smoothly',
          icon: 'CheckCircle',
        },
        actions: [
          {
            id: 'view-all-alerts',
            type: 'navigate',
            label: 'View All',
            variant: 'ghost',
            config: { type: 'navigate', route: '/admin/logs' },
          },
        ],
      },
      // Recent Admin Activities
      {
        id: 'recent-activity',
        type: 'table',
        title: 'Recent Admin Activity',
        icon: 'Activity',
        columns_config: recentActivityColumns,
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'admin.audit.recent',
            params: { limit: 10 },
          },
        },
        actions: [
          {
            id: 'view-audit-logs',
            type: 'navigate',
            label: 'View Full Audit Log',
            variant: 'ghost',
            config: { type: 'navigate', route: '/admin/audit' },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'add-user',
      type: 'navigate',
      label: 'Add User',
      variant: 'primary',
      icon: 'UserPlus',
      config: { type: 'navigate', route: '/admin/users/invite' },
    },
    {
      id: 'system-settings',
      type: 'navigate',
      label: 'Settings',
      variant: 'secondary',
      icon: 'Settings',
      config: { type: 'navigate', route: '/admin/settings' },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [{ label: 'Admin' }],
  },

  // Keyboard shortcuts
  keyboard_shortcuts: [
    { key: 'a', description: 'Go to Admin Panel', action: 'navigateAdmin' },
    { key: 'u', description: 'Go to Users', action: 'navigateUsers' },
    { key: 'p', description: 'Go to Pods', action: 'navigatePods' },
    { key: 's', description: 'Go to Settings', action: 'navigateSettings' },
  ],
};

export default adminDashboardScreen;
