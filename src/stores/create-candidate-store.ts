'use client'

import { create } from 'zustand'

// Candidate form data type - matches CandidateIntakeFormData
export interface CreateCandidateFormData {
  // Step 1: Source
  sourceType: 'manual' | 'resume' | 'linkedin'
  resumeStoragePath?: string
  resumeParsed?: boolean
  linkedinUrl?: string

  // Step 2: Basic Info
  firstName: string
  lastName: string
  email: string
  phone?: string
  linkedinProfile?: string

  // Step 3: Professional
  professionalHeadline?: string
  professionalSummary?: string
  skills: string[]
  experienceYears: number

  // Step 4: Work Authorization
  visaStatus: 'us_citizen' | 'green_card' | 'h1b' | 'l1' | 'tn' | 'opt' | 'cpt' | 'ead' | 'other'
  availability: 'immediate' | '2_weeks' | '30_days' | 'not_available'
  location: string
  locationCity?: string
  locationState?: string
  locationCountry?: string
  willingToRelocate: boolean
  isRemoteOk: boolean
  minimumHourlyRate?: number
  desiredHourlyRate?: number

  // Step 5: Source Tracking
  leadSource: 'linkedin' | 'indeed' | 'dice' | 'monster' | 'referral' | 'direct' | 'agency' | 'job_board' | 'other'
  sourceDetails?: string
  isOnHotlist: boolean
  hotlistNotes?: string
}

interface CreateCandidateStore {
  formData: CreateCandidateFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null
  // Resume file stored separately (not serializable to wizard_state)
  resumeFile: File | null
  resumeParsedData: import('@/lib/services/resume-parser').ParsedResumeData | null

  // Actions
  setFormData: (data: Partial<CreateCandidateFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  setResumeFile: (file: File | null, parsedData: import('@/lib/services/resume-parser').ParsedResumeData | null) => void
}

const defaultFormData: CreateCandidateFormData = {
  sourceType: 'manual',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  linkedinProfile: '',
  professionalHeadline: '',
  professionalSummary: '',
  skills: [],
  experienceYears: 0,
  visaStatus: 'us_citizen',
  availability: '2_weeks',
  location: '',
  locationCity: '',
  locationState: '',
  locationCountry: 'US',
  willingToRelocate: false,
  isRemoteOk: false,
  minimumHourlyRate: undefined,
  desiredHourlyRate: undefined,
  leadSource: 'linkedin',
  sourceDetails: '',
  isOnHotlist: false,
  hotlistNotes: '',
}

// NO localStorage persistence - DB is the only source of truth
// This prevents stale data from old drafts bleeding into new ones
export const useCreateCandidateStore = create<CreateCandidateStore>()((set, get) => ({
  formData: defaultFormData,
  currentStep: 1,
  isDirty: false,
  lastSaved: null,
  resumeFile: null,
  resumeParsedData: null,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      isDirty: true,
      lastSaved: new Date(),
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  resetForm: () =>
    set({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,
      resumeFile: null,
      resumeParsedData: null,
    }),

  addSkill: (skill) => {
    const { formData } = get()
    const trimmedSkill = skill.trim()
    if (!trimmedSkill || formData.skills.includes(trimmedSkill)) return

    set((state) => ({
      formData: {
        ...state.formData,
        skills: [...state.formData.skills, trimmedSkill],
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  removeSkill: (skill) => {
    set((state) => ({
      formData: {
        ...state.formData,
        skills: state.formData.skills.filter((s) => s !== skill),
      },
      isDirty: true,
      lastSaved: new Date(),
    }))
  },

  setResumeFile: (file, parsedData) =>
    set({
      resumeFile: file,
      resumeParsedData: parsedData,
    }),
}))

// Constants
export const VISA_STATUSES = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b', label: 'H1B' },
  { value: 'l1', label: 'L1' },
  { value: 'tn', label: 'TN' },
  { value: 'opt', label: 'OPT' },
  { value: 'cpt', label: 'CPT' },
  { value: 'ead', label: 'EAD' },
  { value: 'other', label: 'Other' },
] as const

export const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '2_weeks', label: '2 Weeks Notice' },
  { value: '30_days', label: '30 Days Notice' },
  { value: 'not_available', label: 'Not Available' },
] as const

export const LEAD_SOURCES = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'indeed', label: 'Indeed', icon: '🔍' },
  { value: 'dice', label: 'Dice', icon: '🎲' },
  { value: 'monster', label: 'Monster', icon: '👾' },
  { value: 'referral', label: 'Employee Referral', icon: '👥' },
  { value: 'direct', label: 'Direct Application', icon: '📩' },
  { value: 'agency', label: 'Agency/Partner', icon: '🤝' },
  { value: 'job_board', label: 'Other Job Board', icon: '📋' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const

export const SOURCE_TYPES = [
  { value: 'manual', label: 'Manual Entry', description: 'Enter details manually', icon: '✏️' },
  { value: 'resume', label: 'Upload Resume', description: 'Parse from resume with AI', icon: '📄' },
  { value: 'linkedin', label: 'LinkedIn Import', description: 'Import from URL (coming soon)', icon: '💼', disabled: true },
] as const
