/**
 * CFO Financial Dashboard Screen Definition
 * 
 * Comprehensive financial dashboard for the Chief Financial Officer.
 * 
 * @see docs/specs/20-USER-ROLES/07-cfo/06-cfo-overview.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const cfoDashboardScreen: ScreenDefinition = {
  id: 'cfo-dashboard',
  type: 'dashboard',
  entityType: 'financial',
  title: 'CFO Financial Dashboard',
  description: 'Multi-currency financial operations and analysis',
  
  dataSource: {
    type: 'query',
    query: 'finance.getCFODashboard',
  },
  
  layout: {
    type: 'tabs',
    tabs: [
      // ─────────────────────────────────────────────────────
      // TAB 1: FINANCIAL OVERVIEW
      // ─────────────────────────────────────────────────────
      {
        id: 'overview',
        label: 'Overview',
        icon: 'layout-dashboard',
        sections: [
          {
            id: 'financial-kpis',
            type: 'metrics-grid',
            columns: 4,
            metrics: [
              {
                id: 'total-revenue',
                label: 'Total Revenue (USD)',
                value: { type: 'field', path: 'overview.totalRevenue' },
                format: 'currency',
                target: { type: 'field', path: 'overview.revenueTarget' },
                trend: { type: 'field', path: 'overview.revenueTrend' },
                size: 'large',
              },
              {
                id: 'gross-margin',
                label: 'Gross Margin',
                value: { type: 'field', path: 'overview.grossMargin' },
                format: 'percentage',
                target: 25,
                color: 'success',
              },
              {
                id: 'operating-margin',
                label: 'Operating Margin',
                value: { type: 'field', path: 'overview.operatingMargin' },
                format: 'percentage',
                target: 15,
              },
              {
                id: 'dso',
                label: 'DSO (Days)',
                value: { type: 'field', path: 'overview.dso' },
                format: 'number',
                target: 45,
                inverse: true, // Lower is better
              },
            ],
          },
          {
            id: 'revenue-by-entity',
            type: 'custom',
            component: 'RevenueByEntityChart',
            title: 'Revenue by Entity (US / Canada)',
            span: 'half',
          },
          {
            id: 'cash-position',
            type: 'custom',
            component: 'CashPositionWidget',
            title: 'Cash Position',
            span: 'half',
          },
          {
            id: 'ar-aging-summary',
            type: 'custom',
            component: 'ARAgingSummary',
            title: 'AR Aging Summary',
            span: 'half',
          },
          {
            id: 'fx-rates',
            type: 'info-card',
            title: 'FX Rates (USD/CAD)',
            span: 'half',
            fields: [
              { id: 'spot', label: 'Spot Rate', path: 'fx.spotRate' },
              { id: 'avg', label: 'MTD Average', path: 'fx.mtdAverage' },
              { id: 'gain-loss', label: 'FX Gain/Loss (MTD)', path: 'fx.gainLoss', format: 'currency' },
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
        icon: 'wallet',
        badge: { type: 'field', path: 'commissions.pendingCount' },
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
                format: 'currency',
                icon: 'clock',
              },
              {
                id: 'approved-mtd',
                label: 'Approved MTD',
                value: { type: 'field', path: 'commissions.approvedMTD' },
                format: 'currency',
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
                format: 'percentage',
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
            columns: [
              {
                id: 'recruiter',
                header: 'Recruiter',
                field: 'recruiterName',
                type: 'user',
              },
              {
                id: 'placement',
                header: 'Placement',
                field: 'placementTitle',
                type: 'link',
                linkPattern: '/employee/placements/{{placementId}}',
              },
              {
                id: 'client',
                header: 'Client',
                field: 'clientName',
                type: 'text',
              },
              {
                id: 'amount',
                header: 'Amount',
                field: 'amount',
                type: 'currency',
              },
              {
                id: 'type',
                header: 'Type',
                field: 'commissionType',
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
                actions: [
                  {
                    id: 'approve',
                    label: 'Approve',
                    icon: 'check',
                    variant: 'success',
                    action: { type: 'mutation', mutation: 'commissions.approve' },
                  },
                  {
                    id: 'review',
                    label: 'Review',
                    icon: 'eye',
                    action: { type: 'navigate', path: '/finance/commissions/{{id}}' },
                  },
                ],
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
        icon: 'file-text',
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
                format: 'currency',
              },
              {
                id: 'ar-current',
                label: 'Current (<30 days)',
                value: { type: 'field', path: 'ar.current' },
                format: 'currency',
                color: 'success',
              },
              {
                id: 'ar-overdue',
                label: 'Overdue (>30 days)',
                value: { type: 'field', path: 'ar.overdue' },
                format: 'currency',
                color: 'warning',
              },
              {
                id: 'ar-critical',
                label: 'Critical (>90 days)',
                value: { type: 'field', path: 'ar.critical' },
                format: 'currency',
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
            span: 'half',
          },
          {
            id: 'collections-trend',
            type: 'custom',
            component: 'CollectionsTrendChart',
            title: 'Collections Trend (12 Months)',
            span: 'half',
          },
          {
            id: 'overdue-invoices',
            type: 'table',
            title: 'Overdue Invoices Requiring Action',
            dataSource: {
              type: 'field',
              path: 'ar.overdueInvoices',
            },
            columns: [
              {
                id: 'invoice',
                header: 'Invoice #',
                field: 'invoiceNumber',
                type: 'link',
                linkPattern: '/finance/invoices/{{id}}',
              },
              {
                id: 'client',
                header: 'Client',
                field: 'clientName',
                type: 'text',
              },
              {
                id: 'amount',
                header: 'Amount',
                field: 'amount',
                type: 'currency',
              },
              {
                id: 'currency',
                header: 'Currency',
                field: 'currency',
                type: 'badge',
                options: [
                  { value: 'USD', label: 'USD', color: 'info' },
                  { value: 'CAD', label: 'CAD', color: 'secondary' },
                ],
              },
              {
                id: 'dueDate',
                header: 'Due Date',
                field: 'dueDate',
                type: 'date',
              },
              {
                id: 'daysOverdue',
                header: 'Days Overdue',
                field: 'daysOverdue',
                type: 'number',
                highlight: {
                  condition: { operator: 'gt', field: 'daysOverdue', value: 60 },
                  color: 'destructive',
                },
              },
              {
                id: 'status',
                header: 'Status',
                field: 'collectionStatus',
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
        icon: 'globe',
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
            span: 'full',
          },
          {
            id: 'fx-gain-loss',
            type: 'custom',
            component: 'FXGainLossChart',
            title: 'FX Gain/Loss by Month',
            span: 'half',
          },
          {
            id: 'intercompany',
            type: 'table',
            title: 'Intercompany Transactions',
            description: 'US ↔ Canada transactions requiring reconciliation',
            span: 'half',
            dataSource: {
              type: 'field',
              path: 'currency.intercompany',
            },
            columns: [
              {
                id: 'description',
                header: 'Description',
                field: 'description',
                type: 'text',
              },
              {
                id: 'from',
                header: 'From',
                field: 'fromEntity',
                type: 'text',
              },
              {
                id: 'to',
                header: 'To',
                field: 'toEntity',
                type: 'text',
              },
              {
                id: 'amount',
                header: 'Amount',
                field: 'amount',
                type: 'currency',
              },
              {
                id: 'status',
                header: 'Status',
                field: 'status',
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
        icon: 'trending-up',
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
                format: 'percentage',
                target: 25,
              },
              {
                id: 'margin-per-hour',
                label: 'Avg Margin/Hour',
                value: { type: 'field', path: 'margins.avgMarginPerHour' },
                format: 'currency',
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
            span: 'half',
          },
          {
            id: 'margin-by-client',
            type: 'custom',
            component: 'MarginByClientChart',
            title: 'Top 10 Clients by Margin',
            span: 'half',
          },
          {
            id: 'margin-distribution',
            type: 'custom',
            component: 'MarginDistributionChart',
            title: 'Margin Distribution',
            span: 'full',
          },
          {
            id: 'low-margin-placements',
            type: 'table',
            title: 'Low Margin Placements (<15%)',
            dataSource: {
              type: 'field',
              path: 'margins.lowMarginPlacements',
            },
            columns: [
              {
                id: 'placement',
                header: 'Placement',
                field: 'title',
                type: 'link',
                linkPattern: '/employee/placements/{{id}}',
              },
              {
                id: 'client',
                header: 'Client',
                field: 'clientName',
                type: 'text',
              },
              {
                id: 'bill-rate',
                header: 'Bill Rate',
                field: 'billRate',
                type: 'currency',
              },
              {
                id: 'pay-rate',
                header: 'Pay Rate',
                field: 'payRate',
                type: 'currency',
              },
              {
                id: 'margin',
                header: 'Margin',
                field: 'margin',
                type: 'percentage',
                highlight: {
                  condition: { operator: 'lt', field: 'margin', value: 10 },
                  color: 'destructive',
                },
              },
              {
                id: 'monthly-revenue',
                header: 'Monthly Revenue',
                field: 'monthlyRevenue',
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
        icon: 'calendar-check',
        sections: [
          {
            id: 'close-status',
            type: 'custom',
            component: 'MonthEndCloseChecklist',
            title: 'Close Checklist',
            span: 'full',
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
                format: 'number',
                suffix: ' of 5',
              },
              {
                id: 'tasks-complete',
                label: 'Tasks Complete',
                value: { type: 'field', path: 'close.tasksComplete' },
                format: 'percentage',
              },
              {
                id: 'revenue-recognized',
                label: 'Revenue Recognized',
                value: { type: 'field', path: 'close.revenueRecognized' },
                format: 'currency',
              },
              {
                id: 'pending-accruals',
                label: 'Pending Accruals',
                value: { type: 'field', path: 'close.pendingAccruals' },
                format: 'number',
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
            columns: [
              {
                id: 'entry',
                header: 'Entry',
                field: 'description',
                type: 'text',
              },
              {
                id: 'amount',
                header: 'Amount',
                field: 'amount',
                type: 'currency',
              },
              {
                id: 'preparedBy',
                header: 'Prepared By',
                field: 'preparedByName',
                type: 'user',
              },
              {
                id: 'status',
                header: 'Status',
                field: 'status',
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
                    action: { type: 'mutation', mutation: 'finance.approveJournalEntry' },
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
      label: 'Export Financials',
      icon: 'download',
      action: { type: 'modal', modalId: 'export-financials' },
      position: 'header',
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: 'refresh-cw',
      action: { type: 'refresh' },
      position: 'header',
    },
  ],
  
  keyboardShortcuts: [
    { key: 'g f', action: 'navigate:/finance/dashboard', description: 'Go to CFO Dashboard' },
    { key: 'g c', action: 'tab:commissions', description: 'Go to Commissions' },
    { key: 'g i', action: 'tab:invoicing', description: 'Go to Invoicing' },
    { key: 'g m', action: 'tab:margins', description: 'Go to Margin Analysis' },
    { key: 'a', action: 'approve-selected', description: 'Approve selected item' },
    { key: 'r', action: 'refresh', description: 'Refresh data' },
  ],
};

