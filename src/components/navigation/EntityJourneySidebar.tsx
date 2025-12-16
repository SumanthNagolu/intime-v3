'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, ChevronRight, ChevronDown, Wrench, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { entityJourneys } from '@/lib/navigation/entity-journeys'
import { EntityType, ENTITY_BASE_PATHS, ENTITY_NAVIGATION_STYLES } from '@/lib/navigation/entity-navigation.types'
import { commonToolSections, getSectionsByGroup } from '@/lib/navigation/entity-sections'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface EntityJourneySidebarProps {
  entityType: EntityType
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  /** Tool section counts */
  toolCounts?: {
    activities?: number
    notes?: number
    documents?: number
  }
  /** Section counts for section-based navigation */
  sectionCounts?: Record<string, number>
  className?: string
}

// Back link text per entity type
const backLinkText: Record<EntityType, string> = {
  job: 'All Jobs',
  candidate: 'All Candidates',
  submission: 'All Submissions',
  placement: 'All Placements',
  account: 'All Accounts',
  contact: 'All Contacts',
  deal: 'All Deals',
  lead: 'All Leads',
  campaign: 'All Campaigns',
  invoice: 'All Invoices',
  pay_run: 'All Pay Runs',
  timesheet: 'All Timesheets',
}

export function EntityJourneySidebar({
  entityType,
  entityId,
  entityName,
  entitySubtitle,
  entityStatus,
  toolCounts = {},
  sectionCounts = {},
  className,
}: EntityJourneySidebarProps) {
  const navigationStyle = ENTITY_NAVIGATION_STYLES[entityType]
  const journeyConfig = entityJourneys[entityType]
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || 'overview'
  const [isToolsOpen, setIsToolsOpen] = useState(true)

  // Get sections for section-based navigation
  const { mainSections, toolSections } = useMemo(() => {
    if (navigationStyle === 'sections') {
      return getSectionsByGroup(entityType)
    }
    return { mainSections: [], toolSections: commonToolSections }
  }, [entityType, navigationStyle])

  // Determine current and completed steps based on entity status (for journey navigation)
  const { currentStepIndex, steps } = useMemo(() => {
    if (navigationStyle !== 'journey' || !journeyConfig) {
      return { currentStepIndex: 0, steps: [] }
    }
    const stepsWithState = journeyConfig.steps.map((step, index) => {
      const isCompleted = step.completedStatuses.includes(entityStatus)
      const isActive = step.activeStatuses.includes(entityStatus)
      return { ...step, isCompleted, isActive, index }
    })

    // Find current step (first active, or last completed)
    const activeIndex = stepsWithState.findIndex(s => s.isActive)
    let currentIdx = activeIndex >= 0 ? activeIndex : 0

    // If no active step found, find the last completed
    if (activeIndex < 0) {
      for (let i = stepsWithState.length - 1; i >= 0; i--) {
        if (stepsWithState[i].isCompleted) {
          currentIdx = i
          break
        }
      }
    }

    return { currentStepIndex: currentIdx, steps: stepsWithState }
  }, [journeyConfig, entityStatus, navigationStyle])


  // Build step href - use defaultTab if available, otherwise use step query param
  const buildStepHref = (stepId: string, defaultTab?: string) => {
    const basePath = ENTITY_BASE_PATHS[entityType]
    if (defaultTab) {
      return `${basePath}/${entityId}?tab=${defaultTab}`
    }
    return `${basePath}/${entityId}?step=${stepId}`
  }

  // Build tool section href
  const buildToolHref = (sectionId: string) => {
    const basePath = ENTITY_BASE_PATHS[entityType]
    return `${basePath}/${entityId}?section=${sectionId}`
  }

  // Get count for a section
  const getSectionCount = (sectionId: string): number | undefined => {
    // Check section-specific counts first
    if (sectionCounts[sectionId] !== undefined) {
      return sectionCounts[sectionId]
    }
    // Fall back to tool counts for tool sections
    switch (sectionId) {
      case 'activities': return toolCounts.activities
      case 'notes': return toolCounts.notes
      case 'documents': return toolCounts.documents
      default: return undefined
    }
  }


  return (
    <aside className={cn('w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0', className)}>
      {/* Back Link */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href={ENTITY_BASE_PATHS[entityType]}
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLinkText[entityType]}
        </Link>
      </div>

      {/* Entity Header */}
      <div className="px-4 pb-4 border-b border-charcoal-100">
        <h2 className="font-heading font-semibold text-charcoal-900 truncate text-base">
          {entityName}
        </h2>
        {entitySubtitle && (
          <p className="text-sm text-charcoal-500 truncate mt-0.5">
            {entitySubtitle}
          </p>
        )}
        <div className="mt-2">
          <StatusBadge status={entityStatus} />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {/* SECTIONS MODE: Show main sections + tool sections */}
        {navigationStyle === 'sections' && (
          <>
            {/* Main Sections */}
            <div className="p-3">
              <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider px-2 mb-2">
                Sections
              </div>
              <ul className="space-y-0.5">
                {mainSections.map((section) => {
                  const Icon = section.icon
                  const isActive = currentSection === section.id
                  const count = section.showCount ? getSectionCount(section.id) : undefined

                  return (
                    <li key={section.id}>
                      <Link
                        href={buildToolHref(section.id)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group',
                          isActive
                            ? 'bg-gold-50 text-gold-700'
                            : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-800'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4 flex-shrink-0 transition-colors',
                            isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-500'
                          )}
                        />
                        <span className={cn('flex-1 text-sm', isActive && 'font-medium')}>
                          {section.label}
                        </span>
                        {count !== undefined && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              'min-w-[22px] h-5 text-xs tabular-nums justify-center',
                              isActive
                                ? 'bg-gold-100 text-gold-700'
                                : 'bg-charcoal-100 text-charcoal-600'
                            )}
                          >
                            {count}
                          </Badge>
                        )}
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-gold-400" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Tool Sections (Collapsible) */}
            <Collapsible
              open={isToolsOpen}
              onOpenChange={setIsToolsOpen}
              className="border-t border-charcoal-100 pt-2 px-3 pb-3"
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-charcoal-400 uppercase tracking-wider hover:text-charcoal-600 transition-colors">
                {isToolsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <Wrench className="w-3.5 h-3.5" />
                <span>Tools</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1">
                <ul className="space-y-0.5">
                  {toolSections.map((section) => {
                    const Icon = section.icon
                    const isActive = currentSection === section.id
                    const count = section.showCount ? getSectionCount(section.id) : undefined

                    return (
                      <li key={section.id}>
                        <Link
                          href={buildToolHref(section.id)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-150 group',
                            isActive
                              ? 'bg-gold-50 text-gold-700'
                              : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-800'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4 flex-shrink-0 transition-colors',
                              isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-500'
                            )}
                          />
                          <span className={cn('flex-1 text-sm', isActive && 'font-medium')}>
                            {section.label}
                          </span>
                          {count !== undefined && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                'min-w-[22px] h-5 text-xs tabular-nums justify-center',
                                isActive
                                  ? 'bg-gold-100 text-gold-700'
                                  : 'bg-charcoal-100 text-charcoal-600'
                              )}
                            >
                              {count}
                            </Badge>
                          )}
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-gold-400" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* JOURNEY MODE: Show journey steps + tool sections */}
        {navigationStyle === 'journey' && (
          <>
            {/* Journey Steps */}
            <div className="p-3">
              <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider px-2 mb-2">
                Journey
              </div>
              <ul className="space-y-1">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isCurrent = index === currentStepIndex
                  const isPast = step.isCompleted || index < currentStepIndex
                  const isFuture = !isPast && !isCurrent

                  return (
                    <li key={step.id}>
                      <Link
                        href={buildStepHref(step.id, step.defaultTab)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                          isCurrent && 'bg-gold-50 text-gold-700 font-medium',
                          isPast && 'text-charcoal-600 hover:bg-charcoal-50',
                          isFuture && 'text-charcoal-400 hover:bg-charcoal-50'
                    )}
                  >
                    {/* Step Indicator */}
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors flex-shrink-0',
                        isPast && 'bg-green-500 text-white',
                        isCurrent && 'bg-gold-500 text-white',
                        isFuture && 'bg-charcoal-200 text-charcoal-500'
                      )}
                    >
                      {isPast ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        'text-sm truncate block',
                        isCurrent && 'font-medium'
                      )}>
                        {step.label}
                      </span>
                      {step.description && isCurrent && (
                        <span className="text-xs text-charcoal-500 truncate block">
                          {step.description}
                        </span>
                      )}
                    </div>

                    {/* Active Indicator */}
                    {isCurrent && (
                      <ChevronRight className="w-4 h-4 text-gold-500 flex-shrink-0" />
                    )}
                  </Link>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="ml-6 pl-[11px] py-1">
                      <div
                        className={cn(
                          'w-0.5 h-4',
                          isPast ? 'bg-green-500' : 'bg-charcoal-200'
                        )}
                      />
                    </div>
                  )}
                </li>
              )
                })}
              </ul>
            </div>

            {/* Tools Section - Collapsible */}
            <Collapsible
              open={isToolsOpen}
              onOpenChange={setIsToolsOpen}
              className="border-t border-charcoal-100 pt-2 px-3 pb-3"
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-charcoal-400 uppercase tracking-wider hover:text-charcoal-600 transition-colors">
                {isToolsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <Wrench className="w-3.5 h-3.5" />
                <span>Tools</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1">
                <ul className="space-y-0.5">
                  {commonToolSections.map((section) => {
                    const Icon = section.icon
                    const isActive = currentSection === section.id
                    const count = getSectionCount(section.id)

                    return (
                      <li key={section.id}>
                        <Link
                          href={buildToolHref(section.id)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-150 group',
                            isActive
                              ? 'bg-gold-50 text-gold-700'
                              : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-800'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4 flex-shrink-0 transition-colors',
                              isActive ? 'text-gold-600' : 'text-charcoal-400 group-hover:text-charcoal-500'
                            )}
                          />
                          <span className={cn('flex-1 text-sm', isActive && 'font-medium')}>
                            {section.label}
                          </span>
                          {section.showCount && count !== undefined && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                'min-w-[22px] h-5 text-xs tabular-nums justify-center',
                                isActive
                                  ? 'bg-gold-100 text-gold-700'
                                  : 'bg-charcoal-100 text-charcoal-600'
                              )}
                            >
                              {count}
                            </Badge>
                          )}
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-gold-400" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </nav>

    </aside>
  )
}

// Simple status badge component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    // Job statuses
    draft: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
    open: 'bg-blue-100 text-blue-700 border-blue-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
    filled: 'bg-purple-100 text-purple-700 border-purple-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    // Candidate statuses
    sourced: 'bg-amber-100 text-amber-700 border-amber-200',
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    screening: 'bg-blue-100 text-blue-700 border-blue-200',
    bench: 'bg-purple-100 text-purple-700 border-purple-200',
    placed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    inactive: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    // Account statuses
    prospect: 'bg-amber-100 text-amber-700 border-amber-200',
    churned: 'bg-red-100 text-red-700 border-red-200',
    // Lead statuses
    contacted: 'bg-blue-100 text-blue-700 border-blue-200',
    qualified: 'bg-green-100 text-green-700 border-green-200',
    converted: 'bg-purple-100 text-purple-700 border-purple-200',
    lost: 'bg-red-100 text-red-700 border-red-200',
    // Deal statuses
    discovery: 'bg-blue-100 text-blue-700 border-blue-200',
    qualification: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    proposal: 'bg-amber-100 text-amber-700 border-amber-200',
    negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
    verbal_commit: 'bg-purple-100 text-purple-700 border-purple-200',
    closed_won: 'bg-green-100 text-green-700 border-green-200',
    closed_lost: 'bg-red-100 text-red-700 border-red-200',
    // Submission statuses
    submission_ready: 'bg-blue-100 text-blue-700 border-blue-200',
    submitted_to_client: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    client_review: 'bg-amber-100 text-amber-700 border-amber-200',
    client_interview: 'bg-orange-100 text-orange-700 border-orange-200',
    offer_stage: 'bg-purple-100 text-purple-700 border-purple-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    withdrawn: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    // Placement statuses
    pending_start: 'bg-amber-100 text-amber-700 border-amber-200',
    extended: 'bg-blue-100 text-blue-700 border-blue-200',
    ended: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    // Campaign statuses
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    paused: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-purple-100 text-purple-700 border-purple-200',
    // Default
    default: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
  }

  return (
    <Badge className={cn(
      'font-medium border',
      colors[status] || colors.default
    )}>
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

export { StatusBadge }
