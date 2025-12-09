import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CandidateIntakeFormData } from '@/configs/entities/wizards/candidate-intake.config'

interface CandidateIntakeStore {
  formData: CandidateIntakeFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<CandidateIntakeFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
}

const defaultFormData: CandidateIntakeFormData = {
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
  willingToRelocate: false,
  isRemoteOk: false,
  minimumHourlyRate: undefined,
  desiredHourlyRate: undefined,
  leadSource: 'linkedin',
  sourceDetails: '',
  isOnHotlist: false,
  hotlistNotes: '',
}

export const useCandidateIntakeStore = create<CandidateIntakeStore>()(
  persist(
    (set, get) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,

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
    }),
    {
      name: 'candidate-intake-form',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Export visa status options
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
]

export const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '2_weeks', label: '2 Weeks Notice' },
  { value: '30_days', label: '30 Days Notice' },
  { value: 'not_available', label: 'Not Available' },
]

export const LEAD_SOURCES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'dice', label: 'Dice' },
  { value: 'monster', label: 'Monster' },
  { value: 'referral', label: 'Employee Referral' },
  { value: 'direct', label: 'Direct Application' },
  { value: 'agency', label: 'Agency/Partner' },
  { value: 'job_board', label: 'Other Job Board' },
  { value: 'other', label: 'Other' },
]

