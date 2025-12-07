import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  entityJourneys,
  getCurrentStepIndex,
  getVisibleQuickActions,
  getEntityJourney,
} from '@/lib/navigation/entity-journeys'
import {
  EntityType,
  ENTITY_BASE_PATHS,
  getEntityUrl,
  resolveHref,
} from '@/lib/navigation/entity-navigation.types'

describe('Entity Navigation - Helper Functions', () => {
  describe('getEntityUrl', () => {
    it('should return correct URL for job entity', () => {
      expect(getEntityUrl('job', '123')).toBe('/employee/recruiting/jobs/123')
    })

    it('should return correct URL for candidate entity', () => {
      expect(getEntityUrl('candidate', 'abc-def')).toBe('/employee/recruiting/candidates/abc-def')
    })

    it('should return correct URL for account entity', () => {
      expect(getEntityUrl('account', '456')).toBe('/employee/recruiting/accounts/456')
    })

    it('should return correct URL for lead entity', () => {
      expect(getEntityUrl('lead', '789')).toBe('/employee/crm/leads/789')
    })

    it('should return correct URL for deal entity', () => {
      expect(getEntityUrl('deal', 'xyz')).toBe('/employee/crm/deals/xyz')
    })
  })

  describe('resolveHref', () => {
    it('should replace :id placeholder with entity ID', () => {
      expect(resolveHref('/employee/recruiting/jobs/:id/edit', '123')).toBe(
        '/employee/recruiting/jobs/123/edit'
      )
    })

    it('should replace first :id placeholder (standard behavior)', () => {
      // Note: resolveHref uses .replace() which only replaces first match
      // This is expected since our URLs only have one :id placeholder
      expect(resolveHref('/path/:id/sub/:id', 'abc')).toBe('/path/abc/sub/:id')
    })

    it('should return unchanged href if no placeholder', () => {
      expect(resolveHref('/employee/recruiting/jobs', '123')).toBe('/employee/recruiting/jobs')
    })
  })

  describe('ENTITY_BASE_PATHS', () => {
    it('should have paths for all entity types', () => {
      const entityTypes: EntityType[] = ['job', 'candidate', 'account', 'submission', 'placement', 'lead', 'deal']

      entityTypes.forEach(type => {
        expect(ENTITY_BASE_PATHS[type]).toBeDefined()
        expect(typeof ENTITY_BASE_PATHS[type]).toBe('string')
        expect(ENTITY_BASE_PATHS[type].startsWith('/employee/')).toBe(true)
      })
    })
  })
})

describe('Entity Journeys Configuration', () => {
  describe('entityJourneys', () => {
    it('should have journeys for all entity types', () => {
      const entityTypes: EntityType[] = ['job', 'candidate', 'account', 'submission', 'placement', 'lead', 'deal']

      entityTypes.forEach(type => {
        expect(entityJourneys[type]).toBeDefined()
        expect(entityJourneys[type].entityType).toBe(type)
        expect(entityJourneys[type].steps.length).toBeGreaterThan(0)
        expect(entityJourneys[type].quickActions.length).toBeGreaterThan(0)
      })
    })

    it('should have valid step structure for job journey', () => {
      const jobJourney = entityJourneys.job

      expect(jobJourney.steps.length).toBe(6) // info, sourcing, pipeline, interviews, offers, placement

      jobJourney.steps.forEach(step => {
        expect(step.id).toBeDefined()
        expect(step.label).toBeDefined()
        expect(step.icon).toBeDefined()
        expect(Array.isArray(step.activeStatuses)).toBe(true)
        expect(Array.isArray(step.completedStatuses)).toBe(true)
      })
    })

    it('should have valid quick action structure', () => {
      const jobJourney = entityJourneys.job

      jobJourney.quickActions.forEach(action => {
        expect(action.id).toBeDefined()
        expect(action.label).toBeDefined()
        expect(action.icon).toBeDefined()
        expect(['dialog', 'navigate', 'mutation']).toContain(action.actionType)
      })
    })
  })

  describe('getEntityJourney', () => {
    it('should return journey config for valid entity type', () => {
      const jobJourney = getEntityJourney('job')
      expect(jobJourney.entityType).toBe('job')
      expect(jobJourney.steps.length).toBeGreaterThan(0)
    })

    it('should return different configs for different entity types', () => {
      const jobJourney = getEntityJourney('job')
      const candidateJourney = getEntityJourney('candidate')

      expect(jobJourney.steps.length).not.toBe(candidateJourney.steps.length)
    })
  })
})

describe('getCurrentStepIndex', () => {
  describe('job entity', () => {
    it('should return 0 for draft status', () => {
      expect(getCurrentStepIndex('job', 'draft')).toBe(0)
    })

    it('should return 1 for open status', () => {
      expect(getCurrentStepIndex('job', 'open')).toBe(1)
    })

    it('should return 2 for active status', () => {
      expect(getCurrentStepIndex('job', 'active')).toBe(2)
    })

    it('should return 5 for filled status', () => {
      expect(getCurrentStepIndex('job', 'filled')).toBe(5)
    })

    it('should return 0 for unknown status', () => {
      expect(getCurrentStepIndex('job', 'unknown_status')).toBe(0)
    })
  })

  describe('candidate entity', () => {
    it('should return 0 for sourced status', () => {
      expect(getCurrentStepIndex('candidate', 'sourced')).toBe(0)
    })

    it('should return 0 for new status', () => {
      expect(getCurrentStepIndex('candidate', 'new')).toBe(0)
    })

    it('should return 1 for screening status', () => {
      expect(getCurrentStepIndex('candidate', 'screening')).toBe(1)
    })

    it('should return 2 for bench status', () => {
      expect(getCurrentStepIndex('candidate', 'bench')).toBe(2)
    })

    it('should return 3 for placed status', () => {
      expect(getCurrentStepIndex('candidate', 'placed')).toBe(3)
    })
  })

  describe('lead entity', () => {
    it('should return 0 for new status', () => {
      expect(getCurrentStepIndex('lead', 'new')).toBe(0)
    })

    it('should return 1 for contacted status', () => {
      expect(getCurrentStepIndex('lead', 'contacted')).toBe(1)
    })

    it('should return 2 for qualified status', () => {
      expect(getCurrentStepIndex('lead', 'qualified')).toBe(2)
    })

    it('should return 3 for converted status', () => {
      expect(getCurrentStepIndex('lead', 'converted')).toBe(3)
    })
  })

  describe('deal entity', () => {
    it('should return 0 for discovery status', () => {
      expect(getCurrentStepIndex('deal', 'discovery')).toBe(0)
    })

    it('should return 5 for closed_won status', () => {
      expect(getCurrentStepIndex('deal', 'closed_won')).toBe(5)
    })

    it('should return 5 for closed_lost status', () => {
      expect(getCurrentStepIndex('deal', 'closed_lost')).toBe(5)
    })
  })
})

describe('getVisibleQuickActions', () => {
  describe('job entity', () => {
    it('should show publish action for draft status', () => {
      const actions = getVisibleQuickActions('job', 'draft')
      const publishAction = actions.find(a => a.id === 'publish')
      expect(publishAction).toBeDefined()
    })

    it('should hide publish action for open status', () => {
      const actions = getVisibleQuickActions('job', 'open')
      const publishAction = actions.find(a => a.id === 'publish')
      expect(publishAction).toBeUndefined()
    })

    it('should show hold action for active status', () => {
      const actions = getVisibleQuickActions('job', 'active')
      const holdAction = actions.find(a => a.id === 'hold')
      expect(holdAction).toBeDefined()
    })

    it('should show resume action for on_hold status', () => {
      const actions = getVisibleQuickActions('job', 'on_hold')
      const resumeAction = actions.find(a => a.id === 'resume')
      expect(resumeAction).toBeDefined()
    })

    it('should hide close action for filled status', () => {
      const actions = getVisibleQuickActions('job', 'filled')
      const closeAction = actions.find(a => a.id === 'close')
      expect(closeAction).toBeUndefined()
    })

    it('should hide edit action for filled status', () => {
      const actions = getVisibleQuickActions('job', 'filled')
      const editAction = actions.find(a => a.id === 'edit')
      expect(editAction).toBeUndefined()
    })

    it('should show edit action for active status', () => {
      const actions = getVisibleQuickActions('job', 'active')
      const editAction = actions.find(a => a.id === 'edit')
      expect(editAction).toBeDefined()
    })
  })

  describe('candidate entity', () => {
    it('should show start screening for sourced status', () => {
      const actions = getVisibleQuickActions('candidate', 'sourced')
      const screenAction = actions.find(a => a.id === 'screen')
      expect(screenAction).toBeDefined()
    })

    it('should hide start screening for placed status', () => {
      const actions = getVisibleQuickActions('candidate', 'placed')
      const screenAction = actions.find(a => a.id === 'screen')
      expect(screenAction).toBeUndefined()
    })

    it('should show submit to job for bench status', () => {
      const actions = getVisibleQuickActions('candidate', 'bench')
      const submitAction = actions.find(a => a.id === 'submit')
      expect(submitAction).toBeDefined()
    })

    it('should hide submit to job for placed status', () => {
      const actions = getVisibleQuickActions('candidate', 'placed')
      const submitAction = actions.find(a => a.id === 'submit')
      expect(submitAction).toBeUndefined()
    })
  })

  describe('lead entity', () => {
    it('should show convert action only for qualified status', () => {
      const qualifiedActions = getVisibleQuickActions('lead', 'qualified')
      const convertAction = qualifiedActions.find(a => a.id === 'convert')
      expect(convertAction).toBeDefined()

      const newActions = getVisibleQuickActions('lead', 'new')
      const convertNewAction = newActions.find(a => a.id === 'convert')
      expect(convertNewAction).toBeUndefined()
    })

    it('should hide qualify action for converted status', () => {
      const actions = getVisibleQuickActions('lead', 'converted')
      const qualifyAction = actions.find(a => a.id === 'qualify')
      expect(qualifyAction).toBeUndefined()
    })
  })

  describe('placement entity', () => {
    it('should show extend action for active status', () => {
      const actions = getVisibleQuickActions('placement', 'active')
      const extendAction = actions.find(a => a.id === 'extend')
      expect(extendAction).toBeDefined()
    })

    it('should hide extend action for ended status', () => {
      const actions = getVisibleQuickActions('placement', 'ended')
      const extendAction = actions.find(a => a.id === 'extend')
      expect(extendAction).toBeUndefined()
    })

    it('should show check-in action for active status', () => {
      const actions = getVisibleQuickActions('placement', 'active')
      const checkinAction = actions.find(a => a.id === 'checkin')
      expect(checkinAction).toBeDefined()
    })
  })
})
