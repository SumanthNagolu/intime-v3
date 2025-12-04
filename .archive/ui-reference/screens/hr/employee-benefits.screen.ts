/**
 * Employee Benefits Detail Screen Definition
 *
 * Metadata-driven screen for viewing/managing a specific employee's benefits.
 *
 * Per docs/specs/20-USER-ROLES/05-hr/08-benefits-administration.md
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const BENEFIT_TYPE_OPTIONS = [
  { value: 'medical', label: 'Medical' },
  { value: 'dental', label: 'Dental' },
  { value: 'vision', label: 'Vision' },
  { value: '401k', label: '401(k)' },
  { value: 'life', label: 'Life Insurance' },
  { value: 'disability_std', label: 'Short-Term Disability' },
  { value: 'disability_ltd', label: 'Long-Term Disability' },
  { value: 'hsa', label: 'HSA' },
  { value: 'fsa', label: 'FSA' },
];

const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'waived', label: 'Waived' },
  { value: 'terminated', label: 'Terminated' },
];

const COVERAGE_LEVEL_OPTIONS = [
  { value: 'employee', label: 'Employee Only' },
  { value: 'employee_spouse', label: 'Employee + Spouse' },
  { value: 'employee_children', label: 'Employee + Children' },
  { value: 'family', label: 'Family' },
];

const LIFE_EVENT_OPTIONS = [
  { value: 'marriage', label: 'Marriage' },
  { value: 'divorce', label: 'Divorce' },
  { value: 'birth', label: 'Birth/Adoption' },
  { value: 'death', label: 'Death of Dependent' },
  { value: 'loss_of_coverage', label: 'Loss of Other Coverage' },
  { value: 'address_change', label: 'Address Change' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const enrollmentColumns: TableColumnDefinition[] = [
  {
    id: 'benefitType',
    label: 'Benefit',
    path: 'benefitType',
    type: 'enum',
    width: '120px',
    config: { options: BENEFIT_TYPE_OPTIONS },
  },
  { id: 'planName', label: 'Plan', path: 'planName', type: 'text' },
  {
    id: 'coverageLevel',
    label: 'Coverage',
    path: 'coverageLevel',
    type: 'enum',
    config: { options: COVERAGE_LEVEL_OPTIONS },
  },
  { id: 'effectiveDate', label: 'Effective', path: 'effectiveDate', type: 'date' },
  { id: 'employeeCost', label: 'Employee/mo', path: 'employeeCostMonthly', type: 'currency' },
  { id: 'employerCost', label: 'Employer/mo', path: 'employerCostMonthly', type: 'currency' },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: ENROLLMENT_STATUS_OPTIONS,
      badgeColors: {
        active: 'green',
        pending: 'yellow',
        waived: 'gray',
        terminated: 'red',
      },
    },
  },
];

const dependentColumns: TableColumnDefinition[] = [
  { id: 'name', label: 'Name', path: 'fullName', type: 'text' },
  { id: 'relationship', label: 'Relationship', path: 'relationship', type: 'text' },
  { id: 'dateOfBirth', label: 'Date of Birth', path: 'dateOfBirth', type: 'date' },
  { id: 'ssn', label: 'SSN (last 4)', path: 'ssnLast4', type: 'text' },
  { id: 'enrolledPlans', label: 'Enrolled Plans', path: 'enrolledPlanCount', type: 'number' },
];

const changeHistoryColumns: TableColumnDefinition[] = [
  { id: 'changeDate', label: 'Date', path: 'changeDate', type: 'date', sortable: true },
  { id: 'changeType', label: 'Type', path: 'changeType', type: 'text' },
  { id: 'benefitType', label: 'Benefit', path: 'benefitType', type: 'enum', config: { options: BENEFIT_TYPE_OPTIONS } },
  { id: 'previousValue', label: 'Previous', path: 'previousValue', type: 'text' },
  { id: 'newValue', label: 'New', path: 'newValue', type: 'text' },
  { id: 'reason', label: 'Reason', path: 'reason', type: 'text' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const employeeBenefitsScreen: ScreenDefinition = {
  id: 'employee-benefits',
  type: 'detail',
  entityType: 'employee',

  title: { type: 'field', path: 'fullName' },
  subtitle: 'Benefits Enrollment',
  icon: 'Heart',

  // Data source
  dataSource: {
    type: 'entity',
    entityType: 'employee',
    entityId: { type: 'param', path: 'id' },
    include: ['benefitEnrollments', 'dependents', 'benefitHistory'],
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Employee Summary Header
      {
        id: 'employee-summary',
        type: 'info-card',
        header: {
          type: 'avatar',
          path: 'avatarUrl',
          fallbackPath: 'initials',
          size: 'md',
        },
        columns: 4,
        fields: [
          { id: 'name', label: 'Employee', type: 'text', path: 'fullName' },
          { id: 'department', label: 'Department', type: 'text', path: 'department' },
          { id: 'hireDate', label: 'Hire Date', type: 'date', path: 'hireDate' },
          { id: 'eligibilityDate', label: 'Benefits Eligibility', type: 'date', path: 'benefitsEligibilityDate' },
        ],
      },

      // Cost Summary
      {
        id: 'cost-summary',
        type: 'metrics-grid',
        title: 'Monthly Cost Summary',
        columns: 4,
        fields: [
          { id: 'totalEmployeeCost', label: 'Employee Total', type: 'currency', path: 'benefits.totalEmployeeCostMonthly' },
          { id: 'totalEmployerCost', label: 'Employer Total', type: 'currency', path: 'benefits.totalEmployerCostMonthly' },
          { id: 'totalCost', label: 'Total Monthly', type: 'currency', path: 'benefits.totalCostMonthly' },
          { id: 'annualCost', label: 'Annual Cost', type: 'currency', path: 'benefits.totalCostAnnual' },
        ],
      },

      // Current Enrollments
      {
        id: 'enrollments-table',
        type: 'table',
        title: 'Current Enrollments',
        columns_config: enrollmentColumns,
        dataSource: {
          type: 'related',
          entityType: 'benefitEnrollment',
          relation: 'benefitEnrollments',
          filter: { status: 'active' },
        },
        actions: [
          {
            id: 'make-change',
            label: 'Life Event Change',
            type: 'modal',
            variant: 'primary',
            icon: 'Edit',
            config: {
              type: 'modal',
              modal: 'BenefitLifeEventModal',
              props: { employeeId: { type: 'param', path: 'id' } },
            },
          },
        ],
        rowActions: [
          {
            id: 'view-plan-details',
            label: 'View Plan Details',
            type: 'modal',
            icon: 'Info',
            config: {
              type: 'modal',
              modal: 'PlanDetailsModal',
              props: { enrollmentId: { type: 'field', path: 'id' } },
            },
          },
          {
            id: 'change-coverage',
            label: 'Change Coverage',
            type: 'modal',
            icon: 'Edit',
            config: {
              type: 'modal',
              modal: 'ChangeCoverageModal',
              props: { enrollmentId: { type: 'field', path: 'id' } },
            },
            visible: { field: 'status', operator: 'eq', value: 'active' },
          },
        ],
      },

      // Dependents
      {
        id: 'dependents-section',
        type: 'table',
        title: 'Dependents',
        columns_config: dependentColumns,
        dataSource: {
          type: 'related',
          entityType: 'dependent',
          relation: 'dependents',
        },
        emptyState: {
          title: 'No Dependents',
          description: 'No dependents have been added',
          icon: 'Users',
        },
        actions: [
          {
            id: 'add-dependent',
            label: 'Add Dependent',
            type: 'modal',
            variant: 'secondary',
            icon: 'UserPlus',
            config: {
              type: 'modal',
              modal: 'AddDependentModal',
              props: { employeeId: { type: 'param', path: 'id' } },
            },
          },
        ],
        rowActions: [
          {
            id: 'edit-dependent',
            label: 'Edit',
            type: 'modal',
            icon: 'Pencil',
            config: {
              type: 'modal',
              modal: 'EditDependentModal',
              props: { dependentId: { type: 'field', path: 'id' } },
            },
          },
          {
            id: 'remove-dependent',
            label: 'Remove',
            type: 'mutation',
            variant: 'destructive',
            icon: 'Trash2',
            config: {
              type: 'mutation',
              procedure: 'hr.dependents.remove',
              input: { id: { type: 'field', path: 'id' } },
            },
            confirm: {
              title: 'Remove Dependent',
              message: 'Are you sure you want to remove this dependent? They will be removed from all benefit plans.',
              confirmLabel: 'Remove',
              destructive: true,
            },
          },
        ],
      },

      // Beneficiary Information
      {
        id: 'beneficiary-info',
        type: 'info-card',
        title: 'Beneficiary Designation',
        collapsible: true,
        columns: 2,
        fields: [
          { id: 'primaryName', label: 'Primary Beneficiary', type: 'text', path: 'beneficiary.primary.name' },
          { id: 'primaryRelationship', label: 'Relationship', type: 'text', path: 'beneficiary.primary.relationship' },
          { id: 'primaryPercent', label: 'Percentage', type: 'percentage', path: 'beneficiary.primary.percentage' },
          { id: 'contingentName', label: 'Contingent Beneficiary', type: 'text', path: 'beneficiary.contingent.name' },
        ],
        actions: [
          {
            id: 'update-beneficiary',
            label: 'Update',
            type: 'modal',
            variant: 'outline',
            icon: 'Pencil',
            config: {
              type: 'modal',
              modal: 'UpdateBeneficiaryModal',
              props: { employeeId: { type: 'param', path: 'id' } },
            },
          },
        ],
      },

      // HSA/FSA Balance (if applicable)
      {
        id: 'spending-accounts',
        type: 'metrics-grid',
        title: 'Spending Accounts',
        collapsible: true,
        columns: 4,
        visible: { field: 'hasSpendingAccount', operator: 'eq', value: true },
        fields: [
          { id: 'hsaBalance', label: 'HSA Balance', type: 'currency', path: 'benefits.hsa.balance' },
          { id: 'hsaContributions', label: 'HSA YTD Contributions', type: 'currency', path: 'benefits.hsa.ytdContributions' },
          { id: 'fsaBalance', label: 'FSA Balance', type: 'currency', path: 'benefits.fsa.balance' },
          { id: 'fsaDeadline', label: 'FSA Use-By Date', type: 'date', path: 'benefits.fsa.useByDate' },
        ],
      },

      // Change History
      {
        id: 'history-table',
        type: 'table',
        title: 'Enrollment History',
        collapsible: true,
        collapsed: true,
        columns_config: changeHistoryColumns,
        dataSource: {
          type: 'related',
          entityType: 'benefitHistory',
          relation: 'benefitHistory',
          sort: { field: 'changeDate', direction: 'desc' },
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'print-summary',
      label: 'Print Summary',
      type: 'custom',
      variant: 'secondary',
      icon: 'Printer',
      config: {
        type: 'custom',
        handler: 'handlePrintBenefitsSummary',
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
        handler: 'handleExportBenefits',
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Employee',
      route: '/employee/hr/people/{{id}}',
    },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Employees', route: '/employee/hr/people' },
      { label: { type: 'field', path: 'fullName' }, route: '/employee/hr/people/{{id}}' },
      { label: 'Benefits' },
    ],
  },
};

export default employeeBenefitsScreen;
