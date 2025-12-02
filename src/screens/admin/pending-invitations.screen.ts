/**
 * Pending Invitations Screen Definition
 *
 * Admin screen for managing pending user invitations.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const INVITATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'expired', label: 'Expired' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'cancelled', label: 'Cancelled' },
];

const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'recruiting_manager', label: 'Recruiting Manager' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'bench_sales_manager', label: 'Bench Sales Manager' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'ta', label: 'Talent Acquisition' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const invitationsTableColumns: TableColumnDefinition[] = [
  {
    id: 'email',
    label: 'Email',
    path: 'email',
    type: 'email',
    sortable: true,
  },
  {
    id: 'role',
    label: 'Role',
    path: 'role',
    type: 'enum',
    sortable: true,
    config: { options: USER_ROLE_OPTIONS },
  },
  {
    id: 'invitedBy',
    label: 'Invited By',
    path: 'invitedBy.fullName',
    type: 'text',
  },
  {
    id: 'invitedAt',
    label: 'Invited',
    path: 'invitedAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
  {
    id: 'expiresAt',
    label: 'Expires',
    path: 'expiresAt',
    type: 'date',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: INVITATION_STATUS_OPTIONS,
      badgeColors: {
        pending: 'yellow',
        expired: 'red',
        accepted: 'green',
        cancelled: 'gray',
      },
    },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const pendingInvitationsScreen: ScreenDefinition = {
  id: 'pending-invitations',
  type: 'list',
  // entityType: 'invitation', // Admin entity

  title: 'Pending Invitations',
  subtitle: 'Manage user invitations',
  icon: 'Mail',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'list',
    // entityType: 'invitation', // Admin entity
    sort: { field: 'invitedAt', direction: 'desc' },
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
          { id: 'total', label: 'Total', type: 'number', path: 'stats.total' },
          { id: 'pending', label: 'Pending', type: 'number', path: 'stats.pending' },
          { id: 'expired', label: 'Expired', type: 'number', path: 'stats.expired' },
          { id: 'accepted', label: 'Accepted', type: 'number', path: 'stats.accepted' },
        ],
        dataSource: {
          type: 'aggregate',
          // entityType: 'invitation', // Admin entity
        },
      },
      // Status Tabs
      {
        id: 'status-tabs',
        type: 'custom',
        component: 'StatusTabs',
        componentProps: {
          tabs: [
            { id: 'pending', label: 'Pending', countPath: 'stats.pending' },
            { id: 'expired', label: 'Expired', countPath: 'stats.expired' },
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
            config: { placeholder: 'Search by email...' },
          },
          {
            id: 'role',
            label: 'Role',
            type: 'multiselect',
            path: 'filters.role',
            options: [...USER_ROLE_OPTIONS],
          },
        ],
      },
      // Table
      {
        id: 'invitations-table',
        type: 'table',
        columns_config: invitationsTableColumns,
        selectable: true,
        rowActions: [
          {
            id: 'resend',
            type: 'mutation',
            label: 'Resend',
            icon: 'Send',
            config: { type: 'mutation', procedure: 'admin.invitations.resend' },
            visible: { field: 'status', operator: 'eq', value: 'pending' },
          },
          {
            id: 'cancel',
            type: 'mutation',
            label: 'Cancel',
            icon: 'X',
            variant: 'destructive',
            config: { type: 'mutation', procedure: 'admin.invitations.cancel' },
            confirm: {
              title: 'Cancel Invitation',
              message: 'This invitation will no longer be valid.',
              destructive: true,
            },
            visible: { field: 'status', operator: 'eq', value: 'pending' },
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
      label: 'Invite New User',
      variant: 'primary',
      icon: 'UserPlus',
      config: { type: 'navigate', route: '/admin/users/invite' },
    },
    {
      id: 'resend-expired',
      type: 'mutation',
      label: 'Resend Expired',
      variant: 'secondary',
      icon: 'RefreshCw',
      config: { type: 'mutation', procedure: 'admin.invitations.resendExpired' },
    },
  ],

  // Bulk actions
  bulkActions: [
    {
      id: 'bulk-resend',
      type: 'mutation',
      label: 'Resend',
      icon: 'Send',
      config: { type: 'mutation', procedure: 'admin.invitations.bulkResend' },
    },
    {
      id: 'bulk-cancel',
      type: 'mutation',
      label: 'Cancel',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'mutation', procedure: 'admin.invitations.bulkCancel' },
      confirm: {
        title: 'Cancel Invitations',
        message: 'Selected invitations will no longer be valid.',
        destructive: true,
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Users', route: '/admin/users' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Users', route: '/admin/users' },
      { label: 'Invitations' },
    ],
  },
};

export default pendingInvitationsScreen;
