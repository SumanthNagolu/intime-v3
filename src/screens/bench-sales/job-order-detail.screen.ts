/**
 * Job Order Detail Screen Definition
 *
 * Metadata-driven screen for viewing and managing a single Job Order.
 * Shows job order details, submissions, and vendor information.
 */

import type { ScreenDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const JOB_ORDER_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'filled', label: 'Filled' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'closed', label: 'Closed' },
] as const;

const JOB_ORDER_PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
] as const;

const WORK_MODE_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
] as const;

const SUBMISSION_STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'vendor_review', label: 'Vendor Review' },
  { value: 'client_review', label: 'Client Review' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'placed', label: 'Placed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
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
    id: 'priority',
    label: 'Priority',
    type: 'enum',
    path: 'priority',
    config: {
      options: JOB_ORDER_PRIORITY_OPTIONS,
      badgeColors: {
        urgent: 'red',
        high: 'orange',
        normal: 'blue',
        low: 'gray',
      },
    },
  },
  {
    id: 'billRate',
    label: 'Bill Rate',
    type: 'currency',
    path: 'billRate',
    config: { suffix: '/hr' },
  },
  {
    id: 'positions',
    label: 'Positions',
    type: 'number',
    path: 'positions',
  },
  {
    id: 'submissionCount',
    label: 'Submissions',
    type: 'number',
    path: 'submissionCount',
  },
  {
    id: 'workMode',
    label: 'Work Mode',
    type: 'enum',
    path: 'workMode',
    config: {
      options: WORK_MODE_OPTIONS,
      badgeColors: {
        remote: 'green',
        hybrid: 'blue',
        onsite: 'purple',
      },
    },
  },
  {
    id: 'postedAt',
    label: 'Posted',
    type: 'date',
    path: 'postedAt',
    config: { format: 'relative' },
  },
  {
    id: 'closesAt',
    label: 'Closes',
    type: 'date',
    path: 'closesAt',
    config: { format: 'date' },
  },
];

// ==========================================
// JOB ORDER INFO FIELDS
// ==========================================

const jobOrderInfoFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'title',
    label: 'Job Title',
    type: 'text',
    path: 'title',
    required: true,
    editable: true,
    span: 2,
  },
  {
    id: 'clientName',
    label: 'End Client',
    type: 'text',
    path: 'clientName',
    editable: true,
  },
  {
    id: 'vendorId',
    label: 'Vendor',
    type: 'select',
    path: 'vendorId',
    required: true,
    editable: true,
    config: {
      entityType: 'vendor',
      displayField: 'name',
    },
  },
  {
    id: 'location',
    label: 'Location',
    type: 'text',
    path: 'location',
    editable: true,
  },
  {
    id: 'workMode',
    label: 'Work Mode',
    type: 'select',
    path: 'workMode',
    editable: true,
    options: WORK_MODE_OPTIONS,
  },
  {
    id: 'positions',
    label: 'Open Positions',
    type: 'number',
    path: 'positions',
    editable: true,
  },
  {
    id: 'duration',
    label: 'Duration',
    type: 'text',
    path: 'duration',
    editable: true,
    config: { placeholder: 'e.g., 6 months' },
  },
];

// ==========================================
// RATE & COMPENSATION FIELDS
// ==========================================

const rateFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'billRate',
    label: 'Bill Rate',
    type: 'currency',
    path: 'billRate',
    editable: true,
    config: { suffix: '/hr' },
  },
  {
    id: 'maxBillRate',
    label: 'Max Bill Rate',
    type: 'currency',
    path: 'maxBillRate',
    editable: true,
    config: { suffix: '/hr' },
  },
  {
    id: 'payRate',
    label: 'Target Pay Rate',
    type: 'currency',
    path: 'payRate',
    editable: true,
    config: { suffix: '/hr' },
  },
  {
    id: 'margin',
    label: 'Margin %',
    type: 'number',
    path: 'margin',
    editable: true,
    config: { suffix: '%' },
  },
];

// ==========================================
// REQUIREMENTS FIELDS
// ==========================================

const requirementsFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'skills',
    label: 'Required Skills',
    type: 'tags',
    path: 'skills',
    editable: true,
    span: 2,
  },
  {
    id: 'experience',
    label: 'Experience Required',
    type: 'text',
    path: 'experience',
    editable: true,
  },
  {
    id: 'visaRequirements',
    label: 'Visa Requirements',
    type: 'text',
    path: 'visaRequirements',
    editable: true,
  },
  {
    id: 'description',
    label: 'Job Description',
    type: 'textarea',
    path: 'description',
    editable: true,
    span: 2,
    config: { rows: 6 },
  },
  {
    id: 'notes',
    label: 'Internal Notes',
    type: 'textarea',
    path: 'notes',
    editable: true,
    span: 2,
    config: { rows: 3 },
  },
];

// ==========================================
// VENDOR CONTACT FIELDS
// ==========================================

const vendorContactFields: import('@/lib/metadata').FieldDefinition[] = [
  {
    id: 'vendorName',
    label: 'Vendor',
    type: 'text',
    path: 'vendor.name',
  },
  {
    id: 'vendorContact',
    label: 'Contact Name',
    type: 'text',
    path: 'vendorContactName',
  },
  {
    id: 'vendorEmail',
    label: 'Contact Email',
    type: 'email',
    path: 'vendorContactEmail',
  },
  {
    id: 'vendorPhone',
    label: 'Contact Phone',
    type: 'phone',
    path: 'vendorContactPhone',
  },
];

// ==========================================
// SUBMISSION TABLE COLUMNS
// ==========================================

const submissionTableColumns: import('@/lib/metadata').TableColumnDefinition[] = [
  {
    id: 'consultant',
    label: 'Consultant',
    path: 'consultant.fullName',
    type: 'text',
    width: '180px',
  },
  {
    id: 'title',
    label: 'Title',
    path: 'consultant.currentTitle',
    type: 'text',
  },
  {
    id: 'submittedRate',
    label: 'Submitted Rate',
    path: 'submittedRate',
    type: 'currency',
    config: { suffix: '/hr' },
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: SUBMISSION_STATUS_OPTIONS,
      badgeColors: {
        submitted: 'blue',
        vendor_review: 'yellow',
        client_review: 'orange',
        interview: 'purple',
        offer: 'green',
        placed: 'green',
        rejected: 'red',
        withdrawn: 'gray',
      },
    },
  },
  {
    id: 'submittedAt',
    label: 'Submitted',
    path: 'submittedAt',
    type: 'date',
    sortable: true,
    config: { format: 'relative' },
  },
  {
    id: 'submittedBy',
    label: 'Submitted By',
    path: 'submittedBy.fullName',
    type: 'text',
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
        note: 'gray',
        status_change: 'purple',
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

export const jobOrderDetailScreen: ScreenDefinition = {
  id: 'job-order-detail',
  type: 'detail',
  entityType: 'jobOrder',

  title: fieldValue('title', 'Job Order Details'),
  subtitle: fieldValue('clientName'),
  icon: 'Briefcase',

  // Data source
  dataSource: {
    type: 'query',
    query: {
      procedure: 'bench.jobOrders.getById',
      params: { id: fieldValue('id') },
    },
  },

  // Sidebar + Tabs layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',

    sidebar: {
      id: 'job-order-sidebar',
      type: 'info-card',
      title: 'Job Order Info',
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
            id: 'job-info',
            type: 'field-grid',
            title: 'Job Details',
            icon: 'Info',
            columns: 2,
            fields: jobOrderInfoFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'rates',
            type: 'field-grid',
            title: 'Rate & Compensation',
            icon: 'DollarSign',
            columns: 2,
            fields: rateFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
          {
            id: 'requirements',
            type: 'field-grid',
            title: 'Requirements',
            icon: 'ClipboardList',
            columns: 2,
            fields: requirementsFields,
            editable: true,
            collapsible: true,
            defaultExpanded: true,
          },
        ],
      },

      // Vendor Tab
      {
        id: 'vendor',
        label: 'Vendor',
        icon: 'Building2',
        sections: [
          {
            id: 'vendor-info',
            type: 'field-grid',
            title: 'Vendor Contact',
            icon: 'Contact',
            columns: 2,
            fields: vendorContactFields,
            collapsible: true,
            defaultExpanded: true,
          },
        ],
      },

      // Submissions Tab
      {
        id: 'submissions',
        label: 'Submissions',
        icon: 'Users',
        badge: fieldValue('submissionCount'),
        sections: [
          {
            id: 'submissions-table',
            type: 'table',
            title: 'Submitted Consultants',
            columns_config: submissionTableColumns,
            dataSource: {
              type: 'query',
              query: {
                procedure: 'bench.jobOrders.getSubmissions',
                params: { jobOrderId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'submit-consultant',
                label: 'Submit Consultant',
                type: 'modal',
                variant: 'primary',
                icon: 'UserPlus',
                config: {
                  type: 'modal',
                  modal: 'SubmitConsultantModal',
                  props: { jobOrderId: fieldValue('id') },
                },
              },
              {
                id: 'find-matches',
                label: 'Find Matches',
                type: 'modal',
                variant: 'secondary',
                icon: 'Search',
                config: {
                  type: 'modal',
                  modal: 'FindMatchingCandidatesModal',
                  props: { jobOrderId: fieldValue('id') },
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
                id: 'update-status',
                label: 'Update Status',
                icon: 'RefreshCw',
                type: 'modal',
                config: {
                  type: 'modal',
                  modal: 'UpdateSubmissionStatusModal',
                  props: { submissionId: '{{id}}' },
                },
              },
              {
                id: 'withdraw',
                label: 'Withdraw',
                icon: 'X',
                type: 'mutation',
                variant: 'destructive',
                config: {
                  type: 'mutation',
                  procedure: 'bench.submissions.withdraw',
                  input: { id: '{{id}}' },
                },
                confirm: {
                  title: 'Withdraw Submission',
                  message: 'Are you sure you want to withdraw this submission?',
                  confirmLabel: 'Withdraw',
                  destructive: true,
                },
                visible: {
                  type: 'condition',
                  condition: {
                    field: 'status',
                    operator: 'in',
                    value: ['submitted', 'vendor_review', 'client_review'],
                  },
                },
              },
            ],
            emptyState: {
              title: 'No submissions yet',
              message: 'Submit consultants to this job order to start tracking.',
              action: {
                label: 'Submit Consultant',
                handler: 'handleSubmitConsultant',
              },
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
              type: 'query',
              query: {
                procedure: 'bench.jobOrders.getActivityLog',
                params: { jobOrderId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-note',
                label: 'Add Note',
                type: 'modal',
                variant: 'secondary',
                icon: 'Plus',
                config: {
                  type: 'modal',
                  modal: 'AddActivityNoteModal',
                  props: { jobOrderId: fieldValue('id') },
                },
              },
            ],
            emptyState: {
              title: 'No activity yet',
              message: 'Activity will be logged as you work on this job order.',
            },
          },
        ],
      },
    ],
  },

  // Actions
  actions: [
    {
      id: 'submit-consultant',
      label: 'Submit Consultant',
      type: 'modal',
      variant: 'primary',
      icon: 'UserPlus',
      config: {
        type: 'modal',
        modal: 'SubmitConsultantModal',
        props: { jobOrderId: fieldValue('id') },
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
        route: '/employee/bench/job-orders/{{id}}/edit',
      },
    },
    {
      id: 'hold',
      label: 'Put On Hold',
      type: 'mutation',
      variant: 'secondary',
      icon: 'Pause',
      config: {
        type: 'mutation',
        procedure: 'bench.jobOrders.hold',
        input: { id: fieldValue('id') },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'open' },
      },
    },
    {
      id: 'reopen',
      label: 'Reopen',
      type: 'mutation',
      variant: 'secondary',
      icon: 'Play',
      config: {
        type: 'mutation',
        procedure: 'bench.jobOrders.reopen',
        input: { id: fieldValue('id') },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'on_hold' },
      },
    },
    {
      id: 'close',
      label: 'Close',
      type: 'mutation',
      variant: 'secondary',
      icon: 'X',
      config: {
        type: 'mutation',
        procedure: 'bench.jobOrders.close',
        input: { id: fieldValue('id') },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'in', value: ['open', 'on_hold'] },
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
        procedure: 'bench.jobOrders.delete',
        input: { id: fieldValue('id') },
      },
      confirm: {
        title: 'Delete Job Order',
        message:
          'Are you sure you want to delete this job order? This action cannot be undone.',
        confirmLabel: 'Delete',
        destructive: true,
      },
      onSuccess: {
        type: 'navigate',
        route: '/employee/bench/job-orders',
        toast: { message: 'Job order deleted successfully' },
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Job Orders',
      route: '/employee/bench/job-orders',
    },
    breadcrumbs: [
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Job Orders', route: '/employee/bench/job-orders' },
      { label: fieldValue('title') },
    ],
  },
};

export default jobOrderDetailScreen;
