/**
 * Job Form Screen (Create/Edit)
 *
 * Multi-step wizard for creating or editing job requisitions.
 * Steps: Details → Requirements → Compensation → Screening → Review
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/02-create-job.md
 */

import type { ScreenDefinition, WizardStepDefinition } from '@/lib/metadata/types';

// ==========================================
// WIZARD STEPS
// ==========================================

const detailsStep: WizardStepDefinition = {
  id: 'details',
  title: 'Job Details',
  description: 'Basic information about the position',
  icon: 'FileText',
  sections: [
    {
      id: 'basic-info',
      type: 'field-grid',
      columns: 2,
      fields: [
        {
          id: 'title',
          type: 'text',
          path: 'title',
          label: 'Job Title',
          placeholder: 'e.g., Senior Software Engineer',
          required: true,
          config: { maxLength: 200 },
        },
        {
          id: 'accountId',
          type: 'select',
          path: 'accountId',
          label: 'Client Account',
          placeholder: 'Select client...',
          required: true,
          optionsSource: { type: 'entity', entityType: 'account' },
          config: { searchable: true },
        },
        {
          id: 'jobType',
          type: 'select',
          path: 'jobType',
          label: 'Job Type',
          required: true,
          options: [
            { value: 'contract', label: 'Contract' },
            { value: 'contract_to_hire', label: 'Contract to Hire' },
            { value: 'full_time', label: 'Full-Time Direct Hire' },
            { value: 'part_time', label: 'Part-Time' },
            { value: 'temp', label: 'Temporary' },
          ],
        },
        {
          id: 'department',
          type: 'text',
          path: 'department',
          label: 'Department',
          placeholder: 'e.g., Engineering',
        },
        {
          id: 'level',
          type: 'select',
          path: 'level',
          label: 'Level',
          options: [
            { value: 'entry', label: 'Entry Level' },
            { value: 'mid', label: 'Mid Level' },
            { value: 'senior', label: 'Senior' },
            { value: 'lead', label: 'Lead / Principal' },
            { value: 'manager', label: 'Manager' },
            { value: 'director', label: 'Director' },
            { value: 'executive', label: 'Executive' },
          ],
        },
        {
          id: 'headcount',
          type: 'number',
          path: 'headcount',
          label: 'Positions to Fill',
          config: { min: 1, max: 100, defaultValue: 1 },
        },
      ],
    },
    {
      id: 'location-info',
      type: 'field-grid',
      title: 'Location',
      columns: 2,
      fields: [
        {
          id: 'location',
          type: 'text',
          path: 'location',
          label: 'Primary Location',
          placeholder: 'City, State',
          required: true,
        },
        {
          id: 'remoteType',
          type: 'select',
          path: 'remoteType',
          label: 'Work Type',
          required: true,
          options: [
            { value: 'onsite', label: 'On-site' },
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
          ],
        },
        {
          id: 'hybridDays',
          type: 'number',
          path: 'hybridDays',
          label: 'Days On-site (per week)',
          visible: { field: 'remoteType', operator: 'eq', value: 'hybrid' },
          config: { min: 1, max: 5 },
        },
        {
          id: 'timezone',
          type: 'select',
          path: 'timezone',
          label: 'Time Zone Requirement',
          placeholder: 'Any timezone',
          optionsSource: { type: 'static', source: 'timezones' },
        },
      ],
    },
    {
      id: 'description',
      type: 'field-grid',
      title: 'Description',
      columns: 1,
      fields: [
        {
          id: 'description',
          type: 'richtext',
          path: 'description',
          label: 'Job Description',
          placeholder: 'Describe the role, responsibilities, and company culture...',
          required: true,
          config: { minHeight: 200 },
        },
      ],
    },
  ],
  validation: {
    required: ['title', 'accountId', 'jobType', 'location', 'remoteType', 'description'],
  },
};

const requirementsStep: WizardStepDefinition = {
  id: 'requirements',
  title: 'Requirements',
  description: 'Skills and qualifications needed',
  icon: 'CheckSquare',
  sections: [
    {
      id: 'skills',
      type: 'field-grid',
      columns: 1,
      fields: [
        {
          id: 'requiredSkills',
          type: 'tags',
          path: 'requiredSkills',
          label: 'Required Skills',
          placeholder: 'Add required skills...',
          required: true,
          config: {
            suggestions: true,
            suggestionsSource: { type: 'entity', entityType: 'skill' },
            allowCreate: true,
            variant: 'required',
          },
        },
        {
          id: 'niceToHaveSkills',
          type: 'tags',
          path: 'niceToHaveSkills',
          label: 'Nice to Have Skills',
          placeholder: 'Add nice-to-have skills...',
          config: {
            suggestions: true,
            suggestionsSource: { type: 'entity', entityType: 'skill' },
            allowCreate: true,
            variant: 'optional',
          },
        },
      ],
    },
    {
      id: 'experience',
      type: 'field-grid',
      title: 'Experience',
      columns: 2,
      fields: [
        {
          id: 'yearsExperienceMin',
          type: 'number',
          path: 'yearsExperienceMin',
          label: 'Minimum Years Experience',
          config: { min: 0, max: 30 },
        },
        {
          id: 'yearsExperienceMax',
          type: 'number',
          path: 'yearsExperienceMax',
          label: 'Maximum Years Experience',
          config: { min: 0, max: 30 },
        },
        {
          id: 'educationRequired',
          type: 'select',
          path: 'educationRequired',
          label: 'Education Requirement',
          options: [
            { value: 'none', label: 'No Requirement' },
            { value: 'high_school', label: 'High School' },
            { value: 'associate', label: "Associate's Degree" },
            { value: 'bachelor', label: "Bachelor's Degree" },
            { value: 'master', label: "Master's Degree" },
            { value: 'phd', label: 'PhD' },
          ],
        },
        {
          id: 'certifications',
          type: 'tags',
          path: 'certifications',
          label: 'Required Certifications',
          placeholder: 'e.g., AWS, PMP...',
        },
      ],
    },
    {
      id: 'visa-requirements',
      type: 'field-grid',
      title: 'Work Authorization',
      columns: 1,
      fields: [
        {
          id: 'visaRequirements',
          type: 'multiselect',
          path: 'visaRequirements',
          label: 'Accepted Visa Types',
          required: true,
          options: [
            { value: 'us_citizen', label: 'US Citizen' },
            { value: 'green_card', label: 'Green Card' },
            { value: 'h1b', label: 'H-1B' },
            { value: 'h1b_transfer', label: 'H-1B Transfer' },
            { value: 'opt', label: 'OPT' },
            { value: 'opt_stem', label: 'OPT STEM Extension' },
            { value: 'tn_visa', label: 'TN Visa' },
            { value: 'l1_visa', label: 'L-1 Visa' },
            { value: 'ead', label: 'EAD' },
            { value: 'cpt', label: 'CPT' },
          ],
        },
        {
          id: 'sponsorshipAvailable',
          type: 'boolean',
          path: 'sponsorshipAvailable',
          label: 'H-1B Sponsorship Available',
        },
        {
          id: 'clearanceRequired',
          type: 'select',
          path: 'clearanceRequired',
          label: 'Security Clearance Required',
          options: [
            { value: 'none', label: 'None' },
            { value: 'public_trust', label: 'Public Trust' },
            { value: 'secret', label: 'Secret' },
            { value: 'top_secret', label: 'Top Secret' },
            { value: 'ts_sci', label: 'TS/SCI' },
          ],
        },
      ],
    },
  ],
  validation: {
    required: ['requiredSkills', 'visaRequirements'],
  },
};

const compensationStep: WizardStepDefinition = {
  id: 'compensation',
  title: 'Compensation',
  description: 'Rate information and timeline',
  icon: 'DollarSign',
  sections: [
    {
      id: 'rate-info',
      type: 'input-set',
      inputSet: 'RateCardInputSet',
      fields: [
        {
          id: 'rateType',
          type: 'select',
          path: 'rateType',
          label: 'Rate Type',
          required: true,
          options: [
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
            { value: 'annual', label: 'Annual Salary' },
          ],
        },
        {
          id: 'rateMin',
          type: 'currency',
          path: 'rateMin',
          label: 'Minimum Rate',
          required: true,
        },
        {
          id: 'rateMax',
          type: 'currency',
          path: 'rateMax',
          label: 'Maximum Rate',
          required: true,
        },
        {
          id: 'currency',
          type: 'select',
          path: 'currency',
          label: 'Currency',
          config: { defaultValue: 'USD' },
          options: [
            { value: 'USD', label: 'USD' },
            { value: 'CAD', label: 'CAD' },
            { value: 'EUR', label: 'EUR' },
            { value: 'GBP', label: 'GBP' },
          ],
        },
      ],
    },
    {
      id: 'contract-details',
      type: 'field-grid',
      title: 'Contract Details',
      columns: 2,
      visible: { field: 'jobType', operator: 'in', value: ['contract', 'contract_to_hire', 'temp'] },
      fields: [
        {
          id: 'duration',
          type: 'number',
          path: 'duration',
          label: 'Duration (months)',
          config: { min: 1, max: 36 },
        },
        {
          id: 'extensionLikelihood',
          type: 'select',
          path: 'extensionLikelihood',
          label: 'Extension Likelihood',
          options: [
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
            { value: 'unknown', label: 'Unknown' },
          ],
        },
      ],
    },
    {
      id: 'priority-timeline',
      type: 'field-grid',
      title: 'Priority & Timeline',
      columns: 2,
      fields: [
        {
          id: 'priority',
          type: 'select',
          path: 'priority',
          label: 'Priority',
          required: true,
          options: [
            { value: 'urgent', label: 'Urgent', description: 'Need to fill ASAP' },
            { value: 'high', label: 'High', description: 'Important, within 2 weeks' },
            { value: 'medium', label: 'Medium', description: 'Standard timeline' },
            { value: 'low', label: 'Low', description: 'Backfill, flexible timeline' },
          ],
        },
        {
          id: 'urgency',
          type: 'select',
          path: 'urgency',
          label: 'Urgency',
          options: [
            { value: 'asap', label: 'ASAP' },
            { value: '1_week', label: 'Within 1 Week' },
            { value: '2_weeks', label: 'Within 2 Weeks' },
            { value: '1_month', label: 'Within 1 Month' },
            { value: 'flexible', label: 'Flexible' },
          ],
        },
        {
          id: 'targetStartDate',
          type: 'date',
          path: 'targetStartDate',
          label: 'Target Start Date',
        },
        {
          id: 'targetFillDate',
          type: 'date',
          path: 'targetFillDate',
          label: 'Target Fill Date',
        },
      ],
    },
  ],
  validation: {
    required: ['rateType', 'rateMin', 'rateMax', 'priority'],
  },
};

const screeningStep: WizardStepDefinition = {
  id: 'screening',
  title: 'Screening Questions',
  description: 'Define candidate screening criteria',
  icon: 'HelpCircle',
  skippable: true,
  sections: [
    {
      id: 'screening-questions',
      type: 'custom',
      component: 'ScreeningQuestionsBuilder',
      componentProps: {
        questionTypes: [
          { value: 'yes_no', label: 'Yes/No', icon: 'ToggleLeft' },
          { value: 'single_select', label: 'Single Select', icon: 'CircleDot' },
          { value: 'multi_select', label: 'Multi Select', icon: 'CheckSquare' },
          { value: 'text', label: 'Short Text', icon: 'Type' },
          { value: 'number', label: 'Number', icon: 'Hash' },
          { value: 'date', label: 'Date', icon: 'Calendar' },
        ],
        maxQuestions: 20,
        allowKnockout: true,
        allowScoring: true,
      },
    },
  ],
};

const reviewStep: WizardStepDefinition = {
  id: 'review',
  title: 'Review',
  description: 'Review and publish the job',
  icon: 'Eye',
  sections: [
    {
      id: 'review-summary',
      type: 'custom',
      component: 'JobReviewSummary',
      componentProps: {
        sections: [
          { id: 'details', title: 'Job Details', editStep: 'details' },
          { id: 'requirements', title: 'Requirements', editStep: 'requirements' },
          { id: 'compensation', title: 'Compensation', editStep: 'compensation' },
          { id: 'screening', title: 'Screening Questions', editStep: 'screening' },
        ],
        showMissingFields: true,
        showWarnings: true,
      },
    },
    {
      id: 'publish-options',
      type: 'field-grid',
      title: 'Publish Options',
      columns: 1,
      fields: [
        {
          id: 'status',
          type: 'radio',
          path: 'status',
          label: 'Initial Status',
          options: [
            { value: 'draft', label: 'Save as Draft', description: 'Not visible to candidates' },
            { value: 'open', label: 'Publish Now', description: 'Make immediately active' },
          ],
          config: { defaultValue: 'draft' },
        },
        {
          id: 'publishToJobBoards',
          type: 'boolean',
          path: 'publishToJobBoards',
          label: 'Publish to Job Boards',
          visible: { field: 'status', operator: 'eq', value: 'open' },
        },
        {
          id: 'notifyTeam',
          type: 'boolean',
          path: 'notifyTeam',
          label: 'Notify Pod Members',
          config: { defaultValue: true },
        },
      ],
    },
  ],
};

// ==========================================
// JOB FORM SCREEN
// ==========================================

export const jobFormScreen: ScreenDefinition = {
  id: 'job-form',
  type: 'wizard',
  entityType: 'job',
  title: { type: 'conditional', condition: { field: 'id', operator: 'exists' }, ifTrue: 'Edit Job', ifFalse: 'Create Job' },
  subtitle: { type: 'conditional', condition: { field: 'id', operator: 'exists' }, ifTrue: { type: 'field', path: 'title' }, ifFalse: 'New Job Requisition' },
  icon: 'Briefcase',

  dataSource: {
    type: 'conditional',
    condition: { field: 'id', operator: 'exists' },
    ifTrue: {
      type: 'entity',
      entityType: 'job',
      entityId: { type: 'param', path: 'id' },
      include: ['account', 'screeningQuestions'],
    },
    ifFalse: {
      type: 'empty',
      defaults: {
        status: 'draft',
        currency: 'USD',
        rateType: 'hourly',
        priority: 'medium',
        headcount: 1,
        visaRequirements: ['us_citizen', 'green_card'],
      },
    },
  },

  layout: {
    type: 'wizard-steps',
    steps: [detailsStep, requirementsStep, compensationStep, screeningStep, reviewStep],
  },

  actions: [
    {
      id: 'save-draft',
      label: 'Save Draft',
      type: 'mutation',
      icon: 'Save',
      variant: 'outline',
      config: {
        type: 'mutation',
        procedure: 'ats.jobs.saveDraft',
        input: { type: 'form' },
      },
    },
    {
      id: 'publish',
      label: 'Publish Job',
      type: 'mutation',
      icon: 'Globe',
      variant: 'primary',
      config: {
        type: 'mutation',
        procedure: 'ats.jobs.publish',
        input: { type: 'form' },
      },
      visible: {
        type: 'condition',
        condition: { field: 'currentStep', operator: 'eq', value: 'review' },
      },
    },
    {
      id: 'cancel',
      label: 'Cancel',
      type: 'navigate',
      icon: 'X',
      variant: 'ghost',
      config: {
        type: 'navigate',
        route: '/employee/workspace/jobs',
      },
      confirm: {
        title: 'Discard Changes?',
        message: 'You have unsaved changes. Are you sure you want to leave?',
        confirmLabel: 'Discard',
        destructive: true,
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Jobs', route: '/employee/workspace/jobs' },
      { label: { type: 'conditional', condition: { field: 'id', operator: 'exists' }, ifTrue: 'Edit', ifFalse: 'New' }, active: true },
    ],
  },

  hooks: {
    onBeforeSave: 'validateJobForm',
    onAfterSave: 'onJobSaved',
  },
};

export default jobFormScreen;
