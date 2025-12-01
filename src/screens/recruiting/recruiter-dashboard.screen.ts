/**
 * Recruiter Dashboard Screen
 * 
 * Main entry point for Technical Recruiters showing:
 * - Sprint Progress with 6 key metrics
 * - Today's Priorities (overdue, due today, high priority)
 * - Pipeline Health with alerts
 * - Account Portfolio with health indicators
 * - Activity Summary (trailing 7 days)
 * - Quality Metrics (trailing 30 days)
 * - Upcoming Calendar
 * - Recent Wins
 * 
 * @see docs/specs/20-USER-ROLES/01-recruiter/24-recruiter-dashboard.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const recruiterDashboardScreen: ScreenDefinition = {
  id: 'recruiter-dashboard',
  type: 'dashboard',
  title: 'My Dashboard',
  subtitle: { type: 'context', path: 'user.fullName' },
  icon: 'LayoutDashboard',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'sprintMetrics', procedure: 'dashboard.getSprintProgress' },
      { key: 'tasks', procedure: 'dashboard.getTasks' },
      { key: 'pipelineHealth', procedure: 'dashboard.getPipelineHealth' },
      { key: 'accountHealth', procedure: 'dashboard.getAccountHealth' },
      { key: 'activitySummary', procedure: 'dashboard.getActivitySummary' },
      { key: 'qualityMetrics', procedure: 'dashboard.getQualityMetrics' },
      { key: 'upcomingCalendar', procedure: 'dashboard.getUpcomingCalendar' },
      { key: 'recentWins', procedure: 'dashboard.getRecentWins' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // SPRINT PROGRESS WIDGET
      // ===========================================
      {
        id: 'sprint-progress',
        type: 'custom',
        title: 'Sprint Progress',
        description: { type: 'field', path: 'sprintMetrics.sprintName' },
        component: 'SprintProgressWidget',
        componentProps: {
          showDaysRemaining: true,
          showOnTrackIndicator: true,
        },
        config: {
          metrics: [
            {
              id: 'placements',
              label: 'Placements',
              current: { type: 'field', path: 'sprintMetrics.placements.current' },
              target: { type: 'field', path: 'sprintMetrics.placements.target' },
              colorThresholds: { green: 100, yellow: 50, red: 0 },
              icon: 'Trophy',
            },
            {
              id: 'revenue',
              label: 'Revenue',
              current: { type: 'field', path: 'sprintMetrics.revenue.current' },
              target: { type: 'field', path: 'sprintMetrics.revenue.target' },
              format: 'currency',
              colorThresholds: { green: 100, yellow: 70, red: 0 },
              icon: 'DollarSign',
            },
            {
              id: 'submissions',
              label: 'Submissions',
              current: { type: 'field', path: 'sprintMetrics.submissions.current' },
              target: { type: 'field', path: 'sprintMetrics.submissions.target' },
              colorThresholds: { green: 100, yellow: 80, red: 0 },
              icon: 'Send',
            },
            {
              id: 'interviews',
              label: 'Interviews',
              current: { type: 'field', path: 'sprintMetrics.interviews.current' },
              target: { type: 'field', path: 'sprintMetrics.interviews.target' },
              colorThresholds: { green: 100, yellow: 67, red: 0 },
              icon: 'Video',
            },
            {
              id: 'candidates',
              label: 'Candidates Sourced',
              current: { type: 'field', path: 'sprintMetrics.candidates.current' },
              target: { type: 'field', path: 'sprintMetrics.candidates.target' },
              colorThresholds: { green: 100, yellow: 90, red: 0 },
              icon: 'UserPlus',
            },
            {
              id: 'jobFill',
              label: 'Job Fill Rate',
              current: { type: 'field', path: 'sprintMetrics.jobFill.current' },
              target: { type: 'field', path: 'sprintMetrics.jobFill.target' },
              format: 'percentage',
              colorThresholds: { green: 50, yellow: 30, red: 0 },
              icon: 'Briefcase',
            },
          ],
        },
      },

      // ===========================================
      // TODAY'S PRIORITIES WIDGET
      // ===========================================
      {
        id: 'todays-priorities',
        type: 'custom',
        title: "Today's Priorities",
        component: 'ActivityQueueWidget',
        componentProps: {
          groupBy: 'urgency',
          groups: [
            { id: 'overdue', label: '⚠️ OVERDUE', filter: { overdue: true } },
            { id: 'due-today', label: '📅 DUE TODAY', filter: { dueToday: true } },
            { id: 'high-priority', label: '📌 HIGH PRIORITY', filter: { priority: 'high' } },
          ],
          maxItemsPerGroup: 5,
          showCompleteButton: true,
          showRescheduleButton: true,
        },
        actions: [
          {
            id: 'view-all-tasks',
            label: 'View All Tasks',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/employee/workspace/tasks' },
          },
        ],
      },

      // ===========================================
      // PIPELINE HEALTH WIDGET
      // ===========================================
      {
        id: 'pipeline-health',
        type: 'info-card',
        title: 'Pipeline Health',
        fields: [
          { 
            id: 'active-jobs',
            type: 'field', 
            path: 'pipelineHealth.activeJobs', 
            label: 'Active Jobs',
            widget: 'MetricWithBreakdown',
            config: {
              breakdown: [
                { label: 'urgent', path: 'pipelineHealth.urgentJobs', color: 'red' },
                { label: 'high', path: 'pipelineHealth.highPriorityJobs', color: 'orange' },
              ],
            },
          },
          { 
            id: 'candidates-sourcing',
            type: 'field', 
            path: 'pipelineHealth.candidatesSourcing', 
            label: 'Candidates Sourcing',
            config: { note: 'need follow-up' },
          },
          { 
            id: 'submissions-pending',
            type: 'field', 
            path: 'pipelineHealth.submissionsPending', 
            label: 'Submissions Pending',
            config: { note: 'awaiting feedback' },
          },
          { 
            id: 'interviews-this-week',
            type: 'field', 
            path: 'pipelineHealth.interviewsThisWeek', 
            label: 'Interviews This Week',
            widget: 'MetricWithBreakdown',
            config: {
              breakdown: [
                { label: 'need scheduling', path: 'pipelineHealth.interviewsNeedScheduling' },
              ],
            },
          },
          { 
            id: 'offers-outstanding',
            type: 'field', 
            path: 'pipelineHealth.offersOutstanding', 
            label: 'Offers Outstanding',
            config: { note: 'needs follow-up' },
          },
          { 
            id: 'placements-active',
            type: 'field', 
            path: 'pipelineHealth.placementsActive', 
            label: 'Placements Active',
            widget: 'MetricWithBreakdown',
            config: {
              breakdown: [
                { label: 'due for check-in', path: 'pipelineHealth.placementsDueCheckin' },
              ],
            },
          },
        ],
        actions: [
          {
            id: 'view-pipeline-details',
            label: 'View Details',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/employee/workspace/submissions' },
          },
        ],
      },

      // ===========================================
      // URGENT ATTENTION ALERTS
      // ===========================================
      {
        id: 'urgent-alerts',
        type: 'custom',
        title: '🔥 Urgent Attention Needed',
        component: 'AlertList',
        componentProps: {
          alerts: [
            {
              condition: { field: 'pipelineHealth.staleJobs', operator: 'gt', value: 0 },
              template: '{{count}} jobs over 14 days old with weak pipeline',
              severity: 'critical',
              action: { type: 'navigate', route: '/employee/workspace/jobs', filter: { stale: true } },
            },
            {
              condition: { field: 'pipelineHealth.overdueFeedback', operator: 'gt', value: 0 },
              template: '{{count}} interview feedbacks overdue',
              severity: 'warning',
              action: { type: 'navigate', route: '/employee/workspace/interviews', filter: { feedbackOverdue: true } },
            },
          ],
        },
        visible: {
          type: 'condition',
          condition: { 
            operator: 'or', 
            conditions: [
              { field: 'pipelineHealth.staleJobs', operator: 'gt', value: 0 },
              { field: 'pipelineHealth.overdueFeedback', operator: 'gt', value: 0 },
            ],
          },
        },
      },

      // ===========================================
      // ACCOUNT PORTFOLIO WIDGET
      // ===========================================
      {
        id: 'account-portfolio',
        type: 'table',
        title: 'Account Portfolio',
        dataSource: {
          type: 'field',
          path: 'accountHealth.accounts',
        },
        columns_config: [
          { 
            id: 'health-indicator',
            header: '',
            path: 'healthScore',
            type: 'health-indicator',
            width: '30px',
            config: {
              thresholds: { green: 70, yellow: 40, red: 0 },
            },
          },
          { 
            id: 'name', 
            header: 'Account', 
            path: 'name',
            width: '30%',
          },
          { 
            id: 'jobs', 
            header: 'Jobs', 
            path: 'activeJobs',
            type: 'number',
          },
          { 
            id: 'ytd-revenue', 
            header: 'YTD Revenue', 
            path: 'ytdRevenue',
            type: 'currency',
          },
          { 
            id: 'nps', 
            header: 'NPS', 
            path: 'nps',
            type: 'nps-score',
          },
          { 
            id: 'last-contact', 
            header: 'Last Contact', 
            path: 'lastContactAt',
            type: 'datetime',
            config: { relative: true },
          },
          { 
            id: 'status', 
            header: 'Status', 
            path: 'status',
            type: 'account-health-badge',
          },
        ],
        config: {
          rowClick: { type: 'navigate', route: '/employee/workspace/accounts/{{id}}' },
          sortBy: 'healthScore',
          sortDirection: 'asc',
          emptyState: 'No accounts assigned',
        },
        actions: [
          {
            id: 'view-all-accounts',
            label: 'View All Accounts',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/employee/workspace/accounts' },
          },
        ],
      },

      // ===========================================
      // ACTIVITY SUMMARY (Last 7 Days)
      // ===========================================
      {
        id: 'activity-summary',
        type: 'metrics-grid',
        title: 'Activity Summary (Last 7 Days)',
        columns: 4,
        fields: [
          {
            id: 'calls-logged',
            label: 'Calls Logged',
            type: 'number',
            path: 'activitySummary.calls',
            config: {
              target: { type: 'field', path: 'activitySummary.callsTarget' },
              avg: { type: 'field', path: 'activitySummary.callsAvgPerDay' },
              icon: 'Phone',
            },
          },
          {
            id: 'emails-sent',
            label: 'Emails Sent',
            type: 'number',
            path: 'activitySummary.emails',
            config: {
              target: { type: 'field', path: 'activitySummary.emailsTarget' },
              avg: { type: 'field', path: 'activitySummary.emailsAvgPerDay' },
              icon: 'Mail',
            },
          },
          {
            id: 'meetings',
            label: 'Meetings',
            type: 'number',
            path: 'activitySummary.meetings',
            config: {
              breakdown: '{{client}} client, {{internal}} internal',
              icon: 'Calendar',
            },
          },
          {
            id: 'candidates-sourced',
            label: 'Candidates Sourced',
            type: 'number',
            path: 'activitySummary.candidatesSourced',
            config: {
              target: { type: 'field', path: 'activitySummary.candidatesTarget' },
              statusLabel: { type: 'field', path: 'activitySummary.candidatesStatus' },
              icon: 'UserPlus',
            },
          },
          {
            id: 'phone-screens',
            label: 'Phone Screens',
            type: 'number',
            path: 'activitySummary.phoneScreens',
            config: {
              target: { type: 'field', path: 'activitySummary.phoneScreensTarget' },
              statusLabel: { type: 'field', path: 'activitySummary.phoneScreensStatus' },
              icon: 'PhoneCall',
            },
          },
          {
            id: 'submissions-sent',
            label: 'Submissions Sent',
            type: 'number',
            path: 'activitySummary.submissionsSent',
            config: {
              target: { type: 'field', path: 'activitySummary.submissionsTarget' },
              statusLabel: { type: 'field', path: 'activitySummary.submissionsStatus' },
              icon: 'Send',
            },
          },
          {
            id: 'interviews-scheduled',
            label: 'Interviews Scheduled',
            type: 'number',
            path: 'activitySummary.interviewsScheduled',
            config: {
              target: { type: 'field', path: 'activitySummary.interviewsTarget' },
              statusLabel: { type: 'field', path: 'activitySummary.interviewsStatus' },
              icon: 'Video',
            },
          },
        ],
        actions: [
          {
            id: 'view-all-activities',
            label: 'View All',
            type: 'navigate',
            variant: 'ghost',
            icon: 'ArrowRight',
            config: { type: 'navigate', route: '/employee/workspace/activities' },
          },
        ],
      },

      // ===========================================
      // QUALITY METRICS (Last 30 Days)
      // ===========================================
      {
        id: 'quality-metrics',
        type: 'metrics-grid',
        title: 'Quality Metrics (Last 30 Days)',
        columns: 3,
        fields: [
          {
            id: 'time-to-submit',
            label: 'Time-to-Submit',
            type: 'number',
            path: 'qualityMetrics.timeToSubmit',
            config: {
              suffix: ' hours',
              target: 48,
              icon: 'Clock',
              status: { type: 'field', path: 'qualityMetrics.timeToSubmitStatus' },
            },
          },
          {
            id: 'time-to-fill',
            label: 'Time-to-Fill',
            type: 'number',
            path: 'qualityMetrics.timeToFill',
            config: {
              suffix: ' days',
              target: 21,
              icon: 'Calendar',
              status: { type: 'field', path: 'qualityMetrics.timeToFillStatus' },
            },
          },
          {
            id: 'submission-quality',
            label: 'Submission Quality',
            type: 'percentage',
            path: 'qualityMetrics.submissionQuality',
            config: {
              note: '→ Interview',
              target: 30,
              icon: 'Target',
              status: { type: 'field', path: 'qualityMetrics.submissionQualityStatus' },
            },
          },
          {
            id: 'interview-to-offer',
            label: 'Interview-to-Offer',
            type: 'percentage',
            path: 'qualityMetrics.interviewToOffer',
            config: {
              target: 40,
              icon: 'TrendingUp',
              status: { type: 'field', path: 'qualityMetrics.interviewToOfferStatus' },
            },
          },
          {
            id: 'offer-acceptance',
            label: 'Offer Acceptance',
            type: 'percentage',
            path: 'qualityMetrics.offerAcceptance',
            config: {
              target: 85,
              icon: 'CheckCircle',
              status: { type: 'field', path: 'qualityMetrics.offerAcceptanceStatus' },
            },
          },
          {
            id: 'thirty-day-retention',
            label: '30-Day Retention',
            type: 'percentage',
            path: 'qualityMetrics.thirtyDayRetention',
            config: {
              target: 95,
              icon: 'Users',
              status: { type: 'field', path: 'qualityMetrics.thirtyDayRetentionStatus' },
            },
          },
        ],
        footer: {
          type: 'quality-score',
          label: 'Overall Quality Score',
          value: { type: 'field', path: 'qualityMetrics.overallScore' },
          maxValue: 100,
        },
      },

      // ===========================================
      // UPCOMING CALENDAR
      // ===========================================
      {
        id: 'upcoming-calendar',
        type: 'custom',
        title: 'Upcoming Calendar',
        component: 'CalendarWidget',
        componentProps: {
          view: 'agenda',
          daysToShow: 3,
          showTodayHighlight: true,
          groupByDay: true,
        },
        actions: [
          {
            id: 'view-calendar',
            label: 'View Calendar',
            type: 'navigate',
            variant: 'ghost',
            icon: 'Calendar',
            config: { type: 'navigate', route: '/employee/workspace/calendar' },
          },
        ],
      },

      // ===========================================
      // RECENT WINS
      // ===========================================
      {
        id: 'recent-wins',
        type: 'custom',
        title: '🎉 Recent Wins',
        component: 'WinsList',
        componentProps: {
          maxItems: 4,
          showDate: true,
          categories: ['placement', 'offer', 'testimonial', 'target_hit'],
        },
        visible: {
          type: 'condition',
          condition: { field: 'recentWins.length', operator: 'gt', value: 0 },
        },
      },
    ],
  },

  actions: [
    {
      id: 'refresh',
      label: 'Refresh',
      type: 'function',
      icon: 'RefreshCw',
      variant: 'ghost',
      config: { type: 'function', handler: 'refreshDashboard' },
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      type: 'modal',
      icon: 'Plus',
      variant: 'default',
      config: { type: 'modal', modal: 'log-activity' },
    },
    {
      id: 'add-candidate',
      label: 'Add Candidate',
      type: 'modal',
      icon: 'UserPlus',
      variant: 'default',
      config: { type: 'modal', modal: 'candidate-create' },
    },
    {
      id: 'create-job',
      label: 'Create Job',
      type: 'navigate',
      icon: 'Briefcase',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/jobs/new' },
    },
    {
      id: 'settings',
      label: 'Settings',
      type: 'modal',
      icon: 'Settings',
      variant: 'ghost',
      config: { type: 'modal', modal: 'dashboard-settings' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Dashboard', active: true },
    ],
  },

  keyboard_shortcuts: [
    { key: 'g d', action: 'navigate', description: 'Go to dashboard' },
    { key: 'r', action: 'refresh', description: 'Refresh dashboard' },
    { key: '1-9', action: 'jumpToWidget', description: 'Jump to widget by number' },
    { key: 't', action: 'viewTasks', description: 'View tasks' },
    { key: 'c', action: 'viewCalendar', description: 'View calendar' },
  ],
};

export default recruiterDashboardScreen;
