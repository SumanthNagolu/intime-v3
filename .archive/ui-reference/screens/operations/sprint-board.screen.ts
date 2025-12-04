/**
 * Sprint Board Screen
 *
 * Sprint planning and tracking for pod managers.
 * Shows pod-level targets, per-IC progress, and blockers.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/06-sprint-planning.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const sprintBoardScreen: ScreenDefinition = {
  id: 'sprint-board',
  type: 'dashboard',
  title: 'Sprint Board',
  subtitle: { type: 'field', path: 'sprint.name' },
  icon: 'Target',

  dataSource: {
    type: 'aggregate',
    queries: [
      { key: 'sprint', procedure: 'pod.getCurrentSprint' },
      { key: 'targets', procedure: 'pod.getSprintTargets' },
      { key: 'progress', procedure: 'pod.getSprintProgress' },
      { key: 'blockers', procedure: 'pod.getBlockers' },
      { key: 'icProgress', procedure: 'pod.getICSprintProgress' },
      { key: 'burndown', procedure: 'pod.getSprintBurndown' },
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
          sprintName: { type: 'field', path: 'sprint.name' },
          startDate: { type: 'field', path: 'sprint.startDate' },
          endDate: { type: 'field', path: 'sprint.endDate' },
          daysRemaining: { type: 'field', path: 'sprint.daysRemaining' },
          totalDays: { type: 'field', path: 'sprint.totalDays' },
          status: { type: 'field', path: 'sprint.status' },
        },
      },

      // ===========================================
      // POD-LEVEL TARGETS
      // ===========================================
      {
        id: 'pod-targets',
        type: 'metrics-grid',
        title: 'Pod Targets',
        columns: 3,
        fields: [
          {
            id: 'placements-target',
            label: 'Placements',
            type: 'fraction',
            path: 'progress.placements',
            config: {
              current: 'current',
              target: 'target',
              icon: 'Trophy',
              bgColor: 'bg-green-50',
              showProgress: true,
            },
          },
          {
            id: 'revenue-target',
            label: 'Revenue',
            type: 'currency',
            path: 'progress.revenue',
            config: {
              current: 'current',
              target: 'target',
              icon: 'DollarSign',
              bgColor: 'bg-blue-50',
              showProgress: true,
            },
          },
          {
            id: 'submissions-target',
            label: 'Submissions',
            type: 'fraction',
            path: 'progress.submissions',
            config: {
              current: 'current',
              target: 'target',
              icon: 'Send',
              bgColor: 'bg-purple-50',
              showProgress: true,
            },
          },
        ],
      },

      // ===========================================
      // BURNDOWN CHART
      // ===========================================
      {
        id: 'burndown-chart',
        type: 'custom',
        title: 'Sprint Burndown',
        component: 'SprintBurndownChart',
        componentProps: {
          dataPath: 'burndown',
          idealLine: true,
          actualLine: true,
          projectedLine: true,
        },
      },

      // ===========================================
      // PER-IC TARGETS & PROGRESS
      // ===========================================
      {
        id: 'ic-progress',
        type: 'table',
        title: 'Individual Progress',
        dataSource: { type: 'field', path: 'icProgress' },
        columns_config: [
          {
            id: 'status-indicator',
            header: '',
            path: 'status',
            type: 'status-indicator',
            width: '30px',
            config: {
              colors: { on_track: 'green', at_risk: 'yellow', off_track: 'red', complete: 'blue' },
            },
          },
          {
            id: 'ic',
            header: 'IC',
            path: 'name',
            type: 'user-with-avatar',
          },
          {
            id: 'placement-target',
            header: 'Placement Target',
            path: 'placementTarget',
            type: 'number',
          },
          {
            id: 'placements-actual',
            header: 'Actual',
            path: 'placements',
            type: 'number',
          },
          {
            id: 'placement-progress',
            header: 'Progress',
            path: 'placementProgress',
            type: 'progress',
            config: { showPercentage: true },
          },
          {
            id: 'submissions',
            header: 'Submissions',
            path: 'submissions',
            type: 'number',
          },
          {
            id: 'interviews',
            header: 'Interviews',
            path: 'interviews',
            type: 'number',
          },
          {
            id: 'pipeline-health',
            header: 'Pipeline',
            path: 'pipelineHealth',
            type: 'enum',
            config: {
              options: [
                { value: 'healthy', label: 'Healthy', color: 'green' },
                { value: 'moderate', label: 'Moderate', color: 'yellow' },
                { value: 'weak', label: 'Weak', color: 'red' },
              ],
            },
          },
          {
            id: 'actions',
            header: '',
            type: 'actions',
            width: '80px',
            config: {
              actions: [
                { id: 'adjust', label: 'Adjust Target', icon: 'Edit', type: 'modal',
                    config: { type: 'modal', modal: 'adjust-ic-target' } },
                { id: 'view', label: 'View Details', icon: 'Eye', type: 'navigate',
                    config: { type: 'navigate', route: '/employee/manager/team/{{id}}' } },
              ],
            },
          },
        ],
      },

      // ===========================================
      // BLOCKERS LOG
      // ===========================================
      {
        id: 'blockers',
        type: 'table',
        title: 'Blockers',
        description: 'Issues preventing progress that manager needs to resolve',
        dataSource: { type: 'field', path: 'blockers' },
        columns_config: [
          {
            id: 'priority',
            header: 'Priority',
            path: 'priority',
            type: 'enum',
            config: {
              options: [
                { value: 'critical', label: 'Critical', color: 'red' },
                { value: 'high', label: 'High', color: 'orange' },
                { value: 'medium', label: 'Medium', color: 'yellow' },
                { value: 'low', label: 'Low', color: 'gray' },
              ],
            },
            width: '100px',
          },
          {
            id: 'description',
            header: 'Description',
            path: 'description',
            type: 'text',
          },
          {
            id: 'reporter',
            header: 'Reported By',
            path: 'reporterName',
            type: 'user',
          },
          {
            id: 'reported-at',
            header: 'Reported',
            path: 'createdAt',
            type: 'relative-time',
          },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: [
                { value: 'open', label: 'Open', color: 'red' },
                { value: 'in_progress', label: 'In Progress', color: 'yellow' },
                { value: 'resolved', label: 'Resolved', color: 'green' },
              ],
            },
          },
          {
            id: 'actions',
            header: '',
            type: 'actions',
            width: '120px',
            config: {
              actions: [
                { id: 'resolve', label: 'Resolve', icon: 'Check', type: 'modal',
                    config: { type: 'modal', modal: 'resolve-blocker' } },
                { id: 'edit', label: 'Edit', icon: 'Edit', type: 'modal',
                    config: { type: 'modal', modal: 'edit-blocker' } },
              ],
            },
          },
        ],
        actions: [
          {
            id: 'add-blocker',
            label: 'Add Blocker',
            type: 'modal',
            icon: 'Plus',
            variant: 'secondary',
            config: { type: 'modal', modal: 'add-blocker' },
          },
        ],
      },

      // ===========================================
      // SPRINT ITEMS KANBAN
      // ===========================================
      {
        id: 'sprint-kanban',
        type: 'custom',
        title: 'Sprint Items',
        component: 'SprintKanbanBoard',
        componentProps: {
          columns_config: [
            { id: 'sourcing', label: 'Sourcing', color: 'gray' },
            { id: 'screening', label: 'Screening', color: 'blue' },
            { id: 'submitted', label: 'Submitted', color: 'purple' },
            { id: 'interviewing', label: 'Interviewing', color: 'indigo' },
            { id: 'offer', label: 'Offer Stage', color: 'amber' },
            { id: 'placed', label: 'Placed', color: 'green' },
          ],
          showByIC: true,
          dragEnabled: false, // Manager doesn't move items - just monitors
        },
      },
    ],
  },

  actions: [
    {
      id: 'adjust-targets',
      label: 'Adjust Targets',
      type: 'modal',
      icon: 'Sliders',
      variant: 'secondary',
      config: { type: 'modal', modal: 'adjust-sprint-targets' },
    },
    {
      id: 'add-blocker',
      label: 'Add Blocker',
      type: 'modal',
      icon: 'AlertTriangle',
      variant: 'default',
      config: { type: 'modal', modal: 'add-blocker' },
    },
    {
      id: 'end-sprint',
      label: 'End Sprint',
      type: 'modal',
      icon: 'Flag',
      variant: 'destructive',
      config: { type: 'modal', modal: 'end-sprint' },
      confirm: {
        title: 'End Sprint',
        message: 'Are you sure you want to end the current sprint? This will finalize all metrics and start the next sprint.',
        confirmLabel: 'End Sprint',
        destructive: true,
      },
      visible: {
        type: 'condition',
        condition: { field: 'sprint.canEnd', operator: 'eq', value: true },
      },
    },
    {
      id: 'export-report',
      label: 'Export',
      type: 'modal',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'modal', modal: 'export-sprint-report' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Manager', route: '/employee/manager' },
      { label: 'Sprint Board', active: true },
    ],
  },
};

export default sprintBoardScreen;
