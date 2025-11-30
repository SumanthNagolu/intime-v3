/**
 * Account List Screen Definition
 *
 * Metadata-driven screen for listing Accounts with filtering and actions.
 * Generated from entity config: src/lib/entities/crm/account.entity.ts
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// TABLE COLUMNS
// ==========================================

const accountTableColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Account Name',
    path: 'name',
    fieldType: 'text',
    sortable: true,
    width: '200px',
  },
  {
    id: 'industry',
    label: 'Industry',
    path: 'industry',
    fieldType: 'enum',
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
    fieldType: 'enum',
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
    fieldType: 'enum',
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
    fieldType: 'enum',
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
    fieldType: 'text',
  },
  {
    id: 'annualRevenueTarget',
    label: 'Revenue Target',
    path: 'annualRevenueTarget',
    fieldType: 'currency',
    sortable: true,
    width: '140px',
  },
  {
    id: 'phone',
    label: 'Phone',
    path: 'phone',
    fieldType: 'phone',
  },
  {
    id: 'createdAt',
    label: 'Created',
    path: 'createdAt',
    fieldType: 'date',
    sortable: true,
    config: { format: 'short' },
  },
];

// ==========================================
// FILTER FIELDS
// ==========================================

const filterFields = [
  {
    id: 'status',
    label: 'Status',
    fieldType: 'multiselect' as const,
    config: {
      options: [
        { value: 'prospect', label: 'Prospect' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'churned', label: 'Churned' },
      ],
    },
  },
  {
    id: 'tier',
    label: 'Tier',
    fieldType: 'multiselect' as const,
    config: {
      options: [
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'mid_market', label: 'Mid-Market' },
        { value: 'smb', label: 'SMB' },
        { value: 'strategic', label: 'Strategic' },
      ],
    },
  },
  {
    id: 'industry',
    label: 'Industry',
    fieldType: 'multiselect' as const,
    config: {
      options: [
        { value: 'technology', label: 'Technology' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'finance', label: 'Finance' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'other', label: 'Other' },
      ],
    },
  },
  {
    id: 'companyType',
    label: 'Company Type',
    fieldType: 'multiselect' as const,
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
    id: 'accountManagerId',
    label: 'Account Manager',
    fieldType: 'select' as const,
    config: {
      entityType: 'user',
      displayField: 'fullName',
    },
  },
  {
    id: 'dateRange',
    label: 'Created Date',
    fieldType: 'date' as const,
    config: {
      range: true,
    },
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
      router: 'crm',
      procedure: 'accounts.list',
      input: {},
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
            fieldType: 'number',
            path: 'total',
          },
          {
            id: 'activeAccounts',
            label: 'Active',
            fieldType: 'number',
            path: 'metrics.byStatus.active',
          },
          {
            id: 'prospects',
            label: 'Prospects',
            fieldType: 'number',
            path: 'metrics.byStatus.prospect',
          },
          {
            id: 'totalRevenueTarget',
            label: 'Revenue Target',
            fieldType: 'currency',
            path: 'metrics.totalRevenueTarget',
          },
        ],
      },
      {
        id: 'account-table',
        type: 'table',
        tableConfig: {
          columns: accountTableColumns,
          dataPath: 'items',
          rowClickAction: {
            type: 'navigate',
            navigation: {
              path: '/employee/crm/accounts/{id}',
              params: { id: fieldValue('id') },
            },
          },
          pagination: {
            enabled: true,
            pageSize: 25,
            pageSizeOptions: [10, 25, 50, 100],
          },
          sorting: {
            enabled: true,
            defaultSort: { field: 'name', direction: 'asc' },
          },
          selection: {
            enabled: true,
            mode: 'multiple',
          },
          filters: filterFields,
        },
      },
    ],
  },

  // Actions
  actions: [
    {
      id: 'create',
      label: 'New Account',
      type: 'navigate',
      variant: 'primary',
      icon: 'Plus',
      navigation: {
        path: '/employee/crm/accounts/new',
      },
    },
    {
      id: 'import',
      label: 'Import',
      type: 'custom',
      variant: 'secondary',
      icon: 'Upload',
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      variant: 'secondary',
      icon: 'Download',
    },
  ],

  // Bulk actions (when rows selected)
  bulkActions: [
    {
      id: 'bulk-assign',
      label: 'Assign Manager',
      type: 'custom',
      icon: 'UserPlus',
    },
    {
      id: 'bulk-status',
      label: 'Change Status',
      type: 'custom',
      icon: 'RefreshCw',
    },
    {
      id: 'bulk-delete',
      label: 'Delete',
      type: 'custom',
      variant: 'destructive',
      icon: 'Trash2',
      confirm: {
        title: 'Delete Accounts',
        message: 'Are you sure you want to delete the selected accounts?',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', path: '/employee/crm' },
      { label: 'Accounts' },
    ],
  },
};

export default accountListScreen;
