import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useDebouncedCallback } from 'use-debounce'
import type { EntityType, DraftItem } from '@/server/routers/drafts'

/**
 * Hook to manage database-backed wizard drafts
 * 
 * Key behaviors:
 * 1. Creates a draft in the database when the wizard starts (if not resuming)
 * 2. Auto-saves to the database with debouncing (every 2 seconds on change)
 * 3. Loads draft from database when resuming via URL param (?resume=draftId)
 * 4. Deletes draft from database on successful form submission
 * 5. Drafts persist across sessions and devices
 * 
 * This replaces the localStorage-based useWizardDraft hook.
 */

interface WizardStore<T> {
  formData: T
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null
  setFormData: (data: Partial<T>) => void
  setCurrentStep?: (step: number) => void
  resetForm: () => void
}

interface UseDatabaseDraftOptions<T> {
  entityType: EntityType                    // 'account', 'job', 'contact', etc.
  getDisplayName: (formData: T) => string   // Extract name from form data
  wizardRoute: string                       // e.g., '/employee/recruiting/accounts/new'
  totalSteps: number                        // Total number of wizard steps
  store: () => WizardStore<T>               // Zustand store hook
  resumeDraftId?: string | null             // Draft ID from URL search params
  searchParamsString?: string               // Search params string for URL manipulation
  hasData?: (formData: T) => boolean        // Optional: Check if form has meaningful data
}

interface UseDatabaseDraftReturn {
  isReady: boolean
  isLoading: boolean
  isSaving: boolean
  activeDraftId: string | null
  lastSavedAt: Date | null
  deleteDraft: () => Promise<void>          // Call this on successful form submission
  saveDraftManually: () => Promise<void>    // Explicit save button
}

/**
 * Default check for whether form data has meaningful content
 */
function defaultHasData<T extends object>(formData: T): boolean {
  const data = formData as Record<string, unknown>
  const nameField = data.name || data.title || data.firstName || data.companyName
  if (nameField && typeof nameField === 'string' && nameField.trim() !== '') {
    return true
  }
  return false
}

export function useDatabaseDraft<T extends object>({
  entityType,
  getDisplayName,
  wizardRoute,
  totalSteps,
  store,
  resumeDraftId: resumeDraftIdParam,
  searchParamsString = '',
  hasData = defaultHasData,
}: UseDatabaseDraftOptions<T>): UseDatabaseDraftReturn {
  const [isReady, setIsReady] = useState(false)
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const hasInitialized = useRef(false)
  const previousFormData = useRef<string>('')
  const router = useRouter()
  const resumeDraftId = resumeDraftIdParam || null

  const wizardStore = store()
  // Extract reactive values for dependency tracking
  const formData = wizardStore.formData
  const currentStep = wizardStore.currentStep
  const utils = trpc.useUtils()

  // tRPC mutations
  const createDraft = trpc.drafts.create.useMutation({
    onSuccess: (data) => {
      setActiveDraftId(data.id)
      setLastSavedAt(new Date(data.updatedAt))
    },
  })

  const updateDraft = trpc.drafts.update.useMutation({
    onSuccess: (data) => {
      setLastSavedAt(new Date(data.updatedAt))
    },
  })

  const deleteDraftMutation = trpc.drafts.delete.useMutation({
    onSuccess: () => {
      setActiveDraftId(null)
      setLastSavedAt(null)
      utils.drafts.list.invalidate()
      utils.drafts.counts.invalidate()
    },
  })

  // tRPC query for resuming a draft
  const { data: resumedDraft, isLoading: isLoadingDraft } = trpc.drafts.get.useQuery(
    { id: resumeDraftId! },
    { enabled: !!resumeDraftId && !hasInitialized.current }
  )

  // Debounced auto-save function (2 second delay)
  const debouncedSave = useDebouncedCallback(
    async (draftId: string, formData: T, currentStep: number) => {
      const displayName = getDisplayName(formData) || `Untitled ${entityType}`
      
      try {
        await updateDraft.mutateAsync({
          id: draftId,
          displayName,
          formData: formData as Record<string, unknown>,
          currentStep,
          totalSteps,
        })
      } catch (error) {
        console.error('[useDatabaseDraft] Auto-save failed:', error)
      }
    },
    2000
  )

  // Initialize draft management
  useEffect(() => {
    if (hasInitialized.current) return

    const initialize = async () => {
      try {
        // Case 1: Resuming a specific draft from URL
        if (resumeDraftId && resumedDraft) {
          hasInitialized.current = true
          
          // Load the draft into the store
          wizardStore.setFormData(resumedDraft.formData as Partial<T>)
          if (wizardStore.setCurrentStep) {
            wizardStore.setCurrentStep(resumedDraft.currentStep)
          }
          
          // Track this as the active draft
          setActiveDraftId(resumedDraft.id)
          setLastSavedAt(new Date(resumedDraft.updatedAt))
          previousFormData.current = JSON.stringify(resumedDraft.formData)
          
          // Clean up URL (remove ?resume param)
          const params = new URLSearchParams(searchParamsString)
          params.delete('resume')
          const newUrl = params.toString() ? `?${params.toString()}` : wizardRoute
          router.replace(newUrl, { scroll: false })
          
          setIsReady(true)
          return
        }

        // Case 2: New wizard - reset form and wait for user to enter data before creating draft
        if (!resumeDraftId) {
          hasInitialized.current = true
          // IMPORTANT: Reset the form to clear any stale localStorage-persisted data
          // This ensures a fresh form when starting new entity creation (not resuming)
          wizardStore.resetForm()
          previousFormData.current = ''
          setIsReady(true)
          return
        }
      } catch (error) {
        console.error('[useDatabaseDraft] Initialization error:', error)
        hasInitialized.current = true
        setIsReady(true)
      }
    }

    // Only initialize when we have the resumed draft data (if resuming)
    if (resumeDraftId) {
      if (resumedDraft || !isLoadingDraft) {
        initialize()
      }
    } else {
      initialize()
    }
  }, [
    resumeDraftId,
    resumedDraft,
    isLoadingDraft,
    wizardStore,
    router,
    searchParamsString,
    wizardRoute,
  ])

  // Watch for form changes and auto-save
  useEffect(() => {
    if (!isReady) return

    const currentFormDataStr = JSON.stringify(formData)
    
    // Skip if no changes
    if (currentFormDataStr === previousFormData.current) return
    previousFormData.current = currentFormDataStr

    // Check if form has meaningful data
    const hasMeaningfulData = hasData(formData)
    if (!hasMeaningfulData) return

    const displayName = getDisplayName(formData) || `Untitled ${entityType}`

    // Create draft if we don't have one yet
    if (!activeDraftId) {
      createDraft.mutate({
        entityType,
        displayName,
        formData: formData as Record<string, unknown>,
        currentStep,
        totalSteps,
        wizardRoute,
      })
      return
    }

    // Update existing draft with debounce
    debouncedSave(activeDraftId, formData, currentStep)
  }, [
    isReady,
    activeDraftId,
    formData,
    currentStep,
    entityType,
    getDisplayName,
    hasData,
    totalSteps,
    wizardRoute,
    createDraft,
    debouncedSave,
  ])

  // Delete the active draft (call on successful form submission)
  const deleteDraft = useCallback(async () => {
    if (activeDraftId) {
      try {
        await deleteDraftMutation.mutateAsync({ id: activeDraftId })
      } catch (error) {
        console.error('[useDatabaseDraft] Failed to delete draft:', error)
      }
    }
    
    // Reset store
    wizardStore.resetForm()
    setActiveDraftId(null)
    setLastSavedAt(null)
  }, [activeDraftId, deleteDraftMutation, wizardStore])

  // Manual save function (for "Save Draft" button)
  const saveDraftManually = useCallback(async () => {
    const hasMeaningfulData = hasData(formData)
    if (!hasMeaningfulData) return

    const displayName = getDisplayName(formData) || `Untitled ${entityType}`

    if (activeDraftId) {
      // Update existing draft
      await updateDraft.mutateAsync({
        id: activeDraftId,
        displayName,
        formData: formData as Record<string, unknown>,
        currentStep,
        totalSteps,
      })
    } else {
      // Create new draft
      await createDraft.mutateAsync({
        entityType,
        displayName,
        formData: formData as Record<string, unknown>,
        currentStep,
        totalSteps,
        wizardRoute,
      })
    }

    utils.drafts.list.invalidate()
    utils.drafts.counts.invalidate()
  }, [
    activeDraftId,
    createDraft,
    entityType,
    getDisplayName,
    hasData,
    totalSteps,
    updateDraft,
    utils.drafts.counts,
    utils.drafts.list,
    wizardRoute,
    currentStep,
    formData,
  ])

  return {
    isReady,
    isLoading: isLoadingDraft,
    isSaving: createDraft.isPending || updateDraft.isPending,
    activeDraftId,
    lastSavedAt,
    deleteDraft,
    saveDraftManually,
  }
}

/**
 * Helper to generate a display name from common form fields
 */
export function generateDisplayName(
  formData: Record<string, unknown>,
  entityType: string
): string {
  const nameField = formData.name || formData.title || formData.firstName
  
  if (nameField && typeof nameField === 'string' && nameField.trim()) {
    return nameField.trim()
  }
  
  const timestamp = new Date().toLocaleDateString()
  return `Untitled ${entityType} (${timestamp})`
}

