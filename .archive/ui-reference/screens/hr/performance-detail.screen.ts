/**
 * Performance Review Detail Screen Definition
 *
 * Metadata-driven screen for viewing individual performance review.
 */

import type { ScreenDefinition, TabDefinition } from '@/lib/metadata';

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

const RATING_OPTIONS = [
  { value: '1', label: '1 - Needs Improvement' },
  { value: '2', label: '2 - Below Expectations' },
  { value: '3', label: '3 - Meets Expectations' },
  { value: '4', label: '4 - Exceeds Expectations' },
  { value: '5', label: '5 - Outstanding' },
];

// ==========================================
// TAB DEFINITIONS
// ==========================================

const selfAssessmentTab: TabDefinition = {
  id: 'self-assessment',
  label: 'Self Assessment',
  icon: 'User',
  sections: [
    {
      id: 'self-ratings',
      type: 'table',
      title: 'Competency Ratings',
      columns_config: [
        { id: 'competency', label: 'Competency', path: 'competency', type: 'text' },
        {
          id: 'rating',
          label: 'Self Rating',
          path: 'selfRating',
          type: 'enum',
          config: { options: RATING_OPTIONS },
        },
        { id: 'comments', label: 'Comments', path: 'selfComments', type: 'text' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'performance',
        relation: 'competencyRatings',
      },
    },
    {
      id: 'self-summary',
      type: 'info-card',
      title: 'Summary',
      fields: [
        { id: 'achievements', label: 'Key Achievements', type: 'text', path: 'selfAssessment.achievements' },
        { id: 'challenges', label: 'Challenges', type: 'text', path: 'selfAssessment.challenges' },
        { id: 'development', label: 'Development Goals', type: 'text', path: 'selfAssessment.developmentGoals' },
      ],
    },
  ],
};

const managerReviewTab: TabDefinition = {
  id: 'manager-review',
  label: 'Manager Review',
  icon: 'UserCheck',
  sections: [
    {
      id: 'manager-ratings',
      type: 'table',
      title: 'Competency Ratings',
      columns_config: [
        { id: 'competency', label: 'Competency', path: 'competency', type: 'text' },
        {
          id: 'selfRating',
          label: 'Self Rating',
          path: 'selfRating',
          type: 'enum',
          config: { options: RATING_OPTIONS },
        },
        {
          id: 'managerRating',
          label: 'Manager Rating',
          path: 'managerRating',
          type: 'enum',
          config: { options: RATING_OPTIONS },
        },
        { id: 'comments', label: 'Manager Comments', path: 'managerComments', type: 'text' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'performance',
        relation: 'competencyRatings',
      },
    },
    {
      id: 'manager-summary',
      type: 'info-card',
      title: 'Manager Summary',
      fields: [
        { id: 'strengths', label: 'Strengths', type: 'text', path: 'managerReview.strengths' },
        { id: 'improvements', label: 'Areas for Improvement', type: 'text', path: 'managerReview.improvements' },
        { id: 'recommendations', label: 'Recommendations', type: 'text', path: 'managerReview.recommendations' },
      ],
    },
  ],
};

const goalsTab: TabDefinition = {
  id: 'goals',
  label: 'Goals',
  icon: 'Target',
  sections: [
    {
      id: 'goals-table',
      type: 'table',
      title: 'Performance Goals',
      columns_config: [
        { id: 'goal', label: 'Goal', path: 'goal', type: 'text' },
        { id: 'category', label: 'Category', path: 'category', type: 'text' },
        { id: 'weight', label: 'Weight', path: 'weightPercent', type: 'percentage' },
        { id: 'targetDate', label: 'Target Date', path: 'targetDate', type: 'date' },
        {
          id: 'status',
          label: 'Status',
          path: 'status',
          type: 'enum',
          config: {
            options: GOAL_STATUS_OPTIONS,
            badgeColors: { not_started: 'gray', in_progress: 'blue', completed: 'green', cancelled: 'red' },
          },
        },
        {
          id: 'rating',
          label: 'Rating',
          path: 'rating',
          type: 'enum',
          config: { options: RATING_OPTIONS },
        },
      ],
      dataSource: {
        type: 'related',
        entityType: 'performance',
        relation: 'goals',
      },
    },
  ],
};

const feedbackTab: TabDefinition = {
  id: 'feedback',
  label: 'Feedback',
  icon: 'MessageSquare',
  sections: [
    {
      id: 'feedback-table',
      type: 'table',
      title: 'Feedback History',
      columns_config: [
        { id: 'date', label: 'Date', path: 'createdAt', type: 'date', sortable: true },
        { id: 'from', label: 'From', path: 'fromUser.fullName', type: 'text' },
        { id: 'type', label: 'Type', path: 'feedbackType', type: 'text' },
        { id: 'content', label: 'Feedback', path: 'content', type: 'text' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'performance',
        relation: 'feedback',
      },
    },
  ],
};

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const performanceDetailScreen: ScreenDefinition = {
  id: 'performance-detail',
  type: 'detail',
  entityType: 'performance',

  title: { type: 'field', path: 'employee.fullName' },
  subtitle: { type: 'field', path: 'period' },
  icon: 'Target',

  // Data source
  dataSource: {
    type: 'entity',
    entityType: 'performance',
    entityId: { type: 'param', path: 'id' },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebar: {
      id: 'review-info',
      type: 'info-card',
      title: 'Review Information',
      fields: [
        { id: 'employee', label: 'Employee', type: 'text', path: 'employee.fullName' },
        { id: 'manager', label: 'Manager', type: 'text', path: 'manager.fullName' },
        { id: 'period', label: 'Review Period', type: 'text', path: 'period' },
        { id: 'dueDate', label: 'Due Date', type: 'date', path: 'dueDate' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: REVIEW_STATUS_OPTIONS,
            badgeColors: { draft: 'gray', in_progress: 'blue', pending_review: 'yellow', completed: 'green' },
          },
        },
        { id: 'overallRating', label: 'Overall Rating', type: 'text', path: 'overallRating' },
        { id: 'selfComplete', label: 'Self Assessment', type: 'text', path: 'selfAssessmentStatus' },
        { id: 'managerComplete', label: 'Manager Review', type: 'text', path: 'managerReviewStatus' },
      ],
    },
    tabs: [selfAssessmentTab, managerReviewTab, goalsTab, feedbackTab],
    defaultTab: 'self-assessment',
  },

  // Header actions
  actions: [
    {
      id: 'complete-self',
      label: 'Complete Self Assessment',
      type: 'modal',
      variant: 'primary',
      icon: 'Edit',
      config: {
        type: 'modal',
        modal: 'SelfAssessmentModal',
        props: { reviewId: { type: 'param', path: 'id' } },
      },
      visible: {
        type: 'condition',
        condition: { field: 'selfAssessmentStatus', operator: 'ne', value: 'completed' },
      },
    },
    {
      id: 'complete-manager',
      label: 'Complete Manager Review',
      type: 'modal',
      variant: 'primary',
      icon: 'CheckCircle',
      config: {
        type: 'modal',
        modal: 'ManagerReviewModal',
        props: { reviewId: { type: 'param', path: 'id' } },
      },
      visible: {
        type: 'condition',
        condition: { field: 'managerReviewStatus', operator: 'ne', value: 'completed' },
      },
    },
    {
      id: 'add-feedback',
      label: 'Add Feedback',
      type: 'modal',
      variant: 'secondary',
      icon: 'MessageSquare',
      config: {
        type: 'modal',
        modal: 'AddFeedbackModal',
        props: { reviewId: { type: 'param', path: 'id' } },
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Performance', route: '/employee/hr/performance' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Performance', route: '/employee/hr/performance' },
      { label: { type: 'field', path: 'employee.fullName' } },
    ],
  },
};

export default performanceDetailScreen;
