import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface SubmitToClientFormData {
  // Context
  submissionId: string
  candidateName: string
  jobTitle: string
  accountName: string

  // Rates
  payRate: number
  billRate: number

  // Notes
  submissionNotes: string
  internalNotes: string

  // Method
  submissionMethod: 'email' | 'vms' | 'manual'
}

interface SubmitToClientStore {
  formData: SubmitToClientFormData
  currentStep: 'rates' | 'notes' | 'review'
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<SubmitToClientFormData>) => void
  setCurrentStep: (step: 'rates' | 'notes' | 'review') => void
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

const defaultFormData: SubmitToClientFormData = {
  submissionId: '',
  candidateName: '',
  jobTitle: '',
  accountName: '',
  payRate: 0,
  billRate: 0,
  submissionNotes: '',
  internalNotes: '',
  submissionMethod: 'email',
}

export const useSubmitToClientStore = create<SubmitToClientStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      currentStep: 'rates',
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
          currentStep: 'rates',
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
      name: 'submit-to-client-form',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Constants
export const SUBMISSION_METHODS = [
  {
    value: 'email',
    label: 'Email Submission',
    description: 'Send candidate via email to client',
  },
  {
    value: 'vms',
    label: 'VMS Submission',
    description: 'Submit through vendor management system',
  },
  {
    value: 'manual',
    label: 'Manual/External',
    description: 'Already submitted externally',
  },
] as const
