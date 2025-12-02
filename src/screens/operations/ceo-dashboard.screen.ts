/**
 * CEO Strategic Dashboard Screen Definition
 *
 * High-level strategic dashboard for the Chief Executive Officer.
 *
 * @see docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md (Executive hierarchy)
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const ceoDashboardScreen: ScreenDefinition = {
  id: 'ceo-dashboard',
  type: 'dashboard',
  title: 'CEO Strategic Dashboard',
  subtitle: 'Strategic overview and company performance',
  icon: 'Crown',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'executive.getCEODashboard',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // ─────────────────────────────────────────────────────
      // STRATEGIC KPIs ROW 1
      // ─────────────────────────────────────────────────────
      {
        id: 'strategic-kpis-row1',
        type: 'metrics-grid',
        title: 'Strategic KPIs (YTD)',
        columns: 6,
        fields: [
          {
            id: 'total-revenue',
            label: 'Total Revenue (MTD/YTD)',
            type: 'currency',
            path: 'kpis.totalRevenueYTD',
            config: {
              trend: { type: 'field', path: 'kpis.revenueTrend' },
              target: { type: 'field', path: 'kpis.revenueTarget' },
              icon: 'DollarSign',
            },
          },
          {
            id: 'revenue-growth',
            label: 'Revenue Growth %',
            type: 'percentage',
            path: 'kpis.revenueGrowth',
            config: {
              target: 25,
              trend: { type: 'field', path: 'kpis.revenueGrowthTrend' },
              icon: 'TrendingUp',
            },
          },
          {
            id: 'total-placements',
            label: 'Total Placements',
            type: 'number',
            path: 'kpis.totalPlacements',
            config: {
              icon: 'Users',
              trend: { type: 'field', path: 'kpis.placementsTrend' },
            },
          },
          {
            id: 'client-count',
            label: 'Active Clients',
            type: 'number',
            path: 'kpis.activeClients',
            config: { icon: 'Building2' },
          },
          {
            id: 'employee-count',
            label: 'Employees',
            type: 'number',
            path: 'kpis.employeeCount',
            config: { icon: 'UserCheck' },
          },
          {
            id: 'gross-margin',
            label: 'Gross Margin %',
            type: 'percentage',
            path: 'kpis.grossMargin',
            config: { target: 25, icon: 'Percent' },
          },
        ],
      },

      // ─────────────────────────────────────────────────────
      // COMPANY HEALTH SCORE
      // ─────────────────────────────────────────────────────
      {
        id: 'company-health-score',
        type: 'custom',
        component: 'CompanyHealthScoreWidget',
        title: 'Company Health Score',
        config: {
          dimensions: [
            { id: 'financial', label: 'Financial Health', weight: 0.3, icon: 'DollarSign' },
            { id: 'operational', label: 'Operational Health', weight: 0.3, icon: 'Activity' },
            { id: 'client', label: 'Client Health', weight: 0.2, icon: 'Building2' },
            { id: 'team', label: 'Team Health', weight: 0.2, icon: 'Users' },
          ],
          showBreakdown: true,
        },
      },
      
      // ─────────────────────────────────────────────────────
      // OKR PROGRESS
      // ─────────────────────────────────────────────────────
      {
        id: 'okr-progress',
        type: 'custom',
        component: 'OKRProgressWidget',
        title: { type: 'computed', template: 'OKR Progress ({{quarter}})' },
        span: 4,
      },
      
      // ─────────────────────────────────────────────────────
      // STRATEGIC ALERTS
      // ─────────────────────────────────────────────────────
      {
        id: 'strategic-alerts',
        type: 'table',
        title: 'Strategic Alerts',
        dataSource: {
          type: 'field',
          path: 'alerts',
        },
        columns_config: [
          {
            id: 'severity',
            header: '',
            path: 'severity',
            type: 'badge',
            options: [
              { value: 'critical', label: '🔴', color: 'destructive' },
              { value: 'high', label: '🟡', color: 'warning' },
              { value: 'info', label: '🟢', color: 'success' },
            ],
            width: '40px',
          },
          {
            id: 'alert',
            header: 'Alert',
            accessor: 'description',
            type: 'text',
            primary: true,
          },
          {
            id: 'action',
            header: 'Action',
            accessor: 'recommendedAction',
            type: 'text',
          },
          {
            id: 'due',
            header: 'Due',
            accessor: 'dueDate',
            type: 'date',
          },
          {
            id: 'actions',
            header: '',
            type: 'actions',
            actions: [
              {
                id: 'view',
                label: 'View Details',
                icon: 'eye',
                type: 'navigate',
                config: { type: 'navigate', route: '{{detailUrl}}' },
              },
              {
                id: 'add-note',
                label: 'Add Note',
                icon: 'message-square',
                type: 'modal',
                config: { type: 'modal', modal: 'add-note' },
              },
            ],
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // REVENUE & GROWTH
      // ─────────────────────────────────────────────────────
      {
        id: 'revenue-summary',
        type: 'custom',
        component: 'RevenueGrowthChart',
        title: 'Revenue & Growth (12 Months)',
        span: 2,
      },
      {
        id: 'pillar-revenue',
        type: 'custom',
        component: 'RevenuePillarBreakdown',
        title: 'Revenue by Pillar',
        span: 2,
      },
      
      // ─────────────────────────────────────────────────────
      // STRATEGIC ACCOUNTS
      // ─────────────────────────────────────────────────────
      {
        id: 'strategic-accounts',
        type: 'table',
        title: 'Strategic Account Health',
        description: 'Top 10 accounts by revenue',
        dataSource: {
          type: 'field',
          path: 'strategicAccounts',
        },
        columns_config: [
          {
            id: 'account',
            header: 'Account',
            path: 'name',
            type: 'link',
            config: { linkPattern: '/executive/accounts/{{id}}' },
            primary: true,
          },
          {
            id: 'revenue',
            header: 'YTD Revenue',
            accessor: 'ytdRevenue',
            type: 'currency',
          },
          {
            id: 'placements',
            header: 'Placements',
            accessor: 'placementCount',
            type: 'number',
          },
          {
            id: 'health',
            header: 'Health Score',
            accessor: 'healthScore',
            type: 'progress-bar',
            max: 100,
          },
          {
            id: 'status',
            header: 'Status',
            accessor: 'status',
            type: 'badge',
            options: [
              { value: 'healthy', label: 'Healthy', color: 'success' },
              { value: 'at_risk', label: 'At Risk', color: 'warning' },
              { value: 'critical', label: 'Critical', color: 'destructive' },
            ],
          },
          {
            id: 'next-action',
            header: 'Next Action',
            accessor: 'nextAction',
            type: 'text',
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // BOARD COUNTDOWN
      // ─────────────────────────────────────────────────────
      {
        id: 'board-countdown',
        type: 'info-card',
        title: 'Board Meeting',
        visible: {
          type: 'condition',
          condition: { operator: 'exists', field: 'nextBoardMeeting' },
        },
        fields: [
          { id: 'date', label: 'Date', path: 'nextBoardMeeting.date', format: 'date' },
          { id: 'countdown', label: 'Days Until', path: 'nextBoardMeeting.daysUntil' },
          { id: 'deck-status', label: 'Deck Status', path: 'nextBoardMeeting.deckStatus' },
        ],
        actions: [
          {
            id: 'prep-deck',
            label: 'Prep Board Deck',
            icon: 'presentation',
            type: 'navigate',
            config: { type: 'navigate', route: '/executive/board/deck' },
          },
          {
            id: 'view-financials',
            label: 'Review Financials',
            icon: 'dollar-sign',
            type: 'navigate',
            config: { type: 'navigate', route: '/finance/dashboard' },
          },
          {
            id: 'view-agenda',
            label: 'View Agenda',
            icon: 'list',
            type: 'navigate',
            config: { type: 'navigate', route: '/executive/board/agenda' },
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // COMPETITIVE INTEL
      // ─────────────────────────────────────────────────────
      {
        id: 'competitive-intel',
        type: 'custom',
        component: 'CompetitiveIntelWidget',
        title: 'Competitive Intelligence',
        collapsed: true,
      },
      
      // ─────────────────────────────────────────────────────
      // EXECUTIVE TEAM STATUS
      // ─────────────────────────────────────────────────────
      {
        id: 'exec-team',
        type: 'table',
        title: 'Executive Team Status',
        description: 'Weekly update from leadership team',
        dataSource: {
          type: 'field',
          path: 'execTeamStatus',
        },
        columns_config: [
          {
            id: 'executive',
            header: 'Executive',
            path: 'name',
            type: 'user',
          },
          {
            id: 'role',
            header: 'Role',
            accessor: 'role',
            type: 'text',
          },
          {
            id: 'status',
            header: 'Status',
            accessor: 'status',
            type: 'badge',
            options: [
              { value: 'green', label: 'Green', color: 'success' },
              { value: 'yellow', label: 'Yellow', color: 'warning' },
              { value: 'red', label: 'Red', color: 'destructive' },
            ],
          },
          {
            id: 'top-priority',
            header: 'Top Priority This Week',
            accessor: 'topPriority',
            type: 'text',
          },
          {
            id: 'blockers',
            header: 'Blockers',
            accessor: 'blockers',
            type: 'text',
          },
        ],
      },
    ],
  },
  
  actions: [
    {
      id: 'business-intelligence',
      type: 'navigate',
      label: 'Business Intelligence',
      icon: 'Lightbulb',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/ceo/intelligence' },
    },
    {
      id: 'strategic-initiatives',
      type: 'navigate',
      label: 'Strategic Initiatives',
      icon: 'Target',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/ceo/initiatives' },
    },
    {
      id: 'portfolio-overview',
      type: 'navigate',
      label: 'Portfolio',
      icon: 'PieChart',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/ceo/portfolio' },
    },
    {
      id: 'executive-reports',
      type: 'navigate',
      label: 'Reports',
      icon: 'FileBarChart',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/ceo/reports' },
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
      { label: 'CEO Dashboard' },
    ],
  },

  keyboard_shortcuts: [
    { key: 'g s', action: 'navigate:/employee/ceo/dashboard', description: 'Go to CEO Dashboard' },
    { key: 'g i', action: 'navigate:/employee/ceo/intelligence', description: 'Go to Business Intelligence' },
    { key: 'g t', action: 'navigate:/employee/ceo/initiatives', description: 'Go to Strategic Initiatives' },
    { key: 'g p', action: 'navigate:/employee/ceo/portfolio', description: 'Go to Portfolio' },
    { key: 'g r', action: 'navigate:/employee/ceo/reports', description: 'Go to Reports' },
    { key: 'g f', action: 'navigate:/employee/cfo/dashboard', description: 'Go to CFO Dashboard' },
    { key: 'g o', action: 'navigate:/employee/coo/dashboard', description: 'Go to COO Dashboard' },
    { key: 'r', action: 'refresh', description: 'Refresh data' },
  ],
};

