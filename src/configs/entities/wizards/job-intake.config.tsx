'use client'

import {
  Building2,
  FileText,
  DollarSign,
  Calendar,
  Target,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig, WizardStepComponentProps } from '../types'
import { JobIntakeFormData } from '@/stores/job-intake-store'

// Step wrapper components that bridge existing components to the EntityWizard interface
// The actual step content comes from the existing components in /components/recruiting/jobs/intake
import {
  IntakeStep1BasicInfo,
  IntakeStep2Requirements,
  IntakeStep3RoleDetails,
  IntakeStep4Compensation,
  IntakeStep5Interview,
} from '@/components/recruiting/jobs/intake'

// Create PCF-compatible wrapper components
// These components access the store directly and don't use wizard props
function Step1Wrapper(_props: WizardStepComponentProps<JobIntakeFormData>) {
  return <IntakeStep1BasicInfo />
}

function Step2Wrapper(_props: WizardStepComponentProps<JobIntakeFormData>) {
  return <IntakeStep2Requirements />
}

function Step3Wrapper(_props: WizardStepComponentProps<JobIntakeFormData>) {
  return <IntakeStep3RoleDetails />
}

function Step4Wrapper(_props: WizardStepComponentProps<JobIntakeFormData>) {
  return <IntakeStep4Compensation />
}

function Step5Wrapper(_props: WizardStepComponentProps<JobIntakeFormData>) {
  return <IntakeStep5Interview />
}

// Step configurations
export const jobIntakeSteps: WizardStepConfig<JobIntakeFormData>[] = [
  {
    id: 'basic',
    number: 1,
    label: 'Basic Information',
    description: 'Enter job title, account, and basic details',
    icon: Building2,
    component: Step1Wrapper,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.accountId) errors.push('Please select an account.')
      if (!formData.title?.trim() || (formData.title?.trim().length || 0) < 3) {
        errors.push('Please enter a job title (at least 3 characters).')
      }
      return errors
    },
  },
  {
    id: 'requirements',
    number: 2,
    label: 'Technical Requirements',
    description: 'Define skills, experience, and qualifications',
    icon: Target,
    component: Step2Wrapper,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.requiredSkills || formData.requiredSkills.length === 0) {
        errors.push('Please add at least one required skill.')
      }
      return errors
    },
  },
  {
    id: 'role',
    number: 3,
    label: 'Role Details',
    description: 'Describe the role, team, and success metrics',
    icon: FileText,
    component: Step3Wrapper,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.roleSummary?.trim() || (formData.roleSummary?.length || 0) < 20) {
        errors.push('Please provide a role summary (at least 20 characters).')
      }
      if (!formData.responsibilities?.trim() || (formData.responsibilities?.length || 0) < 20) {
        errors.push('Please provide key responsibilities (at least 20 characters).')
      }
      return errors
    },
  },
  {
    id: 'compensation',
    number: 4,
    label: 'Logistics & Compensation',
    description: 'Set work arrangement, rates, and benefits',
    icon: DollarSign,
    component: Step4Wrapper,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.billRateMin || !formData.billRateMax) {
        errors.push('Please enter bill rate range.')
      }
      return errors
    },
  },
  {
    id: 'interview',
    number: 5,
    label: 'Interview Process',
    description: 'Configure interview rounds and submission requirements',
    icon: Calendar,
    component: Step5Wrapper,
  },
]

// Full wizard configuration
export const jobIntakeWizardConfig: WizardConfig<JobIntakeFormData> = {
  title: 'Job Requisition Intake',
  description: 'Create a new job requisition with all required details',
  entityType: 'job',

  steps: jobIntakeSteps,

  allowFreeNavigation: false,
  stepIndicatorStyle: 'numbers',

  reviewStep: {
    title: 'Review & Submit',
    sections: [
      {
        label: 'Basic Information',
        fields: ['accountName', 'title', 'jobType', 'positionsCount', 'priority', 'targetStartDate'],
        stepNumber: 1,
      },
      {
        label: 'Technical Requirements',
        fields: ['experienceLevel', 'minExperience', 'preferredExperience', 'education', 'certifications'],
        stepNumber: 2,
      },
      {
        label: 'Role Details',
        fields: ['roleSummary', 'roleOpenReason', 'teamName', 'teamSize', 'reportsTo'],
        stepNumber: 3,
      },
      {
        label: 'Compensation & Location',
        fields: ['workArrangement', 'billRateMin', 'billRateMax', 'payRateMin', 'payRateMax'],
        stepNumber: 4,
      },
      {
        label: 'Interview Process',
        fields: ['decisionDays', 'candidatesPerWeek', 'feedbackTurnaround'],
        stepNumber: 5,
      },
    ],
  },

  submitLabel: 'Create Job Requisition',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/jobs',

  storeName: 'job-intake-form',
  defaultFormData: {} as JobIntakeFormData, // Will be provided by store

  // These will be overridden in the page component
  onSubmit: async () => {},
  onSuccess: () => {},
}

