'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { EntityNavigationState, EntityType, RecentEntity } from './entity-navigation.types'
import { entityJourneys, getCurrentStepIndex } from './entity-journeys'

const RECENT_ENTITIES_KEY = 'intime_recent_entities'
const MAX_RECENT_ENTITIES = 5

interface EntityNavigationContextValue extends EntityNavigationState {
  setCurrentEntity: (entity: EntityNavigationState['currentEntity']) => void
  addRecentEntity: (type: EntityType, entity: Omit<RecentEntity, 'viewedAt'>) => void
  clearCurrentEntity: () => void
  getRecentEntities: (type: EntityType) => RecentEntity[]
}

const EntityNavigationContext = createContext<EntityNavigationContextValue | null>(null)

// Initial empty state for recent entities
const initialRecentEntities: Record<EntityType, RecentEntity[]> = {
  job: [],
  candidate: [],
  account: [],
  submission: [],
  placement: [],
  lead: [],
  deal: [],
}

export function EntityNavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EntityNavigationState>({
    currentEntity: null,
    currentStep: null,
    recentEntities: initialRecentEntities,
  })

  // Load recent entities from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_ENTITIES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const restored: Record<EntityType, RecentEntity[]> = { ...initialRecentEntities }
        for (const type of Object.keys(parsed) as EntityType[]) {
          if (Array.isArray(parsed[type])) {
            restored[type] = parsed[type].map((e: RecentEntity & { viewedAt: string }) => ({
              ...e,
              viewedAt: new Date(e.viewedAt),
            }))
          }
        }
        setState(prev => ({ ...prev, recentEntities: restored }))
      }
    } catch (e) {
      console.error('Failed to parse recent entities:', e)
    }
  }, [])

  // Save recent entities to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_ENTITIES_KEY, JSON.stringify(state.recentEntities))
    } catch (e) {
      console.error('Failed to save recent entities:', e)
    }
  }, [state.recentEntities])

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
        addRecentEntity,
        clearCurrentEntity,
        getRecentEntities,
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
