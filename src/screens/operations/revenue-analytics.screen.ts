/**
 * Revenue Analytics Screen Definition
 *
 * Deep-dive into revenue metrics for CFO analysis.
 *
 * @see docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const revenueAnalyticsScreen: ScreenDefinition = {
  id: 'revenue-analytics',
  type: 'dashboard',
  title: 'Revenue Analytics',
  subtitle: 'Comprehensive revenue analysis and trends',
  icon: 'BarChart3',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'finance.getRevenueAnalytics',
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
          // KPI Summary
          {
            id: 'revenue-kpis',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              {
                id: 'revenue-mtd',
                label: 'Revenue MTD',
                type: 'currency',
                path: 'summary.revenueMTD',
                config: {
                  trend: { type: 'field', path: 'summary.revenueMTDTrend' },
                  comparison: { type: 'field', path: 'summary.revenueMTDLastMonth' },
                },
              },
              {
                id: 'revenue-qtd',
                label: 'Revenue QTD',
                type: 'currency',
                path: 'summary.revenueQTD',
                config: {
                  target: { type: 'field', path: 'summary.revenueQTDTarget' },
                },
              },
              {
                id: 'revenue-ytd',
                label: 'Revenue YTD',
                type: 'currency',
                path: 'summary.revenueYTD',
                config: {
                  target: { type: 'field', path: 'summary.revenueYTDTarget' },
                },
              },
              {
                id: 'growth-rate',
                label: 'Growth Rate (YoY)',
                type: 'percentage',
                path: 'summary.growthRate',
                config: {
                  target: 25,
                  thresholds: { warning: 15, critical: 10 },
                },
              },
            ],
          },
          // Revenue Trend Chart
          {
            id: 'revenue-trend',
            type: 'custom',
            component: 'RevenueTrendLineChart',
            title: 'Revenue Trend (12-Month Rolling)',
            config: {
              height: 350,
              showTargetLine: true,
              showYoYComparison: true,
            },
          },
          // Revenue vs Target
          {
            id: 'revenue-vs-target',
            type: 'custom',
            component: 'RevenueVsTargetChart',
            title: 'Revenue vs Target (Monthly)',
            config: {
              chartType: 'bar',
              height: 300,
            },
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 2: BY SERVICE LINE
      // ─────────────────────────────────────────────────────
      {
        id: 'by-service',
        label: 'By Service',
        icon: 'Layers',
        sections: [
          {
            id: 'service-line-breakdown',
            type: 'custom',
            component: 'ServiceLineRevenueChart',
            title: 'Revenue by Service Line',
            config: {
              servicelines: [
                { id: 'contract', label: 'Contract Staffing', color: '#3b82f6' },
                { id: 'fte', label: 'Full-Time Placement', color: '#10b981' },
                { id: 'c2h', label: 'Contract-to-Hire', color: '#f59e0b' },
                { id: 'bench', label: 'Bench Sales', color: '#8b5cf6' },
              ],
              chartType: 'donut',
              height: 400,
            },
          },
          {
            id: 'service-line-trend',
            type: 'custom',
            component: 'ServiceLineTrendChart',
            title: 'Service Line Trends (6 Months)',
            config: {
              chartType: 'stacked-area',
              height: 350,
            },
          },
          {
            id: 'service-line-table',
            type: 'table',
            title: 'Service Line Performance',
            dataSource: {
              type: 'field',
              path: 'byService.details',
            },
            columns_config: [
              { id: 'service', header: 'Service Line', path: 'name', type: 'text' },
              { id: 'revenue-mtd', header: 'MTD Revenue', path: 'revenueMTD', type: 'currency' },
              { id: 'revenue-ytd', header: 'YTD Revenue', path: 'revenueYTD', type: 'currency' },
              { id: 'pct-total', header: '% of Total', path: 'percentOfTotal', type: 'percentage' },
              { id: 'growth', header: 'Growth (YoY)', path: 'growthYoY', type: 'percentage' },
              { id: 'margin', header: 'Avg Margin', path: 'avgMargin', type: 'percentage' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 3: BY CLIENT
      // ─────────────────────────────────────────────────────
      {
        id: 'by-client',
        label: 'By Client',
        icon: 'Building2',
        sections: [
          // Top Clients Chart
          {
            id: 'top-clients-chart',
            type: 'custom',
            component: 'TopClientsRevenueChart',
            title: 'Top 10 Clients by Revenue',
            config: {
              chartType: 'horizontal-bar',
              height: 400,
            },
          },
          // Client Concentration Risk
          {
            id: 'concentration-risk',
            type: 'info-card',
            title: 'Concentration Risk Analysis',
            icon: 'AlertTriangle',
            fields: [
              { id: 'top1-pct', label: 'Top Client %', type: 'percentage', path: 'byClient.topClientPercentage' },
              { id: 'top5-pct', label: 'Top 5 Clients %', type: 'percentage', path: 'byClient.top5Percentage' },
              { id: 'top10-pct', label: 'Top 10 Clients %', type: 'percentage', path: 'byClient.top10Percentage' },
              { id: 'risk-level', label: 'Risk Level', type: 'text', path: 'byClient.riskLevel' },
            ],
          },
          // Client Revenue Table
          {
            id: 'client-revenue-table',
            type: 'table',
            title: 'Client Revenue Details',
            dataSource: {
              type: 'field',
              path: 'byClient.details',
            },
            columns_config: [
              {
                id: 'client',
                header: 'Client',
                path: 'name',
                type: 'text',
                sortable: true,
              },
              {
                id: 'tier',
                header: 'Tier',
                path: 'tier',
                type: 'enum',
                config: {
                  options: [
                    { value: 'enterprise', label: 'Enterprise' },
                    { value: 'mid_market', label: 'Mid-Market' },
                    { value: 'smb', label: 'SMB' },
                  ],
                  badgeColors: {
                    enterprise: 'blue',
                    mid_market: 'green',
                    smb: 'gray',
                  },
                },
              },
              { id: 'revenue-ytd', header: 'YTD Revenue', path: 'revenueYTD', type: 'currency', sortable: true },
              { id: 'placements', header: 'Placements', path: 'placementCount', type: 'number' },
              { id: 'margin', header: 'Avg Margin', path: 'avgMargin', type: 'percentage' },
              { id: 'growth', header: 'Growth', path: 'growth', type: 'percentage' },
            ],
            pagination: { enabled: true, pageSize: 20 },
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 4: BY REGION
      // ─────────────────────────────────────────────────────
      {
        id: 'by-region',
        label: 'By Region',
        icon: 'Globe',
        sections: [
          {
            id: 'regional-map',
            type: 'custom',
            component: 'RegionalRevenueMap',
            title: 'Revenue by Region',
            config: {
              regions: ['US', 'Canada'],
              showHeatmap: true,
            },
          },
          {
            id: 'regional-comparison',
            type: 'custom',
            component: 'RegionalComparisonChart',
            title: 'Regional Performance Comparison',
            config: {
              chartType: 'grouped-bar',
              height: 350,
            },
          },
          {
            id: 'regional-table',
            type: 'table',
            title: 'Regional Breakdown',
            dataSource: {
              type: 'field',
              path: 'byRegion.details',
            },
            columns_config: [
              { id: 'region', header: 'Region', path: 'name', type: 'text' },
              { id: 'revenue-mtd', header: 'MTD Revenue', path: 'revenueMTD', type: 'currency' },
              { id: 'revenue-ytd', header: 'YTD Revenue', path: 'revenueYTD', type: 'currency' },
              { id: 'pct-total', header: '% of Total', path: 'percentOfTotal', type: 'percentage' },
              { id: 'growth', header: 'Growth (YoY)', path: 'growthYoY', type: 'percentage' },
              { id: 'headcount', header: 'Recruiters', path: 'recruiterCount', type: 'number' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 5: BY POD
      // ─────────────────────────────────────────────────────
      {
        id: 'by-pod',
        label: 'By Pod',
        icon: 'Users',
        sections: [
          {
            id: 'pod-revenue-chart',
            type: 'custom',
            component: 'PodRevenueChart',
            title: 'Revenue by Pod',
            config: {
              chartType: 'bar',
              showTarget: true,
              height: 400,
            },
          },
          {
            id: 'pod-performance-table',
            type: 'table',
            title: 'Pod Revenue Performance',
            dataSource: {
              type: 'field',
              path: 'byPod.details',
            },
            columns_config: [
              { id: 'pod', header: 'Pod', path: 'name', type: 'text' },
              { id: 'manager', header: 'Manager', path: 'managerName', type: 'text' },
              { id: 'type', header: 'Type', path: 'podType', type: 'text' },
              { id: 'revenue-mtd', header: 'MTD Revenue', path: 'revenueMTD', type: 'currency', sortable: true },
              { id: 'revenue-ytd', header: 'YTD Revenue', path: 'revenueYTD', type: 'currency', sortable: true },
              { id: 'target', header: 'Target', path: 'revenueTarget', type: 'currency' },
              { id: 'attainment', header: 'Attainment', path: 'attainment', type: 'percentage' },
              { id: 'placements', header: 'Placements', path: 'placementCount', type: 'number' },
            ],
            pagination: { enabled: true, pageSize: 15 },
          },
        ],
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
      config: {
        type: 'modal',
        modal: 'ExportRevenueAnalyticsModal',
        props: { formats: ['PDF', 'Excel', 'CSV'] },
      },
    },
    {
      id: 'date-range',
      type: 'modal',
      label: 'Date Range',
      icon: 'Calendar',
      variant: 'outline',
      config: { type: 'modal', modal: 'DateRangePickerModal' },
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
      { label: 'Revenue Analytics' },
    ],
  },
};
