/**
 * Account List Screen
 *
 * List of client accounts with health indicators and filtering.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const accountListScreen: ScreenDefinition = {
  id: 'account-list',
  type: 'list',
  entityType: 'account',
  title: 'Accounts',
  icon: 'Building2',

  dataSource: {
    type: 'list',
    entityType: 'account',
    pagination: true,
    pageSize: 25,
    sort: { field: 'name', direction: 'asc' },
    include: ['contacts', 'activeJobsCount', 'placementsCount', 'healthScore', 'lastContactAt'],
  },

  layout: {
    type: 'single-column',
    sections: [
      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'search',
            type: 'text',
            path: 'filters.search',
            placeholder: 'Search accounts...',
            config: { icon: 'Search' },
          },
          {
            id: 'tier',
            type: 'multiselect',
            path: 'filters.tier',
            label: 'Tier',
            options: [
              { value: 'enterprise', label: 'Enterprise' },
              { value: 'mid_market', label: 'Mid-Market' },
              { value: 'smb', label: 'SMB' },
            ],
          },
          {
            id: 'status',
            type: 'multiselect',
            path: 'filters.status',
            label: 'Status',
            options: [
              { value: 'prospect', label: 'Prospect' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'churned', label: 'Churned' },
            ],
          },
          {
            id: 'industry',
            type: 'select',
            path: 'filters.industry',
            label: 'Industry',
            placeholder: 'All Industries',
            optionsSource: { type: 'static', source: 'industries' },
          },
          {
            id: 'health-status',
            type: 'multiselect',
            path: 'filters.healthStatus',
            label: 'Health',
            options: [
              { value: 'healthy', label: 'Healthy', color: 'green' },
              { value: 'at_risk', label: 'At Risk', color: 'yellow' },
              { value: 'critical', label: 'Critical', color: 'red' },
            ],
          },
          {
            id: 'owner',
            type: 'select',
            path: 'filters.ownerId',
            label: 'Owner',
            placeholder: 'All Owners',
            optionsSource: { type: 'entity', entityType: 'user', filter: { role: 'recruiter' } },
          },
          {
            id: 'my-accounts-only',
            type: 'boolean',
            path: 'filters.myAccountsOnly',
            label: 'My Accounts',
          },
        ],
      },

      // Account Table
      {
        id: 'account-table',
        type: 'table',
        columns_config: [
          {
            id: 'health-indicator',
            header: '',
            path: 'healthScore',
            type: 'health-indicator',
            width: '30px',
            config: {
              thresholds: { green: 70, yellow: 40, red: 0 },
            },
          },
          {
            id: 'name',
            header: 'Account',
            path: 'name',
            sortable: true,
            width: '25%',
            config: {
              link: true,
              linkPath: '/employee/workspace/accounts/{{id}}',
              avatar: true,
              avatarPath: 'logoUrl',
            },
          },
          {
            id: 'industry',
            header: 'Industry',
            path: 'industry',
          },
          {
            id: 'tier',
            header: 'Tier',
            path: 'tier',
            type: 'tier-badge',
            sortable: true,
          },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'account-status-badge',
            sortable: true,
          },
          {
            id: 'active-jobs',
            header: 'Jobs',
            path: 'activeJobsCount',
            type: 'number',
            sortable: true,
          },
          {
            id: 'placements',
            header: 'Placements',
            path: 'placementsCount',
            type: 'number',
            sortable: true,
          },
          {
            id: 'ytd-revenue',
            header: 'YTD Revenue',
            path: 'ytdRevenue',
            type: 'currency',
            sortable: true,
          },
          {
            id: 'nps',
            header: 'NPS',
            path: 'nps',
            type: 'nps-score',
          },
          {
            id: 'last-contact',
            header: 'Last Contact',
            path: 'lastContactAt',
            type: 'datetime',
            sortable: true,
            config: { relative: true, warnIfStale: 14 },
          },
          {
            id: 'owner',
            header: 'Owner',
            path: 'owner.name',
            type: 'user-avatar',
          },
        ],
        selectable: true,
        rowClick: { type: 'navigate', route: '/employee/workspace/accounts/{{id}}' },
        emptyState: {
          title: 'No accounts found',
          description: 'Add new client accounts to grow your portfolio',
          action: {
            label: 'Add Account',
            type: 'modal',
            config: { type: 'modal', modal: 'account-create' },
          },
        },
      },
    ],
  },

  actions: [
    {
      id: 'create',
      label: 'Add Account',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'account-create' },
    },
    {
      id: 'import',
      label: 'Import',
      type: 'modal',
      icon: 'Upload',
      variant: 'default',
      config: { type: 'modal', modal: 'account-import' },
    },
    {
      id: 'bulk-assign',
      label: 'Assign Owner',
      type: 'modal',
      icon: 'Users',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-assign' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'function',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'function', handler: 'exportAccounts' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Accounts', active: true },
    ],
  },
};

export default accountListScreen;
