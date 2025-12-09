'use client'

import { useSearchParams } from 'next/navigation'
import { SidebarHeader } from './SidebarHeader'
import { SidebarSections } from './SidebarSections'
import { SidebarJourney } from './SidebarJourney'
import { cn } from '@/lib/utils'
import type { EntitySidebarConfig, SidebarSectionConfig } from './types'

interface EntitySidebarProps {
  config: EntitySidebarConfig
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  counts?: Record<string, number>
  className?: string
}

export function EntitySidebar({
  config,
  entityId,
  entityName,
  entitySubtitle,
  entityStatus,
  counts = {},
  className,
}: EntitySidebarProps) {
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || config.sections?.[0]?.id || 'overview'

  // For journey mode, extract tool sections
  const toolSections: SidebarSectionConfig[] = config.sections?.filter((s) => s.isToolSection) || []

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0',
        className
      )}
    >
      {/* Header with entity info */}
      <SidebarHeader
        entityName={entityName}
        entitySubtitle={entitySubtitle}
        entityStatus={entityStatus}
        backHref={config.basePath}
        backLabel={config.backLabel}
        statusConfig={config.statusConfig}
      />

      {/* Navigation - either sections or journey */}
      {config.navigationMode === 'sections' && config.sections ? (
        <SidebarSections
          sections={config.sections}
          currentSection={currentSection}
          basePath={config.basePath}
          entityId={entityId}
          counts={counts}
        />
      ) : config.navigationMode === 'journey' && config.journeySteps ? (
        <SidebarJourney
          steps={config.journeySteps}
          entityStatus={entityStatus}
          basePath={config.basePath}
          entityId={entityId}
          toolSections={toolSections}
          currentSection={currentSection}
          toolCounts={counts}
        />
      ) : null}

    </aside>
  )
}

// Re-export types and components
export { SidebarHeader } from './SidebarHeader'
export { SidebarSections } from './SidebarSections'
export { SidebarJourney } from './SidebarJourney'
export type { EntitySidebarConfig, SidebarSectionConfig } from './types'

