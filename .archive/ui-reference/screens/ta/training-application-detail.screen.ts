/**
 * Training Application Detail Screen Definition
 *
 * Detailed application view with:
 * - Applicant information
 * - Application details
 * - Interview scheduling and notes
 * - Approval workflow
 *
 * Routes: /employee/workspace/ta/training/applications/:id
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import {
  TRAINING_APPLICATION_STATUS_OPTIONS,
  TRAINING_PROGRAM_OPTIONS,
} from '@/lib/metadata/options/ta-options';

// ==========================================
// TRAINING APPLICATION DETAIL SCREEN
// ==========================================

export const trainingApplicationDetailScreen: ScreenDefinition = {
  id: 'training-application-detail',
  type: 'detail',
  entityType: 'trainingApplication',
  title: { template: '{applicantName} - {programName}', fields: ['applicantName', 'programName'] },
  icon: 'GraduationCap',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.training.getApplicationById',
      params: { id: { param: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar
    sidebar: {
      id: 'application-sidebar',
      type: 'info-card',
      header: {
        type: 'avatar',
        path: 'applicantName',
        size: 'lg',
        badge: {
          type: 'field',
          path: 'status',
          variant: 'status',
        },
      },
      sections: [
        // Status Progress
        {
          id: 'status-progress',
          type: 'custom',
          component: 'ApplicationStatusProgress',
          componentProps: {
            stages: ['new', 'reviewing', 'interview_scheduled', 'interviewed', 'approved', 'enrolled'],
            currentPath: 'status',
          },
        },

        // Applicant Info
        {
          id: 'applicant-info',
          type: 'field-grid',
          title: 'Applicant',
          icon: 'User',
          columns: 1,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { id: 'name', label: 'Name', path: 'applicantName', type: 'text' },
            { id: 'email', label: 'Email', path: 'applicantEmail', type: 'email' },
            { id: 'phone', label: 'Phone', path: 'applicantPhone', type: 'phone' },
            { id: 'location', label: 'Location', path: 'location', type: 'text' },
          ],
        },

        // Program Info
        {
          id: 'program-info',
          type: 'field-grid',
          title: 'Program',
          icon: 'GraduationCap',
          columns: 1,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { id: 'program', label: 'Program', path: 'programName', type: 'enum', config: { options: TRAINING_PROGRAM_OPTIONS } },
            { id: 'startDate', label: 'Cohort Start', path: 'cohortStartDate', type: 'date', config: { format: 'medium' } },
            { id: 'duration', label: 'Duration', path: 'programDuration', type: 'text' },
          ],
        },

        // Timeline
        {
          id: 'timeline-info',
          type: 'field-grid',
          title: 'Timeline',
          icon: 'Calendar',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'submittedAt', label: 'Submitted', path: 'submittedAt', type: 'date', config: { format: 'full' } },
            { id: 'interviewDate', label: 'Interview', path: 'interviewDate', type: 'date', config: { format: 'full' } },
            { id: 'decisionDate', label: 'Decision', path: 'decisionDate', type: 'date', config: { format: 'full' } },
          ],
        },

        // Assignment
        {
          id: 'assignment-info',
          type: 'field-grid',
          title: 'Assignment',
          icon: 'UserCheck',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'reviewer', label: 'Reviewer', path: 'reviewerName', type: 'user' },
            { id: 'source', label: 'Source', path: 'source', type: 'text' },
          ],
        },
      ],
    },

    // Main Content - Tabs
    tabs: [
      // Application Tab
      {
        id: 'application',
        label: 'Application',
        icon: 'FileText',
        sections: [
          // Background
          {
            id: 'background',
            type: 'info-card',
            title: 'Background',
            icon: 'Briefcase',
            widgets: [
              {
                id: 'education',
                type: 'field',
                label: 'Education',
                path: 'education',
              },
              {
                id: 'experience',
                type: 'field',
                label: 'Work Experience',
                path: 'workExperience',
              },
              {
                id: 'skills',
                type: 'tags',
                label: 'Skills',
                path: 'skills',
              },
            ],
          },

          // Motivation
          {
            id: 'motivation',
            type: 'info-card',
            title: 'Motivation',
            icon: 'Target',
            widgets: [
              {
                id: 'why-program',
                type: 'rich-text',
                label: 'Why this program?',
                path: 'whyProgram',
                config: { readOnly: true },
              },
              {
                id: 'career-goals',
                type: 'rich-text',
                label: 'Career Goals',
                path: 'careerGoals',
                config: { readOnly: true },
              },
            ],
          },

          // Documents
          {
            id: 'documents',
            type: 'table',
            title: 'Documents',
            icon: 'Paperclip',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.training.getApplicationDocuments',
                params: { applicationId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'name', header: 'Document', accessor: 'name', type: 'text' },
              { id: 'type', header: 'Type', accessor: 'documentType', type: 'text' },
              { id: 'uploadedAt', header: 'Uploaded', accessor: 'uploadedAt', type: 'date', config: { format: 'relative' } },
            ],
            rowActions: [
              {
                id: 'download',
                type: 'download',
                label: 'Download',
                icon: 'Download',
                config: { type: 'download', url: { field: 'downloadUrl' } },
              },
              {
                id: 'preview',
                type: 'modal',
                label: 'Preview',
                icon: 'Eye',
                config: { type: 'modal', modal: 'document-preview' },
              },
            ],
            emptyState: {
              title: 'No Documents',
              description: 'No documents uploaded',
              icon: 'Paperclip',
            },
          },
        ],
      },

      // Interview Tab
      {
        id: 'interview',
        label: 'Interview',
        icon: 'Video',
        sections: [
          // Interview Details
          {
            id: 'interview-details',
            type: 'info-card',
            title: 'Interview Details',
            visible: { field: 'interviewDate', operator: 'exists' },
            widgets: [
              {
                id: 'interview-date',
                type: 'field',
                label: 'Date & Time',
                path: 'interviewDate',
                config: { format: 'full' },
              },
              {
                id: 'interview-type',
                type: 'field',
                label: 'Type',
                path: 'interviewType',
              },
              {
                id: 'interviewer',
                type: 'field',
                label: 'Interviewer',
                path: 'interviewerName',
              },
              {
                id: 'meeting-link',
                type: 'link',
                label: 'Meeting Link',
                path: 'meetingLink',
              },
            ],
          },

          // Schedule Interview (if not scheduled)
          {
            id: 'schedule-section',
            type: 'custom',
            title: 'Schedule Interview',
            visible: {
              operator: 'and',
              conditions: [
                { field: 'status', operator: 'in', value: ['new', 'reviewing'] },
                { field: 'interviewDate', operator: 'not_exists' },
              ],
            },
            component: 'InterviewScheduler',
            componentProps: {
              entityType: 'trainingApplication',
              entityIdParam: 'id',
            },
          },

          // Interview Notes
          {
            id: 'interview-notes',
            type: 'form',
            title: 'Interview Notes',
            icon: 'FileText',
            visible: { field: 'status', operator: 'in', value: ['interview_scheduled', 'interviewed', 'approved', 'enrolled'] },
            columns: 1,
            fields: [
              {
                id: 'technicalAssessment',
                label: 'Technical Assessment',
                path: 'technicalAssessment',
                type: 'rating',
                config: { max: 5 },
              },
              {
                id: 'communicationSkills',
                label: 'Communication Skills',
                path: 'communicationSkills',
                type: 'rating',
                config: { max: 5 },
              },
              {
                id: 'motivation',
                label: 'Motivation',
                path: 'motivationRating',
                type: 'rating',
                config: { max: 5 },
              },
              {
                id: 'interviewNotes',
                label: 'Notes',
                path: 'interviewNotes',
                type: 'textarea',
                config: { rows: 6 },
              },
              {
                id: 'recommendation',
                label: 'Recommendation',
                path: 'recommendation',
                type: 'select',
                options: [
                  { value: 'strong_yes', label: 'Strong Yes' },
                  { value: 'yes', label: 'Yes' },
                  { value: 'maybe', label: 'Maybe' },
                  { value: 'no', label: 'No' },
                ],
              },
            ],
            actions: [
              {
                id: 'save-notes',
                type: 'mutation',
                label: 'Save Notes',
                icon: 'Save',
                variant: 'primary',
                config: { type: 'mutation', procedure: 'ta.training.saveInterviewNotes' },
              },
            ],
          },
        ],
      },

      // Decision Tab
      {
        id: 'decision',
        label: 'Decision',
        icon: 'CheckCircle',
        sections: [
          // Decision Form
          {
            id: 'decision-form',
            type: 'form',
            title: 'Make Decision',
            visible: { field: 'status', operator: 'eq', value: 'interviewed' },
            columns: 1,
            fields: [
              {
                id: 'decision',
                label: 'Decision',
                path: 'decision',
                type: 'radio-group',
                options: [
                  { value: 'approve', label: 'Approve', description: 'Approve and offer enrollment' },
                  { value: 'reject', label: 'Reject', description: 'Reject application' },
                  { value: 'waitlist', label: 'Waitlist', description: 'Add to waitlist' },
                ],
                required: true,
              },
              {
                id: 'decisionNotes',
                label: 'Decision Notes',
                path: 'decisionNotes',
                type: 'textarea',
                config: { rows: 4 },
              },
              {
                id: 'cohortId',
                label: 'Assign to Cohort',
                path: 'cohortId',
                type: 'async-select',
                visible: { field: 'decision', operator: 'eq', value: 'approve' },
                config: {
                  procedure: 'ta.training.listCohorts',
                  labelPath: 'name',
                  valuePath: 'id',
                },
              },
            ],
            actions: [
              {
                id: 'submit-decision',
                type: 'mutation',
                label: 'Submit Decision',
                icon: 'Check',
                variant: 'primary',
                config: { type: 'mutation', procedure: 'ta.training.submitDecision' },
              },
            ],
          },

          // Decision History
          {
            id: 'decision-history',
            type: 'info-card',
            title: 'Decision',
            visible: { field: 'status', operator: 'in', value: ['approved', 'rejected', 'enrolled'] },
            widgets: [
              {
                id: 'decision-status',
                type: 'field',
                label: 'Decision',
                path: 'status',
              },
              {
                id: 'decision-date',
                type: 'field',
                label: 'Decision Date',
                path: 'decisionDate',
                config: { format: 'full' },
              },
              {
                id: 'decided-by',
                type: 'field',
                label: 'Decided By',
                path: 'decidedByName',
              },
              {
                id: 'decision-notes',
                type: 'rich-text',
                label: 'Notes',
                path: 'decisionNotes',
              },
            ],
          },
        ],
      },

      // Activity Tab
      {
        id: 'activity',
        label: 'Activity',
        icon: 'Activity',
        sections: [
          {
            id: 'activity-timeline',
            type: 'timeline',
            title: 'Activity History',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.training.getApplicationActivity',
                params: { applicationId: { param: 'id' } },
              },
            },
            config: {
              timestampPath: 'createdAt',
              titlePath: 'event',
              descriptionPath: 'details',
              typePath: 'eventType',
              userPath: 'userName',
            },
          },
        ],
      },
    ],
  },

  // Header Actions
  actions: [
    {
      id: 'schedule-interview',
      type: 'modal',
      label: 'Schedule Interview',
      icon: 'Calendar',
      variant: 'primary',
      visible: { field: 'status', operator: 'in', value: ['new', 'reviewing'] },
      config: {
        type: 'modal',
        modal: 'schedule-training-interview',
        props: { applicationId: { param: 'id' } },
      },
    },
    {
      id: 'mark-interviewed',
      type: 'mutation',
      label: 'Mark Interviewed',
      icon: 'CheckCircle',
      variant: 'primary',
      visible: { field: 'status', operator: 'eq', value: 'interview_scheduled' },
      config: { type: 'mutation', procedure: 'ta.training.markInterviewed' },
    },
    {
      id: 'approve',
      type: 'modal',
      label: 'Approve',
      icon: 'Check',
      variant: 'primary',
      visible: { field: 'status', operator: 'eq', value: 'interviewed' },
      config: {
        type: 'modal',
        modal: 'approve-training-application',
        props: { applicationId: { param: 'id' } },
      },
    },
    {
      id: 'enroll',
      type: 'modal',
      label: 'Enroll',
      icon: 'UserPlus',
      variant: 'primary',
      visible: { field: 'status', operator: 'eq', value: 'approved' },
      config: {
        type: 'modal',
        modal: 'enroll-in-training',
        props: { applicationId: { param: 'id' } },
      },
    },
    {
      id: 'reject',
      type: 'modal',
      label: 'Reject',
      icon: 'X',
      variant: 'destructive',
      visible: { field: 'status', operator: 'nin', value: ['enrolled', 'rejected', 'withdrawn'] },
      config: {
        type: 'modal',
        modal: 'reject-training-application',
        props: { applicationId: { param: 'id' } },
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Applications',
      route: '/employee/workspace/ta/training/applications',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Training', route: '/employee/workspace/ta/training' },
      { label: 'Applications', route: '/employee/workspace/ta/training/applications' },
      { label: { field: 'applicantName' } },
    ],
  },
};

export default trainingApplicationDetailScreen;
