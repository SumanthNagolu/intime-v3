/**
 * Benefits List Screen Definition
 *
 * Metadata-driven screen for managing benefits plans and enrollments.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const BENEFIT_TYPE_OPTIONS = [
  { value: 'health', label: 'Health' },
  { value: 'dental', label: 'Dental' },
  { value: 'vision', label: 'Vision' },
  { value: '401k', label: '401(k)' },
  { value: 'hsa', label: 'HSA' },
  { value: 'life', label: 'Life Insurance' },
];

const PLAN_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const benefitsListScreen: ScreenDefinition = {
  id: 'benefits-list',
  type: 'list',
  entityType: 'benefit_plan',

  title: 'Benefits Management',
  subtitle: 'Manage benefit plans and enrollments',
  icon: 'Heart',

  // Data source
  dataSource: {
    type: 'list',
    entityType: 'benefit_plan',
    pagination: true,
    limit: 25,
  },

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Metrics
      {
        id: 'metrics',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'totalPlans', label: 'Total Plans', type: 'number', path: 'stats.total' },
          { id: 'activePlans', label: 'Active Plans', type: 'number', path: 'stats.active' },
          { id: 'enrollments', label: 'Total Enrollments', type: 'number', path: 'stats.enrollments' },
          { id: 'openEnrollment', label: 'Open Enrollment', type: 'boolean', path: 'stats.openEnrollment' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'benefit_plan',
        },
      },
      // Plans Table
      {
        id: 'plans-table',
        type: 'table',
        title: 'Benefit Plans',
        columns_config: [
          { id: 'name', label: 'Plan Name', path: 'name', type: 'text', sortable: true },
          {
            id: 'type',
            label: 'Type',
            path: 'type',
            type: 'enum',
            config: { options: BENEFIT_TYPE_OPTIONS },
          },
          { id: 'provider', label: 'Provider', path: 'provider', type: 'text' },
          { id: 'employerContribution', label: 'Employer Cost', path: 'employerContribution', type: 'currency' },
          { id: 'enrollmentCount', label: 'Enrollees', path: 'enrollmentCount', type: 'number' },
          {
            id: 'status',
            label: 'Status',
            path: 'status',
            type: 'enum',
            config: {
              options: PLAN_STATUS_OPTIONS,
              badgeColors: { active: 'green', inactive: 'gray' },
            },
          },
        ],
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'create-plan',
      label: 'Add Plan',
      type: 'modal',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'CreateBenefitPlanModal',
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Benefits' },
    ],
  },
};

export default benefitsListScreen;
