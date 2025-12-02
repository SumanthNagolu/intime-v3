/**
 * Academy Portal Dashboard Screen
 *
 * Training portal dashboard with XP progress, streak, courses, and achievements.
 *
 * @see docs/specs/20-USER-ROLES/13-academy/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const academyDashboardScreen: ScreenDefinition = {
  id: 'academy-dashboard',
  type: 'dashboard',
  title: 'Mission Control',
  subtitle: { type: 'template', template: 'Welcome back, {{user.firstName}}' },
  icon: 'GraduationCap',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'progress', procedure: 'portal.academy.getProgressSummary' },
      { key: 'activeCourses', procedure: 'portal.academy.getActiveCourses' },
      { key: 'recommendations', procedure: 'portal.academy.getRecommendedCourses' },
      { key: 'achievements', procedure: 'portal.academy.getRecentAchievements' },
      { key: 'leaderboard', procedure: 'portal.academy.getLeaderboard' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // BIOMETRIC/GAMIFICATION HERO
      // ===========================================
      {
        id: 'progress-hero',
        type: 'custom',
        component: 'AcademyProgressHero',
        componentProps: {
          showReadinessScore: true,
          showXP: true,
          showStreak: true,
          showNextRankProgress: true,
        },
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
            id: 'readiness-score',
            label: 'Readiness Score',
            type: 'number',
            path: 'progress.readinessScore',
            config: { suffix: '%', icon: 'Target', color: 'green' },
          },
          {
            id: 'total-xp',
            label: 'Total XP',
            type: 'number',
            path: 'progress.totalXP',
            config: { icon: 'Star', color: 'gold' },
          },
          {
            id: 'streak',
            label: 'Day Streak',
            type: 'number',
            path: 'progress.streakDays',
            config: { icon: 'Zap', color: 'orange' },
          },
          {
            id: 'certificates',
            label: 'Certificates',
            type: 'number',
            path: 'progress.certificateCount',
            config: { icon: 'Award', color: 'purple' },
          },
        ],
      },

      // ===========================================
      // ACTIVE COURSES
      // ===========================================
      {
        id: 'active-courses',
        type: 'custom',
        title: 'Continue Learning',
        component: 'ActiveCoursesCarousel',
        componentProps: {
          showProgress: true,
          showXPReward: true,
          showContinueButton: true,
          maxItems: 4,
        },
        emptyState: {
          title: 'No courses in progress',
          description: 'Browse our course catalog to start learning.',
          icon: 'BookOpen',
          action: {
            id: 'browse-courses',
            label: 'Browse Courses',
            type: 'navigate',
            variant: 'primary',
            config: { type: 'navigate', route: '/training/courses' },
          },
        },
        actions: [
          {
            id: 'view-all-courses',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/training/my-learning' },
          },
        ],
      },

      // ===========================================
      // RECENTLY COMPLETED
      // ===========================================
      {
        id: 'recently-completed',
        type: 'list',
        title: 'Recently Completed',
        visible: { field: 'progress.recentlyCompleted.length', operator: 'gt', value: 0 },
        dataSource: { type: 'field', path: 'progress.recentlyCompleted' },
        config: {
          layout: 'horizontal',
          maxItems: 4,
          fields: [
            { id: 'title', path: 'title' },
            { id: 'completedAt', path: 'completedAt', type: 'date' },
            { id: 'xpEarned', path: 'xpEarned' },
          ],
        },
      },

      // ===========================================
      // ACHIEVEMENTS / BADGES
      // ===========================================
      {
        id: 'achievements',
        type: 'custom',
        title: 'Recent Achievements',
        component: 'AchievementsBadges',
        componentProps: {
          showRecent: true,
          showProgress: true,
          maxItems: 6,
        },
        actions: [
          {
            id: 'view-all-achievements',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/training/achievements' },
          },
        ],
      },

      // ===========================================
      // RECOMMENDED COURSES
      // ===========================================
      {
        id: 'recommendations',
        type: 'custom',
        title: 'Recommended for You',
        component: 'CourseCardsGrid',
        componentProps: {
          showDifficulty: true,
          showDuration: true,
          showXPReward: true,
          layout: 'grid',
          columns: 3,
          maxItems: 6,
        },
        actions: [
          {
            id: 'browse-catalog',
            label: 'Browse All Courses',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/training/courses' },
          },
        ],
      },

      // ===========================================
      // LEADERBOARD (OPTIONAL)
      // ===========================================
      {
        id: 'leaderboard',
        type: 'custom',
        title: 'Leaderboard',
        collapsible: true,
        defaultExpanded: false,
        visible: { field: 'leaderboard', operator: 'is_not_empty' },
        component: 'LeaderboardWidget',
        componentProps: {
          showTopN: 10,
          highlightCurrentUser: true,
          showXP: true,
          showRank: true,
        },
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
    {
      id: 'view-certificates',
      label: 'My Certificates',
      type: 'navigate',
      icon: 'Award',
      variant: 'outline',
      config: { type: 'navigate', route: '/training/certificates' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Training Academy', route: '/training' },
      { label: 'Dashboard', active: true },
    ],
  },
};

export default academyDashboardScreen;
