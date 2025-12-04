/**
 * SLA Dashboard Screen Definition
 *
 * SLA compliance monitoring and management for COO.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const slaDashboardScreen: ScreenDefinition = {
  id: 'sla-dashboard',
  type: 'dashboard',
  title: 'SLA Dashboard',
  subtitle: 'Service Level Agreement compliance and monitoring',
  icon: 'Timer',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'operations.getSLADashboard',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // SLA Summary KPIs
      {
        id: 'sla-kpis',
        type: 'metrics-grid',
        title: 'SLA Overview',
        columns: 5,
        fields: [
          {
            id: 'overall-compliance',
            label: 'Overall Compliance',
            type: 'percentage',
            path: 'summary.overallCompliance',
            config: { target: 95, icon: 'CheckCircle' },
          },
          {
            id: 'active-slas',
            label: 'Active SLAs',
            type: 'number',
            path: 'summary.activeSLAs',
            config: { icon: 'Activity' },
          },
          {
            id: 'at-risk',
            label: 'At Risk',
            type: 'number',
            path: 'summary.atRisk',
            config: { icon: 'AlertTriangle', thresholds: { warning: 5, critical: 10 } },
          },
          {
            id: 'breached',
            label: 'Breached',
            type: 'number',
            path: 'summary.breached',
            config: { icon: 'XCircle', thresholds: { warning: 1, critical: 5 } },
          },
          {
            id: 'resolved-today',
            label: 'Resolved Today',
            type: 'number',
            path: 'summary.resolvedToday',
            config: { icon: 'CheckSquare' },
          },
        ],
      },

      // Compliance by Activity Type
      {
        id: 'compliance-by-type',
        type: 'custom',
        component: 'SLAComplianceByTypeChart',
        title: 'Compliance by Activity Type',
        config: {
          chartType: 'horizontal-bar',
          height: 300,
          showTarget: true,
          target: 95,
        },
      },

      // Compliance by Pod
      {
        id: 'compliance-by-pod',
        type: 'custom',
        component: 'SLAComplianceByPodChart',
        title: 'Compliance by Pod',
        config: {
          chartType: 'bar',
          height: 300,
          showTarget: true,
          target: 95,
        },
      },

      // Breach Analysis
      {
        id: 'breach-analysis',
        type: 'custom',
        component: 'SLABreachAnalysisChart',
        title: 'Breach Analysis (Root Causes)',
        config: {
          chartType: 'donut',
          height: 300,
        },
      },

      // Breached SLAs Table
      {
        id: 'breached-slas',
        type: 'table',
        title: 'Breached SLAs Requiring Action',
        icon: 'AlertOctagon',
        dataSource: {
          type: 'field',
          path: 'breaches',
        },
        columns_config: [
          { id: 'activity', header: 'Activity', path: 'activitySubject', type: 'text' },
          { id: 'entity', header: 'Entity', path: 'entityName', type: 'text' },
          { id: 'type', header: 'SLA Type', path: 'slaType', type: 'text' },
          { id: 'target', header: 'Target', path: 'targetHours', type: 'number', config: { suffix: ' hrs' } },
          { id: 'actual', header: 'Actual', path: 'actualHours', type: 'number', config: { suffix: ' hrs' } },
          { id: 'breach-duration', header: 'Breach Duration', path: 'breachDuration', type: 'text' },
          { id: 'owner', header: 'Owner', path: 'ownerName', type: 'text' },
          { id: 'pod', header: 'Pod', path: 'podName', type: 'text' },
        ],
        actions: [
          {
            id: 'view-activity',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/employee/activities/${activityId}' },
          },
          {
            id: 'escalate',
            type: 'modal',
            label: 'Escalate',
            icon: 'ArrowUp',
            config: { type: 'modal', modal: 'EscalateSLAModal' },
          },
          {
            id: 'reassign',
            type: 'modal',
            label: 'Reassign',
            icon: 'UserPlus',
            config: { type: 'modal', modal: 'ReassignActivityModal' },
          },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },

      // At Risk SLAs Table
      {
        id: 'at-risk-slas',
        type: 'table',
        title: 'SLAs At Risk (Warning)',
        icon: 'AlertTriangle',
        collapsible: true,
        dataSource: {
          type: 'field',
          path: 'atRisk',
        },
        columns_config: [
          { id: 'activity', header: 'Activity', path: 'activitySubject', type: 'text' },
          { id: 'entity', header: 'Entity', path: 'entityName', type: 'text' },
          { id: 'type', header: 'SLA Type', path: 'slaType', type: 'text' },
          { id: 'time-remaining', header: 'Time Remaining', path: 'timeRemaining', type: 'text' },
          { id: 'owner', header: 'Owner', path: 'ownerName', type: 'text' },
          { id: 'pod', header: 'Pod', path: 'podName', type: 'text' },
        ],
        actions: [
          {
            id: 'view-activity',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/employee/activities/${activityId}' },
          },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },

      // Trending Violations
      {
        id: 'trending-violations',
        type: 'custom',
        component: 'TrendingViolationsChart',
        title: 'Trending Violations (30 Days)',
        config: {
          chartType: 'line',
          height: 280,
        },
      },

      // SLA Configuration
      {
        id: 'sla-config',
        type: 'table',
        title: 'SLA Configuration',
        icon: 'Settings',
        collapsible: true,
        defaultExpanded: false,
        dataSource: {
          type: 'field',
          path: 'slaConfig',
        },
        columns_config: [
          { id: 'activity-type', header: 'Activity Type', path: 'activityType', type: 'text' },
          { id: 'warning-hours', header: 'Warning (hrs)', path: 'warningHours', type: 'number' },
          { id: 'breach-hours', header: 'Breach (hrs)', path: 'breachHours', type: 'number' },
          { id: 'escalation-chain', header: 'Escalation Chain', path: 'escalationChain', type: 'text' },
          { id: 'active', header: 'Active', path: 'isActive', type: 'boolean' },
        ],
        actions: [
          {
            id: 'edit-sla',
            type: 'modal',
            label: 'Edit',
            icon: 'Edit',
            config: { type: 'modal', modal: 'EditSLAConfigModal' },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'review-breaches',
      type: 'modal',
      label: 'Bulk Review',
      icon: 'CheckSquare',
      variant: 'primary',
      config: { type: 'modal', modal: 'BulkReviewSLAModal' },
    },
    {
      id: 'adjust-slas',
      type: 'modal',
      label: 'Adjust SLAs',
      icon: 'Settings',
      variant: 'outline',
      config: { type: 'modal', modal: 'AdjustSLAConfigModal' },
    },
    {
      id: 'export',
      type: 'modal',
      label: 'Export Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportSLAReportModal' },
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
      { label: 'SLA Dashboard' },
    ],
  },
};
