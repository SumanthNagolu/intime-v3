/**
 * Timeline InputSet
 *
 * Configuration for activity timeline displays and quick logging.
 * Used across all entity detail views.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// TIMELINE OPTIONS
// ==========================================

/**
 * Timeline entry type filter options
 */
export const TIMELINE_ENTRY_TYPE_OPTIONS = [
  { value: 'all', label: 'All Activities & Events' },
  { value: 'activity', label: 'Activities Only' },
  { value: 'event', label: 'Events Only' },
];

/**
 * Activity type options
 */
export const ACTIVITY_TYPE_OPTIONS = [
  { value: 'call', label: '📞 Call' },
  { value: 'email', label: '📧 Email' },
  { value: 'meeting', label: '📅 Meeting' },
  { value: 'task', label: '✅ Task' },
  { value: 'note', label: '📝 Note' },
  { value: 'sms', label: '💬 SMS' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'interview', label: '🎤 Interview' },
  { value: 'submission', label: '📤 Submission' },
  { value: 'follow_up', label: '↩️ Follow-up' },
];

/**
 * Activity status options
 */
export const ACTIVITY_STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: '#6b7280' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
  { value: 'deferred', label: 'Deferred', color: '#8b5cf6' },
];

/**
 * Activity outcome options
 */
export const ACTIVITY_OUTCOME_OPTIONS = [
  { value: 'successful', label: 'Successful', color: '#22c55e' },
  { value: 'unsuccessful', label: 'Unsuccessful', color: '#ef4444' },
  { value: 'no_answer', label: 'No Answer', color: '#6b7280' },
  { value: 'left_voicemail', label: 'Left Voicemail', color: '#eab308' },
  { value: 'rescheduled', label: 'Rescheduled', color: '#3b82f6' },
  { value: 'pending_response', label: 'Pending Response', color: '#8b5cf6' },
];

/**
 * Activity priority options
 */
export const ACTIVITY_PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: '#ef4444' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'medium', label: 'Medium', color: '#eab308' },
  { value: 'low', label: 'Low', color: '#22c55e' },
];

/**
 * Direction options
 */
export const DIRECTION_OPTIONS = [
  { value: 'outbound', label: 'Outbound' },
  { value: 'inbound', label: 'Inbound' },
];

/**
 * Date range filter options
 */
export const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'custom', label: 'Custom Range' },
];

/**
 * Reminder options
 */
export const REMINDER_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '15', label: '15 min before' },
  { value: '30', label: '30 min before' },
  { value: '60', label: '1 hour before' },
  { value: '1440', label: '1 day before' },
];

// ==========================================
// TIMELINE FILTER FIELDS
// ==========================================

/**
 * Timeline filter fields
 */
export const timelineFilterFields: FieldDefinition[] = [
  {
    id: 'entryTypes',
    label: 'Show',
    type: 'enum',
    defaultValue: 'all',
    config: {
      options: TIMELINE_ENTRY_TYPE_OPTIONS,
    },
  },
  {
    id: 'activityTypes',
    label: 'Activity Types',
    type: 'multiselect',
    config: {
      options: ACTIVITY_TYPE_OPTIONS,
    },
  },
  {
    id: 'activityStatuses',
    label: 'Status',
    type: 'multiselect',
    config: {
      options: ACTIVITY_STATUS_OPTIONS,
    },
  },
  {
    id: 'dateRange',
    label: 'Date Range',
    type: 'enum',
    defaultValue: 'all',
    config: {
      options: DATE_RANGE_OPTIONS,
    },
  },
  {
    id: 'customStartDate',
    label: 'From',
    type: 'date',
    visible: {
      type: 'condition',
      condition: { field: 'dateRange', operator: 'eq', value: 'custom' },
    },
  },
  {
    id: 'customEndDate',
    label: 'To',
    type: 'date',
    visible: {
      type: 'condition',
      condition: { field: 'dateRange', operator: 'eq', value: 'custom' },
    },
  },
  {
    id: 'performedBy',
    label: 'Performed By',
    type: 'select',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      searchable: true,
    },
  },
  {
    id: 'searchText',
    label: 'Search',
    type: 'text',
    placeholder: 'Search activities...',
  },
];

/**
 * Timeline Filter InputSet
 */
export const timelineFilterInputSet: InputSetConfig = {
  id: 'timeline-filter',
  label: 'Filter Timeline',
  description: 'Filter activity timeline display',
  fields: timelineFilterFields,
  layout: {
    columns: 4,
    fieldLayout: [
      { fieldId: 'entryTypes', colSpan: 1 },
      { fieldId: 'activityTypes', colSpan: 1 },
      { fieldId: 'activityStatuses', colSpan: 1 },
      { fieldId: 'dateRange', colSpan: 1 },
      { fieldId: 'customStartDate', colSpan: 1 },
      { fieldId: 'customEndDate', colSpan: 1 },
      { fieldId: 'performedBy', colSpan: 1 },
      { fieldId: 'searchText', colSpan: 1 },
    ],
  },
};

// ==========================================
// QUICK LOG ACTIVITY FIELDS
// ==========================================

/**
 * Quick log activity fields
 */
export const quickLogActivityFields: FieldDefinition[] = [
  {
    id: 'activityType',
    label: 'Type',
    type: 'enum',
    required: true,
    config: {
      options: ACTIVITY_TYPE_OPTIONS,
    },
  },
  {
    id: 'direction',
    label: 'Direction',
    type: 'enum',
    defaultValue: 'outbound',
    config: {
      options: DIRECTION_OPTIONS,
    },
  },
  {
    id: 'subject',
    label: 'Subject',
    type: 'text',
    required: true,
    placeholder: 'Brief description of the activity...',
  },
  {
    id: 'body',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Details, key points discussed, outcomes...',
  },
  {
    id: 'outcome',
    label: 'Outcome',
    type: 'enum',
    config: {
      options: ACTIVITY_OUTCOME_OPTIONS,
    },
  },
  {
    id: 'durationMinutes',
    label: 'Duration (min)',
    type: 'number',
    placeholder: '0',
  },
  {
    id: 'createFollowUp',
    label: 'Create Follow-up',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'followUpDate',
    label: 'Follow-up Date',
    type: 'date',
    visible: {
      type: 'condition',
      condition: { field: 'createFollowUp', operator: 'eq', value: true },
    },
  },
];

/**
 * Quick Log Activity InputSet
 */
export const quickLogActivityInputSet: InputSetConfig = {
  id: 'quick-log-activity',
  label: 'Log Activity',
  description: 'Quick form for logging completed activities',
  fields: quickLogActivityFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'activityType', colSpan: 1 },
      { fieldId: 'direction', colSpan: 1 },
      { fieldId: 'subject', colSpan: 2 },
      { fieldId: 'body', colSpan: 2 },
      { fieldId: 'outcome', colSpan: 1 },
      { fieldId: 'durationMinutes', colSpan: 1 },
      { fieldId: 'createFollowUp', colSpan: 1 },
      { fieldId: 'followUpDate', colSpan: 1 },
    ],
  },
};

// ==========================================
// SCHEDULE ACTIVITY FIELDS
// ==========================================

/**
 * Schedule activity fields
 */
export const scheduleActivityFields: FieldDefinition[] = [
  {
    id: 'activityType',
    label: 'Type',
    type: 'enum',
    required: true,
    config: {
      options: [
        { value: 'call', label: '📞 Call' },
        { value: 'meeting', label: '📅 Meeting' },
        { value: 'task', label: '✅ Task' },
        { value: 'follow_up', label: '↩️ Follow-up' },
      ],
    },
  },
  {
    id: 'priority',
    label: 'Priority',
    type: 'enum',
    defaultValue: 'medium',
    config: {
      options: ACTIVITY_PRIORITY_OPTIONS,
    },
  },
  {
    id: 'subject',
    label: 'Subject',
    type: 'text',
    required: true,
    placeholder: 'What needs to be done...',
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Additional details or instructions...',
  },
  {
    id: 'dueDate',
    label: 'Due Date',
    type: 'date',
    required: true,
  },
  {
    id: 'dueTime',
    label: 'Time',
    type: 'time',
  },
  {
    id: 'assignedTo',
    label: 'Assign To',
    type: 'select',
    description: 'Defaults to yourself',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      searchable: true,
    },
  },
  {
    id: 'reminderMinutes',
    label: 'Reminder',
    type: 'enum',
    defaultValue: '30',
    config: {
      options: REMINDER_OPTIONS,
    },
  },
];

/**
 * Schedule Activity InputSet
 */
export const scheduleActivityInputSet: InputSetConfig = {
  id: 'schedule-activity',
  label: 'Schedule Activity',
  description: 'Schedule a future activity',
  fields: scheduleActivityFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'activityType', colSpan: 1 },
      { fieldId: 'priority', colSpan: 1 },
      { fieldId: 'subject', colSpan: 2 },
      { fieldId: 'description', colSpan: 2 },
      { fieldId: 'dueDate', colSpan: 1 },
      { fieldId: 'dueTime', colSpan: 1 },
      { fieldId: 'assignedTo', colSpan: 1 },
      { fieldId: 'reminderMinutes', colSpan: 1 },
    ],
  },
};

// ==========================================
// ACTIVITY BADGE DISPLAY FIELDS
// ==========================================

/**
 * Activity badge display fields (for entity cards)
 */
export const activityBadgeFields: FieldDefinition[] = [
  {
    id: 'overdueCount',
    label: 'Overdue',
    type: 'number',
    readonly: true,
    config: {
      colorScale: { positive: '#ef4444', zero: '#6b7280', negative: '#22c55e' },
    },
  },
  {
    id: 'dueTodayCount',
    label: 'Due Today',
    type: 'number',
    readonly: true,
    config: {
      colorScale: { positive: '#f59e0b', zero: '#6b7280', negative: '#22c55e' },
    },
  },
  {
    id: 'totalOpenCount',
    label: 'Open',
    type: 'number',
    readonly: true,
  },
  {
    id: 'lastActivityAt',
    label: 'Last Activity',
    type: 'datetime',
    readonly: true,
    config: {
      relative: true,
    },
  },
  {
    id: 'daysSinceActivity',
    label: 'Days Since Activity',
    type: 'number',
    readonly: true,
  },
  {
    id: 'isStale',
    label: 'Stale',
    type: 'boolean',
    readonly: true,
    description: 'No activity in 7+ days',
  },
];

/**
 * Activity Badge InputSet - For display on entity cards
 */
export const activityBadgeInputSet: InputSetConfig = {
  id: 'activity-badge',
  label: 'Activity Summary',
  description: 'Shows activity counts on entity cards',
  fields: activityBadgeFields,
  layout: {
    columns: 3,
    fieldLayout: [
      { fieldId: 'overdueCount', colSpan: 1 },
      { fieldId: 'dueTodayCount', colSpan: 1 },
      { fieldId: 'totalOpenCount', colSpan: 1 },
      { fieldId: 'lastActivityAt', colSpan: 1 },
      { fieldId: 'daysSinceActivity', colSpan: 1 },
      { fieldId: 'isStale', colSpan: 1 },
    ],
  },
};

export default timelineFilterInputSet;

