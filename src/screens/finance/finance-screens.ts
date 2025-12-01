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
            dataSource: { type: 'aggregate', entityType: 'invoice', method: 'sum', field: 'amount', filter: { status: 'paid', date: 'current_year' } },
            config: { format: { type: 'currency' } }
          },
          {
            id: 'outstanding-invoices',
            type: 'metric-card',
            label: 'Outstanding',
            dataSource: { type: 'aggregate', entityType: 'invoice', method: 'sum', field: 'balance', filter: { status: 'sent' } },
            config: { format: { type: 'currency' }, bgColor: 'red-50', iconColor: 'red-500' }
          },
          {
            id: 'gross-margin',
            type: 'metric-card',
            label: 'Gross Margin',
            dataSource: { type: 'aggregate', entityType: 'placement', method: 'average', field: 'margin' },
            config: { format: { type: 'percentage' } }
          },
          {
            id: 'avg-dso',
            type: 'metric-card',
            label: 'DSO',
            dataSource: { type: 'aggregate', entityType: 'invoice', method: 'average_days_to_pay' },
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
  entityType: 'invoice', // Assuming invoice entity
  title: 'Invoices',
  icon: 'FileText',

  dataSource: {
    type: 'list',
    entityType: 'invoice',
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

