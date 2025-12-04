/**
 * Payroll Dashboard Screen Definition
 *
 * Metadata-driven screen for payroll management.
 *
 * Per docs/specs/20-USER-ROLES/05-hr/03-payroll-management.md
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const PAYROLL_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const PAY_PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'semimonthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const currentPayrollColumns: TableColumnDefinition[] = [
  {
    id: 'employee',
    label: 'Employee',
    path: 'employee.fullName',
    type: 'text',
    sortable: true,
    width: '180px',
    config: {
      avatar: { path: 'employee.avatarUrl', fallback: 'initials' },
      subtitle: { path: 'employee.department' },
    },
  },
  { id: 'regularHours', label: 'Regular Hrs', path: 'regularHours', type: 'number', sortable: true },
  { id: 'overtimeHours', label: 'OT Hrs', path: 'overtimeHours', type: 'number' },
  { id: 'grossPay', label: 'Gross Pay', path: 'grossPay', type: 'currency', sortable: true },
  { id: 'taxes', label: 'Taxes', path: 'totalTaxes', type: 'currency' },
  { id: 'deductions', label: 'Deductions', path: 'totalDeductions', type: 'currency' },
  { id: 'netPay', label: 'Net Pay', path: 'netPay', type: 'currency', sortable: true },
];

const payrollRunColumns: TableColumnDefinition[] = [
  {
    id: 'payPeriod',
    label: 'Pay Period',
    path: 'payPeriodLabel',
    type: 'text',
    sortable: true,
  },
  {
    id: 'payDate',
    label: 'Pay Date',
    path: 'payDate',
    type: 'date',
    sortable: true,
  },
  {
    id: 'periodType',
    label: 'Type',
    path: 'periodType',
    type: 'enum',
    config: { options: PAY_PERIOD_OPTIONS },
  },
  {
    id: 'employeeCount',
    label: 'Employees',
    path: 'employeeCount',
    type: 'number',
  },
  {
    id: 'grossPayTotal',
    label: 'Gross Pay',
    path: 'grossPayTotal',
    type: 'currency',
    sortable: true,
  },
  {
    id: 'netPayTotal',
    label: 'Net Pay',
    path: 'netPayTotal',
    type: 'currency',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: PAYROLL_STATUS_OPTIONS,
      badgeColors: {
        draft: 'gray',
        pending_approval: 'yellow',
        approved: 'blue',
        processing: 'purple',
        completed: 'green',
        failed: 'red',
      },
    },
  },
];

const pendingTimesheetColumns: TableColumnDefinition[] = [
  {
    id: 'employee',
    label: 'Employee',
    path: 'employee.fullName',
    type: 'text',
    sortable: true,
    config: {
      avatar: { path: 'employee.avatarUrl', fallback: 'initials' },
    },
  },
  { id: 'department', label: 'Department', path: 'employee.department', type: 'text' },
  { id: 'totalHours', label: 'Hours', path: 'totalHours', type: 'number' },
  { id: 'submittedAt', label: 'Submitted', path: 'submittedAt', type: 'date', config: { format: 'relative' } },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const payrollDashboardScreen: ScreenDefinition = {
  id: 'payroll-dashboard',
  type: 'dashboard',
  entityType: 'payroll',

  title: 'Payroll Dashboard',
  subtitle: 'Manage payroll runs and processing',
  icon: 'DollarSign',

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Current Pay Period Card
      {
        id: 'current-period',
        type: 'info-card',
        title: 'Current Pay Period',
        columns: 4,
        fields: [
          { id: 'periodDates', label: 'Period', type: 'text', path: 'currentPeriod.dateRange' },
          { id: 'payDate', label: 'Pay Date', type: 'date', path: 'currentPeriod.payDate' },
          { id: 'status', label: 'Status', type: 'enum', path: 'currentPeriod.status', config: { options: PAYROLL_STATUS_OPTIONS, badgeColors: { draft: 'gray', pending_approval: 'yellow', approved: 'blue', processing: 'purple', completed: 'green', failed: 'red' } } },
          { id: 'daysUntilPayday', label: 'Days to Payday', type: 'number', path: 'currentPeriod.daysUntilPayday' },
        ],
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'hr.payroll.getCurrentPeriod',
            params: {},
          },
        },
        actions: [
          {
            id: 'view-details',
            label: 'View Details',
            type: 'navigate',
            variant: 'outline',
            icon: 'Eye',
            config: {
              type: 'navigate',
              route: '/employee/hr/payroll/{{currentPeriod.id}}',
            },
          },
        ],
      },

      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'totalGross', label: 'Total Gross Pay', type: 'currency', path: 'stats.totalGrossPay' },
          { id: 'totalNet', label: 'Total Net Pay', type: 'currency', path: 'stats.totalNetPay' },
          { id: 'employeesCount', label: 'Employees', type: 'number', path: 'stats.employeesCount' },
          { id: 'pendingTimesheets', label: 'Pending Timesheets', type: 'number', path: 'stats.pendingTimesheets' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'payroll',
        },
      },

      // Pending Timesheets (Action Required)
      {
        id: 'pending-timesheets',
        type: 'table',
        title: 'Pending Timesheets',
        icon: 'Clock',
        columns_config: pendingTimesheetColumns,
        dataSource: {
          type: 'list',
          entityType: 'timesheet',
          filter: { status: 'submitted' },
          limit: 5,
        },
        emptyState: {
          title: 'No Pending Timesheets',
          description: 'All timesheets have been processed',
          icon: 'CheckCircle',
        },
        actions: [
          {
            id: 'approve-all',
            label: 'Approve All',
            type: 'mutation',
            variant: 'primary',
            icon: 'CheckCircle',
            config: {
              type: 'mutation',
              procedure: 'hr.timesheets.approveAll',
            },
            confirm: {
              title: 'Approve All Timesheets',
              message: 'Are you sure you want to approve all pending timesheets?',
              confirmLabel: 'Approve All',
            },
          },
          {
            id: 'view-all-timesheets',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            config: {
              type: 'navigate',
              route: '/employee/hr/timesheets',
            },
          },
        ],
        rowActions: [
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
          },
          {
            id: 'view',
            label: 'View',
            type: 'modal',
            icon: 'Eye',
            config: {
              type: 'modal',
              modal: 'TimesheetDetailModal',
              props: { timesheetId: { type: 'field', path: 'id' } },
            },
          },
        ],
      },

      // Current Period Employees
      {
        id: 'current-payroll',
        type: 'table',
        title: 'Current Pay Period Breakdown',
        columns_config: currentPayrollColumns,
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'hr.payroll.getCurrentPeriodEmployees',
            params: {},
          },
        },
        pagination: { enabled: true, defaultPageSize: 10 },
        actions: [
          {
            id: 'add-adjustment',
            label: 'Add Adjustment',
            type: 'modal',
            variant: 'secondary',
            icon: 'Plus',
            config: {
              type: 'modal',
              modal: 'PayrollAdjustmentModal',
            },
          },
        ],
      },

      // Recent Payroll Runs
      {
        id: 'recent-runs',
        type: 'table',
        title: 'Recent Payroll Runs',
        columns_config: payrollRunColumns,
        dataSource: {
          type: 'list',
          entityType: 'payroll',
          sort: { field: 'payDate', direction: 'desc' },
          limit: 10,
        },
        rowClick: {
          type: 'navigate',
          route: '/employee/hr/payroll/{{id}}',
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'run-payroll',
      label: 'Run Payroll',
      type: 'modal',
      variant: 'primary',
      icon: 'Play',
      config: {
        type: 'modal',
        modal: 'RunPayrollModal',
      },
    },
    {
      id: 'preview-payroll',
      label: 'Preview',
      type: 'modal',
      variant: 'secondary',
      icon: 'Eye',
      config: {
        type: 'modal',
        modal: 'PreviewPayrollModal',
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
        handler: 'handleExportPayroll',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Payroll' },
    ],
  },
};

export default payrollDashboardScreen;
