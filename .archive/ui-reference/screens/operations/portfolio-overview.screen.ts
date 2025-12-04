/**
 * Portfolio Overview Screen Definition
 *
 * Business portfolio and client concentration analysis for CEO.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const portfolioOverviewScreen: ScreenDefinition = {
  id: 'portfolio-overview',
  type: 'dashboard',
  title: 'Portfolio Overview',
  subtitle: 'Business portfolio health and concentration analysis',
  icon: 'PieChart',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'executive.getPortfolioOverview',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Portfolio KPIs
      {
        id: 'portfolio-kpis',
        type: 'metrics-grid',
        title: 'Portfolio Summary',
        columns: 4,
        fields: [
          {
            id: 'total-clients',
            label: 'Total Active Clients',
            type: 'number',
            path: 'summary.totalClients',
            config: { icon: 'Building2' },
          },
          {
            id: 'total-revenue',
            label: 'Portfolio Revenue (YTD)',
            type: 'currency',
            path: 'summary.totalRevenue',
            config: { icon: 'DollarSign' },
          },
          {
            id: 'concentration-risk',
            label: 'Concentration Risk Score',
            type: 'number',
            path: 'summary.concentrationRiskScore',
            config: { icon: 'AlertTriangle', max: 100, thresholds: { warning: 60, critical: 80 } },
          },
          {
            id: 'diversification-index',
            label: 'Diversification Index',
            type: 'number',
            path: 'summary.diversificationIndex',
            config: { icon: 'Shuffle', max: 100 },
          },
        ],
      },

      // Revenue by Business Unit
      {
        id: 'revenue-by-bu',
        type: 'custom',
        component: 'RevenueByBusinessUnitChart',
        title: 'Revenue by Business Unit',
        config: {
          businessUnits: ['Recruiting', 'Bench Sales', 'TA', 'Academy'],
          chartType: 'donut',
          height: 350,
        },
      },

      // Client Portfolio Health
      {
        id: 'client-health-grid',
        type: 'custom',
        component: 'ClientPortfolioHealthGrid',
        title: 'Client Portfolio Health',
        config: {
          quadrants: ['Stars', 'Cash Cows', 'Question Marks', 'Dogs'],
          height: 450,
        },
      },

      // Concentration Risks
      {
        id: 'concentration-analysis',
        type: 'info-card',
        title: 'Concentration Risk Analysis',
        icon: 'AlertTriangle',
        fields: [
          { id: 'top-client-pct', label: 'Largest Client %', type: 'percentage', path: 'concentration.topClientPercent' },
          { id: 'top5-pct', label: 'Top 5 Clients %', type: 'percentage', path: 'concentration.top5Percent' },
          { id: 'top10-pct', label: 'Top 10 Clients %', type: 'percentage', path: 'concentration.top10Percent' },
          { id: 'hhi-index', label: 'HHI Concentration Index', type: 'number', path: 'concentration.hhiIndex' },
        ],
      },

      // High Concentration Clients (>10% revenue)
      {
        id: 'high-concentration-clients',
        type: 'table',
        title: 'High Concentration Clients (>10% Revenue)',
        icon: 'AlertCircle',
        dataSource: {
          type: 'field',
          path: 'highConcentrationClients',
        },
        columns_config: [
          { id: 'client', header: 'Client', path: 'name', type: 'text' },
          { id: 'revenue', header: 'YTD Revenue', path: 'revenueYTD', type: 'currency', sortable: true },
          { id: 'pct-total', header: '% of Total', path: 'percentOfTotal', type: 'percentage', sortable: true },
          { id: 'placements', header: 'Active Placements', path: 'activePlacements', type: 'number' },
          { id: 'contract-end', header: 'Contract Renewal', path: 'contractEndDate', type: 'date' },
          { id: 'health', header: 'Health Score', path: 'healthScore', type: 'number' },
          { id: 'trend', header: 'Revenue Trend', path: 'revenueTrend', type: 'percentage' },
        ],
        emptyState: {
          title: 'No High Concentration Clients',
          description: 'Your client portfolio is well diversified',
          icon: 'CheckCircle',
        },
      },

      // Growth vs Mature Accounts
      {
        id: 'growth-vs-mature',
        type: 'custom',
        component: 'GrowthVsMatureChart',
        title: 'Growth vs Mature Accounts',
        config: {
          chartType: 'scatter',
          xAxis: 'Age (Months)',
          yAxis: 'Revenue Growth %',
          height: 350,
        },
      },

      // Diversification Analysis
      {
        id: 'diversification',
        type: 'custom',
        component: 'DiversificationAnalysisChart',
        title: 'Diversification Analysis',
        config: {
          dimensions: ['Industry', 'Geography', 'Size', 'Service Type'],
          height: 350,
        },
      },

      // Client Tier Distribution
      {
        id: 'tier-distribution',
        type: 'table',
        title: 'Client Tier Distribution',
        icon: 'Layers',
        dataSource: {
          type: 'field',
          path: 'tierDistribution',
        },
        columns_config: [
          { id: 'tier', header: 'Tier', path: 'tier', type: 'text' },
          { id: 'client-count', header: 'Clients', path: 'clientCount', type: 'number' },
          { id: 'revenue', header: 'Revenue', path: 'totalRevenue', type: 'currency' },
          { id: 'pct-revenue', header: '% of Revenue', path: 'percentOfRevenue', type: 'percentage' },
          { id: 'avg-margin', header: 'Avg Margin', path: 'avgMargin', type: 'percentage' },
          { id: 'avg-placements', header: 'Avg Placements', path: 'avgPlacements', type: 'number' },
        ],
      },

      // At-Risk Accounts
      {
        id: 'at-risk-accounts',
        type: 'table',
        title: 'At-Risk Accounts',
        icon: 'AlertTriangle',
        collapsible: true,
        dataSource: {
          type: 'field',
          path: 'atRiskAccounts',
        },
        columns_config: [
          { id: 'client', header: 'Client', path: 'name', type: 'text' },
          { id: 'risk-reason', header: 'Risk Reason', path: 'riskReason', type: 'text' },
          { id: 'revenue-at-risk', header: 'Revenue at Risk', path: 'revenueAtRisk', type: 'currency' },
          { id: 'action-required', header: 'Action Required', path: 'actionRequired', type: 'text' },
          { id: 'owner', header: 'Owner', path: 'ownerName', type: 'text' },
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
      config: { type: 'modal', modal: 'ExportPortfolioReportModal' },
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
      { label: 'Portfolio Overview' },
    ],
  },
};
