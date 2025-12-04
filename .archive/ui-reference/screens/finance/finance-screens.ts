import type { ScreenDefinition } from '@/lib/metadata/types';

export const financeDashboardScreen: ScreenDefinition = {
  id: 'finance-dashboard',
  type: 'dashboard',
  title: 'Finance Overview',
  icon: 'DollarSign',

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'financial-metrics',
        type: 'metrics-grid',
        columns: 4,
        widgets: [
          {
            id: 'total-revenue',
            type: 'metric-card',
            label: 'Total Revenue (YTD)',
            dataSource: { type: 'query' as const, query: 'finance.getTotalRevenue' },
            config: { format: { type: 'currency' } }
          },
          {
            id: 'outstanding-invoices',
            type: 'metric-card',
            label: 'Outstanding',
            dataSource: { type: 'query' as const, query: 'finance.getOutstandingBalance' },
            config: { format: { type: 'currency' }, bgColor: 'red-50', iconColor: 'red-500' }
          },
          {
            id: 'gross-margin',
            type: 'metric-card',
            label: 'Gross Margin',
            dataSource: { type: 'query' as const, query: 'finance.getGrossMargin' },
            config: { format: { type: 'percentage' } }
          },
          {
            id: 'avg-dso',
            type: 'metric-card',
            label: 'DSO',
            dataSource: { type: 'query' as const, query: 'finance.getAverageDSO' },
            config: { suffix: 'days' }
          }
        ]
      },
      {
        id: 'revenue-chart',
        type: 'custom', // Placeholder for chart
        title: 'Revenue Trend',
        component: 'RevenueChart'
      }
    ]
  }
};

export const invoiceListScreen: ScreenDefinition = {
  id: 'invoice-list',
  type: 'list',
  title: 'Invoices',
  icon: 'FileText',

  dataSource: {
    type: 'query',
    query: { procedure: 'finance.listInvoices' },
    pagination: true,
    sort: { field: 'issueDate', direction: 'desc' }
  },

  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'invoice-table',
        type: 'table',
        columns_config: [
          { id: 'number', header: 'Invoice #', path: 'invoiceNumber', sortable: true },
          { id: 'client', header: 'Client', path: 'account.name' },
          { id: 'date', header: 'Issue Date', path: 'issueDate', type: 'date' },
          { id: 'due', header: 'Due Date', path: 'dueDate', type: 'date' },
          { id: 'amount', header: 'Amount', path: 'totalAmount', type: 'currency-display' },
          { id: 'status', header: 'Status', path: 'status', type: 'status-badge' },
        ],
        actions: [
          { id: 'view', label: 'View', type: 'navigate', config: { type: 'navigate', route: 'invoice-detail', params: { id: { type: 'context', path: 'id' } } } },
          { id: 'download', label: 'PDF', type: 'download', config: { type: 'download', url: { type: 'context', path: 'pdfUrl' } } }
        ]
      }
    ]
  },

  actions: [
    {
      id: 'generate-invoice',
      label: 'Generate Invoice',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'generate-invoice-wizard' }
    }
  ]
};

