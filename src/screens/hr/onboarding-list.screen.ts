/**
 * Onboarding List Screen Definition
 *
 * Metadata-driven screen for managing employee onboarding.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ONBOARDING_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const onboardingListScreen: ScreenDefinition = {
  id: 'onboarding-list',
  type: 'list',
  entityType: 'onboarding',

  title: 'Onboarding Queue',
  subtitle: 'Manage employee onboarding progress',
  icon: 'UserPlus',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'onboarding',
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
          { id: 'totalOnboarding', label: 'Total', type: 'number', path: 'stats.total' },
          { id: 'inProgress', label: 'In Progress', type: 'number', path: 'stats.inProgress' },
          { id: 'completed', label: 'Completed (MTD)', type: 'number', path: 'stats.completed' },
          { id: 'avgDays', label: 'Avg. Days', type: 'number', path: 'stats.avgDays' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'onboarding',
        },
      },
      // Table
      {
        id: 'onboarding-table',
        type: 'table',
        title: 'Onboarding Employees',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'startDate', label: 'Start Date', path: 'startDate', type: 'date', sortable: true },
          { id: 'manager', label: 'Manager', path: 'employee.manager.fullName', type: 'text' },
          { id: 'department', label: 'Department', path: 'employee.department', type: 'text' },
          { id: 'progress', label: 'Progress', path: 'progressPercent', type: 'percentage' },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: ONBOARDING_STATUS_OPTIONS,
              badgeColors: {
                not_started: 'gray',
                in_progress: 'blue',
                completed: 'green',
                blocked: 'red',
              },
            },
          },
          { id: 'dueDate', label: 'Due Date', path: 'expectedEndDate', type: 'date' },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'start-onboarding',
      label: 'Start Onboarding',
      type: 'modal',
      variant: 'primary',
      icon: 'UserPlus',
      config: {
        type: 'modal',
        modal: 'StartOnboardingModal',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Onboarding' },
    ],
  },
};

export default onboardingListScreen;
