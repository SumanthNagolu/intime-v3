'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { DetailViewConfig, SectionDataMap } from '@/configs/entities/types'
import { DetailHeader } from './DetailHeader'
import { DetailMetrics } from './DetailMetrics'
// Note: DetailSections removed - sidebar now handles all navigation (Guidewire pattern)
import { DetailJourney } from './DetailJourney'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { NoOpenActivitiesWarning } from '@/components/activities'

interface EntityDetailViewProps<T> {
  config: DetailViewConfig<T>
  entityId: string
  /** Entity data - if provided, no client-side query is made (ONE database call pattern) */
  entity?: T
  /** Pre-loaded section data keyed by section ID (ONE database call pattern) */
  sectionData?: SectionDataMap
  className?: string
}

export function EntityDetailView<T extends Record<string, unknown>>({
  config,
  entityId,
  entity: serverEntity,
  sectionData,
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

  // ONE DATABASE CALL PATTERN: Skip client-side query when server entity is provided
  // This prevents redundant fetches - data should already be in context from layout
  const entityQuery = config.useEntityQuery(entityId, { enabled: !serverEntity })
  const entity = serverEntity || entityQuery.data
  const isLoading = !serverEntity && entityQuery.isLoading

  // ONE database call pattern: Extract sectionData from entity if embedded
  // When using getFullEntity, the response includes a `sections` property
  // with pre-loaded data for all sections
  const entitySections = (entity as any)?.sections as SectionDataMap | undefined
  const effectiveSectionData = sectionData || entitySections

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
    // Pass sectionData for this step if available (ONE database call pattern)
    const stepSectionData = effectiveSectionData?.[step.id]
    return <StepComponent entityId={entityId} entity={entity} sectionData={stepSectionData} />
  }

  // Render current section (when in sections mode)
  const renderSection = () => {
    if (!entity || !config.sections) return null

    const section = config.sections.find((s) => s.id === currentSection) || config.sections[0]
    if (!section || !section.component) return null

    const SectionComponent = section.component
    // Pass sectionData for this section if available (ONE database call pattern)
    const currentSectionData = effectiveSectionData?.[section.id]
    return <SectionComponent entityId={entityId} entity={entity} sectionData={currentSectionData} />
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

      {/* Activity System Warning Banner (Guidewire pattern) */}
      {config.entityType && (
        <NoOpenActivitiesWarning
          entityType={config.entityType}
          entityId={entityId}
          entityName={(entity as any)?.[config.titleField] as string | undefined}
          className="mx-6 mt-4"
        />
      )}

      {/* Section/Step Content */}
      <div className="flex-1 px-6 py-6 bg-gradient-to-b from-charcoal-50/40 to-charcoal-50/20">
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
