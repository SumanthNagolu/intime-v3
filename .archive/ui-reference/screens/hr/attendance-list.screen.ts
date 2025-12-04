/**
 * Attendance/Timesheet Screen Definition
 *
 * Metadata-driven screen for managing timesheets and attendance.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const TIMESHEET_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const ATTENDANCE_TYPE_OPTIONS = [
  { value: 'regular', label: 'Regular' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'sick', label: 'Sick' },
  { value: 'pto', label: 'PTO' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const attendanceListScreen: ScreenDefinition = {
  id: 'attendance-list',
  type: 'list',
  entityType: 'timeoff',

  title: 'Timesheets & Attendance',
  subtitle: 'Manage employee timesheets and attendance records',
  icon: 'Clock',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'timeoff',
    sort: { field: 'weekEnding', direction: 'desc' },
    pagination: true,
    limit: 25,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Metrics row
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'pendingApproval', label: 'Pending Approval', type: 'number', path: 'stats.pendingApproval' },
          { id: 'submittedToday', label: 'Submitted Today', type: 'number', path: 'stats.submittedToday' },
          { id: 'totalHours', label: 'Total Hours (Week)', type: 'number', path: 'stats.totalHoursThisWeek' },
          { id: 'overtimeHours', label: 'Overtime Hours', type: 'number', path: 'stats.overtimeHours' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'timeoff',
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        fields: [
          { id: 'search', label: 'Search', type: 'text', path: 'search', config: { placeholder: 'Search by employee...' } },
          { id: 'status', label: 'Status', type: 'multiselect', path: 'filters.status', options: [...TIMESHEET_STATUS_OPTIONS] },
          { id: 'weekEnding', label: 'Week Ending', type: 'date', path: 'filters.weekEnding' },
        ],
      },
      // Timesheets Table
      {
        id: 'timesheets-table',
        type: 'table',
        title: 'Timesheets',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'department', label: 'Department', path: 'employee.department', type: 'text' },
          { id: 'weekEnding', label: 'Week Ending', path: 'weekEnding', type: 'date', sortable: true },
          { id: 'regularHours', label: 'Regular', path: 'regularHours', type: 'number' },
          { id: 'overtimeHours', label: 'Overtime', path: 'overtimeHours', type: 'number' },
          { id: 'ptoHours', label: 'PTO', path: 'ptoHours', type: 'number' },
          { id: 'totalHours', label: 'Total', path: 'totalHours', type: 'number', sortable: true },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            sortable: true,
            config: {
              options: TIMESHEET_STATUS_OPTIONS,
              badgeColors: { draft: 'gray', submitted: 'blue', approved: 'green', rejected: 'red' },
            },
          },
          { id: 'submittedAt', label: 'Submitted', path: 'submittedAt', type: 'date' },
        ],
      },
      // Daily Attendance Table
      {
        id: 'attendance-table',
        type: 'table',
        title: 'Daily Attendance (Today)',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'clockIn', label: 'Clock In', path: 'clockInTime', type: 'text' },
          { id: 'clockOut', label: 'Clock Out', path: 'clockOutTime', type: 'text' },
          { id: 'breakDuration', label: 'Break', path: 'breakMinutes', type: 'number', config: { suffix: ' min' } },
          { id: 'hoursWorked', label: 'Hours Worked', path: 'hoursWorked', type: 'number' },
          {
            id: 'type',
            label: 'Type',
            path: 'attendanceType',
            type: 'enum',
            config: {
              options: ATTENDANCE_TYPE_OPTIONS,
              badgeColors: { regular: 'blue', overtime: 'purple', holiday: 'green', sick: 'orange', pto: 'cyan' },
            },
          },
          { id: 'notes', label: 'Notes', path: 'notes', type: 'text' },
        ],
        dataSource: {
          type: 'list',
          entityType: 'timeoff',
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'approve-selected',
      label: 'Approve Selected',
      type: 'mutation',
      variant: 'primary',
      icon: 'Check',
      config: {
        type: 'mutation',
        procedure: 'hr.timesheets.bulkApprove',
        input: { ids: { type: 'context', path: 'selectedIds' } },
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
        handler: 'handleExportTimesheets',
      },
    },
    {
      id: 'payroll-report',
      label: 'Payroll Report',
      type: 'custom',
      variant: 'secondary',
      icon: 'FileText',
      config: {
        type: 'custom',
        handler: 'handlePayrollReport',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Timesheets & Attendance' },
    ],
  },
};

export default attendanceListScreen;
