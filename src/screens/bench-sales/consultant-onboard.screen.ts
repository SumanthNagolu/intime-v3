/**
 * Consultant Onboarding Screen (Wizard)
 *
 * Multi-step wizard for onboarding new bench consultants.
 * Steps per 12-onboard-bench-consultant.md:
 * 1. Source Selection: Internal / Referral / Vendor
 * 2. Candidate Selection: Search existing or create new
 * 3. Visa & Work Authorization
 * 4. Rates & Availability
 * 5. Skills Matrix
 * 6. Marketing Profile
 * 7. Review & Activate
 *
 * @see docs/specs/20-USER-ROLES/02-bench-sales/11-source-bench-consultant.md
 * @see docs/specs/20-USER-ROLES/02-bench-sales/12-onboard-bench-consultant.md
 */

import type { ScreenDefinition, WizardStepDefinition } from '@/lib/metadata/types';

// ==========================================
// OPTIONS
// ==========================================

const SOURCE_TYPE_OPTIONS = [
  { value: 'internal', label: 'Internal Employee' },
  { value: 'referral', label: 'Referral' },
  { value: 'vendor', label: 'Vendor (Third-Party)' },
];

const VISA_TYPE_OPTIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b', label: 'H-1B' },
  { value: 'h1b_transfer', label: 'H-1B Transfer' },
  { value: 'opt', label: 'OPT' },
  { value: 'opt_stem', label: 'OPT STEM' },
  { value: 'cpt', label: 'CPT' },
  { value: 'l1', label: 'L-1' },
  { value: 'tn_visa', label: 'TN Visa' },
  { value: 'h4_ead', label: 'H4-EAD' },
  { value: 'e3', label: 'E-3' },
  { value: 'canada_pr', label: 'Canada PR' },
  { value: 'canada_citizen', label: 'Canada Citizen' },
  { value: 'canada_owp', label: 'Canada OWP' },
];

const CONTRACT_TYPE_OPTIONS = [
  { value: 'c2c', label: 'C2C (Corp-to-Corp)' },
  { value: 'w2', label: 'W2' },
  { value: '1099', label: '1099' },
];

const WORK_PREFERENCE_OPTIONS = [
  { value: 'remote', label: 'Remote Only' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
  { value: 'any', label: 'Any' },
];

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

// ==========================================
// WIZARD STEPS
// ==========================================

const wizardSteps: WizardStepDefinition[] = [
  // Step 1: Source Selection
  {
    id: 'source',
    title: 'Source',
    description: 'Select how this consultant was sourced',
    icon: 'Search',
    sections: [
      {
        id: 'source-selection',
        type: 'form',
        fields: [
          {
            id: 'sourceType',
            label: 'Source Type',
            type: 'radio',
            path: 'sourceType',
            required: true,
            options: [
              {
                value: 'internal',
                label: 'Internal Employee',
                description: 'Existing company employee moving to bench',
                icon: 'Building',
              },
              {
                value: 'referral',
                label: 'Referral',
                description: 'Referred by existing employee or partner',
                icon: 'Users',
              },
              {
                value: 'vendor',
                label: 'Vendor/Third-Party',
                description: 'External consultant from partner vendor',
                icon: 'Truck',
              },
            ],
          },
          {
            id: 'referredBy',
            label: 'Referred By',
            type: 'select',
            path: 'referredBy',
            config: { entityType: 'user', displayField: 'fullName' },
            visible: { field: 'sourceType', operator: 'eq', value: 'referral' },
          },
          {
            id: 'vendorId',
            label: 'Source Vendor',
            type: 'select',
            path: 'vendorId',
            config: { entityType: 'vendor', displayField: 'name' },
            visible: { field: 'sourceType', operator: 'eq', value: 'vendor' },
          },
        ],
      },
    ],
    validation: {
      required: ['sourceType'],
    },
  },

  // Step 2: Candidate Selection
  {
    id: 'candidate',
    title: 'Candidate',
    description: 'Select or create the candidate profile',
    icon: 'User',
    sections: [
      {
        id: 'candidate-search',
        type: 'custom',
        component: 'CandidateSearchOrCreate',
        componentProps: {
          allowCreate: true,
          searchPlaceholder: 'Search existing candidates...',
          createLabel: 'Create New Candidate',
        },
      },
      {
        id: 'candidate-basic-info',
        type: 'form',
        title: 'Basic Information',
        columns: 2,
        visible: { field: 'isNewCandidate', operator: 'eq', value: true },
        fields: [
          {
            id: 'firstName',
            label: 'First Name',
            type: 'text',
            path: 'candidate.firstName',
            required: true,
          },
          {
            id: 'lastName',
            label: 'Last Name',
            type: 'text',
            path: 'candidate.lastName',
            required: true,
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email',
            path: 'candidate.email',
            required: true,
          },
          {
            id: 'phone',
            label: 'Phone',
            type: 'phone',
            path: 'candidate.phone',
          },
          {
            id: 'title',
            label: 'Job Title',
            type: 'text',
            path: 'candidate.title',
            required: true,
          },
          {
            id: 'location',
            label: 'Location',
            type: 'text',
            path: 'candidate.location',
          },
        ],
      },
    ],
    validation: {
      custom: 'validateCandidateSelection',
    },
  },

  // Step 3: Visa & Work Authorization
  {
    id: 'visa',
    title: 'Visa & Work Auth',
    description: 'Work authorization and visa details',
    icon: 'Globe',
    sections: [
      {
        id: 'visa-details',
        type: 'form',
        title: 'Visa Information',
        columns: 2,
        fields: [
          {
            id: 'visaType',
            label: 'Visa Type',
            type: 'select',
            path: 'visa.type',
            required: true,
            options: VISA_TYPE_OPTIONS,
          },
          {
            id: 'visaExpiryDate',
            label: 'Visa Expiry Date',
            type: 'date',
            path: 'visa.expiryDate',
            visible: {
              field: 'visa.type',
              operator: 'nin',
              value: ['us_citizen', 'green_card', 'canada_citizen', 'canada_pr'],
            },
          },
          {
            id: 'sponsorshipRequired',
            label: 'Sponsorship Required',
            type: 'boolean',
            path: 'visa.sponsorshipRequired',
            config: { helpText: 'Does this consultant require H1B sponsorship?' },
          },
          {
            id: 'canWorkUS',
            label: 'Authorized to Work in US',
            type: 'boolean',
            path: 'visa.canWorkUS',
            config: { defaultValue: true },
          },
          {
            id: 'canWorkCanada',
            label: 'Authorized to Work in Canada',
            type: 'boolean',
            path: 'visa.canWorkCanada',
          },
        ],
      },
      {
        id: 'visa-documents',
        type: 'custom',
        title: 'Visa Documents',
        component: 'DocumentUploader',
        componentProps: {
          documentTypes: ['visa', 'ead', 'i797', 'passport', 'opt_card'],
          required: false,
          multiple: true,
        },
      },
      {
        id: 'visa-alert-preview',
        type: 'custom',
        title: 'Visa Status Preview',
        component: 'VisaExpiryAlert',
        componentProps: {
          expiryDatePath: 'visa.expiryDate',
          showColorCoding: true,
        },
        visible: {
          field: 'visa.expiryDate',
          operator: 'exists',
        },
      },
    ],
    validation: {
      required: ['visa.type'],
    },
  },

  // Step 4: Rates & Availability
  {
    id: 'rates',
    title: 'Rates & Availability',
    description: 'Rate expectations and availability',
    icon: 'DollarSign',
    sections: [
      {
        id: 'rate-card',
        type: 'form',
        title: 'Rate Card',
        columns: 2,
        fields: [
          {
            id: 'c2cRate',
            label: 'C2C Rate',
            type: 'currency',
            path: 'rates.c2c',
            config: { suffix: '/hr', helpText: 'Corp-to-Corp hourly rate' },
          },
          {
            id: 'w2Rate',
            label: 'W2 Rate',
            type: 'currency',
            path: 'rates.w2',
            config: { suffix: '/hr', helpText: 'W2 hourly rate' },
          },
          {
            id: '1099Rate',
            label: '1099 Rate',
            type: 'currency',
            path: 'rates.rate1099',
            config: { suffix: '/hr', helpText: '1099 contractor rate' },
          },
          {
            id: 'minimumRate',
            label: 'Minimum Acceptable Rate',
            type: 'currency',
            path: 'rates.minimum',
            required: true,
            config: { suffix: '/hr', helpText: 'Lowest rate consultant will accept' },
          },
          {
            id: 'targetRate',
            label: 'Target Rate',
            type: 'currency',
            path: 'rates.target',
            required: true,
            config: { suffix: '/hr', helpText: 'Desired billing rate' },
          },
        ],
      },
      {
        id: 'contract-preferences',
        type: 'form',
        title: 'Contract Preferences',
        columns: 2,
        fields: [
          {
            id: 'preferredContractTypes',
            label: 'Preferred Contract Types',
            type: 'multiselect',
            path: 'preferences.contractTypes',
            options: CONTRACT_TYPE_OPTIONS,
            required: true,
          },
          {
            id: 'workPreference',
            label: 'Work Mode Preference',
            type: 'select',
            path: 'preferences.workMode',
            options: WORK_PREFERENCE_OPTIONS,
          },
        ],
      },
      {
        id: 'availability',
        type: 'form',
        title: 'Availability',
        columns: 2,
        fields: [
          {
            id: 'availableFrom',
            label: 'Available From',
            type: 'date',
            path: 'availability.availableFrom',
            required: true,
            config: { minDate: 'today' },
          },
          {
            id: 'noticePeriod',
            label: 'Notice Period (Days)',
            type: 'number',
            path: 'availability.noticePeriod',
            config: { min: 0, max: 90 },
          },
          {
            id: 'willingToRelocate',
            label: 'Willing to Relocate',
            type: 'boolean',
            path: 'availability.willingToRelocate',
          },
          {
            id: 'preferredLocations',
            label: 'Preferred Locations',
            type: 'tags',
            path: 'availability.preferredLocations',
            config: { placeholder: 'Add locations...' },
          },
        ],
      },
    ],
    validation: {
      required: ['rates.minimum', 'rates.target', 'preferences.contractTypes', 'availability.availableFrom'],
    },
  },

  // Step 5: Skills Matrix
  {
    id: 'skills',
    title: 'Skills',
    description: 'Technical skills and certifications',
    icon: 'Code',
    sections: [
      {
        id: 'skills-matrix',
        type: 'custom',
        title: 'Skills Matrix',
        component: 'SkillsMatrixEditor',
        componentProps: {
          categories: ['Languages', 'Frameworks', 'Databases', 'Cloud', 'Tools', 'Other'],
          proficiencyLevels: PROFICIENCY_LEVELS,
          suggestFromResume: true,
        },
      },
      {
        id: 'primary-skills',
        type: 'form',
        title: 'Primary Skills',
        fields: [
          {
            id: 'primarySkills',
            label: 'Primary Skills (Top 5)',
            type: 'tags',
            path: 'skills.primary',
            required: true,
            config: {
              maxTags: 5,
              suggestions: true,
              helpText: 'Key skills to highlight in marketing',
            },
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
            label: 'Certifications',
            type: 'tags',
            path: 'skills.certifications',
            config: {
              suggestions: true,
              helpText: 'AWS, Azure, GCP, Salesforce, etc.',
            },
          },
        ],
      },
    ],
    validation: {
      required: ['skills.primary'],
    },
  },

  // Step 6: Marketing Profile
  {
    id: 'marketing',
    title: 'Marketing Profile',
    description: 'Create marketing materials',
    icon: 'Megaphone',
    sections: [
      {
        id: 'marketing-headline',
        type: 'form',
        title: 'Marketing Headline',
        fields: [
          {
            id: 'headline',
            label: 'Professional Headline',
            type: 'text',
            path: 'marketing.headline',
            required: true,
            config: {
              placeholder: 'e.g., Senior Java Developer with 10+ years of enterprise experience',
              maxLength: 120,
            },
          },
        ],
      },
      {
        id: 'marketing-summary',
        type: 'form',
        title: 'Professional Summary',
        fields: [
          {
            id: 'summary',
            label: 'Summary',
            type: 'textarea',
            path: 'marketing.summary',
            required: true,
            config: {
              rows: 5,
              placeholder: 'Brief professional summary highlighting key experience and strengths...',
              maxLength: 500,
            },
          },
        ],
      },
      {
        id: 'marketing-highlights',
        type: 'form',
        title: 'Key Highlights',
        fields: [
          {
            id: 'highlights',
            label: 'Key Highlights',
            type: 'list',
            path: 'marketing.highlights',
            config: {
              maxItems: 5,
              itemPlaceholder: 'Add a highlight...',
              helpText: 'Top 3-5 bullet points for hotlists',
            },
          },
        ],
      },
      {
        id: 'marketing-preview',
        type: 'custom',
        title: 'Preview',
        component: 'MarketingProfilePreview',
        componentProps: {
          formats: ['standard', 'detailed', 'one-pager'],
          showLivePreview: true,
        },
      },
    ],
    validation: {
      required: ['marketing.headline', 'marketing.summary'],
    },
  },

  // Step 7: Review & Activate
  {
    id: 'review',
    title: 'Review & Activate',
    description: 'Review and activate the consultant',
    icon: 'CheckCircle',
    sections: [
      {
        id: 'review-summary',
        type: 'custom',
        title: 'Consultant Summary',
        component: 'ConsultantOnboardReview',
        componentProps: {
          showAllSections: true,
          allowEdit: true,
        },
      },
      {
        id: 'activation-options',
        type: 'form',
        title: 'Activation Options',
        fields: [
          {
            id: 'assignedOwner',
            label: 'Assigned Owner',
            type: 'select',
            path: 'activation.ownerId',
            required: true,
            config: {
              entityType: 'user',
              filter: { role: 'bench_sales' },
              displayField: 'fullName',
              defaultValue: 'currentUser',
            },
          },
          {
            id: 'priority',
            label: 'Priority',
            type: 'select',
            path: 'activation.priority',
            options: [
              { value: 'high', label: 'High - Start marketing immediately' },
              { value: 'normal', label: 'Normal' },
              { value: 'low', label: 'Low - Available but not urgent' },
            ],
            config: { defaultValue: 'normal' },
          },
          {
            id: 'addToHotlist',
            label: 'Add to Hotlist',
            type: 'select',
            path: 'activation.hotlistId',
            config: {
              entityType: 'hotlist',
              filter: { status: 'active' },
              displayField: 'name',
              optional: true,
            },
          },
          {
            id: 'sendWelcomeEmail',
            label: 'Send Welcome Email',
            type: 'boolean',
            path: 'activation.sendWelcomeEmail',
            config: { defaultValue: true },
          },
        ],
      },
    ],
    validation: {
      required: ['activation.ownerId'],
    },
  },
];

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const consultantOnboardScreen: ScreenDefinition = {
  id: 'consultant-onboard',
  type: 'wizard',
  entityType: 'talent',

  title: 'Onboard Bench Consultant',
  subtitle: 'Add a new consultant to the bench',
  icon: 'UserPlus',

  layout: {
    type: 'wizard-steps',
    steps: wizardSteps,
  },

  navigation: {
    allowSkip: false,
    showProgress: true,
    showStepNumbers: true,
    saveDraft: true,
    allowResume: true,
  },

  onComplete: {
    action: 'create',
    entityType: 'talent',
    successRedirect: '/employee/workspace/bench/consultants/{{id}}',
    successMessage: 'Consultant onboarded successfully!',
  },

  actions: [
    {
      id: 'save-draft',
      label: 'Save Draft',
      type: 'custom',
      icon: 'Save',
      variant: 'ghost',
      config: { type: 'custom', handler: 'saveDraft' },
    },
    {
      id: 'cancel',
      label: 'Cancel',
      type: 'navigate',
      icon: 'X',
      variant: 'ghost',
      config: { type: 'navigate', route: '/employee/workspace/bench/consultants' },
      confirm: {
        title: 'Cancel Onboarding',
        message: 'Are you sure? Any unsaved changes will be lost.',
        confirmLabel: 'Yes, Cancel',
        destructive: true,
      },
    },
  ],

  breadcrumbs: [
    { label: 'Workspace', route: '/employee/workspace' },
    { label: 'Bench Sales', route: '/employee/workspace/bench' },
    { label: 'Consultants', route: '/employee/workspace/bench/consultants' },
    { label: 'Onboard', active: true },
  ],
};

export default consultantOnboardScreen;
