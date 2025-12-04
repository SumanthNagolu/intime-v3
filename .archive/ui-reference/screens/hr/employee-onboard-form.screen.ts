/**
 * Employee Onboard Form Screen Definition
 *
 * Multi-step wizard for onboarding new employees.
 *
 * Per docs/specs/20-USER-ROLES/05-hr/02-employee-onboarding.md
 *
 * Steps:
 * 1. Basic Info - Personal details
 * 2. Employment - Position and compensation
 * 3. Tax & Compliance - W-4, I-9, state tax forms
 * 4. Direct Deposit - Banking information
 * 5. Benefits Enrollment - Plan selection
 * 6. IT & Equipment - System access setup
 * 7. Review & Create - Summary and submission
 */

import type { ScreenDefinition, WizardStepDefinition } from '@/lib/metadata';

// ==========================================
// OPTIONS
// ==========================================

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Full-Time (W2)' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'contractor', label: 'Contractor (1099)' },
  { value: 'intern', label: 'Intern' },
];

const WORK_MODE_OPTIONS = [
  { value: 'on_site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const PAY_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'semimonthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' },
];

const FILING_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married_filing_jointly', label: 'Married Filing Jointly' },
  { value: 'married_filing_separately', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
];

const MEDICAL_PLAN_OPTIONS = [
  { value: 'ppo', label: 'PPO Plan (Blue Cross Blue Shield)' },
  { value: 'hdhp', label: 'HDHP + HSA (High Deductible Health Plan)' },
  { value: 'waive', label: 'Waive Coverage' },
];

const DENTAL_PLAN_OPTIONS = [
  { value: 'delta_dental', label: 'Delta Dental PPO' },
  { value: 'waive', label: 'Waive Coverage' },
];

const VISION_PLAN_OPTIONS = [
  { value: 'vsp', label: 'VSP Vision Care' },
  { value: 'waive', label: 'Waive Coverage' },
];

const LAPTOP_TYPE_OPTIONS = [
  { value: 'macbook_pro_14', label: 'MacBook Pro 14"' },
  { value: 'macbook_pro_16', label: 'MacBook Pro 16"' },
  { value: 'dell_xps_15', label: 'Dell XPS 15' },
  { value: 'lenovo_thinkpad', label: 'Lenovo ThinkPad' },
  { value: 'byod', label: 'BYOD (Bring Your Own Device)' },
];

// ==========================================
// WIZARD STEPS
// ==========================================

const basicInfoStep: WizardStepDefinition = {
  id: 'basic-info',
  title: 'Basic Information',
  description: 'Personal and contact details',
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
          label: 'First Name',
          type: 'text',
          path: 'firstName',
          required: true,
        },
        {
          id: 'lastName',
          label: 'Last Name',
          type: 'text',
          path: 'lastName',
          required: true,
        },
        {
          id: 'preferredName',
          label: 'Preferred Name',
          type: 'text',
          path: 'preferredName',
        },
        {
          id: 'pronouns',
          label: 'Pronouns',
          type: 'text',
          path: 'pronouns',
          config: { placeholder: 'e.g., he/him, she/her, they/them' },
        },
        {
          id: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
          path: 'dateOfBirth',
          required: true,
        },
        {
          id: 'ssn',
          label: 'Social Security Number',
          type: 'text',
          path: 'ssn',
          required: true,
          config: { masked: true, placeholder: 'XXX-XX-XXXX' },
        },
      ],
    },
    {
      id: 'contact-info',
      type: 'form',
      title: 'Contact Information',
      columns: 2,
      fields: [
        {
          id: 'email',
          label: 'Work Email',
          type: 'email',
          path: 'email',
          required: true,
        },
        {
          id: 'personalEmail',
          label: 'Personal Email',
          type: 'email',
          path: 'personalEmail',
        },
        {
          id: 'phone',
          label: 'Phone',
          type: 'phone',
          path: 'phone',
          required: true,
        },
        {
          id: 'mobilePhone',
          label: 'Mobile Phone',
          type: 'phone',
          path: 'mobilePhone',
        },
      ],
    },
    {
      id: 'address-info',
      type: 'form',
      title: 'Address',
      columns: 2,
      fields: [
        {
          id: 'street',
          label: 'Street Address',
          type: 'text',
          path: 'address.street',
          required: true,
        },
        {
          id: 'street2',
          label: 'Apt/Suite',
          type: 'text',
          path: 'address.street2',
        },
        {
          id: 'city',
          label: 'City',
          type: 'text',
          path: 'address.city',
          required: true,
        },
        {
          id: 'state',
          label: 'State',
          type: 'select',
          path: 'address.state',
          required: true,
          config: { optionsSource: 'states' },
        },
        {
          id: 'zipCode',
          label: 'ZIP Code',
          type: 'text',
          path: 'address.zipCode',
          required: true,
        },
        {
          id: 'country',
          label: 'Country',
          type: 'select',
          path: 'address.country',
          required: true,
          config: { optionsSource: 'countries', default: 'US' },
        },
      ],
    },
    {
      id: 'emergency-contact',
      type: 'form',
      title: 'Emergency Contact',
      columns: 2,
      fields: [
        {
          id: 'emergencyName',
          label: 'Contact Name',
          type: 'text',
          path: 'emergencyContact.name',
          required: true,
        },
        {
          id: 'emergencyRelationship',
          label: 'Relationship',
          type: 'text',
          path: 'emergencyContact.relationship',
          required: true,
        },
        {
          id: 'emergencyPhone',
          label: 'Phone',
          type: 'phone',
          path: 'emergencyContact.phone',
          required: true,
        },
        {
          id: 'emergencyEmail',
          label: 'Email',
          type: 'email',
          path: 'emergencyContact.email',
        },
      ],
    },
  ],
  validation: {
    required: ['firstName', 'lastName', 'dateOfBirth', 'ssn', 'email', 'phone', 'address.street', 'address.city', 'address.state', 'address.zipCode'],
  },
};

const employmentStep: WizardStepDefinition = {
  id: 'employment',
  title: 'Employment',
  description: 'Position and compensation details',
  icon: 'Briefcase',
  sections: [
    {
      id: 'position-info',
      type: 'form',
      title: 'Position Information',
      columns: 2,
      fields: [
        {
          id: 'jobTitle',
          label: 'Job Title',
          type: 'text',
          path: 'jobTitle',
          required: true,
        },
        {
          id: 'department',
          label: 'Department',
          type: 'select',
          path: 'department',
          required: true,
          config: { optionsSource: 'departments' },
        },
        {
          id: 'manager',
          label: 'Manager',
          type: 'select',
          path: 'managerId',
          required: true,
          config: { optionsSource: 'employees', optionLabel: 'fullName', optionValue: 'id' },
        },
        {
          id: 'workLocation',
          label: 'Work Location',
          type: 'select',
          path: 'workLocation',
          config: { optionsSource: 'locations' },
        },
        {
          id: 'employmentType',
          label: 'Employment Type',
          type: 'select',
          path: 'employmentType',
          required: true,
          options: EMPLOYMENT_TYPE_OPTIONS,
        },
        {
          id: 'workMode',
          label: 'Work Mode',
          type: 'select',
          path: 'workMode',
          required: true,
          options: WORK_MODE_OPTIONS,
        },
      ],
    },
    {
      id: 'dates-info',
      type: 'form',
      title: 'Important Dates',
      columns: 2,
      fields: [
        {
          id: 'startDate',
          label: 'Start Date',
          type: 'date',
          path: 'startDate',
          required: true,
        },
        {
          id: 'probationEndDate',
          label: 'Probation End Date',
          type: 'date',
          path: 'probationEndDate',
          config: { helpText: 'Typically 90 days from start date' },
        },
      ],
    },
    {
      id: 'compensation-info',
      type: 'form',
      title: 'Compensation',
      columns: 2,
      fields: [
        {
          id: 'salary',
          label: 'Annual Salary',
          type: 'currency',
          path: 'salary',
          required: true,
        },
        {
          id: 'payFrequency',
          label: 'Pay Frequency',
          type: 'select',
          path: 'payFrequency',
          required: true,
          options: PAY_FREQUENCY_OPTIONS,
        },
        {
          id: 'flsaStatus',
          label: 'FLSA Status',
          type: 'select',
          path: 'flsaStatus',
          required: true,
          options: [
            { value: 'exempt', label: 'Exempt (Salaried)' },
            { value: 'non_exempt', label: 'Non-Exempt (Hourly)' },
          ],
        },
        {
          id: 'hourlyRate',
          label: 'Hourly Rate',
          type: 'currency',
          path: 'hourlyRate',
          visible: { field: 'flsaStatus', operator: 'eq', value: 'non_exempt' },
        },
      ],
    },
  ],
  validation: {
    required: ['jobTitle', 'department', 'managerId', 'employmentType', 'workMode', 'startDate', 'salary', 'payFrequency', 'flsaStatus'],
  },
};

const taxComplianceStep: WizardStepDefinition = {
  id: 'tax-compliance',
  title: 'Tax & Compliance',
  description: 'W-4, I-9, and state tax forms',
  icon: 'FileText',
  sections: [
    {
      id: 'w4-info',
      type: 'form',
      title: 'Federal Tax (W-4)',
      description: 'Form W-4 information for federal tax withholding',
      columns: 2,
      fields: [
        {
          id: 'filingStatus',
          label: 'Filing Status',
          type: 'select',
          path: 'w4.filingStatus',
          required: true,
          options: FILING_STATUS_OPTIONS,
        },
        {
          id: 'multipleJobs',
          label: 'Multiple Jobs / Spouse Works',
          type: 'boolean',
          path: 'w4.multipleJobs',
          config: { helpText: 'Check if you have more than one job or your spouse works' },
        },
        {
          id: 'dependents',
          label: 'Qualifying Dependents',
          type: 'number',
          path: 'w4.dependents',
          config: { min: 0, helpText: 'Number of dependents under age 17' },
        },
        {
          id: 'otherDependents',
          label: 'Other Dependents',
          type: 'number',
          path: 'w4.otherDependents',
          config: { min: 0 },
        },
        {
          id: 'additionalWithholding',
          label: 'Additional Withholding',
          type: 'currency',
          path: 'w4.additionalWithholding',
          config: { helpText: 'Additional amount to withhold each pay period' },
        },
      ],
    },
    {
      id: 'i9-info',
      type: 'form',
      title: 'I-9 Employment Eligibility',
      description: 'Section 1 must be completed by employee on or before first day of work',
      columns: 2,
      fields: [
        {
          id: 'citizenshipStatus',
          label: 'Citizenship Status',
          type: 'select',
          path: 'i9.citizenshipStatus',
          required: true,
          options: [
            { value: 'citizen', label: 'U.S. Citizen' },
            { value: 'noncitizen_national', label: 'Noncitizen National' },
            { value: 'permanent_resident', label: 'Lawful Permanent Resident' },
            { value: 'authorized_alien', label: 'Alien Authorized to Work' },
          ],
        },
        {
          id: 'alienNumber',
          label: 'Alien Registration Number',
          type: 'text',
          path: 'i9.alienNumber',
          visible: { field: 'i9.citizenshipStatus', operator: 'in', value: ['permanent_resident', 'authorized_alien'] },
        },
        {
          id: 'workAuthExpiration',
          label: 'Work Authorization Expiration',
          type: 'date',
          path: 'i9.workAuthExpiration',
          visible: { field: 'i9.citizenshipStatus', operator: 'eq', value: 'authorized_alien' },
        },
      ],
    },
    {
      id: 'state-tax-info',
      type: 'form',
      title: 'State Tax Withholding',
      columns: 2,
      fields: [
        {
          id: 'stateOfResidence',
          label: 'State of Residence',
          type: 'select',
          path: 'stateTax.state',
          required: true,
          config: { optionsSource: 'states' },
        },
        {
          id: 'stateFilingStatus',
          label: 'State Filing Status',
          type: 'select',
          path: 'stateTax.filingStatus',
          options: FILING_STATUS_OPTIONS,
        },
        {
          id: 'stateAllowances',
          label: 'State Allowances',
          type: 'number',
          path: 'stateTax.allowances',
          config: { min: 0 },
        },
        {
          id: 'stateAdditionalWithholding',
          label: 'Additional State Withholding',
          type: 'currency',
          path: 'stateTax.additionalWithholding',
        },
      ],
    },
  ],
  validation: {
    required: ['w4.filingStatus', 'i9.citizenshipStatus', 'stateTax.state'],
  },
};

const directDepositStep: WizardStepDefinition = {
  id: 'direct-deposit',
  title: 'Direct Deposit',
  description: 'Banking information for payroll',
  icon: 'CreditCard',
  sections: [
    {
      id: 'bank-info',
      type: 'form',
      title: 'Bank Account Information',
      description: 'Enter your banking details for direct deposit. Your information is encrypted and secure.',
      columns: 2,
      fields: [
        {
          id: 'bankName',
          label: 'Bank Name',
          type: 'text',
          path: 'directDeposit.bankName',
          required: true,
        },
        {
          id: 'accountType',
          label: 'Account Type',
          type: 'select',
          path: 'directDeposit.accountType',
          required: true,
          options: ACCOUNT_TYPE_OPTIONS,
        },
        {
          id: 'routingNumber',
          label: 'Routing Number',
          type: 'text',
          path: 'directDeposit.routingNumber',
          required: true,
          config: { maxLength: 9, helpText: '9-digit routing number' },
        },
        {
          id: 'accountNumber',
          label: 'Account Number',
          type: 'text',
          path: 'directDeposit.accountNumber',
          required: true,
          config: { masked: true },
        },
        {
          id: 'confirmAccountNumber',
          label: 'Confirm Account Number',
          type: 'text',
          path: 'directDeposit.confirmAccountNumber',
          required: true,
          config: { masked: true },
        },
      ],
    },
    {
      id: 'voided-check',
      type: 'form',
      title: 'Verification Document',
      description: 'Upload a voided check or bank letter for verification',
      fields: [
        {
          id: 'voidedCheck',
          label: 'Voided Check or Bank Letter',
          type: 'file',
          path: 'directDeposit.voidedCheck',
          config: { accept: '.pdf,.jpg,.jpeg,.png', maxSize: 5242880 },
        },
      ],
    },
  ],
  validation: {
    required: ['directDeposit.bankName', 'directDeposit.accountType', 'directDeposit.routingNumber', 'directDeposit.accountNumber', 'directDeposit.confirmAccountNumber'],
  },
};

const benefitsStep: WizardStepDefinition = {
  id: 'benefits',
  title: 'Benefits Enrollment',
  description: 'Select your benefits plans',
  icon: 'Heart',
  sections: [
    {
      id: 'medical-plan',
      type: 'form',
      title: 'Medical Insurance',
      description: 'Select your medical plan or waive coverage',
      fields: [
        {
          id: 'medicalPlan',
          label: 'Medical Plan',
          type: 'radio',
          path: 'benefits.medical.plan',
          required: true,
          options: MEDICAL_PLAN_OPTIONS,
          config: {
            layout: 'vertical',
            descriptions: {
              ppo: 'Employee: $150/month | Flexibility to see any provider | $1,500 deductible',
              hdhp: 'Employee: $75/month | Lower premiums, higher deductibles | $500 HSA contribution',
              waive: 'Proof of other coverage required',
            },
          },
        },
        {
          id: 'medicalCoverageLevel',
          label: 'Coverage Level',
          type: 'select',
          path: 'benefits.medical.coverageLevel',
          visible: { field: 'benefits.medical.plan', operator: 'neq', value: 'waive' },
          options: [
            { value: 'employee', label: 'Employee Only' },
            { value: 'employee_spouse', label: 'Employee + Spouse' },
            { value: 'employee_children', label: 'Employee + Children' },
            { value: 'family', label: 'Family' },
          ],
        },
      ],
    },
    {
      id: 'dental-plan',
      type: 'form',
      title: 'Dental Insurance',
      fields: [
        {
          id: 'dentalPlan',
          label: 'Dental Plan',
          type: 'radio',
          path: 'benefits.dental.plan',
          options: DENTAL_PLAN_OPTIONS,
          config: {
            layout: 'vertical',
            descriptions: {
              delta_dental: 'Employee: $20/month | 100% preventive coverage | $2,000 annual max',
              waive: 'No dental coverage',
            },
          },
        },
      ],
    },
    {
      id: 'vision-plan',
      type: 'form',
      title: 'Vision Insurance',
      fields: [
        {
          id: 'visionPlan',
          label: 'Vision Plan',
          type: 'radio',
          path: 'benefits.vision.plan',
          options: VISION_PLAN_OPTIONS,
          config: {
            layout: 'vertical',
            descriptions: {
              vsp: 'Employee: $10/month | $10 exam copay | $150 frames allowance',
              waive: 'No vision coverage',
            },
          },
        },
      ],
    },
    {
      id: '401k-enrollment',
      type: 'form',
      title: '401(k) Retirement Plan',
      description: 'Company matches 100% of the first 4% you contribute',
      fields: [
        {
          id: 'enroll401k',
          label: 'Enroll in 401(k)',
          type: 'boolean',
          path: 'benefits.retirement.enrolled',
        },
        {
          id: 'contributionPercent',
          label: 'Contribution Percentage',
          type: 'number',
          path: 'benefits.retirement.contributionPercent',
          visible: { field: 'benefits.retirement.enrolled', operator: 'eq', value: true },
          config: { min: 1, max: 100, step: 1, suffix: '%' },
        },
        {
          id: 'contributionType',
          label: 'Contribution Type',
          type: 'radio',
          path: 'benefits.retirement.contributionType',
          visible: { field: 'benefits.retirement.enrolled', operator: 'eq', value: true },
          options: [
            { value: 'traditional', label: 'Traditional (Pre-Tax)' },
            { value: 'roth', label: 'Roth (After-Tax)' },
            { value: 'combination', label: 'Combination' },
          ],
        },
      ],
    },
    {
      id: 'beneficiary',
      type: 'form',
      title: 'Beneficiary Designation',
      description: 'Required for life insurance and retirement accounts',
      columns: 2,
      fields: [
        {
          id: 'beneficiaryName',
          label: 'Primary Beneficiary Name',
          type: 'text',
          path: 'beneficiary.primary.name',
          required: true,
        },
        {
          id: 'beneficiaryRelationship',
          label: 'Relationship',
          type: 'select',
          path: 'beneficiary.primary.relationship',
          required: true,
          options: [
            { value: 'spouse', label: 'Spouse' },
            { value: 'child', label: 'Child' },
            { value: 'parent', label: 'Parent' },
            { value: 'sibling', label: 'Sibling' },
            { value: 'other', label: 'Other' },
          ],
        },
        {
          id: 'beneficiaryPercent',
          label: 'Percentage',
          type: 'number',
          path: 'beneficiary.primary.percentage',
          required: true,
          config: { min: 1, max: 100, suffix: '%', default: 100 },
        },
      ],
    },
  ],
  validation: {
    required: ['benefits.medical.plan', 'beneficiary.primary.name', 'beneficiary.primary.relationship', 'beneficiary.primary.percentage'],
  },
};

const itEquipmentStep: WizardStepDefinition = {
  id: 'it-equipment',
  title: 'IT & Equipment',
  description: 'System access and equipment setup',
  icon: 'Laptop',
  sections: [
    {
      id: 'equipment-info',
      type: 'form',
      title: 'Equipment',
      columns: 2,
      fields: [
        {
          id: 'laptopType',
          label: 'Laptop Type',
          type: 'select',
          path: 'it.laptopType',
          options: LAPTOP_TYPE_OPTIONS,
        },
        {
          id: 'monitor',
          label: 'External Monitor',
          type: 'boolean',
          path: 'it.externalMonitor',
          config: { helpText: 'Request an external monitor for your workstation' },
        },
        {
          id: 'keyboard',
          label: 'External Keyboard',
          type: 'boolean',
          path: 'it.externalKeyboard',
        },
        {
          id: 'mouse',
          label: 'External Mouse',
          type: 'boolean',
          path: 'it.externalMouse',
        },
        {
          id: 'headset',
          label: 'Headset',
          type: 'boolean',
          path: 'it.headset',
        },
      ],
    },
    {
      id: 'software-access',
      type: 'form',
      title: 'Software Access',
      description: 'Select the software and systems you need access to',
      fields: [
        {
          id: 'softwareAccess',
          label: 'Software Access',
          type: 'multiselect',
          path: 'it.softwareAccess',
          config: {
            optionsSource: 'softwareOptions',
            helpText: 'Select all that apply based on your role',
          },
        },
      ],
    },
    {
      id: 'email-setup',
      type: 'form',
      title: 'Email Setup',
      columns: 2,
      fields: [
        {
          id: 'emailAlias',
          label: 'Preferred Email Alias',
          type: 'text',
          path: 'it.emailAlias',
          config: {
            placeholder: 'firstname.lastname',
            suffix: '@intime.com',
          },
        },
        {
          id: 'displayName',
          label: 'Display Name',
          type: 'text',
          path: 'it.displayName',
          config: { helpText: 'Name shown in email and calendar' },
        },
      ],
    },
  ],
};

const reviewStep: WizardStepDefinition = {
  id: 'review',
  title: 'Review & Create',
  description: 'Review all information and submit',
  icon: 'CheckCircle',
  sections: [
    {
      id: 'review-summary',
      type: 'custom',
      component: 'OnboardingReviewSummary',
      title: 'Review Information',
      description: 'Please review all information before submitting. Click Edit to make changes.',
      componentProps: {
        sections: ['basic-info', 'employment', 'tax-compliance', 'direct-deposit', 'benefits', 'it-equipment'],
      },
    },
    {
      id: 'checklist-preview',
      type: 'info-card',
      title: 'Onboarding Checklist',
      description: 'The following checklist items will be automatically generated:',
      fields: [
        { id: 'i9Verification', label: 'I-9 Verification', type: 'text', path: '_checklist.i9', config: { value: 'Section 2 due within 3 business days of start date' } },
        { id: 'taxForms', label: 'Tax Forms', type: 'text', path: '_checklist.tax', config: { value: 'W-4 and state tax forms signed' } },
        { id: 'benefitsEnrollment', label: 'Benefits Enrollment', type: 'text', path: '_checklist.benefits', config: { value: 'Benefits selections confirmed' } },
        { id: 'itSetup', label: 'IT Setup', type: 'text', path: '_checklist.it', config: { value: 'Equipment ordered and accounts created' } },
        { id: 'orientation', label: 'Orientation', type: 'text', path: '_checklist.orientation', config: { value: 'Day 1 orientation scheduled' } },
      ],
    },
    {
      id: 'acknowledgment',
      type: 'form',
      title: 'Acknowledgment',
      fields: [
        {
          id: 'confirmAccurate',
          label: 'I confirm that all information provided is accurate and complete',
          type: 'boolean',
          path: 'acknowledgment.accurate',
          required: true,
        },
        {
          id: 'confirmPolicies',
          label: 'I acknowledge that I have read and agree to the company policies',
          type: 'boolean',
          path: 'acknowledgment.policies',
          required: true,
        },
      ],
    },
  ],
  validation: {
    required: ['acknowledgment.accurate', 'acknowledgment.policies'],
  },
};

// ==========================================
// SCREEN DEFINITION
// ==========================================

export const employeeOnboardFormScreen: ScreenDefinition = {
  id: 'employee-onboard-form',
  type: 'wizard',

  title: 'Onboard New Employee',
  subtitle: 'Complete all steps to add a new employee',
  icon: 'UserPlus',

  // Wizard steps
  steps: [
    basicInfoStep,
    employmentStep,
    taxComplianceStep,
    directDepositStep,
    benefitsStep,
    itEquipmentStep,
    reviewStep,
  ],

  // Wizard navigation options
  navigation: {
    showProgress: true,
    showStepNumbers: true,
    allowSkip: false,
    saveDraft: true,
    allowResume: true,
    breadcrumbs: [
      { label: 'HR', route: '/employee/hr' },
      { label: 'Employees', route: '/employee/hr/people' },
      { label: 'Onboard New Employee' },
    ],
  },

  // On complete action
  onComplete: {
    action: 'create',
    entityType: 'employee',
    successRedirect: '/employee/hr/onboarding/{{id}}',
    successMessage: 'Employee has been successfully onboarded. Onboarding checklist has been created.',
  },

  // Layout - required but not used for wizards
  layout: {
    type: 'wizard-steps',
    steps: [
      basicInfoStep,
      employmentStep,
      taxComplianceStep,
      directDepositStep,
      benefitsStep,
      itEquipmentStep,
      reviewStep,
    ],
  },
};

export default employeeOnboardFormScreen;
