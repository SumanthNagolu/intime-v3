/**
 * Hotlist List Screen Definition
 *
 * Metadata-driven screen for listing and managing Hotlists.
 * Hotlists are curated lists of bench consultants for marketing purposes.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const HOTLIST_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const HOTLIST_PURPOSE_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'client_specific', label: 'Client Specific' },
  { value: 'skill_specific', label: 'Skill Specific' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const hotlistTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Hotlist Name',
    path: 'name',
    type: 'text',
    sortable: true,
    width: '250px',
  },
  {
    id: 'purpose',
    label: 'Purpose',
    path: 'purpose',
    type: 'enum',
    sortable: true,
    config: {
      options: HOTLIST_PURPOSE_OPTIONS,
      badgeColors: {
        general: 'gray',
        client_specific: 'blue',
        skill_specific: 'purple',
      },
    },
  },
  {
    id: 'clientName',
    label: 'Client',
    path: 'client.name',
    type: 'text',
  },
  {
    id: 'consultantCount',
    label: 'Consultants',
    path: 'consultantCount',
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
      options: HOTLIST_STATUS_OPTIONS,
      badgeColors: {
        active: 'green',
        archived: 'gray',
      },
    },
  },
  {
    id: 'lastSentAt',
    label: 'Last Sent',
    path: 'lastSentAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
  {
    id: 'createdBy',
    label: 'Created By',
    path: 'creator.fullName',
    type: 'text',
  },
  {
    id: 'createdAt',
    label: 'Created',
    path: 'createdAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const hotlistListScreen: ScreenDefinition = {
  id: 'hotlist-list',
  type: 'list',
  entityType: 'hotlist',

  title: 'Hotlists',
  subtitle: 'Manage consultant marketing lists',
  icon: 'ListTodo',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'hotlist',
    procedure: 'bench.hotlists.list',
    defaultSort: { field: 'createdAt', direction: 'desc' },
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
        columns: 4,
        fields: [
          {
            id: 'totalHotlists',
            label: 'Total Hotlists',
            type: 'number',
            path: 'stats.total',
          },
          {
            id: 'activeHotlists',
            label: 'Active',
            type: 'number',
            path: 'stats.active',
          },
          {
            id: 'totalConsultants',
            label: 'Total Consultants',
            type: 'number',
            path: 'stats.totalConsultants',
          },
          {
            id: 'sentThisWeek',
            label: 'Sent This Week',
            type: 'number',
            path: 'stats.sentThisWeek',
          },
        ],
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.hotlists.getStats',
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
            type: 'text',
            path: 'search',
            config: { placeholder: 'Search hotlists...' },
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            options: HOTLIST_STATUS_OPTIONS,
          },
          {
            id: 'purpose',
            label: 'Purpose',
            type: 'multiselect',
            path: 'filters.purpose',
            options: HOTLIST_PURPOSE_OPTIONS,
          },
        ],
      },
      // Table
      {
        id: 'hotlist-table',
        type: 'table',
        columns_config: hotlistTableColumns,
        selectable: true,
        pagination: { defaultPageSize: 25 },
        rowClick: {
          type: 'navigate',
          route: '/employee/bench/hotlists/{{id}}',
        },
        rowActions: [
          {
            id: 'view',
            label: 'View',
            icon: 'Eye',
            type: 'navigate',
            config: {
              type: 'navigate',
              route: '/employee/bench/hotlists/{{id}}',
            },
          },
          {
            id: 'edit',
            label: 'Edit',
            icon: 'Pencil',
            type: 'navigate',
            config: {
              type: 'navigate',
              route: '/employee/bench/hotlists/{{id}}/edit',
            },
          },
          {
            id: 'send',
            label: 'Send',
            icon: 'Send',
            type: 'modal',
            config: {
              type: 'modal',
              modal: 'SendHotlistModal',
              props: { hotlistId: '{{id}}' },
            },
          },
          {
            id: 'duplicate',
            label: 'Duplicate',
            icon: 'Copy',
            type: 'mutation',
            config: {
              type: 'mutation',
              procedure: 'bench.hotlists.duplicate',
              input: { id: '{{id}}' },
            },
          },
          {
            id: 'archive',
            label: 'Archive',
            icon: 'Archive',
            type: 'mutation',
            variant: 'secondary',
            config: {
              type: 'mutation',
              procedure: 'bench.hotlists.archive',
              input: { id: '{{id}}' },
            },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'eq', value: 'active' },
            },
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: 'Trash',
            type: 'mutation',
            variant: 'destructive',
            config: {
              type: 'mutation',
              procedure: 'bench.hotlists.delete',
              input: { id: '{{id}}' },
            },
            confirm: {
              title: 'Delete Hotlist',
              message: 'Are you sure you want to delete this hotlist? This action cannot be undone.',
              confirmLabel: 'Delete',
              destructive: true,
            },
          },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create',
      label: 'Create Hotlist',
      type: 'navigate',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'navigate',
        route: '/employee/bench/hotlists/new',
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

  // Bulk actions
  bulkActions: [
    {
      id: 'bulk-archive',
      label: 'Archive Selected',
      icon: 'Archive',
      type: 'mutation',
      config: {
        type: 'mutation',
        procedure: 'bench.hotlists.bulkArchive',
        input: { ids: '{{selectedIds}}' },
      },
    },
    {
      id: 'bulk-send',
      label: 'Send Selected',
      icon: 'Send',
      type: 'modal',
      config: {
        type: 'modal',
        modal: 'BulkSendHotlistsModal',
        props: { hotlistIds: '{{selectedIds}}' },
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
      { label: 'Hotlists' },
    ],
  },
};

export default hotlistListScreen;
