/**
 * Time Off Detail Screen Definition
 *
 * Metadata-driven screen for viewing individual time off request details.
 */

import type { ScreenDefinition, TabDefinition } from '@/lib/metadata';

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
// TAB DEFINITIONS
// ==========================================

const detailsTab: TabDefinition = {
  id: 'details',
  label: 'Details',
  icon: 'FileText',
  sections: [
    {
      id: 'request-info',
      type: 'info-card',
      title: 'Request Information',
      fields: [
        {
          id: 'type',
          label: 'Type',
          type: 'enum',
          path: 'type',
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
        { id: 'startDate', label: 'Start Date', type: 'date', path: 'startDate' },
        { id: 'endDate', label: 'End Date', type: 'date', path: 'endDate' },
        { id: 'hours', label: 'Total Hours', type: 'number', path: 'hours' },
        { id: 'reason', label: 'Reason', type: 'text', path: 'reason' },
      ],
    },
    {
      id: 'balance-info',
      type: 'info-card',
      title: 'Balance Impact',
      fields: [
        { id: 'balanceBefore', label: 'Balance Before', type: 'number', path: 'balanceBefore' },
        { id: 'hoursRequested', label: 'Hours Requested', type: 'number', path: 'hours' },
        { id: 'balanceAfter', label: 'Balance After', type: 'number', path: 'balanceAfter' },
      ],
    },
  ],
};

const approvalTab: TabDefinition = {
  id: 'approval',
  label: 'Approval',
  icon: 'CheckCircle',
  sections: [
    {
      id: 'approval-info',
      type: 'info-card',
      title: 'Approval Details',
      fields: [
        { id: 'approver', label: 'Approver', type: 'text', path: 'approver.fullName' },
        { id: 'approvedAt', label: 'Approved At', type: 'date', path: 'approvedAt' },
        { id: 'comments', label: 'Comments', type: 'text', path: 'approverComments' },
      ],
    },
    {
      id: 'approval-history',
      type: 'table',
      title: 'Approval History',
      columns_config: [
        { id: 'date', label: 'Date', path: 'createdAt', type: 'date', sortable: true },
        { id: 'action', label: 'Action', path: 'action', type: 'text' },
        { id: 'by', label: 'By', path: 'user.fullName', type: 'text' },
        { id: 'comments', label: 'Comments', path: 'comments', type: 'text' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'timeoff',
        relation: 'history',
      },
    },
  ],
};

const activityTab: TabDefinition = {
  id: 'activity',
  label: 'Activity',
  icon: 'Activity',
  sections: [
    {
      id: 'activity-log',
      type: 'table',
      title: 'Activity Log',
      columns_config: [
        { id: 'date', label: 'Date', path: 'createdAt', type: 'date', sortable: true },
        { id: 'action', label: 'Action', path: 'action', type: 'text' },
        { id: 'user', label: 'User', path: 'user.fullName', type: 'text' },
        { id: 'details', label: 'Details', path: 'details', type: 'text' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'timeoff',
        relation: 'activities',
      },
    },
  ],
};

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const timeoffDetailScreen: ScreenDefinition = {
  id: 'timeoff-detail',
  type: 'detail',
  entityType: 'timeoff',

  title: { type: 'field', path: 'employee.fullName' },
  subtitle: 'Time Off Request',
  icon: 'Calendar',

  // Data source
  dataSource: {
    type: 'entity',
    entityType: 'timeoff',
    entityId: { type: 'param', path: 'id' },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebar: {
      id: 'request-summary',
      type: 'info-card',
      title: 'Request Summary',
      fields: [
        { id: 'employee', label: 'Employee', type: 'text', path: 'employee.fullName' },
        { id: 'department', label: 'Department', type: 'text', path: 'employee.department' },
        { id: 'manager', label: 'Manager', type: 'text', path: 'employee.manager.fullName' },
        {
          id: 'type',
          label: 'Type',
          type: 'enum',
          path: 'type',
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
        { id: 'startDate', label: 'Start Date', type: 'date', path: 'startDate' },
        { id: 'endDate', label: 'End Date', type: 'date', path: 'endDate' },
        { id: 'hours', label: 'Hours', type: 'number', path: 'hours' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
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
        { id: 'requestedAt', label: 'Requested At', type: 'date', path: 'createdAt' },
      ],
    },
    tabs: [detailsTab, approvalTab, activityTab],
    defaultTab: 'details',
  },

  // Header actions
  actions: [
    {
      id: 'approve',
      label: 'Approve',
      type: 'mutation',
      variant: 'primary',
      icon: 'Check',
      config: {
        type: 'mutation',
        procedure: 'hr.timeOff.approve',
        input: { id: { type: 'param', path: 'id' } },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'pending' },
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
        props: { requestId: { type: 'param', path: 'id' } },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'pending' },
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      type: 'modal',
      variant: 'secondary',
      icon: 'Edit',
      config: {
        type: 'modal',
        modal: 'EditTimeOffModal',
        props: { requestId: { type: 'param', path: 'id' } },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'pending' },
      },
    },
    {
      id: 'cancel',
      label: 'Cancel Request',
      type: 'mutation',
      variant: 'destructive',
      icon: 'XCircle',
      config: {
        type: 'mutation',
        procedure: 'hr.timeOff.cancel',
        input: { id: { type: 'param', path: 'id' } },
      },
      visible: {
        type: 'condition',
        condition: { field: 'status', operator: 'eq', value: 'pending' },
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Time Off', route: '/employee/hr/time-off' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Time Off', route: '/employee/hr/time-off' },
      { label: { type: 'field', path: 'employee.fullName' } },
    ],
  },
};

export default timeoffDetailScreen;
