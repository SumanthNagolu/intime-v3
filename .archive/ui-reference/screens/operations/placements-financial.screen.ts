/**
 * Placements Financial View Screen Definition
 *
 * Financial perspective on all placements for CFO analysis.
 *
 * @see docs/specs/20-USER-ROLES/07-cfo/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const placementsFinancialScreen: ScreenDefinition = {
  id: 'placements-financial',
  type: 'list',
  title: 'Placements Financial View',
  subtitle: 'Financial analysis of active and historical placements',
  icon: 'Briefcase',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'finance.getPlacementsFinancial',
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Summary KPIs
      {
        id: 'placement-financial-kpis',
        type: 'metrics-grid',
        title: 'Placement Financial Summary',
        columns: 5,
        fields: [
          {
            id: 'active-placements',
            label: 'Active Placements',
            type: 'number',
            path: 'summary.activePlacements',
            config: { icon: 'Users' },
          },
          {
            id: 'monthly-revenue',
            label: 'Monthly Revenue Run Rate',
            type: 'currency',
            path: 'summary.monthlyRevenueRunRate',
            config: { icon: 'TrendingUp' },
          },
          {
            id: 'total-margin',
            label: 'Total Margin (Monthly)',
            type: 'currency',
            path: 'summary.totalMonthlyMargin',
            config: { icon: 'DollarSign' },
          },
          {
            id: 'avg-margin',
            label: 'Avg Margin %',
            type: 'percentage',
            path: 'summary.avgMarginPercent',
            config: { target: 25 },
          },
          {
            id: 'commission-obligations',
            label: 'Commission Obligations',
            type: 'currency',
            path: 'summary.commissionObligations',
            config: { icon: 'Wallet' },
          },
        ],
      },

      // Projected Revenue
      {
        id: 'projected-revenue',
        type: 'custom',
        component: 'ProjectedRevenueChart',
        title: 'Projected Revenue (Next 6 Months)',
        config: {
          height: 300,
          showExtensions: true,
          showEndDates: true,
        },
      },

      // Active Placements Table
      {
        id: 'active-placements-table',
        type: 'table',
        title: 'Active Placements with Revenue',
        icon: 'Users',
        dataSource: {
          type: 'field',
          path: 'activePlacements',
        },
        columns_config: [
          {
            id: 'consultant',
            header: 'Consultant',
            path: 'consultantName',
            type: 'text',
            sortable: true,
          },
          {
            id: 'client',
            header: 'Client',
            path: 'clientName',
            type: 'text',
            sortable: true,
          },
          {
            id: 'job-title',
            header: 'Position',
            path: 'jobTitle',
            type: 'text',
          },
          {
            id: 'start-date',
            header: 'Start Date',
            path: 'startDate',
            type: 'date',
          },
          {
            id: 'end-date',
            header: 'End Date',
            path: 'endDate',
            type: 'date',
          },
          {
            id: 'bill-rate',
            header: 'Bill Rate',
            path: 'billRate',
            type: 'currency',
            sortable: true,
          },
          {
            id: 'pay-rate',
            header: 'Pay Rate',
            path: 'payRate',
            type: 'currency',
          },
          {
            id: 'margin-pct',
            header: 'Margin %',
            path: 'marginPercent',
            type: 'percentage',
            sortable: true,
          },
          {
            id: 'weekly-revenue',
            header: 'Weekly Rev',
            path: 'weeklyRevenue',
            type: 'currency',
          },
          {
            id: 'mtd-revenue',
            header: 'MTD Revenue',
            path: 'mtdRevenue',
            type: 'currency',
            sortable: true,
          },
          {
            id: 'status',
            header: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: [
                { value: 'active', label: 'Active' },
                { value: 'ending_soon', label: 'Ending Soon' },
                { value: 'extended', label: 'Extended' },
                { value: 'on_hold', label: 'On Hold' },
              ],
              badgeColors: {
                active: 'green',
                ending_soon: 'yellow',
                extended: 'blue',
                on_hold: 'gray',
              },
            },
          },
        ],
        actions: [
          {
            id: 'view-placement',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
            config: { type: 'navigate', route: '/employee/placements/${id}' },
          },
        ],
        pagination: { enabled: true, pageSize: 20 },
      },

      // Extension Impact
      {
        id: 'extension-impact',
        type: 'info-card',
        title: 'Extension Impact Analysis',
        icon: 'Calendar',
        fields: [
          { id: 'placements-ending-30', label: 'Ending in 30 Days', type: 'number', path: 'extensions.ending30Days' },
          { id: 'revenue-at-risk', label: 'Revenue at Risk', type: 'currency', path: 'extensions.revenueAtRisk' },
          { id: 'extension-rate', label: 'Historical Extension Rate', type: 'percentage', path: 'extensions.historicalExtensionRate' },
          { id: 'projected-extensions', label: 'Projected Extensions', type: 'number', path: 'extensions.projectedExtensions' },
        ],
      },

      // Margin Summary by Category
      {
        id: 'margin-summary',
        type: 'table',
        title: 'Margin Summary by Category',
        icon: 'PieChart',
        dataSource: {
          type: 'field',
          path: 'marginByCategory',
        },
        columns_config: [
          { id: 'category', header: 'Category', path: 'category', type: 'text' },
          { id: 'placement-count', header: 'Placements', path: 'placementCount', type: 'number' },
          { id: 'total-revenue', header: 'Total Revenue (Monthly)', path: 'totalMonthlyRevenue', type: 'currency' },
          { id: 'total-margin', header: 'Total Margin (Monthly)', path: 'totalMonthlyMargin', type: 'currency' },
          { id: 'avg-margin', header: 'Avg Margin %', path: 'avgMarginPercent', type: 'percentage' },
        ],
      },

      // Commission Obligations
      {
        id: 'commission-obligations',
        type: 'table',
        title: 'Commission Obligations',
        icon: 'Wallet',
        collapsible: true,
        dataSource: {
          type: 'field',
          path: 'commissionObligations',
        },
        columns_config: [
          { id: 'recruiter', header: 'Recruiter', path: 'recruiterName', type: 'text' },
          { id: 'placement', header: 'Placement', path: 'placementTitle', type: 'text' },
          { id: 'commission-type', header: 'Type', path: 'commissionType', type: 'text' },
          { id: 'amount', header: 'Amount', path: 'amount', type: 'currency' },
          { id: 'status', header: 'Status', path: 'status', type: 'enum', config: { options: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'paid', label: 'Paid' }] } },
          { id: 'due-date', header: 'Due Date', path: 'dueDate', type: 'date' },
        ],
        pagination: { enabled: true, pageSize: 10 },
      },
    ],
  },

  actions: [
    {
      id: 'export',
      type: 'modal',
      label: 'Export Report',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'modal', modal: 'ExportPlacementsReportModal' },
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
      { label: 'Placements Financial' },
    ],
  },
};
