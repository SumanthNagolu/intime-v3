/**
 * Academy Achievements Screen
 *
 * Badges, achievements, and streak history.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const academyAchievementsScreen: ScreenDefinition = {
  id: 'academy-achievements',
  type: 'dashboard',
  title: 'Achievements',
  subtitle: 'Your badges and milestones',
  icon: 'Trophy',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'stats', procedure: 'portal.academy.getAchievementStats' },
      { key: 'badges', procedure: 'portal.academy.getBadges' },
      { key: 'streakHistory', procedure: 'portal.academy.getStreakHistory' },
      { key: 'xpHistory', procedure: 'portal.academy.getXPHistory' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // ACHIEVEMENT STATS
      // ===========================================
      {
        id: 'achievement-stats',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'total-badges',
            label: 'Badges Earned',
            type: 'number',
            path: 'stats.totalBadges',
            config: {
              suffix: { type: 'template', template: ' / {{stats.availableBadges}}' },
              icon: 'Medal',
              color: 'gold',
            },
          },
          {
            id: 'longest-streak',
            label: 'Longest Streak',
            type: 'number',
            path: 'stats.longestStreak',
            config: { suffix: ' days', icon: 'Flame', color: 'orange' },
          },
          {
            id: 'current-streak',
            label: 'Current Streak',
            type: 'number',
            path: 'stats.currentStreak',
            config: { suffix: ' days', icon: 'Zap', color: 'orange' },
          },
          {
            id: 'rank',
            label: 'Current Rank',
            type: 'text',
            path: 'stats.rank.title',
            config: { icon: 'Star', color: 'purple' },
          },
        ],
      },

      // ===========================================
      // BADGES EARNED
      // ===========================================
      {
        id: 'badges-earned',
        type: 'custom',
        title: 'Badges Earned',
        component: 'BadgesGrid',
        componentProps: {
          showEarned: true,
          showLocked: true,
          showProgress: true,
          layout: 'grid',
          columns: 6,
        },
      },

      // ===========================================
      // BADGES IN PROGRESS
      // ===========================================
      {
        id: 'badges-in-progress',
        type: 'custom',
        title: 'In Progress',
        component: 'BadgesProgressList',
        componentProps: {
          showProgressBar: true,
          showRemainingCriteria: true,
          maxItems: 6,
        },
      },

      // ===========================================
      // STREAK HISTORY
      // ===========================================
      {
        id: 'streak-history',
        type: 'custom',
        title: 'Streak History',
        collapsible: true,
        component: 'StreakCalendar',
        componentProps: {
          months: 3,
          showLegend: true,
          highlightCurrentStreak: true,
        },
      },

      // ===========================================
      // XP HISTORY CHART
      // ===========================================
      {
        id: 'xp-history',
        type: 'custom',
        title: 'XP Progress',
        collapsible: true,
        component: 'XPProgressChart',
        componentProps: {
          period: '30d',
          showCumulative: true,
          showRankMilestones: true,
        },
      },

      // ===========================================
      // RANK PROGRESSION
      // ===========================================
      {
        id: 'rank-progression',
        type: 'custom',
        title: 'Rank Progression',
        collapsible: true,
        defaultExpanded: false,
        component: 'RankProgressionTimeline',
        componentProps: {
          showCurrentRank: true,
          showNextRank: true,
          showAllRanks: true,
        },
      },
    ],
  },

  navigation: {
    breadcrumbs: [
      { label: 'Training Academy', route: '/training' },
      { label: 'Achievements', active: true },
    ],
  },
};

export default academyAchievementsScreen;
