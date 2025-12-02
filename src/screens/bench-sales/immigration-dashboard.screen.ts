/**
 * Immigration Dashboard Screen
 *
 * Per 08-track-immigration.md:
 * - Active Cases tab
 * - Alerts panel with expiration warnings
 * - Attorney directory
 *
 * Color coding per Section 8.4:
 * - Green (181+ days): Routine monitoring
 * - Yellow (90-180 days): Start renewal planning
 * - Orange (30-90 days): Initiate renewal process
 * - Red (<30 days): Escalate, stop submissions
 * - Black (expired): Cannot work
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/08-track-immigration.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

// ==========================================
// OPTIONS
// ==========================================

const CASE_TYPE_OPTIONS = [
  { value: 'h1b_initial', label: 'H-1B Initial' },
  { value: 'h1b_transfer', label: 'H-1B Transfer' },
  { value: 'h1b_extension', label: 'H-1B Extension' },
  { value: 'h1b_amendment', label: 'H-1B Amendment' },
  { value: 'gc_perm', label: 'Green Card - PERM' },
  { value: 'gc_i140', label: 'Green Card - I-140' },
  { value: 'gc_i485', label: 'Green Card - I-485' },
  { value: 'opt_extension', label: 'OPT Extension' },
  { value: 'ead_renewal', label: 'EAD Renewal' },
  { value: 'l1_extension', label: 'L-1 Extension' },
];

const CASE_STATUS_OPTIONS = [
  { value: 'pending_filing', label: 'Pending Filing' },
  { value: 'filed', label: 'Filed' },
  { value: 'receipt_received', label: 'Receipt Received' },
  { value: 'rfe_received', label: 'RFE Received' },
  { value: 'rfe_responded', label: 'RFE Responded' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const ALERT_LEVEL_OPTIONS = [
  { value: 'green', label: 'Green (181+ days)' },
  { value: 'yellow', label: 'Yellow (90-180 days)' },
  { value: 'orange', label: 'Orange (30-90 days)' },
  { value: 'red', label: 'Red (<30 days)' },
  { value: 'black', label: 'Expired' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const casesTableColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'alertLevel',
    label: '',
    path: 'alertLevel',
    type: 'custom',
    width: '40px',
    config: { component: 'VisaAlertIndicator' },
  },
  {
    id: 'consultant',
    label: 'Consultant',
    path: 'consultant.fullName',
    type: 'text',
    sortable: true,
    width: '180px',
    config: {
      link: true,
      linkPath: '/employee/workspace/bench/consultants/{{consultantId}}',
    },
  },
  {
    id: 'caseType',
    label: 'Case Type',
    path: 'caseType',
    type: 'enum',
    sortable: true,
    config: {
      options: CASE_TYPE_OPTIONS,
    },
  },
  {
    id: 'currentVisa',
    label: 'Current Visa',
    path: 'consultant.visaStatus',
    type: 'enum',
  },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: CASE_STATUS_OPTIONS,
      badgeColors: {
        pending_filing: 'gray',
        filed: 'blue',
        receipt_received: 'blue',
        rfe_received: 'orange',
        rfe_responded: 'yellow',
        approved: 'green',
        denied: 'red',
        withdrawn: 'gray',
      },
    },
  },
  {
    id: 'priorityDate',
    label: 'Priority Date',
    path: 'priorityDate',
    type: 'date',
    sortable: true,
  },
  {
    id: 'expiryDate',
    label: 'Expiry Date',
    path: 'expiryDate',
    type: 'date',
    sortable: true,
    config: {
      warnIfWithin: 90,
      criticalIfWithin: 30,
    },
  },
  {
    id: 'attorney',
    label: 'Attorney',
    path: 'attorney.name',
    type: 'text',
  },
  {
    id: 'nextMilestone',
    label: 'Next Milestone',
    path: 'nextMilestone',
    type: 'text',
  },
  {
    id: 'daysRemaining',
    label: 'Days Left',
    path: 'daysRemaining',
    type: 'number',
    sortable: true,
    config: {
      colorCode: true,
      thresholds: [
        { max: 30, color: 'red' },
        { max: 90, color: 'orange' },
        { max: 180, color: 'yellow' },
        { min: 181, color: 'green' },
      ],
    },
  },
];

const alertsTableColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'alertLevel',
    label: 'Level',
    path: 'alertLevel',
    type: 'enum',
    width: '100px',
    config: {
      options: ALERT_LEVEL_OPTIONS,
      badgeColors: {
        green: 'green',
        yellow: 'yellow',
        orange: 'orange',
        red: 'red',
        black: 'gray',
      },
    },
  },
  {
    id: 'consultant',
    label: 'Consultant',
    path: 'consultant.fullName',
    type: 'text',
  },
  {
    id: 'visaType',
    label: 'Visa',
    path: 'consultant.visaStatus',
    type: 'enum',
  },
  {
    id: 'expiryDate',
    label: 'Expiry',
    path: 'expiryDate',
    type: 'date',
  },
  {
    id: 'daysRemaining',
    label: 'Days Left',
    path: 'daysRemaining',
    type: 'number',
  },
  {
    id: 'actionRequired',
    label: 'Action Required',
    path: 'actionRequired',
    type: 'text',
  },
];

const attorneysTableColumns: import('@/lib/metadata/types').TableColumnDefinition[] = [
  {
    id: 'name',
    label: 'Attorney Name',
    path: 'name',
    type: 'text',
    sortable: true,
  },
  {
    id: 'firm',
    label: 'Law Firm',
    path: 'firm',
    type: 'text',
  },
  {
    id: 'email',
    label: 'Email',
    path: 'email',
    type: 'email',
  },
  {
    id: 'phone',
    label: 'Phone',
    path: 'phone',
    type: 'phone',
  },
  {
    id: 'activeCases',
    label: 'Active Cases',
    path: 'activeCaseCount',
    type: 'number',
    sortable: true,
  },
  {
    id: 'specializations',
    label: 'Specializations',
    path: 'specializations',
    type: 'tags',
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const immigrationDashboardScreen: ScreenDefinition = {
  id: 'immigration-dashboard',
  type: 'dashboard',

  title: 'Immigration Dashboard',
  subtitle: 'Track visa status and immigration cases',
  icon: 'Globe',

  layout: {
    type: 'tabs',
    defaultTab: 'alerts',
    tabs: [
      // Alerts Tab (Priority view)
      {
        id: 'alerts',
        label: 'Alerts',
        icon: 'AlertTriangle',
        badge: { type: 'count', path: 'stats.criticalAlerts' },
        sections: [
          // Alert Summary
          {
            id: 'alert-summary',
            type: 'metrics-grid',
            columns: 4,
            fields: [
              {
                id: 'critical',
                label: 'Critical (<30 days)',
                type: 'number',
                path: 'stats.critical',
                config: { variant: 'danger' },
              },
              {
                id: 'urgent',
                label: 'Urgent (30-90 days)',
                type: 'number',
                path: 'stats.urgent',
                config: { variant: 'warning' },
              },
              {
                id: 'warning',
                label: 'Warning (90-180 days)',
                type: 'number',
                path: 'stats.warning',
                config: { variant: 'info' },
              },
              {
                id: 'expired',
                label: 'Expired',
                type: 'number',
                path: 'stats.expired',
                config: { variant: 'muted' },
              },
              {
                id: 'rfesPending',
                label: 'RFEs Pending',
                type: 'number',
                path: 'stats.rfesPending',
                config: { variant: 'warning' },
              },
            ],
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.immigration.getAlertStats',
              },
            },
          },

          // Alert Color Legend
          {
            id: 'alert-legend',
            type: 'custom',
            component: 'ImmigrationAlertLegend',
            componentProps: {
              levels: [
                { id: 'green', label: 'Green (181+ days)', color: 'green', action: 'Routine monitoring' },
                { id: 'yellow', label: 'Yellow (90-180 days)', color: 'yellow', action: 'Start renewal planning' },
                { id: 'orange', label: 'Orange (30-90 days)', color: 'orange', action: 'Initiate renewal process' },
                { id: 'red', label: 'Red (<30 days)', color: 'red', action: 'Escalate, stop submissions' },
                { id: 'black', label: 'Expired', color: 'gray', action: 'Cannot work' },
              ],
            },
          },

          // Alerts Table
          {
            id: 'alerts-table',
            type: 'table',
            title: 'Visa Expiration Alerts',
            columns_config: alertsTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.immigration.getAlerts',
              },
            },
            actions: [
              {
                id: 'view-consultant',
                label: 'View Consultant',
                icon: 'Eye',
                type: 'navigate',
                config: { type: 'navigate', route: '/employee/workspace/bench/consultants/{{consultantId}}' },
              },
              {
                id: 'create-case',
                label: 'Create Case',
                icon: 'Plus',
                type: 'modal',
                config: { type: 'modal', modal: 'create-immigration-case', props: { consultantId: '{{consultantId}}' } },
              },
              {
                id: 'contact-hr',
                label: 'Contact HR',
                icon: 'Mail',
                type: 'modal',
                config: { type: 'modal', modal: 'contact-hr', props: { consultantId: '{{consultantId}}' } },
              },
            ],
          },
        ],
      },

      // Active Cases Tab
      {
        id: 'cases',
        label: 'Active Cases',
        icon: 'FileText',
        badge: { type: 'count', path: 'stats.activeCases' },
        sections: [
          // Case Filters
          {
            id: 'case-filters',
            type: 'form',
            inline: true,
            fields: [
              {
                id: 'search',
                type: 'text',
                path: 'filters.search',
                placeholder: 'Search cases...',
                config: { icon: 'Search' },
              },
              {
                id: 'caseType',
                label: 'Case Type',
                type: 'multiselect',
                path: 'filters.caseType',
                options: CASE_TYPE_OPTIONS,
              },
              {
                id: 'status',
                label: 'Status',
                type: 'multiselect',
                path: 'filters.status',
                options: CASE_STATUS_OPTIONS,
              },
              {
                id: 'alertLevel',
                label: 'Alert Level',
                type: 'multiselect',
                path: 'filters.alertLevel',
                options: ALERT_LEVEL_OPTIONS,
              },
            ],
          },

          // Cases Table
          {
            id: 'cases-table',
            type: 'table',
            title: 'Immigration Cases',
            columns_config: casesTableColumns,
            selectable: true,
            pagination: { defaultPageSize: 25 },
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.immigration.getCases',
              },
            },
            rowClick: {
              type: 'navigate',
              route: '/employee/workspace/bench/immigration/{{id}}',
            },
            actions: [
              {
                id: 'view',
                label: 'View Case',
                icon: 'Eye',
                type: 'navigate',
                config: { type: 'navigate', route: '/employee/workspace/bench/immigration/{{id}}' },
              },
              {
                id: 'update-status',
                label: 'Update Status',
                icon: 'RefreshCw',
                type: 'modal',
                config: { type: 'modal', modal: 'update-case-status', props: { caseId: '{{id}}' } },
              },
              {
                id: 'add-milestone',
                label: 'Add Milestone',
                icon: 'Plus',
                type: 'modal',
                config: { type: 'modal', modal: 'add-case-milestone', props: { caseId: '{{id}}' } },
              },
            ],
          },
        ],
      },

      // Attorneys Tab
      {
        id: 'attorneys',
        label: 'Attorneys',
        icon: 'Users',
        lazy: true,
        sections: [
          {
            id: 'attorneys-table',
            type: 'table',
            title: 'Attorney Directory',
            columns_config: attorneysTableColumns,
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'bench.immigration.getAttorneys',
              },
            },
            actions: [
              {
                id: 'add-attorney',
                label: 'Add Attorney',
                type: 'modal',
                icon: 'Plus',
                variant: 'primary',
                config: { type: 'modal', modal: 'add-attorney' },
              },
            ],
            rowActions: [
              {
                id: 'view-cases',
                label: 'View Cases',
                icon: 'FileText',
                type: 'navigate',
                config: { type: 'navigate', route: '/employee/workspace/bench/immigration?attorney={{id}}' },
              },
              {
                id: 'edit',
                label: 'Edit',
                icon: 'Edit',
                type: 'modal',
                config: { type: 'modal', modal: 'edit-attorney', props: { attorneyId: '{{id}}' } },
              },
              {
                id: 'contact',
                label: 'Contact',
                icon: 'Mail',
                type: 'modal',
                config: { type: 'modal', modal: 'contact-attorney', props: { attorneyId: '{{id}}' } },
              },
            ],
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'create-case',
      label: 'New Case',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'create-immigration-case' },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'custom', handler: 'exportImmigrationData' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Bench Sales', route: '/employee/workspace/bench' },
      { label: 'Immigration', active: true },
    ],
  },
};

export default immigrationDashboardScreen;
