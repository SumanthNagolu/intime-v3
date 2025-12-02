/**
 * Manager Activities Screen
 *
 * Activity queue and history for manager-specific activities.
 * Uses Activity-Centric UI patterns.
 *
 * Manager activity patterns:
 * - Handle escalation
 * - Conduct 1:1
 * - Sprint planning
 * - Coach IC
 * - Review approval
 * - Strategic account review
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const managerActivitiesScreen: ScreenDefinition = {
  id: 'manager-activities',
  type: 'dashboard',
  title: 'My Activities',
  subtitle: 'Track your manager activities',
  icon: 'Activity',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'queue', procedure: 'activities.getMyQueue', input: { role: { type: 'static', value: 'manager' } } },
      { key: 'completed', procedure: 'activities.getMyCompleted', input: { role: { type: 'static', value: 'manager' }, limit: { type: 'static', value: 50 } } },
      { key: 'summary', procedure: 'activities.getManagerSummary' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // ACTIVITY SUMMARY
      // ===========================================
      {
        id: 'activity-summary',
        type: 'metrics-grid',
        columns: 5,
        fields: [
          {
            id: 'overdue',
            label: 'Overdue',
            type: 'number',
            path: 'summary.overdue',
            config: { icon: 'AlertTriangle', bgColor: 'bg-red-50', color: 'red' },
          },
          {
            id: 'due-today',
            label: 'Due Today',
            type: 'number',
            path: 'summary.dueToday',
            config: { icon: 'Calendar', bgColor: 'bg-yellow-50' },
          },
          {
            id: 'upcoming',
            label: 'Upcoming',
            type: 'number',
            path: 'summary.upcoming',
            config: { icon: 'Clock', bgColor: 'bg-blue-50' },
          },
          {
            id: 'completed-today',
            label: 'Completed Today',
            type: 'number',
            path: 'summary.completedToday',
            config: { icon: 'CheckCircle', bgColor: 'bg-green-50' },
          },
          {
            id: 'weekly-target',
            label: 'Week Progress',
            type: 'progress',
            path: 'summary.weeklyProgress',
            config: {
              current: 'completed',
              target: 'target',
              showPercentage: true,
            },
          },
        ],
      },

      // ===========================================
      // TODAY'S PROGRESS
      // ===========================================
      {
        id: 'today-progress',
        type: 'custom',
        component: 'TodayProgressBar',
        componentProps: {
          completed: { type: 'field', path: 'summary.completedToday' },
          total: { type: 'field', path: 'summary.totalToday' },
          streakDays: { type: 'field', path: 'summary.streakDays' },
        },
      },

      // ===========================================
      // ACTIVITY QUEUE
      // ===========================================
      {
        id: 'activity-queue',
        type: 'custom',
        title: 'Activity Queue',
        component: 'ActivityQueueWidget',
        componentProps: {
          dataPath: 'queue',
          groupBy: 'priority',
          priorityGroups: [
            { id: 'overdue', label: 'Overdue', color: 'red' },
            { id: 'due_today', label: 'Due Today', color: 'yellow' },
            { id: 'upcoming', label: 'Upcoming', color: 'blue' },
          ],
          activityTypes: [
            { type: 'escalation', icon: 'AlertTriangle', label: 'Handle Escalation', color: 'red' },
            { type: 'approval', icon: 'CheckCircle', label: 'Review Approval', color: 'blue' },
            { type: '1on1', icon: 'MessageSquare', label: 'Conduct 1:1', color: 'purple' },
            { type: 'sprint_planning', icon: 'Target', label: 'Sprint Planning', color: 'green' },
            { type: 'coaching', icon: 'BookOpen', label: 'Coach IC', color: 'orange' },
            { type: 'account_review', icon: 'Building', label: 'Account Review', color: 'cyan' },
            { type: 'call', icon: 'Phone', label: 'Call', color: 'emerald' },
            { type: 'meeting', icon: 'Video', label: 'Meeting', color: 'indigo' },
            { type: 'task', icon: 'ListTodo', label: 'Task', color: 'gray' },
          ],
          showSLAIndicator: true,
          allowComplete: true,
          allowReschedule: true,
        },
      },

      // ===========================================
      // QUICK LOG
      // ===========================================
      {
        id: 'quick-log',
        type: 'custom',
        title: 'Quick Log Activity',
        component: 'QuickLogButtons',
        componentProps: {
          activities: [
            { type: 'call', icon: 'Phone', label: 'Call' },
            { type: 'meeting', icon: 'Video', label: 'Meeting' },
            { type: 'email', icon: 'Mail', label: 'Email' },
            { type: 'note', icon: 'FileText', label: 'Note' },
            { type: 'coaching', icon: 'BookOpen', label: 'Coaching' },
            { type: '1on1', icon: 'MessageSquare', label: '1:1' },
          ],
        },
      },

      // ===========================================
      // RECENTLY COMPLETED
      // ===========================================
      {
        id: 'completed-activities',
        type: 'table',
        title: 'Recently Completed',
        dataSource: { type: 'field', path: 'completed' },
        columns_config: [
          {
            id: 'type',
            header: 'Type',
            path: 'activityType',
            type: 'activity-type-badge',
            width: '120px',
          },
          {
            id: 'subject',
            header: 'Subject',
            path: 'subject',
            type: 'text',
          },
          {
            id: 'related',
            header: 'Related To',
            path: 'relatedEntityName',
            type: 'link',
            config: { linkPattern: '{{relatedEntityUrl}}' },
          },
          {
            id: 'outcome',
            header: 'Outcome',
            path: 'outcome',
            type: 'enum',
            config: {
              options: [
                { value: 'successful', label: 'Successful', color: 'green' },
                { value: 'unsuccessful', label: 'Unsuccessful', color: 'red' },
                { value: 'partial', label: 'Partial', color: 'yellow' },
                { value: 'rescheduled', label: 'Rescheduled', color: 'blue' },
              ],
            },
          },
          {
            id: 'duration',
            header: 'Duration',
            path: 'durationMinutes',
            type: 'duration',
          },
          {
            id: 'completed',
            header: 'Completed',
            path: 'completedAt',
            type: 'relative-time',
          },
        ],
        collapsible: true,
        defaultExpanded: false,
      },

      // ===========================================
      // ACTIVITY PATTERNS (TEMPLATES)
      // ===========================================
      {
        id: 'activity-patterns',
        type: 'custom',
        title: 'Manager Activity Patterns',
        component: 'ActivityPatternsInfo',
        componentProps: {
          patterns: [
            {
              id: 'ESCALATION_RECEIVED',
              name: 'Handle Escalation',
              trigger: 'When escalation is assigned to you',
              defaultDue: '4 hours',
              sla: '24 hours',
            },
            {
              id: 'APPROVAL_PENDING',
              name: 'Review Approval',
              trigger: 'When approval is requested',
              defaultDue: '4 hours',
              sla: '24 hours',
            },
            {
              id: 'IC_1ON1_SCHEDULED',
              name: 'Conduct 1:1',
              trigger: 'When 1:1 is scheduled',
              defaultDue: 'At scheduled time',
              sla: 'Weekly',
            },
            {
              id: 'SPRINT_START',
              name: 'Sprint Planning',
              trigger: 'At sprint start',
              defaultDue: 'Day 1 of sprint',
              sla: 'Day 2',
            },
            {
              id: 'IC_AT_RISK',
              name: 'Coach IC',
              trigger: 'When IC performance is at risk',
              defaultDue: '48 hours',
              sla: '72 hours',
            },
            {
              id: 'STRATEGIC_ACCOUNT_REVIEW',
              name: 'Account Review',
              trigger: 'Monthly for strategic accounts',
              defaultDue: 'Monthly',
              sla: 'Monthly',
            },
          ],
        },
        collapsible: true,
        defaultExpanded: false,
      },
    ],
  },

  actions: [
    {
      id: 'create-activity',
      label: 'Log Activity',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'create-activity' },
    },
    {
      id: 'create-task',
      label: 'Create Task',
      type: 'modal',
      icon: 'ListTodo',
      variant: 'secondary',
      config: { type: 'modal', modal: 'create-task' },
    },
    {
      id: 'view-calendar',
      label: 'Calendar View',
      type: 'navigate',
      icon: 'Calendar',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/manager/calendar' },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'modal',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'modal', modal: 'export-activities' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: 'Activities', active: true },
    ],
  },
};

export default managerActivitiesScreen;
