/**
 * Pod Detail Screen Definition
 *
 * Metadata-driven screen for viewing pod/team details and performance.
 */

import type { ScreenDefinition, TabDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const POD_TYPE_OPTIONS = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'bench_sales', label: 'Bench Sales' },
  { value: 'ta', label: 'Talent Acquisition' },
];

const PLACEMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
];

// ==========================================
// TAB DEFINITIONS
// ==========================================

const overviewTab: TabDefinition = {
  id: 'overview',
  label: 'Overview',
  icon: 'LayoutDashboard',
  sections: [
    {
      id: 'metrics',
      type: 'metrics-grid',
      columns: 4,
      fields: [
        { id: 'placements', label: 'Placements (MTD)', type: 'number', path: 'stats.placementsMTD' },
        { id: 'revenue', label: 'Revenue (MTD)', type: 'currency', path: 'stats.revenueMTD' },
        { id: 'activeJobs', label: 'Active Jobs', type: 'number', path: 'stats.activeJobs' },
        { id: 'submissions', label: 'Submissions (MTD)', type: 'number', path: 'stats.submissionsMTD' },
      ],
    },
    {
      id: 'recent-activity',
      type: 'table',
      title: 'Recent Activity',
      columns_config: [
        { id: 'date', label: 'Date', path: 'createdAt', type: 'date' },
        { id: 'type', label: 'Activity', path: 'activityType', type: 'text' },
        { id: 'description', label: 'Description', path: 'description', type: 'text' },
        { id: 'user', label: 'By', path: 'user.fullName', type: 'text' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'pod',
        relation: 'activities',
      },
    },
  ],
};

const placementsTab: TabDefinition = {
  id: 'placements',
  label: 'Placements',
  icon: 'Briefcase',
  sections: [
    {
      id: 'placements-table',
      type: 'table',
      title: 'Pod Placements',
      columns_config: [
        { id: 'candidate', label: 'Candidate', path: 'candidate.fullName', type: 'text', sortable: true },
        { id: 'client', label: 'Client', path: 'account.name', type: 'text', sortable: true },
        { id: 'job', label: 'Job Title', path: 'job.title', type: 'text' },
        { id: 'startDate', label: 'Start Date', path: 'startDate', type: 'date', sortable: true },
        { id: 'billRate', label: 'Bill Rate', path: 'billRate', type: 'currency' },
        {
          id: 'status',
          label: 'Status',
          path: 'status',
          type: 'enum',
          config: {
            options: PLACEMENT_STATUS_OPTIONS,
            badgeColors: { active: 'green', completed: 'blue', terminated: 'red' },
          },
        },
      ],
      dataSource: {
        type: 'related',
        entityType: 'pod',
        relation: 'placements',
      },
    },
  ],
};

const jobsTab: TabDefinition = {
  id: 'jobs',
  label: 'Jobs',
  icon: 'FileText',
  sections: [
    {
      id: 'jobs-table',
      type: 'table',
      title: 'Assigned Jobs',
      columns_config: [
        { id: 'title', label: 'Job Title', path: 'title', type: 'text', sortable: true },
        { id: 'client', label: 'Client', path: 'account.name', type: 'text', sortable: true },
        { id: 'openings', label: 'Openings', path: 'openings', type: 'number' },
        { id: 'submissions', label: 'Submissions', path: 'submissionCount', type: 'number' },
        { id: 'status', label: 'Status', path: 'status', type: 'text' },
        { id: 'createdAt', label: 'Created', path: 'createdAt', type: 'date', sortable: true },
      ],
      dataSource: {
        type: 'related',
        entityType: 'pod',
        relation: 'jobs',
      },
    },
  ],
};

const performanceTab: TabDefinition = {
  id: 'performance',
  label: 'Performance',
  icon: 'TrendingUp',
  sections: [
    {
      id: 'sprint-metrics',
      type: 'metrics-grid',
      title: 'Current Sprint',
      columns: 4,
      fields: [
        { id: 'sprintPlacements', label: 'Sprint Placements', type: 'number', path: 'performance.currentSprintPlacements' },
        { id: 'sprintTarget', label: 'Sprint Target', type: 'number', path: 'performance.sprintTarget' },
        { id: 'avgPerSprint', label: 'Avg per Sprint', type: 'number', path: 'performance.avgPlacementsPerSprint' },
        { id: 'daysRemaining', label: 'Days Remaining', type: 'number', path: 'performance.daysRemaining' },
      ],
    },
    {
      id: 'historical-table',
      type: 'table',
      title: 'Sprint History',
      columns_config: [
        { id: 'sprint', label: 'Sprint', path: 'sprintLabel', type: 'text' },
        { id: 'startDate', label: 'Start Date', path: 'startDate', type: 'date' },
        { id: 'endDate', label: 'End Date', path: 'endDate', type: 'date' },
        { id: 'placements', label: 'Placements', path: 'placements', type: 'number' },
        { id: 'target', label: 'Target', path: 'target', type: 'number' },
        { id: 'revenue', label: 'Revenue', path: 'revenue', type: 'currency' },
      ],
      dataSource: {
        type: 'related',
        entityType: 'pod',
        relation: 'sprintHistory',
      },
    },
  ],
};

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const podDetailScreen: ScreenDefinition = {
  id: 'pod-detail',
  type: 'detail',
  entityType: 'pod',

  title: { type: 'field', path: 'name' },
  subtitle: 'Pod Details',
  icon: 'Users2',

  // Data source
  dataSource: {
    type: 'entity',
    entityType: 'pod',
    entityId: { type: 'param', path: 'id' },
  },

  // Layout
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebar: {
      id: 'pod-info',
      type: 'info-card',
      title: 'Pod Information',
      fields: [
        { id: 'name', label: 'Pod Name', type: 'text', path: 'name' },
        {
          id: 'type',
          label: 'Type',
          type: 'enum',
          path: 'podType',
          config: {
            options: POD_TYPE_OPTIONS,
            badgeColors: { recruiting: 'blue', bench_sales: 'purple', ta: 'cyan' },
          },
        },
        { id: 'senior', label: 'Senior Member', type: 'text', path: 'seniorMember.fullName' },
        { id: 'junior', label: 'Junior Member', type: 'text', path: 'juniorMember.fullName' },
        { id: 'formedDate', label: 'Formed Date', type: 'date', path: 'formedDate' },
        { id: 'sprintDuration', label: 'Sprint Duration', type: 'text', path: 'sprintDurationWeeks', config: { suffix: ' weeks' } },
        { id: 'sprintTarget', label: 'Sprint Target', type: 'number', path: 'placementsPerSprintTarget' },
        { id: 'totalPlacements', label: 'Total Placements', type: 'number', path: 'totalPlacements' },
      ],
    },
    tabs: [overviewTab, placementsTab, jobsTab, performanceTab],
    defaultTab: 'overview',
  },

  // Header actions
  actions: [
    {
      id: 'edit',
      label: 'Edit Pod',
      type: 'modal',
      variant: 'secondary',
      icon: 'Pencil',
      config: {
        type: 'modal',
        modal: 'EditPodModal',
        props: { podId: { type: 'param', path: 'id' } },
      },
    },
    {
      id: 'assign-job',
      label: 'Assign Job',
      type: 'modal',
      variant: 'primary',
      icon: 'Plus',
      config: {
        type: 'modal',
        modal: 'AssignJobToPodModal',
        props: { podId: { type: 'param', path: 'id' } },
      },
    },
  ],

  // Navigation
  navigation: {
    back: { label: 'Back to Pods', route: '/employee/hr/pods' },
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Pods', route: '/employee/hr/pods' },
      { label: { type: 'field', path: 'name' } },
    ],
  },
};

export default podDetailScreen;
