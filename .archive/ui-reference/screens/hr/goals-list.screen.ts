/**
 * Goals List Screen Definition
 *
 * Metadata-driven screen for managing employee performance goals.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const GOAL_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const GOAL_CATEGORY_OPTIONS = [
  { value: 'performance', label: 'Performance' },
  { value: 'development', label: 'Development' },
  { value: 'learning', label: 'Learning' },
  { value: 'project', label: 'Project' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'teamwork', label: 'Teamwork' },
];

const GOAL_PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const PERIOD_OPTIONS = [
  { value: 'q1', label: 'Q1' },
  { value: 'q2', label: 'Q2' },
  { value: 'q3', label: 'Q3' },
  { value: 'q4', label: 'Q4' },
  { value: 'annual', label: 'Annual' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const goalsListScreen: ScreenDefinition = {
  id: 'goals-list',
  type: 'list',
  entityType: 'performance',

  title: 'Performance Goals',
  subtitle: 'Manage employee goals and objectives',
  icon: 'Target',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'performance',
    sort: { field: 'targetDate', direction: 'asc' },
    pagination: true,
    limit: 25,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Status Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'totalGoals', label: 'Total Goals', type: 'number', path: 'stats.totalGoals' },
          { id: 'onTrack', label: 'On Track', type: 'number', path: 'stats.onTrack' },
          { id: 'atRisk', label: 'At Risk', type: 'number', path: 'stats.atRisk' },
          { id: 'completed', label: 'Completed', type: 'number', path: 'stats.completed' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'performance',
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        fields: [
          { id: 'search', label: 'Search', type: 'text', path: 'search', config: { placeholder: 'Search goals...' } },
          { id: 'status', label: 'Status', type: 'multiselect', path: 'filters.status', options: [...GOAL_STATUS_OPTIONS] },
          { id: 'category', label: 'Category', type: 'multiselect', path: 'filters.category', options: [...GOAL_CATEGORY_OPTIONS] },
          { id: 'period', label: 'Period', type: 'select', path: 'filters.period', options: [...PERIOD_OPTIONS] },
        ],
      },
      // Goals Table
      {
        id: 'goals-table',
        type: 'table',
        title: 'Goals',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'goal', label: 'Goal', path: 'title', type: 'text', sortable: true },
          {
            id: 'category',
            label: 'Category',
            path: 'category',
            type: 'enum',
            config: {
              options: GOAL_CATEGORY_OPTIONS,
              badgeColors: {
                performance: 'blue',
                development: 'purple',
                learning: 'cyan',
                project: 'green',
                leadership: 'orange',
                teamwork: 'yellow',
              },
            },
          },
          {
            id: 'priority',
            label: 'Priority',
            path: 'priority',
            type: 'enum',
            sortable: true,
            config: {
              options: GOAL_PRIORITY_OPTIONS,
              badgeColors: { high: 'red', medium: 'yellow', low: 'gray' },
            },
          },
          { id: 'weight', label: 'Weight', path: 'weightPercent', type: 'percentage' },
          { id: 'targetDate', label: 'Target Date', path: 'targetDate', type: 'date', sortable: true },
          { id: 'progress', label: 'Progress', path: 'progressPercent', type: 'percentage' },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            sortable: true,
            config: {
              options: GOAL_STATUS_OPTIONS,
              badgeColors: {
                not_started: 'gray',
                in_progress: 'blue',
                on_track: 'green',
                at_risk: 'orange',
                completed: 'green',
                cancelled: 'gray',
              },
            },
          },
        ],
      },
      // Overdue Goals Table
      {
        id: 'overdue-table',
        type: 'table',
        title: 'Overdue Goals',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'goal', label: 'Goal', path: 'title', type: 'text' },
          { id: 'targetDate', label: 'Target Date', path: 'targetDate', type: 'date', sortable: true },
          { id: 'daysOverdue', label: 'Days Overdue', path: 'daysOverdue', type: 'number', sortable: true },
          { id: 'manager', label: 'Manager', path: 'employee.manager.fullName', type: 'text' },
        ],
        dataSource: {
          type: 'list',
          entityType: 'performance',
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create-goal',
      label: 'Create Goal',
      type: 'modal',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'CreateGoalModal',
        props: {},
      },
    },
    {
      id: 'bulk-review',
      label: 'Review Selected',
      type: 'modal',
      variant: 'secondary',
      icon: 'CheckSquare',
      config: {
        type: 'modal',
        modal: 'BulkGoalReviewModal',
        props: { goalIds: { type: 'context', path: 'selectedIds' } },
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
        handler: 'handleExportGoals',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Performance', route: '/employee/hr/performance' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Performance', route: '/employee/hr/performance' },
      { label: 'Goals' },
    ],
  },
};

export default goalsListScreen;
