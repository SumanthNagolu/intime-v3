/**
 * Benefits Enrollment Screen Definition
 *
 * Metadata-driven screen for employee benefits enrollment.
 */

import type { ScreenDefinition, TabDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const PLAN_TYPE_OPTIONS = [
  { value: 'health', label: 'Health Insurance' },
  { value: 'dental', label: 'Dental Insurance' },
  { value: 'vision', label: 'Vision Insurance' },
  { value: 'life', label: 'Life Insurance' },
  { value: 'disability', label: 'Disability Insurance' },
  { value: '401k', label: '401(k)' },
  { value: 'hsa', label: 'HSA' },
  { value: 'fsa', label: 'FSA' },
];

const COVERAGE_LEVEL_OPTIONS = [
  { value: 'employee', label: 'Employee Only' },
  { value: 'employee_spouse', label: 'Employee + Spouse' },
  { value: 'employee_children', label: 'Employee + Children' },
  { value: 'family', label: 'Family' },
];

const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'waived', label: 'Waived' },
];

// ==========================================
// TAB DEFINITIONS
// ==========================================

const healthTab: TabDefinition = {
  id: 'health',
  label: 'Health',
  icon: 'Heart',
  sections: [
    {
      id: 'health-plans',
      type: 'table',
      title: 'Available Health Plans',
      columns_config: [
        { id: 'name', label: 'Plan Name', path: 'name', type: 'text' },
        { id: 'type', label: 'Type', path: 'planType', type: 'text' },
        { id: 'coverage', label: 'Coverage', path: 'coverageDescription', type: 'text' },
        { id: 'employeeCost', label: 'Employee Cost', path: 'employeePremium', type: 'currency' },
        { id: 'employerCost', label: 'Employer Contribution', path: 'employerContribution', type: 'currency' },
        { id: 'deductible', label: 'Deductible', path: 'deductible', type: 'currency' },
      ],
      dataSource: {
        type: 'list',
        entityType: 'benefit_plan',
        filter: { planType: 'health' },
      },
    },
    {
      id: 'current-selection',
      type: 'info-card',
      title: 'Your Current Selection',
      fields: [
        { id: 'plan', label: 'Selected Plan', type: 'text', path: 'healthEnrollment.plan.name' },
        { id: 'coverage', label: 'Coverage Level', type: 'text', path: 'healthEnrollment.coverageLevel' },
        { id: 'cost', label: 'Monthly Cost', type: 'currency', path: 'healthEnrollment.monthlyPremium' },
        { id: 'effectiveDate', label: 'Effective Date', type: 'date', path: 'healthEnrollment.effectiveDate' },
      ],
    },
  ],
};

const dentalVisionTab: TabDefinition = {
  id: 'dental-vision',
  label: 'Dental & Vision',
  icon: 'Eye',
  sections: [
    {
      id: 'dental-plans',
      type: 'table',
      title: 'Dental Plans',
      columns_config: [
        { id: 'name', label: 'Plan Name', path: 'name', type: 'text' },
        { id: 'coverage', label: 'Coverage', path: 'coverageDescription', type: 'text' },
        { id: 'cost', label: 'Monthly Cost', path: 'employeePremium', type: 'currency' },
      ],
      dataSource: {
        type: 'list',
        entityType: 'benefit_plan',
        filter: { planType: 'dental' },
      },
    },
    {
      id: 'vision-plans',
      type: 'table',
      title: 'Vision Plans',
      columns_config: [
        { id: 'name', label: 'Plan Name', path: 'name', type: 'text' },
        { id: 'coverage', label: 'Coverage', path: 'coverageDescription', type: 'text' },
        { id: 'cost', label: 'Monthly Cost', path: 'employeePremium', type: 'currency' },
      ],
      dataSource: {
        type: 'list',
        entityType: 'benefit_plan',
        filter: { planType: 'vision' },
      },
    },
  ],
};

const retirementTab: TabDefinition = {
  id: 'retirement',
  label: '401(k)',
  icon: 'PiggyBank',
  sections: [
    {
      id: 'retirement-info',
      type: 'info-card',
      title: '401(k) Enrollment',
      fields: [
        { id: 'contribution', label: 'Contribution %', type: 'percentage', path: 'retirement.contributionPercent' },
        { id: 'match', label: 'Employer Match', type: 'text', path: 'retirement.employerMatchDescription' },
        { id: 'vesting', label: 'Vesting Schedule', type: 'text', path: 'retirement.vestingSchedule' },
        { id: 'balance', label: 'Current Balance', type: 'currency', path: 'retirement.currentBalance' },
      ],
    },
    {
      id: 'investment-options',
      type: 'table',
      title: 'Investment Options',
      columns_config: [
        { id: 'fund', label: 'Fund Name', path: 'fundName', type: 'text' },
        { id: 'type', label: 'Type', path: 'fundType', type: 'text' },
        { id: 'expense', label: 'Expense Ratio', path: 'expenseRatio', type: 'percentage' },
        { id: 'ytd', label: 'YTD Return', path: 'ytdReturn', type: 'percentage' },
        { id: 'allocation', label: 'Your Allocation', path: 'allocationPercent', type: 'percentage' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'benefit_plan',
        relation: 'investmentOptions',
      },
    },
  ],
};

const dependentsTab: TabDefinition = {
  id: 'dependents',
  label: 'Dependents',
  icon: 'Users',
  sections: [
    {
      id: 'dependents-table',
      type: 'table',
      title: 'Your Dependents',
      columns_config: [
        { id: 'name', label: 'Name', path: 'fullName', type: 'text' },
        { id: 'relationship', label: 'Relationship', path: 'relationship', type: 'text' },
        { id: 'dob', label: 'Date of Birth', path: 'dateOfBirth', type: 'date' },
        { id: 'ssn', label: 'SSN (Last 4)', path: 'ssnLast4', type: 'text' },
        { id: 'coveredPlans', label: 'Covered By', path: 'coveredPlans', type: 'text' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'employee',
        relation: 'dependents',
      },
    },
  ],
};

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const benefitsEnrollmentScreen: ScreenDefinition = {
  id: 'benefits-enrollment',
  type: 'detail',
  entityType: 'employee',

  title: 'Benefits Enrollment',
  subtitle: 'Enroll in or update your benefits',
  icon: 'Heart',

  // Data source
  dataSource: {
    type: 'entity',
    entityType: 'employee',
    entityId: { type: 'context', path: 'currentUserId' },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebar: {
      id: 'enrollment-status',
      type: 'info-card',
      title: 'Enrollment Status',
      fields: [
        { id: 'enrollmentPeriod', label: 'Enrollment Period', type: 'text', path: 'enrollment.periodLabel' },
        { id: 'deadline', label: 'Deadline', type: 'date', path: 'enrollment.deadline' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'enrollment.status',
          config: {
            options: ENROLLMENT_STATUS_OPTIONS,
            badgeColors: { not_started: 'gray', in_progress: 'blue', completed: 'green', waived: 'yellow' },
          },
        },
        { id: 'totalCost', label: 'Total Monthly Cost', type: 'currency', path: 'enrollment.totalMonthlyCost' },
        { id: 'effectiveDate', label: 'Effective Date', type: 'date', path: 'enrollment.effectiveDate' },
      ],
    },
    tabs: [healthTab, dentalVisionTab, retirementTab, dependentsTab],
    defaultTab: 'health',
  },

  // Header actions
  actions: [
    {
      id: 'enroll-health',
      label: 'Select Health Plan',
      type: 'modal',
      variant: 'primary',
      icon: 'Heart',
      config: {
        type: 'modal',
        modal: 'SelectHealthPlanModal',
      },
    },
    {
      id: 'add-dependent',
      label: 'Add Dependent',
      type: 'modal',
      variant: 'secondary',
      icon: 'UserPlus',
      config: {
        type: 'modal',
        modal: 'AddDependentModal',
      },
    },
    {
      id: 'waive-coverage',
      label: 'Waive Coverage',
      type: 'modal',
      variant: 'secondary',
      icon: 'X',
      config: {
        type: 'modal',
        modal: 'WaiveCoverageModal',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Benefits', route: '/employee/hr/benefits' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Benefits', route: '/employee/hr/benefits' },
      { label: 'Enrollment' },
    ],
  },
};

export default benefitsEnrollmentScreen;
