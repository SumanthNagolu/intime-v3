/**
 * Org Chart Screen Definition
 *
 * Metadata-driven screen for viewing organizational structure.
 *
 * Per docs/specs/20-USER-ROLES/05-hr/00-OVERVIEW.md
 */

import type { ScreenDefinition } from '@/lib/metadata';

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const orgChartScreen: ScreenDefinition = {
  id: 'org-chart',
  type: 'dashboard',

  title: 'Organization Chart',
  subtitle: 'View company structure and reporting lines',
  icon: 'Network',

  // Layout
  layout: {
    type: 'single-column',
    sections: [
      // Org Stats
      {
        id: 'org-stats',
        type: 'metrics-grid',
        columns: 4,
        fields: [
          { id: 'totalEmployees', label: 'Total Employees', type: 'number', path: 'stats.totalEmployees' },
          { id: 'departments', label: 'Departments', type: 'number', path: 'stats.departmentCount' },
          { id: 'managers', label: 'Managers', type: 'number', path: 'stats.managerCount' },
          { id: 'avgTeamSize', label: 'Avg Team Size', type: 'number', path: 'stats.avgTeamSize' },
        ],
        dataSource: {
          type: 'aggregate',
          entityType: 'employee',
        },
      },

      // View Controls
      {
        id: 'view-controls',
        type: 'form',
        inline: true,
        fields: [
          {
            id: 'viewType',
            label: 'View',
            type: 'select',
            path: 'viewType',
            options: [
              { value: 'tree', label: 'Tree View' },
              { value: 'grid', label: 'Grid View' },
              { value: 'list', label: 'List View' },
            ],
            config: { default: 'tree' },
          },
          {
            id: 'department',
            label: 'Department',
            type: 'select',
            path: 'filters.department',
            config: { optionsSource: 'departments', placeholder: 'All Departments' },
          },
          {
            id: 'showVacancies',
            label: 'Show Vacancies',
            type: 'boolean',
            path: 'filters.showVacancies',
          },
          {
            id: 'searchEmployee',
            label: 'Search',
            type: 'text',
            path: 'search',
            config: { placeholder: 'Search by name...' },
          },
        ],
      },

      // Org Chart Component
      {
        id: 'org-chart-view',
        type: 'custom',
        component: 'OrgChartViewer',
        componentProps: {
          rootEntity: 'ceo',
          expandLevel: 3,
          nodeTemplate: 'employee-card',
          allowExpand: true,
          allowCollapse: true,
          showReportCount: true,
          onNodeClick: 'handleNodeClick',
        },
        dataSource: {
          type: 'custom',
          query: {
            procedure: 'hr.employees.getOrgChart',
            params: {},
          },
        },
      },

      // Department Breakdown
      {
        id: 'department-breakdown',
        type: 'table',
        title: 'Department Summary',
        collapsible: true,
        columns_config: [
          { id: 'department', label: 'Department', path: 'name', type: 'text', sortable: true },
          { id: 'head', label: 'Department Head', path: 'head.fullName', type: 'text' },
          { id: 'headCount', label: 'Headcount', path: 'headCount', type: 'number', sortable: true },
          { id: 'openPositions', label: 'Open Positions', path: 'openPositions', type: 'number' },
          { id: 'managers', label: 'Managers', path: 'managerCount', type: 'number' },
        ],
        dataSource: {
          type: 'list',
          entityType: 'department',
          sort: { field: 'name', direction: 'asc' },
        },
        rowClick: {
          type: 'navigate',
          route: '/employee/hr/org-chart?department={{id}}',
        },
      },
    ],
  },

  // Header actions
  actions: [
    {
      id: 'export-chart',
      label: 'Export',
      type: 'custom',
      variant: 'secondary',
      icon: 'Download',
      config: {
        type: 'custom',
        handler: 'handleExportOrgChart',
        args: { formats: ['pdf', 'png', 'csv'] },
      },
    },
    {
      id: 'print-chart',
      label: 'Print',
      type: 'custom',
      variant: 'secondary',
      icon: 'Printer',
      config: {
        type: 'custom',
        handler: 'handlePrintOrgChart',
      },
    },
    {
      id: 'full-screen',
      label: 'Full Screen',
      type: 'custom',
      variant: 'outline',
      icon: 'Maximize2',
      config: {
        type: 'custom',
        handler: 'handleFullScreen',
      },
    },
  ],

  // Keyboard shortcuts
  keyboard_shortcuts: [
    { key: 'f', action: 'handleFullScreen', description: 'Toggle full screen' },
    { key: '+', action: 'handleZoomIn', description: 'Zoom in' },
    { key: '-', action: 'handleZoomOut', description: 'Zoom out' },
    { key: '0', action: 'handleResetZoom', description: 'Reset zoom' },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Dashboard', route: '/employee/hr' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Organization Chart' },
    ],
  },
};

export default orgChartScreen;
