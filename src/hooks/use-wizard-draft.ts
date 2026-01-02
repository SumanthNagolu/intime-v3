import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUnsavedDraftsStore, DraftId } from '@/stores/unsaved-drafts-store'

/**
 * @deprecated This localStorage-based hook is deprecated.
 * Use the database-backed useDatabaseDraft hook instead:
 * 
 * import { useDatabaseDraft } from '@/hooks/use-database-draft'
 * 
 * The database-backed version provides:
 * - Cross-session persistence
 * - Cross-device access
 * - Better reliability
 * - Integration with My Workspace Drafts tab
 * 
 * ---
 * 
 * Hook to manage wizard draft lifecycle (DEPRECATED - localStorage version)
 * 
 * Key behaviors:
 * 1. Drafts persist in the registry until form is SUBMITTED (not when resumed)
 * 2. When resuming, we track the draft ID to update it (not create duplicates)
 * 3. When navigating away, the draft stays in the registry
 * 4. When submitting, call clearActiveDraft() to remove it
 * 
 * This ensures users can go back to a draft any number of times.
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

interface UseWizardDraftOptions<T> {
  storeKey: string                          // e.g., 'create-account-form'
  entityType: string                        // e.g., 'account', 'job'
  getDisplayName: (formData: T) => string   // Extract name from form data
  wizardRoute: string                       // e.g., '/employee/recruiting/accounts/new'
  store: () => WizardStore<T>               // Zustand store hook
  resumeDraftId?: string | null             // Draft ID from URL search params
  searchParamsString?: string               // Search params string for URL manipulation
  hasData?: (formData: T) => boolean        // Optional: Check if form has meaningful data
}

interface UseWizardDraftReturn {
  isReady: boolean
  activeDraftId: DraftId | null
  loadDraft: (draftId: DraftId) => void
  saveDraftManually: () => DraftId | null
  clearActiveDraft: () => void              // Call this on successful form submission
}

// Key for storing active draft ID in localStorage
const ACTIVE_DRAFT_KEY_PREFIX = 'active-draft-'

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

/**
 * Read persisted form state directly from localStorage
 */
function getPersistedState<T>(storeKey: string): { 
  formData: T
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null 
} | null {
  if (typeof window === 'undefined') return null
  
  try {
    const raw = localStorage.getItem(storeKey)
    if (!raw) return null
    
    const parsed = JSON.parse(raw)
    if (!parsed?.state?.formData) return null
    
    return {
      formData: parsed.state.formData as T,
      currentStep: parsed.state.currentStep ?? 1,
      isDirty: parsed.state.isDirty ?? false,
      lastSaved: parsed.state.lastSaved ? new Date(parsed.state.lastSaved) : null,
    }
  } catch {
    return null
  }
}

/**
 * Get the active draft ID for a store
 */
function getActiveDraftId(storeKey: string): DraftId | null {
  if (typeof window === 'undefined') return null
  try {
    const id = localStorage.getItem(ACTIVE_DRAFT_KEY_PREFIX + storeKey)
    return id as DraftId | null
  } catch {
    return null
  }
}

/**
 * Set the active draft ID for a store
 */
function setActiveDraftId(storeKey: string, draftId: DraftId | null): void {
  if (typeof window === 'undefined') return
  try {
    if (draftId) {
      localStorage.setItem(ACTIVE_DRAFT_KEY_PREFIX + storeKey, draftId)
    } else {
      localStorage.removeItem(ACTIVE_DRAFT_KEY_PREFIX + storeKey)
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Clear persisted wizard state from localStorage
 */
function clearPersistedState(storeKey: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(storeKey)
    localStorage.removeItem(ACTIVE_DRAFT_KEY_PREFIX + storeKey)
  } catch {
    // Ignore errors
  }
}

export function useWizardDraft<T extends object>({
  storeKey,
  entityType,
  getDisplayName,
  wizardRoute,
  store,
  resumeDraftId: resumeDraftIdParam,
  searchParamsString = '',
  hasData = defaultHasData,
}: UseWizardDraftOptions<T>): UseWizardDraftReturn {
  const [isReady, setIsReady] = useState(false)
  const [activeDraftId, setActiveDraftIdState] = useState<DraftId | null>(null)
  const hasInitialized = useRef(false)
  const router = useRouter()
  const resumeDraftId = (resumeDraftIdParam as DraftId | null) || null

  const {
    saveDraft,
    updateDraft,
    removeDraft,
    getDraft,
    getDraftsByStoreKey,
  } = useUnsavedDraftsStore()

  const wizardStore = store()

  // Initialize draft management
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const initialize = () => {
      try {
        // Case 1: Resuming a specific draft from URL
        if (resumeDraftId) {
          const draft = getDraft(resumeDraftId)
          if (draft && draft.storeKey === storeKey) {
            // Load the draft into the store
            wizardStore.setFormData(draft.formData as Partial<T>)
            if (wizardStore.setCurrentStep) {
              wizardStore.setCurrentStep(draft.currentStep)
            }
            
            // Track this as the active draft (DON'T remove from registry!)
            setActiveDraftIdState(resumeDraftId)
            setActiveDraftId(storeKey, resumeDraftId)
            
            // Clean up URL (remove ?resume param)
            const params = new URLSearchParams(searchParamsString)
            params.delete('resume')
            const newUrl = params.toString() ? `?${params.toString()}` : wizardRoute
            router.replace(newUrl, { scroll: false })
          }
          setIsReady(true)
          return
        }
        
        // Case 2: Check if we have an active draft we were working on
        const existingActiveDraftId = getActiveDraftId(storeKey)
        const persistedState = getPersistedState<T>(storeKey)
        
        if (existingActiveDraftId && persistedState) {
          // We were working on a draft - update it in the registry
          const hasMeaningfulData = hasData(persistedState.formData)
          
          if (hasMeaningfulData) {
            const displayName = getDisplayName(persistedState.formData)
            
            // Update the existing draft
            updateDraft(existingActiveDraftId, {
              displayName,
              formData: persistedState.formData,
              currentStep: persistedState.currentStep,
            })
          }
          
          // Clear localStorage and reset form for fresh start
          clearPersistedState(storeKey)
          wizardStore.resetForm()
          setActiveDraftIdState(null)
          setIsReady(true)
          return
        }
        
        // Case 3: New data in localStorage (not linked to an active draft)
        if (persistedState) {
          const hasMeaningfulData = hasData(persistedState.formData)
          const shouldArchive = (persistedState.isDirty && persistedState.lastSaved) || hasMeaningfulData
          
          if (shouldArchive) {
            const displayName = getDisplayName(persistedState.formData)
            
            // Check for duplicate by content
            const existingDrafts = getDraftsByStoreKey(storeKey)
            const isDuplicate = existingDrafts.some(
              (d) => JSON.stringify(d.formData) === JSON.stringify(persistedState.formData)
            )
            
            if (!isDuplicate) {
              saveDraft({
                storeKey,
                entityType,
                displayName,
                formData: persistedState.formData,
                currentStep: persistedState.currentStep,
                wizardRoute,
              })
            }
          }
          
          // Clear localStorage and reset form
          clearPersistedState(storeKey)
          wizardStore.resetForm()
        }
        
        setIsReady(true)
      } catch (error) {
        console.error('[useWizardDraft] Initialization error:', error)
        setIsReady(true)
      }
    }

    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Manual save function (for "Save Draft" buttons)
  const saveDraftManually = useCallback((): DraftId | null => {
    const hasMeaningfulData = hasData(wizardStore.formData)
    if (!hasMeaningfulData) {
      return null
    }

    const displayName = getDisplayName(wizardStore.formData)
    
    // If we have an active draft, update it
    if (activeDraftId) {
      updateDraft(activeDraftId, {
        displayName,
        formData: wizardStore.formData,
        currentStep: wizardStore.currentStep,
      })
      
      // Clear state
      clearPersistedState(storeKey)
      wizardStore.resetForm()
      setActiveDraftIdState(null)
      
      return activeDraftId
    }
    
    // Otherwise create a new draft
    const draftId = saveDraft({
      storeKey,
      entityType,
      displayName,
      formData: wizardStore.formData,
      currentStep: wizardStore.currentStep,
      wizardRoute,
    })
    
    // Clear state
    clearPersistedState(storeKey)
    wizardStore.resetForm()
    
    return draftId
  }, [activeDraftId, entityType, getDisplayName, hasData, saveDraft, storeKey, updateDraft, wizardRoute, wizardStore])

  // Load a specific draft (used by loadDraft button)
  const loadDraft = useCallback((draftId: DraftId) => {
    const draft = getDraft(draftId)
    if (draft && draft.storeKey === storeKey) {
      wizardStore.setFormData(draft.formData as Partial<T>)
      if (wizardStore.setCurrentStep) {
        wizardStore.setCurrentStep(draft.currentStep)
      }
      // Track as active (DON'T remove from registry)
      setActiveDraftIdState(draftId)
      setActiveDraftId(storeKey, draftId)
    }
  }, [getDraft, storeKey, wizardStore])

  // Clear the active draft (call on successful form submission)
  const clearActiveDraft = useCallback(() => {
    // Remove from registry if we have an active draft
    if (activeDraftId) {
      removeDraft(activeDraftId)
    }
    
    // Also check localStorage for an active draft ID
    const storedDraftId = getActiveDraftId(storeKey)
    if (storedDraftId && storedDraftId !== activeDraftId) {
      removeDraft(storedDraftId)
    }
    
    // Clear all state
    clearPersistedState(storeKey)
    wizardStore.resetForm()
    setActiveDraftIdState(null)
  }, [activeDraftId, removeDraft, storeKey, wizardStore])

  return {
    isReady,
    activeDraftId,
    loadDraft,
    saveDraftManually,
    clearActiveDraft,
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
