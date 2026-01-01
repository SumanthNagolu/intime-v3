'use client'

import { Building2, CreditCard, Users } from 'lucide-react'
import { WizardConfig, WizardStepConfig } from '../types'
import { CreateAccountFormData } from '@/stores/create-account-store'

// Step wrapper components that bridge to the EntityWizard interface
import {
  AccountIntakeStep1Basics,
  AccountIntakeStep2Billing,
  AccountIntakeStep3Contact,
} from '@/components/recruiting/accounts/intake'

// Create PCF-compatible wrapper components
function Step1Wrapper() {
  return <AccountIntakeStep1Basics />
}

function Step2Wrapper() {
  return <AccountIntakeStep2Billing />
}

function Step3Wrapper() {
  return <AccountIntakeStep3Contact />
}

// Step configurations
export const accountCreateSteps: WizardStepConfig<CreateAccountFormData>[] = [
  {
    id: 'basics',
    number: 1,
    label: 'Company Basics',
    description: 'Company identity, industry, and location',
    icon: Building2,
    component: Step1Wrapper as React.ComponentType<{
      formData: Partial<CreateAccountFormData>
      setFormData: (data: Partial<CreateAccountFormData>) => void
      errors: Record<string, string>
    }>,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.name || (formData.name?.length || 0) < 2) {
        errors.push('Please enter a company name (at least 2 characters).')
      }
      if (!formData.industries || formData.industries.length === 0) {
        errors.push('Please select at least one industry.')
      }
      return errors
    },
  },
  {
    id: 'billing',
    number: 2,
    label: 'Billing & Terms',
    description: 'Payment and contract terms',
    icon: CreditCard,
    component: Step2Wrapper as React.ComponentType<{
      formData: Partial<CreateAccountFormData>
      setFormData: (data: Partial<CreateAccountFormData>) => void
      errors: Record<string, string>
    }>,
    validateFn: (formData) => {
      const errors: string[] = []
      // Billing info is optional, but if email is provided, validate format
      if (
        formData.billingEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)
      ) {
        errors.push('Please enter a valid billing email address.')
      }
      return errors
    },
  },
  {
    id: 'contact',
    number: 3,
    label: 'Primary Contact',
    description: 'Main point of contact',
    icon: Users,
    component: Step3Wrapper as React.ComponentType<{
      formData: Partial<CreateAccountFormData>
      setFormData: (data: Partial<CreateAccountFormData>) => void
      errors: Record<string, string>
    }>,
    validateFn: (formData) => {
      const errors: string[] = []
      // Contact info is optional, but if email is provided, validate format
      if (
        formData.primaryContactEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)
      ) {
        errors.push('Please enter a valid contact email address.')
      }
      // If email is provided, name should also be provided
      if (formData.primaryContactEmail && !formData.primaryContactName) {
        errors.push('Please provide a name for the contact.')
      }
      return errors
    },
  },
]

// Full wizard configuration
export const accountCreateWizardConfig: WizardConfig<CreateAccountFormData> = {
  title: 'Create New Account',
  description: 'Set up a new client account in the system',
  entityType: 'account',

  steps: accountCreateSteps,

  allowFreeNavigation: false,
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Create',
    sections: [
      {
        label: 'Company Information',
        fields: [
          'name',
          'industries',
          'companyType',
          'tier',
          'website',
          'hqCity',
          'hqState',
        ],
        stepNumber: 1,
      },
      {
        label: 'Billing Details',
        fields: [
          'billingEntityName',
          'billingEmail',
          'billingFrequency',
          'paymentTermsDays',
          'poRequired',
        ],
        stepNumber: 2,
      },
      {
        label: 'Primary Contact',
        fields: [
          'primaryContactName',
          'primaryContactTitle',
          'primaryContactEmail',
          'preferredContactMethod',
          'meetingCadence',
        ],
        stepNumber: 3,
      },
    ],
  },

  submitLabel: 'Create Account',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/accounts',

  storeName: 'create-account-form',
  defaultFormData: {} as CreateAccountFormData,

  // These will be overridden in the page component
  onSubmit: async () => {},
  onSuccess: () => {},
}

// Factory function to create config with custom handlers
export function createAccountCreateConfig(
  onSubmit: (formData: CreateAccountFormData) => Promise<unknown>,
  options?: {
    onSuccess?: (result: unknown) => void
    cancelRoute?: string
  }
): WizardConfig<CreateAccountFormData> {
  return {
    ...accountCreateWizardConfig,
    cancelRoute: options?.cancelRoute || accountCreateWizardConfig.cancelRoute,
    onSubmit,
    onSuccess: options?.onSuccess,
  }
}


