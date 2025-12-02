/**
 * Vendor List Screen Definition
 *
 * Metadata-driven screen for listing and managing Vendors.
 * Vendors are partner companies that provide job orders for bench consultants.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const VENDOR_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'blocked', label: 'Blocked' },
] as const;

const VENDOR_TIER_OPTIONS = [
  { value: 'preferred', label: 'Preferred' },
  { value: 'standard', label: 'Standard' },
  { value: 'new', label: 'New' },
] as const;

const VENDOR_TYPE_OPTIONS = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'prime_vendor', label: 'Prime Vendor' },
  { value: 'tier_1', label: 'Tier 1' },
  { value: 'tier_2', label: 'Tier 2' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
] as const;

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const vendorTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Vendor Name',
    path: 'name',
    type: 'text',
    sortable: true,
    width: '200px',
  },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    sortable: true,
    config: {
      options: VENDOR_TYPE_OPTIONS,
      badgeColors: {
        direct_client: 'green',
        prime_vendor: 'purple',
        tier_1: 'blue',
        tier_2: 'yellow',
        implementation_partner: 'gray',
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
      options: VENDOR_TIER_OPTIONS,
      badgeColors: {
        preferred: 'green',
        standard: 'blue',
        new: 'yellow',
      },
    },
  },
  {
    id: 'contactName',
    label: 'Primary Contact',
    path: 'primaryContact.fullName',
    type: 'text',
  },
  {
    id: 'email',
    label: 'Email',
    path: 'primaryContact.email',
    type: 'email',
  },
  {
    id: 'activeJobOrders',
    label: 'Active Orders',
    path: 'activeJobOrderCount',
    type: 'number',
    sortable: true,
  },
  {
    id: 'placements',
    label: 'Placements',
    path: 'placementCount',
    type: 'number',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: VENDOR_STATUS_OPTIONS,
      badgeColors: {
        active: 'green',
        inactive: 'gray',
        pending: 'yellow',
        blocked: 'red',
      },
    },
  },
  {
    id: 'lastActivity',
    label: 'Last Activity',
    path: 'lastActivityAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const vendorListScreen: ScreenDefinition = {
  id: 'vendor-list',
  type: 'list',
  entityType: 'vendor',

  title: 'Vendors',
  subtitle: 'Manage vendor relationships and job orders',
  icon: 'Building2',

  // Data source
  dataSource: {
    type: 'list',
    entity: 'vendor',
    procedure: 'bench.vendors.list',
    defaultSort: { field: 'name', direction: 'asc' },
    defaultPageSize: 25,
  },

  // Layout
  layout: {
    type: 'list',
    sections: [
      // Metrics row
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 5,
        fields: [
          {
            id: 'totalVendors',
            label: 'Total Vendors',
            type: 'number',
            path: 'stats.total',
          },
          {
            id: 'activeVendors',
            label: 'Active',
            type: 'number',
            path: 'stats.active',
          },
          {
            id: 'preferredVendors',
            label: 'Preferred',
            type: 'number',
            path: 'stats.preferred',
          },
          {
            id: 'activeJobOrders',
            label: 'Active Job Orders',
            type: 'number',
            path: 'stats.activeJobOrders',
          },
          {
            id: 'totalPlacements',
            label: 'Total Placements',
            type: 'number',
            path: 'stats.totalPlacements',
          },
        ],
        dataSource: {
          type: 'query',
          query: {
            procedure: 'bench.vendors.getStats',
          },
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        layout: 'horizontal',
        fields: [
          {
            id: 'search',
            label: 'Search',
            type: 'search',
            path: 'search',
            config: { placeholder: 'Search vendors...' },
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multi-select',
            path: 'filters.status',
            options: VENDOR_STATUS_OPTIONS,
          },
          {
            id: 'tier',
            label: 'Tier',
            type: 'multi-select',
            path: 'filters.tier',
            options: VENDOR_TIER_OPTIONS,
          },
          {
            id: 'type',
            label: 'Type',
            type: 'multi-select',
            path: 'filters.type',
            options: VENDOR_TYPE_OPTIONS,
          },
        ],
      },
      // Table
      {
        id: 'vendors-table',
        type: 'table',
        columns_config: vendorTableColumns,
        selectable: true,
        pagination: { defaultPageSize: 25 },
        rowClick: {
          type: 'navigate',
          route: '/employee/bench/vendors/{{id}}',
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create',
      label: 'Add Vendor',
      type: 'navigate',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'navigate',
        route: '/employee/bench/vendors/new',
      },
    },
    {
      id: 'import',
      label: 'Import',
      type: 'modal',
      variant: 'secondary',
      icon: 'Upload',
      config: {
        type: 'modal',
        modal: 'ImportVendorsModal',
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

  // Row actions
  rowActions: [
    {
      id: 'view',
      label: 'View Details',
      icon: 'Eye',
      type: 'navigate',
      config: {
        type: 'navigate',
        route: '/employee/bench/vendors/{{id}}',
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: 'Pencil',
      type: 'navigate',
      config: {
        type: 'navigate',
        route: '/employee/bench/vendors/{{id}}/edit',
      },
    },
    {
      id: 'view-job-orders',
      label: 'View Job Orders',
      icon: 'Briefcase',
      type: 'navigate',
      config: {
        type: 'navigate',
        route: '/employee/bench/job-orders?vendorId={{id}}',
      },
    },
    {
      id: 'add-contact',
      label: 'Add Contact',
      icon: 'UserPlus',
      type: 'modal',
      config: {
        type: 'modal',
        modal: 'AddVendorContactModal',
        props: { vendorId: '{{id}}' },
      },
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: 'Pause',
      type: 'mutation',
      variant: 'secondary',
      config: {
        type: 'mutation',
        procedure: 'bench.vendors.deactivate',
        input: { id: '{{id}}' },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'active' },
      },
    },
    {
      id: 'activate',
      label: 'Activate',
      icon: 'Play',
      type: 'mutation',
      variant: 'secondary',
      config: {
        type: 'mutation',
        procedure: 'bench.vendors.activate',
        input: { id: '{{id}}' },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'inactive' },
      },
    },
  ],

  // Bulk actions
  bulkActions: [
    {
      id: 'bulk-export',
      label: 'Export Selected',
      icon: 'Download',
      type: 'custom',
      config: {
        type: 'custom',
        handler: 'handleBulkExport',
      },
    },
    {
      id: 'bulk-email',
      label: 'Send Email',
      icon: 'Mail',
      type: 'modal',
      config: {
        type: 'modal',
        modal: 'BulkEmailVendorsModal',
        props: { vendorIds: '{{selectedIds}}' },
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Dashboard',
      route: '/employee/bench',
    },
    breadcrumbs: [
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Vendors' },
    ],
  },
};

export default vendorListScreen;
