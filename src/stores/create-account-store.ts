import { create } from 'zustand'
import { type PhoneInputValue } from '@/components/ui/phone-input'

// Re-export the phone type for backward compatibility
export type PhoneValue = PhoneInputValue

// Sub-types for complex fields
export interface AccountAddress {
  id: string
  type: 'headquarters' | 'billing' | 'mailing' | 'office' | 'shipping'
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  isPrimary: boolean
}

export interface AccountContact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: PhoneValue
  mobile?: PhoneValue
  title: string
  department: string
  role: 'primary' | 'billing' | 'executive_sponsor' | 'hiring_manager' | 'hr' | 'procurement'
  decisionAuthority: 'decision_maker' | 'influencer' | 'champion' | 'gatekeeper'
  influenceLevel?: 1 | 2 | 3 | 4 | 5
  isPrimary: boolean
  linkedInUrl?: string
  twitterUrl?: string
  timezone?: string
  preferredContactMethod?: 'email' | 'phone' | 'slack' | 'teams'
  bestTimeToContact?: string
  doNotCall?: boolean
  notes?: string
}

export interface AccountContract {
  id: string
  type: 'msa' | 'nda' | 'sow' | 'rate_agreement' | 'subcontract'
  name: string
  number: string
  status: 'draft' | 'active' | 'pending_signature'
  effectiveDate: Date | null
  expiryDate: Date | null
  autoRenew: boolean
  contractValue?: string
  currency: string
  fileUrl?: string
  filePath?: string
}

export interface AccountCompliance {
  insurance: {
    generalLiability: boolean
    professionalLiability: boolean
    workersComp: boolean
    cyberLiability: boolean
  }
  backgroundCheck: {
    required: boolean
    level: string
  }
  drugTest: {
    required: boolean
  }
  certifications: string[]
}

export interface TeamAssignment {
  ownerId: string
  accountManagerId: string
  recruiterId: string
  salesLeadId: string
}

export interface CreateAccountFormData {
  // Step 0: Account Type
  accountType: 'company' | 'person'
  
  // Step 1: Identity / Basics
  name: string // Company Name or Person Full Name
  legalName: string
  dba: string
  taxId: string // EIN or SSN (optional)
  website: string
  linkedinUrl: string
  description: string
  phone: PhoneValue
  email: string // General/Primary Email
  
  // Step 2: Classification
  industries: string[]
  companyType: 'direct_client' | 'implementation_partner' | 'staffing_vendor'
  tier: '' | 'preferred' | 'strategic' | 'exclusive'
  segment: '' | 'enterprise' | 'mid_market' | 'smb' | 'startup'
  employeeCount: string
  revenueRange: string
  foundedYear: string
  ownershipType: string

  // Step 3: Locations
  addresses: AccountAddress[]
  
  // Step 4: Billing & Terms
  billingEntityName: string
  billingEmail: string
  billingPhone: PhoneValue
  billingAddress: string // Can be a reference to an address ID or just text if simplified
  billingFrequency: 'weekly' | 'biweekly' | 'monthly'
  paymentTermsDays: string
  poRequired: boolean
  currentPoNumber: string
  poExpirationDate: string | null // YYYY-MM-DD format
  currency: string
  invoiceFormat: string

  // Step 5: Contacts
  contacts: AccountContact[]

  // Step 6: Contracts
  contracts: AccountContract[]

  // Step 7: Compliance
  compliance: AccountCompliance

  // Step 8: Team
  team: TeamAssignment
  
  // Legacy fields (kept for compatibility or mapped to new structures)
  hqStreetAddress: string
  hqCity: string
  hqState: string
  hqCountry: string
  billingCity: string
  billingState: string
  billingPostalCode: string
  billingCountry: string
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
  
  // Array helpers
  addAddress: (address: AccountAddress) => void
  removeAddress: (id: string) => void
  updateAddress: (id: string, data: Partial<AccountAddress>) => void
  
  addContact: (contact: AccountContact) => void
  removeContact: (id: string) => void
  updateContact: (id: string, data: Partial<AccountContact>) => void
  
  addContract: (contract: AccountContract) => void
  removeContract: (id: string) => void
  updateContract: (id: string, data: Partial<AccountContract>) => void
}

const defaultPhoneValue: PhoneValue = {
  countryCode: 'US',
  number: '',
}

const defaultFormData: CreateAccountFormData = {
  accountType: 'company',
  
  // Identity
  name: '',
  legalName: '',
  dba: '',
  taxId: '',
  website: '',
  linkedinUrl: '',
  description: '',
  phone: { ...defaultPhoneValue },
  email: '',
  
  // Classification
  industries: [],
  companyType: 'direct_client',
  tier: '',
  segment: '',
  employeeCount: '',
  revenueRange: '',
  foundedYear: '',
  ownershipType: '',
  
  // Locations
  addresses: [],
  
  // Billing
  billingEntityName: '',
  billingEmail: '',
  billingPhone: { ...defaultPhoneValue },
  billingAddress: '',
  billingFrequency: 'monthly',
  paymentTermsDays: '30',
  poRequired: false,
  currentPoNumber: '',
  poExpirationDate: '', // YYYY-MM-DD format
  currency: 'USD',
  invoiceFormat: 'standard',
  
  // Contacts
  contacts: [],
  
  // Contracts
  contracts: [],
  
  // Compliance
  compliance: {
    insurance: {
      generalLiability: false,
      professionalLiability: false,
      workersComp: false,
      cyberLiability: false,
    },
    backgroundCheck: {
      required: false,
      level: '',
    },
    drugTest: {
      required: false,
    },
    certifications: [],
  },
  
  // Team
  team: {
    ownerId: '',
    accountManagerId: '',
    recruiterId: '',
    salesLeadId: '',
  },

  // Legacy (Default values)
  hqStreetAddress: '',
  hqCity: '',
  hqState: '',
  hqCountry: 'US',
  billingCity: '',
  billingState: '',
  billingPostalCode: '',
  billingCountry: 'US',
  primaryContactName: '',
  primaryContactEmail: '',
  primaryContactTitle: '',
  primaryContactPhone: { ...defaultPhoneValue },
  preferredContactMethod: 'email',
  meetingCadence: 'weekly',
}

// NO localStorage persistence - DB is the only source of truth
// This prevents stale data from old drafts bleeding into new ones
export const useCreateAccountStore = create<CreateAccountStore>()((set, get) => ({
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

  // Helper implementations
  addAddress: (address) =>
    set((state) => ({
      formData: { ...state.formData, addresses: [...state.formData.addresses, address] },
      isDirty: true,
      lastSaved: new Date(),
    })),

  removeAddress: (id) =>
    set((state) => ({
      formData: { ...state.formData, addresses: state.formData.addresses.filter(a => a.id !== id) },
      isDirty: true,
      lastSaved: new Date(),
    })),

  updateAddress: (id, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        addresses: state.formData.addresses.map(a => a.id === id ? { ...a, ...data } : a)
      },
      isDirty: true,
      lastSaved: new Date(),
    })),

  addContact: (contact) =>
    set((state) => ({
      formData: { ...state.formData, contacts: [...state.formData.contacts, contact] },
      isDirty: true,
      lastSaved: new Date(),
    })),

  removeContact: (id) =>
    set((state) => ({
      formData: { ...state.formData, contacts: state.formData.contacts.filter(c => c.id !== id) },
      isDirty: true,
      lastSaved: new Date(),
    })),

  updateContact: (id, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        contacts: state.formData.contacts.map(c => c.id === id ? { ...c, ...data } : c)
      },
      isDirty: true,
      lastSaved: new Date(),
    })),

  addContract: (contract) =>
    set((state) => ({
      formData: { ...state.formData, contracts: [...state.formData.contracts, contract] },
      isDirty: true,
      lastSaved: new Date(),
    })),

  removeContract: (id) =>
    set((state) => ({
      formData: { ...state.formData, contracts: state.formData.contracts.filter(c => c.id !== id) },
      isDirty: true,
      lastSaved: new Date(),
    })),

  updateContract: (id, data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        contracts: state.formData.contracts.map(c => c.id === id ? { ...c, ...data } : c)
      },
      isDirty: true,
      lastSaved: new Date(),
    })),
}))

// Constants re-export
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
