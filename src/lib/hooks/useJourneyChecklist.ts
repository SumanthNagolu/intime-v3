'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * Journey Checklist Item
 */
export interface JourneyChecklistItem {
  id: string
  label: string
  description?: string
  completed: boolean
  autoComplete?: boolean // If true, cannot be manually toggled
}

/**
 * Persisted checklist state
 */
interface ChecklistState {
  [itemId: string]: boolean
}

/**
 * Storage key prefix for journey checklists
 */
const STORAGE_KEY_PREFIX = 'journey-checklist-'

/**
 * Custom hook for managing journey step checklists with localStorage persistence
 *
 * Features:
 * - Persists manual checkbox state to localStorage
 * - Merges persisted state with auto-calculated state from entity data
 * - Calculates overall progress percentage
 * - Supports manual toggle with immediate persistence
 *
 * @param key - Unique key for this checklist (e.g., 'campaign-123-setup')
 * @param initialItems - Array of checklist items with initial completion state
 * @returns Object with items, toggleItem function, progress percentage, and reset function
 */
export function useJourneyChecklist(
  key: string,
  initialItems: JourneyChecklistItem[]
) {
  // Build storage key
  const storageKey = `${STORAGE_KEY_PREFIX}${key}`

  // Load persisted state from localStorage
  const loadPersistedState = useCallback((): ChecklistState => {
    if (typeof window === 'undefined') return {}
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }, [storageKey])

  // State for manual overrides
  const [manualState, setManualState] = useState<ChecklistState>(() => loadPersistedState())

  // Sync with localStorage when key changes
  useEffect(() => {
    setManualState(loadPersistedState())
  }, [loadPersistedState])

  // Merge initial items with manual overrides
  const items = useMemo(() => {
    return initialItems.map((item) => {
      // If the item is auto-completed from entity data, use that
      // Otherwise, check if there's a manual override
      const isAutoCompleted = item.completed && item.autoComplete !== false
      const hasManualOverride = manualState[item.id] !== undefined

      return {
        ...item,
        completed: isAutoCompleted || (hasManualOverride ? manualState[item.id] : item.completed),
      }
    })
  }, [initialItems, manualState])

  // Calculate progress
  const progress = useMemo(() => {
    if (items.length === 0) return 0
    const completedCount = items.filter((item) => item.completed).length
    return Math.round((completedCount / items.length) * 100)
  }, [items])

  // Toggle a checklist item
  const toggleItem = useCallback(
    (itemId: string) => {
      const item = initialItems.find((i) => i.id === itemId)

      // Don't allow toggling auto-completed items that are completed
      if (item?.completed && item?.autoComplete !== false) {
        return
      }

      setManualState((prev) => {
        const currentValue = prev[itemId] ?? item?.completed ?? false
        const newState = {
          ...prev,
          [itemId]: !currentValue,
        }

        // Persist to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(newState))
          } catch {
            // Ignore storage errors
          }
        }

        return newState
      })
    },
    [initialItems, storageKey]
  )

  // Set a specific item's state
  const setItemCompleted = useCallback(
    (itemId: string, completed: boolean) => {
      setManualState((prev) => {
        const newState = {
          ...prev,
          [itemId]: completed,
        }

        // Persist to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(newState))
          } catch {
            // Ignore storage errors
          }
        }

        return newState
      })
    },
    [storageKey]
  )

  // Reset all manual overrides
  const reset = useCallback(() => {
    setManualState({})
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
      } catch {
        // Ignore storage errors
      }
    }
  }, [storageKey])

  // Check if all items are completed
  const isComplete = useMemo(() => {
    return items.every((item) => item.completed)
  }, [items])

  return {
    items,
    toggleItem,
    setItemCompleted,
    progress,
    reset,
    isComplete,
  }
}

/**
 * Hook for syncing journey progress with backend (optional database persistence)
 * This can be used when you want to persist progress server-side
 */
export function useJourneyProgressSync(
  entityType: string,
  entityId: string,
  stepId: string,
  progress: number
) {
  // This is a placeholder for future database sync
  // Currently we use localStorage only
  useEffect(() => {
    // Debounce sync to avoid too many updates
    const timeoutId = setTimeout(() => {
      // Future: call tRPC mutation to sync progress
      // trpc.journeyProgress.sync.mutate({ entityType, entityId, stepId, progress })
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [entityType, entityId, stepId, progress])
}

export default useJourneyChecklist
