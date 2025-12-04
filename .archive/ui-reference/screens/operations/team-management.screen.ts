/**
 * Team Management Screen
 *
 * Shows pod team roster with IC profiles, performance metrics,
 * 1:1 schedule status, and coaching notes.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const teamManagementScreen: ScreenDefinition = {
  id: 'team-management',
  type: 'list',
  entityType: 'employee',
  title: 'Team Management',
  subtitle: 'Manage your pod members',
  icon: 'Users',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'members', procedure: 'pod.getMembers' },
      { key: 'oneOnOneStatus', procedure: 'manager.getOneOnOneStatus' },
      { key: 'coachingNotes', procedure: 'manager.getCoachingNotesSummary' },
    ],
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // TEAM SUMMARY METRICS
      // ===========================================
      {
        id: 'team-metrics',
        type: 'metrics-grid',
        columns: 5,
        fields: [
          {
            id: 'total-members',
            label: 'Team Members',
            type: 'number',
            path: 'members.length',
            config: { icon: 'Users', bgColor: 'bg-blue-50' },
          },
          {
            id: 'on-track',
            label: 'On Track',
            type: 'number',
            path: 'summary.onTrack',
            config: { icon: 'CheckCircle', bgColor: 'bg-green-50' },
          },
          {
            id: 'at-risk',
            label: 'At Risk',
            type: 'number',
            path: 'summary.atRisk',
            config: { icon: 'AlertTriangle', bgColor: 'bg-yellow-50' },
          },
          {
            id: 'pending-1on1s',
            label: 'Pending 1:1s',
            type: 'number',
            path: 'oneOnOneStatus.pendingCount',
            config: { icon: 'Calendar', bgColor: 'bg-purple-50' },
          },
          {
            id: 'overdue-1on1s',
            label: 'Overdue 1:1s',
            type: 'number',
            path: 'oneOnOneStatus.overdueCount',
            config: { icon: 'Clock', bgColor: 'bg-red-50' },
          },
        ],
      },

      // ===========================================
      // TEAM ROSTER TABLE
      // ===========================================
      {
        id: 'team-roster',
        type: 'table',
        title: 'Team Roster',
        dataSource: { type: 'field', path: 'members' },
        columns_config: [
          {
            id: 'status-indicator',
            header: '',
            path: 'performanceStatus',
            type: 'status-indicator',
            width: '30px',
            config: {
              colors: { on_track: 'green', at_risk: 'yellow', off_track: 'red' },
            },
          },
          {
            id: 'avatar',
            header: '',
            path: 'avatarUrl',
            type: 'avatar',
            width: '40px',
          },
          {
            id: 'name',
            header: 'Name',
            path: 'fullName',
            type: 'link',
            config: { linkPattern: '/employee/manager/team/{{id}}' },
            sortable: true,
          },
          {
            id: 'role',
            header: 'Role',
            path: 'role',
            type: 'enum',
            config: {
              options: [
                { value: 'recruiter', label: 'Recruiter' },
                { value: 'senior_recruiter', label: 'Senior Recruiter' },
                { value: 'bench_sales', label: 'Bench Sales' },
                { value: 'ta_specialist', label: 'TA Specialist' },
              ],
            },
          },
          {
            id: 'tenure',
            header: 'Tenure',
            path: 'tenureDays',
            type: 'tenure',
            config: { format: { type: 'months' } },
            sortable: true,
          },
          {
            id: 'sprint-progress',
            header: 'Sprint Progress',
            path: 'sprintProgress',
            type: 'progress',
            config: {
              current: 'placements',
              target: 'placementsTarget',
              showLabel: true,
            },
          },
          {
            id: 'submissions-week',
            header: 'Submissions (Week)',
            path: 'submissionsThisWeek',
            type: 'number',
            sortable: true,
          },
          {
            id: 'activity-score',
            header: 'Activity (7d)',
            path: 'activityScore',
            type: 'sparkline',
          },
          {
            id: 'last-1on1',
            header: 'Last 1:1',
            path: 'lastOneOnOne',
            type: 'relative-time',
            config: { warnIfStale: 14 },
          },
          {
            id: 'next-1on1',
            header: 'Next 1:1',
            path: 'nextOneOnOne',
            type: 'date',
            config: { format: { type: 'short' } },
          },
          {
            id: 'coaching-notes',
            header: 'Notes',
            path: 'coachingNotesCount',
            type: 'badge',
            config: {
              showZero: false,
              icon: 'MessageSquare',
            },
          },
          {
            id: 'actions',
            header: '',
            type: 'actions',
            width: '100px',
            config: {
              actions: [
                {
                  id: 'view',
                  label: 'View Profile',
                  icon: 'User',
                  type: 'navigate',
                    config: { type: 'navigate', route: '/employee/manager/team/{{id}}' },
                },
                {
                  id: 'schedule-1on1',
                  label: 'Schedule 1:1',
                  icon: 'Calendar',
                  type: 'modal',
                    config: { type: 'modal', modal: 'schedule-one-on-one' },
                },
                {
                  id: 'add-note',
                  label: 'Add Note',
                  icon: 'FileText',
                  type: 'modal',
                    config: { type: 'modal', modal: 'add-coaching-note' },
                },
              ],
            },
          },
        ],
      },

      // ===========================================
      // 1:1 SCHEDULE OVERVIEW
      // ===========================================
      {
        id: 'one-on-one-schedule',
        type: 'custom',
        title: '1:1 Schedule',
        component: 'OneOnOneScheduleWidget',
        componentProps: {
          dataPath: 'oneOnOneStatus.schedule',
          showUpcoming: true,
          showOverdue: true,
          daysAhead: 14,
        },
        actions: [
          {
            id: 'manage-1on1s',
            label: 'Manage All 1:1s',
            type: 'navigate',
            icon: 'Calendar',
            variant: 'ghost',
            config: { type: 'navigate', route: '/employee/manager/1on1' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'schedule-team-standup',
      label: 'Schedule Standup',
      type: 'modal',
      icon: 'Users',
      variant: 'default',
      config: { type: 'modal', modal: 'schedule-standup' },
    },
    {
      id: 'send-team-message',
      label: 'Message Team',
      type: 'modal',
      icon: 'MessageSquare',
      variant: 'secondary',
      config: { type: 'modal', modal: 'team-message' },
    },
    {
      id: 'export-team-report',
      label: 'Export Report',
      type: 'modal',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'modal', modal: 'export-team-report' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: 'Team Management', active: true },
    ],
  },
};

export default teamManagementScreen;
