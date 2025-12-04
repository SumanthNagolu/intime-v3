/**
 * Vendor Detail Screen Definition
 *
 * Metadata-driven screen for viewing and managing a single Vendor.
 * Shows vendor details, contacts, job orders, and relationship history.
 */

import type { ScreenDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const VENDOR_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'blocked', label: 'Blocked' },
];

const VENDOR_TIER_OPTIONS = [
  { value: 'preferred', label: 'Preferred' },
  { value: 'standard', label: 'Standard' },
  { value: 'new', label: 'New' },
];

const VENDOR_TYPE_OPTIONS = [
  { value: 'direct_client', label: 'Direct Client' },
  { value: 'prime_vendor', label: 'Prime Vendor' },
  { value: 'tier_1', label: 'Tier 1' },
  { value: 'tier_2', label: 'Tier 2' },
  { value: 'implementation_partner', label: 'Implementation Partner' },
];

const JOB_ORDER_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'filled', label: 'Filled' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'closed', label: 'Closed' },
];

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
    id: 'tier',
    label: 'Tier',
    type: 'enum',
    path: 'tier',
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
    id: 'type',
    label: 'Type',
    type: 'enum',
    path: 'type',
    config: {
      options: VENDOR_TYPE_OPTIONS,
    },
  },
  {
    id: 'activeJobOrders',
    label: 'Active Job Orders',
    type: 'number',
    path: 'activeJobOrderCount',
  },
  {
    id: 'placements',
    label: 'Total Placements',
    type: 'number',
    path: 'placementCount',
  },
  {
    id: 'submissions',
    label: 'Total Submissions',
    type: 'number',
    path: 'submissionCount',
  },
  {
    id: 'owner',
    label: 'Account Owner',
    type: 'text',
    path: 'owner.fullName',
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
// VENDOR INFO FIELDS
// ==========================================

const vendorInfoFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'name',
    label: 'Vendor Name',
    type: 'text',
    path: 'name',
    required: true,
    editable: true,
    span: 2,
  },
  {
    id: 'type',
    label: 'Vendor Type',
    type: 'select',
    path: 'type',
    required: true,
    editable: true,
    options: VENDOR_TYPE_OPTIONS,
  },
  {
    id: 'tier',
    label: 'Tier',
    type: 'select',
    path: 'tier',
    editable: true,
    options: VENDOR_TIER_OPTIONS,
  },
  {
    id: 'website',
    label: 'Website',
    type: 'url',
    path: 'website',
    editable: true,
  },
  {
    id: 'industry',
    label: 'Industry',
    type: 'text',
    path: 'industry',
    editable: true,
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
// ADDRESS FIELDS
// ==========================================

const addressFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'street',
    label: 'Street',
    type: 'text',
    path: 'address.street',
    editable: true,
    span: 2,
  },
  {
    id: 'city',
    label: 'City',
    type: 'text',
    path: 'address.city',
    editable: true,
  },
  {
    id: 'state',
    label: 'State',
    type: 'text',
    path: 'address.state',
    editable: true,
  },
  {
    id: 'zip',
    label: 'ZIP Code',
    type: 'text',
    path: 'address.zip',
    editable: true,
  },
  {
    id: 'country',
    label: 'Country',
    type: 'text',
    path: 'address.country',
    editable: true,
  },
];

// ==========================================
// BILLING FIELDS
// ==========================================

const billingFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'paymentTerms',
    label: 'Payment Terms',
    type: 'text',
    path: 'paymentTerms',
    editable: true,
  },
  {
    id: 'defaultMarkup',
    label: 'Default Markup %',
    type: 'number',
    path: 'defaultMarkup',
    editable: true,
    config: { suffix: '%' },
  },
  {
    id: 'w9OnFile',
    label: 'W9 On File',
    type: 'boolean',
    path: 'w9OnFile',
    editable: true,
  },
  {
    id: 'msaOnFile',
    label: 'MSA On File',
    type: 'boolean',
    path: 'msaOnFile',
    editable: true,
  },
  {
    id: 'billingEmail',
    label: 'Billing Email',
    type: 'email',
    path: 'billingEmail',
    editable: true,
  },
  {
    id: 'taxId',
    label: 'Tax ID',
    type: 'text',
    path: 'taxId',
    editable: true,
  },
];

// ==========================================
// CONTACTS TABLE COLUMNS
// ==========================================

const contactsTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Name',
    path: 'fullName',
    type: 'text',
    width: '180px',
  },
  {
    id: 'title',
    label: 'Title',
    path: 'title',
    type: 'text',
  },
  {
    id: 'email',
    label: 'Email',
    path: 'email',
    type: 'email',
  },
  {
    id: 'phone',
    label: 'Phone',
    path: 'phone',
    type: 'phone',
  },
  {
    id: 'isPrimary',
    label: 'Primary',
    path: 'isPrimary',
    type: 'boolean',
    width: '80px',
  },
  {
    id: 'lastContact',
    label: 'Last Contact',
    path: 'lastContactAt',
    type: 'date',
    config: { format: 'relative' },
  },
];

// ==========================================
// JOB ORDERS TABLE COLUMNS
// ==========================================

const jobOrdersTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'title',
    label: 'Job Title',
    path: 'title',
    type: 'text',
    width: '200px',
  },
  {
    id: 'clientName',
    label: 'End Client',
    path: 'clientName',
    type: 'text',
  },
  {
    id: 'location',
    label: 'Location',
    path: 'location',
    type: 'text',
  },
  {
    id: 'billRate',
    label: 'Rate',
    path: 'billRate',
    type: 'currency',
    config: { suffix: '/hr' },
  },
  {
    id: 'submissions',
    label: 'Submissions',
    path: 'submissionCount',
    type: 'number',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: JOB_ORDER_STATUS_OPTIONS,
      badgeColors: {
        open: 'green',
        filled: 'purple',
        on_hold: 'yellow',
        closed: 'gray',
      },
    },
  },
  {
    id: 'postedAt',
    label: 'Posted',
    path: 'postedAt',
    type: 'date',
    config: { format: 'relative' },
  },
];

// ==========================================
// PLACEMENTS TABLE COLUMNS
// ==========================================

const placementsTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'consultant',
    label: 'Consultant',
    path: 'consultant.fullName',
    type: 'text',
    width: '180px',
  },
  {
    id: 'jobTitle',
    label: 'Job Title',
    path: 'jobOrder.title',
    type: 'text',
  },
  {
    id: 'clientName',
    label: 'End Client',
    path: 'clientName',
    type: 'text',
  },
  {
    id: 'billRate',
    label: 'Bill Rate',
    path: 'billRate',
    type: 'currency',
    config: { suffix: '/hr' },
  },
  {
    id: 'startDate',
    label: 'Start Date',
    path: 'startDate',
    type: 'date',
  },
  {
    id: 'endDate',
    label: 'End Date',
    path: 'endDate',
    type: 'date',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      badgeColors: {
        active: 'green',
        completed: 'blue',
        terminated: 'red',
      },
    },
  },
];

// ==========================================
// ACTIVITY LOG COLUMNS
// ==========================================

const activityLogColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'date',
    label: 'Date',
    path: 'createdAt',
    type: 'datetime',
    sortable: true,
  },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    config: {
      badgeColors: {
        email: 'blue',
        call: 'green',
        meeting: 'purple',
        note: 'gray',
      },
    },
  },
  {
    id: 'description',
    label: 'Description',
    path: 'description',
    type: 'text',
  },
  {
    id: 'user',
    label: 'By',
    path: 'user.fullName',
    type: 'text',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const vendorDetailScreen: ScreenDefinition = {
  id: 'vendor-detail',
  type: 'detail',
  entityType: 'vendor',

  title: fieldValue('name', 'Vendor Details'),
  subtitle: fieldValue('type'),
  icon: 'Building2',

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'bench.vendors.getById',
      params: { id: fieldValue('id') },
    },
  },

  // Sidebar + Tabs layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',

    sidebar: {
      id: 'vendor-sidebar',
      type: 'info-card',
      title: 'Vendor Info',
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
            id: 'vendor-info',
            type: 'field-grid',
            title: 'Vendor Details',
            icon: 'Building2',
            columns: 2,
            fields: vendorInfoFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'address',
            type: 'field-grid',
            title: 'Address',
            icon: 'MapPin',
            columns: 2,
            fields: addressFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'billing',
            type: 'field-grid',
            title: 'Billing & Terms',
            icon: 'CreditCard',
            columns: 2,
            fields: billingFields,
            editable: true,
            collapsible: true,
            defaultExpanded: false,
          },
        ],
      },

      // Contacts Tab
      {
        id: 'contacts',
        label: 'Contacts',
        icon: 'Users',
        sections: [
          {
            id: 'contacts-table',
            type: 'table',
            title: 'Vendor Contacts',
            columns_config: contactsTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.vendors.getContacts',
                params: { vendorId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-contact',
                label: 'Add Contact',
                type: 'modal',
                variant: 'primary',
                icon: 'Plus',
                config: {
                  type: 'modal',
                  modal: 'AddVendorContactModal',
                  props: { vendorId: fieldValue('id') },
                },
              },
            ],
            rowActions: [
              {
                id: 'edit',
                label: 'Edit',
                icon: 'Pencil',
                type: 'modal',
                config: {
                  type: 'modal',
                  modal: 'EditVendorContactModal',
                  props: { contactId: '{{id}}' },
                },
              },
              {
                id: 'set-primary',
                label: 'Set as Primary',
                icon: 'Star',
                type: 'mutation',
                config: {
                  type: 'mutation',
                  procedure: 'bench.vendors.setPrimaryContact',
                  input: { vendorId: fieldValue('id'), contactId: '{{id}}' },
                },
                visible: {
                  type: 'condition',
                  condition: { field: 'isPrimary', operator: 'eq', value: false },
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
                  procedure: 'bench.vendors.removeContact',
                  input: { contactId: '{{id}}' },
                },
                confirm: {
                  title: 'Remove Contact',
                  message: 'Remove this contact from the vendor?',
                  confirmLabel: 'Remove',
                  destructive: true,
                },
              },
            ],
            emptyState: {
              title: 'No contacts yet',
              message: 'Add contacts to track vendor relationships.',
              action: {
                label: 'Add Contact',
                type: 'custom',
                handler: 'handleAddContact',
              },
            },
          },
        ],
      },

      // Job Orders Tab
      {
        id: 'job-orders',
        label: 'Job Orders',
        icon: 'Briefcase',
        badge: fieldValue('activeJobOrderCount'),
        sections: [
          {
            id: 'job-orders-table',
            type: 'table',
            title: 'Job Orders',
            columns_config: jobOrdersTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.vendors.getJobOrders',
                params: { vendorId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-job-order',
                label: 'Add Job Order',
                type: 'navigate',
                variant: 'primary',
                icon: 'Plus',
                config: {
                  type: 'navigate',
                  route: '/employee/bench/job-orders/new?vendorId={{id}}',
                },
              },
            ],
            rowActions: [
              {
                id: 'view',
                label: 'View',
                icon: 'Eye',
                type: 'navigate',
                config: {
                  type: 'navigate',
                  route: '/employee/bench/job-orders/{{id}}',
                },
              },
              {
                id: 'submit-consultant',
                label: 'Submit Consultant',
                icon: 'UserPlus',
                type: 'modal',
                config: {
                  type: 'modal',
                  modal: 'SubmitConsultantModal',
                  props: { jobOrderId: '{{id}}' },
                },
              },
            ],
            emptyState: {
              title: 'No job orders',
              message: 'No job orders from this vendor yet.',
              action: {
                label: 'Add Job Order',
                type: 'custom',
                handler: 'handleAddJobOrder',
              },
            },
          },
        ],
      },

      // Placements Tab
      {
        id: 'placements',
        label: 'Placements',
        icon: 'UserCheck',
        badge: fieldValue('placementCount'),
        lazy: true,
        sections: [
          {
            id: 'placements-table',
            type: 'table',
            title: 'Consultant Placements',
            columns_config: placementsTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.vendors.getPlacements',
                params: { vendorId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'view',
                label: 'View Placement',
                icon: 'Eye',
                type: 'navigate',
                config: {
                  type: 'navigate',
                  route: '/employee/bench/placements/{{id}}',
                },
              },
            ],
            emptyState: {
              title: 'No placements yet',
              message: 'Placements through this vendor will appear here.',
            },
          },
        ],
      },

      // Activity Tab
      {
        id: 'activity',
        label: 'Activity',
        icon: 'Activity',
        lazy: true,
        sections: [
          {
            id: 'activity-log',
            type: 'table',
            title: 'Activity Log',
            columns_config: activityLogColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.vendors.getActivityLog',
                params: { vendorId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'log-activity',
                label: 'Log Activity',
                type: 'modal',
                variant: 'secondary',
                icon: 'Plus',
                config: {
                  type: 'modal',
                  modal: 'LogVendorActivityModal',
                  props: { vendorId: fieldValue('id') },
                },
              },
            ],
            emptyState: {
              title: 'No activity yet',
              message: 'Activity will be logged as you work with this vendor.',
            },
          },
        ],
      },
    ],
  },

  // Actions
  actions: [
    {
      id: 'add-job-order',
      label: 'Add Job Order',
      type: 'navigate',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'navigate',
        route: '/employee/bench/job-orders/new?vendorId={{id}}',
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
        route: '/employee/bench/vendors/{{id}}/edit',
      },
    },
    {
      id: 'log-call',
      label: 'Log Call',
      type: 'modal',
      variant: 'secondary',
      icon: 'Phone',
      config: {
        type: 'modal',
        modal: 'LogVendorCallModal',
        props: { vendorId: fieldValue('id') },
      },
    },
    {
      id: 'send-email',
      label: 'Send Email',
      type: 'modal',
      variant: 'secondary',
      icon: 'Mail',
      config: {
        type: 'modal',
        modal: 'SendVendorEmailModal',
        props: { vendorId: fieldValue('id') },
      },
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      type: 'mutation',
      variant: 'secondary',
      icon: 'Pause',
      config: {
        type: 'mutation',
        procedure: 'bench.vendors.deactivate',
        input: { id: fieldValue('id') },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'active' },
      },
    },
    {
      id: 'activate',
      label: 'Activate',
      type: 'mutation',
      variant: 'secondary',
      icon: 'Play',
      config: {
        type: 'mutation',
        procedure: 'bench.vendors.activate',
        input: { id: fieldValue('id') },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'inactive' },
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
        procedure: 'bench.vendors.delete',
        input: { id: fieldValue('id') },
      },
      confirm: {
        title: 'Delete Vendor',
        message:
          'Are you sure you want to delete this vendor? This action cannot be undone.',
        confirmLabel: 'Delete',
        destructive: true,
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/bench/vendors',
        toast: { message: 'Vendor deleted successfully' },
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Vendors',
      route: '/employee/bench/vendors',
    },
    breadcrumbs: [
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Vendors', route: '/employee/bench/vendors' },
      { label: fieldValue('name') },
    ],
  },
};

export default vendorDetailScreen;
