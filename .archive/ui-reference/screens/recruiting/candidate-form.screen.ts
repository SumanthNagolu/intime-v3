/**
 * Candidate Form Screen (Wizard)
 *
 * Multi-step wizard for creating or editing candidate profiles.
 * Captures personal info, work history, skills, and documents.
 *
 * @see docs/specs/20-USER-ROLES/01-recruiter/00-OVERVIEW.md
 */

import type { ScreenDefinition, WizardStepDefinition } from '@/lib/metadata/types';

const wizardSteps: WizardStepDefinition[] = [
  // ==========================================
  // STEP 1: BASIC INFO
  // ==========================================
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Enter the candidate\'s basic contact information',
    icon: 'User',
    sections: [
      {
        id: 'personal-info',
        type: 'form',
        title: 'Personal Information',
        columns: 2,
        fields: [
          {
            id: 'firstName',
            path: 'firstName',
            label: 'First Name',
            type: 'text',
            required: true,
            placeholder: 'Enter first name',
          },
          {
            id: 'lastName',
            path: 'lastName',
            label: 'Last Name',
            type: 'text',
            required: true,
            placeholder: 'Enter last name',
          },
          {
            id: 'email',
            path: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'candidate@email.com',
          },
          {
            id: 'phone',
            path: 'phone',
            label: 'Phone',
            type: 'phone',
            required: true,
            placeholder: '(555) 123-4567',
          },
          {
            id: 'alternatePhone',
            path: 'alternatePhone',
            label: 'Alternate Phone',
            type: 'phone',
            placeholder: '(555) 987-6543',
          },
          {
            id: 'linkedinUrl',
            path: 'linkedinUrl',
            label: 'LinkedIn URL',
            type: 'url',
            placeholder: 'https://linkedin.com/in/username',
          },
        ],
      },
      {
        id: 'address',
        type: 'form',
        title: 'Address',
        columns: 2,
        fields: [
          {
            id: 'street',
            path: 'address.street',
            label: 'Street',
            type: 'text',
            span: 2,
          },
          {
            id: 'city',
            path: 'address.city',
            label: 'City',
            type: 'text',
          },
          {
            id: 'state',
            path: 'address.state',
            label: 'State',
            type: 'select',
            optionsSource: { source: 'us-states' },
          },
          {
            id: 'zipCode',
            path: 'address.zipCode',
            label: 'Zip Code',
            type: 'text',
          },
          {
            id: 'country',
            path: 'address.country',
            label: 'Country',
            type: 'select',
            optionsSource: { source: 'countries' },
            defaultValue: 'US',
          },
        ],
      },
    ],
    validation: {
      required: ['firstName', 'lastName', 'email', 'phone'],
    },
  },

  // ==========================================
  // STEP 2: PROFESSIONAL INFO
  // ==========================================
  {
    id: 'professional',
    title: 'Professional Info',
    description: 'Enter work preferences and professional details',
    icon: 'Briefcase',
    sections: [
      {
        id: 'current-position',
        type: 'form',
        title: 'Current Position',
        columns: 2,
        fields: [
          {
            id: 'currentTitle',
            path: 'currentTitle',
            label: 'Current Job Title',
            type: 'text',
            placeholder: 'Senior Software Engineer',
          },
          {
            id: 'currentCompany',
            path: 'currentCompany',
            label: 'Current Company',
            type: 'text',
            placeholder: 'Acme Corp',
          },
          {
            id: 'yearsExperience',
            path: 'yearsExperience',
            label: 'Years of Experience',
            type: 'number',
            min: 0,
            max: 50,
          },
          {
            id: 'status',
            path: 'status',
            label: 'Candidate Status',
            type: 'select',
            required: true,
            options: [
              { value: 'active', label: 'Active - Looking' },
              { value: 'passive', label: 'Passive - Open to Opportunities' },
              { value: 'not_looking', label: 'Not Looking' },
              { value: 'placed', label: 'Placed' },
            ],
            defaultValue: 'active',
          },
        ],
      },
      {
        id: 'work-preferences',
        type: 'form',
        title: 'Work Preferences',
        columns: 2,
        fields: [
          {
            id: 'workTypes',
            path: 'workTypes',
            label: 'Work Type',
            type: 'multiselect',
            options: [
              { value: 'full_time', label: 'Full-Time' },
              { value: 'contract', label: 'Contract' },
              { value: 'contract_to_hire', label: 'Contract-to-Hire' },
              { value: 'part_time', label: 'Part-Time' },
            ],
          },
          {
            id: 'workModes',
            path: 'workModes',
            label: 'Work Mode',
            type: 'multiselect',
            options: [
              { value: 'onsite', label: 'On-Site' },
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
            ],
          },
          {
            id: 'willingToRelocate',
            path: 'willingToRelocate',
            label: 'Willing to Relocate',
            type: 'boolean',
          },
          {
            id: 'preferredLocations',
            path: 'preferredLocations',
            label: 'Preferred Locations',
            type: 'tags',
            placeholder: 'Add cities or regions',
          },
        ],
      },
      {
        id: 'compensation',
        type: 'form',
        title: 'Compensation',
        columns: 2,
        fields: [
          {
            id: 'currentSalary',
            path: 'currentSalary',
            label: 'Current Salary',
            type: 'currency',
            placeholder: '100,000',
          },
          {
            id: 'expectedSalary',
            path: 'expectedSalary',
            label: 'Expected Salary',
            type: 'currency',
            placeholder: '120,000',
          },
          {
            id: 'hourlyRate',
            path: 'hourlyRate',
            label: 'Hourly Rate (Contract)',
            type: 'currency',
            placeholder: '75',
          },
          {
            id: 'noticePeriod',
            path: 'noticePeriod',
            label: 'Notice Period',
            type: 'select',
            options: [
              { value: 'immediate', label: 'Immediate' },
              { value: '1_week', label: '1 Week' },
              { value: '2_weeks', label: '2 Weeks' },
              { value: '1_month', label: '1 Month' },
              { value: '2_months', label: '2 Months' },
              { value: '3_months', label: '3+ Months' },
            ],
          },
        ],
      },
    ],
    validation: {
      required: ['status'],
    },
  },

  // ==========================================
  // STEP 3: SKILLS & QUALIFICATIONS
  // ==========================================
  {
    id: 'skills',
    title: 'Skills & Qualifications',
    description: 'Add skills, certifications, and education',
    icon: 'Award',
    sections: [
      {
        id: 'skills-section',
        type: 'form',
        title: 'Skills',
        fields: [
          {
            id: 'primarySkills',
            path: 'primarySkills',
            label: 'Primary Skills',
            type: 'tags',
            required: true,
            placeholder: 'Add primary technical skills',
            helpText: 'Key skills that define the candidate\'s expertise',
          },
          {
            id: 'secondarySkills',
            path: 'secondarySkills',
            label: 'Secondary Skills',
            type: 'tags',
            placeholder: 'Add secondary skills',
            helpText: 'Additional skills and technologies',
          },
          {
            id: 'softSkills',
            path: 'softSkills',
            label: 'Soft Skills',
            type: 'tags',
            placeholder: 'Leadership, Communication, etc.',
          },
        ],
      },
      {
        id: 'education',
        type: 'form',
        title: 'Education',
        columns: 2,
        fields: [
          {
            id: 'highestDegree',
            path: 'highestDegree',
            label: 'Highest Degree',
            type: 'select',
            options: [
              { value: 'high_school', label: 'High School' },
              { value: 'associate', label: 'Associate\'s Degree' },
              { value: 'bachelor', label: 'Bachelor\'s Degree' },
              { value: 'master', label: 'Master\'s Degree' },
              { value: 'doctorate', label: 'Doctorate' },
              { value: 'other', label: 'Other' },
            ],
          },
          {
            id: 'fieldOfStudy',
            path: 'fieldOfStudy',
            label: 'Field of Study',
            type: 'text',
            placeholder: 'Computer Science',
          },
          {
            id: 'university',
            path: 'university',
            label: 'University/Institution',
            type: 'text',
          },
          {
            id: 'graduationYear',
            path: 'graduationYear',
            label: 'Graduation Year',
            type: 'number',
            min: 1950,
            max: 2030,
          },
        ],
      },
      {
        id: 'certifications',
        type: 'form',
        title: 'Certifications',
        fields: [
          {
            id: 'certifications',
            path: 'certifications',
            label: 'Certifications',
            type: 'tags',
            placeholder: 'AWS, PMP, CISSP, etc.',
          },
        ],
      },
    ],
    validation: {
      required: ['primarySkills'],
    },
  },

  // ==========================================
  // STEP 4: WORK AUTHORIZATION
  // ==========================================
  {
    id: 'authorization',
    title: 'Work Authorization',
    description: 'Enter visa and work authorization details',
    icon: 'FileCheck',
    sections: [
      {
        id: 'visa-info',
        type: 'form',
        title: 'Work Authorization',
        columns: 2,
        fields: [
          {
            id: 'workAuthorization',
            path: 'workAuthorization',
            label: 'Work Authorization Status',
            type: 'select',
            required: true,
            options: [
              { value: 'us_citizen', label: 'US Citizen' },
              { value: 'green_card', label: 'Green Card Holder' },
              { value: 'h1b', label: 'H-1B Visa' },
              { value: 'h1b_transfer', label: 'H-1B Transfer' },
              { value: 'opt', label: 'OPT' },
              { value: 'opt_stem', label: 'OPT STEM Extension' },
              { value: 'cpt', label: 'CPT' },
              { value: 'l1', label: 'L-1 Visa' },
              { value: 'tn', label: 'TN Visa' },
              { value: 'ead', label: 'EAD' },
              { value: 'other', label: 'Other' },
              { value: 'needs_sponsorship', label: 'Needs Sponsorship' },
            ],
          },
          {
            id: 'sponsorshipRequired',
            path: 'sponsorshipRequired',
            label: 'Sponsorship Required',
            type: 'boolean',
          },
          {
            id: 'visaExpiryDate',
            path: 'visaExpiryDate',
            label: 'Visa Expiry Date',
            type: 'date',
            visible: {
              field: 'workAuthorization',
              operator: 'in',
              value: ['h1b', 'h1b_transfer', 'opt', 'opt_stem', 'cpt', 'l1', 'tn', 'ead'],
            },
          },
          {
            id: 'optEadEndDate',
            path: 'optEadEndDate',
            label: 'OPT/EAD End Date',
            type: 'date',
            visible: {
              field: 'workAuthorization',
              operator: 'in',
              value: ['opt', 'opt_stem', 'ead'],
            },
          },
        ],
      },
      {
        id: 'clearance',
        type: 'form',
        title: 'Security Clearance',
        columns: 2,
        fields: [
          {
            id: 'hasClearance',
            path: 'hasClearance',
            label: 'Has Security Clearance',
            type: 'boolean',
          },
          {
            id: 'clearanceLevel',
            path: 'clearanceLevel',
            label: 'Clearance Level',
            type: 'select',
            options: [
              { value: 'public_trust', label: 'Public Trust' },
              { value: 'secret', label: 'Secret' },
              { value: 'top_secret', label: 'Top Secret' },
              { value: 'ts_sci', label: 'TS/SCI' },
            ],
            visible: {
              field: 'hasClearance',
              operator: 'eq',
              value: true,
            },
          },
        ],
      },
    ],
    validation: {
      required: ['workAuthorization'],
    },
  },

  // ==========================================
  // STEP 5: DOCUMENTS & NOTES
  // ==========================================
  {
    id: 'documents',
    title: 'Documents & Notes',
    description: 'Upload resume and add any notes',
    icon: 'FileText',
    sections: [
      {
        id: 'resume',
        type: 'form',
        title: 'Resume',
        fields: [
          {
            id: 'resume',
            path: 'resumeFile',
            label: 'Resume',
            type: 'file',
            config: {
              accept: ['.pdf', '.doc', '.docx'],
              maxSize: 10485760, // 10MB
            },
            helpText: 'Upload PDF, DOC, or DOCX (max 10MB)',
          },
          {
            id: 'resumeText',
            path: 'resumeText',
            label: 'Resume Text (Parsed)',
            type: 'textarea',
            readonly: true,
            visible: {
              field: 'resumeText',
              operator: 'exists',
            },
          },
        ],
      },
      {
        id: 'additional-docs',
        type: 'form',
        title: 'Additional Documents',
        fields: [
          {
            id: 'additionalDocuments',
            path: 'additionalDocuments',
            label: 'Other Documents',
            type: 'files',
            config: {
              accept: ['.pdf', '.doc', '.docx', '.jpg', '.png'],
              maxSize: 10485760,
              maxFiles: 5,
            },
            helpText: 'Upload certifications, portfolio, etc. (max 5 files)',
          },
        ],
      },
      {
        id: 'notes',
        type: 'form',
        title: 'Notes',
        fields: [
          {
            id: 'source',
            path: 'source',
            label: 'Candidate Source',
            type: 'select',
            options: [
              { value: 'linkedin', label: 'LinkedIn' },
              { value: 'job_board', label: 'Job Board' },
              { value: 'referral', label: 'Referral' },
              { value: 'website', label: 'Company Website' },
              { value: 'agency', label: 'Agency' },
              { value: 'direct', label: 'Direct Application' },
              { value: 'other', label: 'Other' },
            ],
          },
          {
            id: 'referredBy',
            path: 'referredBy',
            label: 'Referred By',
            type: 'text',
            visible: {
              field: 'source',
              operator: 'eq',
              value: 'referral',
            },
          },
          {
            id: 'notes',
            path: 'notes',
            label: 'Additional Notes',
            type: 'richtext',
            placeholder: 'Add any additional notes about this candidate...',
          },
        ],
      },
    ],
  },
];

export const candidateFormScreen: ScreenDefinition = {
  id: 'candidate-form',
  type: 'wizard',
  entityType: 'candidate',
  title: {
    type: 'conditional',
    condition: { field: 'id', operator: 'exists' },
    ifTrue: { type: 'template', template: 'Edit {{firstName}} {{lastName}}' },
    ifFalse: 'New Candidate',
  },
  icon: 'UserPlus',

  dataSource: {
    type: 'conditional',
    condition: { field: 'id', operator: 'exists', value: { type: 'param', path: 'id' } },
    ifTrue: {
      type: 'entity',
      entityType: 'candidate',
      entityId: { type: 'param', path: 'id' },
    },
    ifFalse: {
      type: 'empty',
      defaults: {
        status: 'active',
        workAuthorization: 'us_citizen',
        sponsorshipRequired: false,
        willingToRelocate: false,
        hasClearance: false,
      },
    },
  },

  layout: {
    type: 'wizard-steps',
    steps: wizardSteps,
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
        procedure: 'candidate.saveDraft',
        input: {
          id: { type: 'param', path: 'id' },
          data: { type: 'context', path: 'formState.values' },
        },
      },
    },
    {
      id: 'cancel',
      label: 'Cancel',
      type: 'navigate',
      icon: 'X',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/candidates' },
      confirm: {
        title: 'Discard Changes',
        message: 'Are you sure you want to discard your changes?',
        confirmLabel: 'Discard',
        destructive: true,
      },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'Workspace', route: '/employee/workspace' },
      { label: 'Candidates', route: '/employee/workspace/candidates' },
      {
        label: {
          type: 'conditional',
          condition: { field: 'id', operator: 'exists' },
          ifTrue: { type: 'template', template: 'Edit {{firstName}} {{lastName}}' },
          ifFalse: 'New Candidate',
        },
        active: true,
      },
    ],
    back: {
      label: 'Back to Candidates',
      route: '/employee/workspace/candidates',
    },
  },

  hooks: {
    onBeforeSave: 'validateCandidateForm',
    onAfterSave: 'onCandidateSaved',
    onError: 'handleCandidateFormError',
  },
};

export default candidateFormScreen;
