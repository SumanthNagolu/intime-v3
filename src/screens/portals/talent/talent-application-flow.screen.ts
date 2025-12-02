/**
 * Application Flow Screen (Wizard)
 *
 * Multi-step application wizard for applying to jobs.
 */

import type { WizardScreenDefinition } from '@/lib/metadata/types';

export const talentApplicationFlowScreen: WizardScreenDefinition = {
  id: 'talent-application-flow',
  type: 'wizard',
  title: 'Apply to Job',
  subtitle: { type: 'field', path: 'jobTitle' },
  icon: 'FileText',

  dataSource: {
    type: 'custom',
    query: {
      procedure: 'portal.talent.getApplicationContext',
      params: { jobId: { type: 'param', path: 'id' } },
    },
  },

  steps: [
    // ===========================================
    // STEP 1: REVIEW PROFILE
    // ===========================================
    {
      id: 'review-profile',
      title: 'Review Profile',
      description: 'Confirm your information is current',
      icon: 'User',
      sections: [
        {
          id: 'profile-summary',
          type: 'info-card',
          title: 'Your Profile',
          fields: [
            { id: 'name', label: 'Name', type: 'text', path: 'profile.fullName' },
            { id: 'email', label: 'Email', type: 'email', path: 'profile.email' },
            { id: 'phone', label: 'Phone', type: 'phone', path: 'profile.phone' },
            { id: 'location', label: 'Location', type: 'text', path: 'profile.location' },
            { id: 'experience', label: 'Experience', type: 'text', path: 'profile.yearsExperience' },
          ],
          actions: [
            {
              id: 'edit-profile',
              label: 'Edit Profile',
              type: 'navigate',
              icon: 'Edit',
              variant: 'outline',
              config: { type: 'navigate', route: '/talent/profile' },
            },
          ],
        },
        {
          id: 'resume-selection',
          type: 'form',
          title: 'Resume',
          fields: [
            {
              id: 'resume',
              type: 'select',
              label: 'Select Resume',
              path: 'application.resumeId',
              config: {
                required: true,
                dataSource: { type: 'field', path: 'profile.resumes' },
                labelPath: 'name',
                valuePath: 'id',
              },
            },
          ],
          actions: [
            {
              id: 'upload-new-resume',
              label: 'Upload New Resume',
              type: 'modal',
              icon: 'Upload',
              variant: 'outline',
              config: { type: 'modal', modal: 'UploadResume' },
            },
          ],
        },
      ],
      validation: {
        required: ['application.resumeId'],
      },
    },

    // ===========================================
    // STEP 2: SCREENING QUESTIONS
    // ===========================================
    {
      id: 'screening-questions',
      title: 'Screening Questions',
      description: 'Answer job-specific questions',
      icon: 'HelpCircle',
      visible: { field: 'job.screeningQuestions.length', operator: 'gt', value: 0 },
      sections: [
        {
          id: 'questions',
          type: 'custom',
          component: 'ScreeningQuestionsForm',
          componentProps: {
            questionsPath: 'job.screeningQuestions',
            answersPath: 'application.screeningAnswers',
          },
        },
      ],
    },

    // ===========================================
    // STEP 3: COVER LETTER
    // ===========================================
    {
      id: 'cover-letter',
      title: 'Cover Letter',
      description: 'Add a personalized message (optional)',
      icon: 'FileEdit',
      skippable: true,
      sections: [
        {
          id: 'cover-letter-form',
          type: 'form',
          fields: [
            {
              id: 'useCoverLetter',
              type: 'checkbox',
              label: 'Include cover letter',
              path: 'application.useCoverLetter',
            },
            {
              id: 'coverLetterTemplate',
              type: 'select',
              label: 'Use Template',
              path: 'application.coverLetterTemplateId',
              visible: { field: 'application.useCoverLetter', operator: 'eq', value: true },
              config: {
                dataSource: { type: 'field', path: 'profile.coverLetterTemplates' },
                labelPath: 'name',
                valuePath: 'id',
                placeholder: 'Select a template or write custom',
              },
            },
            {
              id: 'coverLetterText',
              type: 'textarea',
              label: 'Cover Letter',
              path: 'application.coverLetterText',
              visible: { field: 'application.useCoverLetter', operator: 'eq', value: true },
              config: {
                rows: 10,
                placeholder: 'Write your cover letter...',
              },
            },
          ],
        },
      ],
    },

    // ===========================================
    // STEP 4: AVAILABILITY & RATE
    // ===========================================
    {
      id: 'availability',
      title: 'Availability & Rate',
      description: 'When can you start and rate expectations',
      icon: 'Calendar',
      sections: [
        {
          id: 'availability-form',
          type: 'form',
          fields: [
            {
              id: 'startDate',
              type: 'select',
              label: 'When can you start?',
              path: 'application.availability',
              config: {
                required: true,
                options: [
                  { value: 'immediately', label: 'Immediately' },
                  { value: '1_week', label: 'Within 1 week' },
                  { value: '2_weeks', label: 'Within 2 weeks' },
                  { value: '1_month', label: 'Within 1 month' },
                  { value: 'other', label: 'Other (specify)' },
                ],
              },
            },
            {
              id: 'specificStartDate',
              type: 'date',
              label: 'Specific Start Date',
              path: 'application.specificStartDate',
              visible: { field: 'application.availability', operator: 'eq', value: 'other' },
            },
            {
              id: 'rateExpectation',
              type: 'number',
              label: 'Rate Expectation (Hourly)',
              path: 'application.rateExpectation',
              config: {
                prefix: '$',
                suffix: '/hr',
                placeholder: 'Enter your expected rate',
              },
            },
            {
              id: 'rateNegotiable',
              type: 'checkbox',
              label: 'Rate is negotiable',
              path: 'application.rateNegotiable',
            },
          ],
        },
      ],
      validation: {
        required: ['application.availability'],
      },
    },

    // ===========================================
    // STEP 5: REVIEW & SUBMIT
    // ===========================================
    {
      id: 'review-submit',
      title: 'Review & Submit',
      description: 'Final review before submission',
      icon: 'CheckCircle',
      sections: [
        {
          id: 'application-summary',
          type: 'custom',
          component: 'ApplicationSummary',
          componentProps: {
            showJobDetails: true,
            showProfileSnapshot: true,
            showAnswers: true,
            showCoverLetter: true,
            showAvailability: true,
          },
        },
        {
          id: 'consent',
          type: 'form',
          fields: [
            {
              id: 'agreeToTerms',
              type: 'checkbox',
              label: 'I confirm that all information provided is accurate and I consent to my profile being shared with the employer.',
              path: 'application.agreeToTerms',
              config: { required: true },
            },
          ],
        },
      ],
      validation: {
        required: ['application.agreeToTerms'],
      },
    },
  ],

  onComplete: {
    action: 'custom',
    handler: 'submitApplication',
    successRedirect: '/talent/applications/{{applicationId}}',
    successMessage: 'Your application has been submitted successfully!',
  },

  navigation: {
    allowSkip: false,
    showProgress: true,
    showStepNumbers: true,
    saveDraft: true,
    allowResume: true,
  },

  breadcrumbs: [
    { label: 'Talent Portal', route: '/talent' },
    { label: 'Jobs', route: '/talent/jobs' },
    { label: 'Apply', active: true },
  ],
};

export default talentApplicationFlowScreen;
