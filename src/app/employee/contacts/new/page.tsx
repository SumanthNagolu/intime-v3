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
  BasicInfoSection,
  EmploymentSection,
  CommunicationSection,
  SocialSection,
  CandidateSection,
  LeadSection,
  AddressesSection,
} from '@/components/contacts/sections'

// Section hooks
import {
  useBasicInfoSection,
  useEmploymentSection,
  useCommunicationSection,
  useSocialSection,
  useCandidateSection,
  useLeadSection,
  useAddressesSection,
} from '@/components/contacts/hooks'

// Data mappers
import {
  mapToBasicInfoData,
  mapToEmploymentData,
  mapToCommunicationData,
  mapToSocialData,
  mapToCandidateData,
  mapToLeadData,
  mapToAddressesData,
} from '@/lib/contacts/mappers'

import type { ContactCategory } from '@/lib/contacts/types'

/**
 * Person Contact wizard steps
 */
const PERSON_WIZARD_STEPS: WizardStep[] = [
  { id: 'basic', label: 'Basic Info', description: 'Name and contact details' },
  { id: 'employment', label: 'Employment', description: 'Current job and company' },
  { id: 'communication', label: 'Communication', description: 'Contact preferences' },
  { id: 'social', label: 'Social', description: 'Social profiles and web presence' },
  { id: 'addresses', label: 'Addresses', description: 'Home and work addresses' },
]

/**
 * Company Contact wizard steps
 */
const COMPANY_WIZARD_STEPS: WizardStep[] = [
  { id: 'basic', label: 'Basic Info', description: 'Company details' },
  { id: 'communication', label: 'Communication', description: 'Contact preferences' },
  { id: 'social', label: 'Social', description: 'Social profiles and web presence' },
  { id: 'addresses', label: 'Locations', description: 'Office locations' },
]

/**
 * Optional steps for specific contact types
 */
const CANDIDATE_STEP: WizardStep = { id: 'candidate', label: 'Candidate', description: 'Candidate-specific details' }
const LEAD_STEP: WizardStep = { id: 'lead', label: 'Lead', description: 'Lead qualification' }

/**
 * Main wizard page content
 */
function CreateContactWizard() {
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
  const createDraftMutation = trpc.contacts.createContactDraft.useMutation()
  const submitMutation = trpc.contacts.submitContact.useMutation()

  // Fetch draft data when we have an ID
  const {
    data: draft,
    isLoading: isDraftLoading,
    refetch: refetchDraft,
  } = trpc.contacts.getContactForEdit.useQuery(
    { id: draftId! },
    { enabled: !!draftId }
  )

  // Determine contact category and types
  const category: ContactCategory = (draft?.category as ContactCategory) || 'person'
  const types: string[] = (draft?.contact_types as string[]) || []
  const isCandidate = types.includes('candidate')
  const isLead = types.includes('lead')

  // Build dynamic wizard steps based on category and types
  const wizardSteps = useMemo(() => {
    const baseSteps = category === 'company' ? [...COMPANY_WIZARD_STEPS] : [...PERSON_WIZARD_STEPS]
    
    // Insert type-specific steps after basic info for person contacts
    if (category === 'person') {
      const insertIndex = 2 // After basic and employment
      const additionalSteps: WizardStep[] = []
      
      if (isCandidate) additionalSteps.push(CANDIDATE_STEP)
      if (isLead) additionalSteps.push(LEAD_STEP)
      
      return [
        ...baseSteps.slice(0, insertIndex),
        ...additionalSteps,
        ...baseSteps.slice(insertIndex),
      ]
    }
    
    return baseSteps
  }, [category, isCandidate, isLead])

  // Create draft on first load if no ID in URL
  useEffect(() => {
    if (!draftId && !isCreatingDraft && !createDraftMutation.isPending) {
      setIsCreatingDraft(true)
      // Default to person_prospect - user will select category and types in first step
      createDraftMutation.mutateAsync({
        category: 'person',
        subtype: 'person_prospect',
      }).then((newDraft) => {
        router.replace(`/employee/contacts/new?id=${newDraft.id}&step=1`)
      }).catch((error) => {
        console.error('Failed to create draft:', error)
        setIsCreatingDraft(false)
        toast({
          title: 'Error',
          description: 'Failed to create draft contact.',
          variant: 'error',
        })
      })
    }
  }, [draftId, isCreatingDraft, createDraftMutation, router, toast])

  // Navigation helpers
  const goToStep = useCallback((step: number) => {
    if (draftId) {
      router.push(`/employee/contacts/new?id=${draftId}&step=${step}`)
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
    if (currentStep < wizardSteps.length) {
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
  }, [currentStep, wizardSteps.length, goToStep])

  const handleCancel = useCallback(() => {
    router.push('/employee/contacts')
  }, [router])

  // Handle save completion for any step
  const handleSaveComplete = useCallback(() => {
    setLastSavedAt(new Date())
    refetchDraft()
  }, [refetchDraft])

  // Handle final submission
  const handleSubmit = useCallback(async () => {
    if (!draftId) return

    try {
      await submitMutation.mutateAsync({
        contactId: draftId,
        targetStatus: 'active',
      })

      toast({
        title: 'Contact created!',
        description: 'The contact has been successfully created.',
      })

      // Invalidate cache and redirect
      utils.contacts.list.invalidate()
      router.push(`/employee/contacts/${draftId}`)
    } catch (error) {
      console.error('Failed to create contact:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create contact.',
        variant: 'error',
      })
    }
  }, [draftId, submitMutation, toast, utils, router])

  // Loading state while creating draft or loading draft data
  if (!draftId || isDraftLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mb-4 mx-auto" />
          <p className="text-sm text-charcoal-500">Preparing wizard...</p>
        </div>
      </div>
    )
  }

  // Error state if draft fetch failed
  if (!draft && !isDraftLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Contact not found</h2>
          <p className="text-charcoal-500 mb-4">The draft contact could not be loaded.</p>
        </div>
      </div>
    )
  }

  // Get entity name for display
  const entityName = category === 'person'
    ? `${draft?.first_name || ''} ${draft?.last_name || ''}`.trim() || 'New Contact'
    : (draft?.company_name as string) || 'New Contact'

  const isLastStep = currentStep === wizardSteps.length

  return (
    <WizardLayout
      title="Create Contact"
      entityName={entityName}
      status="Draft"
      steps={wizardSteps}
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
      submitLabel="Create Contact"
    >
      <StepContent
        stepId={wizardSteps[currentStep - 1]?.id || 'basic'}
        contactId={draftId}
        draft={draft as Record<string, unknown>}
        category={category}
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
  stepId: string
  contactId: string
  draft: Record<string, unknown>
  category: ContactCategory
  onSaveComplete: () => void
  saveStepRef: React.MutableRefObject<(() => Promise<void>) | null>
}

function StepContent({
  stepId,
  contactId,
  draft,
  category,
  onSaveComplete,
  saveStepRef,
}: StepContentProps) {
  switch (stepId) {
    case 'basic':
      return (
        <BasicInfoStepWrapper
          contactId={contactId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 'employment':
      return (
        <EmploymentStepWrapper
          contactId={contactId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 'communication':
      return (
        <CommunicationStepWrapper
          contactId={contactId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 'social':
      return (
        <SocialStepWrapper
          contactId={contactId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 'candidate':
      return (
        <CandidateStepWrapper
          contactId={contactId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 'lead':
      return (
        <LeadStepWrapper
          contactId={contactId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 'addresses':
      return (
        <AddressesStepWrapper
          contactId={contactId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    default:
      return <div>Unknown step: {stepId}</div>
  }
}

// ============ STEP WRAPPERS ============

interface StepWrapperProps {
  contactId: string
  draft: Record<string, unknown>
  onSaveComplete: () => void
  saveStepRef: React.MutableRefObject<(() => Promise<void>) | null>
}

function BasicInfoStepWrapper({ contactId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToBasicInfoData(draft), [draft])

  const section = useBasicInfoSection({
    contactId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <BasicInfoSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onToggleType={section.handleToggleType}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function EmploymentStepWrapper({ contactId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToEmploymentData(draft), [draft])

  const section = useEmploymentSection({
    contactId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <EmploymentSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function CommunicationStepWrapper({ contactId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToCommunicationData(draft), [draft])

  const section = useCommunicationSection({
    contactId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <CommunicationSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function SocialStepWrapper({ contactId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToSocialData(draft), [draft])

  const section = useSocialSection({
    contactId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <SocialSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function CandidateStepWrapper({ contactId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToCandidateData(draft), [draft])

  const section = useCandidateSection({
    contactId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <CandidateSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function LeadStepWrapper({ contactId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToLeadData(draft), [draft])

  const section = useLeadSection({
    contactId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <LeadSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function AddressesStepWrapper({ contactId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = useMemo(() => mapToAddressesData(draft), [draft])

  const section = useAddressesSection({
    contactId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <AddressesSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onAddAddress={section.handleAddAddress}
      onRemoveAddress={section.handleRemoveAddress}
      onSetPrimary={section.handleSetPrimary}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

// ============ PAGE EXPORT ============

export default function CreateContactPage() {
  return (
    <Suspense fallback={<WizardLoadingState />}>
      <CreateContactWizard />
    </Suspense>
  )
}

function WizardLoadingState() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="h-8 w-64 mb-4 mx-auto" />
        <p className="text-sm text-charcoal-500">Loading wizard...</p>
      </div>
    </div>
  )
}
