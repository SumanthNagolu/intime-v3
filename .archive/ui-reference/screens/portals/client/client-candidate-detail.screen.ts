/**
 * Client Candidate Detail Screen
 *
 * View candidate profile from client perspective.
 * Shows limited information compared to recruiter view.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const clientCandidateDetailScreen: ScreenDefinition = {
  id: 'client-candidate-detail',
  type: 'detail',
  entityType: 'candidate',
  title: { type: 'field', path: 'fullName' },
  subtitle: { type: 'field', path: 'professionalHeadline' },
  icon: 'User',

  dataSource: {
    type: 'entity',
    entityType: 'candidate',
    entityId: { type: 'param', path: 'id' },
    include: ['skills', 'submissions'],
  },

  layout: {
    type: 'sidebar-main',
    sidebar: {
      type: 'info-card',
      id: 'profile-summary',
      title: 'Profile Summary',
      header: {
        type: 'avatar',
        path: 'avatarUrl',
        fallbackPath: 'initials',
        size: 'lg',
      },
      fields: [
        {
          id: 'status',
          type: 'field',
          path: 'submissionStatus',
          label: 'Status',
          widget: 'SubmissionStatusBadge',
        },
        {
          id: 'divider-1',
          type: 'divider',
        },
        {
          id: 'location',
          type: 'field',
          path: 'location',
          label: 'Location',
        },
        {
          id: 'experience',
          type: 'field',
          path: 'yearsOfExperience',
          label: 'Experience',
          config: { suffix: ' years' },
        },
        {
          id: 'availability',
          type: 'field',
          path: 'availableDate',
          label: 'Available From',
          widget: 'DateDisplay',
        },
      ],
    },
    tabs: [
      // Overview Tab
      {
        id: 'overview',
        label: 'Overview',
        icon: 'User',
        sections: [
          // Professional Summary
          {
            id: 'professional-summary',
            type: 'info-card',
            title: 'Professional Summary',
            fields: [
              { type: 'field', path: 'professionalHeadline', label: 'Title' },
              { type: 'field', path: 'summary', label: 'Summary', widget: 'TextDisplay' },
              { type: 'field', path: 'currentCompany', label: 'Current Company' },
              { type: 'field', path: 'currentTitle', label: 'Current Title' },
            ],
          },

          // Skills
          {
            id: 'skills',
            type: 'info-card',
            title: 'Skills',
            fields: [
              {
                type: 'field',
                path: 'primarySkills',
                label: 'Primary Skills',
                widget: 'SkillTagList',
                config: { variant: 'primary' },
              },
              {
                type: 'field',
                path: 'secondarySkills',
                label: 'Secondary Skills',
                widget: 'SkillTagList',
                config: { variant: 'secondary' },
              },
            ],
          },
        ],
      },

      // Resume Tab
      {
        id: 'resume',
        label: 'Resume',
        icon: 'FileText',
        sections: [
          {
            id: 'resume-viewer',
            type: 'custom',
            component: 'ResumeViewer',
            componentProps: {
              dataPath: 'resume',
              showDownload: true,
            },
          },
        ],
      },

      // Submission History Tab
      {
        id: 'history',
        label: 'History',
        icon: 'Clock',
        sections: [
          {
            id: 'submission-timeline',
            type: 'timeline',
            dataSource: { type: 'related', relation: 'submissionHistory' },
            config: {
              showEvents: true,
              groupByDate: true,
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'schedule-interview',
      label: 'Schedule Interview',
      type: 'modal',
      icon: 'Calendar',
      variant: 'primary',
      config: { type: 'modal', modal: 'schedule-interview' },
    },
    {
      id: 'provide-feedback',
      label: 'Provide Feedback',
      type: 'modal',
      icon: 'MessageSquare',
      variant: 'default',
      config: { type: 'modal', modal: 'candidate-feedback' },
    },
    {
      id: 'reject',
      label: 'Not a Fit',
      type: 'workflow',
      icon: 'X',
      variant: 'ghost',
      config: { type: 'workflow', workflow: 'client-reject-candidate' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Submissions', route: '/client/submissions' },
      { label: { type: 'field', path: 'fullName' }, active: true },
    ],
  },
};

export default clientCandidateDetailScreen;
