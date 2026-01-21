'use client'

import * as React from 'react'
import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

// Layout
import { WizardLayout, type WizardStep } from '@/components/pcf/wizard/WizardLayout'

// Section components
import {
  BasicInfoSection,
  RequirementsSection,
  RoleDetailsSection,
  LocationSection,
  CompensationSection,
  InterviewProcessSection,
  TeamSection,
} from '@/components/jobs/sections'

// Section hooks
import {
  useBasicInfoSection,
  useRequirementsSection,
  useRoleDetailsSection,
  useLocationSection,
  useCompensationSection,
  useInterviewProcessSection,
  useTeamSection,
} from '@/components/jobs/hooks'

// Data mappers
import {
  mapToBasicInfoData,
  mapToRequirementsData,
  mapToRoleDetailsData,
  mapToLocationData,
  mapToCompensationData,
  mapToInterviewProcessData,
  mapToTeamData,
} from '@/lib/jobs/mappers'

/**
 * Wizard step definitions
 */
const WIZARD_STEPS: WizardStep[] = [
  { id: 'basic', label: 'Basic Info', description: 'Account, title, type, and dates' },
  { id: 'requirements', label: 'Requirements', description: 'Skills, experience, and qualifications' },
  { id: 'role', label: 'Role Details', description: 'Summary, responsibilities, and team' },
  { id: 'location', label: 'Location', description: 'Work arrangement and authorization' },
  { id: 'compensation', label: 'Compensation', description: 'Rates, fees, and benefits' },
  { id: 'interview', label: 'Interview Process', description: 'Rounds and requirements' },
  { id: 'team', label: 'Team', description: 'Owner and recruiters' },
]

/**
 * Main wizard page content
 */
function CreateJobWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Get draft ID and step from URL
  const draftId = searchParams.get('id') || searchParams.get('draft')
  const editId = searchParams.get('edit')
  const stepParam = searchParams.get('step')
  const currentStep = stepParam ? parseInt(stepParam, 10) : 1
  const isEditMode = !!editId

  // Track last saved time
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  // Track if we're creating a draft
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  // Track if we're saving the current step
  const [isSavingStep, setIsSavingStep] = useState(false)
  // Ref to store the current step's save function
  const saveStepRef = useRef<(() => Promise<void>) | null>(null)

  // The actual job ID to use (draft or edit)
  const activeId = draftId || editId

  // Mutations
  const createDraftMutation = trpc.ats.jobs.createDraft.useMutation()
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // Fetch job data when we have an ID
  const {
    data: jobDraft,
    isLoading: isJobLoading,
    refetch: refetchJob,
  } = trpc.ats.jobs.getById.useQuery(
    { id: activeId! },
    { enabled: !!activeId }
  )

  // Create draft on first load if no ID in URL
  useEffect(() => {
    if (isEditMode) return // Don't create draft in edit mode
    if (activeId) return // Already have an ID
    if (isCreatingDraft || createDraftMutation.isPending) return

    setIsCreatingDraft(true)
    createDraftMutation.mutateAsync().then((newDraft) => {
      router.replace(`/employee/recruiting/jobs/new?id=${newDraft.id}&step=1`)
    }).catch((error) => {
      console.error('Failed to create draft:', error)
      setIsCreatingDraft(false)
      toast({
        title: 'Error',
        description: 'Failed to create draft job.',
        variant: 'error',
      })
    })
  }, [activeId, isEditMode, isCreatingDraft, createDraftMutation, router, toast])

  // Navigation helpers
  const goToStep = useCallback((step: number) => {
    if (activeId) {
      const param = isEditMode ? 'edit' : 'id'
      router.push(`/employee/recruiting/jobs/new?${param}=${activeId}&step=${step}`)
    }
  }, [activeId, isEditMode, router])

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
    if (isEditMode && editId) {
      router.push(`/employee/recruiting/jobs/${editId}`)
    } else {
      router.push('/employee/recruiting/jobs')
    }
  }, [isEditMode, editId, router])

  // Handle save completion for any step
  const handleSaveComplete = useCallback(() => {
    setLastSavedAt(new Date())
    refetchJob()
  }, [refetchJob])

  // Handle final submission
  const handleSubmit = useCallback(async () => {
    if (!activeId) return

    try {
      // Save the last step first
      if (saveStepRef.current) {
        await saveStepRef.current()
      }

      // Update status from draft to open
      await updateMutation.mutateAsync({
        id: activeId,
        status: isEditMode ? undefined : 'open', // Only change status for new jobs
      })

      toast({
        title: isEditMode ? 'Job updated!' : 'Job created!',
        description: isEditMode
          ? 'The job has been successfully updated.'
          : 'The job requisition has been successfully created.',
      })

      // Invalidate cache and redirect
      utils.ats.jobs.list.invalidate()
      utils.ats.jobs.getById.invalidate({ id: activeId })
      router.push(`/employee/recruiting/jobs/${activeId}`)
    } catch (error) {
      console.error('Failed to save job:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save job.',
        variant: 'error',
      })
    }
  }, [activeId, isEditMode, updateMutation, toast, utils, router])

  // Loading state while creating draft or loading job data
  if (!activeId) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-sm text-charcoal-500">Creating new job draft...</p>
        </div>
      </div>
    )
  }

  if (isJobLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mb-4 mx-auto" />
          <p className="text-sm text-charcoal-500">Loading job data...</p>
        </div>
      </div>
    )
  }

  // Error state if job fetch failed
  if (!jobDraft && !isJobLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Job not found</h2>
          <p className="text-charcoal-500 mb-4">The job could not be loaded.</p>
        </div>
      </div>
    )
  }

  // Determine the current step component and props
  const isLastStep = currentStep === WIZARD_STEPS.length

  return (
    <WizardLayout
      title={isEditMode ? 'Edit Job Requisition' : 'Create Job Requisition'}
      entityName={jobDraft?.title || 'Untitled Job'}
      status={isEditMode ? jobDraft?.status || 'Draft' : 'Draft'}
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLastStep={isLastStep}
      isSubmitting={updateMutation.isPending}
      isSaving={isSavingStep}
      lastSavedAt={lastSavedAt}
      submitLabel={isEditMode ? 'Save Changes' : 'Create Job'}
    >
      <StepContent
        step={currentStep}
        jobId={activeId}
        draft={jobDraft || {}}
        onSaveComplete={handleSaveComplete}
        saveStepRef={saveStepRef}
      />
    </WizardLayout>
  )
}

/**
 * Step content renderer - renders the appropriate section for the current step
 */
interface StepContentProps {
  step: number
  jobId: string
  draft: Record<string, unknown>
  onSaveComplete: () => void
  saveStepRef: React.MutableRefObject<(() => Promise<void>) | null>
}

function StepContent({
  step,
  jobId,
  draft,
  onSaveComplete,
  saveStepRef,
}: StepContentProps) {
  switch (step) {
    case 1:
      return (
        <BasicInfoStepWrapper
          jobId={jobId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 2:
      return (
        <RequirementsStepWrapper
          jobId={jobId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 3:
      return (
        <RoleDetailsStepWrapper
          jobId={jobId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 4:
      return (
        <LocationStepWrapper
          jobId={jobId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 5:
      return (
        <CompensationStepWrapper
          jobId={jobId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 6:
      return (
        <InterviewProcessStepWrapper
          jobId={jobId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 7:
      return (
        <TeamStepWrapper
          jobId={jobId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    default:
      return <div>Unknown step</div>
  }
}

// ============ STEP WRAPPERS ============

interface StepWrapperProps {
  jobId: string
  draft: Record<string, unknown>
  onSaveComplete: () => void
  saveStepRef: React.MutableRefObject<(() => Promise<void>) | null>
}

function BasicInfoStepWrapper({ jobId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToBasicInfoData(draft), [draft])

  const section = useBasicInfoSection({
    jobId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <BasicInfoSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function RequirementsStepWrapper({ jobId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToRequirementsData(draft), [draft])

  const section = useRequirementsSection({
    jobId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <RequirementsSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function RoleDetailsStepWrapper({ jobId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToRoleDetailsData(draft), [draft])

  const section = useRoleDetailsSection({
    jobId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <RoleDetailsSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function LocationStepWrapper({ jobId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToLocationData(draft), [draft])

  const section = useLocationSection({
    jobId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <LocationSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function CompensationStepWrapper({ jobId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToCompensationData(draft), [draft])

  const section = useCompensationSection({
    jobId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <CompensationSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function InterviewProcessStepWrapper({ jobId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToInterviewProcessData(draft), [draft])

  const section = useInterviewProcessSection({
    jobId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <InterviewProcessSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function TeamStepWrapper({ jobId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToTeamData(draft), [draft])

  const section = useTeamSection({
    jobId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <TeamSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

// ============ PAGE EXPORT ============

export default function NewJobPage() {
  return (
    <Suspense fallback={<WizardLoadingState />}>
      <CreateJobWizard />
    </Suspense>
  )
}

function WizardLoadingState() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
        <p className="text-sm text-charcoal-500">Loading wizard...</p>
      </div>
    </div>
  )
}
