/**
 * Users List Screen Definition
 *
 * Admin screen for managing all users in the organization.
 * Supports filtering, search, and bulk actions.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'recruiting_manager', label: 'Recruiting Manager' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'bench_sales_manager', label: 'Bench Sales Manager' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'ta', label: 'Talent Acquisition' },
  { value: 'cfo', label: 'CFO' },
  { value: 'coo', label: 'COO' },
  { value: 'ceo', label: 'CEO' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'executive', label: 'Executive' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const userTableColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Name',
    path: 'fullName',
    type: 'text',
    sortable: true,
    width: '220px',
    config: {
      avatar: { path: 'avatarUrl', fallback: 'initials' },
      subtitle: { path: 'email' },
    },
  },
  {
    id: 'role',
    label: 'Role',
    path: 'role',
    type: 'enum',
    sortable: true,
    config: {
      options: USER_ROLE_OPTIONS,
      badgeColors: {
        admin: 'red',
        recruiting_manager: 'blue',
        recruiter: 'cyan',
        bench_sales_manager: 'purple',
        bench_sales: 'violet',
        hr_manager: 'green',
        ta: 'teal',
        cfo: 'orange',
        coo: 'orange',
        ceo: 'orange',
      },
    },
  },
  {
    id: 'department',
    label: 'Department',
    path: 'department',
    type: 'enum',
    sortable: true,
    config: { options: DEPARTMENT_OPTIONS },
  },
  {
    id: 'pod',
    label: 'Pod',
    path: 'pod.name',
    type: 'text',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: USER_STATUS_OPTIONS,
      badgeColors: {
        active: 'green',
        pending: 'yellow',
        inactive: 'gray',
        suspended: 'red',
      },
    },
  },
  {
    id: 'lastLoginAt',
    label: 'Last Active',
    path: 'lastLoginAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
  {
    id: 'createdAt',
    label: 'Created',
    path: 'createdAt',
    type: 'date',
    sortable: true,
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const usersListScreen: ScreenDefinition = {
  id: 'users-list',
  type: 'list',
  // entityType: 'user', // Admin entity

  title: 'Users',
  subtitle: 'Manage user accounts and access',
  icon: 'Users',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'list',
    // entityType: 'user', // Admin entity
    sort: { field: 'fullName', direction: 'asc' },
    pagination: true,
    limit: 25,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Metrics row
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'total', label: 'Total Users', type: 'number', path: 'stats.total' },
          { id: 'active', label: 'Active', type: 'number', path: 'stats.active' },
          { id: 'pending', label: 'Pending', type: 'number', path: 'stats.pending' },
          { id: 'inactive', label: 'Inactive', type: 'number', path: 'stats.inactive' },
        ],
        dataSource: {
          type: 'aggregate',
          // entityType: 'user', // Admin entity
        },
      },
      // Status Tabs Filter
      {
        id: 'status-tabs',
        type: 'custom',
        component: 'StatusTabs',
        componentProps: {
          tabs: [
            { id: 'active', label: 'Active', countPath: 'stats.active' },
            { id: 'inactive', label: 'Inactive', countPath: 'stats.inactive' },
            { id: 'pending', label: 'Pending', countPath: 'stats.pending' },
            { id: 'all', label: 'All', countPath: 'stats.total' },
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
            config: { placeholder: 'Search by name or email...' },
          },
          {
            id: 'role',
            label: 'Role',
            type: 'multiselect',
            path: 'filters.role',
            options: [...USER_ROLE_OPTIONS],
          },
          {
            id: 'department',
            label: 'Department',
            type: 'multiselect',
            path: 'filters.department',
            options: [...DEPARTMENT_OPTIONS],
          },
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            path: 'filters.status',
            options: [...USER_STATUS_OPTIONS],
          },
        ],
      },
      // Table
      {
        id: 'users-table',
        type: 'table',
        columns_config: userTableColumns,
        selectable: true,
        rowClick: {
          type: 'navigate',
          route: '/admin/users/{{id}}',
        },
        rowActions: [
          {
            id: 'view',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/admin/users/{{id}}' },
          },
          {
            id: 'edit',
            type: 'modal',
            label: 'Edit',
            icon: 'Pencil',
            config: { type: 'modal', modal: 'EditUserModal' },
          },
          {
            id: 'reset-password',
            type: 'modal',
            label: 'Reset Password',
            icon: 'Key',
            config: { type: 'modal', modal: 'ResetPasswordModal' },
          },
          {
            id: 'deactivate',
            type: 'mutation',
            label: 'Deactivate',
            icon: 'UserX',
            variant: 'destructive',
            config: { type: 'mutation', procedure: 'admin.users.deactivate' },
            confirm: {
              title: 'Deactivate User',
              message: 'This will revoke access for this user. Are you sure?',
              destructive: true,
            },
            visible: { field: 'status', operator: 'eq', value: 'active' },
          },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'invite',
      type: 'navigate',
      label: 'Invite User',
      variant: 'primary',
      icon: 'UserPlus',
      config: { type: 'navigate', route: '/admin/users/invite' },
    },
    {
      id: 'import',
      type: 'modal',
      label: 'Import',
      variant: 'secondary',
      icon: 'Upload',
      config: { type: 'modal', modal: 'ImportUsersModal' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportUsers' },
    },
  ],

  // Bulk actions
  bulkActions: [
    {
      id: 'bulk-activate',
      type: 'mutation',
      label: 'Activate',
      icon: 'UserCheck',
      config: { type: 'mutation', procedure: 'admin.users.bulkActivate' },
    },
    {
      id: 'bulk-deactivate',
      type: 'mutation',
      label: 'Deactivate',
      icon: 'UserX',
      variant: 'destructive',
      config: { type: 'mutation', procedure: 'admin.users.bulkDeactivate' },
      confirm: {
        title: 'Deactivate Users',
        message: 'This will revoke access for selected users. Are you sure?',
        destructive: true,
      },
    },
    {
      id: 'bulk-reset-password',
      type: 'mutation',
      label: 'Reset Passwords',
      icon: 'Key',
      config: { type: 'mutation', procedure: 'admin.users.bulkResetPassword' },
    },
    {
      id: 'bulk-export',
      type: 'custom',
      label: 'Export Selected',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportSelected' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Admin', route: '/admin' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Users' },
    ],
  },
};

export default usersListScreen;
