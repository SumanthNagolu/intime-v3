'use client'

import { useState, useCallback, useMemo } from 'react'

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
 * Checklist state (session-only, no persistence)
 */
interface ChecklistState {
  [itemId: string]: boolean
}

/**
 * Custom hook for managing journey step checklists
 *
 * Features:
 * - Manages manual checkbox state in session
 * - Merges session state with auto-calculated state from entity data
 * - Calculates overall progress percentage
 * - Supports manual toggle
 *
 * Note: Checklist state is session-only. Database is the source of truth
 * for entity completion status via autoComplete items.
 *
 * @param key - Unique key for this checklist (e.g., 'campaign-123-setup')
 * @param initialItems - Array of checklist items with initial completion state
 * @returns Object with items, toggleItem function, progress percentage, and reset function
 */
export function useJourneyChecklist(
  key: string,
  initialItems: JourneyChecklistItem[]
) {
  // State for manual overrides (session-only)
  const [manualState, setManualState] = useState<ChecklistState>({})

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
        return {
          ...prev,
          [itemId]: !currentValue,
        }
      })
    },
    [initialItems]
  )

  // Set a specific item's state
  const setItemCompleted = useCallback(
    (itemId: string, completed: boolean) => {
      setManualState((prev) => ({
        ...prev,
        [itemId]: completed,
      }))
    },
    []
  )

  // Reset all manual overrides
  const reset = useCallback(() => {
    setManualState({})
  }, [])

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
 * Hook for syncing journey progress with backend
 * Placeholder for future database sync implementation
 */
export function useJourneyProgressSync(
  entityType: string,
  entityId: string,
  stepId: string,
  progress: number
) {
  // Placeholder for future database sync
  // When implemented, this would call a tRPC mutation:
  // trpc.journeyProgress.sync.mutate({ entityType, entityId, stepId, progress })
}

export default useJourneyChecklist
