/**
 * Immigration/Visa List Screen Definition
 *
 * Metadata-driven screen for tracking employee work authorization and visas.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const VISA_TYPE_OPTIONS = [
  { value: 'h1b', label: 'H-1B' },
  { value: 'h1b1', label: 'H-1B1' },
  { value: 'l1a', label: 'L-1A' },
  { value: 'l1b', label: 'L-1B' },
  { value: 'tn', label: 'TN' },
  { value: 'opt', label: 'OPT' },
  { value: 'cpt', label: 'CPT' },
  { value: 'ead', label: 'EAD' },
  { value: 'gc', label: 'Green Card' },
  { value: 'citizen', label: 'US Citizen' },
  { value: 'other', label: 'Other' },
];

const WORK_AUTH_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending_renewal', label: 'Pending Renewal' },
  { value: 'in_process', label: 'In Process' },
];

const CASE_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_preparation', label: 'In Preparation' },
  { value: 'filed', label: 'Filed' },
  { value: 'rfe_received', label: 'RFE Received' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const immigrationListScreen: ScreenDefinition = {
  id: 'immigration-list',
  type: 'list',
  entityType: 'compliance',

  title: 'Immigration & Work Authorization',
  subtitle: 'Visa tracking and work authorization management',
  icon: 'Globe',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'compliance',
    sort: { field: 'expirationDate', direction: 'asc' },
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
          { id: 'totalSponsored', label: 'Sponsored Employees', type: 'number', path: 'stats.totalSponsored' },
          { id: 'expiring30', label: 'Expiring (30 Days)', type: 'number', path: 'stats.expiring30Days' },
          { id: 'expiring90', label: 'Expiring (90 Days)', type: 'number', path: 'stats.expiring90Days' },
          { id: 'pendingCases', label: 'Pending Cases', type: 'number', path: 'stats.pendingCases' },
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
          { id: 'visaType', label: 'Visa Type', type: 'multiselect', path: 'filters.visaType', options: [...VISA_TYPE_OPTIONS] },
          { id: 'status', label: 'Status', type: 'multiselect', path: 'filters.status', options: [...WORK_AUTH_STATUS_OPTIONS] },
        ],
      },
      // Main Table
      {
        id: 'immigration-table',
        type: 'table',
        title: 'Work Authorization Records',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'department', label: 'Department', path: 'employee.department', type: 'text' },
          {
            id: 'visaType',
            label: 'Visa Type',
            path: 'visaType',
            type: 'enum',
            sortable: true,
            config: {
              options: VISA_TYPE_OPTIONS,
            },
          },
          { id: 'startDate', label: 'Valid From', path: 'validFrom', type: 'date' },
          { id: 'expirationDate', label: 'Expires', path: 'expirationDate', type: 'date', sortable: true },
          { id: 'daysRemaining', label: 'Days Left', path: 'daysRemaining', type: 'number', sortable: true },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            sortable: true,
            config: {
              options: WORK_AUTH_STATUS_OPTIONS,
              badgeColors: {
                active: 'green',
                expiring_soon: 'orange',
                expired: 'red',
                pending_renewal: 'blue',
                in_process: 'cyan',
              },
            },
          },
          { id: 'attorney', label: 'Attorney', path: 'attorney', type: 'text' },
        ],
      },
      // Active Cases Table
      {
        id: 'cases-table',
        type: 'table',
        title: 'Active Immigration Cases',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text', sortable: true },
          { id: 'caseType', label: 'Case Type', path: 'caseType', type: 'text' },
          { id: 'receiptNumber', label: 'Receipt #', path: 'receiptNumber', type: 'text' },
          { id: 'filedDate', label: 'Filed', path: 'filedDate', type: 'date', sortable: true },
          {
            id: 'caseStatus',
            label: 'Case Status',
            path: 'caseStatus',
            type: 'enum',
            sortable: true,
            config: {
              options: CASE_STATUS_OPTIONS,
              badgeColors: {
                not_started: 'gray',
                in_preparation: 'yellow',
                filed: 'blue',
                rfe_received: 'orange',
                approved: 'green',
                denied: 'red',
              },
            },
          },
          { id: 'lastUpdate', label: 'Last Update', path: 'lastStatusUpdate', type: 'date' },
          { id: 'notes', label: 'Notes', path: 'notes', type: 'text' },
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
      id: 'add-record',
      label: 'Add Record',
      type: 'modal',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'ImmigrationRecordModal',
        props: {},
      },
    },
    {
      id: 'check-status',
      label: 'Check USCIS Status',
      type: 'custom',
      variant: 'secondary',
      icon: 'Search',
      config: {
        type: 'custom',
        handler: 'handleCheckUSCISStatus',
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
        handler: 'handleExportImmigration',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Compliance', route: '/employee/hr/compliance' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Compliance', route: '/employee/hr/compliance' },
      { label: 'Immigration' },
    ],
  },
};

export default immigrationListScreen;
