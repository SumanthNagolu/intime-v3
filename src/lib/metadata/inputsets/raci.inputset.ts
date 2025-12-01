/**
 * RACI InputSet
 *
 * RACI (Responsible, Accountable, Consulted, Informed) ownership assignment.
 * Every entity has RACI owners for clear accountability.
 *
 * @see docs/specs/10-DATABASE/12-object-owners.md
 * @see docs/specs/20-USER-ROLES/00-MASTER-FRAMEWORK.md
 */

import type { InputSetConfig, FieldDefinition } from '../types';

// ==========================================
// RACI OPTIONS
// ==========================================

/**
 * RACI role options
 */
export const RACI_ROLE_OPTIONS = [
  {
    value: 'responsible',
    label: 'R - Responsible',
    color: '#3b82f6',
    description: 'Does the work',
  },
  {
    value: 'accountable',
    label: 'A - Accountable',
    color: '#8b5cf6',
    description: 'Owns the outcome (only one per entity)',
  },
  {
    value: 'consulted',
    label: 'C - Consulted',
    color: '#eab308',
    description: 'Provides input before decisions',
  },
  {
    value: 'informed',
    label: 'I - Informed',
    color: '#6b7280',
    description: 'Kept updated on progress',
  },
];

/**
 * Permission level options
 */
export const RACI_PERMISSION_OPTIONS = [
  { value: 'view', label: 'View Only' },
  { value: 'edit', label: 'Can Edit' },
  { value: 'admin', label: 'Full Admin' },
];

/**
 * Assignment type options
 */
export const ASSIGNMENT_TYPE_OPTIONS = [
  { value: 'manual', label: 'Manual Assignment' },
  { value: 'auto', label: 'Auto-assigned (by pattern)' },
  { value: 'inherited', label: 'Inherited from Parent' },
];

/**
 * Owner change reason options
 */
export const OWNER_CHANGE_REASON_OPTIONS = [
  { value: 'workload_balance', label: 'Workload Balancing' },
  { value: 'expertise_match', label: 'Better Expertise Match' },
  { value: 'employee_departure', label: 'Employee Departure' },
  { value: 'client_request', label: 'Client Request' },
  { value: 'reassignment', label: 'Team Reassignment' },
  { value: 'other', label: 'Other' },
];

/**
 * Entity type options for RACI matrix
 */
export const RACI_ENTITY_TYPE_OPTIONS = [
  { value: 'candidate', label: 'Candidates' },
  { value: 'job', label: 'Jobs' },
  { value: 'submission', label: 'Submissions' },
  { value: 'placement', label: 'Placements' },
  { value: 'account', label: 'Accounts' },
  { value: 'deal', label: 'Deals' },
  { value: 'lead', label: 'Leads' },
  { value: 'activity', label: 'Activities' },
];

// ==========================================
// RACI ASSIGNMENT FIELDS
// ==========================================

/**
 * RACI assignment fields
 */
export const raciAssignmentFields: FieldDefinition[] = [
  {
    id: 'userId',
    label: 'User',
    type: 'select',
    required: true,
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      searchable: true,
      searchFields: ['firstName', 'lastName', 'email'],
    },
  },
  {
    id: 'role',
    label: 'RACI Role',
    type: 'enum',
    required: true,
    description: 'Select the type of ownership',
    config: {
      options: RACI_ROLE_OPTIONS,
    },
  },
  {
    id: 'permission',
    label: 'Permission Level',
    type: 'enum',
    required: true,
    defaultValue: 'view',
    config: {
      options: RACI_PERMISSION_OPTIONS,
    },
  },
  {
    id: 'isPrimary',
    label: 'Primary Owner',
    type: 'boolean',
    description: 'Mark as the primary owner for this role',
  },
  {
    id: 'assignmentType',
    label: 'Assignment Type',
    type: 'enum',
    defaultValue: 'manual',
    readonly: true,
    config: {
      options: ASSIGNMENT_TYPE_OPTIONS,
    },
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Reason for assignment or additional context...',
  },
];

/**
 * RACI Assignment InputSet - Add/Edit owner
 */
export const raciAssignmentInputSet: InputSetConfig = {
  id: 'raci-assignment',
  label: 'Assign Owner',
  description: 'Add or modify RACI assignment',
  fields: raciAssignmentFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'userId', colSpan: 2 },
      { fieldId: 'role', colSpan: 1 },
      { fieldId: 'permission', colSpan: 1 },
      { fieldId: 'isPrimary', colSpan: 1 },
      { fieldId: 'assignmentType', colSpan: 1 },
      { fieldId: 'notes', colSpan: 2 },
    ],
  },
};

// ==========================================
// RACI DISPLAY FIELDS
// ==========================================

/**
 * RACI display fields (show current owners)
 */
export const raciDisplayFields: FieldDefinition[] = [
  {
    id: 'accountable',
    label: 'Accountable (Owner)',
    type: 'select',
    description: 'Primary owner - one person',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      showAvatar: true,
    },
  },
  {
    id: 'responsible',
    label: 'Responsible',
    type: 'multiselect',
    description: 'People doing the work',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
    },
  },
  {
    id: 'consulted',
    label: 'Consulted',
    type: 'multiselect',
    description: 'SMEs and advisors',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
    },
  },
  {
    id: 'informed',
    label: 'Informed',
    type: 'multiselect',
    description: 'Stakeholders to keep updated',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
    },
  },
];

/**
 * RACI Display InputSet - Show current owners
 */
export const raciDisplayInputSet: InputSetConfig = {
  id: 'raci-display',
  label: 'Ownership',
  description: 'Current RACI assignments',
  fields: raciDisplayFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'accountable', colSpan: 1 },
      { fieldId: 'responsible', colSpan: 1 },
      { fieldId: 'consulted', colSpan: 1 },
      { fieldId: 'informed', colSpan: 1 },
    ],
  },
};

// ==========================================
// QUICK OWNER CHANGE FIELDS
// ==========================================

/**
 * Quick owner change fields
 */
export const quickOwnerChangeFields: FieldDefinition[] = [
  {
    id: 'currentOwner',
    label: 'Current Owner',
    type: 'select',
    readonly: true,
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
    },
  },
  {
    id: 'newOwner',
    label: 'New Owner',
    type: 'select',
    required: true,
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      searchable: true,
    },
  },
  {
    id: 'reason',
    label: 'Reason for Change',
    type: 'enum',
    required: true,
    config: {
      options: OWNER_CHANGE_REASON_OPTIONS,
    },
  },
  {
    id: 'reasonNotes',
    label: 'Additional Notes',
    type: 'textarea',
    visible: {
      type: 'condition',
      condition: { field: 'reason', operator: 'eq', value: 'other' },
    },
  },
  {
    id: 'notifyParties',
    label: 'Notify Both Owners',
    type: 'boolean',
    defaultValue: true,
    description: 'Send notification to both old and new owner',
  },
];

/**
 * Quick Owner Change InputSet
 */
export const quickOwnerChangeInputSet: InputSetConfig = {
  id: 'quick-owner-change',
  label: 'Change Owner',
  description: 'Transfer primary ownership',
  fields: quickOwnerChangeFields,
  layout: {
    columns: 1,
    fieldLayout: [
      { fieldId: 'currentOwner', colSpan: 1 },
      { fieldId: 'newOwner', colSpan: 1 },
      { fieldId: 'reason', colSpan: 1 },
      { fieldId: 'reasonNotes', colSpan: 1 },
      { fieldId: 'notifyParties', colSpan: 1 },
    ],
  },
};

// ==========================================
// BULK RACI ASSIGNMENT FIELDS
// ==========================================

/**
 * Bulk RACI assignment fields
 */
export const bulkRaciFields: FieldDefinition[] = [
  {
    id: 'entityIds',
    label: 'Selected Entities',
    type: 'tags',
    readonly: true,
    description: 'Entities to update',
  },
  {
    id: 'accountable',
    label: 'Set Accountable To',
    type: 'select',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
      searchable: true,
    },
  },
  {
    id: 'addResponsible',
    label: 'Add Responsible',
    type: 'multiselect',
    description: 'Add to existing responsible',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
    },
  },
  {
    id: 'addConsulted',
    label: 'Add Consulted',
    type: 'multiselect',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
    },
  },
  {
    id: 'addInformed',
    label: 'Add Informed',
    type: 'multiselect',
    config: {
      entityType: 'user',
      labelField: 'fullName',
      valueField: 'id',
    },
  },
  {
    id: 'replaceExisting',
    label: 'Replace Existing',
    type: 'boolean',
    description: 'If checked, replaces existing assignments instead of adding',
  },
];

/**
 * Bulk RACI InputSet
 */
export const bulkRaciInputSet: InputSetConfig = {
  id: 'bulk-raci',
  label: 'Bulk Assignment',
  description: 'Assign same owners to multiple entities',
  fields: bulkRaciFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'entityIds', colSpan: 2 },
      { fieldId: 'accountable', colSpan: 1 },
      { fieldId: 'addResponsible', colSpan: 1 },
      { fieldId: 'addConsulted', colSpan: 1 },
      { fieldId: 'addInformed', colSpan: 1 },
      { fieldId: 'replaceExisting', colSpan: 2 },
    ],
  },
};

// ==========================================
// RACI MATRIX VIEW FIELDS
// ==========================================

/**
 * RACI matrix view fields (for admin/reports)
 */
export const raciMatrixFields: FieldDefinition[] = [
  {
    id: 'entityType',
    label: 'Entity Type',
    type: 'enum',
    config: {
      options: RACI_ENTITY_TYPE_OPTIONS,
    },
  },
  {
    id: 'groupBy',
    label: 'Group By',
    type: 'enum',
    defaultValue: 'user',
    config: {
      options: [
        { value: 'user', label: 'User' },
        { value: 'role', label: 'RACI Role' },
        { value: 'entity', label: 'Entity' },
      ],
    },
  },
  {
    id: 'showEmpty',
    label: 'Show Unassigned',
    type: 'boolean',
    defaultValue: false,
  },
  {
    id: 'dateRange',
    label: 'Date Range',
    type: 'enum',
    defaultValue: 'quarter',
    config: {
      options: [
        { value: 'all', label: 'All Time' },
        { value: 'month', label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' },
        { value: 'year', label: 'This Year' },
      ],
    },
  },
];

/**
 * RACI Matrix InputSet - For admin/reports
 */
export const raciMatrixInputSet: InputSetConfig = {
  id: 'raci-matrix',
  label: 'RACI Matrix View',
  description: 'Matrix view for RACI analysis',
  fields: raciMatrixFields,
  layout: {
    columns: 4,
    fieldLayout: [
      { fieldId: 'entityType', colSpan: 1 },
      { fieldId: 'groupBy', colSpan: 1 },
      { fieldId: 'showEmpty', colSpan: 1 },
      { fieldId: 'dateRange', colSpan: 1 },
    ],
  },
};

export default raciAssignmentInputSet;

