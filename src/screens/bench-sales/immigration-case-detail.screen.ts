/**
 * Immigration Case Detail Screen
 *
 * Detailed view of a single immigration case with:
 * - Case header with status
 * - Timeline with milestones
 * - Documents section
 * - Notes/RFE responses
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/08-track-immigration.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const CASE_STATUS_OPTIONS = [
  { value: 'pending_filing', label: 'Pending Filing' },
  { value: 'filed', label: 'Filed' },
  { value: 'receipt_received', label: 'Receipt Received' },
  { value: 'rfe_received', label: 'RFE Received' },
  { value: 'rfe_responded', label: 'RFE Responded' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

// ==========================================
// SIDEBAR FIELDS
// ==========================================

const sidebarFields: import('@/lib/metadata/types').FieldDefinition[] = [
  {
    id: 'alertLevel',
    label: 'Alert Level',
    type: 'custom',
    path: 'alertLevel',
    config: { component: 'VisaAlertBadge' },
  },
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    path: 'status',
    config: {
      options: CASE_STATUS_OPTIONS,
      badgeColors: {
        pending_filing: 'gray',
        filed: 'blue',
        receipt_received: 'blue',
        rfe_received: 'orange',
        rfe_responded: 'yellow',
        approved: 'green',
        denied: 'red',
        withdrawn: 'gray',
      },
    },
  },
  {
    id: 'caseType',
    label: 'Case Type',
    type: 'text',
    path: 'caseTypeLabel',
  },
  {
    id: 'receiptNumber',
    label: 'Receipt Number',
    type: 'text',
    path: 'receiptNumber',
    config: { copyable: true },
  },
  {
    id: 'priorityDate',
    label: 'Priority Date',
    type: 'date',
    path: 'priorityDate',
  },
  {
    id: 'expiryDate',
    label: 'Expiry Date',
    type: 'date',
    path: 'expiryDate',
    config: { warnIfWithin: 90, criticalIfWithin: 30 },
  },
  {
    id: 'daysRemaining',
    label: 'Days Remaining',
    type: 'number',
    path: 'daysRemaining',
  },
  {
    id: 'attorney',
    label: 'Attorney',
    type: 'text',
    path: 'attorney.name',
  },
  {
    id: 'attorneyEmail',
    label: 'Attorney Email',
    type: 'email',
    path: 'attorney.email',
  },
  {
    id: 'createdAt',
    label: 'Case Created',
    type: 'date',
    path: 'createdAt',
    config: { format: 'relative' },
  },
];

// ==========================================
// MILESTONE COLUMNS
// ==========================================

const milestoneColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'date',
    label: 'Date',
    path: 'date',
    type: 'date',
    sortable: true,
    width: '120px',
  },
  {
    id: 'milestone',
    label: 'Milestone',
    path: 'milestone',
    type: 'text',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      badgeColors: {
        completed: 'green',
        pending: 'yellow',
        upcoming: 'gray',
      },
    },
  },
  {
    id: 'notes',
    label: 'Notes',
    path: 'notes',
    type: 'text',
  },
  {
    id: 'addedBy',
    label: 'Added By',
    path: 'addedBy.fullName',
    type: 'text',
  },
];

// ==========================================
// DOCUMENT COLUMNS
// ==========================================

const documentColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'icon',
    label: '',
    path: 'fileType',
    type: 'file-icon',
    width: '40px',
  },
  {
    id: 'name',
    label: 'Document',
    path: 'name',
    type: 'text',
  },
  {
    id: 'type',
    label: 'Type',
    path: 'documentType',
    type: 'enum',
  },
  {
    id: 'uploadedAt',
    label: 'Uploaded',
    path: 'uploadedAt',
    type: 'date',
    config: { format: 'relative' },
  },
  {
    id: 'uploadedBy',
    label: 'By',
    path: 'uploadedBy.fullName',
    type: 'text',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const immigrationCaseDetailScreen: ScreenDefinition = {
  id: 'immigration-case-detail',
  type: 'detail',
  entityType: 'immigration_case',

  title: { type: 'field', path: 'caseTypeLabel' },
  subtitle: { type: 'field', path: 'consultant.fullName' },
  icon: 'Globe',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'bench.immigration.getCaseById',
      params: { id: fieldValue('id') },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',

    sidebar: {
      id: 'case-sidebar',
      type: 'info-card',
      title: 'Case Info',
      fields: sidebarFields,
      actions: [
        {
          id: 'contact-attorney',
          label: 'Contact Attorney',
          type: 'modal',
          icon: 'Mail',
          variant: 'ghost',
          size: 'sm',
          config: { type: 'modal', modal: 'contact-attorney', props: { attorneyId: fieldValue('attorneyId') } },
        },
      ],
    },

    tabs: [
      // Overview Tab
      {
        id: 'overview',
        label: 'Overview',
        icon: 'FileText',
        sections: [
          // Consultant Info
          {
            id: 'consultant-info',
            type: 'info-card',
            title: 'Consultant',
            icon: 'User',
            columns: 2,
            fields: [
              { id: 'name', label: 'Name', type: 'text', path: 'consultant.fullName' },
              { id: 'currentVisa', label: 'Current Visa', type: 'enum', path: 'consultant.visaStatus' },
              { id: 'email', label: 'Email', type: 'email', path: 'consultant.email' },
              { id: 'phone', label: 'Phone', type: 'phone', path: 'consultant.phone' },
            ],
            actions: [
              {
                id: 'view-consultant',
                label: 'View Profile',
                type: 'navigate',
                icon: 'ExternalLink',
                variant: 'ghost',
                config: { type: 'navigate', route: '/employee/workspace/bench/consultants/{{consultantId}}' },
              },
            ],
          },

          // Case Details
          {
            id: 'case-details',
            type: 'field-grid',
            title: 'Case Details',
            icon: 'Info',
            columns: 2,
            editable: true,
            fields: [
              {
                id: 'caseType',
                label: 'Case Type',
                type: 'select',
                path: 'caseType',
                editable: false,
              },
              {
                id: 'status',
                label: 'Status',
                type: 'select',
                path: 'status',
                options: CASE_STATUS_OPTIONS,
              },
              {
                id: 'receiptNumber',
                label: 'Receipt Number',
                type: 'text',
                path: 'receiptNumber',
                editable: true,
              },
              {
                id: 'priorityDate',
                label: 'Priority Date',
                type: 'date',
                path: 'priorityDate',
                editable: true,
              },
              {
                id: 'filingDate',
                label: 'Filing Date',
                type: 'date',
                path: 'filingDate',
                editable: true,
              },
              {
                id: 'approvalDate',
                label: 'Approval Date',
                type: 'date',
                path: 'approvalDate',
                editable: true,
              },
              {
                id: 'expiryDate',
                label: 'Expiry Date',
                type: 'date',
                path: 'expiryDate',
                editable: true,
              },
              {
                id: 'processingCenter',
                label: 'Processing Center',
                type: 'text',
                path: 'processingCenter',
                editable: true,
              },
            ],
          },

          // Notes
          {
            id: 'case-notes',
            type: 'form',
            title: 'Notes',
            icon: 'StickyNote',
            collapsible: true,
            fields: [
              {
                id: 'notes',
                type: 'textarea',
                path: 'notes',
                config: { rows: 4 },
                editable: true,
              },
            ],
          },
        ],
      },

      // Timeline Tab
      {
        id: 'timeline',
        label: 'Timeline',
        icon: 'Clock',
        sections: [
          // Visual Timeline
          {
            id: 'milestone-timeline',
            type: 'custom',
            component: 'ImmigrationTimeline',
            componentProps: {
              milestones: [
                { id: 'filing', label: 'Filing', dateField: 'filingDate' },
                { id: 'receipt', label: 'Receipt', dateField: 'receiptDate' },
                { id: 'rfe', label: 'RFE', dateField: 'rfeDate', optional: true },
                { id: 'rfeResponse', label: 'RFE Response', dateField: 'rfeResponseDate', optional: true },
                { id: 'decision', label: 'Decision', dateField: 'decisionDate' },
                { id: 'approval', label: 'Approval', dateField: 'approvalDate' },
              ],
              showCurrent: true,
            },
          },

          // Milestones Table
          {
            id: 'milestones-table',
            type: 'table',
            title: 'Milestones',
            columns_config: milestoneColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.immigration.getCaseMilestones',
                params: { caseId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'add-milestone',
                label: 'Add Milestone',
                type: 'modal',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'add-case-milestone', props: { caseId: fieldValue('id') } },
              },
            ],
            rowActions: [
              {
                id: 'edit',
                label: 'Edit',
                icon: 'Edit',
                type: 'modal',
                config: { type: 'modal', modal: 'edit-milestone', props: { milestoneId: '{{id}}' } },
              },
              {
                id: 'delete',
                label: 'Delete',
                icon: 'Trash',
                type: 'mutation',
                variant: 'destructive',
                config: {
                  type: 'mutation',
                  procedure: 'bench.immigration.deleteMilestone',
                  input: { id: '{{id}}' },
                },
                confirm: {
                  title: 'Delete Milestone',
                  message: 'Are you sure?',
                  destructive: true,
                },
              },
            ],
          },
        ],
      },

      // Documents Tab
      {
        id: 'documents',
        label: 'Documents',
        icon: 'Files',
        badge: { type: 'count', path: 'documentCount' },
        sections: [
          {
            id: 'documents-table',
            type: 'table',
            title: 'Case Documents',
            columns_config: documentColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.immigration.getCaseDocuments',
                params: { caseId: fieldValue('id') },
              },
            },
            actions: [
              {
                id: 'upload',
                label: 'Upload Document',
                type: 'modal',
                icon: 'Upload',
                variant: 'primary',
                config: { type: 'modal', modal: 'upload-case-document', props: { caseId: fieldValue('id') } },
              },
            ],
            rowActions: [
              {
                id: 'download',
                label: 'Download',
                icon: 'Download',
                type: 'download',
                config: { type: 'download', url: '{{downloadUrl}}', filename: '{{name}}' },
              },
              {
                id: 'preview',
                label: 'Preview',
                icon: 'Eye',
                type: 'modal',
                config: { type: 'modal', modal: 'document-preview', props: { documentId: '{{id}}' } },
              },
              {
                id: 'delete',
                label: 'Delete',
                icon: 'Trash',
                type: 'mutation',
                variant: 'destructive',
                config: {
                  type: 'mutation',
                  procedure: 'bench.immigration.deleteDocument',
                  input: { id: '{{id}}' },
                },
                confirm: {
                  title: 'Delete Document',
                  message: 'Are you sure?',
                  destructive: true,
                },
              },
            ],
          },
        ],
      },

      // RFE Tab (visible only if RFE received)
      {
        id: 'rfe',
        label: 'RFE',
        icon: 'AlertCircle',
        visible: {
          type: 'condition',
          condition: { field: 'rfeReceived', operator: 'eq', value: true },
        },
        sections: [
          {
            id: 'rfe-details',
            type: 'field-grid',
            title: 'RFE Details',
            columns: 2,
            editable: true,
            fields: [
              { id: 'rfeDate', label: 'RFE Received', type: 'date', path: 'rfeDate' },
              { id: 'rfeDeadline', label: 'Response Deadline', type: 'date', path: 'rfeDeadline', config: { warnIfWithin: 30 } },
              { id: 'rfeCategory', label: 'RFE Category', type: 'text', path: 'rfeCategory' },
              { id: 'rfeResponseDate', label: 'Response Sent', type: 'date', path: 'rfeResponseDate' },
            ],
          },
          {
            id: 'rfe-description',
            type: 'form',
            title: 'RFE Description',
            fields: [
              { id: 'rfeDescription', type: 'textarea', path: 'rfeDescription', config: { rows: 4 }, editable: true },
            ],
          },
          {
            id: 'rfe-response',
            type: 'form',
            title: 'Response Notes',
            fields: [
              { id: 'rfeResponseNotes', type: 'textarea', path: 'rfeResponseNotes', config: { rows: 4 }, editable: true },
            ],
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
            id: 'activity-timeline',
            type: 'timeline',
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.immigration.getCaseActivity',
                params: { caseId: fieldValue('id') },
              },
            },
            config: {
              showEvents: true,
              showNotes: true,
              groupByDate: true,
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'update-status',
      label: 'Update Status',
      type: 'modal',
      icon: 'RefreshCw',
      variant: 'primary',
      config: { type: 'modal', modal: 'update-case-status', props: { caseId: fieldValue('id') } },
    },
    {
      id: 'add-milestone',
      label: 'Add Milestone',
      type: 'modal',
      icon: 'Plus',
      variant: 'default',
      config: { type: 'modal', modal: 'add-case-milestone', props: { caseId: fieldValue('id') } },
    },
    {
      id: 'upload-document',
      label: 'Upload Document',
      type: 'modal',
      icon: 'Upload',
      variant: 'default',
      config: { type: 'modal', modal: 'upload-case-document', props: { caseId: fieldValue('id') } },
    },
    {
      id: 'log-rfe',
      label: 'Log RFE',
      type: 'modal',
      icon: 'AlertCircle',
      variant: 'default',
      config: { type: 'modal', modal: 'log-case-rfe', props: { caseId: fieldValue('id') } },
      visible: {
        type: 'condition',
        condition: { field: 'rfeReceived', operator: 'neq', value: true },
      },
    },
    {
      id: 'close-case',
      label: 'Close Case',
      type: 'mutation',
      icon: 'X',
      variant: 'ghost',
      config: {
        type: 'mutation',
        procedure: 'bench.immigration.closeCase',
        input: { id: fieldValue('id') },
      },
      confirm: {
        title: 'Close Case',
        message: 'Are you sure you want to close this case?',
        confirmLabel: 'Close',
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'nin', value: ['approved', 'denied', 'withdrawn'] },
      },
    },
  ],

  navigation: {
    back: {
      label: 'Back to Immigration',
      route: '/employee/workspace/bench/immigration',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/workspace/bench' },
      { label: 'Immigration', route: '/employee/workspace/bench/immigration' },
      { label: { type: 'field', path: 'consultant.fullName' }, active: true },
    ],
  },
};

export default immigrationCaseDetailScreen;
