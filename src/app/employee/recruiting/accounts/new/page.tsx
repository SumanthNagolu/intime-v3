'use client'

import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

// Layout
import { WizardLayout, type WizardStep } from '@/components/pcf/wizard/WizardLayout'

// Section components
import { IdentitySection } from '@/components/accounts/sections/IdentitySection'
import { LocationsSection } from '@/components/accounts/sections/LocationsSection'
import { BillingSection } from '@/components/accounts/sections/BillingSection'
import { ContactsSection } from '@/components/accounts/sections/ContactsSection'
import { ContractsSection } from '@/components/accounts/sections/ContractsSection'
import { ComplianceSection } from '@/components/accounts/sections/ComplianceSection'
import { TeamSection } from '@/components/accounts/sections/TeamSection'

// Section hooks
import {
  useIdentitySection,
  useLocationsSection,
  useBillingSection,
  useContactsSection,
  useContractsSection,
  useComplianceSection,
  useTeamSection,
} from '@/components/accounts/hooks'

// Data mappers
import {
  mapToIdentityData,
  mapToLocationsData,
  mapToBillingData,
  mapToContactsData,
  mapToContractsData,
  mapToComplianceData,
  mapToTeamData,
} from '@/lib/accounts/mappers'

/**
 * Wizard step definitions
 */
const WIZARD_STEPS: WizardStep[] = [
  { id: 'identity', label: 'Identity', description: 'Company details and classification' },
  { id: 'locations', label: 'Locations', description: 'Office addresses and locations' },
  { id: 'billing', label: 'Billing', description: 'Billing and payment terms' },
  { id: 'contacts', label: 'Contacts', description: 'Key stakeholders and contacts' },
  { id: 'contracts', label: 'Contracts', description: 'Legal agreements and contracts' },
  { id: 'compliance', label: 'Compliance', description: 'Compliance requirements' },
  { id: 'team', label: 'Team', description: 'Team assignments and preferences' },
]

/**
 * Main wizard page content
 */
function CreateAccountWizard() {
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
  const createDraftMutation = trpc.accounts.createDraft.useMutation()
  const submitMutation = trpc.accounts.submit.useMutation()

  // Fetch draft data when we have an ID
  const {
    data: draft,
    isLoading: isDraftLoading,
    refetch: refetchDraft,
  } = trpc.crm.accounts.getByIdForEdit.useQuery(
    { id: draftId! },
    { enabled: !!draftId }
  )

  // Fetch team members for team step
  const { data: teamMembersData } = trpc.users.list.useQuery(
    { pageSize: 100 },
    { enabled: currentStep === 7 }
  )
  const teamMembers = teamMembersData?.items || []

  // Create draft on first load if no ID in URL
  useEffect(() => {
    if (!draftId && !isCreatingDraft && !createDraftMutation.isPending) {
      setIsCreatingDraft(true)
      createDraftMutation.mutateAsync().then((newDraft) => {
        router.replace(`/employee/recruiting/accounts/new?id=${newDraft.id}&step=1`)
      }).catch((error) => {
        console.error('Failed to create draft:', error)
        setIsCreatingDraft(false)
        toast({
          title: 'Error',
          description: 'Failed to create draft account.',
          variant: 'error',
        })
      })
    }
  }, [draftId, isCreatingDraft, createDraftMutation, router, toast])

  // Navigation helpers
  const goToStep = useCallback((step: number) => {
    if (draftId) {
      router.push(`/employee/recruiting/accounts/new?id=${draftId}&step=${step}`)
    }
  }, [draftId, router])

  const handleStepClick = useCallback((stepNumber: number) => {
    // Allow clicking on any step (completed, current, or future)
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
          // Error is handled by the section hook
          console.error('Failed to save step:', error)
        } finally {
          setIsSavingStep(false)
        }
      } else {
        // No save function registered, just navigate
        goToStep(currentStep + 1)
      }
    }
  }, [currentStep, goToStep])

  const handleCancel = useCallback(() => {
    router.push('/employee/recruiting/accounts')
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
        accountId: draftId,
        targetStatus: 'active',
      })

      toast({
        title: 'Account created!',
        description: 'The account has been successfully created.',
      })

      // Invalidate cache and redirect
      utils.crm.accounts.list.invalidate()
      router.push(`/employee/recruiting/accounts/${draftId}`)
    } catch (error) {
      console.error('Failed to create account:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account.',
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
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Account not found</h2>
          <p className="text-charcoal-500 mb-4">The draft account could not be loaded.</p>
        </div>
      </div>
    )
  }

  // Determine the current step component and props
  const isLastStep = currentStep === WIZARD_STEPS.length

  return (
    <WizardLayout
      title="Create Account"
      entityName={draft?.name || 'Untitled Account'}
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
      submitLabel="Create Account"
    >
      <StepContent
        step={currentStep}
        accountId={draftId}
        draft={draft}
        teamMembers={teamMembers || []}
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
  accountId: string
  draft: Record<string, unknown>
  teamMembers: Array<{ id: string; full_name: string; email?: string; avatar_url?: string }>
  onSaveComplete: () => void
  saveStepRef: React.MutableRefObject<(() => Promise<void>) | null>
}

function StepContent({
  step,
  accountId,
  draft,
  teamMembers,
  onSaveComplete,
  saveStepRef,
}: StepContentProps) {

  switch (step) {
    case 1:
      return (
        <IdentityStepWrapper
          accountId={accountId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 2:
      return (
        <LocationsStepWrapper
          accountId={accountId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 3:
      return (
        <BillingStepWrapper
          accountId={accountId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 4:
      return (
        <ContactsStepWrapper
          accountId={accountId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 5:
      return (
        <ContractsStepWrapper
          accountId={accountId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 6:
      return (
        <ComplianceStepWrapper
          accountId={accountId}
          draft={draft}
          onSaveComplete={onSaveComplete}
          saveStepRef={saveStepRef}
        />
      )
    case 7:
      return (
        <TeamStepWrapper
          accountId={accountId}
          draft={draft}
          teamMembers={teamMembers}
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
  accountId: string
  draft: Record<string, unknown>
  onSaveComplete: () => void
  saveStepRef: React.MutableRefObject<(() => Promise<void>) | null>
}

function IdentityStepWrapper({ accountId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const section = useIdentitySection({
    accountId,
    initialData: mapToIdentityData(draft),
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <IdentitySection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onToggleIndustry={section.handleToggleIndustry}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function LocationsStepWrapper({ accountId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const section = useLocationsSection({
    accountId,
    initialData: mapToLocationsData(draft),
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <LocationsSection
      mode="create"
      data={section.data}
      onAddAddress={section.handleAddAddress}
      onUpdateAddress={section.handleUpdateAddress}
      onRemoveAddress={section.handleRemoveAddress}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function BillingStepWrapper({ accountId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const section = useBillingSection({
    accountId,
    initialData: mapToBillingData(draft),
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <BillingSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function ContactsStepWrapper({ accountId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const section = useContactsSection({
    accountId,
    initialData: mapToContactsData(draft),
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <ContactsSection
      mode="create"
      data={section.data}
      onAddContact={section.handleAddContact}
      onUpdateContact={section.handleUpdateContact}
      onRemoveContact={section.handleRemoveContact}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function ContractsStepWrapper({ accountId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const section = useContractsSection({
    accountId,
    initialData: mapToContractsData(draft),
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <ContractsSection
      mode="create"
      data={section.data}
      onAddContract={section.handleAddContract}
      onUpdateContract={section.handleUpdateContract}
      onRemoveContract={section.handleRemoveContract}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function ComplianceStepWrapper({ accountId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const section = useComplianceSection({
    accountId,
    initialData: mapToComplianceData(draft),
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <ComplianceSection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

interface TeamStepWrapperProps extends StepWrapperProps {
  teamMembers: Array<{ id: string; full_name: string; email?: string; avatar_url?: string }>
}

function TeamStepWrapper({ accountId, draft, teamMembers, onSaveComplete, saveStepRef }: TeamStepWrapperProps) {
  const section = useTeamSection({
    accountId,
    initialData: mapToTeamData(draft),
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
      teamMembers={teamMembers}
    />
  )
}

// ============ PAGE EXPORT ============

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<WizardLoadingState />}>
      <CreateAccountWizard />
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
