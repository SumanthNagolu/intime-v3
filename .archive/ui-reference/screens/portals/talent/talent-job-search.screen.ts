/**
 * Job Search Screen
 *
 * Browse and search jobs with filters and job cards.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata/types';

export const talentJobSearchScreen: ScreenDefinition = {
  id: 'talent-job-search',
  type: 'list',
  entityType: 'job',
  title: 'Find Jobs',
  subtitle: 'Browse open positions',
  icon: 'Search',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.searchJobs',
      params: {},
    },
    pagination: true,
    pageSize: 20,
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',
    sidebar: {
      id: 'filters',
      type: 'form',
      title: 'Filters',
      fields: [
        {
          id: 'search',
          type: 'text',
          label: 'Keywords',
          path: 'filter.search',
          config: { placeholder: 'Job title, skills, or keywords...', icon: 'Search' },
        },
        {
          id: 'jobType',
          type: 'multiselect',
          label: 'Job Type',
          path: 'filter.jobType',
          config: {
            options: [
              { value: 'contract', label: 'Contract' },
              { value: 'fte', label: 'Full-Time' },
              { value: 'c2h', label: 'Contract-to-Hire' },
            ],
          },
        },
        {
          id: 'workMode',
          type: 'multiselect',
          label: 'Work Mode',
          path: 'filter.workMode',
          config: {
            options: [
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'onsite', label: 'On-site' },
            ],
          },
        },
        {
          id: 'location',
          type: 'text',
          label: 'Location',
          path: 'filter.location',
          config: { placeholder: 'City, State or Zip' },
        },
        {
          id: 'radius',
          type: 'select',
          label: 'Distance',
          path: 'filter.radius',
          config: {
            options: [
              { value: '10', label: '10 miles' },
              { value: '25', label: '25 miles' },
              { value: '50', label: '50 miles' },
              { value: '100', label: '100 miles' },
              { value: 'any', label: 'Any distance' },
            ],
          },
        },
        {
          id: 'salaryMin',
          type: 'number',
          label: 'Min Rate/Salary',
          path: 'filter.salaryMin',
          config: { prefix: '$' },
        },
        {
          id: 'skills',
          type: 'tags',
          label: 'Required Skills',
          path: 'filter.skills',
          config: { placeholder: 'Add skills...' },
        },
        {
          id: 'postedWithin',
          type: 'select',
          label: 'Posted Within',
          path: 'filter.postedWithin',
          config: {
            options: [
              { value: '1', label: 'Last 24 hours' },
              { value: '7', label: 'Last 7 days' },
              { value: '14', label: 'Last 14 days' },
              { value: '30', label: 'Last 30 days' },
              { value: 'any', label: 'Any time' },
            ],
          },
        },
      ],
      actions: [
        {
          id: 'clear-filters',
          label: 'Clear All',
          type: 'custom',
          variant: 'ghost',
          config: { type: 'custom', handler: 'clearFilters' },
        },
      ],
    },
    sections: [
      // ===========================================
      // SORT OPTIONS
      // ===========================================
      {
        id: 'sort-options',
        type: 'field-grid',
        columns: 2,
        inline: true,
        fields: [
          {
            id: 'sort',
            type: 'select',
            label: 'Sort by',
            path: 'sort.field',
            config: {
              options: [
                { value: 'relevance', label: 'Relevance' },
                { value: 'date', label: 'Date Posted' },
                { value: 'salary', label: 'Salary' },
                { value: 'match', label: 'Match Score' },
              ],
            },
          },
          {
            id: 'results-count',
            type: 'custom',
            label: '',
            path: 'totalResults',
            config: { template: '{{value}} jobs found' },
          },
        ],
      },

      // ===========================================
      // JOB CARDS LIST
      // ===========================================
      {
        id: 'job-list',
        type: 'custom',
        component: 'JobCardsList',
        componentProps: {
          showMatchScore: true,
          showQuickApply: true,
          showSaveButton: true,
          layout: 'cards',
        },
        rowClick: { type: 'navigate', route: '/talent/jobs/{{id}}' },
        emptyState: {
          title: 'No jobs found',
          description: 'Try adjusting your filters or search terms.',
          icon: 'Briefcase',
          action: {
            id: 'clear-filters',
            label: 'Clear Filters',
            type: 'custom',
            variant: 'outline',
            config: { type: 'custom', handler: 'clearFilters' },
          },
        },
        pagination: { enabled: true, pageSize: 20 },
      },
    ],
  },

  actions: [
    {
      id: 'save-search',
      label: 'Save Search',
      type: 'modal',
      icon: 'Bookmark',
      variant: 'outline',
      config: { type: 'modal', modal: 'SaveJobSearch' },
    },
    {
      id: 'set-alert',
      label: 'Set Job Alert',
      type: 'modal',
      icon: 'Bell',
      variant: 'outline',
      config: { type: 'modal', modal: 'CreateJobAlert' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Job Search', active: true },
    ],
  },
};

export default talentJobSearchScreen;
