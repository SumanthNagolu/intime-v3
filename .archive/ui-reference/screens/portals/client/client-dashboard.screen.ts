/**
 * Client Portal Dashboard Screen
 *
 * Main entry point for Client Portal Users showing:
 * - Welcome banner with company info
 * - Quick stats (Active Jobs, Pending Submissions, Interviews, Placements)
 * - Pending Actions card
 * - Recent Activity feed
 * - Active Placements summary
 *
 * @see docs/specs/20-USER-ROLES/11-client-portal/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const clientDashboardScreen: ScreenDefinition = {
  id: 'client-dashboard',
  type: 'dashboard',
  title: 'Welcome back',
  subtitle: { type: 'context', path: 'user.companyName' },
  icon: 'LayoutDashboard',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'stats', procedure: 'portal.client.getDashboardStats' },
      { key: 'pendingActions', procedure: 'portal.client.getPendingActions' },
      { key: 'recentActivity', procedure: 'portal.client.getRecentActivity' },
      { key: 'activePlacements', procedure: 'portal.client.getActivePlacements' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // WELCOME BANNER
      // ===========================================
      {
        id: 'welcome-banner',
        type: 'custom',
        component: 'PortalWelcomeBanner',
        componentProps: {
          portalType: 'client',
          showContactInfo: true,
        },
      },

      // ===========================================
      // QUICK STATS ROW
      // ===========================================
      {
        id: 'quick-stats',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'active-jobs',
            label: 'Active Jobs',
            type: 'number',
            path: 'stats.activeJobs',
            config: {
              icon: 'Briefcase',
              color: 'blue',
              clickAction: { type: 'navigate', route: '/client/jobs' },
            },
          },
          {
            id: 'pending-submissions',
            label: 'Pending Submissions',
            type: 'number',
            path: 'stats.pendingSubmissions',
            config: {
              icon: 'Users',
              color: 'orange',
              clickAction: { type: 'navigate', route: '/client/submissions' },
            },
          },
          {
            id: 'upcoming-interviews',
            label: 'Upcoming Interviews',
            type: 'number',
            path: 'stats.upcomingInterviews',
            config: {
              icon: 'Calendar',
              color: 'purple',
              clickAction: { type: 'navigate', route: '/client/interviews' },
            },
          },
          {
            id: 'active-placements',
            label: 'Active Placements',
            type: 'number',
            path: 'stats.activePlacements',
            config: {
              icon: 'CheckCircle',
              color: 'green',
              clickAction: { type: 'navigate', route: '/client/placements' },
            },
          },
        ],
      },

      // ===========================================
      // PENDING ACTIONS
      // ===========================================
      {
        id: 'pending-actions',
        type: 'custom',
        title: 'Pending Actions',
        component: 'PendingActionsWidget',
        componentProps: {
          portalType: 'client',
          maxItems: 5,
          showUrgencyIndicator: true,
        },
        config: {
          categories: [
            { id: 'review', label: 'Candidates to Review', icon: 'UserCheck', color: 'blue' },
            { id: 'schedule', label: 'Interviews to Schedule', icon: 'CalendarPlus', color: 'purple' },
            { id: 'feedback', label: 'Feedback Needed', icon: 'MessageSquare', color: 'orange' },
            { id: 'approve', label: 'Timesheets to Approve', icon: 'ClipboardCheck', color: 'green' },
          ],
        },
        actions: [
          {
            id: 'view-all-actions',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/client/submissions' },
          },
        ],
      },

      // ===========================================
      // RECENT ACTIVITY
      // ===========================================
      {
        id: 'recent-activity',
        type: 'timeline',
        title: 'Recent Activity',
        dataSource: {
          type: 'field',
          path: 'recentActivity',
        },
        config: {
          maxItems: 8,
          showDate: true,
          groupByDay: false,
        },
        actions: [
          {
            id: 'view-all-activity',
            label: 'View All Activity',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/client/activity' },
          },
        ],
      },

      // ===========================================
      // ACTIVE PLACEMENTS SUMMARY
      // ===========================================
      {
        id: 'active-placements-table',
        type: 'table',
        title: 'Active Placements',
        dataSource: {
          type: 'field',
          path: 'activePlacements',
        },
        columns_config: [
          { id: 'consultant', header: 'Consultant', path: 'consultantName', type: 'text' },
          { id: 'role', header: 'Role', path: 'jobTitle', type: 'text' },
          { id: 'start-date', header: 'Start Date', path: 'startDate', type: 'date' },
          { id: 'end-date', header: 'End Date', path: 'endDate', type: 'date' },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: [
                { value: 'active', label: 'Active' },
                { value: 'ending_soon', label: 'Ending Soon' },
                { value: 'extended', label: 'Extended' },
              ],
              badgeColors: { active: 'green', ending_soon: 'orange', extended: 'blue' },
            },
          },
        ],
        rowClick: { type: 'navigate', route: '/client/placements/{{id}}' },
        emptyState: {
          title: 'No active placements',
          description: 'Your active placements will appear here once consultants are placed.',
          icon: 'Users',
        },
        actions: [
          {
            id: 'view-all-placements',
            label: 'View All Placements',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/client/placements' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'submit-job',
      label: 'Submit New Job',
      type: 'navigate',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'navigate', route: '/client/jobs/new' },
    },
    {
      id: 'contact-am',
      label: 'Contact Account Manager',
      type: 'modal',
      icon: 'MessageCircle',
      variant: 'outline',
      config: { type: 'modal', modal: 'ContactAccountManager' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Dashboard', active: true },
    ],
  },
};

export default clientDashboardScreen;
