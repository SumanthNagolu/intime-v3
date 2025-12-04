/**
 * User Detail Screen Definition
 *
 * Admin screen for viewing and managing a single user.
 * Includes profile, roles, permissions, activity, and sessions.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

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

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const activityLogColumns: TableColumnDefinition[] = [
  { id: 'action', label: 'Action', path: 'action', type: 'text' },
  { id: 'entity', label: 'Entity', path: 'entityDescription', type: 'text' },
  { id: 'ipAddress', label: 'IP Address', path: 'ipAddress', type: 'text' },
  { id: 'timestamp', label: 'Time', path: 'timestamp', type: 'date', config: { format: 'relative' } },
];

const sessionsColumns: TableColumnDefinition[] = [
  { id: 'device', label: 'Device', path: 'deviceInfo', type: 'text' },
  { id: 'browser', label: 'Browser', path: 'browserInfo', type: 'text' },
  { id: 'ipAddress', label: 'IP Address', path: 'ipAddress', type: 'text' },
  { id: 'location', label: 'Location', path: 'location', type: 'text' },
  { id: 'lastActive', label: 'Last Active', path: 'lastActiveAt', type: 'date', config: { format: 'relative' } },
  {
    id: 'status',
    label: 'Status',
    path: 'isActive',
    type: 'boolean',
    config: { trueLabel: 'Active', falseLabel: 'Expired' },
  },
];

const auditLogColumns: TableColumnDefinition[] = [
  { id: 'action', label: 'Action', path: 'action', type: 'text' },
  { id: 'changes', label: 'Changes', path: 'changesDescription', type: 'text' },
  { id: 'timestamp', label: 'Time', path: 'timestamp', type: 'date', config: { format: 'relative' } },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const userDetailScreen: ScreenDefinition = {
  id: 'user-detail',
  type: 'detail',
  // entityType: 'user', // Admin entity

  title: fieldValue('fullName'),
  subtitle: fieldValue('email'),
  icon: 'User',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.users.getById',
      params: { id: fieldValue('id') },
    },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar - User Info Card
    sidebar: {
      id: 'user-info',
      type: 'info-card',
      header: {
        type: 'avatar',
        path: 'avatarUrl',
        fallbackPath: 'fullName',
        size: 'lg',
      },
      fields: [
        { id: 'fullName', label: 'Name', type: 'text', path: 'fullName' },
        { id: 'email', label: 'Email', type: 'email', path: 'email' },
        { id: 'phone', label: 'Phone', type: 'phone', path: 'workPhone' },
        { id: 'employeeId', label: 'Employee ID', type: 'text', path: 'employeeId' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: USER_STATUS_OPTIONS,
            badgeColors: { active: 'green', pending: 'yellow', inactive: 'gray', suspended: 'red' },
          },
        },
        {
          id: 'role',
          label: 'Role',
          type: 'enum',
          path: 'role',
          config: { options: USER_ROLE_OPTIONS },
        },
        { id: 'pod', label: 'Pod', type: 'text', path: 'pod.name' },
        { id: 'manager', label: 'Manager', type: 'text', path: 'manager.fullName' },
        { id: 'startDate', label: 'Start Date', type: 'date', path: 'startDate' },
        { id: 'lastLogin', label: 'Last Login', type: 'date', path: 'lastLoginAt', config: { format: 'relative' } },
        { id: 'createdAt', label: 'Created', type: 'date', path: 'createdAt' },
      ],
      footer: {
        type: 'actions',
        actions: [
          {
            id: 'edit',
            type: 'modal',
            label: 'Edit',
            icon: 'Pencil',
            variant: 'secondary',
            config: { type: 'modal', modal: 'EditUserModal' },
          },
          {
            id: 'impersonate',
            type: 'custom',
            label: 'Impersonate',
            icon: 'UserCheck',
            variant: 'outline',
            config: { type: 'custom', handler: 'handleImpersonate' },
            confirm: {
              title: 'Impersonate User',
              message: 'You will be logged in as this user. This action is audited.',
              confirmLabel: 'Impersonate',
            },
          },
        ],
      },
    },

    // Main content - Tabs
    tabs: [
      // Profile Tab
      {
        id: 'profile',
        label: 'Profile',
        icon: 'User',
        sections: [
          {
            id: 'personal-info',
            type: 'field-grid',
            title: 'Personal Information',
            columns: 2,
            editable: true,
            fields: [
              { id: 'firstName', label: 'First Name', type: 'text', path: 'firstName' },
              { id: 'lastName', label: 'Last Name', type: 'text', path: 'lastName' },
              { id: 'email', label: 'Email', type: 'email', path: 'email' },
              { id: 'workPhone', label: 'Work Phone', type: 'phone', path: 'workPhone' },
              { id: 'department', label: 'Department', type: 'text', path: 'department' },
              { id: 'jobTitle', label: 'Job Title', type: 'text', path: 'jobTitle' },
            ],
          },
          {
            id: 'security-info',
            type: 'info-card',
            title: 'Security Settings',
            icon: 'Shield',
            fields: [
              { id: '2faEnabled', label: '2FA Enabled', type: 'boolean', path: 'twoFactorEnabled' },
              { id: '2faMethod', label: '2FA Method', type: 'text', path: 'twoFactorMethod' },
              { id: 'passwordLastChanged', label: 'Password Last Changed', type: 'date', path: 'passwordLastChangedAt' },
              { id: 'mustChangePassword', label: 'Must Change Password', type: 'boolean', path: 'mustChangePassword' },
            ],
          },
        ],
      },
      // Roles & Permissions Tab
      {
        id: 'permissions',
        label: 'Roles & Permissions',
        icon: 'Key',
        sections: [
          {
            id: 'assigned-roles',
            type: 'info-card',
            title: 'Assigned Roles',
            fields: [
              {
                id: 'primaryRole',
                label: 'Primary Role',
                type: 'enum',
                path: 'role',
                config: { options: USER_ROLE_OPTIONS },
              },
              { id: 'pod', label: 'Pod Assignment', type: 'text', path: 'pod.name' },
              { id: 'positionType', label: 'Position Type', type: 'text', path: 'positionType' },
            ],
            actions: [
              {
                id: 'change-role',
                type: 'modal',
                label: 'Change Role',
                icon: 'RefreshCw',
                config: { type: 'modal', modal: 'ChangeRoleModal' },
              },
            ],
          },
          {
            id: 'permissions-matrix',
            type: 'custom',
            title: 'Effective Permissions',
            component: 'PermissionsMatrix',
            componentProps: {
              userId: fieldValue('id'),
              readOnly: true,
            },
          },
          {
            id: 'permission-overrides',
            type: 'table',
            title: 'Permission Overrides',
            columns_config: [
              { id: 'entity', label: 'Entity', path: 'entityType', type: 'text' },
              { id: 'permission', label: 'Permission', path: 'permission', type: 'text' },
              { id: 'granted', label: 'Granted', path: 'granted', type: 'boolean' },
              { id: 'reason', label: 'Reason', path: 'reason', type: 'text' },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.users.getPermissionOverrides',
                params: { userId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-override',
                type: 'modal',
                label: 'Add Override',
                icon: 'Plus',
                config: { type: 'modal', modal: 'AddPermissionOverrideModal' },
              },
            ],
          },
        ],
      },
      // Activity Tab
      {
        id: 'activity',
        label: 'Activity',
        icon: 'Activity',
        badge: { type: 'count', path: 'activityCount' },
        sections: [
          {
            id: 'login-history',
            type: 'table',
            title: 'Login History',
            columns_config: [
              { id: 'timestamp', label: 'Time', path: 'timestamp', type: 'date', config: { format: 'long' } },
              { id: 'ipAddress', label: 'IP Address', path: 'ipAddress', type: 'text' },
              { id: 'location', label: 'Location', path: 'location', type: 'text' },
              { id: 'device', label: 'Device', path: 'deviceInfo', type: 'text' },
              {
                id: 'success',
                label: 'Status',
                path: 'success',
                type: 'boolean',
                config: { trueLabel: 'Success', falseLabel: 'Failed' },
              },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.users.getLoginHistory',
                params: { userId: fieldValue('id'), limit: 20 },
              },
            },
          },
          {
            id: 'action-log',
            type: 'table',
            title: 'Action Log',
            columns_config: activityLogColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.users.getActionLog',
                params: { userId: fieldValue('id'), limit: 50 },
              },
            },
          },
        ],
      },
      // Sessions Tab
      {
        id: 'sessions',
        label: 'Sessions',
        icon: 'Monitor',
        badge: { type: 'count', path: 'activeSessionsCount' },
        sections: [
          {
            id: 'active-sessions',
            type: 'table',
            title: 'Active Sessions',
            columns_config: sessionsColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.users.getSessions',
                params: { userId: fieldValue('id') },
              },
            },
            rowActions: [
              {
                id: 'revoke',
                type: 'mutation',
                label: 'Revoke',
                icon: 'X',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'admin.users.revokeSession' },
                confirm: {
                  title: 'Revoke Session',
                  message: 'This will immediately log out this session.',
                  destructive: true,
                },
              },
            ],
            actions: [
              {
                id: 'revoke-all',
                type: 'mutation',
                label: 'Revoke All Sessions',
                icon: 'LogOut',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'admin.users.revokeAllSessions' },
                confirm: {
                  title: 'Revoke All Sessions',
                  message: 'This will log out the user from all devices.',
                  destructive: true,
                },
              },
            ],
          },
        ],
      },
      // Audit Tab
      {
        id: 'audit',
        label: 'Audit',
        icon: 'FileText',
        sections: [
          {
            id: 'changes-by-user',
            type: 'table',
            title: 'Changes Made by This User',
            columns_config: auditLogColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.audit.getByActor',
                params: { actorId: fieldValue('id'), limit: 50 },
              },
            },
          },
          {
            id: 'changes-to-user',
            type: 'table',
            title: 'Changes Made to This User',
            columns_config: [
              { id: 'actor', label: 'By', path: 'actor.fullName', type: 'text' },
              ...auditLogColumns,
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.audit.getByEntity',
                params: { entityId: fieldValue('id'), limit: 50 },
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
      id: 'edit',
      type: 'modal',
      label: 'Edit User',
      variant: 'primary',
      icon: 'Pencil',
      config: { type: 'modal', modal: 'EditUserModal' },
    },
    {
      id: 'reset-password',
      type: 'modal',
      label: 'Reset Password',
      variant: 'secondary',
      icon: 'Key',
      config: { type: 'modal', modal: 'ResetPasswordModal' },
    },
    {
      id: 'deactivate',
      type: 'modal',
      label: 'Deactivate',
      variant: 'destructive',
      icon: 'UserX',
      config: { type: 'modal', modal: 'DeactivateUserModal' },
      visible: { field: 'status', operator: 'eq', value: 'active' },
    },
    {
      id: 'reactivate',
      type: 'mutation',
      label: 'Reactivate',
      variant: 'secondary',
      icon: 'UserCheck',
      config: { type: 'mutation', procedure: 'admin.users.reactivate' },
      visible: { field: 'status', operator: 'eq', value: 'inactive' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Users', route: '/admin/users' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Users', route: '/admin/users' },
      { label: fieldValue('fullName') },
    ],
  },
};

export default userDetailScreen;
