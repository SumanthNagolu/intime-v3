/**
 * Time Off List Screen Definition
 *
 * Metadata-driven screen for managing time off requests.
 */

import type { ScreenDefinition } from '@/lib/metadata';

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
// SCREEN DEFINITION
// ==========================================

export const timeoffListScreen: ScreenDefinition = {
  id: 'timeoff-list',
  type: 'list',
  entityType: 'timeoff',

  title: 'Time Off Requests',
  subtitle: 'Manage employee time off requests and approvals',
  icon: 'Calendar',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'timeoff',
    sort: { field: 'createdAt', direction: 'desc' },
    pagination: true,
    limit: 25,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Metrics row
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'pending', label: 'Pending Approval', type: 'number', path: 'stats.pending' },
          { id: 'approved', label: 'Approved (Month)', type: 'number', path: 'stats.approvedThisMonth' },
          { id: 'totalHours', label: 'Total Hours', type: 'number', path: 'stats.totalHoursThisMonth' },
          { id: 'upcomingOut', label: 'Out This Week', type: 'number', path: 'stats.outThisWeek' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'timeoff',
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        fields: [
          { id: 'search', label: 'Search', type: 'text', path: 'search', config: { placeholder: 'Search by employee name...' } },
          { id: 'status', label: 'Status', type: 'multiselect', path: 'filters.status', options: [...TIME_OFF_STATUS_OPTIONS] },
          { id: 'type', label: 'Type', type: 'multiselect', path: 'filters.type', options: [...TIME_OFF_TYPE_OPTIONS] },
        ],
      },
      // Table
      {
        id: 'timeoff-table',
        type: 'table',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
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
          { id: 'hours', label: 'Hours', path: 'hours', type: 'number', sortable: true },
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
          { id: 'approver', label: 'Approver', path: 'approver.fullName', type: 'text' },
          { id: 'createdAt', label: 'Requested', path: 'createdAt', type: 'date', sortable: true },
        ],
      },
    ],
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
        route: '/employee/hr/time-off/calendar',
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
        handler: 'handleExport',
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
