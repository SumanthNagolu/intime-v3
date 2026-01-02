import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type PhoneInputValue, type PhoneCountryCode } from '@/components/ui/phone-input'

// Re-export the phone type for backward compatibility
export type PhoneValue = PhoneInputValue

export interface CreateAccountFormData {
  // Step 1: Company Basics
  name: string
  industries: string[]
  companyType: 'direct_client' | 'implementation_partner' | 'staffing_vendor'
  tier: '' | 'preferred' | 'strategic' | 'exclusive'
  segment: '' | 'enterprise' | 'mid_market' | 'smb' | 'startup'
  website: string
  phone: PhoneValue
  // Headquarters location with street address
  hqStreetAddress: string
  hqCity: string
  hqState: string
  hqCountry: string
  linkedinUrl: string
  description: string

  // Step 2: Billing & Terms
  billingEntityName: string
  billingEmail: string
  billingPhone: PhoneValue
  billingAddress: string
  billingCity: string
  billingState: string
  billingPostalCode: string
  billingCountry: string
  billingFrequency: 'weekly' | 'biweekly' | 'monthly'
  paymentTermsDays: string
  poRequired: boolean

  // Step 3: Primary Contact
  primaryContactName: string
  primaryContactEmail: string
  primaryContactTitle: string
  primaryContactPhone: PhoneValue
  preferredContactMethod: 'email' | 'phone' | 'slack' | 'teams'
  meetingCadence: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
}

interface CreateAccountStore {
  formData: CreateAccountFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<CreateAccountFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  toggleIndustry: (industry: string) => void
}

const defaultPhoneValue: PhoneValue = {
  countryCode: 'US',
  number: '',
}

const defaultFormData: CreateAccountFormData = {
  // Step 1
  name: '',
  industries: [],
  companyType: 'direct_client',
  tier: '',
  segment: '',
  website: '',
  phone: { ...defaultPhoneValue },
  hqStreetAddress: '',
  hqCity: '',
  hqState: '',
  hqCountry: 'US',
  linkedinUrl: '',
  description: '',

  // Step 2
  billingEntityName: '',
  billingEmail: '',
  billingPhone: { ...defaultPhoneValue },
  billingAddress: '',
  billingCity: '',
  billingState: '',
  billingPostalCode: '',
  billingCountry: 'US',
  billingFrequency: 'monthly',
  paymentTermsDays: '30',
  poRequired: false,

  // Step 3
  primaryContactName: '',
  primaryContactEmail: '',
  primaryContactTitle: '',
  primaryContactPhone: { ...defaultPhoneValue },
  preferredContactMethod: 'email',
  meetingCadence: 'weekly',
}

export const useCreateAccountStore = create<CreateAccountStore>()(
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

      toggleIndustry: (industry) => {
        const { formData } = get()
        const newIndustries = formData.industries.includes(industry)
          ? formData.industries.filter((i) => i !== industry)
          : [...formData.industries, industry]
        
        set((state) => ({
          formData: { ...state.formData, industries: newIndustries },
          isDirty: true,
          lastSaved: new Date(),
        }))
      },
    }),
    {
      name: 'create-account-form',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Constants for form options
export const INDUSTRIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'fintech', label: 'FinTech', icon: '💳' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'finance', label: 'Finance & Banking', icon: '🏦' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'retail', label: 'Retail', icon: '🛒' },
  { value: 'professional_services', label: 'Professional Services', icon: '💼' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'government', label: 'Government', icon: '🏛️' },
  { value: 'energy', label: 'Energy & Utilities', icon: '⚡' },
  { value: 'telecommunications', label: 'Telecommunications', icon: '📡' },
  { value: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const

export const COMPANY_TYPES = [
  { value: 'direct_client', label: 'Direct Client', description: 'End client with direct engagement' },
  { value: 'implementation_partner', label: 'Implementation Partner', description: 'SI or consulting firm' },
  { value: 'staffing_vendor', label: 'Staffing Vendor', description: 'Third-party staffing agency' },
] as const

export const PARTNERSHIP_TIERS = [
  { value: 'preferred', label: 'Preferred', color: 'blue' },
  { value: 'strategic', label: 'Strategic', color: 'gold' },
  { value: 'exclusive', label: 'Exclusive', color: 'purple' },
] as const

export const COMPANY_SEGMENTS = [
  { value: 'enterprise', label: 'Enterprise', description: 'Large corporations (1000+ employees)', icon: '🏢' },
  { value: 'mid_market', label: 'Mid-Market', description: 'Medium companies (100-1000 employees)', icon: '🏬' },
  { value: 'smb', label: 'SMB', description: 'Small/Medium businesses (10-100 employees)', icon: '🏪' },
  { value: 'startup', label: 'Startup', description: 'Early-stage companies (<10 employees)', icon: '🚀' },
] as const

export const BILLING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

export const PAYMENT_TERMS = [
  { value: '15', label: 'Net 15' },
  { value: '30', label: 'Net 30' },
  { value: '45', label: 'Net 45' },
  { value: '60', label: 'Net 60' },
] as const

export const CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'slack', label: 'Slack', icon: '💬' },
  { value: 'teams', label: 'Microsoft Teams', icon: '🔷' },
] as const

export const MEETING_CADENCES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
] as const


