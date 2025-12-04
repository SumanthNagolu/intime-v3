/**
 * Pod Manager Dashboard Screen
 * 
 * Main entry point for Pod Managers showing:
 * - Sprint progress and pod goals
 * - Individual IC performance
 * - Escalations queue
 * - Approval queue
 * - Pod pipeline health
 * - Activity feed (RACI notifications)
 * - Coaching opportunities
 * 
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const podDashboardScreen: ScreenDefinition = {
  id: 'pod-dashboard',
  type: 'dashboard',
  title: 'Pod Dashboard',
  subtitle: { type: 'field', path: 'pod.name' },
  icon: 'LayoutTemplate',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'sprint', procedure: 'pod.getCurrentSprint' },
      { key: 'podMetrics', procedure: 'pod.getMetrics' },
      { key: 'icPerformance', procedure: 'pod.getICPerformance' },
      { key: 'escalations', procedure: 'pod.getEscalations' },
      { key: 'approvals', procedure: 'pod.getPendingApprovals' },
      { key: 'pipeline', procedure: 'pod.getPipelineHealth' },
      { key: 'raciNotifications', procedure: 'pod.getRACINotifications' },
      { key: 'coachingOpportunities', procedure: 'pod.getCoachingOpportunities' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // SPRINT HEADER
      // ===========================================
      {
        id: 'sprint-header',
        type: 'custom',
        component: 'SprintHeaderWidget',
        componentProps: {
          sprintData: { type: 'field', path: 'sprint' },
          showCountdown: true,
          showProgressBar: true,
          showGoalStatus: true,
          goals: [
            { label: 'Placements', current: { type: 'field', path: 'sprint.placements' }, target: { type: 'field', path: 'sprint.placementsTarget' } },
            { label: 'Submissions', current: { type: 'field', path: 'sprint.submissions' }, target: { type: 'field', path: 'sprint.submissionsTarget' } },
            { label: 'Revenue', current: { type: 'field', path: 'sprint.revenue' }, target: { type: 'field', path: 'sprint.revenueTarget' }, format: { type: 'currency' } },
          ],
        },
      },

      // ===========================================
      // POD METRICS OVERVIEW
      // ===========================================
      {
        id: 'pod-metrics',
        type: 'metrics-grid',
        title: 'Pod Performance (This Sprint)',
        columns: 5,
        fields: [
          {
            id: 'placements',
            label: 'Placements',
            type: 'number',
            path: 'podMetrics.placements',
            config: {
              target: { type: 'field', path: 'podMetrics.placementsTarget' },
              icon: 'Trophy',
              bgColor: 'bg-green-50',
            },
          },
          {
            id: 'submissions',
            label: 'Submissions',
            type: 'number',
            path: 'podMetrics.submissions',
            config: {
              target: { type: 'field', path: 'podMetrics.submissionsTarget' },
              icon: 'Send',
              bgColor: 'bg-blue-50',
            },
          },
          {
            id: 'interviews',
            label: 'Interviews',
            type: 'number',
            path: 'podMetrics.interviews',
            config: {
              icon: 'Video',
              bgColor: 'bg-purple-50',
            },
          },
          {
            id: 'pipeline-coverage',
            label: 'Pipeline Coverage',
            type: 'text',
            path: 'podMetrics.pipelineCoverage',
            config: {
              icon: 'BarChart',
              bgColor: 'bg-indigo-50',
              helpText: 'Pipeline / Target',
            },
          },
          {
            id: 'active-ics',
            label: 'Active ICs',
            type: 'number',
            path: 'podMetrics.activeICs',
            config: {
              icon: 'Users',
              bgColor: 'bg-amber-50',
            },
          },
        ],
      },

      // ===========================================
      // URGENT ITEMS (ESCALATIONS + APPROVALS)
      // ===========================================
      {
        id: 'urgent-items',
        type: 'custom',
        title: '🔴 Urgent Items',
        component: 'UrgentItemsWidget',
        componentProps: {
          sections: [
            {
              id: 'escalations',
              title: 'Escalations',
              dataPath: 'escalations',
              maxItems: 5,
              itemTemplate: {
                title: { type: 'field', path: 'title' },
                subtitle: { type: 'field', path: 'reporter.name' },
                priority: { type: 'field', path: 'priority' },
                age: { type: 'field', path: 'createdAt' },
              },
              actions: [
                { id: 'handle', label: 'Handle', type: 'navigate', config: { route: '/employee/workspace/escalations/{{id}}' } },
              ],
            },
            {
              id: 'approvals',
              title: 'Pending Approvals',
              dataPath: 'approvals',
              maxItems: 5,
              itemTemplate: {
                title: { type: 'field', path: 'title' },
                type: { type: 'field', path: 'approvalType' },
                requestedBy: { type: 'field', path: 'requestedBy.name' },
                urgency: { type: 'field', path: 'urgency' },
              },
              actions: [
                { id: 'approve', label: 'Approve', type: 'workflow', config: { workflow: 'approve-item' } },
                { id: 'reject', label: 'Reject', type: 'workflow', config: { workflow: 'reject-item' } },
                { id: 'review', label: 'Review', type: 'navigate', config: { route: '/employee/workspace/approvals/{{id}}' } },
              ],
            },
          ],
        },
        visible: {
          type: 'condition',
          condition: { 
            operator: 'or',
            conditions: [
              { field: 'escalations.length', operator: 'gt', value: 0 },
              { field: 'approvals.length', operator: 'gt', value: 0 },
            ],
          },
        },
        actions: [
          {
            id: 'view-all-escalations',
            label: 'View All Escalations',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/escalations' },
          },
        ],
      },

      // ===========================================
      // INDIVIDUAL IC PERFORMANCE
      // ===========================================
      {
        id: 'ic-performance',
        type: 'table',
        title: 'Individual Performance',
        dataSource: { type: 'field', path: 'icPerformance' },
        columns_config: [
          { 
            id: 'status-indicator',
            header: '',
            path: 'performanceStatus',
            type: 'performance-status-indicator',
            width: '30px',
            config: {
              thresholds: { green: 80, yellow: 60, red: 0 },
            },
          },
          { 
            id: 'name', 
            header: 'IC', 
            path: 'user.fullName',
            type: 'user-avatar-with-name',
          },
          { 
            id: 'placements', 
            header: 'Placements', 
            path: 'placements',
            type: 'fraction',
            config: { target: 'placementsTarget' },
          },
          { 
            id: 'submissions', 
            header: 'Submissions', 
            path: 'submissions',
            type: 'fraction',
            config: { target: 'submissionsTarget' },
          },
          { 
            id: 'pipeline', 
            header: 'Pipeline', 
            path: 'pipelineHealth',
            type: 'pipeline-mini-badge',
            config: {
              items: ['activeJobs', 'activeCandidates', 'pendingSubmissions'],
            },
          },
          { 
            id: 'activity', 
            header: 'Activity (7d)', 
            path: 'activityScore',
            type: 'activity-sparkline',
          },
          { 
            id: 'trend', 
            header: 'Trend', 
            path: 'performanceTrend',
            type: 'trend-indicator',
          },
          { 
            id: 'needs-attention', 
            header: '', 
            path: 'needsAttention',
            type: 'attention-badge',
            config: { 
              icon: 'AlertTriangle',
              tooltip: 'Needs coaching or support',
            },
          },
        ],
        rowClick: { type: 'modal', config: { modal: 'ic-detail-modal' } },
        actions: [
          {
            id: 'schedule-1on1',
            label: 'Schedule 1:1',
            type: 'modal',
            icon: 'Calendar',
            variant: 'ghost',
            config: { type: 'modal', modal: 'schedule-one-on-one' },
          },
          {
            id: 'send-message',
            label: 'Message Team',
            type: 'modal',
            icon: 'MessageSquare',
            variant: 'ghost',
            config: { type: 'modal', modal: 'team-message' },
          },
        ],
      },

      // ===========================================
      // COACHING OPPORTUNITIES
      // ===========================================
      {
        id: 'coaching-opportunities',
        type: 'custom',
        title: '📚 Coaching Opportunities',
        component: 'CoachingOpportunitiesWidget',
        componentProps: {
          dataPath: 'coachingOpportunities',
          maxItems: 5,
          itemTemplate: {
            icName: { type: 'field', path: 'user.name' },
            opportunity: { type: 'field', path: 'description' },
            category: { type: 'field', path: 'category' },
            priority: { type: 'field', path: 'priority' },
          },
          categories: [
            { id: 'low-submissions', label: 'Low Submissions', icon: 'Send' },
            { id: 'stale-pipeline', label: 'Stale Pipeline', icon: 'Clock' },
            { id: 'rejection-pattern', label: 'High Rejections', icon: 'XCircle' },
            { id: 'client-feedback', label: 'Client Feedback', icon: 'MessageSquare' },
            { id: 'skills-gap', label: 'Skills Gap', icon: 'BookOpen' },
          ],
        },
        visible: {
          type: 'condition',
          condition: { field: 'coachingOpportunities.length', operator: 'gt', value: 0 },
        },
      },

      // ===========================================
      // POD PIPELINE HEALTH
      // ===========================================
      {
        id: 'pipeline-health',
        type: 'custom',
        title: 'Pod Pipeline Health',
        component: 'PodPipelineWidget',
        componentProps: {
          dataPath: 'pipeline',
          showByStage: true,
          showByIC: true,
          stages: [
            { id: 'sourcing', label: 'Sourcing', color: 'gray' },
            { id: 'screening', label: 'Screening', color: 'blue' },
            { id: 'submitted', label: 'Submitted', color: 'purple' },
            { id: 'interviewing', label: 'Interviewing', color: 'indigo' },
            { id: 'offer', label: 'Offer', color: 'amber' },
          ],
          alerts: [
            { 
              condition: { field: 'staleJobs.count', operator: 'gt', value: 0 },
              severity: 'warning',
              message: '{{count}} jobs with no submissions in 7+ days',
            },
            { 
              condition: { field: 'staleCandidates.count', operator: 'gt', value: 0 },
              severity: 'warning',
              message: '{{count}} candidates with no activity in 5+ days',
            },
          ],
        },
        actions: [
          {
            id: 'view-pipeline',
            label: 'View Full Pipeline',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/submissions/pipeline' },
          },
        ],
      },

      // ===========================================
      // RACI NOTIFICATIONS (Consulted/Informed)
      // ===========================================
      {
        id: 'raci-notifications',
        type: 'custom',
        title: 'RACI Notifications',
        component: 'RACINotificationsFeed',
        componentProps: {
          dataPath: 'raciNotifications',
          maxItems: 10,
          showFilters: true,
          filters: [
            { id: 'all', label: 'All' },
            { id: 'consulted', label: 'Consulted (C)' },
            { id: 'informed', label: 'Informed (I)' },
          ],
          itemTemplate: {
            type: { type: 'field', path: 'raciRole' },
            entityType: { type: 'field', path: 'entityType' },
            title: { type: 'field', path: 'title' },
            description: { type: 'field', path: 'description' },
            ic: { type: 'field', path: 'actor.name' },
            timestamp: { type: 'field', path: 'createdAt' },
            actionRequired: { type: 'field', path: 'actionRequired' },
          },
          groupByDay: true,
        },
        actions: [
          {
            id: 'mark-all-read',
            label: 'Mark All Read',
            type: 'function',
            icon: 'CheckCheck',
            variant: 'ghost',
            config: { type: 'function', handler: 'markAllNotificationsRead' },
          },
        ],
      },

      // ===========================================
      // CLIENT HEALTH (STRATEGIC ACCOUNTS)
      // ===========================================
      {
        id: 'client-health',
        type: 'table',
        title: 'Strategic Account Health',
        dataSource: { 
          type: 'query',
          query: {
            procedure: 'pod.getStrategicAccounts',
          },
        },
        columns_config: [
          { 
            id: 'health',
            header: '',
            path: 'healthScore',
            type: 'health-indicator',
            width: '30px',
          },
          { 
            id: 'name', 
            header: 'Account', 
            path: 'name',
            config: { link: true, linkPath: '/employee/workspace/accounts/{{id}}' },
          },
          { 
            id: 'active-jobs', 
            header: 'Jobs', 
            path: 'activeJobs',
            type: 'number',
          },
          { 
            id: 'placements-ytd', 
            header: 'Placements YTD', 
            path: 'placementsYTD',
            type: 'number',
          },
          { 
            id: 'revenue-ytd', 
            header: 'Revenue YTD', 
            path: 'revenueYTD',
            type: 'currency',
          },
          { 
            id: 'last-contact', 
            header: 'Last Contact', 
            path: 'lastContactAt',
            type: 'relative-time',
            config: { warnIfStale: 14 },
          },
          { 
            id: 'nps', 
            header: 'NPS', 
            path: 'nps',
            type: 'nps-score',
          },
        ],
        emptyState: {
          title: 'No strategic accounts assigned',
          description: 'Strategic accounts will appear here when assigned to your pod',
        },
      },

      // ===========================================
      // UPCOMING MEETINGS
      // ===========================================
      {
        id: 'upcoming-meetings',
        type: 'custom',
        title: 'Upcoming Meetings',
        component: 'UpcomingMeetingsWidget',
        componentProps: {
          maxItems: 5,
          daysAhead: 7,
          meetingTypes: ['1on1', 'pod_standup', 'client_call', 'sprint_planning', 'cross_pod'],
        },
        actions: [
          {
            id: 'view-calendar',
            label: 'View Calendar',
            type: 'navigate',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/workspace/calendar' },
          },
        ],
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
      id: 'pod-standup',
      label: 'Start Standup',
      type: 'modal',
      icon: 'Users',
      variant: 'default',
      config: { type: 'modal', modal: 'pod-standup' },
    },
    {
      id: 'create-escalation',
      label: 'Create Escalation',
      type: 'modal',
      icon: 'AlertTriangle',
      variant: 'default',
      config: { type: 'modal', modal: 'escalation-create' },
    },
    {
      id: 'sprint-planning',
      label: 'Sprint Planning',
      type: 'navigate',
      icon: 'Target',
      variant: 'primary',
      config: { type: 'navigate', route: '/employee/workspace/sprints/current/planning' },
    },
    {
      id: 'reports',
      label: 'Pod Reports',
      type: 'navigate',
      icon: 'BarChart',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/reports/pod' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Pod Dashboard', active: true },
    ],
  },

  keyboard_shortcuts: [
    { key: 'g d', action: 'navigate', route: '/employee/workspace/pod', description: 'Go to dashboard' },
    { key: 'g e', action: 'navigate', route: '/employee/workspace/escalations', description: 'Go to escalations' },
    { key: 'g a', action: 'navigate', route: '/employee/workspace/approvals', description: 'Go to approvals' },
    { key: 'r', action: 'refresh', description: 'Refresh dashboard' },
    { key: 's', action: 'startStandup', description: 'Start standup' },
  ],
};

export default podDashboardScreen;
