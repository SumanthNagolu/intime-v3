/**
 * Performance List Screen Definition
 *
 * Metadata-driven screen for managing performance reviews and goals.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const REVIEW_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'completed', label: 'Completed' },
];

const GOAL_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const performanceListScreen: ScreenDefinition = {
  id: 'performance-list',
  type: 'list',
  entityType: 'performance',

  title: 'Performance Management',
  subtitle: 'Manage reviews, goals, and feedback',
  icon: 'Target',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'performance',
    sort: { field: 'createdAt', direction: 'desc' },
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
          { id: 'pendingReviews', label: 'Pending Reviews', type: 'number', path: 'stats.pendingReviews' },
          { id: 'completedThisCycle', label: 'Completed', type: 'number', path: 'stats.completedThisCycle' },
          { id: 'avgRating', label: 'Avg Rating', type: 'number', path: 'stats.avgRating' },
          { id: 'activeGoals', label: 'Active Goals', type: 'number', path: 'stats.activeGoals' },
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
          { id: 'search', label: 'Search', type: 'text', path: 'search', config: { placeholder: 'Search employees...' } },
          { id: 'status', label: 'Status', type: 'multiselect', path: 'filters.status', options: [...REVIEW_STATUS_OPTIONS] },
        ],
      },
      // Reviews Table
      {
        id: 'reviews-table',
        type: 'table',
        title: 'Performance Reviews',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'period', label: 'Review Period', path: 'period', type: 'text', sortable: true },
          { id: 'manager', label: 'Manager', path: 'manager.fullName', type: 'text' },
          { id: 'overallRating', label: 'Rating', path: 'overallRating', type: 'number' },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            sortable: true,
            config: {
              options: REVIEW_STATUS_OPTIONS,
              badgeColors: {
                draft: 'gray',
                in_progress: 'blue',
                pending_review: 'yellow',
                completed: 'green',
              },
            },
          },
          { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date', sortable: true },
        ],
      },
      // Goals Table
      {
        id: 'goals-table',
        type: 'table',
        title: 'Active Goals',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'goal', label: 'Goal', path: 'goal', type: 'text' },
          { id: 'targetDate', label: 'Target Date', path: 'targetDate', type: 'date', sortable: true },
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
                completed: 'green',
                cancelled: 'red',
              },
            },
          },
        ],
        dataSource: {
          type: 'related',
          entityType: 'performance',
          relation: 'goals',
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'start-cycle',
      label: 'Start Review Cycle',
      type: 'modal',
      variant: 'primary',
      icon: 'Play',
      config: {
        type: 'modal',
        modal: 'StartReviewCycleModal',
      },
    },
    {
      id: 'add-goal',
      label: 'Add Goal',
      type: 'modal',
      variant: 'secondary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'AddGoalModal',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Performance' },
    ],
  },
};

export default performanceListScreen;
