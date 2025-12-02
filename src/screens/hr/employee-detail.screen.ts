/**
 * Employee Detail Screen Definition
 *
 * Metadata-driven detail screen for employee profiles.
 * Features sidebar + main content with tabbed navigation.
 */

import type { ScreenDefinition, TabDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS (for badges/status)
// ==========================================

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
] as const;

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'fte', label: 'Full-Time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
  { value: 'part_time', label: 'Part-Time' },
] as const;

const WORK_MODE_OPTIONS = [
  { value: 'on_site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

const TIME_OFF_TYPE_OPTIONS = [
  { value: 'pto', label: 'PTO' },
  { value: 'sick', label: 'Sick' },
  { value: 'personal', label: 'Personal' },
  { value: 'parental', label: 'Parental' },
] as const;

const TIME_OFF_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
] as const;

const GOAL_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const;

const DOCUMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'expired', label: 'Expired' },
] as const;

const COMPLIANCE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
] as const;

// ==========================================
// TAB DEFINITIONS
// ==========================================

const overviewTab: TabDefinition = {
  id: 'overview',
  label: 'Overview',
  icon: 'User',
  sections: [
    {
      id: 'personal-info',
      type: 'info-card',
      title: 'Personal Information',
      columns: 2,
      fields: [
        { id: 'firstName', label: 'First Name', type: 'text', path: 'firstName' },
        { id: 'lastName', label: 'Last Name', type: 'text', path: 'lastName' },
        { id: 'email', label: 'Email', type: 'email', path: 'email' },
        { id: 'phone', label: 'Phone', type: 'phone', path: 'phone' },
      ],
    },
    {
      id: 'employment-info',
      type: 'info-card',
      title: 'Employment',
      columns: 2,
      fields: [
        { id: 'employeeNumber', label: 'Employee #', type: 'text', path: 'employeeNumber' },
        { id: 'department', label: 'Department', type: 'text', path: 'department' },
        { id: 'hireDate', label: 'Hire Date', type: 'date', path: 'hireDate' },
        {
          id: 'employmentType',
          label: 'Type',
          type: 'enum',
          path: 'employmentType',
          config: { options: EMPLOYMENT_TYPE_OPTIONS },
        },
        {
          id: 'workMode',
          label: 'Work Mode',
          type: 'enum',
          path: 'workMode',
          config: { options: WORK_MODE_OPTIONS },
        },
      ],
    },
  ],
};

const timeOffTab: TabDefinition = {
  id: 'time-off',
  label: 'Time Off',
  icon: 'Calendar',
  sections: [
    {
      id: 'balances',
      type: 'metrics-grid',
      title: 'Current Balances',
      columns: 4,
      fields: [
        { id: 'ptoAvailable', label: 'PTO Available', type: 'number', path: 'ptoBalance.available' },
        { id: 'ptoUsed', label: 'PTO Used', type: 'number', path: 'ptoBalance.used' },
        { id: 'sickAvailable', label: 'Sick Available', type: 'number', path: 'sickBalance.available' },
        { id: 'sickUsed', label: 'Sick Used', type: 'number', path: 'sickBalance.used' },
      ],
    },
    {
      id: 'time-off-history',
      type: 'table',
      title: 'Request History',
      columns_config: [
        {
          id: 'type',
          label: 'Type',
          path: 'type',
          type: 'enum',
          config: { options: TIME_OFF_TYPE_OPTIONS },
        },
        { id: 'startDate', label: 'Start', path: 'startDate', type: 'date' },
        { id: 'endDate', label: 'End', path: 'endDate', type: 'date' },
        { id: 'hours', label: 'Hours', path: 'hours', type: 'number' },
        {
          id: 'status',
          label: 'Status',
          path: 'status',
          type: 'enum',
          config: {
            options: TIME_OFF_STATUS_OPTIONS,
            badgeColors: { pending: 'yellow', approved: 'green', denied: 'red' },
          },
        },
      ],
      dataSource: {
        type: 'related',
        entityType: 'timeoff',
        relation: 'timeOffRequests',
      },
    },
  ],
};

const performanceTab: TabDefinition = {
  id: 'performance',
  label: 'Performance',
  icon: 'Target',
  sections: [
    {
      id: 'goals',
      type: 'table',
      title: 'Performance Goals',
      columns_config: [
        { id: 'goal', label: 'Goal', path: 'goal', type: 'text' },
        { id: 'category', label: 'Category', path: 'category', type: 'text' },
        { id: 'targetDate', label: 'Target Date', path: 'targetDate', type: 'date' },
        {
          id: 'status',
          label: 'Status',
          path: 'status',
          type: 'enum',
          config: {
            options: GOAL_STATUS_OPTIONS,
            badgeColors: { not_started: 'gray', in_progress: 'blue', completed: 'green' },
          },
        },
      ],
      dataSource: {
        type: 'related',
        entityType: 'performance',
        relation: 'performanceGoals',
      },
    },
  ],
};

const documentsTab: TabDefinition = {
  id: 'documents',
  label: 'Documents',
  icon: 'FileText',
  sections: [
    {
      id: 'documents-table',
      type: 'table',
      title: 'Employee Documents',
      columns_config: [
        { id: 'documentType', label: 'Type', path: 'documentType', type: 'text' },
        { id: 'fileName', label: 'File Name', path: 'fileName', type: 'text' },
        {
          id: 'status',
          label: 'Status',
          path: 'status',
          type: 'enum',
          config: {
            options: DOCUMENT_STATUS_OPTIONS,
            badgeColors: { pending: 'yellow', approved: 'green', expired: 'red' },
          },
        },
        { id: 'issueDate', label: 'Issue Date', path: 'issueDate', type: 'date' },
        { id: 'expiryDate', label: 'Expiry Date', path: 'expiryDate', type: 'date' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'employee',
        relation: 'documents',
      },
    },
  ],
};

const complianceTab: TabDefinition = {
  id: 'compliance',
  label: 'Compliance',
  icon: 'Shield',
  sections: [
    {
      id: 'compliance-items',
      type: 'table',
      title: 'Compliance Requirements',
      columns_config: [
        { id: 'requirement', label: 'Requirement', path: 'requirement.name', type: 'text' },
        { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date' },
        {
          id: 'status',
          label: 'Status',
          path: 'status',
          type: 'enum',
          config: {
            options: COMPLIANCE_STATUS_OPTIONS,
            badgeColors: { pending: 'yellow', completed: 'green', overdue: 'red' },
          },
        },
        { id: 'completedAt', label: 'Completed', path: 'completedAt', type: 'date' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'compliance',
        relation: 'complianceItems',
      },
    },
  ],
};

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const employeeDetailScreen: ScreenDefinition = {
  id: 'employee-detail',
  type: 'detail',
  entityType: 'employee',

  title: { type: 'field', path: 'fullName' },
  subtitle: { type: 'field', path: 'jobTitle' },
  icon: 'User',

  // Data source
  dataSource: {
    type: 'entity',
    entityType: 'employee',
    entityId: { type: 'param', path: 'id' },
  },

  // Layout: Sidebar + Tabs
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebar: {
      id: 'sidebar',
      type: 'info-card',
      title: 'Profile',
      fields: [
        { id: 'fullName', type: 'text', path: 'fullName', label: 'Name' },
        { id: 'jobTitle', type: 'text', path: 'jobTitle', label: 'Title' },
        {
          id: 'status',
          type: 'enum',
          path: 'status',
          label: 'Status',
          config: {
            options: EMPLOYMENT_STATUS_OPTIONS,
            badgeColors: {
              onboarding: 'yellow',
              active: 'green',
              on_leave: 'orange',
              terminated: 'red',
            },
          },
        },
        { id: 'employeeNumber', label: 'Employee #', type: 'text', path: 'employeeNumber' },
        { id: 'department', label: 'Department', type: 'text', path: 'department' },
        { id: 'manager', label: 'Manager', type: 'text', path: 'manager.fullName' },
        { id: 'hireDate', label: 'Hire Date', type: 'date', path: 'hireDate' },
        { id: 'email', label: 'Email', type: 'email', path: 'email' },
        { id: 'phone', label: 'Phone', type: 'phone', path: 'phone' },
      ],
    },
    tabs: [overviewTab, timeOffTab, performanceTab, documentsTab, complianceTab],
    defaultTab: 'overview',
  },

  // Header Actions
  actions: [
    {
      id: 'edit',
      label: 'Edit',
      type: 'navigate',
      variant: 'secondary',
      icon: 'Pencil',
      config: {
        type: 'navigate',
        route: '/employee/hr/people/{{id}}/edit',
      },
    },
    {
      id: 'message',
      label: 'Message',
      type: 'modal',
      variant: 'secondary',
      icon: 'MessageSquare',
      config: {
        type: 'modal',
        modal: 'SendMessageModal',
        props: { employeeId: { type: 'param', path: 'id' } },
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Directory',
      route: '/employee/hr/people',
    },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Employee Directory', route: '/employee/hr/people' },
      { label: { type: 'field', path: 'fullName' } },
    ],
  },
};

export default employeeDetailScreen;
