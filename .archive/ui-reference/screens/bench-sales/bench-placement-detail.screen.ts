/**
 * Bench Placement Detail Screen
 *
 * Detailed view of a single placement with:
 * - Contract details, rates (C2C/W2/1099 breakdown)
 * - 30/60/90 day check-in tracker
 * - Extension history
 * - Commission tracking with custom vendor terms
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';
import { fieldValue } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const PLACEMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Start' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
];

// ==========================================
// SIDEBAR FIELDS
// ==========================================

const sidebarFields: import('@/lib/metadata/types').FieldDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    path: 'status',
    config: {
      options: PLACEMENT_STATUS_OPTIONS,
      badgeColors: {
        pending: 'yellow',
        active: 'green',
        on_hold: 'orange',
        completed: 'blue',
        terminated: 'red',
      },
    },
  },
  {
    id: 'contractType',
    label: 'Contract Type',
    type: 'enum',
    path: 'contractType',
  },
  {
    id: 'billRate',
    label: 'Bill Rate',
    type: 'currency',
    path: 'billRate',
    config: { suffix: '/hr' },
  },
  {
    id: 'payRate',
    label: 'Pay Rate',
    type: 'currency',
    path: 'payRate',
    config: { suffix: '/hr' },
  },
  {
    id: 'margin',
    label: 'Margin',
    type: 'currency',
    path: 'margin',
    config: { suffix: '/hr' },
  },
  {
    id: 'marginPercent',
    label: 'Margin %',
    type: 'number',
    path: 'marginPercent',
    config: { suffix: '%' },
  },
  {
    id: 'startDate',
    label: 'Start Date',
    type: 'date',
    path: 'startDate',
  },
  {
    id: 'endDate',
    label: 'End Date',
    type: 'date',
    path: 'endDate',
  },
  {
    id: 'daysActive',
    label: 'Days Active',
    type: 'number',
    path: 'daysActive',
  },
  {
    id: 'owner',
    label: 'Placed By',
    type: 'text',
    path: 'owner.fullName',
  },
];

// ==========================================
// CHECK-IN COLUMNS
// ==========================================

const checkInColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'type',
    label: 'Check-in',
    path: 'type',
    type: 'text',
    width: '100px',
  },
  {
    id: 'dueDate',
    label: 'Due Date',
    path: 'dueDate',
    type: 'date',
  },
  {
    id: 'completedDate',
    label: 'Completed',
    path: 'completedDate',
    type: 'date',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      badgeColors: {
        pending: 'yellow',
        completed: 'green',
        overdue: 'red',
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
    id: 'completedBy',
    label: 'By',
    path: 'completedBy.fullName',
    type: 'text',
  },
];

// ==========================================
// EXTENSION COLUMNS
// ==========================================

const extensionColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'requestedDate',
    label: 'Requested',
    path: 'requestedDate',
    type: 'date',
    sortable: true,
  },
  {
    id: 'previousEndDate',
    label: 'Previous End',
    path: 'previousEndDate',
    type: 'date',
  },
  {
    id: 'newEndDate',
    label: 'New End',
    path: 'newEndDate',
    type: 'date',
  },
  {
    id: 'rateChange',
    label: 'Rate Change',
    path: 'rateChange',
    type: 'currency',
    config: { suffix: '/hr', showSign: true },
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      badgeColors: {
        pending: 'yellow',
        approved: 'green',
        rejected: 'red',
      },
    },
  },
  {
    id: 'approvedBy',
    label: 'Approved By',
    path: 'approvedBy.fullName',
    type: 'text',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const benchPlacementDetailScreen: ScreenDefinition = {
  id: 'bench-placement-detail',
  type: 'detail',
  entityType: 'placement',

  title: { type: 'field', path: 'consultant.fullName' },
  subtitle: { type: 'field', path: 'role' },
  icon: 'UserCheck',

  dataSource: {
    type: 'entity',
    entityType: 'placement',
    entityId: fieldValue('id'),
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'right',

    sidebar: {
      id: 'placement-sidebar',
      type: 'info-card',
      title: 'Placement Info',
      fields: sidebarFields,
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
              { id: 'visa', label: 'Visa', type: 'enum', path: 'consultant.visaStatus' },
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
                config: { type: 'navigate', route: '/employee/bench/consultants/{{consultantId}}' },
              },
            ],
          },

          // Contract Details
          {
            id: 'contract-details',
            type: 'field-grid',
            title: 'Contract Details',
            icon: 'FileText',
            columns: 2,
            editable: true,
            fields: [
              { id: 'vendor', label: 'Vendor', type: 'text', path: 'vendor.name', editable: false },
              { id: 'client', label: 'End Client', type: 'text', path: 'clientName', editable: true },
              { id: 'role', label: 'Role', type: 'text', path: 'role', editable: true },
              { id: 'workMode', label: 'Work Mode', type: 'enum', path: 'workMode', editable: true },
              { id: 'location', label: 'Work Location', type: 'text', path: 'workLocation', editable: true },
              { id: 'contractType', label: 'Contract Type', type: 'enum', path: 'contractType', editable: false },
              { id: 'startDate', label: 'Start Date', type: 'date', path: 'startDate', editable: true },
              { id: 'endDate', label: 'End Date', type: 'date', path: 'endDate', editable: true },
            ],
          },

          // Rate Stack (per spec Section 8.6 & 8.7)
          {
            id: 'rate-stack',
            type: 'custom',
            title: 'Rate Breakdown',
            icon: 'DollarSign',
            component: 'PlacementRateStack',
            componentProps: {
              showAllRates: true,
              format: 'detailed',
              // Per spec: show C2C/W2/1099 breakdown
              rateTypes: ['c2c', 'w2', '1099'],
              fields: {
                clientBillRate: 'billRate',
                vendorMarkup: 'vendorMarkup',
                vendorMarkupPercent: 'vendorMarkupPercent',
                intimeMargin: 'margin',
                marginPercent: 'marginPercent',
                consultantPayRate: 'payRate',
              },
            },
          },

          // Vendor Info
          {
            id: 'vendor-info',
            type: 'info-card',
            title: 'Vendor Details',
            icon: 'Building2',
            collapsible: true,
            defaultExpanded: false,
            fields: [
              { id: 'vendorName', label: 'Vendor', type: 'text', path: 'vendor.name' },
              { id: 'vendorContact', label: 'Contact', type: 'text', path: 'vendor.primaryContact.fullName' },
              { id: 'vendorEmail', label: 'Email', type: 'email', path: 'vendor.primaryContact.email' },
              { id: 'vendorPhone', label: 'Phone', type: 'phone', path: 'vendor.primaryContact.phone' },
              { id: 'paymentTerms', label: 'Payment Terms', type: 'text', path: 'vendor.paymentTerms' },
            ],
            actions: [
              {
                id: 'view-vendor',
                label: 'View Vendor',
                type: 'navigate',
                icon: 'ExternalLink',
                variant: 'ghost',
                config: { type: 'navigate', route: '/employee/bench/vendors/{{vendorId}}' },
              },
            ],
          },
        ],
      },

      // Check-ins Tab
      {
        id: 'check-ins',
        label: 'Check-ins',
        icon: 'CheckCircle',
        badge: { type: 'field', path: 'checkInsDue' },
        sections: [
          // Check-in Progress
          {
            id: 'check-in-progress',
            type: 'custom',
            component: 'CheckInProgressTracker',
            componentProps: {
              checkIns: ['30-day', '60-day', '90-day'],
              showTimeline: true,
            },
          },

          // Check-ins Table
          {
            id: 'check-ins-table',
            type: 'table',
            title: 'Check-in History',
            columns_config: checkInColumns,
            dataSource: {
              type: 'related',
              relation: 'checkIns',
            },
            actions: [
              {
                id: 'record-check-in',
                label: 'Record Check-in',
                type: 'modal',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'placement-check-in', props: { placementId: fieldValue('id') } },
              },
            ],
          },
        ],
      },

      // Extensions Tab
      {
        id: 'extensions',
        label: 'Extensions',
        icon: 'Calendar',
        badge: { type: 'field', path: 'extensionCount' },
        lazy: true,
        sections: [
          {
            id: 'extensions-table',
            type: 'table',
            title: 'Extension History',
            columns_config: extensionColumns,
            dataSource: {
              type: 'related',
              relation: 'extensions',
            },
            actions: [
              {
                id: 'request-extension',
                label: 'Request Extension',
                type: 'modal',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'placement-extension', props: { placementId: fieldValue('id') } },
              },
              {
                id: 'view',
                label: 'View Details',
                icon: 'Eye',
                type: 'modal',
                config: { type: 'modal', modal: 'view-extension', props: { extensionId: { type: 'field', path: 'id' } } },
              },
            ],
            emptyState: {
              title: 'No extensions',
              description: 'Extension history will appear here',
            },
          },
        ],
      },

      // Commission Tab
      {
        id: 'commission',
        label: 'Commission',
        icon: 'DollarSign',
        lazy: true,
        sections: [
          // Commission Summary
          {
            id: 'commission-summary',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              {
                id: 'totalEarned',
                label: 'Total Earned',
                type: 'currency',
                path: 'commission.totalEarned',
              },
              {
                id: 'pendingPayout',
                label: 'Pending Payout',
                type: 'currency',
                path: 'commission.pendingPayout',
              },
              {
                id: 'paidToDate',
                label: 'Paid to Date',
                type: 'currency',
                path: 'commission.paidToDate',
              },
              {
                id: 'projectedTotal',
                label: 'Projected Total',
                type: 'currency',
                path: 'commission.projectedTotal',
              },
            ],
          },

          // Commission Terms (per vendor - custom terms)
          {
            id: 'commission-terms',
            type: 'info-card',
            title: 'Commission Terms',
            description: 'Note: Terms are custom per vendor - no standard percentages',
            fields: [
              { id: 'vendorMarkupType', label: 'Markup Type', type: 'text', path: 'commission.markupType' },
              { id: 'vendorMarkupValue', label: 'Markup Value', type: 'text', path: 'commission.markupValue' },
              { id: 'paymentTerms', label: 'Payment Terms', type: 'text', path: 'vendor.paymentTerms' },
              { id: 'commissionNotes', label: 'Notes', type: 'text', path: 'commission.notes' },
            ],
          },

          // Payment History
          {
            id: 'commission-history',
            type: 'table',
            title: 'Payment History',
            columns_config: [
              { id: 'period', label: 'Period', path: 'period', type: 'text' },
              { id: 'hoursWorked', label: 'Hours', path: 'hoursWorked', type: 'number' },
              { id: 'grossRevenue', label: 'Gross Revenue', path: 'grossRevenue', type: 'currency' },
              { id: 'commission', label: 'Commission', path: 'commission', type: 'currency' },
              { id: 'status', label: 'Status', path: 'status', type: 'enum' },
              { id: 'paidDate', label: 'Paid', path: 'paidDate', type: 'date' },
            ],
            dataSource: {
              type: 'related',
              relation: 'commissionHistory',
            },
          },
        ],
      },

      // Timesheets Tab
      {
        id: 'timesheets',
        label: 'Timesheets',
        icon: 'Clock',
        lazy: true,
        sections: [
          {
            id: 'timesheets-table',
            type: 'table',
            title: 'Timesheet History',
            columns_config: [
              { id: 'weekEnding', label: 'Week Ending', path: 'weekEnding', type: 'date', sortable: true },
              { id: 'hoursWorked', label: 'Hours', path: 'hoursWorked', type: 'number' },
              { id: 'regularHours', label: 'Regular', path: 'regularHours', type: 'number' },
              { id: 'overtimeHours', label: 'OT', path: 'overtimeHours', type: 'number' },
              { id: 'status', label: 'Status', path: 'status', type: 'enum' },
              { id: 'submittedAt', label: 'Submitted', path: 'submittedAt', type: 'date' },
              { id: 'approvedAt', label: 'Approved', path: 'approvedAt', type: 'date' },
            ],
            dataSource: {
              type: 'related',
              relation: 'timesheets',
            },
            emptyState: {
              title: 'No timesheets',
              description: 'Timesheets will appear here when submitted',
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
            id: 'activity-timeline',
            type: 'timeline',
            dataSource: {
              type: 'related',
              relation: 'activities',
            },
            config: {
              showEvents: true,
              showNotes: true,
              groupByDate: true,
              allowQuickLog: true,
              quickLogTypes: ['call', 'email', 'meeting', 'note'],
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'record-check-in',
      label: 'Record Check-in',
      type: 'modal',
      icon: 'CheckCircle',
      variant: 'primary',
      config: { type: 'modal', modal: 'placement-check-in', props: { placementId: fieldValue('id') } },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'active' },
      },
    },
    {
      id: 'request-extension',
      label: 'Request Extension',
      type: 'modal',
      icon: 'Calendar',
      variant: 'default',
      config: { type: 'modal', modal: 'placement-extension', props: { placementId: fieldValue('id') } },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'active' },
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      type: 'navigate',
      icon: 'Edit',
      variant: 'default',
      config: { type: 'navigate', route: { type: 'template', path: '/employee/bench/placements/{{id}}/edit' } },
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      type: 'modal',
      icon: 'Plus',
      variant: 'ghost',
      config: { type: 'modal', modal: 'log-activity', props: { entityType: { type: 'static', default: 'placement' }, entityId: fieldValue('id') } },
    },
    {
      id: 'end-placement',
      label: 'End Placement',
      type: 'modal',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'modal', modal: 'end-placement', props: { placementId: fieldValue('id') } },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'active' },
      },
    },
  ],

  navigation: {
    back: {
      label: 'Back to Placements',
      route: '/employee/bench/placements',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Placements', route: '/employee/bench/placements' },
      { label: { type: 'field', path: 'consultant.fullName' }, active: true },
    ],
  },
};

export default benchPlacementDetailScreen;
