import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, addMonths, format } from 'date-fns'

// Types
export interface ExtendOfferFormData {
  // Context
  submissionId: string
  candidateName: string
  jobTitle: string
  accountName: string

  // Rates
  payRate: number
  billRate: number
  rateType: 'hourly' | 'daily' | 'weekly' | 'monthly'
  overtimeRate: number | null

  // Dates
  startDate: string
  endDate: string
  durationMonths: number

  // Employment
  employmentType: 'w2' | 'c2c' | '1099'

  // Benefits (W2 only)
  ptoDays: number
  sickDays: number
  healthInsurance: boolean
  has401k: boolean

  // Work Details
  workLocation: 'remote' | 'onsite' | 'hybrid'
  standardHoursPerWeek: number

  // Notes
  internalNotes: string
}

interface ExtendOfferStore {
  formData: ExtendOfferFormData
  activeTab: 'rates' | 'schedule' | 'benefits'
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<ExtendOfferFormData>) => void
  setActiveTab: (tab: 'rates' | 'schedule' | 'benefits') => void
  resetForm: () => void
  initializeFromSubmission: (
    submissionId: string,
    candidateName: string,
    jobTitle: string,
    accountName: string,
    defaultPayRate?: number,
    defaultBillRate?: number
  ) => void
}

const defaultFormData: ExtendOfferFormData = {
  submissionId: '',
  candidateName: '',
  jobTitle: '',
  accountName: '',
  payRate: 0,
  billRate: 0,
  rateType: 'hourly',
  overtimeRate: null,
  startDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
  endDate: format(addMonths(addDays(new Date(), 14), 6), 'yyyy-MM-dd'),
  durationMonths: 6,
  employmentType: 'w2',
  ptoDays: 10,
  sickDays: 5,
  healthInsurance: true,
  has401k: false,
  workLocation: 'remote',
  standardHoursPerWeek: 40,
  internalNotes: '',
}

export const useExtendOfferStore = create<ExtendOfferStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      activeTab: 'rates',
      isDirty: false,
      lastSaved: null,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDirty: true,
          lastSaved: new Date(),
        })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      resetForm: () =>
        set({
          formData: defaultFormData,
          activeTab: 'rates',
          isDirty: false,
          lastSaved: null,
        }),

      initializeFromSubmission: (
        submissionId,
        candidateName,
        jobTitle,
        accountName,
        defaultPayRate,
        defaultBillRate
      ) =>
        set((state) => ({
          formData: {
            ...state.formData,
            submissionId,
            candidateName,
            jobTitle,
            accountName,
            payRate: defaultPayRate || state.formData.payRate,
            billRate: defaultBillRate || state.formData.billRate,
          },
        })),
    }),
    {
      name: 'extend-offer-form',
      partialize: (state) => ({
        formData: state.formData,
        activeTab: state.activeTab,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Constants
export const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

export const EMPLOYMENT_TYPES = [
  { value: 'w2', label: 'W-2 Employee', description: 'Full employee benefits available' },
  { value: 'c2c', label: 'Corp-to-Corp', description: 'Through consulting company' },
  { value: '1099', label: '1099 Contractor', description: 'Independent contractor' },
] as const

export const WORK_LOCATIONS = [
  { value: 'remote', label: 'Remote', icon: '🏠' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔄' },
  { value: 'onsite', label: 'On-site', icon: '🏢' },
] as const

export const DURATION_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 9, label: '9 months' },
  { value: 12, label: '12 months' },
  { value: 18, label: '18 months' },
  { value: 24, label: '24 months' },
] as const
