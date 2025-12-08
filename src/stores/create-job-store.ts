import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CreateJobFormData {
  // Step 1: Basic Info
  title: string
  accountId: string
  jobType: string
  location: string
  isRemote: boolean
  isHybrid: boolean
  hybridDays: number

  // Step 2: Requirements
  requiredSkills: string[]
  niceToHaveSkills: string[]
  minExperience: string
  maxExperience: string
  description: string

  // Step 3: Compensation
  rateMin: string
  rateMax: string
  rateType: string
  positionsCount: number
  priority: string
  targetFillDate: string
  targetStartDate: string
}

interface CreateJobStore {
  formData: CreateJobFormData
  accountId: string | null
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<CreateJobFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  initializeFromAccount: (accountId: string) => void
  addSkill: (skill: string, isRequired: boolean) => void
  removeSkill: (skill: string, isRequired: boolean) => void
}

const defaultFormData: CreateJobFormData = {
  // Step 1
  title: '',
  accountId: '',
  jobType: 'contract',
  location: '',
  isRemote: false,
  isHybrid: false,
  hybridDays: 3,

  // Step 2
  requiredSkills: [],
  niceToHaveSkills: [],
  minExperience: '',
  maxExperience: '',
  description: '',

  // Step 3
  rateMin: '',
  rateMax: '',
  rateType: 'hourly',
  positionsCount: 1,
  priority: 'normal',
  targetFillDate: '',
  targetStartDate: '',
}

export const useCreateJobStore = create<CreateJobStore>()(
  persist(
    (set, get) => ({
      formData: defaultFormData,
      accountId: null,
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
          accountId: null,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
        }),

      initializeFromAccount: (accountId) =>
        set((state) => ({
          accountId,
          formData: { ...state.formData, accountId },
        })),

      addSkill: (skill, isRequired) => {
        const { formData } = get()
        const trimmedSkill = skill.trim()
        if (!trimmedSkill) return

        if (isRequired) {
          if (!formData.requiredSkills.includes(trimmedSkill)) {
            set((state) => ({
              formData: {
                ...state.formData,
                requiredSkills: [...state.formData.requiredSkills, trimmedSkill],
              },
              isDirty: true,
              lastSaved: new Date(),
            }))
          }
        } else {
          if (!formData.niceToHaveSkills.includes(trimmedSkill)) {
            set((state) => ({
              formData: {
                ...state.formData,
                niceToHaveSkills: [...state.formData.niceToHaveSkills, trimmedSkill],
              },
              isDirty: true,
              lastSaved: new Date(),
            }))
          }
        }
      },

      removeSkill: (skill, isRequired) => {
        if (isRequired) {
          set((state) => ({
            formData: {
              ...state.formData,
              requiredSkills: state.formData.requiredSkills.filter((s) => s !== skill),
            },
            isDirty: true,
            lastSaved: new Date(),
          }))
        } else {
          set((state) => ({
            formData: {
              ...state.formData,
              niceToHaveSkills: state.formData.niceToHaveSkills.filter((s) => s !== skill),
            },
            isDirty: true,
            lastSaved: new Date(),
          }))
        }
      },
    }),
    {
      name: 'create-job-form',
      partialize: (state) => ({
        formData: state.formData,
        accountId: state.accountId,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Constants for form options
export const JOB_TYPES = [
  { value: 'contract', label: 'Contract' },
  { value: 'permanent', label: 'Permanent (Direct Hire)' },
  { value: 'contract_to_hire', label: 'Contract to Hire' },
  { value: 'temp', label: 'Temporary' },
  { value: 'sow', label: 'Statement of Work (SOW)' },
]

export const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-charcoal-500' },
  { value: 'normal', label: 'Normal', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-amber-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-orange-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-500' },
]

export const RATE_SUFFIXES: Record<string, string> = {
  hourly: '/hr',
  daily: '/day',
  weekly: '/week',
  monthly: '/mo',
  annual: '/yr',
}
