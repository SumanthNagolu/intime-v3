/**
 * All Pods Overview Screen Definition
 *
 * COO view of all pods across the organization.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const allPodsOverviewScreen: ScreenDefinition = {
  id: 'all-pods-overview',
  type: 'list',
  title: 'All Pods Overview',
  subtitle: 'Organization-wide pod performance and health',
  icon: 'Users',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'operations.getAllPods',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Summary KPIs
      {
        id: 'pods-summary',
        type: 'metrics-grid',
        title: 'Pod Performance Summary',
        columns: 5,
        fields: [
          {
            id: 'total-pods',
            label: 'Total Pods',
            type: 'number',
            path: 'summary.totalPods',
            config: { icon: 'Users' },
          },
          {
            id: 'pods-on-target',
            label: 'On Target',
            type: 'number',
            path: 'summary.podsOnTarget',
            config: { icon: 'CheckCircle' },
          },
          {
            id: 'pods-at-risk',
            label: 'At Risk',
            type: 'number',
            path: 'summary.podsAtRisk',
            config: { icon: 'AlertTriangle', thresholds: { warning: 3, critical: 5 } },
          },
          {
            id: 'pods-off-track',
            label: 'Off Track',
            type: 'number',
            path: 'summary.podsOffTrack',
            config: { icon: 'XCircle', thresholds: { warning: 1, critical: 2 } },
          },
          {
            id: 'avg-attainment',
            label: 'Avg Attainment',
            type: 'percentage',
            path: 'summary.avgAttainment',
            config: { target: 100 },
          },
        ],
      },

      // Filter Section
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'pod-type',
            name: 'podType',
            label: 'Pod Type',
            type: 'select',
            config: {
              options: [
                { value: 'all', label: 'All Types' },
                { value: 'recruiting', label: 'Recruiting' },
                { value: 'bench_sales', label: 'Bench Sales' },
                { value: 'ta', label: 'Talent Acquisition' },
              ],
            },
          },
          {
            id: 'performance-tier',
            name: 'performanceTier',
            label: 'Performance',
            type: 'select',
            config: {
              options: [
                { value: 'all', label: 'All' },
                { value: 'exceeding', label: 'Exceeding Target' },
                { value: 'on_track', label: 'On Track' },
                { value: 'at_risk', label: 'At Risk' },
                { value: 'off_track', label: 'Off Track' },
              ],
            },
          },
        ],
      },

      // Pod Cards Grid (using custom component)
      {
        id: 'pod-cards',
        type: 'custom',
        component: 'PodCardsGrid',
        title: 'All Pods',
        config: {
          cardFields: ['name', 'type', 'manager', 'icCount', 'sprintProgress', 'healthScore'],
          clickAction: 'navigate',
          navigateRoute: '/employee/coo/pods/${id}',
        },
      },

      // Pod Performance Rankings Table
      {
        id: 'pod-rankings',
        type: 'table',
        title: 'Pod Performance Rankings',
        icon: 'Trophy',
        dataSource: {
          type: 'field',
          path: 'pods',
        },
        columns_config: [
          {
            id: 'rank',
            header: '#',
            path: 'rank',
            type: 'number',
            width: '50px',
          },
          {
            id: 'name',
            header: 'Pod Name',
            path: 'name',
            type: 'text',
            sortable: true,
          },
          {
            id: 'type',
            header: 'Type',
            path: 'podType',
            type: 'enum',
            config: {
              options: [
                { value: 'recruiting', label: 'Recruiting' },
                { value: 'bench_sales', label: 'Bench Sales' },
                { value: 'ta', label: 'TA' },
              ],
              badgeColors: {
                recruiting: 'blue',
                bench_sales: 'purple',
                ta: 'green',
              },
            },
          },
          {
            id: 'manager',
            header: 'Manager',
            path: 'managerName',
            type: 'text',
          },
          {
            id: 'ic-count',
            header: 'ICs',
            path: 'icCount',
            type: 'number',
          },
          {
            id: 'sprint-progress',
            header: 'Sprint Progress',
            path: 'sprintProgress',
            type: 'text',
            config: { template: '${actual}/${target}' },
          },
          {
            id: 'attainment',
            header: 'Attainment',
            path: 'attainmentPercent',
            type: 'percentage',
            sortable: true,
          },
          {
            id: 'health-score',
            header: 'Health',
            path: 'healthScore',
            type: 'number',
            config: { max: 100 },
          },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: [
                { value: 'exceeding', label: 'Exceeding' },
                { value: 'on_track', label: 'On Track' },
                { value: 'at_risk', label: 'At Risk' },
                { value: 'off_track', label: 'Off Track' },
              ],
              badgeColors: {
                exceeding: 'green',
                on_track: 'blue',
                at_risk: 'yellow',
                off_track: 'red',
              },
            },
          },
        ],
        actions: [
          {
            id: 'view-pod',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/employee/coo/pods/${id}' },
          },
        ],
        pagination: { enabled: true, pageSize: 20 },
      },
    ],
  },

  actions: [
    {
      id: 'export',
      type: 'modal',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportPodsReportModal' },
    },
    {
      id: 'back-to-dashboard',
      type: 'navigate',
      label: 'Back to Dashboard',
      icon: 'ArrowLeft',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/coo/dashboard' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Home', route: '/employee/workspace' },
      { label: 'COO Dashboard', route: '/employee/coo/dashboard' },
      { label: 'All Pods' },
    ],
  },
};
