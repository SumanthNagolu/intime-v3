import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CampaignType,
  CampaignGoal,
  AudienceSource,
  CampaignChannel,
  CampaignPriority,
  SendDay,
  WorkAuthorization,
  ClientTier,
  ServiceType,
} from '@/lib/campaigns/types'

/**
 * Enterprise Campaign Form Data
 *
 * Comprehensive form data for staffing industry campaigns supporting:
 * - Client acquisition & engagement
 * - Candidate sourcing & bench marketing
 * - Multi-channel sequences
 * - Advanced targeting (skills, visa, certifications)
 * - Team assignment & approval workflows
 */
export interface CreateCampaignFormData {
  // =========================================================================
  // Step 1: Campaign Setup
  // =========================================================================
  name: string
  campaignType: CampaignType | ''
  goal: CampaignGoal | ''
  priority: CampaignPriority
  description: string
  tags: string[]

  // =========================================================================
  // Step 2: Target Audience
  // =========================================================================
  audienceSource: AudienceSource | ''
  // Client Targeting
  industries: string[]
  companySizes: string[]
  regions: string[]
  clientTiers: ClientTier[]
  serviceTypes: ServiceType[]
  // Candidate Targeting
  targetTitles: string[]
  targetSkills: string[]
  experienceLevels: string[]
  workAuthorizations: WorkAuthorization[]
  certifications: string[]
  // Bench-specific
  benchOnly: boolean
  availableWithinDays: number | null
  // Exclusions
  excludeExistingClients: boolean
  excludeRecentlyContacted: number
  excludeCompetitors: boolean
  excludeDncList: boolean

  // =========================================================================
  // Step 3: Channels & Sequences
  // =========================================================================
  channels: CampaignChannel[]
  sequenceTemplateIds: string[]
  // Email sequence config
  emailSteps: number
  emailDaysBetween: number
  // LinkedIn sequence config
  linkedinSteps: number
  linkedinDaysBetween: number
  // Phone sequence config
  phoneSteps: number
  phoneDaysBetween: number
  // SMS sequence config
  smsSteps: number
  smsDaysBetween: number
  // Direct Mail sequence config
  directMailSteps: number
  directMailDaysBetween: number
  // Event sequence config
  eventSteps: number
  eventDaysBetween: number
  // Job Board sequence config
  jobBoardSteps: number
  jobBoardDaysBetween: number
  // Referral sequence config
  referralSteps: number
  referralDaysBetween: number
  // Automation settings
  stopOnReply: boolean
  stopOnBooking: boolean
  stopOnApplication: boolean
  dailyLimit: number
  // A/B Testing
  enableAbTesting: boolean
  abSplitPercentage: number

  // =========================================================================
  // Step 4: Schedule
  // =========================================================================
  startDate: string
  endDate: string
  launchImmediately: boolean
  // Send Window
  sendWindowStart: string
  sendWindowEnd: string
  sendDays: SendDay[]
  timezone: string
  // Recurring
  isRecurring: boolean
  recurringInterval: 'daily' | 'weekly' | 'monthly' | ''

  // =========================================================================
  // Step 5: Budget & Targets
  // =========================================================================
  // Budget
  budgetTotal: number
  budgetCurrency: string
  // Standard Targets
  targetContacts: number
  targetResponses: number
  targetLeads: number
  targetMeetings: number
  targetRevenue: number
  // Staffing-Specific Targets
  targetSubmissions: number
  targetInterviews: number
  targetPlacements: number
  // Expected Rates
  expectedResponseRate: number
  expectedConversionRate: number

  // =========================================================================
  // Step 6: Team & Assignment
  // =========================================================================
  ownerId: string
  teamId: string
  collaboratorIds: string[]
  // Approval
  requiresApproval: boolean
  approverIds: string[]
  // Notifications
  notifyOnResponse: boolean
  notifyOnConversion: boolean
  notifyOnCompletion: boolean

  // =========================================================================
  // Step 7: Compliance
  // =========================================================================
  // Standard Compliance
  gdpr: boolean
  canSpam: boolean
  casl: boolean
  ccpa: boolean
  // Email Requirements
  includeUnsubscribe: boolean
  includePhysicalAddress: boolean
  // DNC Handling
  respectDncList: boolean
  respectPreviousOptOuts: boolean
  // Data Handling
  collectConsent: boolean
  dataRetentionDays: number
}

interface CreateCampaignStore {
  formData: CreateCampaignFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null
  draftId: string | null // Database draft ID for server persistence

  // Actions
  setFormData: (data: Partial<CreateCampaignFormData>) => void
  setCurrentStep: (step: number) => void
  setDraftId: (id: string | null) => void
  resetForm: () => void
  clearDraft: () => void
}

const defaultFormData: CreateCampaignFormData = {
  // Step 1: Setup
  name: '',
  campaignType: '',
  goal: '',
  priority: 'normal',
  description: '',
  tags: [],

  // Step 2: Targeting
  audienceSource: '',
  industries: [],
  companySizes: [],
  regions: [],
  clientTiers: [],
  serviceTypes: [],
  targetTitles: [],
  targetSkills: [],
  experienceLevels: [],
  workAuthorizations: [],
  certifications: [],
  benchOnly: false,
  availableWithinDays: null,
  excludeExistingClients: false,
  excludeRecentlyContacted: 90,
  excludeCompetitors: true,
  excludeDncList: true,

  // Step 3: Channels
  channels: ['email'],
  sequenceTemplateIds: [],
  emailSteps: 3,
  emailDaysBetween: 3,
  linkedinSteps: 2,
  linkedinDaysBetween: 5,
  phoneSteps: 2,
  phoneDaysBetween: 3,
  smsSteps: 2,
  smsDaysBetween: 2,
  directMailSteps: 1,
  directMailDaysBetween: 14,
  eventSteps: 2,
  eventDaysBetween: 7,
  jobBoardSteps: 1,
  jobBoardDaysBetween: 7,
  referralSteps: 2,
  referralDaysBetween: 7,
  stopOnReply: true,
  stopOnBooking: true,
  stopOnApplication: true,
  dailyLimit: 100,
  enableAbTesting: false,
  abSplitPercentage: 50,

  // Step 4: Schedule
  startDate: '',
  endDate: '',
  launchImmediately: false,
  sendWindowStart: '09:00',
  sendWindowEnd: '17:00',
  sendDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  timezone: 'America/New_York',
  isRecurring: false,
  recurringInterval: '',

  // Step 5: Budget & Targets
  budgetTotal: 0,
  budgetCurrency: 'USD',
  targetContacts: 500,
  targetResponses: 50,
  targetLeads: 25,
  targetMeetings: 10,
  targetRevenue: 0,
  targetSubmissions: 20,
  targetInterviews: 10,
  targetPlacements: 5,
  expectedResponseRate: 10,
  expectedConversionRate: 20,

  // Step 6: Team
  ownerId: '',
  teamId: '',
  collaboratorIds: [],
  requiresApproval: false,
  approverIds: [],
  notifyOnResponse: true,
  notifyOnConversion: true,
  notifyOnCompletion: true,

  // Step 7: Compliance
  gdpr: true,
  canSpam: true,
  casl: true,
  ccpa: true,
  includeUnsubscribe: true,
  includePhysicalAddress: true,
  respectDncList: true,
  respectPreviousOptOuts: true,
  collectConsent: false,
  dataRetentionDays: 365,
}

export const useCreateCampaignStore = create<CreateCampaignStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,
      draftId: null,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDirty: true,
          lastSaved: new Date(),
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      setDraftId: (id) => set({ draftId: id }),

      resetForm: () =>
        set({
          formData: defaultFormData,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
          draftId: null,
        }),

      clearDraft: () =>
        set({
          formData: defaultFormData,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
          draftId: null,
        }),
    }),
    {
      name: 'create-campaign-draft-v3', // Updated version for server persistence
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
        draftId: state.draftId,
      }),
    }
  )
)

// Re-export types and constants from types.ts for convenience
export {
  CAMPAIGN_TYPE_OPTIONS,
  CAMPAIGN_GOAL_OPTIONS,
  AUDIENCE_SOURCE_OPTIONS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  REGION_OPTIONS,
  CLIENT_TIER_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  WORK_AUTHORIZATION_OPTIONS,
  CHANNEL_OPTIONS,
  SEND_DAY_OPTIONS,
  TIMEZONE_OPTIONS,
  PRIORITY_OPTIONS,
  CURRENCY_OPTIONS,
  COMMON_SKILLS,
  COMMON_CERTIFICATIONS,
} from '@/lib/campaigns/types'
