/**
 * Client Interview Detail Screen
 *
 * Interview details with meeting info, candidate summary, and feedback form.
 */

import type { ScreenDefinition } from '@/lib/metadata/types';

export const clientInterviewDetailScreen: ScreenDefinition = {
  id: 'client-interview-detail',
  type: 'detail',
  entityType: 'interview',
  title: { type: 'template', template: 'Interview: {{candidateName}}' },
  subtitle: { type: 'field', path: 'jobTitle' },
  icon: 'Calendar',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.client.getInterviewById',
      params: { id: { type: 'param', path: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',
    sidebar: {
      id: 'interview-info',
      type: 'info-card',
      title: 'Interview Details',
      fields: [
        { id: 'date', label: 'Date', type: 'date', path: 'scheduledAt' },
        { id: 'time', label: 'Time', type: 'time', path: 'scheduledAt' },
        { id: 'duration', label: 'Duration', type: 'text', path: 'duration' },
        { id: 'type', label: 'Type', type: 'text', path: 'interviewType' },
        { id: 'location', label: 'Location', type: 'text', path: 'location' },
        {
          id: 'status',
          label: 'Status',
          type: 'enum',
          path: 'status',
          config: {
            options: [
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'needs_feedback', label: 'Needs Feedback' },
            ],
            badgeColors: {
              scheduled: 'blue',
              completed: 'green',
              cancelled: 'gray',
              needs_feedback: 'orange',
            },
          },
        },
      ],
      actions: [
        {
          id: 'join-meeting',
          label: 'Join Meeting',
          type: 'custom',
          icon: 'Video',
          variant: 'primary',
          config: { type: 'custom', handler: 'handleJoinMeeting', params: { meetingUrl: { type: 'field', path: 'meetingLink' } } },
          visible: {
            type: 'condition',
            condition: {
              operator: 'and',
              conditions: [
                { field: 'status', operator: 'eq', value: 'scheduled' },
                { field: 'meetingLink', operator: 'is_not_empty' },
              ],
            },
          },
        },
        {
          id: 'add-to-calendar',
          label: 'Add to Calendar',
          type: 'custom',
          icon: 'CalendarPlus',
          variant: 'outline',
          config: { type: 'custom', handler: 'handleAddToCalendar' },
          visible: { field: 'status', operator: 'eq', value: 'scheduled' },
        },
      ],
    },
    sections: [
      // ===========================================
      // CANDIDATE SUMMARY
      // ===========================================
      {
        id: 'candidate-summary',
        type: 'info-card',
        title: 'Candidate',
        header: {
          type: 'avatar',
          path: 'candidatePhoto',
          fallbackPath: 'candidateInitials',
          size: 'md',
        },
        fields: [
          { id: 'name', label: 'Name', type: 'text', path: 'candidateName' },
          { id: 'currentTitle', label: 'Current Title', type: 'text', path: 'candidateTitle' },
          { id: 'experience', label: 'Experience', type: 'text', path: 'candidateExperience' },
        ],
        actions: [
          {
            id: 'view-profile',
            label: 'View Full Profile',
            type: 'navigate',
            icon: 'ExternalLink',
            variant: 'ghost',
            config: { type: 'navigate', route: '/client/submissions/{{submissionId}}' },
          },
        ],
      },

      // ===========================================
      // INTERVIEWERS
      // ===========================================
      {
        id: 'interviewers',
        type: 'list',
        title: 'Interviewers',
        dataSource: { type: 'field', path: 'interviewers' },
        config: {
          layout: 'cards',
          columns: 2,
          fields: [
            { id: 'name', label: 'Name', path: 'name' },
            { id: 'title', label: 'Title', path: 'title' },
            { id: 'department', label: 'Department', path: 'department' },
          ],
        },
      },

      // ===========================================
      // PREPARATION MATERIALS
      // ===========================================
      {
        id: 'preparation',
        type: 'info-card',
        title: 'Preparation Materials',
        collapsible: true,
        visible: { field: 'preparationMaterials', operator: 'is_not_empty' },
        fields: [
          { id: 'materials', label: '', type: 'richtext', path: 'preparationMaterials' },
        ],
      },

      // ===========================================
      // FEEDBACK FORM (Post-Interview)
      // ===========================================
      {
        id: 'feedback-form',
        type: 'form',
        title: 'Interview Feedback',
        visible: {
          type: 'condition',
          condition: {
            operator: 'or',
            conditions: [
              { field: 'status', operator: 'eq', value: 'completed' },
              { field: 'status', operator: 'eq', value: 'needs_feedback' },
            ],
          },
        },
        fields: [
          {
            id: 'overall-rating',
            type: 'rating',
            label: 'Overall Rating',
            path: 'feedback.overallRating',
            config: { max: 5, required: true },
          },
          {
            id: 'technical-rating',
            type: 'rating',
            label: 'Technical Skills',
            path: 'feedback.technicalRating',
            config: { max: 5 },
          },
          {
            id: 'communication-rating',
            type: 'rating',
            label: 'Communication',
            path: 'feedback.communicationRating',
            config: { max: 5 },
          },
          {
            id: 'cultural-fit-rating',
            type: 'rating',
            label: 'Cultural Fit',
            path: 'feedback.culturalFitRating',
            config: { max: 5 },
          },
          {
            id: 'strengths',
            type: 'textarea',
            label: 'Strengths',
            path: 'feedback.strengths',
            config: { placeholder: 'What were the candidate\'s key strengths?', rows: 3 },
          },
          {
            id: 'areas-improvement',
            type: 'textarea',
            label: 'Areas for Improvement',
            path: 'feedback.areasForImprovement',
            config: { placeholder: 'What could the candidate improve?', rows: 3 },
          },
          {
            id: 'recommendation',
            type: 'select',
            label: 'Recommendation',
            path: 'feedback.recommendation',
            config: {
              options: [
                { value: 'strong_hire', label: 'Strong Hire' },
                { value: 'hire', label: 'Hire' },
                { value: 'no_hire', label: 'No Hire' },
                { value: 'strong_no_hire', label: 'Strong No Hire' },
                { value: 'need_more_info', label: 'Need More Information' },
              ],
              required: true,
            },
          },
          {
            id: 'additional-comments',
            type: 'textarea',
            label: 'Additional Comments',
            path: 'feedback.additionalComments',
            config: { placeholder: 'Any other comments...', rows: 4 },
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
              procedure: 'portal.client.submitInterviewFeedback',
              input: {
                interviewId: { type: 'field', path: 'id' },
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
      id: 'reschedule',
      label: 'Reschedule',
      type: 'modal',
      icon: 'Calendar',
      variant: 'outline',
      config: { type: 'modal', modal: 'RescheduleInterview', props: { interviewId: { type: 'field', path: 'id' } } },
      visible: { field: 'status', operator: 'eq', value: 'scheduled' },
    },
    {
      id: 'cancel',
      label: 'Cancel Interview',
      type: 'modal',
      icon: 'X',
      variant: 'destructive',
      config: { type: 'modal', modal: 'CancelInterview', props: { interviewId: { type: 'field', path: 'id' } } },
      visible: { field: 'status', operator: 'eq', value: 'scheduled' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Client Portal', route: '/client' },
      { label: 'Interviews', route: '/client/interviews' },
      { label: { type: 'field', path: 'candidateName' }, active: true },
    ],
  },
};

export default clientInterviewDetailScreen;
