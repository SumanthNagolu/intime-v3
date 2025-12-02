/**
 * Employee List Screen Definition
 *
 * Metadata-driven screen for listing and managing employees.
 * Employee directory with filtering, sorting, and bulk actions.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
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

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const employeeTableColumns: TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Employee',
    path: 'fullName',
    type: 'text',
    sortable: true,
    width: '220px',
    config: {
      avatar: { path: 'avatarUrl', fallback: 'initials' },
      subtitle: { path: 'jobTitle' },
    },
  },
  {
    id: 'department',
    label: 'Department',
    path: 'department',
    type: 'text',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
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
  {
    id: 'employmentType',
    label: 'Type',
    path: 'employmentType',
    type: 'enum',
    sortable: true,
    config: {
      options: EMPLOYMENT_TYPE_OPTIONS,
      badgeColors: {
        fte: 'blue',
        contractor: 'purple',
        intern: 'cyan',
        part_time: 'gray',
      },
    },
  },
  {
    id: 'email',
    label: 'Email',
    path: 'email',
    type: 'email',
  },
  {
    id: 'manager',
    label: 'Manager',
    path: 'manager.fullName',
    type: 'text',
  },
  {
    id: 'hireDate',
    label: 'Hire Date',
    path: 'hireDate',
    type: 'date',
    sortable: true,
  },
  {
    id: 'workMode',
    label: 'Work Mode',
    path: 'workMode',
    type: 'enum',
    config: {
      options: WORK_MODE_OPTIONS,
      badgeColors: {
        on_site: 'blue',
        remote: 'green',
        hybrid: 'purple',
      },
    },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const employeeListScreen: ScreenDefinition = {
  id: 'employee-list',
  type: 'list',
  entityType: 'employee',

  title: 'Employee Directory',
  subtitle: 'Manage employees and organizational structure',
  icon: 'Users',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'employee',
    sort: { field: 'fullName', direction: 'asc' },
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
          {
            id: 'totalEmployees',
            label: 'Total',
            type: 'number',
            path: 'stats.total',
          },
          {
            id: 'activeEmployees',
            label: 'Active',
            type: 'number',
            path: 'stats.active',
          },
          {
            id: 'onboardingEmployees',
            label: 'Onboarding',
            type: 'number',
            path: 'stats.onboarding',
          },
          {
            id: 'onLeaveEmployees',
            label: 'On Leave',
            type: 'number',
            path: 'stats.onLeave',
          },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'employee',
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        fields: [
          {
            id: 'search',
            label: 'Search',
            type: 'text',
            path: 'search',
            config: { placeholder: 'Search by name, email, or employee number...' },
          },
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            path: 'filters.status',
            options: [...EMPLOYMENT_STATUS_OPTIONS],
          },
          {
            id: 'employmentType',
            label: 'Type',
            type: 'multiselect',
            path: 'filters.employmentType',
            options: [...EMPLOYMENT_TYPE_OPTIONS],
          },
          {
            id: 'workMode',
            label: 'Work Mode',
            type: 'multiselect',
            path: 'filters.workMode',
            options: [...WORK_MODE_OPTIONS],
          },
        ],
      },
      // Table
      {
        id: 'employees-table',
        type: 'table',
        columns_config: employeeTableColumns,
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create',
      label: 'Add Employee',
      type: 'navigate',
      variant: 'primary',
      icon: 'UserPlus',
      config: {
        type: 'navigate',
        route: '/employee/hr/people/new',
      },
    },
    {
      id: 'import',
      label: 'Import',
      type: 'modal',
      variant: 'secondary',
      icon: 'Upload',
      config: {
        type: 'modal',
        modal: 'ImportEmployeesModal',
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
        handler: 'handleExport',
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Dashboard',
      route: '/employee/hr',
    },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Employee Directory' },
    ],
  },
};

export default employeeListScreen;
