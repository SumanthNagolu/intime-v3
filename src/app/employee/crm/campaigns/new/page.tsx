'use client'

import { useEffect, useMemo, useCallback, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCreateCampaignStore, type CreateCampaignFormData } from '@/stores/create-campaign-store'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { WizardLayout, type WizardStep } from '@/components/pcf/wizard/WizardLayout'
import {
  CampaignSetupSection,
  CampaignTargetingSection,
  CampaignChannelsSection,
  CampaignScheduleSection,
  CampaignBudgetSection,
  CampaignTeamSection,
  CampaignComplianceSection,
} from '@/components/campaigns/sections'
import type {
  CampaignSetupSectionData,
  CampaignTargetingSectionData,
  CampaignChannelsSectionData,
  CampaignScheduleSectionData,
  CampaignBudgetSectionData,
  CampaignTeamSectionData,
  CampaignComplianceSectionData,
  CampaignChannel,
  CampaignType,
  CampaignGoal,
  AudienceSource,
} from '@/lib/campaigns/types'

// Wizard steps configuration following WizardLayout pattern
const WIZARD_STEPS: WizardStep[] = [
  { id: 'setup', label: 'Campaign Setup', description: 'Define campaign type and goals' },
  { id: 'targeting', label: 'Target Audience', description: 'Configure audience criteria and filters' },
  { id: 'channels', label: 'Channels', description: 'Select outreach channels and sequences' },
  { id: 'schedule', label: 'Schedule', description: 'Set timeline and send window' },
  { id: 'budget', label: 'Budget & Targets', description: 'Configure budget and performance goals' },
  { id: 'team', label: 'Team', description: 'Assign team members and approvers' },
  { id: 'compliance', label: 'Compliance', description: 'Configure compliance settings' },
]

/**
 * Campaign Creation Wizard
 *
 * Uses unified section components (same as workspace) with mode='create'.
 * State is managed by Zustand store with local persistence.
 * Uses WizardLayout for consistent UI with other entity wizards.
 */
export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStep = parseInt(searchParams.get('step') || '1')
  const resumeId = searchParams.get('resume')

  const { formData, setFormData, setCurrentStep, resetForm, lastSaved, isDirty, draftId, setDraftId } = useCreateCampaignStore()
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const hasLoadedDraft = useRef(false)

  // Save draft mutation
  const saveDraftMutation = trpc.crm.campaigns.saveDraft.useMutation({
    onSuccess: (result) => {
      if (result.isNew && result.id) {
        // Store the draft ID for subsequent saves
        setDraftId(result.id)
        // Update URL with the resume parameter
        const params = new URLSearchParams(searchParams.toString())
        params.set('resume', result.id)
        router.replace(`?${params.toString()}`, { scroll: false })
      }
      setIsSavingDraft(false)
    },
    onError: (error) => {
      console.error('Failed to save draft:', error)
      setIsSavingDraft(false)
    },
  })

  // Load draft data if resuming
  const { data: draftData } = trpc.crm.campaigns.getById.useQuery(
    { id: resumeId! },
    { enabled: !!resumeId && !hasLoadedDraft.current }
  )

  // Populate form with draft data when loaded
  useEffect(() => {
    if (draftData && !hasLoadedDraft.current) {
      hasLoadedDraft.current = true
      setDraftId(draftData.id)

      // Map draft data to form fields
      setFormData({
        name: draftData.name || '',
        campaignType: draftData.campaign_type || draftData.campaignType || '',
        goal: draftData.goal || '',
        description: draftData.description || '',
        channels: draftData.channels || [],
        startDate: draftData.start_date || draftData.startDate || '',
        endDate: draftData.end_date || draftData.endDate || '',
        // Add more fields as needed based on draft data
      })

      // Restore wizard step if saved in wizard_state
      const wizardState = draftData.wizard_state as { currentStep?: number } | null
      if (wizardState?.currentStep) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('step', String(wizardState.currentStep))
        router.replace(`?${params.toString()}`, { scroll: false })
      }

      toast.success('Draft loaded')
    }
  }, [draftData, setFormData, setDraftId, searchParams, router])

  // Sync URL step with store
  useEffect(() => {
    setCurrentStep(currentStep)
  }, [currentStep, setCurrentStep])

  // Set default dates if not set
  useEffect(() => {
    if (!formData.startDate || !formData.endDate) {
      const today = new Date().toISOString().split('T')[0]
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      setFormData({
        startDate: formData.startDate || today,
        endDate: formData.endDate || thirtyDaysLater,
      })
    }
  }, [formData.startDate, formData.endDate, setFormData])

  // Auto-save draft when form changes (debounced)
  const saveDraft = useCallback(() => {
    if (!formData.name || formData.name.length < 3) return // Need at least a name to save

    setIsSavingDraft(true)
    saveDraftMutation.mutate({
      id: draftId || resumeId || undefined,
      name: formData.name,
      campaignType: formData.campaignType || undefined,
      goal: formData.goal || undefined,
      description: formData.description || undefined,
      channels: formData.channels.length > 0 ? formData.channels : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      budgetTotal: formData.budgetTotal || undefined,
      wizardState: {
        currentStep,
        totalSteps: WIZARD_STEPS.length,
        completedSteps: Array.from({ length: currentStep - 1 }, (_, i) => i + 1),
      },
    })
  }, [formData, draftId, resumeId, currentStep, saveDraftMutation])

  const navigateToStep = (step: number) => {
    // Save draft before navigating
    if (formData.name && formData.name.length >= 3) {
      saveDraft()
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step.toString())
    if (draftId || resumeId) {
      params.set('resume', draftId || resumeId || '')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const createCampaign = trpc.crm.campaigns.create.useMutation({
    onSuccess: (data) => {
      toast.success('Campaign created successfully!')
      resetForm()
      router.push(`/employee/crm/campaigns/${data.id}`)
    },
    onError: (error) => {
      console.error('Campaign creation error:', error)
      console.error('Error data:', JSON.stringify(error.data, null, 2))
      // Show more specific error for Zod validation failures
      if (error.data?.zodError) {
        const zodErrors = error.data.zodError.fieldErrors
        const errorMessages = Object.entries(zodErrors || {})
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('; ')
        toast.error(`Validation failed: ${errorMessages || error.message}`)
      } else {
        toast.error(error.message || 'Failed to create campaign')
      }
    },
  })

  const handleSubmit = () => {
    // Validate required fields before submission
    if (!formData.campaignType || !formData.goal) {
      toast.error('Please complete Step 1: Campaign Type and Goal are required')
      return
    }
    if (!formData.audienceSource) {
      toast.error('Please complete Step 2: Audience Source is required')
      return
    }
    if (formData.channels.length === 0) {
      toast.error('Please complete Step 3: At least one channel is required')
      return
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please complete Step 4: Start Date and End Date are required')
      return
    }
    if (formData.name.length < 3) {
      toast.error('Campaign name must be at least 3 characters')
      return
    }

    // Build sequences based on channel config
    type SequenceStep = {
      stepNumber: number
      dayOffset: number
      subject?: string
      templateId?: string
      templateName?: string
    }
    type SequenceConfig = {
      steps: SequenceStep[]
      stopConditions?: string[]
      sendTime?: string
      respectTimezone?: boolean
      dailyLimit?: number
    }
    const sequences: Record<string, SequenceConfig> = {}

    // Only build manual sequences if no templates selected
    if (formData.sequenceTemplateIds.length === 0) {
      if (formData.channels.includes('email')) {
        sequences.email = {
          steps: Array.from({ length: formData.emailSteps }, (_, i) => ({
            stepNumber: i + 1,
            dayOffset: i * formData.emailDaysBetween,
            subject: '',
            templateId: '',
          })),
          stopConditions: [
            ...(formData.stopOnReply ? ['reply'] : []),
            ...(formData.stopOnBooking ? ['booking'] : []),
            'unsubscribe',
          ],
          dailyLimit: formData.dailyLimit,
        }
      }
      if (formData.channels.includes('linkedin')) {
        sequences.linkedin = {
          steps: Array.from({ length: formData.linkedinSteps }, (_, i) => ({
            stepNumber: i + 1,
            dayOffset: i * formData.linkedinDaysBetween,
          })),
          stopConditions: [
            ...(formData.stopOnReply ? ['reply'] : []),
            ...(formData.stopOnBooking ? ['booking'] : []),
          ],
        }
      }
    }

    const payload = {
      name: formData.name,
      campaignType: formData.campaignType as CampaignType,
      goal: formData.goal as CampaignGoal,
      description: formData.description || undefined,
      sequenceTemplateIds: formData.sequenceTemplateIds.length > 0 ? formData.sequenceTemplateIds : undefined,
      targetCriteria: {
        audienceSource: formData.audienceSource as AudienceSource,
        industries: formData.industries.length > 0 ? formData.industries : undefined,
        companySizes: formData.companySizes.length > 0 ? formData.companySizes : undefined,
        regions: formData.regions.length > 0 ? formData.regions : undefined,
        clientTiers: formData.clientTiers.length > 0 ? formData.clientTiers : undefined,
        serviceTypes: formData.serviceTypes.length > 0 ? formData.serviceTypes : undefined,
        targetTitles: formData.targetTitles.length > 0 ? formData.targetTitles : undefined,
        candidateCriteria: {
          skills: formData.targetSkills.length > 0 ? formData.targetSkills : undefined,
          experienceLevels: formData.experienceLevels.length > 0 ? formData.experienceLevels : undefined,
          workAuthorizations: formData.workAuthorizations.length > 0 ? formData.workAuthorizations : undefined,
          certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
          benchOnly: formData.benchOnly,
          availableWithinDays: formData.availableWithinDays,
        },
        exclusions: {
          excludeExistingClients: formData.excludeExistingClients,
          excludeRecentlyContacted: formData.excludeRecentlyContacted,
          excludeCompetitors: formData.excludeCompetitors,
          excludeDncList: formData.excludeDncList,
        },
      },
      channels: formData.channels,
      sequences: Object.keys(sequences).length > 0 ? sequences : undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      launchImmediately: formData.launchImmediately,
      sendWindow: {
        start: formData.sendWindowStart,
        end: formData.sendWindowEnd,
        days: formData.sendDays,
        timezone: formData.timezone,
      },
      isRecurring: formData.isRecurring,
      recurringInterval: formData.recurringInterval || undefined,
      budgetTotal: formData.budgetTotal,
      budgetCurrency: formData.budgetCurrency,
      targets: {
        contacts: formData.targetContacts,
        responses: formData.targetResponses,
        leads: formData.targetLeads,
        meetings: formData.targetMeetings,
        revenue: formData.targetRevenue,
        submissions: formData.targetSubmissions,
        interviews: formData.targetInterviews,
        placements: formData.targetPlacements,
        expectedResponseRate: formData.expectedResponseRate,
        expectedConversionRate: formData.expectedConversionRate,
      },
      // Only include teamAssignment if any field has a value
      ...(formData.ownerId || formData.teamId || formData.collaboratorIds.length > 0
        ? {
            teamAssignment: {
              ...(formData.ownerId ? { ownerId: formData.ownerId } : {}),
              ...(formData.teamId ? { teamId: formData.teamId } : {}),
              ...(formData.collaboratorIds.length > 0 ? { collaboratorIds: formData.collaboratorIds } : {}),
            },
          }
        : {}),
      // Only include approval if it's required or has approvers
      ...(formData.requiresApproval || formData.approverIds.length > 0
        ? {
            approval: {
              required: formData.requiresApproval,
              ...(formData.approverIds.length > 0 ? { approverIds: formData.approverIds } : {}),
            },
          }
        : {}),
      notifications: {
        onResponse: formData.notifyOnResponse,
        onConversion: formData.notifyOnConversion,
        onCompletion: formData.notifyOnCompletion,
      },
      complianceSettings: {
        gdpr: formData.gdpr,
        canSpam: formData.canSpam,
        casl: formData.casl,
        ccpa: formData.ccpa,
        includeUnsubscribe: formData.includeUnsubscribe, // Required at root level by backend
        email: {
          includeUnsubscribe: formData.includeUnsubscribe,
          includePhysicalAddress: formData.includePhysicalAddress,
        },
        dnc: {
          respectList: formData.respectDncList,
          respectOptOuts: formData.respectPreviousOptOuts,
        },
        dataHandling: {
          collectConsent: formData.collectConsent,
          retentionDays: formData.dataRetentionDays,
        },
      },
    }

    // Debug: Log key field values before submission
    console.log('=== CAMPAIGN CREATION DEBUG ===')
    console.log('name:', formData.name, '| length:', formData.name.length)
    console.log('campaignType:', formData.campaignType)
    console.log('goal:', formData.goal)
    console.log('audienceSource:', formData.audienceSource)
    console.log('channels:', formData.channels)
    console.log('startDate:', formData.startDate)
    console.log('endDate:', formData.endDate)
    console.log('--- TEAM ASSIGNMENT DEBUG ---')
    console.log('ownerId:', JSON.stringify(formData.ownerId), 'truthy:', !!formData.ownerId)
    console.log('teamId:', JSON.stringify(formData.teamId), 'truthy:', !!formData.teamId)
    console.log('collaboratorIds:', JSON.stringify(formData.collaboratorIds))
    console.log('approverIds:', JSON.stringify(formData.approverIds))
    console.log('requiresApproval:', formData.requiresApproval)
    console.log('--- PAYLOAD teamAssignment/approval ---')
    console.log('payload.teamAssignment:', JSON.stringify(payload.teamAssignment))
    console.log('payload.approval:', JSON.stringify(payload.approval))
    console.log('=== END DEBUG ===')

    createCampaign.mutate(payload)
  }

  const handleCancel = () => {
    if (isDirty) {
      toast.info('Draft saved. You can continue later.')
    }
    router.push('/employee/crm/campaigns')
  }

  // Validate current step before navigation
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length >= 3 && formData.campaignType && formData.goal
      case 2:
        return true // Targeting is optional
      case 3:
        return formData.channels.length > 0
      case 4:
        return formData.startDate && formData.endDate
      case 5:
        return true // Budget is optional
      case 6:
        return true // Team is optional
      case 7:
        return formData.includeUnsubscribe // Required compliance
      default:
        return true
    }
  }, [currentStep, formData])

  // Validation errors for current step
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    switch (currentStep) {
      case 1:
        if (!formData.name.trim() || formData.name.trim().length < 3) {
          errors.name = 'Campaign name must be at least 3 characters'
        }
        if (!formData.campaignType) {
          errors.campaignType = 'Please select a campaign type'
        }
        if (!formData.goal) {
          errors.goal = 'Please select a campaign goal'
        }
        break
      case 3:
        if (formData.channels.length === 0) {
          errors.channels = 'Please select at least one channel'
        }
        break
      case 4:
        if (!formData.startDate) {
          errors.startDate = 'Please select a start date'
        }
        if (!formData.endDate) {
          errors.endDate = 'Please select an end date'
        }
        break
      case 7:
        if (!formData.includeUnsubscribe) {
          errors.includeUnsubscribe = 'Unsubscribe links are required by law'
        }
        break
    }
    return errors
  }, [currentStep, formData])

  const handleNext = () => {
    if (!canProceed) {
      toast.error('Please complete all required fields')
      return
    }
    if (currentStep < WIZARD_STEPS.length) {
      navigateToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepNumber: number) => {
    // Only allow going to previous steps or current
    if (stepNumber <= currentStep) {
      navigateToStep(stepNumber)
    }
  }

  const isLastStep = currentStep === WIZARD_STEPS.length

  return (
    <WizardLayout
      title="Create Campaign"
      entityName={formData.name || 'Untitled Campaign'}
      status="Draft"
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLastStep={isLastStep}
      isSubmitting={createCampaign.isPending}
      isSaving={isSavingDraft}
      lastSavedAt={lastSaved ? new Date(lastSaved) : null}
      validationErrors={!canProceed ? validationErrors : {}}
      submitLabel="Create Campaign"
    >
      {/* Step 1: Setup */}
      {currentStep === 1 && (
        <SetupStepWrapper formData={formData} setFormData={setFormData} />
      )}

      {/* Step 2: Targeting */}
      {currentStep === 2 && (
        <TargetingStepWrapper formData={formData} setFormData={setFormData} />
      )}

      {/* Step 3: Channels */}
      {currentStep === 3 && (
        <ChannelsStepWrapper formData={formData} setFormData={setFormData} />
      )}

      {/* Step 4: Schedule */}
      {currentStep === 4 && (
        <ScheduleStepWrapper formData={formData} setFormData={setFormData} />
      )}

      {/* Step 5: Budget & Targets */}
      {currentStep === 5 && (
        <BudgetStepWrapper formData={formData} setFormData={setFormData} />
      )}

      {/* Step 6: Team */}
      {currentStep === 6 && (
        <TeamStepWrapper formData={formData} setFormData={setFormData} />
      )}

      {/* Step 7: Compliance */}
      {currentStep === 7 && (
        <ComplianceStepWrapper formData={formData} setFormData={setFormData} />
      )}
    </WizardLayout>
  )
}

// ============ STEP WRAPPERS ============
// These wrap unified sections with Zustand store integration

interface StepWrapperProps {
  formData: CreateCampaignFormData
  setFormData: (data: Partial<CreateCampaignFormData>) => void
}

function SetupStepWrapper({ formData, setFormData }: StepWrapperProps) {
  const sectionData = useMemo<CampaignSetupSectionData>(() => ({
    name: formData.name,
    campaignType: formData.campaignType as CampaignSetupSectionData['campaignType'],
    goal: formData.goal as CampaignSetupSectionData['goal'],
    priority: formData.priority,
    description: formData.description,
    tags: formData.tags,
  }), [formData.name, formData.campaignType, formData.goal, formData.priority, formData.description, formData.tags])

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData({ [field]: value })
  }, [setFormData])

  return (
    <CampaignSetupSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
    />
  )
}

function TargetingStepWrapper({ formData, setFormData }: StepWrapperProps) {
  const sectionData = useMemo<CampaignTargetingSectionData>(() => ({
    audienceSource: formData.audienceSource as CampaignTargetingSectionData['audienceSource'],
    industries: formData.industries,
    companySizes: formData.companySizes,
    regions: formData.regions,
    clientTiers: formData.clientTiers,
    serviceTypes: formData.serviceTypes,
    targetTitles: formData.targetTitles,
    targetSkills: formData.targetSkills,
    experienceLevels: formData.experienceLevels,
    workAuthorizations: formData.workAuthorizations,
    certifications: formData.certifications,
    benchOnly: formData.benchOnly,
    availableWithinDays: formData.availableWithinDays,
    excludeExistingClients: formData.excludeExistingClients,
    excludeRecentlyContacted: formData.excludeRecentlyContacted,
    excludeCompetitors: formData.excludeCompetitors,
    excludeDncList: formData.excludeDncList,
  }), [
    formData.audienceSource,
    formData.industries,
    formData.companySizes,
    formData.regions,
    formData.clientTiers,
    formData.serviceTypes,
    formData.targetTitles,
    formData.targetSkills,
    formData.experienceLevels,
    formData.workAuthorizations,
    formData.certifications,
    formData.benchOnly,
    formData.availableWithinDays,
    formData.excludeExistingClients,
    formData.excludeRecentlyContacted,
    formData.excludeCompetitors,
    formData.excludeDncList,
  ])

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData({ [field]: value })
  }, [setFormData])

  const handleToggle = useCallback((field: string, value: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[]
    const isSelected = currentArray.includes(value)
    setFormData({
      [field]: isSelected
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value],
    })
  }, [formData, setFormData])

  return (
    <CampaignTargetingSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
      onToggle={handleToggle}
    />
  )
}

function ChannelsStepWrapper({ formData, setFormData }: StepWrapperProps) {
  const sectionData = useMemo<CampaignChannelsSectionData>(() => ({
    channels: formData.channels as CampaignChannel[],
    sequenceTemplateIds: formData.sequenceTemplateIds,
    emailSteps: formData.emailSteps,
    emailDaysBetween: formData.emailDaysBetween,
    linkedinSteps: formData.linkedinSteps,
    linkedinDaysBetween: formData.linkedinDaysBetween,
    phoneSteps: formData.phoneSteps,
    phoneDaysBetween: formData.phoneDaysBetween,
    smsSteps: formData.smsSteps,
    smsDaysBetween: formData.smsDaysBetween,
    directMailSteps: formData.directMailSteps,
    directMailDaysBetween: formData.directMailDaysBetween,
    eventSteps: formData.eventSteps,
    eventDaysBetween: formData.eventDaysBetween,
    jobBoardSteps: formData.jobBoardSteps,
    jobBoardDaysBetween: formData.jobBoardDaysBetween,
    referralSteps: formData.referralSteps,
    referralDaysBetween: formData.referralDaysBetween,
    stopOnReply: formData.stopOnReply,
    stopOnBooking: formData.stopOnBooking,
    stopOnApplication: formData.stopOnApplication,
    dailyLimit: formData.dailyLimit,
    enableAbTesting: formData.enableAbTesting,
    abSplitPercentage: formData.abSplitPercentage,
  }), [
    formData.channels,
    formData.sequenceTemplateIds,
    formData.emailSteps,
    formData.emailDaysBetween,
    formData.linkedinSteps,
    formData.linkedinDaysBetween,
    formData.phoneSteps,
    formData.phoneDaysBetween,
    formData.smsSteps,
    formData.smsDaysBetween,
    formData.directMailSteps,
    formData.directMailDaysBetween,
    formData.eventSteps,
    formData.eventDaysBetween,
    formData.jobBoardSteps,
    formData.jobBoardDaysBetween,
    formData.referralSteps,
    formData.referralDaysBetween,
    formData.stopOnReply,
    formData.stopOnBooking,
    formData.stopOnApplication,
    formData.dailyLimit,
    formData.enableAbTesting,
    formData.abSplitPercentage,
  ])

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData({ [field]: value })
  }, [setFormData])

  const handleToggleChannel = useCallback((channel: CampaignChannel) => {
    const isSelected = formData.channels.includes(channel)
    setFormData({
      channels: isSelected
        ? formData.channels.filter((c: CampaignChannel) => c !== channel)
        : [...formData.channels, channel],
    })
  }, [formData.channels, setFormData])

  return (
    <CampaignChannelsSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
      onToggleChannel={handleToggleChannel}
    />
  )
}

function ScheduleStepWrapper({ formData, setFormData }: StepWrapperProps) {
  const sectionData = useMemo<CampaignScheduleSectionData>(() => ({
    startDate: formData.startDate,
    endDate: formData.endDate,
    launchImmediately: formData.launchImmediately,
    sendWindowStart: formData.sendWindowStart,
    sendWindowEnd: formData.sendWindowEnd,
    sendDays: formData.sendDays,
    timezone: formData.timezone,
    isRecurring: formData.isRecurring,
    recurringInterval: formData.recurringInterval,
  }), [
    formData.startDate,
    formData.endDate,
    formData.launchImmediately,
    formData.sendWindowStart,
    formData.sendWindowEnd,
    formData.sendDays,
    formData.timezone,
    formData.isRecurring,
    formData.recurringInterval,
  ])

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData({ [field]: value })
  }, [setFormData])

  return (
    <CampaignScheduleSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
    />
  )
}

function BudgetStepWrapper({ formData, setFormData }: StepWrapperProps) {
  const sectionData = useMemo<CampaignBudgetSectionData>(() => ({
    budgetTotal: formData.budgetTotal ? String(formData.budgetTotal) : '',
    budgetCurrency: formData.budgetCurrency,
    targetContacts: formData.targetContacts ? String(formData.targetContacts) : '',
    targetResponses: formData.targetResponses ? String(formData.targetResponses) : '',
    targetLeads: formData.targetLeads ? String(formData.targetLeads) : '',
    targetMeetings: formData.targetMeetings ? String(formData.targetMeetings) : '',
    targetRevenue: formData.targetRevenue ? String(formData.targetRevenue) : '',
    targetSubmissions: formData.targetSubmissions ? String(formData.targetSubmissions) : '',
    targetInterviews: formData.targetInterviews ? String(formData.targetInterviews) : '',
    targetPlacements: formData.targetPlacements ? String(formData.targetPlacements) : '',
    expectedResponseRate: formData.expectedResponseRate ? String(formData.expectedResponseRate) : '',
    expectedConversionRate: formData.expectedConversionRate ? String(formData.expectedConversionRate) : '',
  }), [
    formData.budgetTotal,
    formData.budgetCurrency,
    formData.targetContacts,
    formData.targetResponses,
    formData.targetLeads,
    formData.targetMeetings,
    formData.targetRevenue,
    formData.targetSubmissions,
    formData.targetInterviews,
    formData.targetPlacements,
    formData.expectedResponseRate,
    formData.expectedConversionRate,
  ])

  const handleChange = useCallback((field: string, value: unknown) => {
    // Convert numeric strings back to numbers for the store
    if (['budgetTotal', 'targetContacts', 'targetResponses', 'targetLeads', 'targetMeetings',
         'targetRevenue', 'targetSubmissions', 'targetInterviews', 'targetPlacements',
         'expectedResponseRate', 'expectedConversionRate'].includes(field)) {
      const numValue = value ? parseFloat(String(value)) : 0
      setFormData({ [field]: numValue })
    } else {
      setFormData({ [field]: value })
    }
  }, [setFormData])

  return (
    <CampaignBudgetSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
      showStaffingTargets={true}
    />
  )
}

function TeamStepWrapper({ formData, setFormData }: StepWrapperProps) {
  const sectionData = useMemo<CampaignTeamSectionData>(() => ({
    ownerId: formData.ownerId,
    teamId: formData.teamId,
    collaboratorIds: formData.collaboratorIds,
    requiresApproval: formData.requiresApproval,
    approverIds: formData.approverIds,
    notifyOnResponse: formData.notifyOnResponse,
    notifyOnConversion: formData.notifyOnConversion,
    notifyOnCompletion: formData.notifyOnCompletion,
  }), [
    formData.ownerId,
    formData.teamId,
    formData.collaboratorIds,
    formData.requiresApproval,
    formData.approverIds,
    formData.notifyOnResponse,
    formData.notifyOnConversion,
    formData.notifyOnCompletion,
  ])

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData({ [field]: value })
  }, [setFormData])

  // TODO: Fetch actual team members and teams from API
  const mockTeamMembers = [
    { id: '1', name: 'John Smith', role: 'Account Manager' },
    { id: '2', name: 'Sarah Johnson', role: 'Recruiter' },
    { id: '3', name: 'Mike Wilson', role: 'Team Lead' },
  ]

  const mockTeams = [
    { id: '1', name: 'Sales Team' },
    { id: '2', name: 'Recruiting Team' },
    { id: '3', name: 'Marketing Team' },
  ]

  return (
    <CampaignTeamSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
      teamMembers={mockTeamMembers}
      teams={mockTeams}
    />
  )
}

function ComplianceStepWrapper({ formData, setFormData }: StepWrapperProps) {
  const sectionData = useMemo<CampaignComplianceSectionData>(() => ({
    gdpr: formData.gdpr,
    canSpam: formData.canSpam,
    casl: formData.casl,
    ccpa: formData.ccpa,
    includeUnsubscribe: formData.includeUnsubscribe,
    includePhysicalAddress: formData.includePhysicalAddress,
    respectDncList: formData.respectDncList,
    respectPreviousOptOuts: formData.respectPreviousOptOuts,
    collectConsent: formData.collectConsent,
    dataRetentionDays: formData.dataRetentionDays,
  }), [
    formData.gdpr,
    formData.canSpam,
    formData.casl,
    formData.ccpa,
    formData.includeUnsubscribe,
    formData.includePhysicalAddress,
    formData.respectDncList,
    formData.respectPreviousOptOuts,
    formData.collectConsent,
    formData.dataRetentionDays,
  ])

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData({ [field]: value })
  }, [setFormData])

  return (
    <CampaignComplianceSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
    />
  )
}
