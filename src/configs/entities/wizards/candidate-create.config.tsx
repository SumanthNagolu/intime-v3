'use client'

import {
  Upload,
  UserCircle,
  Briefcase,
  Award,
  Shield,
  DollarSign,
  FileText,
} from 'lucide-react'
import { WizardConfig, WizardStepConfig } from '../types'
import { CreateCandidateFormData } from '@/stores/create-candidate-store'

/**
 * UNIFIED 7-STEP CANDIDATE WIZARD
 *
 * Step IDs match detail section IDs exactly for consistency:
 *   1. source      -> Source selection (manual/resume/csv)
 *   2. identity    -> Identity section
 *   3. experience  -> Experience section
 *   4. skills      -> Skills section
 *   5. authorization -> Authorization section
 *   6. compensation -> Compensation section
 *   7. resume      -> Resume section
 *
 * This ensures the same mental model in creation and detail views.
 */

// Wizard step wrappers that adapt section components to wizard props
import {
  SourceSelectionStepWrapper,
  IdentityStepWrapper,
  ExperienceStepWrapper,
  SkillsStepWrapper,
  AuthorizationStepWrapper,
  CompensationStepWrapper,
  ResumeStepWrapper,
} from '@/components/candidates/wizard-steps'

import {
  candidateSourceSelectionSchema,
  candidateStep2Schema as candidateIdentitySchema,
  candidateStep4Schema as candidateExperienceSchema,
  candidateStep6Schema as candidateSkillsSchema,
  candidateStep7Schema as candidateAuthorizationSchema,
  candidateStep8Schema as candidateCompensationSchema,
  candidateStep1Schema as candidateResumeSchema,
} from './candidate-intake.config'

// Step configurations - 7-step unified wizard (IDs match detail sections)
// Each wrapper component bridges wizard props (formData, setFormData, errors)
// to section props (mode, data, onChange)
export const candidateCreateSteps: WizardStepConfig<CreateCandidateFormData>[] = [
  {
    id: 'source',
    number: 1,
    label: 'Source',
    description: 'How are you adding this candidate?',
    icon: Upload,
    component: SourceSelectionStepWrapper,
    fields: [],
    validation: candidateSourceSelectionSchema,
  },
  {
    id: 'identity',
    number: 2,
    label: 'Identity',
    description: 'Contact info, headline & summary',
    icon: UserCircle,
    component: IdentityStepWrapper,
    fields: [],
    validation: candidateIdentitySchema,
  },
  {
    id: 'experience',
    number: 3,
    label: 'Experience',
    description: 'Work history & education',
    icon: Briefcase,
    component: ExperienceStepWrapper,
    fields: [],
    validation: candidateExperienceSchema,
  },
  {
    id: 'skills',
    number: 4,
    label: 'Skills',
    description: 'Technical skills & certifications',
    icon: Award,
    component: SkillsStepWrapper,
    fields: [],
    validation: candidateSkillsSchema,
  },
  {
    id: 'authorization',
    number: 5,
    label: 'Authorization',
    description: 'Visa status & availability',
    icon: Shield,
    component: AuthorizationStepWrapper,
    fields: [],
    validation: candidateAuthorizationSchema,
  },
  {
    id: 'compensation',
    number: 6,
    label: 'Compensation',
    description: 'Pay rates & preferences',
    icon: DollarSign,
    component: CompensationStepWrapper,
    fields: [],
    validation: candidateCompensationSchema,
  },
  {
    id: 'resume',
    number: 7,
    label: 'Resume',
    description: 'Resume upload & source tracking',
    icon: FileText,
    component: ResumeStepWrapper,
    fields: [],
    validation: candidateResumeSchema,
  },
]

// Full wizard configuration
export const candidateCreateWizardConfig: WizardConfig<CreateCandidateFormData> = {
  title: 'Add Candidate',
  description: 'Add a new candidate to your talent database',
  entityType: 'candidate',

  steps: candidateCreateSteps,

  allowFreeNavigation: false,
  stepIndicatorStyle: 'icons',

  // Review step - sections match the 7 unified steps (source step is not reviewed)
  reviewStep: {
    title: 'Review & Create',
    sections: [
      {
        label: 'Identity',
        fields: ['firstName', 'lastName', 'email', 'phone', 'linkedinProfile', 'location', 'locationCity', 'locationState', 'locationCountry', 'professionalHeadline', 'professionalSummary', 'experienceYears'],
        stepNumber: 2,
      },
      {
        label: 'Experience',
        fields: ['workHistory', 'education'],
        stepNumber: 3,
      },
      {
        label: 'Skills',
        fields: ['skills', 'certifications'],
        stepNumber: 4,
      },
      {
        label: 'Authorization',
        fields: ['visaStatus', 'visaExpiryDate', 'requiresSponsorship', 'currentSponsor', 'isTransferable', 'availability', 'availableFrom', 'noticePeriodDays', 'willingToRelocate', 'relocationPreferences', 'isRemoteOk'],
        stepNumber: 5,
      },
      {
        label: 'Compensation',
        fields: ['rateType', 'currency', 'minimumRate', 'desiredRate', 'isNegotiable', 'compensationNotes', 'employmentTypes', 'workModes'],
        stepNumber: 6,
      },
      {
        label: 'Resume & Source',
        fields: ['sourceType', 'resumeFileName', 'resumeFileSize', 'leadSource', 'sourceDetails', 'referredBy', 'campaignId', 'isOnHotlist', 'hotlistNotes', 'tags', 'internalNotes'],
        stepNumber: 7,
      },
    ],
  },

  submitLabel: 'Add Candidate',
  saveDraftLabel: 'Save Draft',
  cancelRoute: '/employee/recruiting/candidates',

  storeName: 'create-candidate-form',
  defaultFormData: {
    sourceType: 'manual',
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    phone: { countryCode: 'US', number: '' },
    mobile: { countryCode: 'US', number: '' },
    // Professional
    professionalHeadline: '',
    professionalSummary: '',
    skills: [],
    experienceYears: 0,
    employmentTypes: ['full_time'],
    workModes: ['on_site'],
    // Lists
    workHistory: [],
    education: [],
    primarySkills: [],
    certifications: [],
    // Auth
    visaStatus: 'us_citizen',
    requiresSponsorship: false,
    availability: '2_weeks',
    willingToRelocate: false,
    isRemoteOk: false,
    // Compensation
    rateType: 'hourly',
    currency: 'USD',
    isNegotiable: true,
    // Docs
    leadSource: 'linkedin',
    isOnHotlist: false,
    tags: [],
    complianceDocuments: [],
  } as CreateCandidateFormData,

  onSubmit: async () => { },
  onSuccess: () => { },
}

// Factory function to create config with custom handlers
export function createCandidateCreateConfig(
  onSubmit: (formData: CreateCandidateFormData) => Promise<unknown>,
  options?: {
    onSuccess?: (result: unknown) => void
    cancelRoute?: string
    title?: string
  }
): WizardConfig<CreateCandidateFormData> {
  return {
    ...candidateCreateWizardConfig,
    title: options?.title || candidateCreateWizardConfig.title,
    cancelRoute: options?.cancelRoute || candidateCreateWizardConfig.cancelRoute,
    onSubmit,
    onSuccess: options?.onSuccess,
  }
}
