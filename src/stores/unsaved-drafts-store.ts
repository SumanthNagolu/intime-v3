import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * @deprecated This localStorage-based store is deprecated.
 * Use the database-backed drafts system instead:
 * - Hook: useDatabaseDraft from '@/hooks/use-database-draft'
 * - API: trpc.drafts router
 * - UI: MyDraftsTable component in My Workspace
 * 
 * This store is kept for backwards compatibility during migration.
 * 
 * Centralized registry for all wizard drafts
 * Replaces auto-loading behavior with explicit draft management
 */

// Branded type for draft IDs
export type DraftId = string & { readonly __brand: 'DraftId' }

export interface DraftEntry {
  readonly id: DraftId
  readonly storeKey: string              // e.g., 'create-account-form'
  readonly entityType: string            // e.g., 'account', 'job', 'candidate'
  readonly displayName: string           // e.g., "Acme Corp" or "Untitled Account"
  readonly formData: unknown             // The actual form state
  readonly currentStep: number
  readonly savedAt: Date
  readonly wizardRoute: string           // e.g., '/employee/recruiting/accounts/new'
}

interface UnsavedDraftsStore {
  drafts: readonly DraftEntry[]
  
  // Actions
  saveDraft: (entry: Omit<DraftEntry, 'id' | 'savedAt'>) => DraftId
  updateDraft: (id: DraftId, updates: Partial<Omit<DraftEntry, 'id' | 'savedAt'>>) => void
  removeDraft: (id: DraftId) => void
  getDraft: (id: DraftId) => DraftEntry | undefined
  getDraftsByType: (entityType: string) => readonly DraftEntry[]
  getDraftsByStoreKey: (storeKey: string) => readonly DraftEntry[]
  clearAllDrafts: () => void
  getDraftsCount: () => number
}

function createDraftId(): DraftId {
  // Fallback for environments where crypto.randomUUID() is not available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID() as DraftId
  }
  // Fallback UUID generation
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}` as DraftId
}

export const useUnsavedDraftsStore = create<UnsavedDraftsStore>()(
  persist(
    (set, get) => ({
      drafts: [],

      saveDraft: (entry) => {
        const id = createDraftId()
        const newDraft: DraftEntry = {
          ...entry,
          id,
          savedAt: new Date(),
        }
        
        set((state) => ({
          drafts: [...state.drafts, newDraft],
        }))
        
        return id
      },

      updateDraft: (id, updates) => {
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.id === id
              ? { ...draft, ...updates, savedAt: new Date() }
              : draft
          ),
        }))
      },

      removeDraft: (id) => {
        set((state) => ({
          drafts: state.drafts.filter((draft) => draft.id !== id),
        }))
      },

      getDraft: (id) => {
        return get().drafts.find((draft) => draft.id === id)
      },

      getDraftsByType: (entityType) => {
        return get().drafts.filter((draft) => draft.entityType === entityType)
      },

      getDraftsByStoreKey: (storeKey) => {
        return get().drafts.filter((draft) => draft.storeKey === storeKey)
      },

      clearAllDrafts: () => {
        set({ drafts: [] })
      },

      getDraftsCount: () => {
        return get().drafts.length
      },
    }),
    {
      name: 'unsaved-drafts-registry',
      partialize: (state) => ({
        drafts: state.drafts,
      }),
    }
  )
)

// Entity type display names
export const ENTITY_TYPE_LABELS: Record<string, string> = {
  account: 'Account',
  job: 'Job',
  candidate: 'Candidate',
  invoice: 'Invoice',
  interview: 'Interview',
  offer: 'Offer',
  submission: 'Submission',
  placement: 'Placement',
  campaign: 'Campaign',
  'pay-run': 'Pay Run',
}

// Store key to entity type mapping
export const STORE_KEY_TO_ENTITY_TYPE: Record<string, string> = {
  'create-account-form': 'account',
  'account-onboarding-form': 'account',
  'create-job-form': 'job',
  'job-intake-form': 'job',
  'candidate-intake-form': 'candidate',
  'invoice-create-form': 'invoice',
  'schedule-interview-form': 'interview',
  'extend-offer-form': 'offer',
  'submit-to-client-form': 'submission',
  'terminate-placement-form': 'placement',
  'pay-run-process-form': 'pay-run',
  'create-campaign-draft': 'campaign',
}

