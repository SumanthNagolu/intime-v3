/**
 * Client Submission Detail Screen
 *
 * Candidate review screen with profile, resume, skills match, and actions.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const clientSubmissionDetailScreen: ScreenDefinition = {
  id: 'client-submission-detail',
  type: 'detail',
  entityType: 'submission',
  title: { type: 'field', path: 'candidateName' },
  subtitle: { type: 'template', template: 'Submitted for {{jobTitle}}' },
  icon: 'User',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.client.getSubmissionById',
      params: { id: { type: 'param', path: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',
    sidebar: {
      id: 'candidate-summary',
      type: 'info-card',
      header: {
        type: 'avatar',
        path: 'candidatePhoto',
        fallbackPath: 'candidateInitials',
        size: 'lg',
      },
      fields: [
        { id: 'name', label: 'Name', type: 'text', path: 'candidateName' },
        { id: 'location', label: 'Location', type: 'text', path: 'location' },
        { id: 'experience', label: 'Experience', type: 'text', path: 'yearsExperience' },
        { id: 'availability', label: 'Availability', type: 'text', path: 'availability' },
        { id: 'rate', label: 'Rate', type: 'currency', path: 'rate' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: [
              { value: 'pending', label: 'Pending Review' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'interviewing', label: 'Interviewing' },
              { value: 'offered', label: 'Offered' },
              { value: 'rejected', label: 'Rejected' },
            ],
            badgeColors: {
              pending: 'yellow',
              shortlisted: 'blue',
              interviewing: 'purple',
              offered: 'green',
              rejected: 'gray',
            },
          },
        },
      ],
      footer: {
        type: 'quality-score',
        label: 'Match Score',
        path: 'matchScore',
        maxValue: 100,
      },
    },
    sections: [
      // ===========================================
      // SKILLS MATCH
      // ===========================================
      {
        id: 'skills-match',
        type: 'custom',
        title: 'Skills Match',
        component: 'SkillsMatchMatrix',
        componentProps: {
          showMatchIndicators: true,
          requiredSkillsPath: 'job.skills',
          candidateSkillsPath: 'candidateSkills',
        },
      },

      // ===========================================
      // RESUME VIEWER
      // ===========================================
      {
        id: 'resume',
        type: 'custom',
        title: 'Resume',
        component: 'ResumeViewer',
        componentProps: {
          resumeUrl: { type: 'field', path: 'resumeUrl' },
          allowDownload: true,
        },
      },

      // ===========================================
      // WORK HISTORY
      // ===========================================
      {
        id: 'work-history',
        type: 'list',
        title: 'Work History',
        dataSource: { type: 'field', path: 'workHistory' },
        config: {
          layout: 'timeline',
          fields: [
            { id: 'company', label: 'Company', path: 'company' },
            { id: 'title', label: 'Title', path: 'title' },
            { id: 'duration', label: 'Duration', path: 'duration' },
            { id: 'description', label: 'Description', path: 'description' },
          ],
        },
      },

      // ===========================================
      // SCREENING ANSWERS
      // ===========================================
      {
        id: 'screening-answers',
        type: 'info-card',
        title: 'Screening Questions',
        visible: { field: 'screeningAnswers.length', operator: 'gt', value: 0 },
        fields: [
          {
            id: 'answers',
            type: 'list',
            path: 'screeningAnswers',
            config: {
              itemFields: [
                { id: 'question', label: 'Q', path: 'question' },
                { id: 'answer', label: 'A', path: 'answer' },
              ],
            },
          },
        ],
      },

      // ===========================================
      // FEEDBACK FORM
      // ===========================================
      {
        id: 'feedback-form',
        type: 'form',
        title: 'Your Feedback',
        visible: { field: 'status', operator: 'eq', value: 'pending' },
        fields: [
          {
            id: 'decision',
            type: 'select',
            label: 'Decision',
            path: 'feedback.decision',
            config: {
              options: [
                { value: 'shortlist', label: 'Shortlist for Interview' },
                { value: 'reject', label: 'Reject' },
                { value: 'needs_discussion', label: 'Need to Discuss' },
              ],
              required: true,
            },
          },
          {
            id: 'comments',
            type: 'textarea',
            label: 'Comments',
            path: 'feedback.comments',
            config: { placeholder: 'Add your feedback...', rows: 4 },
          },
        ],
        actions: [
          {
            id: 'submit-feedback',
            label: 'Submit Feedback',
            type: 'mutation',
            variant: 'primary',
            config: {
              type: 'mutation',
              procedure: 'portal.client.submitFeedback',
              input: {
                submissionId: { type: 'field', path: 'id' },
                feedback: { type: 'context', path: 'formState.values' },
              },
            },
          },
        ],
      },
    ],
  },

  actions: [
    {
      id: 'shortlist',
      label: 'Shortlist',
      type: 'mutation',
      icon: 'Star',
      variant: 'primary',
      config: { type: 'mutation', procedure: 'portal.client.shortlistCandidate', input: { id: { type: 'field', path: 'id' } } },
      visible: { field: 'status', operator: 'eq', value: 'pending' },
    },
    {
      id: 'request-interview',
      label: 'Request Interview',
      type: 'modal',
      icon: 'Calendar',
      variant: 'default',
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
      visible: { field: 'status', operator: 'in', value: ['pending', 'shortlisted'] },
    },
    {
      id: 'download-resume',
      label: 'Download Resume',
      type: 'download',
      icon: 'Download',
      variant: 'outline',
      config: { type: 'download', url: { type: 'field', path: 'resumeUrl' }, filename: 'resume.pdf' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Submissions', route: '/client/submissions' },
      { label: { type: 'field', path: 'candidateName' }, active: true },
    ],
  },
};

export default clientSubmissionDetailScreen;
