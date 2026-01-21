'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { TeamIdentitySection } from '@/components/teams/sections/TeamIdentitySection'
import { TeamLocationSection } from '@/components/teams/sections/TeamLocationSection'
import { TeamMembersSection } from '@/components/teams/sections/TeamMembersSection'
import { useTeamIdentitySection } from '@/components/teams/hooks/useTeamIdentitySection'
import {
  mapToIdentityData,
  mapToLocationData,
  mapToMembersData,
} from '@/lib/teams/mappers'
import type { TeamLocationSectionData, TeamMembersSectionData } from '@/lib/teams/types'
import { DEFAULT_LOCATION_DATA, DEFAULT_MEMBERS_DATA } from '@/lib/teams/types'
import { Users, MapPin, UserCog, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Wizard step definitions
const WIZARD_STEPS = [
  {
    id: 'identity',
    label: 'Identity',
    description: 'Team name and classification',
    icon: Users,
  },
  {
    id: 'location',
    label: 'Location',
    description: 'Address and regions',
    icon: MapPin,
  },
  {
    id: 'members',
    label: 'Members',
    description: 'Team members and roles',
    icon: UserCog,
  },
]

interface StepWrapperProps {
  teamId: string
  draft: Record<string, unknown>
  onSaveComplete?: () => void
  saveStepRef: React.MutableRefObject<(() => Promise<void>) | null>
}

/**
 * Team Creation Wizard
 *
 * Follows the Account wizard pattern:
 * - Creates draft on page load
 * - Uses same section components as workspace
 * - Per-step saves before navigation
 * - URL sync with ?id=xxx&step=N
 */
export default function NewTeamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Draft state from URL
  const draftId = searchParams.get('id')
  const stepParam = searchParams.get('step')
  const currentStep = stepParam ? parseInt(stepParam, 10) : 1

  // State
  const [isCreatingDraft, setIsCreatingDraft] = React.useState(false)
  const [isSavingStep, setIsSavingStep] = React.useState(false)
  const saveStepRef = React.useRef<(() => Promise<void>) | null>(null)

  // Fetch parent groups for dropdown
  const { data: parentGroupsData } = trpc.groups.list.useQuery({
    pageSize: 100,
  })
  const parentGroups = parentGroupsData?.items ?? []

  // Fetch draft data
  const { data: draftData, refetch: refetchDraft } = trpc.groups.getById.useQuery(
    { id: draftId! },
    { enabled: !!draftId }
  )

  // Create draft mutation
  const createDraftMutation = trpc.groups.create.useMutation()

  // Update mutation for activating the team
  const updateMutation = trpc.groups.update.useMutation()

  // Create draft on page load if none exists
  React.useEffect(() => {
    if (!draftId && !isCreatingDraft && !createDraftMutation.isPending) {
      setIsCreatingDraft(true)
      createDraftMutation.mutateAsync({
        name: 'New Team (Draft)',
        groupType: 'team',
      }).then((newDraft) => {
        router.replace(`/employee/settings/teams/new?id=${newDraft.id}&step=1`)
      }).catch(() => {
        toast({ title: 'Error', description: 'Failed to create draft team.', variant: 'error' })
        setIsCreatingDraft(false)
      })
    }
  }, [draftId, isCreatingDraft, createDraftMutation, router, toast])

  // Navigation handlers
  const goToStep = React.useCallback((step: number) => {
    if (draftId) {
      router.push(`/employee/settings/teams/new?id=${draftId}&step=${step}`, { scroll: false })
    }
  }, [draftId, router])

  const handleNext = React.useCallback(async () => {
    if (currentStep < WIZARD_STEPS.length) {
      if (saveStepRef.current) {
        setIsSavingStep(true)
        try {
          await saveStepRef.current()
          await refetchDraft()
          goToStep(currentStep + 1)
        } catch (error) {
          console.error('Failed to save step:', error)
          toast({ title: 'Error', description: 'Failed to save. Please try again.', variant: 'error' })
        } finally {
          setIsSavingStep(false)
        }
      } else {
        goToStep(currentStep + 1)
      }
    }
  }, [currentStep, goToStep, refetchDraft, toast])

  const handleBack = React.useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  const handleSaveDraft = React.useCallback(async () => {
    if (saveStepRef.current) {
      setIsSavingStep(true)
      try {
        await saveStepRef.current()
        await refetchDraft()
        toast({ title: 'Draft saved', description: 'Your progress has been saved.' })
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to save draft.', variant: 'error' })
      } finally {
        setIsSavingStep(false)
      }
    }
  }, [refetchDraft, toast])

  const handleCancel = React.useCallback(() => {
    router.push('/employee/settings/teams')
  }, [router])

  const handleSubmit = React.useCallback(async () => {
    if (saveStepRef.current) {
      setIsSavingStep(true)
      try {
        await saveStepRef.current()
        // Activate the team (remove draft status)
        await updateMutation.mutateAsync({ id: draftId!, isActive: true })
        toast({ title: 'Team created', description: 'The team has been created successfully.' })
        router.push(`/employee/settings/teams/${draftId}`)
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to create team.', variant: 'error' })
      } finally {
        setIsSavingStep(false)
      }
    }
  }, [draftId, router, toast, updateMutation])

  // Loading state
  if (!draftId || !draftData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal-900" />
      </div>
    )
  }

  const draft = draftData as Record<string, unknown>

  return (
    <div className="flex h-full">
      {/* Sidebar with steps */}
      <div className="w-72 border-r border-charcoal-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-charcoal-200">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-charcoal-900 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Teams
          </button>
          <h1 className="text-lg font-semibold text-charcoal-900">Create Team</h1>
          <p className="text-sm text-charcoal-500 mt-1">{draft.name as string}</p>
        </div>

        {/* Steps */}
        <div className="flex-1 p-4 space-y-2">
          {WIZARD_STEPS.map((step, index) => {
            const stepNumber = index + 1
            const isActive = currentStep === stepNumber
            const isCompleted = currentStep > stepNumber
            const Icon = step.icon

            return (
              <button
                key={step.id}
                onClick={() => goToStep(stepNumber)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all',
                  isActive
                    ? 'bg-charcoal-900 text-white'
                    : isCompleted
                      ? 'bg-success-50 text-success-700 hover:bg-success-100'
                      : 'text-charcoal-600 hover:bg-charcoal-100'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    isActive
                      ? 'bg-white/20'
                      : isCompleted
                        ? 'bg-success-500 text-white'
                        : 'bg-charcoal-200'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('font-medium text-sm', isActive ? 'text-white' : '')}>
                    {step.label}
                  </p>
                  <p
                    className={cn(
                      'text-xs truncate',
                      isActive ? 'text-white/70' : 'text-charcoal-500'
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-cream">
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Step 1: Identity */}
            {currentStep === 1 && (
              <IdentityStepWrapper
                teamId={draftId}
                draft={draft}
                onSaveComplete={() => refetchDraft()}
                saveStepRef={saveStepRef}
                parentGroups={parentGroups as Array<{ id: string; name: string; groupType: string }>}
              />
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <LocationStepWrapper
                teamId={draftId}
                draft={draft}
                onSaveComplete={() => refetchDraft()}
                saveStepRef={saveStepRef}
              />
            )}

            {/* Step 3: Members */}
            {currentStep === 3 && (
              <MembersStepWrapper
                teamId={draftId}
                draft={draft}
                onSaveComplete={() => refetchDraft()}
                saveStepRef={saveStepRef}
              />
            )}
          </div>
        </div>

        {/* Navigation footer */}
        <div className="border-t border-charcoal-200 bg-white px-8 py-4">
          <div className="max-w-4xl mx-auto flex justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSavingStep}>
                Save Draft
              </Button>
              {currentStep < WIZARD_STEPS.length ? (
                <Button onClick={handleNext} disabled={isSavingStep}>
                  {isSavingStep ? 'Saving...' : 'Next'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSavingStep}
                  className="bg-gold-600 hover:bg-gold-700"
                >
                  {isSavingStep ? 'Creating...' : 'Create Team'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ STEP WRAPPERS ============

function IdentityStepWrapper({
  teamId,
  draft,
  onSaveComplete,
  saveStepRef,
  parentGroups = [],
}: StepWrapperProps & { parentGroups?: Array<{ id: string; name: string; groupType: string }> }) {
  // Memoize initial data to prevent infinite re-renders
  const initialData = React.useMemo(() => mapToIdentityData(draft), [draft])

  const section = useTeamIdentitySection({
    teamId,
    initialData,
    mode: 'create',
    onSaveComplete,
  })

  // Register save function with parent ref
  React.useEffect(() => {
    saveStepRef.current = section.handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, section.handleSave])

  return (
    <TeamIdentitySection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
      parentGroups={parentGroups}
    />
  )
}

function LocationStepWrapper({ teamId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = React.useMemo(() => mapToLocationData(draft), [draft])
  const [localData, setLocalData] = React.useState<TeamLocationSectionData>(() => ({
    ...DEFAULT_LOCATION_DATA,
    ...initialData,
  }))

  const updateMutation = trpc.groups.update.useMutation()

  const handleChange = React.useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = React.useCallback(async () => {
    await updateMutation.mutateAsync({
      id: teamId,
      addressLine1: localData.addressLine1 || undefined,
      addressLine2: localData.addressLine2 || undefined,
      city: localData.city || undefined,
      state: localData.state || undefined,
      postalCode: localData.postalCode || undefined,
      country: localData.country || undefined,
    })
    onSaveComplete?.()
  }, [teamId, localData, updateMutation, onSaveComplete])

  React.useEffect(() => {
    saveStepRef.current = handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, handleSave])

  return (
    <TeamLocationSection
      mode="create"
      data={localData}
      onChange={handleChange}
      onSave={handleSave}
      isSaving={updateMutation.isPending}
    />
  )
}

function MembersStepWrapper({ teamId, draft, onSaveComplete, saveStepRef }: StepWrapperProps) {
  const initialData = React.useMemo(() => mapToMembersData(draft), [draft])
  const [localData, setLocalData] = React.useState<TeamMembersSectionData>(() => ({
    ...DEFAULT_MEMBERS_DATA,
    ...initialData,
  }))

  const updateMutation = trpc.groups.update.useMutation()

  const handleChange = React.useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = React.useCallback(async () => {
    await updateMutation.mutateAsync({
      id: teamId,
      managerId: localData.managerId || undefined,
      supervisorId: localData.supervisorId || undefined,
    })
    onSaveComplete?.()
  }, [teamId, localData, updateMutation, onSaveComplete])

  React.useEffect(() => {
    saveStepRef.current = handleSave
    return () => { saveStepRef.current = null }
  }, [saveStepRef, handleSave])

  return (
    <TeamMembersSection
      mode="create"
      data={localData}
      onChange={handleChange}
      onSave={handleSave}
      isSaving={updateMutation.isPending}
    />
  )
}
