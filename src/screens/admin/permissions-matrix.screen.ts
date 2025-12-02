/**
 * Permissions Matrix Screen Definition
 *
 * Full organization-wide view of all permissions across all roles.
 * Matrix view showing roles vs entities vs operations.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const ENTITY_TYPE_OPTIONS = [
  { value: 'job', label: 'Jobs' },
  { value: 'candidate', label: 'Candidates' },
  { value: 'submission', label: 'Submissions' },
  { value: 'interview', label: 'Interviews' },
  { value: 'placement', label: 'Placements' },
  { value: 'account', label: 'Accounts' },
  { value: 'contact', label: 'Contacts' },
  { value: 'lead', label: 'Leads' },
  { value: 'deal', label: 'Deals' },
  { value: 'activity', label: 'Activities' },
  { value: 'consultant', label: 'Consultants' },
  { value: 'hotlist', label: 'Hotlists' },
  { value: 'user', label: 'Users' },
  { value: 'pod', label: 'Pods' },
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'recruiting_manager', label: 'Recruiting Manager' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'bench_sales_manager', label: 'Bench Sales Manager' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'ta', label: 'Talent Acquisition' },
  { value: 'cfo', label: 'CFO' },
  { value: 'coo', label: 'COO' },
  { value: 'ceo', label: 'CEO' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const permissionsMatrixScreen: ScreenDefinition = {
  id: 'permissions-matrix',
  type: 'dashboard',
  // entityType: 'role', // Admin entity

  title: 'Permissions Matrix',
  subtitle: 'Organization-wide permissions overview',
  icon: 'Grid',

  // Permissions
  permissions: [],

  // Data source
  dataSource: {
    type: 'custom',
    query: {
      procedure: 'admin.permissions.getMatrix',
      params: {},
    },
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Filters
      {
        id: 'filters',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'roles',
            label: 'Roles',
            type: 'multiselect',
            path: 'filters.roles',
            options: [...ROLE_OPTIONS],
            config: { placeholder: 'All roles' },
          },
          {
            id: 'entities',
            label: 'Entities',
            type: 'multiselect',
            path: 'filters.entities',
            options: [...ENTITY_TYPE_OPTIONS],
            config: { placeholder: 'All entities' },
          },
          {
            id: 'showInherited',
            label: 'Show inherited permissions',
            type: 'checkbox',
            path: 'filters.showInherited',
            config: { defaultValue: true },
          },
        ],
      },
      // Full Matrix View
      {
        id: 'matrix',
        type: 'custom',
        component: 'FullPermissionsMatrix',
        componentProps: {
          editable: false,
          showLegend: true,
          exportable: true,
          groupByEntity: true,
          scopes: ['none', 'own', 'pod', 'org'],
          operations: ['create', 'read', 'update', 'delete'],
        },
      },
      // Legend
      {
        id: 'legend',
        type: 'info-card',
        title: 'Legend',
        columns: 4,
        fields: [
          {
            id: 'none',
            label: 'None',
            type: 'text',
            path: 'legend.none',
            config: { description: 'No access to this entity' },
          },
          {
            id: 'own',
            label: 'Own',
            type: 'text',
            path: 'legend.own',
            config: { description: 'Access only to records created by self' },
          },
          {
            id: 'pod',
            label: 'Pod',
            type: 'text',
            path: 'legend.pod',
            config: { description: 'Access to all records within assigned pod' },
          },
          {
            id: 'org',
            label: 'Organization',
            type: 'text',
            path: 'legend.org',
            config: { description: 'Full access to all records in organization' },
          },
        ],
      },
      // Role Comparison
      {
        id: 'role-comparison',
        type: 'custom',
        title: 'Role Comparison',
        description: 'Compare permissions between two roles',
        component: 'RoleComparisonTool',
        componentProps: {
          roles: ROLE_OPTIONS,
        },
        collapsible: true,
        collapsed: true,
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'export',
      type: 'custom',
      label: 'Export Matrix',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExportPermissionsMatrix' },
    },
    {
      id: 'print',
      type: 'custom',
      label: 'Print',
      variant: 'secondary',
      icon: 'Printer',
      config: { type: 'custom', handler: 'handlePrint' },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Roles', route: '/admin/roles' },
    breadcrumbs: [
      { label: 'Admin', route: '/admin' },
      { label: 'Roles', route: '/admin/roles' },
      { label: 'Permissions Matrix' },
    ],
  },
};

export default permissionsMatrixScreen;
