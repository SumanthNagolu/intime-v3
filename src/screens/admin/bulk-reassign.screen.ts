/**
 * Bulk Reassign Screen Definition
 *
 * Transfer ownership of records from one user to another.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ENTITY_TYPE_OPTIONS = [
  { value: 'job', label: 'Jobs' },
  { value: 'candidate', label: 'Candidates' },
  { value: 'submission', label: 'Submissions' },
  { value: 'account', label: 'Accounts' },
  { value: 'contact', label: 'Contacts' },
  { value: 'lead', label: 'Leads' },
  { value: 'deal', label: 'Deals' },
];

const RACI_OPTIONS = [
  { value: 'full', label: 'Transfer full ownership (Responsible + Accountable)' },
  { value: 'responsible', label: 'Make new owner Responsible only' },
  { value: 'consulted', label: 'Make new owner Consulted' },
];

const OLD_OWNER_OPTIONS = [
  { value: 'remove', label: 'Remove from RACI entirely' },
  { value: 'consulted', label: 'Keep as Consulted' },
  { value: 'informed', label: 'Keep as Informed' },
];

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const recordsTableColumns: TableColumnDefinition[] = [
  { id: 'select', label: '', path: 'selected', type: 'boolean', width: '40px' },
  { id: 'name', label: 'Name', path: 'displayName', type: 'text', sortable: true },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: [
        { value: 'active', label: 'Active' },
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
      ],
      badgeColors: { active: 'green', open: 'blue', closed: 'gray' },
    },
  },
  { id: 'relatedCount', label: 'Related Items', path: 'relatedCount', type: 'number' },
  { id: 'createdAt', label: 'Created', path: 'createdAt', type: 'date', sortable: true },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const bulkReassignScreen: ScreenDefinition = {
  id: 'bulk-reassign',
  type: 'wizard',
  // entityType: 'reassignment', // Admin entity

  title: 'Bulk Reassign Ownership',
  subtitle: 'Transfer ownership of records between users',
  icon: 'UserPlus',

  // Permissions
  permissions: [],

  // Layout (required for wizard type)
  layout: { type: 'wizard-steps', sections: [] },

  // Wizard Steps
  steps: [
    // Step 1: Select Records
    {
      id: 'select-records',
      title: 'Select Records',
      description: 'Choose records to reassign',
      icon: 'List',
      sections: [
        {
          id: 'record-type',
          type: 'form',
          title: 'Record Type',
          fields: [
            {
              id: 'entityType',
              label: 'Entity Type',
              type: 'radio',
              path: 'entityType',
              config: {
                options: ENTITY_TYPE_OPTIONS,
                required: true,
              },
            },
          ],
        },
        {
          id: 'current-owner',
          type: 'form',
          title: 'Current Owner',
          fields: [
            {
              id: 'fromUserId',
              label: 'Select Current Owner',
              type: 'select',
              path: 'fromUserId',
              config: {
                required: true,
                placeholder: 'Search for user...',
                dataSource: { procedure: 'admin.users.listWithRecordCounts' },
                displayFormat: '{{fullName}}',
                subtitleFormat: '{{recordCount}} records | {{role}}',
              },
            },
          ],
        },
        {
          id: 'filters',
          type: 'form',
          title: 'Filter Records',
          columns: 2,
          fields: [
            {
              id: 'onlyActive',
              label: 'Only active records',
              type: 'checkbox',
              path: 'filters.onlyActive',
              config: { defaultValue: true },
            },
            {
              id: 'includeCompleted',
              label: 'Include completed records',
              type: 'checkbox',
              path: 'filters.includeCompleted',
              config: { defaultValue: false },
            },
            {
              id: 'createdInDays',
              label: 'Created in last (days)',
              type: 'number',
              path: 'filters.createdInDays',
              config: { min: 1, max: 365, placeholder: 'All time' },
            },
          ],
        },
        {
          id: 'search-button',
          type: 'custom',
          component: 'SearchRecordsButton',
        },
        {
          id: 'records-table',
          type: 'table',
          title: 'Select Records',
          columns_config: recordsTableColumns,
          selectable: true,
          dataSource: {
            type: 'custom',
            query: {
              procedure: 'admin.reassignment.searchRecords',
              params: {},
            },
          },
          emptyState: {
            title: 'No records found',
            description: 'Select an owner and search for records',
            icon: 'Search',
          },
          visible: { field: 'hasSearched', operator: 'eq', value: true },
        },
      ],
      validation: {
        required: ['entityType', 'fromUserId'],
        custom: 'validateRecordSelection',
      },
    },
    // Step 2: Choose New Owner
    {
      id: 'new-owner',
      title: 'Choose New Owner',
      description: 'Select who will own the records',
      icon: 'User',
      sections: [
        {
          id: 'summary',
          type: 'info-card',
          title: 'Reassignment Summary',
          fields: [
            { id: 'entityType', label: 'Entity Type', type: 'text', path: 'entityTypeLabel' },
            { id: 'fromUser', label: 'From', type: 'text', path: 'fromUser.fullName' },
            { id: 'recordCount', label: 'Records', type: 'number', path: 'selectedCount' },
          ],
        },
        {
          id: 'new-owner-selection',
          type: 'form',
          title: 'New Owner',
          fields: [
            {
              id: 'toUserId',
              label: 'Reassign to',
              type: 'select',
              path: 'toUserId',
              config: {
                required: true,
                placeholder: 'Search for new owner...',
                dataSource: { procedure: 'admin.users.listWithPermissions' },
                displayFormat: '{{fullName}}',
                subtitleFormat: '{{role}} | {{pod.name}}',
                helpText: 'Only users with appropriate permissions are shown',
              },
            },
          ],
        },
        {
          id: 'raci-settings',
          type: 'form',
          title: 'RACI Assignment',
          fields: [
            {
              id: 'raciAssignment',
              label: 'RACI Assignment',
              type: 'radio',
              path: 'raciAssignment',
              config: {
                options: RACI_OPTIONS,
                defaultValue: 'full',
              },
            },
            {
              id: 'oldOwnerRaci',
              label: 'What happens to old owner?',
              type: 'radio',
              path: 'oldOwnerRaci',
              config: {
                options: OLD_OWNER_OPTIONS,
                defaultValue: 'remove',
              },
            },
          ],
        },
        {
          id: 'notification-settings',
          type: 'form',
          title: 'Notifications',
          columns: 1,
          fields: [
            {
              id: 'notifyNewOwner',
              label: 'Notify new owner',
              type: 'checkbox',
              path: 'notifications.newOwner',
              config: { defaultValue: true },
            },
            {
              id: 'notifyOldOwner',
              label: 'Notify old owner',
              type: 'checkbox',
              path: 'notifications.oldOwner',
              config: { defaultValue: true },
            },
            {
              id: 'notifyRelated',
              label: 'Notify related parties (e.g., candidates on jobs)',
              type: 'checkbox',
              path: 'notifications.related',
              config: { defaultValue: false },
            },
          ],
        },
        {
          id: 'reason',
          type: 'form',
          title: 'Reason',
          fields: [
            {
              id: 'reason',
              label: 'Reason for Reassignment',
              type: 'textarea',
              path: 'reason',
              config: {
                required: true,
                placeholder: 'e.g., Employee leaving, pod restructure...',
                rows: 3,
                maxLength: 200,
              },
            },
          ],
        },
      ],
      validation: {
        required: ['toUserId', 'reason'],
      },
    },
    // Step 3: Review & Confirm
    {
      id: 'review',
      title: 'Review & Confirm',
      description: 'Confirm the reassignment',
      icon: 'CheckCircle',
      sections: [
        {
          id: 'review-summary',
          type: 'custom',
          component: 'ReassignmentSummary',
          componentProps: {
            showAffectedRecords: true,
            showNotifications: true,
            showWarnings: true,
          },
        },
        {
          id: 'confirmation',
          type: 'info-card',
          title: 'Important',
          description: 'This action will be logged in the audit trail and cannot be automatically undone.',
          fields: [
            { id: 'affectedRecords', label: 'Affected Records', type: 'number', path: 'selectedCount' },
            { id: 'from', label: 'From', type: 'text', path: 'fromUser.fullName' },
            { id: 'to', label: 'To', type: 'text', path: 'toUser.fullName' },
            { id: 'reason', label: 'Reason', type: 'text', path: 'reason' },
          ],
        },
      ],
    },
  ],

  // Wizard Navigation
  navigation: {
    allowSkip: false,
    showProgress: true,
    showStepNumbers: true,
    saveDraft: false,
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Data Management', route: '/admin/data' },
      { label: 'Bulk Reassign' },
    ],
  },

  // On Complete
  onComplete: {
    action: 'custom',
    handler: 'handleBulkReassign',
    successRedirect: '/admin/data',
    successMessage: 'Records reassigned successfully',
  },
};

export default bulkReassignScreen;
