/**
 * COO Operations Dashboard Screen Definition
 * 
 * Real-time operational visibility dashboard for the Chief Operating Officer.
 * The COO is ALWAYS INFORMED on all object changes.
 * 
 * @see docs/specs/20-USER-ROLES/08-coo/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const cooDashboardScreen: ScreenDefinition = {
  id: 'coo-dashboard',
  type: 'dashboard',
  entityType: 'operations',
  title: 'COO Operations Dashboard',
  description: 'Real-time operational visibility and control center',
  
  dataSource: {
    type: 'query',
    query: 'operations.getCOODashboard',
  },
  
  layout: {
    type: 'tabs',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: OVERVIEW
      // ─────────────────────────────────────────────────────
      {
        id: 'overview',
        label: 'Overview',
        icon: 'layout-dashboard',
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
                format: 'percentage',
                target: 85,
                size: 'large',
              },
              {
                id: 'utilization',
                label: 'Team Utilization',
                value: { type: 'field', path: 'overview.utilization' },
                format: 'percentage',
                target: 85,
              },
              {
                id: 'ttf',
                label: 'Avg TTF (Days)',
                value: { type: 'field', path: 'overview.avgTTF' },
                format: 'number',
                target: 30,
                inverse: true,
              },
              {
                id: 'placements-today',
                label: 'Placements Today',
                value: { type: 'field', path: 'overview.placementsToday' },
                format: 'number',
                target: 8,
              },
              {
                id: 'sla-compliance',
                label: 'SLA Compliance',
                value: { type: 'field', path: 'overview.slaCompliance' },
                format: 'percentage',
                target: 95,
              },
            ],
          },
          {
            id: 'pillar-health',
            type: 'custom',
            component: 'PillarHealthGrid',
            title: 'Pillar Health Status',
            span: 'full',
          },
          {
            id: 'regional-performance',
            type: 'custom',
            component: 'RegionalPerformanceMap',
            title: 'Regional Performance',
            span: 'half',
          },
          {
            id: 'pod-status',
            type: 'custom',
            component: 'PodStatusGrid',
            title: 'Pod Status Overview',
            span: 'half',
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 2: INFORMED FEED (Critical)
      // ─────────────────────────────────────────────────────
      {
        id: 'informed-feed',
        label: 'Informed Feed',
        icon: 'bell',
        badge: { type: 'field', path: 'notifications.unreadCount' },
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
            columns: [
              {
                id: 'timestamp',
                header: 'Time',
                field: 'timestamp',
                type: 'relative-time',
                width: '80px',
              },
              {
                id: 'event',
                header: 'Event',
                field: 'description',
                type: 'text',
                primary: true,
              },
              {
                id: 'entity',
                header: 'Entity',
                field: 'entityTitle',
                type: 'link',
                linkPattern: '{{entityUrl}}',
              },
              {
                id: 'actor',
                header: 'Actor',
                field: 'actorName',
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
                    action: { type: 'navigate', path: '{{entityUrl}}' },
                  },
                  {
                    id: 'escalate',
                    label: 'Escalate',
                    icon: 'arrow-up',
                    action: { type: 'modal', modalId: 'escalate' },
                  },
                  {
                    id: 'assign',
                    label: 'Assign',
                    icon: 'user-plus',
                    action: { type: 'modal', modalId: 'assign' },
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
            columns: [
              {
                id: 'timestamp',
                header: 'Time',
                field: 'timestamp',
                type: 'relative-time',
              },
              {
                id: 'event',
                header: 'Event',
                field: 'description',
                type: 'text',
              },
              {
                id: 'entity',
                header: 'Entity',
                field: 'entityTitle',
                type: 'link',
                linkPattern: '{{entityUrl}}',
              },
              {
                id: 'actor',
                header: 'Actor',
                field: 'actorName',
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
            columns: [
              {
                id: 'timestamp',
                header: 'Time',
                field: 'timestamp',
                type: 'relative-time',
              },
              {
                id: 'event',
                header: 'Event',
                field: 'description',
                type: 'text',
              },
              {
                id: 'entity',
                header: 'Entity',
                field: 'entityTitle',
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
        icon: 'timer',
        badge: { type: 'field', path: 'sla.breachCount' },
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
                format: 'percentage',
                target: 95,
              },
              {
                id: 'active-slas',
                label: 'Active SLAs',
                value: { type: 'field', path: 'sla.activeCount' },
                format: 'number',
              },
              {
                id: 'at-risk',
                label: 'At Risk',
                value: { type: 'field', path: 'sla.atRiskCount' },
                format: 'number',
                alertThreshold: 5,
              },
              {
                id: 'breached',
                label: 'Breached',
                value: { type: 'field', path: 'sla.breachCount' },
                format: 'number',
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
            columns: [
              {
                id: 'entity',
                header: 'Entity',
                field: 'entityTitle',
                type: 'link',
                linkPattern: '{{entityUrl}}',
              },
              {
                id: 'sla-type',
                header: 'SLA Type',
                field: 'slaType',
                type: 'text',
              },
              {
                id: 'target',
                header: 'Target',
                field: 'targetHours',
                type: 'text',
                suffix: ' hours',
              },
              {
                id: 'actual',
                header: 'Actual',
                field: 'actualHours',
                type: 'text',
                suffix: ' hours',
              },
              {
                id: 'breach-duration',
                header: 'Breach Duration',
                field: 'breachDuration',
                type: 'duration',
              },
              {
                id: 'owner',
                header: 'Owner',
                field: 'ownerName',
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
                    action: { type: 'modal', modalId: 'escalate' },
                  },
                  {
                    id: 'reassign',
                    label: 'Reassign',
                    icon: 'user-plus',
                    action: { type: 'modal', modalId: 'reassign' },
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
            columns: [
              {
                id: 'entity',
                header: 'Entity',
                field: 'entityTitle',
                type: 'link',
                linkPattern: '{{entityUrl}}',
              },
              {
                id: 'sla-type',
                header: 'SLA Type',
                field: 'slaType',
                type: 'text',
              },
              {
                id: 'time-remaining',
                header: 'Time Remaining',
                field: 'timeRemaining',
                type: 'duration',
              },
              {
                id: 'owner',
                header: 'Owner',
                field: 'ownerName',
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
        icon: 'users',
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
                format: 'number',
              },
              {
                id: 'active-recruiters',
                label: 'Active Recruiters',
                value: { type: 'field', path: 'team.activeRecruiters' },
                format: 'number',
              },
              {
                id: 'avg-productivity',
                label: 'Avg Productivity',
                value: { type: 'field', path: 'team.avgProductivity' },
                format: 'percentage',
                target: 100,
              },
              {
                id: 'pods-green',
                label: 'Pods at 100%',
                value: { type: 'field', path: 'team.podsAtTarget' },
                format: 'number',
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
            columns: [
              {
                id: 'rank',
                header: '#',
                field: 'rank',
                type: 'number',
                width: '50px',
              },
              {
                id: 'pod',
                header: 'Pod',
                field: 'name',
                type: 'link',
                linkPattern: '/employee/manager/pod/{{id}}',
              },
              {
                id: 'manager',
                header: 'Manager',
                field: 'managerName',
                type: 'user',
              },
              {
                id: 'placements',
                header: 'Placements (Sprint)',
                field: 'sprintPlacements',
                type: 'text',
                format: '{{actual}}/{{target}}',
              },
              {
                id: 'progress',
                header: 'Progress',
                field: 'progressPercentage',
                type: 'progress-bar',
              },
              {
                id: 'status',
                header: 'Status',
                field: 'status',
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
                    action: { type: 'navigate', path: '/employee/manager/pod/{{id}}/metrics' },
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
            span: 'half',
          },
          {
            id: 'needs-coaching',
            type: 'custom',
            component: 'NeedsCoachingWidget',
            title: 'ICs Needing Support',
            span: 'half',
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 5: BOTTLENECKS
      // ─────────────────────────────────────────────────────
      {
        id: 'bottlenecks',
        label: 'Bottlenecks',
        icon: 'alert-octagon',
        badge: { type: 'field', path: 'bottlenecks.criticalCount' },
        sections: [
          {
            id: 'bottleneck-analysis',
            type: 'custom',
            component: 'BottleneckAnalysisChart',
            title: 'Process Bottleneck Analysis',
            span: 'full',
          },
          {
            id: 'stale-jobs',
            type: 'table',
            title: 'Stale Jobs (No Activity 7+ Days)',
            dataSource: {
              type: 'field',
              path: 'bottlenecks.staleJobs',
            },
            columns: [
              {
                id: 'job',
                header: 'Job',
                field: 'title',
                type: 'link',
                linkPattern: '/employee/jobs/{{id}}',
              },
              {
                id: 'client',
                header: 'Client',
                field: 'clientName',
                type: 'text',
              },
              {
                id: 'days-stale',
                header: 'Days Stale',
                field: 'daysStale',
                type: 'number',
              },
              {
                id: 'owner',
                header: 'Owner',
                field: 'ownerName',
                type: 'user',
              },
              {
                id: 'pod',
                header: 'Pod',
                field: 'podName',
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
                    action: { type: 'modal', modalId: 'escalate' },
                  },
                  {
                    id: 'reassign',
                    label: 'Reassign',
                    icon: 'user-plus',
                    action: { type: 'modal', modalId: 'reassign' },
                  },
                  {
                    id: 'close',
                    label: 'Close Job',
                    icon: 'x',
                    action: { type: 'mutation', mutation: 'jobs.close' },
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
            columns: [
              {
                id: 'submission',
                header: 'Submission',
                field: 'candidateName',
                type: 'link',
                linkPattern: '/employee/submissions/{{id}}',
              },
              {
                id: 'job',
                header: 'Job',
                field: 'jobTitle',
                type: 'text',
              },
              {
                id: 'days-pending',
                header: 'Days Pending',
                field: 'daysPending',
                type: 'number',
              },
              {
                id: 'recruiter',
                header: 'Recruiter',
                field: 'recruiterName',
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
      id: 'refresh',
      label: 'Refresh',
      icon: 'refresh-cw',
      action: { type: 'refresh' },
      position: 'header',
    },
    {
      id: 'notification-settings',
      label: 'Notification Settings',
      icon: 'settings',
      action: { type: 'modal', modalId: 'notification-settings' },
      position: 'header',
    },
    {
      id: 'export',
      label: 'Export Report',
      icon: 'download',
      action: { type: 'export', format: 'pdf' },
      position: 'header',
    },
  ],
  
  keyboardShortcuts: [
    { key: 'g o', action: 'navigate:/executive/coo', description: 'Go to COO Dashboard' },
    { key: 'g n', action: 'tab:informed-feed', description: 'Go to Notifications' },
    { key: 'g s', action: 'tab:sla', description: 'Go to SLA Management' },
    { key: 'e', action: 'escalate-selected', description: 'Escalate selected item' },
    { key: 'a', action: 'assign-selected', description: 'Assign selected item' },
    { key: 'r', action: 'refresh', description: 'Refresh data' },
  ],
};

