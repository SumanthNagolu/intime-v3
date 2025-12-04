/**
 * Pod Overview Screen
 *
 * Shows pod summary with team members, health score, and key metrics.
 * Part of the manager's view of their pod.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const podOverviewScreen: ScreenDefinition = {
  id: 'pod-overview',
  type: 'detail',
  entityType: 'pod',
  title: { type: 'field', path: 'pod.name' },
  subtitle: 'Pod Overview',
  icon: 'Users',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'pod', procedure: 'pod.getById' },
      { key: 'members', procedure: 'pod.getMembers' },
      { key: 'metrics', procedure: 'pod.getMetrics' },
      { key: 'recentActivity', procedure: 'pod.getRecentActivity' },
      { key: 'healthScore', procedure: 'pod.getHealthScore' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // POD HEADER
      // ===========================================
      {
        id: 'pod-header',
        type: 'info-card',
        fields: [
          { id: 'name', label: 'Pod Name', path: 'pod.name', type: 'text' },
          { id: 'type', label: 'Type', path: 'pod.type', type: 'enum', config: {
            options: [
              { value: 'recruiting', label: 'Recruiting' },
              { value: 'bench_sales', label: 'Bench Sales' },
              { value: 'ta', label: 'Talent Acquisition' },
            ],
          }},
          { id: 'manager', label: 'Manager', path: 'pod.manager.fullName', type: 'user' },
          { id: 'memberCount', label: 'Team Size', path: 'pod.memberCount', type: 'number' },
          { id: 'createdAt', label: 'Created', path: 'pod.createdAt', type: 'date' },
        ],
      },

      // ===========================================
      // HEALTH SCORE
      // ===========================================
      {
        id: 'health-score',
        type: 'custom',
        component: 'PodHealthScoreWidget',
        componentProps: {
          score: { type: 'field', path: 'healthScore.overall' },
          breakdown: { type: 'field', path: 'healthScore.breakdown' },
          factors: [
            { id: 'placements', label: 'Placements', weight: 0.3 },
            { id: 'pipeline', label: 'Pipeline Health', weight: 0.25 },
            { id: 'activity', label: 'Activity Level', weight: 0.2 },
            { id: 'clientSat', label: 'Client Satisfaction', weight: 0.15 },
            { id: 'icRetention', label: 'IC Retention', weight: 0.1 },
          ],
        },
      },

      // ===========================================
      // KEY METRICS SUMMARY
      // ===========================================
      {
        id: 'key-metrics',
        type: 'metrics-grid',
        title: 'Key Metrics (Current Sprint)',
        columns: 4,
        fields: [
          {
            id: 'placements',
            label: 'Placements',
            type: 'number',
            path: 'metrics.placements',
            config: {
              target: { type: 'field', path: 'metrics.placementsTarget' },
              icon: 'Trophy',
              bgColor: 'bg-green-50',
            },
          },
          {
            id: 'submissions',
            label: 'Submissions',
            type: 'number',
            path: 'metrics.submissions',
            config: {
              target: { type: 'field', path: 'metrics.submissionsTarget' },
              icon: 'Send',
              bgColor: 'bg-blue-50',
            },
          },
          {
            id: 'pipeline-coverage',
            label: 'Coverage Ratio',
            type: 'text',
            path: 'metrics.pipelineCoverage',
            config: {
              icon: 'BarChart',
              bgColor: 'bg-indigo-50',
              suffix: 'x',
              target: 3,
            },
          },
          {
            id: 'active-jobs',
            label: 'Active Jobs',
            type: 'number',
            path: 'metrics.activeJobs',
            config: {
              icon: 'Briefcase',
              bgColor: 'bg-amber-50',
            },
          },
        ],
      },

      // ===========================================
      // TEAM MEMBERS GRID
      // ===========================================
      {
        id: 'team-members',
        type: 'custom',
        title: 'Team Members',
        component: 'TeamMemberGrid',
        componentProps: {
          dataPath: 'members',
          cardTemplate: {
            avatar: { type: 'field', path: 'avatarUrl' },
            name: { type: 'field', path: 'fullName' },
            role: { type: 'field', path: 'role' },
            tenure: { type: 'field', path: 'tenureDays' },
            sprintProgress: { type: 'field', path: 'sprintProgress' },
            status: { type: 'field', path: 'performanceStatus' },
          },
          statusColors: {
            on_track: 'green',
            at_risk: 'yellow',
            off_track: 'red',
          },
        },
        actions: [
          {
            id: 'schedule-team-meeting',
            label: 'Schedule Team Meeting',
            type: 'modal',
            icon: 'Calendar',
            variant: 'ghost',
            config: { type: 'modal', modal: 'schedule-team-meeting' },
          },
          {
            id: 'message-team',
            label: 'Message Team',
            type: 'modal',
            icon: 'MessageSquare',
            variant: 'ghost',
            config: { type: 'modal', modal: 'team-message' },
          },
        ],
      },

      // ===========================================
      // RECENT ACTIVITY FEED
      // ===========================================
      {
        id: 'recent-activity',
        type: 'custom',
        title: 'Recent Pod Activity',
        component: 'ActivityFeed',
        componentProps: {
          dataPath: 'recentActivity',
          maxItems: 15,
          groupByDay: true,
          showActor: true,
          activityTypes: [
            { type: 'placement', icon: 'Trophy', label: 'Placement' },
            { type: 'submission', icon: 'Send', label: 'Submission' },
            { type: 'interview', icon: 'Video', label: 'Interview' },
            { type: 'call', icon: 'Phone', label: 'Call' },
            { type: 'email', icon: 'Mail', label: 'Email' },
          ],
        },
        actions: [
          {
            id: 'view-full-timeline',
            label: 'View Full Timeline',
            type: 'navigate',
            icon: 'History',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/manager/pod/timeline' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'edit-pod',
      label: 'Edit Pod Settings',
      type: 'navigate',
      icon: 'Settings',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/manager/pod/settings' },
    },
    {
      id: 'export-report',
      label: 'Export Report',
      type: 'modal',
      icon: 'Download',
      variant: 'secondary',
      config: { type: 'modal', modal: 'export-pod-report' },
    },
    {
      id: 'go-to-dashboard',
      label: 'Back to Dashboard',
      type: 'navigate',
      icon: 'LayoutDashboard',
      variant: 'default',
      config: { type: 'navigate', route: '/employee/manager/dashboard' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: 'Pod Dashboard', route: '/employee/manager/dashboard' },
      { label: 'Pod Overview', active: true },
    ],
  },
};

export default podOverviewScreen;
