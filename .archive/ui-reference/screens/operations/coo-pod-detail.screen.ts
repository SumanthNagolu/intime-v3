/**
 * COO Pod Detail Screen Definition
 *
 * Detailed view of a specific pod for COO oversight.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const cooPodDetailScreen: ScreenDefinition = {
  id: 'coo-pod-detail',
  type: 'detail',
  title: { type: 'field', path: 'pod.name' },
  subtitle: 'Pod Performance & Oversight',
  icon: 'Users',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'operations.getPodDetail',
      params: {
        podId: { type: 'param', path: 'podId' },
      },
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'overview',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: OVERVIEW
      // ─────────────────────────────────────────────────────
      {
        id: 'overview',
        label: 'Overview',
        icon: 'LayoutDashboard',
        sections: [
          // Pod Info Card
          {
            id: 'pod-info',
            type: 'info-card',
            title: 'Pod Information',
            fields: [
              { id: 'name', label: 'Pod Name', type: 'text', path: 'pod.name' },
              { id: 'type', label: 'Type', type: 'text', path: 'pod.podType' },
              { id: 'manager', label: 'Manager', type: 'text', path: 'pod.managerName' },
              { id: 'created', label: 'Created', type: 'date', path: 'pod.createdAt' },
            ],
          },
          // KPIs
          {
            id: 'pod-kpis',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              {
                id: 'ic-count',
                label: 'Team Size',
                type: 'number',
                path: 'metrics.icCount',
                config: { icon: 'Users' },
              },
              {
                id: 'sprint-placements',
                label: 'Sprint Placements',
                type: 'text',
                path: 'metrics.sprintPlacements',
                config: { template: '${actual}/${target}' },
              },
              {
                id: 'attainment',
                label: 'Attainment',
                type: 'percentage',
                path: 'metrics.attainment',
                config: { target: 100 },
              },
              {
                id: 'health-score',
                label: 'Health Score',
                type: 'number',
                path: 'metrics.healthScore',
                config: { max: 100 },
              },
            ],
          },
          // Sprint Progress
          {
            id: 'sprint-progress',
            type: 'custom',
            component: 'SprintProgressChart',
            title: 'Sprint Progress',
            config: { height: 200 },
          },
          // Open Escalations
          {
            id: 'open-escalations',
            type: 'table',
            title: 'Open Escalations',
            icon: 'AlertTriangle',
            dataSource: {
              type: 'field',
              path: 'escalations',
            },
            columns_config: [
              { id: 'title', header: 'Issue', path: 'title', type: 'text' },
              { id: 'severity', header: 'Severity', path: 'severity', type: 'enum', config: { options: [{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }], badgeColors: { critical: 'red', high: 'orange', medium: 'yellow' } } },
              { id: 'created', header: 'Created', path: 'createdAt', type: 'date' },
              { id: 'status', header: 'Status', path: 'status', type: 'text' },
            ],
            emptyState: {
              title: 'No Open Escalations',
              description: 'This pod has no open escalations',
              icon: 'CheckCircle',
            },
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 2: TEAM MEMBERS
      // ─────────────────────────────────────────────────────
      {
        id: 'team',
        label: 'Team Members',
        icon: 'Users',
        badge: { type: 'count', path: 'team.count' },
        sections: [
          {
            id: 'team-table',
            type: 'table',
            title: 'Team Performance',
            dataSource: {
              type: 'field',
              path: 'team.members',
            },
            columns_config: [
              { id: 'name', header: 'Name', path: 'name', type: 'text' },
              { id: 'role', header: 'Role', path: 'role', type: 'text' },
              { id: 'placements-sprint', header: 'Sprint Placements', path: 'sprintPlacements', type: 'text', config: { template: '${actual}/${target}' } },
              { id: 'attainment', header: 'Attainment', path: 'attainment', type: 'percentage' },
              { id: 'pipeline', header: 'Pipeline', path: 'pipelineCount', type: 'number' },
              { id: 'activities-today', header: 'Activities Today', path: 'activitiesToday', type: 'number' },
              { id: 'status', header: 'Status', path: 'status', type: 'enum', config: { options: [{ value: 'exceeding', label: 'Exceeding' }, { value: 'on_track', label: 'On Track' }, { value: 'at_risk', label: 'At Risk' }, { value: 'off_track', label: 'Off Track' }], badgeColors: { exceeding: 'green', on_track: 'blue', at_risk: 'yellow', off_track: 'red' } } },
            ],
            actions: [
              {
                id: 'view-ic',
                type: 'navigate',
                label: 'View',
                icon: 'Eye',
                config: { type: 'navigate', route: '/employee/manager/team/${id}' },
              },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 3: PIPELINE
      // ─────────────────────────────────────────────────────
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: 'GitBranch',
        sections: [
          {
            id: 'pipeline-funnel',
            type: 'custom',
            component: 'PipelineFunnelChart',
            title: 'Pipeline Funnel',
            config: { height: 350 },
          },
          {
            id: 'active-jobs',
            type: 'table',
            title: 'Active Jobs',
            dataSource: {
              type: 'field',
              path: 'pipeline.activeJobs',
            },
            columns_config: [
              { id: 'title', header: 'Job Title', path: 'title', type: 'text' },
              { id: 'client', header: 'Client', path: 'clientName', type: 'text' },
              { id: 'owner', header: 'Owner', path: 'ownerName', type: 'text' },
              { id: 'submissions', header: 'Submissions', path: 'submissionCount', type: 'number' },
              { id: 'interviews', header: 'Interviews', path: 'interviewCount', type: 'number' },
              { id: 'days-open', header: 'Days Open', path: 'daysOpen', type: 'number' },
              { id: 'status', header: 'Status', path: 'status', type: 'text' },
            ],
            pagination: { enabled: true, pageSize: 10 },
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 4: HISTORICAL PERFORMANCE
      // ─────────────────────────────────────────────────────
      {
        id: 'history',
        label: 'History',
        icon: 'History',
        sections: [
          {
            id: 'historical-chart',
            type: 'custom',
            component: 'HistoricalPerformanceChart',
            title: 'Historical Performance (12 Sprints)',
            config: { height: 350 },
          },
          {
            id: 'sprint-history-table',
            type: 'table',
            title: 'Sprint History',
            dataSource: {
              type: 'field',
              path: 'history.sprints',
            },
            columns_config: [
              { id: 'sprint', header: 'Sprint', path: 'sprintName', type: 'text' },
              { id: 'start-date', header: 'Start Date', path: 'startDate', type: 'date' },
              { id: 'placements', header: 'Placements', path: 'placements', type: 'text', config: { template: '${actual}/${target}' } },
              { id: 'attainment', header: 'Attainment', path: 'attainment', type: 'percentage' },
              { id: 'revenue', header: 'Revenue', path: 'revenue', type: 'currency' },
            ],
            pagination: { enabled: true, pageSize: 12 },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'adjust-targets',
      type: 'modal',
      label: 'Adjust Targets',
      icon: 'Target',
      variant: 'outline',
      config: { type: 'modal', modal: 'AdjustPodTargetsModal' },
    },
    {
      id: 'reassign-manager',
      type: 'modal',
      label: 'Reassign Manager',
      icon: 'UserCog',
      variant: 'outline',
      config: { type: 'modal', modal: 'ReassignManagerModal' },
    },
    {
      id: 'export',
      type: 'modal',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportPodReportModal' },
    },
    {
      id: 'back-to-pods',
      type: 'navigate',
      label: 'Back to All Pods',
      icon: 'ArrowLeft',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/coo/pods' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Home', route: '/employee/workspace' },
      { label: 'COO Dashboard', route: '/employee/coo/dashboard' },
      { label: 'All Pods', route: '/employee/coo/pods' },
      { label: { type: 'field', path: 'pod.name' } },
    ],
  },
};
