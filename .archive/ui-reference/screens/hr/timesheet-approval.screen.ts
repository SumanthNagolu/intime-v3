/**
 * Timesheet Approval Screen Definition
 *
 * Metadata-driven screen for HR to review and approve employee timesheets.
 *
 * Per docs/specs/20-USER-ROLES/05-hr/05-time-and-attendance.md
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const TIMESHEET_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'revision_requested', label: 'Revision Requested' },
];

const PAY_PERIOD_TYPE_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'semimonthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const timesheetColumns: TableColumnDefinition[] = [
  {
    id: 'employee',
    label: 'Employee',
    path: 'employee.fullName',
    type: 'text',
    sortable: true,
    width: '200px',
    config: {
      avatar: { path: 'employee.avatarUrl', fallback: 'initials' },
      subtitle: { path: 'employee.department' },
    },
  },
  {
    id: 'payPeriod',
    label: 'Pay Period',
    path: 'payPeriodLabel',
    type: 'text',
    sortable: true,
  },
  {
    id: 'regularHours',
    label: 'Regular',
    path: 'regularHours',
    type: 'number',
    config: { suffix: ' hrs' },
  },
  {
    id: 'overtimeHours',
    label: 'Overtime',
    path: 'overtimeHours',
    type: 'number',
    config: { suffix: ' hrs' },
  },
  {
    id: 'totalHours',
    label: 'Total',
    path: 'totalHours',
    type: 'number',
    sortable: true,
    config: { suffix: ' hrs' },
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
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: TIMESHEET_STATUS_OPTIONS,
      badgeColors: {
        draft: 'gray',
        submitted: 'yellow',
        approved: 'green',
        rejected: 'red',
        revision_requested: 'orange',
      },
    },
  },
];

const dailyBreakdownColumns: TableColumnDefinition[] = [
  { id: 'date', label: 'Date', path: 'date', type: 'date', width: '120px' },
  { id: 'dayOfWeek', label: 'Day', path: 'dayOfWeek', type: 'text', width: '80px' },
  { id: 'clockIn', label: 'Clock In', path: 'clockIn', type: 'text' },
  { id: 'clockOut', label: 'Clock Out', path: 'clockOut', type: 'text' },
  { id: 'breakTime', label: 'Break', path: 'breakMinutes', type: 'number', config: { suffix: ' min' } },
  { id: 'regularHours', label: 'Regular', path: 'regularHours', type: 'number', config: { suffix: ' hrs' } },
  { id: 'overtimeHours', label: 'OT', path: 'overtimeHours', type: 'number', config: { suffix: ' hrs' } },
  { id: 'notes', label: 'Notes', path: 'notes', type: 'text' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const timesheetApprovalScreen: ScreenDefinition = {
  id: 'timesheet-approval',
  type: 'list',
  entityType: 'timesheet',

  title: 'Timesheet Approval',
  subtitle: 'Review and approve employee timesheets',
  icon: 'Clock',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'timesheet',
    filter: { status: 'submitted' },
    sort: { field: 'submittedAt', direction: 'asc' },
    pagination: true,
    limit: 25,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'pendingCount', label: 'Pending Approval', type: 'number', path: 'stats.pending' },
          { id: 'approvedThisPeriod', label: 'Approved This Period', type: 'number', path: 'stats.approved' },
          { id: 'totalHoursThisPeriod', label: 'Total Hours', type: 'number', path: 'stats.totalHours', config: { suffix: ' hrs' } },
          { id: 'overtimeHoursThisPeriod', label: 'Overtime Hours', type: 'number', path: 'stats.overtimeHours', config: { suffix: ' hrs' } },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'timesheet',
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'payPeriod',
            label: 'Pay Period',
            type: 'select',
            path: 'filters.payPeriod',
            config: { optionsSource: 'payPeriods' },
          },
          {
            id: 'department',
            label: 'Department',
            type: 'select',
            path: 'filters.department',
            config: { optionsSource: 'departments' },
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            options: TIMESHEET_STATUS_OPTIONS,
          },
        ],
      },
      // Timesheets Table
      {
        id: 'timesheets-table',
        type: 'table',
        columns_config: timesheetColumns,
        selectable: true,
        rowClick: {
          type: 'expand',
        },
        emptyState: {
          title: 'No Pending Timesheets',
          description: 'All timesheets have been processed',
          icon: 'CheckCircle',
        },
        rowActions: [
          {
            id: 'view-details',
            label: 'View Details',
            type: 'modal',
            icon: 'Eye',
            config: {
              type: 'modal',
              modal: 'TimesheetDetailModal',
              props: { timesheetId: { type: 'field', path: 'id' } },
            },
          },
          {
            id: 'approve',
            label: 'Approve',
            type: 'mutation',
            variant: 'primary',
            icon: 'Check',
            config: {
              type: 'mutation',
              procedure: 'hr.timesheets.approve',
              input: { id: { type: 'field', path: 'id' } },
            },
            visible: { field: 'status', operator: 'eq', value: 'submitted' },
          },
          {
            id: 'reject',
            label: 'Reject',
            type: 'modal',
            variant: 'destructive',
            icon: 'X',
            config: {
              type: 'modal',
              modal: 'RejectTimesheetModal',
              props: { timesheetId: { type: 'field', path: 'id' } },
            },
            visible: { field: 'status', operator: 'eq', value: 'submitted' },
          },
          {
            id: 'request-revision',
            label: 'Request Revision',
            type: 'modal',
            variant: 'outline',
            icon: 'Edit',
            config: {
              type: 'modal',
              modal: 'RequestRevisionModal',
              props: { timesheetId: { type: 'field', path: 'id' } },
            },
            visible: { field: 'status', operator: 'eq', value: 'submitted' },
          },
        ],
      },
    ],
  },

  // Bulk actions
  bulkActions: [
    {
      id: 'bulk-approve',
      label: 'Approve Selected',
      type: 'mutation',
      variant: 'primary',
      icon: 'CheckCircle',
      config: {
        type: 'mutation',
        procedure: 'hr.timesheets.bulkApprove',
        input: { ids: { type: 'selection', path: 'id' } },
      },
      confirm: {
        title: 'Approve Timesheets',
        message: 'Are you sure you want to approve the selected timesheets?',
        confirmLabel: 'Approve All',
      },
    },
    {
      id: 'bulk-export',
      label: 'Export Selected',
      type: 'custom',
      variant: 'secondary',
      icon: 'Download',
      config: {
        type: 'custom',
        handler: 'handleExportTimesheets',
      },
    },
  ],

  // Header actions
  actions: [
    {
      id: 'export-all',
      label: 'Export All',
      type: 'custom',
      variant: 'secondary',
      icon: 'Download',
      config: {
        type: 'custom',
        handler: 'handleExportAllTimesheets',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Timesheet Approval' },
    ],
  },
};

export default timesheetApprovalScreen;
