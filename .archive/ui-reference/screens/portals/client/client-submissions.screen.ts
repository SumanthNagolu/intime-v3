/**
 * Client Submissions Review Queue Screen
 *
 * All pending submissions across jobs for client review.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata/types';

const columns: TableColumnDefinition[] = [
  { id: 'candidate', header: 'Candidate', path: 'candidateName', type: 'text', width: '20%' },
  { id: 'job', header: 'Job', path: 'jobTitle', type: 'text', width: '20%' },
  { id: 'matchScore', header: 'Match Score', path: 'matchScore', type: 'progress', config: { max: 100 } },
  { id: 'rate', header: 'Rate', path: 'rate', type: 'currency' },
  { id: 'submittedAt', header: 'Submitted', path: 'submittedAt', type: 'date', sortable: true },
  {
    id: 'status',
    header: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: [
        { value: 'pending', label: 'Pending Review' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'rejected', label: 'Rejected' },
      ],
      badgeColors: { pending: 'yellow', shortlisted: 'blue', rejected: 'gray' },
    },
  },
];

export const clientSubmissionsScreen: ScreenDefinition = {
  id: 'client-submissions',
  type: 'list',
  entityType: 'submission',
  title: 'Candidate Submissions',
  subtitle: 'Review submitted candidates',
  icon: 'Users',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.client.getSubmissions',
      params: {},
    },
    pagination: true,
    pageSize: 20,
  },

  layout: {
    type: 'single-column',
    sections: [
      // ===========================================
      // FILTERS
      // ===========================================
      {
        id: 'filters',
        type: 'field-grid',
        columns: 4,
        inline: true,
        fields: [
          {
            id: 'job-filter',
            type: 'select',
            label: 'Job',
            path: 'filter.jobId',
            config: {
              placeholder: 'All Jobs',
              dataSource: { type: 'custom', query: { procedure: 'portal.client.getJobsForFilter' } },
            },
          },
          {
            id: 'status-filter',
            type: 'select',
            label: 'Status',
            path: 'filter.status',
            config: {
              options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending Review' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'rejected', label: 'Rejected' },
              ],
            },
          },
          {
            id: 'search',
            type: 'text',
            label: 'Search',
            path: 'filter.search',
            config: { placeholder: 'Search candidates...', icon: 'Search' },
          },
        ],
      },

      // ===========================================
      // SUBMISSIONS TABLE
      // ===========================================
      {
        id: 'submissions-table',
        type: 'table',
        columns_config: columns,
        selectable: true,
        rowClick: { type: 'navigate', route: '/client/submissions/{{id}}' },
        rowActions: [
          {
            id: 'shortlist',
            label: 'Shortlist',
            type: 'mutation',
            icon: 'Star',
            config: { type: 'mutation', procedure: 'portal.client.shortlistCandidate', input: { id: { type: 'field', path: 'id' } } },
            visible: { field: 'status', operator: 'eq', value: 'pending' },
          },
          {
            id: 'request-interview',
            label: 'Request Interview',
            type: 'modal',
            icon: 'Calendar',
            config: { type: 'modal', modal: 'RequestInterview', props: { submissionId: { type: 'field', path: 'id' } } },
            visible: { field: 'status', operator: 'in', value: ['pending', 'shortlisted'] },
          },
          {
            id: 'reject',
            label: 'Reject',
            type: 'modal',
            icon: 'X',
            variant: 'destructive',
            config: { type: 'modal', modal: 'RejectCandidate', props: { submissionId: { type: 'field', path: 'id' } } },
            visible: { field: 'status', operator: 'eq', value: 'pending' },
          },
        ],
        emptyState: {
          title: 'No submissions',
          description: 'Candidate submissions will appear here once recruiters submit candidates for your jobs.',
          icon: 'Users',
        },
        pagination: { enabled: true, pageSize: 20 },
      },
    ],
  },

  bulkActions: [
    {
      id: 'bulk-shortlist',
      label: 'Shortlist Selected',
      type: 'mutation',
      icon: 'Star',
      config: { type: 'mutation', procedure: 'portal.client.bulkShortlist', input: { ids: { type: 'selection', path: 'ids' } } },
    },
    {
      id: 'bulk-reject',
      label: 'Reject Selected',
      type: 'modal',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'modal', modal: 'BulkRejectCandidates', props: { ids: { type: 'selection', path: 'ids' } } },
    },
  ],

  actions: [
    {
      id: 'export',
      label: 'Export',
      type: 'custom',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'custom', handler: 'handleExportSubmissions' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Submissions', active: true },
    ],
  },
};

export default clientSubmissionsScreen;
