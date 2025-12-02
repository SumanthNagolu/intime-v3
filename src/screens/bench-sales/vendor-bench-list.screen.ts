/**
 * Vendor Bench List Screen
 *
 * Third-party consultant profiles from vendor APIs.
 * These are external consultants available through partner vendors.
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

// ==========================================
// OPTIONS
// ==========================================

const VISA_TYPE_OPTIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b', label: 'H-1B' },
  { value: 'opt', label: 'OPT' },
  { value: 'opt_stem', label: 'OPT STEM' },
  { value: 'l1', label: 'L-1' },
  { value: 'tn_visa', label: 'TN Visa' },
  { value: 'h4_ead', label: 'H4-EAD' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'within_2_weeks', label: 'Within 2 Weeks' },
  { value: 'within_30_days', label: 'Within 30 Days' },
  { value: 'on_project', label: 'On Project' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const vendorBenchColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Consultant',
    path: 'fullName',
    type: 'text',
    sortable: true,
    width: '180px',
    config: {
      link: true,
      linkPath: '/employee/workspace/bench/vendor-consultants/{{id}}',
    },
  },
  {
    id: 'vendorName',
    label: 'Vendor',
    path: 'vendor.name',
    type: 'text',
    sortable: true,
  },
  {
    id: 'title',
    label: 'Title',
    path: 'title',
    type: 'text',
  },
  {
    id: 'skills',
    label: 'Skills',
    path: 'skills',
    type: 'tags',
    config: { maxTags: 3 },
  },
  {
    id: 'visaStatus',
    label: 'Visa',
    path: 'visaStatus',
    type: 'enum',
    config: {
      options: VISA_TYPE_OPTIONS,
      badgeColors: {
        us_citizen: 'green',
        green_card: 'green',
        h1b: 'blue',
        opt: 'yellow',
        opt_stem: 'yellow',
        l1: 'blue',
        tn_visa: 'blue',
        h4_ead: 'purple',
      },
    },
  },
  {
    id: 'rate',
    label: 'Rate',
    path: 'rate',
    type: 'currency',
    sortable: true,
    config: { suffix: '/hr' },
  },
  {
    id: 'location',
    label: 'Location',
    path: 'location',
    type: 'text',
  },
  {
    id: 'availability',
    label: 'Availability',
    path: 'availability',
    type: 'enum',
    config: {
      options: AVAILABILITY_OPTIONS,
      badgeColors: {
        immediate: 'green',
        within_2_weeks: 'yellow',
        within_30_days: 'orange',
        on_project: 'gray',
      },
    },
  },
  {
    id: 'lastUpdated',
    label: 'Last Updated',
    path: 'lastSyncedAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const vendorBenchListScreen: ScreenDefinition = {
  id: 'vendor-bench-list',
  type: 'list',
  entityType: 'vendor_consultant',

  title: 'Vendor Bench',
  subtitle: 'Third-party consultants from vendor partners',
  icon: 'Users',

  dataSource: {
    type: 'list',
    entityType: 'vendor_consultant',
    procedure: 'bench.vendorConsultants.list',
    defaultSort: { field: 'lastSyncedAt', direction: 'desc' },
    defaultPageSize: 25,
  },

  layout: {
    type: 'single-column',
    sections: [
      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'totalConsultants',
            label: 'Total Consultants',
            type: 'number',
            path: 'stats.total',
          },
          {
            id: 'immediatelyAvailable',
            label: 'Immediately Available',
            type: 'number',
            path: 'stats.immediatelyAvailable',
          },
          {
            id: 'newThisWeek',
            label: 'New This Week',
            type: 'number',
            path: 'stats.newThisWeek',
          },
          {
            id: 'activeVendors',
            label: 'Active Vendors',
            type: 'number',
            path: 'stats.activeVendors',
          },
        ],
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.vendorConsultants.getStats',
          },
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
            type: 'text',
            path: 'filters.search',
            placeholder: 'Search consultants...',
            config: { icon: 'Search' },
          },
          {
            id: 'vendorId',
            label: 'Vendor',
            type: 'select',
            path: 'filters.vendorId',
            placeholder: 'All Vendors',
            config: { entityType: 'vendor', displayField: 'name' },
          },
          {
            id: 'skills',
            type: 'tags',
            path: 'filters.skills',
            label: 'Skills',
            placeholder: 'Any skills',
            config: { suggestions: true },
          },
          {
            id: 'visaStatus',
            label: 'Visa Status',
            type: 'multiselect',
            path: 'filters.visaStatus',
            options: VISA_TYPE_OPTIONS,
          },
          {
            id: 'availability',
            label: 'Availability',
            type: 'multiselect',
            path: 'filters.availability',
            options: AVAILABILITY_OPTIONS,
          },
        ],
      },

      // Table
      {
        id: 'vendor-bench-table',
        type: 'table',
        columns_config: vendorBenchColumns,
        selectable: true,
        pagination: { defaultPageSize: 25 },
        actions: [
          {
            id: 'view',
            label: 'View Profile',
            icon: 'Eye',
            type: 'navigate',
            config: { type: 'navigate', route: '/employee/workspace/bench/vendor-consultants/{{id}}' },
          },
          {
            id: 'import',
            label: 'Import to Bench',
            icon: 'UserPlus',
            type: 'modal',
            config: { type: 'modal', modal: 'import-vendor-consultant' },
          },
          {
            id: 'submit',
            label: 'Submit to Job',
            icon: 'Send',
            type: 'modal',
            config: { type: 'modal', modal: 'bench-submission-create' },
          },
          {
            id: 'contact-vendor',
            label: 'Contact Vendor',
            icon: 'Mail',
            type: 'modal',
            config: { type: 'modal', modal: 'contact-vendor' },
          },
        ],
        emptyState: {
          title: 'No vendor consultants found',
          description: 'Import consultants from vendor feeds or wait for automatic sync',
        },
      },
    ],
  },

  actions: [
    {
      id: 'refresh-sync',
      label: 'Refresh All',
      type: 'custom',
      icon: 'RefreshCw',
      variant: 'default',
      config: { type: 'custom', handler: 'refreshVendorSync' },
    },
    {
      id: 'import-bulk',
      label: 'Bulk Import',
      type: 'modal',
      icon: 'Upload',
      variant: 'default',
      config: { type: 'modal', modal: 'bulk-import-vendor-consultants' },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'custom', handler: 'exportVendorConsultants' },
    },
  ],

  bulkActions: [
    {
      id: 'bulk-import',
      label: 'Import Selected',
      icon: 'UserPlus',
      type: 'modal',
      config: { type: 'modal', modal: 'bulk-import-to-bench', props: { ids: '{{selectedIds}}' } },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/workspace/bench' },
      { label: 'Vendor Bench', active: true },
    ],
  },
};

export default vendorBenchListScreen;
