/**
 * CFO Financial Dashboard Screen Definition
 *
 * Comprehensive financial dashboard for the Chief Financial Officer.
 *
 * @see docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const cfoDashboardScreen: ScreenDefinition = {
  id: 'cfo-dashboard',
  type: 'dashboard',
  title: 'CFO Financial Dashboard',
  subtitle: 'Multi-currency financial operations and analysis',
  icon: 'DollarSign',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'finance.getCFODashboard',
    },
  },

  layout: {
    type: 'tabs',
    defaultTab: 'overview',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: FINANCIAL OVERVIEW
      // Per CFO Role Spec: KPIs + Charts + Alerts
      // ─────────────────────────────────────────────────────
      {
        id: 'overview',
        label: 'Overview',
        icon: 'LayoutDashboard',
        sections: [
          // KPI Cards Row 1: Revenue & Margin
          {
            id: 'financial-kpis-row1',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              {
                id: 'revenue-mtd',
                label: 'Revenue MTD',
                type: 'currency',
                path: 'overview.revenueMTD',
                config: {
                  target: { type: 'field', path: 'overview.revenueMTDTarget' },
                  trend: { type: 'field', path: 'overview.revenueMTDTrend' },
                  icon: 'TrendingUp',
                },
              },
              {
                id: 'revenue-ytd',
                label: 'Revenue YTD',
                type: 'currency',
                path: 'overview.revenueYTD',
                config: {
                  target: { type: 'field', path: 'overview.revenueYTDTarget' },
                  trend: { type: 'field', path: 'overview.revenueYTDTrend' },
                  icon: 'TrendingUp',
                },
              },
              {
                id: 'gross-margin',
                label: 'Gross Margin %',
                type: 'percentage',
                path: 'overview.grossMargin',
                config: {
                  target: 25,
                  thresholds: { warning: 20, critical: 15 },
                  icon: 'Percent',
                },
              },
              {
                id: 'ebitda',
                label: 'EBITDA',
                type: 'currency',
                path: 'overview.ebitda',
                config: {
                  trend: { type: 'field', path: 'overview.ebitdaTrend' },
                  icon: 'CircleDollarSign',
                },
              },
            ],
          },
          // KPI Cards Row 2: Cash & AR
          {
            id: 'financial-kpis-row2',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              {
                id: 'cash-position',
                label: 'Cash Position',
                type: 'currency',
                path: 'overview.cashPosition',
                config: {
                  icon: 'Wallet',
                  trend: { type: 'field', path: 'overview.cashTrend' },
                },
              },
              {
                id: 'ar-outstanding',
                label: 'AR Outstanding',
                type: 'currency',
                path: 'overview.arOutstanding',
                config: {
                  icon: 'FileText',
                  thresholds: { warning: 500000, critical: 1000000 },
                },
              },
              {
                id: 'dso',
                label: 'DSO (Days)',
                type: 'number',
                path: 'overview.dso',
                config: {
                  target: 45,
                  inverse: true, // Lower is better
                  icon: 'Clock',
                  thresholds: { warning: 50, critical: 60 },
                },
              },
              {
                id: 'collection-rate',
                label: 'Collection Rate',
                type: 'percentage',
                path: 'overview.collectionRate',
                config: {
                  target: 95,
                  icon: 'BadgeCheck',
                  thresholds: { warning: 90, critical: 85 },
                },
              },
            ],
          },
          // Charts: Revenue Trend (12-month)
          {
            id: 'revenue-trend',
            type: 'custom',
            component: 'RevenueTrendChart',
            title: 'Revenue Trend (12-Month Rolling)',
            config: { height: 300 },
          },
          // Charts Row: Service Line + Client Tier
          {
            id: 'revenue-by-service',
            type: 'custom',
            component: 'RevenueByServiceLineChart',
            title: 'Revenue by Service Line',
            config: {
              servicelines: ['Contract', 'FTE', 'C2H', 'Bench'],
              chartType: 'donut',
            },
          },
          {
            id: 'margin-by-tier',
            type: 'custom',
            component: 'MarginByClientTierChart',
            title: 'Margin by Client Tier',
            config: {
              tiers: ['Enterprise', 'Mid-Market', 'SMB'],
              chartType: 'bar',
            },
          },
          // AR Aging Distribution
          {
            id: 'ar-aging-chart',
            type: 'custom',
            component: 'ARAgingDistributionChart',
            title: 'AR Aging Distribution',
            config: {
              buckets: ['Current', '1-30', '31-60', '61-90', '90+'],
              chartType: 'stacked-bar',
            },
          },
          // Alerts Panel
          {
            id: 'financial-alerts',
            type: 'table',
            title: 'Financial Alerts',
            icon: 'AlertTriangle',
            dataSource: {
              type: 'field',
              path: 'alerts',
            },
            columns_config: [
              {
                id: 'severity',
                header: '',
                path: 'severity',
                type: 'enum',
                config: {
                  options: [
                    { value: 'critical', label: '🔴' },
                    { value: 'warning', label: '🟡' },
                    { value: 'info', label: '🔵' },
                  ],
                },
                width: '40px',
              },
              {
                id: 'type',
                header: 'Type',
                path: 'alertType',
                type: 'enum',
                config: {
                  options: [
                    { value: 'overdue_invoice', label: 'Large Invoice Overdue' },
                    { value: 'margin_exception', label: 'Margin Exception' },
                    { value: 'commission_unusual', label: 'Unusual Commission' },
                    { value: 'cash_flow', label: 'Cash Flow Alert' },
                  ],
                },
              },
              { id: 'description', header: 'Description', path: 'description', type: 'text' },
              { id: 'amount', header: 'Amount', path: 'amount', type: 'currency' },
              { id: 'date', header: 'Date', path: 'createdAt', type: 'date' },
            ],
            actions: [
              {
                id: 'view-alert',
                type: 'navigate',
                label: 'View',
                icon: 'Eye',
                config: { type: 'navigate', route: '/employee/cfo/alerts/${id}' },
              },
            ],
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 2: COMMISSIONS
      // ─────────────────────────────────────────────────────
      {
        id: 'commissions',
        label: 'Commissions',
        icon: 'Wallet',
        badge: { type: 'count', path: 'commissions.pendingCount' },
        sections: [
          {
            id: 'commission-summary',
            type: 'metrics-grid',
            columns: 4,
            metrics: [
              {
                id: 'pending-approval',
                label: 'Pending Approval',
                value: { type: 'field', path: 'commissions.pendingAmount' },
                format: { type: 'currency' },
                icon: 'clock',
              },
              {
                id: 'approved-mtd',
                label: 'Approved MTD',
                value: { type: 'field', path: 'commissions.approvedMTD' },
                format: { type: 'currency' },
                icon: 'check-circle',
              },
              {
                id: 'disputes',
                label: 'Disputes',
                value: { type: 'field', path: 'commissions.disputeCount' },
                icon: 'alert-triangle',
                alertThreshold: 1,
              },
              {
                id: 'accuracy',
                label: 'Accuracy Rate',
                value: { type: 'field', path: 'commissions.accuracyRate' },
                format: { type: 'percentage' },
                target: 99.5,
              },
            ],
          },
          {
            id: 'pending-commissions',
            type: 'table',
            title: 'Pending Commission Approvals',
            dataSource: {
              type: 'field',
              path: 'commissions.pending',
            },
            columns_config: [
              {
                id: 'recruiter',
                header: 'Recruiter',
                path: 'recruiterName',
                type: 'user',
              },
              {
                id: 'placement',
                header: 'Placement',
                accessor: 'placementTitle',
                type: 'link',
                config: { linkPattern: '/employee/placements/{{placementId}}' },
              },
              {
                id: 'client',
                header: 'Client',
                accessor: 'clientName',
                type: 'text',
              },
              {
                id: 'amount',
                header: 'Amount',
                accessor: 'amount',
                type: 'currency',
              },
              {
                id: 'type',
                header: 'Type',
                accessor: 'commissionType',
                type: 'badge',
                options: [
                  { value: 'placement', label: 'Placement', color: 'success' },
                  { value: 'milestone', label: 'Milestone', color: 'info' },
                  { value: 'bonus', label: 'Bonus', color: 'warning' },
                ],
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                config: {
                  actions: [
                    {
                      id: 'approve',
                      type: 'mutation',
                      label: 'Approve',
                      icon: 'check',
                      variant: 'success',
                      config: { type: 'mutation', procedure: 'commissions.approve' },
                    },
                    {
                      id: 'review',
                      type: 'navigate',
                      label: 'Review',
                      icon: 'eye',
                      config: { type: 'navigate', route: '/finance/commissions/{{id}}' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 3: INVOICING & AR
      // ─────────────────────────────────────────────────────
      {
        id: 'invoicing',
        label: 'Invoicing & AR',
        icon: 'FileText',
        sections: [
          {
            id: 'ar-kpis',
            type: 'metrics-grid',
            columns: 4,
            metrics: [
              {
                id: 'ar-total',
                label: 'Total AR',
                value: { type: 'field', path: 'ar.total' },
                format: { type: 'currency' },
              },
              {
                id: 'ar-current',
                label: 'Current (<30 days)',
                value: { type: 'field', path: 'ar.current' },
                format: { type: 'currency' },
                color: 'success',
              },
              {
                id: 'ar-overdue',
                label: 'Overdue (>30 days)',
                value: { type: 'field', path: 'ar.overdue' },
                format: { type: 'currency' },
                color: 'warning',
              },
              {
                id: 'ar-critical',
                label: 'Critical (>90 days)',
                value: { type: 'field', path: 'ar.critical' },
                format: { type: 'currency' },
                color: 'destructive',
                alertThreshold: 1,
              },
            ],
          },
          {
            id: 'ar-aging-chart',
            type: 'custom',
            component: 'ARAgingChart',
            title: 'AR Aging Distribution',
            span: 2,
          },
          {
            id: 'collections-trend',
            type: 'custom',
            component: 'CollectionsTrendChart',
            title: 'Collections Trend (12 Months)',
            span: 2,
          },
          {
            id: 'overdue-invoices',
            type: 'table',
            title: 'Overdue Invoices Requiring Action',
            dataSource: {
              type: 'field',
              path: 'ar.overdueInvoices',
            },
            columns_config: [
              {
                id: 'invoice',
                header: 'Invoice #',
                path: 'invoiceNumber',
                type: 'link',
                config: { linkPattern: '/finance/invoices/{{id}}' },
              },
              {
                id: 'client',
                header: 'Client',
                accessor: 'clientName',
                type: 'text',
              },
              {
                id: 'amount',
                header: 'Amount',
                accessor: 'amount',
                type: 'currency',
              },
              {
                id: 'currency',
                header: 'Currency',
                accessor: 'currency',
                type: 'badge',
                options: [
                  { value: 'USD', label: 'USD', color: 'info' },
                  { value: 'CAD', label: 'CAD', color: 'secondary' },
                ],
              },
              {
                id: 'dueDate',
                header: 'Due Date',
                accessor: 'dueDate',
                type: 'date',
              },
              {
                id: 'daysOverdue',
                header: 'Days Overdue',
                accessor: 'daysOverdue',
                type: 'number',
                highlight: {
                  condition: { operator: 'gt', field: 'daysOverdue', value: 60 },
                  color: 'destructive',
                },
              },
              {
                id: 'status',
                header: 'Status',
                accessor: 'collectionStatus',
                type: 'badge',
                options: [
                  { value: 'pending', label: 'Pending', color: 'warning' },
                  { value: 'contacted', label: 'Contacted', color: 'info' },
                  { value: 'disputed', label: 'Disputed', color: 'destructive' },
                  { value: 'payment_plan', label: 'Payment Plan', color: 'secondary' },
                ],
              },
            ],
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 4: MULTI-CURRENCY
      // ─────────────────────────────────────────────────────
      {
        id: 'multi-currency',
        label: 'Multi-Currency',
        icon: 'Globe',
        sections: [
          {
            id: 'fx-overview',
            type: 'info-card',
            title: 'Currency Summary',
            fields: [
              { id: 'usd-revenue', label: 'USD Revenue (MTD)', path: 'currency.usdRevenue', format: 'currency' },
              { id: 'cad-revenue', label: 'CAD Revenue (MTD)', path: 'currency.cadRevenue', format: 'currency' },
              { id: 'usd-pct', label: 'USD %', path: 'currency.usdPercentage', format: 'percentage' },
              { id: 'cad-pct', label: 'CAD %', path: 'currency.cadPercentage', format: 'percentage' },
            ],
          },
          {
            id: 'fx-rates-history',
            type: 'custom',
            component: 'FXRatesHistoryChart',
            title: 'USD/CAD Exchange Rate (90 Days)',
            span: 4,
          },
          {
            id: 'fx-gain-loss',
            type: 'custom',
            component: 'FXGainLossChart',
            title: 'FX Gain/Loss by Month',
            span: 2,
          },
          {
            id: 'intercompany',
            type: 'table',
            title: 'Intercompany Transactions',
            description: 'US ↔ Canada transactions requiring reconciliation',
            span: 2,
            dataSource: {
              type: 'field',
              path: 'currency.intercompany',
            },
            columns_config: [
              {
                id: 'description',
                header: 'Description',
                path: 'description',
                type: 'text',
              },
              {
                id: 'from',
                header: 'From',
                accessor: 'fromEntity',
                type: 'text',
              },
              {
                id: 'to',
                header: 'To',
                accessor: 'toEntity',
                type: 'text',
              },
              {
                id: 'amount',
                header: 'Amount',
                accessor: 'amount',
                type: 'currency',
              },
              {
                id: 'status',
                header: 'Status',
                accessor: 'status',
                type: 'badge',
                options: [
                  { value: 'pending', label: 'Pending', color: 'warning' },
                  { value: 'reconciled', label: 'Reconciled', color: 'success' },
                ],
              },
            ],
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 5: MARGIN ANALYSIS
      // ─────────────────────────────────────────────────────
      {
        id: 'margins',
        label: 'Margin Analysis',
        icon: 'TrendingUp',
        sections: [
          {
            id: 'margin-kpis',
            type: 'metrics-grid',
            columns: 3,
            metrics: [
              {
                id: 'avg-margin',
                label: 'Avg Gross Margin',
                value: { type: 'field', path: 'margins.avgGrossMargin' },
                format: { type: 'percentage' },
                target: 25,
              },
              {
                id: 'margin-per-hour',
                label: 'Avg Margin/Hour',
                value: { type: 'field', path: 'margins.avgMarginPerHour' },
                format: { type: 'currency' },
                target: 20,
              },
              {
                id: 'low-margin-count',
                label: 'Low Margin Placements',
                value: { type: 'field', path: 'margins.lowMarginCount' },
                icon: 'alert-triangle',
                alertThreshold: 5,
              },
            ],
          },
          {
            id: 'margin-by-pillar',
            type: 'custom',
            component: 'MarginByPillarChart',
            title: 'Margin by Pillar',
            span: 2,
          },
          {
            id: 'margin-by-client',
            type: 'custom',
            component: 'MarginByClientChart',
            title: 'Top 10 Clients by Margin',
            span: 2,
          },
          {
            id: 'margin-distribution',
            type: 'custom',
            component: 'MarginDistributionChart',
            title: 'Margin Distribution',
            span: 4,
          },
          {
            id: 'low-margin-placements',
            type: 'table',
            title: 'Low Margin Placements (<15%)',
            dataSource: {
              type: 'field',
              path: 'margins.lowMarginPlacements',
            },
            columns_config: [
              {
                id: 'placement',
                header: 'Placement',
                path: 'title',
                type: 'link',
                config: { linkPattern: '/employee/placements/{{id}}' },
              },
              {
                id: 'client',
                header: 'Client',
                accessor: 'clientName',
                type: 'text',
              },
              {
                id: 'bill-rate',
                header: 'Bill Rate',
                accessor: 'billRate',
                type: 'currency',
              },
              {
                id: 'pay-rate',
                header: 'Pay Rate',
                accessor: 'payRate',
                type: 'currency',
              },
              {
                id: 'margin',
                header: 'Margin',
                accessor: 'margin',
                type: 'percentage',
                highlight: {
                  condition: { operator: 'lt', field: 'margin', value: 10 },
                  color: 'destructive',
                },
              },
              {
                id: 'monthly-revenue',
                header: 'Monthly Revenue',
                accessor: 'monthlyRevenue',
                type: 'currency',
              },
            ],
          },
        ],
      },
      
      // ─────────────────────────────────────────────────────
      // TAB 6: MONTH-END CLOSE
      // ─────────────────────────────────────────────────────
      {
        id: 'close',
        label: 'Month-End Close',
        icon: 'CalendarCheck',
        sections: [
          {
            id: 'close-status',
            type: 'custom',
            component: 'MonthEndCloseChecklist',
            title: 'Close Checklist',
            span: 4,
          },
          {
            id: 'close-metrics',
            type: 'metrics-grid',
            columns: 4,
            metrics: [
              {
                id: 'close-day',
                label: 'Close Day',
                value: { type: 'field', path: 'close.dayNumber' },
                format: { type: 'number' },
                suffix: ' of 5',
              },
              {
                id: 'tasks-complete',
                label: 'Tasks Complete',
                value: { type: 'field', path: 'close.tasksComplete' },
                format: { type: 'percentage' },
              },
              {
                id: 'revenue-recognized',
                label: 'Revenue Recognized',
                value: { type: 'field', path: 'close.revenueRecognized' },
                format: { type: 'currency' },
              },
              {
                id: 'pending-accruals',
                label: 'Pending Accruals',
                value: { type: 'field', path: 'close.pendingAccruals' },
                format: { type: 'number' },
              },
            ],
          },
          {
            id: 'journal-entries',
            type: 'table',
            title: 'Pending Journal Entries',
            dataSource: {
              type: 'field',
              path: 'close.pendingJournalEntries',
            },
            columns_config: [
              {
                id: 'entry',
                header: 'Entry',
                path: 'description',
                type: 'text',
              },
              {
                id: 'amount',
                header: 'Amount',
                accessor: 'amount',
                type: 'currency',
              },
              {
                id: 'preparedBy',
                header: 'Prepared By',
                accessor: 'preparedByName',
                type: 'user',
              },
              {
                id: 'status',
                header: 'Status',
                accessor: 'status',
                type: 'badge',
                options: [
                  { value: 'draft', label: 'Draft', color: 'muted' },
                  { value: 'pending_review', label: 'Pending Review', color: 'warning' },
                  { value: 'approved', label: 'Approved', color: 'success' },
                ],
              },
              {
                id: 'actions',
                header: '',
                type: 'actions',
                actions: [
                  {
                    id: 'approve',
                    label: 'Approve',
                    icon: 'check',
                    type: 'mutation',
                    config: { type: 'mutation', procedure: 'finance.approveJournalEntry' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  
  actions: [
    {
      id: 'export-financials',
      type: 'modal',
      label: 'Export Financials',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportFinancialsModal' },
    },
    {
      id: 'revenue-analytics',
      type: 'navigate',
      label: 'Revenue Analytics',
      icon: 'BarChart3',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/cfo/revenue' },
    },
    {
      id: 'ar-dashboard',
      type: 'navigate',
      label: 'AR Dashboard',
      icon: 'FileText',
      variant: 'outline',
      config: { type: 'navigate', route: '/employee/cfo/ar' },
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
      { label: 'CFO Dashboard' },
    ],
  },

  keyboard_shortcuts: [
    { key: 'g f', action: 'navigate:/employee/cfo/dashboard', description: 'Go to CFO Dashboard' },
    { key: 'g c', action: 'tab:commissions', description: 'Go to Commissions' },
    { key: 'g i', action: 'tab:invoicing', description: 'Go to Invoicing' },
    { key: 'g m', action: 'tab:margins', description: 'Go to Margin Analysis' },
    { key: 'g r', action: 'navigate:/employee/cfo/revenue', description: 'Go to Revenue Analytics' },
    { key: 'g a', action: 'navigate:/employee/cfo/ar', description: 'Go to AR Dashboard' },
    { key: 'a', action: 'approve-selected', description: 'Approve selected item' },
    { key: 'r', action: 'refresh', description: 'Refresh data' },
  ],
};

