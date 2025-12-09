'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { DetailViewConfig } from '@/configs/entities/types'
import { DetailHeader } from './DetailHeader'
import { DetailMetrics } from './DetailMetrics'
// Note: DetailSections removed - sidebar now handles all navigation (Guidewire pattern)
import { DetailJourney } from './DetailJourney'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface EntityDetailViewProps<T> {
  config: DetailViewConfig<T>
  entityId: string
  entity?: T
  className?: string
}

export function EntityDetailView<T extends Record<string, unknown>>({
  config,
  entityId,
  entity: serverEntity,
  className,
}: EntityDetailViewProps<T>) {
  const searchParams = useSearchParams()
  const headerRef = useRef<HTMLDivElement>(null)
  const [isHeaderSticky, setIsHeaderSticky] = useState(false)
  const [dialogStates, setDialogStates] = useState<Record<string, boolean>>({})

  // Get current navigation mode and section/step from URL
  const currentMode = searchParams.get('mode') || 'sections'
  const currentSection =
    searchParams.get('section') || config.defaultSection || config.sections?.[0]?.id || 'overview'
  const currentStep = searchParams.get('step') || config.journeySteps?.[0]?.id || 'setup'

  // Use server data or fetch client-side
  const entityQuery = config.useEntityQuery(entityId)
  const entity = serverEntity || entityQuery.data
  const isLoading = !serverEntity && entityQuery.isLoading

  // Sticky header scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect()
        setIsHeaderSticky(rect.top <= 0)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Event listeners for sidebar communication
  useEffect(() => {
    if (!config.eventNamespace) return

    const handleOpenDialog = (e: CustomEvent<{ dialogId: string }>) => {
      const { dialogId } = e.detail
      if (config.dialogHandlers?.[dialogId]) {
        setDialogStates((prev) => ({ ...prev, [dialogId]: true }))
      }
    }

    const eventName = `open${config.eventNamespace.charAt(0).toUpperCase()}${config.eventNamespace.slice(1)}Dialog`
    window.addEventListener(eventName, handleOpenDialog as EventListener)

    return () => {
      window.removeEventListener(eventName, handleOpenDialog as EventListener)
    }
  }, [config.eventNamespace, config.dialogHandlers])

  // Render current journey step (when in journey mode)
  const renderJourneyStep = () => {
    if (!entity || !config.journeySteps) return null

    const step = config.journeySteps.find((s) => s.id === currentStep) || config.journeySteps[0]
    if (!step || !step.component) return null

    const StepComponent = step.component
    return <StepComponent entityId={entityId} entity={entity} />
  }

  // Render current section (when in sections mode)
  const renderSection = () => {
    if (!entity || !config.sections) return null

    const section = config.sections.find((s) => s.id === currentSection) || config.sections[0]
    if (!section || !section.component) return null

    const SectionComponent = section.component
    return <SectionComponent entityId={entityId} entity={entity} />
  }

  // Render content based on current navigation mode
  const renderContent = () => {
    // If in journey mode and journey steps are configured, render step
    if (currentMode === 'journey' && config.journeySteps && config.journeySteps.length > 0) {
      return renderJourneyStep()
    }
    // Otherwise render section
    return renderSection()
  }

  if (isLoading) {
    return (
      <div className={cn('flex flex-col min-h-full', className)}>
        <div className="px-6 py-4 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="px-6 py-3 bg-charcoal-50/50">
          <div className="flex gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-32" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!entity) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-charcoal-500">Entity not found</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col min-h-full', className)}>
      {/* Sticky Header Container */}
      <div
        ref={headerRef}
        className={cn(
          'sticky top-0 z-20 bg-white transition-shadow duration-200',
          isHeaderSticky && 'shadow-md border-b border-charcoal-100'
        )}
      >
        {/* Header */}
        <DetailHeader
          entity={entity}
          titleField={config.titleField}
          subtitleFields={config.subtitleFields}
          statusField={config.statusField}
          statusConfig={config.statusConfig}
          breadcrumbs={config.breadcrumbs}
          quickActions={config.quickActions}
          dropdownActions={config.dropdownActions}
        />

        {/* Metrics Bar */}
        {config.metrics && config.metrics.length > 0 && (
          <DetailMetrics
            entity={entity}
            metrics={config.metrics}
            progressBar={config.showProgressBar}
          />
        )}

        {/* Navigation - Only show journey progress indicator if configured
            Note: Section navigation removed - sidebar now handles all navigation (Guidewire pattern) */}
        {config.navigationMode === 'journey' && config.journeySteps && config.statusField && (
          <DetailJourney
            steps={config.journeySteps}
            entity={entity}
            statusField={config.statusField}
          />
        )}
      </div>

      {/* Section/Step Content */}
      <div className="flex-1 px-6 py-6 bg-charcoal-50/30">
        {renderContent()}
      </div>

      {/* Dialog Handlers */}
      {Object.entries(dialogStates).map(([dialogId, isOpen]) => {
        if (!isOpen || !config.dialogHandlers?.[dialogId]) return null
        return null
      })}
    </div>
  )
}
