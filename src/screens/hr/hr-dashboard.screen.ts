/**
 * HR Dashboard Screen Definition
 *
 * Metadata-driven screen for the HR dashboard overview.
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const hrDashboardScreen: ScreenDefinition = {
  id: 'hr-dashboard',
  type: 'dashboard',

  title: 'HR Dashboard',
  subtitle: 'People operations overview',
  icon: 'Users',

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
          { id: 'totalEmployees', label: 'Total Employees', type: 'number', path: 'stats.total' },
          { id: 'activeEmployees', label: 'Active', type: 'number', path: 'stats.active' },
          { id: 'onboarding', label: 'Onboarding', type: 'number', path: 'stats.onboarding' },
          { id: 'pendingApprovals', label: 'Pending Approvals', type: 'number', path: 'stats.pendingApprovals' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'employee',
        },
      },
      // Recent Activity
      {
        id: 'recent-hires',
        type: 'table',
        title: 'Recent Hires',
        columns_config: [
          { id: 'name', label: 'Name', path: 'fullName', type: 'text' },
          { id: 'department', label: 'Department', path: 'department', type: 'text' },
          { id: 'hireDate', label: 'Hire Date', path: 'hireDate', type: 'date' },
        ],
        dataSource: {
          type: 'list',
          entityType: 'employee',
          limit: 5,
        },
      },
      // Pending PTO
      {
        id: 'pending-pto',
        type: 'table',
        title: 'Pending Time Off Requests',
        columns_config: [
          { id: 'employee', label: 'Employee', path: 'employee.fullName', type: 'text' },
          { id: 'type', label: 'Type', path: 'type', type: 'text' },
          { id: 'startDate', label: 'Start', path: 'startDate', type: 'date' },
          { id: 'endDate', label: 'End', path: 'endDate', type: 'date' },
          { id: 'hours', label: 'Hours', path: 'hours', type: 'number' },
        ],
        dataSource: {
          type: 'list',
          entityType: 'timeoff',
          filter: { status: 'pending' },
          limit: 5,
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'add-employee',
      label: 'Add Employee',
      type: 'navigate',
      variant: 'primary',
      icon: 'UserPlus',
      config: {
        type: 'navigate',
        route: '/employee/hr/people/new',
      },
    },
  ],

  // Navigation
  navigation: {
    breadcrumbs: [
      { label: 'HR' },
    ],
  },
};

export default hrDashboardScreen;
