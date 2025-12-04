/**
 * COO Escalations Overview Screen Definition
 *
 * Org-wide escalation view for COO.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const cooEscalationsScreen: ScreenDefinition = {
  id: 'coo-escalations',
  type: 'list',
  title: 'Escalations Overview',
  subtitle: 'Organization-wide escalation management',
  icon: 'AlertTriangle',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'operations.getEscalations',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Escalation KPIs
      {
        id: 'escalation-kpis',
        type: 'metrics-grid',
        title: 'Escalation Summary',
        columns: 5,
        fields: [
          {
            id: 'open-escalations',
            label: 'Open Escalations',
            type: 'number',
            path: 'summary.openCount',
            config: { icon: 'AlertTriangle', thresholds: { warning: 10, critical: 20 } },
          },
          {
            id: 'critical',
            label: 'Critical',
            type: 'number',
            path: 'summary.criticalCount',
            config: { icon: 'XCircle', thresholds: { warning: 3, critical: 5 } },
          },
          {
            id: 'high',
            label: 'High Priority',
            type: 'number',
            path: 'summary.highCount',
            config: { icon: 'AlertOctagon' },
          },
          {
            id: 'avg-resolution',
            label: 'Avg Resolution Time',
            type: 'number',
            path: 'summary.avgResolutionHours',
            config: { suffix: ' hrs', target: 24, inverse: true },
          },
          {
            id: 'resolved-today',
            label: 'Resolved Today',
            type: 'number',
            path: 'summary.resolvedToday',
            config: { icon: 'CheckCircle' },
          },
        ],
      },

      // Escalation by Type
      {
        id: 'escalation-by-type',
        type: 'custom',
        component: 'EscalationByTypeChart',
        title: 'Escalations by Type',
        config: {
          chartType: 'donut',
          height: 300,
        },
      },

      // Escalation by Pod
      {
        id: 'escalation-by-pod',
        type: 'custom',
        component: 'EscalationByPodChart',
        title: 'Escalations by Pod',
        config: {
          chartType: 'bar',
          height: 300,
        },
      },

      // Open Escalations Table
      {
        id: 'open-escalations-table',
        type: 'table',
        title: 'Open Escalations',
        icon: 'AlertTriangle',
        dataSource: {
          type: 'field',
          path: 'openEscalations',
        },
        columns_config: [
          {
            id: 'severity',
            header: '',
            path: 'severity',
            type: 'enum',
            width: '50px',
            config: {
              options: [
                { value: 'critical', label: '🔴' },
                { value: 'high', label: '🟠' },
                { value: 'medium', label: '🟡' },
                { value: 'low', label: '🟢' },
              ],
            },
          },
          { id: 'title', header: 'Issue', path: 'title', type: 'text', sortable: true },
          {
            id: 'type',
            header: 'Type',
            path: 'escalationType',
            type: 'enum',
            config: {
              options: [
                { value: 'client_complaint', label: 'Client Complaint' },
                { value: 'candidate_issue', label: 'Candidate Issue' },
                { value: 'sla_breach', label: 'SLA Breach' },
                { value: 'rate_dispute', label: 'Rate Dispute' },
                { value: 'performance', label: 'Performance' },
                { value: 'compliance', label: 'Compliance' },
                { value: 'other', label: 'Other' },
              ],
            },
          },
          { id: 'entity', header: 'Related Entity', path: 'entityName', type: 'text' },
          { id: 'pod', header: 'Pod', path: 'podName', type: 'text' },
          { id: 'assigned-to', header: 'Assigned To', path: 'assignedToName', type: 'text' },
          { id: 'created', header: 'Created', path: 'createdAt', type: 'date', sortable: true },
          { id: 'age', header: 'Age', path: 'ageHours', type: 'number', config: { suffix: ' hrs' } },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: [
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'pending_response', label: 'Pending Response' },
                { value: 'resolved', label: 'Resolved' },
              ],
              badgeColors: {
                open: 'red',
                in_progress: 'yellow',
                pending_response: 'blue',
                resolved: 'green',
              },
            },
          },
        ],
        actions: [
          {
            id: 'view',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/employee/manager/escalations/${id}' },
          },
          {
            id: 'assign',
            type: 'modal',
            label: 'Assign',
            icon: 'UserPlus',
            config: { type: 'modal', modal: 'AssignEscalationModal' },
          },
          {
            id: 'take-over',
            type: 'mutation',
            label: 'Take Over',
            icon: 'UserCheck',
            config: { type: 'mutation', procedure: 'escalations.takeOver' },
          },
          {
            id: 'close',
            type: 'modal',
            label: 'Close',
            icon: 'Check',
            config: { type: 'modal', modal: 'CloseEscalationModal' },
          },
        ],
        pagination: { enabled: true, pageSize: 15 },
      },

      // Resolution Time Trend
      {
        id: 'resolution-trend',
        type: 'custom',
        component: 'ResolutionTimeTrendChart',
        title: 'Resolution Time Trend (30 Days)',
        config: {
          chartType: 'line',
          height: 280,
        },
      },

      // Manager Performance on Escalations
      {
        id: 'manager-performance',
        type: 'table',
        title: 'Manager Performance on Escalations',
        icon: 'Users',
        collapsible: true,
        dataSource: {
          type: 'field',
          path: 'managerPerformance',
        },
        columns_config: [
          { id: 'manager', header: 'Manager', path: 'managerName', type: 'text' },
          { id: 'pod', header: 'Pod', path: 'podName', type: 'text' },
          { id: 'total-escalations', header: 'Total Escalations', path: 'totalCount', type: 'number', sortable: true },
          { id: 'open', header: 'Open', path: 'openCount', type: 'number' },
          { id: 'resolved-mtd', header: 'Resolved MTD', path: 'resolvedMTD', type: 'number' },
          { id: 'avg-resolution', header: 'Avg Resolution (hrs)', path: 'avgResolutionHours', type: 'number', sortable: true },
          { id: 'escalation-rate', header: 'Escalation Rate', path: 'escalationRate', type: 'percentage' },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },

      // Recently Resolved
      {
        id: 'recently-resolved',
        type: 'table',
        title: 'Recently Resolved',
        icon: 'CheckCircle',
        collapsible: true,
        dataSource: {
          type: 'field',
          path: 'recentlyResolved',
        },
        columns_config: [
          { id: 'title', header: 'Issue', path: 'title', type: 'text' },
          { id: 'type', header: 'Type', path: 'escalationType', type: 'text' },
          { id: 'resolved-by', header: 'Resolved By', path: 'resolvedByName', type: 'text' },
          { id: 'resolved-at', header: 'Resolved', path: 'resolvedAt', type: 'date' },
          { id: 'resolution-time', header: 'Resolution Time', path: 'resolutionHours', type: 'number', config: { suffix: ' hrs' } },
          { id: 'outcome', header: 'Outcome', path: 'outcome', type: 'text' },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },
    ],
  },

  actions: [
    {
      id: 'new-escalation',
      type: 'modal',
      label: 'Create Escalation',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'CreateEscalationModal' },
    },
    {
      id: 'export',
      type: 'modal',
      label: 'Export Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportEscalationsReportModal' },
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
      { label: 'Escalations' },
    ],
  },
};
