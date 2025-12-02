/**
 * Accounts Receivable Dashboard Screen Definition
 *
 * AR aging, collections, and payment tracking for CFO.
 *
 * @see docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const arDashboardScreen: ScreenDefinition = {
  id: 'ar-dashboard',
  type: 'dashboard',
  title: 'Accounts Receivable Dashboard',
  subtitle: 'AR aging, collections, and payment tracking',
  icon: 'FileText',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'finance.getARDashboard',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // AR Summary KPIs
      {
        id: 'ar-kpis',
        type: 'metrics-grid',
        title: 'AR Summary',
        columns: 5,
        fields: [
          {
            id: 'total-ar',
            label: 'Total AR',
            type: 'currency',
            path: 'summary.totalAR',
            config: { icon: 'DollarSign' },
          },
          {
            id: 'current',
            label: 'Current',
            type: 'currency',
            path: 'aging.current',
            config: { icon: 'CheckCircle' },
          },
          {
            id: 'overdue-30',
            label: '1-30 Days',
            type: 'currency',
            path: 'aging.days30',
            config: { icon: 'Clock' },
          },
          {
            id: 'overdue-60',
            label: '31-60 Days',
            type: 'currency',
            path: 'aging.days60',
            config: { icon: 'AlertCircle', thresholds: { warning: 50000 } },
          },
          {
            id: 'overdue-90plus',
            label: '90+ Days',
            type: 'currency',
            path: 'aging.days90Plus',
            config: { icon: 'AlertTriangle', thresholds: { warning: 10000, critical: 25000 } },
          },
        ],
      },

      // AR Aging Summary Chart
      {
        id: 'ar-aging-chart',
        type: 'custom',
        component: 'ARAgingSummaryChart',
        title: 'AR Aging Distribution',
        config: {
          buckets: [
            { id: 'current', label: 'Current', color: '#10b981' },
            { id: '1-30', label: '1-30 Days', color: '#3b82f6' },
            { id: '31-60', label: '31-60 Days', color: '#f59e0b' },
            { id: '61-90', label: '61-90 Days', color: '#f97316' },
            { id: '90+', label: '90+ Days', color: '#ef4444' },
          ],
          chartType: 'stacked-bar',
          height: 300,
        },
      },

      // DSO Trend
      {
        id: 'dso-trend',
        type: 'custom',
        component: 'DSOTrendChart',
        title: 'DSO Trend (12 Months)',
        config: {
          target: 45,
          height: 280,
        },
      },

      // AR by Client
      {
        id: 'ar-by-client',
        type: 'table',
        title: 'AR by Client (Top Debtors)',
        icon: 'Building2',
        dataSource: {
          type: 'field',
          path: 'byClient',
        },
        columns_config: [
          { id: 'client', header: 'Client', path: 'clientName', type: 'text', sortable: true },
          { id: 'total-ar', header: 'Total AR', path: 'totalAR', type: 'currency', sortable: true },
          { id: 'current', header: 'Current', path: 'current', type: 'currency' },
          { id: 'overdue', header: 'Overdue', path: 'overdue', type: 'currency' },
          { id: 'oldest-invoice', header: 'Oldest Invoice', path: 'oldestInvoiceAge', type: 'number', config: { suffix: ' days' } },
          { id: 'credit-limit', header: 'Credit Limit', path: 'creditLimit', type: 'currency' },
          { id: 'payment-terms', header: 'Terms', path: 'paymentTerms', type: 'text' },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },

      // Collection Queue
      {
        id: 'collection-queue',
        type: 'table',
        title: 'Collection Queue',
        icon: 'Phone',
        dataSource: {
          type: 'field',
          path: 'collectionQueue',
        },
        columns_config: [
          { id: 'invoice', header: 'Invoice #', path: 'invoiceNumber', type: 'text' },
          { id: 'client', header: 'Client', path: 'clientName', type: 'text' },
          { id: 'amount', header: 'Amount', path: 'amount', type: 'currency' },
          { id: 'due-date', header: 'Due Date', path: 'dueDate', type: 'date' },
          { id: 'days-overdue', header: 'Days Overdue', path: 'daysOverdue', type: 'number' },
          {
            id: 'status',
            header: 'Status',
            path: 'collectionStatus',
            type: 'enum',
            config: {
              options: [
                { value: 'pending', label: 'Pending' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'promised', label: 'Promised' },
                { value: 'disputed', label: 'Disputed' },
                { value: 'escalated', label: 'Escalated' },
              ],
              badgeColors: {
                pending: 'gray',
                contacted: 'blue',
                promised: 'green',
                disputed: 'red',
                escalated: 'orange',
              },
            },
          },
          { id: 'last-contact', header: 'Last Contact', path: 'lastContactDate', type: 'date' },
          { id: 'notes', header: 'Notes', path: 'notes', type: 'text' },
        ],
        actions: [
          {
            id: 'send-reminder',
            type: 'mutation',
            label: 'Send Reminder',
            icon: 'Mail',
            config: { type: 'mutation', procedure: 'finance.sendCollectionReminder' },
          },
          {
            id: 'log-contact',
            type: 'modal',
            label: 'Log Contact',
            icon: 'Phone',
            config: { type: 'modal', modal: 'LogCollectionContactModal' },
          },
          {
            id: 'escalate',
            type: 'modal',
            label: 'Escalate',
            icon: 'AlertTriangle',
            config: { type: 'modal', modal: 'EscalateCollectionModal' },
          },
        ],
        pagination: { enabled: true, pageSize: 15 },
      },

      // Payment History
      {
        id: 'payment-history',
        type: 'table',
        title: 'Recent Payments',
        icon: 'CreditCard',
        collapsible: true,
        dataSource: {
          type: 'field',
          path: 'recentPayments',
        },
        columns_config: [
          { id: 'payment-date', header: 'Date', path: 'paymentDate', type: 'date', sortable: true },
          { id: 'client', header: 'Client', path: 'clientName', type: 'text' },
          { id: 'amount', header: 'Amount', path: 'amount', type: 'currency' },
          { id: 'method', header: 'Method', path: 'paymentMethod', type: 'text' },
          { id: 'invoices-paid', header: 'Invoices Paid', path: 'invoiceCount', type: 'number' },
          { id: 'reference', header: 'Reference', path: 'reference', type: 'text' },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },

      // Collection Metrics
      {
        id: 'collection-metrics',
        type: 'info-card',
        title: 'Collection Performance',
        icon: 'Target',
        fields: [
          { id: 'collection-rate', label: 'Collection Rate (MTD)', type: 'percentage', path: 'metrics.collectionRateMTD' },
          { id: 'avg-days-to-pay', label: 'Avg Days to Pay', type: 'number', path: 'metrics.avgDaysToPay' },
          { id: 'collected-mtd', label: 'Collected MTD', type: 'currency', path: 'metrics.collectedMTD' },
          { id: 'write-offs-ytd', label: 'Write-offs YTD', type: 'currency', path: 'metrics.writeOffsYTD' },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'generate-statements',
      type: 'modal',
      label: 'Generate Statements',
      icon: 'FileText',
      variant: 'primary',
      config: { type: 'modal', modal: 'GenerateStatementsModal' },
    },
    {
      id: 'export',
      type: 'modal',
      label: 'Export AR Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportARReportModal' },
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
      { label: 'AR Dashboard' },
    ],
  },
};
