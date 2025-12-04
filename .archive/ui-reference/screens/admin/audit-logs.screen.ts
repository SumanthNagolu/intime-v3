/**
 * Audit Logs Screen Definition
 *
 * View all system audit logs with filtering and search.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ACTION_TYPE_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'export', label: 'Export' },
  { value: 'import', label: 'Import' },
  { value: 'permission_change', label: 'Permission Change' },
  { value: 'status_change', label: 'Status Change' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'user', label: 'Users' },
  { value: 'job', label: 'Jobs' },
  { value: 'candidate', label: 'Candidates' },
  { value: 'submission', label: 'Submissions' },
  { value: 'account', label: 'Accounts' },
  { value: 'pod', label: 'Pods' },
  { value: 'role', label: 'Roles' },
  { value: 'settings', label: 'Settings' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const auditLogsColumns: TableColumnDefinition[] = [
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
    id: 'actor',
    label: 'User',
    path: 'actor.fullName',
    type: 'text',
    sortable: true,
    config: {
      avatar: { path: 'actor.avatarUrl', fallback: 'initials' },
      subtitle: { path: 'actor.email' },
    },
  },
  {
    id: 'action',
    label: 'Action',
    path: 'action',
    type: 'enum',
    sortable: true,
    config: {
      options: ACTION_TYPE_OPTIONS,
      badgeColors: {
        create: 'green',
        update: 'blue',
        delete: 'red',
        login: 'gray',
        logout: 'gray',
        export: 'purple',
        import: 'purple',
        permission_change: 'orange',
        status_change: 'cyan',
      },
    },
  },
  {
    id: 'entityType',
    label: 'Entity Type',
    path: 'entityType',
    type: 'enum',
    sortable: true,
    config: { options: ENTITY_TYPE_OPTIONS },
  },
  {
    id: 'entityName',
    label: 'Entity',
    path: 'entityDescription',
    type: 'text',
  },
  {
    id: 'changes',
    label: 'Changes',
    path: 'changesPreview',
    type: 'text',
    config: { truncate: 50 },
  },
  {
    id: 'ipAddress',
    label: 'IP Address',
    path: 'ipAddress',
    type: 'text',
    width: '120px',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const auditLogsScreen: ScreenDefinition = {
  id: 'audit-logs',
  type: 'list',
  // entityType: 'auditLog', // Admin entity

  title: 'Audit Logs',
  subtitle: 'View all system activity and changes',
  icon: 'FileText',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'list',
    // entityType: 'auditLog', // Admin entity
    sort: { field: 'timestamp', direction: 'desc' },
    pagination: true,
    limit: 50,
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
          { id: 'totalToday', label: 'Events Today', type: 'number', path: 'stats.today' },
          { id: 'logins', label: 'Logins', type: 'number', path: 'stats.logins' },
          { id: 'changes', label: 'Data Changes', type: 'number', path: 'stats.changes' },
          { id: 'securityEvents', label: 'Security Events', type: 'number', path: 'stats.security' },
        ],
        dataSource: {
          type: 'aggregate',
          // entityType: 'auditLog', // Admin entity
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
            config: { placeholder: 'Search by entity ID or description...' },
          },
          {
            id: 'dateRange',
            label: 'Date Range',
            type: 'date-range',
            path: 'filters.dateRange',
          },
          {
            id: 'actor',
            label: 'User',
            type: 'select',
            path: 'filters.actorId',
            config: {
              placeholder: 'All users',
              dataSource: { procedure: 'admin.users.listAll' },
            },
          },
          {
            id: 'action',
            label: 'Action',
            type: 'multiselect',
            path: 'filters.actions',
            options: [...ACTION_TYPE_OPTIONS],
          },
          {
            id: 'entityType',
            label: 'Entity Type',
            type: 'multiselect',
            path: 'filters.entityTypes',
            options: [...ENTITY_TYPE_OPTIONS],
          },
        ],
      },
      // Audit Logs Table
      {
        id: 'audit-logs-table',
        type: 'table',
        columns_config: auditLogsColumns,
        rowClick: {
          type: 'modal',
          modal: 'AuditLogDetailModal',
        },
        rowActions: [
          {
            id: 'view',
            type: 'modal',
            label: 'View Details',
            icon: 'Eye',
            config: { type: 'modal', modal: 'AuditLogDetailModal' },
          },
          {
            id: 'view-entity',
            type: 'navigate',
            label: 'View Entity',
            icon: 'ExternalLink',
            config: { type: 'navigate', route: '{{entityUrl}}' },
            visible: { field: 'entityUrl', operator: 'neq', value: null },
          },
        ],
        pagination: { enabled: true, pageSize: 50, showPageSizeSelector: true },
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
      config: { type: 'custom', handler: 'handleExportAuditLogs' },
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
      { label: 'Audit Logs' },
    ],
  },
};

export default auditLogsScreen;
