/**
 * COO Operations Dashboard Screen Definition
 *
 * Real-time operational visibility dashboard for the Chief Operating Officer.
 * The COO is ALWAYS INFORMED on all object changes.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md (COO oversees all pod managers)
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const cooDashboardScreen: ScreenDefinition = {
  id: 'coo-dashboard',
  type: 'dashboard',
  title: 'COO Operations Dashboard',
  subtitle: 'Real-time operational visibility and control center',
  icon: 'Activity',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'operations.getCOODashboard',
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'overview',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: OVERVIEW
      // Per COO oversight role: KPIs + Pod Performance
      // ─────────────────────────────────────────────────────
      {
        id: 'overview',
        label: 'Overview',
        icon: 'LayoutDashboard',
        sections: [
          {
            id: 'operational-kpis',
            type: 'metrics-grid',
            columns: 5,
            metrics: [
              {
                id: 'efficiency',
                label: 'Operational Efficiency',
                value: { type: 'field', path: 'overview.efficiency' },
                format: { type: 'percentage' },
                target: 85,
                size: 'large',
              },
              {
                id: 'utilization',
                label: 'Team Utilization',
                value: { type: 'field', path: 'overview.utilization' },
                format: { type: 'percentage' },
                target: 85,
              },
              {
                id: 'ttf',
                label: 'Avg TTF (Days)',
                value: { type: 'field', path: 'overview.avgTTF' },
                format: { type: 'number' },
                target: 30,
                inverse: true,
              },
              {
                id: 'placements-today',
                label: 'Placements Today',
                value: { type: 'field', path: 'overview.placementsToday' },
                format: { type: 'number' },
                target: 8,
              },
              {
                id: 'sla-compliance',
                label: 'SLA Compliance',
                value: { type: 'field', path: 'overview.slaCompliance' },
                format: { type: 'percentage' },
                target: 95,
              },
            ],
          },
          {
            id: 'pillar-health',
            type: 'custom',
            component: 'PillarHealthGrid',
            title: 'Pillar Health Status',
            span: 4,
          },
          {
            id: 'regional-performance',
            type: 'custom',
            component: 'RegionalPerformanceMap',
            title: 'Regional Performance',
            span: 2,
          },
          {
            id: 'pod-status',
            type: 'custom',
            component: 'PodStatusGrid',
            title: 'Pod Status Overview',
            span: 2,
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 2: INFORMED FEED (Critical)
      // ─────────────────────────────────────────────────────
      {
        id: 'informed-feed',
        label: 'Informed Feed',
        icon: 'Bell',
        badge: { type: 'count', path: 'notifications.unreadCount' },
        sections: [
          {
            id: 'notification-filters',
            type: 'form',
            fields: [
              {
                id: 'severity',
                name: 'severity',
                label: 'Severity',
                type: 'select',
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'high', label: 'High' },
                  { value: 'normal', label: 'Normal' },
                ],
              },
              {
                id: 'pillar',
                name: 'pillar',
                label: 'Pillar',
                type: 'select',
                options: [
                  { value: 'all', label: 'All Pillars' },
                  { value: 'recruiting', label: 'Recruiting' },
                  { value: 'bench_sales', label: 'Bench Sales' },
                  { value: 'ta', label: 'TA' },
                  { value: 'academy', label: 'Academy' },
                  { value: 'crm', label: 'CRM' },
                ],
              },
            ],
          },
          {
            id: 'critical-notifications',
            type: 'table',
            title: '🔴 Critical Notifications',
            dataSource: {
              type: 'field',
              path: 'notifications.critical',
            },
            columns_config: [
              {
                id: 'timestamp',
                header: 'Time',
                path: 'timestamp',
                type: 'relative-time',
                width: '80px',
              },
              {
                id: 'event',
                header: 'Event',
                accessor: 'description',
                type: 'text',
                primary: true,
              },
              {
                id: 'entity',
                header: 'Entity',
                accessor: 'entityTitle',
                type: 'link',
                config: { linkPattern: '{{entityUrl}}' },
              },
              {
                id: 'actor',
                header: 'Actor',
                accessor: 'actorName',
                type: 'user',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                actions: [
                  {
                    id: 'view',
                    label: 'View',
                    icon: 'eye',
                    type: 'navigate',
                    config: { type: 'navigate', route: '{{entityUrl}}' },
                  },
                  {
                    id: 'escalate',
                    label: 'Escalate',
                    icon: 'arrow-up',
                    type: 'modal',
                    config: { type: 'modal', modal: 'escalate' },
                  },
                  {
                    id: 'assign',
                    label: 'Assign',
                    icon: 'user-plus',
                    type: 'modal',
                    config: { type: 'modal', modal: 'assign' },
                  },
                ],
              },
            ],
          },
          {
            id: 'high-notifications',
            type: 'table',
            title: '🟡 High Priority',
            collapsed: true,
            dataSource: {
              type: 'field',
              path: 'notifications.high',
            },
            columns_config: [
              {
                id: 'timestamp',
                header: 'Time',
                path: 'timestamp',
                type: 'relative-time',
              },
              {
                id: 'event',
                header: 'Event',
                accessor: 'description',
                type: 'text',
              },
              {
                id: 'entity',
                header: 'Entity',
                accessor: 'entityTitle',
                type: 'link',
                config: { linkPattern: '{{entityUrl}}' },
              },
              {
                id: 'actor',
                header: 'Actor',
                accessor: 'actorName',
                type: 'user',
              },
            ],
          },
          {
            id: 'normal-notifications',
            type: 'table',
            title: '🟢 Normal Updates',
            collapsed: true,
            dataSource: {
              type: 'field',
              path: 'notifications.normal',
            },
            columns_config: [
              {
                id: 'timestamp',
                header: 'Time',
                path: 'timestamp',
                type: 'relative-time',
              },
              {
                id: 'event',
                header: 'Event',
                accessor: 'description',
                type: 'text',
              },
              {
                id: 'entity',
                header: 'Entity',
                accessor: 'entityTitle',
                type: 'text',
              },
            ],
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 3: SLA MANAGEMENT
      // ─────────────────────────────────────────────────────
      {
        id: 'sla',
        label: 'SLA Management',
        icon: 'Timer',
        badge: { type: 'count', path: 'sla.breachCount' },
        sections: [
          {
            id: 'sla-summary',
            type: 'metrics-grid',
            columns: 4,
            metrics: [
              {
                id: 'overall-compliance',
                label: 'Overall Compliance',
                value: { type: 'field', path: 'sla.overallCompliance' },
                format: { type: 'percentage' },
                target: 95,
              },
              {
                id: 'active-slas',
                label: 'Active SLAs',
                value: { type: 'field', path: 'sla.activeCount' },
                format: { type: 'number' },
              },
              {
                id: 'at-risk',
                label: 'At Risk',
                value: { type: 'field', path: 'sla.atRiskCount' },
                format: { type: 'number' },
                alertThreshold: 5,
              },
              {
                id: 'breached',
                label: 'Breached',
                value: { type: 'field', path: 'sla.breachCount' },
                format: { type: 'number' },
                color: 'destructive',
                alertThreshold: 1,
              },
            ],
          },
          {
            id: 'sla-breaches',
            type: 'table',
            title: 'SLA Breaches Requiring Action',
            dataSource: {
              type: 'field',
              path: 'sla.breaches',
            },
            columns_config: [
              {
                id: 'entity',
                header: 'Entity',
                path: 'entityTitle',
                type: 'link',
                config: { linkPattern: '{{entityUrl}}' },
              },
              {
                id: 'sla-type',
                header: 'SLA Type',
                accessor: 'slaType',
                type: 'text',
              },
              {
                id: 'target',
                header: 'Target',
                accessor: 'targetHours',
                type: 'text',
                suffix: ' hours',
              },
              {
                id: 'actual',
                header: 'Actual',
                accessor: 'actualHours',
                type: 'text',
                suffix: ' hours',
              },
              {
                id: 'breach-duration',
                header: 'Breach Duration',
                accessor: 'breachDuration',
                type: 'duration',
              },
              {
                id: 'owner',
                header: 'Owner',
                accessor: 'ownerName',
                type: 'user',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                actions: [
                  {
                    id: 'escalate',
                    label: 'Escalate',
                    icon: 'arrow-up',
                    type: 'modal',
                    config: { type: 'modal', modal: 'escalate' },
                  },
                  {
                    id: 'reassign',
                    label: 'Reassign',
                    icon: 'user-plus',
                    type: 'modal',
                    config: { type: 'modal', modal: 'reassign' },
                  },
                ],
              },
            ],
          },
          {
            id: 'sla-at-risk',
            type: 'table',
            title: 'SLAs At Risk (Warning)',
            collapsed: true,
            dataSource: {
              type: 'field',
              path: 'sla.atRisk',
            },
            columns_config: [
              {
                id: 'entity',
                header: 'Entity',
                path: 'entityTitle',
                type: 'link',
                config: { linkPattern: '{{entityUrl}}' },
              },
              {
                id: 'sla-type',
                header: 'SLA Type',
                accessor: 'slaType',
                type: 'text',
              },
              {
                id: 'time-remaining',
                header: 'Time Remaining',
                accessor: 'timeRemaining',
                type: 'duration',
              },
              {
                id: 'owner',
                header: 'Owner',
                accessor: 'ownerName',
                type: 'user',
              },
            ],
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 4: TEAM PERFORMANCE
      // ─────────────────────────────────────────────────────
      {
        id: 'team',
        label: 'Team Performance',
        icon: 'Users',
        sections: [
          {
            id: 'team-kpis',
            type: 'metrics-grid',
            columns: 4,
            metrics: [
              {
                id: 'total-headcount',
                label: 'Total Headcount',
                value: { type: 'field', path: 'team.totalHeadcount' },
                format: { type: 'number' },
              },
              {
                id: 'active-recruiters',
                label: 'Active Recruiters',
                value: { type: 'field', path: 'team.activeRecruiters' },
                format: { type: 'number' },
              },
              {
                id: 'avg-productivity',
                label: 'Avg Productivity',
                value: { type: 'field', path: 'team.avgProductivity' },
                format: { type: 'percentage' },
                target: 100,
              },
              {
                id: 'pods-green',
                label: 'Pods at 100%',
                value: { type: 'field', path: 'team.podsAtTarget' },
                format: { type: 'number' },
                suffix: { type: 'field', path: 'team.totalPods', prefix: ' / ' },
              },
            ],
          },
          {
            id: 'pod-performance-table',
            type: 'table',
            title: 'Pod Performance Rankings',
            dataSource: {
              type: 'field',
              path: 'team.pods',
            },
            sortable: true,
            columns_config: [
              {
                id: 'rank',
                header: '#',
                path: 'rank',
                type: 'number',
                width: '50px',
              },
              {
                id: 'pod',
                header: 'Pod',
                accessor: 'name',
                type: 'link',
                config: { linkPattern: '/employee/manager/pod/{{id}}' },
              },
              {
                id: 'manager',
                header: 'Manager',
                accessor: 'managerName',
                type: 'user',
              },
              {
                id: 'placements',
                header: 'Placements (Sprint)',
                accessor: 'sprintPlacements',
                type: 'text',
                format: '{{actual}}/{{target}}',
              },
              {
                id: 'progress',
                header: 'Progress',
                accessor: 'progressPercentage',
                type: 'progress-bar',
              },
              {
                id: 'status',
                header: 'Status',
                accessor: 'status',
                type: 'badge',
                options: [
                  { value: 'exceeding', label: '⭐ Exceeding', color: 'success' },
                  { value: 'on_track', label: 'On Track', color: 'info' },
                  { value: 'at_risk', label: 'At Risk', color: 'warning' },
                  { value: 'off_track', label: 'Off Track', color: 'destructive' },
                ],
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                actions: [
                  {
                    id: 'view-details',
                    label: 'View Details',
                    icon: 'eye',
                    type: 'navigate',
                    config: { type: 'navigate', route: '/employee/manager/pod/{{id}}/metrics' },
                  },
                ],
              },
            ],
          },
          {
            id: 'top-performers',
            type: 'custom',
            component: 'TopPerformersWidget',
            title: 'Top Performers This Month',
            span: 2,
          },
          {
            id: 'needs-coaching',
            type: 'custom',
            component: 'NeedsCoachingWidget',
            title: 'ICs Needing Support',
            span: 2,
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 5: BOTTLENECKS
      // ─────────────────────────────────────────────────────
      {
        id: 'bottlenecks',
        label: 'Bottlenecks',
        icon: 'AlertOctagon',
        badge: { type: 'count', path: 'bottlenecks.criticalCount' },
        sections: [
          {
            id: 'bottleneck-analysis',
            type: 'custom',
            component: 'BottleneckAnalysisChart',
            title: 'Process Bottleneck Analysis',
            span: 4,
          },
          {
            id: 'stale-jobs',
            type: 'table',
            title: 'Stale Jobs (No Activity 7+ Days)',
            dataSource: {
              type: 'field',
              path: 'bottlenecks.staleJobs',
            },
            columns_config: [
              {
                id: 'job',
                header: 'Job',
                path: 'title',
                type: 'link',
                config: { linkPattern: '/employee/jobs/{{id}}' },
              },
              {
                id: 'client',
                header: 'Client',
                accessor: 'clientName',
                type: 'text',
              },
              {
                id: 'days-stale',
                header: 'Days Stale',
                accessor: 'daysStale',
                type: 'number',
              },
              {
                id: 'owner',
                header: 'Owner',
                accessor: 'ownerName',
                type: 'user',
              },
              {
                id: 'pod',
                header: 'Pod',
                accessor: 'podName',
                type: 'text',
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                actions: [
                  {
                    id: 'escalate',
                    label: 'Escalate',
                    icon: 'arrow-up',
                    type: 'modal',
                    config: { type: 'modal', modal: 'escalate' },
                  },
                  {
                    id: 'reassign',
                    label: 'Reassign',
                    icon: 'user-plus',
                    type: 'modal',
                    config: { type: 'modal', modal: 'reassign' },
                  },
                  {
                    id: 'close',
                    label: 'Close Job',
                    icon: 'x',
                    type: 'mutation',
                    config: { type: 'mutation', procedure: 'jobs.close' },
                  },
                ],
              },
            ],
          },
          {
            id: 'slow-submissions',
            type: 'table',
            title: 'Slow Submissions (Client Pending 5+ Days)',
            dataSource: {
              type: 'field',
              path: 'bottlenecks.slowSubmissions',
            },
            columns_config: [
              {
                id: 'submission',
                header: 'Submission',
                path: 'candidateName',
                type: 'link',
                config: { linkPattern: '/employee/submissions/{{id}}' },
              },
              {
                id: 'job',
                header: 'Job',
                accessor: 'jobTitle',
                type: 'text',
              },
              {
                id: 'days-pending',
                header: 'Days Pending',
                accessor: 'daysPending',
                type: 'number',
              },
              {
                id: 'recruiter',
                header: 'Recruiter',
                accessor: 'recruiterName',
                type: 'user',
              },
            ],
          },
        ],
      },
    ],
  },
  
  actions: [
    {
      id: 'all-pods',
      type: 'navigate',
      label: 'All Pods',
      icon: 'Users',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/coo/pods' },
    },
    {
      id: 'sla-dashboard',
      type: 'navigate',
      label: 'SLA Dashboard',
      icon: 'Timer',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/coo/sla' },
    },
    {
      id: 'escalations',
      type: 'navigate',
      label: 'Escalations',
      icon: 'AlertTriangle',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/coo/escalations' },
    },
    {
      id: 'export',
      type: 'modal',
      label: 'Export Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportOperationsReportModal' },
    },
    {
      id: 'notification-settings',
      type: 'modal',
      label: 'Settings',
      icon: 'Settings',
      variant: 'ghost',
      config: { type: 'modal', modal: 'COONotificationSettingsModal' },
    },
    {
      id: 'refresh',
      type: 'custom',
      label: 'Refresh',
      icon: 'RefreshCw',
      variant: 'ghost',
      config: { type: 'custom', handler: 'handleRefresh' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Home', route: '/employee/workspace' },
      { label: 'COO Dashboard' },
    ],
  },

  keyboard_shortcuts: [
    { key: 'g o', action: 'navigate:/employee/coo/dashboard', description: 'Go to COO Dashboard' },
    { key: 'g p', action: 'navigate:/employee/coo/pods', description: 'Go to All Pods' },
    { key: 'g s', action: 'navigate:/employee/coo/sla', description: 'Go to SLA Dashboard' },
    { key: 'g e', action: 'navigate:/employee/coo/escalations', description: 'Go to Escalations' },
    { key: 'g n', action: 'tab:informed-feed', description: 'Go to Notifications' },
    { key: 'e', action: 'escalate-selected', description: 'Escalate selected item' },
    { key: 'a', action: 'assign-selected', description: 'Assign selected item' },
    { key: 'r', action: 'refresh', description: 'Refresh data' },
  ],
};

