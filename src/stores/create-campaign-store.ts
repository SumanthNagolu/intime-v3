import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Mail, Linkedin, Phone } from 'lucide-react'

// Form data matching existing dialog schema
export interface CreateCampaignFormData {
  // Step 1: Campaign Setup
  name: string
  campaignType: 'lead_generation' | 're_engagement' | 'event_promotion' | 'brand_awareness' | 'candidate_sourcing'
  goal: 'generate_qualified_leads' | 'book_discovery_meetings' | 'drive_event_registrations' | 'build_brand_awareness' | 'expand_candidate_pool'
  description: string

  // Step 2: Target Audience
  audienceSource: 'new_prospects' | 'existing_leads' | 'dormant_accounts' | 'import_list'
  industries: string[]
  companySizes: string[]
  regions: string[]
  fundingStages: string[]
  targetTitles: string[]
  excludeExistingClients: boolean
  excludeRecentlyContacted: number
  excludeCompetitors: boolean

  // Step 3: Channels & Sequences
  channels: ('linkedin' | 'email' | 'phone' | 'event' | 'direct_mail')[]
  emailSteps: number
  emailDaysBetween: number
  linkedinSteps: number
  linkedinDaysBetween: number
  stopOnReply: boolean
  stopOnBooking: boolean
  dailyLimit: number
  sequenceTemplateIds: string[]

  // Step 4: Schedule & Budget
  startDate: string
  endDate: string
  launchImmediately: boolean
  budgetTotal: number
  targetLeads: number
  targetMeetings: number
  targetRevenue: number

  // Step 5: Compliance
  gdpr: boolean
  canSpam: boolean
  casl: boolean
  includeUnsubscribe: boolean
}

interface CreateCampaignStore {
  formData: CreateCampaignFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<CreateCampaignFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  clearDraft: () => void
}

const defaultFormData: CreateCampaignFormData = {
  // Step 1
  name: '',
  campaignType: 'lead_generation',
  goal: 'generate_qualified_leads',
  description: '',

  // Step 2
  audienceSource: 'new_prospects',
  industries: [],
  companySizes: [],
  regions: [],
  fundingStages: [],
  targetTitles: [],
  excludeExistingClients: true,
  excludeRecentlyContacted: 90,
  excludeCompetitors: true,

  // Step 3
  channels: ['email'],
  emailSteps: 3,
  emailDaysBetween: 3,
  linkedinSteps: 2,
  linkedinDaysBetween: 5,
  stopOnReply: true,
  stopOnBooking: true,
  dailyLimit: 100,
  sequenceTemplateIds: [],

  // Step 4
  startDate: '',
  endDate: '',
  launchImmediately: true,
  budgetTotal: 0,
  targetLeads: 50,
  targetMeetings: 10,
  targetRevenue: 0,

  // Step 5
  gdpr: true,
  canSpam: true,
  casl: true,
  includeUnsubscribe: true,
}

export const useCreateCampaignStore = create<CreateCampaignStore>()(
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

      clearDraft: () =>
        set({
          formData: defaultFormData,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
        }),
    }),
    {
      name: 'create-campaign-draft',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Export constants (matching CreateCampaignDialog)
export const CAMPAIGN_TYPES = [
  { value: 'lead_generation', label: 'Lead Generation', description: 'Generate new business leads' },
  { value: 're_engagement', label: 'Re-Engagement', description: 'Reconnect with cold leads' },
  { value: 'event_promotion', label: 'Event Promotion', description: 'Drive event registrations' },
  { value: 'brand_awareness', label: 'Brand Awareness', description: 'Build brand recognition' },
  { value: 'candidate_sourcing', label: 'Candidate Sourcing', description: 'Expand talent pool' },
] as const

export const GOALS = [
  { value: 'generate_qualified_leads', label: 'Generate Qualified Leads' },
  { value: 'book_discovery_meetings', label: 'Book Discovery Meetings' },
  { value: 'drive_event_registrations', label: 'Drive Event Registrations' },
  { value: 'build_brand_awareness', label: 'Build Brand Awareness' },
  { value: 'expand_candidate_pool', label: 'Expand Candidate Pool' },
] as const

export const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail',
  'Professional Services', 'Telecommunications', 'Energy', 'Government', 'Education',
] as const

export const COMPANY_SIZES = [
  { value: '1-50', label: '1-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
] as const

export const REGIONS = [
  { value: 'north_america_west', label: 'North America - West' },
  { value: 'north_america_east', label: 'North America - East' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia_pacific', label: 'Asia Pacific' },
  { value: 'latam', label: 'Latin America' },
] as const

export const FUNDING_STAGES = [
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'series_c_plus', label: 'Series C+' },
  { value: 'public', label: 'Public' },
] as const

export const CHANNEL_OPTIONS = [
  { value: 'email' as const, label: 'Email', icon: Mail },
  { value: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
  { value: 'phone' as const, label: 'Phone', icon: Phone },
]
