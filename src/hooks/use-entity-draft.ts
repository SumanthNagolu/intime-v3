import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

/**
 * Hook to manage entity drafts stored in main entity tables
 *
 * Key behaviors:
 * 1. On fresh wizard (no ?resume): Reset form store immediately
 * 2. On resume (?resume=entityId): Load entity, transform to form data, restore step
 * 3. Auto-save (2s debounce): Create/update entity with status='draft'
 * 4. On finalize: Update status from 'draft' to target status, clear wizard_state
 *
 * This stores drafts in the main entity tables (e.g., jobs, companies)
 * instead of a separate entity_drafts table.
 */

// Wizard state stored in entity's wizard_state JSONB column
export interface WizardState {
  currentStep: number
  totalSteps: number
  lastSavedAt: string
}

// Store interface that wizard stores must implement
export interface WizardStore<TFormData> {
  formData: TFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null
  setFormData: (data: Partial<TFormData>) => void
  setCurrentStep?: (step: number) => void
  resetForm: () => void
}

// Mutation result type (simplified from tRPC)
interface MutationResult<TData, TInput> {
  mutateAsync: (input: TInput) => Promise<TData>
  isPending: boolean
}

// Query result type (simplified from tRPC)
interface QueryResult<TData> {
  data: TData | undefined
  isLoading: boolean
  error: unknown
}

export interface UseEntityDraftOptions<TFormData, TEntity> {
  // Entity configuration
  entityType: string
  wizardRoute: string
  totalSteps: number

  // Store integration
  store: () => WizardStore<TFormData>

  // Data transformation
  formToEntity: (formData: TFormData) => Record<string, unknown>
  entityToForm: (entity: TEntity) => TFormData
  getDisplayName: (formData: TFormData) => string

  // Check if form has meaningful data (for auto-save trigger)
  hasData?: (formData: TFormData) => boolean

  // tRPC mutations/queries (passed as pre-configured hooks)
  createMutation: MutationResult<TEntity, Record<string, unknown>>
  updateMutation: MutationResult<TEntity, Record<string, unknown>>
  getDraftQuery: QueryResult<TEntity | null>

  // Resume handling
  resumeId?: string | null

  // Search params string for URL manipulation
  searchParamsString?: string

  // Invalidation callback after save
  onInvalidate?: () => void
}

export interface UseEntityDraftReturn<TEntity> {
  // State
  isReady: boolean
  isLoading: boolean
  isSaving: boolean
  draftId: string | null
  lastSavedAt: Date | null

  // Actions
  saveDraft: () => Promise<void>
  deleteDraft: () => Promise<void>
  finalizeDraft: (targetStatus: string) => Promise<TEntity>
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

export function useEntityDraft<TFormData extends object, TEntity extends { id: string; wizard_state?: WizardState | null }>({
  entityType,
  wizardRoute,
  totalSteps,
  store,
  formToEntity,
  entityToForm,
  getDisplayName,
  hasData = defaultHasData,
  createMutation,
  updateMutation,
  getDraftQuery,
  resumeId,
  searchParamsString = '',
  onInvalidate,
}: UseEntityDraftOptions<TFormData, TEntity>): UseEntityDraftReturn<TEntity> {
  // Generate stable keys for sessionStorage
  const draftIdKey = `entity-draft-id-${entityType}-${resumeId || 'new'}`

  const [isReady, setIsReady] = useState(false)
  // Initialize draftId from sessionStorage to survive remounts
  const [draftId, setDraftIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(draftIdKey)
    }
    return null
  })
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const hasInitialized = useRef(false)
  const previousFormData = useRef<string>('')
  const router = useRouter()

  // Wrapper to persist draftId to sessionStorage
  const setDraftId = useCallback((id: string | null) => {
    setDraftIdState(id)
    if (typeof window !== 'undefined') {
      if (id) {
        sessionStorage.setItem(draftIdKey, id)
      } else {
        sessionStorage.removeItem(draftIdKey)
      }
    }
  }, [draftIdKey])

  const wizardStore = store()
  const formData = wizardStore.formData
  const currentStep = wizardStore.currentStep

  // Debounced auto-save function (2 second delay)
  const debouncedSave = useDebouncedCallback(
    async (existingDraftId: string | null, formData: TFormData, currentStep: number) => {
      const displayName = getDisplayName(formData) || `Untitled ${entityType}`

      const entityData = formToEntity(formData)

      // CRITICAL: Merge wizard metadata with formData - don't overwrite!
      // entityData.wizard_state may contain { formData, currentStep } from formToEntity
      // We need to preserve that and add our metadata
      const existingWizardState = (entityData as Record<string, unknown>).wizard_state as Record<string, unknown> | undefined
      const wizardState = {
        ...existingWizardState,
        currentStep,
        totalSteps,
        lastSavedAt: new Date().toISOString(),
      }

      try {
        if (existingDraftId) {
          // Update existing draft
          const result = await updateMutation.mutateAsync({
            id: existingDraftId,
            ...entityData,
            wizard_state: wizardState, // Now includes formData from entityData
          })
          setLastSavedAt(new Date())
          onInvalidate?.()
          return result
        } else {
          // Create new draft
          // Use 'draft' for accounts so they appear in the "Your Drafts" section
          // For other entities, don't override status - let mutation defaults handle it
          const draftStatus = entityType === 'Account' ? 'draft' : undefined
          const result = await createMutation.mutateAsync({
            ...entityData,
            ...(draftStatus ? { status: draftStatus } : {}),
            wizard_state: wizardState, // Now includes formData from entityData
          })
          setDraftId((result as TEntity).id)
          setLastSavedAt(new Date())
          onInvalidate?.()
          return result
        }
      } catch (error) {
        console.error('[useEntityDraft] Auto-save failed:', error)
        throw error
      }
    },
    2000
  )

  // Initialize draft management
  useEffect(() => {
    // Use sessionStorage to persist initialization across remounts
    const initKey = `entity-draft-init-${entityType}-${resumeId || 'new'}`
    const wasInitialized = sessionStorage.getItem(initKey) === 'true'
    
    if (hasInitialized.current || wasInitialized) {
      // If already initialized, just mark as ready but don't reset
      if (!isReady) {
        setIsReady(true)
      }
      return
    }

    const initialize = async () => {
      try {
        // Case 1: Resuming a specific draft from URL
        if (resumeId && getDraftQuery.data) {
          hasInitialized.current = true
          sessionStorage.setItem(initKey, 'true')

          const draft = getDraftQuery.data

          // CRITICAL: Reset the form FIRST to clear any stale data
          // This prevents data from other drafts bleeding into this one
          wizardStore.resetForm()

          // Load the draft into the store (now with clean slate)
          const formData = entityToForm(draft)
          wizardStore.setFormData(formData as Partial<TFormData>)

          // Restore wizard step from wizard_state
          if (draft.wizard_state?.currentStep && wizardStore.setCurrentStep) {
            wizardStore.setCurrentStep(draft.wizard_state.currentStep)
          }

          // Track this as the active draft
          setDraftId(draft.id)
          if (draft.wizard_state?.lastSavedAt) {
            setLastSavedAt(new Date(draft.wizard_state.lastSavedAt))
          }
          previousFormData.current = JSON.stringify(formData)

          // Clean up URL (remove ?resume param, keep ?step if present)
          const params = new URLSearchParams(searchParamsString)
          params.delete('resume')
          const step = params.get('step')
          const newUrl = step ? `${wizardRoute}?step=${step}` : wizardRoute
          router.replace(newUrl, { scroll: false })

          setIsReady(true)
          return
        }

        // Case 2: New wizard - reset form and wait for user to enter data
        if (!resumeId) {
          hasInitialized.current = true
          sessionStorage.setItem(initKey, 'true')

          // CRITICAL: Always reset for new wizard to prevent stale data
          // from previous drafts bleeding into the new form
          wizardStore.resetForm()
          previousFormData.current = ''

          setIsReady(true)
          return
        }
      } catch (error) {
        console.error('[useEntityDraft] Initialization error:', error)
        hasInitialized.current = true
        sessionStorage.setItem(initKey, 'true')
        setIsReady(true)
      }
    }

    // Only initialize when we have the resumed draft data (if resuming)
    if (resumeId) {
      if (getDraftQuery.data || (!getDraftQuery.isLoading && !getDraftQuery.data)) {
        initialize()
      }
    } else {
      initialize()
    }
  }, [
    resumeId,
    getDraftQuery.data,
    getDraftQuery.isLoading,
    wizardStore,
    router,
    searchParamsString,
    wizardRoute,
    entityToForm,
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

    // Trigger debounced save
    debouncedSave(draftId, formData, currentStep)
  }, [
    isReady,
    draftId,
    formData,
    currentStep,
    hasData,
    debouncedSave,
  ])

  // Manual save function (for "Save Draft" button)
  const saveDraft = useCallback(async () => {
    const hasMeaningfulData = hasData(formData)
    if (!hasMeaningfulData) return

    const entityData = formToEntity(formData)

    // CRITICAL: Merge wizard metadata with formData from entityData
    const existingWizardState = (entityData as Record<string, unknown>).wizard_state as Record<string, unknown> | undefined
    const wizardState = {
      ...existingWizardState,
      currentStep,
      totalSteps,
      lastSavedAt: new Date().toISOString(),
    }

    if (draftId) {
      // Update existing draft
      await updateMutation.mutateAsync({
        id: draftId,
        ...entityData,
        wizard_state: wizardState,
      })
    } else {
      // Create new draft
      const result = await createMutation.mutateAsync({
        ...entityData,
        status: 'draft',
        wizard_state: wizardState,
      })
      setDraftId((result as TEntity).id)
    }

    setLastSavedAt(new Date())
    onInvalidate?.()
  }, [
    draftId,
    formData,
    currentStep,
    entityType,
    totalSteps,
    formToEntity,
    getDisplayName,
    hasData,
    createMutation,
    updateMutation,
    onInvalidate,
  ])

  // Delete draft (soft delete by setting deleted_at)
  const deleteDraft = useCallback(async () => {
    if (draftId) {
      try {
        await updateMutation.mutateAsync({
          id: draftId,
          deleted_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error('[useEntityDraft] Failed to delete draft:', error)
      }
    }

    // Clean up sessionStorage
    const initKey = `entity-draft-init-${entityType}-${draftId || 'new'}`
    sessionStorage.removeItem(initKey)
    sessionStorage.removeItem(draftIdKey) // Also clear the draft ID key

    // Reset store
    wizardStore.resetForm()
    setDraftId(null)
    setLastSavedAt(null)
    onInvalidate?.()
  }, [draftId, updateMutation, wizardStore, onInvalidate, entityType, draftIdKey, setDraftId])

  // Finalize draft - change status from 'draft' to target status
  const finalizeDraft = useCallback(async (targetStatus: string): Promise<TEntity> => {
    if (!draftId) {
      // No draft exists yet, create the entity directly with target status
      const entityData = formToEntity(formData)
      const result = await createMutation.mutateAsync({
        ...entityData,
        status: targetStatus,
        wizard_state: null, // Clear wizard state
      })

      // Clean up sessionStorage
      const initKey = `entity-draft-init-${entityType}-new`
      sessionStorage.removeItem(initKey)
      sessionStorage.removeItem(draftIdKey) // Also clear the draft ID key

      // Reset store after successful creation
      wizardStore.resetForm()
      setDraftId(null)
      setLastSavedAt(null)
      onInvalidate?.()

      return result as TEntity
    }

    // Update existing draft to finalized status
    const entityData = formToEntity(formData)
    const result = await updateMutation.mutateAsync({
      id: draftId,
      ...entityData,
      status: targetStatus,
      wizard_state: null, // Clear wizard state on finalization
    })

    // Clean up sessionStorage
    const initKey = `entity-draft-init-${entityType}-${draftId}`
    sessionStorage.removeItem(initKey)
    sessionStorage.removeItem(draftIdKey) // Also clear the draft ID key

    // Reset store after successful finalization
    wizardStore.resetForm()
    setDraftId(null)
    setLastSavedAt(null)
    onInvalidate?.()

    return result as TEntity
  }, [
    draftId,
    formData,
    formToEntity,
    entityType,
    createMutation,
    updateMutation,
    wizardStore,
    onInvalidate,
    draftIdKey,
    setDraftId,
  ])

  return {
    isReady,
    isLoading: getDraftQuery.isLoading,
    isSaving: createMutation.isPending || updateMutation.isPending,
    draftId,
    lastSavedAt,
    saveDraft,
    deleteDraft,
    finalizeDraft,
  }
}

/**
 * Helper to extract entity ID from search params for resume
 */
export function getResumeIdFromParams(searchParams: URLSearchParams | { get: (key: string) => string | null }): string | null {
  return searchParams.get('resume')
}
