/**
 * Margin Analysis Screen Definition
 *
 * Deep-dive into margin metrics and profitability analysis for CFO.
 *
 * @see docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const marginAnalysisScreen: ScreenDefinition = {
  id: 'margin-analysis',
  type: 'dashboard',
  title: 'Margin Analysis',
  subtitle: 'Profitability analysis and margin optimization',
  icon: 'TrendingUp',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'finance.getMarginAnalysis',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // KPI Summary
      {
        id: 'margin-kpis',
        type: 'metrics-grid',
        title: 'Margin Overview',
        columns: 4,
        fields: [
          {
            id: 'overall-margin',
            label: 'Overall Gross Margin',
            type: 'percentage',
            path: 'summary.overallMargin',
            config: {
              target: 25,
              thresholds: { warning: 20, critical: 15 },
              icon: 'Percent',
            },
          },
          {
            id: 'avg-margin-per-hour',
            label: 'Avg Margin/Hour',
            type: 'currency',
            path: 'summary.avgMarginPerHour',
            config: {
              target: 20,
              thresholds: { warning: 15, critical: 10 },
              icon: 'Clock',
            },
          },
          {
            id: 'low-margin-count',
            label: 'Low Margin Placements',
            type: 'number',
            path: 'summary.lowMarginCount',
            config: {
              icon: 'AlertTriangle',
              thresholds: { warning: 5, critical: 10 },
            },
          },
          {
            id: 'negative-margin-count',
            label: 'Negative Margin',
            type: 'number',
            path: 'summary.negativeMarginCount',
            config: {
              icon: 'XCircle',
              thresholds: { warning: 1, critical: 3 },
            },
          },
        ],
      },

      // Overall Margin Trends
      {
        id: 'margin-trend',
        type: 'custom',
        component: 'MarginTrendChart',
        title: 'Margin Trends (12 Months)',
        config: {
          height: 350,
          showTargetLine: true,
          target: 25,
        },
      },

      // Margin by Placement Type
      {
        id: 'margin-by-type',
        type: 'custom',
        component: 'MarginByPlacementTypeChart',
        title: 'Margin by Placement Type',
        config: {
          types: [
            { id: 'contract', label: 'Contract', color: '#3b82f6' },
            { id: 'fte', label: 'FTE', color: '#10b981' },
            { id: 'bench', label: 'Bench', color: '#8b5cf6' },
          ],
          chartType: 'grouped-bar',
          height: 300,
        },
      },

      // Margin by Visa Type
      {
        id: 'margin-by-visa',
        type: 'custom',
        component: 'MarginByVisaTypeChart',
        title: 'Margin by Visa Type',
        config: {
          visaTypes: [
            { id: 'us_citizen', label: 'US Citizen' },
            { id: 'green_card', label: 'Green Card' },
            { id: 'h1b', label: 'H1B' },
            { id: 'opt', label: 'OPT/CPT' },
            { id: 'tn', label: 'TN Visa' },
            { id: 'other', label: 'Other' },
          ],
          chartType: 'bar',
          height: 300,
        },
      },

      // Margin by Client
      {
        id: 'margin-by-client',
        type: 'custom',
        component: 'MarginByClientChart',
        title: 'Top/Bottom Clients by Margin',
        config: {
          showTop: 5,
          showBottom: 5,
          chartType: 'horizontal-bar',
          height: 400,
        },
      },

      // Rate Stack Display Section
      {
        id: 'rate-stack-analysis',
        type: 'info-card',
        title: 'Rate Stack Analysis (Average)',
        icon: 'DollarSign',
        fields: [
          { id: 'avg-bill-rate', label: 'Avg Bill Rate', type: 'currency', path: 'rateStack.avgBillRate' },
          { id: 'avg-pay-rate', label: 'Avg Pay Rate', type: 'currency', path: 'rateStack.avgPayRate' },
          { id: 'avg-margin-dollars', label: 'Avg Margin ($)', type: 'currency', path: 'rateStack.avgMarginDollars' },
          { id: 'avg-markup', label: 'Avg Markup %', type: 'percentage', path: 'rateStack.avgMarkupPercent' },
          { id: 'burden-rate', label: 'Burden Rate %', type: 'percentage', path: 'rateStack.burdenRate' },
        ],
      },

      // Low Margin Alerts
      {
        id: 'low-margin-placements',
        type: 'table',
        title: 'Low Margin Placements (<15%)',
        icon: 'AlertTriangle',
        dataSource: {
          type: 'field',
          path: 'lowMarginPlacements',
        },
        columns_config: [
          {
            id: 'consultant',
            header: 'Consultant',
            path: 'consultantName',
            type: 'text',
          },
          {
            id: 'client',
            header: 'Client',
            path: 'clientName',
            type: 'text',
          },
          {
            id: 'bill-rate',
            header: 'Bill Rate',
            path: 'billRate',
            type: 'currency',
          },
          {
            id: 'pay-rate',
            header: 'Pay Rate',
            path: 'payRate',
            type: 'currency',
          },
          {
            id: 'margin',
            header: 'Margin %',
            path: 'marginPercent',
            type: 'percentage',
            config: {
              badgeColors: {
                negative: 'red',
                low: 'yellow',
                normal: 'green',
              },
            },
          },
          {
            id: 'margin-dollars',
            header: 'Margin $/hr',
            path: 'marginDollars',
            type: 'currency',
          },
          {
            id: 'weekly-revenue',
            header: 'Weekly Revenue',
            path: 'weeklyRevenue',
            type: 'currency',
          },
          {
            id: 'reason',
            header: 'Reason',
            path: 'lowMarginReason',
            type: 'text',
          },
        ],
        actions: [
          {
            id: 'view-placement',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/employee/placements/${id}' },
          },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },

      // Margin Improvement Opportunities
      {
        id: 'improvement-opportunities',
        type: 'table',
        title: 'Margin Improvement Opportunities',
        icon: 'Lightbulb',
        collapsible: true,
        defaultExpanded: false,
        dataSource: {
          type: 'field',
          path: 'improvementOpportunities',
        },
        columns_config: [
          { id: 'opportunity', header: 'Opportunity', path: 'description', type: 'text' },
          { id: 'type', header: 'Type', path: 'opportunityType', type: 'text' },
          { id: 'potential-impact', header: 'Potential Impact', path: 'potentialImpact', type: 'currency' },
          { id: 'effort', header: 'Effort', path: 'effort', type: 'enum', config: { options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] } },
          { id: 'status', header: 'Status', path: 'status', type: 'enum', config: { options: [{ value: 'identified', label: 'Identified' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }] } },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'export',
      type: 'modal',
      label: 'Export Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportMarginReportModal' },
    },
    {
      id: 'back-to-dashboard',
      type: 'navigate',
      label: 'Back to Dashboard',
      icon: 'ArrowLeft',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/cfo/dashboard' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Home', route: '/employee/workspace' },
      { label: 'CFO Dashboard', route: '/employee/cfo/dashboard' },
      { label: 'Margin Analysis' },
    ],
  },
};
