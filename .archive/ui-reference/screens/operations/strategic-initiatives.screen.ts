/**
 * Strategic Initiatives Screen Definition
 *
 * Track and manage strategic initiatives for CEO.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const strategicInitiativesScreen: ScreenDefinition = {
  id: 'strategic-initiatives',
  type: 'list',
  title: 'Strategic Initiatives',
  subtitle: 'Track company-wide strategic initiatives and goals',
  icon: 'Target',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'executive.getStrategicInitiatives',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Summary KPIs
      {
        id: 'initiative-kpis',
        type: 'metrics-grid',
        title: 'Initiative Summary',
        columns: 4,
        fields: [
          {
            id: 'total-initiatives',
            label: 'Total Initiatives',
            type: 'number',
            path: 'summary.totalCount',
            config: { icon: 'Target' },
          },
          {
            id: 'on-track',
            label: 'On Track',
            type: 'number',
            path: 'summary.onTrackCount',
            config: { icon: 'CheckCircle' },
          },
          {
            id: 'at-risk',
            label: 'At Risk',
            type: 'number',
            path: 'summary.atRiskCount',
            config: { icon: 'AlertTriangle', thresholds: { warning: 2, critical: 4 } },
          },
          {
            id: 'completed-ytd',
            label: 'Completed YTD',
            type: 'number',
            path: 'summary.completedYTD',
            config: { icon: 'Award' },
          },
        ],
      },

      // Initiative Cards
      {
        id: 'initiatives-cards',
        type: 'custom',
        component: 'InitiativeCardsGrid',
        title: 'Strategic Initiatives',
        config: {
          showProgress: true,
          showOwner: true,
          showDeadline: true,
          cardLayout: 'detailed',
        },
      },

      // Initiative Timeline
      {
        id: 'initiative-timeline',
        type: 'custom',
        component: 'InitiativeTimelineChart',
        title: 'Initiative Timeline',
        config: {
          height: 300,
          showMilestones: true,
        },
      },

      // Resource Allocation
      {
        id: 'resource-allocation',
        type: 'custom',
        component: 'ResourceAllocationChart',
        title: 'Resource Allocation by Initiative',
        config: {
          chartType: 'treemap',
          height: 350,
        },
      },

      // Detailed Initiative Table
      {
        id: 'initiatives-table',
        type: 'table',
        title: 'All Initiatives',
        icon: 'List',
        dataSource: {
          type: 'field',
          path: 'initiatives',
        },
        columns_config: [
          { id: 'name', header: 'Initiative', path: 'name', type: 'text', sortable: true },
          { id: 'owner', header: 'Owner', path: 'ownerName', type: 'text' },
          { id: 'progress', header: 'Progress', path: 'progressPercent', type: 'percentage', sortable: true },
          { id: 'deadline', header: 'Deadline', path: 'deadline', type: 'date', sortable: true },
          { id: 'budget', header: 'Budget', path: 'budget', type: 'currency' },
          { id: 'spent', header: 'Spent', path: 'spent', type: 'currency' },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: [
                { value: 'on_track', label: 'On Track' },
                { value: 'at_risk', label: 'At Risk' },
                { value: 'delayed', label: 'Delayed' },
                { value: 'completed', label: 'Completed' },
              ],
              badgeColors: {
                on_track: 'green',
                at_risk: 'yellow',
                delayed: 'red',
                completed: 'blue',
              },
            },
          },
          { id: 'priority', header: 'Priority', path: 'priority', type: 'enum', config: { options: [{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] } },
        ],
        actions: [
          {
            id: 'view',
            type: 'modal',
            label: 'View Details',
            icon: 'Eye',
            config: { type: 'modal', modal: 'InitiativeDetailModal' },
          },
          {
            id: 'update-status',
            type: 'modal',
            label: 'Update Status',
            icon: 'Edit',
            config: { type: 'modal', modal: 'UpdateInitiativeStatusModal' },
          },
        ],
        pagination: { enabled: true, pageSize: 15 },
      },

      // Dependencies
      {
        id: 'dependencies',
        type: 'custom',
        component: 'InitiativeDependencyGraph',
        title: 'Initiative Dependencies',
        collapsible: true,
        config: { height: 400 },
      },

      // Risk Flags
      {
        id: 'risk-flags',
        type: 'table',
        title: 'Active Risk Flags',
        icon: 'AlertTriangle',
        collapsible: true,
        dataSource: {
          type: 'field',
          path: 'riskFlags',
        },
        columns_config: [
          { id: 'initiative', header: 'Initiative', path: 'initiativeName', type: 'text' },
          { id: 'risk', header: 'Risk', path: 'riskDescription', type: 'text' },
          { id: 'severity', header: 'Severity', path: 'severity', type: 'enum', config: { options: [{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }], badgeColors: { critical: 'red', high: 'orange', medium: 'yellow' } } },
          { id: 'mitigation', header: 'Mitigation', path: 'mitigation', type: 'text' },
          { id: 'owner', header: 'Owner', path: 'ownerName', type: 'text' },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'new-initiative',
      type: 'modal',
      label: 'New Initiative',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'NewInitiativeModal' },
    },
    {
      id: 'export',
      type: 'modal',
      label: 'Export',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportInitiativesModal' },
    },
    {
      id: 'back-to-dashboard',
      type: 'navigate',
      label: 'Back to Dashboard',
      icon: 'ArrowLeft',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/ceo/dashboard' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Home', route: '/employee/workspace' },
      { label: 'CEO Dashboard', route: '/employee/ceo/dashboard' },
      { label: 'Strategic Initiatives' },
    ],
  },
};
