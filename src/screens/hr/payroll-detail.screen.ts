/**
 * Payroll Run Detail Screen Definition
 *
 * Metadata-driven screen for viewing payroll run details.
 */

import type { ScreenDefinition, TabDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const PAYROLL_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const PAY_TYPE_OPTIONS = [
  { value: 'regular', label: 'Regular' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'commission', label: 'Commission' },
];

// ==========================================
// TAB DEFINITIONS
// ==========================================

const summaryTab: TabDefinition = {
  id: 'summary',
  label: 'Summary',
  icon: 'LayoutDashboard',
  sections: [
    {
      id: 'totals',
      type: 'metrics-grid',
      columns: 4,
      fields: [
        { id: 'grossPay', label: 'Gross Pay', type: 'currency', path: 'totals.grossPay' },
        { id: 'deductions', label: 'Deductions', type: 'currency', path: 'totals.deductions' },
        { id: 'taxes', label: 'Taxes', type: 'currency', path: 'totals.taxes' },
        { id: 'netPay', label: 'Net Pay', type: 'currency', path: 'totals.netPay' },
      ],
    },
    {
      id: 'breakdown',
      type: 'metrics-grid',
      title: 'Breakdown',
      columns: 4,
      fields: [
        { id: 'regularHours', label: 'Regular Hours', type: 'number', path: 'breakdown.regularHours' },
        { id: 'overtimeHours', label: 'Overtime Hours', type: 'number', path: 'breakdown.overtimeHours' },
        { id: 'employeeCount', label: 'Employees', type: 'number', path: 'breakdown.employeeCount' },
        { id: 'exceptions', label: 'Exceptions', type: 'number', path: 'breakdown.exceptionCount' },
      ],
    },
  ],
};

const employeesTab: TabDefinition = {
  id: 'employees',
  label: 'Employees',
  icon: 'Users',
  sections: [
    {
      id: 'employees-table',
      type: 'table',
      title: 'Employee Payroll Items',
      columns_config: [
        { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
        { id: 'department', label: 'Department', path: 'employee.department', type: 'text' },
        { id: 'regularHours', label: 'Reg Hours', path: 'regularHours', type: 'number' },
        { id: 'overtimeHours', label: 'OT Hours', path: 'overtimeHours', type: 'number' },
        { id: 'grossPay', label: 'Gross Pay', path: 'grossPay', type: 'currency', sortable: true },
        { id: 'deductions', label: 'Deductions', path: 'deductions', type: 'currency' },
        { id: 'netPay', label: 'Net Pay', path: 'netPay', type: 'currency', sortable: true },
      ],
      dataSource: {
        type: 'related',
        entityType: 'payroll',
        relation: 'items',
      },
    },
  ],
};

const deductionsTab: TabDefinition = {
  id: 'deductions',
  label: 'Deductions',
  icon: 'MinusCircle',
  sections: [
    {
      id: 'deductions-summary',
      type: 'table',
      title: 'Deductions Summary',
      columns_config: [
        { id: 'type', label: 'Deduction Type', path: 'deductionType', type: 'text' },
        { id: 'count', label: 'Employee Count', path: 'employeeCount', type: 'number' },
        { id: 'total', label: 'Total Amount', path: 'totalAmount', type: 'currency', sortable: true },
      ],
      dataSource: {
        type: 'related',
        entityType: 'payroll',
        relation: 'deductionsSummary',
      },
    },
  ],
};

const taxesTab: TabDefinition = {
  id: 'taxes',
  label: 'Taxes',
  icon: 'Receipt',
  sections: [
    {
      id: 'taxes-summary',
      type: 'table',
      title: 'Tax Summary',
      columns_config: [
        { id: 'type', label: 'Tax Type', path: 'taxType', type: 'text' },
        { id: 'jurisdiction', label: 'Jurisdiction', path: 'jurisdiction', type: 'text' },
        { id: 'employeeAmount', label: 'Employee Share', path: 'employeeAmount', type: 'currency' },
        { id: 'employerAmount', label: 'Employer Share', path: 'employerAmount', type: 'currency' },
        { id: 'total', label: 'Total', path: 'totalAmount', type: 'currency', sortable: true },
      ],
      dataSource: {
        type: 'related',
        entityType: 'payroll',
        relation: 'taxesSummary',
      },
    },
  ],
};

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const payrollDetailScreen: ScreenDefinition = {
  id: 'payroll-detail',
  type: 'detail',
  entityType: 'payroll',

  title: { type: 'field', path: 'payPeriodLabel' },
  subtitle: 'Payroll Run Details',
  icon: 'DollarSign',

  // Data source
  dataSource: {
    type: 'entity',
    entityType: 'payroll',
    entityId: { type: 'param', path: 'id' },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebar: {
      id: 'payroll-info',
      type: 'info-card',
      title: 'Payroll Information',
      fields: [
        { id: 'period', label: 'Pay Period', type: 'text', path: 'payPeriodLabel' },
        { id: 'payDate', label: 'Pay Date', type: 'date', path: 'payDate' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: PAYROLL_STATUS_OPTIONS,
            badgeColors: { pending: 'yellow', processing: 'blue', completed: 'green', failed: 'red' },
          },
        },
        { id: 'employeeCount', label: 'Employees', type: 'number', path: 'employeeCount' },
        { id: 'grossTotal', label: 'Gross Total', type: 'currency', path: 'grossPayTotal' },
        { id: 'netTotal', label: 'Net Total', type: 'currency', path: 'netPayTotal' },
        { id: 'processedAt', label: 'Processed At', type: 'date', path: 'processedAt' },
        { id: 'processedBy', label: 'Processed By', type: 'text', path: 'processedBy.fullName' },
      ],
    },
    tabs: [summaryTab, employeesTab, deductionsTab, taxesTab],
    defaultTab: 'summary',
  },

  // Header actions
  actions: [
    {
      id: 'process',
      label: 'Process Payroll',
      type: 'mutation',
      variant: 'primary',
      icon: 'Play',
      config: {
        type: 'mutation',
        procedure: 'hr.payroll.process',
        input: { id: { type: 'param', path: 'id' } },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'pending' },
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
    back: { label: 'Back to Payroll', route: '/employee/hr/payroll' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Payroll', route: '/employee/hr/payroll' },
      { label: { type: 'field', path: 'payPeriodLabel' } },
    ],
  },
};

export default payrollDetailScreen;
