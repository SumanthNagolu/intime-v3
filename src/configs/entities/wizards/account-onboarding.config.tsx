'use client'

import {
  Building2,
  FileText,
  CreditCard,
  Users,
  Briefcase,
  Calendar,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig } from '../types'
import { AccountOnboardingFormData } from '@/stores/account-onboarding-store'

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
function Step1Wrapper() {
  return <OnboardingStep1Profile />
}

function Step2Wrapper() {
  return <OnboardingStep2Contract />
}

function Step3Wrapper() {
  return <OnboardingStep3Billing />
}

function Step4Wrapper() {
  return <OnboardingStep4Contacts />
}

function Step5Wrapper() {
  return <OnboardingStep5Categories />
}

function Step6Wrapper() {
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
    component: Step1Wrapper as any,
  },
  {
    id: 'contract',
    number: 2,
    label: 'Contract Setup',
    description: 'Configure contract terms and conditions',
    icon: FileText,
    component: Step2Wrapper as any,
  },
  {
    id: 'billing',
    number: 3,
    label: 'Billing Setup',
    description: 'Set up billing and payment preferences',
    icon: CreditCard,
    component: Step3Wrapper as any,
  },
  {
    id: 'contacts',
    number: 4,
    label: 'Key Contacts',
    description: 'Add primary contacts and communication preferences',
    icon: Users,
    component: Step4Wrapper as any,
  },
  {
    id: 'categories',
    number: 5,
    label: 'Job Categories',
    description: 'Define hiring needs and preferences',
    icon: Briefcase,
    component: Step5Wrapper as any,
  },
  {
    id: 'kickoff',
    number: 6,
    label: 'Kickoff Call',
    description: 'Schedule kickoff and finalize onboarding',
    icon: Calendar,
    component: Step6Wrapper as any,
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
        fields: ['legalName', 'industry', 'companySize', 'city', 'state'],
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
        fields: ['preferredChannel', 'meetingCadence'],
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
  onSubmit: async () => {},
  onSuccess: () => {},
}

