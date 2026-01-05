'use client'

import {
  Building2,
  CreditCard,
  Users,
  MapPin,
  FileText,
  ShieldCheck,
  User
} from 'lucide-react'
import { WizardConfig, WizardStepConfig } from '../types'
import { CreateAccountFormData } from '@/stores/create-account-store'

// New consolidated step components with inline panels
import { AccountIntakeStep1Combined } from '@/components/recruiting/accounts/intake/AccountIntakeStep1Combined'
import { AccountIntakeStep2Locations } from '@/components/recruiting/accounts/intake/AccountIntakeStep2Locations'
import { AccountIntakeStep3Billing } from '@/components/recruiting/accounts/intake/AccountIntakeStep3Billing'
import { AccountIntakeStep4Contacts } from '@/components/recruiting/accounts/intake/AccountIntakeStep4Contacts'
import { AccountIntakeStep5Contracts } from '@/components/recruiting/accounts/intake/AccountIntakeStep5Contracts'
import { AccountIntakeStep6Compliance } from '@/components/recruiting/accounts/intake/AccountIntakeStep6Compliance'
import { AccountIntakeStep8Team } from '@/components/recruiting/accounts/intake/AccountIntakeStep8Team'

// Step configurations
export const accountCreateSteps: WizardStepConfig<CreateAccountFormData>[] = [
  {
    id: 'identity',
    number: 1,
    label: 'Identity & Classification',
    description: 'Type, basic info, and categorization',
    icon: Building2,
    component: AccountIntakeStep1Combined,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.name || formData.name.length < 2) {
        errors.push('Please enter a valid name (at least 2 characters).')
      }
      if (!formData.industries || formData.industries.length === 0) {
        errors.push('Please select at least one industry.')
      }
      return errors
    }
  },
  {
    id: 'locations',
    number: 2,
    label: 'Locations',
    description: 'Addresses and offices',
    icon: MapPin,
    component: AccountIntakeStep2Locations,
    validateFn: () => {
      // Optional
      return []
    }
  },
  {
    id: 'billing',
    number: 3,
    label: 'Billing',
    description: 'Payment terms and addresses',
    icon: CreditCard,
    component: AccountIntakeStep3Billing,
    validateFn: (formData) => {
      const errors: string[] = []
      if (formData.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
        errors.push('Please enter a valid billing email address.')
      }
      return errors
    }
  },
  {
    id: 'contacts',
    number: 4,
    label: 'Contacts',
    description: 'Key stakeholders',
    icon: Users,
    component: AccountIntakeStep4Contacts,
    validateFn: () => {
      // Optional
      return []
    }
  },
  {
    id: 'contracts',
    number: 5,
    label: 'Contracts',
    description: 'Agreements and MSAs',
    icon: FileText,
    component: AccountIntakeStep5Contracts,
    validateFn: () => {
      // Optional
      return []
    }
  },
  {
    id: 'compliance',
    number: 6,
    label: 'Compliance',
    description: 'Requirements and certifications',
    icon: ShieldCheck,
    component: AccountIntakeStep6Compliance,
    validateFn: () => {
      // Optional
      return []
    }
  },
  {
    id: 'team',
    number: 7,
    label: 'Team',
    description: 'Internal assignment',
    icon: User,
    component: AccountIntakeStep8Team,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.team?.ownerId) {
        errors.push('Please assign an Account Owner.')
      }
      return errors
    }
  }
]

// Full wizard configuration
export const accountCreateWizardConfig: WizardConfig<CreateAccountFormData> = {
  title: 'Create New Account',
  description: 'Set up a new client account in the system',
  entityType: 'account',

  steps: accountCreateSteps,

  allowFreeNavigation: true, // Allow jumping between steps for better UX in long wizards
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Create',
    sections: [
      {
        label: 'Account Identity',
        fields: ['name', 'legalName', 'dba', 'taxId', 'email', 'phone', 'website', 'linkedinUrl', 'description', 'industries', 'companyType', 'tier', 'segment'],
        stepNumber: 1
      },
      {
        label: 'Locations',
        fields: ['addresses'], 
        stepNumber: 2
      },
      {
        label: 'Billing',
        fields: ['billingEntityName', 'billingEmail', 'billingPhone', 'paymentTermsDays', 'billingFrequency', 'currency', 'invoiceFormat', 'poRequired', 'currentPoNumber', 'poExpirationDate'],
        stepNumber: 3
      },
      {
        label: 'Contacts',
        fields: ['contacts'],
        stepNumber: 4
      },
      {
        label: 'Contracts',
        fields: ['contracts'],
        stepNumber: 5
      },
      {
        label: 'Compliance',
        fields: ['compliance'],
        stepNumber: 6
      },
      {
        label: 'Team',
        fields: ['team'],
        stepNumber: 7
      }
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
