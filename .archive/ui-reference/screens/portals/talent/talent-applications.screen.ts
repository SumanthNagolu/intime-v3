/**
 * My Applications Screen
 *
 * Track application status and history.
 */

import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata/types';

const columns: TableColumnDefinition[] = [
  { id: 'jobTitle', header: 'Position', path: 'jobTitle', type: 'text', width: '25%' },
  { id: 'company', header: 'Company', path: 'company', type: 'text', width: '20%' },
  { id: 'appliedAt', header: 'Applied', path: 'appliedAt', type: 'date', sortable: true },
  {
    id: 'status',
    header: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: [
        { value: 'submitted', label: 'Submitted' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'interviewing', label: 'Interviewing' },
        { value: 'offered', label: 'Offered' },
        { value: 'placed', label: 'Placed' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'withdrawn', label: 'Withdrawn' },
      ],
      badgeColors: {
        submitted: 'blue',
        under_review: 'yellow',
        interviewing: 'purple',
        offered: 'green',
        placed: 'green',
        rejected: 'gray',
        withdrawn: 'gray',
      },
    },
  },
  { id: 'lastActivity', header: 'Last Activity', path: 'lastActivityAt', type: 'datetime', config: { relative: true } },
];

export const talentApplicationsScreen: ScreenDefinition = {
  id: 'talent-applications',
  type: 'list',
  title: 'My Applications',
  subtitle: 'Track your job applications',
  icon: 'FileText',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getApplications',
      params: {},
    },
    pagination: true,
    pageSize: 20,
  },

  layout: {
    type: 'tabs',
    defaultTab: 'active',
    tabs: [
      // ===========================================
      // ACTIVE APPLICATIONS TAB
      // ===========================================
      {
        id: 'active',
        label: 'Active',
        badge: { type: 'count', path: 'stats.activeCount' },
        sections: [
          {
            id: 'active-table',
            type: 'table',
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.talent.getApplications',
                params: { status: 'active' },
              },
            },
            columns_config: columns,
            rowClick: { type: 'navigate', route: '/talent/applications/{{id}}' },
            rowActions: [
              {
                id: 'withdraw',
                label: 'Withdraw',
                type: 'mutation',
                icon: 'X',
                variant: 'destructive',
                config: {
                  type: 'mutation',
                  procedure: 'portal.talent.withdrawApplication',
                  input: { applicationId: { type: 'field', path: 'id' } },
                },
                confirm: {
                  title: 'Withdraw Application?',
                  message: 'Are you sure you want to withdraw this application? This action cannot be undone.',
                  confirmLabel: 'Withdraw',
                  destructive: true,
                },
              },
            ],
            emptyState: {
              title: 'No active applications',
              description: 'Start applying to jobs to see your applications here.',
              icon: 'FileText',
              action: {
                id: 'browse-jobs',
                label: 'Browse Jobs',
                type: 'navigate',
                variant: 'primary',
                config: { type: 'navigate', route: '/talent/jobs' },
              },
            },
          },
        ],
      },

      // ===========================================
      // COMPLETED APPLICATIONS TAB
      // ===========================================
      {
        id: 'completed',
        label: 'Completed',
        badge: { type: 'count', path: 'stats.completedCount' },
        sections: [
          {
            id: 'completed-table',
            type: 'table',
            dataSource: {
              type: 'custom',
              query: {
                procedure: 'portal.talent.getApplications',
                params: { status: 'completed' },
              },
            },
            columns_config: columns,
            rowClick: { type: 'navigate', route: '/talent/applications/{{id}}' },
            emptyState: {
              title: 'No completed applications',
              description: 'Completed applications will appear here.',
              icon: 'FileText',
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'browse-jobs',
      label: 'Browse Jobs',
      type: 'navigate',
      icon: 'Search',
      variant: 'primary',
      config: { type: 'navigate', route: '/talent/jobs' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Talent Portal', route: '/talent' },
      { label: 'My Applications', active: true },
    ],
  },
};

export default talentApplicationsScreen;
