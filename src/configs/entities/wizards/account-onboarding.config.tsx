'use client'

import {
  Building2,
  FileText,
  CreditCard,
  Users,
  Briefcase,
  Calendar,
} from 'lucide-react'
import {
  WizardConfig,
  WizardStepConfig,
  WizardStepComponentProps,
} from '../types'
import {
  AccountOnboardingFormData,
  INDUSTRIES,
  COMPANY_SIZES,
  PAYMENT_TERMS,
  BILLING_FREQUENCIES,
  JOB_CATEGORIES,
} from '@/stores/account-onboarding-store'

// Step wrapper components that bridge existing components to the EntityWizard interface
import {
  OnboardingStep1Profile,
  OnboardingStep2Contract,
  OnboardingStep3Billing,
  OnboardingStep4Contacts,
  OnboardingStep5Categories,
  OnboardingStep6Kickoff,
} from '@/components/recruiting/accounts/onboarding'

// Create PCF-compatible wrapper components
// These components access the store directly and don't use wizard props
function Step1Wrapper(_props: WizardStepComponentProps<AccountOnboardingFormData>) {
  return <OnboardingStep1Profile />
}

function Step2Wrapper(_props: WizardStepComponentProps<AccountOnboardingFormData>) {
  return <OnboardingStep2Contract />
}

function Step3Wrapper(_props: WizardStepComponentProps<AccountOnboardingFormData>) {
  return <OnboardingStep3Billing />
}

function Step4Wrapper(_props: WizardStepComponentProps<AccountOnboardingFormData>) {
  return <OnboardingStep4Contacts />
}

function Step5Wrapper(_props: WizardStepComponentProps<AccountOnboardingFormData>) {
  return <OnboardingStep5Categories />
}

function Step6Wrapper(_props: WizardStepComponentProps<AccountOnboardingFormData>) {
  return <OnboardingStep6Kickoff />
}

// Step configurations
export const accountOnboardingSteps: WizardStepConfig<AccountOnboardingFormData>[] = [
  {
    id: 'profile',
    number: 1,
    label: 'Company Profile',
    description: 'Enter company details and classification',
    icon: Building2,
    component: Step1Wrapper,
    fields: [
      { key: 'legalName', label: 'Company Name', type: 'text', required: true },
      { key: 'industries', label: 'Industries', type: 'multi-select', options: INDUSTRIES },
      { key: 'companySize', label: 'Company Size', type: 'select', options: COMPANY_SIZES },
      { key: 'website', label: 'Website', type: 'url' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
    ],
  },
  {
    id: 'contract',
    number: 2,
    label: 'Contract Setup',
    description: 'Configure contract terms and conditions',
    icon: FileText,
    component: Step2Wrapper,
    fields: [
      { key: 'contractType', label: 'Contract Type', type: 'select', options: [{ value: 'msa', label: 'MSA' }, { value: 'sow', label: 'SOW' }, { value: 'staffing_agreement', label: 'Staffing Agreement' }] },
      { key: 'contractStartDate', label: 'Start Date', type: 'date' },
      { key: 'isEvergreen', label: 'Evergreen Contract', type: 'checkbox' },
    ],
  },
  {
    id: 'billing',
    number: 3,
    label: 'Billing Setup',
    description: 'Set up billing and payment preferences',
    icon: CreditCard,
    component: Step3Wrapper,
    fields: [
      { key: 'paymentTerms', label: 'Payment Terms', type: 'select', options: PAYMENT_TERMS },
      { key: 'billingFrequency', label: 'Billing Frequency', type: 'select', options: BILLING_FREQUENCIES },
      { key: 'poRequired', label: 'PO Required', type: 'checkbox' },
    ],
  },
  {
    id: 'contacts',
    number: 4,
    label: 'Key Contacts',
    description: 'Add primary contacts and communication preferences',
    icon: Users,
    component: Step4Wrapper,
    fields: [
      { key: 'preferredChannel', label: 'Preferred Channel', type: 'select', options: [{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'slack', label: 'Slack' }, { value: 'teams', label: 'Teams' }] },
      { key: 'meetingCadence', label: 'Meeting Cadence', type: 'select', options: [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Bi-weekly' }, { value: 'monthly', label: 'Monthly' }] },
      {
        key: 'additionalContacts',
        label: 'Additional Contacts',
        type: 'text',
        formatValue: (val: unknown) => {
          if (!Array.isArray(val) || val.length === 0) return 'None'
          return val.map((c: { firstName?: string; lastName?: string; email?: string }) =>
            `${c.firstName ?? ''} ${c.lastName ?? ''} (${c.email ?? ''})`
          ).join(', ')
        }
      },
    ],
  },
  {
    id: 'categories',
    number: 5,
    label: 'Job Categories',
    description: 'Define hiring needs and preferences',
    icon: Briefcase,
    component: Step5Wrapper,
    fields: [
      { key: 'selectedJobCategories', label: 'Job Categories', type: 'multi-select', options: JOB_CATEGORIES.flatMap(g => g.items) },
      { key: 'experienceLevels', label: 'Experience Levels', type: 'multi-select', options: [{ value: 'associate', label: 'Associate' }, { value: 'mid', label: 'Mid-Level' }, { value: 'senior', label: 'Senior' }, { value: 'lead', label: 'Lead' }, { value: 'principal', label: 'Principal' }] },
    ],
  },
  {
    id: 'kickoff',
    number: 6,
    label: 'Kickoff Call',
    description: 'Schedule kickoff and finalize onboarding',
    icon: Calendar,
    component: Step6Wrapper,
    fields: [
      { key: 'scheduleKickoff', label: 'Schedule Kickoff', type: 'checkbox' },
      { key: 'kickoffDate', label: 'Kickoff Date', type: 'datetime' },
      { key: 'sendWelcomeEmail', label: 'Send Welcome Email', type: 'checkbox' },
    ],
  },
]

// Full wizard configuration
export const accountOnboardingWizardConfig: WizardConfig<AccountOnboardingFormData> = {
  title: 'Account Onboarding',
  description: 'Complete the onboarding process for this account',
  entityType: 'account',

  steps: accountOnboardingSteps,

  allowFreeNavigation: true, // Allow flexible navigation between steps
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Complete',
    sections: [
      {
        label: 'Company Profile',
        fields: ['legalName', 'industries', 'companySize', 'city', 'state'],
        stepNumber: 1,
      },
      {
        label: 'Contract Setup',
        fields: ['contractType', 'contractStartDate', 'isEvergreen'],
        stepNumber: 2,
      },
      {
        label: 'Billing Setup',
        fields: ['paymentTerms', 'billingFrequency', 'poRequired'],
        stepNumber: 3,
      },
      {
        label: 'Key Contacts',
        fields: ['preferredChannel', 'meetingCadence', 'additionalContacts'],
        stepNumber: 4,
      },
      {
        label: 'Job Categories',
        fields: ['selectedJobCategories', 'experienceLevels'],
        stepNumber: 5,
      },
      {
        label: 'Kickoff Call',
        fields: ['scheduleKickoff', 'kickoffDate', 'sendWelcomeEmail'],
        stepNumber: 6,
      },
    ],
  },

  submitLabel: 'Complete Onboarding',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '', // Will be set dynamically based on accountId

  storeName: 'account-onboarding-form',
  defaultFormData: {} as AccountOnboardingFormData, // Will be provided by store

  // These will be overridden in the page component
  onSubmit: async () => { },
  onSuccess: () => { },
}

