'use client'

import * as React from 'react'
import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

// Layout
import { WizardLayout, type WizardStep } from '@/components/pcf/wizard/WizardLayout'

// Section components
import {
  DetailsSection,
  StakeholdersSection,
  TimelineSection,
  CompetitorsSection,
  ProposalSection,
} from '@/components/deals/sections'

// Data mappers
import {
  mapToDetailsData,
  mapToStakeholdersData,
  mapToTimelineData,
  mapToCompetitorsData,
  mapToProposalData,
  mapDetailsToApi,
  mapStakeholdersToApi,
  mapTimelineToApi,
  mapCompetitorsToApi,
  mapProposalToApi,
} from '@/lib/deals/mappers'

// Types
import type {
  DetailsSectionData,
  StakeholdersSectionData,
  TimelineSectionData,
  CompetitorsSectionData,
  ProposalSectionData,
} from '@/lib/deals/types'

import {
  DEFAULT_DETAILS_DATA,
  DEFAULT_STAKEHOLDERS_DATA,
  DEFAULT_TIMELINE_DATA,
  DEFAULT_COMPETITORS_DATA,
  DEFAULT_PROPOSAL_DATA,
} from '@/lib/deals/types'

/**
 * Wizard step definitions
 */
const WIZARD_STEPS: WizardStep[] = [
  { id: 'details', label: 'Deal Details', description: 'Value, stage, and basic information' },
  { id: 'stakeholders', label: 'Stakeholders', description: 'Key contacts and decision makers' },
  { id: 'timeline', label: 'Timeline', description: 'Dates, milestones, and next steps' },
  { id: 'competitors', label: 'Competitors', description: 'Competitive landscape' },
  { id: 'proposal', label: 'Proposal', description: 'Pricing, terms, and scope' },
]

/**
 * Main wizard page content
 */
function CreateDealWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get draft ID and step from URL
  const draftId = searchParams.get('id')
  const stepParam = searchParams.get('step')
  const currentStep = stepParam ? parseInt(stepParam, 10) : 1

  // Track last saved time
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  // Track if we're creating a draft
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  // Track if we're saving the current step
  const [isSavingStep, setIsSavingStep] = useState(false)
  // Ref to store the current step's save function
  const saveStepRef = useRef<(() => Promise<void>) | null>(null)

  // Section data state
  const [detailsData, setDetailsData] = useState<DetailsSectionData>(DEFAULT_DETAILS_DATA)
  const [stakeholdersData, setStakeholdersData] = useState<StakeholdersSectionData>(DEFAULT_STAKEHOLDERS_DATA)
  const [timelineData, setTimelineData] = useState<TimelineSectionData>(DEFAULT_TIMELINE_DATA)
  const [competitorsData, setCompetitorsData] = useState<CompetitorsSectionData>(DEFAULT_COMPETITORS_DATA)
  const [proposalData, setProposalData] = useState<ProposalSectionData>(DEFAULT_PROPOSAL_DATA)

  // Mutations
  const createDraftMutation = trpc.crm.deals.createDraft.useMutation()
  const updateDraftMutation = trpc.crm.deals.updateDraft.useMutation()
  const submitMutation = trpc.crm.deals.submit.useMutation()

  // Fetch draft data when we have an ID
  const {
    data: draft,
    isLoading: isDraftLoading,
    refetch: refetchDraft,
  } = trpc.crm.deals.getFullDeal.useQuery(
    { id: draftId! },
    { enabled: !!draftId }
  )

  // Load draft data into section state when fetched
  useEffect(() => {
    if (draft?.deal) {
      setDetailsData(mapToDetailsData(draft.deal as Record<string, unknown>))
      setStakeholdersData(mapToStakeholdersData(draft.stakeholders || []))
      setTimelineData(mapToTimelineData(draft.deal as Record<string, unknown>))
      setCompetitorsData(mapToCompetitorsData(draft.deal as Record<string, unknown>))
      setProposalData(mapToProposalData(draft.deal as Record<string, unknown>))
    }
  }, [draft])

  // Track if we've already attempted to create a draft (prevent infinite retries)
  const hasAttemptedCreate = useRef(false)

  // Create draft on first load if no ID in URL
  useEffect(() => {
    if (!draftId && !isCreatingDraft && !createDraftMutation.isPending && !hasAttemptedCreate.current) {
      hasAttemptedCreate.current = true
      setIsCreatingDraft(true)
      createDraftMutation.mutateAsync({ title: 'New Deal' }).then((newDraft) => {
        router.replace(`/employee/crm/deals/new?id=${newDraft.id}&step=1`)
      }).catch((error) => {
        console.error('Failed to create draft:', error)
        setIsCreatingDraft(false)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create draft deal.',
          variant: 'error',
        })
      })
    }
  }, [draftId, isCreatingDraft, createDraftMutation, router, toast])

  // Navigation helpers
  const goToStep = useCallback((step: number) => {
    if (draftId) {
      router.push(`/employee/crm/deals/new?id=${draftId}&step=${step}`)
    }
  }, [draftId, router])

  const handleStepClick = useCallback((stepNumber: number) => {
    goToStep(stepNumber)
  }, [goToStep])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  const handleNext = useCallback(async () => {
    if (currentStep < WIZARD_STEPS.length) {
      // Save current step before navigating
      if (saveStepRef.current) {
        setIsSavingStep(true)
        try {
          await saveStepRef.current()
          goToStep(currentStep + 1)
        } catch (error) {
          console.error('Failed to save step:', error)
        } finally {
          setIsSavingStep(false)
        }
      } else {
        goToStep(currentStep + 1)
      }
    }
  }, [currentStep, goToStep])

  const handleCancel = useCallback(() => {
    router.push('/employee/crm/deals')
  }, [router])

  // Handle save completion for any step
  const handleSaveComplete = useCallback(() => {
    setLastSavedAt(new Date())
    refetchDraft()
  }, [refetchDraft])

  // Save handlers for each step
  const saveDetails = useCallback(async () => {
    if (!draftId) return
    const apiData = mapDetailsToApi(detailsData)
    await updateDraftMutation.mutateAsync({ id: draftId, data: apiData })
    handleSaveComplete()
  }, [draftId, detailsData, updateDraftMutation, handleSaveComplete])

  const saveStakeholders = useCallback(async () => {
    if (!draftId) return
    const apiData = mapStakeholdersToApi(stakeholdersData)
    await updateDraftMutation.mutateAsync({
      id: draftId,
      data: {},
      stakeholders: apiData,
    })
    handleSaveComplete()
  }, [draftId, stakeholdersData, updateDraftMutation, handleSaveComplete])

  const saveTimeline = useCallback(async () => {
    if (!draftId) return
    const apiData = mapTimelineToApi(timelineData)
    await updateDraftMutation.mutateAsync({ id: draftId, data: apiData })
    handleSaveComplete()
  }, [draftId, timelineData, updateDraftMutation, handleSaveComplete])

  const saveCompetitors = useCallback(async () => {
    if (!draftId) return
    const apiData = mapCompetitorsToApi(competitorsData)
    await updateDraftMutation.mutateAsync({ id: draftId, data: apiData })
    handleSaveComplete()
  }, [draftId, competitorsData, updateDraftMutation, handleSaveComplete])

  const saveProposal = useCallback(async () => {
    if (!draftId) return
    const apiData = mapProposalToApi(proposalData)
    await updateDraftMutation.mutateAsync({ id: draftId, data: apiData })
    handleSaveComplete()
  }, [draftId, proposalData, updateDraftMutation, handleSaveComplete])

  // Handle final submission
  const handleSubmit = useCallback(async () => {
    if (!draftId) return

    try {
      // Save current step first
      if (saveStepRef.current) {
        await saveStepRef.current()
      }

      await submitMutation.mutateAsync({ id: draftId })

      toast({
        title: 'Deal created!',
        description: 'The deal has been successfully created.',
      })

      // Invalidate cache and redirect
      utils.crm.deals.list.invalidate()
      router.push(`/employee/crm/deals/${draftId}`)
    } catch (error) {
      console.error('Failed to create deal:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create deal.',
        variant: 'error',
      })
    }
  }, [draftId, submitMutation, toast, utils, router])

  // Loading state while creating draft or loading draft data
  if (!draftId || isDraftLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  const isLastStep = currentStep === WIZARD_STEPS.length

  return (
    <WizardLayout
      title="Create Deal"
      entityName={detailsData.title || 'Untitled Deal'}
      status="Draft"
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLastStep={isLastStep}
      isSubmitting={submitMutation.isPending}
      isSaving={isSavingStep}
      lastSavedAt={lastSavedAt}
      submitLabel="Create Deal"
    >
      <StepContent
        step={currentStep}
        detailsData={detailsData}
        stakeholdersData={stakeholdersData}
        timelineData={timelineData}
        competitorsData={competitorsData}
        proposalData={proposalData}
        onDetailsChange={(field, value) => setDetailsData((prev) => ({ ...prev, [field]: value }))}
        onStakeholdersChange={(field, value) => setStakeholdersData((prev) => ({ ...prev, [field]: value }))}
        onTimelineChange={(field, value) => setTimelineData((prev) => ({ ...prev, [field]: value }))}
        onCompetitorsChange={(field, value) => setCompetitorsData((prev) => ({ ...prev, [field]: value }))}
        onProposalChange={(field, value) => setProposalData((prev) => ({ ...prev, [field]: value }))}
        saveStepRef={saveStepRef}
        saveDetails={saveDetails}
        saveStakeholders={saveStakeholders}
        saveTimeline={saveTimeline}
        saveCompetitors={saveCompetitors}
        saveProposal={saveProposal}
        currentStage={detailsData.stage}
      />
    </WizardLayout>
  )
}

/**
 * Step content component - renders the appropriate section based on step
 */
interface StepContentProps {
  step: number
  detailsData: DetailsSectionData
  stakeholdersData: StakeholdersSectionData
  timelineData: TimelineSectionData
  competitorsData: CompetitorsSectionData
  proposalData: ProposalSectionData
  onDetailsChange: (field: string, value: unknown) => void
  onStakeholdersChange: (field: string, value: unknown) => void
  onTimelineChange: (field: string, value: unknown) => void
  onCompetitorsChange: (field: string, value: unknown) => void
  onProposalChange: (field: string, value: unknown) => void
  saveStepRef: React.MutableRefObject<(() => Promise<void>) | null>
  saveDetails: () => Promise<void>
  saveStakeholders: () => Promise<void>
  saveTimeline: () => Promise<void>
  saveCompetitors: () => Promise<void>
  saveProposal: () => Promise<void>
  currentStage: string
}

function StepContent({
  step,
  detailsData,
  stakeholdersData,
  timelineData,
  competitorsData,
  proposalData,
  onDetailsChange,
  onStakeholdersChange,
  onTimelineChange,
  onCompetitorsChange,
  onProposalChange,
  saveStepRef,
  saveDetails,
  saveStakeholders,
  saveTimeline,
  saveCompetitors,
  saveProposal,
  currentStage,
}: StepContentProps) {
  // Register save function for current step
  useEffect(() => {
    switch (step) {
      case 1:
        saveStepRef.current = saveDetails
        break
      case 2:
        saveStepRef.current = saveStakeholders
        break
      case 3:
        saveStepRef.current = saveTimeline
        break
      case 4:
        saveStepRef.current = saveCompetitors
        break
      case 5:
        saveStepRef.current = saveProposal
        break
      default:
        saveStepRef.current = null
    }
    return () => {
      saveStepRef.current = null
    }
  }, [step, saveStepRef, saveDetails, saveStakeholders, saveTimeline, saveCompetitors, saveProposal])

  switch (step) {
    case 1:
      return (
        <DetailsSection
          mode="create"
          data={detailsData}
          onChange={onDetailsChange}
        />
      )
    case 2:
      return (
        <StakeholdersSection
          mode="create"
          data={stakeholdersData}
          onChange={onStakeholdersChange}
        />
      )
    case 3:
      return (
        <TimelineSection
          mode="create"
          data={timelineData}
          onChange={onTimelineChange}
          currentStage={currentStage}
        />
      )
    case 4:
      return (
        <CompetitorsSection
          mode="create"
          data={competitorsData}
          onChange={onCompetitorsChange}
          currentStage={currentStage}
        />
      )
    case 5:
      return (
        <ProposalSection
          mode="create"
          data={proposalData}
          onChange={onProposalChange}
          currentStage={currentStage}
        />
      )
    default:
      return null
  }
}

/**
 * Page component with Suspense wrapper
 */
export default function CreateDealPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4">
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      }
    >
      <CreateDealWizard />
    </Suspense>
  )
}
