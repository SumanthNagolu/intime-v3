/**
 * Saved Jobs Screen
 *
 * Jobs saved by the candidate for later.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata/types';

const columns: TableColumnDefinition[] = [
  { id: 'title', header: 'Position', path: 'title', type: 'text', width: '25%' },
  { id: 'company', header: 'Company', path: 'company', type: 'text', width: '20%' },
  { id: 'location', header: 'Location', type: 'text', path: 'location' },
  { id: 'rate', header: 'Rate', path: 'rateRange', type: 'text' },
  { id: 'matchScore', header: 'Match', path: 'matchScore', type: 'progress', config: { max: 100 } },
  { id: 'savedAt', header: 'Saved', path: 'savedAt', type: 'date', sortable: true },
];

export const talentSavedJobsScreen: ScreenDefinition = {
  id: 'talent-saved-jobs',
  type: 'list',
  entityType: 'job',
  title: 'Saved Jobs',
  subtitle: 'Jobs you\'ve saved for later',
  icon: 'Bookmark',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getSavedJobs',
      params: {},
    },
    pagination: true,
    pageSize: 20,
  },

  layout: {
    type: 'single-column',
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
                { value: 'savedAt', label: 'Date Saved' },
                { value: 'matchScore', label: 'Match Score' },
                { value: 'postedAt', label: 'Date Posted' },
              ],
            },
          },
        ],
      },

      // ===========================================
      // SAVED JOBS TABLE/CARDS
      // ===========================================
      {
        id: 'saved-jobs',
        type: 'custom',
        component: 'JobCardsList',
        componentProps: {
          showMatchScore: true,
          showQuickApply: true,
          showUnsaveButton: true,
          layout: 'cards',
        },
        rowClick: { type: 'navigate', route: '/talent/jobs/{{id}}' },
        rowActions: [
          {
            id: 'quick-apply',
            label: 'Apply',
            type: 'navigate',
            icon: 'Send',
            variant: 'primary',
            config: { type: 'navigate', route: '/talent/jobs/{{id}}/apply' },
          },
          {
            id: 'unsave',
            label: 'Remove',
            type: 'mutation',
            icon: 'BookmarkX',
            variant: 'ghost',
            config: { type: 'mutation', procedure: 'portal.talent.unsaveJob', input: { jobId: { type: 'field', path: 'id' } } },
          },
        ],
        emptyState: {
          title: 'No saved jobs',
          description: 'Save jobs while browsing to apply later.',
          icon: 'Bookmark',
          action: {
            id: 'browse-jobs',
            label: 'Browse Jobs',
            type: 'navigate',
            variant: 'primary',
            config: { type: 'navigate', route: '/talent/jobs' },
          },
        },
        pagination: { enabled: true, pageSize: 20 },
      },
    ],
  },

  actions: [
    {
      id: 'browse-jobs',
      label: 'Browse More Jobs',
      type: 'navigate',
      icon: 'Search',
      variant: 'primary',
      config: { type: 'navigate', route: '/talent/jobs' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'Saved Jobs', active: true },
    ],
  },
};

export default talentSavedJobsScreen;
