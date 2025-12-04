/**
 * Compliance Dashboard Screen Definition
 *
 * Metadata-driven screen for HR compliance management.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const COMPLIANCE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'exempt', label: 'Exempt' },
];

const COMPLIANCE_TYPE_OPTIONS = [
  { value: 'federal', label: 'Federal' },
  { value: 'state', label: 'State' },
  { value: 'local', label: 'Local' },
];

const I9_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'section1_complete', label: 'Section 1 Complete' },
  { value: 'completed', label: 'Completed' },
  { value: 'expired', label: 'Expired' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const complianceDashboardScreen: ScreenDefinition = {
  id: 'compliance-dashboard',
  type: 'dashboard',
  entityType: 'compliance',

  title: 'Compliance Dashboard',
  subtitle: 'Monitor HR compliance and documentation',
  icon: 'Shield',

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Compliance Scorecard
      {
        id: 'scorecard',
        type: 'metrics-grid',
        title: 'Compliance Scorecard',
        columns: 4,
        fields: [
          { id: 'i9Compliance', label: 'I-9 Compliance', type: 'percentage', path: 'scorecard.i9' },
          { id: 'w4Compliance', label: 'W-4 Compliance', type: 'percentage', path: 'scorecard.w4' },
          { id: 'training', label: 'Required Training', type: 'percentage', path: 'scorecard.training' },
          { id: 'overall', label: 'Overall', type: 'percentage', path: 'scorecard.overall' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'compliance',
        },
      },
      // Alerts Table
      {
        id: 'alerts-table',
        type: 'table',
        title: 'Compliance Alerts',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'requirement', label: 'Requirement', path: 'requirement.name', type: 'text' },
          {
            id: 'type',
            label: 'Type',
            path: 'requirement.type',
            type: 'enum',
            config: {
              options: COMPLIANCE_TYPE_OPTIONS,
              badgeColors: { federal: 'blue', state: 'purple', local: 'cyan' },
            },
          },
          { id: 'dueDate', label: 'Due Date', path: 'dueDate', type: 'date', sortable: true },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            sortable: true,
            config: {
              options: COMPLIANCE_STATUS_OPTIONS,
              badgeColors: { pending: 'yellow', completed: 'green', overdue: 'red', exempt: 'gray' },
            },
          },
        ],
        dataSource: {
          type: 'list',
          entityType: 'compliance',
          filter: { status: ['pending', 'overdue'] },
        },
      },
      // I-9 Table
      {
        id: 'i9-table',
        type: 'table',
        title: 'I-9 Verification Status',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'hireDate', label: 'Hire Date', path: 'employee.hireDate', type: 'date', sortable: true },
          { id: 'section1', label: 'Section 1', path: 'section1CompletedAt', type: 'date' },
          { id: 'section2', label: 'Section 2', path: 'section2CompletedAt', type: 'date' },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            sortable: true,
            config: {
              options: I9_STATUS_OPTIONS,
              badgeColors: { pending: 'yellow', section1_complete: 'blue', completed: 'green', expired: 'red' },
            },
          },
          { id: 'reverificationDate', label: 'Reverification Due', path: 'reverificationDate', type: 'date' },
        ],
        dataSource: {
          type: 'list',
          entityType: 'compliance',
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'send-reminders',
      label: 'Send Reminders',
      type: 'custom',
      variant: 'primary',
      icon: 'Bell',
      config: {
        type: 'custom',
        handler: 'handleSendReminders',
      },
    },
    {
      id: 'export-report',
      label: 'Export Report',
      type: 'custom',
      variant: 'secondary',
      icon: 'Download',
      config: {
        type: 'custom',
        handler: 'handleExportReport',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Compliance' },
    ],
  },
};

export default complianceDashboardScreen;
