import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type PhoneInputValue, parsePhoneValue } from '@/components/ui/phone-input'

// Types
export interface AdditionalContact {
  firstName: string
  lastName: string
  email: string
  phone: PhoneInputValue
  title: string
  roles: string[]
}

export interface AccountOnboardingFormData {
  // Step 1: Company Profile
  legalName: string
  dbaName: string
  industries: string[]
  companySize: string
  yearFounded: string
  website: string
  linkedinUrl: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
  country: string
  taxId: string
  fundingStage: string
  accountClassification: string

  // Step 2: Contract Setup
  contractType: string
  contractSignedDate: string
  contractStartDate: string
  contractEndDate: string
  isEvergreen: boolean
  useCustomRateCard: boolean
  conversionFeePercent: string
  guaranteePeriodDays: string
  noticePeriodWeeks: string
  contractNotes: string

  // Step 3: Billing Setup
  billingEntityName: string
  paymentTerms: string
  billingFrequency: string
  billingCurrency: string
  useSameAddress: boolean
  billingAddress: string
  billingContactName: string
  billingContactTitle: string
  billingContactEmail: string
  billingContactPhone: PhoneInputValue
  invoiceDelivery: string
  invoiceCc: string
  poRequired: boolean
  poNumber: string
  timesheetApprover: string
  approvalMethod: string

  // Step 4: Key Contacts
  additionalContacts: AdditionalContact[]
  preferredChannel: string
  meetingCadence: string

  // Step 5: Job Categories
  selectedJobCategories: string[]
  techStack: string
  niceToHaveSkills: string
  workAuthorizations: string[]
  experienceLevels: string[]
  locationPreferences: string[]
  interviewRounds: string
  interviewProcessNotes: string
  avgDecisionDays: string

  // Step 6: Kickoff Call
  scheduleKickoff: boolean
  kickoffAttendees: string
  kickoffDuration: string
  kickoffMeetingType: string
  kickoffDate: string
  sendWelcomeEmail: boolean
  includeCompanyDeck: boolean
  sharePortalAccess: boolean
  internalNotes: string
}

interface AccountOnboardingStore {
  formData: AccountOnboardingFormData
  accountId: string
  accountName: string
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<AccountOnboardingFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  initializeFromAccount: (accountId: string, accountName: string) => void
}

const defaultFormData: AccountOnboardingFormData = {
  // Step 1
  legalName: '',
  dbaName: '',
  industries: [],
  companySize: '',
  yearFounded: '',
  website: '',
  linkedinUrl: '',
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  taxId: '',
  fundingStage: '',
  accountClassification: '',

  // Step 2
  contractType: 'msa',
  contractSignedDate: '',
  contractStartDate: '',
  contractEndDate: '',
  isEvergreen: false,
  useCustomRateCard: false,
  conversionFeePercent: '20',
  guaranteePeriodDays: '30',
  noticePeriodWeeks: '2',
  contractNotes: '',

  // Step 3
  billingEntityName: '',
  paymentTerms: 'net_30',
  billingFrequency: 'biweekly',
  billingCurrency: 'USD',
  useSameAddress: true,
  billingAddress: '',
  billingContactName: '',
  billingContactTitle: '',
  billingContactEmail: '',
  billingContactPhone: { countryCode: 'US', number: '' },
  invoiceDelivery: 'email',
  invoiceCc: '',
  poRequired: false,
  poNumber: '',
  timesheetApprover: '',
  approvalMethod: 'email',

  // Step 4
  additionalContacts: [],
  preferredChannel: 'email',
  meetingCadence: 'weekly',

  // Step 5
  selectedJobCategories: [],
  techStack: '',
  niceToHaveSkills: '',
  workAuthorizations: ['us_citizen', 'green_card'],
  experienceLevels: ['mid', 'senior'],
  locationPreferences: ['remote_us'],
  interviewRounds: '4',
  interviewProcessNotes: '',
  avgDecisionDays: '3-5',

  // Step 6
  scheduleKickoff: true,
  kickoffAttendees: '',
  kickoffDuration: '45',
  kickoffMeetingType: 'video',
  kickoffDate: '',
  sendWelcomeEmail: true,
  includeCompanyDeck: true,
  sharePortalAccess: true,
  internalNotes: '',
}

// Migration function to handle old string phone format
function migrateFormData(data: any): AccountOnboardingFormData {
  // If billingContactPhone is a string, convert it to PhoneInputValue
  if (data.billingContactPhone && typeof data.billingContactPhone === 'string') {
    data.billingContactPhone = parsePhoneValue(data.billingContactPhone)
  } else if (!data.billingContactPhone || typeof data.billingContactPhone !== 'object' || !data.billingContactPhone.countryCode) {
    data.billingContactPhone = { countryCode: 'US', number: '' }
  }
  
  // Migrate phone fields in additionalContacts array
  if (data.additionalContacts && Array.isArray(data.additionalContacts)) {
    data.additionalContacts = data.additionalContacts.map((contact: any) => {
      if (contact.phone && typeof contact.phone === 'string') {
        contact.phone = parsePhoneValue(contact.phone)
      } else if (!contact.phone || typeof contact.phone !== 'object' || !contact.phone.countryCode) {
        contact.phone = { countryCode: 'US', number: '' }
      }
      return contact
    })
  }
  
  return { ...defaultFormData, ...data }
}

export const useAccountOnboardingStore = create<AccountOnboardingStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      accountId: '',
      accountName: '',
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
          accountId: '',
          accountName: '',
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
        }),

      initializeFromAccount: (accountId, accountName) =>
        set((state) => ({
          accountId,
          accountName,
          formData: { ...state.formData },
        })),
    }),
    {
      name: 'account-onboarding-form',
      partialize: (state) => ({
        formData: state.formData,
        accountId: state.accountId,
        accountName: state.accountName,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
      onRehydrateStorage: () => (state) => {
        // Migrate old data format on rehydration
        if (state?.formData) {
          state.formData = migrateFormData(state.formData)
        }
      },
    }
  )
)

// Constants for form options
export const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'fintech', label: 'Financial Technology (FinTech)' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'education', label: 'Education' },
  { value: 'government', label: 'Government' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'other', label: 'Other' },
]

export const COMPANY_SIZES = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

export const PAYMENT_TERMS = [
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30 (Standard)' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
]

export const BILLING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly (Every Friday)' },
  { value: 'biweekly', label: 'Bi-weekly (Every other Friday)' },
  { value: 'monthly', label: 'Monthly (1st of month)' },
]

export const JOB_CATEGORIES = [
  {
    group: 'Engineering',
    items: [
      { value: 'backend_engineer', label: 'Backend Engineer' },
      { value: 'frontend_engineer', label: 'Frontend Engineer' },
      { value: 'fullstack_engineer', label: 'Full Stack Engineer' },
      { value: 'mobile_engineer', label: 'Mobile Engineer (iOS/Android)' },
      { value: 'devops_sre', label: 'DevOps / SRE' },
      { value: 'qa_engineer', label: 'QA Engineer' },
      { value: 'data_engineer', label: 'Data Engineer' },
      { value: 'ml_ai_engineer', label: 'ML / AI Engineer' },
    ],
  },
  {
    group: 'Leadership',
    items: [
      { value: 'engineering_manager', label: 'Engineering Manager' },
      { value: 'tech_lead', label: 'Tech Lead / Staff Engineer' },
      { value: 'director_engineering', label: 'Director of Engineering' },
      { value: 'vp_engineering', label: 'VP Engineering' },
    ],
  },
  {
    group: 'Product & Design',
    items: [
      { value: 'product_manager', label: 'Product Manager' },
      { value: 'ux_designer', label: 'UX Designer' },
      { value: 'product_designer', label: 'Product Designer' },
    ],
  },
]

export const CONTACT_ROLES = [
  { value: 'primary', label: 'Primary Contact' },
  { value: 'hiring_manager', label: 'Hiring Manager' },
  { value: 'executive_sponsor', label: 'Executive Sponsor' },
  { value: 'technical_lead', label: 'Technical Lead' },
  { value: 'billing', label: 'Billing Contact' },
  { value: 'hr', label: 'HR Contact' },
  { value: 'timesheet_approver', label: 'Timesheet Approver' },
]
