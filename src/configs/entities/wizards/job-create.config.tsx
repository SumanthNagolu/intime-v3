'use client'

import {
  Building2,
  ClipboardList,
  FileText,
  MapPin,
  DollarSign,
  Calendar,
  Users,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig } from '../types'
import { CreateJobFormData } from '@/stores/create-job-store'

// Step components
import { JobIntakeStep1BasicInfo } from '@/components/recruiting/jobs/intake/JobIntakeStep1BasicInfo'
import { JobIntakeStep2Requirements } from '@/components/recruiting/jobs/intake/JobIntakeStep2Requirements'
import { JobIntakeStep3RoleDetails } from '@/components/recruiting/jobs/intake/JobIntakeStep3RoleDetails'
import { JobIntakeStep4Location } from '@/components/recruiting/jobs/intake/JobIntakeStep4Location'
import { JobIntakeStep5Compensation } from '@/components/recruiting/jobs/intake/JobIntakeStep5Compensation'
import { JobIntakeStep6Interview } from '@/components/recruiting/jobs/intake/JobIntakeStep6Interview'
import { JobIntakeStep7Team } from '@/components/recruiting/jobs/intake/JobIntakeStep7Team'

// Step configurations
export const jobCreateSteps: WizardStepConfig<CreateJobFormData>[] = [
  {
    id: 'basic',
    number: 1,
    label: 'Basic Information',
    description: 'Account, title, type, and dates',
    icon: Building2,
    component: JobIntakeStep1BasicInfo,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.accountId) {
        errors.push('Please select a client account.')
      }
      if (!formData.title || formData.title.length < 3) {
        errors.push('Please enter a valid job title (at least 3 characters).')
      }
      if (!formData.positionsCount || formData.positionsCount < 1) {
        errors.push('Number of positions must be at least 1.')
      }
      return errors
    },
  },
  {
    id: 'requirements',
    number: 2,
    label: 'Requirements',
    description: 'Skills, experience, and qualifications',
    icon: ClipboardList,
    component: JobIntakeStep2Requirements,
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
    description: 'Summary, responsibilities, and team',
    icon: FileText,
    component: JobIntakeStep3RoleDetails,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.roleSummary || formData.roleSummary.length < 20) {
        errors.push('Please provide a role summary (at least 20 characters).')
      }
      return errors
    },
  },
  {
    id: 'location',
    number: 4,
    label: 'Location',
    description: 'Work arrangement and authorization',
    icon: MapPin,
    component: JobIntakeStep4Location,
    validateFn: (formData) => {
      const errors: string[] = []
      // Location is required for non-remote jobs
      if (formData.workArrangement !== 'remote') {
        if (!formData.locationCity && !formData.location) {
          errors.push('Please provide a work location for non-remote positions.')
        }
      }
      return errors
    },
  },
  {
    id: 'compensation',
    number: 5,
    label: 'Compensation',
    description: 'Rates, fees, and benefits',
    icon: DollarSign,
    component: JobIntakeStep5Compensation,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.billRateMin || !formData.billRateMax) {
        errors.push('Please enter bill rate range.')
      }
      // Ensure min <= max
      if (formData.billRateMin && formData.billRateMax) {
        const min = parseFloat(formData.billRateMin)
        const max = parseFloat(formData.billRateMax)
        if (!isNaN(min) && !isNaN(max) && min > max) {
          errors.push('Minimum bill rate cannot be greater than maximum.')
        }
      }
      return errors
    },
  },
  {
    id: 'interview',
    number: 6,
    label: 'Interview Process',
    description: 'Rounds, timelines, and requirements',
    icon: Calendar,
    component: JobIntakeStep6Interview,
    validateFn: () => {
      // Interview process is optional
      return []
    },
  },
  {
    id: 'team',
    number: 7,
    label: 'Team Assignment',
    description: 'Owner, recruiters, and priority',
    icon: Users,
    component: JobIntakeStep7Team,
    validateFn: (formData) => {
      const errors: string[] = []
      if (!formData.ownerId) {
        errors.push('Please assign a job owner.')
      }
      return errors
    },
  },
]

// Full wizard configuration
export const jobCreateWizardConfig: WizardConfig<CreateJobFormData> = {
  title: 'Create Job Requisition',
  description: 'Set up a new job requisition in the system',
  entityType: 'job',

  steps: jobCreateSteps,

  allowFreeNavigation: true, // Allow jumping between steps for better UX
  stepIndicatorStyle: 'icons',

  reviewStep: {
    title: 'Review & Create',
    sections: [
      {
        label: 'Basic Information',
        fields: [
          'accountName',
          'title',
          'description',
          'positionsCount',
          'jobType',
          'priority',
          'urgency',
          'targetStartDate',
          'targetEndDate',
          'targetFillDate',
          'intakeMethod',
          'externalJobId',
        ],
        stepNumber: 1,
      },
      {
        label: 'Requirements',
        fields: [
          'requiredSkills',
          'preferredSkills',
          'minExperience',
          'maxExperience',
          'experienceLevel',
          'education',
          'certifications',
          'industries',
          'visaRequirements',
        ],
        stepNumber: 2,
      },
      {
        label: 'Role Details',
        fields: [
          'roleSummary',
          'responsibilities',
          'roleOpenReason',
          'teamName',
          'teamSize',
          'reportsTo',
          'directReports',
          'keyProjects',
          'successMetrics',
        ],
        stepNumber: 3,
      },
      {
        label: 'Location & Work',
        fields: [
          'workArrangement',
          'hybridDays',
          'location',
          'locationCity',
          'locationState',
          'locationCountry',
          'locationRestrictions',
          'workAuthorizations',
        ],
        stepNumber: 4,
      },
      {
        label: 'Compensation',
        fields: [
          'rateType',
          'currency',
          'billRateMin',
          'billRateMax',
          'payRateMin',
          'payRateMax',
          'feeType',
          'feePercentage',
          'feeFlatAmount',
          'benefits',
          'weeklyHours',
          'overtimeExpected',
          'onCallRequired',
        ],
        stepNumber: 5,
      },
      {
        label: 'Interview Process',
        fields: [
          'interviewRounds',
          'decisionDays',
          'candidatesPerWeek',
          'feedbackTurnaround',
          'submissionRequirements',
          'submissionFormat',
          'screeningQuestions',
        ],
        stepNumber: 6,
      },
      {
        label: 'Team Assignment',
        fields: ['ownerId', 'recruiterIds', 'priorityRank', 'slaDays'],
        stepNumber: 7,
      },
    ],
  },

  submitLabel: 'Create Job Requisition',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/jobs',

  storeName: 'create-job-form',
  defaultFormData: {} as CreateJobFormData,

  // These will be overridden in the page component
  onSubmit: async () => {},
  onSuccess: () => {},
}

// Factory function to create config with custom handlers
export function createJobCreateConfig(
  onSubmit: (formData: CreateJobFormData) => Promise<unknown>,
  options?: {
    onSuccess?: (result: unknown) => void
    cancelRoute?: string
    title?: string
  }
): WizardConfig<CreateJobFormData> {
  return {
    ...jobCreateWizardConfig,
    title: options?.title || jobCreateWizardConfig.title,
    cancelRoute: options?.cancelRoute || jobCreateWizardConfig.cancelRoute,
    onSubmit,
    onSuccess: options?.onSuccess,
  }
}
