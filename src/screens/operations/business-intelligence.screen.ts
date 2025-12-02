/**
 * Business Intelligence Screen Definition
 *
 * Strategic insights and market intelligence for CEO.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const businessIntelligenceScreen: ScreenDefinition = {
  id: 'business-intelligence',
  type: 'dashboard',
  title: 'Business Intelligence',
  subtitle: 'Strategic insights, market trends, and AI-powered analysis',
  icon: 'Lightbulb',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'executive.getBusinessIntelligence',
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'insights',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: AI-POWERED INSIGHTS
      // ─────────────────────────────────────────────────────
      {
        id: 'insights',
        label: 'AI Insights',
        icon: 'Sparkles',
        sections: [
          {
            id: 'key-insights',
            type: 'custom',
            component: 'AIInsightsWidget',
            title: 'Key AI-Powered Insights',
            config: {
              categories: ['revenue', 'operations', 'clients', 'market'],
              maxInsights: 10,
            },
          },
          {
            id: 'recommendations',
            type: 'table',
            title: 'AI Recommendations',
            icon: 'Lightbulb',
            dataSource: {
              type: 'field',
              path: 'recommendations',
            },
            columns_config: [
              { id: 'priority', header: '', path: 'priority', type: 'enum', width: '50px', config: { options: [{ value: 'high', label: '🔴' }, { value: 'medium', label: '🟡' }, { value: 'low', label: '🟢' }] } },
              { id: 'recommendation', header: 'Recommendation', path: 'title', type: 'text' },
              { id: 'category', header: 'Category', path: 'category', type: 'text' },
              { id: 'potential-impact', header: 'Potential Impact', path: 'potentialImpact', type: 'currency' },
              { id: 'confidence', header: 'Confidence', path: 'confidence', type: 'percentage' },
            ],
            actions: [
              {
                id: 'view-details',
                type: 'modal',
                label: 'View Details',
                icon: 'Eye',
                config: { type: 'modal', modal: 'InsightDetailModal' },
              },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 2: MARKET TRENDS
      // ─────────────────────────────────────────────────────
      {
        id: 'market',
        label: 'Market Trends',
        icon: 'TrendingUp',
        sections: [
          {
            id: 'market-overview',
            type: 'custom',
            component: 'MarketTrendsWidget',
            title: 'Staffing Market Trends',
            config: { height: 400 },
          },
          {
            id: 'industry-indicators',
            type: 'info-card',
            title: 'Industry Indicators',
            icon: 'BarChart',
            fields: [
              { id: 'market-growth', label: 'Market Growth Rate', type: 'percentage', path: 'market.growthRate' },
              { id: 'demand-index', label: 'Tech Talent Demand Index', type: 'number', path: 'market.demandIndex' },
              { id: 'salary-trend', label: 'Salary Trend', type: 'percentage', path: 'market.salaryTrend' },
              { id: 'competition-level', label: 'Competition Level', type: 'text', path: 'market.competitionLevel' },
            ],
          },
          {
            id: 'skill-demand',
            type: 'custom',
            component: 'SkillDemandChart',
            title: 'Top Skills in Demand',
            config: { chartType: 'horizontal-bar', height: 300 },
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 3: COMPETITIVE LANDSCAPE
      // ─────────────────────────────────────────────────────
      {
        id: 'competitive',
        label: 'Competitive',
        icon: 'Swords',
        sections: [
          {
            id: 'competitive-overview',
            type: 'custom',
            component: 'CompetitiveOverviewWidget',
            title: 'Competitive Landscape',
            config: { height: 350 },
          },
          {
            id: 'competitor-table',
            type: 'table',
            title: 'Key Competitors',
            dataSource: {
              type: 'field',
              path: 'competitors',
            },
            columns_config: [
              { id: 'name', header: 'Competitor', path: 'name', type: 'text' },
              { id: 'market-share', header: 'Est. Market Share', path: 'marketShare', type: 'percentage' },
              { id: 'strength', header: 'Key Strength', path: 'keyStrength', type: 'text' },
              { id: 'weakness', header: 'Key Weakness', path: 'keyWeakness', type: 'text' },
              { id: 'threat-level', header: 'Threat Level', path: 'threatLevel', type: 'enum', config: { options: [{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }], badgeColors: { high: 'red', medium: 'yellow', low: 'green' } } },
            ],
          },
          {
            id: 'swot-analysis',
            type: 'custom',
            component: 'SWOTAnalysisWidget',
            title: 'SWOT Analysis',
            collapsible: true,
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 4: RISK ASSESSMENT
      // ─────────────────────────────────────────────────────
      {
        id: 'risk',
        label: 'Risk Assessment',
        icon: 'ShieldAlert',
        sections: [
          {
            id: 'risk-overview',
            type: 'custom',
            component: 'RiskHeatmapWidget',
            title: 'Risk Heat Map',
            config: { height: 400 },
          },
          {
            id: 'risk-table',
            type: 'table',
            title: 'Key Risks',
            dataSource: {
              type: 'field',
              path: 'risks',
            },
            columns_config: [
              { id: 'risk', header: 'Risk', path: 'title', type: 'text' },
              { id: 'category', header: 'Category', path: 'category', type: 'text' },
              { id: 'likelihood', header: 'Likelihood', path: 'likelihood', type: 'enum', config: { options: [{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] } },
              { id: 'impact', header: 'Impact', path: 'impact', type: 'enum', config: { options: [{ value: 'severe', label: 'Severe' }, { value: 'major', label: 'Major' }, { value: 'minor', label: 'Minor' }] } },
              { id: 'mitigation', header: 'Mitigation Strategy', path: 'mitigation', type: 'text' },
              { id: 'owner', header: 'Owner', path: 'ownerName', type: 'text' },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // TAB 5: GROWTH OPPORTUNITIES
      // ─────────────────────────────────────────────────────
      {
        id: 'opportunities',
        label: 'Opportunities',
        icon: 'Rocket',
        sections: [
          {
            id: 'opportunity-matrix',
            type: 'custom',
            component: 'OpportunityMatrixWidget',
            title: 'Growth Opportunity Matrix',
            config: { height: 400 },
          },
          {
            id: 'opportunity-table',
            type: 'table',
            title: 'Growth Opportunities',
            dataSource: {
              type: 'field',
              path: 'opportunities',
            },
            columns_config: [
              { id: 'opportunity', header: 'Opportunity', path: 'title', type: 'text' },
              { id: 'type', header: 'Type', path: 'opportunityType', type: 'enum', config: { options: [{ value: 'new_market', label: 'New Market' }, { value: 'new_service', label: 'New Service' }, { value: 'expansion', label: 'Expansion' }, { value: 'acquisition', label: 'Acquisition' }] } },
              { id: 'potential-revenue', header: 'Potential Revenue', path: 'potentialRevenue', type: 'currency' },
              { id: 'investment', header: 'Est. Investment', path: 'estimatedInvestment', type: 'currency' },
              { id: 'roi', header: 'Expected ROI', path: 'expectedROI', type: 'percentage' },
              { id: 'timeline', header: 'Timeline', path: 'timeline', type: 'text' },
              { id: 'priority', header: 'Priority', path: 'priority', type: 'enum', config: { options: [{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] } },
            ],
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'generate-report',
      type: 'modal',
      label: 'Generate Report',
      icon: 'FileText',
      variant: 'outline',
      config: { type: 'modal', modal: 'GenerateBIReportModal' },
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
      { label: 'Business Intelligence' },
    ],
  },
};
