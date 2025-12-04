/**
 * Pod Detail Screen Definition (Admin)
 *
 * Admin screen for viewing and managing a single pod.
 * Shows members, performance metrics, targets, and history.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const POD_TYPE_OPTIONS = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'ta', label: 'Talent Acquisition' },
];

const POD_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const membersTableColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Name',
    path: 'fullName',
    type: 'text',
    config: {
      avatar: { path: 'avatarUrl', fallback: 'initials' },
      subtitle: { path: 'email' },
    },
  },
  { id: 'role', label: 'Role', path: 'role', type: 'text' },
  {
    id: 'positionType',
    label: 'Position',
    path: 'positionType',
    type: 'enum',
    config: {
      options: [
        { value: 'manager', label: 'Senior (Manager)' },
        { value: 'ic', label: 'Junior (IC)' },
      ],
      badgeColors: { manager: 'blue', ic: 'gray' },
    },
  },
  { id: 'placements', label: 'Placements (MTD)', path: 'placementsMTD', type: 'number' },
  { id: 'revenue', label: 'Revenue (MTD)', path: 'revenueMTD', type: 'currency' },
  { id: 'joinedAt', label: 'Joined Pod', path: 'joinedPodAt', type: 'date' },
];

const historyTableColumns: TableColumnDefinition[] = [
  { id: 'actor', label: 'Changed By', path: 'actor.fullName', type: 'text' },
  { id: 'action', label: 'Action', path: 'action', type: 'text' },
  { id: 'changes', label: 'Changes', path: 'changesDescription', type: 'text' },
  { id: 'timestamp', label: 'When', path: 'timestamp', type: 'date', config: { format: 'relative' } },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const adminPodDetailScreen: ScreenDefinition = {
  id: 'admin-pod-detail',
  type: 'detail',
  entityType: 'pod',

  title: fieldValue('name'),
  subtitle: 'Pod Management',
  icon: 'Users2',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.pods.getById',
      params: { id: fieldValue('id') },
    },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar - Pod Info
    sidebar: {
      id: 'pod-info',
      type: 'info-card',
      header: {
        type: 'icon',
        icon: 'Users2',
        size: 'lg',
      },
      fields: [
        { id: 'name', label: 'Pod Name', type: 'text', path: 'name' },
        {
          id: 'type',
          label: 'Type',
          type: 'enum',
          path: 'type',
          config: {
            options: POD_TYPE_OPTIONS,
            badgeColors: { recruiting: 'blue', bench_sales: 'purple', ta: 'cyan' },
          },
        },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: POD_STATUS_OPTIONS,
            badgeColors: { active: 'green', inactive: 'gray' },
          },
        },
        { id: 'manager', label: 'Manager', type: 'text', path: 'seniorMember.fullName' },
        { id: 'memberCount', label: 'Members', type: 'text', path: 'memberCount', config: { suffix: ' members' } },
        { id: 'createdAt', label: 'Created', type: 'date', path: 'createdAt' },
      ],
      footer: {
        type: 'metrics-row',
        metrics: [
          { label: 'Placements', value: fieldValue('placementsMTD'), icon: 'Trophy' },
          { label: 'Revenue', value: fieldValue('revenueMTD'), icon: 'DollarSign', format: 'currency' },
        ],
      },
    },

    // Main content - Tabs
    tabs: [
      // Overview Tab
      {
        id: 'overview',
        label: 'Overview',
        icon: 'LayoutDashboard',
        sections: [
          {
            id: 'performance-metrics',
            type: 'metrics-grid',
            title: 'Performance (MTD)',
            columns: 4,
            fields: [
              { id: 'placements', label: 'Placements', type: 'number', path: 'placementsMTD', config: { target: { path: 'placementsTarget' } } },
              { id: 'revenue', label: 'Revenue', type: 'currency', path: 'revenueMTD', config: { target: { path: 'revenueTarget' } } },
              { id: 'submissions', label: 'Submissions', type: 'number', path: 'submissionsMTD', config: { target: { path: 'submissionsTarget' } } },
              { id: 'interviews', label: 'Interviews', type: 'number', path: 'interviewsMTD' },
            ],
          },
          {
            id: 'performance-chart',
            type: 'custom',
            title: 'Performance Trend',
            component: 'PerformanceChart',
            componentProps: {
              podId: fieldValue('id'),
              metrics: ['placements', 'revenue', 'submissions'],
              period: '6months',
            },
          },
        ],
      },
      // Members Tab
      {
        id: 'members',
        label: 'Members',
        icon: 'Users',
        badge: { type: 'count', path: 'memberCount' },
        sections: [
          {
            id: 'manager-section',
            type: 'info-card',
            title: 'Senior Member (Manager)',
            icon: 'Crown',
            fields: [
              { id: 'managerName', label: 'Name', type: 'text', path: 'seniorMember.fullName' },
              { id: 'managerEmail', label: 'Email', type: 'email', path: 'seniorMember.email' },
              { id: 'managerSince', label: 'Manager Since', type: 'date', path: 'seniorMember.managerSince' },
            ],
            actions: [
              {
                id: 'change-manager',
                type: 'modal',
                label: 'Change Manager',
                icon: 'RefreshCw',
                config: { type: 'modal', modal: 'ChangePodManagerModal' },
                confirm: {
                  title: 'Change Pod Manager',
                  message: 'This will reassign the manager role. Continue?',
                },
              },
              {
                id: 'view-profile',
                type: 'navigate',
                label: 'View Profile',
                icon: 'User',
                config: { type: 'navigate', route: '/admin/users/{{seniorMember.id}}' },
              },
            ],
          },
          {
            id: 'members-table',
            type: 'table',
            title: 'Junior Members',
            columns_config: membersTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.pods.getMembers',
                params: { podId: fieldValue('id'), excludeManager: true },
              },
            },
            rowActions: [
              {
                id: 'view',
                type: 'navigate',
                label: 'View Profile',
                icon: 'User',
                config: { type: 'navigate', route: '/admin/users/{{id}}' },
              },
              {
                id: 'remove',
                type: 'mutation',
                label: 'Remove from Pod',
                icon: 'UserMinus',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'admin.pods.removeMember' },
                confirm: {
                  title: 'Remove Member',
                  message: 'This member will be removed from the pod.',
                  destructive: true,
                },
              },
            ],
            emptyState: {
              title: 'No junior members',
              description: 'Add members to this pod to start',
              icon: 'Users',
            },
            actions: [
              {
                id: 'add-member',
                type: 'modal',
                label: 'Add Member',
                icon: 'UserPlus',
                variant: 'secondary',
                config: { type: 'modal', modal: 'AddPodMemberModal' },
              },
            ],
          },
        ],
      },
      // Targets Tab
      {
        id: 'targets',
        label: 'Targets',
        icon: 'Target',
        sections: [
          {
            id: 'sprint-targets',
            type: 'form',
            title: 'Sprint Targets',
            description: 'Monthly performance targets for this pod',
            columns: 2,
            editable: true,
            fields: [
              {
                id: 'placementsTarget',
                label: 'Placements Target',
                type: 'number',
                path: 'placementsTarget',
                config: { min: 0, step: 1 },
              },
              {
                id: 'revenueTarget',
                label: 'Revenue Target',
                type: 'currency',
                path: 'revenueTarget',
                config: { min: 0 },
              },
              {
                id: 'submissionsTarget',
                label: 'Submissions Target',
                type: 'number',
                path: 'submissionsTarget',
                config: { min: 0, step: 1 },
              },
              {
                id: 'interviewsTarget',
                label: 'Interviews Target',
                type: 'number',
                path: 'interviewsTarget',
                config: { min: 0, step: 1 },
              },
            ],
            actions: [
              {
                id: 'save-targets',
                type: 'mutation',
                label: 'Save Targets',
                variant: 'primary',
                icon: 'Save',
                config: { type: 'mutation', procedure: 'admin.pods.updateTargets' },
              },
            ],
          },
          {
            id: 'target-history',
            type: 'table',
            title: 'Target History',
            columns_config: [
              { id: 'period', label: 'Period', path: 'period', type: 'text' },
              { id: 'placements', label: 'Placements', path: 'placementsTarget', type: 'number' },
              { id: 'revenue', label: 'Revenue', path: 'revenueTarget', type: 'currency' },
              { id: 'achieved', label: 'Achievement', path: 'achievementRate', type: 'progress' },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.pods.getTargetHistory',
                params: { podId: fieldValue('id') },
              },
            },
            collapsible: true,
            collapsed: true,
          },
        ],
      },
      // Performance Tab
      {
        id: 'performance',
        label: 'Performance',
        icon: 'TrendingUp',
        sections: [
          {
            id: 'performance-comparison',
            type: 'custom',
            title: 'Performance Comparison',
            component: 'PodPerformanceComparison',
            componentProps: {
              podId: fieldValue('id'),
              compareWithOrg: true,
            },
          },
          {
            id: 'member-leaderboard',
            type: 'table',
            title: 'Member Leaderboard',
            columns_config: [
              { id: 'rank', label: '#', path: 'rank', type: 'number', width: '60px' },
              { id: 'name', label: 'Member', path: 'fullName', type: 'text', config: { avatar: { path: 'avatarUrl' } } },
              { id: 'placements', label: 'Placements', path: 'placementsMTD', type: 'number', sortable: true },
              { id: 'revenue', label: 'Revenue', path: 'revenueMTD', type: 'currency', sortable: true },
              { id: 'trend', label: 'Trend', path: 'trend', type: 'enum', config: { options: [{ value: 'up', label: '↑' }, { value: 'down', label: '↓' }, { value: 'flat', label: '→' }] } },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.pods.getMemberLeaderboard',
                params: { podId: fieldValue('id') },
              },
            },
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
            columns_config: historyTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'admin.audit.getByEntity',
                params: { entityType: 'pod', entityId: fieldValue('id') },
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
      label: 'Edit Pod',
      variant: 'primary',
      icon: 'Pencil',
      config: { type: 'modal', modal: 'EditPodModal' },
    },
    {
      id: 'add-member',
      type: 'modal',
      label: 'Add Member',
      variant: 'secondary',
      icon: 'UserPlus',
      config: { type: 'modal', modal: 'AddPodMemberModal' },
    },
    {
      id: 'dissolve',
      type: 'modal',
      label: 'Dissolve Pod',
      variant: 'destructive',
      icon: 'Trash2',
      config: { type: 'modal', modal: 'DissolvePodModal' },
      confirm: {
        title: 'Dissolve Pod',
        message: 'All members will be unassigned. This action cannot be undone.',
        destructive: true,
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Pods', route: '/admin/pods' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Pods', route: '/admin/pods' },
      { label: fieldValue('name') },
    ],
  },
};

export default adminPodDetailScreen;
