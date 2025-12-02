/**
 * Academy My Learning Screen
 *
 * User's enrolled courses, progress, and completed courses.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const academyMyLearningScreen: ScreenDefinition = {
  id: 'academy-my-learning',
  type: 'list',
  title: 'My Learning',
  subtitle: 'Track your learning progress',
  icon: 'GraduationCap',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.academy.getMyEnrollments',
      params: {},
    },
    pagination: true,
    pageSize: 12,
  },

  layout: {
    type: 'tabs',
    defaultTab: 'in-progress',
    tabs: [
      // ===========================================
      // IN PROGRESS TAB
      // ===========================================
      {
        id: 'in-progress',
        label: 'In Progress',
        badge: { type: 'count', path: 'stats.inProgressCount' },
        icon: 'Play',
        sections: [
          {
            id: 'in-progress-courses',
            type: 'custom',
            component: 'CourseCardsGrid',
            componentProps: {
              layout: 'grid',
              columns: 3,
              showProgress: true,
              showContinueButton: true,
              showLastAccessed: true,
            },
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.academy.getMyEnrollments',
                params: { status: 'in_progress' },
              },
            },
            rowClick: { type: 'navigate', route: '/training/courses/{{courseId}}/lessons/{{nextLessonId}}' },
            emptyState: {
              title: 'No courses in progress',
              description: 'Start a course to begin learning.',
              icon: 'Play',
              action: {
                id: 'browse-courses',
                label: 'Browse Courses',
                type: 'navigate',
                variant: 'primary',
                config: { type: 'navigate', route: '/training/courses' },
              },
            },
          },
        ],
      },

      // ===========================================
      // COMPLETED TAB
      // ===========================================
      {
        id: 'completed',
        label: 'Completed',
        badge: { type: 'count', path: 'stats.completedCount' },
        icon: 'CheckCircle',
        sections: [
          {
            id: 'completed-courses',
            type: 'custom',
            component: 'CourseCardsGrid',
            componentProps: {
              layout: 'grid',
              columns: 3,
              showCompletedDate: true,
              showXPEarned: true,
              showCertificateBadge: true,
            },
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.academy.getMyEnrollments',
                params: { status: 'completed' },
              },
            },
            rowClick: { type: 'navigate', route: '/training/courses/{{courseId}}' },
            emptyState: {
              title: 'No completed courses',
              description: 'Courses you complete will appear here.',
              icon: 'CheckCircle',
            },
          },
        ],
      },

      // ===========================================
      // CERTIFICATES TAB
      // ===========================================
      {
        id: 'certificates',
        label: 'Certificates',
        badge: { type: 'count', path: 'stats.certificatesCount' },
        icon: 'Award',
        sections: [
          {
            id: 'certificates-grid',
            type: 'custom',
            component: 'CertificatesGrid',
            componentProps: {
              layout: 'grid',
              columns: 3,
              showDownload: true,
              showShare: true,
            },
            dataSource: {
              type: 'custom',
              query: { procedure: 'portal.academy.getMyCertificates' },
            },
            emptyState: {
              title: 'No certificates earned',
              description: 'Complete courses with certifications to earn certificates.',
              icon: 'Award',
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'browse-courses',
      label: 'Browse Courses',
      type: 'navigate',
      icon: 'BookOpen',
      variant: 'primary',
      config: { type: 'navigate', route: '/training/courses' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Training Academy', route: '/training' },
      { label: 'My Learning', active: true },
    ],
  },
};

export default academyMyLearningScreen;
