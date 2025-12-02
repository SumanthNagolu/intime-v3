/**
 * Forecasting Screen Definition
 *
 * Revenue forecasting, pipeline projections, and predictive analytics
 * for executive leadership team.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const forecastingScreen: ScreenDefinition = {
  id: 'forecasting',
  type: 'dashboard',
  title: 'Forecasting & Projections',
  subtitle: 'Revenue forecasting, pipeline projections, and predictive analytics',
  icon: 'TrendingUp',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'executive.getForecasting',
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'revenue',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: REVENUE FORECAST
      // ─────────────────────────────────────────────────────
      {
        id: 'revenue',
        label: 'Revenue Forecast',
        icon: 'DollarSign',
        sections: [
          // Forecast Summary KPIs
          {
            id: 'forecast-kpis',
            type: 'metrics-grid',
            title: 'Forecast Summary',
            columns: 4,
            fields: [
              {
                id: 'forecast-q-current',
                label: 'Current Quarter Forecast',
                type: 'currency',
                path: 'revenue.currentQuarterForecast',
                config: { icon: 'Calendar', trend: { type: 'field', path: 'revenue.currentQuarterTrend' } },
              },
              {
                id: 'forecast-q-next',
                label: 'Next Quarter Forecast',
                type: 'currency',
                path: 'revenue.nextQuarterForecast',
                config: { icon: 'CalendarDays' },
              },
              {
                id: 'forecast-annual',
                label: 'Annual Forecast',
                type: 'currency',
                path: 'revenue.annualForecast',
                config: { icon: 'Calendar', trend: { type: 'field', path: 'revenue.annualTrend' } },
              },
              {
                id: 'forecast-confidence',
                label: 'Forecast Confidence',
                type: 'percentage',
                path: 'revenue.confidenceScore',
                config: { icon: 'Target', thresholds: { warning: 70, critical: 50 } },
              },
            ],
          },

          // Revenue Forecast Chart
          {
            id: 'revenue-forecast-chart',
            type: 'custom',
            component: 'RevenueForecastChart',
            title: 'Revenue Forecast (12 Months)',
            config: {
              showActual: true,
              showForecast: true,
              showConfidenceInterval: true,
              height: 400,
            },
          },

          // Forecast by Business Unit
          {
            id: 'forecast-by-bu',
            type: 'table',
            title: 'Forecast by Business Unit',
            icon: 'Building2',
            dataSource: {
              type: 'field',
              path: 'revenue.byBusinessUnit',
            },
            columns_config: [
              { id: 'bu', header: 'Business Unit', path: 'name', type: 'text' },
              { id: 'current-run-rate', header: 'Current Run Rate', path: 'runRate', type: 'currency' },
              { id: 'q-forecast', header: 'Q Forecast', path: 'quarterForecast', type: 'currency', sortable: true },
              { id: 'annual-forecast', header: 'Annual Forecast', path: 'annualForecast', type: 'currency', sortable: true },
              { id: 'yoy-growth', header: 'YoY Growth', path: 'yoyGrowth', type: 'percentage' },
              { id: 'confidence', header: 'Confidence', path: 'confidence', type: 'percentage' },
              { id: 'risk', header: 'Risk Level', path: 'riskLevel', type: 'enum', config: { options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }], badgeColors: { low: 'green', medium: 'yellow', high: 'red' } } },
            ],
          },

          // Forecast Assumptions
          {
            id: 'forecast-assumptions',
            type: 'info-card',
            title: 'Forecast Assumptions',
            icon: 'FileText',
            collapsible: true,
            fields: [
              { id: 'avg-bill-rate', label: 'Avg Bill Rate', type: 'currency', path: 'assumptions.avgBillRate' },
              { id: 'placement-growth', label: 'Placement Growth Rate', type: 'percentage', path: 'assumptions.placementGrowthRate' },
              { id: 'churn-rate', label: 'Expected Churn Rate', type: 'percentage', path: 'assumptions.churnRate' },
              { id: 'extension-rate', label: 'Extension Rate', type: 'percentage', path: 'assumptions.extensionRate' },
              { id: 'conversion-rate', label: 'Pipeline Conversion', type: 'percentage', path: 'assumptions.conversionRate' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 2: PIPELINE PROJECTIONS
      // ─────────────────────────────────────────────────────
      {
        id: 'pipeline',
        label: 'Pipeline Projections',
        icon: 'GitBranch',
        sections: [
          // Pipeline Summary
          {
            id: 'pipeline-kpis',
            type: 'metrics-grid',
            title: 'Pipeline Summary',
            columns: 4,
            fields: [
              {
                id: 'total-pipeline',
                label: 'Total Pipeline Value',
                type: 'currency',
                path: 'pipeline.totalValue',
                config: { icon: 'DollarSign' },
              },
              {
                id: 'weighted-pipeline',
                label: 'Weighted Pipeline',
                type: 'currency',
                path: 'pipeline.weightedValue',
                config: { icon: 'Scale' },
              },
              {
                id: 'expected-closes',
                label: 'Expected Closes (30d)',
                type: 'number',
                path: 'pipeline.expectedCloses30d',
                config: { icon: 'Target' },
              },
              {
                id: 'pipeline-velocity',
                label: 'Pipeline Velocity',
                type: 'currency',
                path: 'pipeline.velocity',
                config: { icon: 'Zap', description: 'Avg monthly throughput' },
              },
            ],
          },

          // Pipeline Projection Chart
          {
            id: 'pipeline-projection-chart',
            type: 'custom',
            component: 'PipelineProjectionChart',
            title: 'Pipeline Projection (6 Months)',
            config: {
              showStages: true,
              showConversions: true,
              height: 350,
            },
          },

          // Pipeline by Stage
          {
            id: 'pipeline-by-stage',
            type: 'table',
            title: 'Pipeline by Stage',
            icon: 'Layers',
            dataSource: {
              type: 'field',
              path: 'pipeline.byStage',
            },
            columns_config: [
              { id: 'stage', header: 'Stage', path: 'stageName', type: 'text' },
              { id: 'count', header: 'Opportunities', path: 'count', type: 'number', sortable: true },
              { id: 'value', header: 'Total Value', path: 'totalValue', type: 'currency', sortable: true },
              { id: 'weighted', header: 'Weighted Value', path: 'weightedValue', type: 'currency' },
              { id: 'probability', header: 'Win Probability', path: 'probability', type: 'percentage' },
              { id: 'avg-age', header: 'Avg Days in Stage', path: 'avgDaysInStage', type: 'number' },
            ],
          },

          // Pipeline Health Indicators
          {
            id: 'pipeline-health',
            type: 'info-card',
            title: 'Pipeline Health Indicators',
            icon: 'Activity',
            fields: [
              { id: 'coverage-ratio', label: 'Pipeline Coverage Ratio', type: 'number', path: 'pipeline.coverageRatio', description: '3x target = healthy' },
              { id: 'aging-deals', label: 'Aging Deals (>60 days)', type: 'number', path: 'pipeline.agingDealsCount' },
              { id: 'stalled-value', label: 'Stalled Deal Value', type: 'currency', path: 'pipeline.stalledValue' },
              { id: 'new-pipeline', label: 'New Pipeline (30d)', type: 'currency', path: 'pipeline.newPipeline30d' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 3: PLACEMENT PROJECTIONS
      // ─────────────────────────────────────────────────────
      {
        id: 'placements',
        label: 'Placement Projections',
        icon: 'Users',
        sections: [
          // Placement Projections KPIs
          {
            id: 'placement-kpis',
            type: 'metrics-grid',
            title: 'Placement Projections',
            columns: 4,
            fields: [
              {
                id: 'current-placements',
                label: 'Current Active Placements',
                type: 'number',
                path: 'placements.activeCount',
                config: { icon: 'Users' },
              },
              {
                id: 'projected-month-end',
                label: 'Projected Month End',
                type: 'number',
                path: 'placements.projectedMonthEnd',
                config: { icon: 'CalendarCheck' },
              },
              {
                id: 'expected-starts',
                label: 'Expected Starts (30d)',
                type: 'number',
                path: 'placements.expectedStarts30d',
                config: { icon: 'UserPlus' },
              },
              {
                id: 'expected-ends',
                label: 'Expected Ends (30d)',
                type: 'number',
                path: 'placements.expectedEnds30d',
                config: { icon: 'UserMinus' },
              },
            ],
          },

          // Placement Trend Chart
          {
            id: 'placement-trend-chart',
            type: 'custom',
            component: 'PlacementTrendChart',
            title: 'Placement Count Projection',
            config: {
              showActual: true,
              showProjected: true,
              showStartsEnds: true,
              height: 350,
            },
          },

          // Upcoming Placement Changes
          {
            id: 'placement-changes',
            type: 'table',
            title: 'Upcoming Placement Changes (90 Days)',
            icon: 'Calendar',
            dataSource: {
              type: 'field',
              path: 'placements.upcomingChanges',
            },
            columns_config: [
              { id: 'type', header: 'Type', path: 'changeType', type: 'enum', config: { options: [{ value: 'start', label: 'Start' }, { value: 'end', label: 'End' }, { value: 'extension', label: 'Extension' }], badgeColors: { start: 'green', end: 'red', extension: 'blue' } } },
              { id: 'consultant', header: 'Consultant', path: 'consultantName', type: 'text' },
              { id: 'client', header: 'Client', path: 'clientName', type: 'text' },
              { id: 'date', header: 'Date', path: 'changeDate', type: 'date', sortable: true },
              { id: 'monthly-revenue', header: 'Monthly Revenue', path: 'monthlyRevenue', type: 'currency' },
              { id: 'probability', header: 'Probability', path: 'probability', type: 'percentage' },
            ],
            pagination: { enabled: true, pageSize: 15 },
          },

          // Extension Opportunities
          {
            id: 'extension-opportunities',
            type: 'table',
            title: 'Extension Opportunities',
            icon: 'RefreshCw',
            collapsible: true,
            dataSource: {
              type: 'field',
              path: 'placements.extensionOpportunities',
            },
            columns_config: [
              { id: 'consultant', header: 'Consultant', path: 'consultantName', type: 'text' },
              { id: 'client', header: 'Client', path: 'clientName', type: 'text' },
              { id: 'current-end', header: 'Current End Date', path: 'currentEndDate', type: 'date' },
              { id: 'likelihood', header: 'Extension Likelihood', path: 'extensionLikelihood', type: 'percentage' },
              { id: 'annual-value', header: 'Annual Value', path: 'annualValue', type: 'currency' },
            ],
            actions: [
              {
                id: 'request-extension',
                type: 'modal',
                label: 'Request Extension',
                icon: 'RefreshCw',
                config: { type: 'modal', modal: 'RequestExtensionModal' },
              },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 4: SCENARIO PLANNING
      // ─────────────────────────────────────────────────────
      {
        id: 'scenarios',
        label: 'Scenario Planning',
        icon: 'GitMerge',
        sections: [
          // Scenario Comparison
          {
            id: 'scenario-comparison',
            type: 'custom',
            component: 'ScenarioComparisonChart',
            title: 'Scenario Comparison',
            config: {
              scenarios: ['Conservative', 'Base Case', 'Optimistic'],
              metrics: ['revenue', 'placements', 'margin'],
              height: 400,
            },
          },

          // Scenario Table
          {
            id: 'scenario-table',
            type: 'table',
            title: 'Scenario Details',
            icon: 'Table',
            dataSource: {
              type: 'field',
              path: 'scenarios.details',
            },
            columns_config: [
              { id: 'metric', header: 'Metric', path: 'metricName', type: 'text' },
              { id: 'conservative', header: 'Conservative', path: 'conservative', type: 'currency' },
              { id: 'base', header: 'Base Case', path: 'baseCase', type: 'currency' },
              { id: 'optimistic', header: 'Optimistic', path: 'optimistic', type: 'currency' },
              { id: 'current-trajectory', header: 'Current Trajectory', path: 'currentTrajectory', type: 'currency' },
            ],
          },

          // What-If Analysis
          {
            id: 'what-if',
            type: 'custom',
            component: 'WhatIfAnalysisWidget',
            title: 'What-If Analysis',
            config: {
              variables: [
                { id: 'bill-rate', label: 'Avg Bill Rate Change', type: 'percentage', default: 0 },
                { id: 'placement-count', label: 'Placement Count Change', type: 'percentage', default: 0 },
                { id: 'churn-rate', label: 'Churn Rate Change', type: 'percentage', default: 0 },
              ],
            },
          },

          // Sensitivity Analysis
          {
            id: 'sensitivity',
            type: 'custom',
            component: 'SensitivityAnalysisChart',
            title: 'Sensitivity Analysis',
            collapsible: true,
            config: {
              chartType: 'tornado',
              height: 350,
            },
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 5: PREDICTIVE ANALYTICS
      // ─────────────────────────────────────────────────────
      {
        id: 'predictive',
        label: 'Predictive Analytics',
        icon: 'Brain',
        sections: [
          // AI Predictions
          {
            id: 'ai-predictions',
            type: 'custom',
            component: 'AIPredictionsWidget',
            title: 'AI-Powered Predictions',
            config: {
              predictions: ['revenue', 'placements', 'churn', 'market'],
              showConfidence: true,
            },
          },

          // Churn Risk Predictions
          {
            id: 'churn-risk',
            type: 'table',
            title: 'Churn Risk Predictions',
            icon: 'AlertTriangle',
            dataSource: {
              type: 'field',
              path: 'predictive.churnRisk',
            },
            columns_config: [
              { id: 'client', header: 'Client', path: 'clientName', type: 'text' },
              { id: 'revenue', header: 'Annual Revenue', path: 'annualRevenue', type: 'currency', sortable: true },
              { id: 'risk-score', header: 'Churn Risk Score', path: 'churnRiskScore', type: 'percentage', sortable: true },
              { id: 'risk-factors', header: 'Risk Factors', path: 'riskFactors', type: 'text' },
              { id: 'predicted-date', header: 'Predicted Churn Date', path: 'predictedChurnDate', type: 'date' },
              { id: 'action', header: 'Recommended Action', path: 'recommendedAction', type: 'text' },
            ],
            actions: [
              {
                id: 'create-retention-plan',
                type: 'modal',
                label: 'Create Retention Plan',
                icon: 'Shield',
                config: { type: 'modal', modal: 'CreateRetentionPlanModal' },
              },
            ],
          },

          // Growth Opportunity Predictions
          {
            id: 'growth-predictions',
            type: 'table',
            title: 'Growth Opportunity Predictions',
            icon: 'TrendingUp',
            dataSource: {
              type: 'field',
              path: 'predictive.growthOpportunities',
            },
            columns_config: [
              { id: 'opportunity', header: 'Opportunity', path: 'description', type: 'text' },
              { id: 'potential-value', header: 'Potential Value', path: 'potentialValue', type: 'currency', sortable: true },
              { id: 'probability', header: 'Probability', path: 'probability', type: 'percentage' },
              { id: 'timeline', header: 'Timeline', path: 'timeline', type: 'text' },
              { id: 'confidence', header: 'AI Confidence', path: 'aiConfidence', type: 'percentage' },
            ],
          },

          // Model Accuracy
          {
            id: 'model-accuracy',
            type: 'info-card',
            title: 'Prediction Model Accuracy',
            icon: 'Target',
            collapsible: true,
            fields: [
              { id: 'revenue-accuracy', label: 'Revenue Forecast Accuracy', type: 'percentage', path: 'modelAccuracy.revenue' },
              { id: 'placement-accuracy', label: 'Placement Forecast Accuracy', type: 'percentage', path: 'modelAccuracy.placements' },
              { id: 'churn-accuracy', label: 'Churn Prediction Accuracy', type: 'percentage', path: 'modelAccuracy.churn' },
              { id: 'last-calibrated', label: 'Last Model Calibration', type: 'date', path: 'modelAccuracy.lastCalibrated' },
            ],
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'export-forecast',
      type: 'modal',
      label: 'Export Forecast',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportForecastModal' },
    },
    {
      id: 'create-scenario',
      type: 'modal',
      label: 'Create Scenario',
      icon: 'GitMerge',
      variant: 'outline',
      config: { type: 'modal', modal: 'CreateScenarioModal' },
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
      { label: 'Forecasting' },
    ],
  },

  keyboard_shortcuts: [
    { key: 'g r', action: 'navigate:tab:revenue', description: 'Go to Revenue Forecast tab' },
    { key: 'g p', action: 'navigate:tab:pipeline', description: 'Go to Pipeline Projections tab' },
    { key: 'g l', action: 'navigate:tab:placements', description: 'Go to Placement Projections tab' },
    { key: 'g s', action: 'navigate:tab:scenarios', description: 'Go to Scenario Planning tab' },
    { key: 'g a', action: 'navigate:tab:predictive', description: 'Go to Predictive Analytics tab' },
    { key: 'e', action: 'modal:ExportForecastModal', description: 'Export forecast' },
    { key: 'r', action: 'refresh', description: 'Refresh data' },
  ],
};
