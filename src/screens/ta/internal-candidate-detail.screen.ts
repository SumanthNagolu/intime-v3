/**
 * Internal Candidate Detail Screen Definition
 *
 * Detailed view for internal hire candidates with:
 * - Candidate profile and resume
 * - Application details
 * - Interview schedule and feedback
 * - Offer management
 * - Onboarding checklist (after acceptance)
 *
 * Routes: /employee/workspace/ta/internal-candidates/:id
 *
 * @see docs/specs/20-USER-ROLES/03-ta/03-internal-hiring.md
 */

import type { ScreenDefinition } from '@/lib/metadata/types/screen.types';
import { INTERNAL_CANDIDATE_STAGE_OPTIONS } from '@/lib/metadata/options/ta-options';

// ==========================================
// INTERNAL CANDIDATE DETAIL SCREEN
// ==========================================

export const internalCandidateDetailScreen: ScreenDefinition = {
  id: 'internal-candidate-detail',
  type: 'detail',
  entityType: 'internalCandidate',
  title: { field: 'name' },
  subtitle: { template: 'Applying for: {jobTitle}', fields: ['jobTitle'] },
  icon: 'User',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'ta.internalCandidates.getById',
      params: { id: { param: 'id' } },
    },
  },

  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'md',
    sidebarPosition: 'left',

    // Sidebar
    sidebar: {
      id: 'candidate-sidebar',
      type: 'info-card',
      header: {
        type: 'avatar',
        path: 'name',
        size: 'lg',
        badge: {
          type: 'field',
          path: 'stage',
          variant: 'status',
        },
      },
      sections: [
        // Stage Progress
        {
          id: 'stage-progress',
          type: 'custom',
          component: 'CandidateStageProgress',
          componentProps: {
            stages: INTERNAL_CANDIDATE_STAGE_OPTIONS,
            currentPath: 'stage',
          },
        },

        // Contact Info
        {
          id: 'contact-info',
          type: 'field-grid',
          title: 'Contact',
          icon: 'Contact',
          columns: 1,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            { id: 'email', label: 'Email', path: 'email', type: 'email' },
            { id: 'phone', label: 'Phone', path: 'phone', type: 'phone' },
            { id: 'linkedin', label: 'LinkedIn', path: 'linkedinUrl', type: 'link' },
            { id: 'location', label: 'Location', path: 'location', type: 'text' },
          ],
        },

        // Job Details
        {
          id: 'job-info',
          type: 'field-grid',
          title: 'Position',
          icon: 'Briefcase',
          columns: 1,
          collapsible: true,
          defaultExpanded: true,
          fields: [
            {
              id: 'job',
              label: 'Job',
              path: 'jobTitle',
              type: 'link',
              config: { route: '/employee/workspace/ta/internal-jobs/{jobId}' },
            },
            { id: 'department', label: 'Department', path: 'department', type: 'text' },
            { id: 'hiringManager', label: 'Hiring Manager', path: 'hiringManagerName', type: 'user' },
          ],
        },

        // Application Info
        {
          id: 'application-info',
          type: 'field-grid',
          title: 'Application',
          icon: 'FileText',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'source', label: 'Source', path: 'source', type: 'text' },
            { id: 'appliedAt', label: 'Applied', path: 'appliedAt', type: 'date', config: { format: 'full' } },
            { id: 'referredBy', label: 'Referred By', path: 'referredByName', type: 'text' },
            { id: 'recruiter', label: 'Recruiter', path: 'recruiterName', type: 'user' },
          ],
        },

        // Key Dates
        {
          id: 'key-dates',
          type: 'field-grid',
          title: 'Key Dates',
          icon: 'Calendar',
          columns: 1,
          collapsible: true,
          fields: [
            { id: 'nextInterview', label: 'Next Interview', path: 'nextInterviewDate', type: 'date', config: { format: 'full' } },
            { id: 'expectedDecision', label: 'Expected Decision', path: 'expectedDecisionDate', type: 'date', config: { format: 'medium' } },
            { id: 'targetStart', label: 'Target Start', path: 'targetStartDate', type: 'date', config: { format: 'medium' } },
          ],
        },
      ],
    },

    // Main Content - Tabs
    tabs: [
      // Profile Tab
      {
        id: 'profile',
        label: 'Profile',
        icon: 'User',
        sections: [
          // Resume
          {
            id: 'resume',
            type: 'custom',
            title: 'Resume',
            icon: 'FileText',
            component: 'ResumeViewer',
            componentProps: {
              resumePath: 'resumeUrl',
              parsedDataPath: 'parsedResume',
            },
          },

          // Work History
          {
            id: 'work-history',
            type: 'table',
            title: 'Work Experience',
            icon: 'Briefcase',
            dataSource: {
              type: 'inline',
              path: 'workHistory',
            },
            columns_config: [
              { id: 'company', header: 'Company', accessor: 'company', type: 'text' },
              { id: 'title', header: 'Title', accessor: 'title', type: 'text' },
              { id: 'duration', header: 'Duration', accessor: 'duration', type: 'text' },
              { id: 'location', header: 'Location', accessor: 'location', type: 'text' },
            ],
          },

          // Education
          {
            id: 'education',
            type: 'table',
            title: 'Education',
            icon: 'GraduationCap',
            dataSource: {
              type: 'inline',
              path: 'education',
            },
            columns_config: [
              { id: 'school', header: 'School', accessor: 'school', type: 'text' },
              { id: 'degree', header: 'Degree', accessor: 'degree', type: 'text' },
              { id: 'field', header: 'Field', accessor: 'field', type: 'text' },
              { id: 'year', header: 'Year', accessor: 'graduationYear', type: 'text' },
            ],
          },

          // Skills
          {
            id: 'skills',
            type: 'info-card',
            title: 'Skills',
            icon: 'Wrench',
            widgets: [
              {
                id: 'skills-list',
                type: 'tags',
                path: 'skills',
              },
            ],
          },
        ],
      },

      // Application Tab
      {
        id: 'application',
        label: 'Application',
        icon: 'FileText',
        sections: [
          // Cover Letter
          {
            id: 'cover-letter',
            type: 'info-card',
            title: 'Cover Letter',
            icon: 'Mail',
            visible: { field: 'coverLetter', operator: 'exists' },
            widgets: [
              {
                id: 'cover-letter-text',
                type: 'rich-text',
                path: 'coverLetter',
                config: { readOnly: true },
              },
            ],
          },

          // Screening Questions
          {
            id: 'screening-questions',
            type: 'custom',
            title: 'Screening Questions',
            icon: 'HelpCircle',
            component: 'ScreeningQuestionsViewer',
            componentProps: {
              questionsPath: 'screeningQuestions',
              answersPath: 'screeningAnswers',
            },
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
                procedure: 'ta.internalCandidates.getDocuments',
                params: { candidateId: { param: 'id' } },
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
            ],
          },
        ],
      },

      // Interviews Tab
      {
        id: 'interviews',
        label: 'Interviews',
        icon: 'Calendar',
        badge: {
          type: 'count',
          path: 'interviewCount',
        },
        sections: [
          // Upcoming Interviews
          {
            id: 'upcoming-interviews',
            type: 'table',
            title: 'Scheduled Interviews',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.internalCandidates.getUpcomingInterviews',
                params: { candidateId: { param: 'id' } },
              },
            },
            columns_config: [
              { id: 'type', header: 'Type', accessor: 'interviewType', type: 'text' },
              { id: 'dateTime', header: 'Date & Time', accessor: 'scheduledAt', type: 'datetime' },
              { id: 'interviewers', header: 'Interviewers', accessor: 'interviewerNames', type: 'text' },
              { id: 'location', header: 'Location', accessor: 'location', type: 'text' },
              { id: 'status', header: 'Status', accessor: 'status', type: 'enum' },
            ],
            rowActions: [
              {
                id: 'reschedule',
                type: 'modal',
                label: 'Reschedule',
                icon: 'RefreshCw',
                config: { type: 'modal', modal: 'reschedule-interview' },
              },
              {
                id: 'cancel',
                type: 'mutation',
                label: 'Cancel',
                icon: 'X',
                variant: 'destructive',
                config: { type: 'mutation', procedure: 'ta.interviews.cancel' },
              },
            ],
            emptyState: {
              title: 'No Scheduled Interviews',
              description: 'Schedule an interview to continue the process',
              icon: 'Calendar',
            },
            actions: [
              {
                id: 'schedule-interview',
                type: 'modal',
                label: 'Schedule Interview',
                icon: 'Plus',
                variant: 'outline',
                config: {
                  type: 'modal',
                  modal: 'schedule-internal-interview',
                  props: { candidateId: { param: 'id' } },
                },
              },
            ],
          },

          // Interview Feedback
          {
            id: 'interview-feedback',
            type: 'custom',
            title: 'Interview Feedback',
            component: 'InterviewFeedbackTimeline',
            componentProps: {
              candidateIdParam: 'id',
            },
          },
        ],
      },

      // Offer Tab
      {
        id: 'offer',
        label: 'Offer',
        icon: 'FileCheck',
        visible: { field: 'stage', operator: 'in', value: ['offer', 'hired'] },
        sections: [
          // Offer Details
          {
            id: 'offer-details',
            type: 'info-card',
            title: 'Offer Details',
            visible: { field: 'offerDetails', operator: 'exists' },
            widgets: [
              {
                id: 'salary',
                type: 'field',
                label: 'Salary',
                path: 'offerDetails.salary',
                config: { format: 'currency', prefix: '$' },
              },
              {
                id: 'bonus',
                type: 'field',
                label: 'Signing Bonus',
                path: 'offerDetails.signingBonus',
                config: { format: 'currency', prefix: '$' },
              },
              {
                id: 'equity',
                type: 'field',
                label: 'Equity',
                path: 'offerDetails.equity',
              },
              {
                id: 'startDate',
                type: 'field',
                label: 'Start Date',
                path: 'offerDetails.startDate',
                config: { format: 'medium' },
              },
              {
                id: 'expiresAt',
                type: 'field',
                label: 'Offer Expires',
                path: 'offerDetails.expiresAt',
                config: { format: 'full' },
              },
              {
                id: 'status',
                type: 'field',
                label: 'Status',
                path: 'offerDetails.status',
              },
            ],
          },

          // Create Offer (if not exists)
          {
            id: 'create-offer',
            type: 'custom',
            title: 'Extend Offer',
            visible: {
              operator: 'and',
              conditions: [
                { field: 'stage', operator: 'eq', value: 'offer' },
                { field: 'offerDetails', operator: 'not_exists' },
              ],
            },
            component: 'OfferForm',
            componentProps: {
              candidateIdParam: 'id',
              jobIdPath: 'jobId',
            },
          },

          // Negotiation Notes
          {
            id: 'negotiation-notes',
            type: 'timeline',
            title: 'Negotiation History',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.internalCandidates.getNegotiationHistory',
                params: { candidateId: { param: 'id' } },
              },
            },
            config: {
              timestampPath: 'createdAt',
              titlePath: 'event',
              descriptionPath: 'notes',
              userPath: 'userName',
            },
          },
        ],
      },

      // Onboarding Tab (after acceptance)
      {
        id: 'onboarding',
        label: 'Onboarding',
        icon: 'ClipboardCheck',
        visible: { field: 'stage', operator: 'eq', value: 'hired' },
        sections: [
          // Onboarding Checklist
          {
            id: 'onboarding-checklist',
            type: 'custom',
            title: 'Onboarding Checklist',
            component: 'OnboardingChecklist',
            componentProps: {
              candidateIdParam: 'id',
              checklistItems: [
                { id: 'offer_signed', label: 'Offer Letter Signed', required: true },
                { id: 'background_check', label: 'Background Check Complete', required: true },
                { id: 'i9_complete', label: 'I-9 Verification Complete', required: true },
                { id: 'equipment_ordered', label: 'Equipment Ordered', required: false },
                { id: 'accounts_created', label: 'Accounts Created', required: false },
                { id: 'orientation_scheduled', label: 'Orientation Scheduled', required: true },
                { id: 'manager_notified', label: 'Manager Notified', required: true },
                { id: 'team_announced', label: 'Team Announcement Sent', required: false },
              ],
            },
          },

          // Start Details
          {
            id: 'start-details',
            type: 'info-card',
            title: 'Start Details',
            widgets: [
              {
                id: 'start-date',
                type: 'field',
                label: 'Start Date',
                path: 'offerDetails.startDate',
                config: { format: 'full' },
              },
              {
                id: 'reporting-to',
                type: 'field',
                label: 'Reports To',
                path: 'hiringManagerName',
              },
              {
                id: 'office-location',
                type: 'field',
                label: 'Office Location',
                path: 'officeLocation',
              },
              {
                id: 'onboarding-buddy',
                type: 'field',
                label: 'Onboarding Buddy',
                path: 'onboardingBuddyName',
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
            title: 'Candidate Activity',
            dataSource: {
              type: 'query',
              query: {
                procedure: 'ta.internalCandidates.getActivity',
                params: { candidateId: { param: 'id' } },
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
      visible: { field: 'stage', operator: 'in', value: ['applied', 'screening', 'interview'] },
      config: {
        type: 'modal',
        modal: 'schedule-internal-interview',
        props: { candidateId: { param: 'id' } },
      },
    },
    {
      id: 'advance-stage',
      type: 'modal',
      label: 'Advance Stage',
      icon: 'ArrowRight',
      variant: 'primary',
      visible: { field: 'stage', operator: 'nin', value: ['offer', 'hired', 'rejected'] },
      config: {
        type: 'modal',
        modal: 'advance-candidate-stage',
        props: { candidateId: { param: 'id' } },
      },
    },
    {
      id: 'extend-offer',
      type: 'modal',
      label: 'Extend Offer',
      icon: 'FileCheck',
      variant: 'primary',
      visible: { field: 'stage', operator: 'eq', value: 'offer' },
      config: {
        type: 'modal',
        modal: 'extend-internal-offer',
        props: { candidateId: { param: 'id' } },
      },
    },
    {
      id: 'log-note',
      type: 'modal',
      label: 'Add Note',
      icon: 'StickyNote',
      variant: 'outline',
      config: {
        type: 'modal',
        modal: 'add-candidate-note',
        props: { candidateId: { param: 'id' } },
      },
    },
    {
      id: 'send-email',
      type: 'modal',
      label: 'Send Email',
      icon: 'Mail',
      variant: 'ghost',
      config: {
        type: 'modal',
        modal: 'send-candidate-email',
        props: { candidateId: { param: 'id' } },
      },
    },
    {
      id: 'reject',
      type: 'modal',
      label: 'Reject',
      icon: 'X',
      variant: 'destructive',
      visible: { field: 'stage', operator: 'nin', value: ['hired', 'rejected'] },
      config: {
        type: 'modal',
        modal: 'reject-internal-candidate',
        props: { candidateId: { param: 'id' } },
      },
    },
  ],

  // Navigation
  navigation: {
    back: {
      label: 'Back to Candidates',
      route: '/employee/workspace/ta/internal-candidates',
    },
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Talent Acquisition', route: '/employee/workspace/ta' },
      { label: 'Internal Candidates', route: '/employee/workspace/ta/internal-candidates' },
      { label: { field: 'name' } },
    ],
  },

  // Keyboard Shortcuts
  keyboard_shortcuts: [
    { key: 'i', action: 'schedule-interview', description: 'Schedule interview' },
    { key: 'a', action: 'advance-stage', description: 'Advance stage' },
    { key: 'n', action: 'log-note', description: 'Add note' },
    { key: 'e', action: 'send-email', description: 'Send email' },
  ],
};

export default internalCandidateDetailScreen;
