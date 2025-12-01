/**
 * CEO Strategic Dashboard Screen Definition
 * 
 * High-level strategic dashboard for the Chief Executive Officer.
 * 
 * @see docs/specs/20-USER-ROLES/09-ceo/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const ceoDashboardScreen: ScreenDefinition = {
  id: 'ceo-dashboard',
  type: 'dashboard',
  entityType: 'strategic',
  title: 'CEO Strategic Dashboard',
  description: 'Strategic overview and company performance',
  
  dataSource: {
    type: 'query',
    query: 'executive.getCEODashboard',
  },
  
  layout: {
    type: 'single-column',
    sections: [
      // ─────────────────────────────────────────────────────
      // STRATEGIC KPIs
      // ─────────────────────────────────────────────────────
      {
        id: 'strategic-kpis',
        type: 'metrics-grid',
        title: 'Strategic KPIs (YTD)',
        columns: 6,
        metrics: [
          {
            id: 'revenue-growth',
            label: 'Revenue Growth',
            value: { type: 'field', path: 'kpis.revenueGrowth' },
            format: 'percentage',
            target: 25,
            trend: { type: 'field', path: 'kpis.revenueGrowthTrend' },
            size: 'large',
            icon: 'trending-up',
          },
          {
            id: 'market-share',
            label: 'Market Position',
            value: { type: 'field', path: 'kpis.marketPosition' },
            format: 'text',
            suffix: { type: 'field', path: 'kpis.marketShare', prefix: ' (', suffix: '%)' },
          },
          {
            id: 'gross-margin',
            label: 'Gross Margin',
            value: { type: 'field', path: 'kpis.grossMargin' },
            format: 'percentage',
            target: 25,
          },
          {
            id: 'client-nps',
            label: 'Client NPS',
            value: { type: 'field', path: 'kpis.clientNPS' },
            format: 'number',
            target: 70,
          },
          {
            id: 'employee-nps',
            label: 'Employee NPS',
            value: { type: 'field', path: 'kpis.employeeNPS' },
            format: 'number',
            target: 70,
          },
          {
            id: 'placement-volume',
            label: 'Placement Volume',
            value: { type: 'field', path: 'kpis.placementVolume' },
            format: 'number',
            target: { type: 'field', path: 'kpis.placementTarget' },
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // OKR PROGRESS
      // ─────────────────────────────────────────────────────
      {
        id: 'okr-progress',
        type: 'custom',
        component: 'OKRProgressWidget',
        title: { type: 'computed', template: 'OKR Progress ({{quarter}})' },
        span: 'full',
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
        columns: [
          {
            id: 'severity',
            header: '',
            field: 'severity',
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
            field: 'description',
            type: 'text',
            primary: true,
          },
          {
            id: 'action',
            header: 'Action',
            field: 'recommendedAction',
            type: 'text',
          },
          {
            id: 'due',
            header: 'Due',
            field: 'dueDate',
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
                action: { type: 'navigate', path: '{{detailUrl}}' },
              },
              {
                id: 'add-note',
                label: 'Add Note',
                icon: 'message-square',
                action: { type: 'modal', modalId: 'add-note' },
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
        span: 'half',
      },
      {
        id: 'pillar-revenue',
        type: 'custom',
        component: 'RevenuePillarBreakdown',
        title: 'Revenue by Pillar',
        span: 'half',
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
        columns: [
          {
            id: 'account',
            header: 'Account',
            field: 'name',
            type: 'link',
            linkPattern: '/executive/accounts/{{id}}',
            primary: true,
          },
          {
            id: 'revenue',
            header: 'YTD Revenue',
            field: 'ytdRevenue',
            type: 'currency',
          },
          {
            id: 'placements',
            header: 'Placements',
            field: 'placementCount',
            type: 'number',
          },
          {
            id: 'health',
            header: 'Health Score',
            field: 'healthScore',
            type: 'progress-bar',
            max: 100,
          },
          {
            id: 'status',
            header: 'Status',
            field: 'status',
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
            field: 'nextAction',
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
            action: { type: 'navigate', path: '/executive/board/deck' },
          },
          {
            id: 'view-financials',
            label: 'Review Financials',
            icon: 'dollar-sign',
            action: { type: 'navigate', path: '/finance/dashboard' },
          },
          {
            id: 'view-agenda',
            label: 'View Agenda',
            icon: 'list',
            action: { type: 'navigate', path: '/executive/board/agenda' },
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
        columns: [
          {
            id: 'executive',
            header: 'Executive',
            field: 'name',
            type: 'user',
          },
          {
            id: 'role',
            header: 'Role',
            field: 'role',
            type: 'text',
          },
          {
            id: 'status',
            header: 'Status',
            field: 'status',
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
            field: 'topPriority',
            type: 'text',
          },
          {
            id: 'blockers',
            header: 'Blockers',
            field: 'blockers',
            type: 'text',
          },
        ],
      },
    ],
  },
  
  actions: [
    {
      id: 'refresh',
      label: 'Refresh',
      icon: 'refresh-cw',
      action: { type: 'refresh' },
      position: 'header',
    },
    {
      id: 'board-reporting',
      label: 'Board Reporting',
      icon: 'presentation',
      action: { type: 'navigate', path: '/executive/board' },
      position: 'header',
    },
    {
      id: 'okr-management',
      label: 'OKR Management',
      icon: 'target',
      action: { type: 'navigate', path: '/executive/okrs' },
      position: 'header',
    },
  ],
  
  keyboardShortcuts: [
    { key: 'g s', action: 'navigate:/executive/ceo', description: 'Go to CEO Dashboard' },
    { key: 'g b', action: 'navigate:/executive/board', description: 'Go to Board Reporting' },
    { key: 'g o', action: 'navigate:/executive/okrs', description: 'Go to OKRs' },
    { key: 'g a', action: 'navigate:/executive/accounts', description: 'Go to Strategic Accounts' },
    { key: 'g f', action: 'navigate:/finance/dashboard', description: 'Go to Financial Summary' },
    { key: 'r', action: 'refresh', description: 'Refresh data' },
  ],
};

