/**
 * Roles List Screen Definition
 *
 * Admin screen for viewing and managing user roles.
 * System roles are read-only, custom roles can be edited.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ROLE_TYPE_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'custom', label: 'Custom' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const rolesTableColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Role Name',
    path: 'name',
    type: 'text',
    sortable: true,
    width: '200px',
    config: {
      icon: { path: 'icon' },
    },
  },
  {
    id: 'description',
    label: 'Description',
    path: 'description',
    type: 'text',
  },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    sortable: true,
    width: '100px',
    config: {
      options: ROLE_TYPE_OPTIONS,
      badgeColors: { system: 'blue', custom: 'purple' },
    },
  },
  {
    id: 'userCount',
    label: 'Users',
    path: 'userCount',
    type: 'number',
    sortable: true,
    width: '80px',
  },
  {
    id: 'permissionsCount',
    label: 'Permissions',
    path: 'permissionsCount',
    type: 'number',
    sortable: true,
    width: '100px',
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

export const rolesListScreen: ScreenDefinition = {
  id: 'roles-list',
  type: 'list',
  // entityType: 'role', // Admin entity

  title: 'Roles',
  subtitle: 'Manage user roles and access levels',
  icon: 'Shield',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'list',
    // entityType: 'role', // Admin entity
    sort: { field: 'type', direction: 'asc' },
    pagination: false,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // System Roles Section
      {
        id: 'system-roles',
        type: 'table',
        title: 'System Roles',
        description: 'Built-in roles that cannot be modified',
        icon: 'Lock',
        columns_config: rolesTableColumns,
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'admin.roles.list',
            params: { type: 'system' },
          },
        },
        rowClick: {
          type: 'navigate',
          route: '/admin/roles/{{id}}',
        },
        emptyState: {
          title: 'No system roles',
          description: 'System roles will be initialized on first setup',
          icon: 'Shield',
        },
      },
      // Custom Roles Section
      {
        id: 'custom-roles',
        type: 'table',
        title: 'Custom Roles',
        description: 'Organization-specific roles',
        icon: 'Unlock',
        columns_config: rolesTableColumns,
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'admin.roles.list',
            params: { type: 'custom' },
          },
        },
        rowClick: {
          type: 'navigate',
          route: '/admin/roles/{{id}}',
        },
        rowActions: [
          {
            id: 'view',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/admin/roles/{{id}}' },
          },
          {
            id: 'edit',
            type: 'navigate',
            label: 'Edit',
            icon: 'Pencil',
            config: { type: 'navigate', route: '/admin/roles/{{id}}/edit' },
          },
          {
            id: 'duplicate',
            type: 'mutation',
            label: 'Duplicate',
            icon: 'Copy',
            config: { type: 'mutation', procedure: 'admin.roles.duplicate' },
          },
          {
            id: 'delete',
            type: 'mutation',
            label: 'Delete',
            icon: 'Trash2',
            variant: 'destructive',
            config: { type: 'mutation', procedure: 'admin.roles.delete' },
            confirm: {
              title: 'Delete Role',
              message: 'Users with this role will be moved to a default role. Are you sure?',
              destructive: true,
            },
            visible: { field: 'userCount', operator: 'eq', value: 0 },
          },
        ],
        emptyState: {
          title: 'No custom roles',
          description: 'Create custom roles for specialized access patterns',
          icon: 'Plus',
          action: {
            id: 'create-first',
            type: 'modal',
            label: 'Create First Role',
            icon: 'Plus',
            config: { type: 'modal', modal: 'CreateRoleModal' },
          },
        },
        actions: [
          {
            id: 'create',
            type: 'modal',
            label: 'Create Custom Role',
            icon: 'Plus',
            variant: 'secondary',
            config: { type: 'modal', modal: 'CreateRoleModal' },
          },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create',
      type: 'modal',
      label: 'Create Role',
      variant: 'primary',
      icon: 'Plus',
      config: { type: 'modal', modal: 'CreateRoleModal' },
    },
    {
      id: 'permissions-matrix',
      type: 'navigate',
      label: 'Permissions Matrix',
      variant: 'secondary',
      icon: 'Grid',
      config: { type: 'navigate', route: '/admin/permissions' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Admin', route: '/admin' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Roles' },
    ],
  },
};

export default rolesListScreen;
