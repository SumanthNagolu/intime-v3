/**
 * Account List Screen Definition
 *
 * Metadata-driven screen for listing Accounts with filtering and actions.
 * Generated from entity config: src/lib/entities/crm/account.entity.ts
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// TABLE COLUMNS
// ==========================================

const accountTableColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Account Name',
    path: 'name',
    type: 'text',
    sortable: true,
    width: '200px',
  },
  {
    id: 'industry',
    label: 'Industry',
    path: 'industry',
    type: 'enum',
    sortable: true,
    config: {
      options: [
        { value: 'technology', label: 'Technology' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'finance', label: 'Finance' },
        { value: 'banking', label: 'Banking' },
        { value: 'insurance', label: 'Insurance' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'retail', label: 'Retail' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'government', label: 'Government' },
        { value: 'education', label: 'Education' },
        { value: 'energy', label: 'Energy' },
        { value: 'telecommunications', label: 'Telecom' },
        { value: 'pharmaceutical', label: 'Pharmaceutical' },
        { value: 'other', label: 'Other' },
      ],
    },
  },
  {
    id: 'companyType',
    label: 'Type',
    path: 'companyType',
    type: 'enum',
    config: {
      options: [
        { value: 'direct_client', label: 'Direct Client' },
        { value: 'implementation_partner', label: 'Implementation Partner' },
        { value: 'msp_vms', label: 'MSP/VMS' },
        { value: 'system_integrator', label: 'System Integrator' },
        { value: 'staffing_agency', label: 'Staffing Agency' },
        { value: 'vendor', label: 'Vendor' },
      ],
    },
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: [
        { value: 'prospect', label: 'Prospect' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'churned', label: 'Churned' },
      ],
      badgeColors: {
        prospect: 'blue',
        active: 'green',
        inactive: 'gray',
        churned: 'red',
      },
    },
  },
  {
    id: 'tier',
    label: 'Tier',
    path: 'tier',
    type: 'enum',
    sortable: true,
    config: {
      options: [
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'mid_market', label: 'Mid-Market' },
        { value: 'smb', label: 'SMB' },
        { value: 'strategic', label: 'Strategic' },
      ],
      badgeColors: {
        enterprise: 'purple',
        mid_market: 'blue',
        smb: 'gray',
        strategic: 'gold',
      },
    },
  },
  {
    id: 'accountManager',
    label: 'Account Manager',
    path: 'accountManager.fullName',
    type: 'text',
  },
  {
    id: 'annualRevenueTarget',
    label: 'Revenue Target',
    path: 'annualRevenueTarget',
    type: 'currency',
    sortable: true,
    width: '140px',
  },
  {
    id: 'phone',
    label: 'Phone',
    path: 'phone',
    type: 'phone',
  },
  {
    id: 'createdAt',
    label: 'Created',
    path: 'createdAt',
    type: 'date',
    sortable: true,
    config: { format: 'short' },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const accountListScreen: ScreenDefinition = {
  id: 'account-list',
  type: 'list',
  entityType: 'account',

  title: 'Accounts',
  subtitle: 'Manage client accounts and relationships',

  // Data source
  dataSource: {
    type: 'query',
    query: {
      procedure: 'crm.accounts.list',
      params: {},
    },
  },

  // Single column with table
  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'account-metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'totalAccounts',
            label: 'Total Accounts',
            type: 'number',
            path: 'total',
          },
          {
            id: 'activeAccounts',
            label: 'Active',
            type: 'number',
            path: 'metrics.byStatus.active',
          },
          {
            id: 'prospects',
            label: 'Prospects',
            type: 'number',
            path: 'metrics.byStatus.prospect',
          },
          {
            id: 'totalRevenueTarget',
            label: 'Revenue Target',
            type: 'currency',
            path: 'metrics.totalRevenueTarget',
          },
        ],
      },
      {
        id: 'account-table',
        type: 'table',
        columns_config: accountTableColumns,
      },
    ],
  },

  // Actions
  actions: [
    {
      id: 'create',
      type: 'navigate',
      label: 'New Account',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'navigate',
        route: '/employee/crm/accounts/new',
      },
    },
    {
      id: 'import',
      type: 'custom',
      label: 'Import',
      variant: 'secondary',
      icon: 'Upload',
      config: {
        type: 'custom',
        handler: 'handleImport',
      },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      variant: 'secondary',
      icon: 'Download',
      config: {
        type: 'custom',
        handler: 'handleExport',
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Accounts' },
    ],
  },
};

export default accountListScreen;
