/**
 * Submission Pipeline Screen
 * 
 * Kanban-style view of candidate submissions through various stages.
 * Supports drag-and-drop, filtering, and quick actions.
 * 
 * @see docs/specs/20-USER-ROLES/01-recruiter/08-manage-pipeline.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const submissionPipelineScreen: ScreenDefinition = {
  id: 'submission-pipeline',
  type: 'list-detail',
  entityType: 'submission',
  title: 'Submission Pipeline',
  icon: 'Kanban',

  dataSource: {
    type: 'list',
    entityType: 'submission',
    filter: {
      status: { operator: 'nin', value: ['withdrawn', 'archived'] },
      recruiter_id: { operator: 'eq', value: { type: 'context', path: 'user.id' } },
    },
    include: ['candidate', 'job', 'job.account', 'activities'],
    sort: { field: 'updated_at', direction: 'desc' },
  },

  layout: {
    type: 'single-column',
    sections: [
      // Filters Bar - Custom widget with real data fetching
      {
        id: 'filters',
        type: 'custom',
        title: '',
        component: 'PipelineFilters',
        componentProps: {},
      },

      // Kanban Board
      {
        id: 'kanban',
        type: 'custom',
        component: 'KanbanBoard',
        componentProps: {
          entityType: 'submission',
          statusField: 'status',
          columns: [
            {
              id: 'submitted',
              title: 'Submitted',
              status: 'submitted',
              color: 'blue',
              wipLimit: 15,
            },
            {
              id: 'client_review',
              title: 'Client Review',
              status: 'client_review',
              color: 'purple',
              wipLimit: 10,
            },
            {
              id: 'interview_scheduled',
              title: 'Interview Scheduled',
              status: 'interview_scheduled',
              color: 'indigo',
              wipLimit: 8,
            },
            {
              id: 'interview_completed',
              title: 'Interview Completed',
              status: 'interview_completed',
              color: 'cyan',
              wipLimit: 5,
            },
            {
              id: 'offer_pending',
              title: 'Offer Pending',
              status: 'offer_pending',
              color: 'amber',
              wipLimit: 5,
            },
            {
              id: 'placed',
              title: 'Placed',
              status: 'placed',
              color: 'green',
            },
          ],
          cardTemplate: {
            title: { type: 'field', path: 'candidate.fullName' },
            subtitle: { type: 'field', path: 'job.title' },
            fields: [
              { path: 'job.account.name', icon: 'Building2' },
              { path: 'updatedAt', type: 'relative-time', icon: 'Clock' },
            ],
            badges: [
              { 
                type: 'priority', 
                path: 'priority',
                visible: { field: 'priority', operator: 'in', value: ['urgent', 'high'] },
              },
              {
                type: 'sla',
                path: 'slaStatus',
                visible: { field: 'slaStatus', operator: 'ne', value: 'met' },
              },
              {
                type: 'activity-count',
                path: 'overdueActivitiesCount',
                visible: { field: 'overdueActivitiesCount', operator: 'gt', value: 0 },
              },
            ],
            avatar: { type: 'field', path: 'candidate.avatarUrl' },
          },
          dragEnabled: true,
          onDragEnd: 'updateSubmissionStatus',
          onCardClick: 'openSubmissionDetail',
        },
      },
    ],
  },

  actions: [
    {
      id: 'create-submission',
      label: 'New Submission',
      type: 'modal',
      icon: 'Plus',
      variant: 'primary',
      config: { type: 'modal', modal: 'submission-create' },
    },
    {
      id: 'bulk-update',
      label: 'Bulk Update',
      type: 'modal',
      icon: 'Edit',
      variant: 'default',
      config: { type: 'modal', modal: 'submission-bulk-update' },
      visible: {
        type: 'condition',
        condition: { field: 'selectedCount', operator: 'gt', value: 0 },
      },
    },
    {
      id: 'export',
      label: 'Export',
      type: 'function',
      icon: 'Download',
      variant: 'ghost',
      config: { type: 'function', handler: 'exportSubmissions' },
    },
    {
      id: 'toggle-view',
      label: 'Table View',
      type: 'navigate',
      icon: 'Table',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/submissions?view=table' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Submissions', active: true },
    ],
  },
};

export default submissionPipelineScreen;

