/**
 * Payroll Dashboard Screen Definition
 *
 * Metadata-driven screen for payroll management.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const PAYROLL_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
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
      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'currentPeriod', label: 'Current Period', type: 'text', path: 'stats.currentPeriod' },
          { id: 'totalPayroll', label: 'Total Payroll', type: 'currency', path: 'stats.totalAmount' },
          { id: 'employeesCount', label: 'Employees', type: 'number', path: 'stats.employeesCount' },
          { id: 'nextRunDate', label: 'Next Run', type: 'date', path: 'stats.nextRunDate' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'payroll',
        },
      },
      // Payroll Runs Table
      {
        id: 'payroll-runs',
        type: 'table',
        title: 'Payroll Runs',
        columns_config: [
          { id: 'period', label: 'Pay Period', path: 'payPeriodLabel', type: 'text', sortable: true },
          { id: 'payDate', label: 'Pay Date', path: 'payDate', type: 'date', sortable: true },
          {
            id: 'periodType',
            label: 'Type',
            path: 'periodType',
            type: 'enum',
            config: { options: PAY_PERIOD_OPTIONS },
          },
          { id: 'employeeCount', label: 'Employees', path: 'employeeCount', type: 'number' },
          { id: 'grossPay', label: 'Gross Pay', path: 'grossPayTotal', type: 'currency' },
          { id: 'netPay', label: 'Net Pay', path: 'netPayTotal', type: 'currency' },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: PAYROLL_STATUS_OPTIONS,
              badgeColors: {
                pending: 'yellow',
                processing: 'blue',
                completed: 'green',
                failed: 'red',
              },
            },
          },
        ],
        dataSource: {
          type: 'list',
          entityType: 'payroll',
          sort: { field: 'payDate', direction: 'desc' },
          limit: 10,
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
