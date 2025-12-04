/**
 * Benchmarking Screen Definition
 *
 * Industry benchmarks, internal comparisons, and competitive metrics
 * for executive leadership team.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const benchmarkingScreen: ScreenDefinition = {
  id: 'benchmarking',
  type: 'dashboard',
  title: 'Benchmarking & Analytics',
  subtitle: 'Industry benchmarks, internal comparisons, and competitive metrics',
  icon: 'BarChart3',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'executive.getBenchmarking',
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'industry',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: INDUSTRY BENCHMARKS
      // ─────────────────────────────────────────────────────
      {
        id: 'industry',
        label: 'Industry Benchmarks',
        icon: 'Building2',
        sections: [
          // Benchmark Summary
          {
            id: 'benchmark-summary',
            type: 'custom',
            component: 'BenchmarkSummaryWidget',
            title: 'Industry Benchmark Summary',
            config: {
              showOverallScore: true,
              showRanking: true,
              peerGroup: 'Mid-Market Staffing',
            },
          },

          // Key Metrics vs Industry
          {
            id: 'key-metrics-benchmark',
            type: 'table',
            title: 'Key Metrics vs Industry',
            icon: 'Scale',
            dataSource: {
              type: 'field',
              path: 'industry.keyMetrics',
            },
            columns_config: [
              { id: 'metric', header: 'Metric', path: 'metricName', type: 'text' },
              { id: 'our-value', header: 'Our Value', path: 'ourValue', type: 'text' },
              { id: 'industry-avg', header: 'Industry Avg', path: 'industryAvg', type: 'text' },
              { id: 'top-quartile', header: 'Top Quartile', path: 'topQuartile', type: 'text' },
              { id: 'percentile', header: 'Our Percentile', path: 'ourPercentile', type: 'number' },
              { id: 'trend', header: 'Trend', path: 'trend', type: 'enum', config: { options: [{ value: 'improving', label: '↑' }, { value: 'stable', label: '→' }, { value: 'declining', label: '↓' }], badgeColors: { improving: 'green', stable: 'gray', declining: 'red' } } },
            ],
          },

          // Revenue Per Employee Benchmark
          {
            id: 'revenue-per-employee',
            type: 'custom',
            component: 'RevenuePerEmployeeBenchmarkChart',
            title: 'Revenue Per Employee',
            config: {
              showUs: true,
              showPeers: true,
              showIndustryAvg: true,
              height: 350,
            },
          },

          // Profitability Benchmarks
          {
            id: 'profitability-benchmarks',
            type: 'info-card',
            title: 'Profitability Benchmarks',
            icon: 'DollarSign',
            fields: [
              { id: 'gross-margin', label: 'Gross Margin', type: 'percentage', path: 'profitability.grossMargin' },
              { id: 'gross-margin-benchmark', label: 'Industry Benchmark', type: 'percentage', path: 'profitability.grossMarginBenchmark' },
              { id: 'operating-margin', label: 'Operating Margin', type: 'percentage', path: 'profitability.operatingMargin' },
              { id: 'operating-margin-benchmark', label: 'Industry Benchmark', type: 'percentage', path: 'profitability.operatingMarginBenchmark' },
              { id: 'ebitda-margin', label: 'EBITDA Margin', type: 'percentage', path: 'profitability.ebitdaMargin' },
              { id: 'ebitda-margin-benchmark', label: 'Industry Benchmark', type: 'percentage', path: 'profitability.ebitdaMarginBenchmark' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 2: OPERATIONAL BENCHMARKS
      // ─────────────────────────────────────────────────────
      {
        id: 'operational',
        label: 'Operational',
        icon: 'Activity',
        sections: [
          // Operational KPIs vs Benchmark
          {
            id: 'operational-kpis',
            type: 'metrics-grid',
            title: 'Operational KPIs',
            columns: 4,
            fields: [
              {
                id: 'time-to-fill',
                label: 'Time to Fill (Days)',
                type: 'number',
                path: 'operational.timeToFill',
                config: { icon: 'Clock', benchmark: { type: 'field', path: 'operational.timeToFillBenchmark' } },
              },
              {
                id: 'fill-rate',
                label: 'Fill Rate %',
                type: 'percentage',
                path: 'operational.fillRate',
                config: { icon: 'CheckCircle', benchmark: { type: 'field', path: 'operational.fillRateBenchmark' } },
              },
              {
                id: 'spread',
                label: 'Avg Spread ($)',
                type: 'currency',
                path: 'operational.avgSpread',
                config: { icon: 'DollarSign', benchmark: { type: 'field', path: 'operational.avgSpreadBenchmark' } },
              },
              {
                id: 'placements-per-recruiter',
                label: 'Placements/Recruiter/Month',
                type: 'number',
                path: 'operational.placementsPerRecruiter',
                config: { icon: 'Users', benchmark: { type: 'field', path: 'operational.placementsPerRecruiterBenchmark' } },
              },
            ],
          },

          // Efficiency Benchmark Chart
          {
            id: 'efficiency-benchmark-chart',
            type: 'custom',
            component: 'EfficiencyBenchmarkRadarChart',
            title: 'Efficiency Benchmark',
            config: {
              dimensions: ['Speed', 'Quality', 'Cost', 'Volume', 'Retention'],
              showUs: true,
              showBenchmark: true,
              height: 400,
            },
          },

          // Detailed Operational Benchmarks
          {
            id: 'operational-details',
            type: 'table',
            title: 'Detailed Operational Benchmarks',
            icon: 'BarChart',
            dataSource: {
              type: 'field',
              path: 'operational.details',
            },
            columns_config: [
              { id: 'metric', header: 'Metric', path: 'metricName', type: 'text' },
              { id: 'category', header: 'Category', path: 'category', type: 'text' },
              { id: 'our-value', header: 'Our Value', path: 'ourValue', type: 'text' },
              { id: 'benchmark', header: 'Benchmark', path: 'benchmarkValue', type: 'text' },
              { id: 'gap', header: 'Gap', path: 'gap', type: 'text' },
              { id: 'status', header: 'Status', path: 'status', type: 'enum', config: { options: [{ value: 'above', label: 'Above' }, { value: 'at', label: 'At' }, { value: 'below', label: 'Below' }], badgeColors: { above: 'green', at: 'yellow', below: 'red' } } },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 3: POD/TEAM COMPARISONS
      // ─────────────────────────────────────────────────────
      {
        id: 'internal',
        label: 'Internal Comparison',
        icon: 'Users',
        sections: [
          // Pod Performance Comparison
          {
            id: 'pod-comparison',
            type: 'custom',
            component: 'PodComparisonChart',
            title: 'Pod Performance Comparison',
            config: {
              metrics: ['revenue', 'placements', 'fillRate', 'margin'],
              sortBy: 'revenue',
              height: 400,
            },
          },

          // Pod Ranking Table
          {
            id: 'pod-ranking',
            type: 'table',
            title: 'Pod Rankings',
            icon: 'Trophy',
            dataSource: {
              type: 'field',
              path: 'internal.podRankings',
            },
            columns_config: [
              { id: 'rank', header: 'Rank', path: 'rank', type: 'number', width: '60px' },
              { id: 'pod', header: 'Pod', path: 'podName', type: 'text' },
              { id: 'pod-type', header: 'Type', path: 'podType', type: 'enum', config: { options: [{ value: 'recruiting', label: 'Recruiting' }, { value: 'bench_sales', label: 'Bench Sales' }, { value: 'ta', label: 'TA' }] } },
              { id: 'revenue', header: 'Revenue', path: 'revenue', type: 'currency', sortable: true },
              { id: 'placements', header: 'Placements', path: 'placements', type: 'number', sortable: true },
              { id: 'margin', header: 'Margin %', path: 'marginPercent', type: 'percentage', sortable: true },
              { id: 'score', header: 'Performance Score', path: 'performanceScore', type: 'number' },
              { id: 'trend', header: 'Trend', path: 'trend', type: 'enum', config: { options: [{ value: 'up', label: '↑' }, { value: 'stable', label: '→' }, { value: 'down', label: '↓' }], badgeColors: { up: 'green', stable: 'gray', down: 'red' } } },
            ],
            actions: [
              {
                id: 'view-pod',
                type: 'navigate',
                label: 'View Pod',
                icon: 'Eye',
                config: { type: 'navigate', route: '/employee/coo/pods/${id}' },
              },
            ],
          },

          // Top Performers
          {
            id: 'top-performers',
            type: 'table',
            title: 'Top Individual Performers',
            icon: 'Star',
            dataSource: {
              type: 'field',
              path: 'internal.topPerformers',
            },
            columns_config: [
              { id: 'rank', header: 'Rank', path: 'rank', type: 'number', width: '60px' },
              { id: 'name', header: 'Name', path: 'employeeName', type: 'text' },
              { id: 'role', header: 'Role', path: 'role', type: 'text' },
              { id: 'pod', header: 'Pod', path: 'podName', type: 'text' },
              { id: 'revenue', header: 'Revenue', path: 'revenue', type: 'currency', sortable: true },
              { id: 'placements', header: 'Placements', path: 'placements', type: 'number', sortable: true },
              { id: 'performance-score', header: 'Score', path: 'performanceScore', type: 'number' },
            ],
          },

          // Business Unit Comparison
          {
            id: 'bu-comparison',
            type: 'custom',
            component: 'BusinessUnitComparisonChart',
            title: 'Business Unit Comparison',
            collapsible: true,
            config: {
              businessUnits: ['Recruiting', 'Bench Sales', 'TA', 'Academy'],
              metrics: ['revenue', 'growth', 'margin', 'efficiency'],
              height: 350,
            },
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 4: COMPETITIVE ANALYSIS
      // ─────────────────────────────────────────────────────
      {
        id: 'competitive',
        label: 'Competitive',
        icon: 'Swords',
        sections: [
          // Market Position
          {
            id: 'market-position',
            type: 'custom',
            component: 'MarketPositionQuadrant',
            title: 'Market Position Analysis',
            config: {
              xAxis: 'Market Share',
              yAxis: 'Growth Rate',
              showCompetitors: true,
              height: 400,
            },
          },

          // Competitive Comparison Table
          {
            id: 'competitive-table',
            type: 'table',
            title: 'Competitive Comparison',
            icon: 'Users',
            dataSource: {
              type: 'field',
              path: 'competitive.comparison',
            },
            columns_config: [
              { id: 'company', header: 'Company', path: 'companyName', type: 'text' },
              { id: 'market-share', header: 'Est. Market Share', path: 'marketShare', type: 'percentage', sortable: true },
              { id: 'growth', header: 'Growth Rate', path: 'growthRate', type: 'percentage', sortable: true },
              { id: 'specialization', header: 'Specialization', path: 'specialization', type: 'text' },
              { id: 'pricing', header: 'Pricing Position', path: 'pricingPosition', type: 'enum', config: { options: [{ value: 'premium', label: 'Premium' }, { value: 'mid', label: 'Mid-Market' }, { value: 'value', label: 'Value' }] } },
              { id: 'threat', header: 'Threat Level', path: 'threatLevel', type: 'enum', config: { options: [{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }], badgeColors: { high: 'red', medium: 'yellow', low: 'green' } } },
            ],
          },

          // Win/Loss Analysis
          {
            id: 'win-loss',
            type: 'info-card',
            title: 'Win/Loss Analysis',
            icon: 'PieChart',
            fields: [
              { id: 'win-rate', label: 'Overall Win Rate', type: 'percentage', path: 'competitive.winRate' },
              { id: 'top-win-reason', label: 'Top Win Reason', type: 'text', path: 'competitive.topWinReason' },
              { id: 'top-loss-reason', label: 'Top Loss Reason', type: 'text', path: 'competitive.topLossReason' },
              { id: 'competitive-wins', label: 'Competitive Wins (YTD)', type: 'number', path: 'competitive.competitiveWinsYTD' },
              { id: 'competitive-losses', label: 'Competitive Losses (YTD)', type: 'number', path: 'competitive.competitiveLossesYTD' },
            ],
          },

          // Competitor Intel
          {
            id: 'competitor-intel',
            type: 'table',
            title: 'Recent Competitor Intelligence',
            icon: 'Lightbulb',
            collapsible: true,
            dataSource: {
              type: 'field',
              path: 'competitive.recentIntel',
            },
            columns_config: [
              { id: 'competitor', header: 'Competitor', path: 'competitorName', type: 'text' },
              { id: 'intel-type', header: 'Type', path: 'intelType', type: 'enum', config: { options: [{ value: 'pricing', label: 'Pricing' }, { value: 'product', label: 'Product' }, { value: 'hiring', label: 'Hiring' }, { value: 'client', label: 'Client' }] } },
              { id: 'summary', header: 'Summary', path: 'summary', type: 'text' },
              { id: 'impact', header: 'Impact', path: 'impact', type: 'enum', config: { options: [{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }], badgeColors: { high: 'red', medium: 'yellow', low: 'green' } } },
              { id: 'date', header: 'Date', path: 'reportedDate', type: 'date' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 5: TREND ANALYSIS
      // ─────────────────────────────────────────────────────
      {
        id: 'trends',
        label: 'Trend Analysis',
        icon: 'TrendingUp',
        sections: [
          // Historical Benchmark Trends
          {
            id: 'benchmark-trends',
            type: 'custom',
            component: 'BenchmarkTrendsChart',
            title: 'Benchmark Performance Over Time',
            config: {
              metrics: ['grossMargin', 'timeToFill', 'fillRate', 'revenuePerEmployee'],
              showBenchmarkLine: true,
              periods: 12,
              height: 400,
            },
          },

          // Gap Analysis
          {
            id: 'gap-analysis',
            type: 'custom',
            component: 'GapAnalysisWaterfallChart',
            title: 'Gap to Benchmark Analysis',
            config: {
              showImpact: true,
              sortByImpact: true,
              height: 350,
            },
          },

          // Improvement Recommendations
          {
            id: 'improvement-recommendations',
            type: 'table',
            title: 'Improvement Recommendations',
            icon: 'Lightbulb',
            dataSource: {
              type: 'field',
              path: 'trends.recommendations',
            },
            columns_config: [
              { id: 'priority', header: '', path: 'priority', type: 'enum', width: '50px', config: { options: [{ value: 'high', label: '🔴' }, { value: 'medium', label: '🟡' }, { value: 'low', label: '🟢' }] } },
              { id: 'area', header: 'Area', path: 'area', type: 'text' },
              { id: 'recommendation', header: 'Recommendation', path: 'recommendation', type: 'text' },
              { id: 'current-gap', header: 'Current Gap', path: 'currentGap', type: 'text' },
              { id: 'potential-impact', header: 'Potential Impact', path: 'potentialImpact', type: 'currency' },
              { id: 'effort', header: 'Effort', path: 'effort', type: 'enum', config: { options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] } },
            ],
            actions: [
              {
                id: 'create-initiative',
                type: 'modal',
                label: 'Create Initiative',
                icon: 'Plus',
                config: { type: 'modal', modal: 'CreateInitiativeFromRecommendationModal' },
              },
            ],
          },

          // YoY Comparison
          {
            id: 'yoy-comparison',
            type: 'table',
            title: 'Year-over-Year Comparison',
            icon: 'Calendar',
            collapsible: true,
            dataSource: {
              type: 'field',
              path: 'trends.yoyComparison',
            },
            columns_config: [
              { id: 'metric', header: 'Metric', path: 'metricName', type: 'text' },
              { id: 'last-year', header: 'Last Year', path: 'lastYearValue', type: 'text' },
              { id: 'this-year', header: 'This Year', path: 'thisYearValue', type: 'text' },
              { id: 'change', header: 'Change', path: 'change', type: 'percentage' },
              { id: 'benchmark-change', header: 'Benchmark Change', path: 'benchmarkChange', type: 'percentage' },
              { id: 'relative-performance', header: 'Relative Performance', path: 'relativePerformance', type: 'enum', config: { options: [{ value: 'outperforming', label: 'Outperforming' }, { value: 'matching', label: 'Matching' }, { value: 'underperforming', label: 'Underperforming' }], badgeColors: { outperforming: 'green', matching: 'yellow', underperforming: 'red' } } },
            ],
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'export-report',
      type: 'modal',
      label: 'Export Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportBenchmarkReportModal' },
    },
    {
      id: 'configure-benchmarks',
      type: 'modal',
      label: 'Configure',
      icon: 'Settings',
      variant: 'outline',
      config: { type: 'modal', modal: 'ConfigureBenchmarksModal' },
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
      { label: 'Executive', route: '/employee/ceo/dashboard' },
      { label: 'Benchmarking' },
    ],
  },

  keyboard_shortcuts: [
    { key: 'g i', action: 'navigate:tab:industry', description: 'Go to Industry Benchmarks tab' },
    { key: 'g o', action: 'navigate:tab:operational', description: 'Go to Operational tab' },
    { key: 'g n', action: 'navigate:tab:internal', description: 'Go to Internal Comparison tab' },
    { key: 'g c', action: 'navigate:tab:competitive', description: 'Go to Competitive tab' },
    { key: 'g t', action: 'navigate:tab:trends', description: 'Go to Trend Analysis tab' },
    { key: 'e', action: 'modal:ExportBenchmarkReportModal', description: 'Export report' },
    { key: 'r', action: 'refresh', description: 'Refresh data' },
  ],
};
