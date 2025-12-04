/**
 * IC Performance Detail Screen
 *
 * Detailed view of individual contributor performance for managers.
 * Shows metrics, pipeline, activities, 1:1 history, and coaching notes.
 *
 * Manager can monitor but NOT do the IC's work (per manager philosophy).
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const icPerformanceDetailScreen: ScreenDefinition = {
  id: 'ic-performance-detail',
  type: 'detail',
  entityType: 'employee',
  title: { type: 'field', path: 'ic.fullName' },
  subtitle: 'IC Performance Detail',
  icon: 'User',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'ic', procedure: 'users.getById', input: { id: { type: 'param', path: 'userId' } } },
      { key: 'performance', procedure: 'manager.getICPerformance', input: { userId: { type: 'param', path: 'userId' } } },
      { key: 'pipeline', procedure: 'manager.getICPipeline', input: { userId: { type: 'param', path: 'userId' } } },
      { key: 'activities', procedure: 'manager.getICActivities', input: { userId: { type: 'param', path: 'userId' } } },
      { key: 'oneOnOnes', procedure: 'manager.getICOneOnOnes', input: { userId: { type: 'param', path: 'userId' } } },
      { key: 'coaching', procedure: 'manager.getICCoachingNotes', input: { userId: { type: 'param', path: 'userId' } } },
    ],
  },

  layout: {
    type: 'tabs',
    tabs: [
      // ===========================================
      // TAB 1: OVERVIEW
      // ===========================================
      {
        id: 'overview',
        label: 'Overview',
        icon: 'BarChart',
        sections: [
          {
            id: 'ic-header',
            type: 'custom',
            component: 'ICHeaderCard',
            componentProps: {
              avatar: { type: 'field', path: 'ic.avatarUrl' },
              name: { type: 'field', path: 'ic.fullName' },
              role: { type: 'field', path: 'ic.role' },
              email: { type: 'field', path: 'ic.email' },
              tenure: { type: 'field', path: 'ic.tenureDays' },
              status: { type: 'field', path: 'performance.status' },
            },
          },
          {
            id: 'sprint-metrics',
            type: 'metrics-grid',
            title: 'Current Sprint Performance',
            columns: 4,
            fields: [
              {
                id: 'placements',
                label: 'Placements',
                type: 'number',
                path: 'performance.sprint.placements',
                config: {
                  target: { type: 'field', path: 'performance.sprint.placementsTarget' },
                  icon: 'Trophy',
                  bgColor: 'bg-green-50',
                },
              },
              {
                id: 'submissions',
                label: 'Submissions',
                type: 'number',
                path: 'performance.sprint.submissions',
                config: {
                  target: { type: 'field', path: 'performance.sprint.submissionsTarget' },
                  icon: 'Send',
                  bgColor: 'bg-blue-50',
                },
              },
              {
                id: 'interviews',
                label: 'Interviews',
                type: 'number',
                path: 'performance.sprint.interviews',
                config: { icon: 'Video', bgColor: 'bg-purple-50' },
              },
              {
                id: 'conversion',
                label: 'Conversion Rate',
                type: 'percentage',
                path: 'performance.sprint.conversionRate',
                config: { icon: 'TrendingUp', bgColor: 'bg-indigo-50' },
              },
            ],
          },
          {
            id: 'ytd-metrics',
            type: 'info-card',
            title: 'Year-to-Date Performance',
            fields: [
              { id: 'ytd-placements', label: 'YTD Placements', path: 'performance.ytd.placements', type: 'number' },
              { id: 'ytd-revenue', label: 'YTD Revenue Generated', path: 'performance.ytd.revenue', type: 'currency' },
              { id: 'avg-margin', label: 'Avg Margin', path: 'performance.ytd.avgMargin', type: 'percentage' },
              { id: 'sprints-on-target', label: 'Sprints On Target', path: 'performance.ytd.sprintsOnTarget', type: 'fraction', config: { total: 'totalSprints' } },
            ],
          },
          {
            id: 'goals',
            type: 'table',
            title: 'Current Goals',
            dataSource: { type: 'field', path: 'performance.goals' },
            columns_config: [
              { id: 'goal', header: 'Goal', path: 'description', type: 'text' },
              { id: 'target', header: 'Target', path: 'target', type: 'text' },
              { id: 'progress', header: 'Progress', path: 'progress', type: 'progress' },
              { id: 'due', header: 'Due Date', path: 'dueDate', type: 'date' },
              { id: 'status', header: 'Status', path: 'status', type: 'enum', config: {
                options: [
                  { value: 'on_track', label: 'On Track', color: 'green' },
                  { value: 'at_risk', label: 'At Risk', color: 'yellow' },
                  { value: 'off_track', label: 'Off Track', color: 'red' },
                  { value: 'complete', label: 'Complete', color: 'blue' },
                ],
              }},
            ],
          },
        ],
      },

      // ===========================================
      // TAB 2: PIPELINE (READ-ONLY VIEW)
      // ===========================================
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: 'GitBranch',
        badge: { type: 'field', path: 'pipeline.totalActive' },
        sections: [
          {
            id: 'pipeline-summary',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              { id: 'active-jobs', label: 'Active Jobs', type: 'number', path: 'pipeline.activeJobs', config: { icon: 'Briefcase' } },
              { id: 'candidates', label: 'Active Candidates', type: 'number', path: 'pipeline.activeCandidates', config: { icon: 'Users' } },
              { id: 'submissions', label: 'Active Submissions', type: 'number', path: 'pipeline.activeSubmissions', config: { icon: 'Send' } },
              { id: 'coverage', label: 'Coverage Ratio', type: 'text', path: 'pipeline.coverageRatio', config: { suffix: 'x', target: 3 } },
            ],
          },
          {
            id: 'pipeline-note',
            type: 'info-card',
            description: 'This is a read-only view. Manager monitors but does not assign work or manage the IC\'s pipeline directly.',
          },
          {
            id: 'jobs-table',
            type: 'table',
            title: 'Active Jobs',
            dataSource: { type: 'field', path: 'pipeline.jobs' },
            columns_config: [
              { id: 'job', header: 'Job', path: 'title', type: 'text' },
              { id: 'client', header: 'Client', path: 'accountName', type: 'text' },
              { id: 'submissions', header: 'Submissions', path: 'submissionCount', type: 'number' },
              { id: 'interviews', header: 'Interviews', path: 'interviewCount', type: 'number' },
              { id: 'status', header: 'Status', path: 'status', type: 'enum', config: {
                options: [
                  { value: 'active', label: 'Active', color: 'green' },
                  { value: 'on_hold', label: 'On Hold', color: 'yellow' },
                  { value: 'stale', label: 'Stale', color: 'red' },
                ],
              }},
              { id: 'last-activity', header: 'Last Activity', path: 'lastActivityAt', type: 'relative-time' },
            ],
          },
          {
            id: 'submission-funnel',
            type: 'custom',
            title: 'Submission Pipeline',
            component: 'SubmissionFunnelChart',
            componentProps: {
              dataPath: 'pipeline.submissionFunnel',
            },
          },
        ],
      },

      // ===========================================
      // TAB 3: ACTIVITIES (MONITORING VIEW)
      // ===========================================
      {
        id: 'activities',
        label: 'Activities',
        icon: 'Activity',
        badge: { type: 'field', path: 'activities.totalCount' },
        sections: [
          {
            id: 'activity-summary',
            type: 'metrics-grid',
            title: 'Activity Summary (Last 7 Days)',
            columns: 5,
            fields: [
              { id: 'calls', label: 'Calls', type: 'number', path: 'activities.summary.calls', config: { icon: 'Phone' } },
              { id: 'emails', label: 'Emails', type: 'number', path: 'activities.summary.emails', config: { icon: 'Mail' } },
              { id: 'meetings', label: 'Meetings', type: 'number', path: 'activities.summary.meetings', config: { icon: 'Video' } },
              { id: 'submissions', label: 'Submissions', type: 'number', path: 'activities.summary.submissions', config: { icon: 'Send' } },
              { id: 'total', label: 'Total Activities', type: 'number', path: 'activities.summary.total', config: { icon: 'Activity' } },
            ],
          },
          {
            id: 'activity-chart',
            type: 'custom',
            title: 'Activity Trend',
            component: 'ActivityTrendChart',
            componentProps: {
              dataPath: 'activities.trend',
              days: 14,
            },
          },
          {
            id: 'recent-activities',
            type: 'table',
            title: 'Recent Activities',
            dataSource: { type: 'field', path: 'activities.recent' },
            columns_config: [
              { id: 'type', header: 'Type', path: 'type', type: 'activity-type-badge' },
              { id: 'subject', header: 'Subject', path: 'subject', type: 'text' },
              { id: 'entity', header: 'Related To', path: 'relatedEntityName', type: 'text' },
              { id: 'outcome', header: 'Outcome', path: 'outcome', type: 'enum', config: {
                options: [
                  { value: 'successful', label: 'Successful', color: 'green' },
                  { value: 'unsuccessful', label: 'Unsuccessful', color: 'red' },
                  { value: 'pending', label: 'Pending', color: 'yellow' },
                  { value: 'no_answer', label: 'No Answer', color: 'gray' },
                ],
              }},
              { id: 'date', header: 'Date', path: 'completedAt', type: 'relative-time' },
            ],
          },
        ],
      },

      // ===========================================
      // TAB 4: 1:1s
      // ===========================================
      {
        id: 'one-on-ones',
        label: '1:1s',
        icon: 'MessageSquare',
        sections: [
          {
            id: 'next-1on1',
            type: 'info-card',
            title: 'Next Scheduled 1:1',
            fields: [
              { id: 'date', label: 'Date', path: 'oneOnOnes.next.date', type: 'datetime' },
              { id: 'location', label: 'Location', path: 'oneOnOnes.next.location', type: 'text' },
              { id: 'agenda', label: 'Agenda', path: 'oneOnOnes.next.agenda', type: 'textarea' },
            ],
            visible: {
              type: 'condition',
              condition: { field: 'oneOnOnes.next', operator: 'neq', value: null },
            },
          },
          {
            id: 'no-1on1-scheduled',
            type: 'custom',
            component: 'EmptyStateCard',
            componentProps: {
              icon: 'Calendar',
              title: 'No 1:1 Scheduled',
              description: 'Schedule a 1:1 meeting with this IC.',
              actionLabel: 'Schedule 1:1',
              actionType: 'modal',
              actionModal: 'schedule-one-on-one',
            },
            visible: {
              type: 'condition',
              condition: { field: 'oneOnOnes.next', operator: 'eq', value: null },
            },
          },
          {
            id: '1on1-history',
            type: 'table',
            title: '1:1 History',
            dataSource: { type: 'field', path: 'oneOnOnes.history' },
            columns_config: [
              { id: 'date', header: 'Date', path: 'date', type: 'date' },
              { id: 'duration', header: 'Duration', path: 'durationMinutes', type: 'duration' },
              { id: 'topics', header: 'Topics Discussed', path: 'topicsSummary', type: 'text' },
              { id: 'action-items', header: 'Action Items', path: 'actionItemCount', type: 'badge' },
              { id: 'actions', header: '', type: 'actions', config: {
                actions: [
                  { id: 'view', label: 'View Notes', icon: 'FileText', type: 'modal',
                    config: { type: 'modal', modal: 'view-1on1-notes' } },
                ],
              }},
            ],
          },
        ],
      },

      // ===========================================
      // TAB 5: COACHING
      // ===========================================
      {
        id: 'coaching',
        label: 'Coaching',
        icon: 'BookOpen',
        badge: { type: 'field', path: 'coaching.notesCount' },
        sections: [
          {
            id: 'strengths-concerns',
            type: 'custom',
            title: 'Strengths & Areas for Improvement',
            component: 'StrengthsConcernsPanel',
            componentProps: {
              strengths: { type: 'field', path: 'coaching.strengths' },
              concerns: { type: 'field', path: 'coaching.concerns' },
              recommendations: { type: 'field', path: 'coaching.recommendations' },
            },
          },
          {
            id: 'development-plan',
            type: 'info-card',
            title: 'Development Plan',
            fields: [
              { id: 'focus-area', label: 'Current Focus Area', path: 'coaching.developmentPlan.focusArea', type: 'text' },
              { id: 'goal', label: 'Development Goal', path: 'coaching.developmentPlan.goal', type: 'text' },
              { id: 'timeline', label: 'Timeline', path: 'coaching.developmentPlan.timeline', type: 'text' },
              { id: 'progress', label: 'Progress', path: 'coaching.developmentPlan.progress', type: 'progress' },
            ],
          },
          {
            id: 'coaching-notes',
            type: 'table',
            title: 'Coaching Notes',
            dataSource: { type: 'field', path: 'coaching.notes' },
            columns_config: [
              { id: 'date', header: 'Date', path: 'createdAt', type: 'date', sortable: true },
              { id: 'category', header: 'Category', path: 'category', type: 'enum', config: {
                options: [
                  { value: 'feedback', label: 'Feedback', color: 'blue' },
                  { value: 'coaching', label: 'Coaching', color: 'purple' },
                  { value: 'recognition', label: 'Recognition', color: 'green' },
                  { value: 'concern', label: 'Concern', color: 'red' },
                  { value: 'goal', label: 'Goal Setting', color: 'yellow' },
                ],
              }},
              { id: 'summary', header: 'Summary', path: 'summary', type: 'text' },
              { id: 'actions', header: '', type: 'actions', config: {
                actions: [
                  { id: 'view', label: 'View', icon: 'Eye', type: 'modal',
                    config: { type: 'modal', modal: 'view-coaching-note' } },
                  { id: 'edit', label: 'Edit', icon: 'Edit', type: 'modal',
                    config: { type: 'modal', modal: 'edit-coaching-note' } },
                ],
              }},
            ],
            actions: [
              {
                id: 'add-note',
                label: 'Add Note',
                type: 'modal',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'add-coaching-note' },
              },
            ],
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'schedule-1on1',
      label: 'Schedule 1:1',
      type: 'modal',
      icon: 'Calendar',
      variant: 'primary',
      config: { type: 'modal', modal: 'schedule-one-on-one' },
    },
    {
      id: 'add-coaching-note',
      label: 'Add Note',
      type: 'modal',
      icon: 'FileText',
      variant: 'secondary',
      config: { type: 'modal', modal: 'add-coaching-note' },
    },
    {
      id: 'send-message',
      label: 'Send Message',
      type: 'modal',
      icon: 'MessageSquare',
      variant: 'ghost',
      config: { type: 'modal', modal: 'send-message' },
    },
    {
      id: 'transfer-item',
      label: 'Transfer Item',
      type: 'modal',
      icon: 'ArrowRightLeft',
      variant: 'ghost',
      config: { type: 'modal', modal: 'transfer-ownership' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: 'Team', route: '/employee/manager/team' },
      { label: { type: 'field', path: 'ic.fullName' }, active: true },
    ],
  },
};

export default icPerformanceDetailScreen;
