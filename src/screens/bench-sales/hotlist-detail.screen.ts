/**
 * Hotlist Detail Screen Definition
 *
 * Metadata-driven screen for viewing and managing a single Hotlist.
 * Shows hotlist details, consultants, and send history.
 */

import type { ScreenDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const HOTLIST_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
] as const;

const HOTLIST_PURPOSE_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'client_specific', label: 'Client Specific' },
  { value: 'skill_specific', label: 'Skill Specific' },
] as const;

// ==========================================
// SIDEBAR FIELDS
// ==========================================

const sidebarFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    path: 'status',
    config: {
      options: HOTLIST_STATUS_OPTIONS,
      badgeColors: {
        active: 'green',
        archived: 'gray',
      },
    },
  },
  {
    id: 'purpose',
    label: 'Purpose',
    type: 'enum',
    path: 'purpose',
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
    id: 'consultantCount',
    label: 'Consultants',
    type: 'number',
    path: 'consultantCount',
  },
  {
    id: 'timesShared',
    label: 'Times Shared',
    type: 'number',
    path: 'timesShared',
  },
  {
    id: 'lastSentAt',
    label: 'Last Sent',
    type: 'date',
    path: 'lastSentAt',
    config: { format: 'relative' },
  },
  {
    id: 'creator',
    label: 'Created By',
    type: 'text',
    path: 'creator.fullName',
  },
  {
    id: 'createdAt',
    label: 'Created',
    type: 'date',
    path: 'createdAt',
    config: { format: 'relative' },
  },
];

// ==========================================
// HOTLIST INFO FIELDS
// ==========================================

const hotlistInfoFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'name',
    label: 'Hotlist Name',
    type: 'text',
    path: 'name',
    required: true,
    editable: true,
    span: 2,
  },
  {
    id: 'purpose',
    label: 'Purpose',
    type: 'select',
    path: 'purpose',
    required: true,
    editable: true,
    options: HOTLIST_PURPOSE_OPTIONS,
  },
  {
    id: 'clientId',
    label: 'Client',
    type: 'select',
    path: 'clientId',
    editable: true,
    config: {
      entityType: 'account',
      displayField: 'name',
    },
    visible: {
      type: 'condition',
      condition: { field: 'purpose', operator: 'eq', value: 'client_specific' },
    },
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    path: 'description',
    editable: true,
    span: 2,
    config: { rows: 3 },
  },
];

// ==========================================
// CONSULTANT TABLE COLUMNS
// ==========================================

const consultantTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Consultant',
    path: 'consultant.fullName',
    type: 'text',
    width: '200px',
  },
  {
    id: 'title',
    label: 'Title',
    path: 'consultant.currentTitle',
    type: 'text',
  },
  {
    id: 'skills',
    label: 'Key Skills',
    path: 'consultant.primarySkills',
    type: 'tags',
  },
  {
    id: 'visaStatus',
    label: 'Visa',
    path: 'consultant.visaStatus',
    type: 'enum',
    config: {
      badgeColors: {
        USC: 'green',
        GC: 'green',
        H1B: 'blue',
        OPT: 'yellow',
        CPT: 'yellow',
        TN: 'blue',
        L1: 'blue',
        EAD: 'purple',
      },
    },
  },
  {
    id: 'expectedRate',
    label: 'Rate',
    path: 'consultant.expectedRate',
    type: 'currency',
    config: { suffix: '/hr' },
  },
  {
    id: 'location',
    label: 'Location',
    path: 'consultant.location',
    type: 'text',
  },
  {
    id: 'positionOrder',
    label: 'Order',
    path: 'positionOrder',
    type: 'number',
    width: '80px',
  },
  {
    id: 'addedAt',
    label: 'Added',
    path: 'addedAt',
    type: 'date',
    config: { format: 'relative' },
  },
];

// ==========================================
// SEND HISTORY TABLE COLUMNS
// ==========================================

const sendHistoryColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'sentAt',
    label: 'Sent At',
    path: 'sentAt',
    type: 'datetime',
    sortable: true,
  },
  {
    id: 'sentBy',
    label: 'Sent By',
    path: 'sentBy.fullName',
    type: 'text',
  },
  {
    id: 'recipients',
    label: 'Recipients',
    path: 'recipientCount',
    type: 'number',
  },
  {
    id: 'format',
    label: 'Format',
    path: 'format',
    type: 'enum',
    config: {
      options: [
        { value: 'email', label: 'Email' },
        { value: 'pdf', label: 'PDF' },
        { value: 'excel', label: 'Excel' },
      ],
      badgeColors: {
        email: 'blue',
        pdf: 'red',
        excel: 'green',
      },
    },
  },
  {
    id: 'opens',
    label: 'Opens',
    path: 'opens',
    type: 'number',
  },
  {
    id: 'responses',
    label: 'Responses',
    path: 'responses',
    type: 'number',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const hotlistDetailScreen: ScreenDefinition = {
  id: 'hotlist-detail',
  type: 'detail',
  entityType: 'hotlist',

  title: fieldValue('name', 'Hotlist Details'),
  subtitle: fieldValue('purpose'),
  icon: 'ListTodo',

  // Data source
  dataSource: {
    type: 'query',
    query: {
      procedure: 'bench.hotlists.getById',
      params: { id: fieldValue('id') },
    },
  },

  // Sidebar + Tabs layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',

    sidebar: {
      id: 'hotlist-sidebar',
      type: 'info-card',
      title: 'Hotlist Info',
      fields: sidebarFields,
    },

    tabs: [
      // Overview Tab
      {
        id: 'overview',
        label: 'Overview',
        icon: 'FileText',
        sections: [
          {
            id: 'hotlist-info',
            type: 'field-grid',
            title: 'Hotlist Details',
            icon: 'Info',
            columns: 2,
            fields: hotlistInfoFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
        ],
      },

      // Consultants Tab
      {
        id: 'consultants',
        label: 'Consultants',
        icon: 'Users',
        badge: fieldValue('consultantCount'),
        sections: [
          {
            id: 'consultants-table',
            type: 'table',
            title: 'Hotlist Consultants',
            columns_config: consultantTableColumns,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'bench.hotlists.getConsultants',
                params: { hotlistId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-consultant',
                label: 'Add Consultant',
                type: 'modal',
                variant: 'primary',
                icon: 'Plus',
                config: {
                  type: 'modal',
                  modal: 'AddConsultantToHotlistModal',
                  props: { hotlistId: fieldValue('id') },
                },
              },
              {
                id: 'reorder',
                label: 'Reorder',
                type: 'custom',
                variant: 'secondary',
                icon: 'ArrowUpDown',
                config: {
                  type: 'custom',
                  handler: 'handleReorder',
                },
              },
            ],
            rowActions: [
              {
                id: 'view-consultant',
                label: 'View Profile',
                icon: 'Eye',
                type: 'navigate',
                config: {
                  type: 'navigate',
                  route: '/employee/bench/consultants/{{consultant.id}}',
                },
              },
              {
                id: 'move-up',
                label: 'Move Up',
                icon: 'ChevronUp',
                type: 'mutation',
                config: {
                  type: 'mutation',
                  procedure: 'bench.hotlists.moveConsultantUp',
                  input: { hotlistId: fieldValue('id'), consultantId: '{{consultant.id}}' },
                },
              },
              {
                id: 'move-down',
                label: 'Move Down',
                icon: 'ChevronDown',
                type: 'mutation',
                config: {
                  type: 'mutation',
                  procedure: 'bench.hotlists.moveConsultantDown',
                  input: { hotlistId: fieldValue('id'), consultantId: '{{consultant.id}}' },
                },
              },
              {
                id: 'remove',
                label: 'Remove',
                icon: 'X',
                type: 'mutation',
                variant: 'destructive',
                config: {
                  type: 'mutation',
                  procedure: 'bench.hotlists.removeConsultant',
                  input: { hotlistId: fieldValue('id'), consultantId: '{{consultant.id}}' },
                },
                confirm: {
                  title: 'Remove Consultant',
                  message: 'Remove this consultant from the hotlist?',
                  confirmLabel: 'Remove',
                  destructive: true,
                },
              },
            ],
            emptyState: {
              title: 'No consultants yet',
              message: 'Add consultants to this hotlist to start marketing.',
              action: {
                label: 'Add Consultant',
                handler: 'handleAddConsultant',
              },
            },
          },
        ],
      },

      // Send History Tab
      {
        id: 'history',
        label: 'Send History',
        icon: 'History',
        badge: fieldValue('timesShared'),
        lazy: true,
        sections: [
          {
            id: 'send-history-table',
            type: 'table',
            title: 'Send History',
            columns_config: sendHistoryColumns,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'bench.hotlists.getSendHistory',
                params: { hotlistId: fieldValue('id') },
              },
            },
            emptyState: {
              title: 'No send history',
              message: 'This hotlist has not been sent yet.',
            },
          },
        ],
      },
    ],
  },

  // Actions
  actions: [
    {
      id: 'send',
      label: 'Send Hotlist',
      type: 'modal',
      variant: 'primary',
      icon: 'Send',
      config: {
        type: 'modal',
        modal: 'SendHotlistModal',
        props: { hotlistId: fieldValue('id') },
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      type: 'navigate',
      variant: 'secondary',
      icon: 'Pencil',
      config: {
        type: 'navigate',
        route: '/employee/bench/hotlists/{{id}}/edit',
      },
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      type: 'mutation',
      variant: 'secondary',
      icon: 'Copy',
      config: {
        type: 'mutation',
        procedure: 'bench.hotlists.duplicate',
        input: { id: fieldValue('id') },
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/bench/hotlists/{{id}}',
        toast: { message: 'Hotlist duplicated successfully' },
      },
    },
    {
      id: 'archive',
      label: 'Archive',
      type: 'mutation',
      variant: 'secondary',
      icon: 'Archive',
      config: {
        type: 'mutation',
        procedure: 'bench.hotlists.archive',
        input: { id: fieldValue('id') },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'active' },
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      type: 'mutation',
      variant: 'destructive',
      icon: 'Trash2',
      config: {
        type: 'mutation',
        procedure: 'bench.hotlists.delete',
        input: { id: fieldValue('id') },
      },
      confirm: {
        title: 'Delete Hotlist',
        message: 'Are you sure you want to delete this hotlist? This action cannot be undone.',
        confirmLabel: 'Delete',
        destructive: true,
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/bench/hotlists',
        toast: { message: 'Hotlist deleted successfully' },
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Hotlists',
      route: '/employee/bench/hotlists',
    },
    breadcrumbs: [
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Hotlists', route: '/employee/bench/hotlists' },
      { label: fieldValue('name') },
    ],
  },
};

export default hotlistDetailScreen;
