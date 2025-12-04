/**
 * Commission Dashboard Screen
 *
 * Per 00-OVERVIEW.md Section 6.1: Own commission view
 * - Earnings MTD/YTD
 * - Pending commissions
 * - Claims submitted
 * - Payment history
 * - Per-vendor commission breakdown (custom terms per vendor)
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

// ==========================================
// OPTIONS
// ==========================================

const COMMISSION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'disputed', label: 'Disputed' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const placementCommissionColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'consultant',
    label: 'Consultant',
    path: 'placement.consultant.fullName',
    type: 'text',
    sortable: true,
  },
  {
    id: 'vendor',
    label: 'Vendor',
    path: 'placement.vendor.name',
    type: 'text',
    sortable: true,
  },
  {
    id: 'client',
    label: 'End Client',
    path: 'placement.clientName',
    type: 'text',
  },
  {
    id: 'billRate',
    label: 'Bill Rate',
    path: 'placement.billRate',
    type: 'currency',
    config: { suffix: '/hr' },
  },
  {
    id: 'margin',
    label: 'Margin',
    path: 'placement.margin',
    type: 'currency',
    config: { suffix: '/hr' },
  },
  {
    id: 'hoursWorked',
    label: 'Hours (MTD)',
    path: 'hoursWorkedMtd',
    type: 'number',
  },
  {
    id: 'commissionMtd',
    label: 'Commission (MTD)',
    path: 'commissionMtd',
    type: 'currency',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    path: 'placement.status',
    type: 'enum',
    config: {
      badgeColors: {
        active: 'green',
        on_hold: 'yellow',
        completed: 'blue',
      },
    },
  },
];

const paymentHistoryColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'period',
    label: 'Period',
    path: 'period',
    type: 'text',
    sortable: true,
  },
  {
    id: 'placements',
    label: 'Placements',
    path: 'placementCount',
    type: 'number',
  },
  {
    id: 'grossAmount',
    label: 'Gross Amount',
    path: 'grossAmount',
    type: 'currency',
  },
  {
    id: 'deductions',
    label: 'Deductions',
    path: 'deductions',
    type: 'currency',
  },
  {
    id: 'netAmount',
    label: 'Net Amount',
    path: 'netAmount',
    type: 'currency',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: COMMISSION_STATUS_OPTIONS,
      badgeColors: {
        pending: 'yellow',
        approved: 'blue',
        paid: 'green',
        disputed: 'red',
      },
    },
  },
  {
    id: 'paidDate',
    label: 'Paid Date',
    path: 'paidDate',
    type: 'date',
  },
];

const vendorBreakdownColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'vendor',
    label: 'Vendor',
    path: 'vendor.name',
    type: 'text',
    sortable: true,
  },
  {
    id: 'activePlacements',
    label: 'Active Placements',
    path: 'activePlacementCount',
    type: 'number',
    sortable: true,
  },
  {
    id: 'commissionType',
    label: 'Commission Type',
    path: 'commissionType',
    type: 'text',
  },
  {
    id: 'commissionRate',
    label: 'Rate/Terms',
    path: 'commissionTerms',
    type: 'text',
  },
  {
    id: 'earnedMtd',
    label: 'Earned (MTD)',
    path: 'earnedMtd',
    type: 'currency',
    sortable: true,
  },
  {
    id: 'earnedYtd',
    label: 'Earned (YTD)',
    path: 'earnedYtd',
    type: 'currency',
    sortable: true,
  },
  {
    id: 'pending',
    label: 'Pending',
    path: 'pending',
    type: 'currency',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const commissionDashboardScreen: ScreenDefinition = {
  id: 'commission-dashboard',
  type: 'dashboard',

  title: 'My Commission',
  subtitle: 'Track earnings and commission payments',
  icon: 'DollarSign',

  layout: {
    type: 'single-column',
    sections: [
      // Summary Metrics
      {
        id: 'commission-summary',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          {
            id: 'earnedMtd',
            label: 'Earned (MTD)',
            type: 'currency',
            path: 'summary.earnedMtd',
            config: { trend: true, trendPath: 'summary.earnedMtdTrend' },
          },
          {
            id: 'earnedYtd',
            label: 'Earned (YTD)',
            type: 'currency',
            path: 'summary.earnedYtd',
          },
          {
            id: 'pending',
            label: 'Pending',
            type: 'currency',
            path: 'summary.pending',
            config: { variant: 'warning' },
          },
          {
            id: 'paidYtd',
            label: 'Paid (YTD)',
            type: 'currency',
            path: 'summary.paidYtd',
          },
          {
            id: 'activePlacements',
            label: 'Active Placements',
            type: 'number',
            path: 'summary.activePlacements',
          },
        ],
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.commission.getSummary',
          },
        },
      },

      // Earnings Chart
      {
        id: 'earnings-chart',
        type: 'custom',
        title: 'Earnings Trend',
        component: 'CommissionChart',
        componentProps: {
          chartType: 'bar',
          dataKey: 'earnings',
          xAxisKey: 'month',
          series: [
            { key: 'earned', label: 'Earned', color: 'green' },
            { key: 'paid', label: 'Paid', color: 'blue' },
          ],
          showLegend: true,
        },
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.commission.getEarningsTrend',
            params: { months: 12 },
          },
        },
      },

      // Active Placement Commissions
      {
        id: 'placement-commissions',
        type: 'table',
        title: 'Active Placement Commissions',
        columns_config: placementCommissionColumns,
        collapsible: true,
        defaultExpanded: true,
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.commission.getActivePlacementCommissions',
          },
        },
        rowClick: {
          type: 'navigate',
          route: '/employee/bench/placements/{{placementId}}',
        },
        emptyState: {
          title: 'No active placements',
          description: 'Commission from active placements will appear here',
        },
      },

      // Vendor Breakdown
      {
        id: 'vendor-breakdown',
        type: 'table',
        title: 'Commission by Vendor',
        description: 'Note: Commission terms are custom per vendor - no standard percentages',
        columns_config: vendorBreakdownColumns,
        collapsible: true,
        defaultExpanded: true,
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.commission.getVendorBreakdown',
          },
        },
        rowClick: {
          type: 'navigate',
          route: '/employee/bench/vendors/{{vendorId}}',
        },
      },

      // Payment History
      {
        id: 'payment-history',
        type: 'table',
        title: 'Payment History',
        columns_config: paymentHistoryColumns,
        collapsible: true,
        defaultExpanded: false,
        pagination: { defaultPageSize: 10 },
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'bench.commission.getPaymentHistory',
          },
        },
        actions: [
          {
            id: 'view-details',
            label: 'View Details',
            icon: 'Eye',
            type: 'modal',
            config: { type: 'modal', modal: 'commission-payment-detail', props: { paymentId: '{{id}}' } },
          },
          {
            id: 'download-statement',
            label: 'Download Statement',
            icon: 'Download',
            type: 'download',
            config: { type: 'download', url: '/api/bench/commission/{{id}}/statement', filename: 'commission-statement-{{period}}.pdf' },
          },
          {
            id: 'dispute',
            label: 'Dispute',
            icon: 'AlertCircle',
            type: 'modal',
            config: { type: 'modal', modal: 'dispute-commission', props: { paymentId: '{{id}}' } },
            visible: {
              type: 'condition',
              condition: { field: 'status', operator: 'in', value: ['pending', 'approved'] },
            },
          },
        ],
        emptyState: {
          title: 'No payment history',
          description: 'Commission payments will appear here',
        },
      },
    ],
  },

  actions: [
    {
      id: 'export',
      label: 'Export Report',
      type: 'custom',
      icon: 'Download',
      variant: 'default',
      config: { type: 'custom', handler: 'exportCommissionReport' },
    },
    {
      id: 'submit-claim',
      label: 'Submit Claim',
      type: 'modal',
      icon: 'Plus',
      variant: 'default',
      config: { type: 'modal', modal: 'submit-commission-claim' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/bench' },
      { label: 'Commission', active: true },
    ],
  },
};

export default commissionDashboardScreen;
