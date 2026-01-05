'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { EntityNavigationState, EntityType, RecentEntity } from './entity-navigation.types'
import { entityJourneys, getCurrentStepIndex } from './entity-journeys'

const MAX_RECENT_ENTITIES = 10

interface EntityNavigationContextValue extends EntityNavigationState {
  setCurrentEntity: (entity: EntityNavigationState['currentEntity']) => void
  setCurrentEntityData: (data: unknown) => void
  addRecentEntity: (type: EntityType, entity: Omit<RecentEntity, 'viewedAt'>) => void
  clearCurrentEntity: () => void
  getRecentEntities: (type: EntityType) => RecentEntity[]
  /** Full entity data for sidebar access (ONE DB CALL pattern) */
  currentEntityData: unknown
}

const EntityNavigationContext = createContext<EntityNavigationContextValue | null>(null)

// Initial empty state for recent entities
const initialRecentEntities: Record<EntityType, RecentEntity[]> = {
  job: [],
  candidate: [],
  account: [],
  contact: [],
  submission: [],
  interview: [],
  offer: [],
  placement: [],
  lead: [],
  deal: [],
  campaign: [],
  invoice: [],
  pay_run: [],
  timesheet: [],
}

export function EntityNavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EntityNavigationState>({
    currentEntity: null,
    currentStep: null,
    recentEntities: initialRecentEntities,
  })
  // Full entity data for sidebar access (ONE DB CALL pattern)
  const [currentEntityData, setCurrentEntityDataState] = useState<unknown>(null)

  // Note: Recent entities are now session-only (no localStorage persistence)
  // Database is the single source of truth for all persistent data

  const setCurrentEntity = useCallback((entity: EntityNavigationState['currentEntity']) => {
    if (!entity) {
      setState(prev => ({
        ...prev,
        currentEntity: null,
        currentStep: null,
      }))
      return
    }

    // Derive current step from entity status
    const stepIndex = getCurrentStepIndex(entity.type, entity.status)
    const journey = entityJourneys[entity.type]
    const currentStep = journey.steps[stepIndex]?.id || null

    setState(prev => ({
      ...prev,
      currentEntity: entity,
      currentStep,
    }))
  }, [])

  const clearCurrentEntity = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentEntity: null,
      currentStep: null,
    }))
    setCurrentEntityDataState(null)
  }, [])

  // ONE DB CALL pattern: Store full entity data for sidebar access
  const setCurrentEntityData = useCallback((data: unknown) => {
    setCurrentEntityDataState(data)
  }, [])

  const addRecentEntity = useCallback((type: EntityType, entity: Omit<RecentEntity, 'viewedAt'>) => {
    setState(prev => {
      const current = prev.recentEntities[type]
      // Remove existing entry for same ID
      const filtered = current.filter(e => e.id !== entity.id)
      // Add to front with timestamp
      const updated = [
        { ...entity, viewedAt: new Date() },
        ...filtered
      ].slice(0, MAX_RECENT_ENTITIES)

      return {
        ...prev,
        recentEntities: {
          ...prev.recentEntities,
          [type]: updated,
        },
      }
    })
  }, [])

  const getRecentEntities = useCallback((type: EntityType): RecentEntity[] => {
    return state.recentEntities[type] || []
  }, [state.recentEntities])

  return (
    <EntityNavigationContext.Provider
      value={{
        ...state,
        setCurrentEntity,
        setCurrentEntityData,
        addRecentEntity,
        clearCurrentEntity,
        getRecentEntities,
        currentEntityData,
      }}
    >
      {children}
    </EntityNavigationContext.Provider>
  )
}

export function useEntityNavigation() {
  const context = useContext(EntityNavigationContext)
  if (!context) {
    throw new Error('useEntityNavigation must be used within EntityNavigationProvider')
  }
  return context
}

// Safe hook that doesn't throw if context is missing (for optional use)
export function useEntityNavigationSafe() {
  return useContext(EntityNavigationContext)
}
