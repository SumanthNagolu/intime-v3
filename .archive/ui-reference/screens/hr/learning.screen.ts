/**
 * HR Learning Screen Definition
 *
 * Metadata-driven screen for learning & development administration.
 * Uses custom component for course management and assignments.
 */

import type { ScreenDefinition } from '@/lib/metadata';

export const learningScreen: ScreenDefinition = {
  id: 'hr-learning',
  type: 'dashboard',

  title: 'Learning & Development',
  subtitle: 'Monitor training compliance and assign coursework',
  icon: 'GraduationCap',

  layout: {
    type: 'single-column',
    sections: [
      // Metrics Overview
      {
        id: 'learning-metrics',
        type: 'metrics-grid',
        columns: 3,
        fields: [
          {
            id: 'completionRate',
            label: 'Completion Rate',
            type: 'percentage',
            path: 'metrics.completionRate',
          },
          {
            id: 'activeLearners',
            label: 'Active Learners',
            type: 'number',
            path: 'metrics.activeLearners',
          },
          {
            id: 'certificationsIssued',
            label: 'Certifications Issued',
            type: 'number',
            path: 'metrics.certificationsIssued',
          },
        ],
        dataSource: {
          type: 'query',
          query: {
            procedure: 'hr.learning.getMetrics',
            params: {},
          },
        },
      },
      // Course Management
      {
        id: 'learning-admin',
        type: 'custom',
        component: 'LearningAdminPanel',
        componentProps: {
          showCatalog: true,
          showAssignments: true,
          showProgress: true,
        },
      },
    ],
  },

  actions: [
    {
      id: 'assign-course',
      label: 'Assign Course',
      type: 'modal',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'AssignCourseModal',
      },
    },
    {
      id: 'create-course',
      label: 'Create Course',
      type: 'navigate',
      variant: 'secondary',
      icon: 'BookPlus',
      config: {
        type: 'navigate',
        route: '/employee/hr/learning/new',
      },
    },
  ],

  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Learning & Development' },
    ],
  },
};

export default learningScreen;
