/**
 * Lead List Screen Definition
 *
 * Metadata-driven screen for listing Leads with filtering and actions.
 * Demonstrates the list screen type pattern.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// TABLE COLUMNS
// ==========================================

const leadTableColumns: TableColumnDefinition[] = [
  {
    id: 'companyName',
    label: 'Company',
    path: 'companyName',
    fieldType: 'text',
    sortable: true,
    width: '200px',
  },
  {
    id: 'contact',
    label: 'Contact',
    path: 'firstName',
    fieldType: 'text',
    // Computed display would combine firstName + lastName
  },
  {
    id: 'title',
    label: 'Title',
    path: 'title',
    fieldType: 'text',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    fieldType: 'enum',
    sortable: true,
    config: {
      options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'proposal', label: 'Proposal' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'converted', label: 'Converted' },
        { value: 'lost', label: 'Lost' },
      ],
      badgeColors: {
        new: 'blue',
        contacted: 'yellow',
        qualified: 'green',
        proposal: 'purple',
        negotiation: 'orange',
        converted: 'green',
        lost: 'red',
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
    },
  },
  {
    id: 'estimatedValue',
    label: 'Est. Value',
    path: 'estimatedValue',
    fieldType: 'currency',
    sortable: true,
    width: '120px',
  },
  {
    id: 'source',
    label: 'Source',
    path: 'source',
    fieldType: 'text',
  },
  {
    id: 'owner',
    label: 'Owner',
    path: 'owner.fullName',
    fieldType: 'text',
  },
  {
    id: 'lastContactedAt',
    label: 'Last Contact',
    path: 'lastContactedAt',
    fieldType: 'date',
    sortable: true,
    config: { format: 'relative' },
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
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'proposal', label: 'Proposal' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'converted', label: 'Converted' },
        { value: 'lost', label: 'Lost' },
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
    id: 'source',
    label: 'Source',
    fieldType: 'multiselect' as const,
    config: {
      options: [
        { value: 'website', label: 'Website' },
        { value: 'referral', label: 'Referral' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'cold_outreach', label: 'Cold Outreach' },
        { value: 'event', label: 'Event' },
        { value: 'inbound', label: 'Inbound' },
      ],
    },
  },
  {
    id: 'ownerId',
    label: 'Owner',
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

export const leadListScreen: ScreenDefinition = {
  id: 'lead-list',
  type: 'list',
  entityType: 'lead',

  title: 'Leads',
  subtitle: 'Manage your sales leads and prospects',

  // Data source
  dataSource: {
    type: 'query',
    query: {
      router: 'crm',
      procedure: 'listLeads',
      input: {
        // Filters will be bound from filter state
      },
    },
  },

  // Single column with table
  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'lead-metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'totalLeads',
            label: 'Total Leads',
            fieldType: 'number',
            path: 'metrics.total',
          },
          {
            id: 'newLeads',
            label: 'New This Week',
            fieldType: 'number',
            path: 'metrics.newThisWeek',
          },
          {
            id: 'qualifiedLeads',
            label: 'Qualified',
            fieldType: 'number',
            path: 'metrics.qualified',
          },
          {
            id: 'pipelineValue',
            label: 'Pipeline Value',
            fieldType: 'currency',
            path: 'metrics.pipelineValue',
          },
        ],
      },
      {
        id: 'lead-table',
        type: 'table',
        tableConfig: {
          columns: leadTableColumns,
          dataPath: 'items',
          rowClickAction: {
            type: 'navigate',
            navigation: {
              path: '/employee/crm/leads/{id}',
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
            defaultSort: { field: 'createdAt', direction: 'desc' },
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
      label: 'Create Lead',
      type: 'navigate',
      variant: 'primary',
      icon: 'Plus',
      navigation: {
        path: '/employee/crm/leads/new',
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
      label: 'Assign Owner',
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
        title: 'Delete Leads',
        message: 'Are you sure you want to delete the selected leads?',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'CRM', path: '/employee/crm' },
      { label: 'Leads' },
    ],
  },
};

export default leadListScreen;
