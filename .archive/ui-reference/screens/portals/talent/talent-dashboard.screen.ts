/**
 * Candidate/Talent Portal Dashboard Screen
 *
 * Main entry point for candidates showing:
 * - Welcome banner
 * - Profile completeness indicator
 * - Quick stats (Applications, Interviews, Offers)
 * - Application status updates
 * - Recommended jobs
 * - Upcoming interviews
 *
 * @see docs/specs/20-USER-ROLES/12-candidate-portal/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const talentDashboardScreen: ScreenDefinition = {
  id: 'talent-dashboard',
  type: 'dashboard',
  title: { type: 'template', template: 'Welcome, {{user.firstName}}' },
  icon: 'LayoutDashboard',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'profile', procedure: 'portal.talent.getProfileSummary' },
      { key: 'stats', procedure: 'portal.talent.getDashboardStats' },
      { key: 'applications', procedure: 'portal.talent.getRecentApplications' },
      { key: 'recommendedJobs', procedure: 'portal.talent.getRecommendedJobs' },
      { key: 'upcomingInterviews', procedure: 'portal.talent.getUpcomingInterviews' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // PROFILE COMPLETENESS BANNER
      // ===========================================
      {
        id: 'profile-completeness',
        type: 'custom',
        component: 'ProfileCompletenessBanner',
        componentProps: {
          showSections: true,
          showRecommendations: true,
        },
        visible: { field: 'profile.completeness', operator: 'lt', value: 100 },
        actions: [
          {
            id: 'complete-profile',
            label: 'Complete Profile',
            type: 'navigate',
            icon: 'User',
            variant: 'primary',
            config: { type: 'navigate', route: '/talent/profile' },
          },
        ],
      },

      // ===========================================
      // QUICK STATS
      // ===========================================
      {
        id: 'quick-stats',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'active-applications',
            label: 'Active Applications',
            type: 'number',
            path: 'stats.activeApplications',
            config: {
              icon: 'FileText',
              color: 'blue',
              clickAction: { type: 'navigate', route: '/talent/applications' },
            },
          },
          {
            id: 'interviews-scheduled',
            label: 'Interviews Scheduled',
            type: 'number',
            path: 'stats.interviewsScheduled',
            config: {
              icon: 'Calendar',
              color: 'purple',
              clickAction: { type: 'navigate', route: '/talent/interviews' },
            },
          },
          {
            id: 'offers-pending',
            label: 'Offers Pending',
            type: 'number',
            path: 'stats.offersPending',
            config: {
              icon: 'Gift',
              color: 'green',
              clickAction: { type: 'navigate', route: '/talent/offers' },
            },
          },
          {
            id: 'saved-jobs',
            label: 'Saved Jobs',
            type: 'number',
            path: 'stats.savedJobs',
            config: {
              icon: 'Bookmark',
              color: 'orange',
              clickAction: { type: 'navigate', route: '/talent/saved' },
            },
          },
        ],
      },

      // ===========================================
      // APPLICATION STATUS UPDATES
      // ===========================================
      {
        id: 'application-updates',
        type: 'list',
        title: 'Application Updates',
        dataSource: { type: 'field', path: 'applications' },
        config: {
          layout: 'cards',
          maxItems: 5,
          fields: [
            { id: 'jobTitle', path: 'jobTitle' },
            { id: 'company', path: 'company' },
            { id: 'status', path: 'status', type: 'enum' },
            { id: 'lastActivity', path: 'lastActivityAt', type: 'datetime' },
          ],
        },
        emptyState: {
          title: 'No applications yet',
          description: 'Start applying to jobs to see your applications here.',
          icon: 'FileText',
          action: {
            id: 'browse-jobs',
            label: 'Browse Jobs',
            type: 'navigate',
            variant: 'primary',
            config: { type: 'navigate', route: '/talent/jobs' },
          },
        },
        actions: [
          {
            id: 'view-all-applications',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/talent/applications' },
          },
        ],
      },

      // ===========================================
      // UPCOMING INTERVIEWS
      // ===========================================
      {
        id: 'upcoming-interviews',
        type: 'list',
        title: 'Upcoming Interviews',
        visible: { field: 'upcomingInterviews.length', operator: 'gt', value: 0 },
        dataSource: { type: 'field', path: 'upcomingInterviews' },
        config: {
          layout: 'cards',
          maxItems: 3,
          fields: [
            { id: 'company', path: 'company' },
            { id: 'position', path: 'jobTitle' },
            { id: 'date', path: 'scheduledAt', type: 'datetime' },
            { id: 'type', path: 'interviewType' },
          ],
        },
        actions: [
          {
            id: 'view-all-interviews',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/talent/interviews' },
          },
        ],
      },

      // ===========================================
      // RECOMMENDED JOBS
      // ===========================================
      {
        id: 'recommended-jobs',
        type: 'custom',
        title: 'Recommended for You',
        component: 'JobCardsCarousel',
        componentProps: {
          showMatchScore: true,
          showQuickApply: true,
          maxItems: 6,
        },
        actions: [
          {
            id: 'view-all-jobs',
            label: 'Browse All Jobs',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/talent/jobs' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'search-jobs',
      label: 'Search Jobs',
      type: 'navigate',
      icon: 'Search',
      variant: 'primary',
      config: { type: 'navigate', route: '/talent/jobs' },
    },
    {
      id: 'update-profile',
      label: 'Update Profile',
      type: 'navigate',
      icon: 'User',
      variant: 'outline',
      config: { type: 'navigate', route: '/talent/profile' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Dashboard', active: true },
    ],
  },
};

export default talentDashboardScreen;
