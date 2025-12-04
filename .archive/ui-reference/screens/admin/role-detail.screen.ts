/**
 * Role Detail Screen Definition
 *
 * Admin screen for viewing and editing a role's permissions.
 * System roles are read-only, custom roles can be fully edited.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const PERMISSION_SCOPE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'own', label: 'Own' },
  { value: 'pod', label: 'Pod' },
  { value: 'org', label: 'Organization' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'job', label: 'Jobs' },
  { value: 'candidate', label: 'Candidates' },
  { value: 'submission', label: 'Submissions' },
  { value: 'interview', label: 'Interviews' },
  { value: 'placement', label: 'Placements' },
  { value: 'account', label: 'Accounts' },
  { value: 'contact', label: 'Contacts' },
  { value: 'lead', label: 'Leads' },
  { value: 'deal', label: 'Deals' },
  { value: 'activity', label: 'Activities' },
  { value: 'consultant', label: 'Consultants' },
  { value: 'hotlist', label: 'Hotlists' },
  { value: 'user', label: 'Users' },
  { value: 'pod', label: 'Pods' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const usersTableColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Name',
    path: 'fullName',
    type: 'text',
    config: {
      avatar: { path: 'avatarUrl', fallback: 'initials' },
    },
  },
  { id: 'email', label: 'Email', path: 'email', type: 'email' },
  { id: 'department', label: 'Department', path: 'department', type: 'text' },
  { id: 'pod', label: 'Pod', path: 'pod.name', type: 'text' },
  { id: 'lastLogin', label: 'Last Login', path: 'lastLoginAt', type: 'date', config: { format: 'relative' } },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const roleDetailScreen: ScreenDefinition = {
  id: 'role-detail',
  type: 'detail',
  // entityType: 'role', // Admin entity

  title: fieldValue('name'),
  subtitle: fieldValue('description'),
  icon: 'Shield',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.roles.getById',
      params: { id: fieldValue('id') },
    },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar - Role Info
    sidebar: {
      id: 'role-info',
      type: 'info-card',
      header: {
        type: 'icon',
        icon: 'Shield',
        size: 'lg',
      },
      fields: [
        { id: 'name', label: 'Role Name', type: 'text', path: 'name' },
        { id: 'description', label: 'Description', type: 'text', path: 'description' },
        {
          id: 'type',
          label: 'Type',
          type: 'enum',
          path: 'type',
          config: {
            options: [
              { value: 'system', label: 'System' },
              { value: 'custom', label: 'Custom' },
            ],
            badgeColors: { system: 'blue', custom: 'purple' },
          },
        },
        { id: 'userCount', label: 'Users with this role', type: 'number', path: 'userCount' },
        { id: 'permissionsCount', label: 'Permissions', type: 'number', path: 'permissionsCount' },
        { id: 'createdAt', label: 'Created', type: 'date', path: 'createdAt' },
        { id: 'updatedAt', label: 'Last Updated', type: 'date', path: 'updatedAt' },
      ],
      footer: {
        type: 'actions',
        actions: [
          {
            id: 'edit',
            type: 'navigate',
            label: 'Edit Role',
            icon: 'Pencil',
            variant: 'secondary',
            config: { type: 'navigate', route: '/admin/roles/{{id}}/edit' },
            visible: { field: 'type', operator: 'eq', value: 'custom' },
          },
          {
            id: 'duplicate',
            type: 'mutation',
            label: 'Duplicate',
            icon: 'Copy',
            variant: 'outline',
            config: { type: 'mutation', procedure: 'admin.roles.duplicate' },
          },
        ],
      },
    },

    // Main content - Tabs
    tabs: [
      // Permissions Tab
      {
        id: 'permissions',
        label: 'Permissions',
        icon: 'Key',
        sections: [
          {
            id: 'permissions-matrix',
            type: 'custom',
            title: 'Permissions Matrix',
            description: 'Entity-level access control',
            component: 'PermissionsMatrix',
            componentProps: {
              roleId: fieldValue('id'),
              readOnly: { field: 'type', operator: 'eq', value: 'system' },
              entities: ENTITY_TYPE_OPTIONS,
              scopes: PERMISSION_SCOPE_OPTIONS,
              operations: ['create', 'read', 'update', 'delete'],
            },
          },
          {
            id: 'feature-permissions',
            type: 'form',
            title: 'Feature Access',
            description: 'Additional feature-level permissions',
            columns: 2,
            fields: [
              {
                id: 'viewDashboard',
                label: 'View Dashboard',
                type: 'checkbox',
                path: 'features.viewDashboard',
              },
              {
                id: 'exportData',
                label: 'Export Data',
                type: 'checkbox',
                path: 'features.exportData',
              },
              {
                id: 'importData',
                label: 'Import Data',
                type: 'checkbox',
                path: 'features.importData',
              },
              {
                id: 'manageActivities',
                label: 'Manage Activities',
                type: 'checkbox',
                path: 'features.manageActivities',
              },
              {
                id: 'viewReports',
                label: 'View Reports',
                type: 'checkbox',
                path: 'features.viewReports',
              },
              {
                id: 'viewMetrics',
                label: 'View Metrics',
                type: 'checkbox',
                path: 'features.viewMetrics',
              },
              {
                id: 'manageIntegrations',
                label: 'Manage Integrations',
                type: 'checkbox',
                path: 'features.manageIntegrations',
              },
              {
                id: 'adminAccess',
                label: 'Admin Panel Access',
                type: 'checkbox',
                path: 'features.adminAccess',
              },
            ],
          },
        ],
      },
      // Users Tab
      {
        id: 'users',
        label: 'Users',
        icon: 'Users',
        badge: { type: 'count', path: 'userCount' },
        sections: [
          {
            id: 'users-with-role',
            type: 'table',
            title: 'Users with this Role',
            columns_config: usersTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.roles.getUsers',
                params: { roleId: fieldValue('id') },
              },
            },
            rowClick: {
              type: 'navigate',
              route: '/admin/users/{{id}}',
            },
            emptyState: {
              title: 'No users',
              description: 'No users currently have this role assigned',
              icon: 'Users',
            },
            actions: [
              {
                id: 'assign-user',
                type: 'modal',
                label: 'Assign User',
                icon: 'UserPlus',
                variant: 'secondary',
                config: { type: 'modal', modal: 'AssignRoleToUserModal' },
              },
            ],
          },
        ],
      },
      // Inheritance Tab
      {
        id: 'inheritance',
        label: 'Inheritance',
        icon: 'GitBranch',
        sections: [
          {
            id: 'inheritance-chain',
            type: 'custom',
            title: 'Permission Inheritance',
            description: 'How permissions are inherited from parent roles',
            component: 'PermissionInheritanceGraph',
            componentProps: {
              roleId: fieldValue('id'),
            },
          },
          {
            id: 'parent-roles',
            type: 'info-card',
            title: 'Parent Roles',
            fields: [
              { id: 'parentRoles', label: 'Inherits from', type: 'text', path: 'parentRolesNames' },
            ],
          },
        ],
      },
      // History Tab
      {
        id: 'history',
        label: 'History',
        icon: 'History',
        sections: [
          {
            id: 'audit-log',
            type: 'table',
            title: 'Change History',
            columns_config: [
              { id: 'actor', label: 'Changed By', path: 'actor.fullName', type: 'text' },
              { id: 'action', label: 'Action', path: 'action', type: 'text' },
              { id: 'changes', label: 'Changes', path: 'changesDescription', type: 'text' },
              { id: 'timestamp', label: 'When', path: 'timestamp', type: 'date', config: { format: 'relative' } },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.audit.getByEntity',
                params: { entityId: fieldValue('id') },
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
      type: 'navigate',
      label: 'Edit Permissions',
      variant: 'primary',
      icon: 'Pencil',
      config: { type: 'navigate', route: '/admin/roles/{{id}}/edit' },
      visible: { field: 'type', operator: 'eq', value: 'custom' },
    },
    {
      id: 'duplicate',
      type: 'mutation',
      label: 'Duplicate Role',
      variant: 'secondary',
      icon: 'Copy',
      config: { type: 'mutation', procedure: 'admin.roles.duplicate' },
    },
    {
      id: 'delete',
      type: 'mutation',
      label: 'Delete',
      variant: 'destructive',
      icon: 'Trash2',
      config: { type: 'mutation', procedure: 'admin.roles.delete' },
      confirm: {
        title: 'Delete Role',
        message: 'Users with this role will need to be reassigned. Are you sure?',
        destructive: true,
      },
      visible: {
        conditions: [
          { field: 'type', operator: 'eq', value: 'custom' },
          { field: 'userCount', operator: 'eq', value: 0 },
        ],
        operator: 'and',
      } as any,
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Roles', route: '/admin/roles' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Roles', route: '/admin/roles' },
      { label: fieldValue('name') },
    ],
  },
};

export default roleDetailScreen;
