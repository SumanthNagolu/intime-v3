/**
 * Onboarding Detail Screen Definition
 *
 * Metadata-driven screen for individual employee onboarding.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
];

const TASK_CATEGORY_OPTIONS = [
  { value: 'paperwork', label: 'Paperwork' },
  { value: 'it_setup', label: 'IT Setup' },
  { value: 'training', label: 'Training' },
  { value: 'introductions', label: 'Introductions' },
  { value: 'compliance', label: 'Compliance' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const onboardingDetailScreen: ScreenDefinition = {
  id: 'onboarding-detail',
  type: 'detail',
  entityType: 'onboarding',

  title: { type: 'field', path: 'employee.fullName' },
  subtitle: 'Onboarding Progress',
  icon: 'UserPlus',

  // Data source
  dataSource: {
    type: 'entity',
    entityType: 'onboarding',
    entityId: { type: 'param', path: 'id' },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebar: {
      id: 'sidebar',
      type: 'info-card',
      title: 'Overview',
      fields: [
        { id: 'employeeName', label: 'Employee', type: 'text', path: 'employee.fullName' },
        { id: 'department', label: 'Department', type: 'text', path: 'employee.department' },
        { id: 'manager', label: 'Manager', type: 'text', path: 'employee.manager.fullName' },
        { id: 'startDate', label: 'Start Date', type: 'date', path: 'startDate' },
        { id: 'expectedEnd', label: 'Expected End', type: 'date', path: 'expectedEndDate' },
        { id: 'progress', label: 'Progress', type: 'percentage', path: 'progressPercent' },
      ],
    },
    sections: [
      // Tasks Table
      {
        id: 'tasks-table',
        type: 'table',
        title: 'Onboarding Tasks',
        columns_config: [
          { id: 'task', label: 'Task', path: 'name', type: 'text' },
          {
            id: 'category',
            label: 'Category',
            path: 'category',
            type: 'enum',
            config: { options: TASK_CATEGORY_OPTIONS },
          },
          { id: 'assignedTo', label: 'Assigned To', path: 'assignedTo.fullName', type: 'text' },
          { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date' },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: TASK_STATUS_OPTIONS,
              badgeColors: {
                pending: 'yellow',
                in_progress: 'blue',
                completed: 'green',
                skipped: 'gray',
              },
            },
          },
          { id: 'completedAt', label: 'Completed', path: 'completedAt', type: 'date' },
        ],
        dataSource: {
          type: 'related',
          entityType: 'onboarding',
          relation: 'tasks',
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'add-task',
      label: 'Add Task',
      type: 'modal',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'AddOnboardingTaskModal',
        props: { onboardingId: { type: 'param', path: 'id' } },
      },
    },
    {
      id: 'complete',
      label: 'Complete Onboarding',
      type: 'mutation',
      variant: 'secondary',
      icon: 'CheckCircle',
      config: {
        type: 'mutation',
        procedure: 'hr.onboarding.complete',
        input: { id: { type: 'param', path: 'id' } },
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Queue', route: '/employee/hr/onboarding' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Onboarding', route: '/employee/hr/onboarding' },
      { label: { type: 'field', path: 'employee.fullName' } },
    ],
  },
};

export default onboardingDetailScreen;
