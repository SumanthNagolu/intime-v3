/**
 * Time Off List Screen Definition
 *
 * Metadata-driven screen for managing time off requests.
 *
 * Per docs/specs/20-USER-ROLES/05-hr/05-time-and-attendance.md
 */

import type { ScreenDefinition, TableColumnDefinition, TabDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const TIME_OFF_TYPE_OPTIONS = [
  { value: 'pto', label: 'PTO' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal' },
  { value: 'bereavement', label: 'Bereavement' },
  { value: 'jury_duty', label: 'Jury Duty' },
  { value: 'parental', label: 'Parental Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

const TIME_OFF_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const timeOffColumns: TableColumnDefinition[] = [
  {
    id: 'employee',
    label: 'Employee',
    path: 'employee.fullName',
    type: 'text',
    sortable: true,
    width: '200px',
    config: {
      avatar: { path: 'employee.avatarUrl', fallback: 'initials' },
      subtitle: { path: 'employee.department' },
    },
  },
  {
    id: 'type',
    label: 'Type',
    path: 'type',
    type: 'enum',
    sortable: true,
    config: {
      options: TIME_OFF_TYPE_OPTIONS,
      badgeColors: {
        pto: 'blue',
        sick: 'orange',
        personal: 'purple',
        bereavement: 'gray',
        jury_duty: 'cyan',
        parental: 'pink',
        unpaid: 'yellow',
      },
    },
  },
  { id: 'startDate', label: 'Start Date', path: 'startDate', type: 'date', sortable: true },
  { id: 'endDate', label: 'End Date', path: 'endDate', type: 'date', sortable: true },
  { id: 'days', label: 'Days', path: 'totalDays', type: 'number', sortable: true },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    sortable: true,
    config: {
      options: TIME_OFF_STATUS_OPTIONS,
      badgeColors: {
        pending: 'yellow',
        approved: 'green',
        denied: 'red',
        cancelled: 'gray',
      },
    },
  },
  { id: 'notes', label: 'Notes', path: 'notes', type: 'text' },
  { id: 'createdAt', label: 'Requested', path: 'createdAt', type: 'date', sortable: true, config: { format: 'relative' } },
];

// ==========================================
// TAB DEFINITIONS
// ==========================================

const pendingTab: TabDefinition = {
  id: 'pending',
  label: 'Pending Requests',
  icon: 'Clock',
  badge: { type: 'count', path: 'stats.pending', variant: 'warning' },
  sections: [
    {
      id: 'pending-table',
      type: 'table',
      columns_config: timeOffColumns,
      dataSource: {
        type: 'list',
        entityType: 'timeoff',
        filter: { status: 'pending' },
        sort: { field: 'startDate', direction: 'asc' },
      },
      emptyState: {
        title: 'No Pending Requests',
        description: 'All time off requests have been processed',
        icon: 'CheckCircle',
      },
      rowActions: [
        {
          id: 'approve',
          label: 'Approve',
          type: 'mutation',
          variant: 'primary',
          icon: 'Check',
          config: {
            type: 'mutation',
            procedure: 'hr.timeoff.approve',
            input: { id: { type: 'field', path: 'id' } },
          },
        },
        {
          id: 'deny',
          label: 'Deny',
          type: 'modal',
          variant: 'destructive',
          icon: 'X',
          config: {
            type: 'modal',
            modal: 'DenyTimeOffModal',
            props: { requestId: { type: 'field', path: 'id' } },
          },
        },
        {
          id: 'view-calendar',
          label: 'Check Calendar',
          type: 'modal',
          variant: 'outline',
          icon: 'Calendar',
          config: {
            type: 'modal',
            modal: 'TeamCalendarModal',
            props: {
              startDate: { type: 'field', path: 'startDate' },
              endDate: { type: 'field', path: 'endDate' },
              department: { type: 'field', path: 'employee.department' },
            },
          },
        },
      ],
    },
  ],
};

const approvedTab: TabDefinition = {
  id: 'approved',
  label: 'Approved',
  icon: 'CheckCircle',
  sections: [
    {
      id: 'approved-filters',
      type: 'form',
      inline: true,
      fields: [
        {
          id: 'dateRange',
          label: 'Date Range',
          type: 'date-range',
          path: 'filters.dateRange',
        },
        {
          id: 'department',
          label: 'Department',
          type: 'select',
          path: 'filters.department',
          config: { optionsSource: 'departments', placeholder: 'All Departments' },
        },
        {
          id: 'type',
          label: 'Type',
          type: 'multiselect',
          path: 'filters.type',
          options: TIME_OFF_TYPE_OPTIONS,
        },
      ],
    },
    {
      id: 'approved-table',
      type: 'table',
      columns_config: [
        ...timeOffColumns,
        { id: 'approvedBy', label: 'Approved By', path: 'approvedBy.fullName', type: 'text' },
        { id: 'approvedAt', label: 'Approved On', path: 'approvedAt', type: 'date' },
      ],
      dataSource: {
        type: 'list',
        entityType: 'timeoff',
        filter: { status: 'approved' },
        sort: { field: 'startDate', direction: 'desc' },
      },
    },
  ],
};

const historyTab: TabDefinition = {
  id: 'history',
  label: 'History',
  icon: 'History',
  sections: [
    {
      id: 'history-filters',
      type: 'form',
      inline: true,
      fields: [
        {
          id: 'search',
          label: 'Search',
          type: 'text',
          path: 'search',
          config: { placeholder: 'Search by employee name...' },
        },
        {
          id: 'dateRange',
          label: 'Date Range',
          type: 'date-range',
          path: 'filters.dateRange',
        },
        {
          id: 'status',
          label: 'Status',
          type: 'multiselect',
          path: 'filters.status',
          options: TIME_OFF_STATUS_OPTIONS,
        },
        {
          id: 'type',
          label: 'Type',
          type: 'multiselect',
          path: 'filters.type',
          options: TIME_OFF_TYPE_OPTIONS,
        },
      ],
    },
    {
      id: 'history-table',
      type: 'table',
      columns_config: [
        ...timeOffColumns,
        { id: 'processedBy', label: 'Processed By', path: 'processedBy.fullName', type: 'text' },
        { id: 'processedAt', label: 'Processed On', path: 'processedAt', type: 'date' },
        { id: 'denyReason', label: 'Reason', path: 'denyReason', type: 'text', visible: { field: 'status', operator: 'eq', value: 'denied' } },
      ],
      dataSource: {
        type: 'list',
        entityType: 'timeoff',
        sort: { field: 'createdAt', direction: 'desc' },
      },
      pagination: { enabled: true, defaultPageSize: 25 },
    },
  ],
};

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const timeoffListScreen: ScreenDefinition = {
  id: 'timeoff-list',
  type: 'list',
  entityType: 'timeoff',

  title: 'Time Off Requests',
  subtitle: 'Manage employee time off requests and approvals',
  icon: 'Calendar',

  // Layout with tabs
  layout: {
    type: 'tabs',
    defaultTab: 'pending',
    tabPosition: 'top',
    // Metrics section (shown on all tabs)
    header: {
      id: 'metrics',
      type: 'metrics-grid',
      columns: 4,
      fields: [
        { id: 'pending', label: 'Pending Approval', type: 'number', path: 'stats.pending' },
        { id: 'approved', label: 'Approved (Month)', type: 'number', path: 'stats.approvedThisMonth' },
        { id: 'totalDays', label: 'Total Days Taken', type: 'number', path: 'stats.totalDaysThisMonth' },
        { id: 'upcomingOut', label: 'Out This Week', type: 'number', path: 'stats.outThisWeek' },
      ],
      dataSource: {
        type: 'aggregate',
        entityType: 'timeoff',
      },
    },
    tabs: [pendingTab, approvedTab, historyTab],
  },

  // Header actions
  actions: [
    {
      id: 'request',
      label: 'Request Time Off',
      type: 'modal',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'RequestTimeOffModal',
      },
    },
    {
      id: 'calendar-view',
      label: 'Calendar View',
      type: 'navigate',
      variant: 'secondary',
      icon: 'CalendarDays',
      config: {
        type: 'navigate',
        route: '/employee/hr/time/calendar',
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      variant: 'secondary',
      icon: 'Download',
      config: {
        type: 'custom',
        handler: 'handleExportTimeOff',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Time Off' },
    ],
  },
};

export default timeoffListScreen;
