/**
 * HR Dashboard Screen Definition
 *
 * Metadata-driven screen for the HR dashboard overview.
 * Per docs/specs/20-USER-ROLES/05-hr/00-OVERVIEW.md Section 4 (KPIs)
 *
 * @see docs/specs/20-USER-ROLES/05-hr/01-daily-workflow.md
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ONBOARDING_STATUS_OPTIONS = [
  { value: 'documents_pending', label: 'Documents Pending' },
  { value: 'i9_verification', label: 'I-9 Verification' },
  { value: 'benefits_selection', label: 'Benefits Selection' },
  { value: 'it_setup', label: 'IT Setup' },
  { value: 'complete', label: 'Complete' },
];

const COMPLIANCE_ALERT_TYPE_OPTIONS = [
  { value: 'i9_expiring', label: 'I-9 Expiring' },
  { value: 'i9_incomplete', label: 'I-9 Incomplete' },
  { value: 'work_auth_expiring', label: 'Work Auth Expiring' },
  { value: 'document_missing', label: 'Document Missing' },
  { value: 'training_overdue', label: 'Training Overdue' },
];

const PTO_TYPE_OPTIONS = [
  { value: 'pto', label: 'PTO' },
  { value: 'sick', label: 'Sick' },
  { value: 'personal', label: 'Personal' },
  { value: 'parental', label: 'Parental' },
  { value: 'bereavement', label: 'Bereavement' },
];

const PTO_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
];

const REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'self_review', label: 'Self Review' },
  { value: 'manager_review', label: 'Manager Review' },
  { value: 'complete', label: 'Complete' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const complianceAlertColumns: TableColumnDefinition[] = [
  { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
  {
    id: 'alertType',
    label: 'Issue',
    path: 'alertType',
    type: 'enum',
    config: {
      options: COMPLIANCE_ALERT_TYPE_OPTIONS,
      badgeColors: {
        i9_expiring: 'orange',
        i9_incomplete: 'red',
        work_auth_expiring: 'red',
        document_missing: 'yellow',
        training_overdue: 'orange',
      },
    },
  },
  { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date', sortable: true },
  { id: 'daysRemaining', label: 'Days Left', path: 'daysRemaining', type: 'number' },
];

const pendingOnboardingColumns: TableColumnDefinition[] = [
  { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
  { id: 'startDate', label: 'Start Date', path: 'startDate', type: 'date', sortable: true },
  { id: 'manager', label: 'Manager', path: 'employee.manager.fullName', type: 'text' },
  { id: 'progress', label: 'Progress', path: 'progressPercent', type: 'progress', config: { max: 100 } },
  {
    id: 'stage',
    label: 'Stage',
    path: 'stage',
    type: 'enum',
    config: {
      options: ONBOARDING_STATUS_OPTIONS,
      badgeColors: {
        documents_pending: 'yellow',
        i9_verification: 'orange',
        benefits_selection: 'blue',
        it_setup: 'purple',
        complete: 'green',
      },
    },
  },
];

const pendingPtoColumns: TableColumnDefinition[] = [
  { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    config: { options: PTO_TYPE_OPTIONS },
  },
  { id: 'startDate', label: 'Start', path: 'startDate', type: 'date', sortable: true },
  { id: 'endDate', label: 'End', path: 'endDate', type: 'date' },
  { id: 'days', label: 'Days', path: 'totalDays', type: 'number' },
];

const upcomingReviewColumns: TableColumnDefinition[] = [
  { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
  { id: 'reviewPeriod', label: 'Period', path: 'reviewPeriod', type: 'text' },
  { id: 'manager', label: 'Manager', path: 'employee.manager.fullName', type: 'text' },
  { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date', sortable: true },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: REVIEW_STATUS_OPTIONS,
      badgeColors: {
        pending: 'gray',
        self_review: 'blue',
        manager_review: 'purple',
        complete: 'green',
      },
    },
  },
];

const recentHiresColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Employee',
    path: 'fullName',
    type: 'text',
    sortable: true,
    config: {
      avatar: { path: 'avatarUrl', fallback: 'initials' },
      subtitle: { path: 'jobTitle' },
    },
  },
  { id: 'department', label: 'Department', path: 'department', type: 'text' },
  { id: 'manager', label: 'Manager', path: 'manager.fullName', type: 'text' },
  { id: 'hireDate', label: 'Hire Date', path: 'hireDate', type: 'date', sortable: true },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const hrDashboardScreen: ScreenDefinition = {
  id: 'hr-dashboard',
  type: 'dashboard',

  title: 'HR Dashboard',
  subtitle: 'People operations overview',
  icon: 'Users',

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Activity Queue - TOP PRIORITY per Activity-Centric UI
      {
        id: 'activity-queue',
        type: 'custom',
        title: 'My Activities',
        component: 'ActivityQueue',
        componentProps: {
          showOverdue: true,
          showDueToday: true,
          maxItems: 10,
        },
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'activities.getMyQueue',
            params: {},
          },
        },
      },

      // KPI Cards Row 1 (per 00-OVERVIEW.md Section 4)
      {
        id: 'kpi-row-1',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'totalEmployees',
            label: 'Total Employees',
            type: 'number',
            path: 'stats.totalEmployees',
            config: {
              trend: { path: 'stats.employeeChange', label: 'from last month' },
            },
          },
          {
            id: 'newHires',
            label: 'New Hires This Month',
            type: 'number',
            path: 'stats.newHiresThisMonth',
          },
          {
            id: 'openPositions',
            label: 'Open Internal Positions',
            type: 'number',
            path: 'stats.openPositions',
          },
          {
            id: 'turnoverRate',
            label: 'Turnover Rate (12mo)',
            type: 'percentage',
            path: 'stats.turnoverRate',
            config: {
              target: 15,
              inverse: true, // Lower is better
            },
          },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'employee',
        },
      },

      // KPI Cards Row 2 (per 00-OVERVIEW.md Section 4)
      {
        id: 'kpi-row-2',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'timeToOnboard',
            label: 'Time to Onboard',
            type: 'number',
            path: 'stats.avgOnboardDays',
            config: {
              suffix: ' days',
              target: 7,
              inverse: true, // Lower is better
            },
          },
          {
            id: 'payrollAccuracy',
            label: 'Payroll Accuracy',
            type: 'percentage',
            path: 'stats.payrollAccuracy',
            config: {
              target: 99.5,
            },
          },
          {
            id: 'complianceRate',
            label: 'Compliance Rate',
            type: 'percentage',
            path: 'stats.complianceRate',
            config: {
              target: 100,
            },
          },
          {
            id: 'benefitsEnrollment',
            label: 'Benefits Enrollment',
            type: 'percentage',
            path: 'stats.benefitsEnrollmentRate',
            config: {
              target: 90,
            },
          },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'employee',
        },
      },

      // Compliance Alerts (High Priority)
      {
        id: 'compliance-alerts',
        type: 'table',
        title: 'Compliance Alerts',
        icon: 'AlertTriangle',
        columns_config: complianceAlertColumns,
        dataSource: {
          type: 'list',
          entityType: 'compliance',
          filter: { alertStatus: 'active' },
          sort: { field: 'dueDate', direction: 'asc' },
          limit: 5,
        },
        emptyState: {
          title: 'No Compliance Alerts',
          description: 'All compliance requirements are up to date',
          icon: 'CheckCircle',
        },
        actions: [
          {
            id: 'view-all-compliance',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            config: {
              type: 'navigate',
              route: '/employee/hr/compliance',
            },
          },
        ],
      },

      // Pending Onboardings (Checklist Status)
      {
        id: 'pending-onboardings',
        type: 'table',
        title: 'Pending Onboardings',
        icon: 'UserPlus',
        columns_config: pendingOnboardingColumns,
        dataSource: {
          type: 'list',
          entityType: 'onboarding',
          filter: { status: ['not_started', 'in_progress'] },
          sort: { field: 'startDate', direction: 'asc' },
          limit: 5,
        },
        emptyState: {
          title: 'No Pending Onboardings',
          description: 'All employees have completed onboarding',
          icon: 'CheckCircle',
        },
        actions: [
          {
            id: 'view-all-onboarding',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            config: {
              type: 'navigate',
              route: '/employee/hr/onboarding',
            },
          },
        ],
      },

      // PTO Requests Pending
      {
        id: 'pending-pto',
        type: 'table',
        title: 'PTO Requests Pending Approval',
        icon: 'Calendar',
        columns_config: pendingPtoColumns,
        dataSource: {
          type: 'list',
          entityType: 'timeoff',
          filter: { status: 'pending' },
          sort: { field: 'startDate', direction: 'asc' },
          limit: 5,
        },
        emptyState: {
          title: 'No Pending PTO Requests',
          description: 'All time off requests have been processed',
          icon: 'CheckCircle',
        },
        rowActions: [
          {
            id: 'approve-pto',
            label: 'Approve',
            type: 'mutation',
            variant: 'primary',
            icon: 'Check',
            config: {
              type: 'mutation',
              procedure: 'hr.timeoff.approve',
              input: { id: { type: 'field', path: 'id' } },
            },
          },
          {
            id: 'deny-pto',
            label: 'Deny',
            type: 'modal',
            variant: 'destructive',
            icon: 'X',
            config: {
              type: 'modal',
              modal: 'DenyPtoModal',
              props: { requestId: { type: 'field', path: 'id' } },
            },
          },
        ],
        actions: [
          {
            id: 'view-all-pto',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            config: {
              type: 'navigate',
              route: '/employee/hr/time',
            },
          },
        ],
      },

      // Upcoming Reviews
      {
        id: 'upcoming-reviews',
        type: 'table',
        title: 'Upcoming Performance Reviews',
        icon: 'Target',
        columns_config: upcomingReviewColumns,
        dataSource: {
          type: 'list',
          entityType: 'performance',
          filter: { status: ['pending', 'self_review', 'manager_review'] },
          sort: { field: 'dueDate', direction: 'asc' },
          limit: 5,
        },
        emptyState: {
          title: 'No Upcoming Reviews',
          description: 'No performance reviews scheduled',
          icon: 'Calendar',
        },
        actions: [
          {
            id: 'view-all-reviews',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            config: {
              type: 'navigate',
              route: '/employee/hr/performance',
            },
          },
        ],
      },

      // Recent Hires Timeline
      {
        id: 'recent-hires',
        type: 'table',
        title: 'Recent Hires',
        icon: 'Users',
        columns_config: recentHiresColumns,
        dataSource: {
          type: 'list',
          entityType: 'employee',
          filter: { recentHire: true },
          sort: { field: 'hireDate', direction: 'desc' },
          limit: 5,
        },
        actions: [
          {
            id: 'view-all-employees',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            config: {
              type: 'navigate',
              route: '/employee/hr/people',
            },
          },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'add-employee',
      label: 'Add Employee',
      type: 'navigate',
      variant: 'primary',
      icon: 'UserPlus',
      config: {
        type: 'navigate',
        route: '/employee/hr/people/onboard',
      },
    },
    {
      id: 'run-payroll',
      label: 'Run Payroll',
      type: 'navigate',
      variant: 'secondary',
      icon: 'DollarSign',
      config: {
        type: 'navigate',
        route: '/employee/hr/payroll',
      },
    },
    {
      id: 'generate-report',
      label: 'Reports',
      type: 'navigate',
      variant: 'secondary',
      icon: 'FileText',
      config: {
        type: 'navigate',
        route: '/employee/hr/reports',
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [{ label: 'HR' }],
  },
};

export default hrDashboardScreen;
