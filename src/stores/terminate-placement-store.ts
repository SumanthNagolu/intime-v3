import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

// Types
export interface TerminatePlacementFormData {
  // Context
  placementId: string
  candidateName: string
  jobTitle: string
  accountName: string
  startDate: string
  currentEndDate: string | null
  payRate: number
  billRate: number

  // Termination Details
  lastDay: string
  initiatedBy: 'client' | 'contractor' | 'mutual' | 'intime'
  terminationReason: string
  reasonDetails: string
  noticeCompliance: 'met' | 'below_met' | 'waived'

  // Offboarding
  finalTimesheetSubmitted: boolean
  equipmentReturnArranged: boolean
  accessRevoked: boolean
  exitInterviewScheduled: boolean

  // Replacement
  offerReplacement: boolean

  // Notes
  internalNotes: string
  lessonsLearned: string
}

interface TerminatePlacementStore {
  formData: TerminatePlacementFormData
  currentStep: 1 | 2 | 3
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<TerminatePlacementFormData>) => void
  setCurrentStep: (step: 1 | 2 | 3) => void
  resetForm: () => void
  initializeFromPlacement: (
    placementId: string,
    candidateName: string,
    jobTitle: string,
    accountName: string,
    startDate: string,
    currentEndDate: string | null,
    payRate: number,
    billRate: number
  ) => void
}

const defaultFormData: TerminatePlacementFormData = {
  placementId: '',
  candidateName: '',
  jobTitle: '',
  accountName: '',
  startDate: '',
  currentEndDate: null,
  payRate: 0,
  billRate: 0,
  lastDay: format(new Date(), 'yyyy-MM-dd'),
  initiatedBy: 'client',
  terminationReason: '',
  reasonDetails: '',
  noticeCompliance: 'met',
  finalTimesheetSubmitted: false,
  equipmentReturnArranged: false,
  accessRevoked: false,
  exitInterviewScheduled: false,
  offerReplacement: false,
  internalNotes: '',
  lessonsLearned: '',
}

export const useTerminatePlacementStore = create<TerminatePlacementStore>()(
  persist(
    (set) => ({
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

      initializeFromPlacement: (
        placementId,
        candidateName,
        jobTitle,
        accountName,
        startDate,
        currentEndDate,
        payRate,
        billRate
      ) =>
        set((state) => ({
          formData: {
            ...state.formData,
            placementId,
            candidateName,
            jobTitle,
            accountName,
            startDate,
            currentEndDate,
            payRate,
            billRate,
          },
        })),
    }),
    {
      name: 'terminate-placement-form',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Constants
export const TERMINATION_INITIATED_BY = [
  { value: 'client', label: 'Client', description: 'Client requests contractor removal' },
  { value: 'contractor', label: 'Contractor', description: 'Contractor resigns' },
  { value: 'mutual', label: 'Mutual Agreement', description: 'Both parties agreed to end' },
  { value: 'intime', label: 'InTime (Performance/Compliance)', description: 'Performance or compliance issue' },
] as const

export const TERMINATION_REASONS = [
  'Performance - Not meeting expectations',
  'Budget/Headcount reduction',
  'Project cancelled/postponed',
  'Better opportunity (contractor)',
  'Personal reasons (contractor)',
  'Culture fit issues',
  'Skill mismatch',
  'Client-side organizational change',
  'Other',
] as const

export const GUARANTEE_TIERS = [
  { days: 7, guarantee: 'Full', discount: 100 },
  { days: 30, guarantee: 'Performance-based', discount: 100 },
  { days: 60, guarantee: 'Partial', discount: 50 },
  { days: 90, guarantee: 'Partial', discount: 25 },
  { days: Infinity, guarantee: 'None', discount: 0 },
] as const

export const OFFBOARDING_CHECKLIST = [
  { key: 'finalTimesheetSubmitted', label: 'Final timesheet submitted' },
  { key: 'equipmentReturnArranged', label: 'Equipment return arranged (laptop, badge)' },
  { key: 'accessRevoked', label: 'Access revocation requested' },
  { key: 'exitInterviewScheduled', label: 'Exit interview scheduled' },
] as const
