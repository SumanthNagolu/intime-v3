'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, ChevronDown, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { SidebarJourneyStepConfig, SidebarSectionConfig } from './types'

interface SidebarJourneyProps {
  steps: SidebarJourneyStepConfig[]
  entityStatus: string
  basePath: string
  entityId: string
  toolSections?: SidebarSectionConfig[]
  currentSection?: string
  toolCounts?: Record<string, number>
  className?: string
}

export function SidebarJourney({
  steps,
  entityStatus,
  basePath,
  entityId,
  toolSections = [],
  currentSection,
  toolCounts = {},
  className,
}: SidebarJourneyProps) {
  const [isToolsOpen, setIsToolsOpen] = useState(true)

  // Determine current step and step states based on status
  const { currentStepIndex, stepsWithState } = useMemo(() => {
    const mapped = steps.map((step, index) => {
      const isCompleted = step.completedStatuses.includes(entityStatus)
      const isActive = step.activeStatuses.includes(entityStatus)
      return { ...step, isCompleted, isActive, index }
    })

    // Find current step (first active, or last completed)
    let currentIdx = mapped.findIndex((s) => s.isActive)
    if (currentIdx < 0) {
      for (let i = mapped.length - 1; i >= 0; i--) {
        if (mapped[i].isCompleted) {
          currentIdx = i
          break
        }
      }
    }
    if (currentIdx < 0) currentIdx = 0

    return { currentStepIndex: currentIdx, stepsWithState: mapped }
  }, [steps, entityStatus])

  const buildStepHref = (step: SidebarJourneyStepConfig) => {
    if (step.defaultTab) {
      return `${basePath}/${entityId}?tab=${step.defaultTab}`
    }
    return `${basePath}/${entityId}?step=${step.id}`
  }

  const buildToolHref = (sectionId: string) => {
    return `${basePath}/${entityId}?section=${sectionId}`
  }

  return (
    <nav className={cn('flex-1 overflow-y-auto', className)}>
      {/* Journey Steps */}
      <div className="p-3">
        <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider px-2 mb-2">
          Journey
        </div>
        <ul className="space-y-1">
          {stepsWithState.map((step, index) => {
            const Icon = step.icon
            const isCurrent = index === currentStepIndex
            const isPast = step.isCompleted || index < currentStepIndex
            const isFuture = !isPast && !isCurrent

            return (
              <li key={step.id}>
                <Link
                  href={buildStepHref(step)}
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
                    {isPast ? <Check className="w-3.5 h-3.5" /> : index + 1}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <span className={cn('text-sm truncate block', isCurrent && 'font-medium')}>
                      {step.label}
                    </span>
                    {step.description && isCurrent && (
                      <span className="text-xs text-charcoal-500 truncate block">
                        {step.description}
                      </span>
                    )}
                  </div>

                  {isCurrent && <ChevronRight className="w-4 h-4 text-gold-500 flex-shrink-0" />}
                </Link>

                {/* Connector Line */}
                {index < stepsWithState.length - 1 && (
                  <div className="ml-6 pl-[11px] py-1">
                    <div className={cn('w-0.5 h-4', isPast ? 'bg-green-500' : 'bg-charcoal-200')} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Tool Sections - Collapsible */}
      {toolSections.length > 0 && (
        <Collapsible
          open={isToolsOpen}
          onOpenChange={setIsToolsOpen}
          className="border-t border-charcoal-100 pt-2 px-3 pb-3"
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-charcoal-400 uppercase tracking-wider hover:text-charcoal-600 transition-colors">
            {isToolsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1">
            <ul className="space-y-0.5">
              {toolSections.map((section) => {
                const Icon = section.icon
                const isActive = currentSection === section.id
                const count = toolCounts[section.id]

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
                            isActive ? 'bg-gold-100 text-gold-700' : 'bg-charcoal-100 text-charcoal-600'
                          )}
                        >
                          {count}
                        </Badge>
                      )}
                      {isActive && <ChevronRight className="w-4 h-4 text-gold-400" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </nav>
  )
}

