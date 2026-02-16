import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================
// CONTEXT PANEL STORE
// State management for the right sidebar context panel
// ============================================

// Context entry type
export interface ContextEntry {
  entityType: string
  entityId: string
  entityName?: string
  timestamp: number
}

// Panel width constants
export const CONTEXT_PANEL_DEFAULT_WIDTH = 320
export const CONTEXT_PANEL_MIN_WIDTH = 280
export const CONTEXT_PANEL_MAX_WIDTH = 480

// Discriminated union for panel state
export type ContextPanelMode =
  | { mode: 'collapsed' }
  | { mode: 'expanded'; width: number }

interface ContextPanelStore {
  // Current context
  currentContext: ContextEntry | null

  // Navigation history (for back navigation)
  history: ContextEntry[]
  historyIndex: number

  // Panel state
  panelState: ContextPanelMode

  // Pinned entities (favorites)
  pinnedEntities: ContextEntry[]

  // Recent entities (last 10)
  recentEntities: ContextEntry[]

  // Context actions
  setContext: (entityType: string, entityId: string, entityName?: string) => void
  clearContext: () => void
  goBack: () => void
  goForward: () => void

  // Panel actions
  togglePanel: () => void
  expandPanel: () => void
  collapsePanel: () => void
  setWidth: (width: number) => void

  // Pin actions
  pinEntity: (entry: ContextEntry) => void
  unpinEntity: (entityId: string) => void
  isPinned: (entityId: string) => boolean

  // Reset
  reset: () => void
}

const MAX_HISTORY_SIZE = 50
const MAX_RECENT_SIZE = 10

export const useContextPanelStore = create<ContextPanelStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentContext: null,
      history: [],
      historyIndex: -1,
      panelState: { mode: 'expanded', width: CONTEXT_PANEL_DEFAULT_WIDTH },
      pinnedEntities: [],
      recentEntities: [],

      // Set new context
      setContext: (entityType, entityId, entityName) => {
        const entry: ContextEntry = {
          entityType,
          entityId,
          entityName,
          timestamp: Date.now(),
        }

        set((state) => {
          // Update history - truncate any forward history
          const newHistory = state.historyIndex >= 0
            ? [...state.history.slice(0, state.historyIndex + 1), entry]
            : [entry]

          // Limit history size
          const trimmedHistory = newHistory.slice(-MAX_HISTORY_SIZE)

          // Update recent entities (remove duplicates, add to front)
          const recentWithoutCurrent = state.recentEntities.filter(
            (e) => e.entityId !== entityId
          )
          const newRecent = [entry, ...recentWithoutCurrent].slice(0, MAX_RECENT_SIZE)

          return {
            currentContext: entry,
            history: trimmedHistory,
            historyIndex: trimmedHistory.length - 1,
            recentEntities: newRecent,
            // Auto-expand panel when setting context
            panelState: state.panelState.mode === 'collapsed'
              ? { mode: 'expanded', width: CONTEXT_PANEL_DEFAULT_WIDTH }
              : state.panelState,
          }
        })
      },

      // Clear context
      clearContext: () => {
        set({
          currentContext: null,
        })
      },

      // Go back in history
      goBack: () => {
        set((state) => {
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1
            return {
              historyIndex: newIndex,
              currentContext: state.history[newIndex],
            }
          }
          return state
        })
      },

      // Go forward in history
      goForward: () => {
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1
            return {
              historyIndex: newIndex,
              currentContext: state.history[newIndex],
            }
          }
          return state
        })
      },

      // Toggle panel expanded/collapsed
      togglePanel: () => {
        set((state) => {
          if (state.panelState.mode === 'collapsed') {
            return {
              panelState: { mode: 'expanded', width: CONTEXT_PANEL_DEFAULT_WIDTH },
            }
          }
          return {
            panelState: { mode: 'collapsed' },
          }
        })
      },

      // Expand panel
      expandPanel: () => {
        set((state) => {
          if (state.panelState.mode === 'collapsed') {
            return {
              panelState: { mode: 'expanded', width: CONTEXT_PANEL_DEFAULT_WIDTH },
            }
          }
          return state
        })
      },

      // Collapse panel
      collapsePanel: () => {
        set({
          panelState: { mode: 'collapsed' },
        })
      },

      // Set panel width
      setWidth: (width) => {
        set((state) => {
          if (state.panelState.mode === 'expanded') {
            const clampedWidth = Math.max(
              CONTEXT_PANEL_MIN_WIDTH,
              Math.min(CONTEXT_PANEL_MAX_WIDTH, width)
            )
            return {
              panelState: { mode: 'expanded', width: clampedWidth },
            }
          }
          return state
        })
      },

      // Pin an entity
      pinEntity: (entry) => {
        set((state) => {
          const alreadyPinned = state.pinnedEntities.some(
            (e) => e.entityId === entry.entityId
          )
          if (alreadyPinned) return state

          return {
            pinnedEntities: [...state.pinnedEntities, entry],
          }
        })
      },

      // Unpin an entity
      unpinEntity: (entityId) => {
        set((state) => ({
          pinnedEntities: state.pinnedEntities.filter((e) => e.entityId !== entityId),
        }))
      },

      // Check if entity is pinned
      isPinned: (entityId) => {
        return get().pinnedEntities.some((e) => e.entityId === entityId)
      },

      // Reset all state
      reset: () => {
        set({
          currentContext: null,
          history: [],
          historyIndex: -1,
          panelState: { mode: 'expanded', width: CONTEXT_PANEL_DEFAULT_WIDTH },
          pinnedEntities: [],
          recentEntities: [],
        })
      },
    }),
    {
      name: 'context-panel-preferences',
      // Only persist panel state, pinned entities, and recent
      partialize: (state) => ({
        panelState: state.panelState,
        pinnedEntities: state.pinnedEntities,
        recentEntities: state.recentEntities,
      }),
    }
  )
)
