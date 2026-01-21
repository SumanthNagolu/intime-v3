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
import { IdentitySection } from '@/components/leads/sections/IdentitySection'
import { ClassificationSection } from '@/components/leads/sections/ClassificationSection'
import { RequirementsSection } from '@/components/leads/sections/RequirementsSection'
import { QualificationSection } from '@/components/leads/sections/QualificationSection'
import { ClientProfileSection } from '@/components/leads/sections/ClientProfileSection'
import { SourceSection } from '@/components/leads/sections/SourceSection'
import { TeamSection } from '@/components/leads/sections/TeamSection'

// Section hooks
import {
  useIdentitySection,
  useClassificationSection,
  useRequirementsSection,
  useQualificationSection,
  useClientProfileSection,
  useSourceSection,
  useTeamSection,
} from '@/components/leads/hooks'

// Data mappers
import {
  mapToIdentityData,
  mapToClassificationData,
  mapToRequirementsData,
  mapToQualificationData,
  mapToClientProfileData,
  mapToSourceData,
  mapToTeamData,
} from '@/lib/leads/mappers'

/**
 * Wizard step definitions - 7 comprehensive steps for enterprise lead capture
 */
const WIZARD_STEPS: WizardStep[] = [
  { id: 'identity', label: 'Identity', description: 'Contact and company information' },
  { id: 'classification', label: 'Classification', description: 'Lead type and opportunity' },
  { id: 'requirements', label: 'Requirements', description: 'Staffing requirements and rates' },
  { id: 'qualification', label: 'Qualification', description: 'BANT scoring and criteria' },
  { id: 'client-profile', label: 'Client Profile', description: 'VMS/MSP and payment terms' },
  { id: 'source', label: 'Source', description: 'Lead source and attribution' },
  { id: 'team', label: 'Assignment', description: 'Lead owner and preferences' },
]

/**
 * Step wrapper props shared by all step wrappers
 */
interface StepWrapperProps {
  leadId: string
  draft: Record<string, unknown>
  onSaveComplete: () => void
  saveStepRef: React.MutableRefObject<(() => Promise<void>) | null>
}

/**
 * Main wizard page content
 */
function CreateLeadWizard() {
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

  // Mutations
  const createDraftMutation = trpc.unifiedContacts.leads.createDraft.useMutation()
  const submitMutation = trpc.unifiedContacts.leads.submit.useMutation()

  // Fetch draft data when we have an ID
  const {
    data: draft,
    isLoading: isDraftLoading,
    refetch: refetchDraft,
  } = trpc.unifiedContacts.leads.getByIdForEdit.useQuery(
    { id: draftId! },
    { enabled: !!draftId }
  )

  // Create draft on first load if no ID in URL
  useEffect(() => {
    if (!draftId && !isCreatingDraft && !createDraftMutation.isPending) {
      setIsCreatingDraft(true)
      createDraftMutation.mutateAsync().then((newDraft) => {
        router.replace(`/employee/crm/leads/new?id=${newDraft.id}&step=1`)
      }).catch((error) => {
        console.error('Failed to create draft:', error)
        setIsCreatingDraft(false)
        toast({
          title: 'Error',
          description: 'Failed to create draft lead.',
          variant: 'error',
        })
      })
    }
  }, [draftId, isCreatingDraft, createDraftMutation, router, toast])

  // Navigation helpers
  const goToStep = useCallback((step: number) => {
    if (draftId) {
      router.push(`/employee/crm/leads/new?id=${draftId}&step=${step}`)
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
    router.push('/employee/crm/leads')
  }, [router])

  // Handle save completion for any step
  const handleSaveComplete = useCallback(() => {
    setLastSavedAt(new Date())
    refetchDraft()
  }, [refetchDraft])

  // Handle final submission
  const handleSubmit = useCallback(async () => {
    if (!draftId) return

    // Save last step before submitting
    if (saveStepRef.current) {
      try {
        await saveStepRef.current()
      } catch (error) {
        console.error('Failed to save final step:', error)
        return
      }
    }

    try {
      await submitMutation.mutateAsync({
        leadId: draftId,
        targetStatus: 'contacted',
      })

      toast({
        title: 'Lead created!',
        description: 'The lead has been successfully created.',
      })

      // Invalidate cache and redirect
      utils.unifiedContacts.leads.list.invalidate()
      router.push(`/employee/crm/leads/${draftId}`)
    } catch (error) {
      console.error('Failed to create lead:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create lead.',
        variant: 'error',
      })
    }
  }, [draftId, submitMutation, toast, utils, router])

  // Loading state while creating draft or loading draft data
  if (!draftId || isDraftLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
          <p className="text-charcoal-500">Creating lead...</p>
        </div>
      </div>
    )
  }

  // Ensure draft is loaded
  if (!draft) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal-500">Lead not found</p>
        </div>
      </div>
    )
  }

  // Render step content
  const renderStepContent = () => {
    const draftData = draft as Record<string, unknown>

    switch (currentStep) {
      case 1:
        return (
          <IdentityStepWrapper
            leadId={draftId}
            draft={draftData}
            onSaveComplete={handleSaveComplete}
            saveStepRef={saveStepRef}
          />
        )
      case 2:
        return (
          <ClassificationStepWrapper
            leadId={draftId}
            draft={draftData}
            onSaveComplete={handleSaveComplete}
            saveStepRef={saveStepRef}
          />
        )
      case 3:
        return (
          <RequirementsStepWrapper
            leadId={draftId}
            draft={draftData}
            onSaveComplete={handleSaveComplete}
            saveStepRef={saveStepRef}
          />
        )
      case 4:
        return (
          <QualificationStepWrapper
            leadId={draftId}
            draft={draftData}
            onSaveComplete={handleSaveComplete}
            saveStepRef={saveStepRef}
          />
        )
      case 5:
        return (
          <ClientProfileStepWrapper
            leadId={draftId}
            draft={draftData}
            onSaveComplete={handleSaveComplete}
            saveStepRef={saveStepRef}
          />
        )
      case 6:
        return (
          <SourceStepWrapper
            leadId={draftId}
            draft={draftData}
            onSaveComplete={handleSaveComplete}
            saveStepRef={saveStepRef}
          />
        )
      case 7:
        return (
          <TeamStepWrapper
            leadId={draftId}
            draft={draftData}
            onSaveComplete={handleSaveComplete}
            saveStepRef={saveStepRef}
          />
        )
      default:
        return null
    }
  }

  // Derive entity name from draft
  const entityName = [draft.first_name, draft.last_name].filter(Boolean).join(' ') || 'New Lead'

  return (
    <WizardLayout
      title="Create Lead"
      entityName={entityName}
      status="draft"
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      onBack={handleBack}
      onNext={handleNext}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      isSubmitting={submitMutation.isPending}
      isSaving={isSavingStep}
      lastSavedAt={lastSavedAt}
      submitLabel="Create Lead"
    >
      {renderStepContent()}
    </WizardLayout>
  )
}

// ============================================================================
// STEP WRAPPERS
// ============================================================================

/**
 * Identity Step Wrapper - Contact and company information
 */
function IdentityStepWrapper({
  leadId,
  draft,
  onSaveComplete,
  saveStepRef,
}: StepWrapperProps) {
  const initialData = useMemo(() => mapToIdentityData(draft), [draft])

  const section = useIdentitySection({
    leadId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => {
      saveStepRef.current = null
    }
  }, [saveStepRef, section.handleSave])

  return (
    <IdentitySection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

/**
 * Classification Step Wrapper - Lead type and opportunity classification
 */
function ClassificationStepWrapper({
  leadId,
  draft,
  onSaveComplete,
  saveStepRef,
}: StepWrapperProps) {
  const initialData = useMemo(() => mapToClassificationData(draft), [draft])

  const section = useClassificationSection({
    leadId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => {
      saveStepRef.current = null
    }
  }, [saveStepRef, section.handleSave])

  return (
    <ClassificationSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

/**
 * Requirements Step Wrapper - Staffing requirements and rates
 */
function RequirementsStepWrapper({
  leadId,
  draft,
  onSaveComplete,
  saveStepRef,
}: StepWrapperProps) {
  const initialData = useMemo(() => mapToRequirementsData(draft), [draft])

  const section = useRequirementsSection({
    leadId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => {
      saveStepRef.current = null
    }
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

/**
 * Qualification Step Wrapper - BANT scoring and criteria
 */
function QualificationStepWrapper({
  leadId,
  draft,
  onSaveComplete,
  saveStepRef,
}: StepWrapperProps) {
  const initialData = useMemo(() => mapToQualificationData(draft), [draft])

  const section = useQualificationSection({
    leadId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => {
      saveStepRef.current = null
    }
  }, [saveStepRef, section.handleSave])

  return (
    <QualificationSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

/**
 * Client Profile Step Wrapper - VMS/MSP and payment terms
 */
function ClientProfileStepWrapper({
  leadId,
  draft,
  onSaveComplete,
  saveStepRef,
}: StepWrapperProps) {
  const initialData = useMemo(() => mapToClientProfileData(draft), [draft])

  const section = useClientProfileSection({
    leadId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => {
      saveStepRef.current = null
    }
  }, [saveStepRef, section.handleSave])

  return (
    <ClientProfileSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

/**
 * Source Step Wrapper - Lead source and attribution
 */
function SourceStepWrapper({
  leadId,
  draft,
  onSaveComplete,
  saveStepRef,
}: StepWrapperProps) {
  const initialData = useMemo(() => mapToSourceData(draft), [draft])

  const section = useSourceSection({
    leadId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => {
      saveStepRef.current = null
    }
  }, [saveStepRef, section.handleSave])

  return (
    <SourceSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

/**
 * Team Step Wrapper - Lead owner and preferences
 */
function TeamStepWrapper({
  leadId,
  draft,
  onSaveComplete,
  saveStepRef,
}: StepWrapperProps) {
  const initialData = useMemo(() => mapToTeamData(draft), [draft])

  const section = useTeamSection({
    leadId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => {
      saveStepRef.current = null
    }
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

// ============================================================================
// EXPORT
// ============================================================================

export default function CreateLeadPage() {
  return (
    <Suspense fallback={<WizardSkeleton />}>
      <CreateLeadWizard />
    </Suspense>
  )
}

function WizardSkeleton() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
        <p className="text-charcoal-500">Loading...</p>
      </div>
    </div>
  )
}
