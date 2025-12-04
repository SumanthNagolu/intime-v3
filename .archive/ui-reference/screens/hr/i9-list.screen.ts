/**
 * I-9 Verification List Screen Definition
 *
 * Metadata-driven screen for managing I-9 employment eligibility verification.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const I9_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'section1_complete', label: 'Section 1 Complete' },
  { value: 'section2_complete', label: 'Section 2 Complete' },
  { value: 'completed', label: 'Completed' },
  { value: 'reverification_due', label: 'Reverification Due' },
  { value: 'expired', label: 'Expired' },
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'list_a', label: 'List A (Identity + Work Auth)' },
  { value: 'list_b', label: 'List B (Identity)' },
  { value: 'list_c', label: 'List C (Work Authorization)' },
];

const EVERIFY_STATUS_OPTIONS = [
  { value: 'not_submitted', label: 'Not Submitted' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'tentative_nonconfirmation', label: 'TNC' },
  { value: 'final_nonconfirmation', label: 'Final NC' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const i9ListScreen: ScreenDefinition = {
  id: 'i9-list',
  type: 'list',
  entityType: 'compliance',

  title: 'I-9 Verification',
  subtitle: 'Employment eligibility verification management',
  icon: 'FileCheck',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'compliance',
    sort: { field: 'dueDate', direction: 'asc' },
    pagination: true,
    limit: 25,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Status Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'pendingSection1', label: 'Pending Section 1', type: 'number', path: 'stats.pendingSection1' },
          { id: 'pendingSection2', label: 'Pending Section 2', type: 'number', path: 'stats.pendingSection2' },
          { id: 'reverificationDue', label: 'Reverification Due', type: 'number', path: 'stats.reverificationDue' },
          { id: 'overdue', label: 'Overdue (3+ Days)', type: 'number', path: 'stats.overdue' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'compliance',
        },
      },
      // Filters
      {
        id: 'filters',
        type: 'form',
        fields: [
          { id: 'search', label: 'Search', type: 'text', path: 'search', config: { placeholder: 'Search by employee name...' } },
          { id: 'status', label: 'Status', type: 'multiselect', path: 'filters.status', options: [...I9_STATUS_OPTIONS] },
          { id: 'everifyStatus', label: 'E-Verify Status', type: 'multiselect', path: 'filters.everifyStatus', options: [...EVERIFY_STATUS_OPTIONS] },
        ],
      },
      // Main Table
      {
        id: 'i9-table',
        type: 'table',
        title: 'I-9 Records',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'hireDate', label: 'Hire Date', path: 'employee.hireDate', type: 'date', sortable: true },
          { id: 'section1Date', label: 'Section 1', path: 'section1CompletedAt', type: 'date' },
          { id: 'section2Date', label: 'Section 2', path: 'section2CompletedAt', type: 'date' },
          { id: 'section2DueDate', label: 'Section 2 Due', path: 'section2DueDate', type: 'date', sortable: true },
          {
            id: 'status',
            label: 'I-9 Status',
            path: 'status',
            type: 'enum',
            sortable: true,
            config: {
              options: I9_STATUS_OPTIONS,
              badgeColors: {
                pending: 'yellow',
                section1_complete: 'blue',
                section2_complete: 'cyan',
                completed: 'green',
                reverification_due: 'orange',
                expired: 'red',
              },
            },
          },
          {
            id: 'everifyStatus',
            label: 'E-Verify',
            path: 'everifyStatus',
            type: 'enum',
            config: {
              options: EVERIFY_STATUS_OPTIONS,
              badgeColors: {
                not_submitted: 'gray',
                pending: 'yellow',
                verified: 'green',
                tentative_nonconfirmation: 'orange',
                final_nonconfirmation: 'red',
              },
            },
          },
          { id: 'reverificationDate', label: 'Reverification Due', path: 'reverificationDate', type: 'date' },
          { id: 'verifiedBy', label: 'Verified By', path: 'verifiedBy.fullName', type: 'text' },
        ],
      },
      // Expiring Documents Table
      {
        id: 'expiring-table',
        type: 'table',
        title: 'Documents Expiring Soon (90 Days)',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          {
            id: 'documentType',
            label: 'Document Type',
            path: 'documentType',
            type: 'enum',
            config: { options: DOCUMENT_TYPE_OPTIONS },
          },
          { id: 'documentNumber', label: 'Document #', path: 'documentNumber', type: 'text' },
          { id: 'expirationDate', label: 'Expires', path: 'expirationDate', type: 'date', sortable: true },
          { id: 'daysUntilExpiry', label: 'Days Left', path: 'daysUntilExpiry', type: 'number' },
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
      id: 'verify-i9',
      label: 'Verify I-9',
      type: 'modal',
      variant: 'primary',
      icon: 'CheckCircle',
      config: {
        type: 'modal',
        modal: 'I9VerificationModal',
        props: {},
      },
    },
    {
      id: 'bulk-remind',
      label: 'Send Reminders',
      type: 'mutation',
      variant: 'secondary',
      icon: 'Bell',
      config: {
        type: 'mutation',
        procedure: 'hr.compliance.sendI9Reminders',
        input: { ids: { type: 'context', path: 'selectedIds' } },
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
        handler: 'handleExportI9Report',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Compliance', route: '/employee/hr/compliance' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Compliance', route: '/employee/hr/compliance' },
      { label: 'I-9 Verification' },
    ],
  },
};

export default i9ListScreen;
