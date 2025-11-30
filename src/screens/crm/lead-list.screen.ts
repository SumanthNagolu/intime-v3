/**
 * Lead List Screen Definition
 *
 * Metadata-driven screen for listing Leads with filtering and actions.
 * Demonstrates the list screen type pattern.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// TABLE COLUMNS
// ==========================================

const leadTableColumns: TableColumnDefinition[] = [
  {
    id: 'companyName',
    label: 'Company',
    path: 'companyName',
    type: 'text',
    sortable: true,
    width: '200px',
  },
  {
    id: 'contact',
    label: 'Contact',
    path: 'firstName',
    type: 'text',
    // Computed display would combine firstName + lastName
  },
  {
    id: 'title',
    label: 'Title',
    path: 'title',
    type: 'text',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
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
    type: 'enum',
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
    type: 'currency',
    sortable: true,
    width: '120px',
  },
  {
    id: 'source',
    label: 'Source',
    path: 'source',
    type: 'text',
  },
  {
    id: 'owner',
    label: 'Owner',
    path: 'owner.fullName',
    type: 'text',
  },
  {
    id: 'lastContactedAt',
    label: 'Last Contact',
    path: 'lastContactedAt',
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
    config: { format: 'short' },
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
      procedure: 'crm.listLeads',
      params: {
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
            type: 'number',
            path: 'metrics.total',
          },
          {
            id: 'newLeads',
            label: 'New This Week',
            type: 'number',
            path: 'metrics.newThisWeek',
          },
          {
            id: 'qualifiedLeads',
            label: 'Qualified',
            type: 'number',
            path: 'metrics.qualified',
          },
          {
            id: 'pipelineValue',
            label: 'Pipeline Value',
            type: 'currency',
            path: 'metrics.pipelineValue',
          },
        ],
      },
      {
        id: 'lead-table',
        type: 'table',
        columns_config: leadTableColumns,
        // Note: Advanced table features (pagination, sorting, selection, filters)
        // will be handled by the table renderer component
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
      config: {
        type: 'navigate',
        route: '/employee/crm/leads/new',
      },
    },
    {
      id: 'import',
      label: 'Import',
      type: 'custom',
      variant: 'secondary',
      icon: 'Upload',
      config: {
        type: 'custom',
        handler: 'handleImport',
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
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
      { label: 'Leads' },
    ],
  },
};

export default leadListScreen;
